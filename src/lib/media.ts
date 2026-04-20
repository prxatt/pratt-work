const ABS_URL_RE = /^https?:\/\//i;
const BLOB = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  'https://b8irodxhw2qbsjk2.public.blob.vercel-storage.com'
).replace(/\/+$/, '');

/** Expects trimmed input for relative paths. */
function toBlobUrl(trimmedLocalPath: string): string {
  if (trimmedLocalPath.startsWith('//') || ABS_URL_RE.test(trimmedLocalPath)) {
    return trimmedLocalPath;
  }
  const normalized = trimmedLocalPath.startsWith('/') ? trimmedLocalPath : `/${trimmedLocalPath}`;
  return `${BLOB}${normalized}`;
}

/** Expects trimmed input. */
function normalizeImagePath(
  localPath: string,
  format: 'auto' | 'webp' | 'avif' | 'jpg' = 'auto'
): string {
  if (localPath.startsWith('//') || ABS_URL_RE.test(localPath)) return localPath;
  if (format === 'auto') return localPath;
  const nextExt = format === 'jpg' ? 'jpg' : format;
  return localPath.replace(/\.(jpe?g|png|webp|avif)(?=\?|#|$)/i, `.${nextExt}`);
}

/** Expects trimmed input. */
function normalizeVideoPath(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  if (localPath.startsWith('//') || ABS_URL_RE.test(localPath)) return localPath;
  if (format === 'mp4' || format === 'webm') {
    return localPath.replace(/\.(mp4|webm|mov|m4v)(?=\?|#|$)/i, `.${format}`);
  }
  return localPath.replace(/\.(mov|m4v)(?=\?|#|$)/i, '.mp4');
}

export function getImageUrl(
  localPath: string,
  _width?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  }
): string {
  const t = localPath.trim();
  return toBlobUrl(normalizeImagePath(t, options?.format ?? 'auto'));
}

export function getVideoUrl(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  const t = localPath.trim();
  return toBlobUrl(normalizeVideoPath(t, format));
}

/**
 * CDN URLs first, then same-origin `/public` paths, so `<video>` can recover when Blob is missing a file.
 * `stem` has no extension, e.g. `/videos/st-dd-prod`.
 */
export function getVideoFallbackChain(stem: string): string[] {
  const base = stem
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.(mp4|webm|mov|m4v)$/i, '');
  return [
    getVideoUrl(`${base}.webm`),
    getVideoUrl(`${base}.mp4`),
    `${base}.webm`,
    `${base}.mp4`,
  ];
}

export function getMediaUrl(
  localPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'mp4' | 'webm';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string {
  const t = localPath.trim();
  const isVideo = /\.(mp4|webm|mov|m4v)(?=\?|#|$)/i.test(t);
  return isVideo
    ? toBlobUrl(
        normalizeVideoPath(
          t,
          options.format === 'mp4' || options.format === 'webm' ? options.format : 'auto'
        )
      )
    : toBlobUrl(
        normalizeImagePath(
          t,
          options.format === 'webp' || options.format === 'avif' || options.format === 'jpg'
            ? options.format
            : 'auto'
        )
      );
}

export function generateSrcSet(
  localPath: string,
  widths: number[] = [640, 828, 1080, 1920],
  options?: { quality?: 'auto' | number; format?: 'auto' | 'webp' | 'avif' | 'jpg' }
): string {
  const t = localPath.trim();
  const src = toBlobUrl(normalizeImagePath(t, options?.format ?? 'auto'));
  return widths.map((w) => `${src} ${w}w`).join(', ');
}
