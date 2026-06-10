'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, X, MapPin, Clock, Bell, Shield } from 'lucide-react';
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
  const lastAlertIdRef = useRef<string>('');
  
  // Popup states
  const [showDangerPopup, setShowDangerPopup] = useState(false);
  const [showSafePopup, setShowSafePopup] = useState(false);
  const safePopupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to alerts from Firebase
  useEffect(() => {
    if (!deviceId) return;
    
    // Reset last alert ID when deviceId changes to correctly capture new alerts
    lastAlertIdRef.current = '';

    const unsubscribe = subscribeAlerts(deviceId, (alertsList: any[]) => {
      const formattedAlerts: Alert[] = alertsList.map((alert: any) => ({
        id: alert.id || `${alert.timestamp}`,
        deviceId: alert.deviceId || deviceId,
        type: alert.type || alert.alertType || 'unknown',
        message: alert.message || 'Cảnh báo không xác định',
        severity: alert.severity || getSeverity(alert.type || alert.alertType),
        timestamp: alert.timestamp || Date.now(),
        location: alert.location || alert.gps,
      }));

      // Sort by timestamp descending (newest first)
      formattedAlerts.sort((a, b) => b.timestamp - a.timestamp);
      
      // Keep only last 10 alerts
      const recentAlerts = formattedAlerts.slice(0, 10);
      setAlerts(recentAlerts);

      // Check for new critical/warning alerts to play sound and show popup
      const latestAlert = recentAlerts[0];
      if (latestAlert && latestAlert.id !== lastAlertIdRef.current) {
        lastAlertIdRef.current = latestAlert.id;
        
        // If there's a new danger/warning alert, make sure popup is shown
        if (latestAlert.severity === 'critical' || latestAlert.severity === 'warning') {
          setShowDangerPopup(true);
          if (latestAlert.severity === 'critical') {
            // Play alert sound for new critical alert
            playAlertSound();
          }
        }
      }
    });

    return () => unsubscribe();
  }, [deviceId]);

  // Separate effect to handle danger/safe popup logic
  useEffect(() => {
    // Filter out dismissed alerts
    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
    const dangerAlerts = visibleAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'warning');
    const hasDangerAlerts = dangerAlerts.length > 0;
    const hasCriticalAlerts = dangerAlerts.some(alert => alert.severity === 'critical');

    if (hasDangerAlerts) {
      // DANGER STATE (Danger or Warning)
      setShowDangerBorder(hasCriticalAlerts); // Only flash red border for critical severity
      setShowDangerPopup(true);
      setShowSafePopup(false);
      
      // Clear safe popup timer if exists
      if (safePopupTimerRef.current) {
        clearTimeout(safePopupTimerRef.current);
        safePopupTimerRef.current = null;
      }
    } else {
      // SAFE STATE (No danger or warning alerts)
      setShowDangerBorder(false);
      setShowDangerPopup(false);
      
      // Hiển thị Popup An toàn
      setShowSafePopup(true);
      
      // Auto-hide safe popup after 5 seconds
      if (safePopupTimerRef.current) {
        clearTimeout(safePopupTimerRef.current);
      }
      
      safePopupTimerRef.current = setTimeout(() => {
        setShowSafePopup(false);
      }, 5000);
    }

    // Cleanup timer on unmount/re-run
    return () => {
      if (safePopupTimerRef.current) {
        clearTimeout(safePopupTimerRef.current);
      }
    };
  }, [alerts, dismissedAlerts]);

  const getSeverity = (type: string): 'critical' | 'warning' | 'info' => {
    const lowerType = (type || '').toLowerCase();
    if (
      lowerType.includes('ngã') || 
      lowerType.includes('va chạm') || 
      lowerType.includes('crash') || 
      lowerType.includes('tilt') ||
      lowerType.includes('cực thấp')
    ) {
      return 'critical';
    }
    if (
      lowerType.includes('cảnh báo') || 
      lowerType.includes('warning') || 
      lowerType.includes('tốc độ') || 
      lowerType.includes('pin yếu') || 
      lowerType.includes('nhiệt độ')
    ) {
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

  const handleCloseSafePopup = () => {
    setShowSafePopup(false);
    if (safePopupTimerRef.current) {
      clearTimeout(safePopupTimerRef.current);
      safePopupTimerRef.current = null;
    }
  };

  const handleCloseDangerPopup = () => {
    setShowDangerPopup(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (safePopupTimerRef.current) {
        clearTimeout(safePopupTimerRef.current);
      }
    };
  }, []);

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
  const dangerAlerts = visibleAlerts.filter(a => a.severity === 'critical' || a.severity === 'warning');
  const hasCriticalAlerts = dangerAlerts.some(a => a.severity === 'critical');

  return (
    <>
      {/* Danger Border Overlay - Flashing red border when critical alert */}
      {showDangerBorder && (
        <div className="fixed inset-0 pointer-events-none z-[9999] danger-border-animation" />
      )}

      {/* Safe Popup - Shows when safe, auto-hides after 5s */}
      {showSafePopup && (
        <div className="fixed top-4 right-28 z-[2001] animate-slideInRight">
          <div className="relative bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-green-500/50 overflow-hidden max-w-xs">
            {/* Green bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600"></div>

            <div className="p-1.5">
              <div className="flex items-center gap-1.5">
                {/* Icon */}
                <div className="flex-shrink-0 w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">
                  <Shield className="w-3 h-3" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8px] font-black uppercase tracking-wide px-1 py-0.5 rounded bg-green-100 text-green-700">
                      AN TOÀN
                    </span>
                  </div>
                  
                  <p className="text-[10px] font-semibold text-slate-800 leading-tight">
                    Trạng thái an toàn - Không có cảnh báo
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={handleCloseSafePopup}
                  className="flex-shrink-0 p-0.5 hover:bg-slate-100 rounded transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Counter Badge - Top Right (near safe zone button) */}
      {dangerAlerts.length > 0 && (
        <div className="fixed top-4 right-16 z-[2001] animate-bounce">
          <div className="relative">
            <div className={`absolute -inset-1 ${hasCriticalAlerts ? 'bg-red-500' : 'bg-amber-500'} rounded-full blur opacity-75 animate-pulse`}></div>
            <div className={`relative ${hasCriticalAlerts ? 'bg-red-500' : 'bg-amber-500'} text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg`}>
              <Bell className="w-3.5 h-3.5 animate-wiggle" />
              <span className={`absolute -top-1 -right-1 bg-white ${hasCriticalAlerts ? 'text-red-500 border-red-500' : 'text-amber-500 border-amber-500'} text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2`}>
                {dangerAlerts.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Danger Popups - Shows up to 3 critical/warning alerts as separate cards */}
      {showDangerPopup && dangerAlerts.length > 0 && (
        <div className="fixed top-4 right-28 z-[2000] space-y-2.5 max-w-xs w-80 animate-slideInRight-container">
          {dangerAlerts.slice(0, 3).map((alert, index) => {
            const isNew = Date.now() - alert.timestamp < 30000; // New if less than 30s old
            
            return (
              <div
                key={alert.id}
                className="animate-slideInRight"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                  alert.severity === 'critical' 
                    ? 'border-red-500/40 shadow-red-100/20' 
                    : 'border-amber-500/40 shadow-amber-100/20'
                }`}>
                  {/* Left severity indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    alert.severity === 'critical' 
                      ? 'bg-gradient-to-b from-red-500 to-rose-600 animate-pulse' 
                      : 'bg-gradient-to-b from-amber-500 to-orange-600'
                  }`}></div>

                  <div className="p-3 pl-4">
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                        alert.severity === 'critical' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${alert.severity === 'critical' ? 'animate-pulse' : ''}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ${
                            alert.severity === 'critical' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {alert.type}
                          </span>
                          {isNew && (
                            <span className="text-[7px] font-extrabold text-green-600 bg-green-100 px-1 py-0.5 rounded animate-pulse">
                              MỚI
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] font-semibold text-slate-800 leading-tight mb-1">
                          {alert.message}
                        </p>

                        <div className="flex items-center gap-2 text-[9px] text-slate-500">
                          <div className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{getRelativeTime(alert.timestamp)}</span>
                          </div>
                          {alert.location && (
                            <button
                              onClick={() => onAlertClick?.(alert)}
                              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              <span>Xem</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="flex-shrink-0 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors self-start"
                        title="Bỏ qua cảnh báo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
