-- Relay v2 - Simplified Schema
-- Clean, minimal tables for feedback intelligence

-- Connected sources (GitHub repos, subreddits, CSV uploads)
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('github', 'reddit', 'csv')),
    name TEXT NOT NULL,
    config TEXT NOT NULL,
    last_synced TEXT,
    item_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sources_session ON sources(session_id);

-- Raw feedback items from all sources
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('github', 'reddit', 'csv')),
    external_id TEXT,
    title TEXT NOT NULL,
    body TEXT,
    url TEXT,
    author TEXT,
    created_at TEXT NOT NULL,
    imported_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source_id);

-- Analyzed issues - the main working entity
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    feedback_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    category TEXT,
    priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    priority_reason TEXT,
    priority_override INTEGER DEFAULT 0,
    original_priority TEXT,
    sentiment_score REAL,
    sentiment_label TEXT CHECK (sentiment_label IN ('negative', 'neutral', 'positive')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'in_progress', 'done')),
    source TEXT NOT NULL,
    source_url TEXT,
    author TEXT,
    assigned_to TEXT,
    tags TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_issues_session ON issues(session_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(session_id, priority);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(session_id, status);

-- PM Insights - AI-generated actionable recommendations
CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('quick_win', 'investigate', 'strategic', 'monitor')),
    title TEXT NOT NULL,
    description TEXT,
    action TEXT,
    impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
    effort TEXT CHECK (effort IN ('high', 'medium', 'low')),
    related_issue_ids TEXT,
    category TEXT,
    dismissed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_insights_session ON insights(session_id);

-- User priority configuration
CREATE TABLE IF NOT EXISTS priority_config (
    session_id TEXT PRIMARY KEY,
    critical_keywords TEXT NOT NULL DEFAULT '[]',
    high_keywords TEXT NOT NULL DEFAULT '[]',
    medium_keywords TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
