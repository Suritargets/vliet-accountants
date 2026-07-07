import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { servicesContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/content/services-defaults";
import AdminPageHeader from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminDienstenPage() {
  await requireSession();

  let overrides: { serviceKey: string; locale: string }[] = [];
  try {
    overrides = await db
      .select({ serviceKey: servicesContent.serviceKey, locale: servicesContent.locale })
      .from(servicesContent);
  } catch {
    overrides = [];
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Diensten"
        description="Bewerk de teksten van de dienstenpagina's. Lege velden gebruiken de standaardtekst."
      />

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {SERVICE_KEYS.map((key) => {
          const locales = overrides.filter((o) => o.serviceKey === key).map((o) => o.locale);
          return (
            <Link
              key={key}
              href={`/admin/diensten/${key}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-navy">{SERVICE_LABELS[key]}</p>
                <p className="text-xs text-gray-400">{key}</p>
              </div>
              <div className="flex items-center gap-2">
                {(["nl", "en"] as const).map((locale) => (
                  <span
                    key={locale}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      locales.includes(locale)
                        ? "border-gold/40 bg-gold/10 text-navy"
                        : "border-gray-200 text-gray-300"
                    }`}
                    title={locales.includes(locale) ? "Aangepast" : "Standaardtekst"}
                  >
                    {locale}
                  </span>
                ))}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
