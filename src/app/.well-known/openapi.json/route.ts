import { siteConfig } from '@/config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    openapi: '3.1.0',
    info: {
      title: 'Pratt Work Public API',
      version: '1.0.0',
      description: 'Minimal discovery schema for public status endpoints.',
    },
    servers: [{ url: base }],
    paths: {
      '/api/health': {
        get: {
          operationId: 'getHealth',
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Service status',
            },
          },
        },
      },
    },
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
