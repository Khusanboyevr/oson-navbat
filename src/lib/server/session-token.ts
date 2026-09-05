import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@/lib/types";

/**
 * The session cookie's contents, signed rather than stored.
 *
 * Sessions used to be rows in the local JSON store, which meant a refresh could
 * sign you out for reasons that had nothing to do with you: a restarted server on
 * an ephemeral filesystem, a second instance that never saw the write, a cleared
 * `.data`. A signed cookie needs no storage at all — any instance can verify it.
 */

export interface SessionPayload {
  /** Local mirror id, used to keep the store's copy of the account in step. */
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: UserRole;
  /** Issued-at, seconds. */
  iat: number;
}

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * `SESSION_SECRET` should be set in any real deployment. The fallback keeps local
 * development working; it is derived from values that are already deployment
 * specific, so two different projects don't share it by accident.
 */
function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    `${process.env.GOOGLE_CLIENT_ID ?? ""}:${process.env.NEXT_PUBLIC_API_URL ?? ""}:qulaynavbat`
  );
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function signature(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function signSession(payload: Omit<SessionPayload, "iat">): string {
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  return `${body}.${signature(body)}`;
}

export function verifySession(value: string | undefined): SessionPayload | null {
  if (!value) return null;

  const [body, provided] = value.split(".");
  if (!body || !provided) return null;

  const expected = signature(body);
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  // Constant-time compare, guarded because timingSafeEqual throws on length mismatch.
  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.email || !payload.id) return null;
    if (Math.floor(Date.now() / 1000) - payload.iat > MAX_AGE_SECONDS) return null;
    return payload;
  } catch {
    return null;
  }
}
