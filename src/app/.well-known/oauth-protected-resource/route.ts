import { siteConfig } from '@/config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    resource: `${base}/api`,
    authorization_servers: [base],
    scopes_supported: ['api.read', 'api.write'],
    bearer_methods_supported: ['header'],
    resource_documentation: `${base}/docs/api`,
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
