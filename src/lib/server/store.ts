import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AppUser,
  BarberApplication,
  BarberApplicationInput,
  BarberProfile,
  UserRole,
} from "@/lib/types";

/**
 * The app's own persistence layer, for the two things the backend has no home for.
 *
 * - **Worker applications.** Self-registration doesn't exist on the backend: it
 *   creates barbers only through `/super-admin/barbers/`, so the review queue
 *   behind `/register/barber` lives here until a super admin approves it.
 * - **A mirror of users and barbers**, used as a fallback while the backend is
 *   unreachable. The backend is the source of truth for both.
 *
 * Sessions are not here: they are signed cookies (`session-token.ts`), so nothing
 * about staying signed in depends on this file surviving.
 *
 * Where it lives, in order of preference:
 *
 * 1. A Redis/KV store over its REST API, when `KV_REST_API_URL` + `KV_REST_API_TOKEN`
 *    (Vercel KV) or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set.
 *    This is the only durable option on a serverless host: every instance reads and
 *    writes the same document, so an application submitted on one is visible to the
 *    super admin on another.
 * 2. `DATA_DIR` (default `<project>/.data`), which is right for a normal server.
 *
 * With neither, a serverless deployment falls back to `/tmp`, where the queue lives
 * only as long as the instance that received it — `isStoreDurable()` reports that,
 * and the super admin panel says so out loud.
 */

interface StoreShape {
  users: AppUser[];
  applications: BarberApplication[];
  barbers: BarberProfile[];
  /** Emails promised the super admin role before their first sign-in. */
  superAdminInvites?: string[];
}

/**
 * On a serverless host the project directory is read-only, and `/tmp` is the only
 * writable path. Defaulting there keeps the app working instead of failing every
 * request that touches the store; point `DATA_DIR` at a mounted volume when the
 * application queue needs to outlive a single instance.
 */
const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "qulaynavbat")
    : path.join(process.cwd(), ".data"));

const DATA_FILE = path.join(DATA_DIR, "qulaynavbat.json");

/* --------------------------------------------------------------- KV store */

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const KV_KEY = process.env.KV_STORE_KEY ?? "qulaynavbat:store";
const usingKv = Boolean(KV_URL && KV_TOKEN);

/** How long a KV read is reused before asking again. */
const KV_CACHE_MS = 2000;
let kvCachedAt = 0;

/**
 * True when the store survives this instance — a KV store, or a real filesystem
 * that isn't the serverless `/tmp`. The application queue is only trustworthy then.
 */
export function isStoreDurable(): boolean {
  if (usingKv) return true;
  return !DATA_DIR.startsWith("/tmp");
}

async function kvRead(): Promise<string | null> {
  const response = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`KV get ${response.status}`);
  const payload = (await response.json()) as { result?: string | null };
  return payload.result ?? null;
}

async function kvWrite(value: string): Promise<void> {
  const response = await fetch(`${KV_URL}/set/${encodeURIComponent(KV_KEY)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: value,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`KV set ${response.status}`);
}

/** Logged once, so a read-only filesystem doesn't fill the logs on every write. */
let warnedAboutWrites = false;

export const AVATAR_COLORS = [
  "#145ee5",
  "#0d9488",
  "#f97316",
  "#2563eb",
  "#db2777",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#e11d48",
];

function seed(): StoreShape {
  // Deliberately empty: everything real comes from the backend, and demo ustas on
  // the public map are worse than an empty one — they can't be booked (the backend
  // rejects their ids as invalid UUIDs) and they hide how much real data exists.
  return { users: [], applications: [], barbers: [], superAdminInvites: [] };
}

/**
 * Drops the demo ustas an older version of this file seeded.
 *
 * They are recognisable with no false positives: a plain numeric id and no email,
 * which no real row has (approved workers get a UUID and their Google address).
 */
function withoutDemoBarbers(barbers: BarberProfile[]): BarberProfile[] {
  return barbers.filter((barber) => !(/^\d+$/.test(barber.id) && !barber.email));
}

let cache: StoreShape | null = null;
/** Modification time of the file the cache was built from. */
let cacheMtimeMs = 0;
let writeQueue: Promise<void> = Promise.resolve();

/**
 * The cache is only valid while the file behind it is unchanged. It can change
 * underneath us: Next bundles route handlers and server components separately (so
 * each may hold its own copy of this module), and a deployment can run more than
 * one instance. Comparing mtime on every read keeps them all honest.
 */
function normalize(parsed: Partial<StoreShape>): StoreShape {
  return {
    users: parsed.users ?? [],
    applications: parsed.applications ?? [],
    barbers: withoutDemoBarbers(parsed.barbers ?? []),
    superAdminInvites: parsed.superAdminInvites ?? [],
  };
}

async function load(): Promise<StoreShape> {
  if (usingKv) {
    if (cache && Date.now() - kvCachedAt < KV_CACHE_MS) return cache;
    try {
      const raw = await kvRead();
      cache = raw ? normalize(JSON.parse(raw) as Partial<StoreShape>) : seed();
      kvCachedAt = Date.now();
    } catch (error) {
      // Unreachable KV: keep serving whatever this instance already has rather
      // than wiping it, and try again on the next read.
      if (!warnedAboutWrites) {
        warnedAboutWrites = true;
        console.warn("[store] KV o'qib bo'lmadi:", error instanceof Error ? error.message : error);
      }
      cache = cache ?? seed();
    }
    return cache;
  }

  let mtimeMs = 0;
  try {
    mtimeMs = (await stat(DATA_FILE)).mtimeMs;
  } catch {
    mtimeMs = 0;
  }

  if (cache && mtimeMs === cacheMtimeMs) return cache;

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    cache = {
      users: parsed.users ?? [],
      applications: parsed.applications ?? [],
      barbers: withoutDemoBarbers(parsed.barbers ?? []),
      superAdminInvites: parsed.superAdminInvites ?? [],
    };
    cacheMtimeMs = mtimeMs;
  } catch {
    cache = seed();
    await persist(cache);
  }
  return cache;
}

async function persist(data: StoreShape): Promise<void> {
  // Serialize writes and swap the file in atomically, so a crash mid-write can't
  // leave a truncated JSON file behind. A filesystem that refuses the write is not
  // fatal: the in-memory copy still serves this instance, and the backend holds
  // everything that matters anyway.
  writeQueue = writeQueue.then(async () => {
    cache = data;

    if (usingKv) {
      try {
        await kvWrite(JSON.stringify(data));
        kvCachedAt = Date.now();
      } catch (error) {
        console.warn("[store] KV ga yozib bo'lmadi:", error instanceof Error ? error.message : error);
      }
      return;
    }

    try {
      await mkdir(DATA_DIR, { recursive: true });
      const tmp = `${DATA_FILE}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
      await rename(tmp, DATA_FILE);
      // Record the new mtime so our own write doesn't look like someone else's.
      cacheMtimeMs = (await stat(DATA_FILE)).mtimeMs;
    } catch (error) {
      if (!warnedAboutWrites) {
        warnedAboutWrites = true;
        console.warn(
          `[store] ${DATA_DIR} ga yozib bo'lmadi, ma'lumot faqat xotirada saqlanadi:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  });
  await writeQueue;
}

async function mutate<T>(fn: (data: StoreShape) => T | Promise<T>): Promise<T> {
  // Read past the cache before changing anything: another instance may have
  // written since, and this is a read-modify-write of the whole document.
  if (usingKv) kvCachedAt = 0;
  const data = await load();
  const result = await fn(data);
  await persist(data);
  return result;
}

/* ------------------------------------------------------------------ users */

function superAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/* ------------------------------------------------ super admin invitations */

/**
 * Emails a super admin added before that person had ever signed in.
 *
 * The backend can only change the role of an account it already has, and an
 * account only exists there once its owner signs in with Google. This list bridges
 * that gap: the role is granted on their first sign-in. Nothing else depends on
 * it, and a real deployment should still keep `SUPER_ADMIN_EMAILS` set so the
 * first operator can always get in.
 */
export async function listSuperAdminInvites(): Promise<string[]> {
  const data = await load();
  return [...(data.superAdminInvites ?? [])];
}

export async function addSuperAdminInvite(email: string): Promise<void> {
  await mutate((data) => {
    const normalized = email.trim().toLowerCase();
    const invites = data.superAdminInvites ?? [];
    if (!invites.includes(normalized)) invites.push(normalized);
    data.superAdminInvites = invites;
  });
}

export async function removeSuperAdminInvite(email: string): Promise<void> {
  await mutate((data) => {
    const normalized = email.trim().toLowerCase();
    data.superAdminInvites = (data.superAdminInvites ?? []).filter((item) => item !== normalized);
  });
}

/** Env list and invitations together — both grant the role on sign-in. */
export async function isPromisedSuperAdmin(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (superAdminEmails().includes(normalized)) return true;
  return (await listSuperAdminInvites()).includes(normalized);
}

/**
 * Only an explicitly named account is a super admin here.
 *
 * There used to be a bootstrap - "if no emails are configured, the first account
 * to sign in becomes super admin" - which is only safe when this store is
 * durable. On a serverless host it is not: every cold instance starts empty, so
 * every arrival looked like the first one and was handed the panel. The backend's
 * own role is the real source of truth; this list is the local override.
 */
function resolveRole(email: string): UserRole {
  return superAdminEmails().includes(email.toLowerCase()) ? "superadmin" : "client";
}

export async function listUsers(): Promise<AppUser[]> {
  const data = await load();
  return [...data.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findUserById(id: string): Promise<AppUser | null> {
  const data = await load();
  return data.users.find((user) => user.id === id) ?? null;
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const data = await load();
  const normalized = email.toLowerCase();
  return data.users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
}

/** Creates the account on first Google sign-in, refreshes name/photo afterwards. */
export async function upsertGoogleUser(
  identity: GoogleIdentity,
  syncedWithBackend: boolean
): Promise<AppUser> {
  return mutate((data) => {
    const normalized = identity.email.toLowerCase();
    const existing = data.users.find((user) => user.email.toLowerCase() === normalized);

    if (existing) {
      existing.googleSub = identity.sub;
      existing.name = identity.name || existing.name;
      existing.picture = identity.picture ?? existing.picture;
      existing.syncedWithBackend = existing.syncedWithBackend || syncedWithBackend;
      return existing;
    }

    const user: AppUser = {
      id: randomUUID(),
      googleSub: identity.sub,
      email: identity.email,
      name: identity.name || identity.email.split("@")[0],
      picture: identity.picture,
      role: resolveRole(identity.email),
      status: "active",
      createdAt: new Date().toISOString(),
      syncedWithBackend,
    };
    data.users.push(user);
    return user;
  });
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<AppUser, "name" | "role" | "status">>
): Promise<AppUser | null> {
  return mutate((data) => {
    const user = data.users.find((item) => item.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  });
}

export async function deleteUser(id: string): Promise<boolean> {
  return mutate((data) => {
    const before = data.users.length;
    data.users = data.users.filter((user) => user.id !== id);
    return data.users.length < before;
  });
}

/* ----------------------------------------------------------- applications */

export async function listApplications(): Promise<BarberApplication[]> {
  const data = await load();
  return [...data.applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findApplicationById(id: string): Promise<BarberApplication | null> {
  const data = await load();
  return data.applications.find((item) => item.id === id) ?? null;
}

export async function findApplicationByUser(userId: string): Promise<BarberApplication | null> {
  const data = await load();
  return data.applications.find((item) => item.userId === userId) ?? null;
}

export async function findApplicationByEmail(email: string): Promise<BarberApplication | null> {
  const data = await load();
  const normalized = email.toLowerCase();
  return data.applications.find((item) => item.email.toLowerCase() === normalized) ?? null;
}

export async function createApplication(
  input: BarberApplicationInput,
  options: { userId: string | null; syncedWithBackend: boolean }
): Promise<BarberApplication> {
  return mutate((data) => {
    const application: BarberApplication = {
      ...input,
      id: randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      userId: options.userId,
      syncedWithBackend: options.syncedWithBackend,
    };
    data.applications.unshift(application);
    return application;
  });
}

export async function setApplicationStatus(
  id: string,
  status: BarberApplication["status"]
): Promise<BarberApplication | null> {
  return mutate((data) => {
    const application = data.applications.find((item) => item.id === id);
    if (!application) return null;
    application.status = status;
    application.reviewedAt = new Date().toISOString();
    return application;
  });
}

export async function deleteApplication(id: string): Promise<boolean> {
  return mutate((data) => {
    const before = data.applications.length;
    data.applications = data.applications.filter((item) => item.id !== id);
    return data.applications.length < before;
  });
}

/* ---------------------------------------------------------------- barbers */

export async function listBarbers(): Promise<BarberProfile[]> {
  const data = await load();
  return [...data.barbers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findBarberById(id: string): Promise<BarberProfile | null> {
  const data = await load();
  return data.barbers.find((barber) => barber.id === id) ?? null;
}

export async function findBarberByEmail(email: string): Promise<BarberProfile | null> {
  const data = await load();
  const normalized = email.toLowerCase();
  return data.barbers.find((barber) => barber.email.toLowerCase() === normalized) ?? null;
}

export async function createBarber(
  barber: Omit<BarberProfile, "id" | "createdAt" | "avatarColor"> & { avatarColor?: string }
): Promise<BarberProfile> {
  return mutate((data) => {
    const profile: BarberProfile = {
      ...barber,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      avatarColor: barber.avatarColor ?? AVATAR_COLORS[data.barbers.length % AVATAR_COLORS.length],
    };
    data.barbers.unshift(profile);
    return profile;
  });
}

export async function updateBarber(
  id: string,
  patch: Partial<BarberProfile>
): Promise<BarberProfile | null> {
  return mutate((data) => {
    const barber = data.barbers.find((item) => item.id === id);
    if (!barber) return null;
    Object.assign(barber, patch);
    return barber;
  });
}

export async function deleteBarber(id: string): Promise<boolean> {
  return mutate((data) => {
    const before = data.barbers.length;
    data.barbers = data.barbers.filter((barber) => barber.id !== id);
    return data.barbers.length < before;
  });
}

/** Patch an application in place — used to record backend sync state. */
export async function updateApplication(
  id: string,
  patch: Partial<BarberApplication>
): Promise<BarberApplication | null> {
  return mutate((data) => {
    const application = data.applications.find((item) => item.id === id);
    if (!application) return null;
    Object.assign(application, patch);
    return application;
  });
}
