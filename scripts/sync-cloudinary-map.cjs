#!/usr/bin/env node
'use strict';

/**
 * Sync helper for Cloudinary public-id mapping (no manual code edits).
 *
 * One-step mode:
 *  - Place Cloudinary asset export in `cloudinary-assets.json`
 *  - Run: `npm run sync:cloudinary-map`
 *
 * This script:
 *  - Scans source files for `/work/*`, `/videos/*`, `/recognition/*` media paths
 *  - Auto-matches them to Cloudinary public IDs from URLs / export data
 *  - Writes NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP to `.env.cloudinary-map`
 *
 * Optional manual override inputs (highest priority):
 *  1) --json '<json>'
 *  2) CLOUDINARY_PUBLIC_ID_MAP_JSON
 *  3) --file <path-to-map-json>
 *  4) CLOUDINARY_PUBLIC_ID_MAP_FILE
 */

const fs = require('fs');
const path = require('path');

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function parseMap(raw) {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Map must be a JSON object: {"/path.ext":"public_id"}');
  }
  const out = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof k !== 'string' || typeof v !== 'string') continue;
    const key = k.trim();
    const val = v.trim();
    if (!key || !val) continue;
    out[key] = val;
  }
  return out;
}

function walk(dir, out, exts) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out, exts);
    else if (exts.has(path.extname(ent.name).toLowerCase())) out.push(p);
  }
}

function extractReferencedMediaPaths(srcRoot) {
  const files = [];
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);
  walk(srcRoot, files, exts);

  const rx = /\/(work|videos|recognition)\/[A-Za-z0-9._-]+/g;
  const paths = new Set();
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(rx);
    if (!matches) continue;
    for (const m of matches) paths.add(m);
  }
  return Array.from(paths).sort();
}

function parseAssetExport(raw) {
  const parsed = JSON.parse(raw);
  const out = [];

  function pushFromUrl(url) {
    if (typeof url !== 'string') return;
    const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[A-Za-z0-9]+)?(?:\?|$)/);
    if (!m) return;
    out.push(m[1]);
  }

  function pushFromObj(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (typeof obj.public_id === 'string' && obj.public_id.trim()) {
      out.push(obj.public_id.trim());
      return;
    }
    if (typeof obj.secure_url === 'string') pushFromUrl(obj.secure_url);
    if (typeof obj.url === 'string') pushFromUrl(obj.url);
  }

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (typeof item === 'string') pushFromUrl(item);
      else pushFromObj(item);
    }
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.resources)) {
      for (const r of parsed.resources) pushFromObj(r);
    } else {
      for (const v of Object.values(parsed)) {
        if (typeof v === 'string') pushFromUrl(v);
      }
    }
  }

  return out;
}

function baseNameNoExt(p) {
  const s = p.split('/').pop() || p;
  return s.replace(/\.[A-Za-z0-9]+$/, '').toLowerCase();
}

function normalizeKey(name) {
  return name.toLowerCase().replace(/^.*\//, '');
}

function buildAutoMap(referencedPaths, publicIds) {
  const byKey = new Map();
  for (const pid of publicIds) {
    const key = normalizeKey(baseNameNoExt(pid).replace(/_[a-z0-9]+$/i, ''));
    if (!byKey.has(key)) byKey.set(key, pid);
  }

  const map = {};
  const missing = [];
  for (const p of referencedPaths) {
    const key = normalizeKey(baseNameNoExt(p));
    const pid = byKey.get(key);
    if (pid) map[p] = pid;
    else missing.push(p);
  }
  return { map, missing };
}

function readExistingEnvMap(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP='([^']*)'/);
  if (!m) return {};
  try {
    return parseMap(m[1]);
  } catch {
    return {};
  }
}

function stableJson(obj) {
  const ordered = Object.keys(obj)
    .sort()
    .reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
  return JSON.stringify(ordered);
}

const inlineJson = argValue('--json') || process.env.CLOUDINARY_PUBLIC_ID_MAP_JSON || '';
const filePath = argValue('--file') || process.env.CLOUDINARY_PUBLIC_ID_MAP_FILE || '';
const assetsPathArg = argValue('--assets') || process.env.CLOUDINARY_ASSETS_FILE || '';
const writeLocal = process.argv.includes('--write-local');

let manualMap = {};
if (inlineJson) {
  manualMap = parseMap(inlineJson);
} else if (filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  manualMap = parseMap(fs.readFileSync(abs, 'utf8'));
}

const srcRoot = path.join(process.cwd(), 'src');
const referencedPaths = extractReferencedMediaPaths(srcRoot);

let autoMap = {};
let missingAuto = referencedPaths;
const defaultAssetsPath = path.join(process.cwd(), 'cloudinary-assets.json');
const assetsPath = assetsPathArg
  ? path.isAbsolute(assetsPathArg)
    ? assetsPathArg
    : path.join(process.cwd(), assetsPathArg)
  : defaultAssetsPath;

if (fs.existsSync(assetsPath)) {
  const publicIds = parseAssetExport(fs.readFileSync(assetsPath, 'utf8'));
  const auto = buildAutoMap(referencedPaths, publicIds);
  autoMap = auto.map;
  missingAuto = auto.missing;
}

const existingEnvMap = readExistingEnvMap(path.join(process.cwd(), '.env.cloudinary-map'));
const finalMap = { ...existingEnvMap, ...autoMap, ...manualMap };
const payload = stableJson(finalMap);
const envLine = `NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP='${payload}'\n`;
const outPath = path.join(process.cwd(), '.env.cloudinary-map');
fs.writeFileSync(outPath, envLine, 'utf8');

if (writeLocal) {
  const localPath = path.join(process.cwd(), '.env.local');
  const local = fs.existsSync(localPath) ? fs.readFileSync(localPath, 'utf8') : '';
  const next = local.match(/NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP=/)
    ? local.replace(/NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP=.*/g, envLine.trim())
    : `${local}${local.endsWith('\n') || local.length === 0 ? '' : '\n'}${envLine}`;
  fs.writeFileSync(localPath, next, 'utf8');
}

console.log(`[sync-cloudinary-map] scanned ${referencedPaths.length} referenced media paths`);
console.log(`[sync-cloudinary-map] wrote ${Object.keys(finalMap).length} entries -> ${outPath}`);
if (fs.existsSync(assetsPath)) {
  console.log(`[sync-cloudinary-map] auto-source: ${path.relative(process.cwd(), assetsPath)}`);
}
if (missingAuto.length > 0) {
  console.log(`[sync-cloudinary-map] unresolved by auto-match: ${missingAuto.length}`);
  const preview = missingAuto.slice(0, 15);
  for (const p of preview) console.log(`  - ${p}`);
  if (missingAuto.length > preview.length) {
    console.log(`  ...and ${missingAuto.length - preview.length} more`);
  }
}
console.log('[sync-cloudinary-map] Add this env var on Vercel (Preview + Production):');
console.log('  NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP');
