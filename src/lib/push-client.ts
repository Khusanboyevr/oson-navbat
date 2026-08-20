const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Mirrors `isSupabaseConfigured` — true once a real VAPID key pair is set. */
export const isPushConfigured = VAPID_PUBLIC_KEY.length > 0;

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
 * device to Web Push. In demo mode (no `NEXT_PUBLIC_VAPID_PUBLIC_KEY` set) this
 * is a no-op success, same as the Supabase auth helpers without credentials.
 */
export async function subscribeToPush(): Promise<PushResult> {
  if (!isPushSupported()) return { error: "Bu brauzer push xabarnomalarni qo'llab-quvvatlamaydi." };
  if (!isPushConfigured) return { error: null };

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
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

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
