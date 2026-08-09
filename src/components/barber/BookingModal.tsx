"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface BookingModalSummary {
  serviceName: string;
  dateLabel: string;
  time: string;
  priceLabel: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: BookingModalSummary;
}

type Step = "phone" | "otp" | "success";

const OTP_LENGTH = 4;

export default function BookingModal({ isOpen, onClose, summary }: BookingModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPhoneValid = phone.trim().length >= 9;
  const isOtpComplete = otp.every((digit) => digit.length === 1);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Modalni yopish"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-foreground/30 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-sm animate-modal-in rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
        <button
          type="button"
          aria-label="Yopish"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/50 hover:text-foreground active:scale-90"
        >
          <X size={16} />
        </button>

        {step === "phone" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Tasdiqlash</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bronni tasdiqlash uchun telefon raqamingizni kiriting.
              </p>
            </div>

            <p className="rounded-xl border border-white/30 bg-white/25 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-md">
              {summary.serviceName} • {summary.dateLabel}, {summary.time} • {summary.priceLabel}
            </p>

            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <button
              type="button"
              onClick={handleGetCode}
              disabled={!isPhoneValid || isSubmitting}
              className="btn-premium w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_4px_16px_rgba(4,20,73,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-[0_8px_24px_rgba(4,20,73,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Yuborilmoqda..." : "Kodni olish"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">SMS kodni kiriting</h2>
              <p className="mt-1 text-sm text-muted-foreground">Raqamingizga 4 xonali kod yuborildi.</p>
            </div>

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
                  className="h-14 w-14 rounded-2xl border border-white/40 bg-white/40 text-center text-xl font-bold text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={!isOtpComplete || isSubmitting}
              className="btn-premium w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_4px_16px_rgba(4,20,73,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-[0_8px_24px_rgba(4,20,73,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check size={40} strokeWidth={3} />
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Muvaffaqiyatli band qilindi!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sizning navbatingiz tasdiqlandi. Tashrifingizdan 1 soat oldin eslatma yuboramiz.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Link
                href="/bookings"
                onClick={onClose}
                className="btn-premium w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
              >
                Bronlarimga o&apos;tish
              </Link>
              <Link
                href="/"
                onClick={onClose}
                className="btn-premium w-full rounded-full border border-white/50 bg-white/25 px-5 py-3 text-center text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-95"
              >
                Asosiy sahifaga qaytish
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
