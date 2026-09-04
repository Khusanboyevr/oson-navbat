import { cookies } from "next/headers";
import { proxyAsUser } from "@/lib/server/backend";
import { BACKEND_COOKIE, getBackendCookie, sessionCookieOptions } from "@/lib/server/session";

/**
 * Shared plumbing for the `/api/notifications/*` routes.
 *
 * They exist because the browser has no Django session of its own — sign-in
 * happens server-side, so the backend's httpOnly cookies live here. Every
 * notification call is relayed with those cookies, refreshed when they expire.
 */
export async function relayToBackend<T>(
  path: string,
  init: RequestInit & { requiresAuth?: boolean } = {}
): Promise<Response> {
  const backendCookie = await getBackendCookie();
  const result = await proxyAsUser<T>(path, init, backendCookie);

  // A refresh mid-call issues new cookies; store them so the next call is cheap.
  if (result.refreshedCookies && result.refreshedCookies.length > 0 && backendCookie) {
    const merged = [
      backendCookie,
      ...result.refreshedCookies.map((value) => value.split(";")[0]),
    ].join("; ");
    (await cookies()).set(BACKEND_COOKIE, merged, sessionCookieOptions);
  }

  if (!result.ok) {
    return Response.json(
      { status: "error", message: result.error ?? "Backend javob bermadi" },
      { status: result.status || 502 }
    );
  }

  return Response.json({ status: "ok", data: result.data }, { headers: { "Cache-Control": "no-store" } });
}
