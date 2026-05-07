/**
 * Cloudinary-first media delivery.
 * Falls back to local paths only when explicitly disabled.
 */
const MEDIA_OFF_RE = /^(off|0|false)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)$/i;
const ABS_URL_RE = /^https?:\/\//i;
const MEDIA_OFF = MEDIA_OFF_RE.test((process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA || '').trim());
const CLOUD =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()) ||
  'dj0n7b4ma';

const baseImg = () => `https://res.cloudinary.com/${CLOUD}/image/upload`;
const baseVid = () => `https://res.cloudinary.com/${CLOUD}/video/upload`;

function normalizeFilenameExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return filename;
  return filename.slice(0, dot) + filename.slice(dot).toLowerCase();
}

function toCloudinaryPath(localPath: string, isVideo: boolean): string {
  const parts = localPath.split('/').filter(Boolean);
  const filename = normalizeFilenameExtension(parts[parts.length - 1]!);
  const dir = parts.slice(0, -1);
  const subfolder = isVideo ? 'videos' : 'images';

  if (dir.length > 0 && dir[dir.length - 1] === subfolder) {
    return [...dir, filename].join('/');
  }
  return [...dir, subfolder, filename].join('/');
}

function useLocal(localPath: string): boolean {
  const t = localPath.trim();
  return MEDIA_OFF || t.startsWith('//') || ABS_URL_RE.test(t);
}

export function getImageUrl(
  localPath: string,
  width?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  }
): string {
  return getMediaUrl(localPath, {
    width,
    quality: options?.quality ?? 'auto',
    format: options?.format ?? 'auto',
    crop: 'limit',
  });
}

/**
 * Prefer same-origin `/...` URLs for files in `public/` to avoid Vercel Blob
 * traffic; falls back to `getImageUrl` for CDN-backed paths.
 */
export function resolveWorkImageSrc(
  localPath: string,
  width?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  }
): string {
  return getImageUrl(localPath, width, options);
}

export function getVideoUrl(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  const trimmed = localPath.trim();
  if (useLocal(trimmed)) return localPath;

  const f: 'mp4' | 'webm' =
    format === 'auto' ? (/\.webm$/i.test(trimmed) ? 'webm' : 'mp4') : format;

  const path = toCloudinaryPath(trimmed, true);
  return `${baseVid()}/q_auto,f_${f}/${path}`;
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
  const trimmed = localPath.trim();
  if (useLocal(trimmed)) return localPath;

  const filename = normalizeFilenameExtension(trimmed.split('/').filter(Boolean).pop() || '');
  const isVideo = VIDEO_EXT_RE.test(filename);

  if (isVideo) {
    const path = toCloudinaryPath(trimmed, true);
    const transforms: string[] = [];
    if (options.quality === 'auto' || options.quality === undefined) transforms.push('q_auto');
    else if (typeof options.quality === 'number') transforms.push(`q_${options.quality}`);

    const f: 'mp4' | 'webm' =
      options.format === 'webm' || options.format === 'mp4'
        ? options.format
        : /\.webm$/i.test(trimmed)
          ? 'webm'
          : 'mp4';
    transforms.push(`f_${f}`);
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    return `${baseVid()}/${transforms.join(',')}/${path}`;
  }

  const path = toCloudinaryPath(trimmed, false);
  const transforms: string[] = [];
  const q = options.quality ?? 'auto';
  if (q === 'auto') transforms.push('q_auto');
  else transforms.push(`q_${q}`);
  const fmt = options.format ?? 'auto';
  if (fmt === 'auto') transforms.push('f_auto');
  else transforms.push(`f_${fmt}`);
  if (options.width) transforms.push(`w_${options.width}`, 'c_limit');
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop && !options.width) transforms.push(`c_${options.crop}`);
  return `${baseImg()}/${transforms.join(',')}/${path}`;
}

export function generateSrcSet(
  localPath: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  options?: { quality?: 'auto' | number; format?: 'auto' | 'webp' | 'avif' | 'jpg' }
): string {
  return widths.map((w) => `${getImageUrl(localPath, w, options)} ${w}w`).join(', ');
}
