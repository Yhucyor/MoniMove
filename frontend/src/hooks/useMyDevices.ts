"use client";

import { useState, useEffect, useCallback } from "react";
import { listDevices, DeviceListItem } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { getCachedDevices } from "../services/offlineStorage";

export function useMyDevices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDevices();
      setDevices(data);
      setError(null);
      setFromCache(false);
    } catch {
      // Fallback về cache khi API fail
      try {
        const cached = await getCachedDevices();
        if (cached.length > 0) {
          setDevices(
            cached.map((c) => ({
              id: c.id,
              name: c.name,
              status: c.status,
              connectionStatus:
                c.connectionStatus as DeviceListItem["connectionStatus"],
              lastPing: undefined,
            })),
          );
          setFromCache(true);
          setError(null);
        } else {
          setError("Không thể tải danh sách thiết bị");
          setDevices([]);
        }
      } catch {
        setError("Không thể tải danh sách thiết bị");
        setDevices([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDevices();
    } else {
      setDevices([]);
      setLoading(false);
    }
  }, [user?.email, user?.deviceIds?.join(","), fetchDevices]);

  const primaryDeviceId = devices[0]?.id ?? null;

  return {
    devices,
    loading,
    error,
    fromCache,
    primaryDeviceId,
    refresh: fetchDevices,
  };
}
