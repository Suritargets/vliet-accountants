"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appointments } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";
import { resolveTopicLabel } from "@/lib/booking/constants";
import { sendMail } from "@/lib/mail/send";
import { buildStatusChangeMail } from "@/lib/mail/templates";

const RETURNING = {
  name: appointments.name,
  email: appointments.email,
  date: appointments.date,
  time: appointments.time,
  topic: appointments.topic,
  locale: appointments.locale,
};

interface UpdatedAppointment {
  name: string;
  email: string;
  date: string;
  time: string;
  topic: string | null;
  locale: string;
}

async function notifyStatusChange(row: UpdatedAppointment, status: "confirmed" | "cancelled") {
  const locale = row.locale === "en" ? "en" : "nl";
  await sendMail({
    to: row.email,
    ...buildStatusChangeMail({
      locale,
      name: row.name,
      date: row.date,
      time: row.time,
      topicLabel: resolveTopicLabel(row.topic, locale),
      status,
    }),
  });
}

export async function confirmAppointment(id: string) {
  await requireSession();
  const [updated] = await db
    .update(appointments)
    .set({ status: "confirmed", confirmedAt: new Date(), cancelledAt: null })
    .where(eq(appointments.id, id))
    .returning(RETURNING);
  revalidatePath("/admin/afspraken");
  revalidatePath("/admin");

  if (updated) await notifyStatusChange(updated, "confirmed");
}

export async function cancelAppointment(id: string) {
  await requireSession();
  const [updated] = await db
    .update(appointments)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(appointments.id, id))
    .returning(RETURNING);
  revalidatePath("/admin/afspraken");
  revalidatePath("/admin");

  if (updated) await notifyStatusChange(updated, "cancelled");
}
