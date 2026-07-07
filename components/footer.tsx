import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Clock, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { FacebookIcon, LinkedInIcon } from "@/components/social-icons";
import { Separator } from "@/components/ui/separator";

const services = [ // eslint-disable-line @typescript-eslint/no-unused-vars
  { label: "Audit & Assurance", href: "/diensten/audit-assurance" },
  { label: "Internal Audit, Risk & Governance", href: "/diensten/internal-audit-risk-governance" },
  { label: "Accounting & Reporting", href: "/diensten/accounting-reporting" },
  { label: "Tax & Compliance", href: "/diensten/tax-compliance" },
  { label: "Advisory & Training", href: "/diensten/advisory-training" },
  { label: "Transformation & Project Management", href: "/diensten/transformation-project-management" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const navLinks = [
    { label: nav("home"), href: "/" },
    { label: nav("services"), href: "/diensten" },
    { label: nav("about"), href: "/over-ons" },
    { label: nav("careers"), href: "/werken-bij-ons" },
    { label: nav("blog"), href: "/blog" },
    { label: nav("contact"), href: "/contact" },
  ];

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
            <p className="text-white/70 text-sm leading-relaxed">{t("about")}</p>
          </div>

          {/* Column 2 – Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t("navigation")}
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
              {t("contactTitle")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>{t("hours")}</span>
              </li>
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span>Wagenwegstraat 51</span>
              </li>
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <a
                  href="tel:+5977202090"
                  className="hover:text-gold transition-colors"
                >
                  +597 720 2090
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 – Social */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              {t("socialTitle")}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=100073261638677"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/vliet-accountants-consultants/posts/?feedView=all"
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white/50 text-sm">
          <span>
            © 2025 Vliet Accountants &amp; Consultants. {t("rights")} — 2026 | {t("designBy")}{" "}
            <a href="https://www.suritargets.com/en" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors underline underline-offset-2">
              Suritargets
            </a>
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy-policy" className="hover:text-gold transition-colors underline underline-offset-2">
              {t("privacy")}
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/algemene-voorwaarden" className="hover:text-gold transition-colors underline underline-offset-2">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
