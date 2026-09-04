import { relayToBackend } from "@/lib/server/notifications-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The bell icon's badge count. */
export async function GET(): Promise<Response> {
  return relayToBackend("/notifications/unread-count/");
}
