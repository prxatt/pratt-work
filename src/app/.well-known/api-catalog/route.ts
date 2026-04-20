import { siteConfig } from '@/config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    linkset: [
      {
        anchor: `${base}/api`,
        serviceDesc: [{ href: `${base}/.well-known/openapi.json`, type: 'application/openapi+json' }],
        serviceDoc: [{ href: `${base}/docs/api`, type: 'text/html' }],
        status: [{ href: `${base}/api/health`, type: 'application/json' }],
      },
    ],
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
