import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import PageEditor from "./PageEditor";

export const dynamic = "force-dynamic";

export default async function PaginaEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSession();
  const { slug } = await params;
  const { saved } = await searchParams;

  const rows = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .orderBy(asc(pages.locale));

  if (rows.length === 0) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`/${slug}`}
        description="Bewerk deze pagina per taal. ALL geldt als terugval voor elke taal."
      />

      {saved === "1" && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
          Pagina aangemaakt en opgeslagen.
        </p>
      )}

      <PageEditor slug={slug} rows={rows} isNew={false} />
    </div>
  );
}
