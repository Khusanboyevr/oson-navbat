"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isApiConfigured } from "@/lib/api-client";
import type { AppNotification } from "@/lib/notifications";
import { fetchNotifications, fetchUnreadCount, fetchVapidKey, markNotificationsRead } from "@/lib/notifications-api";
import {
  getPushPermissionState,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => void;
  markAllRead: () => void;
  pushEnabled: boolean;
  pushSupported: boolean;
  /** Whether the *backend* has VAPID keys set up — hide the push toggle entirely while false. */
  pushConfigured: boolean;
  pushPending: boolean;
  pushError: string | null;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [pushPending, setPushPending] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const pushSupported = useMemo(() => isPushSupported(), []);

  const refresh = useCallback(() => {
    if (!isApiConfigured) return;
    setIsLoading(true);
    Promise.all([fetchNotifications(), fetchUnreadCount()])
      .then(([list, count]) => {
        setNotifications(list);
        setUnreadCount(count);
      })
      .catch(() => {
        // Backend unreachable (offline, CORS in local dev, etc.) — leave whatever
        // history is already showing rather than blowing away the UI.
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // refresh() kicks off a fetch and sets isLoading synchronously — the sanctioned
    // "sync from an external system on mount" case, just wrapped in a helper.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    getPushPermissionState().then((state) => setPushEnabled(state === "granted"));
    if (isPushSupported()) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isApiConfigured) {
      fetchVapidKey()
        .then(({ configured, publicKey }) => {
          setPushConfigured(configured);
          setVapidPublicKey(publicKey);
        })
        .catch(() => setPushConfigured(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = useCallback(() => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
    markNotificationsRead().catch(() => {
      // Best-effort — a failed mark-as-read call just means the badge reappears next refresh.
    });
  }, [unreadCount]);

  const enablePush = useCallback(async () => {
    if (!vapidPublicKey) {
      setPushError("Push xabarnomalar hali sozlanmagan.");
      return;
    }
    setPushPending(true);
    setPushError(null);
    const { error } = await subscribeToPush(vapidPublicKey);
    setPushPending(false);
    if (error) {
      setPushError(error);
      return;
    }
    setPushEnabled(true);
  }, [vapidPublicKey]);

  const disablePush = useCallback(async () => {
    setPushPending(true);
    await unsubscribeFromPush();
    setPushPending(false);
    setPushEnabled(false);
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markAllRead,
      pushEnabled,
      pushSupported,
      pushConfigured,
      pushPending,
      pushError,
      enablePush,
      disablePush,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markAllRead,
      pushEnabled,
      pushSupported,
      pushConfigured,
      pushPending,
      pushError,
      enablePush,
      disablePush,
    ]
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
