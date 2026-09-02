import { getPublicBarbers } from "@/lib/server/barbers-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The public barber list — feeds the home grid and the map. It re-reads on every
 * request, so an approved worker shows up on the map as soon as the page refetches.
 */
export async function GET(): Promise<Response> {
  const barbers = await getPublicBarbers();
  return Response.json(
    { status: "ok", data: barbers },
    { headers: { "Cache-Control": "no-store" } }
  );
}
