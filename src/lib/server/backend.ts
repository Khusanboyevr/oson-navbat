import type {
  AppUser,
  BarberApplication,
  BarberCategoryKey,
  BarberProfile,
  UserRole,
} from "@/lib/types";

/**
 * Server-side bridge to the real Django backend (api.qulaynavbat.uz).
 *
 * Everything here is best-effort: the backend is the source of truth for whatever
 * it already serves, and each call reports whether it actually took. Callers fall
 * back to the local store (`src/lib/server/store.ts`) when it didn't, so the app
 * keeps working while the missing endpoints are built.
 *
 * Talking to it from the server also sidesteps the backend's CORS allowlist
 * (only qulaynavbat.uz origins are allowed), which is why the browser never calls
 * these endpoints directly for auth.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const REQUEST_TIMEOUT_MS = 10_000;

export const isBackendConfigured = API_BASE_URL.length > 0;

/** The backend rejects requests whose Origin/Referer isn't its allowlisted domain. */
const BACKEND_ORIGIN = "https://qulaynavbat.uz";

interface BackendResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  /** `Set-Cookie` values the backend returned, so a session can be mirrored to the browser. */
  cookies: string[];
}

async function request<T>(
  path: string,
  init: RequestInit & { cookie?: string } = {}
): Promise<BackendResult<T>> {
  if (!isBackendConfigured) {
    return { ok: false, status: 0, data: null, error: "NEXT_PUBLIC_API_URL sozlanmagan", cookies: [] };
  }

  const headers = new Headers(init.headers);
  headers.set("Origin", BACKEND_ORIGIN);
  headers.set("Referer", `${BACKEND_ORIGIN}/`);
  // Never set Content-Type for multipart: fetch generates it with the boundary.
  const isMultipart = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isMultipart && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init.cookie) headers.set("Cookie", init.cookie);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const cookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const detail =
        parsed && typeof parsed === "object" && "detail" in parsed
          ? String((parsed as { detail: unknown }).detail)
          : text.slice(0, 200) || response.statusText;
      return { ok: false, status: response.status, data: null, error: detail, cookies };
    }

    return { ok: true, status: response.status, data: parsed as T, error: null, cookies };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend bilan bog'lanib bo'lmadi";
    return { ok: false, status: 0, data: null, error: message, cookies: [] };
  }
}

/** Django only issues the `csrftoken` cookie once something asks for it. */
async function fetchCsrf(): Promise<{ token: string | null; cookie: string | null }> {
  const result = await request<{ csrftoken?: string }>("/auth/csrf/");
  const token = result.data?.csrftoken ?? null;
  const cookieHeader = result.cookies
    .map((value) => value.split(";")[0])
    .filter(Boolean)
    .join("; ");
  return { token, cookie: cookieHeader || null };
}

/* ---------------------------------------------------------- auth methods */

export interface AuthMethods {
  google: boolean;
  googleClientId: string | null;
  sms: boolean;
}

interface RawAuthMethods {
  google?: boolean;
  google_client_id?: string | null;
  sms?: boolean;
}

let methodsCache: { value: AuthMethods; expiresAt: number } | null = null;
const METHODS_TTL_MS = 5 * 60 * 1000;

/**
 * `GET /auth/methods/` tells us which sign-in methods are live and which Google
 * client ID to use. Reading it (instead of hardcoding the ID) means the frontend
 * follows the backend automatically if it ever rotates — and `sms: false` is how
 * the backend states that phone login no longer exists.
 *
 * Cached briefly, since it is hit on every render of the login button.
 */
export async function fetchAuthMethods(): Promise<AuthMethods> {
  if (methodsCache && methodsCache.expiresAt > Date.now()) return methodsCache.value;

  const result = await request<RawAuthMethods>("/auth/methods/");
  const envClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const value: AuthMethods = {
    google: result.data?.google ?? Boolean(envClientId),
    // An explicitly set env var wins, so a staging build can point elsewhere.
    googleClientId: envClientId || result.data?.google_client_id || null,
    sms: result.data?.sms ?? false,
  };

  // Only cache an answer the backend actually gave; keep retrying otherwise.
  if (result.ok) methodsCache = { value, expiresAt: Date.now() + METHODS_TTL_MS };
  return value;
}

/* -------------------------------------------------------------------- auth */

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
}

/**
 * Verifies the Google ID token the browser produced. Uses Google's tokeninfo
 * endpoint rather than local JWT verification so no crypto dependency is needed;
 * the audience check is what makes it safe — a token minted for another app is
 * rejected here.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const { googleClientId: clientId } = await fetchAuthMethods();
  if (!clientId) return null;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
      exp?: string;
      iss?: string;
    };

    const audienceOk = payload.aud === clientId;
    const issuerOk = payload.iss === "accounts.google.com" || payload.iss === "https://accounts.google.com";
    const notExpired = Number(payload.exp ?? 0) * 1000 > Date.now();
    const emailVerified = payload.email_verified === true || payload.email_verified === "true";

    if (!audienceOk || !issuerOk || !notExpired || !emailVerified || !payload.email || !payload.sub) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture ?? null,
    };
  } catch {
    return null;
  }
}

export interface BackendLoginResult {
  ok: boolean;
  error: string | null;
  /** Session cookies from Django, to be mirrored onto the browser response. */
  cookies: string[];
  /** The account as the backend sees it. `phone` is null for Google-only signups. */
  user: BackendUser | null;
  isNewUser: boolean;
}

export interface BackendUser {
  id?: number | string;
  email?: string;
  name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
}

/**
 * Hands the Google ID token to `POST /auth/google/`, which verifies it, creates
 * the account if needed and answers `{ user, is_new_user }` with the session
 * written to httpOnly cookies. Those cookies come back to us here and are
 * mirrored onto the browser response by the route.
 *
 * On failure the app still signs the user in locally and records
 * `syncedWithBackend: false`, so an outage can't lock people out.
 */
export async function loginWithBackendGoogle(idToken: string): Promise<BackendLoginResult> {
  const { token, cookie } = await fetchCsrf();

  const result = await request<{ user?: BackendUser; is_new_user?: boolean }>("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
    headers: token ? { "X-CSRFToken": token } : undefined,
    cookie: cookie ?? undefined,
  });

  return {
    ok: result.ok,
    error: result.error,
    cookies: result.cookies,
    user: result.data?.user ?? null,
    isNewUser: result.data?.is_new_user ?? false,
  };
}

/**
 * `POST /auth/refresh/` mints a new access token from the refresh cookie.
 * Returns the refreshed cookies, or null when the refresh token is gone too —
 * in which case the user has to sign in with Google again.
 */
export async function refreshBackendSession(cookie: string | null): Promise<string[] | null> {
  if (!cookie) return null;
  const { token } = await fetchCsrf();

  const result = await request("/auth/refresh/", {
    method: "POST",
    headers: token ? { "X-CSRFToken": token } : undefined,
    cookie,
  });

  return result.ok ? result.cookies : null;
}

export async function logoutFromBackend(cookie: string | null): Promise<void> {
  if (!cookie) return;
  const { token } = await fetchCsrf();
  await request("/auth/logout/", {
    method: "POST",
    headers: token ? { "X-CSRFToken": token } : undefined,
    cookie,
  });
}

export interface BackendMeResult {
  user: BackendUser | null;
  /** Set when the session was refreshed; the caller re-mirrors these cookies. */
  cookies: string[] | null;
}

/**
 * `GET /auth/me/` with the mirrored Django session cookie. A 401 means the access
 * token expired, so it refreshes once and retries — the documented recovery path.
 */
export async function fetchBackendMe(cookie: string | null): Promise<BackendMeResult> {
  if (!cookie) return { user: null, cookies: null };

  const first = await request<BackendUser>("/auth/me/", { cookie });
  if (first.ok) return { user: first.data, cookies: null };
  if (first.status !== 401) return { user: null, cookies: null };

  const refreshed = await refreshBackendSession(cookie);
  if (!refreshed) return { user: null, cookies: null };

  const merged = [cookie, ...refreshed.map((value) => value.split(";")[0])].join("; ");
  const retry = await request<BackendUser>("/auth/me/", { cookie: merged });
  return retry.ok ? { user: retry.data, cookies: refreshed } : { user: null, cookies: null };
}

/* --------------------------------------------------- authenticated proxy */

export interface ProxyResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  /** Present when the session was refreshed mid-call; the route re-mirrors these. */
  refreshedCookies: string[] | null;
}

/**
 * Calls the backend as the signed-in user, using the Django cookies mirrored at
 * login. Every browser-facing feature goes through here rather than calling the
 * backend directly: those cookies are httpOnly and server-side only, and the
 * backend's CORS allowlist wouldn't let the browser through anyway.
 *
 * A 401 is retried once behind `POST /auth/refresh/`, per the backend's rules.
 */
export async function proxyAsUser<T>(
  path: string,
  init: RequestInit & { requiresAuth?: boolean } = {},
  cookie: string | null = null
): Promise<ProxyResult<T>> {
  const { requiresAuth = true, ...requestInit } = init;

  if (requiresAuth && !cookie) {
    return { ok: false, status: 401, data: null, error: "Tizimga kirilmagan", refreshedCookies: null };
  }

  const method = (requestInit.method ?? "GET").toUpperCase();
  const isMutating = method !== "GET" && method !== "HEAD";

  const send = async (activeCookie: string | null) => {
    const headers = new Headers(requestInit.headers);
    let jar = activeCookie;

    if (isMutating) {
      const { token, cookie: csrfCookie } = await fetchCsrf();
      if (token) headers.set("X-CSRFToken", token);
      jar = [activeCookie, csrfCookie].filter(Boolean).join("; ") || null;
    }

    return request<T>(path, { ...requestInit, headers, cookie: jar ?? undefined });
  };

  const first = await send(cookie);
  if (first.ok || first.status !== 401 || !cookie) {
    return {
      ok: first.ok,
      status: first.status,
      data: first.data,
      error: first.error,
      refreshedCookies: null,
    };
  }

  const refreshed = await refreshBackendSession(cookie);
  if (!refreshed) {
    return { ok: false, status: 401, data: null, error: first.error, refreshedCookies: null };
  }

  const merged = [cookie, ...refreshed.map((value) => value.split(";")[0])].join("; ");
  const retry = await send(merged);
  return {
    ok: retry.ok,
    status: retry.status,
    data: retry.data,
    error: retry.error,
    refreshedCookies: refreshed,
  };
}

/* ----------------------------------------------------------------- barbers */

export interface RawBackendSalon {
  id?: number | string;
  name?: string;
  address?: string;
  district?: string;
  city?: string;
  location_lat?: number | string;
  location_lng?: number | string;
  phone?: string;
  specialty?: string;
  description?: string;
}

interface RawBackendBarber {
  id: number | string;
  name?: string;
  full_name?: string;
  specialty?: string;
  specialization?: string;
  rating?: number | string;
  address?: string;
  location?: string;
  /** The salon owns the coordinates; it may arrive nested or as a bare id. */
  salon?: RawBackendSalon | string | number | null;
  salon_name?: string;
  location_lat?: number | string;
  location_lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lng?: number | string;
  photo?: string | null;
  avatar?: string | null;
  bio?: string;
  description?: string;
  category?: string;
  experience_years?: number;
  phone?: string;
  email?: string;
  is_active?: boolean;
  is_blocked?: boolean;
  services?: {
    id?: number | string;
    name?: string;
    price?: number | string;
    duration?: number;
    duration_minutes?: number;
  }[];
}

interface PaginatedBackend<T> {
  count: number;
  results: T[];
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategory(raw?: string): BarberCategoryKey {
  const value = raw?.toLowerCase() ?? "";
  if (value.includes("ayol") || value.includes("women") || value.includes("\u0436\u0435\u043d")) return "ayollar";
  if (value.includes("bola") || value.includes("kids") || value.includes("\u0434\u0435\u0442")) return "bolalar";
  return "erkaklar";
}

/** The backend's `specialty` codes, as used by `/super-admin/barbers/`. */
const SPECIALTY_CODE: Record<BarberCategoryKey, string> = {
  erkaklar: "men",
  ayollar: "women",
  bolalar: "kids",
};

export function mapBackendBarber(raw: RawBackendBarber): BarberProfile {
  const salon = raw.salon && typeof raw.salon === "object" ? raw.salon : null;

  const lat = toNumber(
    raw.location_lat ?? salon?.location_lat ?? raw.latitude ?? raw.lat,
    Number.NaN
  );
  const lng = toNumber(
    raw.location_lng ?? salon?.location_lng ?? raw.longitude ?? raw.lng,
    Number.NaN
  );

  const category = normalizeCategory(raw.specialty ?? raw.category);
  const experience = raw.experience_years ?? 0;
  const specialtyLabel = [salon?.name ?? raw.salon_name, experience > 0 ? `${experience} yil tajriba` : null]
    .filter(Boolean)
    .join(" \u2022 ");

  return {
    id: `backend-${raw.id}`,
    name: raw.full_name ?? raw.name ?? "Usta",
    specialty: specialtyLabel || raw.specialization || "",
    rating: toNumber(raw.rating, 0),
    location: salon?.address ?? raw.address ?? raw.location ?? "",
    coordinates: {
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
    },
    avatarColor: "#145ee5",
    photo: raw.avatar ?? raw.photo ?? null,
    bio: raw.bio ?? raw.description ?? "",
    category,
    experienceYears: experience,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    status: raw.is_active === false || raw.is_blocked === true ? "blocked" : "active",
    source: "backend",
    createdAt: new Date().toISOString(),
    services: (raw.services ?? []).map((service, index) => ({
      id: String(service.id ?? index),
      name: service.name ?? "Xizmat",
      price: toNumber(service.price, 0),
      durationMinutes: service.duration_minutes ?? service.duration ?? 30,
    })),
  };
}

/**
 * Read-through of the open catalog `GET /barbers/` (no auth: it is deliberately
 * public, which is also why it refuses POST — creating goes through
 * `/super-admin/barbers/`). An empty or failing backend contributes nothing.
 */
export async function fetchBackendBarbers(): Promise<{ ok: boolean; barbers: BarberProfile[] }> {
  const result = await request<PaginatedBackend<RawBackendBarber>>("/barbers/?page_size=100");
  if (!result.ok) return { ok: false, barbers: [] };
  return { ok: true, barbers: (result.data?.results ?? []).map(mapBackendBarber) };
}

/* ------------------------------------------------------- super admin API */

/**
 * Creating a worker on the backend, from an approved application.
 *
 * Two calls: the salon carries the map coordinates, the barber carries the
 * person. `email` is the important one — it is the Google account the usta will
 * sign in with, and the backend links the two on their first sign-in. A wrong
 * email means they get a fresh "client" account instead of their panel.
 *
 * `salon` is optional on the backend (an usta may work independently), so a
 * failed salon creation doesn't block the barber.
 */
export async function createBackendBarberFromApplication(
  application: BarberApplication,
  cookie: string | null
): Promise<ProxyResult<{ id?: string | number }>> {
  let salonId: string | number | null = null;

  if (application.workplace) {
    const salon = await proxyAsUser<{ id?: string | number }>(
      "/super-admin/salons/",
      {
        method: "POST",
        body: JSON.stringify({
          name: application.workplace,
          location_lat: application.coordinates.lat,
          location_lng: application.coordinates.lng,
          address: application.address,
          city: "Toshkent",
          specialty: SPECIALTY_CODE[application.category],
          phone: application.phone,
          description: application.bio,
        }),
      },
      cookie
    );
    if (salon.ok && salon.data?.id) salonId = salon.data.id;
  }

  const created = await proxyAsUser<{ id?: string | number }>(
    "/super-admin/barbers/",
    {
      method: "POST",
      body: JSON.stringify({
        email: application.email,
        full_name: `${application.firstName} ${application.lastName}`.trim(),
        // The backend's examples use the national number without the country code.
        phone: application.phone.replace(/\D/g, "").slice(-9),
        ...(salonId ? { salon: salonId } : {}),
        specialty: SPECIALTY_CODE[application.category],
        bio: application.bio || application.profession,
        experience_years: application.experienceYears,
        services: application.services.map((service) => ({
          name: service.name,
          price: service.price,
          duration_minutes: service.durationMinutes,
        })),
        default_slot_minutes: 30,
      }),
    },
    cookie
  );

  // The create endpoint takes no image, so the photo goes up afterwards.
  if (created.ok && created.data?.id && application.photo) {
    const blob = dataUrlToBlob(application.photo);
    if (blob) {
      await uploadBarberAvatar(
        `/super-admin/barbers/${created.data.id}/`,
        blob,
        "avatar.jpg",
        cookie
      );
    }
  }

  return created;
}

/** Turns the applicant's inline photo back into a file for the multipart upload. */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const [, type, base64] = match;
  const binary = Buffer.from(base64, "base64");
  return new Blob([new Uint8Array(binary)], { type });
}

/** `GET /super-admin/barbers/` — the full list, blocked ones included. */
export async function fetchAdminBarbers(cookie: string | null): Promise<ProxyResult<BarberProfile[]>> {
  const result = await proxyAsUser<PaginatedBackend<RawBackendBarber> | RawBackendBarber[]>(
    "/super-admin/barbers/?page_size=100",
    {},
    cookie
  );

  const rows = Array.isArray(result.data) ? result.data : (result.data?.results ?? []);
  return { ...result, data: result.ok ? rows.map(mapBackendBarber) : null };
}

export async function setBackendBarberStatus(
  id: string,
  status: "active" | "blocked",
  cookie: string | null
): Promise<ProxyResult<unknown>> {
  const action = status === "blocked" ? "block" : "activate";
  return proxyAsUser(`/super-admin/barbers/${id}/${action}/`, { method: "POST", body: "{}" }, cookie);
}

export async function deleteBackendBarber(id: string, cookie: string | null): Promise<ProxyResult<unknown>> {
  return proxyAsUser(`/super-admin/barbers/${id}/`, { method: "DELETE" }, cookie);
}

export interface RawBackendUser {
  id: number | string;
  email?: string;
  full_name?: string | null;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  /** `false` means blocked — the backend has no `is_blocked` field. */
  is_active?: boolean;
  avatar?: string | null;
  created_at?: string;
}

const ROLE_VALUES: UserRole[] = ["client", "barber", "superadmin"];

/** The backend is the authority on roles; this maps its value onto ours. */
export function normalizeUserRole(raw?: string | null): UserRole {
  const value = raw?.toLowerCase().replace(/[\s_-]/g, "") ?? "";
  if (value === "superadmin" || value === "admin") return "superadmin";
  return (ROLE_VALUES as string[]).includes(value) ? (value as UserRole) : "client";
}

export function mapBackendUser(raw: RawBackendUser): AppUser {
  return {
    id: String(raw.id),
    googleSub: null,
    email: raw.email ?? "",
    name: raw.full_name ?? raw.name ?? raw.email ?? "Foydalanuvchi",
    picture: raw.avatar ?? null,
    role: normalizeUserRole(raw.role),
    status: raw.is_active === false ? "blocked" : "active",
    createdAt: raw.created_at ?? new Date().toISOString(),
    syncedWithBackend: true,
  };
}

/** `GET /super-admin/users/` — accounts created by Google sign-in. */
export async function fetchAdminUsers(
  cookie: string | null,
  search?: string
): Promise<ProxyResult<AppUser[]>> {
  const query = search ? `&search=${encodeURIComponent(search)}` : "";
  const result = await proxyAsUser<PaginatedBackend<RawBackendUser> | RawBackendUser[]>(
    `/super-admin/users/?page_size=100${query}`,
    {},
    cookie
  );

  const rows = Array.isArray(result.data) ? result.data : (result.data?.results ?? []);
  return { ...result, data: result.ok ? rows.map(mapBackendUser) : null };
}

export async function setBackendUserStatus(
  id: string,
  status: "active" | "blocked",
  cookie: string | null
): Promise<ProxyResult<unknown>> {
  const action = status === "blocked" ? "block" : "unblock";
  return proxyAsUser(`/super-admin/users/${id}/${action}/`, { method: "POST", body: "{}" }, cookie);
}

export async function setBackendUserRole(
  id: string,
  role: "client" | "barber" | "superadmin",
  cookie: string | null
): Promise<ProxyResult<unknown>> {
  return proxyAsUser(
    `/super-admin/users/${id}/set-role/`,
    { method: "POST", body: JSON.stringify({ role }) },
    cookie
  );
}

export interface BackendStats {
  [key: string]: unknown;
}

/** `GET /super-admin/stats/?period=...` — platform totals for the dashboard. */
export async function fetchAdminStats(
  cookie: string | null,
  period: "day" | "week" | "month" | "year" | "all" = "all"
): Promise<ProxyResult<BackendStats>> {
  return proxyAsUser<BackendStats>(`/super-admin/stats/?period=${period}`, {}, cookie);
}

/* -------------------------------------------------- the usta's own profile */

/**
 * `GET /barber/me/` — note the singular path: `/barbers/` is the open catalog,
 * `/barber/me/` is the signed-in usta's own record.
 */
export async function fetchOwnBarber(cookie: string | null): Promise<ProxyResult<BarberProfile>> {
  const result = await proxyAsUser<RawBackendBarber>("/barber/me/", {}, cookie);
  return { ...result, data: result.ok && result.data ? mapBackendBarber(result.data) : null };
}

/** `PATCH /barber/me/` — bio and the service menu the usta maintains themselves. */
export async function updateOwnBarber(
  cookie: string | null,
  patch: { bio?: string; services?: { name: string; price: number; durationMinutes: number }[] }
): Promise<ProxyResult<BarberProfile>> {
  const body: Record<string, unknown> = {};
  if (patch.bio !== undefined) body.bio = patch.bio;
  if (patch.services) {
    body.services = patch.services.map((service) => ({
      name: service.name,
      price: service.price,
      duration_minutes: service.durationMinutes,
    }));
  }

  const result = await proxyAsUser<RawBackendBarber>(
    "/barber/me/",
    { method: "PATCH", body: JSON.stringify(body) },
    cookie
  );

  return { ...result, data: result.ok && result.data ? mapBackendBarber(result.data) : null };
}

/**
 * Uploads a profile photo as `multipart/form-data` under the field name `avatar`.
 *
 * The backend takes it on `PATCH`, never on create, and answers with the stored
 * file's full URL. `path` is `/barber/me/` for an usta editing themselves, or
 * `/super-admin/barbers/<id>/` for the super admin doing it on their behalf.
 */
export async function uploadBarberAvatar(
  path: string,
  file: Blob,
  filename: string,
  cookie: string | null
): Promise<ProxyResult<RawBackendBarber>> {
  const form = new FormData();
  form.append("avatar", file, filename);

  return proxyAsUser<RawBackendBarber>(path, { method: "PATCH", body: form }, cookie);
}
