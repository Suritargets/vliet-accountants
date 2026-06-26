import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
}

interface ServicePageProps {
  badge: string;
  title: string;
  subtitle: string;
  intro: string[];
  services: ServiceItem[];
  whyUs: string[];
  ctaTitle: string;
  ctaText: string;
  image?: string;
}

export default function ServicePageLayout({
  badge,
  title,
  subtitle,
  intro,
  services,
  whyUs,
  ctaTitle,
  ctaText,
  image,
}: ServicePageProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white py-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/website.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/diensten"
            className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar diensten
          </Link>
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/20">
            {badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
            {title}
          </h1>
          <p className="text-xl text-white/75 max-w-2xl">{subtitle}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-12 items-center ${image ? "md:grid-cols-2" : ""}`}>
            <div className="space-y-4">
              {intro.map((paragraph, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            {image && (
              <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-10">
            Onze diensten
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className="border border-gray-100 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy text-lg mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gold rounded-full shrink-0" />
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-8">
            Waarom Vliet Accountants & Consultants?
          </h2>
          <ul className="space-y-3">
            {whyUs.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-white/75 leading-relaxed mb-8">{ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gold text-white hover:bg-gold/90 font-semibold"
            >
              <Link href="/contact">
                Neem contact op <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white bg-transparent hover:bg-white/10"
            >
              <Link href="/diensten">Alle diensten</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
