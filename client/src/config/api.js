export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://gifted-givings.onrender.com/api');

export const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://www.giftedgivings.com');

/** Resolve program/upload image paths against the API origin */
export function getUploadUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads/')) {
    const base = API_BASE_URL.replace(/\/api$/, '');
    return `${base}${imagePath}`;
  }
  return imagePath;
}
