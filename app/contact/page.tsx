"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Mail, Send } from "lucide-react";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
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
                    <div className="text-gray-600">Wagenwegstraat 51</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">Telefoon</div>
                    <a href="tel:+5977202090" className="text-gray-600 hover:text-gold transition-colors">
                      +597 720 2090
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy mb-1">E-mail</div>
                    <a href="mailto:info@vlietaccountants.com" className="text-gray-600 hover:text-gold transition-colors">
                      info@vlietaccountants.com
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
                  <a
                    href="https://www.facebook.com/profile.php?id=100073261638677"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-navy hover:text-navy transition-colors text-gray-400"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/vliet-accountants-consultants/posts/?feedView=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-navy hover:text-navy transition-colors text-gray-400"
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </a>
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
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <h3 className="font-semibold text-green-800 text-xl mb-2">Bericht verzonden</h3>
                  <p className="text-green-700">
                    Bedankt voor uw bericht. Wij nemen zo snel mogelijk contact met u op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Voornaam *
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
                        placeholder="Uw voornaam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Achternaam *
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
                        placeholder="Uw achternaam"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      E-mailadres *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
                      placeholder="uw@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefoonnummer
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
                      placeholder="+597..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organisatie
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors"
                      placeholder="Naam van uw organisatie"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Uw bericht *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/20 transition-colors resize-none"
                      placeholder="Hoe kunnen wij u helpen?"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-navy text-white hover:bg-navy/90 font-semibold py-3"
                  >
                    <Send className="w-4 h-4 mr-2" /> Bericht versturen
                  </Button>
                </form>
              )}
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
              src="https://maps.google.com/maps?q=5.82883,-55.15789&z=17&output=embed"
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
