import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import BlogEditor from "./BlogEditor";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BlogEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSession();
  const { groupId } = await params;
  const { saved } = await searchParams;

  if (groupId === "nieuw") {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Nieuw artikel"
          description="Vul minimaal één taal in en sla op. Een lege taal-tab blijft leeg — er wordt niets automatisch vertaald."
        />
        <BlogEditor groupId={null} posts={[]} />
      </div>
    );
  }

  // Non-UUID ids would fail the Postgres uuid cast — treat as not found.
  if (!UUID_RE.test(groupId)) notFound();

  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.translationGroupId, groupId));

  if (posts.length === 0) notFound();

  const primary = posts.find((p) => p.locale === "nl") ?? posts[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={primary.title}
        description="Bewerk dit artikel per taal. Gedeelde velden gelden voor alle talen."
      />
      <BlogEditor groupId={groupId} posts={posts} savedLocale={saved} />
    </div>
  );
}
