import formatShortNumber from './formatShortNumber';

/** Format a live stat for display with graceful fallback when API is unavailable */
export function formatStatValue(value, { loading, error, prefix = '', suffix = '' } = {}) {
  if (loading) return null;
  if (error || value == null) return '—';
  return `${prefix}${formatShortNumber(value)}${suffix}`;
}

export default formatStatValue;
