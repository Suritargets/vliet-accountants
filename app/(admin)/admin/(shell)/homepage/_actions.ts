"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { homepageContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";

export interface HomepageActionState {
  success: boolean;
  error: string | null;
}

const localeSchema = z.enum(["nl", "en"]);

function field(formData: FormData, name: string, locale: string): string {
  return String(formData.get(`${name}-${locale}`) ?? "").trim();
}

function compactSection(section: Record<string, unknown>): Record<string, unknown> | undefined {
  const entries = Object.entries(section).filter(([, value]) => {
    if (typeof value === "string") return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export async function saveHomepage(
  _prev: HomepageActionState,
  formData: FormData
): Promise<HomepageActionState> {
  await requireSession();

  const localeParse = localeSchema.safeParse(formData.get("locale"));
  if (!localeParse.success) return { success: false, error: "Ongeldige taal." };
  const locale = localeParse.data;

  try {
    // Only meaningfully filled fields end up in the override — empty fields
    // fall back to the NL default (or NL override, for the EN view).
    const stats = [0, 1, 2, 3]
      .map((i) => ({
        value: field(formData, `stat-${i}-value`, locale),
        label: field(formData, `stat-${i}-label`, locale),
      }))
      .filter((s) => s.value || s.label);

    const paragraphs = [0, 1]
      .map((i) => field(formData, `about-paragraph-${i}`, locale))
      .filter(Boolean);
    const highlights = [0, 1, 2, 3]
      .map((i) => field(formData, `about-highlight-${i}`, locale))
      .filter(Boolean);

    const override: Record<string, unknown> = {};
    const sections: Record<string, Record<string, unknown> | undefined> = {
      hero: compactSection({
        badge: field(formData, "hero-badge", locale),
        titleLead: field(formData, "hero-titleLead", locale),
        titleAccent: field(formData, "hero-titleAccent", locale),
        subtitle: field(formData, "hero-subtitle", locale),
        ctaPrimary: field(formData, "hero-ctaPrimary", locale),
        ctaSecondary: field(formData, "hero-ctaSecondary", locale),
      }),
      about: compactSection({
        badge: field(formData, "about-badge", locale),
        title: field(formData, "about-title", locale),
        paragraphs: paragraphs.length ? paragraphs : undefined,
        highlights: highlights.length ? highlights : undefined,
        buttonLabel: field(formData, "about-buttonLabel", locale),
      }),
      servicesTeaser: compactSection({
        badge: field(formData, "teaser-badge", locale),
        title: field(formData, "teaser-title", locale),
        subtitle: field(formData, "teaser-subtitle", locale),
        readMore: field(formData, "teaser-readMore", locale),
      }),
      team: compactSection({
        badge: field(formData, "team-badge", locale),
        title: field(formData, "team-title", locale),
        subtitle: field(formData, "team-subtitle", locale),
      }),
      cta: compactSection({
        title: field(formData, "cta-title", locale),
        text: field(formData, "cta-text", locale),
        buttonLabel: field(formData, "cta-buttonLabel", locale),
      }),
    };
    for (const [key, section] of Object.entries(sections)) {
      if (section) override[key] = section;
    }
    // Stats are all-or-nothing: only override when all 4 rows are complete.
    if (stats.length === 4 && stats.every((s) => s.value && s.label)) {
      override.stats = stats;
    }

    const content = JSON.stringify(override);

    await db
      .insert(homepageContent)
      .values({ locale, content })
      .onConflictDoUpdate({
        target: homepageContent.locale,
        set: { content, updatedAt: new Date() },
      });

    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/admin/homepage");
    return { success: true, error: null };
  } catch (error) {
    console.error("saveHomepage failed:", error);
    await logError("saveHomepage", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
}
