import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMonthData } from "@/lib/booking/queries";

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

// Aggregate scheduling data only — never slot detail, never PII.
export async function GET(request: NextRequest) {
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
