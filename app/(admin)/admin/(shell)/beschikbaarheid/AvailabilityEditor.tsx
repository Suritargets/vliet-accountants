"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import type { AvailabilityConfig, AvailabilityOverride } from "@/drizzle/schema";
import {
  saveWeekConfig,
  addOverride,
  deleteOverride,
  type AvailabilityState,
} from "./_actions";

const DAY_LABELS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
// Display order Monday-first.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const initialState: AvailabilityState = { success: false, error: null };

function Banner({ state }: { state: AvailabilityState }) {
  if (state.error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
        Opgeslagen.
      </p>
    );
  }
  return null;
}

export default function AvailabilityEditor({
  configs,
  overrides,
}: {
  configs: AvailabilityConfig[];
  overrides: AvailabilityOverride[];
}) {
  const [weekState, weekAction, weekPending] = useActionState(saveWeekConfig, initialState);
  const [overrideState, overrideAction, overridePending] = useActionState(addOverride, initialState);

  const configByDay = new Map(configs.map((c) => [c.dayOfWeek, c]));

  return (
    <div className="space-y-8">
      {/* Weekly grid */}
      <form action={weekAction} className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">Wekelijkse openingstijden</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Actieve dagen zijn boekbaar binnen de opgegeven tijden.
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {DAY_ORDER.map((day) => {
            const config = configByDay.get(day);
            return (
              <div key={day} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2.5 w-36 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`day-${day}-active`}
                    defaultChecked={config?.isActive ?? false}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1a2e5a]"
                  />
                  <span className="text-sm font-medium text-navy">{DAY_LABELS[day]}</span>
                </label>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <label className="sr-only" htmlFor={`day-${day}-start`}>Starttijd</label>
                  <input
                    id={`day-${day}-start`}
                    type="time"
                    name={`day-${day}-start`}
                    defaultValue={config?.startTime ?? "08:00"}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 focus:border-gold focus:outline-none"
                  />
                  <span className="text-gray-400">–</span>
                  <label className="sr-only" htmlFor={`day-${day}-end`}>Eindtijd</label>
                  <input
                    id={`day-${day}-end`}
                    type="time"
                    name={`day-${day}-end`}
                    defaultValue={config?.endTime ?? "16:00"}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <label htmlFor={`day-${day}-duration`} className="text-xs text-gray-400">
                    Duur (min)
                  </label>
                  <input
                    id={`day-${day}-duration`}
                    type="number"
                    name={`day-${day}-duration`}
                    min={15}
                    max={240}
                    step={15}
                    defaultValue={config?.slotDuration ?? 60}
                    className="w-20 rounded-lg border border-gray-200 px-2.5 py-1.5 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <Banner state={weekState} />
          <button
            type="submit"
            disabled={weekPending}
            className="ml-auto rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
          >
            {weekPending ? "Bezig…" : "Week opslaan"}
          </button>
        </div>
      </form>

      {/* Overrides */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">Uitzonderingen</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Feestdagen, sluitingsdagen of dagen met afwijkende tijden.
          </p>
        </div>

        <form action={overrideAction} className="px-5 py-4 border-b border-gray-50 flex items-end gap-3 flex-wrap">
          <div>
            <label htmlFor="override-date" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Datum
            </label>
            <input
              id="override-date"
              type="date"
              name="date"
              required
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="override-type" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Type
            </label>
            <select
              id="override-type"
              name="type"
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none bg-white"
            >
              <option value="closed">Gesloten</option>
              <option value="custom">Afwijkende tijden</option>
            </select>
          </div>
          <div>
            <label htmlFor="override-start" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Start
            </label>
            <input
              id="override-start"
              type="time"
              name="startTime"
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="override-end" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Eind
            </label>
            <input
              id="override-end"
              type="time"
              name="endTime"
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-40">
            <label htmlFor="override-note" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Notitie
            </label>
            <input
              id="override-note"
              type="text"
              name="note"
              maxLength={200}
              placeholder="bijv. Nationale feestdag"
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={overridePending}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
          >
            {overridePending ? "Bezig…" : "Toevoegen"}
          </button>
        </form>

        {overrideState.error && (
          <div className="px-5 pt-3">
            <Banner state={overrideState} />
          </div>
        )}

        {overrides.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Geen uitzonderingen ingesteld.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {overrides.map((override) => (
              <li key={override.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <span className="font-medium text-navy">{override.date}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      override.isClosed
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {override.isClosed
                      ? "Gesloten"
                      : `${override.startTime} – ${override.endTime}`}
                  </span>
                  {override.note && <span className="text-gray-400 text-xs">{override.note}</span>}
                </div>
                <form action={deleteOverride.bind(null, override.id)}>
                  <button
                    type="submit"
                    title="Verwijderen"
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
