"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Vacancy } from "@/drizzle/schema";
import StringListInput from "@/components/admin/string-list-input";
import { saveVacancy, deleteVacancy, type VacancyActionState } from "../_actions";

const initialState: VacancyActionState = { success: false, error: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

export default function VacancyEditor({
  vacancy,
  saved,
}: {
  vacancy: Vacancy | null;
  saved: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveVacancy, initialState);

  // Success from a client submit, or from the ?saved=1 redirect after aanmaken.
  const showSuccess = state.success || (saved && !state.error);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/vacatures"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Alle vacatures
        </Link>
        <h1 className="text-2xl font-bold text-navy">
          {vacancy ? "Vacature bewerken" : "Nieuwe vacature"}
        </h1>
        {vacancy && <p className="text-sm text-gray-500 mt-1">{vacancy.title}</p>}
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {state.error}
        </p>
      )}
      {!state.error && showSuccess && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
          Opgeslagen.
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-100">
        <form action={formAction} className="p-6 space-y-5">
          {vacancy && <input type="hidden" name="id" value={vacancy.id} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className={labelClass}>
                Titel
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                defaultValue={vacancy?.title ?? ""}
                placeholder="bijv. Beveiliger objectbeveiliging"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="locale" className={labelClass}>
                Taal
              </label>
              <select
                id="locale"
                name="locale"
                defaultValue={vacancy?.locale ?? "nl"}
                className={`${inputClass} bg-white`}
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className={labelClass}>
                Afdeling
              </label>
              <input
                id="department"
                type="text"
                name="department"
                defaultValue={vacancy?.department ?? ""}
                placeholder="bijv. Operatie"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>
                Locatie
              </label>
              <input
                id="location"
                type="text"
                name="location"
                defaultValue={vacancy?.location ?? ""}
                placeholder="bijv. Paramaribo"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employmentType" className={labelClass}>
                Dienstverband
              </label>
              <input
                id="employmentType"
                type="text"
                name="employmentType"
                defaultValue={vacancy?.employmentType ?? ""}
                placeholder="bijv. Fulltime"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="applyEmail" className={labelClass}>
                Sollicitatie e-mail
              </label>
              <input
                id="applyEmail"
                type="email"
                name="applyEmail"
                required
                defaultValue={vacancy?.applyEmail ?? ""}
                placeholder="sollicitatie@voorbeeld.sr"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Omschrijving
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={vacancy?.description ?? ""}
              placeholder="Korte introductie van de functie…"
              className={`${inputClass} resize-y`}
            />
          </div>

          <StringListInput
            name="duties"
            label="Werkzaamheden"
            defaultValue={vacancy?.duties ?? []}
            placeholder="bijv. Toegangscontrole en surveillance"
          />
          <StringListInput
            name="requirements"
            label="Wat zoeken wij"
            defaultValue={vacancy?.requirements ?? []}
            placeholder="bijv. Minimaal MULO-diploma"
          />
          <StringListInput
            name="offers"
            label="Wat bieden wij"
            defaultValue={vacancy?.offers ?? []}
            placeholder="bijv. Marktconform salaris"
          />

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <label className="flex items-center gap-2.5 cursor-pointer py-2.5">
              <input
                type="checkbox"
                name="active"
                defaultChecked={vacancy?.active ?? true}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a2e5a]"
              />
              <span className="text-sm font-medium text-navy">
                Actief — zichtbaar op de site
              </span>
            </label>
            <div>
              <label htmlFor="sortOrder" className={labelClass}>
                Volgorde
              </label>
              <input
                id="sortOrder"
                type="number"
                name="sortOrder"
                step={1}
                defaultValue={vacancy?.sortOrder ?? 0}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
            >
              {pending ? "Bezig…" : "Opslaan"}
            </button>
          </div>
        </form>

        {vacancy && (
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
            <p className="text-xs text-gray-400">
              Verwijderen haalt de vacature direct van de site. Dit kan niet ongedaan worden gemaakt.
            </p>
            {/* Separate form — a form element cannot be nested inside the main form. */}
            <form action={deleteVacancy.bind(null, vacancy.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Verwijderen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
