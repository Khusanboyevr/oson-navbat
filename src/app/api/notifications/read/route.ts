import { relayToBackend } from "@/lib/server/notifications-proxy";

export const runtime = "nodejs";

/** Empty body marks everything read; `{ ids: [...] }` marks just those. */
export async function PUT(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const payload = Array.isArray(body.ids) && body.ids.length > 0 ? { ids: body.ids } : {};

  return relayToBackend("/notifications/read/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
