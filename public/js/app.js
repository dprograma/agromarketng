/* ──────────────────────────────────────────────────────────
   AgroMarket Social — Shared JS Utilities
   ────────────────────────────────────────────────────────── */

/**
 * Fetch wrapper that throws on non-OK responses.
 */
async function apiFetch(url, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await fetch(url, { ...defaults, ...options,
    headers: { ...defaults.headers, ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Determine badge color class from status string.
 */
function statusColor(status) {
  const map = {
    pending: 'pending',
    approved: 'approved',
    sent: 'sent',
    partially_sent: 'partially_sent',
    failed: 'failed',
    skipped: 'skipped',
    posted: 'posted',
  };
  return map[status] || 'pending';
}

/**
 * Format an ISO datetime string in a friendly way (Lagos timezone).
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Show a brief toast notification.
 */
let toastTimer;
function showToast(message, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = `toast visible${type === 'error' ? ' error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
}

/**
 * Capitalize first letter.
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Escape HTML special chars.
 */
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
