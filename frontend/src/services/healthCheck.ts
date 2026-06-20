// Health Check Service for Backend Connection

const getApiBaseUrl = () => {
<<<<<<< HEAD
  const envUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL
      : undefined;
  if (envUrl) return envUrl;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
=======
  const envUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL) 
    : undefined;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Nếu chạy trên domain production thực tế trên Render, tự động chuyển hướng về backend production
    if (hostname.includes('monimove.onrender.com')) {
      return 'https://monimove-2.onrender.com/api';
    }
    
    return `http://${hostname}:3001/api`;
  }

  return process.env.NEXT_PUBLIC_API_URL || 'https://monimove-2.onrender.com/api';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
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
<<<<<<< HEAD
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Use the detailed health endpoint
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
=======
    // Thử ping endpoint root của backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(API_BASE_URL.replace('/api', ''), {
      method: 'GET',
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 404) {
<<<<<<< HEAD
      result.isBackendOnline = true;

      // Parse detailed health if available
      if (response.ok) {
        try {
          const data = await response.json();
          (result as any).details = data;
        } catch {
          /* ignore */
        }
      }
    } else {
      result.error = `Backend responded with status ${response.status}`;
    }
  } catch (error: any) {
    result.isBackendOnline = false;
    if (error.name === "AbortError") {
      result.error = "Backend không phản hồi (timeout sau 5s)";
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      result.error = "Không thể kết nối đến backend tại " + API_BASE_URL;
    } else {
      result.error = error.message || "Lỗi không xác định";
=======
      // 404 có nghĩa là backend đang chạy nhưng route không tồn tại - điều này OK
      result.isBackendOnline = true;
      console.log('✅ Backend is online at:', API_BASE_URL.replace('/api', ''));
    } else {
      result.error = `Backend responded with status ${response.status}`;
      console.warn('⚠️ Backend returned error:', response.status);
    }
  } catch (error: any) {
    result.isBackendOnline = false;
    
    if (error.name === 'AbortError') {
      result.error = 'Backend không phản hồi (timeout sau 5s)';
      console.warn('❌ Backend timeout');
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      result.error = 'Không thể kết nối đến backend. Vui lòng kiểm tra backend đang chạy tại ' + API_BASE_URL;
      console.warn('❌ Cannot connect to backend:', API_BASE_URL);
    } else {
      result.error = error.message || 'Lỗi không xác định';
      console.warn('❌ Backend health check failed:', error);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    }
  }

  return result;
}

/**
 * Kiểm tra backend và hiển thị warning nếu offline
 */
export async function checkAndWarnIfOffline(): Promise<boolean> {
  const health = await checkBackendHealth();
<<<<<<< HEAD

=======
  
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
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
<<<<<<< HEAD
║  Lỗi: ${(health.error || "Unknown").padEnd(51)} ║
=======
║  Lỗi: ${(health.error || 'Unknown').padEnd(51)} ║
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }
<<<<<<< HEAD

=======
  
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  return health.isBackendOnline;
}
