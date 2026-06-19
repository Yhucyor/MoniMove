'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X, User, Mail, Shield, Cpu, Calendar, MapPin, Clock, Navigation,
    ChevronLeft, ChevronRight, RefreshCw, Map, AlertTriangle,
} from 'lucide-react';
import { UserProfile, getPositionHistory, getAlertsHistory, AlertLog, DevicePosition } from '../../services/api';

interface UserDetailModalProps {
    user: UserProfile;
    onClose: () => void;
}

type TabId = 'info' | 'location' | 'history';

// Inline mini-map using Leaflet (dynamic import)
function GpsHistoryMap({ points, deviceId }: { points: DevicePosition[]; deviceId: string }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || typeof window === 'undefined' || points.length === 0) return;

        Promise.all([import('leaflet')]).then(([L]) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const center: [number, number] = [points[points.length - 1].lat, points[points.length - 1].lng];
            const map = L.map(mapRef.current!, { center, zoom: 14, zoomControl: true });
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            if (points.length > 1) {
                L.polyline(points.map(p => [p.lat, p.lng] as [number, number]), {
                    color: '#00b494', weight: 3, opacity: 0.8,
                }).addTo(map);
            }

            // Start marker
            const startIcon = L.divIcon({
                html: `<div style="width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #22c55e40"></div>`,
                iconSize: [12, 12], iconAnchor: [6, 6], className: '',
            });
            // End marker
            const endIcon = L.divIcon({
                html: `<div style="width:16px;height:16px;background:#f59e0b;border-radius:50%;border:2px solid white;box-shadow:0 0 0 3px #f59e0b30"></div>`,
                iconSize: [16, 16], iconAnchor: [8, 8], className: '',
            });

            if (points.length > 0) {
                L.marker([points[0].lat, points[0].lng], { icon: startIcon })
                    .addTo(map).bindPopup('Xuất phát');
                L.marker([points[points.length - 1].lat, points[points.length - 1].lng], { icon: endIcon })
                    .addTo(map).bindPopup('Điểm cuối / Vị trí mới nhất').openPopup();
            }

            if (points.length > 1) {
                const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [points]);

    if (points.length === 0) {
        return (
            <div className="h-64 rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-2 border border-slate-200">
                <Map className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-semibold text-slate-400">Không có dữ liệu GPS</p>
            </div>
        );
    }

    return <div ref={mapRef} className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200" />;
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>(user.deviceIds[0] || '');
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [historyPoints, setHistoryPoints] = useState<DevicePosition[]>([]);
    const [alerts, setAlerts] = useState<AlertLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'info', label: 'Tài khoản', icon: User },
        { id: 'location', label: 'Vị trí & Lịch sử GPS', icon: MapPin },
        { id: 'history', label: 'Lịch sử sự cố', icon: AlertTriangle },
    ];

    // Load GPS history when tab/device/date changes
    useEffect(() => {
        if (activeTab !== 'location' || !selectedDeviceId) return;
        setLoadingHistory(true);
        const [y, mo, d] = selectedDate.split('-').map(Number);
        const start = new Date(y, mo - 1, d, 0, 0, 0).getTime();
        const end = new Date(y, mo - 1, d, 23, 59, 59).getTime();
        getPositionHistory(selectedDeviceId, start, end)
            .then(pts => setHistoryPoints(pts))
            .catch(() => setHistoryPoints([]))
            .finally(() => setLoadingHistory(false));
    }, [activeTab, selectedDeviceId, selectedDate]);

    // Load alerts when tab/device changes
    useEffect(() => {
        if (activeTab !== 'history') return;
        setLoadingAlerts(true);
        setCurrentPage(1);
        const deviceToFetch = selectedDeviceId || undefined;
        getAlertsHistory(deviceToFetch)
            .then(data => setAlerts(data))
            .catch(() => setAlerts([]))
            .finally(() => setLoadingAlerts(false));
    }, [activeTab, selectedDeviceId]);

    const totalAlertPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
    const pagedAlerts = alerts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
        : 'U';

    const formatDate = (iso: string) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return iso; }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">

                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur-md opacity-20" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-lg shadow-sm">
                                {initials}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">{user.name}</h2>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                </div>

                {/* ─── Tab bar ─── */}
                <div className="flex gap-1 px-6 pt-3 pb-0 shrink-0 border-b border-slate-100">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${activeTab === tab.id
                                        ? 'text-purple-600 border-purple-500 bg-purple-50/50'
                                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Body ─── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* ── TAB: Thông tin tài khoản ── */}
                    {activeTab === 'info' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Info rows */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
                                {[
                                    { icon: User, label: 'Họ tên', value: user.name || '—' },
                                    { icon: Mail, label: 'Email', value: user.email },
                                    {
                                        icon: Shield, label: 'Quyền hạn', value: user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Người dùng (User)',
                                        badge: user.role === 'admin' ? 'amber' : 'blue',
                                    },
                                    { icon: Calendar, label: 'Ngày tạo', value: formatDate(user.createdAt) },
                                    { icon: Cpu, label: 'Số thiết bị', value: `${user.deviceIds.length} thiết bị được cấp phép` },
                                ].map(row => (
                                    <div key={row.label} className="flex items-center gap-4 px-5 py-3.5">
                                        <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                            <row.icon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{row.label}</p>
                                            {row.badge ? (
                                                <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${row.badge === 'amber'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                        : 'bg-blue-50 text-blue-600 border-blue-200'
                                                    }`}>
                                                    {row.value}
                                                </span>
                                            ) : (
                                                <p className="text-sm font-semibold text-slate-800 truncate">{row.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Device IDs */}
                            {user.deviceIds.length > 0 && (
                                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                        <Cpu className="h-3.5 w-3.5" /> Thiết bị được cấp phép
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.deviceIds.map(id => (
                                            <span key={id} className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
                                                <Cpu className="h-3 w-3" />
                                                {id}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: Vị trí & Lịch sử GPS ── */}
                    {activeTab === 'location' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {user.deviceIds.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                    <Cpu className="h-8 w-8 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Người dùng này chưa có thiết bị</p>
                                    <p className="text-xs text-slate-400 mt-1">Gán thiết bị ở tab Quản lý tài khoản</p>
                                </div>
                            ) : (
                                <>
                                    {/* Controls row */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Device selector */}
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Thiết bị</label>
                                            <select
                                                value={selectedDeviceId}
                                                onChange={e => setSelectedDeviceId(e.target.value)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                                            >
                                                {user.deviceIds.map(id => (
                                                    <option key={id} value={id}>{id}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Date picker */}
                                        <div className="flex flex-col gap-1 flex-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ngày</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={e => setSelectedDate(e.target.value)}
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Stats strip */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Số điểm GPS', value: loadingHistory ? '...' : historyPoints.length.toString() },
                                            {
                                                label: 'Tốc độ TB',
                                                value: loadingHistory || historyPoints.length === 0
                                                    ? '—'
                                                    : `${(historyPoints.reduce((s, p) => s + (p.speed ?? 0), 0) / historyPoints.length).toFixed(1)} km/h`,
                                            },
                                            {
                                                label: 'Lần cập nhật cuối',
                                                value: historyPoints.length > 0
                                                    ? new Date(historyPoints[historyPoints.length - 1].timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                                    : '—',
                                            },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                                                <p className="text-lg font-black text-slate-800 mt-0.5">{s.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Map */}
                                    {loadingHistory ? (
                                        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
                                            <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
                                        </div>
                                    ) : (
                                        <GpsHistoryMap points={historyPoints} deviceId={selectedDeviceId} />
                                    )}

                                    {/* GPS timeline */}
                                    {!loadingHistory && historyPoints.length > 0 && (
                                        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">Chi tiết hành trình ({historyPoints.length} điểm)</span>
                                            </div>
                                            <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                                                {historyPoints.slice().reverse().map((pt, i) => (
                                                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                                                        <div className="h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-mono text-slate-600">
                                                                {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            {pt.speed !== undefined && (
                                                                <span className={`text-[10px] font-bold ${pt.speed > 60 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                                    {pt.speed.toFixed(0)} km/h
                                                                </span>
                                                            )}
                                                            <p className="text-[10px] text-slate-400">
                                                                {new Date(pt.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── TAB: Lịch sử sự cố ── */}
                    {activeTab === 'history' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Device filter */}
                            {user.deviceIds.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <label className="text-xs font-bold text-slate-500 shrink-0">Lọc theo thiết bị:</label>
                                    <select
                                        value={selectedDeviceId}
                                        onChange={e => setSelectedDeviceId(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-sm flex-1 max-w-xs"
                                    >
                                        {user.deviceIds.map(id => (
                                            <option key={id} value={id}>{id}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {loadingAlerts ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                    <Navigation className="h-8 w-8 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Không có sự cố nào</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Tổng <span className="font-bold text-slate-600">{alerts.length}</span> sự cố
                                    </p>
                                    <div className="space-y-2">
                                        {pagedAlerts.map(alert => (
                                            <div key={alert.id} className="rounded-xl border border-slate-100 bg-white p-3.5 flex items-start gap-3 hover:border-amber-200 transition-colors">
                                                <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-amber-600">{alert.alertType}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{alert.deviceId}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">{alert.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {new Date(alert.timestamp).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalAlertPages > 1 && (
                                        <div className="flex items-center justify-between pt-1">
                                            <p className="text-xs text-slate-400">Trang {currentPage} / {totalAlertPages}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="h-8 w-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalAlertPages, p + 1))}
                                                    disabled={currentPage === totalAlertPages}
                                                    className="h-8 w-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
