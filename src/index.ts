/**
 * Relay v2 - Feedback Intelligence Platform
 * A simplified, effective tool for aggregating and analyzing product feedback
 */

import { Env, FeedbackSource, IssueStatus } from './types';
import {
  saveSource,
  getAllSources,
  getSource,
  updateSourceSync,
  deleteSource,
  saveFeedbackItems,
  getAllFeedback,
  getUnanalyzedFeedback,
  getAllIssues,
  saveIssuesBatch,
  updateIssueStatus,
  updateIssuePriority,
  resetIssuePriority,
  getDashboardStats,
  clearAllData,
  clearIssuesOnly,
  getPriorityConfig,
  saveInsights,
  getInsights,
  dismissInsight,
} from './database';
import { fetchGitHubIssues, fetchRedditPosts, parseCSVToFeedback } from './sources';
import { analyzeFeedbackBatch, generatePMInsights, chatWithAI, ChatMessage, generateQuickSummary, QuickSummary } from './ai';
import { generateHTML } from './ui';
import { Priority } from './types';

// Session management
const SESSION_COOKIE = 'relay_session';
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

function getSessionId(request: Request): { id: string; isNew: boolean } {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));

  if (match) {
    return { id: match[1], isNew: false };
  }

  return { id: crypto.randomUUID(), isNew: true };
}

function setSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; SameSite=Lax`;
}

// Response helpers
function redirect(url: string, sessionId?: string): Response {
  const headers: Record<string, string> = { 'Location': url };
  if (sessionId) {
    headers['Set-Cookie'] = setSessionCookie(sessionId);
  }
  return new Response(null, { status: 302, headers });
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function htmlResponse(html: string, sessionId?: string): Response {
  const headers: Record<string, string> = { 'Content-Type': 'text/html; charset=utf-8' };
  if (sessionId) {
    headers['Set-Cookie'] = setSessionCookie(sessionId);
  }
  return new Response(html, { headers });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Main handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const session = getSessionId(request);

    try {
      // ========================================================================
      // MAIN UI ROUTES
      // ========================================================================

      if (path === '/' && method === 'GET') {
        const tab = url.searchParams.get('tab') || 'sources';
        const sources = await getAllSources(env, session.id);
        const issues = await getAllIssues(env, session.id);
        const stats = await getDashboardStats(env, session.id);
        const insights = await getInsights(env, session.id);
        const summary = generateQuickSummary(issues);

        const html = generateHTML(tab, { sources, issues, stats, insights, summary });
        return htmlResponse(html, session.isNew ? session.id : undefined);
      }

      // ========================================================================
      // SOURCE MANAGEMENT
      // ========================================================================

      // Add GitHub source
      if (path === '/api/sources/github' && method === 'POST') {
        const formData = await request.formData();
        const repoInput = formData.get('repo') as string;
        const limit = parseInt(formData.get('limit') as string) || 20;

        if (!repoInput) {
          return redirect('/?tab=sources&error=repo_required');
        }

        // Parse owner/repo format
        const parts = repoInput.replace('https://github.com/', '').split('/');
        if (parts.length < 2) {
          return redirect('/?tab=sources&error=invalid_repo_format');
        }
        const [owner, repo] = parts;

        // Fetch issues from GitHub
        const { items, error } = await fetchGitHubIssues(owner, repo, limit);

        if (error) {
          console.error('GitHub error:', error);
          return redirect(`/?tab=sources&error=${encodeURIComponent(error)}`);
        }

        // Save source
        const sourceId = await saveSource(env, session.id, {
          session_id: session.id,
          type: 'github',
          config: JSON.stringify({ owner, repo, fetch_limit: limit }),
          last_synced: new Date().toISOString(),
          item_count: items.length,
        });

        // Save feedback items
        await saveFeedbackItems(env, session.id, sourceId, items);
        await updateSourceSync(env, sourceId, items.length);

        return redirect('/?tab=sources');
      }

      // Add Reddit source
      if (path === '/api/sources/reddit' && method === 'POST') {
        const formData = await request.formData();
        const subreddit = (formData.get('subreddit') as string || '').replace('r/', '').trim();
        const query = formData.get('query') as string || '';
        const limit = parseInt(formData.get('limit') as string) || 20;

        if (!subreddit) {
          return redirect('/?tab=sources&error=subreddit_required');
        }

        // Fetch posts from Reddit
        const { items, error } = await fetchRedditPosts(subreddit, query || undefined, limit);

        if (error) {
          console.error('Reddit error:', error);
          return redirect(`/?tab=sources&error=${encodeURIComponent(error)}`);
        }

        // Save source
        const sourceId = await saveSource(env, session.id, {
          session_id: session.id,
          type: 'reddit',
          config: JSON.stringify({ subreddit, search_query: query, fetch_limit: limit }),
          last_synced: new Date().toISOString(),
          item_count: items.length,
        });

        // Save feedback items
        await saveFeedbackItems(env, session.id, sourceId, items);
        await updateSourceSync(env, sourceId, items.length);

        return redirect('/?tab=sources');
      }

      // Add CSV source
      if (path === '/api/sources/csv' && method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
          return redirect('/?tab=sources&error=file_required');
        }

        const content = await file.text();
        const { items, error } = parseCSVToFeedback(content);

        if (error) {
          console.error('CSV error:', error);
          return redirect(`/?tab=sources&error=${encodeURIComponent(error)}`);
        }

        if (items.length === 0) {
          return redirect('/?tab=sources&error=empty_csv');
        }

        // Save source
        const sourceId = await saveSource(env, session.id, {
          session_id: session.id,
          type: 'csv',
          config: JSON.stringify({ filename: file.name, row_count: items.length }),
          last_synced: new Date().toISOString(),
          item_count: items.length,
        });

        // Save feedback items
        await saveFeedbackItems(env, session.id, sourceId, items);
        await updateSourceSync(env, sourceId, items.length);

        return redirect('/?tab=sources');
      }

      // Sync source (re-fetch)
      if (path.match(/^\/api\/sources\/([^/]+)\/sync$/) && method === 'POST') {
        const sourceId = path.split('/')[3];
        const source = await getSource(env, session.id, sourceId);

        if (!source) {
          return redirect('/?tab=sources&error=source_not_found');
        }

        const config = JSON.parse(source.config);
        let items: any[] = [];
        let error: string | undefined;

        if (source.type === 'github') {
          const result = await fetchGitHubIssues(config.owner, config.repo, config.fetch_limit);
          items = result.items;
          error = result.error;
        } else if (source.type === 'reddit') {
          const result = await fetchRedditPosts(config.subreddit, config.search_query, config.fetch_limit);
          items = result.items;
          error = result.error;
        }

        if (error) {
          return redirect(`/?tab=sources&error=${encodeURIComponent(error)}`);
        }

        await saveFeedbackItems(env, session.id, sourceId, items);
        await updateSourceSync(env, sourceId, items.length);

        return redirect('/?tab=sources');
      }

      // Delete source
      if (path.match(/^\/api\/sources\/([^/]+)\/delete$/) && method === 'POST') {
        const sourceId = path.split('/')[3];
        await deleteSource(env, session.id, sourceId);
        return redirect('/?tab=sources');
      }

      // ========================================================================
      // ANALYSIS
      // ========================================================================

      if (path === '/api/analyze' && method === 'POST') {
        // Get unanalyzed feedback
        const feedback = await getUnanalyzedFeedback(env, session.id);

        if (feedback.length === 0) {
          return redirect('/?tab=issues&message=no_new_feedback');
        }

        // Get priority config if exists
        const priorityConfig = await getPriorityConfig(env, session.id);

        // Analyze feedback
        const issues = await analyzeFeedbackBatch(
          env,
          feedback,
          priorityConfig ? {
            critical_keywords: priorityConfig.critical,
            high_keywords: priorityConfig.high,
            medium_keywords: priorityConfig.medium,
          } : undefined
        );

        // Save issues
        await saveIssuesBatch(env, issues);

        // Get all issues for insights generation (including previously analyzed)
        const allIssues = await getAllIssues(env, session.id);

        // Generate PM insights based on all analyzed issues
        const insights = await generatePMInsights(env, allIssues);

        // Save insights
        await saveInsights(env, session.id, insights);

        return redirect('/?tab=issues');
      }

      // ========================================================================
      // ISSUE MANAGEMENT
      // ========================================================================

      // Update issue status
      if (path.match(/^\/api\/issues\/([^/]+)\/status$/) && method === 'PATCH') {
        const issueId = path.split('/')[3];
        const body = await request.json() as { status: IssueStatus };

        if (!body.status) {
          return errorResponse('Status required');
        }

        await updateIssueStatus(env, session.id, issueId, body.status);
        return jsonResponse({ success: true });
      }

      // Update issue priority (PM override)
      if (path.match(/^\/api\/issues\/([^/]+)\/priority$/) && method === 'PATCH') {
        const issueId = path.split('/')[3];
        const body = await request.json() as { priority: Priority; reason?: string };

        if (!body.priority || !['critical', 'high', 'medium', 'low'].includes(body.priority)) {
          return errorResponse('Valid priority required');
        }

        await updateIssuePriority(env, session.id, issueId, body.priority, body.reason);
        return jsonResponse({ success: true });
      }

      // Reset issue priority to system-computed
      if (path.match(/^\/api\/issues\/([^/]+)\/priority\/reset$/) && method === 'POST') {
        const issueId = path.split('/')[3];
        await resetIssuePriority(env, session.id, issueId);
        return jsonResponse({ success: true });
      }

      // ========================================================================
      // INSIGHTS MANAGEMENT
      // ========================================================================

      // Dismiss an insight
      if (path.match(/^\/api\/insights\/([^/]+)\/dismiss$/) && method === 'POST') {
        const insightId = path.split('/')[3];
        await dismissInsight(env, session.id, insightId);
        return jsonResponse({ success: true });
      }

      // Regenerate insights
      if (path === '/api/insights/regenerate' && method === 'POST') {
        const allIssues = await getAllIssues(env, session.id);
        const insights = await generatePMInsights(env, allIssues);
        await saveInsights(env, session.id, insights);
        return redirect('/?tab=issues');
      }

      // ========================================================================
      // AI CHAT
      // ========================================================================

      if (path === '/api/chat' && method === 'POST') {
        const body = await request.json() as { message: string; history?: ChatMessage[] };

        if (!body.message || typeof body.message !== 'string') {
          return errorResponse('Message is required');
        }

        const issues = await getAllIssues(env, session.id);
        const response = await chatWithAI(env, body.message, issues, body.history || []);

        return jsonResponse({ response });
      }

      // ========================================================================
      // EXPORT
      // ========================================================================

      if (path === '/api/export' && method === 'GET') {
        const format = url.searchParams.get('format') || 'csv';
        const issues = await getAllIssues(env, session.id);

        if (format === 'json') {
          return new Response(JSON.stringify(issues, null, 2), {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': 'attachment; filename="relay-issues.json"',
            },
          });
        }

        // Default to CSV
        const csvRows = [
          ['ID', 'Title', 'Summary', 'Category', 'Priority', 'Priority Reason', 'Status', 'Source', 'Source URL', 'Author', 'Sentiment', 'Created At'],
          ...issues.map(issue => [
            issue.id,
            `"${(issue.title || '').replace(/"/g, '""')}"`,
            `"${(issue.summary || '').replace(/"/g, '""')}"`,
            issue.category,
            issue.priority,
            `"${(issue.priority_reason || '').replace(/"/g, '""')}"`,
            issue.status,
            issue.source,
            issue.source_url || '',
            issue.author,
            issue.sentiment_label,
            issue.created_at,
          ]),
        ];

        const csv = csvRows.map(row => row.join(',')).join('\n');

        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="relay-issues.csv"',
          },
        });
      }

      // ========================================================================
      // DATA MANAGEMENT
      // ========================================================================

      if (path === '/api/clear' && method === 'POST') {
        await clearAllData(env, session.id);
        return redirect('/?tab=sources');
      }

      if (path === '/api/clear-issues' && method === 'POST') {
        await clearIssuesOnly(env, session.id);
        return redirect('/?tab=issues');
      }

      // ========================================================================
      // HEALTH CHECK
      // ========================================================================

      if (path === '/health') {
        return jsonResponse({ status: 'ok', version: '2.0' });
      }

      // ========================================================================
      // 404
      // ========================================================================

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Request error:', error);
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },
};
