import { siteConfig } from '@/config/site.config';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /private/',
    '',
    // Content Signals draft preference declaration.
    'Content-Signal: ai-train=no, search=yes, ai-input=no',
    '',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    `Host: ${siteConfig.url}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
