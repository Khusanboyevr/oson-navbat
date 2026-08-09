"use client";

import { Check, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

export type AuthStep = "select" | "phone" | "otp" | "success";
export type AuthRole = "client" | "barber";

interface AuthFormProps {
  role: AuthRole;
  successRoute: string;
  onStepChange?: (step: AuthStep) => void;
}

const OTP_LENGTH = 4;

export default function AuthForm({ role, successRoute, onStepChange }: AuthFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<AuthStep>("select");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const isPhoneValid = phone.trim().length >= 9;
  const isOtpComplete = otp.every((digit) => digit.length === 1);

  const handleGoogleLogin = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
    }, 600);
  };

  const handleGetCode = () => {
    if (!isPhoneValid || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
    }, 600);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (!isOtpComplete || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
    }, 600);
  };

  const titleKey: TranslationKey = role === "barber" ? "auth.barberTitle" : "auth.clientTitle";
  const subtitleKey: TranslationKey = role === "barber" ? "auth.barberSubtitle" : "auth.clientSubtitle";
  const successSubtitleKey: TranslationKey =
    role === "barber" ? "auth.successSubtitleBarber" : "auth.successSubtitleClient";
  const headingKey: TranslationKey = step === "otp" ? "auth.enterCode" : titleKey;
  const subheadingKey: TranslationKey = step === "otp" ? "auth.codeSentTo" : subtitleKey;

  return (
    <div className="flex flex-col gap-6">
      {step !== "success" && (
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{t(headingKey)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(subheadingKey)}</p>
        </div>
      )}

      {step === "select" && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/40 bg-white/50 px-5 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/70 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {t("auth.google")}
          </button>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            <Phone size={18} />
            {t("auth.phone")}
          </button>
        </div>
      )}

      {step === "phone" && (
        <div className="flex flex-col gap-4">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("auth.phonePlaceholder")}
            autoFocus
            className="w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-3.5 text-center text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <button
            type="button"
            onClick={handleGetCode}
            disabled={!isPhoneValid || isSubmitting}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSubmitting ? t("auth.sending") : t("auth.getCode")}
          </button>

          <button
            type="button"
            onClick={() => setStep("select")}
            className="text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground"
          >
            {t("auth.back")}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className="h-14 w-14 rounded-2xl border border-white/40 bg-white/50 text-center text-xl font-bold text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!isOtpComplete || isSubmitting}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSubmitting ? t("auth.checking") : t("auth.verify")}
          </button>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground"
          >
            {t("auth.back")}
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check size={40} strokeWidth={3} />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">{t("auth.successTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(successSubtitleKey)}</p>
          </div>

          <Link
            href={successRoute}
            className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            {t("auth.continue")}
          </Link>
        </div>
      )}
    </div>
  );
}
