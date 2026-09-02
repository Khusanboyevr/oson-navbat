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
 * this route verifies it, forwards it to Django's `POST /auth/google/` so the
 * account exists upstream too, and issues our own session cookie. If the backend
 * rejects it (its `GOOGLE_CLIENT_ID` is still unset in production), the account is
 * created locally anyway and `syncedWithBackend: false` is recorded, which the
 * super admin panel surfaces.
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
        message:
          "Google tokenini tekshirib bo'lmadi. GOOGLE_CLIENT_ID sozlanganini va token amal qilishini tekshiring.",
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
    // Keep Django's session/CSRF pair server-side; the browser never needs to see it.
    const mirrored = backend.cookies.map((value) => value.split(";")[0]).join("; ");
    cookieStore.set(BACKEND_COOKIE, mirrored, sessionCookieOptions);
  }

  return Response.json({
    status: "ok",
    data: {
      user: await toSessionUser(user),
      backendSynced: backend.ok,
      backendError: backend.ok ? null : backend.error,
    },
  });
}
