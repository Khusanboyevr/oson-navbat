import { subscribeToPushBackend } from "@/lib/notifications-api";

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/** Web Push requires the VAPID key as a raw Uint8Array, not the base64url string it's shared as. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

export interface PushResult {
  error: string | null;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js");
}

/**
 * Requests notification permission (if not already decided) and subscribes the
 * device to Web Push, using the backend-issued VAPID public key (see
 * `notifications-api.ts#fetchVapidKey` — the backend generates and owns this
 * key pair now, not a frontend env var). Callers should check
 * `fetchVapidKey().configured` first and skip calling this at all if `false`.
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushResult> {
  if (!isPushSupported()) return { error: "Bu brauzer push xabarnomalarni qo'llab-quvvatlamaydi." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { error: "Xabarnomalar uchun ruxsat berilmadi." };
  }

  try {
    const registration = await registerServiceWorker();
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));

    await subscribeToPushBackend(subscription);

    return { error: null };
  } catch {
    return { error: "Push xabarnomalarga ulanib bo'lmadi." };
  }
}

export async function unsubscribeFromPush(): Promise<PushResult> {
  if (!isPushSupported()) return { error: null };

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
    return { error: null };
  } catch {
    return { error: "Obunani bekor qilib bo'lmadi." };
  }
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
