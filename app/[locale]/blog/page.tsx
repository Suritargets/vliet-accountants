import Image from "next/image";
import { and, desc, eq, lte } from "drizzle-orm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { blogPosts, type BlogPost } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Blog | Vliet Accountants & Consultants" };

function formatDate(date: Date | null, locale: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  let posts: BlogPost[] = [];
  try {
    posts = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.locale, locale),
          eq(blogPosts.status, "published"),
          lte(blogPosts.publishedAt, new Date())
        )
      )
      .orderBy(desc(blogPosts.publishedAt));
  } catch {
    posts = [];
  }

  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{t("subtitle")}</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-16">{t("empty")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full border border-gray-100 hover:border-navy/20 hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1 overflow-hidden">
                    {post.coverImage && (
                      <div className="relative w-full h-44">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        {post.category && (
                          <Badge className="bg-navy/10 text-navy border-navy/20 hover:bg-navy/10">
                            {post.category}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDate(post.publishedAt, locale)}
                        </span>
                      </div>
                      <h2 className="font-semibold text-navy text-lg mb-2 leading-snug">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-gold text-sm font-medium">
                        {t("readMore")} <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
