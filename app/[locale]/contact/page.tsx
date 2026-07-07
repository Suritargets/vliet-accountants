import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import ContactForm from "@/components/contact-form";
import { buildAlternates } from "@/lib/seo/alternates";
import { BUSINESS } from "@/lib/seo/site-info";

type Locale = "nl" | "en";

const content: Record<
  Locale,
  {
    title: string;
    description: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    contactInfoTitle: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    hoursLabel: string;
    hoursValue: string;
    socialTitle: string;
    boxTitle: string;
    boxText: string;
    formTitle: string;
    mapTitle: string;
  }
> = {
  nl: {
    title: "Contact | Vliet Accountants & Consultants",
    description:
      "Neem contact op met Vliet Accountants & Consultants in Paramaribo voor audit, accountancy en strategisch advies.",
    heroBadge: "Contact",
    heroTitle: "Plan een vrijblijvend gesprek",
    heroSubtitle:
      "Wij luisteren graag naar uw vraagstukken en kijken samen met u hoe wij u het beste kunnen ondersteunen. Neem contact met ons op voor een kennismaking.",
    contactInfoTitle: "Contactgegevens",
    addressLabel: "Adres",
    phoneLabel: "Telefoon",
    emailLabel: "E-mail",
    hoursLabel: "Openingstijden",
    hoursValue: "Maandag – Vrijdag: 8:00 – 16:00",
    socialTitle: "Volg ons op social media",
    boxTitle: "Maak contact met ons",
    boxText:
      "Heeft u vragen over onze dienstverlening of wilt u een vrijblijvend gesprek plannen? Vul het contactformulier in of neem telefonisch contact met ons op. Wij reageren binnen één werkdag.",
    formTitle: "Stuur ons een bericht",
    mapTitle: "Onze locatie",
  },
  en: {
    title: "Contact | Vliet Accountants & Consultants",
    description:
      "Get in touch with Vliet Accountants & Consultants in Paramaribo for audit, accountancy and strategic advice.",
    heroBadge: "Contact",
    heroTitle: "Schedule a no-obligation conversation",
    heroSubtitle:
      "We are happy to listen to your questions and explore together how we can best support you. Get in touch with us for an introductory meeting.",
    contactInfoTitle: "Contact details",
    addressLabel: "Address",
    phoneLabel: "Phone",
    emailLabel: "Email",
    hoursLabel: "Opening hours",
    hoursValue: "Monday – Friday: 8:00 AM – 4:00 PM",
    socialTitle: "Follow us on social media",
    boxTitle: "Get in touch with us",
    boxText:
      "Do you have questions about our services or would you like to schedule a no-obligation conversation? Fill in the contact form or call us. We respond within one business day.",
    formTitle: "Send us a message",
    mapTitle: "Our location",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = locale === "en" ? "en" : "nl";
  const t = content[l];
  const { canonical, languages } = buildAlternates(locale, "/contact");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical, languages },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = locale === "en" ? "en" : "nl";
  const t = content[l];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_Contact.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">{t.heroBadge}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">{t.heroTitle}</h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8">{t.contactInfoTitle}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">{t.addressLabel}</div>
                    <address className="text-gray-600 not-italic">
                      {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, Suriname
                    </address>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">{t.phoneLabel}</div>
                    <a href="tel:+5977202090" className="text-gray-600 hover:text-gold transition-colors">
                      {BUSINESS.telephone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">{t.emailLabel}</div>
                    <a href={`mailto:${BUSINESS.email}`} className="text-gray-600 hover:text-gold transition-colors">
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">{t.hoursLabel}</div>
                    <div className="text-gray-600">{t.hoursValue}</div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="font-semibold text-navy mb-4">{t.socialTitle}</h3>
                <div className="flex items-center gap-4">
                  {BUSINESS.sameAs.map((href, i) => {
                    const Icon = i === 0 ? FacebookIcon : LinkedInIcon;
                    const label = i === 0 ? "Facebook" : "LinkedIn";
                    return (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-navy hover:text-navy transition-colors text-gray-400"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <Card className="mt-10 border border-navy/10 bg-navy/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy mb-2">{t.boxTitle}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t.boxText}</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8">{t.formTitle}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-navy mb-6 pt-0">{t.mapTitle}</h2>
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
            <iframe
              src={`https://maps.google.com/maps?q=${BUSINESS.latitude},${BUSINESS.longitude}&z=17&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vliet Accountants & Consultants locatie"
            />
          </div>
        </div>
      </section>
    </>
  );
}
