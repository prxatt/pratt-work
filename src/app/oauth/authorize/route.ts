export function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');

  // Discovery endpoint advertised by .well-known docs; return a standards-shaped error instead of 404.
  if (redirectUri) {
    const redirect = new URL(redirectUri);
    redirect.searchParams.set('error', 'temporarily_unavailable');
    redirect.searchParams.set('error_description', 'OAuth authorization is not enabled for this resource.');
    if (state) redirect.searchParams.set('state', state);
    return Response.redirect(redirect.toString(), 302);
  }

  return Response.json(
    {
      error: 'temporarily_unavailable',
      error_description: 'OAuth authorization is not enabled for this resource.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
