"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";

export async function markMessageRead(id: string) {
  await requireSession();
  await db.update(contactMessages).set({ status: "read" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/berichten");
}

export async function markMessageHandled(id: string) {
  await requireSession();
  await db.update(contactMessages).set({ status: "handled" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/berichten");
}
