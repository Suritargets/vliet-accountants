"use client";

import { useState, useActionState } from "react";
import { Trash2 } from "lucide-react";
import type { Page } from "@/drizzle/schema";
import LocaleTabs from "@/components/admin/locale-tabs";
import { savePage, deletePage, type PageActionState } from "../_actions";

const TABS = [
  { code: "all", label: "ALL" },
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
] as const;

type TabCode = (typeof TABS)[number]["code"];

const initialState: PageActionState = { success: false, error: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

function rowForLocale(rows: Page[], code: TabCode) {
  return rows.find((row) => (code === "all" ? row.locale === null : row.locale === code));
}

function Banner({ state }: { state: PageActionState }) {
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

function TabPanel({
  code,
  label,
  row,
  slug,
  isNew,
  visible,
}: {
  code: TabCode;
  label: string;
  row: Page | undefined;
  slug: string;
  isNew: boolean;
  visible: boolean;
}) {
  const [state, formAction, pending] = useActionState(savePage, initialState);

  return (
    // Panelen blijven altijd gemount (display:none) zodat onbewaarde
    // wijzigingen een tab-wissel overleven.
    <div style={{ display: visible ? "block" : "none" }}>
      <div className="bg-white rounded-xl border border-gray-100">
        <form action={formAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="locale" value={code} />
          <input type="hidden" name="isNew" value={isNew ? "1" : "0"} />

          <div className="px-5 py-5 space-y-5">
            <div>
              <label htmlFor={`title-${code}`} className={labelClass}>
                Titel
              </label>
              <input
                id={`title-${code}`}
                type="text"
                name="title"
                required
                maxLength={255}
                defaultValue={row?.title ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor={`content-${code}`} className={labelClass}>
                Inhoud (Markdown)
              </label>
              <textarea
                id={`content-${code}`}
                name="content"
                rows={14}
                defaultValue={row?.content ?? ""}
                className={`${inputClass} font-mono text-sm`}
              />
            </div>

            <div>
              <label htmlFor={`metaTitle-${code}`} className={labelClass}>
                Meta titel
              </label>
              <input
                id={`metaTitle-${code}`}
                type="text"
                name="metaTitle"
                maxLength={255}
                defaultValue={row?.metaTitle ?? ""}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor={`metaDescription-${code}`} className={labelClass}>
                Meta omschrijving
              </label>
              <textarea
                id={`metaDescription-${code}`}
                name="metaDescription"
                rows={2}
                maxLength={500}
                defaultValue={row?.metaDescription ?? ""}
                className={inputClass}
              />
            </div>

            <label
              htmlFor={`published-${code}`}
              className="flex items-center gap-2.5 cursor-pointer w-fit"
            >
              <input
                id={`published-${code}`}
                type="checkbox"
                name="published"
                defaultChecked={row?.published ?? false}
                className="w-4 h-4 rounded border-gray-300 accent-[#1a2e5a]"
              />
              <span className="text-sm font-medium text-navy">Gepubliceerd</span>
            </label>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <Banner state={state} />
            <button
              type="submit"
              disabled={pending}
              className="ml-auto rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
            >
              {pending ? "Bezig…" : "Opslaan"}
            </button>
          </div>
        </form>

        {row && (
          // Apart formulier (niet genest in het opslaanformulier hierboven),
          // visueel in dezelfde panel-footer.
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Verwijdert alleen de variant {label} van deze pagina.
            </p>
            <form action={deletePage.bind(null, row.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Variant {label} verwijderen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageEditor({
  slug,
  rows,
  isNew,
}: {
  slug: string | null;
  rows: Page[];
  isNew: boolean;
}) {
  const [active, setActive] = useState<string>("all");
  const [slugValue, setSlugValue] = useState(slug ?? "");

  const tabs = TABS.map((tab) => ({
    code: tab.code,
    label: tab.label,
    hasContent: rowForLocale(rows, tab.code) !== undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-5">
        <label htmlFor="page-slug" className={labelClass}>
          Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/</span>
          <input
            id="page-slug"
            type="text"
            value={slugValue}
            onChange={(event) => setSlugValue(event.target.value)}
            disabled={!isNew}
            placeholder="bijv. onze-aanpak"
            className={`${inputClass} max-w-sm disabled:bg-gray-50 disabled:text-gray-500`}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {isNew
            ? "Kleine letters, cijfers en streepjes. Geldt voor alle taalvarianten."
            : "De slug is vergrendeld — wijzigen zou de publieke URL breken."}
        </p>
      </div>

      <div>
        <LocaleTabs tabs={tabs} active={active} onChange={setActive} />

        {TABS.map((tab) => (
          <TabPanel
            key={tab.code}
            code={tab.code}
            label={tab.label}
            row={rowForLocale(rows, tab.code)}
            slug={slugValue}
            isNew={isNew}
            visible={active === tab.code}
          />
        ))}
      </div>
    </div>
  );
}
