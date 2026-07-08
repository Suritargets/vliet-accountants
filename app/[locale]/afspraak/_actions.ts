"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { sendMail } from "@/lib/mail/send";
import { buildBookingConfirmationMail, buildOfficeNotificationMail } from "@/lib/mail/templates";

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
    // Also narrows the race window; the partial unique index (step 5) is
    // the final, airtight guard against a concurrent insert.
    const check = await checkSlotAvailable(data.date, data.time);
    if (!check.ok) {
      return { status: "error", code: check.code };
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

    // 6. Best-effort notification emails. sendMail() is fail-open — a mail
    // problem must never undo an already-successful booking.
    const topicLabel = resolveTopicLabel(data.topic, data.locale);
    await sendMail({
      to: data.email,
      ...buildBookingConfirmationMail({
        locale: data.locale,
        name: data.name,
        date: data.date,
        time: data.time,
        topicLabel,
      }),
    });
    await sendMail({
      to: process.env.OFFICE_NOTIFICATION_EMAIL || "info@vlietaccountants.com",
      ...buildOfficeNotificationMail({
        locale: data.locale,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        date: data.date,
        time: data.time,
        topicLabel,
        notes: data.notes || null,
      }),
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
