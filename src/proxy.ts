import { NextResponse, type NextRequest } from 'next/server';

const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</docs/api>; rel="service-doc"',
  '</.well-known/agent-skills/index.json>; rel="service-doc"',
  '</.well-known/mcp/server-card.json>; rel="service"',
].join(', ');

function prefersMarkdown(accept: string): boolean {
  const normalized = accept.toLowerCase();
  const parts = normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  let markdownQ = -1;
  let htmlQ = -1;

  for (const part of parts) {
    const [mime, ...params] = part.split(';').map((p) => p.trim());
    const qParam = params.find((p) => p.startsWith('q='));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    const quality = Number.isFinite(q) ? q : 1;

    if (mime === 'text/markdown') markdownQ = Math.max(markdownQ, quality);
    if (mime === 'text/html') htmlQ = Math.max(htmlQ, quality);
  }

  if (markdownQ < 0) return false;
  if (htmlQ < 0) return true;
  return markdownQ >= htmlQ;
}

function homepageMarkdown(origin: string): string {
  return [
    '# Pratt Majmudar',
    '',
    'Creative Technologist + Executive Producer based in San Francisco.',
    '',
    `- Work: ${origin}/work`,
    `- About: ${origin}/about`,
    `- Ventures: ${origin}/ventures`,
    `- Contact: ${origin}/contact`,
    '',
    'This markdown response is served for agent-oriented clients requesting `Accept: text/markdown`.',
  ].join('\n');
}

function runProxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const accept = request.headers.get('accept') || '';

  if (pathname === '/' && prefersMarkdown(accept)) {
    const body = homepageMarkdown(origin);
    const tokenCount = body.trim().split(/\s+/).length;
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-store',
        Vary: 'Accept',
        Link: LINK_HEADER,
        'x-markdown-tokens': String(tokenCount),
      },
    });
  }

  const response = NextResponse.next();
  if (pathname === '/') {
    response.headers.set('Link', LINK_HEADER);
    response.headers.append('Vary', 'Accept');
  }
  return response;
}

export default runProxy;
export { runProxy as proxy };

export const config = {
  matcher: '/',
};
