import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { BARBERS } from "@/lib/barbers";
import type {
  AppUser,
  BarberApplication,
  BarberApplicationInput,
  BarberProfile,
  UserRole,
} from "@/lib/types";

/**
 * The app's own persistence layer.
 *
 * The Django backend at api.qulaynavbat.uz can't hold this data yet — `/barbers/`
 * and `/salons/` are read-only and there is no user or application endpoint (see
 * README "Backend (Real API)"). So every write lands here, and
 * `src/lib/server/backend.ts` mirrors it upstream whenever the backend is able to
 * accept it. Swap this module for real SQL/Supabase without touching the routes.
 *
 * Data lives in `DATA_DIR` (default `<project>/.data`). On a serverless host that
 * directory is ephemeral — set `DATA_DIR` to a mounted volume, or move the data to
 * the real backend, before relying on it in production.
 */

interface StoreShape {
  users: AppUser[];
  applications: BarberApplication[];
  barbers: BarberProfile[];
  sessions: { token: string; userId: string; createdAt: string }[];
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "qulaynavbat.json");

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
  return {
    users: [],
    applications: [],
    // The original demo ustas, so the map and home list aren't empty before the
    // first real worker is approved. The super admin can delete them like any row.
    barbers: BARBERS.map((barber, index) => ({
      id: barber.id,
      name: barber.name,
      specialty: barber.specialty,
      rating: barber.rating,
      location: barber.location,
      coordinates: barber.coordinates,
      avatarColor: barber.avatarColor,
      photo: null,
      bio: barber.bio,
      category: barber.category,
      experienceYears: 0,
      phone: "",
      email: "",
      status: "active" as const,
      source: "local" as const,
      createdAt: new Date(2025, 0, index + 1).toISOString(),
      services: barber.services,
    })),
    sessions: [],
  };
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
async function load(): Promise<StoreShape> {
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
      barbers: parsed.barbers ?? [],
      sessions: parsed.sessions ?? [],
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
  // leave a truncated JSON file behind.
  writeQueue = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await rename(tmp, DATA_FILE);
    // Record the new mtime so our own write doesn't look like someone else's.
    cache = data;
    cacheMtimeMs = (await stat(DATA_FILE)).mtimeMs;
  });
  await writeQueue;
}

async function mutate<T>(fn: (data: StoreShape) => T | Promise<T>): Promise<T> {
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

/** Env list wins; if it's empty the very first account to sign in bootstraps as super admin. */
function resolveRole(email: string, isFirstUser: boolean): UserRole {
  const allowlist = superAdminEmails();
  if (allowlist.includes(email.toLowerCase())) return "superadmin";
  if (allowlist.length === 0 && isFirstUser) return "superadmin";
  return "client";
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
      role: resolveRole(identity.email, data.users.length === 0),
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
    data.sessions = data.sessions.filter((session) => session.userId !== id);
    return data.users.length < before;
  });
}

/* --------------------------------------------------------------- sessions */

export async function createSession(userId: string): Promise<string> {
  return mutate((data) => {
    const token = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
    data.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    return token;
  });
}

export async function findUserBySession(token: string): Promise<AppUser | null> {
  const data = await load();
  const session = data.sessions.find((item) => item.token === token);
  if (!session) return null;
  return data.users.find((user) => user.id === session.userId) ?? null;
}

export async function destroySession(token: string): Promise<void> {
  await mutate((data) => {
    data.sessions = data.sessions.filter((session) => session.token !== token);
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
