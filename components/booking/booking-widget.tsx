"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, Check, ChevronDown } from "lucide-react";
import { createAppointment } from "@/app/[locale]/afspraak/_actions";
import type { BookingActionState } from "@/lib/booking/schema";

type BookingAction = (
  prevState: BookingActionState,
  formData: FormData
) => Promise<BookingActionState>;
import { BOOKING_TOPICS, EASE, DURATION } from "@/lib/booking/constants";
import BookingCalendar, { type MonthDayInfo } from "./calendar";
import TimeSlots, { type SlotInfo } from "./time-slots";
import StepIndicator, { type BookingStep } from "./step-indicator";

const MAX_MONTHS_AHEAD = 3;

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

const initialState: BookingActionState = { status: "idle" };

export default function BookingWidget({
  action = createAppointment,
}: {
  action?: BookingAction;
} = {}) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const [rawStep, setStep] = useState<BookingStep>("date");
  const [month, setMonth] = useState(currentMonth);
  const [monthDays, setMonthDays] = useState<MonthDayInfo[]>([]);
  const [monthLoading, setMonthLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(action, initialState);

  // Success is derived, not stored — the widget shows the confirmation as
  // soon as the server action reports success.
  const step: BookingStep = state.status === "success" ? "done" : rawStep;

  // Load month availability. `monthLoading` is set to true in the month-change
  // handler (and starts true), so the effect only flips it off async.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/appointments/month?month=${month}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setMonthDays(data.days ?? []);
      })
      .catch(() => {
        if (!cancelled) setMonthDays([]);
      })
      .finally(() => {
        if (!cancelled) setMonthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  // Load day slots once a date is picked.
  const selectDay = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSlotsLoading(true);
    fetch(`/api/appointments/slots?date=${date}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  const clearDay = useCallback(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
  }, []);

  // If the slot was taken/date gone while filling the form, send the user
  // back to step 1 with fresh slot data. Reacting to the action result is a
  // genuine external-system sync, hence the effect.
  useEffect(() => {
    if (
      state.status === "error" &&
      (state.code === "slotTaken" || state.code === "dateUnavailable")
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("date");
      setSelectedTime(null);
      if (selectedDate) selectDay(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const topicLabel = useMemo(() => {
    const topic = BOOKING_TOPICS.find((topicOption) => topicOption.key === selectedTopic);
    if (!topic) return "";
    return topic.label ?? t("service.general");
  }, [selectedTopic, t]);

  const weekdays = t.raw("calendar.weekdays") as string[];
  const monthNow = currentMonth();

  const errorMessage =
    state.status === "error" ? t(`errors.${state.code}`) : null;

  const summaryRows = (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 mb-6 flex flex-wrap gap-x-8 gap-y-1 text-sm">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
          {t("summary.date")}
        </span>
        <span className="text-navy font-medium capitalize">
          {selectedDate ? formatDate(selectedDate, locale) : ""}
        </span>
      </div>
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
          {t("summary.time")}
        </span>
        <span className="text-navy font-medium">{selectedTime}</span>
      </div>
      {step === "details" && selectedTopic && (
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
            {t("summary.topic")}
          </span>
          <span className="text-navy font-medium">{topicLabel}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator
        current={step}
        labels={{
          date: t("steps.date"),
          service: t("steps.service"),
          details: t("steps.details"),
        }}
      />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 sm:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ── Step 1: date + time (accordion) ─────────────────────────── */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: DURATION.base, ease: EASE }}
            >
              <AnimatePresence initial={false}>
                {!selectedDate ? (
                  <motion.div
                    key="calendar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: DURATION.base, ease: EASE }}
                  >
                    <BookingCalendar
                      month={month}
                      days={monthDays}
                      loading={monthLoading}
                      locale={locale}
                      weekdays={weekdays}
                      canGoPrev={month > monthNow}
                      canGoNext={month < shiftMonth(monthNow, MAX_MONTHS_AHEAD)}
                      onMonthChange={(d) => {
                        setMonthLoading(true);
                        setMonth((m) => shiftMonth(m, d));
                      }}
                      onSelectDay={selectDay}
                      prevLabel={t("calendar.prevMonth")}
                      nextLabel={t("calendar.nextMonth")}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="slots"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: DURATION.base, ease: EASE }}
                  >
                    {/* Collapsed calendar summary bar */}
                    <button
                      type="button"
                      onClick={clearDay}
                      className="w-full flex items-center justify-between rounded-lg border border-gold/40 bg-gold/5 px-4 py-3 mb-5 text-left transition-colors hover:bg-gold/10 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-navy font-medium text-sm capitalize">
                        <CalendarDays className="w-4 h-4 text-gold" />
                        {formatDate(selectedDate, locale)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
                        {t("calendar.changeDate")}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {slotsLoading ? (
                      <p className="text-sm text-gray-400 py-6 text-center">
                        {t("calendar.loading")}
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">
                        {t("calendar.noSlots")}
                      </p>
                    ) : (
                      <TimeSlots
                        slots={slots}
                        selectedTime={selectedTime}
                        onSelect={(time) => {
                          setSelectedTime(time);
                          setStep("service");
                        }}
                        title={t("calendar.chooseTime")}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMessage && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                  {errorMessage}
                </p>
              )}
            </motion.div>
          )}

          {/* ── Step 2: topic ────────────────────────────────────────────── */}
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: DURATION.base, ease: EASE }}
            >
              {summaryRows}
              <h2 className="text-xl font-bold text-navy mb-1">{t("service.title")}</h2>
              <p className="text-sm text-gray-500 mb-6">{t("service.subtitle")}</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {BOOKING_TOPICS.map((topic) => {
                  const label = topic.label ?? t("service.general");
                  const selected = selectedTopic === topic.key;
                  return (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => setSelectedTopic(topic.key)}
                      className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                        selected
                          ? "border-navy bg-navy text-white shadow-md"
                          : "border-gray-200 bg-white text-navy hover:border-gold hover:bg-gold/5 cursor-pointer"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        {label}
                        {selected && <Check className="w-4 h-4 text-gold shrink-0" />}
                      </span>
                      {topic.label === null && (
                        <span className={`block mt-1 text-xs font-normal ${selected ? "text-white/70" : "text-gray-400"}`}>
                          {t("service.generalDesc")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("date")}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {t("service.back")}
                </button>
                <button
                  type="button"
                  disabled={!selectedTopic}
                  onClick={() => setStep("details")}
                  className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("service.continue")}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: details form ─────────────────────────────────────── */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: DURATION.base, ease: EASE }}
            >
              {summaryRows}
              <h2 className="text-xl font-bold text-navy mb-1">{t("details.title")}</h2>
              <p className="text-sm text-gray-500 mb-6">{t("details.subtitle")}</p>

              <form action={formAction} className="space-y-4">
                <input type="hidden" name="date" value={selectedDate ?? ""} />
                <input type="hidden" name="time" value={selectedTime ?? ""} />
                <input type="hidden" name="topic" value={selectedTopic ?? ""} />
                <input type="hidden" name="locale" value={locale} />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="booking-name" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                      {t("details.name")} *
                    </label>
                    <input
                      id="booking-name"
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder={t("details.namePlaceholder")}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-email" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                      {t("details.email")} *
                    </label>
                    <input
                      id="booking-email"
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      placeholder={t("details.emailPlaceholder")}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="booking-phone" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                    {t("details.phone")}
                  </label>
                  <input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    maxLength={40}
                    placeholder={t("details.phonePlaceholder")}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="booking-notes" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                    {t("details.notes")}
                  </label>
                  <textarea
                    id="booking-notes"
                    name="notes"
                    rows={4}
                    maxLength={2000}
                    placeholder={t("details.notesPlaceholder")}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors resize-y"
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("service")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t("details.back")}
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white uppercase tracking-wider transition-colors hover:bg-gold/90 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {pending ? t("details.submitting") : t("details.submit")}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── Step 4: confirmation ─────────────────────────────────────── */}
          {step === "done" && state.status === "success" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.slow, ease: EASE }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-3">{t("done.title")}</h2>
              <p className="text-gray-500 leading-relaxed max-w-md mx-auto mb-8">{t("done.text")}</p>

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-5 py-4 inline-flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm mb-8">
                <div className="text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
                    {t("summary.date")}
                  </span>
                  <span className="text-navy font-medium capitalize">
                    {formatDate(state.date, locale)}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
                    {t("summary.time")}
                  </span>
                  <span className="text-navy font-medium">{state.time}</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 block">
                    {t("summary.topic")}
                  </span>
                  <span className="text-navy font-medium">{topicLabel}</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-gray-500 hover:text-navy transition-colors underline underline-offset-4"
                >
                  {t("done.another")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
