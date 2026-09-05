import { getPublicBarbers } from "@/lib/server/barbers-service";
import { fetchOwnBarber, updateOwnBarber } from "@/lib/server/backend";
import { getBackendCookie, getCurrentUser, unauthorized } from "@/lib/server/session";
import { createBarber, findBarberByEmail, updateBarber } from "@/lib/server/store";
import type { BarberProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * An usta's own profile: photo, bio and service menu.
 *
 * The backend owns this at `GET`/`PATCH /barber/me/` (singular — `/barbers/` is
 * the open catalog). Everything is written there first; the local copy is kept in
 * step so the panel still works, and takes over entirely if the backend is
 * unreachable.
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

/** The local mirror, used when the backend has nothing to say. */
async function resolveLocalProfile(email: string): Promise<BarberProfile | null> {
  const local = await findBarberByEmail(email);
  if (local) return local;

  const published = await getPublicBarbers();
  return published.find((barber) => barber.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const remote = await fetchOwnBarber(await getBackendCookie());
  if (remote.ok && remote.data) {
    return Response.json({ status: "ok", data: remote.data, meta: { backendOk: true } });
  }

  const local = await resolveLocalProfile(user.email);
  return Response.json({
    status: "ok",
    data: local,
    meta: { backendOk: false, backendError: remote.error },
  });
}

export async function PATCH(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "client") {
    return Response.json({ status: "error", message: "Bu amal faqat ustalar uchun" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { bio?: string; services?: unknown };

  const patch: Partial<BarberProfile> = {};
  if (typeof body.bio === "string") patch.bio = body.bio.trim();
  const services = parseServices(body.services);
  if (services) patch.services = services;

  if (Object.keys(patch).length === 0) {
    return Response.json({ status: "error", message: "O'zgartirish uchun maydon yo'q" }, { status: 400 });
  }

  const remote = await updateOwnBarber(await getBackendCookie(), {
    bio: patch.bio,
    services: patch.services,
  });

  // Mirror locally either way: the panel reads this copy when the backend is down,
  // and the public listing falls back to it for fields the backend leaves empty.
  const local = await findBarberByEmail(user.email);
  if (local) {
    await updateBarber(local.id, patch);
  } else {
    const base = remote.data ?? (await resolveLocalProfile(user.email));
    if (base) {
      await createBarber({ ...base, ...patch, source: "local", avatarColor: base.avatarColor });
    }
  }

  if (!remote.ok) {
    const saved = await resolveLocalProfile(user.email);
    return Response.json({
      status: "ok",
      data: saved,
      meta: { backendOk: false, backendError: remote.error },
    });
  }

  return Response.json({ status: "ok", data: remote.data, meta: { backendOk: true } });
}
