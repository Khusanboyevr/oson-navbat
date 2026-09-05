import { cookies } from "next/headers";
import { signSession, verifySession } from "@/lib/server/session-token";
import {
  findApplicationByEmail,
  findBarberByEmail,
  findUserByEmail,
} from "@/lib/server/store";
import type { AppUser, SessionUser, UserRole } from "@/lib/types";

export const SESSION_COOKIE = "qn_session";
/** Mirrors the Django session cookie so server-side calls can act as the user. */
export const BACKEND_COOKIE = "qn_backend";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** The signed-in account, as far as this app is concerned. */
export interface SessionAccount {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: UserRole;
}

export function issueSessionCookieValue(user: Pick<AppUser, "id" | "email" | "name" | "picture" | "role">): string {
  return signSession({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
  });
}

/**
 * Reads the session from its signed cookie — no storage lookup, so a restart or a
 * second instance can't sign anyone out.
 *
 * The local mirror is still consulted when it happens to have the account: a role
 * changed by the super admin then applies on the next request instead of the next
 * sign-in.
 */
export async function getCurrentUser(): Promise<SessionAccount | null> {
  const payload = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const mirrored = await findUserByEmail(payload.email);
  if (mirrored?.status === "blocked") return null;

  return {
    id: mirrored?.id ?? payload.id,
    email: payload.email,
    name: mirrored?.name ?? payload.name,
    picture: mirrored?.picture ?? payload.picture,
    role: mirrored?.role ?? payload.role,
  };
}

export async function getBackendCookie(): Promise<string | null> {
  return (await cookies()).get(BACKEND_COOKIE)?.value ?? null;
}

/** Adds the barber-side context the UI needs (own profile id, application state). */
export async function toSessionUser(user: SessionAccount): Promise<SessionUser> {
  const [barber, application] = await Promise.all([
    findBarberByEmail(user.email),
    findApplicationByEmail(user.email),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    barberId: barber?.id ?? null,
    applicationStatus: application?.status ?? null,
  };
}

export async function requireSuperAdmin(): Promise<SessionAccount | null> {
  const user = await getCurrentUser();
  return user?.role === "superadmin" ? user : null;
}

export function unauthorized(message = "Ruxsat yo'q"): Response {
  return Response.json({ status: "error", message }, { status: 401 });
}

export function forbidden(message = "Bu amal uchun super admin huquqi kerak"): Response {
  return Response.json({ status: "error", message }, { status: 403 });
}
