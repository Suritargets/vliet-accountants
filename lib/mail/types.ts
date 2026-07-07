export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendResult = { ok: true } | { ok: false; reason: string };

export type MailProvider = (message: MailMessage) => Promise<SendResult>;
