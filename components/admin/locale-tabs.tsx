"use client";

// Tab bar for the tab-per-language editor pattern. The editor keeps every
// tab panel mounted (display:none) so unsaved edits survive tab switches.
export interface LocaleTab {
  code: string; // 'nl' | 'en' | 'all'
  label: string; // 'NL' | 'EN' | 'ALL'
  hasContent: boolean;
}

export default function LocaleTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: LocaleTab[];
  active: string;
  onChange: (code: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-100 mb-6">
      {tabs.map((tab) => {
        const isActive = tab.code === active;
        return (
          <button
            key={tab.code}
            type="button"
            onClick={() => onChange(tab.code)}
            className={`relative px-4 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors -mb-px border-b-2 ${
              isActive
                ? "border-gold text-navy"
                : "border-transparent text-gray-400 hover:text-navy"
            }`}
          >
            {tab.label}
            {!tab.hasContent && (
              <span
                title="Nog geen inhoud in deze taal"
                className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full border border-gray-300 align-middle"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
