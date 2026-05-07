#!/usr/bin/env node
'use strict';

/**
 * Sync helper for Cloudinary public-id mapping.
 *
 * Input sources (priority):
 * 1) --json '<json>'
 * 2) CLOUDINARY_PUBLIC_ID_MAP_JSON
 * 3) --file <path-to-json>
 * 4) CLOUDINARY_PUBLIC_ID_MAP_FILE
 *
 * Output:
 * - Writes `.env.cloudinary-map` with NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP='...'
 * - Prints summary + guidance for Vercel env updates
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

let map = {};
if (inlineJson) {
  map = parseMap(inlineJson);
} else if (filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  map = parseMap(fs.readFileSync(abs, 'utf8'));
} else {
  console.error('No input provided. Pass --json, --file, CLOUDINARY_PUBLIC_ID_MAP_JSON, or CLOUDINARY_PUBLIC_ID_MAP_FILE.');
  process.exit(1);
}

const payload = stableJson(map);
const envLine = `NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP='${payload}'\n`;
const outPath = path.join(process.cwd(), '.env.cloudinary-map');
fs.writeFileSync(outPath, envLine, 'utf8');

console.log(`[sync-cloudinary-map] wrote ${Object.keys(map).length} entries -> ${outPath}`);
console.log('[sync-cloudinary-map] Add this env var on Vercel (Preview + Production):');
console.log('  NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID_MAP');
