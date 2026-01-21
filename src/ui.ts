// Relay v2 - Clean, Simple UI
// Cloudflare-themed with glassmorphism, warm whites, and orange accents

import { Issue, FeedbackItem, ConnectedSource, DashboardStats, Priority, IssueStatus, FeedbackSource, PMInsight } from './types';
import { QuickSummary } from './ai';

interface PageData {
  sources?: ConnectedSource[];
  feedback?: FeedbackItem[];
  issues?: Issue[];
  stats?: DashboardStats;
  insights?: PMInsight[];
  summary?: QuickSummary;
}

const STYLES = `
  :root {
    --bg-primary: #FAFAFA;
    --bg-secondary: #F3F3F3;
    --bg-card: #FFFFFF;
    --text-primary: #1a1a1a;
    --text-secondary: #555555;
    --text-muted: #888888;
    --border: rgba(0, 0, 0, 0.08);
    --border-light: rgba(0, 0, 0, 0.04);
    --accent: #F6821F;
    --accent-light: rgba(246, 130, 31, 0.08);
    --accent-glow: rgba(246, 130, 31, 0.15);
    --critical: #DC2626;
    --critical-bg: rgba(220, 38, 38, 0.08);
    --high: #F6821F;
    --high-bg: rgba(246, 130, 31, 0.08);
    --medium: #D97706;
    --medium-bg: rgba(217, 119, 6, 0.08);
    --low: #6B7280;
    --low-bg: rgba(107, 114, 128, 0.08);
    --success: #059669;
    --success-bg: rgba(5, 150, 105, 0.08);
    --radius: 8px;
    --radius-sm: 6px;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    --shadow-hover: 0 4px 12px rgba(246, 130, 31, 0.15);
    --transition: all 0.15s ease;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    background-image:
      linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Header */
  .header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--text-primary);
  }

  .logo-text .logo-accent {
    color: var(--accent);
    font-weight: 700;
  }

  .logo-tagline {
    display: none;
  }

  /* Navigation */
  .nav {
    display: flex;
    gap: 2px;
  }

  .nav-link {
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    text-decoration: none;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    transition: var(--transition);
  }

  .nav-link:hover {
    color: var(--text-primary);
  }

  .nav-link.active {
    background: var(--bg-card);
    color: var(--accent);
  }

  /* Main Content */
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  /* Cards */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 12px;
    transition: var(--transition);
  }

  .card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-icon {
    display: none;
  }

  /* Forms */
  .form-group {
    margin-bottom: 14px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    transition: var(--transition);
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .form-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }

  .form-input::placeholder {
    color: var(--text-muted);
  }

  .form-hint {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid transparent;
    text-decoration: none;
  }

  .btn-primary {
    background: var(--accent-light);
    color: var(--accent);
    border: 2px solid var(--accent);
  }

  .btn-primary:hover {
    background: var(--accent);
    color: white;
    box-shadow: var(--shadow-hover);
  }

  .btn-secondary {
    background: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border);
  }

  .btn-secondary:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
  }

  .btn-ghost:hover {
    color: var(--accent);
  }

  .btn-sm {
    padding: 6px 10px;
    font-size: 12px;
  }

  /* Grid */
  .grid {
    display: grid;
    gap: 16px;
  }

  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }

  @media (max-width: 768px) {
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  }

  /* Source Cards */
  .source-card {
    background: var(--bg-card);
    background-image: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
  }

  .source-card .form-group {
    flex: 1;
  }

  .source-card .btn {
    margin-top: auto;
  }

  .source-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
  }

  .source-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .source-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .source-icon.github { background: #24292e; color: white; }
  .source-icon.reddit { background: #FF4500; color: white; }
  .source-icon.csv { background: var(--accent); color: white; }

  .source-name {
    font-weight: 600;
    font-size: 14px;
  }

  .source-desc {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* Connected Sources List */
  .connected-source {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    transition: var(--transition);
  }

  .connected-source:hover {
    border-color: var(--accent);
  }

  .connected-source-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .connected-source-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .connected-source-name {
    font-weight: 500;
    font-size: 13px;
  }

  .connected-source-meta {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Priority Badges */
  .priority {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .priority-critical { background: var(--critical-bg); color: var(--critical); }
  .priority-high { background: var(--high-bg); color: var(--high); }
  .priority-medium { background: var(--medium-bg); color: var(--medium); }
  .priority-low { background: var(--low-bg); color: var(--low); }

  /* Status Badges */
  .status {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-new { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
  .status-in_review { background: var(--high-bg); color: var(--high); }
  .status-in_progress { background: var(--accent-glow); color: var(--accent); }
  .status-done { background: var(--medium-bg); color: var(--medium); }

  /* Issues Table */
  .issues-table {
    width: 100%;
    border-collapse: collapse;
  }

  .issues-table th {
    text-align: left;
    padding: 10px 14px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .issues-table td {
    padding: 14px;
    border-bottom: 1px solid var(--border-light);
    vertical-align: top;
  }

  .issues-table tr {
    transition: var(--transition);
  }

  .issues-table tr:hover td {
    background: var(--bg-secondary);
  }

  .issues-table tr:hover {
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .issue-title {
    font-weight: 500;
    font-size: 13px;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  .issue-summary {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .issue-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
  }

  .issue-source {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .issue-link {
    color: var(--accent);
    text-decoration: none;
    font-size: 11px;
  }

  .issue-link:hover {
    text-decoration: underline;
  }

  /* Stats Grid */
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-align: center;
    transition: var(--transition);
  }

  .stat-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -1px;
    font-variant-numeric: tabular-nums;
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Kanban Board */
  .kanban {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  @media (max-width: 1024px) {
    .kanban { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .kanban { grid-template-columns: 1fr; }
  }

  .kanban-column {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    min-height: 300px;
  }

  .kanban-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .kanban-title {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .kanban-count {
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .kanban-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: var(--transition);
  }

  .kanban-item:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
  }

  .kanban-item-title {
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .kanban-item-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-muted);
  }

  .empty-state-icon {
    font-size: 32px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .empty-state-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .empty-state-desc {
    font-size: 13px;
    margin-bottom: 24px;
  }

  /* Loading */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Analysis Progress */
  .progress-container {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    text-align: center;
  }

  .progress-bar {
    height: 4px;
    background: var(--bg-secondary);
    border-radius: 2px;
    overflow: hidden;
    margin: 24px 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    max-width: 480px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    transform: scale(0.95);
    transition: transform 0.2s;
  }

  .modal-overlay.active .modal {
    transform: scale(1);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-muted);
  }

  /* File Upload - Styled like form-input */
  .file-upload {
    display: block;
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
    background: var(--bg-secondary);
    background-image: none;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .file-upload input[type="file"] {
    display: none !important;
    visibility: hidden !important;
    position: absolute !important;
    left: -9999px !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    pointer-events: none !important;
  }

  .file-upload:hover {
    border-color: var(--text-muted);
  }

  .file-upload:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }

  .file-upload-text {
    font-size: 14px;
    color: var(--text-muted);
  }

  /* Coming Soon Cards */
  .source-card.coming-soon {
    opacity: 0.6;
    pointer-events: none;
    position: relative;
  }

  .source-card.coming-soon::after {
    content: 'Coming Soon';
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--bg-secondary);
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .source-icon.discord { background: #5865F2; color: white; }
  .source-icon.email { background: #6B7280; color: white; }
  .source-icon.twitter { background: #000000; color: white; }

  /* Summary Card */
  .summary-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 24px;
    transition: var(--transition);
  }

  .summary-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-hover);
  }

  .summary-headline {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-headline svg {
    color: var(--accent);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 640px) {
    .summary-grid { grid-template-columns: 1fr; }
  }

  .summary-metric {
    text-align: center;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    transition: var(--transition);
  }

  .summary-metric:hover {
    border-color: var(--accent);
  }

  .summary-metric-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .summary-metric-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }

  .summary-recommendation {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-recommendation svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  /* Progress Overview (Actions Page) */
  .progress-overview {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .progress-bar-container {
    flex: 1;
  }

  .progress-bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg-secondary);
  }

  .progress-segment {
    transition: var(--transition);
  }

  .progress-legend {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .progress-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--text-primary);
    color: white;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(100px);
    opacity: 0;
    transition: var(--transition);
    z-index: 1001;
  }

  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  /* Select */
  .select {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition);
  }

  .select:focus {
    outline: none;
    border-color: var(--accent);
  }

  /* Actions Bar */
  .actions-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .actions-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .actions-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Filters */
  .filters {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .filter-btn {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
    transition: var(--transition);
  }

  .filter-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .filter-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  /* Share Panel */
  .share-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-top: 12px;
  }

  .share-panel-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .share-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Sentiment Indicator */
  .sentiment {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    text-transform: capitalize;
  }

  .sentiment-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .sentiment-negative .sentiment-dot { background: var(--critical); }
  .sentiment-neutral .sentiment-dot { background: var(--text-muted); }
  .sentiment-positive .sentiment-dot { background: var(--success); }

  /* Insight Cards */
  .insights-section {
    margin-bottom: 32px;
  }

  .insights-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .insights-title {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .insight-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    position: relative;
    transition: var(--transition);
  }

  .insight-card:hover {
    box-shadow: var(--shadow-hover);
    border-color: var(--orange-glow);
  }

  .insight-card.quick_win { border-left: 4px solid var(--success); }
  .insight-card.investigate { border-left: 4px solid var(--orange); }
  .insight-card.strategic { border-left: 4px solid #6366F1; }
  .insight-card.monitor { border-left: 4px solid var(--medium); }

  .insight-type {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .insight-type.quick_win { color: var(--success); }
  .insight-type.investigate { color: var(--orange); }
  .insight-type.strategic { color: #6366F1; }
  .insight-type.monitor { color: var(--medium); }

  .insight-card-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .insight-description {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .insight-action {
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .insight-action-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .insight-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .insight-badges {
    display: flex;
    gap: 8px;
  }

  .insight-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .insight-badge.impact-high { background: #FEF2F2; color: var(--critical); }
  .insight-badge.impact-medium { background: #FFF7ED; color: var(--orange); }
  .insight-badge.impact-low { background: #F9FAFB; color: var(--low); }

  .insight-badge.effort-high { background: #FEF2F2; color: var(--critical); }
  .insight-badge.effort-medium { background: #FFFBEB; color: var(--medium); }
  .insight-badge.effort-low { background: #ECFDF5; color: var(--success); }

  .insight-dismiss {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: var(--transition);
  }

  .insight-dismiss:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .insight-related {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-light);
  }

  .insight-related-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .insight-related-count {
    font-size: 12px;
    color: var(--orange);
    cursor: pointer;
  }

  /* Priority Selector */
  .priority-selector {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .priority-select {
    padding: 4px 22px 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid transparent;
    appearance: none;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 4px center;
  }

  .priority-select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .priority-select.critical { background-color: var(--critical-bg); color: var(--critical); }
  .priority-select.high { background-color: var(--high-bg); color: var(--high); }
  .priority-select.medium { background-color: var(--medium-bg); color: var(--medium); }
  .priority-select.low { background-color: var(--low-bg); color: var(--low); }

  .priority-override-badge {
    font-size: 9px;
    color: var(--accent);
    margin-left: 4px;
    cursor: help;
  }

  .priority-reset {
    margin-left: 4px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
  }

  .priority-reset:hover {
    color: var(--accent);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header { padding: 12px 16px; }
    .main { padding: 16px; }
    .logo-tagline { display: none; }
    .nav { overflow-x: auto; }
  }

  /* Chat Widget */
  .chat-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(246, 130, 31, 0.3);
    transition: var(--transition);
    z-index: 1000;
  }

  .chat-fab:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(246, 130, 31, 0.4);
  }

  .chat-fab svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .chat-panel {
    position: fixed;
    bottom: 96px;
    right: 24px;
    width: 380px;
    max-height: 500px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: none;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
  }

  .chat-panel.open {
    display: flex;
  }

  .chat-header {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-secondary);
  }

  .chat-header-title {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chat-header-title svg {
    color: var(--accent);
  }

  .chat-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 4px;
    border-radius: 4px;
  }

  .chat-close:hover {
    background: var(--bg-card);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 340px;
  }

  .chat-message {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.5;
    max-width: 85%;
  }

  .chat-message.user {
    background: var(--accent);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }

  .chat-message.assistant {
    background: var(--bg-secondary);
    color: var(--text-primary);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }

  .chat-message.typing {
    background: var(--bg-secondary);
    color: var(--text-muted);
  }

  .chat-input-container {
    padding: 12px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 8px;
  }

  .chat-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    resize: none;
  }

  .chat-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .chat-send {
    padding: 10px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: var(--transition);
  }

  .chat-send:hover {
    box-shadow: var(--shadow-hover);
  }

  .chat-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-suggestions {
    padding: 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chat-suggestion {
    padding: 6px 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
  }

  .chat-suggestion:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  @media (max-width: 640px) {
    .chat-panel {
      width: calc(100% - 32px);
      right: 16px;
      bottom: 88px;
    }
  }
`;

// SVG Icons
const ICONS = {
  github: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>',
  reddit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
  csv: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  discord: '<svg viewBox="0 -28.5 256 256" width="20" height="20" fill="currentColor"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/></svg>',
  email: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  download: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
  zap: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  target: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  undo: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.02l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>',
};

function getInsightTypeIcon(type: string): string {
  switch (type) {
    case 'quick_win': return ICONS.zap;
    case 'investigate': return ICONS.search;
    case 'strategic': return ICONS.target;
    case 'monitor': return ICONS.eye;
    default: return ICONS.lightbulb;
  }
}

function formatInsightType(type: string): string {
  switch (type) {
    case 'quick_win': return 'Quick Win';
    case 'investigate': return 'Investigate';
    case 'strategic': return 'Strategic';
    case 'monitor': return 'Monitor';
    default: return type;
  }
}

function getSourceIcon(source: FeedbackSource): string {
  switch (source) {
    case 'github': return ICONS.github;
    case 'reddit': return ICONS.reddit;
    case 'csv': return ICONS.csv;
    default: return '';
  }
}

function getPriorityClass(priority: Priority): string {
  return `priority priority-${priority}`;
}

function getStatusClass(status: IssueStatus): string {
  return `status status-${status}`;
}

function formatStatus(status: IssueStatus): string {
  switch (status) {
    case 'new': return 'New';
    case 'in_review': return 'In Review';
    case 'in_progress': return 'In Progress';
    case 'done': return 'Done';
    default: return status;
  }
}

function formatPriority(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Page Renderers
function renderHeader(activeTab: string): string {
  const tabs = [
    { id: 'sources', label: 'Sources' },
    { id: 'issues', label: 'Issues' },
    { id: 'actions', label: 'Actions' },
  ];

  return `
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-text"><span class="logo-accent">R</span>elay</span>
        </div>
        <nav class="nav">
          ${tabs.map(tab => `
            <a href="/?tab=${tab.id}" class="nav-link ${activeTab === tab.id ? 'active' : ''}">${tab.label}</a>
          `).join('')}
        </nav>
      </div>
    </header>
  `;
}

function renderSourcesPage(sources: ConnectedSource[]): string {
  return `
    <div class="page-title">Sources</div>
    <p class="page-subtitle">Connect feedback sources to analyze</p>

    <div class="grid grid-3" style="margin-bottom: 24px;">
      <!-- GitHub Card -->
      <div class="source-card">
        <div class="source-header">
          <div class="source-icon github">${ICONS.github}</div>
          <div>
            <div class="source-name">GitHub</div>
            <div class="source-desc">Import open issues</div>
          </div>
        </div>
        <form action="/api/sources/github" method="POST" onsubmit="showLoading(this)">
          <div class="form-group">
            <label class="form-label">Repository</label>
            <input type="text" name="repo" class="form-input" placeholder="owner/repo" required>
          </div>
          <input type="hidden" name="limit" value="100">
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Import
          </button>
        </form>
      </div>

      <!-- Reddit Card -->
      <div class="source-card">
        <div class="source-header">
          <div class="source-icon reddit">${ICONS.reddit}</div>
          <div>
            <div class="source-name">Reddit</div>
            <div class="source-desc">Import subreddit posts</div>
          </div>
        </div>
        <form action="/api/sources/reddit" method="POST" onsubmit="showLoading(this)">
          <div class="form-group">
            <label class="form-label">Subreddit</label>
            <input type="text" name="subreddit" class="form-input" placeholder="webdev" required>
          </div>
          <input type="hidden" name="limit" value="50">
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Import
          </button>
        </form>
      </div>

      <!-- CSV Card -->
      <div class="source-card">
        <div class="source-header">
          <div class="source-icon csv">${ICONS.csv}</div>
          <div>
            <div class="source-name">CSV</div>
            <div class="source-desc">Upload feedback file</div>
          </div>
        </div>
        <form action="/api/sources/csv" method="POST" enctype="multipart/form-data" onsubmit="showLoading(this)">
          <div class="form-group">
            <label class="form-label">File</label>
            <label class="file-upload">
              <input type="file" name="file" accept=".csv" required onchange="this.closest('form').querySelector('.file-upload-text').textContent = this.files[0]?.name || 'Choose file...'">
              <div class="file-upload-text">Choose file...</div>
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Upload
          </button>
        </form>
      </div>

      <!-- Discord Card (Coming Soon) -->
      <div class="source-card coming-soon">
        <div class="source-header">
          <div class="source-icon discord">${ICONS.discord}</div>
          <div>
            <div class="source-name">Discord</div>
            <div class="source-desc">Import server messages</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Server ID</label>
          <input type="text" class="form-input" placeholder="discord.gg/..." disabled>
        </div>
        <button class="btn btn-primary" style="width: 100%;" disabled>
          Connect
        </button>
      </div>

      <!-- Email/Tickets Card (Coming Soon) -->
      <div class="source-card coming-soon">
        <div class="source-header">
          <div class="source-icon email">${ICONS.email}</div>
          <div>
            <div class="source-name">Email Tickets</div>
            <div class="source-desc">Import support tickets</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Inbox</label>
          <input type="text" class="form-input" placeholder="support@..." disabled>
        </div>
        <button class="btn btn-primary" style="width: 100%;" disabled>
          Connect
        </button>
      </div>

      <!-- X/Twitter Card (Coming Soon) -->
      <div class="source-card coming-soon">
        <div class="source-header">
          <div class="source-icon twitter">${ICONS.twitter}</div>
          <div>
            <div class="source-name">X / Twitter</div>
            <div class="source-desc">Import mentions & replies</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Handle</label>
          <input type="text" class="form-input" placeholder="@username" disabled>
        </div>
        <button class="btn btn-primary" style="width: 100%;" disabled>
          Connect
        </button>
      </div>
    </div>

    <script>
      function showLoading(form) {
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;display:inline-block;animation:spin 0.8s linear infinite;margin-right:6px;"></span>Loading';
      }
    </script>

    <!-- Connected Sources -->
    ${sources.length > 0 ? `
      <div class="card">
        <div class="card-title">Connected</div>
        ${sources.map(source => {
          const config = JSON.parse(source.config);
          let name = source.type;
          if (source.type === 'github') name = config.owner + '/' + config.repo;
          else if (source.type === 'reddit') name = 'r/' + config.subreddit;
          else if (source.type === 'csv') name = config.filename || 'CSV';

          return `
            <div class="connected-source">
              <div class="connected-source-info">
                <div class="connected-source-icon source-icon ${source.type}">${getSourceIcon(source.type as FeedbackSource)}</div>
                <div>
                  <div class="connected-source-name">${name}</div>
                  <div class="connected-source-meta">${source.item_count} items</div>
                </div>
              </div>
              <div style="display: flex; gap: 4px;">
                <form action="/api/sources/${source.id}/sync" method="POST" style="display: inline;">
                  <button type="submit" class="btn btn-ghost btn-sm">${ICONS.refresh}</button>
                </form>
                <form action="/api/sources/${source.id}/delete" method="POST" style="display: inline;" onsubmit="return confirm('Remove source?')">
                  <button type="submit" class="btn btn-ghost btn-sm">${ICONS.trash}</button>
                </form>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 20px;">
        <form action="/api/analyze" method="POST" onsubmit="showLoading(this)">
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">
            Analyze
          </button>
        </form>
      </div>
    ` : ''}
  `;
}

function renderInsightsSection(insights: PMInsight[], issues: Issue[]): string {
  // No fake AI insights - the table IS the insight
  return '';
}

function renderIssuesPage(issues: Issue[], stats: DashboardStats | undefined, insights?: PMInsight[], summary?: QuickSummary): string {
  if (issues.length === 0) {
    return `
      <div class="page-title">Issues</div>
      <p class="page-subtitle">No issues yet</p>

      <div class="empty-state">
        <div class="empty-state-icon">—</div>
        <div class="empty-state-title">Import feedback first</div>
        <div class="empty-state-desc">Connect a source and run analysis</div>
        <a href="/?tab=sources" class="btn btn-primary">Sources</a>
      </div>
    `;
  }

  const byPriority = stats?.by_priority || { critical: 0, high: 0, medium: 0, low: 0 };

  return `
    <div class="page-title">Issues</div>
    <p class="page-subtitle">${issues.length} items analyzed</p>

    ${summary && summary.metrics.length > 0 ? `
    <!-- Summary -->
    <div class="summary-card">
      <div class="summary-headline">
        ${ICONS.zap}
        ${escapeHtml(summary.headline)}
      </div>
      <div class="summary-grid">
        ${summary.metrics.map(m => `
          <div class="summary-metric">
            <div class="summary-metric-value">${escapeHtml(m.value)}</div>
            <div class="summary-metric-label">${escapeHtml(m.label)}</div>
          </div>
        `).join('')}
      </div>
      <div class="summary-recommendation">
        ${ICONS.lightbulb}
        ${escapeHtml(summary.recommendation)}
      </div>
    </div>
    ` : ''}

    <!-- Stats -->
    <div class="grid grid-4" style="margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-value" style="color: var(--critical);">${byPriority.critical || 0}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--high);">${byPriority.high || 0}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--medium);">${byPriority.medium || 0}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--low);">${byPriority.low || 0}</div>
        <div class="stat-label">Low</div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <div class="actions-left">
        <div class="filters">
          <button class="filter-btn active" onclick="filterIssues('all')">All</button>
          <button class="filter-btn" onclick="filterIssues('critical')">Critical</button>
          <button class="filter-btn" onclick="filterIssues('high')">High</button>
          <button class="filter-btn" onclick="filterIssues('medium')">Medium</button>
          <button class="filter-btn" onclick="filterIssues('low')">Low</button>
        </div>
      </div>
      <div class="actions-right">
        <a href="/api/export?format=csv" class="btn btn-secondary btn-sm">${ICONS.download} Export CSV</a>
        <button class="btn btn-secondary btn-sm" onclick="toggleSharePanel()">${ICONS.share} Share</button>
      </div>
    </div>

    <!-- Share Panel -->
    <div id="sharePanel" class="share-panel" style="display: none;">
      <div class="share-panel-title">Share Issues</div>
      <div class="share-options">
        <a href="/api/export?format=csv" class="btn btn-secondary btn-sm">Export as CSV</a>
        <a href="/api/export?format=json" class="btn btn-secondary btn-sm">Export as JSON</a>
        <button class="btn btn-secondary btn-sm" onclick="copyShareLink()">Copy Link</button>
      </div>
    </div>

    <!-- Issues Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <table class="issues-table">
        <thead>
          <tr>
            <th style="width: 50%;">Issue</th>
            <th style="width: 15%;">Priority</th>
            <th style="width: 15%;">Status</th>
            <th style="width: 10%;">Source</th>
            <th style="width: 10%;"></th>
          </tr>
        </thead>
        <tbody>
          ${issues.map(issue => `
            <tr class="issue-row" data-priority="${issue.priority}" data-issue-id="${issue.id}">
              <td>
                <div class="issue-title">${escapeHtml(issue.title)}</div>
                <div class="issue-summary">${escapeHtml(issue.summary || '').slice(0, 120)}${(issue.summary || '').length > 120 ? '...' : ''}</div>
              </td>
              <td>
                <div class="priority-selector">
                  <select class="priority-select ${issue.priority}" onchange="updateIssuePriority('${issue.id}', this.value, this)">
                    <option value="critical" ${issue.priority === 'critical' ? 'selected' : ''}>Critical</option>
                    <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>Low</option>
                  </select>
                  ${issue.priority_override ? `
                    <button class="priority-reset" onclick="resetIssuePriority('${issue.id}')" title="Reset">
                      ${ICONS.undo}
                    </button>
                  ` : ''}
                </div>
              </td>
              <td>
                <select class="select" onchange="updateIssueStatus('${issue.id}', this.value)">
                  <option value="new" ${issue.status === 'new' ? 'selected' : ''}>New</option>
                  <option value="in_review" ${issue.status === 'in_review' ? 'selected' : ''}>Review</option>
                  <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>Progress</option>
                  <option value="done" ${issue.status === 'done' ? 'selected' : ''}>Done</option>
                </select>
              </td>
              <td>
                <span class="issue-source">
                  ${getSourceIcon(issue.source)}
                </span>
              </td>
              <td>
                ${issue.source_url ? `<a href="${escapeHtml(issue.source_url)}" target="_blank" class="issue-link">${ICONS.link}</a>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <script>
      function filterIssues(priority) {
        const rows = document.querySelectorAll('.issue-row');
        const btns = document.querySelectorAll('.filter-btn');

        btns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        rows.forEach(row => {
          if (priority === 'all' || row.dataset.priority === priority) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }

      function toggleSharePanel() {
        const panel = document.getElementById('sharePanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }

      function copyShareLink() {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied!');
      }

      function updateIssueStatus(issueId, status) {
        fetch('/api/issues/' + issueId + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).then(() => showToast('Status updated'));
      }

      function updateIssuePriority(issueId, priority, selectEl) {
        fetch('/api/issues/' + issueId + '/priority', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority })
        }).then(() => {
          // Update the select styling
          selectEl.className = 'priority-select ' + priority;
          // Update the row's data attribute for filtering
          selectEl.closest('tr').dataset.priority = priority;
          showToast('Priority updated');
        });
      }

      function resetIssuePriority(issueId) {
        fetch('/api/issues/' + issueId + '/priority/reset', {
          method: 'POST'
        }).then(() => {
          showToast('Priority reset to system value');
          window.location.reload();
        });
      }

      function dismissInsight(insightId) {
        fetch('/api/insights/' + insightId + '/dismiss', {
          method: 'POST'
        }).then(() => {
          const card = document.querySelector('[onclick*="' + insightId + '"]').closest('.insight-card');
          card.style.opacity = '0';
          setTimeout(() => card.remove(), 200);
          showToast('Insight dismissed');
        });
      }

      function filterByInsight(insightId) {
        // This could be enhanced to highlight related issues
        showToast('Filtering by insight...');
      }

      function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 200);
        }, 2000);
      }
    </script>
  `;
}

function renderActionsPage(issues: Issue[]): string {
  // Consistent color scheme with system
  const columns: { status: IssueStatus; label: string; color: string }[] = [
    { status: 'new', label: 'New', color: 'var(--text-muted)' },
    { status: 'in_review', label: 'In Review', color: 'var(--accent)' },
    { status: 'in_progress', label: 'In Progress', color: 'var(--medium)' },
    { status: 'done', label: 'Done', color: 'var(--success)' },
  ];

  const issuesByStatus: Record<IssueStatus, Issue[]> = {
    new: [],
    in_review: [],
    in_progress: [],
    done: [],
  };

  issues.forEach(issue => {
    if (issuesByStatus[issue.status]) {
      issuesByStatus[issue.status].push(issue);
    }
  });

  if (issues.length === 0) {
    return `
      <div class="page-title">Actions</div>
      <p class="page-subtitle">No issues yet</p>

      <div class="empty-state">
        <div class="empty-state-icon">—</div>
        <div class="empty-state-title">Nothing to track</div>
        <div class="empty-state-desc">Analyze feedback first</div>
        <a href="/?tab=sources" class="btn btn-primary">Sources</a>
      </div>
    `;
  }

  const doneCount = issuesByStatus.done.length;
  const progressPct = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : 0;

  return `
    <div class="page-title">Actions</div>
    <p class="page-subtitle">${issues.length} issues &middot; ${progressPct}% complete</p>

    <!-- Progress Overview -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="progress-overview">
        <div class="progress-bar-container">
          <div class="progress-bar">
            ${columns.map(col => {
              const count = issuesByStatus[col.status].length;
              const pct = issues.length > 0 ? (count / issues.length) * 100 : 0;
              return `<div class="progress-segment" style="width: ${pct}%; background: ${col.color};"></div>`;
            }).join('')}
          </div>
        </div>
        <div class="progress-legend">
          ${columns.map(col => `
            <span class="progress-legend-item">
              <span class="progress-dot" style="background: ${col.color};"></span>
              ${col.label}: ${issuesByStatus[col.status].length}
            </span>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban">
      ${columns.map(col => `
        <div class="kanban-column" data-status="${col.status}">
          <div class="kanban-header">
            <div class="kanban-title">
              <span class="progress-dot" style="background: ${col.color};"></span>
              ${col.label}
            </div>
            <span class="kanban-count">${issuesByStatus[col.status].length}</span>
          </div>
          ${issuesByStatus[col.status].map(issue => `
            <div class="kanban-item" draggable="true" data-issue-id="${issue.id}">
              <div class="kanban-item-title">${escapeHtml(issue.title).slice(0, 60)}${issue.title.length > 60 ? '...' : ''}</div>
              <div class="kanban-item-meta">
                <span class="${getPriorityClass(issue.priority)}" style="font-size: 11px; padding: 2px 8px;">${formatPriority(issue.priority)}</span>
                <span>${getSourceIcon(issue.source)}</span>
              </div>
            </div>
          `).join('')}
          ${issuesByStatus[col.status].length === 0 ? `
            <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">
              No issues
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <script>
      // Simple drag and drop
      document.querySelectorAll('.kanban-item').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', item.dataset.issueId);
          item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', e => {
          item.style.opacity = '1';
        });
      });

      document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', e => {
          e.preventDefault();
          col.style.background = 'var(--orange-light)';
        });
        col.addEventListener('dragleave', e => {
          col.style.background = '';
        });
        col.addEventListener('drop', e => {
          e.preventDefault();
          col.style.background = '';
          const issueId = e.dataTransfer.getData('text/plain');
          const newStatus = col.dataset.status;

          fetch('/api/issues/' + issueId + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          }).then(() => window.location.reload());
        });
      });
    </script>
  `;
}

function renderAnalyzingPage(progress: number, step: string): string {
  return `
    <div class="progress-container">
      <div class="page-title">Analyzing</div>
      <p class="page-subtitle" style="margin-bottom: 24px;">${step || 'Processing feedback...'}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%;"></div>
      </div>
      <p class="progress-text">${progress}%</p>
    </div>
    <script>
      setTimeout(() => window.location.reload(), 2000);
    </script>
  `;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderChatWidget(): string {
  return `
    <!-- AI Chat Widget -->
    <button class="chat-fab" onclick="toggleChat()" title="Ask AI about your feedback">
      ${ICONS.chat}
    </button>

    <div id="chatPanel" class="chat-panel">
      <div class="chat-header">
        <div class="chat-header-title">
          ${ICONS.sparkle}
          Ask about your feedback
        </div>
        <button class="chat-close" onclick="toggleChat()">
          ${ICONS.x}
        </button>
      </div>

      <div class="chat-suggestions">
        <button class="chat-suggestion" onclick="askQuestion('What are the top issues?')">Top issues</button>
        <button class="chat-suggestion" onclick="askQuestion('Summarize the feedback')">Summary</button>
        <button class="chat-suggestion" onclick="askQuestion('How are priorities computed?')">How it works</button>
        <button class="chat-suggestion" onclick="askQuestion('Any common patterns?')">Patterns</button>
      </div>

      <div id="chatMessages" class="chat-messages">
        <div class="chat-message assistant">
          Hi! I can help you analyze your feedback data. Ask me anything about priorities, trends, or patterns.
        </div>
      </div>

      <div class="chat-input-container">
        <input type="text" id="chatInput" class="chat-input" placeholder="Ask a question..." onkeypress="if(event.key==='Enter')sendMessage()">
        <button class="chat-send" onclick="sendMessage()">Send</button>
      </div>
    </div>

    <script>
      let chatHistory = [];

      function toggleChat() {
        const panel = document.getElementById('chatPanel');
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
          document.getElementById('chatInput').focus();
        }
      }

      function askQuestion(question) {
        document.getElementById('chatInput').value = question;
        sendMessage();
      }

      async function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        const messagesDiv = document.getElementById('chatMessages');

        // Add user message
        messagesDiv.innerHTML += '<div class="chat-message user">' + escapeForHtml(message) + '</div>';
        chatHistory.push({ role: 'user', content: message });
        input.value = '';

        // Add typing indicator
        const typingId = 'typing-' + Date.now();
        messagesDiv.innerHTML += '<div id="' + typingId + '" class="chat-message assistant typing">Thinking...</div>';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory.slice(-4) })
          });

          const data = await response.json();
          const aiResponse = data.response || 'Sorry, I could not process that.';

          // Remove typing indicator and add response
          document.getElementById(typingId).remove();
          messagesDiv.innerHTML += '<div class="chat-message assistant">' + escapeForHtml(aiResponse) + '</div>';
          chatHistory.push({ role: 'assistant', content: aiResponse });
        } catch (error) {
          document.getElementById(typingId).remove();
          messagesDiv.innerHTML += '<div class="chat-message assistant">Sorry, something went wrong. Please try again.</div>';
        }

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }

      function escapeForHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }
    </script>
  `;
}

// Main HTML Generator
export function generateHTML(
  activeTab: string,
  data: PageData,
  analyzing?: { progress: number; step: string }
): string {
  let content = '';

  if (analyzing) {
    content = renderAnalyzingPage(analyzing.progress, analyzing.step);
  } else {
    switch (activeTab) {
      case 'sources':
        content = renderSourcesPage(data.sources || []);
        break;
      case 'issues':
        content = renderIssuesPage(data.issues || [], data.stats, data.insights, data.summary);
        break;
      case 'actions':
        content = renderActionsPage(data.issues || []);
        break;
      default:
        content = renderSourcesPage(data.sources || []);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relay - Relay feedback into insights</title>
  <style>${STYLES}</style>
</head>
<body>
  ${renderHeader(activeTab)}
  <main class="main">
    ${content}
  </main>
  ${renderChatWidget()}
</body>
</html>`;
}
