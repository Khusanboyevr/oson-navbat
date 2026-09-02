"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GOOGLE_CLIENT_ID, isGoogleConfigured, loadGoogleIdentity } from "@/lib/google-auth";

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  /** Shown while the credential is being exchanged for a session. */
  isSubmitting?: boolean;
}

/**
 * Renders Google's own sign-in button. Google requires its rendered button (or One
 * Tap) to mint an ID token, so this is the real thing rather than a styled clone.
 */
export default function GoogleSignInButton({
  onCredential,
  onError,
  disabled,
  isSubmitting,
}: GoogleSignInButtonProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const errorRef = useRef(onError);
  const [isReady, setIsReady] = useState(false);

  // Google's callback is registered once; these keep it pointed at the latest props.
  useEffect(() => {
    callbackRef.current = onCredential;
    errorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!isGoogleConfigured) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((identity) => {
        if (cancelled || !containerRef.current) return;

        identity.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) callbackRef.current(response.credential);
            else errorRef.current("Google javob qaytarmadi, qaytadan urinib ko'ring");
          },
          cancel_on_tap_outside: false,
        });

        containerRef.current.innerHTML = "";
        identity.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          // Google renders the button's own label; keep it in the app's language.
          locale: language,
          width: Math.min(containerRef.current.offsetWidth || 320, 400),
        });

        setIsReady(true);
      })
      .catch((error: Error) => {
        if (!cancelled) errorRef.current(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  if (!isGoogleConfigured) {
    return (
      <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-xs text-foreground/80">
        Google orqali kirish uchun <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> muhit
        o&apos;zgaruvchisi sozlanishi kerak.
      </p>
    );
  }

  return (
    <div className="relative flex min-h-[44px] w-full items-center justify-center">
      <div
        ref={containerRef}
        className={`flex w-full justify-center transition-opacity duration-200 ${
          isSubmitting || disabled ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      />

      {(!isReady || isSubmitting) && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          {isSubmitting ? "Kirilmoqda..." : "Yuklanmoqda..."}
        </span>
      )}
    </div>
  );
}
