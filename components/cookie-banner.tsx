"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookies");

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <p className="text-sm text-white/85 flex-1 min-w-0">
          {t("message")}{" "}
          <Link href="/privacy-policy" className="text-gold hover:underline">
            {t("privacyLink")}
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-xs font-semibold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
          >
            {t("decline")}
          </button>
          <button
            onClick={accept}
            className="bg-gold text-white text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-lg hover:bg-gold/90 transition-colors"
          >
            {t("accept")}
          </button>
          <button
            onClick={decline}
            aria-label="Close"
            className="text-white/50 hover:text-white transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
