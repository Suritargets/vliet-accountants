"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { pages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";

export interface PageActionState {
  success: boolean;
  error: string | null;
}

// Slugs die al door vaste routes van de site worden gebruikt.
const RESERVED_SLUGS = [
  "contact",
  "diensten",
  "blog",
  "afspraak",
  "over-ons",
  "werken-bij-ons",
  "admin",
  "api",
  "privacy-policy-admin",
];

const SLUG_REGEX = /^[a-z0-9-]{2,120}$/;

const saveSchema = z.object({
  slug: z.string().regex(SLUG_REGEX),
  title: z.string().min(1),
  locale: z.enum(["all", "nl", "en"]),
});

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function savePage(
  _prev: PageActionState,
  formData: FormData
): Promise<PageActionState> {
  await requireSession();

  const isNew = formData.get("isNew") === "1";
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const title = String(formData.get("title") ?? "").trim();
  const locale = String(formData.get("locale") ?? "");
  const content = String(formData.get("content") ?? "");
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const published = formData.get("published") === "on";

  const parsed = saveSchema.safeParse({ slug, title, locale });
  if (!parsed.success) {
    if (!SLUG_REGEX.test(slug)) {
      return {
        success: false,
        error: "Ongeldige slug. Gebruik 2–120 tekens: kleine letters, cijfers en streepjes.",
      };
    }
    if (!title) {
      return { success: false, error: "Titel is verplicht." };
    }
    return { success: false, error: "Ongeldige invoer." };
  }

  if (isNew && RESERVED_SLUGS.includes(parsed.data.slug)) {
    return {
      success: false,
      error: "Deze slug is gereserveerd voor een vaste pagina van de site. Kies een andere slug.",
    };
  }

  const localeValue = parsed.data.locale === "all" ? null : parsed.data.locale;

  try {
    await db
      .insert(pages)
      .values({
        slug: parsed.data.slug,
        locale: localeValue,
        title: parsed.data.title,
        content,
        metaTitle,
        metaDescription,
        published,
      })
      .onConflictDoUpdate({
        target: [pages.slug, pages.locale],
        set: {
          title: parsed.data.title,
          content,
          metaTitle,
          metaDescription,
          published,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/${parsed.data.slug}`);
    revalidatePath(`/en/${parsed.data.slug}`);
    revalidatePath("/admin/paginas");
  } catch (error) {
    console.error("savePage failed:", error);
    await logError("savePage", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  // redirect() throws, dus buiten de try/catch aanroepen.
  if (isNew) redirect(`/admin/paginas/${parsed.data.slug}?saved=1`);

  return { success: true, error: null };
}

export async function deletePage(id: string): Promise<void> {
  await requireSession();

  const [row] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!row) return;

  await db.delete(pages).where(eq(pages.id, id));

  revalidatePath(`/${row.slug}`);
  revalidatePath(`/en/${row.slug}`);
  revalidatePath("/admin/paginas");

  const remaining = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, row.slug))
    .limit(1);

  // redirect() throws, dus na de queries aanroepen.
  if (remaining.length === 0) redirect("/admin/paginas");

  revalidatePath(`/admin/paginas/${row.slug}`);
}
