export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "offline";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  deviceId?: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "monimove_notifications";

export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return;
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function createNotification(
  partial: Omit<AppNotification, "id" | "timestamp" | "read">,
): AppNotification {
  return {
    ...partial,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window))
    return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showBrowserNotification(
  title: string,
  body: string,
  tag?: string,
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, { body, tag, icon: "/favicon.ico" });
  } catch {
    // ignore
  }
}

export function isAudioEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("settings_audio") !== "false";
}

export function playNotificationSound(
  type: "alert" | "offline" = "alert",
): void {
  if (!isAudioEnabled()) return;
  if (typeof window === "undefined") return;

  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === "offline" ? 440 : 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + (type === "offline" ? 0.3 : 0.15));
  } catch {
    // ignore
  }
}
