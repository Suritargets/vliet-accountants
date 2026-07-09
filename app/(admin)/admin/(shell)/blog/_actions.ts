"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { blogPosts } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { logError } from "@/lib/error-log/log";

export interface BlogActionState {
  success: boolean;
  error: string | null;
}

const slugSchema = z.string().regex(/^[a-z0-9-]{2,160}$/);
const localeSchema = z.enum(["nl", "en"]);
const statusSchema = z.enum(["draft", "published"]);

function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Tolerant tag parsing: JSON array or comma-separated string. */
function parseTags(raw: string): string[] {
  const value = raw.trim();
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => String(t).trim()).filter(Boolean);
    }
  } catch {
    // Not JSON — fall through to comma-split.
  }
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function revalidateBlogPaths(slug: string) {
  revalidatePath("/blog");
  revalidatePath("/en/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/en/blog/${slug}`);
  revalidatePath("/admin/blog");
}

export async function saveBlogPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  await requireSession();

  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const category = String(formData.get("category") ?? "").trim() || null;
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const publishedAtRaw = String(formData.get("publishedAt") ?? "").trim();
  const rawGroupId = String(formData.get("groupId") ?? "nieuw");

  if (!slugSchema.safeParse(slug).success) {
    return {
      success: false,
      error: "Ongeldige slug. Gebruik alleen kleine letters, cijfers en streepjes (min. 2 tekens).",
    };
  }
  if (!title) {
    return { success: false, error: "Titel is verplicht." };
  }

  const localeResult = localeSchema.safeParse(formData.get("locale"));
  if (!localeResult.success) {
    return { success: false, error: "Ongeldige taal." };
  }
  const locale = localeResult.data;

  const statusResult = statusSchema.safeParse(formData.get("status"));
  if (!statusResult.success) {
    return { success: false, error: "Ongeldige status." };
  }
  const status = statusResult.data;

  let publishedAt: Date | null = null;
  if (publishedAtRaw) {
    const parsed = new Date(publishedAtRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { success: false, error: "Ongeldige publicatiedatum." };
    }
    publishedAt = parsed;
  }
  if (status === "published" && !publishedAt) {
    publishedAt = new Date();
  }

  const isNew = rawGroupId === "nieuw";
  const groupId = isNew ? crypto.randomUUID() : rawGroupId;

  // The slug field is freely editable on existing posts (unlike CMS pages,
  // where it's locked). Capture the pre-update slug so a rename can
  // revalidate the OLD path too -- otherwise its cached page would never
  // get invalidated and would keep serving stale content indefinitely.
  let previousSlug: string | null = null;
  if (!isNew) {
    const [existing] = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(and(eq(blogPosts.translationGroupId, groupId), eq(blogPosts.locale, locale)));
    previousSlug = existing?.slug ?? null;
  }

  try {
    await db
      .insert(blogPosts)
      .values({
        slug,
        locale,
        translationGroupId: groupId,
        title,
        excerpt,
        content,
        coverImage,
        tags,
        category,
        status,
        publishedAt,
      })
      .onConflictDoUpdate({
        target: [blogPosts.translationGroupId, blogPosts.locale],
        set: {
          slug,
          title,
          excerpt,
          content,
          coverImage,
          tags,
          category,
          status,
          publishedAt,
          updatedAt: new Date(),
        },
      });

    // Shared fields apply to the whole article group — sync every locale row.
    await db
      .update(blogPosts)
      .set({ category, coverImage, tags })
      .where(eq(blogPosts.translationGroupId, groupId));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("blog_posts_slug") || message.includes("duplicate key")) {
      return { success: false, error: "Deze slug is al in gebruik." };
    }
    console.error("saveBlogPost failed:", error);
    await logError("saveBlogPost", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidateBlogPaths(slug);
  if (previousSlug && previousSlug !== slug) revalidateBlogPaths(previousSlug);

  // redirect() throws — must stay outside try/catch.
  if (isNew) {
    redirect(`/admin/blog/${groupId}?saved=${locale}`);
  }

  return { success: true, error: null };
}

export async function deleteBlogPost(id: string) {
  await requireSession();

  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!row) return;

  await db.delete(blogPosts).where(eq(blogPosts.id, id));

  revalidateBlogPaths(row.slug);

  const remaining = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.translationGroupId, row.translationGroupId));

  if (remaining.length === 0) {
    redirect("/admin/blog");
  }
}
