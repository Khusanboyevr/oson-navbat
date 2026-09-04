import { relayToBackend } from "@/lib/server/notifications-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Notification history — `GET /notifications/` on the backend, `?is_read=false` supported. */
export async function GET(request: Request): Promise<Response> {
  const isRead = new URL(request.url).searchParams.get("is_read");
  const query = isRead === "true" || isRead === "false" ? `?is_read=${isRead}` : "";
  return relayToBackend(`/notifications/${query}`);
}
