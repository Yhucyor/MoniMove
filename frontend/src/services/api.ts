// API Service for connecting to Backend

<<<<<<< HEAD
import {
  cacheDevices,
  getCachedDevices,
  cacheAlerts,
  getCachedAlerts,
  queuePendingAlert,
  isBrowserOnline,
} from "./offlineStorage";
import { getConnectionStatus } from "../utils/deviceStatus";

const getApiBaseUrl = () => {
  // Prefer a dedicated env variable for the backend URL if set
  const envUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL
      : undefined;
  if (envUrl) return envUrl;

  // Fallback: use the same host with default backend port (3001)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
=======
const getApiBaseUrl = () => {
  // Prefer a dedicated env variable for the backend URL if set
  const envUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL) 
    : undefined;
  if (envUrl) return envUrl;

  // Fallback: use the same host with default backend port (3001)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Nếu chạy trên domain production thực tế trên Render, tự động chuyển hướng về backend production
    if (hostname.includes('monimove.onrender.com')) {
      return 'https://monimove-2.onrender.com/api';
    }
    
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    return `http://${hostname}:3001/api`;
  }

  // Server‑side fallback
<<<<<<< HEAD
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:3001/api"
  );
=======
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://monimove-2.onrender.com/api';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
};

const API_BASE_URL = getApiBaseUrl();

export interface DevicePosition {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface DeviceRoute {
  deviceId: string;
  waypoints: [number, number][];
  distance?: number;
  duration?: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
<<<<<<< HEAD
  status: string;
  connectionStatus?: "online" | "offline" | "unknown";
  battery?: number;
  lastUpdate?: number;
  lastPing?: number;
  licensePlate?: string;
=======
  status: 'active' | 'inactive' | 'warning';
  battery?: number;
  lastUpdate?: number;
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  current_data?: {
    gps: {
      latitude: number;
      longitude: number;
      speed: number;
      satellites: number;
<<<<<<< HEAD
      updated_at?: number;
=======
      updated_at: number;
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    };
    mpu6050: {
      accel: { x: number; y: number; z: number };
      gyro: { x: number; y: number; z: number };
      is_tilted: boolean;
    };
<<<<<<< HEAD
    battery?: number;
    buzzer?: boolean;
=======
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  };
}

// Get current position of a device
<<<<<<< HEAD
export async function getCurrentPosition(
  deviceId: string,
): Promise<DevicePosition | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/devices/${deviceId}/position`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch position");
    return await response.json();
  } catch (error) {
    console.warn(
      "Error fetching current position:",
      error instanceof Error ? error.message : error,
    );
    return null;
=======
export async function getCurrentPosition(deviceId: string): Promise<DevicePosition> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/position`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch position');
    return await response.json();
  } catch (error) {
    console.warn('Error fetching current position (using fallback):', error instanceof Error ? error.message : error);
    // Fallback data
    return {
      lat: 10.8045,
      lng: 106.7380,
      timestamp: Date.now(),
      speed: 45,
      heading: 90
    };
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}

// Get device route
<<<<<<< HEAD
export async function getDeviceRoute(
  deviceId: string,
): Promise<DeviceRoute | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/route`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch route");
    return await response.json();
  } catch (error) {
    console.warn(
      "Error fetching route:",
      error instanceof Error ? error.message : error,
    );
    return null;
=======
export async function getDeviceRoute(deviceId: string): Promise<DeviceRoute> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/route`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch route');
    return await response.json();
  } catch (error) {
    console.warn('Error fetching route (using fallback):', error instanceof Error ? error.message : error);
    // Fallback data
    return {
      deviceId,
      waypoints: [
        [10.7756, 106.7068],
        [10.8018, 106.7280],
        [10.8045, 106.7380]
      ]
    };
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}

// Get device info
<<<<<<< HEAD
export async function getDeviceInfo(
  deviceId: string,
): Promise<DeviceInfo | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok)
      throw new Error(
        `Failed to fetch device info (status ${response.status})`,
      );
    return await response.json();
  } catch (error) {
    console.warn(
      "Error fetching device info:",
      error instanceof Error ? error.message : error,
    );
    return null;
=======
export async function getDeviceInfo(deviceId: string): Promise<DeviceInfo> {
  try {
    // Debug: show the base URL being used

    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errText = await response.text();
      console.warn('Failed to fetch device info, status:', response.status, errText);
      throw new Error(`Failed to fetch device info (status ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching device info (using fallback):', error instanceof Error ? error.message : error);
    // Fallback data
    return {
      id: deviceId,
      name: 'MoniMove - 01',
      status: 'active',
      battery: 85,
      lastUpdate: Date.now()
    };
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}

// Get position history (for timeline)
export async function getPositionHistory(
  deviceId: string,
  startTime: number,
<<<<<<< HEAD
  endTime: number,
=======
  endTime: number
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
): Promise<DevicePosition[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/devices/${deviceId}/history?start=${startTime}&end=${endTime}`,
<<<<<<< HEAD
      { headers: getAuthHeaders() },
    );
    if (!response.ok) throw new Error("Failed to fetch history");
    return await response.json();
  } catch (error) {
    console.warn(
      "Error fetching position history:",
      error instanceof Error ? error.message : error,
    );
=======
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.warn('Error fetching position history:', error instanceof Error ? error.message : error);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    return [];
  }
}

// Verify Firebase ID Token with Backend
export async function verifyAuthToken(idToken: string): Promise<any> {
  try {
<<<<<<< HEAD
    console.log("🔐 Đang xác thực token với backend:", API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Xác thực thất bại:", response.status, errText);
      throw new Error(`Xác thực thất bại (Mã lỗi ${response.status})`);
    }

    const result = await response.json();
    console.log("✅ Xác thực thành công:", result);
    return result;
  } catch (error) {
    console.error("❌ Lỗi kết nối xác thực:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy tại " +
          API_BASE_URL,
      );
    }

=======
    console.log('🔐 Đang xác thực token với backend:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ Xác thực thất bại:', response.status, errText);
      throw new Error(`Xác thực thất bại (Mã lỗi ${response.status})`);
    }
    
    const result = await response.json();
    console.log('✅ Xác thực thành công:', result);
    return result;
  } catch (error) {
    console.error('❌ Lỗi kết nối xác thực:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy tại ' + API_BASE_URL);
    }
    
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    throw error;
  }
}

function getAuthHeaders() {
<<<<<<< HEAD
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("firebase_token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Send alert (queues offline if network unavailable)
export async function sendAlert(
  deviceId: string,
  alertType: string,
  message: string,
  severity: "critical" | "warning" | "info" = "info",
  location?: { lat: number; lng: number },
  sosEmail?: string,
) {
  const payload = {
    deviceId,
    alertType,
    message,
    severity,
    location,
    sosEmail,
    timestamp: Date.now(),
  };

  if (!isBrowserOnline()) {
    await queuePendingAlert({
      deviceId,
      alertType,
      message,
      timestamp: payload.timestamp,
    });
    return { success: true, queued: true };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to send alert");
    return await response.json();
  } catch (error) {
    await queuePendingAlert({
      deviceId,
      alertType,
      message,
      timestamp: Date.now(),
    });
    console.warn(
      "Alert queued for sync:",
      error instanceof Error ? error.message : error,
    );
    return { success: true, queued: true };
=======
  const token = typeof window !== 'undefined' ? localStorage.getItem('firebase_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Send alert
export async function sendAlert(deviceId: string, alertType: string, message: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deviceId, alertType, message, timestamp: Date.now() })
    });
    return await response.json();
  } catch (error) {
    console.warn('Error sending alert:', error instanceof Error ? error.message : error);
    throw error;
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}

export interface AlertLog {
  id: string;
  deviceId: string;
  alertType: string;
  message: string;
  timestamp: number;
}

<<<<<<< HEAD
export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  role: "user" | "admin";
  deviceIds: string[];
  createdAt: string;
}

export interface DeviceListItem {
  id: string;
  name: string;
  status: string;
  connectionStatus?: "online" | "offline" | "unknown";
  lastPing?: number | null;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch current user");
  return await response.json();
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return await response.json();
}

export async function updateUserRole(
  email: string,
  role: "user" | "admin",
): Promise<UserProfile> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(email)}/role`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    },
  );
  if (!response.ok) throw new Error("Failed to update role");
  return await response.json();
}

export async function updateUserDevices(
  email: string,
  deviceIds: string[],
): Promise<UserProfile> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(email)}/devices`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ deviceIds }),
    },
  );
  if (!response.ok) throw new Error("Failed to update devices");
  return await response.json();
}

export async function deleteUser(email: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) throw new Error("Failed to delete user");
}

export async function listDevices(): Promise<DeviceListItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch devices");
    const data: DeviceListItem[] = await response.json();

    await cacheDevices(
      data.map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        connectionStatus:
          d.connectionStatus ||
          getConnectionStatus(undefined, d.lastPing ?? undefined, d.status),
        cachedAt: Date.now(),
      })),
    );
    return data;
  } catch (error) {
    console.warn(
      "Error listing devices (using cache):",
      error instanceof Error ? error.message : error,
    );
    const cached = await getCachedDevices();
    return cached.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      connectionStatus:
        c.connectionStatus as DeviceListItem["connectionStatus"],
    }));
  }
}

// ─── Device Settings ──────────────────────────────────────────────────────────

export interface DeviceSettings {
  sos_email?: string;
  sos_phone?: string;
  impactSensitivity?: number; // 1–5
  fallAngleThreshold?: number; // 0–90 (độ)
  speedThreshold?: number; // 0–200 (km/h)
  enable_sms?: boolean;
  enable_audio?: boolean;
}

export async function getDeviceSettings(
  deviceId: string,
): Promise<DeviceSettings> {
  const response = await fetch(
    `${API_BASE_URL}/settings/${encodeURIComponent(deviceId)}`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) throw new Error("Failed to fetch device settings");
  return await response.json();
}

export async function saveDeviceSettings(
  deviceId: string,
  settings: DeviceSettings,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/settings/${encodeURIComponent(deviceId)}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    },
  );
  if (!response.ok) throw new Error("Failed to save device settings");
  return await response.json();
}

=======
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
// Get alerts history
export async function getAlertsHistory(deviceId?: string): Promise<AlertLog[]> {
  try {
    const url = deviceId
      ? `${API_BASE_URL}/alerts?deviceId=${deviceId}`
      : `${API_BASE_URL}/alerts`;
    const response = await fetch(url, { headers: getAuthHeaders() });
<<<<<<< HEAD
    if (!response.ok) throw new Error("Failed to fetch alerts history");
    const data: AlertLog[] = await response.json();
    await cacheAlerts(data.map((a) => ({ ...a, cachedAt: Date.now() })));
    return data;
  } catch (error) {
    console.warn(
      "Error fetching alerts (using cache):",
      error instanceof Error ? error.message : error,
    );
    const cached = await getCachedAlerts();
    if (deviceId) return cached.filter((a) => a.deviceId === deviceId);
    return cached;
=======
    if (!response.ok) throw new Error('Failed to fetch alerts history');
    return await response.json();
  } catch (error) {
    console.warn('Error fetching alerts history:', error instanceof Error ? error.message : error);
    return [];
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}
