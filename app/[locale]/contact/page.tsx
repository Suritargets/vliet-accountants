import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import ContactForm from "@/components/contact-form";
import { buildAlternates } from "@/lib/seo/alternates";
import { BUSINESS } from "@/lib/seo/site-info";

const TITLE: Record<string, string> = {
  nl: "Contact | Vliet Accountants & Consultants",
  en: "Contact | Vliet Accountants & Consultants",
};
const DESCRIPTION: Record<string, string> = {
  nl: "Neem contact op met Vliet Accountants & Consultants in Paramaribo voor audit, accountancy en strategisch advies.",
  en: "Get in touch with Vliet Accountants & Consultants in Paramaribo for audit, accountancy and strategic advice.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { canonical, languages } = buildAlternates(locale, "/contact");
  return {
    title: TITLE[locale] ?? TITLE.nl,
    description: DESCRIPTION[locale] ?? DESCRIPTION.nl,
    alternates: { canonical, languages },
  };
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/Video_Contact.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">Contact</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            Plan een vrijblijvend gesprek
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
            Wij luisteren graag naar uw vraagstukken en kijken samen met u hoe wij u het beste
            kunnen ondersteunen. Neem contact met ons op voor een kennismaking.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8">Contactgegevens</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">Adres</div>
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
                    <div className="font-semibold text-navy mb-1">Telefoon</div>
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
                    <div className="font-semibold text-navy mb-1">E-mail</div>
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
                    <div className="font-semibold text-navy mb-1">Openingstijden</div>
                    <div className="text-gray-600">Maandag – Vrijdag: 8:00 – 16:00</div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="font-semibold text-navy mb-4">Volg ons op social media</h3>
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
                  <h3 className="font-semibold text-navy mb-2">Maak contact met ons</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Heeft u vragen over onze dienstverlening of wilt u een vrijblijvend gesprek
                    plannen? Vul het contactformulier in of neem telefonisch contact met ons op.
                    Wij reageren binnen één werkdag.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-8">Stuur ons een bericht</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl font-bold text-navy mb-6 pt-0">Onze locatie</h2>
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
