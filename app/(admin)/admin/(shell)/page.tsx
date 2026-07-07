import Link from "next/link";
import { and, count, eq, gte, ne, asc } from "drizzle-orm";
import { CalendarCheck, FileText, Newspaper, Users, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { appointments, blogPosts, pages, vacancies } from "@/drizzle/schema";
import { nowInBusinessTz } from "@/lib/booking/slots";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

async function loadDashboard() {
  const { date: today } = nowInBusinessTz();

  const [pendingCount, upcoming, pageCount, postCount, vacancyCount] = await Promise.all([
    db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.status, "pending")),
    db
      .select()
      .from(appointments)
      .where(and(gte(appointments.date, today), ne(appointments.status, "cancelled")))
      .orderBy(asc(appointments.date), asc(appointments.time))
      .limit(8),
    db.select({ value: count() }).from(pages).where(eq(pages.published, true)),
    db.select({ value: count() }).from(blogPosts).where(eq(blogPosts.status, "published")),
    db.select({ value: count() }).from(vacancies).where(eq(vacancies.active, true)),
  ]);

  return {
    pending: pendingCount[0]?.value ?? 0,
    upcoming,
    pages: pageCount[0]?.value ?? 0,
    posts: postCount[0]?.value ?? 0,
    vacancies: vacancyCount[0]?.value ?? 0,
  };
}

export default async function AdminDashboardPage() {
  let data: Awaited<ReturnType<typeof loadDashboard>> | null = null;
  let dbError = false;
  try {
    data = await loadDashboard();
  } catch {
    dbError = true;
  }

  const stats = [
    { label: "Afspraken in afwachting", value: data?.pending ?? "—", href: "/admin/afspraken", icon: CalendarCheck },
    { label: "Gepubliceerde pagina's", value: data?.pages ?? "—", href: "/admin/paginas", icon: FileText },
    { label: "Gepubliceerde blogposts", value: data?.posts ?? "—", href: "/admin/blog", icon: Newspaper },
    { label: "Actieve vacatures", value: data?.vacancies ?? "—", href: "/admin/vacatures", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overzicht van afspraken en content.</p>
      </div>

      {dbError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Database niet bereikbaar — controleer <code className="font-mono">DATABASE_URL</code> in <code className="font-mono">.env.local</code> en draai <code className="font-mono">npm run db:push</code>.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-navy/20 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-navy" />
              </div>
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-navy">Eerstvolgende afspraken</h2>
          <Link href="/admin/afspraken" className="text-sm text-gold hover:underline">
            Alle afspraken →
          </Link>
        </div>
        {!data || data.upcoming.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Geen aankomende afspraken.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {data.upcoming.map((appointment) => (
              <li key={appointment.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{appointment.name}</p>
                  <p className="text-xs text-gray-500">
                    {appointment.date} om {appointment.time}
                    {appointment.topic ? ` · ${appointment.topic}` : ""}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
