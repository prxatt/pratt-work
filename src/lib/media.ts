const ABS_URL_RE = /^https?:\/\//i;
const ROOT_PATH_RE = /^\//;
const MEDIA_BASE =
  (
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL ||
    ''
  ).trim().replace(/\/+$/, '');

/** Expects trimmed input for relative paths. */
function toBlobUrl(trimmedLocalPath: string): string {
  if (trimmedLocalPath.startsWith('//') || ABS_URL_RE.test(trimmedLocalPath)) {
    return trimmedLocalPath;
  }
  const isRootRelative = ROOT_PATH_RE.test(trimmedLocalPath);
  const normalized = isRootRelative ? trimmedLocalPath : `/${trimmedLocalPath}`;
  // Root-relative paths are files under public/. Serve from same-origin first
  // to avoid unnecessary Vercel Blob transfer and quota exhaustion.
  if (isRootRelative) return normalized;
  // No hardcoded blob bucket fallback: if env is absent/misconfigured, keep
  // same-origin URLs so media still resolves in local/dev and can be verified.
  if (!MEDIA_BASE) return normalized;
  return `${MEDIA_BASE}${normalized}`;
}

/** Expects trimmed input. */
function normalizeImagePath(
  localPath: string,
  format: 'auto' | 'webp' | 'avif' | 'jpg' = 'auto'
): string {
  if (localPath.startsWith('//') || ABS_URL_RE.test(localPath)) return localPath;
  if (localPath.startsWith('/')) return localPath;
  if (format === 'auto') return localPath;
  // For non-root-relative dynamic paths only.
  if (format === 'jpg') return localPath.replace(/\.(png|webp|avif)(?=\?|#|$)/i, '.jpg');
  return localPath.replace(/\.(jpe?g|png|webp|avif)(?=\?|#|$)/i, `.${format}`);
}

/** Expects trimmed input. */
function normalizeVideoPath(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  if (localPath.startsWith('//') || ABS_URL_RE.test(localPath)) return localPath;
  if (localPath.startsWith('/')) return localPath;
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

/**
 * Prefer same-origin `/...` URLs for files in `public/` to avoid Vercel Blob
 * traffic; falls back to `getImageUrl` for CDN-backed paths.
 */
export function resolveWorkImageSrc(
  localPath: string,
  _width?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  }
): string {
  const t = localPath.trim();
  if (t.startsWith('/') && !t.startsWith('//')) return t;
  return getImageUrl(t, _width, options);
}

export function getVideoUrl(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  const t = localPath.trim();
  return toBlobUrl(normalizeVideoPath(t, format));
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
