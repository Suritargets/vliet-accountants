import { desc } from "drizzle-orm";
import { AlertTriangle, Monitor, Server } from "lucide-react";
import { db } from "@/lib/db";
import { errorEvents } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function FoutenPage() {
  await requireSession();

  const rows = await db
    .select()
    .from(errorEvents)
    .orderBy(desc(errorEvents.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Foutmeldingen"
        description="Recente client- en server-fouten (laatste 200)."
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-gray-300" />
            Nog geen fouten gelogd.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Tijdstip</th>
                <th className="px-5 py-3">Bron</th>
                <th className="px-5 py-3">Context</th>
                <th className="px-5 py-3">Boodschap</th>
                <th className="px-5 py-3">Pad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                    {event.createdAt.toLocaleString("nl-NL")}
                  </td>
                  <td className="px-5 py-3.5">
                    {event.source === "client" ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <Monitor className="w-4 h-4" /> Client
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-600">
                        <Server className="w-4 h-4" /> Server
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-navy font-medium whitespace-nowrap">
                    {event.context ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-md truncate" title={event.message}>
                    {event.message}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {event.path ?? "—"}
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
