/**
 * Cloudinary media URLs with safe fallbacks.
 *
 * Layout this site expects (matches a typical Media Library):
 * - Local: flat under `public/` — e.g. `public/work/hero.webp`, `public/recognition/…`, `public/videos/…`.
 * - Cloudinary: nested type folders — `Work/Images/hero.webp`, `Work/Videos/hero.webm`,
 *   `Recognition/Images/…`, `Ventures/Images/…`, top-level `Videos/…` for `/videos/…` in code.
 *
 * Env:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME — required for CDN (trimmed). If empty, URLs stay local (/work/…).
 *   On Vercel, set it for every environment you deploy (Production and Preview); then redeploy so the
 *   client bundle is rebuilt with the value inlined.
 * - NEXT_PUBLIC_CLOUDINARY_MEDIA=off — force local paths even if cloud name is set (emergency / debugging).
 * - NEXT_PUBLIC_CLOUDINARY_PATH_STYLE (optional; default matches the folders above):
 *   - nested_title — DEFAULT. `/work/a.webp` → `Work/Images/a.webp`, `/work/a.webm` → `Work/Videos/a.webm`.
 *   - nested — same shape but lowercase folders (`work/images/…`). Use only if your CDN public_ids are lowercase.
 *   - mirror — public_id is exactly the path under `public/` (e.g. `work/a.webp`) with NO extra Images/Videos
 *     segment. Use ONLY if you uploaded flat; wrong for Work/Images layouts → 404.
 */

const MEDIA_OFF_RE = /^(off|0|false)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v)$/i;
const ABS_URL_RE = /^https?:\/\//i;

type PathStyle = 'mirror' | 'nested' | 'nested_title';

function getPathStyle(): PathStyle {
  const raw = (process.env.NEXT_PUBLIC_CLOUDINARY_PATH_STYLE ?? 'nested_title').trim();
  const v = raw.toLowerCase().replace(/-/g, '_');
  if (v === 'mirror' || v === 'nested' || v === 'nested_title') return v;
  return 'nested_title';
}

function getCloudName(): string {
  const raw = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();
  const mediaOff = MEDIA_OFF_RE.test((process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA || '').trim());
  if (mediaOff || !raw) {
    if (!mediaOff && !raw && process.env.NODE_ENV === 'development') {
      throw new Error(
        '[media.ts] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Add it to .env.local, or set NEXT_PUBLIC_CLOUDINARY_MEDIA=off to use local files.'
      );
    }
    return '';
  }
  return raw;
}

function titleCaseSegment(segment: string): string {
  if (!segment) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

function isImagesOrVideosFolder(segment: string): boolean {
  const s = segment.toLowerCase();
  return s === 'images' || s === 'image' || s === 'videos' || s === 'video';
}

/** Lowercase only the file extension so `.MP4` / `.WEBP` match Cloudinary public_ids. */
function normalizeFilenameExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return filename;
  return filename.slice(0, dot) + filename.slice(dot).toLowerCase();
}

/**
 * Build Cloudinary public_id (folder + filename, slashes, no leading slash).
 */
function buildCloudinaryPublicId(segments: string[], isVideo: boolean, pathStyle: PathStyle): string {
  const filename = segments[segments.length - 1]!;
  const dirSegments = segments.slice(0, -1);

  if (pathStyle === 'mirror') {
    return segments.join('/');
  }

  if (dirSegments.length === 0) {
    return filename;
  }

  const useTitle = pathStyle === 'nested_title';
  const normDir = (s: string) => (useTitle ? titleCaseSegment(s) : s.toLowerCase());
  const titledDirs = dirSegments.map(normDir);
  const lastRaw = dirSegments[dirSegments.length - 1]!;
  const mediaSubfolder = isVideo
    ? useTitle
      ? 'Videos'
      : 'videos'
    : useTitle
      ? 'Images'
      : 'images';
  const alreadyTyped = isImagesOrVideosFolder(lastRaw);
  return alreadyTyped
    ? [...titledDirs, filename].join('/')
    : [...titledDirs, mediaSubfolder, filename].join('/');
}

/**
 * Get optimized media URL
 * @param localPath - Original path like '/work/video.mp4'
 * @param options - Cloudinary transformation options
 * @returns CDN URL or local fallback
 */
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
  if (trimmed.startsWith('//') || ABS_URL_RE.test(trimmed)) {
    return localPath;
  }

  const cloudName = getCloudName();
  if (!cloudName) return localPath;

  const segments = localPath.split('/').filter(Boolean);
  if (segments.length === 0) return localPath;

  const rawFilename = segments[segments.length - 1]!;
  const filename = normalizeFilenameExtension(rawFilename);
  const normSegments = [...segments.slice(0, -1), filename];
  const isVideo = VIDEO_EXT_RE.test(filename);
  const pathStyle = getPathStyle();
  const cloudPath = buildCloudinaryPublicId(normSegments, isVideo, pathStyle);

  const baseUrl = `https://res.cloudinary.com/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;

  const transformations: string[] = [];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality === 'auto') transformations.push('q_auto');
  if (options.quality && typeof options.quality === 'number') {
    transformations.push(`q_${options.quality}`);
  }
  if (options.format === 'auto') transformations.push('f_auto');
  if (options.format && options.format !== 'auto') {
    transformations.push(`f_${options.format}`);
  }
  if (!isVideo && transformations.length === 0) {
    transformations.push('q_auto', 'f_auto');
  }

  const transformString = transformations.join(',');
  return `${baseUrl}/${transformString ? transformString + '/' : ''}${cloudPath}`;
}

/**
 * Get optimized image URL with responsive sizing.
 * Omit `format` (default `f_auto`) for plain `<img>` / `next/image` so Cloudinary can negotiate AVIF/WebP.
 * Pass explicit `format` only for `<picture><source type="image/webp|jpeg">` legs so URLs match MIME.
 */
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
 * Get video URL with format optimization
 */
export function getVideoUrl(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  const detectedFormat =
    format === 'auto'
      ? localPath.toLowerCase().split('?')[0].endsWith('.webm')
        ? 'webm'
        : 'mp4'
      : format;

  return getMediaUrl(localPath, {
    format: detectedFormat,
    quality: 'auto',
  });
}

/**
 * Generate responsive srcSet for images
 */
export function generateSrcSet(
  localPath: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  options?: { quality?: 'auto' | number; format?: 'auto' | 'webp' | 'avif' | 'jpg' }
): string {
  return widths
    .map((w) => `${getImageUrl(localPath, w, options)} ${w}w`)
    .join(', ');
}
