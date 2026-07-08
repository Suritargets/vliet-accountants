import { NextIntlClientProvider } from "next-intl";
import { requireSession } from "@/lib/auth";
import BookingWidget from "@/components/booking/booking-widget";
import { createAppointmentAdmin } from "./_actions";
import nlMessages from "@/messages/nl.json";

export default async function NieuweAfspraakPage() {
  await requireSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Nieuwe afspraak</h1>
        <p className="text-sm text-gray-500 mt-1">
          Plan een afspraak namens een klant — deze wordt direct als bevestigd geregistreerd.
        </p>
      </div>

      <NextIntlClientProvider locale="nl" messages={{ booking: nlMessages.booking }}>
        <BookingWidget action={createAppointmentAdmin} />
      </NextIntlClientProvider>
    </div>
  );
}
