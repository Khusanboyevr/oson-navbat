import { fetchAvailableSlots } from "@/lib/server/bookings-api";
import { getBackendCookie } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Free times for an usta on a date.
 *
 * `available: null` means the backend couldn't answer — the picker then offers
 * every slot rather than inventing which ones are taken.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const barberId = params.get("barber");
  const date = params.get("date");

  if (!barberId || !date) {
    return Response.json({ status: "error", message: "barber va date kerak" }, { status: 400 });
  }

  const result = await fetchAvailableSlots(await getBackendCookie(), {
    barberId: barberId.startsWith("backend-") ? barberId.slice("backend-".length) : barberId,
    date,
    serviceId: params.get("service") ?? undefined,
  });

  return Response.json({
    status: "ok",
    data: { available: result.ok ? (result.data ?? []) : null, error: result.ok ? null : result.error },
  });
}
