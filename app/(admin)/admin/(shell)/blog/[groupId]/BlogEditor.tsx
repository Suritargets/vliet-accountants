"use client";

import { useRef, useState, useActionState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import type { BlogPost } from "@/drizzle/schema";
import LocaleTabs from "@/components/admin/locale-tabs";
import { saveBlogPost, deleteBlogPost, type BlogActionState } from "../_actions";

const LOCALES = [
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
] as const;

const initialState: BlogActionState = { success: false, error: null };

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5";

function Banner({ state }: { state: BlogActionState }) {
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

function toDatetimeLocal(value: Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

interface SharedFields {
  category: string;
  coverImage: string;
  tagsJson: string; // JSON string[] — mirrored into every tab form
}

function LocalePanel({
  locale,
  post,
  groupId,
  shared,
  visible,
}: {
  locale: string;
  post: BlogPost | undefined;
  groupId: string | null;
  shared: SharedFields;
  visible: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveBlogPost, initialState);

  return (
    <div style={visible ? undefined : { display: "none" }}>
      <form action={formAction} className="bg-white rounded-xl border border-gray-100">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="groupId" value={groupId ?? "nieuw"} />
        {post && <input type="hidden" name="postId" value={post.id} />}
        {/* Mirrors of the shared fields (rendered once above the tabs). */}
        <input type="hidden" name="category" value={shared.category} />
        <input type="hidden" name="coverImage" value={shared.coverImage} />
        <input type="hidden" name="tags" value={shared.tagsJson} />

        <div className="px-5 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor={`title-${locale}`} className={labelClass}>
                Titel
              </label>
              <input
                id={`title-${locale}`}
                type="text"
                name="title"
                required
                maxLength={255}
                defaultValue={post?.title ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`slug-${locale}`} className={labelClass}>
                Slug
              </label>
              <input
                id={`slug-${locale}`}
                type="text"
                name="slug"
                required
                maxLength={160}
                defaultValue={post?.slug ?? ""}
                placeholder="bijv. mijn-eerste-artikel"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">Uniek over alle talen.</p>
            </div>
          </div>

          <div>
            <label htmlFor={`excerpt-${locale}`} className={labelClass}>
              Samenvatting
            </label>
            <textarea
              id={`excerpt-${locale}`}
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt ?? ""}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label htmlFor={`content-${locale}`} className={labelClass}>
              Inhoud (markdown)
            </label>
            <textarea
              id={`content-${locale}`}
              name="content"
              rows={16}
              defaultValue={post?.content ?? ""}
              className={`${inputClass} font-mono text-sm resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor={`status-${locale}`} className={labelClass}>
                Status
              </label>
              <select
                id={`status-${locale}`}
                name="status"
                defaultValue={post?.status ?? "draft"}
                className={`${inputClass} bg-white`}
              >
                <option value="draft">Concept</option>
                <option value="published">Gepubliceerd</option>
              </select>
            </div>
            <div>
              <label htmlFor={`publishedAt-${locale}`} className={labelClass}>
                Publicatiedatum (optioneel)
              </label>
              <input
                id={`publishedAt-${locale}`}
                type="datetime-local"
                name="publishedAt"
                defaultValue={toDatetimeLocal(post?.publishedAt ?? null)}
                className={inputClass}
              />
            </div>
          </div>
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

      {post && (
        <div className="mt-4 flex justify-end">
          <form
            action={deleteBlogPost.bind(null, post.id)}
            onSubmit={(e) => {
              if (!window.confirm(`Weet je zeker dat je de ${locale.toUpperCase()}-versie wilt verwijderen?`)) {
                e.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Verwijder {locale.toUpperCase()}-versie
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function BlogEditor({
  groupId,
  posts,
  savedLocale,
}: {
  groupId: string | null;
  posts: BlogPost[];
  savedLocale?: string;
}) {
  const byLocale = new Map(posts.map((p) => [p.locale, p]));
  const isValidSaved = savedLocale === "nl" || savedLocale === "en";
  const [active, setActive] = useState<string>(isValidSaved ? savedLocale! : "nl");

  // Shared-across-group fields, defaulted from whichever variant has data.
  const [category, setCategory] = useState(
    () => posts.find((p) => p.category)?.category ?? ""
  );
  const [coverImage, setCoverImage] = useState(
    () => posts.find((p) => p.coverImage)?.coverImage ?? ""
  );
  const [tagsText, setTagsText] = useState(
    () => (posts.find((p) => p.tags.length > 0)?.tags ?? []).join(", ")
  );

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadCover(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "blog");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt");
      setCoverImage(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  const shared: SharedFields = {
    category: category.trim(),
    coverImage: coverImage.trim(),
    tagsJson: JSON.stringify(
      tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  };

  return (
    <div className="space-y-6">
      {isValidSaved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
          Artikel opgeslagen ({savedLocale!.toUpperCase()}).
        </p>
      )}

      {/* Shared fields — apply to every taalversie of dit artikel. */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">Gedeelde velden</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Categorie, omslagfoto en tags gelden voor alle taalversies en worden meegestuurd bij elke opslag.
          </p>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-5">
            <div>
              <label htmlFor="shared-category" className={labelClass}>
                Categorie
              </label>
              <input
                id="shared-category"
                type="text"
                maxLength={80}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="bijv. Nieuws"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="shared-tags" className={labelClass}>
                Tags (komma-gescheiden)
              </label>
              <input
                id="shared-tags"
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="bijv. belasting, administratie"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>Omslagfoto</span>
            {coverImage ? (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={coverImage}
                  alt=""
                  width={480}
                  height={270}
                  className="w-full h-40 object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
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
                  if (file) uploadCover(file);
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
                if (file) uploadCover(file);
                e.target.value = "";
              }}
            />
            {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
          </div>
        </div>
      </div>

      {/* Language tabs — every panel stays mounted so unsaved edits survive tab switches. */}
      <div>
        <LocaleTabs
          tabs={LOCALES.map((l) => ({
            code: l.code,
            label: l.label,
            hasContent: byLocale.has(l.code),
          }))}
          active={active}
          onChange={setActive}
        />

        {LOCALES.map((l) => (
          <LocalePanel
            key={l.code}
            locale={l.code}
            post={byLocale.get(l.code)}
            groupId={groupId}
            shared={shared}
            visible={active === l.code}
          />
        ))}
      </div>
    </div>
  );
}
