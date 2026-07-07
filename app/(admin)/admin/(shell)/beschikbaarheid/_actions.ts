"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { availabilityConfig, availabilityOverrides } from "@/drizzle/schema";
import { requireSession } from "@/lib/auth";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export interface AvailabilityState {
  success: boolean;
  error: string | null;
}

/** Save the whole weekly grid in one submit (7 rows, upsert by day_of_week). */
export async function saveWeekConfig(
  _prev: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  await requireSession();

  try {
    for (let day = 0; day <= 6; day++) {
      const isActive = formData.get(`day-${day}-active`) === "on";
      const startTime = String(formData.get(`day-${day}-start`) ?? "08:00");
      const endTime = String(formData.get(`day-${day}-end`) ?? "16:00");
      const slotDuration = Number(formData.get(`day-${day}-duration`) ?? 60);

      if (isActive) {
        if (!timeSchema.safeParse(startTime).success || !timeSchema.safeParse(endTime).success) {
          return { success: false, error: `Ongeldige tijd voor dag ${day}.` };
        }
        if (startTime >= endTime) {
          return { success: false, error: "Starttijd moet vóór eindtijd liggen." };
        }
        if (!Number.isInteger(slotDuration) || slotDuration < 15 || slotDuration > 240) {
          return { success: false, error: "Duur per afspraak moet tussen 15 en 240 minuten liggen." };
        }
      }

      await db
        .insert(availabilityConfig)
        .values({ dayOfWeek: day, startTime, endTime, slotDuration, isActive })
        .onConflictDoUpdate({
          target: availabilityConfig.dayOfWeek,
          set: { startTime, endTime, slotDuration, isActive },
        });
    }

    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("saveWeekConfig failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
}

export async function addOverride(
  _prev: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  await requireSession();

  const date = String(formData.get("date") ?? "");
  const isClosed = formData.get("type") !== "custom";
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!dateSchema.safeParse(date).success) {
    return { success: false, error: "Ongeldige datum." };
  }
  if (!isClosed) {
    if (!timeSchema.safeParse(startTime).success || !timeSchema.safeParse(endTime).success) {
      return { success: false, error: "Vul geldige afwijkende tijden in." };
    }
    if (startTime >= endTime) {
      return { success: false, error: "Starttijd moet vóór eindtijd liggen." };
    }
  }

  try {
    await db
      .insert(availabilityOverrides)
      .values({
        date,
        isClosed,
        startTime: isClosed ? null : startTime,
        endTime: isClosed ? null : endTime,
        note,
      })
      .onConflictDoUpdate({
        target: availabilityOverrides.date,
        set: {
          isClosed,
          startTime: isClosed ? null : startTime,
          endTime: isClosed ? null : endTime,
          note,
        },
      });

    revalidatePath("/admin/beschikbaarheid");
    return { success: true, error: null };
  } catch (error) {
    console.error("addOverride failed:", error);
    return { success: false, error: "Opslaan mislukt. Probeer het opnieuw." };
  }
}

export async function deleteOverride(id: number) {
  await requireSession();
  await db.delete(availabilityOverrides).where(eq(availabilityOverrides.id, id));
  revalidatePath("/admin/beschikbaarheid");
}
