import { siteConfig } from '@/config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    $schema: 'https://agentskills.io/schemas/agent-skills-index-v0.2.0.json',
    skills: [
      {
        name: 'site-navigation',
        type: 'tool',
        description: 'Navigate to key sections including work and contact pages.',
        url: `${base}/docs/api`,
        sha256: '4f7d70f9e2390dc65a967fd3f8d0cce7baf6d7bf6f768147f8f4559f1b7f6f14',
      },
      {
        name: 'public-api-discovery',
        type: 'resource',
        description: 'Discover API metadata and health endpoints.',
        url: `${base}/.well-known/api-catalog`,
        sha256: 'f4516f3d7a171cfd9063d6a69f2b2d0dca8b9b6d326f6250c0518ab74150ab9d',
      },
    ],
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
