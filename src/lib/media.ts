/**
 * Cloudinary Media Path Utility
 * 
 * Automatically routes media requests to Cloudinary CDN instead of local files.
 * Throws in development if env var missing. Preserves directory structure.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

function getCloudName(): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('[media.ts] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Add it to .env.local');
    }
    return '';
  }
  return CLOUDINARY_CLOUD_NAME;
}

/** Cloudinary folder segments use Title Case (e.g. Work, Recognition). */
function titleCaseSegment(segment: string): string {
  if (!segment) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

function isImagesOrVideosFolder(segment: string): boolean {
  const s = segment.toLowerCase();
  return s === 'images' || s === 'image' || s === 'videos' || s === 'video';
}

/**
 * Get optimized media URL
 * @param localPath - Original path like '/work/video.mp4'. `/awards/…` is treated as
 *   Recognition on Cloudinary (same home-page section); local fallback still uses `/awards/…`.
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
  // Already a remote URL — do not treat protocol/host as path segments (or double-wrap Cloudinary)
  if (trimmed.startsWith('//') || /^https?:\/\//i.test(trimmed)) {
    return localPath;
  }

  const cloudName = getCloudName();
  if (!cloudName) return localPath;

  const segments = localPath.split('/').filter(Boolean);
  if (segments.length === 0) return localPath;

  const filename = segments[segments.length - 1]!;
  const rawDirSegments = segments.slice(0, -1);
  // Home-page "awards" tiles use `/awards/…` in code but live under Recognition in Cloudinary.
  const dirSegments =
    rawDirSegments.length > 0 && rawDirSegments[0].toLowerCase() === 'awards'
      ? ['recognition', ...rawDirSegments.slice(1)]
      : rawDirSegments;
  const isVideo = /\.(mp4|webm|mov)$/i.test(filename);

  // Cloudinary library layout: category folders contain `Images` and `Videos` subfolders
  // (e.g. `Work/Images/…`, `Recognition/Images/…`), while local `public/` uses flat `/work/…`.
  // Map `/work/a.webp` → `Work/Images/a.webp`, `/work/a.webm` → `Work/Videos/a.webm`.
  // If the path already ends with `images`/`videos` (or `/videos/…` at repo root), do not duplicate.
  let cloudPath: string;
  if (dirSegments.length === 0) {
    cloudPath = filename;
  } else {
    const titledDirs = dirSegments.map(titleCaseSegment);
    const lastRaw = dirSegments[dirSegments.length - 1]!;
    const mediaSubfolder = isVideo ? 'Videos' : 'Images';
    const alreadyTyped = isImagesOrVideosFolder(lastRaw);
    cloudPath = alreadyTyped
      ? [...titledDirs, filename].join('/')
      : [...titledDirs, mediaSubfolder, filename].join('/');
  }

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
    crop: 'limit', // Don't upscale
  });
}

/**
 * Get video URL with format optimization
 * Preserves original format (webm/mp4) when format='auto'
 */
export function getVideoUrl(
  localPath: string,
  format: 'auto' | 'mp4' | 'webm' = 'auto'
): string {
  // If format is auto, preserve the original file extension
  const detectedFormat = format === 'auto' 
    ? (localPath.toLowerCase().split('?')[0].endsWith('.webm') ? 'webm' : 'mp4')
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
    .map(w => `${getImageUrl(localPath, w, options)} ${w}w`)
    .join(', ');
}
