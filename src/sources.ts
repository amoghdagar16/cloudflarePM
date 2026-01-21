// Relay v2 - Source Connectors
// GitHub, Reddit, and CSV import functionality

import { FeedbackItem, GitHubIssue, RedditPost, FeedbackSource } from './types';

// ============================================================================
// GITHUB CONNECTOR
// Fetches issues from public GitHub repositories
// ============================================================================

export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  limit: number = 20
): Promise<{ items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[]; error?: string }> {
  try {
    // Use GitHub's public API (no auth required for public repos)
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=${Math.min(limit, 100)}&sort=created&direction=desc`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Relay-Feedback-Tool',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], error: 'Repository not found. Make sure it exists and is public.' };
      }
      if (response.status === 403) {
        return { items: [], error: 'Rate limited. Please try again later.' };
      }
      return { items: [], error: `GitHub API error: ${response.status}` };
    }

    const issues: GitHubIssue[] = await response.json();

    // Filter out pull requests (they have a pull_request key)
    const actualIssues = issues.filter((issue: any) => !issue.pull_request);

    const items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[] = actualIssues.map(issue => ({
      source: 'github' as FeedbackSource,
      source_id: `${owner}/${repo}#${issue.number}`,
      title: issue.title,
      body: issue.body || '',
      url: issue.html_url,
      author: issue.user?.login || 'unknown',
      created_at: issue.created_at,
    }));

    return { items };
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return { items: [], error: 'Failed to connect to GitHub. Please check your connection.' };
  }
}

// ============================================================================
// REDDIT CONNECTOR
// Fetches posts from public subreddits using the JSON API
// ============================================================================

export async function fetchRedditPosts(
  subreddit: string,
  searchQuery?: string,
  limit: number = 20
): Promise<{ items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[]; error?: string }> {
  try {
    // Use Reddit's public JSON API
    let url: string;

    if (searchQuery) {
      // Search within subreddit
      url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&limit=${limit}&sort=new`;
    } else {
      // Get recent posts
      url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Relay-Feedback-Tool/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], error: 'Subreddit not found or is private.' };
      }
      if (response.status === 403) {
        return { items: [], error: 'Access denied. The subreddit may be private or banned.' };
      }
      if (response.status === 429) {
        return { items: [], error: 'Rate limited by Reddit. Please try again later.' };
      }
      return { items: [], error: `Reddit API error: ${response.status}` };
    }

    const data: any = await response.json();
    const posts = data.data?.children || [];

    const items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[] = posts.map((post: any) => {
      const p = post.data;
      return {
        source: 'reddit' as FeedbackSource,
        source_id: p.id,
        title: p.title,
        body: p.selftext || '',
        url: `https://reddit.com${p.permalink}`,
        author: p.author,
        created_at: new Date(p.created_utc * 1000).toISOString(),
      };
    });

    return { items };
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return { items: [], error: 'Failed to connect to Reddit. Please check your connection.' };
  }
}

// ============================================================================
// CSV PARSER
// Parses CSV files with intelligent column detection
// ============================================================================

export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse CSV properly handling quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

// Map of common column name variants
const COLUMN_MAPPINGS: Record<string, string[]> = {
  title: ['title', 'subject', 'summary', 'name', 'issue', 'heading'],
  body: ['body', 'description', 'content', 'text', 'comment', 'feedback', 'message', 'details'],
  author: ['author', 'user', 'username', 'email', 'customer', 'reporter', 'name', 'from'],
  url: ['url', 'link', 'href', 'source_url', 'reference'],
  created_at: ['created', 'date', 'timestamp', 'time', 'created_at', 'submitted', 'datetime'],
  id: ['id', 'ticket', 'number', 'ref', 'reference', 'issue_id'],
};

function findColumnIndex(headers: string[], targetColumn: string): number {
  const variants = COLUMN_MAPPINGS[targetColumn] || [targetColumn];
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());

  for (const variant of variants) {
    const index = lowerHeaders.findIndex(h => h.includes(variant.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

export function parseCSVToFeedback(
  content: string
): { items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[]; error?: string } {
  try {
    const { headers, rows } = parseCSV(content);

    if (headers.length === 0) {
      return { items: [], error: 'Empty CSV file' };
    }

    // Find column indices
    const titleIdx = findColumnIndex(headers, 'title');
    const bodyIdx = findColumnIndex(headers, 'body');
    const authorIdx = findColumnIndex(headers, 'author');
    const urlIdx = findColumnIndex(headers, 'url');
    const dateIdx = findColumnIndex(headers, 'created_at');
    const idIdx = findColumnIndex(headers, 'id');

    // We need at least a title column
    if (titleIdx === -1 && bodyIdx === -1) {
      return {
        items: [],
        error: `Could not find title or body column. Found columns: ${headers.join(', ')}`
      };
    }

    const items: Omit<FeedbackItem, 'id' | 'session_id' | 'imported_at'>[] = rows
      .filter(row => row.length > 0)
      .map((row, index) => {
        const title = titleIdx !== -1 ? row[titleIdx] : (row[bodyIdx] || '').slice(0, 100);
        const body = bodyIdx !== -1 ? row[bodyIdx] : '';
        const author = authorIdx !== -1 ? row[authorIdx] : 'Unknown';
        const url = urlIdx !== -1 ? row[urlIdx] : '';
        const dateStr = dateIdx !== -1 ? row[dateIdx] : '';
        const id = idIdx !== -1 ? row[idIdx] : `row_${index + 1}`;

        // Parse date or use current date
        let createdAt: string;
        if (dateStr) {
          const parsed = new Date(dateStr);
          createdAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        } else {
          createdAt = new Date().toISOString();
        }

        return {
          source: 'csv' as FeedbackSource,
          source_id: id,
          title: title || 'Untitled',
          body: body || '',
          url: url || '',
          author: author || 'Unknown',
          created_at: createdAt,
        };
      });

    return { items };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return { items: [], error: 'Failed to parse CSV file. Please check the format.' };
  }
}
