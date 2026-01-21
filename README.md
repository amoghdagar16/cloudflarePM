# Relay

**Relay feedback into insights** - A simple, effective feedback intelligence tool built on Cloudflare Workers.

## Overview

Product feedback arrives from many channels: GitHub issues, Reddit discussions, support tickets, and more. Relay aggregates this feedback and transforms it into prioritized, actionable issues.

**Design Philosophy:** Simple yet effective. No information overload. Clear evidence. Actionable insights.

## Features

- **Multi-Source Import**: GitHub Issues, Reddit posts, CSV uploads
- **AI Analysis**: Sentiment analysis + AI-powered summarization
- **Priority Classification**: Deterministic, rule-based (Critical → High → Medium → Low)
- **Issue Tracking**: Kanban-style workflow (New → In Review → In Progress → Done)
- **Evidence Links**: Direct links to original feedback sources
- **Export**: CSV and JSON formats for sharing with teams

## User Flow

```
1. Sources Tab → Connect GitHub, Reddit, or upload CSV
2. Click "Analyze All Feedback"
3. Issues Tab → View prioritized issues with evidence links
4. Actions Tab → Track issue resolution progress
```

## Technology Stack

| Cloudflare Product | Purpose |
|-------------------|---------|
| **Workers** | Application logic, routing, UI rendering |
| **D1 Database** | Store sources, feedback, and issues |
| **Workers AI** | Sentiment analysis and summarization |
| **KV** | Session management |

### AI Models Used

| Model | Purpose |
|-------|---------|
| `@cf/huggingface/distilbert-sst-2-int8` | Sentiment analysis |
| `@cf/meta/llama-3.1-8b-instruct` | Issue summarization |

## Project Structure

```
src/
├── index.ts      # Main router and HTTP handlers
├── types.ts      # TypeScript interfaces
├── database.ts   # D1 database operations
├── ai.ts         # Sentiment analysis and AI summarization
├── sources.ts    # GitHub, Reddit, CSV connectors
└── ui.ts         # Server-rendered HTML UI

migrations/
└── 0001_schema.sql   # Database schema
```

## Priority Logic

Priorities are assigned using deterministic keyword matching:

| Priority | Keywords |
|----------|----------|
| **Critical** | security, vulnerability, exploit, breach, data loss, outage |
| **High** | crash, broken, cannot, blocked, urgent, bug, error, regression |
| **Medium** | slow, performance, improve, feature request, confusing |
| **Low** | Everything else |

## Setup

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create D1 database
npx wrangler d1 create relay-db

# 3. Update wrangler.jsonc with your database ID

# 4. Run migrations
npx wrangler d1 execute relay-db --local --file=migrations/0001_schema.sql

# 5. Start dev server
npx wrangler dev

# 6. Open http://localhost:8787
```

### Deploy to Production

```bash
# Run migrations on production
npx wrangler d1 execute relay-db --remote --file=migrations/0001_schema.sql

# Deploy
npx wrangler deploy
```

## API Reference

### Sources
```
POST /api/sources/github   FormData: { repo, limit }
POST /api/sources/reddit   FormData: { subreddit, query, limit }
POST /api/sources/csv      FormData: { file }
POST /api/sources/:id/sync
POST /api/sources/:id/delete
```

### Analysis
```
POST /api/analyze          Run AI analysis on all feedback
```

### Issues
```
PATCH /api/issues/:id/status   { status: 'new'|'in_review'|'in_progress'|'done' }
```

### Export
```
GET /api/export?format=csv
GET /api/export?format=json
```

## Architecture

```
┌─────────────────────────────────────┐
│        Data Sources                  │
│   GitHub / Reddit / CSV Upload       │
└─────────────────┬───────────────────┘
                  │
                  v
┌─────────────────────────────────────┐
│        Cloudflare Workers            │
│   Routing, Analysis, UI Rendering    │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┼─────────┐
        v         v         v
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │   D1    │ │ Workers │ │   KV    │
   │   DB    │ │   AI    │ │ Session │
   └─────────┘ └─────────┘ └─────────┘
```

## Design Decisions

1. **Simple over Complex**: No clustering, theme merging, or multi-step analysis. Each feedback item becomes one issue.

2. **Deterministic Priority**: Rule-based keyword matching instead of AI-estimated scores. Transparent and explainable.

3. **Evidence First**: Every issue links directly to its source (GitHub issue URL, Reddit permalink, etc.).

4. **PM-Friendly**: Clean UI, no technical jargon, actionable insights with clear next steps.

5. **Rate Limit Handling**: Built-in error handling for GitHub and Reddit API limits.

## License

MIT
