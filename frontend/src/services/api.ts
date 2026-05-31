// API Service để kết nối Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  status: 'active' | 'inactive' | 'warning';
  battery?: number;
  lastUpdate?: number;
}

// Lấy vị trí hiện tại của thiết bị
export async function getCurrentPosition(deviceId: string): Promise<DevicePosition> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/position`);
    if (!response.ok) throw new Error('Failed to fetch position');
    return await response.json();
  } catch (error) {
    console.error('Error fetching current position:', error);
    // Fallback data
    return {
      lat: 10.8045,
      lng: 106.7380,
      timestamp: Date.now(),
      speed: 45,
      heading: 90
    };
  }
}

// Lấy lộ trình của thiết bị
export async function getDeviceRoute(deviceId: string): Promise<DeviceRoute> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/route`);
    if (!response.ok) throw new Error('Failed to fetch route');
    return await response.json();
  } catch (error) {
    console.error('Error fetching route:', error);
    // Fallback data
    return {
      deviceId,
      waypoints: [
        [10.7756, 106.7068],
        [10.8018, 106.7280],
        [10.8045, 106.7380],
      ]
    };
  }
}

// Lấy thông tin thiết bị
export async function getDeviceInfo(deviceId: string): Promise<DeviceInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
    if (!response.ok) throw new Error('Failed to fetch device info');
    return await response.json();
  } catch (error) {
    console.error('Error fetching device info:', error);
    // Fallback data
    return {
      id: deviceId,
      name: 'MoniMove - 01',
      status: 'active',
      battery: 85,
      lastUpdate: Date.now()
    };
  }
}

// Lấy lịch sử vị trí (cho timeline)
export async function getPositionHistory(
  deviceId: string, 
  startTime: number, 
  endTime: number
): Promise<DevicePosition[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/devices/${deviceId}/history?start=${startTime}&end=${endTime}`
    );
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching position history:', error);
    return [];
  }
}

// Gửi cảnh báo
export async function sendAlert(deviceId: string, alertType: string, message: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, alertType, message, timestamp: Date.now() })
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending alert:', error);
    throw error;
  }
}
