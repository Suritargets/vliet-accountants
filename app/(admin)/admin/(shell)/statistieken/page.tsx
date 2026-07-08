import { count, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function getTotals(since: Date) {
  const [row] = await db
    .select({
      total: count(),
      unique: sql<number>`count(distinct ${pageViews.visitorHash})`,
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));
  return { total: row?.total ?? 0, unique: Number(row?.unique ?? 0) };
}

export default async function StatistiekenPage() {
  await requireSession();

  const [today, last7, last30] = await Promise.all([
    getTotals(daysAgo(1)),
    getTotals(daysAgo(7)),
    getTotals(daysAgo(30)),
  ]);

  const countries = await db
    .select({ country: pageViews.country, total: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(pageViews.country)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const devices = await db
    .select({ deviceType: pageViews.deviceType, total: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(pageViews.deviceType)
    .orderBy(sql`count(*) desc`);

  const trend = await db
    .select({
      day: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`,
      total: count(),
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, daysAgo(30)))
    .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`);

  const maxTrend = Math.max(1, ...trend.map((t) => t.total));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Statistieken"
        description="Privacy-vriendelijk bezoekersoverzicht — geen individuele IP-adressen worden opgeslagen."
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Vandaag", data: today },
          { label: "Laatste 7 dagen", data: last7 },
          { label: "Laatste 30 dagen", data: last30 },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-navy">{card.data.total}</p>
            <p className="text-sm text-gray-500">bezoeken · {card.data.unique} unieke bezoekers</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">Top landen (30 dagen)</h2>
          {countries.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen data.</p>
          ) : (
            <ul className="space-y-2">
              {countries.map((c) => (
                <li key={c.country} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{c.country}</span>
                  <span className="text-navy font-medium">{c.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-navy mb-4">Apparaten (30 dagen)</h2>
          {devices.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen data.</p>
          ) : (
            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={d.deviceType} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{d.deviceType}</span>
                  <span className="text-navy font-medium">{d.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-navy mb-4">Trend (laatste 30 dagen)</h2>
        {trend.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen data.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {trend.map((t) => (
              <div
                key={t.day}
                className="flex-1 bg-gold/70 rounded-t hover:bg-gold transition-colors"
                style={{ height: `${Math.max(4, (t.total / maxTrend) * 100)}%` }}
                title={`${t.day}: ${t.total} bezoeken`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
