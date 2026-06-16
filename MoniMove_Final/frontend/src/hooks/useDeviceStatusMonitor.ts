'use client';

import { useEffect, useRef } from 'react';
import { useMyDevices } from './useMyDevices';
import { useNotifications } from '../contexts/NotificationContext';
import { getConnectionStatus } from '../utils/deviceStatus';
import { subscribeDeviceInfo } from '../services/firebaseRealtime';

/**
 * useDeviceStatusMonitor
 *
 * Chỉ dùng Firebase RTDB realtime subscription (không polling REST)
 * để tránh double notify. Bỏ qua trạng thái lần đầu (init) để
 * không spam thông báo khi load trang.
 */
export function useDeviceStatusMonitor() {
  const { devices } = useMyDevices();
  const { notify } = useNotifications();
  const prevStatusRef = useRef<Record<string, string>>({});
  const initializedRef = useRef<Set<string>>(new Set()); // track đã init xong chưa

  useEffect(() => {
    if (devices.length === 0) return;

    const unsubscribes = devices.map((d) =>
      subscribeDeviceInfo(d.id, (info) => {
        const conn = getConnectionStatus(info.lastUpdate, undefined, info.status);

        // Lần đầu nhận data — set trạng thái ban đầu, không notify
        if (!initializedRef.current.has(d.id)) {
          prevStatusRef.current[d.id] = conn;
          initializedRef.current.add(d.id);
          return;
        }

        const prev = prevStatusRef.current[d.id];

        // Chỉ notify khi trạng thái thực sự thay đổi
        if (prev !== conn) {
          if (conn === 'offline') {
            notify({
              type: 'offline',
              title: '📡 Thiết bị ngoại tuyến',
              message: `${info.name || d.id} mất kết nối. Kiểm tra thiết bị hoặc mạng.`,
              deviceId: d.id,
            });
          } else if (conn === 'online' && prev === 'offline') {
            notify({
              type: 'success',
              title: '✅ Thiết bị kết nối lại',
              message: `${info.name || d.id} đã trực tuyến trở lại.`,
              deviceId: d.id,
            });
          }
          prevStatusRef.current[d.id] = conn;
        }
      }),
    );

    return () => {
      unsubscribes.forEach((u) => u());
      // Reset init state khi devices thay đổi
      devices.forEach((d) => initializedRef.current.delete(d.id));
    };
  }, [devices, notify]);
}
