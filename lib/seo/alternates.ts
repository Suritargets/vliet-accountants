import { routing } from "@/i18n/routing";
import { SITE_URL } from "./site-info";

/**
 * Build hreflang + canonical metadata for a route. `pathname` is the
 * locale-free path (e.g. "/diensten/audit-assurance", "/" for home).
 * NL is served at bare paths (localePrefix: "as-needed"), EN under /en.
 */
export function buildAlternates(locale: string, pathname: string) {
  const clean = pathname === "/" ? "" : pathname;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? `${SITE_URL}${clean}` : `${SITE_URL}/${l}${clean}`;
  }
  languages["x-default"] = languages[routing.defaultLocale];

  const canonical =
    locale === routing.defaultLocale ? `${SITE_URL}${clean}` : `${SITE_URL}/${locale}${clean}`;

  return { canonical, languages };
}
