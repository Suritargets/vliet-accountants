"use client";

import { useActionState, useState } from "react";
import LocaleTabs from "@/components/admin/locale-tabs";
import MediaUpload from "@/components/admin/media-upload";
import StringListInput from "@/components/admin/string-list-input";
import PairListInput, { type TitleDescriptionPair } from "@/components/admin/pair-list-input";
import type { ServiceContent, ServiceKey } from "@/lib/content/services-defaults";
import { saveService, type ServiceActionState } from "../_actions";

const initialState: ServiceActionState = { success: false, error: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

type ServiceOverride = Partial<ServiceContent>;

function TabForm({
  serviceKey,
  locale,
  values,
  placeholders,
}: {
  serviceKey: ServiceKey;
  locale: "nl" | "en";
  values: ServiceOverride;
  placeholders: ServiceContent;
}) {
  const [state, formAction, pending] = useActionState(saveService, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="key" value={serviceKey} />
      <input type="hidden" name="locale" value={locale} />

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`badge-${locale}`} className={labelClass}>Badge</label>
            <input
              id={`badge-${locale}`}
              name={`badge-${locale}`}
              type="text"
              defaultValue={values.badge ?? ""}
              placeholder={placeholders.badge}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`title-${locale}`} className={labelClass}>Titel</label>
            <input
              id={`title-${locale}`}
              name={`title-${locale}`}
              type="text"
              defaultValue={values.title ?? ""}
              placeholder={placeholders.title}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor={`subtitle-${locale}`} className={labelClass}>Subtitel</label>
          <textarea
            id={`subtitle-${locale}`}
            name={`subtitle-${locale}`}
            rows={2}
            defaultValue={values.subtitle ?? ""}
            placeholder={placeholders.subtitle}
            className={`${inputClass} resize-y`}
          />
        </div>
        <StringListInput
          name={`intro-${locale}`}
          label="Intro-paragrafen"
          defaultValue={values.intro ?? []}
          placeholder={placeholders.intro[0]}
          multiline
          addLabel="Paragraaf toevoegen"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <PairListInput
          name={`services-${locale}`}
          label="Sub-diensten"
          defaultValue={(values.services ?? []) as TitleDescriptionPair[]}
          addLabel="Sub-dienst toevoegen"
        />
        <StringListInput
          name={`whyUs-${locale}`}
          label="Waarom Vliet (kernpunten)"
          defaultValue={values.whyUs ?? []}
          placeholder={placeholders.whyUs[0]}
          addLabel="Kernpunt toevoegen"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div>
          <label htmlFor={`ctaTitle-${locale}`} className={labelClass}>CTA-titel</label>
          <input
            id={`ctaTitle-${locale}`}
            name={`ctaTitle-${locale}`}
            type="text"
            defaultValue={values.ctaTitle ?? ""}
            placeholder={placeholders.ctaTitle}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`ctaText-${locale}`} className={labelClass}>CTA-tekst</label>
          <textarea
            id={`ctaText-${locale}`}
            name={`ctaText-${locale}`}
            rows={3}
            defaultValue={values.ctaText ?? ""}
            placeholder={placeholders.ctaText}
            className={`${inputClass} resize-y`}
          />
        </div>
        <MediaUpload
          name={`image-${locale}`}
          label="Afbeelding (intro-sectie)"
          defaultValue={values.image ?? placeholders.image ?? ""}
          folder="diensten"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
              Opgeslagen — de dienstenpagina is bijgewerkt.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
        >
          {pending ? "Bezig…" : `Opslaan (${locale.toUpperCase()})`}
        </button>
      </div>
    </form>
  );
}

export default function ServiceEditor({
  serviceKey,
  defaults,
  nlValues,
  enValues,
  hasNl,
  hasEn,
}: {
  serviceKey: ServiceKey;
  defaults: ServiceContent;
  nlValues: ServiceOverride;
  enValues: ServiceOverride;
  hasNl: boolean;
  hasEn: boolean;
}) {
  const [active, setActive] = useState<string>("nl");

  return (
    <div>
      <LocaleTabs
        tabs={[
          { code: "nl", label: "NL", hasContent: hasNl },
          { code: "en", label: "EN", hasContent: hasEn },
        ]}
        active={active}
        onChange={setActive}
      />

      {/* Both tabs stay mounted so unsaved edits survive tab switches. */}
      <div style={{ display: active === "nl" ? "block" : "none" }}>
        <TabForm serviceKey={serviceKey} locale="nl" values={nlValues} placeholders={defaults} />
      </div>
      <div style={{ display: active === "en" ? "block" : "none" }}>
        <p className="mb-4 text-xs text-gray-400">
          Lege velden vallen terug op de Nederlandse tekst. Er wordt niets automatisch vertaald.
        </p>
        <TabForm serviceKey={serviceKey} locale="en" values={enValues} placeholders={defaults} />
      </div>
    </div>
  );
}
