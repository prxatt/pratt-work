'use strict';

/**
 * Vercel-only guard: if we ship without Cloudinary, `public/` image/video files must be real
 * binaries. Git LFS pointer files look like text starting with `version https://git-lfs...`;
 * next/image returns 400 for pointer "images", and `<video>` / direct URLs serve unusable data
 * for pointer "videos" unless LFS objects are present at build time.
 */
const fs = require('fs');
const path = require('path');

if (process.env.VERCEL !== '1') process.exit(0);
if ((process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim()) process.exit(0);
if (/^(off|0|false)$/i.test((process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA || '').trim())) process.exit(0);

const root = path.join(process.cwd(), 'public');
if (!fs.existsSync(root)) process.exit(0);

const exts = new Set([
  '.webp',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.avif',
  // Video extensions used by `src/lib/media.ts` and LFS-tracked in `.gitattributes`.
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
]);

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (exts.has(path.extname(ent.name).toLowerCase())) checkFile(p);
  }
}

function checkFile(p) {
  const buf = Buffer.alloc(48);
  const fd = fs.openSync(p, 'r');
  try {
    fs.readSync(fd, buf, 0, 48, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (buf.toString('utf8').startsWith('version https://git-lfs')) {
    const rel = path.relative(process.cwd(), p);
    console.error('');
    console.error('[verify-public-media] Git LFS pointer in public/ (not real media bytes):');
    console.error('  ' + rel);
    console.error('');
    console.error('Without NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, the app uses direct media URLs');
    console.error('(root-relative paths and/or NEXT_PUBLIC_MEDIA_BASE_URL), not Cloudinary transforms.');
    console.error('LFS pointers break next/image (400) and video playback in production.');
    console.error('');
    console.error('Fix: add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to this Vercel environment and redeploy,');
    console.error('or migrate media out of Git LFS so public/ contains real binaries.');
    console.error('');
    process.exit(1);
  }
}

walk(root);
