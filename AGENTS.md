<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Overview

This is **pratt.work**, a personal portfolio / creative technologist website built with Next.js 16.2.2, React 19, Tailwind CSS 4, Three.js, and Framer Motion. It is a static/SSG site with no database — all content lives in MDX files under `content/` and TypeScript data files.

### Running the app

- **Dev server:** `npm run dev` → runs on `http://localhost:3000` (binds `0.0.0.0`)
- **Build:** `npm run build` (runs media verification script first, then `next build`)
- **Lint:** `npm run lint` (ESLint 9; the codebase has ~210 pre-existing lint warnings/errors)
- **No test suite** is configured — there is no `test` script in `package.json`.

### Key caveats

- Media (images/videos) are served via **Cloudinary CDN** by default using public unsigned delivery URLs (cloud name `dj0n7b4ma`). No API key is needed. Files in `public/` are Git LFS pointers and will not render locally unless you run `git lfs pull`.
- The `TWITTER_BEARER_TOKEN` env var is optional; the social feed API route falls back gracefully without it.
- The site uses heavy 3D/WebGL (Three.js, React Three Fiber, OGL) — pages may render slowly in headless or low-GPU environments but still function.
- Next.js 16 has breaking changes vs. earlier versions. Consult `node_modules/next/dist/docs/` before modifying framework-level code.
