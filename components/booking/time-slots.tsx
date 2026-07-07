"use client";

import { motion } from "motion/react";
import { EASE, DURATION } from "@/lib/booking/constants";

export interface SlotInfo {
  time: string;
  available: boolean;
}

export default function TimeSlots({
  slots,
  selectedTime,
  onSelect,
  title,
}: {
  slots: SlotInfo[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
        {title}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const selected = slot.time === selectedTime;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                selected
                  ? "border-gold bg-gold/10 text-navy shadow-sm"
                  : slot.available
                    ? "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/5 cursor-pointer"
                    : "border-transparent bg-gray-50/50 text-gray-300 line-through cursor-not-allowed"
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
