"use client";

import { Check, Scissors } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { completeGoogleLogin, homeRouteForRole } from "@/lib/google-auth";
import type { SessionUser } from "@/lib/types";

/**
 * Sign-in is Google-only — no phone number, no SMS code. The account (name +
 * email) is created on the backend the moment Google verifies it, and shows up in
 * the super admin panel from there.
 */
export default function AuthView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { pushEnabled, enablePush } = useNotifications();
  const { setUser, refresh } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<SessionUser | null>(null);

  const handleCredential = async (credential: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await completeGoogleLogin(credential);
      setUser(result.user);
      await refresh();
      setSignedIn(result.user);
      if (!pushEnabled) enablePush();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Kirishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signedIn) {
    const destination = homeRouteForRole(signedIn.role);

    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check size={40} strokeWidth={3} />
        </span>

        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">{t("auth.successTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{signedIn.name}</p>
          <p className="text-xs text-muted-foreground">{signedIn.email}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push(destination)}
          className="btn-premium w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
        >
          {t("auth.continue")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{t("auth.clientTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.googleOnly")}</p>
      </div>

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-center text-xs text-danger">
          {error}
        </p>
      )}

      <GoogleSignInButton
        onCredential={handleCredential}
        onError={setError}
        isSubmitting={isSubmitting}
      />

      <div className="flex flex-col gap-3 border-t border-white/30 pt-5">
        <p className="text-center text-xs text-muted-foreground">{t("auth.barberHint")}</p>
        <Link
          href="/register/barber"
          className="btn-premium flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/30 px-5 py-3 text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/45 active:scale-95"
        >
          <Scissors size={16} className="text-primary" />
          {t("auth.barberCta")}
        </Link>
      </div>
    </div>
  );
}
