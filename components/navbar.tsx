"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Phone, ChevronDown } from "lucide-react";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const services = [
  { label: "Audit & Assurance", href: "/diensten/audit-assurance" },
  { label: "Internal Audit, Risk & Governance", href: "/diensten/internal-audit-risk-governance" },
  { label: "Accounting & Reporting", href: "/diensten/accounting-reporting" },
  { label: "Tax & Compliance", href: "/diensten/tax-compliance" },
  { label: "Advisory & Training", href: "/diensten/advisory-training" },
  { label: "Transformation & Project Management", href: "/diensten/transformation-project-management" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Werken bij ons", href: "/werken-bij-ons" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top bar */}
      <div className="bg-navy text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gold" />
            <a href="tel:+5978412345" className="hover:text-gold transition-colors">
              +597 841 2345
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gold transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gold transition-colors">
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2 border-l border-white/20 pl-4">
              <button className="font-semibold text-gold">NL</button>
              <span className="text-white/40">|</span>
              <button className="hover:text-gold transition-colors">EN</button>
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
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors">
              Home
            </Link>

            {/* Diensten dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link
                href="/diensten"
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
              >
                Diensten
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </Link>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <Link
                      href="/diensten"
                      className="text-xs font-semibold text-navy/60 uppercase tracking-wider hover:text-gold transition-colors"
                    >
                      Alle diensten bekijken →
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

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <Button asChild className="ml-4 bg-navy text-white hover:bg-navy/90 text-sm" size="sm">
              <Link href="/contact">Plan een kennismaking</Link>
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
                  className="px-4 py-3 text-base font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
                >
                  Home
                </Link>

                {/* Mobile diensten accordion */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
                  >
                    Diensten
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="ml-4 border-l-2 border-gold/30 pl-3 py-1 space-y-1">
                      <Link
                        href="/diensten"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-1.5 text-sm font-semibold text-navy hover:text-gold transition-colors"
                      >
                        Alle diensten
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

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base font-medium text-gray-700 rounded hover:text-navy hover:bg-gray-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <Button asChild className="mt-4 bg-navy text-white hover:bg-navy/90">
                  <Link href="/contact" onClick={() => setOpen(false)}>
                    Plan een kennismaking
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
