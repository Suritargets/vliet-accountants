import { asc, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilityConfig, availabilityOverrides } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { nowInBusinessTz } from "@/lib/booking/slots";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AvailabilityEditor from "./AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function BeschikbaarheidPage() {
  await requireSession();
  const { date: today } = nowInBusinessTz();

  const [configs, overrides] = await Promise.all([
    db.select().from(availabilityConfig).orderBy(asc(availabilityConfig.dayOfWeek)),
    db
      .select()
      .from(availabilityOverrides)
      .where(gte(availabilityOverrides.date, today))
      .orderBy(asc(availabilityOverrides.date)),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Beschikbaarheid"
        description="Stel in op welke dagen en tijden afspraken geboekt kunnen worden."
      />
      <AvailabilityEditor configs={configs} overrides={overrides} />
    </div>
  );
}
