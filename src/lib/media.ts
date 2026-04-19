/**
 * Cloudinary media URLs with safe fallbacks.
 *
 * Env:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME — required for CDN (trimmed). If empty, URLs stay local (/work/…).
 * - NEXT_PUBLIC_CLOUDINARY_MEDIA=off — force local paths even if cloud name is set (emergency / debugging).
 * - NEXT_PUBLIC_CLOUDINARY_PATH_STYLE:
 *   - nested_title — default; /work/a.webp → Work/Images/a.webp (matches Media Library folders Work / Images).
 *   - nested — lowercase work/images/… (common for API uploads).
 *   - mirror — public_id = path under public/ (e.g. work/a.webp) when Cloudinary mirrors `public/` flat.
 */

const RAW_CLOUD_NAME = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();
const MEDIA_OFF =
  /^off|0|false$/i.test((process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA || '').trim());

const PATH_STYLE = (() => {
  const v = (process.env.NEXT_PUBLIC_CLOUDINARY_PATH_STYLE || 'nested_title').toLowerCase();
  if (v === 'mirror' || v === 'nested' || v === 'nested_title') return v;
  return 'nested_title';
})();

function getCloudName(): string {
  if (MEDIA_OFF || !RAW_CLOUD_NAME) {
    if (!MEDIA_OFF && !RAW_CLOUD_NAME && process.env.NODE_ENV === 'development') {
      throw new Error(
        '[media.ts] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Add it to .env.local, or set NEXT_PUBLIC_CLOUDINARY_MEDIA=off to use local files.'
      );
    }
    return '';
  }
  return RAW_CLOUD_NAME;
}

function titleCaseSegment(segment: string): string {
  if (!segment) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

function isImagesOrVideosFolder(segment: string): boolean {
  const s = segment.toLowerCase();
  return s === 'images' || s === 'image' || s === 'videos' || s === 'video';
}

/**
 * Build Cloudinary public_id (folder + filename, slashes, no leading slash).
 */
function buildCloudinaryPublicId(segments: string[], isVideo: boolean): string {
  const filename = segments[segments.length - 1]!;
  const dirSegments = segments.slice(0, -1);

  if (PATH_STYLE === 'mirror') {
    return segments.join('/');
  }

  if (dirSegments.length === 0) {
    return filename;
  }

  const useTitle = PATH_STYLE === 'nested_title';
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
  if (trimmed.startsWith('//') || /^https?:\/\//i.test(trimmed)) {
    return localPath;
  }

  const cloudName = getCloudName();
  if (!cloudName) return localPath;

  const segments = localPath.split('/').filter(Boolean);
  if (segments.length === 0) return localPath;

  const filename = segments[segments.length - 1]!;
  const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
  const cloudPath = buildCloudinaryPublicId(segments, isVideo);

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
 * Get optimized image URL with responsive sizing
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
