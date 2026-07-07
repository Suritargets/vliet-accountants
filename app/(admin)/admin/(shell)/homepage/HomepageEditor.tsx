"use client";

import { useActionState, useState } from "react";
import LocaleTabs from "@/components/admin/locale-tabs";
import type { HomepageContent } from "@/lib/content/homepage-defaults";
import { saveHomepage, type HomepageActionState } from "./_actions";

const initialState: HomepageActionState = { success: false, error: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

function Field({
  id,
  label,
  defaultValue,
  placeholder,
  textarea = false,
  rows = 3,
}: {
  id: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  // `id` is tab-scoped (e.g. hero-badge-nl); name strips nothing — the action
  // reads `${field}-${locale}` so name === id.
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-semibold text-navy">{title}</h3>
      {children}
    </div>
  );
}

interface OverridesShape {
  hero?: Partial<HomepageContent["hero"]>;
  stats?: HomepageContent["stats"];
  about?: Partial<HomepageContent["about"]>;
  servicesTeaser?: Partial<HomepageContent["servicesTeaser"]>;
  team?: Partial<HomepageContent["team"]>;
  cta?: Partial<HomepageContent["cta"]>;
}

function TabForm({
  locale,
  values,
  placeholders,
}: {
  locale: "nl" | "en";
  // Prefilled values for this tab (NL: defaults merged with NL override;
  // EN: only what the EN tab has saved — empty EN fields stay blank, no
  // auto-translate; the NL text appears as placeholder for reference).
  values: OverridesShape;
  placeholders: HomepageContent;
}) {
  const [state, formAction, pending] = useActionState(saveHomepage, initialState);
  const v = values;
  const p = placeholders;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      <SectionCard title="Hero">
        <Field id={`hero-badge-${locale}`} label="Badge" defaultValue={v.hero?.badge ?? ""} placeholder={p.hero.badge} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id={`hero-titleLead-${locale}`} label="Titel (deel 1)" defaultValue={v.hero?.titleLead ?? ""} placeholder={p.hero.titleLead} />
          <Field id={`hero-titleAccent-${locale}`} label="Titel (goud accent)" defaultValue={v.hero?.titleAccent ?? ""} placeholder={p.hero.titleAccent} />
        </div>
        <Field id={`hero-subtitle-${locale}`} label="Subtitel" defaultValue={v.hero?.subtitle ?? ""} placeholder={p.hero.subtitle} textarea />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id={`hero-ctaPrimary-${locale}`} label="Primaire knop" defaultValue={v.hero?.ctaPrimary ?? ""} placeholder={p.hero.ctaPrimary} />
          <Field id={`hero-ctaSecondary-${locale}`} label="Secundaire knop" defaultValue={v.hero?.ctaSecondary ?? ""} placeholder={p.hero.ctaSecondary} />
        </div>
      </SectionCard>

      <SectionCard title="Statistieken">
        <p className="text-xs text-gray-400 -mt-2">
          Alle 4 volledig invullen om ze te overschrijven; anders gelden de standaardwaarden.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-28 shrink-0">
                <Field id={`stat-${i}-value-${locale}`} label={`Waarde ${i + 1}`} defaultValue={v.stats?.[i]?.value ?? ""} placeholder={p.stats[i]?.value} />
              </div>
              <div className="flex-1">
                <Field id={`stat-${i}-label-${locale}`} label={`Label ${i + 1}`} defaultValue={v.stats?.[i]?.label ?? ""} placeholder={p.stats[i]?.label} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Over ons (preview)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id={`about-badge-${locale}`} label="Badge" defaultValue={v.about?.badge ?? ""} placeholder={p.about.badge} />
          <Field id={`about-buttonLabel-${locale}`} label="Knoptekst" defaultValue={v.about?.buttonLabel ?? ""} placeholder={p.about.buttonLabel} />
        </div>
        <Field id={`about-title-${locale}`} label="Titel" defaultValue={v.about?.title ?? ""} placeholder={p.about.title} />
        {[0, 1].map((i) => (
          <Field
            key={i}
            id={`about-paragraph-${i}-${locale}`}
            label={`Paragraaf ${i + 1}`}
            defaultValue={v.about?.paragraphs?.[i] ?? ""}
            placeholder={p.about.paragraphs[i]}
            textarea
          />
        ))}
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Field
              key={i}
              id={`about-highlight-${i}-${locale}`}
              label={`Kernpunt ${i + 1}`}
              defaultValue={v.about?.highlights?.[i] ?? ""}
              placeholder={p.about.highlights[i]}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Diensten-sectie">
        <Field id={`teaser-badge-${locale}`} label="Badge" defaultValue={v.servicesTeaser?.badge ?? ""} placeholder={p.servicesTeaser.badge} />
        <Field id={`teaser-title-${locale}`} label="Titel" defaultValue={v.servicesTeaser?.title ?? ""} placeholder={p.servicesTeaser.title} />
        <Field id={`teaser-subtitle-${locale}`} label="Subtitel" defaultValue={v.servicesTeaser?.subtitle ?? ""} placeholder={p.servicesTeaser.subtitle} textarea rows={2} />
        <Field id={`teaser-readMore-${locale}`} label="'Meer lezen'-link" defaultValue={v.servicesTeaser?.readMore ?? ""} placeholder={p.servicesTeaser.readMore} />
      </SectionCard>

      <SectionCard title="Team-sectie">
        <Field id={`team-badge-${locale}`} label="Badge" defaultValue={v.team?.badge ?? ""} placeholder={p.team.badge} />
        <Field id={`team-title-${locale}`} label="Titel" defaultValue={v.team?.title ?? ""} placeholder={p.team.title} />
        <Field id={`team-subtitle-${locale}`} label="Subtitel" defaultValue={v.team?.subtitle ?? ""} placeholder={p.team.subtitle} textarea rows={2} />
      </SectionCard>

      <SectionCard title="Call-to-action">
        <Field id={`cta-title-${locale}`} label="Titel" defaultValue={v.cta?.title ?? ""} placeholder={p.cta.title} />
        <Field id={`cta-text-${locale}`} label="Tekst" defaultValue={v.cta?.text ?? ""} placeholder={p.cta.text} textarea />
        <Field id={`cta-buttonLabel-${locale}`} label="Knoptekst" defaultValue={v.cta?.buttonLabel ?? ""} placeholder={p.cta.buttonLabel} />
      </SectionCard>

      <div className="flex items-center justify-between gap-4">
        <div>
          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
              Opgeslagen — de homepage is bijgewerkt.
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

export default function HomepageEditor({
  nlValues,
  enValues,
  defaults,
  hasNl,
  hasEn,
}: {
  nlValues: OverridesShape;
  enValues: OverridesShape;
  defaults: HomepageContent;
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
        <TabForm locale="nl" values={nlValues} placeholders={defaults} />
      </div>
      <div style={{ display: active === "en" ? "block" : "none" }}>
        <p className="mb-4 text-xs text-gray-400">
          Lege velden vallen terug op de Nederlandse tekst. Er wordt niets automatisch vertaald.
        </p>
        <TabForm locale="en" values={enValues} placeholders={defaults} />
      </div>
    </div>
  );
}
