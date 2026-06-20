<<<<<<< HEAD
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap,
  ZapOff,
  Server,
  Wifi,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import {
  checkBackendHealth,
  type HealthCheckResult,
} from "../services/healthCheck";

interface DetailedHealth {
  status: string;
  uptime?: number;
  memory?: { heapUsed: string; heapTotal: string };
  websocket?: { connectedClients: number; namespace: string };
  features?: string[];
}

export default function BackendStatus() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [details, setDetails] = useState<DetailedHealth | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Drag state
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    draggingRef.current = true;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      setPosition({
        left: Math.max(
          0,
          Math.min(window.innerWidth - 220, e.clientX - offsetRef.current.x),
        ),
        top: Math.max(
          0,
          Math.min(window.innerHeight - 60, e.clientY - offsetRef.current.y),
        ),
      });
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const check = async () => {
    setIsChecking(true);
    const result = await checkBackendHealth();
    setHealth(result);
    if ((result as any).details) setDetails((result as any).details);
    setIsChecking(false);
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;
  if (!health) return null;

  const isOnline = health.isBackendOnline;

  return (
    <div
      ref={divRef}
      className="fixed z-[10000] select-none"
      style={
        position
          ? { left: position.left, top: position.top }
          : { bottom: 80, right: 16 }
      }
    >
      {/* Collapsed — circular icon button */}
      {!isExpanded && (
        <div className="group relative">
          <button
            onMouseDown={handleMouseDown}
            onClick={() => setIsExpanded(true)}
            className={`
              flex items-center justify-center rounded-full
              w-12 h-12 sm:w-14 sm:h-14
              text-white border-0
              cursor-grab active:cursor-grabbing
              transition-all duration-200 ease-in-out
              hover:scale-105
              ${
                isOnline
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600 animate-pulse"
              }
            `}
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
            aria-label={isOnline ? "Backend Online" : "Backend Offline"}
          >
            {isOnline ? (
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <ZapOff className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>

          {/* Hover tooltip */}
          <div
            className="
            pointer-events-none absolute bottom-full right-0 mb-2
            whitespace-nowrap rounded-lg px-2.5 py-1.5
            bg-slate-900 text-white text-[11px] font-semibold
            opacity-0 group-hover:opacity-100
            translate-y-1 group-hover:translate-y-0
            transition-all duration-150
            shadow-lg
          "
          >
            {isOnline ? "⚡ Backend Online" : "⚠️ Backend Offline"}
            <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}

      {/* Expanded panel */}
      {isExpanded && (
        <div className="w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header — drag handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
          >
            <div className="flex items-center gap-2 text-white">
              <Server className="h-4 w-4" />
              <span className="text-xs font-bold">MoveMonitor Backend</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isOnline ? "bg-white/20" : "bg-white/20"}`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={check}
                disabled={isChecking}
                className="text-white/80 hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {/* API URL */}
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                API Endpoint
              </p>
              <p className="font-mono text-[10px] text-slate-700 break-all">
                {health.apiUrl}
              </p>
            </div>

            {/* Server details */}
            {details && isOnline && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                      Uptime
                    </p>
                    <p className="font-bold text-slate-700">
                      {details.uptime !== undefined
                        ? `${Math.floor(details.uptime / 60)}p ${details.uptime % 60}s`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                      Memory
                    </p>
                    <p className="font-bold text-slate-700">
                      {details.memory?.heapUsed || "—"}
                    </p>
                  </div>
                </div>

                {/* WebSocket */}
                {details.websocket && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wifi className="h-3 w-3 text-emerald-500" />
                      <p className="text-[9px] font-bold uppercase text-emerald-600">
                        WebSocket
                      </p>
                      <span className="relative flex h-1.5 w-1.5 ml-auto">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                    </div>
                    <p className="font-bold text-emerald-700">
                      {details.websocket.connectedClients} clients ·{" "}
                      {details.websocket.namespace}
                    </p>
                  </div>
                )}

                {/* Features */}
                {details.features && (
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1.5">
                      Tính năng
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {details.features.map((f) => (
                        <span
                          key={f}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {health.error && !isOnline && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-[9px] font-bold uppercase text-red-500 mb-1">
                  Lỗi
                </p>
                <p className="text-[10px] text-red-700">{health.error}</p>
              </div>
            )}

            {/* Start command hint */}
            {!isOnline && (
              <div className="rounded-lg bg-slate-900 px-3 py-2.5">
                <p className="text-[9px] text-slate-400 mb-1.5 font-semibold">
                  Khởi động backend:
                </p>
                <code className="text-[10px] text-emerald-400 font-mono block">
                  cd backend
                </code>
                <code className="text-[10px] text-emerald-400 font-mono block">
                  npm run start:dev
                </code>
              </div>
            )}

            {/* Last check */}
            <p className="text-[9px] text-slate-400 text-right">
              Kiểm tra: {new Date(health.timestamp).toLocaleTimeString("vi-VN")}
            </p>
          </div>

          {/* Swagger link */}
          {isOnline && (
            <a
              href={health.apiUrl.replace("/api", "/api/docs")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              📖 Swagger API Docs
            </a>
          )}
=======
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        </div>
      )}
    </div>
  );
}
