import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { vacancies, type Vacancy } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

export default async function VacaturesPage() {
  await requireSession();

  let rows: Vacancy[] = [];
  let dbError = false;
  try {
    rows = await db
      .select()
      .from(vacancies)
      .orderBy(asc(vacancies.sortOrder), desc(vacancies.createdAt));
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vacatures"
        description="Beheer de vacatures op de werken-bij-ons pagina."
        createHref="/admin/vacatures/nieuw"
        createLabel="Nieuwe vacature"
      />

      {dbError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Database niet bereikbaar — controleer <code className="font-mono">DATABASE_URL</code> in{" "}
          <code className="font-mono">.env.local</code> en draai{" "}
          <code className="font-mono">npm run db:push</code>.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            {dbError ? "Vacatures konden niet geladen worden." : "Nog geen vacatures. Maak de eerste aan."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Titel</th>
                <th className="px-5 py-3">Afdeling</th>
                <th className="px-5 py-3">Locatie</th>
                <th className="px-5 py-3">Taal</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Volgorde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((vacancy) => (
                <tr key={vacancy.id} className="align-top">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/vacatures/${vacancy.id}`}
                      className="font-medium text-navy hover:text-gold transition-colors"
                    >
                      {vacancy.title}
                    </Link>
                    {vacancy.employmentType && (
                      <p className="text-xs text-gray-400">{vacancy.employmentType}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{vacancy.department || "—"}</td>
                  <td className="px-5 py-3.5 text-gray-600">{vacancy.location || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                      {vacancy.locale === "en" ? "EN" : "NL"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={vacancy.active ? "active" : "inactive"} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{vacancy.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
