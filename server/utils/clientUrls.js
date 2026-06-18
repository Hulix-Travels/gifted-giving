/**
 * Build client URLs with sensitive tokens in the hash fragment so they are not
 * sent to the server or third-party referrers on page load.
 */
function buildClientUrl(path, token) {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${safePath}#token=${encodeURIComponent(token)}`;
}

module.exports = { buildClientUrl };
