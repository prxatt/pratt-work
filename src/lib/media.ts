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
  '/work/st-atmosphere.mp4': 'st-atmosphere_jscnlf',
  '/work/st-atmosphere.webm': 'st-atmosphere_jscnlf',
  '/work/st-crt.mp4': 'st-crt_l1tgvf',
  '/work/st-crt.webm': 'st-crt_l1tgvf',
  '/work/the-crypt-modal.mp4': 'the-crypt-modal_ljlu7m',
  '/work/the-crypt-modal.webm': 'the-crypt-modal_ljlu7m',
  '/work/wil-trailer.mp4': 'wil-trailer_ejimys',
  '/work/wil-trailer.webm': 'wil-trailer_ejimys',
  '/work/wb-teaser.mp4': 'wb-teaser_yk0nxe',
  '/work/wb-teaser.webm': 'wb-teaser_yk0nxe',
  '/work/the-crypt-thumb.mp4': 'the-crypt-thumb_sbfsro',
  '/work/the-crypt-thumb.webm': 'the-crypt-thumb_sbfsro',
  '/work/the-crypt-hero.webm': 'crypt-demo_m1f5bj',
  '/work/boubyan-bank-card.mp4': 'boubyan-bank-card_gapo16',
  '/work/boubyan-bank-card.webm': 'boubyan-bank-card_gapo16',
  '/work/boubyan-hero.webm': 'boubyan-bank-card_gapo16',
  '/work/boubyan-bank-thumb.webp': 'boubyan-bank-thumb_s5d4mr',
  '/work/boubyan-bank-thumb.jpg': 'boubyan-bank-thumb_s5d4mr',
  '/work/boubyan-2.webp': 'boubyan-2_jcotir',
  '/work/boubyan-2.jpg': 'boubyan-2_jcotir',
  '/work/boubyan-light-1.webp': 'boubyan-light-1_nne3es',
  '/work/boubyan-light-1.png': 'boubyan-light-1_nne3es',
  '/work/boubyan-light-2.webp': 'boubyan-light-2_w3f32x',
  '/work/boubyan-light-2.jpg': 'boubyan-light-2_w3f32x',
  '/work/levis-lab.webp': 'levis-lab_ard8y9',
  '/work/levis-lab.jpg': 'levis-lab_ard8y9',
  '/work/levis-thumb.webp': 'levis-thumb_isumif',
  '/work/levis-thumb.jpg': 'levis-thumb_isumif',
  '/work/levis-wash.webp': 'levis-wash_qfyzbs',
  '/recognition/alone-trailer.mp4': 'alone-trailer_olthk4',
  '/recognition/alone-trailer.webm': 'alone-trailer_olthk4',
  '/recognition/synchronicity-trailer.mp4': 'synchronicity-trailer_hbtf36',
  '/recognition/synchronicity-trailer.webm': 'synchronicity-trailer_hbtf36',
  '/recognition/women-is-losers-trailer.mp4': 'women-is-losers-trailer_s4uhdy',
  '/recognition/women-is-losers-trailer.webm': 'women-is-losers-trailer_s4uhdy',
  '/recognition/synchronicity-poster.jpg': 'synchronicity-poster_dxvc2h',
  '/recognition/synchronicity-poster.webp': 'synchronicity-poster_dxvc2h',
  '/recognition/women-is-losers-poster.jpg': 'women-is-losers-poster_t1kftg',
  '/recognition/women-is-losers-poster.webp': 'women-is-losers-poster_t1kftg',
  '/work/salesforce-check.webp': 'salesforce-check_vrovzc',
  '/work/salesforce-check.jpeg': 'salesforce-check_vrovzc',
  '/work/salesforce-class.webp': 'salesforce-class_oa4skj',
  '/work/salesforce-class.jpeg': 'salesforce-class_oa4skj',
  '/work/salesforce-lab.webp': 'salesforce-lab_jhzycu',
  '/work/salesforce-lab.jpeg': 'salesforce-lab_jhzycu',
  '/work/salesforce-mayor.webp': 'salesforce-mayor_wbz1sf',
  '/work/salesforce-mayor.jpeg': 'salesforce-mayor_wbz1sf',
  '/work/salesforce-qa.webp': 'salesforce-qa_l76wqu',
  '/work/salesforce-qa.jpeg': 'salesforce-qa_l76wqu',
  '/work/salesforce-students.webp': 'salesforce-students_xokgdi',
  '/work/salesforce-students.jpeg': 'salesforce-students_xokgdi',
  '/work/salesforce-thumb.webp': 'salesforce-thumb_hopsum',
  '/work/salesforce-thumb.jpeg': 'salesforce-thumb_hopsum',
  '/work/st-dd1.webp': 'st-dd1_oj9xc9',
  '/work/st-dd1.jpg': 'st-dd1_oj9xc9',
  '/work/st-dd2.webp': 'st-dd2_mj9wsc',
  '/work/st-dd2.jpg': 'st-dd2_mj9wsc',
  '/work/st-dd3.webp': 'st-dd3_q7oks3',
  '/work/st-dd3.jpg': 'st-dd3_q7oks3',
  '/work/st-dd4.webp': 'st-dd4_r4xrv6',
  '/work/st-dd4.jpg': 'st-dd4_r4xrv6',
  '/work/st-dd5.webp': 'st-dd5_dnwutw',
  '/work/st-dd5.jpg': 'st-dd5_dnwutw',
  '/work/st-dd6.webp': 'st-dd6_z2orn3',
  '/work/st-dd6.jpg': 'st-dd6_z2orn3',
  '/work/st-dd7.webp': 'st-dd7_mezzaw',
  '/work/st-dd7.jpg': 'st-dd7_mezzaw',
  '/work/stability-ai-thumb.webp': 'stability-ai-thumb_xrbtgq',
  '/work/stability-ai-thumb.jpg': 'stability-ai-thumb_xrbtgq',
  '/work/stability-brand.webp': 'stability-brand_o5v3dv',
  '/work/stability-brand.jpg': 'stability-brand_o5v3dv',
  '/work/stability-imad.webp': 'stability-imad_xvscqu',
  '/work/stability-imad.jpg': 'stability-imad_xvscqu',
  '/work/stability-led.webp': 'stability-led_r8ehv6',
  '/work/stability-led.jpeg': 'stability-led_r8ehv6',
  '/work/stability-team.webp': 'stability-team_jop3ge',
  '/work/stability-team.jpg': 'stability-team_jop3ge',
  '/work/stability-vid.mp4': 'stability-vid_b1sa4g',
  '/work/stability-vid.webm': 'stability-vid_b1sa4g',
  '/work/pwc-liftoff-thumb.webp': 'pwc-liftoff-thumb_s3pwfn',
  '/work/pwc-liftoff-thumb.jpg': 'pwc-liftoff-thumb_s3pwfn',
  '/work/surface-tension-drip.webp': 'surface-tension-drip_czktap',
  '/work/surface-tension-drip.jpg': 'surface-tension-drip_czktap',
  '/work/weave-wb.webp': 'weave-wb_zdcwbu',
  '/work/weave-wb.jpg': 'weave-wb_zdcwbu',
  '/work/weights-biases-card.webp': 'weights-biases-card_hqtdld',
  '/work/weights-biases-card.jpeg': 'weights-biases-card_hqtdld',
  '/work/wil-poster.webp': 'wil-poster_f3nasu',
  '/work/wil-poster.jpg': 'wil-poster_f3nasu',
  '/work/women-is-losers-thumb.webp': 'women-is-losers-thumb_zdvpoe',
  '/work/women-is-losers-thumb.jpeg': 'women-is-losers-thumb_zdvpoe',
  '/work/weights-biases-thumb.webp': 'weights-biases-thumb_ijhjnm',
  '/work/weights-biases-thumb.jpeg': 'weights-biases-thumb_ijhjnm',
  '/videos/the-crypt-space.mp4': 'the-crypt-space_daducx',
  '/videos/the-crypt-space.webm': 'the-crypt-space_daducx',
  '/videos/the-crypt-run.mp4': 'the-crypt-thumb_sbfsro',
  '/videos/the-crypt-run.webm': 'the-crypt-thumb_sbfsro',
  '/videos/tcy-immersive.mp4': 'tcy-immersive_ejhjkm',
  '/videos/tcy-immersive.webm': 'tcy-immersive_ejhjkm',
  '/videos/wb-prod.mp4': 'wb-prod_nmy08g',
  '/videos/wb-prod.webm': 'wb-prod_nmy08g',
  '/videos/st-dd-prod.mp4': 'st-dd-prod_vy8clw',
  '/videos/st-dd-prod.webm': 'st-dd-prod_vy8clw',
  '/videos/pr8-lv.mp4': 'pr8-lv_iaqrjk',
  '/videos/pr8-lv.webm': 'pr8-lv_iaqrjk',
  '/videos/pr8-portrait.mp4': 'pr8-portrait_kgyx2i',
  '/videos/pr8-portrait.webm': 'pr8-portrait_kgyx2i',
  '/videos/st-ai.mp4': 'st-ai_sygdfj',
  '/videos/st-ai.webm': 'st-ai_sygdfj',
  '/videos/stability-exp.mp4': 'stability-exp_nyeyki',
  '/videos/stability-exp.webm': 'stability-exp_nyeyki',
  '/videos/pr8-ff-portrait.webm': 'uyetycclkily0zwsuk6o',
  '/videos/pr8-ff-portrait.mp4': 'uyetycclkily0zwsuk6o',
  '/work/boubyan-3.webp': 'bouybyan-3',
  '/work/boubyan-3.jpg': 'bouybyan-3',
  '/work/boubyan1.webp': 'boubyan1_oyx6ti',
  '/work/boubyan1.jpg': 'boubyan1_oyx6ti',
  '/recognition/alone-poster.jpg': 'alone-poster_aavsoe',
  '/recognition/alone-poster.webp': 'alone-poster_aavsoe',
};
const ENV_PUBLIC_ID_MAP = parsePublicIdMap(PUBLIC_ID_MAP_RAW);
const PUBLIC_ID_MAP: PublicIdMap =
  Object.keys(ENV_PUBLIC_ID_MAP).length > 0 ? ENV_PUBLIC_ID_MAP : STATIC_PUBLIC_ID_MAP;

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
  const crop = options.crop ?? (options.width ? 'limit' : undefined);
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (crop) transforms.push(`c_${crop}`);
  return `${baseImg()}/${transforms.join(',')}/${path}`;
}

export function generateSrcSet(
  localPath: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  options?: { quality?: 'auto' | number; format?: 'auto' | 'webp' | 'avif' | 'jpg' }
): string {
  return widths.map((w) => `${getImageUrl(localPath, w, options)} ${w}w`).join(', ');
}
