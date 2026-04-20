import { siteConfig } from '@/config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    serverInfo: {
      name: 'pratt-work-webmcp',
      version: '1.0.0',
    },
    transport: {
      type: 'webmcp',
      endpoint: `${base}/`,
    },
    capabilities: {
      tools: true,
      prompts: false,
      resources: false,
    },
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
