"use server";

import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { getDayData } from "@/lib/booking/queries";
import { rateLimit } from "@/lib/rate-limit";
import { BOOKING_TOPIC_KEYS } from "@/lib/booking/constants";

const appointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  topic: z.string().refine((t) => BOOKING_TOPIC_KEYS.includes(t)),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(["nl", "en"]),
});

export type BookingActionState =
  | { status: "idle" }
  | { status: "success"; date: string; time: string; topic: string }
  | {
      status: "error";
      code: "rateLimited" | "invalid" | "dateUnavailable" | "slotTaken" | "generic";
    };

export async function createAppointment(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  // 1. Rate limit by IP (in-memory sliding window, fail-open).
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`book:${ip}`).allowed) {
    return { status: "error", code: "rateLimited" };
  }

  // 2. Validate input.
  const parsed = appointmentSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    topic: formData.get("topic"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { status: "error", code: "invalid" };
  }
  const data = parsed.data;

  try {
    // 3. Recompute availability server-side — never trust client state.
    const day = await getDayData(data.date);
    const slot = day.slots.find((s) => s.time === data.time);
    if (!day.open || !slot) {
      return { status: "error", code: "dateUnavailable" };
    }
    if (!slot.available) {
      return { status: "error", code: "slotTaken" };
    }

    // 4. Direct duplicate check, narrowing the race window further.
    const existing = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.date, data.date),
          eq(appointments.time, data.time),
          ne(appointments.status, "cancelled")
        )
      )
      .limit(1);
    if (existing.length > 0) {
      return { status: "error", code: "slotTaken" };
    }

    // 5. Insert. The partial unique index on (date, time) WHERE status !=
    // 'cancelled' is the final, airtight guard against a concurrent insert.
    await db.insert(appointments).values({
      date: data.date,
      time: data.time,
      topic: data.topic,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      notes: data.notes || null,
      locale: data.locale,
      status: "pending",
      ipAddress: ip === "unknown" ? null : ip,
    });

    return { status: "success", date: data.date, time: data.time, topic: data.topic };
  } catch (error) {
    // Unique-violation from the partial index → concurrent booking won the race.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointment failed:", error);
    return { status: "error", code: "generic" };
  }
}
