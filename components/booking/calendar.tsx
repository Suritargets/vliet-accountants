"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { EASE, DURATION } from "@/lib/booking/constants";

export interface MonthDayInfo {
  date: string;
  open: boolean;
  freeCount: number;
  totalCount: number;
}

function monthLabel(month: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00`));
}

/** Monday-first offset (0..6) of the first day of a 'YYYY-MM' month. */
function firstDayOffset(month: string) {
  const day = new Date(`${month}-01T00:00:00Z`).getUTCDay(); // 0=Sun..6=Sat
  return (day + 6) % 7;
}

export default function BookingCalendar({
  month,
  days,
  loading,
  locale,
  weekdays,
  canGoPrev,
  canGoNext,
  onMonthChange,
  onSelectDay,
  prevLabel,
  nextLabel,
}: {
  month: string; // 'YYYY-MM'
  days: MonthDayInfo[];
  loading: boolean;
  locale: string;
  weekdays: string[]; // Monday-first labels
  canGoPrev: boolean;
  canGoNext: boolean;
  onMonthChange: (direction: 1 | -1) => void;
  onSelectDay: (date: string) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  const offset = firstDayOffset(month);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.base, ease: EASE }}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          aria-label={prevLabel}
          disabled={!canGoPrev}
          onClick={() => onMonthChange(-1)}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-navy transition-colors hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-navy"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-navy font-semibold capitalize">{monthLabel(month, locale)}</p>
        <button
          type="button"
          aria-label={nextLabel}
          disabled={!canGoNext}
          onClick={() => onMonthChange(1)}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-navy transition-colors hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-navy"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className={`grid grid-cols-7 gap-1.5 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dayNumber = Number(day.date.slice(-2));
          const selectable = day.open && day.freeCount > 0;
          return (
            <button
              key={day.date}
              type="button"
              disabled={!selectable}
              onClick={() => onSelectDay(day.date)}
              className={`aspect-square rounded-lg border text-sm font-medium flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                selectable
                  ? "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/5 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                  : "border-transparent bg-gray-50/50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <span>{dayNumber}</span>
              {selectable && <span className="w-1 h-1 rounded-full bg-gold" />}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
