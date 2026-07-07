import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";
import { BOOKING_TOPICS } from "@/lib/booking/constants";
import { confirmAppointment, cancelAppointment } from "./_actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "pending", label: "In afwachting" },
  { key: "confirmed", label: "Bevestigd" },
  { key: "cancelled", label: "Geannuleerd" },
] as const;

function topicLabel(key: string | null) {
  if (!key) return "—";
  const topic = BOOKING_TOPICS.find((t) => t.key === key);
  return topic?.label ?? "Algemene kennismaking";
}

export default async function AfsprakenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSession();
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.key === status) ? status! : "all";

  const rows = await db
    .select()
    .from(appointments)
    .where(
      filter === "all"
        ? undefined
        : eq(appointments.status, filter as "pending" | "confirmed" | "cancelled")
    )
    .orderBy(asc(appointments.date), asc(appointments.time), desc(appointments.createdAt));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Afspraken"
        description="Bevestig of annuleer binnengekomen afspraakverzoeken."
      />

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/afspraken" : `/admin/afspraken?status=${f.key}`}
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
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Geen afspraken gevonden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Datum & tijd</th>
                <th className="px-5 py-3">Naam</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Onderwerp</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((appointment) => (
                <tr key={appointment.id} className="align-top">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-medium text-navy">{appointment.date}</p>
                    <p className="text-gray-500">{appointment.time}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy">{appointment.name}</p>
                    {appointment.notes && (
                      <p className="text-xs text-gray-400 max-w-56 truncate" title={appointment.notes}>
                        {appointment.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-gray-600">{appointment.email}</p>
                    {appointment.phone && <p className="text-gray-400 text-xs">{appointment.phone}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{topicLabel(appointment.topic)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {appointment.status !== "confirmed" && (
                        <form action={confirmAppointment.bind(null, appointment.id)}>
                          <button
                            type="submit"
                            title="Bevestigen"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Bevestigen
                          </button>
                        </form>
                      )}
                      {appointment.status !== "cancelled" && (
                        <form action={cancelAppointment.bind(null, appointment.id)}>
                          <button
                            type="submit"
                            title="Annuleren"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Annuleren
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
