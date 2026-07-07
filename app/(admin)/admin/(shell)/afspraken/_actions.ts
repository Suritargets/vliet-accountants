"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";

export async function confirmAppointment(id: string) {
  await requireSession();
  await db
    .update(appointments)
    .set({ status: "confirmed", confirmedAt: new Date(), cancelledAt: null })
    .where(eq(appointments.id, id));
  revalidatePath("/admin/afspraken");
  revalidatePath("/admin");
}

export async function cancelAppointment(id: string) {
  await requireSession();
  await db
    .update(appointments)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(appointments.id, id));
  revalidatePath("/admin/afspraken");
  revalidatePath("/admin");
}
