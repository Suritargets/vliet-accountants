"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { vacancies } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";

export interface VacancyActionState {
  success: boolean;
  error: string | null;
}

const vacancySchema = z.object({
  locale: z.enum(["nl", "en"]),
  title: z.string().trim().min(2, "Titel moet minimaal 2 tekens bevatten."),
  department: z.string().trim(),
  location: z.string().trim(),
  employmentType: z.string().trim(),
  description: z.string(),
  applyEmail: z.email("Vul een geldig e-mailadres in voor sollicitaties."),
  sortOrder: z.coerce.number().int("Volgorde moet een geheel getal zijn.").default(0),
});

/** StringListInput serializes to JSON — parse with a safe fallback. */
function parseStringList(value: FormDataEntryValue | null): string[] {
  try {
    const parsed = JSON.parse((value as string) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function revalidateVacancyPaths() {
  revalidatePath("/werken-bij-ons");
  revalidatePath("/en/werken-bij-ons");
  revalidatePath("/admin/vacatures");
}

export async function saveVacancy(
  _prev: VacancyActionState,
  formData: FormData
): Promise<VacancyActionState> {
  await requireSession();

  const parsed = vacancySchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title"),
    department: formData.get("department") ?? "",
    location: formData.get("location") ?? "",
    employmentType: formData.get("employmentType") ?? "",
    description: formData.get("description") ?? "",
    applyEmail: formData.get("applyEmail"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const values = {
    ...parsed.data,
    duties: parseStringList(formData.get("duties")),
    requirements: parseStringList(formData.get("requirements")),
    offers: parseStringList(formData.get("offers")),
    active: formData.get("active") === "on",
  };

  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    try {
      await db
        .update(vacancies)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(vacancies.id, id));
    } catch (error) {
      console.error("saveVacancy (update) failed:", error);
      return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
    }
    revalidateVacancyPaths();
    return { success: true, error: null };
  }

  let newId: string;
  try {
    const [inserted] = await db
      .insert(vacancies)
      .values(values)
      .returning({ id: vacancies.id });
    newId = inserted.id;
  } catch (error) {
    console.error("saveVacancy (insert) failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
  revalidateVacancyPaths();
  // redirect() throws — keep it outside try/catch.
  redirect(`/admin/vacatures/${newId}?saved=1`);
}

export async function deleteVacancy(id: string) {
  await requireSession();
  await db.delete(vacancies).where(eq(vacancies.id, id));
  revalidateVacancyPaths();
  redirect("/admin/vacatures");
}
