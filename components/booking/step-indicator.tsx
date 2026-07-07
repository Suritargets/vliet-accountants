"use client";

export type BookingStep = "date" | "service" | "details" | "done";

const STEP_ORDER = ["date", "service", "details"] as const;

export default function StepIndicator({
  current,
  labels,
}: {
  current: BookingStep;
  labels: Record<"date" | "service" | "details", string>;
}) {
  if (current === "done") return null;
  const currentIndex = STEP_ORDER.indexOf(current as (typeof STEP_ORDER)[number]);

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {STEP_ORDER.map((step, i) => (
        <div key={step}>
          <div
            className={`h-1 rounded-full transition-colors duration-300 ${
              i <= currentIndex ? "bg-gold" : "bg-gray-200"
            }`}
          />
          <p
            className={`mt-2 text-[11px] font-semibold uppercase tracking-widest ${
              i <= currentIndex ? "text-navy" : "text-gray-400"
            }`}
          >
            {labels[step]}
          </p>
        </div>
      ))}
    </div>
  );
}
