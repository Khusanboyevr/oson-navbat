"use client";

import {
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SUPER_ADMIN_TABS: Tab[] = [
  { href: "/super-admin", label: "Panel", icon: LayoutDashboard },
  { href: "/super-admin/applications", label: "Arizalar", icon: ClipboardList },
  { href: "/super-admin/users", label: "Foydalanuvchi", icon: Users },
  { href: "/super-admin/admins", label: "Adminlar", icon: ShieldCheck },
];

const BARBER_TABS: Tab[] = [
  { href: "/admin", label: "Jadvalim", icon: CalendarDays },
  { href: "/admin/profile", label: "Profilim", icon: UserCog },
  { href: "/", label: "Saytga", icon: Home },
];

/**
 * The dashboards' phone navigation, matching the customer app: sections under the
 * thumb instead of behind a drawer. The sidebar takes over from `lg` up.
 */
export default function DashboardBottomNav() {
  const pathname = usePathname();
  const tabs = pathname.startsWith("/super-admin") ? SUPER_ADMIN_TABS : BARBER_TABS;

  return (
    <nav
      aria-label="Panel bo'limlari"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/85 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {tabs.map(({ href, label, icon: Icon }) => {
          // "/super-admin" and "/admin" are prefixes of their own children, so the
          // root tab only lights up on an exact match.
          const isRoot = href === "/super-admin" || href === "/admin" || href === "/";
          const isActive = isRoot ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-foreground/55"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive ? "bg-primary/12" : "bg-transparent"
                  }`}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="text-[10.5px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
