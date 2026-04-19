/**
 * Cloudinary Media Path Utility
 * 
 * Automatically routes media requests to Cloudinary CDN instead of local files.
 * Throws in development if env var missing. Preserves directory structure.
 */

function getCloudName(): string {
  const name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!name) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('[media.ts] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Add it to .env.local');
    }
    // In production, fall back gracefully rather than shipping broken URLs
    return '';
  }
  return name;
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
    format?: 'auto' | 'webp' | 'avif' | 'mp4' | 'webm';
    crop?: 'fill' | 'fit' | 'scale' | 'limit';
  } = {}
): string {
  const cloudName = getCloudName();
  if (!cloudName) {
    return localPath;
  }

  // Extract filename from path
  const filename = localPath.split('/').pop();
  if (!filename) return localPath;

  const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
  
  // Smart path builder — avoids doubling up folder names
  const lastSlashIndex = localPath.lastIndexOf('/');
  const dir = lastSlashIndex > 0 ? localPath.substring(1, lastSlashIndex) : '';

  // Only inject the subfolder if the directory doesn't already end with it
  const mediaSubfolder = isVideo ? 'videos' : 'images';
  const dirAlreadyHasSubfolder = dir.endsWith(mediaSubfolder);
  const cloudPath = dirAlreadyHasSubfolder
  const pathParts = localPath.split('/').filter(Boolean);
  pathParts.pop(); // Remove filename
  const mediaSubfolder = isVideo ? 'videos' : 'images';
  
  // Inject media subfolder if not already present as the parent directory
  if (pathParts[pathParts.length - 1] !== mediaSubfolder) {
    pathParts.push(mediaSubfolder);
  }
  const cloudPath = [...pathParts, filename].join('/');
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;

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
  options?: { quality?: 'auto' | number }
): string {
  return widths
    .map(w => `${getImageUrl(localPath, w, options)} ${w}w`)
    .join(', ');
}
