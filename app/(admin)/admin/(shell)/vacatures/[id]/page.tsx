import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vacancies } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import VacancyEditor from "./VacancyEditor";

export const dynamic = "force-dynamic";

// Guard so non-uuid ids (typo'd URLs) 404 instead of throwing a Postgres cast error.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VacatureEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const { saved } = await searchParams;

  if (id === "nieuw") {
    return <VacancyEditor vacancy={null} saved={false} />;
  }

  if (!UUID_RE.test(id)) notFound();

  const [row] = await db.select().from(vacancies).where(eq(vacancies.id, id)).limit(1);
  if (!row) notFound();

  return <VacancyEditor vacancy={row} saved={saved === "1"} />;
}
