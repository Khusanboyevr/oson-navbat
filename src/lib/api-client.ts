export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Mirrors `isSupabaseConfigured` — true once the real backend's URL is set. */
export const isApiConfigured = API_BASE_URL.length > 0;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Django only sets the `csrftoken` cookie once something has requested it —
 * `GET /auth/csrf/` is that trigger. Safe to call repeatedly; it's a no-op
 * once the cookie already exists.
 */
async function ensureCsrfCookie(): Promise<void> {
  if (getCookie("csrftoken")) return;
  await fetch(`${API_BASE_URL}/auth/csrf/`, { credentials: "include" });
}

/**
 * Thin fetch wrapper enforcing the backend's connection rules: cookies on
 * every request (`credentials: "include"`) and the CSRF dance (fetch the
 * `csrftoken` cookie, echo it back as `X-CSRFToken`) on every mutation.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutating = MUTATING_METHODS.has(method);

  if (isMutating) await ensureCsrfCookie();

  const headers = new Headers(options.headers);
  if (isMutating) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) headers.set("X-CSRFToken", csrfToken);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, message || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
