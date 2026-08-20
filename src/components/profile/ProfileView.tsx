"use client";

import { ChevronRight, LifeBuoy, LogOut } from "lucide-react";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { LANGUAGES, LANGUAGE_LABELS } from "@/lib/i18n";

export default function ProfileView() {
  const { language, setLanguage, t } = useLanguage();
  const { pushEnabled, pushPending, pushError, enablePush, disablePush } = useNotifications();

  const handlePushToggle = (checked: boolean) => {
    if (checked) {
      enablePush();
    } else {
      disablePush();
    }
  };

  return (
    <div className="flex flex-col gap-6 py-8 sm:py-12">
      <ProfileHeader name="Azizbek" phone="+998 90 *** ** 45" />

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
                  lang === language ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-white/30"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{t("profile.notifications")}</span>
          <ToggleSwitch label={t("profile.push")} checked={pushEnabled} onChange={handlePushToggle} />
          <p className="text-xs text-muted-foreground">{t("profile.pushDescription")}</p>
          {pushError && <p className="text-xs text-danger">{pushError}</p>}
          {pushPending && <p className="text-xs text-muted-foreground">...</p>}
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

        <Link
          href="/login"
          className="btn-premium flex items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-5 py-4 text-sm font-semibold text-danger shadow-[0_4px_16px_rgba(220,38,38,0.15)] backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-danger/20 hover:shadow-[0_8px_24px_rgba(220,38,38,0.25)] active:scale-95"
        >
          <LogOut size={18} />
          {t("profile.logout")}
        </Link>
      </div>
    </div>
  );
}
