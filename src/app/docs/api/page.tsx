export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#F2F2F0] px-6 md:px-12 lg:px-20 py-24">
      <h1 className="font-display text-5xl uppercase tracking-tight mb-6">API Documentation</h1>
      <p className="text-[#B5B5B0] max-w-2xl leading-relaxed">
        This site is primarily content-focused. Public machine-readable discovery resources are
        available via <code>/.well-known/api-catalog</code>. If you need integration access, use
        the contact page and include your use case.
      </p>
    </main>
  );
}
