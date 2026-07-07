import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { SITE_URL } from "@/lib/seo/site-info";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CookieBanner from "@/components/cookie-banner";
import OrganizationJsonLd from "@/components/organization-jsonld";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const SITE_TITLE = "Vliet Accountants & Consultants";
const SITE_DESCRIPTION: Record<string, string> = {
  nl: "Uw specialist in audit, accountancy en strategisch financieel advies. Kwaliteit in cijfers, waarde in elke beslissing.",
  en: "Your specialist in audit, accountancy and strategic financial advice. Quality in numbers, value in every decision.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description = SITE_DESCRIPTION[locale] ?? SITE_DESCRIPTION.nl;
  const { canonical, languages } = buildAlternates(locale, "/");

  return {
    metadataBase: new URL(SITE_URL),
    // No title.template: every page in this repo already appends
    // "| Vliet Accountants & Consultants" itself — a template would double it.
    title: SITE_TITLE,
    description,
    alternates: { canonical, languages },
    openGraph: {
      siteName: SITE_TITLE,
      title: SITE_TITLE,
      description,
      url: canonical,
      locale: locale === "en" ? "en_US" : "nl_NL",
      type: "website",
      images: [{ url: "/images/Voorpagina.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description,
      images: ["/images/Voorpagina.jpg"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <OrganizationJsonLd />
        <NextIntlClientProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
