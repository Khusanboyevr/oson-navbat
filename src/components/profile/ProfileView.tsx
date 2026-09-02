"use client";

import { ChevronRight, ClipboardList, LayoutDashboard, LifeBuoy, Loader2, LogOut, Scissors } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { useSession } from "@/components/providers/SessionProvider";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { LANGUAGES, LANGUAGE_LABELS } from "@/lib/i18n";

export default function ProfileView() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { pushEnabled, pushConfigured, pushPending, pushError, enablePush, disablePush } = useNotifications();
  const { user, isLoading, logout } = useSession();

  const handlePushToggle = (checked: boolean) => {
    if (checked) enablePush();
    else disablePush();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground">{t("auth.clientTitle")}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{t("auth.googleOnly")}</p>
        <Link
          href="/login"
          className="btn-premium rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
        >
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8 sm:py-12">
      <ProfileHeader user={user} />

      {/* Role shortcuts: an approved usta gets their schedule, a super admin the panel. */}
      {(user.role === "barber" || user.role === "superadmin") && (
        <Link
          href={user.role === "superadmin" ? "/super-admin" : "/admin"}
          className="btn-premium flex items-center justify-between rounded-full border border-white/50 bg-white/30 px-5 py-4 text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/45 active:scale-95"
        >
          <span className="flex items-center gap-3">
            <LayoutDashboard size={18} className="text-primary" />
            {user.role === "superadmin" ? "Boshqaruv paneli" : "Mening jadvalim"}
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      {user.applicationStatus === "pending" && (
        <p className="flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground/80">
          <ClipboardList size={16} className="shrink-0 text-accent" />
          Usta arizangiz ko&apos;rib chiqilmoqda. Tasdiqlangach profilingiz avtomatik yaratiladi.
        </p>
      )}

      {user.role === "client" && !user.applicationStatus && (
        <Link
          href="/register/barber"
          className="btn-premium flex items-center justify-between rounded-full border border-white/50 bg-white/30 px-5 py-4 text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/45 active:scale-95"
        >
          <span className="flex items-center gap-3">
            <Scissors size={18} className="text-primary" />
            {t("auth.barberCta")}
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      <section className="flex flex-col gap-5 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-6">
        <h2 className="text-lg font-bold text-foreground">{t("profile.settings")}</h2>

        <div className="flex flex-col gap-2 border-b border-white/30 pb-5">
          <span className="text-sm font-medium text-foreground">{t("profile.language")}</span>
          <div className="inline-flex w-fit items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1 backdrop-blur-md">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={lang === language}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-in-out active:scale-95 ${
                  lang === language
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-white/30"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{t("profile.notifications")}</span>
          {pushConfigured ? (
            <>
              <ToggleSwitch label={t("profile.push")} checked={pushEnabled} onChange={handlePushToggle} />
              <p className="text-xs text-muted-foreground">{t("profile.pushDescription")}</p>
              {pushError && <p className="text-xs text-danger">{pushError}</p>}
              {pushPending && <p className="text-xs text-muted-foreground">...</p>}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{t("profile.pushComingSoon")}</p>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <a
          href="https://t.me/qulaynavbat_support"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-premium flex items-center justify-between rounded-full border border-white/50 bg-white/30 px-5 py-4 text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/45 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-95"
        >
          <span className="flex items-center gap-3">
            <LifeBuoy size={18} className="text-primary" />
            {t("profile.support")}
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-premium flex items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-5 py-4 text-sm font-semibold text-danger shadow-[0_4px_16px_rgba(220,38,38,0.15)] backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-danger/20 hover:shadow-[0_8px_24px_rgba(220,38,38,0.25)] active:scale-95"
        >
          <LogOut size={18} />
          {t("profile.logout")}
        </button>
      </div>
    </div>
  );
}
