export type NotificationKind = "reminder" | "cancellation" | "confirmation" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function formatRelativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / (60 * 1000));
  if (diffMinutes < 1) return "hozir";
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldi`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} soat oldi`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} kun oldi`;
}
