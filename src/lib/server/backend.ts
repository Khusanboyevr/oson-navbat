import type { BarberApplication, BarberCategoryKey, BarberProfile } from "@/lib/types";

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
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
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

interface RawBackendBarber {
  id: number | string;
  name?: string;
  full_name?: string;
  specialty?: string;
  specialization?: string;
  rating?: number | string;
  address?: string;
  location?: string;
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
  services?: { id?: number | string; name?: string; price?: number | string; duration?: number }[];
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
  if (value.includes("ayol") || value.includes("women") || value.includes("жен")) return "ayollar";
  if (value.includes("bola") || value.includes("kids") || value.includes("дет")) return "bolalar";
  return "erkaklar";
}

function mapBackendBarber(raw: RawBackendBarber): BarberProfile {
  const lat = toNumber(raw.latitude ?? raw.lat, Number.NaN);
  const lng = toNumber(raw.longitude ?? raw.lng, Number.NaN);

  return {
    id: `backend-${raw.id}`,
    name: raw.name ?? raw.full_name ?? "Usta",
    specialty: raw.specialty ?? raw.specialization ?? "",
    rating: toNumber(raw.rating, 0),
    location: raw.address ?? raw.location ?? "",
    coordinates: {
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
    },
    avatarColor: "#145ee5",
    photo: raw.photo ?? raw.avatar ?? null,
    bio: raw.bio ?? raw.description ?? "",
    category: normalizeCategory(raw.category),
    experienceYears: raw.experience_years ?? 0,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    status: raw.is_active === false ? "blocked" : "active",
    source: "backend",
    createdAt: new Date().toISOString(),
    services: (raw.services ?? []).map((service, index) => ({
      id: String(service.id ?? index),
      name: service.name ?? "Xizmat",
      price: toNumber(service.price, 0),
      durationMinutes: service.duration ?? 30,
    })),
  };
}

/** Read-through of `GET /barbers/`; an empty or failing backend simply contributes nothing. */
export async function fetchBackendBarbers(): Promise<BarberProfile[]> {
  const result = await request<PaginatedBackend<RawBackendBarber>>("/barbers/");
  if (!result.ok || !result.data?.results) return [];
  return result.data.results
    .map(mapBackendBarber)
    // Markers need real coordinates; anything without them can't go on the map.
    .filter((barber) => barber.coordinates.lat !== 0 && barber.coordinates.lng !== 0);
}

/**
 * Tries to register an approved worker upstream. `/barbers/` is GET-only today
 * (405), so this returns false and the caller keeps the profile local — no data
 * is lost, and the same call starts succeeding the day the endpoint accepts POST.
 */
export async function pushBarberToBackend(application: BarberApplication): Promise<boolean> {
  const { token, cookie } = await fetchCsrf();

  const result = await request("/barbers/", {
    method: "POST",
    headers: token ? { "X-CSRFToken": token } : undefined,
    cookie: cookie ?? undefined,
    body: JSON.stringify({
      name: `${application.firstName} ${application.lastName}`.trim(),
      salon_name: application.workplace,
      specialty: application.profession,
      category: application.category,
      phone: application.phone,
      email: application.email,
      address: application.address,
      residence: application.residence,
      latitude: application.coordinates.lat,
      longitude: application.coordinates.lng,
      experience_years: application.experienceYears,
      bio: application.bio,
      services: application.services.map((service) => ({
        name: service.name,
        price: service.price,
        duration: service.durationMinutes,
      })),
    }),
  });

  return result.ok;
}
