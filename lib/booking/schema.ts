import { z } from "zod";
import { BOOKING_TOPIC_KEYS } from "./constants";

export const appointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  topic: z.string().refine((t) => BOOKING_TOPIC_KEYS.includes(t)),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(["nl", "en"]),
});

export type BookingActionState =
  | { status: "idle" }
  | { status: "success"; date: string; time: string; topic: string }
  | {
      status: "error";
      code: "rateLimited" | "invalid" | "dateUnavailable" | "slotTaken" | "generic";
    };
