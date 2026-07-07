"use server";

import { redirect } from "next/navigation";
import { createSession, validateCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export interface LoginState {
  error: string | null;
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
    return { error: "Onjuiste inloggegevens." };
  }

  await createSession(email);
  redirect("/admin");
}
