import { siteConfig } from '../../../../config/site.config';

export function GET() {
  const base = siteConfig.url;
  const body = {
    $schema: 'https://agentskills.io/schemas/agent-skills-index-v0.2.0.json',
    skills: [
      {
        name: 'site-navigation',
        type: 'tool',
        description: 'Navigate to key sections including work and contact pages.',
        url: `${base}/.well-known/agent-skills/site-navigation.md`,
        sha256: '2a4828e8eb3f55232455a18c14eb74dc84c3432b80335c88e0e8a0deaab87065',
      },
      {
        name: 'public-api-discovery',
        type: 'resource',
        description: 'Discover API metadata and health endpoints.',
        url: `${base}/.well-known/agent-skills/public-api-discovery.md`,
        sha256: 'dfede1d4325cdfef3a3ee48f74f16d01cb30d4abd5625499611a95d3263a47ed',
      },
    ],
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
