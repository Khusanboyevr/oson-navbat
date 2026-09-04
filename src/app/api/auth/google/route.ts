import { cookies } from "next/headers";
import { loginWithBackendGoogle, verifyGoogleIdToken } from "@/lib/server/backend";
import {
  BACKEND_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
  toSessionUser,
} from "@/lib/server/session";
import { createSession, upsertGoogleUser } from "@/lib/server/store";

export const runtime = "nodejs";

/**
 * Completes Google sign-in.
 *
 * The browser gets an ID token from Google Identity Services and posts it here;
 * this route verifies it (audience checked against the client ID the backend
 * publishes at `/auth/methods/`), forwards it to Django's `POST /auth/google/` so
 * the account is created there too, and issues our own session cookie.
 *
 * Django's httpOnly session/refresh cookies are kept server-side; if the backend
 * is unreachable the account is still created locally with
 * `syncedWithBackend: false`, which the super admin panel surfaces.
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { credential?: string };
  const credential = body.credential?.trim();

  if (!credential) {
    return Response.json({ status: "error", message: "Google tokeni yuborilmadi" }, { status: 400 });
  }

  const profile = await verifyGoogleIdToken(credential);
  if (!profile) {
    return Response.json(
      {
        status: "error",
        message: "Google tokenini tekshirib bo'lmadi. Qaytadan urinib ko'ring.",
      },
      { status: 401 }
    );
  }

  const backend = await loginWithBackendGoogle(credential);
  const user = await upsertGoogleUser(profile, backend.ok);
  const token = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);

  if (backend.ok && backend.cookies.length > 0) {
    // Keep Django's session/refresh/CSRF cookies server-side; the browser never
    // needs to see them, and this is what lets us call the backend as the user.
    const mirrored = backend.cookies.map((value) => value.split(";")[0]).join("; ");
    cookieStore.set(BACKEND_COOKIE, mirrored, sessionCookieOptions);
  }

  return Response.json({
    status: "ok",
    data: {
      user: await toSessionUser(user),
      backendSynced: backend.ok,
      backendError: backend.ok ? null : backend.error,
      isNewUser: backend.isNewUser,
    },
  });
}
