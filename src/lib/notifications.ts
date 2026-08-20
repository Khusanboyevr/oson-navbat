export type NotificationKind = "reminder" | "cancellation" | "confirmation" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const NOTIFICATION_STORAGE_KEY = "qulaynavbat_notifications";

export function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / (60 * 1000));
  if (diffMinutes < 1) return "hozir";
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldi`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} soat oldi`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} kun oldi`;
}

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "reminder",
    title: "Navbat eslatmasi",
    body: "Navbatingizga 1 soat qoldi — Aziz Barbershop, bugun 15:30.",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "n2",
    kind: "cancellation",
    title: "Navbat bekor qilindi",
    body: "Ustaning ishi chiqqanligi sababli navbat bekor qilindi. Boshqa vaqt tanlang.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
