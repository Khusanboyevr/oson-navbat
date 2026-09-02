import type { BarberApplicationInput, BarberCategoryKey, BarberServiceInput } from "@/lib/types";

/** Server-side validation for the worker registration form. */

const CATEGORIES: BarberCategoryKey[] = ["erkaklar", "ayollar", "bolalar"];

/** Data URL photos are stored inline, so cap them — the client downscales first. */
const MAX_PHOTO_BYTES = 700_000;

export interface ValidationResult {
  data: BarberApplicationInput | null;
  errors: Record<string, string>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits.replace(/^998/, "998")}`;
}

function parseServices(raw: unknown): BarberServiceInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        name: text(record.name),
        price: Math.max(0, Math.round(number(record.price) || 0)),
        durationMinutes: Math.max(5, Math.round(number(record.durationMinutes) || 30)),
      };
    })
    .filter((service) => service.name.length > 0 && service.price > 0);
}

export function validateApplication(body: unknown): ValidationResult {
  const input = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const firstName = text(input.firstName);
  const lastName = text(input.lastName);
  const phone = normalizePhone(text(input.phone));
  const email = text(input.email).toLowerCase();
  const residence = text(input.residence);
  const workplace = text(input.workplace);
  const address = text(input.address);
  const profession = text(input.profession);
  const bio = text(input.bio);
  const photo = typeof input.photo === "string" && input.photo.startsWith("data:image/") ? input.photo : null;
  const experienceYears = Math.max(0, Math.round(number(input.experienceYears) || 0));

  const category = CATEGORIES.includes(input.category as BarberCategoryKey)
    ? (input.category as BarberCategoryKey)
    : null;

  const coords = (input.coordinates ?? {}) as Record<string, unknown>;
  const lat = number(coords.lat);
  const lng = number(coords.lng);

  if (firstName.length < 2) errors.firstName = "Ismni to'liq kiriting";
  if (lastName.length < 2) errors.lastName = "Familiyani to'liq kiriting";
  if (phone.replace(/\D/g, "").length < 9) errors.phone = "Telefon raqamni to'g'ri kiriting";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Email manzilni to'g'ri kiriting";
  if (residence.length < 3) errors.residence = "Yashash joyingizni kiriting";
  if (workplace.length < 2) errors.workplace = "Ish joyingiz (salon) nomini kiriting";
  if (address.length < 3) errors.address = "Ish joyi manzilini kiriting";
  if (!category) errors.category = "Yo'nalishni tanlang";
  if (profession.length < 2) errors.profession = "Kasbingizni kiriting";
  if (experienceYears > 60) errors.experienceYears = "Tajriba yillari haqiqiy emas";
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
    errors.coordinates = "Xaritadan ish joyingizni belgilang";
  }
  if (photo && photo.length > MAX_PHOTO_BYTES) errors.photo = "Rasm hajmi juda katta";

  if (Object.keys(errors).length > 0) return { data: null, errors };

  return {
    data: {
      firstName,
      lastName,
      phone,
      email,
      residence,
      workplace,
      address,
      coordinates: { lat, lng },
      category: category as BarberCategoryKey,
      profession,
      experienceYears,
      bio,
      photo,
      services: parseServices(input.services),
    },
    errors: {},
  };
}
