'use client';

import Image from 'next/image';
import { getImageUrl, generateSrcSet } from '@/lib/media';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * OptimizedImage - Automatically uses Cloudinary when configured
 * Falls back to local paths during development
 */
export function OptimizedImage({
  src,
  alt,
  width = 800,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
}: OptimizedImageProps) {
  const formatOpts =
    /\.webp$/i.test(src)
      ? ({ format: 'webp' as const })
      : /\.(jpe?g)$/i.test(src)
        ? ({ format: 'jpg' as const })
        : undefined;
  const optimizedSrc = getImageUrl(src, width, formatOpts);
  const srcSet = generateSrcSet(src, [640, 750, 828, 1080, 1200, 1920], formatOpts);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height || width * 0.56} // Default 16:9 aspect ratio
      className={className}
      priority={priority}
      sizes={sizes}
      quality={90}
    />
  );
}
