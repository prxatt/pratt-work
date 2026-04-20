export async function POST() {
  // Discovery endpoint advertised by .well-known docs; return a standards-shaped error instead of 404.
  return Response.json(
    {
      error: 'temporarily_unavailable',
      error_description: 'OAuth token issuance is not enabled for this resource.',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
