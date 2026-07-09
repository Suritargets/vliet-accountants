# Content-Security-Policy (Report-Only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a nonce-based `Content-Security-Policy-Report-Only` header on every route (including `/admin`), with violations forwarded into the existing `/admin/fouten` error-logging pipeline, so the policy can be observed safely before a later, separate change flips it to enforcing.

**Architecture:** `proxy.ts` (the existing next-intl middleware) generates a random per-request nonce, builds the CSP string via a small pure helper (`lib/csp/policy.ts`), and sets it as a response header on whatever response results — either next-intl's own routing response (public pages) or a plain pass-through (`/admin`, which next-intl doesn't need to route). A new `app/api/csp-report/route.ts` receives the browser's native CSP violation reports (sent automatically via the `report-uri` directive) and forwards them into the already-existing `logError()` helper.

**Tech Stack:** Next.js 16 App Router middleware (`proxy.ts`), Edge Runtime Web Crypto API (`crypto.randomUUID`, `btoa`), existing `lib/rate-limit.ts` and `lib/error-log/log.ts`.

## Global Constraints

- Ship as `Content-Security-Policy-Report-Only` — never the enforcing `Content-Security-Policy` header. Flipping to enforcing is an explicit, separate, later change, not part of this plan.
- The policy must apply to every route the site serves, including `/admin/*` (not just public pages) — `/admin` currently doesn't go through next-intl's own routing logic, but the header still needs to reach it.
- `style-src` allows `'unsafe-inline'` deliberately (7 files use React inline `style={{}}`) — do not attempt to remove this or convert those to nonce/hash-based styles; that is out of scope.
- `script-src` uses `'self' 'nonce-<random>' 'strict-dynamic'` — no `'unsafe-inline'` for scripts.
- `frame-src` only allows `https://www.google.com` and `https://maps.google.com` (the contact page's Maps embed) — nothing else may be framed.
- `frame-ancestors 'none'` — this project already independently sets `X-Frame-Options: DENY` site-wide (separate, already-merged change); this is the CSP-native equivalent, kept for browsers that only honor one or the other.
- CSP violation reports must reuse the existing `logError()` helper (`lib/error-log/log.ts`) with `context: "csp-violation"`, `source: "client"` — no new database table, no new admin page. They appear on the existing `/admin/fouten` page.
- The new `/api/csp-report` route must be fail-open (never throw, always return 200) and rate-limited, matching every other public POST route in this project (`/api/track`, `/api/log-error`).

---

### Task 1: CSP policy builder + middleware

**Files:**
- Create: `lib/csp/policy.ts`
- Modify: `proxy.ts`

**Interfaces:**
- Produces: `buildCsp(nonce: string): string` from `@/lib/csp/policy` — not consumed by any other task, but kept in its own file so the policy string is easy to read/adjust independent of the middleware plumbing.

- [ ] **Step 1: `lib/csp/policy.ts` aanmaken**

```ts
const REPORT_URI = "/api/csp-report";

// Pure function — kept separate from proxy.ts so the actual policy values
// are easy to read and adjust without touching the nonce/routing plumbing.
// style-src allows 'unsafe-inline' deliberately: several pages use React
// inline style={{}} (e.g. the /admin/statistieken trend-chart bars), and
// CSS injection is a much weaker attack vector than script injection —
// script-src gets the strict nonce treatment instead, where the real risk is.
export function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
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
```

- [ ] **Step 2: `proxy.ts` herschrijven**

Huidige inhoud (ter referentie):

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /api, /admin, Next internals and any path containing a dot
  // (sitemap.xml, robots.txt, /videos/*.mp4, /images/*, favicon, ...).
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
```

Vervang volledig door:

```ts
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { buildCsp } from "@/lib/csp/policy";

const intlMiddleware = createMiddleware(routing);
const CSP_HEADER_NAME = "Content-Security-Policy-Report-Only";

export default function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // /admin doesn't need next-intl's locale routing (same as before) — but
  // it still needs the CSP header, so it can't be excluded from the
  // matcher entirely the way it used to be.
  const response = request.nextUrl.pathname.startsWith("/admin")
    ? NextResponse.next()
    : intlMiddleware(request);

  response.headers.set(CSP_HEADER_NAME, csp);
  return response;
}

export const config = {
  // Skip /api, Next internals, and any path containing a dot (static
  // assets like sitemap.xml, robots.txt, /videos/*.mp4, /images/*).
  // /admin is now included (for the CSP header above); next-intl's own
  // routing logic still only runs outside /admin, same as before.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol.

- [ ] **Step 4: Functionele test — header aanwezig op publieke pagina's én admin**

```bash
npm run dev &
sleep 12
echo "--- / ---"
curl -sI -m 15 "http://localhost:3000/" | grep -i "content-security-policy-report-only"
echo "--- /en ---"
curl -sI -m 15 "http://localhost:3000/en" | grep -i "content-security-policy-report-only"
echo "--- /admin/login ---"
curl -sI -m 15 "http://localhost:3000/admin/login" | grep -i "content-security-policy-report-only"
echo "--- twee requests, nonce moet verschillen ---"
curl -sI -m 15 "http://localhost:3000/" | grep -o "nonce-[A-Za-z0-9+/=]*"
curl -sI -m 15 "http://localhost:3000/" | grep -o "nonce-[A-Za-z0-9+/=]*"
```
Expected: alle drie routes tonen de `Content-Security-Policy-Report-Only`-header met een `nonce-...`-waarde in `script-src`; de twee losse nonce-waardes aan het eind zijn verschillend (nieuwe nonce per request). Stop de dev-server na de test.

- [ ] **Step 5: Commit**

```bash
git add lib/csp/policy.ts proxy.ts
git commit -m "Add Content-Security-Policy-Report-Only header via middleware nonce"
```

---

### Task 2: `/api/csp-report`-route

**Files:**
- Create: `app/api/csp-report/route.ts`

**Interfaces:**
- Consumes: `rateLimit` (`@/lib/rate-limit`), `logError` (`@/lib/error-log/log`).
- Produces: `POST /api/csp-report` — ontvangt browser-native CSP-violation-reports (via de `report-uri`-directive uit Taak 1), retourneert altijd `{ ok: true }`.

- [ ] **Step 1: Route aanmaken**

```ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log/log";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open en stil: een gemiste violation-report mag nooit zelf een
    // fout tonen aan een bezoeker.
    if (!rateLimit(`csp-report:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => null);
    const report = body?.["csp-report"];
    const violatedDirective =
      typeof report?.["violated-directive"] === "string"
        ? report["violated-directive"]
        : "unknown-directive";
    const blockedUri =
      typeof report?.["blocked-uri"] === "string" ? report["blocked-uri"] : "unknown";
    const documentUri =
      typeof report?.["document-uri"] === "string"
        ? report["document-uri"].slice(0, 255)
        : undefined;

    const message = `CSP violation: ${violatedDirective} blocked ${blockedUri}`;
    await logError("csp-violation", new Error(message), {
      source: "client",
      path: documentUri,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("csp-report failed:", error);
    return NextResponse.json({ ok: true }); // fail-open
  }
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit` — verwacht: schoon.
Run: `npm run build` — verwacht: succesvol, `/api/csp-report` in de routelijst.

- [ ] **Step 3: Functionele test — synthetisch violation-report posten**

```bash
npm run dev &
sleep 12
curl -s -m 15 -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/csp-report" \
  --data '{"csp-report":{"document-uri":"https://www.vlietaccountants.com/test-csp","violated-directive":"script-src-elem","blocked-uri":"https://evil-test.example/script.js"}}'
```
Expected: `{"ok":true}`.

Verifieer in de database:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const rows = await sql\`SELECT source, context, message, path FROM error_events WHERE path = '/test-csp'\`;
  console.log(rows);
})();
" 2>&1 | grep -v "tip:"
```
Expected: één rij, `source: 'client'`, `context: 'csp-violation'`, `message` bevat `"script-src-elem"` en `"evil-test.example"`, `path: '/test-csp'`.

Ruim de testrij op:

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM error_events WHERE path = '/test-csp' RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

Stop de dev-server.

- [ ] **Step 4: Commit**

```bash
git add app/api/csp-report/route.ts
git commit -m "Add /api/csp-report route for CSP violation reports"
```

---

### Task 3: Volledige verificatie + afronden

**Files:** geen nieuwe — eindcontrole.

- [ ] **Step 1: Volledige lint + typecheck + build**

```bash
npm run lint
npx tsc --noEmit
rm -rf .next
npm run build
```
Expected: alle drie slagen zonder errors. `/api/csp-report` staat in de routelijst.

- [ ] **Step 2: End-to-end — header + report-pipeline samen, met een geauthenticeerde admin-sessie**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { SignJWT } = require('jose');
(async () => {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  const token = await new SignJWT({ email: process.env.ADMIN_EMAIL, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  console.log(token);
})();
" > /tmp/vliet-csp-token.txt 2>&1

npm run dev &
sleep 12
TOKEN=$(tail -1 /tmp/vliet-csp-token.txt)

echo "--- CSP header op / ---"
curl -sI -m 15 "http://localhost:3000/" | grep -i "content-security-policy-report-only"

echo "--- CSP header op /admin/fouten (met sessie) ---"
curl -sI -m 15 -H "Cookie: admin_session=$TOKEN" "http://localhost:3000/admin/fouten" | grep -i "content-security-policy-report-only\|HTTP"

echo "--- synthetisch violation-report posten ---"
curl -s -m 15 -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/csp-report" \
  --data '{"csp-report":{"document-uri":"https://www.vlietaccountants.com/e2e-csp-test","violated-directive":"img-src","blocked-uri":"https://e2e-test.example/pixel.png"}}'

echo "--- /admin/fouten toont de nieuwe rij ---"
curl -s -m 15 -H "Cookie: admin_session=$TOKEN" "http://localhost:3000/admin/fouten" | grep -o "csp-violation" | head -1
```
Expected: CSP-header aanwezig op beide routes; violation-POST retourneert `{"ok":true}`; `/admin/fouten` bevat de tekst `csp-violation` na het posten van het testrapport.

- [ ] **Step 3: Testdata opruimen**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const r = await sql\`DELETE FROM error_events WHERE path = '/e2e-csp-test' RETURNING id\`;
  console.log('opgeruimd:', r.length);
})();
" 2>&1 | grep -v "tip:"
```

Stop de dev-server. Verwijder `/tmp/vliet-csp-token.txt`.

- [ ] **Step 4: Commit (indien nog niet-gecommitte wijzigingen)**

```bash
git status --short
```
Als er geen wijzigingen meer zijn, is er niets te committen — dit is enkel een eindcontrole.

- [ ] **Step 5: Rollout-notitie voor na de merge**

Dit plan levert uitsluitend de Report-Only fase op. Na een paar dagen echte bezoekersverkeer op productie: `/admin/fouten` controleren op rijen met context `csp-violation`. Geen (onverwachte) meldingen → een aparte, kleine vervolgwijziging maakt er `Content-Security-Policy` (afdwingend) van door alleen `CSP_HEADER_NAME` in `proxy.ts` aan te passen — geen andere codewijziging nodig. Dit is bewust geen onderdeel van dit plan.
