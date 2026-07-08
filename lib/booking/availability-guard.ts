import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { getDayData } from "./queries";

export type SlotCheckResult = { ok: true } | { ok: false; code: "dateUnavailable" | "slotTaken" };

// Server-side re-check of a requested slot — never trust client state.
// Used by both the public and the admin booking-creation actions.
export async function checkSlotAvailable(date: string, time: string): Promise<SlotCheckResult> {
  const day = await getDayData(date);
  const slot = day.slots.find((s) => s.time === time);
  if (!day.open || !slot) {
    return { ok: false, code: "dateUnavailable" };
  }
  if (!slot.available) {
    return { ok: false, code: "slotTaken" };
  }

  const existing = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(eq(appointments.date, date), eq(appointments.time, time), ne(appointments.status, "cancelled")))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, code: "slotTaken" };
  }

  return { ok: true };
}
