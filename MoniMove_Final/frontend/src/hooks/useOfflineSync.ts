'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  cacheDevices,
  cacheAlerts,
  getCachedDevices,
  getCachedAlerts,
  getPendingAlerts,
  removePendingAlert,
  isBrowserOnline,
  CachedDevice,
} from '../services/offlineStorage';
import { listDevices, getAlertsHistory, sendAlert, DeviceListItem } from '../services/api';
import { getConnectionStatus } from '../utils/deviceStatus';
import { useNotifications } from '../contexts/NotificationContext';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [cachedDeviceCount, setCachedDeviceCount] = useState(0);
  const { notify } = useNotifications();

  const syncPendingAlerts = useCallback(async () => {
    const pending = await getPendingAlerts();
    for (const item of pending) {
      try {
        await sendAlert(item.deviceId, item.alertType, item.message);
        await removePendingAlert(item.id);
      } catch {
        break;
      }
    }
  }, []);

  const syncData = useCallback(async () => {
    if (!isBrowserOnline()) return;

    setIsSyncing(true);
    try {
      const [devices, alerts] = await Promise.all([
        listDevices(),
        getAlertsHistory(),
      ]);

      const cached: CachedDevice[] = devices.map((d: DeviceListItem) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        connectionStatus: getConnectionStatus(undefined, undefined, d.status),
        cachedAt: Date.now(),
      }));

      await cacheDevices(cached);
      await cacheAlerts(
        alerts.map((a) => ({
          id: a.id,
          deviceId: a.deviceId,
          alertType: a.alertType,
          message: a.message,
          timestamp: a.timestamp,
          cachedAt: Date.now(),
        })),
      );

      await syncPendingAlerts();
      setCachedDeviceCount(cached.length);
      setLastSyncAt(Date.now());
    } catch {
      const cached = await getCachedDevices();
      setCachedDeviceCount(cached.length);
    } finally {
      setIsSyncing(false);
    }
  }, [syncPendingAlerts]);

  useEffect(() => {
    setIsOnline(isBrowserOnline());

    const handleOnline = () => {
      setIsOnline(true);
      notify({
        type: 'success',
        title: 'Đã kết nối lại',
        message: 'Mạng đã khôi phục. Đang đồng bộ dữ liệu...',
      });
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      notify({
        type: 'warning',
        title: 'Mất kết nối mạng',
        message: 'Dữ liệu sẽ được lưu tạm và đồng bộ khi có mạng trở lại.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    syncData();
    const interval = setInterval(syncData, 60_000);

    getCachedDevices().then((d) => setCachedDeviceCount(d.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncData, notify]);

  return { isOnline, isSyncing, lastSyncAt, cachedDeviceCount, syncData, getCachedAlerts };
}

export async function getDevicesWithOfflineFallback(): Promise<CachedDevice[]> {
  try {
    if (isBrowserOnline()) {
      const devices = await listDevices();
      const cached: CachedDevice[] = devices.map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        connectionStatus: getConnectionStatus(undefined, undefined, d.status),
        cachedAt: Date.now(),
      }));
      await cacheDevices(cached);
      return cached;
    }
  } catch {
    // fallback
  }
  return getCachedDevices();
}
