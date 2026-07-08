import { desc } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function LoginsPage() {
  await requireSession();

  const rows = await db
    .select()
    .from(adminLoginEvents)
    .orderBy(desc(adminLoginEvents.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Logins"
        description="Recente inlogpogingen op het admin-dashboard (laatste 200)."
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Nog geen inlogpogingen gelogd.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Tijdstip</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">IP-adres</th>
                <th className="px-5 py-3">Resultaat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {event.createdAt.toLocaleString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5 text-navy font-medium">{event.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{event.ipAddress ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    {event.success ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Geslaagd
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600">
                        <XCircle className="w-4 h-4" /> Mislukt
                      </span>
                    )}
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
