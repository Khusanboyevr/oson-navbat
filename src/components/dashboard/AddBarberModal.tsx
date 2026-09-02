"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import BarberRegisterForm from "@/components/register/BarberRegisterForm";

interface AddBarberModalProps {
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Super admin adding a worker by hand. It reuses the public registration form, so
 * a manually added usta carries exactly the same data — including the map pin that
 * puts them on the home page map straight away.
 */
export default function AddBarberModal({ onClose, onSaved }: AddBarberModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-10">
      <button
        type="button"
        aria-label="Modalni yopish"
        onClick={onClose}
        className="fixed inset-0 animate-fade-in bg-foreground/30 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-2xl animate-modal-in rounded-3xl border border-white/30 bg-white/25 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Yangi usta qo&apos;shish</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ma&apos;lumotlar to&apos;ldirilgach usta darhol faollashadi va xaritada ko&apos;rinadi.
            </p>
          </div>
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 hover:bg-white/50 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        <BarberRegisterForm embedded endpoint="/api/admin/barbers" onSuccess={onSaved} />
      </div>
    </div>
  );
}
