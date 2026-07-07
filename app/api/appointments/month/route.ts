import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMonthData } from "@/lib/booking/queries";
import { rateLimit } from "@/lib/rate-limit";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

// Aggregate scheduling data only — never slot detail, never PII.
export async function GET(request: NextRequest) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`month-api:${ip}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = monthSchema.safeParse(request.nextUrl.searchParams.get("month"));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  try {
    const days = await getMonthData(parsed.data);
    return NextResponse.json({ month: parsed.data, days });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
}
