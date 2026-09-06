"use client";

import {
  CalendarClock,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/components/providers/SessionProvider";
import type { TranslationKey } from "@/lib/i18n";

interface Tab {
  href: string;
  icon: LucideIcon;
  key: TranslationKey;
}

const TABS: Tab[] = [
  { href: "/", icon: Home, key: "nav.home" },
  { href: "/bookings", icon: CalendarClock, key: "nav.bookings" },
  { href: "/favorites", icon: Heart, key: "nav.favorites" },
];

/**
 * The phone-only tab bar that makes the installed app feel like an app: the main
 * sections sit under the thumb instead of behind a menu button.
 *
 * Hidden during the booking flow, which has its own bottom bar (the price and
 * "Davom etish") — two stacked bars would eat the screen and bury the action.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useSession();

  if (pathname.startsWith("/barber/")) return null;

  const accountTab: Tab = user
    ? { href: "/profile", icon: User, key: "nav.profile" }
    : { href: "/login", icon: LogIn, key: "nav.login" };

  // An usta lands on the customer app like everyone else, so their own panel has
  // to be one tap away — it takes the favourites slot, which matters less to
  // someone who is here to work.
  const panelTab: Tab | null =
    user?.role === "superadmin"
      ? { href: "/super-admin", icon: LayoutDashboard, key: "nav.panel" }
      : user?.role === "barber"
        ? { href: "/admin", icon: LayoutDashboard, key: "nav.panel" }
        : null;

  const tabs = panelTab
    ? [TABS[0], TABS[1], panelTab, accountTab]
    : [...TABS, accountTab];

  return (
    <nav
      aria-label="Asosiy bo'limlar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/80 backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {tabs.map(({ href, icon: Icon, key }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

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
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="text-[11px] font-medium leading-none">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
