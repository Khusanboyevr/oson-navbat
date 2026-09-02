import { cookies } from "next/headers";
import { findApplicationByEmail, findBarberByEmail, findUserBySession } from "@/lib/server/store";
import type { AppUser, SessionUser } from "@/lib/types";

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

export async function getCurrentUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await findUserBySession(token);
  if (!user || user.status === "blocked") return null;
  return user;
}

export async function getBackendCookie(): Promise<string | null> {
  return (await cookies()).get(BACKEND_COOKIE)?.value ?? null;
}

/** Adds the barber-side context the UI needs (own profile id, application state). */
export async function toSessionUser(user: AppUser): Promise<SessionUser> {
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

export async function requireSuperAdmin(): Promise<AppUser | null> {
  const user = await getCurrentUser();
  return user?.role === "superadmin" ? user : null;
}

export function unauthorized(message = "Ruxsat yo'q"): Response {
  return Response.json({ status: "error", message }, { status: 401 });
}

export function forbidden(message = "Bu amal uchun super admin huquqi kerak"): Response {
  return Response.json({ status: "error", message }, { status: 403 });
}
