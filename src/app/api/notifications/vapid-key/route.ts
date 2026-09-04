import { relayToBackend } from "@/lib/server/notifications-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The Web Push public key. No auth required — the backend serves it to anyone. */
export async function GET(): Promise<Response> {
  return relayToBackend("/notifications/vapid-key/", { requiresAuth: false });
}
