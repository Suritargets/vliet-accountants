import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { pageViews } from "@/drizzle/schema";
import { rateLimit } from "@/lib/rate-limit";

function parseDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

// One-way, daily-rotating visitor identifier. The IP is only ever used as
// hash input here — it is never stored. Because the current date is part
// of the hash, the same visitor gets a different hash every day, which
// still allows counting "unique visitors per day" without persistent
// cross-day tracking or any way to recover the original IP.
function computeVisitorHash(ip: string, userAgent: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(`${day}:${secret}:${ip}:${userAgent}`).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open and silent: a dropped pageview must never surface an error
    // to a visitor, and must never be rate-limited loudly.
    if (!rateLimit(`track:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path.slice(0, 255) : "/";
    const locale = body.locale === "en" ? "en" : "nl";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const country = request.headers.get("x-vercel-ip-country") || "XX";
    const deviceType = parseDeviceType(userAgent);
    const visitorHash = computeVisitorHash(ip, userAgent);

    await db.insert(pageViews).values({ path, country, deviceType, locale, visitorHash });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("track failed:", error);
    return NextResponse.json({ ok: true }); // fail-open — never break the page
  }
}
