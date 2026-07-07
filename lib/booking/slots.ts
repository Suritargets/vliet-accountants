// Pure slot-computation logic. No framework or DB dependency.
// All dates/times are plain strings ('YYYY-MM-DD' / 'HH:mm') in the business
// timezone (America/Paramaribo) — never Date-with-offset arithmetic.

export const BUSINESS_TIMEZONE = "America/Paramaribo";

export interface DayConfig {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface DayOverride {
  date: string;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface Slot {
  time: string;
  available: boolean;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Weekday (0=Sunday..6=Saturday) of a 'YYYY-MM-DD' date, computed in UTC to avoid off-by-one. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Current date ('YYYY-MM-DD') and time ('HH:mm') in the business timezone. */
export function nowInBusinessTz(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`,
  };
}

export function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  if (durationMinutes <= 0) return slots;
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (current + durationMinutes <= end) {
    slots.push(toHHmm(current));
    current += durationMinutes;
  }
  return slots;
}

/**
 * Compute the slot list for one date. Past slots (for "today" in the business
 * timezone) are excluded entirely.
 */
export function getDayAvailability(
  date: string,
  config: DayConfig | undefined,
  override: DayOverride | undefined,
  bookedTimes: Set<string>
): { open: boolean; slots: Slot[] } {
  if (override?.isClosed) return { open: false, slots: [] };

  const startTime = override?.startTime ?? config?.startTime;
  const endTime = override?.endTime ?? config?.endTime;
  const duration = config?.slotDuration ?? 60;

  if (!startTime || !endTime) return { open: false, slots: [] };
  if (config && !config.isActive && !override) return { open: false, slots: [] };

  const now = nowInBusinessTz();
  if (date < now.date) return { open: false, slots: [] };

  let all = generateSlots(startTime, endTime, duration);
  if (date === now.date) {
    all = all.filter((t) => t > now.time);
  }

  const slots = all.map((time) => ({ time, available: !bookedTimes.has(time) }));
  return { open: slots.length > 0, slots };
}

export interface MonthDay {
  date: string;
  open: boolean;
  freeCount: number;
  totalCount: number;
}

/** All 'YYYY-MM-DD' dates of a 'YYYY-MM' month. */
export function datesOfMonth(month: string): string[] {
  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    return `${year}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
  });
}

/**
 * Month view: aggregate counts only (never slot detail, never PII).
 * Inputs are the batched query results for the whole month.
 */
export function getMonthAvailability(
  month: string,
  configs: DayConfig[],
  overrides: DayOverride[],
  bookedByDate: Map<string, Set<string>>
): MonthDay[] {
  const configByDay = new Map(configs.map((c) => [c.dayOfWeek, c]));
  const overrideByDate = new Map(overrides.map((o) => [o.date, o]));

  return datesOfMonth(month).map((date) => {
    const { open, slots } = getDayAvailability(
      date,
      configByDay.get(weekdayOf(date)),
      overrideByDate.get(date),
      bookedByDate.get(date) ?? new Set()
    );
    const freeCount = slots.filter((s) => s.available).length;
    return { date, open: open && freeCount > 0, freeCount, totalCount: slots.length };
  });
}
