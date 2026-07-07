import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { servicesContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import {
  SERVICE_KEYS,
  SERVICE_LABELS,
  servicesDefaults,
  type ServiceKey,
} from "@/lib/content/services-defaults";
import { parseJsonContent } from "@/lib/content/merge";
import AdminPageHeader from "@/components/admin/admin-page-header";
import ServiceEditor from "./ServiceEditor";

export const dynamic = "force-dynamic";

export default async function AdminServicePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  await requireSession();
  const { key } = await params;

  if (!SERVICE_KEYS.includes(key as ServiceKey)) notFound();
  const serviceKey = key as ServiceKey;

  let rows: (typeof servicesContent.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(servicesContent)
      .where(eq(servicesContent.serviceKey, serviceKey));
  } catch {
    rows = [];
  }

  const nlRaw = rows.find((r) => r.locale === "nl")?.content;
  const enRaw = rows.find((r) => r.locale === "en")?.content;

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title={SERVICE_LABELS[serviceKey]}
        description="Lege velden gebruiken de standaardtekst van deze dienst."
      />
      <ServiceEditor
        serviceKey={serviceKey}
        defaults={servicesDefaults[serviceKey]}
        nlValues={parseJsonContent(nlRaw) ?? {}}
        enValues={parseJsonContent(enRaw) ?? {}}
        hasNl={Boolean(nlRaw)}
        hasEn={Boolean(enRaw)}
      />
    </div>
  );
}
