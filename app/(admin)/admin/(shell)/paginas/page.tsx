import Link from "next/link";
import { asc } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { pages, type Page } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

function localeChipLabel(locale: string | null) {
  if (locale === null) return "ALL";
  return locale.toUpperCase();
}

export default async function PaginasPage() {
  await requireSession();

  let rows: Page[] = [];
  let dbError = false;
  try {
    rows = await db.select().from(pages).orderBy(asc(pages.slug));
  } catch {
    dbError = true;
  }

  // Eén rij per slug: alle taalvarianten (ALL/NL/EN) gegroepeerd.
  const grouped = new Map<string, Page[]>();
  for (const row of rows) {
    const existing = grouped.get(row.slug);
    if (existing) existing.push(row);
    else grouped.set(row.slug, [row]);
  }
  const entries = [...grouped.entries()];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pagina's"
        description="Beheer CMS-pagina's en hun taalvarianten."
        createHref="/admin/paginas/nieuw"
        createLabel="Nieuwe pagina"
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
        {entries.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            Nog geen pagina&apos;s. Maak de eerste aan via &ldquo;Nieuwe pagina&rdquo;.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Titel</th>
                <th className="px-5 py-3">Talen</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(([slug, variants]) => {
                const anyPublished = variants.some((v) => v.published);
                return (
                  <tr key={slug} className="align-top">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/admin/paginas/${slug}`}
                        className="font-medium text-navy hover:text-gold transition-colors"
                      >
                        /{slug}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{variants[0].title}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {variants.map((variant) => (
                          <span
                            key={variant.id}
                            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                          >
                            {localeChipLabel(variant.locale)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={anyPublished ? "published" : "draft"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
