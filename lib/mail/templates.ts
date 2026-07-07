// HTML/text templates for booking-related emails, in Vliet's house style
// (navy #1a2e5a, gold #c3b19d). Deliberately not next-intl — that requires a
// React render context this module never runs inside (server actions call
// it directly, not through a component tree).

const NAVY = "#1a2e5a";
const GOLD = "#c3b19d";
const FONT_STACK = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

type Locale = "nl" | "en";

// All values below can originate from the public booking form (name, email,
// phone, notes) — every interpolation into HTML must be escaped.
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STRINGS = {
  nl: {
    greeting: (name: string) => `Beste ${name},`,
    footer: "Vliet Accountants & Consultants — Wagenwegstraat 51, Suriname",
    fieldDate: "Datum",
    fieldTime: "Tijd",
    fieldTopic: "Onderwerp",
    confirmation: {
      subject: "Bevestiging van uw afspraakverzoek",
      title: "Uw afspraakverzoek is ontvangen",
      body: "Bedankt voor uw aanvraag. Wij nemen zo snel mogelijk contact met u op om de afspraak te bevestigen.",
    },
    office: {
      subject: (name: string) => `Nieuwe afspraak: ${name}`,
      title: "Nieuwe afspraakaanvraag",
      fieldEmail: "E-mail",
      fieldPhone: "Telefoon",
      fieldNotes: "Toelichting",
    },
    status: {
      subjectConfirmed: "Uw afspraak is bevestigd",
      subjectCancelled: "Uw afspraak is geannuleerd",
      titleConfirmed: "Uw afspraak is bevestigd",
      titleCancelled: "Uw afspraak is geannuleerd",
      bodyConfirmed: "Wij bevestigen hierbij uw afspraak. Wij zien u graag op de onderstaande datum en tijd.",
      bodyCancelled: "Uw afspraak is geannuleerd. Neem gerust contact met ons op om een nieuwe afspraak in te plannen.",
    },
  },
  en: {
    greeting: (name: string) => `Dear ${name},`,
    footer: "Vliet Accountants & Consultants — Wagenwegstraat 51, Suriname",
    fieldDate: "Date",
    fieldTime: "Time",
    fieldTopic: "Topic",
    confirmation: {
      subject: "Your appointment request has been received",
      title: "Your appointment request has been received",
      body: "Thank you for your request. We will contact you as soon as possible to confirm the appointment.",
    },
    office: {
      subject: (name: string) => `New appointment: ${name}`,
      title: "New appointment request",
      fieldEmail: "Email",
      fieldPhone: "Phone",
      fieldNotes: "Notes",
    },
    status: {
      subjectConfirmed: "Your appointment is confirmed",
      subjectCancelled: "Your appointment has been cancelled",
      titleConfirmed: "Your appointment is confirmed",
      titleCancelled: "Your appointment has been cancelled",
      bodyConfirmed: "We confirm your appointment. We look forward to seeing you on the date and time below.",
      bodyCancelled: "Your appointment has been cancelled. Please feel free to contact us to schedule a new one.",
    },
  },
} as const;

function renderShell(locale: Locale, title: string, bodyHtml: string): string {
  const t = STRINGS[locale];
  return `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background-color:#f9fafb;font-family:${FONT_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${NAVY};padding:24px 32px;">
                <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.02em;">Vliet Accountants &amp; Consultants</span>
              </td>
            </tr>
            <tr>
              <td style="height:3px;background-color:${GOLD};line-height:3px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;color:${NAVY};font-size:20px;font-weight:700;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f3f4f6;">
                <span style="color:#6b7280;font-size:12px;">${t.footer}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderDetailsTable(
  rows: { label: string; value: string }[]
): string {
  const cells = rows
    .map(
      (r) => `<tr>
        <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">${esc(r.label)}</td>
        <td style="padding:6px 0;color:${NAVY};font-size:13px;font-weight:600;">${esc(r.value)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #f3f4f6;padding-top:12px;">${cells}</table>`;
}

export interface BookingMailArgs {
  locale: Locale;
  name: string;
  date: string;
  time: string;
  topicLabel: string;
}

export function buildBookingConfirmationMail(
  args: BookingMailArgs
): { subject: string; html: string; text: string } {
  const t = STRINGS[args.locale];
  const details = renderDetailsTable([
    { label: t.fieldDate, value: args.date },
    { label: t.fieldTime, value: args.time },
    { label: t.fieldTopic, value: args.topicLabel },
  ]);
  const bodyHtml = `<p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">${t.greeting(esc(args.name))}</p>
    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${t.confirmation.body}</p>
    ${details}`;

  return {
    subject: t.confirmation.subject,
    html: renderShell(args.locale, t.confirmation.title, bodyHtml),
    text: `${t.greeting(args.name)}\n\n${t.confirmation.body}\n\n${t.fieldDate}: ${args.date}\n${t.fieldTime}: ${args.time}\n${t.fieldTopic}: ${args.topicLabel}\n\n${t.footer}`,
  };
}

export interface OfficeNotificationMailArgs {
  locale: Locale;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  topicLabel: string;
  notes: string | null;
}

export function buildOfficeNotificationMail(
  args: OfficeNotificationMailArgs
): { subject: string; html: string; text: string } {
  const t = STRINGS[args.locale];
  const rows: { label: string; value: string }[] = [
    { label: t.fieldDate, value: args.date },
    { label: t.fieldTime, value: args.time },
    { label: t.fieldTopic, value: args.topicLabel },
    { label: t.office.fieldEmail, value: args.email },
  ];
  if (args.phone) rows.push({ label: t.office.fieldPhone, value: args.phone });
  const details = renderDetailsTable(rows);
  const notesHtml = args.notes
    ? `<p style="margin:16px 0 0;color:#374151;font-size:13px;line-height:1.6;"><strong>${t.office.fieldNotes}:</strong> ${esc(args.notes)}</p>`
    : "";
  const bodyHtml = `<p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;"><strong>${esc(args.name)}</strong></p>
    ${details}
    ${notesHtml}`;

  return {
    // Subject is a raw header value, not HTML — strip CR/LF instead of
    // HTML-escaping (header injection, not markup injection, is the risk here).
    subject: t.office.subject(args.name.replace(/[\r\n]+/g, " ")),
    html: renderShell(args.locale, t.office.title, bodyHtml),
    text: `${args.name}\n\n${t.fieldDate}: ${args.date}\n${t.fieldTime}: ${args.time}\n${t.fieldTopic}: ${args.topicLabel}\n${t.office.fieldEmail}: ${args.email}${args.phone ? `\n${t.office.fieldPhone}: ${args.phone}` : ""}${args.notes ? `\n${t.office.fieldNotes}: ${args.notes}` : ""}`,
  };
}

export interface StatusChangeMailArgs {
  locale: Locale;
  name: string;
  date: string;
  time: string;
  topicLabel: string;
  status: "confirmed" | "cancelled";
}

export function buildStatusChangeMail(
  args: StatusChangeMailArgs
): { subject: string; html: string; text: string } {
  const t = STRINGS[args.locale];
  const isConfirmed = args.status === "confirmed";
  const subject = isConfirmed ? t.status.subjectConfirmed : t.status.subjectCancelled;
  const title = isConfirmed ? t.status.titleConfirmed : t.status.titleCancelled;
  const body = isConfirmed ? t.status.bodyConfirmed : t.status.bodyCancelled;
  const pillColor = isConfirmed ? GOLD : "#9ca3af";

  const details = renderDetailsTable([
    { label: t.fieldDate, value: args.date },
    { label: t.fieldTime, value: args.time },
    { label: t.fieldTopic, value: args.topicLabel },
  ]);
  const bodyHtml = `<p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">${t.greeting(esc(args.name))}</p>
    <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">${body}</p>
    <span style="display:inline-block;padding:4px 12px;border-radius:9999px;background-color:${pillColor}22;color:${NAVY};font-size:12px;font-weight:600;">${subject}</span>
    ${details}`;

  return {
    subject,
    html: renderShell(args.locale, title, bodyHtml),
    text: `${t.greeting(args.name)}\n\n${body}\n\n${t.fieldDate}: ${args.date}\n${t.fieldTime}: ${args.time}\n${t.fieldTopic}: ${args.topicLabel}\n\n${t.footer}`,
  };
}
