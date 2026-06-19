'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, ZapOff, Server, Wifi, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { checkBackendHealth, type HealthCheckResult } from '../services/healthCheck';

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
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
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
        left: Math.max(0, Math.min(window.innerWidth - 220, e.clientX - offsetRef.current.x)),
        top: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offsetRef.current.y)),
      });
    };
    const handleMouseUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
    if (process.env.NODE_ENV !== 'development') return;
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;
  if (!health) return null;

  const isOnline = health.isBackendOnline;

  return (
    <div
      ref={divRef}
      className="fixed z-[10000] select-none"
      style={position ? { left: position.left, top: position.top } : { bottom: 80, right: 16 }}
    >
      {/* Collapsed pill */}
      {!isExpanded && (
        <button
          onMouseDown={handleMouseDown}
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold shadow-lg border transition-all cursor-grab active:cursor-grabbing ${isOnline
              ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600'
              : 'bg-red-500 border-red-400 text-white hover:bg-red-600 animate-pulse'
            }`}
        >
          {isOnline ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
          {isOnline ? 'Backend Live' : 'Backend Offline'}
          <ChevronUp className="h-3 w-3 opacity-60" />
        </button>
      )}

      {/* Expanded panel */}
      {isExpanded && (
        <div className="w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header — drag handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
          >
            <div className="flex items-center gap-2 text-white">
              <Server className="h-4 w-4" />
              <span className="text-xs font-bold">MoniMove Backend</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isOnline ? 'bg-white/20' : 'bg-white/20'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={check} disabled={isChecking}
                className="text-white/80 hover:text-white transition-colors">
                <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {/* API URL */}
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">API Endpoint</p>
              <p className="font-mono text-[10px] text-slate-700 break-all">{health.apiUrl}</p>
            </div>

            {/* Server details */}
            {details && isOnline && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Uptime</p>
                    <p className="font-bold text-slate-700">
                      {details.uptime !== undefined
                        ? `${Math.floor(details.uptime / 60)}p ${details.uptime % 60}s`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Memory</p>
                    <p className="font-bold text-slate-700">{details.memory?.heapUsed || '—'}</p>
                  </div>
                </div>

                {/* WebSocket */}
                {details.websocket && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wifi className="h-3 w-3 text-emerald-500" />
                      <p className="text-[9px] font-bold uppercase text-emerald-600">WebSocket</p>
                      <span className="relative flex h-1.5 w-1.5 ml-auto">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                    </div>
                    <p className="font-bold text-emerald-700">
                      {details.websocket.connectedClients} clients · {details.websocket.namespace}
                    </p>
                  </div>
                )}

                {/* Features */}
                {details.features && (
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1.5">Tính năng</p>
                    <div className="flex flex-wrap gap-1">
                      {details.features.map((f) => (
                        <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
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
                <p className="text-[9px] font-bold uppercase text-red-500 mb-1">Lỗi</p>
                <p className="text-[10px] text-red-700">{health.error}</p>
              </div>
            )}

            {/* Start command hint */}
            {!isOnline && (
              <div className="rounded-lg bg-slate-900 px-3 py-2.5">
                <p className="text-[9px] text-slate-400 mb-1.5 font-semibold">Khởi động backend:</p>
                <code className="text-[10px] text-emerald-400 font-mono block">cd backend</code>
                <code className="text-[10px] text-emerald-400 font-mono block">npm run start:dev</code>
              </div>
            )}

            {/* Last check */}
            <p className="text-[9px] text-slate-400 text-right">
              Kiểm tra: {new Date(health.timestamp).toLocaleTimeString('vi-VN')}
            </p>
          </div>

          {/* Swagger link */}
          {isOnline && (
            <a
              href={health.apiUrl.replace('/api', '/api/docs')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              📖 Swagger API Docs
            </a>
          )}
        </div>
      )}
    </div>
  );
}
