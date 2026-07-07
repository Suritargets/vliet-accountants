"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

/**
 * Repeatable list of strings. Serializes to a hidden input as JSON —
 * parse server-side with JSON.parse(formData.get(name)).
 * `name` doubles as id prefix, so keep it locale/tab-scoped.
 */
export default function StringListInput({
  name,
  label,
  defaultValue = [],
  placeholder,
  multiline = false,
  addLabel = "Regel toevoegen",
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  const [items, setItems] = useState<string[]>(defaultValue.length ? defaultValue : [""]);

  const update = (index: number, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));

  const serialized = JSON.stringify(items.map((s) => s.trim()).filter(Boolean));

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

  return (
    <div>
      <span className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
        {label}
      </span>
      <input type="hidden" name={name} value={serialized} />
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                id={`${name}-${index}`}
                rows={3}
                value={item}
                placeholder={placeholder}
                onChange={(e) => update(index, e.target.value)}
                className={`${inputClass} resize-y`}
              />
            ) : (
              <input
                id={`${name}-${index}`}
                type="text"
                value={item}
                placeholder={placeholder}
                onChange={(e) => update(index, e.target.value)}
                className={inputClass}
              />
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              title="Verwijderen"
              className="mt-2 text-gray-300 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, ""])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-navy transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}
