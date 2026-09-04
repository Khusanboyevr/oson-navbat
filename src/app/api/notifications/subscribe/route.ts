import { relayToBackend } from "@/lib/server/notifications-proxy";

export const runtime = "nodejs";

/** Registers this device's PushSubscription with the backend, verbatim. */
export async function POST(request: Request): Promise<Response> {
  const subscription = await request.json().catch(() => null);
  if (!subscription) {
    return Response.json({ status: "error", message: "Obuna ma'lumoti yuborilmadi" }, { status: 400 });
  }

  return relayToBackend("/notifications/subscribe/", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}
