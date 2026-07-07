import Link from "next/link";
import { desc } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { blogPosts, type BlogPost } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

interface BlogGroupRow {
  groupId: string;
  title: string;
  locales: string[];
  category: string | null;
  status: "draft" | "published";
}

function groupPosts(rows: BlogPost[]): BlogGroupRow[] {
  // Rows arrive ordered by createdAt desc, so insertion order keeps the
  // newest group first.
  const byGroup = new Map<string, BlogPost[]>();
  for (const row of rows) {
    const list = byGroup.get(row.translationGroupId);
    if (list) list.push(row);
    else byGroup.set(row.translationGroupId, [row]);
  }

  return [...byGroup.entries()].map(([groupId, posts]) => {
    const primary = posts.find((p) => p.locale === "nl") ?? posts[0];
    return {
      groupId,
      title: primary.title,
      locales: [...new Set(posts.map((p) => p.locale))].sort(),
      category: posts.find((p) => p.category)?.category ?? null,
      status: posts.some((p) => p.status === "published") ? "published" : "draft",
    };
  });
}

export default async function BlogListPage() {
  await requireSession();

  let groups: BlogGroupRow[] = [];
  let dbError = false;
  try {
    const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    groups = groupPosts(rows);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Beheer artikelen en hun vertalingen per taal."
        createHref="/admin/blog/nieuw"
        createLabel="Nieuw artikel"
      />

      {dbError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Database niet bereikbaar — controleer{" "}
          <code className="font-mono">DATABASE_URL</code> in{" "}
          <code className="font-mono">.env.local</code> en draai{" "}
          <code className="font-mono">npm run db:push</code>.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {groups.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            {dbError ? "Kon artikelen niet laden." : "Nog geen artikelen. Maak het eerste artikel aan."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Titel</th>
                <th className="px-5 py-3">Talen</th>
                <th className="px-5 py-3">Categorie</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((group) => (
                <tr key={group.groupId} className="align-top">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/blog/${group.groupId}`}
                      className="font-medium text-navy hover:text-gold transition-colors"
                    >
                      {group.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {group.locales.map((locale) => (
                        <span
                          key={locale}
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                        >
                          {locale}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{group.category ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={group.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
