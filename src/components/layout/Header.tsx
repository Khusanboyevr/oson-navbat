"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/layout/Logo";
import NotificationBell from "@/components/layout/NotificationBell";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import type { TranslationKey } from "@/lib/i18n";

const NAV_LINKS: { href: string; key: TranslationKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/bookings", key: "nav.bookings" },
  { href: "/favorites", key: "nav.favorites" },
];

function getActiveHref(pathname: string): string {
  const match = NAV_LINKS.find(({ href }) => (href === "/" ? pathname === "/" : pathname.startsWith(href)));
  return match?.href ?? "";
}

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeHref = getActiveHref(pathname);
  const { containerRef, registerItem, style: indicatorStyle } = useSlidingIndicator(activeHref);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo
          onClick={() => setIsMenuOpen(false)}
          iconClassName="h-8 w-auto sm:h-10"
          textClassName="text-lg sm:text-xl"
        />

        <nav
          ref={containerRef}
          className="relative hidden items-center gap-1 rounded-full border border-white/30 bg-white/15 p-1 backdrop-blur-xl md:flex"
        >
          {indicatorStyle && (
            <span
              aria-hidden
              className="absolute inset-y-1 rounded-full border border-white/50 bg-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          )}
          {NAV_LINKS.map(({ href, key }) => {
            const isActive = href === activeHref;
            return (
              <Link
                key={href}
                ref={registerItem(href)}
                href={href}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />

          {user ? (
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-full border border-white/50 bg-white/30 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-foreground backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/50 active:scale-95 md:inline-flex"
            >
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element -- Google avatar URL
                <img src={user.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-[10rem] truncate">{user.name}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-premium hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95 md:inline-block"
            >
              {t("nav.login")}
            </Link>
          )}

          <button
            type="button"
            aria-label={isMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] active:scale-90 md:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/40 bg-white/70 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, key }) => {
              const isActive = href === activeHref;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-white/60"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="btn-premium mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
            >
              {user ? user.name : t("nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
