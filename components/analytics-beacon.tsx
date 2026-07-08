"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function AnalyticsBeacon() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => {
      // Silent — a dropped pageview must never surface to the visitor.
    });
  }, [pathname, locale]);

  return null;
}
