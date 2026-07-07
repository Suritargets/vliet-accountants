"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface TitleDescriptionPair {
  title: string;
  description: string;
}

/**
 * Repeatable list of { title, description } pairs. Serializes to a hidden
 * input as JSON. `name` doubles as id prefix — keep it locale/tab-scoped.
 */
export default function PairListInput({
  name,
  label,
  defaultValue = [],
  addLabel = "Item toevoegen",
}: {
  name: string;
  label: string;
  defaultValue?: TitleDescriptionPair[];
  addLabel?: string;
}) {
  const [items, setItems] = useState<TitleDescriptionPair[]>(
    defaultValue.length ? defaultValue : [{ title: "", description: "" }]
  );

  const update = (index: number, patch: Partial<TitleDescriptionPair>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ title: "", description: "" }]
    );

  const serialized = JSON.stringify(
    items
      .map((p) => ({ title: p.title.trim(), description: p.description.trim() }))
      .filter((p) => p.title || p.description)
  );

  return (
    <div>
      <span className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </span>
      <input type="hidden" name={name} value={serialized} />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 relative">
            <button
              type="button"
              onClick={() => remove(index)}
              title="Verwijderen"
              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <input
              id={`${name}-${index}-title`}
              type="text"
              value={item.title}
              placeholder="Titel"
              onChange={(e) => update(index, { title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 mb-2 pr-10"
            />
            <textarea
              id={`${name}-${index}-description`}
              rows={2}
              value={item.description}
              placeholder="Beschrijving"
              onChange={(e) => update(index, { description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 resize-y"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, { title: "", description: "" }])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-navy transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}
