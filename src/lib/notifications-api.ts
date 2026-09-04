import type { AppNotification, NotificationKind } from "@/lib/notifications";

/**
 * Notification calls, made against this app's own `/api/notifications/*` routes.
 *
 * They relay to the Django backend server-side (`src/lib/server/notifications-proxy.ts`)
 * because the browser holds no Django session — sign-in happens server-side, so the
 * backend's httpOnly cookies never reach the client. That also means no CSRF dance
 * and no CORS problem here: these are same-origin requests.
 */

/** The backend's shape: `{ id, title, body, kind, url }` + `is_read` / `created_at`. */
interface RawNotification {
  id: number | string;
  title?: string;
  body?: string;
  message?: string;
  kind?: string;
  type?: string;
  notification_type?: string;
  url?: string;
  is_read: boolean;
  created_at: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface VapidKeyResponse {
  configured: boolean;
  public_key?: string | null;
  publicKey?: string | null;
}

const KNOWN_KINDS: NotificationKind[] = ["reminder", "cancellation", "confirmation", "system"];

function normalizeKind(raw?: string): NotificationKind {
  const candidate = raw?.toLowerCase();
  return (KNOWN_KINDS as string[]).includes(candidate ?? "") ? (candidate as NotificationKind) : "system";
}

function normalizeNotification(raw: RawNotification): AppNotification {
  return {
    id: String(raw.id),
    kind: normalizeKind(raw.kind ?? raw.type ?? raw.notification_type),
    title: raw.title ?? "Xabarnoma",
    body: raw.body ?? raw.message ?? "",
    createdAt: raw.created_at,
    read: raw.is_read,
  };
}

class NotificationsError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...options, cache: "no-store" });
  const payload = (await response.json().catch(() => ({}))) as { data?: T; message?: string };

  if (!response.ok) {
    throw new NotificationsError(response.status, payload.message ?? response.statusText);
  }
  return payload.data as T;
}

export async function fetchNotifications(params?: { isRead?: boolean }): Promise<AppNotification[]> {
  const query = params?.isRead !== undefined ? `?is_read=${params.isRead}` : "";
  const page = await call<PaginatedResponse<RawNotification> | RawNotification[]>(
    `/api/notifications${query}`
  );
  const results = Array.isArray(page) ? page : (page?.results ?? []);
  return results.map(normalizeNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await call<{ count?: number; unread_count?: number }>("/api/notifications/unread-count");
  return data?.count ?? data?.unread_count ?? 0;
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await call<void>("/api/notifications/read", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids && ids.length > 0 ? { ids } : {}),
  });
}

export async function fetchVapidKey(): Promise<{ configured: boolean; publicKey: string | null }> {
  const data = await call<VapidKeyResponse>("/api/notifications/vapid-key");
  return {
    configured: Boolean(data?.configured),
    publicKey: data?.public_key ?? data?.publicKey ?? null,
  };
}

export async function subscribeToPushBackend(subscription: PushSubscription): Promise<void> {
  await call<void>("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
}
