import { apiFetch } from "@/lib/api-client";
import type { AppNotification, NotificationKind } from "@/lib/notifications";

/**
 * Raw shapes are kept loose (optional/alternate field names) because the
 * exact response fields aren't pinned down by a shared schema yet — only
 * `is_read`, `created_at`, and the paginated `results` envelope were called
 * out explicitly. Adjust once NOTIFICATIONS.md's real examples are in hand.
 */
interface RawNotification {
  id: number | string;
  title?: string;
  body?: string;
  message?: string;
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
    kind: normalizeKind(raw.type ?? raw.notification_type),
    title: raw.title ?? "Xabarnoma",
    body: raw.body ?? raw.message ?? "",
    createdAt: raw.created_at,
    read: raw.is_read,
  };
}

export async function fetchNotifications(params?: { isRead?: boolean }): Promise<AppNotification[]> {
  const query = params?.isRead !== undefined ? `?is_read=${params.isRead}` : "";
  const page = await apiFetch<PaginatedResponse<RawNotification>>(`/notifications/${query}`);
  return page.results.map(normalizeNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count?: number; unread_count?: number }>("/notifications/unread-count/");
  return data.count ?? data.unread_count ?? 0;
}

export async function markNotificationsRead(ids?: string[]): Promise<void> {
  await apiFetch<void>("/notifications/read/", {
    method: "PUT",
    body: JSON.stringify(ids && ids.length > 0 ? { ids } : {}),
  });
}

export async function fetchVapidKey(): Promise<{ configured: boolean; publicKey: string | null }> {
  const data = await apiFetch<VapidKeyResponse>("/notifications/vapid-key/");
  return { configured: data.configured, publicKey: data.public_key ?? data.publicKey ?? null };
}

export async function subscribeToPushBackend(subscription: PushSubscription): Promise<void> {
  await apiFetch<void>("/notifications/subscribe/", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}
