import { notFound } from "next/navigation";
import { and, asc, eq, isNull, or } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { pages, type Page } from "@/drizzle/schema";
import { buildAlternates } from "@/lib/seo/alternates";

// Exact-locale match sorts before the NULL fallback row (ASC = NULLS LAST).
async function findPage(slug: string, locale: string): Promise<Page | null> {
  try {
    const rows = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.slug, slug),
          eq(pages.published, true),
          or(eq(pages.locale, locale), isNull(pages.locale))
        )
      )
      .orderBy(asc(pages.locale))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = await findPage(slug, locale);
  if (!page) return {};
  const { canonical, languages } = buildAlternates(locale, `/${slug}`);
  return {
    title: `${page.metaTitle || page.title} | Vliet Accountants & Consultants`,
    description: page.metaDescription || undefined,
    alternates: { canonical, languages },
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = await findPage(slug, locale);
  if (!page) notFound();

  const updated = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(page.updatedAt);

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            Vliet Accountants & Consultants
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          <p className="text-white/75 text-lg capitalize">
            {locale === "nl" ? "Laatst bijgewerkt: " : "Last updated: "}
            {updated}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
          </div>
        </div>
      </section>
    </>
  );
}
