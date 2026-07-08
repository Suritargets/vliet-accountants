"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail/send";
import { buildContactConfirmationMail, buildContactOfficeMail } from "@/lib/mail/templates";
import { BUSINESS } from "@/lib/seo/site-info";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { logError } from "@/lib/error-log/log";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
  locale: z.enum(["nl", "en"]),
});

export type ContactActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: "rateLimited" | "invalid" | "generic" };

export async function sendContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(`contact:${ip}`).allowed) {
    return { status: "error", code: "rateLimited" };
  }

  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    organization: formData.get("organization"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { status: "error", code: "invalid" };
  }
  const data = parsed.data;
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  try {
    await db.insert(contactMessages).values({
      name: fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      message: data.message,
      locale: data.locale,
    });

    await sendMail({
      to: data.email,
      ...buildContactConfirmationMail({ locale: data.locale, name: fullName }),
    });
    await sendMail({
      to: BUSINESS.email,
      ...buildContactOfficeMail({
        locale: data.locale,
        name: fullName,
        email: data.email,
        phone: data.phone || null,
        organization: data.organization || null,
        message: data.message,
      }),
    });
    return { status: "success" };
  } catch (error) {
    console.error("sendContactMessage failed:", error);
    await logError("sendContactMessage", error);
    return { status: "error", code: "generic" };
  }
}
