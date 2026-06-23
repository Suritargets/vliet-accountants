import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import { Separator } from "@/components/ui/separator";

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
  { label: "Diensten", href: "/diensten" },
  { label: "Over ons", href: "/over-ons" },
  { label: "Werken bij ons", href: "/werken-bij-ons" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 – About */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo-white.png"
                alt="Vliet Accountants & Consultants"
                width={160}
                height={50}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Vliet Accountants & Consultants ondersteunt organisaties met
              hoogwaardige audit-, accountancy- en adviesdiensten. Wij
              combineren kwaliteit, inzicht en ervaring om duurzame waarde te
              creëren.
            </p>
          </div>

          {/* Column 2 – Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Navigatie
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Maak contact met ons
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Ma – Vr 8:00 – 16:00</span>
              </li>
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Wagenwegstraat 51</span>
              </li>
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <a
                  href="tel:+5978412345"
                  className="hover:text-gold transition-colors"
                >
                  +597 841 2345
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 – Social */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Bezoek ons op social media
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="text-center text-white/50 text-sm">
          © 2025 Vliet Accountants & Consultants. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}
