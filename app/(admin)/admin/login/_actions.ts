"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { adminLoginEvents } from "@/drizzle/schema";

export interface LoginState {
  error: string | null;
}

async function logAttempt(email: string, success: boolean, ip: string) {
  try {
    await db.insert(adminLoginEvents).values({
      email,
      success,
      ipAddress: ip === "unknown" ? null : ip,
    });
  } catch (error) {
    // Logging must never break the login flow itself.
    console.error("logAttempt failed:", error);
  }
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`).allowed) {
    return { error: "Te veel pogingen. Probeer het over enkele minuten opnieuw." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateCredentials(email, password)) {
    await logAttempt(email, false, ip);
    return { error: "Onjuiste inloggegevens." };
  }

  await logAttempt(email, true, ip);
  await createSession(email);
  redirect("/admin");
}
