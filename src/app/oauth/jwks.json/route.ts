export function GET() {
  // Exposed so discovery metadata resolves to a valid endpoint.
  // Empty JWKS signals no public signing keys are currently available.
  return Response.json(
    { keys: [] },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    }
  );
}
