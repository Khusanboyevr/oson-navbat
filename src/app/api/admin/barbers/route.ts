import { getManagedBarbers } from "@/lib/server/barbers-service";
import { forbidden, requireSuperAdmin } from "@/lib/server/session";
import { createBarber } from "@/lib/server/store";
import { validateApplication } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** All workers, blocked ones included, local store + backend. */
export async function GET(): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();
  return Response.json({ status: "ok", data: await getManagedBarbers() });
}

/**
 * Super admin adding a worker by hand. It reuses the registration form's
 * validation, so a manually added usta carries exactly the same data — and lands
 * on the map immediately, without the approval step.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await requireSuperAdmin())) return forbidden();

  const body = await request.json().catch(() => null);
  const { data, errors } = validateApplication(body);

  if (!data) {
    return Response.json({ status: "error", message: "Ma'lumotlarni tekshiring", errors }, { status: 400 });
  }

  const barber = await createBarber({
    name: `${data.firstName} ${data.lastName}`.trim(),
    specialty: [data.profession, data.experienceYears > 0 ? `${data.experienceYears} yil tajriba` : null]
      .filter(Boolean)
      .join(" • "),
    rating: 0,
    location: data.address,
    coordinates: data.coordinates,
    photo: data.photo,
    bio: data.bio || `${data.workplace} — ${data.profession}.`,
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

  return Response.json({ status: "ok", data: barber }, { status: 201 });
}
