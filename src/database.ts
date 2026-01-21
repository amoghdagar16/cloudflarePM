// Relay v2 - Simplified Database Operations
import { Env, FeedbackItem, Issue, ConnectedSource, DashboardStats, Priority, IssueStatus, FeedbackSource, PMInsight } from './types';

// ============================================================================
// SOURCES
// ============================================================================

export async function saveSource(env: Env, sessionId: string, source: Omit<ConnectedSource, 'id' | 'created_at'>): Promise<string> {
  const id = `src_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await env.DB.prepare(`
    INSERT INTO sources (id, session_id, type, name, config, last_synced, item_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    sessionId,
    source.type,
    source.type, // name defaults to type
    source.config,
    source.last_synced,
    source.item_count
  ).run();

  return id;
}

export async function getAllSources(env: Env, sessionId: string): Promise<ConnectedSource[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM sources WHERE session_id = ? ORDER BY created_at DESC
  `).bind(sessionId).all();

  return results as unknown as ConnectedSource[];
}

export async function getSource(env: Env, sessionId: string, sourceId: string): Promise<ConnectedSource | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM sources WHERE id = ? AND session_id = ?
  `).bind(sourceId, sessionId).first();

  return result as unknown as ConnectedSource | null;
}

export async function updateSourceSync(env: Env, sourceId: string, itemCount: number): Promise<void> {
  await env.DB.prepare(`
    UPDATE sources SET last_synced = datetime('now'), item_count = ? WHERE id = ?
  `).bind(itemCount, sourceId).run();
}

export async function deleteSource(env: Env, sessionId: string, sourceId: string): Promise<void> {
  // Cascade delete feedback and issues related to this source
  await env.DB.batch([
    env.DB.prepare('DELETE FROM issues WHERE feedback_id IN (SELECT id FROM feedback WHERE source_id = ? AND session_id = ?)').bind(sourceId, sessionId),
    env.DB.prepare('DELETE FROM feedback WHERE source_id = ? AND session_id = ?').bind(sourceId, sessionId),
    env.DB.prepare('DELETE FROM sources WHERE id = ? AND session_id = ?').bind(sourceId, sessionId),
  ]);
}

// ============================================================================
// FEEDBACK
// ============================================================================

export async function saveFeedbackItems(env: Env, sessionId: string, sourceId: string, items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[]): Promise<number> {
  if (!items || items.length === 0) return 0;

  const stmt = env.DB.prepare(`
    INSERT INTO feedback (id, session_id, source_id, source, external_id, title, body, url, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  let savedCount = 0;
  const chunkSize = 20;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = chunk.map(item => {
      const id = `fb_${sessionId}_${item.source}_${item.source_id}`;
      return stmt.bind(
        id,
        sessionId,
        sourceId,
        item.source,
        item.source_id,
        item.title,
        item.body || '',
        item.url || '',
        item.author || 'Unknown',
        item.created_at
      );
    });

    try {
      await env.DB.batch(batch);
      savedCount += chunk.length;
    } catch (e) {
      console.error('Error saving feedback chunk:', e);
    }
  }

  return savedCount;
}

export async function getAllFeedback(env: Env, sessionId: string): Promise<FeedbackItem[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM feedback WHERE session_id = ? ORDER BY created_at DESC
  `).bind(sessionId).all();

  return results as unknown as FeedbackItem[];
}

export async function getFeedbackBySource(env: Env, sessionId: string, sourceId: string): Promise<FeedbackItem[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM feedback WHERE session_id = ? AND source_id = ? ORDER BY created_at DESC
  `).bind(sessionId, sourceId).all();

  return results as unknown as FeedbackItem[];
}

export async function getUnanalyzedFeedback(env: Env, sessionId: string): Promise<FeedbackItem[]> {
  const { results } = await env.DB.prepare(`
    SELECT f.* FROM feedback f
    LEFT JOIN issues i ON f.id = i.feedback_id
    WHERE f.session_id = ? AND i.id IS NULL
    ORDER BY f.created_at DESC
  `).bind(sessionId).all();

  return results as unknown as FeedbackItem[];
}

// ============================================================================
// ISSUES
// ============================================================================

export async function saveIssue(env: Env, issue: Omit<Issue, 'updated_at'>): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO issues (
      id, session_id, feedback_id, title, summary, category,
      priority, priority_reason, priority_override, sentiment_score, sentiment_label,
      status, source, source_url, author, assigned_to, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      summary = excluded.summary,
      priority = excluded.priority,
      priority_reason = excluded.priority_reason,
      priority_override = excluded.priority_override,
      sentiment_score = excluded.sentiment_score,
      sentiment_label = excluded.sentiment_label,
      updated_at = datetime('now')
  `).bind(
    issue.id,
    issue.session_id,
    issue.feedback_id,
    issue.title,
    issue.summary,
    issue.category,
    issue.priority,
    issue.priority_reason,
    issue.priority_override ? 1 : 0,
    issue.sentiment_score,
    issue.sentiment_label,
    issue.status,
    issue.source,
    issue.source_url,
    issue.author,
    issue.assigned_to,
    JSON.stringify(issue.tags || []),
    issue.created_at
  ).run();
}

export async function saveIssuesBatch(env: Env, issues: Omit<Issue, 'updated_at'>[]): Promise<void> {
  if (!issues || issues.length === 0) return;

  const stmt = env.DB.prepare(`
    INSERT INTO issues (
      id, session_id, feedback_id, title, summary, category,
      priority, priority_reason, priority_override, sentiment_score, sentiment_label,
      status, source, source_url, author, assigned_to, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  const chunkSize = 20;
  for (let i = 0; i < issues.length; i += chunkSize) {
    const chunk = issues.slice(i, i + chunkSize);
    const batch = chunk.map(issue => stmt.bind(
      issue.id,
      issue.session_id,
      issue.feedback_id,
      issue.title,
      issue.summary,
      issue.category,
      issue.priority,
      issue.priority_reason,
      issue.priority_override ? 1 : 0,
      issue.sentiment_score,
      issue.sentiment_label,
      issue.status,
      issue.source,
      issue.source_url,
      issue.author,
      issue.assigned_to,
      JSON.stringify(issue.tags || []),
      issue.created_at
    ));

    await env.DB.batch(batch);
  }
}

export async function getAllIssues(env: Env, sessionId: string): Promise<Issue[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM issues WHERE session_id = ?
    ORDER BY
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      created_at DESC
  `).bind(sessionId).all();

  return (results as unknown as any[]).map(r => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
    priority_override: r.priority_override === 1
  })) as Issue[];
}

export async function getIssue(env: Env, sessionId: string, issueId: string): Promise<Issue | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM issues WHERE id = ? AND session_id = ?
  `).bind(issueId, sessionId).first();

  if (!result) return null;

  return {
    ...result,
    tags: (result as any).tags ? JSON.parse((result as any).tags) : [],
    priority_override: (result as any).priority_override === 1
  } as unknown as Issue;
}

export async function updateIssueStatus(env: Env, sessionId: string, issueId: string, status: IssueStatus): Promise<void> {
  await env.DB.prepare(`
    UPDATE issues SET status = ?, updated_at = datetime('now') WHERE id = ? AND session_id = ?
  `).bind(status, issueId, sessionId).run();
}

export async function updateIssue(env: Env, sessionId: string, issueId: string, updates: Partial<Issue>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.assigned_to !== undefined) {
    fields.push('assigned_to = ?');
    values.push(updates.assigned_to);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = datetime(\'now\')');
  values.push(issueId, sessionId);

  await env.DB.prepare(`
    UPDATE issues SET ${fields.join(', ')} WHERE id = ? AND session_id = ?
  `).bind(...values).run();
}

export async function updateIssuePriority(
  env: Env,
  sessionId: string,
  issueId: string,
  newPriority: Priority,
  reason?: string
): Promise<void> {
  // First get the current issue to preserve original priority
  const currentIssue = await getIssue(env, sessionId, issueId);
  if (!currentIssue) return;

  // Store original priority if this is the first override
  const originalPriority = currentIssue.priority_override
    ? currentIssue.original_priority
    : currentIssue.priority;

  await env.DB.prepare(`
    UPDATE issues
    SET priority = ?,
        priority_reason = ?,
        priority_override = 1,
        original_priority = ?,
        updated_at = datetime('now')
    WHERE id = ? AND session_id = ?
  `).bind(
    newPriority,
    reason || `Manually set to ${newPriority}`,
    originalPriority,
    issueId,
    sessionId
  ).run();
}

export async function resetIssuePriority(
  env: Env,
  sessionId: string,
  issueId: string
): Promise<void> {
  const issue = await getIssue(env, sessionId, issueId);
  if (!issue || !issue.priority_override || !issue.original_priority) return;

  await env.DB.prepare(`
    UPDATE issues
    SET priority = original_priority,
        priority_reason = 'Reset to system-computed priority',
        priority_override = 0,
        updated_at = datetime('now')
    WHERE id = ? AND session_id = ?
  `).bind(issueId, sessionId).run();
}

// ============================================================================
// INSIGHTS
// ============================================================================

export async function saveInsights(env: Env, sessionId: string, insights: Omit<PMInsight, 'session_id' | 'created_at' | 'dismissed'>[]): Promise<void> {
  if (!insights || insights.length === 0) return;

  // Clear old insights first
  await env.DB.prepare('DELETE FROM insights WHERE session_id = ?').bind(sessionId).run();

  const stmt = env.DB.prepare(`
    INSERT INTO insights (id, session_id, type, title, description, action, impact, effort, related_issue_ids, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const batch = insights.map(insight => stmt.bind(
    insight.id,
    sessionId,
    insight.type,
    insight.title,
    insight.description,
    insight.action,
    insight.impact,
    insight.effort,
    JSON.stringify(insight.related_issue_ids),
    insight.category
  ));

  await env.DB.batch(batch);
}

export async function getInsights(env: Env, sessionId: string): Promise<PMInsight[]> {
  const { results } = await env.DB.prepare(`
    SELECT * FROM insights WHERE session_id = ? AND dismissed = 0 ORDER BY
      CASE impact WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
      created_at DESC
  `).bind(sessionId).all();

  return (results as unknown as any[]).map(r => ({
    ...r,
    related_issue_ids: r.related_issue_ids ? JSON.parse(r.related_issue_ids) : [],
    dismissed: r.dismissed === 1
  })) as PMInsight[];
}

export async function dismissInsight(env: Env, sessionId: string, insightId: string): Promise<void> {
  await env.DB.prepare(`
    UPDATE insights SET dismissed = 1 WHERE id = ? AND session_id = ?
  `).bind(insightId, sessionId).run();
}

// ============================================================================
// STATS
// ============================================================================

export async function getDashboardStats(env: Env, sessionId: string): Promise<DashboardStats> {
  // Get priority counts
  const { results: priorityResults } = await env.DB.prepare(`
    SELECT priority, COUNT(*) as count FROM issues WHERE session_id = ? GROUP BY priority
  `).bind(sessionId).all();

  // Get status counts
  const { results: statusResults } = await env.DB.prepare(`
    SELECT status, COUNT(*) as count FROM issues WHERE session_id = ? GROUP BY status
  `).bind(sessionId).all();

  // Get source counts
  const { results: sourceResults } = await env.DB.prepare(`
    SELECT source, COUNT(*) as count FROM issues WHERE session_id = ? GROUP BY source
  `).bind(sessionId).all();

  // Get total
  const totalResult = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM issues WHERE session_id = ?
  `).bind(sessionId).first();

  const byPriority: Record<Priority, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const byStatus: Record<IssueStatus, number> = { new: 0, in_review: 0, in_progress: 0, done: 0 };
  const bySource: Record<FeedbackSource, number> = { github: 0, reddit: 0, csv: 0 };

  priorityResults.forEach((r: any) => {
    if (r.priority in byPriority) byPriority[r.priority as Priority] = r.count;
  });

  statusResults.forEach((r: any) => {
    if (r.status in byStatus) byStatus[r.status as IssueStatus] = r.count;
  });

  sourceResults.forEach((r: any) => {
    if (r.source in bySource) bySource[r.source as FeedbackSource] = r.count;
  });

  return {
    total_issues: (totalResult as any)?.count || 0,
    by_priority: byPriority,
    by_status: byStatus,
    by_source: bySource,
  };
}

// ============================================================================
// CLEAR DATA
// ============================================================================

export async function clearAllData(env: Env, sessionId: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM issues WHERE session_id = ?').bind(sessionId),
    env.DB.prepare('DELETE FROM feedback WHERE session_id = ?').bind(sessionId),
    env.DB.prepare('DELETE FROM sources WHERE session_id = ?').bind(sessionId),
  ]);
}

export async function clearIssuesOnly(env: Env, sessionId: string): Promise<void> {
  await env.DB.prepare('DELETE FROM issues WHERE session_id = ?').bind(sessionId).run();
}

// ============================================================================
// PRIORITY CONFIG
// ============================================================================

export async function getPriorityConfig(env: Env, sessionId: string): Promise<{ critical: string[], high: string[], medium: string[] } | null> {
  const result = await env.DB.prepare(`
    SELECT critical_keywords, high_keywords, medium_keywords FROM priority_config WHERE session_id = ?
  `).bind(sessionId).first();

  if (!result) return null;

  return {
    critical: JSON.parse((result as any).critical_keywords || '[]'),
    high: JSON.parse((result as any).high_keywords || '[]'),
    medium: JSON.parse((result as any).medium_keywords || '[]'),
  };
}

export async function savePriorityConfig(env: Env, sessionId: string, config: { critical: string[], high: string[], medium: string[] }): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO priority_config (session_id, critical_keywords, high_keywords, medium_keywords)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      critical_keywords = excluded.critical_keywords,
      high_keywords = excluded.high_keywords,
      medium_keywords = excluded.medium_keywords,
      updated_at = datetime('now')
  `).bind(
    sessionId,
    JSON.stringify(config.critical),
    JSON.stringify(config.high),
    JSON.stringify(config.medium)
  ).run();
}
