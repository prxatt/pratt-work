const ABS_URL_RE = /^https?:\/\//i;
const BLOB = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  'https://b8irodxhw2qbsjk2.public.blob.vercel-storage.com'
).replace(/\/+$/, '');

function toBlobUrl(localPath: string): string {
  const trimmed = localPath.trim();
  if (trimmed.startsWith('//') || ABS_URL_RE.test(trimmed)) return localPath;
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BLOB}${normalized}`;
}

function normalizeImagePath(localPath: string): string {
  return localPath.replace(/\.(jpe?g|png|avif)$/i, '.webp');
}

function normalizeVideoPath(localPath: string): string {
  return localPath.replace(/\.(webm|mov|m4v)$/i, '.mp4');
}

export function getImageUrl(
  localPath: string,
  _width?: number,
  _options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  }
): string {
  return toBlobUrl(normalizeImagePath(localPath));
}

export function getVideoUrl(
  localPath: string,
  _format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  return toBlobUrl(normalizeVideoPath(localPath));
}

export function getMediaUrl(
  localPath: string,
  _options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'mp4' | 'webm';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string {
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(localPath);
  return isVideo
    ? toBlobUrl(normalizeVideoPath(localPath))
    : toBlobUrl(normalizeImagePath(localPath));
}

export function generateSrcSet(
  localPath: string,
  widths: number[] = [640, 828, 1080, 1920],
  _options?: { quality?: 'auto' | number; format?: 'auto' | 'webp' | 'avif' | 'jpg' }
): string {
  const src = toBlobUrl(normalizeImagePath(localPath));
  return widths.map((w) => `${src} ${w}w`).join(', ');
}
