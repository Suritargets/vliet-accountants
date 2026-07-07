"use client";

import { useActionState } from "react";
import { useLocale } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendContactMessage, type ContactActionState } from "@/app/[locale]/contact/_actions";

const initialState: ContactActionState = { status: "idle" };

const ERROR_MESSAGES: Record<string, { nl: string; en: string }> = {
  rateLimited: {
    nl: "Te veel pogingen. Probeer het over enkele minuten opnieuw.",
    en: "Too many attempts. Please try again in a few minutes.",
  },
  invalid: {
    nl: "Controleer de ingevulde velden en probeer het opnieuw.",
    en: "Please check the entered fields and try again.",
  },
  generic: {
    nl: "Er ging iets mis. Probeer het later opnieuw.",
    en: "Something went wrong. Please try again later.",
  },
};

export default function ContactForm() {
  const locale = useLocale() === "en" ? "en" : "nl";
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="font-semibold text-green-800 text-xl mb-2">
          {locale === "nl" ? "Bericht verzonden" : "Message sent"}
        </h3>
        <p className="text-green-700">
          {locale === "nl"
            ? "Bedankt voor uw bericht. Wij nemen zo snel mogelijk contact met u op."
            : "Thank you for your message. We will get back to you as soon as possible."}
        </p>
      </div>
    );
  }

  const errorMessage = state.status === "error" ? ERROR_MESSAGES[state.code][locale] : null;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
            {locale === "nl" ? "Voornaam *" : "First name *"}
          </label>
          <input
            id="contact-firstName"
            name="firstName"
            required
            maxLength={80}
            type="text"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
            placeholder={locale === "nl" ? "Uw voornaam" : "Your first name"}
          />
        </div>
        <div>
          <label htmlFor="contact-lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
            {locale === "nl" ? "Achternaam *" : "Last name *"}
          </label>
          <input
            id="contact-lastName"
            name="lastName"
            required
            maxLength={80}
            type="text"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
            placeholder={locale === "nl" ? "Uw achternaam" : "Your last name"}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          {locale === "nl" ? "E-mailadres *" : "Email address *"}
        </label>
        <input
          id="contact-email"
          name="email"
          required
          maxLength={255}
          type="email"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
          placeholder="uw@email.com"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          {locale === "nl" ? "Telefoonnummer" : "Phone number"}
        </label>
        <input
          id="contact-phone"
          name="phone"
          maxLength={40}
          type="tel"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
          placeholder="+597..."
        />
      </div>
      <div>
        <label htmlFor="contact-organization" className="block text-sm font-medium text-gray-700 mb-1.5">
          {locale === "nl" ? "Organisatie" : "Organization"}
        </label>
        <input
          id="contact-organization"
          name="organization"
          maxLength={160}
          type="text"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
          placeholder={locale === "nl" ? "Naam van uw organisatie" : "Your organization's name"}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
          {locale === "nl" ? "Uw bericht *" : "Your message *"}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={4000}
          rows={5}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors resize-none"
          placeholder={locale === "nl" ? "Hoe kunnen wij u helpen?" : "How can we help you?"}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-navy text-white hover:bg-navy/90 font-semibold py-3 disabled:opacity-60"
      >
        <Send className="w-4 h-4 mr-2" />
        {pending
          ? locale === "nl"
            ? "Bezig met verzenden…"
            : "Sending…"
          : locale === "nl"
            ? "Bericht versturen"
            : "Send message"}
      </Button>
    </form>
  );
}
