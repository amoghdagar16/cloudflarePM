// Relay v2 - Simplified AI Analysis
// Uses Cloudflare Workers AI for sentiment analysis and summarization

import { Env, FeedbackItem, Issue, Priority, DEFAULT_PRIORITY_CONFIG, PriorityConfig, PMInsight } from './types';

// ============================================================================
// SENTIMENT ANALYSIS
// Uses DistilBERT for reliable sentiment classification
// ============================================================================

export async function analyzeSentiment(
  env: Env,
  text: string
): Promise<{ score: number; label: 'negative' | 'neutral' | 'positive' }> {
  try {
    const truncatedText = text.slice(0, 512);

    const response = await env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
      text: truncatedText,
    });

    const results = response as Array<{ label: string; score: number }>;

    if (!results || results.length === 0) {
      return { score: 0, label: 'neutral' };
    }

    const positive = results.find(r => r.label === 'POSITIVE');
    const negative = results.find(r => r.label === 'NEGATIVE');

    if (positive && negative) {
      if (positive.score > negative.score) {
        return { score: positive.score, label: 'positive' };
      } else if (negative.score > positive.score) {
        return { score: -negative.score, label: 'negative' };
      }
    }

    return { score: 0, label: 'neutral' };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { score: 0, label: 'neutral' };
  }
}

// ============================================================================
// PRIORITY CLASSIFICATION
// Multi-factor: keywords + sentiment + volume scoring
// ============================================================================

export interface PriorityFactors {
  keywordScore: number;
  sentimentScore: number;
  volumeScore: number;
  urgencyScore: number;
  totalScore: number;
}

export function classifyPriority(
  title: string,
  body: string,
  config: PriorityConfig = DEFAULT_PRIORITY_CONFIG,
  sentimentLabel?: 'negative' | 'neutral' | 'positive',
  similarCount?: number
): { priority: Priority; reason: string; factors: PriorityFactors } {
  const text = `${title} ${body}`.toLowerCase();

  let factors: PriorityFactors = {
    keywordScore: 0,
    sentimentScore: 0,
    volumeScore: 0,
    urgencyScore: 0,
    totalScore: 0
  };

  let keywordMatch = '';

  for (const keyword of config.critical_keywords) {
    if (text.includes(keyword.toLowerCase())) {
      factors.keywordScore = 40;
      keywordMatch = keyword;
      break;
    }
  }
  if (factors.keywordScore === 0) {
    for (const keyword of config.high_keywords) {
      if (text.includes(keyword.toLowerCase())) {
        factors.keywordScore = 30;
        keywordMatch = keyword;
        break;
      }
    }
  }
  if (factors.keywordScore === 0) {
    for (const keyword of config.medium_keywords) {
      if (text.includes(keyword.toLowerCase())) {
        factors.keywordScore = 20;
        keywordMatch = keyword;
        break;
      }
    }
  }

  if (sentimentLabel === 'negative') {
    factors.sentimentScore = 30;
  } else if (sentimentLabel === 'neutral') {
    factors.sentimentScore = 10;
  }

  if (similarCount !== undefined) {
    factors.volumeScore = Math.min(20, similarCount * 5);
  }

  const urgencyWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'blocking', 'showstopper'];
  for (const word of urgencyWords) {
    if (text.includes(word)) {
      factors.urgencyScore = 10;
      break;
    }
  }

  factors.totalScore = factors.keywordScore + factors.sentimentScore + factors.volumeScore + factors.urgencyScore;

  let priority: Priority;
  let reason: string;

  if (factors.totalScore >= 60) {
    priority = 'critical';
    reason = buildPriorityReason(factors, keywordMatch);
  } else if (factors.totalScore >= 40) {
    priority = 'high';
    reason = buildPriorityReason(factors, keywordMatch);
  } else if (factors.totalScore >= 20) {
    priority = 'medium';
    reason = buildPriorityReason(factors, keywordMatch);
  } else {
    priority = 'low';
    reason = 'Standard priority';
  }

  return { priority, reason, factors };
}

function buildPriorityReason(factors: PriorityFactors, keywordMatch: string): string {
  const parts: string[] = [];
  if (factors.keywordScore > 0) parts.push(`keyword "${keywordMatch}"`);
  if (factors.sentimentScore >= 30) parts.push('negative sentiment');
  if (factors.volumeScore > 0) parts.push(`${Math.floor(factors.volumeScore / 5)} similar issues`);
  if (factors.urgencyScore > 0) parts.push('urgency detected');
  return parts.join(' + ') || 'Priority factors combined';
}

// ============================================================================
// AI SUMMARIZATION
// ============================================================================

export async function generateSummary(
  env: Env,
  title: string,
  body: string
): Promise<{ summary: string; category: string }> {
  try {
    const prompt = `Analyze this feedback and provide a brief summary and category.

Title: ${title}
Content: ${body.slice(0, 800)}

Respond in this exact JSON format only, no other text:
{"summary": "one sentence summary of the core issue", "category": "one of: bug, feature, performance, ux, documentation, security, other"}`;

    const response = await (env.AI as any).run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 200,
    });

    const responseText = (response as any).response || '';

    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || title,
          category: parsed.category || 'other'
        };
      } catch {
        // JSON parsing failed
      }
    }

    return { summary: title, category: 'other' };
  } catch (error) {
    console.error('Summary generation failed:', error);
    return { summary: title, category: 'other' };
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export async function analyzeFeedbackItem(
  env: Env,
  feedback: FeedbackItem,
  priorityConfig?: PriorityConfig,
  similarCount?: number
): Promise<Omit<Issue, 'updated_at'>> {
  const textContent = `${feedback.title} ${feedback.body || ''}`;

  const sentiment = await analyzeSentiment(env, textContent);

  const { priority, reason } = classifyPriority(
    feedback.title,
    feedback.body || '',
    priorityConfig,
    sentiment.label,
    similarCount
  );

  const { summary, category } = await generateSummary(env, feedback.title, feedback.body || '');

  return {
    id: `issue_${feedback.id}`,
    session_id: feedback.session_id,
    feedback_id: feedback.id,
    title: feedback.title,
    summary,
    category,
    priority,
    priority_reason: reason,
    priority_override: false,
    sentiment_score: sentiment.score,
    sentiment_label: sentiment.label,
    status: 'new',
    source: feedback.source,
    source_url: feedback.url,
    author: feedback.author,
    assigned_to: null,
    tags: [],
    created_at: feedback.created_at,
  };
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

export async function analyzeFeedbackBatch(
  env: Env,
  feedbackItems: FeedbackItem[],
  priorityConfig?: PriorityConfig,
  onProgress?: (current: number, total: number) => void
): Promise<Omit<Issue, 'updated_at'>[]> {
  const issues: Omit<Issue, 'updated_at'>[] = [];
  const similarityCounts = computeSimilarityCounts(feedbackItems);

  for (let i = 0; i < feedbackItems.length; i++) {
    const feedback = feedbackItems[i];
    const similarCount = similarityCounts.get(feedback.id) || 0;

    try {
      const issue = await analyzeFeedbackItem(env, feedback, priorityConfig, similarCount);
      issues.push(issue);
    } catch (error) {
      console.error(`Failed to analyze feedback ${feedback.id}:`, error);
      issues.push({
        id: `issue_${feedback.id}`,
        session_id: feedback.session_id,
        feedback_id: feedback.id,
        title: feedback.title,
        summary: feedback.body?.slice(0, 200) || feedback.title,
        category: 'other',
        priority: 'low',
        priority_reason: 'Analysis failed',
        priority_override: false,
        sentiment_score: 0,
        sentiment_label: 'neutral',
        status: 'new',
        source: feedback.source,
        source_url: feedback.url,
        author: feedback.author,
        assigned_to: null,
        tags: [],
        created_at: feedback.created_at,
      });
    }

    if (onProgress) onProgress(i + 1, feedbackItems.length);
    if (i < feedbackItems.length - 1) await new Promise(r => setTimeout(r, 100));
  }

  return issues;
}

function computeSimilarityCounts(items: FeedbackItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  const keywordsMap = new Map<string, Set<string>>();

  items.forEach(item => {
    const text = `${item.title} ${item.body || ''}`.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 4);
    keywordsMap.set(item.id, new Set(words));
  });

  items.forEach(item => {
    const myKeywords = keywordsMap.get(item.id) || new Set();
    let similarCount = 0;

    items.forEach(other => {
      if (other.id === item.id) return;
      const otherKeywords = keywordsMap.get(other.id) || new Set();
      const overlap = [...myKeywords].filter(k => otherKeywords.has(k)).length;
      if (overlap >= 3) similarCount++;
    });

    counts.set(item.id, similarCount);
  });

  return counts;
}

// ============================================================================
// THEME ANALYSIS
// Groups issues by semantic similarity and provides AI-verified theme labels
// ============================================================================

export interface ThemeGroup {
  id: string;
  label: string;
  description: string;
  issueCount: number;
  issues: Issue[];
  sentiment: 'negative' | 'neutral' | 'positive';
  priority: Priority;
}

export async function analyzeThemes(
  env: Env,
  issues: Issue[]
): Promise<ThemeGroup[]> {
  if (issues.length === 0) return [];

  // Group by category first (system classification)
  const byCategory: Record<string, Issue[]> = {};
  issues.forEach(issue => {
    const cat = issue.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(issue);
  });

  // Build summary for AI verification
  const themeSummary = Object.entries(byCategory)
    .filter(([_, items]) => items.length >= 2)
    .map(([cat, items]) => ({
      category: cat,
      count: items.length,
      sampleTitles: items.slice(0, 3).map(i => i.title)
    }));

  if (themeSummary.length === 0) {
    return issues.length > 0 ? [{
      id: 'theme_all',
      label: 'All Feedback',
      description: `${issues.length} items imported`,
      issueCount: issues.length,
      issues: issues.slice(0, 10),
      sentiment: 'neutral',
      priority: 'medium'
    }] : [];
  }

  // Ask AI to verify and label themes
  const prompt = `Analyze these feedback categories and provide clear labels.

CATEGORIES:
${themeSummary.map(t => `- ${t.category} (${t.count} issues): ${t.sampleTitles.map(s => `"${s}"`).join(', ')}`).join('\n')}

For each category, provide a user-friendly label and brief description.
JSON only:
{"themes": [{"category": "original_category", "label": "User-Friendly Label", "description": "Brief description of what users are reporting"}]}`;

  try {
    const response = await (env.AI as any).run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 400,
    });

    const responseText = (response as any).response || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.themes && Array.isArray(parsed.themes)) {
        return parsed.themes.map((theme: any) => {
          const catIssues = byCategory[theme.category] || [];
          const negCount = catIssues.filter(i => i.sentiment_label === 'negative').length;
          const posCount = catIssues.filter(i => i.sentiment_label === 'positive').length;

          return {
            id: `theme_${theme.category}`,
            label: theme.label || theme.category,
            description: theme.description || `${catIssues.length} related issues`,
            issueCount: catIssues.length,
            issues: catIssues.slice(0, 10),
            sentiment: negCount > posCount ? 'negative' : posCount > negCount ? 'positive' : 'neutral',
            priority: catIssues.some(i => i.priority === 'critical') ? 'critical' :
                      catIssues.some(i => i.priority === 'high') ? 'high' : 'medium'
          };
        });
      }
    }
  } catch (error) {
    console.error('Theme analysis failed:', error);
  }

  // Fallback: use category names directly
  return Object.entries(byCategory)
    .filter(([_, items]) => items.length >= 2)
    .map(([cat, items]) => ({
      id: `theme_${cat}`,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      description: `${items.length} ${cat} issues`,
      issueCount: items.length,
      issues: items.slice(0, 10),
      sentiment: 'neutral' as const,
      priority: 'medium' as Priority
    }));
}

// ============================================================================
// AI CHAT
// Conversational interface for exploring analyzed data
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithAI(
  env: Env,
  question: string,
  issues: Issue[],
  history: ChatMessage[] = []
): Promise<string> {
  if (issues.length === 0) {
    return "No feedback has been analyzed yet. Import and analyze some feedback first.";
  }

  const stats = {
    total: issues.length,
    byPriority: {
      critical: issues.filter(i => i.priority === 'critical').length,
      high: issues.filter(i => i.priority === 'high').length,
      medium: issues.filter(i => i.priority === 'medium').length,
      low: issues.filter(i => i.priority === 'low').length,
    },
    bySentiment: {
      negative: issues.filter(i => i.sentiment_label === 'negative').length,
      neutral: issues.filter(i => i.sentiment_label === 'neutral').length,
      positive: issues.filter(i => i.sentiment_label === 'positive').length,
    },
    byCategory: {} as Record<string, number>,
  };

  issues.forEach(i => {
    const cat = i.category || 'other';
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  });

  const sampleIssues = issues.slice(0, 15).map(i => ({
    title: i.title,
    priority: i.priority,
    category: i.category,
    sentiment: i.sentiment_label
  }));

  const categoryList = Object.entries(stats.byCategory).map(([k, v]) => `${k}: ${v}`).join(', ');
  const issueList = sampleIssues.map((i, idx) => `${idx + 1}. [${i.priority}] ${i.title}`).join('\n');

  const systemContext = `You are an AI assistant helping a Product Manager analyze user feedback.

DATA:
- Total: ${stats.total} issues
- Priority: ${stats.byPriority.critical} critical, ${stats.byPriority.high} high, ${stats.byPriority.medium} medium, ${stats.byPriority.low} low
- Sentiment: ${stats.bySentiment.negative} negative, ${stats.bySentiment.neutral} neutral, ${stats.bySentiment.positive} positive
- Categories: ${categoryList}

SAMPLE ISSUES:
${issueList}

Answer concisely based on this data. Be specific and actionable.`;

  const conversationHistory = history.slice(-4).map(m =>
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
  ).join('\n');

  const prompt = systemContext + '\n\n' +
    (conversationHistory ? `Previous:\n${conversationHistory}\n\n` : '') +
    `User: ${question}\n\nAssistant:`;

  // Check if AI is available
  if (!env.AI) {
    return generateFallbackResponse(question, stats, sampleIssues);
  }

  try {
    const response = await (env.AI as any).run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 300,
    });

    const answer = (response as any).response || '';
    return answer.trim() || generateFallbackResponse(question, stats, sampleIssues);
  } catch (error) {
    console.error('Chat failed:', error);
    // Provide a helpful fallback based on the data we have
    return generateFallbackResponse(question, stats, sampleIssues);
  }
}

// Generate a simple response based on stats when AI is unavailable
function generateFallbackResponse(
  question: string,
  stats: { total: number; byPriority: Record<string, number>; bySentiment: Record<string, number>; byCategory: Record<string, number> },
  sampleIssues: { title: string; priority: string; category: string; sentiment: string }[]
): string {
  const q = question.toLowerCase();

  if (q.includes('top') || q.includes('priority') || q.includes('prioritize') || q.includes('urgent')) {
    const critical = stats.byPriority.critical || 0;
    const high = stats.byPriority.high || 0;
    if (critical + high > 0) {
      const topIssues = sampleIssues.filter(i => i.priority === 'critical' || i.priority === 'high').slice(0, 3);
      return `You have ${critical} critical and ${high} high priority issues. Top ones: ${topIssues.map(i => `"${i.title}"`).join(', ')}. Focus on these first.`;
    }
    return `No critical or high priority issues found. Your ${stats.total} issues are mostly medium/low priority.`;
  }

  if (q.includes('summary') || q.includes('summarize') || q.includes('overview')) {
    const topCategory = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0];
    const sentiment = stats.bySentiment.negative > stats.bySentiment.positive ? 'mostly negative' :
                      stats.bySentiment.positive > stats.bySentiment.negative ? 'mostly positive' : 'mixed';
    return `${stats.total} issues analyzed. Sentiment is ${sentiment}. ${topCategory ? `Most common category: ${topCategory[0]} (${topCategory[1]} issues).` : ''} ${stats.byPriority.critical || 0} critical, ${stats.byPriority.high || 0} high priority.`;
  }

  if (q.includes('pattern') || q.includes('common') || q.includes('theme') || q.includes('trend')) {
    const categories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (categories.length > 0) {
      return `Common patterns: ${categories.map(([cat, count]) => `${cat} (${count})`).join(', ')}. ${stats.bySentiment.negative > stats.total / 2 ? 'High negative sentiment suggests user frustration.' : ''}`;
    }
    return 'No clear patterns identified yet. Need more feedback to detect trends.';
  }

  if (q.includes('how') || q.includes('computed') || q.includes('work') || q.includes('rationale') || q.includes('algorithm') || q.includes('calculate')) {
    return `Priority is computed using a multi-factor scoring system (0-100 points): Keywords (40pts) - matches like "crash", "broken", "security" boost priority. Sentiment (30pts) - negative tone from AI analysis adds weight. Volume (20pts) - similar issues increase priority. Urgency words (10pts) - "urgent", "asap", "blocking". Categories are assigned by AI (Mistral) classifying each issue. Sentiment uses DistilBERT to detect positive/negative/neutral tone.`;
  }

  // Default response
  return `Based on ${stats.total} issues: ${stats.byPriority.critical || 0} critical, ${stats.byPriority.high || 0} high, ${stats.byPriority.medium || 0} medium priority. Ask about "top issues", "summary", "patterns", or "how it works" for more details.`;
}

// ============================================================================
// QUICK SUMMARY FOR ISSUES PAGE
// Generates a brief, data-driven summary without AI calls
// ============================================================================

export interface QuickSummary {
  headline: string;
  metrics: { label: string; value: string }[];
  recommendation: string;
}

export function generateQuickSummary(issues: Issue[]): QuickSummary {
  if (issues.length === 0) {
    return {
      headline: 'No feedback analyzed yet',
      metrics: [],
      recommendation: 'Import and analyze feedback to get started.'
    };
  }

  // Count by category
  const byCategory: Record<string, number> = {};
  const bySentiment = { negative: 0, neutral: 0, positive: 0 };
  const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };

  issues.forEach(issue => {
    const cat = issue.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    bySentiment[issue.sentiment_label]++;
    byPriority[issue.priority]++;
  });

  // Get top non-other category
  const sortedCategories = Object.entries(byCategory)
    .filter(([cat]) => cat !== 'other')
    .sort((a, b) => b[1] - a[1]);

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Build metrics - only show meaningful ones
  const metrics: { label: string; value: string }[] = [];

  // Always show total
  metrics.push({ label: 'Total', value: String(issues.length) });

  // Show priority breakdown
  if (byPriority.critical > 0 || byPriority.high > 0) {
    metrics.push({
      label: 'Priority',
      value: `${byPriority.critical} crit, ${byPriority.high} high`
    });
  } else {
    metrics.push({
      label: 'Priority',
      value: `${byPriority.medium} med, ${byPriority.low} low`
    });
  }

  // Show top category only if it's meaningful (not 'other')
  if (topCategory) {
    const pct = Math.round((topCategory[1] / issues.length) * 100);
    metrics.push({ label: topCategory[0], value: `${topCategory[1]} (${pct}%)` });
  } else {
    // Show sentiment if no meaningful category
    metrics.push({
      label: 'Sentiment',
      value: `${bySentiment.negative} neg, ${bySentiment.positive} pos`
    });
  }

  // Headline
  let headline = '';
  if (byPriority.critical > 0) {
    headline = `${byPriority.critical} critical issue${byPriority.critical > 1 ? 's' : ''} require immediate attention`;
  } else if (byPriority.high > 0) {
    headline = `${byPriority.high} high priority issue${byPriority.high > 1 ? 's' : ''} to review`;
  } else if (topCategory && topCategory[1] >= issues.length * 0.3) {
    headline = `${topCategory[0]} is the dominant theme (${Math.round((topCategory[1] / issues.length) * 100)}%)`;
  } else {
    headline = `${issues.length} feedback items analyzed`;
  }

  // Recommendation
  let recommendation = '';
  if (byPriority.critical > 0) {
    recommendation = `Start with the ${byPriority.critical} critical issue${byPriority.critical > 1 ? 's' : ''}.`;
  } else if (byPriority.high > 0) {
    recommendation = `Triage the ${byPriority.high} high priority item${byPriority.high > 1 ? 's' : ''}.`;
  } else if (topCategory) {
    recommendation = `Focus on ${topCategory[0]} improvements.`;
  } else if (bySentiment.negative > issues.length / 2) {
    recommendation = `Address negative feedback to improve satisfaction.`;
  } else {
    recommendation = 'Review and categorize items for better insights.';
  }

  return { headline, metrics, recommendation };
}

// ============================================================================
// PM INSIGHTS GENERATION
// Generates actionable insights based on analyzed issues
// ============================================================================

export async function generatePMInsights(
  env: Env,
  issues: Issue[]
): Promise<Omit<PMInsight, 'session_id' | 'created_at' | 'dismissed'>[]> {
  if (issues.length === 0) return [];

  const insights: Omit<PMInsight, 'session_id' | 'created_at' | 'dismissed'>[] = [];

  // Count categories and priorities
  const byCategory: Record<string, Issue[]> = {};
  const bySentiment = { negative: 0, neutral: 0, positive: 0 };
  const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };

  issues.forEach(issue => {
    const cat = issue.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(issue);
    bySentiment[issue.sentiment_label]++;
    byPriority[issue.priority]++;
  });

  // Insight 1: Critical/High priority items need attention (Quick Win - low effort to triage)
  const urgentCount = byPriority.critical + byPriority.high;
  if (urgentCount > 0) {
    const urgentIssues = issues.filter(i => i.priority === 'critical' || i.priority === 'high');
    insights.push({
      id: `insight_urgent_${Date.now()}`,
      type: 'quick_win',
      title: `${urgentCount} urgent issues need attention`,
      description: `You have ${byPriority.critical} critical and ${byPriority.high} high priority issues.`,
      action: 'Review and triage these issues first.',
      impact: 'high',
      effort: 'low',
      related_issue_ids: urgentIssues.slice(0, 5).map(i => i.id),
      category: 'priority'
    });
  }

  // Insight 2: Most common category (if significant)
  const sortedCategories = Object.entries(byCategory)
    .filter(([cat]) => cat !== 'other')
    .sort((a, b) => b[1].length - a[1].length);

  if (sortedCategories.length > 0 && sortedCategories[0][1].length >= 3) {
    const [topCat, topIssues] = sortedCategories[0];
    const percentage = Math.round((topIssues.length / issues.length) * 100);

    insights.push({
      id: `insight_category_${Date.now()}`,
      type: 'strategic',
      title: `${topCat} issues are most common (${percentage}%)`,
      description: `${topIssues.length} of ${issues.length} issues are related to ${topCat}.`,
      action: `Consider prioritizing ${topCat} improvements in your roadmap.`,
      impact: 'medium',
      effort: 'medium',
      related_issue_ids: topIssues.slice(0, 5).map(i => i.id),
      category: topCat
    });
  }

  // Insight 3: Negative sentiment concentration
  const negativeRatio = bySentiment.negative / issues.length;
  if (negativeRatio > 0.5 && issues.length >= 5) {
    const negativeIssues = issues.filter(i => i.sentiment_label === 'negative');
    insights.push({
      id: `insight_sentiment_${Date.now()}`,
      type: 'investigate',
      title: `High negative sentiment (${Math.round(negativeRatio * 100)}%)`,
      description: `Most feedback expresses frustration or dissatisfaction.`,
      action: 'Focus on addressing pain points before adding new features.',
      impact: 'high',
      effort: 'medium',
      related_issue_ids: negativeIssues.slice(0, 5).map(i => i.id),
      category: 'sentiment'
    });
  }

  return insights;
}
