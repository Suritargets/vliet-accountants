import "server-only";
import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_DAYS = 7;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to keep timing constant, then fail.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// Fixed list of admin accounts via env vars — no users table. ADMIN_EMAIL_2/
// ADMIN_PASSWORD_2 is optional; when unset, only the original account works.
function adminAccounts(): { email: string; password: string }[] {
  const accounts: { email: string; password: string }[] = [];
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    accounts.push({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  }
  if (process.env.ADMIN_EMAIL_2 && process.env.ADMIN_PASSWORD_2) {
    accounts.push({ email: process.env.ADMIN_EMAIL_2, password: process.env.ADMIN_PASSWORD_2 });
  }
  return accounts;
}

export function validateCredentials(email: string, password: string) {
  let matched = false;
  for (const account of adminAccounts()) {
    const emailOk = safeEqual(email.trim().toLowerCase(), account.email.toLowerCase());
    const passwordOk = safeEqual(password, account.password);
    if (emailOk && passwordOk) matched = true;
  }
  return matched;
}

export async function createSession(email: string) {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
