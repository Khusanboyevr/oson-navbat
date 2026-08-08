"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface NewBarberInput {
  name: string;
  specialty: string;
}

interface AddBarberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (barber: NewBarberInput) => void;
}

const SPECIALTIES = ["Erkaklar", "Ayollar", "Bolalar"];

export default function AddBarberModal({ isOpen, onClose, onSave }: AddBarberModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);

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

  const isValid = name.trim().length > 1 && phone.trim().length > 5;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ name: name.trim(), specialty });
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
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-foreground/70 backdrop-blur-md transition-colors hover:bg-white/50 hover:text-foreground"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground">Yangi usta qo&apos;shish</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tizimga yangi ustani ro&apos;yxatdan o&apos;tkazing.</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Usta ismi</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Masalan, Aziz Karimov"
                className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Telefon raqami</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                type="tel"
                inputMode="tel"
                placeholder="+998 90 123 45 67"
                className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Yo&apos;nalishi</span>
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="w-full rounded-2xl border border-white/40 bg-white/40 px-4 py-2.5 text-sm text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {SPECIALTIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
