// Relay v2 - Simplified Types
// Clean, minimal type definitions for feedback intelligence

export interface Env {
  DB: D1Database;
  AI: Ai;
}

// Source types we support
export type FeedbackSource = 'github' | 'reddit' | 'csv';

// Raw feedback item from any source
export interface FeedbackItem {
  id: string;
  session_id: string;
  source: FeedbackSource;
  source_id: string;
  title: string;
  body: string;
  url: string;
  author: string;
  created_at: string;
  imported_at: string;
}

// Priority levels - customizable by user
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// Issue status for tracking
export type IssueStatus = 'new' | 'in_review' | 'in_progress' | 'done';

// Analyzed issue - the main entity users work with
export interface Issue {
  id: string;
  session_id: string;
  feedback_id: string;
  title: string;
  summary: string;
  category: string;
  priority: Priority;
  priority_reason: string;
  priority_override: boolean; // true if PM manually changed priority
  original_priority?: Priority; // system-computed priority before override
  sentiment_score: number; // -1 to 1
  sentiment_label: 'negative' | 'neutral' | 'positive';
  status: IssueStatus;
  source: FeedbackSource;
  source_url: string;
  author: string;
  assigned_to: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// PM Insight types
export type InsightType = 'quick_win' | 'investigate' | 'strategic' | 'monitor';
export type ImpactLevel = 'high' | 'medium' | 'low';

export interface PMInsight {
  id: string;
  session_id: string;
  type: InsightType;
  title: string;
  description: string;
  action: string;
  impact: ImpactLevel;
  effort: ImpactLevel;
  related_issue_ids: string[];
  category: string;
  dismissed: boolean;
  created_at: string;
}

// Connected source configuration
export interface ConnectedSource {
  id: string;
  session_id: string;
  type: FeedbackSource;
  config: string; // JSON stringified config
  last_synced: string | null;
  item_count: number;
  created_at: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  fetch_limit: number;
}

export interface RedditConfig {
  subreddit: string;
  search_query?: string;
  fetch_limit: number;
}

export interface CSVConfig {
  filename: string;
  row_count: number;
}

// Priority configuration - user customizable
export interface PriorityConfig {
  critical_keywords: string[];
  high_keywords: string[];
  medium_keywords: string[];
  // Everything else is low
}

// Default priority keywords
export const DEFAULT_PRIORITY_CONFIG: PriorityConfig = {
  critical_keywords: [
    'security', 'vulnerability', 'exploit', 'breach', 'leak', 'csrf', 'xss',
    'injection', 'auth bypass', 'data loss', 'production down', 'outage'
  ],
  high_keywords: [
    'crash', 'broken', 'cannot', 'blocked', 'urgent', 'critical', 'severe',
    'failing', 'error', 'bug', 'not working', 'regression'
  ],
  medium_keywords: [
    'slow', 'performance', 'improve', 'enhance', 'feature request', 'would be nice',
    'suggestion', 'consider', 'confusing', 'unclear'
  ]
};

// Analysis result from AI
export interface AnalysisResult {
  summary: string;
  category: string;
  suggested_priority: Priority;
  key_points: string[];
}

// Stats for dashboard
export interface DashboardStats {
  total_issues: number;
  by_priority: Record<Priority, number>;
  by_status: Record<IssueStatus, number>;
  by_source: Record<FeedbackSource, number>;
}

// GitHub API types
export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  user: { login: string } | null;
  created_at: string;
  html_url: string;
  state: string;
  labels: Array<{ name: string }>;
}

// Reddit API types
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  permalink: string;
  score: number;
  num_comments: number;
}
