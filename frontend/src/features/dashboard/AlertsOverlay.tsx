'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, X, MapPin, Clock, Bell } from 'lucide-react';
import { subscribeAlerts } from '../../services/firebaseRealtime';

interface Alert {
  id: string;
  deviceId: string;
  type: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: number;
  location?: {
    lat: number;
    lng: number;
  };
}

interface AlertsOverlayProps {
  deviceId: string | null;
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertsOverlay({ deviceId, onAlertClick }: AlertsOverlayProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showDangerBorder, setShowDangerBorder] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAlertIdRef = useRef<string>('');

  // Subscribe to alerts from Firebase
  useEffect(() => {
    if (!deviceId) return;

    const unsubscribe = subscribeAlerts(deviceId, (alertsList: any[]) => {
      const formattedAlerts: Alert[] = alertsList.map((alert: any) => ({
        id: alert.id || `${alert.timestamp}`,
        deviceId: alert.deviceId || deviceId,
        type: alert.type || alert.alertType || 'unknown',
        message: alert.message || 'Cảnh báo không xác định',
        severity: getSeverity(alert.type || alert.alertType),
        timestamp: alert.timestamp || Date.now(),
        location: alert.location || alert.gps,
      }));

      // Sort by timestamp descending (newest first)
      formattedAlerts.sort((a, b) => b.timestamp - a.timestamp);
      
      // Keep only last 10 alerts
      const recentAlerts = formattedAlerts.slice(0, 10);
      setAlerts(recentAlerts);

      // Check for new critical alerts
      const latestAlert = recentAlerts[0];
      if (latestAlert && latestAlert.id !== lastAlertIdRef.current) {
        lastAlertIdRef.current = latestAlert.id;
        
        if (latestAlert.severity === 'critical') {
          // Trigger danger border animation
          setShowDangerBorder(true);
          
          // Play alert sound
          playAlertSound();
          
          // Auto-hide border after 10 seconds
          setTimeout(() => setShowDangerBorder(false), 10000);
        }
      }
    });

    return () => unsubscribe();
  }, [deviceId]);

  const getSeverity = (type: string): 'critical' | 'warning' | 'info' => {
    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('ngã') || lowerType.includes('va chạm') || lowerType.includes('crash') || lowerType.includes('tilt')) {
      return 'critical';
    }
    if (lowerType.includes('cảnh báo') || lowerType.includes('warning')) {
      return 'warning';
    }
    return 'info';
  };

  const playAlertSound = () => {
    try {
      // Create beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Second beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
      }, 200);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 10) return 'Vừa xong';
    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const criticalAlerts = visibleAlerts.filter(a => a.severity === 'critical');

  return (
    <>
      {/* Danger Border Overlay - Flashing red border when critical alert */}
      {showDangerBorder && (
        <>
          <div className="fixed inset-0 pointer-events-none z-[9999] animate-pulse">
            <div className="absolute inset-0 border-[8px] border-red-500/60 rounded-none shadow-[inset_0_0_60px_rgba(239,68,68,0.4)]"></div>
          </div>
          <div className="fixed inset-0 pointer-events-none z-[9999] animate-ping" style={{ animationDuration: '2s' }}>
            <div className="absolute inset-0 border-[4px] border-red-400/40 rounded-none"></div>
          </div>
        </>
      )}

      {/* Alert Counter Badge - Top Right */}
      {criticalAlerts.length > 0 && (
        <div className="fixed top-20 right-4 z-[2001] animate-bounce">
          <div className="relative">
            <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
              <Bell className="w-5 h-5 animate-wiggle" />
              <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-red-500">
                {criticalAlerts.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alert Notifications - Stacked on top right */}
      <div className="fixed top-24 right-4 z-[2000] space-y-3 max-w-md">
        {visibleAlerts.slice(0, 3).map((alert, index) => {
          const isNew = Date.now() - alert.timestamp < 30000; // New if less than 30s old
          
          return (
            <div
              key={alert.id}
              className={`transform transition-all duration-500 ${
                index === 0 ? 'translate-y-0 scale-100' : 
                index === 1 ? 'translate-y-2 scale-95 opacity-90' : 
                'translate-y-4 scale-90 opacity-80'
              }`}
              style={{
                animation: isNew ? 'slideInRight 0.5s ease-out' : 'none'
              }}
            >
              <div className={`relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 overflow-hidden ${
                alert.severity === 'critical' 
                  ? 'border-red-500/50' 
                  : alert.severity === 'warning' 
                  ? 'border-amber-500/50' 
                  : 'border-blue-500/50'
              }`}>
                {/* Severity Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  alert.severity === 'critical' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : alert.severity === 'warning' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}></div>

                <div className="p-4 pt-5">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-600' 
                        : alert.severity === 'warning' 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                          alert.severity === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : alert.severity === 'warning' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.type}
                        </span>
                        {isNew && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-lg animate-pulse">
                            MỚI
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-800 mb-2 leading-snug">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{getRelativeTime(alert.timestamp)}</span>
                        </div>
                        {alert.location && (
                          <button
                            onClick={() => onAlertClick?.(alert)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Xem vị trí</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
