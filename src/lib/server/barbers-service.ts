import { fetchBackendBarbers } from "@/lib/server/backend";
import { createBarber, findBarberByEmail, listBarbers, updateBarber } from "@/lib/server/store";
import type { BarberApplication, BarberProfile } from "@/lib/types";

/** Reads that combine the local store with whatever the Django backend serves. */

/**
 * Everything the public app shows: locally approved workers plus `GET /barbers/`
 * from the real backend. Backend rows win on a duplicate email, since that copy is
 * the canonical one once the backend starts owning barbers.
 */
export async function getPublicBarbers(): Promise<BarberProfile[]> {
  const [local, backend] = await Promise.all([listBarbers(), fetchBackendBarbers()]);

  const backendEmails = new Set(
    backend.map((barber) => barber.email.toLowerCase()).filter((email) => email.length > 0)
  );

  const merged = [
    ...backend,
    ...local.filter((barber) => !backendEmails.has(barber.email.toLowerCase()) || !barber.email),
  ];

  return merged.filter((barber) => barber.status === "active");
}

/** Every worker the super admin manages, blocked ones included. */
export async function getManagedBarbers(): Promise<BarberProfile[]> {
  const [local, backend] = await Promise.all([listBarbers(), fetchBackendBarbers()]);
  return [...local, ...backend];
}

function specialtyFor(application: BarberApplication): string {
  const experience =
    application.experienceYears > 0 ? `${application.experienceYears} yil tajriba` : null;
  return [application.profession, experience].filter(Boolean).join(" • ");
}

/**
 * Turns an approved application into a live barber profile — this is the
 * "profilni avtomatik to'ldirish" step: the same data the applicant typed becomes
 * their public profile and their marker on the map, no second form to fill in.
 */
export async function promoteApplicationToBarber(
  application: BarberApplication
): Promise<BarberProfile> {
  const existing = application.email ? await findBarberByEmail(application.email) : null;

  const profile = {
    name: `${application.firstName} ${application.lastName}`.trim(),
    specialty: specialtyFor(application),
    rating: 0,
    location: application.address,
    coordinates: application.coordinates,
    photo: application.photo,
    bio:
      application.bio ||
      `${application.workplace} — ${application.profession}. ${application.residence} da yashaydi.`,
    category: application.category,
    experienceYears: application.experienceYears,
    phone: application.phone,
    email: application.email,
    status: "active" as const,
    source: "local" as const,
    services: application.services.map((service, index) => ({
      id: `${application.id}-${index + 1}`,
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    })),
  };

  if (existing) {
    const updated = await updateBarber(existing.id, profile);
    return updated ?? existing;
  }

  return createBarber(profile);
}

/** Single barber for the detail page — checks the local store, then the backend. */
export async function getPublicBarberById(id: string): Promise<BarberProfile | null> {
  const barbers = await getPublicBarbers();
  return barbers.find((barber) => barber.id === id) ?? null;
}
