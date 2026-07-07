"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { adminNav } from "./nav-config";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-60 shrink-0 bg-navy text-white min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="block">
          <Image
            src="/images/logo-white.png"
            alt="Vliet Accountants & Consultants"
            width={150}
            height={46}
            className="h-9 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {adminNav.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-white/10 text-gold font-medium"
                          : "text-white/75 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-gold" : "text-white/50"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40">
        Vliet Admin
      </div>
    </aside>
  );
}
