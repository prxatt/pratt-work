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
const PUBLIC_ID_MAP_RAW =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP?.trim()) ||
  '';

const baseImg = () => `https://res.cloudinary.com/${CLOUD}/image/upload`;
const baseVid = () => `https://res.cloudinary.com/${CLOUD}/video/upload`;

type PublicIdMap = Record<string, string>;

function parsePublicIdMap(raw: string): PublicIdMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: PublicIdMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === 'string' && typeof v === 'string' && k.trim() && v.trim()) {
        out[k.trim()] = v.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

// Local-path -> Cloudinary public_id overrides for assets uploaded with flat IDs.
// Env-based map wins over these defaults.
const STATIC_PUBLIC_ID_MAP: PublicIdMap = {
  '/work/crypt-demo.webm': 'crypt-demo_m1f5bj',
  '/work/crypt-demo.mp4': 'crypt-demo_m1f5bj',
  '/work/conference-wb.webp': 'conference-wb_pl0oic',
  '/work/conference-wb.jpg': 'conference-wb_pl0oic',
  '/work/keynote-wb.jpg': 'keynote-wb_p2tkr1',
  '/work/keynote-wb.webp': 'keynote-wb_p2tkr1',
  '/work/levis-collection.webp': 'levis-collection_nspzcf',
  '/work/levis-collection.jpg': 'levis-collection_nspzcf',
  '/work/saleforce-learn.webp': 'saleforce-learn_uw60jq',
  '/work/saleforce-learn.jpeg': 'saleforce-learn_uw60jq',
  '/work/surface-tension-thumb.mp4': 'surface-tension-thumb_pbgktp',
  '/work/surface-tension-thumb.webm': 'surface-tension-thumb_pbgktp',
  '/work/st-mobile.mp4': 'st-mobile_ffq9c2',
  '/work/st-mobile.webm': 'st-mobile_ffq9c2',
  '/work/st-mapped.mp4': 'st-mapped_lwwumz',
  '/work/st-mapped.webm': 'st-mapped_lwwumz',
  '/work/st-coffee.mp4': 'st-coffee_nhhaen',
  '/work/st-coffee.webm': 'st-coffee_nhhaen',
  '/work/st-create.mp4': 'st-create_gkc5ik',
  '/work/st-create.webm': 'st-create_gkc5ik',
  '/work/the-crypt-modal.mp4': 'the-crypt-modal_ljlu7m',
  '/work/the-crypt-modal.webm': 'the-crypt-modal_ljlu7m',
  '/recognition/alone-trailer.mp4': 'alone-trailer_olthk4',
  '/recognition/alone-trailer.webm': 'alone-trailer_olthk4',
  '/recognition/women-is-losers-poster.jpg': 'women-is-losers-poster_t1kftg',
  '/recognition/women-is-losers-poster.webp': 'women-is-losers-poster_t1kftg',
  '/videos/the-crypt-space.mp4': 'the-crypt-space_daducx',
  '/videos/the-crypt-space.webm': 'the-crypt-space_daducx',
  '/videos/tcy-immersive.mp4': 'tcy-immersive_ejhjkm',
  '/videos/tcy-immersive.webm': 'tcy-immersive_ejhjkm',
  '/work/boubyan-3.webp': 'bouybyan-3',
  '/work/boubyan-3.jpg': 'bouybyan-3',
};
const ENV_PUBLIC_ID_MAP = parsePublicIdMap(PUBLIC_ID_MAP_RAW);
const PUBLIC_ID_MAP: PublicIdMap = { ...STATIC_PUBLIC_ID_MAP, ...ENV_PUBLIC_ID_MAP };

function resolveMappedPublicId(localPath: string): string | null {
  const t = localPath.trim();
  if (!t || t.startsWith('//') || ABS_URL_RE.test(t)) return null;
  if (PUBLIC_ID_MAP[t]) return PUBLIC_ID_MAP[t];

  // Alias normalization for known typo/variant keys.
  const alias = t.replace('/boubyan-', '/bouybyan-');
  if (PUBLIC_ID_MAP[alias]) return PUBLIC_ID_MAP[alias];

  return null;
}

function normalizeFilenameExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return filename;
  return filename.slice(0, dot) + filename.slice(dot).toLowerCase();
}

function toCloudinaryPath(localPath: string, isVideo: boolean): string {
  const mapped = resolveMappedPublicId(localPath);
  if (mapped) return mapped;

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
