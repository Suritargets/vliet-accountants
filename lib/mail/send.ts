import "server-only";
import type { MailMessage, SendResult } from "./types";
import { logError } from "@/lib/error-log/log";

// Dispatches to the configured provider. Never throws — a failed or slow
// mail send must never block a booking or admin action. Mirrors the
// fail-open philosophy of lib/rate-limit.ts.
export async function sendMail(message: MailMessage): Promise<SendResult> {
  try {
    const provider = process.env.MAIL_PROVIDER; // "smtp" | "graph" | undefined

    if (provider === "smtp") {
      const { sendViaSmtp } = await import("./providers/smtp");
      return await sendViaSmtp(message);
    }

    // "graph" is documented (see docs/superpowers/specs) but not yet built —
    // falls through to the no-op branch below until providers/graph.ts exists.

    console.log(
      `[mail] MAIL_PROVIDER not set — skipping send to ${message.to}: "${message.subject}"`
    );
    return { ok: false, reason: "no-provider-configured" };
  } catch (error) {
    console.error("sendMail failed:", error);
    await logError("sendMail", error);
    return { ok: false, reason: "unexpected-error" }; // fail-open by design
  }
}
