import Link from "next/link";
import { Plus } from "lucide-react";

export default function AdminPageHeader({
  title,
  description,
  createHref,
  createLabel,
}: {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {createHref && (
        <Link
          href={createHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {createLabel ?? "Nieuw"}
        </Link>
      )}
    </div>
  );
}
