"use client";

import { useState } from "react";
import AuthForm, { type AuthRole, type AuthStep } from "@/components/auth/AuthForm";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AuthView() {
  const { t } = useLanguage();
  const [role, setRole] = useState<AuthRole>("client");
  const [step, setStep] = useState<AuthStep>("select");

  return (
    <div className="flex flex-col gap-6">
      <AuthForm key={role} role={role} successRoute={role === "barber" ? "/admin" : "/"} onStepChange={setStep} />

      {step !== "success" && (
        <button
          type="button"
          onClick={() => setRole((prev) => (prev === "client" ? "barber" : "client"))}
          className="text-center text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          {role === "client" ? t("auth.barberCta") : t("auth.clientCta")}
        </button>
      )}
    </div>
  );
}
