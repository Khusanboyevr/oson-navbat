import { setBookingStatus } from "@/lib/server/bookings-api";
import { getBackendCookie, getCurrentUser, unauthorized } from "@/lib/server/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Confirm, complete or cancel — each is its own action on the backend. */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status;

  if (status !== "confirmed" && status !== "completed" && status !== "cancelled") {
    return Response.json(
      { status: "error", message: "status 'confirmed', 'completed' yoki 'cancelled' bo'lishi kerak" },
      { status: 400 }
    );
  }

  const result = await setBookingStatus(await getBackendCookie(), id, status);

  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Amalni bajarib bo'lmadi" },
      { status: result.status || 502 }
    );
  }

  return Response.json({ status: "ok" });
}
