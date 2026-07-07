import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /api, /admin, Next internals and any path containing a dot
  // (sitemap.xml, robots.txt, /videos/*.mp4, /images/*, favicon, ...).
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
