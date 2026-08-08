"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

interface ProfileHeaderProps {
  name: string;
  phone: string;
}

export default function ProfileHeader({ name: initialName, phone }: ProfileHeaderProps) {
  const [name, setName] = useState(initialName);
  const [draftName, setDraftName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraftName(name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (trimmed) setName(trimmed);
    setIsEditing(false);
  };

  return (
    <section className="flex items-center gap-5 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-8">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary text-3xl font-bold text-primary-foreground">
        {name.charAt(0)}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
                if (event.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              type="text"
              className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-1.5 font-serif text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-2xl"
            />
          ) : (
            <h1 className="truncate font-serif text-2xl font-bold text-foreground sm:text-3xl">{name}</h1>
          )}
          <p className="text-sm text-muted-foreground">{phone}</p>
        </div>

        {isEditing ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Saqlash"
              onClick={handleSave}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-90"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              aria-label="Bekor qilish"
              onClick={() => setIsEditing(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/50 active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Profilni tahrirlash"
            onClick={startEditing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/50 hover:text-foreground active:scale-90"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
