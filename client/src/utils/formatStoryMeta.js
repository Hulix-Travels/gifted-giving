export function formatStoryDate(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

export function formatStoryAttribution(story) {
  const parts = [];
  if (story?.location?.trim()) parts.push(story.location.trim());
  const dateLabel = formatStoryDate(story?.date);
  if (dateLabel) parts.push(dateLabel);
  return parts.join(' · ');
}
