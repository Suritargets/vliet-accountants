import "server-only";
import nodemailer from "nodemailer";
import type { MailMessage, SendResult } from "../types";
import { logError } from "@/lib/error-log/log";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !password) {
    throw new Error("SMTP env vars are not fully set");
  }
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: false, // STARTTLS on 587, not implicit TLS (465)
    requireTLS: true,
    auth: { user, pass: password },
  });
}

// Memoized singleton — avoids re-creating the transport on every send.
let transportInstance: ReturnType<typeof createTransport> | null = null;
function getTransport() {
  transportInstance ??= createTransport();
  return transportInstance;
}

export async function sendViaSmtp(message: MailMessage): Promise<SendResult> {
  try {
    const from = process.env.MAIL_FROM;
    if (!from) throw new Error("MAIL_FROM is not set");

    const transport = getTransport();
    await transport.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return { ok: true };
  } catch (error) {
    console.error("sendViaSmtp failed:", error);
    await logError("sendViaSmtp", error);
    return { ok: false, reason: "smtp-error" };
  }
}
