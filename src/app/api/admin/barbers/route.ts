import { getManagedBarbers } from "@/lib/server/barbers-service";
import { fetchAdminBarbers } from "@/lib/server/backend";
import { forbidden, getBackendCookie, requireSuperAdmin } from "@/lib/server/session";
import { createBarber } from "@/lib/server/store";
import { validateApplication } from "@/lib/server/validation";
import type { BarberProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * All workers the super admin manages. `GET /super-admin/barbers/` is the source
 * of truth; anything this app still holds locally (a worker approved while the
 * backend was unreachable) is merged in behind it, matched by email.
 */
export async function GET(): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const [remote, local] = await Promise.all([
    fetchAdminBarbers(await getBackendCookie()),
    getManagedBarbers(),
  ]);

  const backendRows = remote.data ?? [];
  const knownEmails = new Set(
    backendRows.map((barber) => barber.email.toLowerCase()).filter((email) => email.length > 0)
  );

  const localOnly = local.filter(
    (barber: BarberProfile) =>
      barber.source === "local" && (!barber.email || !knownEmails.has(barber.email.toLowerCase()))
  );

  return Response.json({
    status: "ok",
    data: [...backendRows, ...localOnly],
    meta: { backendOk: remote.ok, backendError: remote.error },
  });
}

/**
 * Super admin adding a worker by hand. It reuses the registration form's
 * validation and goes straight to the backend; the local copy is only a fallback
 * for when the backend can't be reached.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const body = await request.json().catch(() => null);
  const { data, errors } = validateApplication(body);

  if (!data) {
    return Response.json({ status: "error", message: "Ma'lumotlarni tekshiring", errors }, { status: 400 });
  }

  // The backend creator takes an application-shaped object; this is one that was
  // never queued for review.
  const { createBackendBarberFromApplication } = await import("@/lib/server/backend");
  const backend = await createBackendBarberFromApplication(
    {
      ...data,
      id: `manual-${Date.now()}`,
      status: "approved",
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      userId: null,
      syncedWithBackend: false,
    },
    await getBackendCookie()
  );

  const barber = await createBarber({
    name: `${data.firstName} ${data.lastName}`.trim(),
    specialty: [data.profession, data.experienceYears > 0 ? `${data.experienceYears} yil tajriba` : null]
      .filter(Boolean)
      .join(" \u2022 "),
    rating: 0,
    location: data.address,
    coordinates: data.coordinates,
    photo: data.photo,
    bio: data.bio || `${data.workplace} \u2014 ${data.profession}.`,
    category: data.category,
    experienceYears: data.experienceYears,
    phone: data.phone,
    email: data.email,
    status: "active",
    source: "local",
    services: data.services.map((service, index) => ({
      id: `manual-${Date.now()}-${index + 1}`,
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    })),
  });

  return Response.json(
    {
      status: "ok",
      data: barber,
      meta: { backendSynced: backend.ok, backendError: backend.error },
    },
    { status: 201 }
  );
}
