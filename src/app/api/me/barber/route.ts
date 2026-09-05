import { getPublicBarbers } from "@/lib/server/barbers-service";
import { getCurrentUser, unauthorized } from "@/lib/server/session";
import { createBarber, findBarberByEmail, updateBarber } from "@/lib/server/store";
import type { BarberProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * An usta's own profile: their photo, bio and service menu.
 *
 * The backend has no self-service endpoint for barbers yet — it creates and edits
 * them only under `/super-admin/`, which an usta has no rights to, and its barber
 * payload carries no photo field at all. So these edits are stored here and
 * overlaid onto the public listing (see `getPublicBarbers`). They keep working
 * unchanged the day the backend accepts them.
 */

interface ServiceInput {
  id?: string;
  name: string;
  price: number;
  durationMinutes: number;
}

function parseServices(raw: unknown): BarberProfile["services"] | null {
  if (!Array.isArray(raw)) return null;

  return raw
    .map((item, index) => {
      const record = (item ?? {}) as Partial<ServiceInput>;
      const price = Number(record.price);
      const duration = Number(record.durationMinutes);

      return {
        id: typeof record.id === "string" && record.id ? record.id : `svc-${Date.now()}-${index}`,
        name: typeof record.name === "string" ? record.name.trim() : "",
        price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
        durationMinutes: Number.isFinite(duration) ? Math.max(5, Math.round(duration)) : 30,
      };
    })
    .filter((service) => service.name.length > 0 && service.price > 0);
}

/** The signed-in usta's profile, whether it lives locally or came from the backend. */
async function resolveOwnProfile(email: string): Promise<BarberProfile | null> {
  const local = await findBarberByEmail(email);
  if (local) return local;

  const published = await getPublicBarbers();
  return published.find((barber) => barber.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const profile = await resolveOwnProfile(user.email);
  return Response.json({ status: "ok", data: profile });
}

export async function PATCH(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "client") {
    return Response.json(
      { status: "error", message: "Bu amal faqat ustalar uchun" },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    photo?: string | null;
    bio?: string;
    services?: unknown;
  };

  const patch: Partial<BarberProfile> = {};

  if (body.photo === null) patch.photo = null;
  if (typeof body.photo === "string" && body.photo.startsWith("data:image/")) {
    if (body.photo.length > 700_000) {
      return Response.json({ status: "error", message: "Rasm hajmi juda katta" }, { status: 400 });
    }
    patch.photo = body.photo;
  }
  if (typeof body.bio === "string") patch.bio = body.bio.trim();

  const services = parseServices(body.services);
  if (services) patch.services = services;

  if (Object.keys(patch).length === 0) {
    return Response.json({ status: "error", message: "O'zgartirish uchun maydon yo'q" }, { status: 400 });
  }

  const existing = await resolveOwnProfile(user.email);
  if (!existing) {
    return Response.json(
      { status: "error", message: "Profilingiz hali yaratilmagan — arizangiz tasdiqlanishini kuting." },
      { status: 404 }
    );
  }

  // A backend-owned row has no local copy to edit, so make one that shadows it.
  const local = await findBarberByEmail(user.email);
  const saved = local
    ? await updateBarber(local.id, patch)
    : await createBarber({ ...existing, ...patch, source: "local", avatarColor: existing.avatarColor });

  return Response.json({ status: "ok", data: saved });
}
