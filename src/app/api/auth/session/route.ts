import { cookies } from "next/headers";
import { fetchBackendMe } from "@/lib/server/backend";
import {
  BACKEND_COOKIE,
  getBackendCookie,
  getCurrentUser,
  sessionCookieOptions,
  toSessionUser,
} from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in right now — the client's `SessionProvider` polls this. */
export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ status: "ok", data: { user: null } });

  // Keep the mirrored Django session alive: a 401 there is refreshed via
  // POST /auth/refresh/, and the fresh cookies replace the stored ones.
  const backendCookie = await getBackendCookie();
  if (backendCookie) {
    const { cookies: refreshed } = await fetchBackendMe(backendCookie);
    if (refreshed && refreshed.length > 0) {
      const merged = [backendCookie, ...refreshed.map((value) => value.split(";")[0])].join("; ");
      (await cookies()).set(BACKEND_COOKIE, merged, sessionCookieOptions);
    }
  }

  return Response.json({ status: "ok", data: { user: await toSessionUser(user) } });
}
