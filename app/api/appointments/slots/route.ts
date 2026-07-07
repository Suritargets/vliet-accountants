import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDayData } from "@/lib/booking/queries";
import { rateLimit } from "@/lib/rate-limit";

const dateSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);

// Aggregate scheduling data only — { time, available } pairs, never PII.
export async function GET(request: NextRequest) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`slots-api:${ip}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = dateSchema.safeParse(request.nextUrl.searchParams.get("date"));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const { open, slots } = await getDayData(parsed.data);
    return NextResponse.json({ date: parsed.data, available: open, slots });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
}
