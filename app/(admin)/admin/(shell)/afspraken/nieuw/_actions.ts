"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { appointmentSchema, type BookingActionState } from "@/lib/booking/schema";
import { checkSlotAvailable } from "@/lib/booking/availability-guard";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { sendMail } from "@/lib/mail/send";
import { buildStatusChangeMail } from "@/lib/mail/templates";

export async function createAppointmentAdmin(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  await requireSession();

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
    const check = await checkSlotAvailable(data.date, data.time);
    if (!check.ok) {
      return { status: "error", code: check.code };
    }

    await db.insert(appointments).values({
      date: data.date,
      time: data.time,
      topic: data.topic,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      notes: data.notes || null,
      locale: data.locale,
      status: "confirmed",
      confirmedAt: new Date(),
    });

    const topicLabel = resolveTopicLabel(data.topic, data.locale);
    await sendMail({
      to: data.email,
      ...buildStatusChangeMail({
        locale: data.locale,
        name: data.name,
        date: data.date,
        time: data.time,
        topicLabel,
        status: "confirmed",
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_date_time_active_uq") || message.includes("duplicate key")) {
      return { status: "error", code: "slotTaken" };
    }
    console.error("createAppointmentAdmin failed:", error);
    return { status: "error", code: "generic" };
  }

  redirect("/admin/afspraken");
}
