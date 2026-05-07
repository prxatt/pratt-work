'use strict';

/**
 * Vercel-only guard: `public/` image/video files must be real binaries.
 * Git LFS pointer files look like text starting with `version https://git-lfs...`;
 * next/image returns 400 for pointer "images", and `<video>` / direct URLs
 * serve unusable data for pointer "videos".
 */
const fs = require('fs');
const path = require('path');

if (process.env.VERCEL !== '1') process.exit(0);
const cloudinaryMediaFlag = (process.env.NEXT_PUBLIC_CLOUDINARY_MEDIA || '').trim();
const cloudinaryEnabled = !/^(off|0|false)$/i.test(cloudinaryMediaFlag);
// In this repo, Cloudinary is the default media path. Only enforce LFS-byte checks
// when Cloudinary delivery is explicitly disabled.
if (cloudinaryEnabled) process.exit(0);
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
    console.error('Cloudinary delivery is disabled and this app serves root-relative/public media.');
    console.error('LFS pointers break next/image (400) and video playback in production.');
    console.error('');
    console.error('Fix: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME on Vercel for Cloudinary delivery,');
    console.error('or upload real media bytes (not LFS pointers) to public/ before deploy.');
    console.error('');
    process.exit(1);
  }
}

walk(root);
