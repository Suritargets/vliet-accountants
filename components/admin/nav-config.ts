import {
  LayoutDashboard,
  CalendarCheck,
  CalendarCog,
  Home,
  Briefcase,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavSection[] = [
  {
    title: "Overzicht",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Afspraken",
    items: [
      { label: "Afspraken", href: "/admin/afspraken", icon: CalendarCheck },
      { label: "Beschikbaarheid", href: "/admin/beschikbaarheid", icon: CalendarCog },
      { label: "Berichten", href: "/admin/berichten", icon: MessageSquare },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Home },
      { label: "Diensten", href: "/admin/diensten", icon: Briefcase },
      { label: "Pagina's", href: "/admin/paginas", icon: FileText },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Vacatures", href: "/admin/vacatures", icon: Users },
    ],
  },
  {
    title: "Inzicht",
    items: [
      { label: "Statistieken", href: "/admin/statistieken", icon: BarChart3 },
      { label: "Logins", href: "/admin/logins", icon: ShieldCheck },
    ],
  },
];
