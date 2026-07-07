import Image from "next/image";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { blogPosts, type BlogPost } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

// Slug is globally unique across all languages — lookup by slug alone.
async function findPost(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Vliet Accountants & Consultants`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();
  const t = await getTranslations("blog");

  const published = post.publishedAt
    ? new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(post.publishedAt)
    : "";

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-sm mb-8 transition-colors"
          >
            {t("backToOverview")}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <Badge className="bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
                {post.category}
              </Badge>
            )}
            {published && (
              <span className="text-white/60 text-sm">
                {t("publishedOn")} {published}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-white/75 text-xl mt-4 leading-relaxed">{post.excerpt}</p>
          )}
        </div>
      </section>

      {post.coverImage && (
        <section className="bg-white pt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" unoptimized />
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none prose-headings:text-navy prose-a:text-gold prose-strong:text-navy leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-navy/20 bg-navy/5 px-3 py-1 text-xs font-medium text-navy"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
