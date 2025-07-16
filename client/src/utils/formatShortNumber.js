// Shared utility to format numbers as K/M (e.g., 10K+, 1.2M+)
export default function formatShortNumber(num) {
  if (num == null || isNaN(num)) return '—';
  if (typeof num === 'string') num = parseFloat(num.replace(/[^\d.]/g, ''));
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toLocaleString();
} 