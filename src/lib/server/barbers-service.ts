import { fetchBackendBarbers } from "@/lib/server/backend";
import { createBarber, findBarberByEmail, listBarbers, updateBarber } from "@/lib/server/store";
import type { BarberApplication, BarberProfile } from "@/lib/types";

/** Reads that combine the local store with whatever the Django backend serves. */

/**
 * Everything the public app shows: the backend's own catalog, and nothing else.
 *
 * A worker only reaches customers once the backend knows about them — an approval
 * that failed to sync must not put a bookable-looking card on the map, because the
 * backend would reject any booking against it. The local mirror is used only when
 * the backend can't be read at all, so an outage doesn't blank the site.
 *
 * The one thing overlaid from the local copy is what the backend has no room for:
 * its barber payload carries no profile photo, and an usta's own service edits
 * have nowhere to go until `/barber/me/` accepts them. Those fill gaps only, never
 * replacing what the backend returned.
 */
export async function getPublicBarbers(): Promise<BarberProfile[]> {
  const [local, remote] = await Promise.all([listBarbers(), fetchBackendBarbers()]);

  // Unreadable backend (not merely empty): serve the mirror rather than nothing.
  if (!remote.ok) return local.filter((barber) => barber.status === "active");

  const localByEmail = new Map(
    local
      .filter((barber) => barber.email)
      .map((barber) => [barber.email.toLowerCase(), barber] as const)
  );

  const enriched = remote.barbers.map((barber) => {
    const shadow = barber.email ? localByEmail.get(barber.email.toLowerCase()) : undefined;
    if (!shadow) return barber;

    return {
      ...barber,
      photo: barber.photo ?? shadow.photo,
      bio: barber.bio || shadow.bio,
      services: barber.services.length > 0 ? barber.services : shadow.services,
    };
  });

  return enriched.filter((barber) => barber.status === "active");
}

/** Every worker the super admin manages, blocked ones included. */
export async function getManagedBarbers(): Promise<BarberProfile[]> {
  const [local, remote] = await Promise.all([listBarbers(), fetchBackendBarbers()]);
  return [...local, ...remote.barbers];
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
