import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log/log";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open en stil: een gemiste violation-report mag nooit zelf een
    // fout tonen aan een bezoeker.
    if (!rateLimit(`csp-report:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => null);
    const report = body?.["csp-report"];
    const violatedDirective =
      typeof report?.["violated-directive"] === "string"
        ? report["violated-directive"]
        : "unknown-directive";
    const blockedUri =
      typeof report?.["blocked-uri"] === "string" ? report["blocked-uri"] : "unknown";
    // document-uri is a full absolute URL in a native CSP report; every
    // other error_events row stores a relative path (e.g. window.location
    // .pathname), so extract just the pathname here for a consistent
    // "Pad" column on /admin/fouten.
    const documentUri =
      typeof report?.["document-uri"] === "string"
        ? (() => {
            try {
              return new URL(report["document-uri"]).pathname.slice(0, 255);
            } catch {
              return report["document-uri"].slice(0, 255);
            }
          })()
        : undefined;

    const message = `CSP violation: ${violatedDirective} blocked ${blockedUri}`;
    await logError("csp-violation", new Error(message), {
      source: "client",
      path: documentUri,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("csp-report failed:", error);
    return NextResponse.json({ ok: true }); // fail-open
  }
}
