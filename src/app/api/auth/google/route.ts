import { cookies } from "next/headers";
import {
  fetchBackendMe,
  loginWithBackendGoogle,
  normalizeUserRole,
  verifyGoogleIdToken,
} from "@/lib/server/backend";
import {
  BACKEND_COOKIE,
  SESSION_COOKIE,
  findOwnBackendBarberId,
  issueSessionCookieValue,
  sessionCookieOptions,
  toSessionUser,
} from "@/lib/server/session";
import {
  findApplicationByEmail,
  findBarberByEmail,
  isPromisedSuperAdmin,
  updateUser,
  upsertGoogleUser,
} from "@/lib/server/store";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

/** Role privilege order, so a backend answer can promote but not demote. */
const RANK: Record<UserRole, number> = { client: 0, barber: 1, superadmin: 2 };

/**
 * Completes Google sign-in.
 *
 * The browser gets an ID token from Google Identity Services and posts it here;
 * this route verifies it (audience checked against the client ID the backend
 * publishes at `/auth/methods/`), forwards it to Django's `POST /auth/google/` so
 * the account is created there too, and issues our own signed session cookie.
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
  let user = await upsertGoogleUser(profile, backend.ok);

  // An approved usta signs in with the email their profile was created under, so
  // that alone is enough to open their panel — even before the backend reports the
  // role back. The backend can still promote further (to super admin); it never
  // demotes, or an operator listed in SUPER_ADMIN_EMAILS could lock themselves out.
  const [application, ownProfile, promisedSuperAdmin] = await Promise.all([
    findApplicationByEmail(profile.email),
    findBarberByEmail(profile.email),
    isPromisedSuperAdmin(profile.email),
  ]);

  const mirroredCookie =
    backend.ok && backend.cookies.length > 0
      ? backend.cookies.map((value) => value.split(";")[0]).join("; ")
      : null;

  // The backend owns roles, so its answer matters most. When the sign-in response
  // doesn't carry one, ask /auth/me/ rather than leaving an usta or an admin
  // looking like a client.
  let backendRole = backend.user?.role ? normalizeUserRole(backend.user.role) : null;
  if (!backendRole && mirroredCookie) {
    const me = await fetchBackendMe(mirroredCookie);
    if (me.user?.role) backendRole = normalizeUserRole(me.user.role);
  }

  // The usta may exist only on the backend — created there by the super admin, or
  // outliving this deployment's own copy — so ask it whether this account owns a
  // profile rather than relying on the local mirror alone.
  const ownBackendBarberId = await findOwnBackendBarberId(mirroredCookie);

  const claims: UserRole[] = [user.role];
  if (application?.status === "approved" || ownProfile || ownBackendBarberId) claims.push("barber");
  // Added by another super admin (or listed in SUPER_ADMIN_EMAILS) before this
  // person had an account to promote.
  if (promisedSuperAdmin) claims.push("superadmin");
  if (backendRole) claims.push(backendRole);

  const role = claims.reduce((best, claim) => (RANK[claim] > RANK[best] ? claim : best), "client");
  if (role !== user.role) user = (await updateUser(user.id, { role })) ?? user;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, issueSessionCookieValue(user), sessionCookieOptions);

  if (mirroredCookie) {
    // Keep Django's session/refresh/CSRF cookies server-side; the browser never
    // needs to see them, and this is what lets us call the backend as the user.
    cookieStore.set(BACKEND_COOKIE, mirroredCookie, sessionCookieOptions);
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
