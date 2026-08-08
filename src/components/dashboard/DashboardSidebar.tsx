"use client";

import {
  ArrowLeft,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Scissors,
  Settings,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavLink {
  label: string;
  href?: string;
  icon: LucideIcon;
}

interface RoleConfig {
  title: string;
  links: NavLink[];
}

const ROLE_CONFIG: Record<"admin" | "superadmin", RoleConfig> = {
  superadmin: {
    title: "Super Admin",
    links: [
      { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
      { label: "Ustalar", icon: Scissors },
      { label: "Mijozlar", href: "/superadmin/users", icon: Users },
      { label: "Sozlamalar", icon: Settings },
    ],
  },
  admin: {
    title: "Usta paneli",
    links: [
      { label: "Mening jadvalim", href: "/admin", icon: CalendarDays },
      { label: "Mijozlarim", icon: Users },
      { label: "Moliyaviy hisobot", icon: Wallet },
    ],
  },
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const role: "admin" | "superadmin" = pathname.startsWith("/superadmin") ? "superadmin" : "admin";
  const config = ROLE_CONFIG[role];

  const navContent = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
          <Image src="/logo.png" alt="osonNavbat" width={872} height={282} className="h-8 w-auto" />
        </Link>
        <p className="mt-3 rounded-full border border-white/40 bg-white/40 px-3 py-1 text-center text-xs font-medium text-foreground/70 backdrop-blur-md">
          {config.title}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {config.links.map(({ label, href, icon: Icon }) => {
          if (!href) {
            return (
              <span
                key={label}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/35"
              >
                <Icon size={18} />
                {label}
                <span className="ml-auto rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-medium text-foreground/50">
                  Tez orada
                </span>
              </span>
            );
          }

          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-white/50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-white/50"
      >
        <ArrowLeft size={16} />
        Saytga qaytish
      </Link>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/40 bg-white/70 px-4 backdrop-blur-xl lg:hidden">
        <span className="text-sm font-semibold text-foreground">{config.title}</span>
        <button
          type="button"
          aria-label={isOpen ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menyuni yopish"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 animate-fade-in bg-foreground/30 backdrop-blur-sm"
          />
          <div className="relative z-10 h-full w-72 animate-slide-in-left border-r border-white/40 bg-white/80 shadow-2xl backdrop-blur-2xl">
            {navContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/40 lg:bg-white/50 lg:backdrop-blur-xl">
        {navContent}
      </aside>
    </>
  );
}
