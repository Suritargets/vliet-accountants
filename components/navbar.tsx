"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, ChevronDown } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WhatsAppIcon, FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const services = [
  { label: "Accounting & Reporting", href: "/diensten/accounting-reporting" },
  { label: "Advisory & Training", href: "/diensten/advisory-training" },
  { label: "Audit & Assurance", href: "/diensten/audit-assurance" },
  { label: "Internal Audit, Risk & Governance", href: "/diensten/internal-audit-risk-governance" },
  { label: "Tax & Compliance", href: "/diensten/tax-compliance" },
  { label: "Transformation & Project Management", href: "/diensten/transformation-project-management" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");

  const navLinks = [
    { label: t("about"), href: "/over-ons" },
    { label: t("careers"), href: "/werken-bij-ons" },
    { label: t("blog"), href: "/blog" },
    { label: t("contact"), href: "/contact" },
  ];

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const navClass = (href: string) =>
    `px-4 py-2 text-sm font-medium rounded transition-colors ${
      isActive(href)
        ? "text-navy font-semibold border-b-2 border-gold"
        : "text-gray-700 hover:text-navy hover:bg-gray-50"
    }`;

  const switchLocale = (nextLocale: "nl" | "en") => {
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top bar */}
      <div className="bg-navy text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="w-3.5 h-3.5 text-gold" />
            <a href="https://wa.me/5977202090" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              +597 720 2090
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=100073261638677" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gold transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/vliet-accountants-consultants/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gold transition-colors">
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2 border-l border-white/20 pl-4">
              <button
                onClick={() => switchLocale("nl")}
                className={locale === "nl" ? "font-semibold text-gold" : "hover:text-gold transition-colors"}
              >
                NL
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => switchLocale("en")}
                className={locale === "en" ? "font-semibold text-gold" : "hover:text-gold transition-colors"}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-dark.png"
              alt="Vliet Accountants & Consultants"
              width={180}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={navClass("/")}>
              {t("home")}
            </Link>

            {/* Diensten dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link
                href="/diensten"
                className={`flex items-center gap-1 ${navClass("/diensten")}`}
              >
                {t("services")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </Link>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <Link
                      href="/diensten"
                      className="text-xs font-semibold text-navy/60 uppercase tracking-wider hover:text-gold transition-colors"
                    >
                      {t("allServices")}
                    </Link>
                  </div>
                  {services.map((service) => (
                    <Link
                      key={service.href}
                      href={service.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-navy/5 hover:text-navy transition-colors group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {service.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navClass(link.href)}
              >
                {link.label}
              </Link>
            ))}

            <Button asChild className="ml-4 bg-navy text-white hover:bg-navy/90 text-sm" size="sm">
              <Link href="/afspraak">{t("cta")}</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white overflow-y-auto">
              <div className="flex flex-col gap-1 mt-8">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 text-base rounded transition-colors ${isActive("/") ? "text-navy font-semibold border-l-4 border-gold pl-3" : "font-medium text-gray-700 hover:text-navy hover:bg-gray-50"}`}
                >
                  {t("home")}
                </Link>

                {/* Mobile diensten accordion */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
                  >
                    {t("services")}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="ml-4 border-l-2 border-gold/30 pl-3 py-1 space-y-1">
                      <Link
                        href="/diensten"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-1.5 text-sm font-semibold text-navy hover:text-gold transition-colors"
                      >
                        {t("allServicesShort")}
                      </Link>
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          onClick={() => setOpen(false)}
                          className="block px-3 py-1.5 text-sm text-gray-600 hover:text-navy transition-colors"
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 text-base rounded transition-colors ${isActive(link.href) ? "text-navy font-semibold border-l-4 border-gold pl-3" : "font-medium text-gray-700 hover:text-navy hover:bg-gray-50"}`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => { switchLocale("nl"); setOpen(false); }}
                    className={`text-sm ${locale === "nl" ? "font-semibold text-gold" : "text-gray-600"}`}
                  >
                    NL
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { switchLocale("en"); setOpen(false); }}
                    className={`text-sm ${locale === "en" ? "font-semibold text-gold" : "text-gray-600"}`}
                  >
                    EN
                  </button>
                </div>

                <Button asChild className="mt-2 bg-navy text-white hover:bg-navy/90">
                  <Link href="/afspraak" onClick={() => setOpen(false)}>
                    {t("cta")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
