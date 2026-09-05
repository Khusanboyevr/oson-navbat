"use client";

import { Check, Clock, GripVertical, Image as ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import { fileToAvatarBlob } from "@/lib/image";
import type { BarberProfile } from "@/lib/types";

interface ServiceDraft {
  id: string;
  name: string;
  price: string;
  durationMinutes: string;
}

function toDrafts(services: BarberProfile["services"]): ServiceDraft[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    price: String(service.price),
    durationMinutes: String(service.durationMinutes),
  }));
}

const inputClass =
  "w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40";

/**
 * The usta's own profile: photo, bio and an unlimited service menu.
 *
 * Everything here is what customers see on the map card and the booking page, so
 * adding a service is all it takes to offer it.
 */
export default function BarberProfileEditor() {
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/me/barber", { cache: "no-store" });
      const payload = (await response.json()) as { data?: BarberProfile | null; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Profilni yuklab bo'lmadi");
        return;
      }
      if (!payload.data) {
        setProfile(null);
        return;
      }

      setProfile(payload.data);
      setPhoto(payload.data.photo);
      setBio(payload.data.bio);
      setServices(toDrafts(payload.data.services));
      setError(null);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading from the server on mount — setState lands after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const updateService = (index: number, patch: Partial<ServiceDraft>) => {
    setServices((prev) => prev.map((service, i) => (i === index ? { ...service, ...patch } : service)));
  };

  /**
   * Photos upload immediately and on their own: the backend takes them as
   * `multipart/form-data` (field `avatar`) on its own PATCH, not as part of the
   * JSON save below.
   */
  const handlePhoto = async (file: File | undefined) => {
    if (!file || isUploading) return;
    setIsUploading(true);
    setError(null);

    try {
      const blob = await fileToAvatarBlob(file);
      const form = new FormData();
      form.append("avatar", blob, "avatar.jpg");

      const response = await fetch("/api/me/barber/avatar", { method: "POST", body: form });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: { photo: string | null };
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Rasmni yuklab bo'lmadi");
        return;
      }
      setPhoto(payload.data?.photo ?? null);
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Rasmni yuklab bo'lmadi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      await fetch("/api/me/barber/avatar", { method: "DELETE" });
      setPhoto(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/me/barber", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          services: services
            .filter((service) => service.name.trim() && service.price.trim())
            .map((service) => ({
              id: service.id,
              name: service.name,
              price: Number(service.price) || 0,
              durationMinutes: Number(service.durationMinutes) || 30,
            })),
        }),
      });

      const payload = (await response.json()) as { data?: BarberProfile; message?: string };
      if (!response.ok || !payload.data) {
        setError(payload.message ?? "Saqlab bo'lmadi");
        return;
      }

      setProfile(payload.data);
      setServices(toDrafts(payload.data.services));
      setSavedAt(Date.now());
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/30 bg-white/30 p-8 text-sm text-muted-foreground backdrop-blur-xl">
        <Loader2 size={16} className="animate-spin" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-white/30 bg-white/30 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
        Profilingiz hali yaratilmagan. Usta arizangiz super admin tomonidan tasdiqlangach bu bo&apos;lim ochiladi.
      </div>
    );
  }

  const total = services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <section className="flex flex-col gap-5 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ImageIcon size={18} className="text-primary" />
          Profil rasmi
        </h2>

        <div className="flex flex-wrap items-center gap-5">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL
            <img src={photo} alt="Profil rasmi" className="h-24 w-24 rounded-3xl object-cover" />
          ) : (
            <span
              className="flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold text-white"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {profile.name.charAt(0)}
            </span>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.specialty}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <label
                className={`btn-premium flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/60 active:scale-95 ${
                  isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"
                }`}
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? "Yuklanmoqda..." : photo ? "Rasmni almashtirish" : "Rasm yuklash"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handlePhoto(event.target.files?.[0])}
                />
              </label>
              {photo && (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRemovePhoto}
                  className="rounded-full bg-danger/10 px-4 py-2 text-xs font-semibold text-danger transition-all duration-200 hover:bg-danger/20 active:scale-95 disabled:opacity-50"
                >
                  O&apos;chirish
                </button>
              )}
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">O&apos;zingiz haqingizda</span>
          <textarea
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              setSavedAt(null);
            }}
            rows={3}
            placeholder="Mijozlar sizni nimasi bilan tanlashi kerak?"
            className={`${inputClass} resize-none`}
          />
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/30 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">Xizmatlarim</h2>
          <span className="text-xs text-muted-foreground">
            {services.length} ta xizmat • jami {formatNumber(total)} so&apos;m
          </span>
        </div>

        {services.length === 0 && (
          <p className="rounded-2xl bg-white/40 px-4 py-3 text-sm text-muted-foreground">
            Hali xizmat qo&apos;shilmagan. Nechta xohlasangiz, shuncha qo&apos;shishingiz mumkin.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/40 p-3 sm:flex-row sm:items-center"
            >
              <GripVertical size={16} className="hidden shrink-0 text-muted-foreground/60 sm:block" />

              <input
                value={service.name}
                onChange={(event) => updateService(index, { name: event.target.value })}
                placeholder="Xizmat nomi"
                className={`${inputClass} flex-1`}
              />

              <div className="flex items-center gap-2">
                <input
                  value={service.price}
                  onChange={(event) =>
                    updateService(index, { price: event.target.value.replace(/\D/g, "") })
                  }
                  inputMode="numeric"
                  placeholder="Narxi"
                  className={`${inputClass} sm:w-32`}
                />
                <span className="shrink-0 text-xs text-muted-foreground">so&apos;m</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={service.durationMinutes}
                  onChange={(event) =>
                    updateService(index, { durationMinutes: event.target.value.replace(/\D/g, "") })
                  }
                  inputMode="numeric"
                  placeholder="30"
                  className={`${inputClass} sm:w-20`}
                />
                <span className="shrink-0 text-xs text-muted-foreground">daq</span>
              </div>

              <button
                type="button"
                aria-label="Xizmatni o'chirish"
                onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setServices((prev) => [
              ...prev,
              { id: `new-${Date.now()}`, name: "", price: "", durationMinutes: "30" },
            ])
          }
          className="btn-premium flex w-fit items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/60 active:scale-95"
        >
          <Plus size={15} />
          Xizmat qo&apos;shish
        </button>
      </section>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-full border border-white/40 bg-white/70 p-2 pl-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {savedAt && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Check size={14} />
            Saqlandi
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-premium flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
