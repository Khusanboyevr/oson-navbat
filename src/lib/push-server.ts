import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

/** Mirrors `isSupabaseConfigured` — true once a real VAPID key pair is set. */
export const isPushServerConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (isPushServerConfigured) {
  webpush.setVapidDetails("mailto:support@qulaynavbat.uz", VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * In-memory stand-in for the `push_subscriptions` table (see `database.types.ts`).
 * A real backend persists one row per device per user here instead, and looks
 * up the relevant rows by `user_id` before sending.
 */
export const SUBSCRIPTIONS: PushSubscriptionRecord[] = [];

/**
 * Sends one Web Push payload to one subscribed device via the `web-push` library.
 * Without real VAPID keys configured, this logs instead of throwing — same demo-mode
 * fallback used by `lib/auth.ts` when Supabase isn't configured.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!isPushServerConfigured) {
    console.log("[push-server] demo mode, would send:", payload, "to", subscription.endpoint);
    return { success: true };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown push error" };
  }
}

/** Broadcasts to every subscribed device — used by the reminder cron and cancellation flow. */
export async function notifyAllSubscribers(payload: PushPayload): Promise<void> {
  await Promise.all(SUBSCRIPTIONS.map((subscription) => sendPushNotification(subscription, payload)));
}
