import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-info";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      // Explicitly welcome AI/answer-engine crawlers rather than relying on
      // silent default-allow.
      { userAgent: "GPTBot", allow: "/", disallow: "/admin" },
      { userAgent: "ClaudeBot", allow: "/", disallow: "/admin" },
      { userAgent: "PerplexityBot", allow: "/", disallow: "/admin" },
      { userAgent: "Google-Extended", allow: "/", disallow: "/admin" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
