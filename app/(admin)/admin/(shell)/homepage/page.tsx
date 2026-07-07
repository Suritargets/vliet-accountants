import { db } from "@/lib/db";
import { homepageContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { homepageDefaults } from "@/lib/content/homepage-defaults";
import { parseJsonContent } from "@/lib/content/merge";
import AdminPageHeader from "@/components/admin/admin-page-header";
import HomepageEditor from "./HomepageEditor";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await requireSession();

  let rows: (typeof homepageContent.$inferSelect)[] = [];
  try {
    rows = await db.select().from(homepageContent);
  } catch {
    rows = [];
  }

  const nlRaw = rows.find((r) => r.locale === "nl")?.content;
  const enRaw = rows.find((r) => r.locale === "en")?.content;

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Homepage"
        description="Bewerk de teksten van de homepage-secties. Lege velden gebruiken de standaardtekst."
      />
      <HomepageEditor
        nlValues={parseJsonContent(nlRaw) ?? {}}
        enValues={parseJsonContent(enRaw) ?? {}}
        defaults={homepageDefaults}
        hasNl={Boolean(nlRaw)}
        hasEn={Boolean(enRaw)}
      />
    </div>
  );
}
