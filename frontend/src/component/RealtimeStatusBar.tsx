"use client";

import { Zap, ZapOff, Radio, Activity } from "lucide-react";
import type { WsConnectionState } from "../hooks/useWebSocket";

interface RealtimeStatusBarProps {
  connectionState: WsConnectionState;
  lastPing: number | null;
  lastUpdateAt: number | null;
  deviceId?: string;
}

export default function RealtimeStatusBar({
  connectionState,
  lastPing,
  lastUpdateAt,
  deviceId,
}: RealtimeStatusBarProps) {
  const isConnected = connectionState === "connected";
  const isError = connectionState === "error";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-[10px] font-bold transition-all ${
        isConnected
          ? "bg-emerald-50 border-emerald-200/60 text-emerald-700"
          : isError
            ? "bg-red-50 border-red-200/60 text-red-600"
            : "bg-slate-50 border-slate-200/60 text-slate-500"
      }`}
    >
      {/* Connection dot */}
      <span className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Zap className="h-3 w-3" />
            WebSocket Live
          </>
        ) : isError ? (
          <>
            <ZapOff className="h-3 w-3" />
            WS Error
          </>
        ) : (
          <>
            <Radio className="h-3 w-3 animate-pulse" />
            {connectionState === "connecting" ? "Đang kết nối..." : "Offline"}
          </>
        )}
      </span>

      {/* Divider */}
      {isConnected && <span className="text-emerald-300">|</span>}

      {/* Last data update */}
      {isConnected && lastUpdateAt && (
        <span className="flex items-center gap-1 text-emerald-600">
          <Activity className="h-3 w-3" />
          {new Date(lastUpdateAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      )}

      {/* Device */}
      {deviceId && (
        <span className="hidden sm:block text-emerald-500 opacity-70 truncate max-w-[80px]">
          {deviceId}
        </span>
      )}
    </div>
  );
}
