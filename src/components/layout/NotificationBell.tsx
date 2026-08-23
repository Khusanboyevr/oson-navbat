"use client";

import { Bell, CalendarCheck, CircleCheck, CircleX, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { formatRelativeTime, type NotificationKind } from "@/lib/notifications";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  reminder: Clock,
  cancellation: CircleX,
  confirmation: CircleCheck,
  system: CalendarCheck,
};

const KIND_ICON_CLASS: Record<NotificationKind, string> = {
  reminder: "bg-primary/15 text-primary",
  cancellation: "bg-danger/15 text-danger",
  confirmation: "bg-accent/15 text-accent",
  system: "bg-white/40 text-foreground/60",
};

export default function NotificationBell() {
  const { t } = useLanguage();
  const { notifications, unreadCount, isLoading, refresh, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((open) => {
      const next = !open;
      if (next) {
        refresh();
        markAllRead();
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t("notifications.title")}
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/40 active:scale-90"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="animate-modal-in absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-3xl border border-white/30 bg-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-white/30 px-4 py-3">
            <h3 className="text-sm font-bold text-foreground">{t("notifications.title")}</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/30">
                {notifications.map((notification) => {
                  const Icon = KIND_ICON[notification.kind];
                  return (
                    <li key={notification.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/30">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${KIND_ICON_CLASS[notification.kind]}`}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{notification.title}</p>
                          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 text-xs text-foreground/70">{notification.body}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
