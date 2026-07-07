import { requireSession } from "@/lib/auth";
import AdminPageHeader from "@/components/admin/admin-page-header";
import PageEditor from "../[slug]/PageEditor";

export default async function NieuwePaginaPage() {
  await requireSession();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nieuwe pagina"
        description="Kies een slug en vul de eerste taalvariant in. Na de eerste keer opslaan open je de editor."
      />
      <PageEditor slug={null} rows={[]} isNew={true} />
    </div>
  );
}
