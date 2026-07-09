const REPORT_URI = "/api/csp-report";

// Pure function — kept separate from proxy.ts so the actual policy values
// are easy to read and adjust without touching the routing plumbing.
//
// script-src is 'self' 'unsafe-inline', not nonce/'strict-dynamic'. Two
// attempts at a stricter policy were tried and reverted, both defeated by
// the same root cause: Next.js App Router embeds genuinely inline <script>
// tags on every page (the RSC hydration/flight-data payload), and a nonce
// is the only way to allow specific inline scripts without 'unsafe-inline'.
// Next.js only threads a nonce into those tags from *request-time* context
// (it reads an x-nonce-bearing header via parseRequestHeaders()):
//   1. A per-request random nonce: matches the response header for the one
//      request that rendered a page, but several public pages are cached
//      after their first render (ISR/Full Route Cache) — every subsequent
//      cache hit serves that same HTML (with its nonce baked into the
//      inline script) under a freshly generated, different header nonce.
//   2. A deployment-scoped stable nonce (VERCEL_DEPLOYMENT_ID-derived):
//      fixes the cache-consistency problem, but pages statically generated
//      at build time (generateStaticParams — the homepage and all 12
//      diensten pages) render with NO request at all, so they get zero
//      nonce on any script tag regardless of what value is chosen.
// Making nonces work correctly across build-time SSG, ISR, and dynamic
// rendering in the same site requires Next.js 16's Cache Components/PPR
// system (cacheComponents: true) — not enabled here, and enabling it is a
// materially bigger architecture change than a CSP header, out of scope
// for this fix.
//
// 'unsafe-inline' has no request-time or build-time dependency: it works
// identically for every rendering mode this site uses, which is the actual
// requirement given the alternative (reverting the ISR/SSG migration back
// to force-dynamic everywhere) would undo a real, measured performance
// fix for a much smaller CSP security gain.
//
// What this still protects against: cross-origin script loading (a
// malicious external <script src="https://evil.example/x.js">) and
// same-origin script-file injection (mitigated separately anyway — the
// only upload path, app/api/upload/route.ts, accepts image MIME types
// only, no SVG, so there's no way to plant an arbitrary script file under
// this origin). What it does NOT protect against: a classic stored-XSS
// attack that injects an inline <script>...</script> block via
// unescaped user/CMS content — the same class of gap 'unsafe-inline' on
// style-src already accepts below, now extended to scripts for the same
// practical reason. All CMS/booking/contact input in this codebase is
// HTML-escaped before rendering (see lib/mail/templates.ts's esc()) —
// this is defense in depth on top of that escaping, not a replacement
// for it.
//
// style-src allows 'unsafe-inline' deliberately: several pages use React
// inline style={{}} (e.g. the /admin/statistieken trend-chart bars), and
// CSS injection is a much weaker attack vector than script injection.
export function buildCsp(): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' https://images.unsplash.com https://*.public.blob.vercel-storage.com data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-src https://www.google.com https://maps.google.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri ${REPORT_URI}`,
  ].join("; ");
}
