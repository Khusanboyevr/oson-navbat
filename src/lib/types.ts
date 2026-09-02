/**
 * Domain types shared by the API routes, the server store and the client.
 * They mirror what the Django backend will eventually own — see
 * `src/lib/server/backend.ts` for the mapping in both directions.
 */

export type UserRole = "client" | "barber" | "superadmin";
export type AccountStatus = "active" | "blocked";

/** A person who signed in with Google. Name + email are what Google gives us. */
export interface AppUser {
  id: string;
  googleSub: string | null;
  email: string;
  name: string;
  picture: string | null;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  /** True once the Django backend accepted this account too. */
  syncedWithBackend: boolean;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Everything the worker (usta) registration form collects. */
export interface BarberApplicationInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  /** Where they live — "yashash joyi". */
  residence: string;
  /** Salon / shop name — "ish joyi". */
  workplace: string;
  /** Human readable address of the workplace. */
  address: string;
  coordinates: Coordinates;
  /** Category the barber works in — drives the home page filters. */
  category: BarberCategoryKey;
  /** Free-text profession, e.g. "Fade • Soqol olish". */
  profession: string;
  experienceYears: number;
  bio: string;
  /** Data URL of the downscaled avatar the applicant uploaded. */
  photo: string | null;
  services: BarberServiceInput[];
}

export type BarberCategoryKey = "erkaklar" | "ayollar" | "bolalar";

export interface BarberServiceInput {
  name: string;
  price: number;
  durationMinutes: number;
}

export interface BarberApplication extends BarberApplicationInput {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
  /** Set when the applicant was already signed in with Google. */
  userId: string | null;
  syncedWithBackend: boolean;
}

/** An approved worker — this is what the map, the home list and /barber/[id] read. */
export interface BarberProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  location: string;
  coordinates: Coordinates;
  avatarColor: string;
  photo: string | null;
  bio: string;
  category: BarberCategoryKey;
  experienceYears: number;
  phone: string;
  email: string;
  status: AccountStatus;
  /** "local" = stored by this app, "backend" = came from api.qulaynavbat.uz. */
  source: "local" | "backend";
  createdAt: string;
  services: { id: string; name: string; price: number; durationMinutes: number }[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  role: UserRole;
  /** Present when this account also owns an approved barber profile. */
  barberId: string | null;
  applicationStatus: ApplicationStatus | null;
}
