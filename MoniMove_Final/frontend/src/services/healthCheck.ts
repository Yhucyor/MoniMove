// Health Check Service for Backend Connection

const getApiBaseUrl = () => {
  const envUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL)
    : undefined;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface HealthCheckResult {
  isBackendOnline: boolean;
  apiUrl: string;
  error?: string;
  timestamp: number;
}

/**
 * Kiểm tra backend có đang chạy không
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    isBackendOnline: false,
    apiUrl: API_BASE_URL,
    timestamp: Date.now(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Use the detailed health endpoint
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 404) {
      result.isBackendOnline = true;

      // Parse detailed health if available
      if (response.ok) {
        try {
          const data = await response.json();
          (result as any).details = data;
        } catch { /* ignore */ }
      }
    } else {
      result.error = `Backend responded with status ${response.status}`;
    }
  } catch (error: any) {
    result.isBackendOnline = false;
    if (error.name === 'AbortError') {
      result.error = 'Backend không phản hồi (timeout sau 5s)';
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      result.error = 'Không thể kết nối đến backend tại ' + API_BASE_URL;
    } else {
      result.error = error.message || 'Lỗi không xác định';
    }
  }

  return result;
}

/**
 * Kiểm tra backend và hiển thị warning nếu offline
 */
export async function checkAndWarnIfOffline(): Promise<boolean> {
  const health = await checkBackendHealth();

  if (!health.isBackendOnline) {
    console.warn(`
╔════════════════════════════════════════════════════════════╗
║                  ⚠️  BACKEND NOT RUNNING                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Backend không phản hồi tại: ${health.apiUrl.padEnd(24)} ║
║                                                            ║
║  Vui lòng khởi động backend:                              ║
║    cd backend                                              ║
║    npm run start:dev                                       ║
║                                                            ║
║  Lỗi: ${(health.error || 'Unknown').padEnd(51)} ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }

  return health.isBackendOnline;
}
