import "server-only";
import { and, gte, lte, ne, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointments,
  availabilityConfig,
  availabilityOverrides,
} from "@/drizzle/schema";
import {
  getDayAvailability,
  getMonthAvailability,
  weekdayOf,
  type MonthDay,
  type Slot,
} from "./slots";

/** Month view in exactly 3 batched queries (configs, overrides, booked pairs). */
export async function getMonthData(month: string): Promise<MonthDay[]> {
  const first = `${month}-01`;
  const last = `${month}-31`; // string comparison upper bound; '31' safely covers all months

  const [configs, overrides, booked] = await Promise.all([
    db.select().from(availabilityConfig),
    db
      .select()
      .from(availabilityOverrides)
      .where(and(gte(availabilityOverrides.date, first), lte(availabilityOverrides.date, last))),
    db
      .select({ date: appointments.date, time: appointments.time })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, first),
          lte(appointments.date, last),
          ne(appointments.status, "cancelled")
        )
      ),
  ]);

  const bookedByDate = new Map<string, Set<string>>();
  for (const b of booked) {
    if (!bookedByDate.has(b.date)) bookedByDate.set(b.date, new Set());
    bookedByDate.get(b.date)!.add(b.time);
  }

  return getMonthAvailability(month, configs, overrides, bookedByDate);
}

/** Slot list for a single date. */
export async function getDayData(
  date: string
): Promise<{ open: boolean; slots: Slot[] }> {
  const dayOfWeek = weekdayOf(date);

  const [configRows, overrideRows, booked] = await Promise.all([
    db.select().from(availabilityConfig).where(eq(availabilityConfig.dayOfWeek, dayOfWeek)),
    db.select().from(availabilityOverrides).where(eq(availabilityOverrides.date, date)),
    db
      .select({ time: appointments.time })
      .from(appointments)
      .where(and(eq(appointments.date, date), ne(appointments.status, "cancelled"))),
  ]);

  return getDayAvailability(
    date,
    configRows[0],
    overrideRows[0],
    new Set(booked.map((b) => b.time))
  );
}
