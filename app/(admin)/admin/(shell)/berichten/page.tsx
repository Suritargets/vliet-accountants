import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Check, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";
import { markMessageRead, markMessageHandled } from "./_actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "new", label: "Nieuw" },
  { key: "read", label: "Gelezen" },
  { key: "handled", label: "Afgehandeld" },
] as const;

export default async function BerichtenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSession();
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.key === status) ? status! : "all";

  const rows = await db
    .select()
    .from(contactMessages)
    .where(filter === "all" ? undefined : eq(contactMessages.status, filter as "new" | "read" | "handled"))
    .orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Berichten"
        description="Contactformulier-inzendingen vanaf de website."
      />

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/berichten" : `/admin/berichten?status=${f.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? "border-navy bg-navy text-white font-medium"
                : "border-gray-200 bg-white text-gray-600 hover:border-navy/30"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Geen berichten gevonden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Datum</th>
                <th className="px-5 py-3">Naam</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Bericht</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((msg) => (
                <tr key={msg.id} className="align-top">
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {msg.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy">{msg.name}</p>
                    {msg.organization && <p className="text-xs text-gray-400">{msg.organization}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-600">{msg.email}</p>
                    {msg.phone && <p className="text-gray-400 text-xs">{msg.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-xs">
                    <p className="truncate" title={msg.message}>
                      {msg.message}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={msg.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {msg.status !== "read" && msg.status !== "handled" && (
                        <form action={markMessageRead.bind(null, msg.id)}>
                          <button
                            type="submit"
                            title="Markeer gelezen"
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Gelezen
                          </button>
                        </form>
                      )}
                      {msg.status !== "handled" && (
                        <form action={markMessageHandled.bind(null, msg.id)}>
                          <button
                            type="submit"
                            title="Markeer afgehandeld"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Afgehandeld
                          </button>
                        </form>
                      )}
                    </div>
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
