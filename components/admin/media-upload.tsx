"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

export default function MediaUpload({
  name,
  defaultValue,
  folder = "uploads",
  label,
}: {
  name: string; // also used as the field id — make it locale/tab-scoped
  defaultValue?: string | null;
  folder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <span className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
          {label}
        </span>
      )}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-gray-200">
          <Image src={url} alt="" width={480} height={270} className="w-full h-40 object-cover" unoptimized />
          <button
            type="button"
            onClick={() => setUrl("")}
            title="Afbeelding verwijderen"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) upload(file);
          }}
          className="w-full max-w-sm h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gold hover:text-gold transition-colors cursor-pointer disabled:cursor-wait"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              <span className="text-xs">Sleep een afbeelding hierheen of klik</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
