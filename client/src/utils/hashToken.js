/**
 * Read a token from the URL hash (preferred) or query string (legacy email links).
 */
export function getTokenFromUrl() {
  const hash = window.location.hash?.replace(/^#/, '');
  if (hash) {
    const fromHash = new URLSearchParams(hash).get('token');
    if (fromHash) return fromHash;
  }
  return new URLSearchParams(window.location.search).get('token');
}

/** Remove token from the address bar after it has been consumed. */
export function clearTokenFromUrl(pathname = window.location.pathname) {
  window.history.replaceState(null, '', pathname);
}
