/**
 * Cloudinary Media Path Utility
 * 
 * Automatically routes media requests to Cloudinary CDN instead of local files.
 * Falls back to local paths during development or if Cloudinary is not configured.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_BASE_URL = CLOUDINARY_CLOUD_NAME
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : '';
const CLOUDINARY_VIDEO_URL = CLOUDINARY_CLOUD_NAME
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`
  : '';

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
    format?: 'auto' | 'webp' | 'avif' | 'mp4' | 'webm';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string {
  // If Cloudinary not configured, return local path
  if (!CLOUDINARY_CLOUD_NAME) {
    return localPath;
  }

  // Extract filename from path
  const filename = localPath.split('/').pop();
  if (!filename) return localPath;

  const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
  const baseUrl = isVideo ? CLOUDINARY_VIDEO_URL : CLOUDINARY_BASE_URL;

  // Build transformation string
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

  // Add optimization defaults for images
  if (!isVideo && transformations.length === 0) {
    transformations.push('q_auto', 'f_auto');
  }

  const transformString = transformations.join(',');
  const folder = isVideo ? 'videos' : 'images';
  
  return `${baseUrl}/${transformString ? transformString + '/' : ''}${folder}/${filename}`;
}

/**
 * Get optimized image URL with responsive sizing
 */
export function getImageUrl(
  localPath: string,
  width?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif';
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
    ? (localPath.endsWith('.webm') ? 'webm' : 'mp4')
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
  options?: { quality?: 'auto' | number }
): string {
  return widths
    .map(w => `${getImageUrl(localPath, w, options)} ${w}w`)
    .join(', ');
}
