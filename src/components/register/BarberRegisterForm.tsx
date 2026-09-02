"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { fileToAvatarDataUrl } from "@/lib/image";
import { reverseGeocode } from "@/lib/map";
import type { BarberCategoryKey, Coordinates } from "@/lib/types";

const LocationPickerMap = dynamic(() => import("@/components/map/LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] w-full items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-sm text-muted-foreground sm:h-[320px]">
      Xarita yuklanmoqda...
    </div>
  ),
});

interface ServiceDraft {
  name: string;
  price: string;
  durationMinutes: string;
}

const CATEGORY_OPTIONS: { value: BarberCategoryKey; label: string }[] = [
  { value: "erkaklar", label: "Erkaklar" },
  { value: "ayollar", label: "Ayollar" },
  { value: "bolalar", label: "Bolalar" },
];

const STEPS = ["Shaxsiy ma'lumotlar", "Ish joyi va lokatsiya", "Kasb va xizmatlar"];

interface BarberRegisterFormProps {
  /** Where to POST. Defaults to the public application queue. */
  endpoint?: string;
  /** Called after a successful submit — the admin modal closes and refreshes on it. */
  onSuccess?: () => void;
  /** Compact mode drops the page heading and the "back to login" link. */
  embedded?: boolean;
}

const inputClass =
  "w-full rounded-2xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40";

/**
 * Worker (usta) registration.
 *
 * Everything asked for here becomes the public profile automatically once the
 * super admin approves it — the address and the map pin become the marker, the
 * profession/experience become the headline, the services become the booking
 * menu. There is no second "fill in your profile" step afterwards.
 */
export default function BarberRegisterForm({
  endpoint = "/api/barbers/apply",
  onSuccess,
  embedded = false,
}: BarberRegisterFormProps = {}) {
  const { user } = useSession();
  const [step, setStep] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [email, setEmail] = useState("");
  const [residence, setResidence] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [category, setCategory] = useState<BarberCategoryKey>("erkaklar");
  const [profession, setProfession] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceDraft[]>([
    { name: "", price: "", durationMinutes: "30" },
  ]);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDone, setIsDone] = useState(false);

  // Prefill from the Google account when the applicant is already signed in.
  useEffect(() => {
    if (!user || embedded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail((current) => current || user.email);
    const [first, ...rest] = user.name.split(" ");
    setFirstName((current) => current || first || "");
    setLastName((current) => current || rest.join(" "));
    setPhoto((current) => current ?? user.picture);
  }, [user, embedded]);

  const handlePickLocation = async (next: Coordinates) => {
    setCoordinates(next);
    const resolved = await reverseGeocode(next);
    // Only fill an empty field — never overwrite an address typed by hand.
    if (resolved) setAddress((current) => (current.trim() ? current : resolved));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await handlePickLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setError("Joylashuvni aniqlab bo'lmadi — xaritadan qo'lda belgilang");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhoto(await fileToAvatarDataUrl(file));
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Rasmni yuklab bo'lmadi");
    }
  };

  const stepValid = (() => {
    if (step === 0) {
      return (
        firstName.trim().length > 1 &&
        lastName.trim().length > 1 &&
        phone.replace(/\D/g, "").length >= 9 &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) &&
        residence.trim().length > 2
      );
    }
    if (step === 1) {
      return workplace.trim().length > 1 && address.trim().length > 2 && coordinates !== null;
    }
    return profession.trim().length > 1;
  })();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          residence,
          workplace,
          address,
          coordinates,
          category,
          profession,
          experienceYears: Number(experienceYears) || 0,
          bio,
          photo,
          services: services
            .filter((service) => service.name.trim() && service.price.trim())
            .map((service) => ({
              name: service.name,
              price: Number(service.price.replace(/\s/g, "")) || 0,
              durationMinutes: Number(service.durationMinutes) || 30,
            })),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setFieldErrors(payload.errors ?? {});
        setError(payload.message ?? "Arizani yuborib bo'lmadi");
        return;
      }

      setIsDone(true);
      onSuccess?.();
    } catch {
      setError("Tarmoq xatosi — internetni tekshirib, qaytadan urinib ko'ring");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone && embedded) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-16 w-16 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check size={32} strokeWidth={3} />
        </span>
        <p className="text-sm font-semibold text-foreground">Usta qo&apos;shildi va xaritada paydo bo&apos;ldi.</p>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check size={40} strokeWidth={3} />
        </span>
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Arizangiz yuborildi!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Super admin ma&apos;lumotlaringizni tekshirib chiqadi. Tasdiqlangach profilingiz avtomatik
            yaratiladi va ish joyingiz xaritada paydo bo&apos;ladi.
          </p>
        </div>
        <Link
          href="/"
          className="btn-premium rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Usta bo&apos;lib qo&apos;shiling
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ma&apos;lumotlaringizni to&apos;ldiring — profilingiz shu ma&apos;lumotlardan avtomatik yig&apos;iladi.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                index <= step ? "bg-primary" : "bg-white/40"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${index <= step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-center text-xs text-danger">
          {error}
        </p>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ism" error={fieldErrors.firstName}>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="Aziz" />
            </Field>
            <Field label="Familiya" error={fieldErrors.lastName}>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Karimov" />
            </Field>
          </div>

          <Field label="Telefon raqam" error={fieldErrors.phone}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="+998 90 123 45 67"
            />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              className={inputClass}
              placeholder="aziz@gmail.com"
            />
          </Field>

          <Field label="Yashash joyingiz" error={fieldErrors.residence}>
            <input
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              className={inputClass}
              placeholder="Chilonzor tumani, Toshkent"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field label="Ish joyi (salon nomi)" error={fieldErrors.workplace}>
            <input
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              className={inputClass}
              placeholder="Aziz Barbershop"
            />
          </Field>

          <Field label="Ish joyi manzili" error={fieldErrors.address}>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="Chilonzor 19-mavze, 42-uy"
            />
          </Field>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">Xaritadan lokatsiyani belgilang</span>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/60 active:scale-95 disabled:opacity-50"
              >
                {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />}
                Mening joylashuvim
              </button>
            </div>

            <LocationPickerMap value={coordinates} onChange={handlePickLocation} />

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={13} className="text-primary" />
              {coordinates
                ? `Belgilandi: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`
                : "Xaritaga bosing yoki belgini suring"}
            </p>
            {fieldErrors.coordinates && <p className="text-xs text-danger">{fieldErrors.coordinates}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Yo'nalish" error={fieldErrors.category}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BarberCategoryKey)}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tajriba (yil)" error={fieldErrors.experienceYears}>
              <input
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className={inputClass}
                placeholder="5"
              />
            </Field>
          </div>

          <Field label="Kasbingiz / nima ish qilasiz" error={fieldErrors.profession}>
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className={inputClass}
              placeholder="Sartarosh — fade, soqol dizayni"
            />
          </Field>

          <Field label="O'zingiz haqingizda" error={fieldErrors.bio}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Mijozlar sizni nimasi bilan tanlashi kerak?"
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Profil rasmingiz</span>
            <div className="flex items-center gap-4">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                <img src={photo} alt="Profil rasmi" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 text-xs text-muted-foreground">
                  Rasm
                </span>
              )}

              <label className="btn-premium flex cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-white/30 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/50 active:scale-95">
                <Upload size={15} />
                Rasm yuklash
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                />
              </label>
            </div>
            {fieldErrors.photo && <p className="text-xs text-danger">{fieldErrors.photo}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Xizmatlar va narxlar</span>
            {services.map((service, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/20 p-3 sm:flex-row sm:items-center">
                <input
                  value={service.name}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, name: e.target.value } : item))
                    )
                  }
                  placeholder="Xizmat nomi"
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={service.price}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, price: e.target.value.replace(/\D/g, "") } : item
                      )
                    )
                  }
                  inputMode="numeric"
                  placeholder="Narxi (so'm)"
                  className={`${inputClass} sm:w-36`}
                />
                <input
                  value={service.durationMinutes}
                  onChange={(e) =>
                    setServices((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, durationMinutes: e.target.value.replace(/\D/g, "") } : item
                      )
                    )
                  }
                  inputMode="numeric"
                  placeholder="Daqiqa"
                  className={`${inputClass} sm:w-28`}
                />
                {services.length > 1 && (
                  <button
                    type="button"
                    aria-label="Xizmatni o'chirish"
                    onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setServices((prev) => [...prev, { name: "", price: "", durationMinutes: "30" }])}
              className="flex w-fit items-center gap-1.5 rounded-full border border-white/50 bg-white/30 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/50 active:scale-95"
            >
              <Plus size={14} />
              Xizmat qo&apos;shish
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-white/30 pt-5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Orqaga
          </button>
        ) : embedded ? (
          <span />
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Kirish sahifasi
          </Link>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!stepValid}
            className="btn-premium flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Keyingisi
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stepValid || isSubmitting}
            className="btn-premium flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Yuborilmoqda..." : embedded ? "Ustani qo'shish" : "Arizani yuborish"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}
