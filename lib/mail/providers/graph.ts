import "server-only";
import type { MailMessage, SendResult } from "../types";
import { logError } from "@/lib/error-log/log";

// Microsoft Graph, not SMTP: nodemailer has no code path to Graph, so this
// is a plain fetch()-based client-credentials flow — no extra SDK needed
// for a single endpoint. Requires the Entra ID app registration to have
// the Mail.Send Application permission (admin-consented) and an Exchange
// Online Application Access Policy scoping it to GRAPH_SENDER_MAILBOX
// specifically — otherwise Graph returns 403 regardless of a valid token.

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

// Module-scoped cache: tokens are valid ~1 hour, no need to fetch one per send.
let cachedToken: CachedToken | null = null;

async function getAccessToken(tenantId: string, clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  // 60s safety margin so a token doesn't expire mid-request.
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken;
  }

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Graph token request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token || !data.expires_in) {
    throw new Error("Graph token response missing access_token or expires_in");
  }
  cachedToken = { accessToken: data.access_token, expiresAt: now + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

export async function sendViaGraph(message: MailMessage): Promise<SendResult> {
  try {
    const tenantId = process.env.GRAPH_TENANT_ID;
    const clientId = process.env.GRAPH_CLIENT_ID;
    const clientSecret = process.env.GRAPH_CLIENT_SECRET;
    const mailbox = process.env.GRAPH_SENDER_MAILBOX || "info@vlietaccountants.com";
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error("GRAPH_TENANT_ID, GRAPH_CLIENT_ID or GRAPH_CLIENT_SECRET is not set");
    }

    const token = await getAccessToken(tenantId, clientId, clientSecret);

    // Graph's message resource has a single `body` (one contentType), unlike
    // SMTP's multipart/alternative — there's no way to send message.text as
    // a true plain-text fallback alongside the HTML part. This is a
    // deliberate, known gap (not an oversight): the HTML templates are the
    // primary format, and messages sent here won't have a text/plain part
    // the way the SMTP provider's do.
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: message.subject,
          body: { contentType: "HTML", content: message.html },
          toRecipients: [{ emailAddress: { address: message.to } }],
        },
        saveToSentItems: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Graph sendMail failed: ${response.status} ${await response.text()}`);
    }

    return { ok: true };
  } catch (error) {
    console.error("sendViaGraph failed:", error);
    await logError("sendViaGraph", error);
    return { ok: false, reason: "graph-error" };
  }
}
