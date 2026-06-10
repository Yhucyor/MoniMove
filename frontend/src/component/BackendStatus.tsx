'use client';

import { useState, useEffect } from 'react';
import { checkBackendHealth, type HealthCheckResult } from '../services/healthCheck';

/**
 * Component hiển thị trạng thái backend (chỉ hiển thị trong development)
 * Đặt component này trong layout để theo dõi backend status
 */
export default function BackendStatus() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị trong development
    if (process.env.NODE_ENV !== 'development') return;

    // Check backend health khi component mount
    const checkHealth = async () => {
      const result = await checkBackendHealth();
      setHealth(result);
    };

    checkHealth();

    // Recheck mỗi 30s
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  // Không hiển thị trong production
  if (process.env.NODE_ENV !== 'development') return null;
  if (!health) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000]">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`rounded-full p-2 shadow-lg transition-all duration-200 ${
          health.isBackendOnline
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600 animate-pulse'
        }`}
        title={health.isBackendOnline ? 'Backend Online' : 'Backend Offline - Click for details'}
      >
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {health.isBackendOnline ? (
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
      </button>

      {/* Status panel */}
      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Backend Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  health.isBackendOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">
                {health.isBackendOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <div className="text-slate-600">API URL:</div>
              <div className="font-mono text-[10px] bg-slate-50 p-1 rounded">
                {health.apiUrl}
              </div>
            </div>

            {health.error && (
              <div className="border-t border-slate-200 pt-2">
                <div className="text-red-600 font-medium">Error:</div>
                <div className="text-slate-700 text-[10px] bg-red-50 p-2 rounded">
                  {health.error}
                </div>
              </div>
            )}

            {!health.isBackendOnline && (
              <div className="border-t border-slate-200 pt-2">
                <div className="text-slate-700 font-medium mb-1">
                  💡 Khởi động Backend:
                </div>
                <div className="bg-slate-900 text-green-400 p-2 rounded font-mono text-[10px] space-y-1">
                  <div>cd backend</div>
                  <div>npm run start:dev</div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 text-slate-400">
              Last check: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
