import { NextResponse, type NextRequest } from 'next/server';

const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</docs/api>; rel="service-doc"',
  '</.well-known/agent-skills/index.json>; rel="service-doc"',
  '</.well-known/mcp/server-card.json>; rel="service"',
].join(', ');

function prefersMarkdown(accept: string): boolean {
  const normalized = accept.toLowerCase();
  if (!normalized.includes('text/markdown')) return false;

  const markdownIndex = normalized.indexOf('text/markdown');
  const htmlIndex = normalized.indexOf('text/html');
  if (htmlIndex === -1) return true;
  return markdownIndex < htmlIndex;
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

export function middleware(request: NextRequest) {
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

export const config = {
  matcher: '/',
};
