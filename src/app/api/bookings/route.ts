import { createBooking, fetchBookings } from "@/lib/server/bookings-api";
import { getBackendCookie, getCurrentUser, unauthorized } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bookings, relayed to the backend as the signed-in user.
 *
 * `?scope=today` is what the usta panel asks for; without it the backend returns
 * the caller's own bookings.
 */
export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const params = new URL(request.url).searchParams;
  const scope = params.get("scope") === "today" ? ("today" as const) : undefined;
  const date = params.get("date") ?? undefined;

  const result = await fetchBookings(await getBackendCookie(), { scope, date });

  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Bronlarni yuklab bo'lmadi" },
      { status: result.status || 502 }
    );
  }

  return Response.json({ status: "ok", data: result.data ?? [] });
}

/** Creates a booking. A rejection is passed through untouched — never a fake success. */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { status: "error", message: "Bron qilish uchun tizimga kiring" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    barberId?: string;
    serviceId?: string;
    date?: string;
    time?: string;
  };

  if (!body.barberId || !body.serviceId || !body.date || !body.time) {
    return Response.json(
      { status: "error", message: "Usta, xizmat, sana va vaqt to'liq bo'lishi kerak" },
      { status: 400 }
    );
  }

  // Only barbers the backend knows can be booked; ids it issued carry this prefix.
  const backendBarberId = body.barberId.startsWith("backend-")
    ? body.barberId.slice("backend-".length)
    : body.barberId;

  const result = await createBooking(await getBackendCookie(), {
    barberId: backendBarberId,
    serviceId: body.serviceId,
    date: body.date,
    time: body.time,
  });

  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Bronni saqlab bo'lmadi" },
      { status: result.status || 502 }
    );
  }

  return Response.json({ status: "ok", data: result.data }, { status: 201 });
}
