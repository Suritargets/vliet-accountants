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
