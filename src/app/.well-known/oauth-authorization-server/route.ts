import { siteConfig } from '@/config/site.config';

export function GET() {
  const issuer = siteConfig.url;
  const body = {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    jwks_uri: `${issuer}/oauth/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'client_credentials', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    scopes_supported: ['api.read', 'api.write'],
  };

  return Response.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
