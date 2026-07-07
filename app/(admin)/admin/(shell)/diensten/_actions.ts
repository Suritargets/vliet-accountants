"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { servicesContent } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { SERVICE_KEYS } from "@/lib/content/services-defaults";

export interface ServiceActionState {
  success: boolean;
  error: string | null;
}

const schema = z.object({
  key: z.enum(SERVICE_KEYS),
  locale: z.enum(["nl", "en"]),
});

function parseList(raw: FormDataEntryValue | null): string[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string" && s.trim()) : [];
  } catch {
    return [];
  }
}

function parsePairs(raw: FormDataEntryValue | null): { title: string; description: string }[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) => p && typeof p.title === "string" && typeof p.description === "string"
    );
  } catch {
    return [];
  }
}

export async function saveService(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  await requireSession();

  const parsed = schema.safeParse({
    key: formData.get("key"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return { success: false, error: "Ongeldige dienst of taal." };
  const { key, locale } = parsed.data;

  const text = (name: string) => String(formData.get(`${name}-${locale}`) ?? "").trim();

  try {
    // Only filled fields become part of the override; empty fields fall back
    // to the code defaults (or the NL override, for the EN view).
    const override: Record<string, unknown> = {};
    const fields: Record<string, unknown> = {
      badge: text("badge"),
      title: text("title"),
      subtitle: text("subtitle"),
      intro: parseList(formData.get(`intro-${locale}`)),
      services: parsePairs(formData.get(`services-${locale}`)),
      whyUs: parseList(formData.get(`whyUs-${locale}`)),
      ctaTitle: text("ctaTitle"),
      ctaText: text("ctaText"),
      image: text("image"),
    };
    for (const [name, value] of Object.entries(fields)) {
      if (typeof value === "string" ? value : (value as unknown[]).length) {
        override[name] = value;
      }
    }

    const content = JSON.stringify(override);

    await db
      .insert(servicesContent)
      .values({ serviceKey: key, locale, content })
      .onConflictDoUpdate({
        target: [servicesContent.serviceKey, servicesContent.locale],
        set: { content, updatedAt: new Date() },
      });

    const publicPath = key === "diensten-index" ? "/diensten" : `/diensten/${key}`;
    revalidatePath(publicPath);
    revalidatePath(`/en${publicPath}`);
    revalidatePath("/diensten");
    revalidatePath("/en/diensten");
    revalidatePath(`/admin/diensten/${key}`);
    return { success: true, error: null };
  } catch (error) {
    console.error("saveService failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
}
