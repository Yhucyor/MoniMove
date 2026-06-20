"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  AppNotification,
  loadNotifications,
  saveNotifications,
  createNotification,
  showBrowserNotification,
  playNotificationSound,
  requestBrowserNotificationPermission,
} from "../services/notificationService";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  notify: (partial: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(loadNotifications());
    requestBrowserNotificationPermission();
  }, []);

  const persist = useCallback((items: AppNotification[]) => {
    setNotifications(items);
    saveNotifications(items);
  }, []);

  const notify = useCallback(
    (partial: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const item = createNotification(partial);
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 50);
        saveNotifications(next);
        return next;
      });

      if (
        partial.type === "offline" ||
        partial.type === "error" ||
        partial.type === "warning"
      ) {
        showBrowserNotification(
          partial.title,
          partial.message,
          partial.deviceId,
        );
        playNotificationSound(partial.type === "offline" ? "offline" : "alert");
      }
    },
    [],
  );

  const markRead = useCallback(
    (id: string) => {
      persist(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [notifications, persist],
  );

  const markAllRead = useCallback(() => {
    persist(notifications.map((n) => ({ ...n, read: true })));
  }, [notifications, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notify,
        markRead,
        markAllRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications requires NotificationProvider");
  return ctx;
}
