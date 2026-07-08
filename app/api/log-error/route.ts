import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log/log";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Fail-open en stil: een gemiste foutmelding mag nooit zelf een fout
    // tonen aan een bezoeker die al naar een kapotte pagina kijkt.
    if (!rateLimit(`log-error:${ip}`).allowed) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message : "Unknown client error";
    const stack = typeof body.stack === "string" ? body.stack : undefined;
    const digest = typeof body.digest === "string" ? body.digest : undefined;
    const path = typeof body.path === "string" ? body.path.slice(0, 255) : undefined;

    await logError("client-error-boundary", new Error(message), {
      source: "client",
      path,
      digest,
      stack,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("log-error route failed:", error);
    return NextResponse.json({ ok: true }); // fail-open — nooit de pagina breken
  }
}
