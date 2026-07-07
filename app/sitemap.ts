import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, blogPosts } from "@/drizzle/schema";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site-info";
import { SERVICES } from "@/lib/seo/site-info";

const STATIC_PATHS = [
  "/",
  "/over-ons",
  "/diensten",
  "/werken-bij-ons",
  "/contact",
  "/afspraak",
  "/blog",
];

function localizedUrls(path: string) {
  return routing.locales.map((locale) => ({
    url: locale === routing.defaultLocale ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const { url } of localizedUrls(path)) {
      entries.push({ url, changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 });
    }
  }

  for (const service of SERVICES) {
    for (const { url } of localizedUrls(`/diensten/${service.key}`)) {
      entries.push({ url, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  try {
    const [publishedPages, publishedPosts] = await Promise.all([
      db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.published, true)),
      db
        .select({ slug: blogPosts.slug, locale: blogPosts.locale, updatedAt: blogPosts.updatedAt })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published")),
    ]);

    for (const page of publishedPages) {
      for (const { url } of localizedUrls(`/${page.slug}`)) {
        entries.push({ url, lastModified: page.updatedAt, changeFrequency: "yearly", priority: 0.4 });
      }
    }

    // Blog post slugs are globally unique and each row belongs to one
    // locale — canonical URL uses that post's own locale prefix.
    for (const post of publishedPosts) {
      const prefix = post.locale === routing.defaultLocale ? "" : `/${post.locale}`;
      entries.push({
        url: `${SITE_URL}${prefix}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // DB unavailable at build/request time — ship the static entries only.
  }

  return entries;
}
