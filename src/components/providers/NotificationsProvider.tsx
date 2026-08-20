"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getPushPermissionState,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { NOTIFICATION_STORAGE_KEY, SEED_NOTIFICATIONS, type AppNotification } from "@/lib/notifications";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  addNotification: (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  pushEnabled: boolean;
  pushSupported: boolean;
  pushPending: boolean;
  pushError: string | null;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function loadStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : SEED_NOTIFICATIONS;
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPending, setPushPending] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const pushSupported = useMemo(() => isPushSupported(), []);

  useEffect(() => {
    // One-time hydration from localStorage/Notification API, both unavailable during SSR —
    // starting from the SEED_NOTIFICATIONS/false server-rendered state and syncing here (rather
    // than reading them in the initializer) avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications(loadStoredNotifications());
    setHasHydrated(true);
    getPushPermissionState().then((state) => setPushEnabled(state === "granted"));
    if (isPushSupported()) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Guards against overwriting real localStorage data with the server-rendered
    // SEED_NOTIFICATIONS placeholder before the hydration effect above has landed.
    if (!hasHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, hasHydrated]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [
      { ...notification, id: `n${Date.now()}`, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const enablePush = useCallback(async () => {
    setPushPending(true);
    setPushError(null);
    const { error } = await subscribeToPush();
    setPushPending(false);
    if (error) {
      setPushError(error);
      return;
    }
    setPushEnabled(true);
  }, []);

  const disablePush = useCallback(async () => {
    setPushPending(true);
    await unsubscribeFromPush();
    setPushPending(false);
    setPushEnabled(false);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      addNotification,
      pushEnabled,
      pushSupported,
      pushPending,
      pushError,
      enablePush,
      disablePush,
    }),
    [notifications, unreadCount, markAllRead, addNotification, pushEnabled, pushSupported, pushPending, pushError, enablePush, disablePush]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
