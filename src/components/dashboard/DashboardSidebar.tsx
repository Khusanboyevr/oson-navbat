"use client";

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";

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
      { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
      { label: "Ustalar arizalari", href: "/super-admin/applications", icon: ClipboardList },
      { label: "Foydalanuvchilar", href: "/super-admin/users", icon: Users },
      { label: "Super adminlar", href: "/super-admin/admins", icon: ShieldCheck },
    ],
  },
  admin: {
    title: "Usta paneli",
    links: [
      { label: "Mening jadvalim", href: "/admin", icon: CalendarDays },
      { label: "Mening profilim", href: "/admin/profile", icon: UserCog },
      { label: "Mijozlarim", icon: Users },
      { label: "Moliyaviy hisobot", icon: Wallet },
    ],
  },
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const role: "admin" | "superadmin" = pathname.startsWith("/super-admin") ? "superadmin" : "admin";
  const config = ROLE_CONFIG[role];

  return (
    <>
      {/* Phones get a title bar only — the sections live in the bottom tab bar. */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/40 bg-white/70 px-4 backdrop-blur-xl lg:hidden">
        <Logo iconClassName="h-7 w-auto" textClassName="text-base" />
        <span className="rounded-full border border-white/40 bg-white/50 px-3 py-1 text-xs font-medium text-foreground/70">
          {config.title}
        </span>
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/40 lg:bg-white/50 lg:backdrop-blur-xl">
        <div className="flex h-full flex-col gap-6 p-5">
          <div>
            <Logo />
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out active:scale-[0.98] ${
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
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/60 transition-all duration-200 ease-in-out hover:bg-white/50 active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            Saytga qaytish
          </Link>
        </div>
      </aside>
    </>
  );
}
