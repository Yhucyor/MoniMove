'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    Shield, Plus, Trash2, MapPin, AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';
import {
    GeoZone, addZone, deleteZone, getZonesForDevice,
    checkGeofenceViolations, haversineDistance,
} from '../../services/geofencing';
import { useMyDevices } from '../../hooks/useMyDevices';
import { useNotifications } from '../../contexts/NotificationContext';
import { subscribeDevicePosition } from '../../services/firebaseRealtime';

const GeofenceMap = dynamic(() => import('./GeofenceMap'), { ssr: false });

export default function GeofencingTab() {
    const { devices, primaryDeviceId } = useMyDevices();
    const { notify } = useNotifications();
    const [deviceId, setDeviceId] = useState<string>('');
    const [zones, setZones] = useState<GeoZone[]>([]);
    const [violations, setViolations] = useState<GeoZone[]>([]);
    const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', radiusMeters: 500 });
    const [pickingCenter, setPickingCenter] = useState(false);
    const [pickedCenter, setPickedCenter] = useState<{ lat: number; lng: number } | null>(null);
    // Throttle geofence notifications — chống spam mỗi 60s/zone
    const lastNotifyRef = useRef<Record<string, number>>({});

    // Sync deviceId khi primaryDeviceId available
    useEffect(() => {
        if (primaryDeviceId && !deviceId) setDeviceId(primaryDeviceId);
    }, [primaryDeviceId, deviceId]);

    const reload = useCallback(() => {
        if (!deviceId) return;
        setZones(getZonesForDevice(deviceId));
    }, [deviceId]);

    useEffect(() => {
        reload();
    }, [reload]);

    // Subscribe to realtime position
    useEffect(() => {
        if (!deviceId) return;
        const unsub = subscribeDevicePosition(deviceId, (pos) => {
            setCurrentPos({ lat: pos.lat, lng: pos.lng });

            // Check geofence violations
            const violated = checkGeofenceViolations(deviceId, pos.lat, pos.lng);
            setViolations(violated);

            if (violated.length > 0) {
                const now = Date.now();
                violated.forEach((zone) => {
                    const lastTime = lastNotifyRef.current[zone.id] || 0;
                    if (now - lastTime < 60_000) return; // throttle 60s per zone
                    lastNotifyRef.current[zone.id] = now;
                    const dist = haversineDistance(zone.centerLat, zone.centerLng, pos.lat, pos.lng);
                    notify({
                        type: 'warning',
                        title: '⚠️ Ra khỏi vùng an toàn',
                        message: `Thiết bị đã rời khỏi vùng "${zone.name}" (cách ${Math.round(dist)}m).`,
                        deviceId,
                    });
                });
            }
        });
        return () => unsub();
    }, [deviceId, notify]);

    const handleAddZone = () => {
        const center = pickedCenter ?? currentPos;
        if (!center) {
            alert('Chưa có vị trí. Chờ GPS hoặc chọn điểm trên bản đồ.');
            return;
        }
        addZone({
            name: form.name || `Vùng ${zones.length + 1}`,
            centerLat: center.lat,
            centerLng: center.lng,
            radiusMeters: form.radiusMeters,
            deviceId,
        });
        setForm({ name: '', radiusMeters: 500 });
        setShowForm(false);
        setPickedCenter(null);
        setPickingCenter(false);
        reload();
    };

    const handleDelete = (id: string) => {
        deleteZone(id);
        reload();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-[#00b494]" />
                        Geofencing — Vùng An Toàn
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
                        Cảnh báo tự động khi thiết bị ra khỏi khu vực cho phép.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {devices.length > 1 && (
                        <select
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                            {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    )}
                    <button
                        onClick={() => { setShowForm(!showForm); setPickingCenter(false); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#12a1c0] to-[#00b494] px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm vùng
                    </button>
                </div>
            </div>

            {/* Violation banner */}
            {violations.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-700">Cảnh báo vi phạm vùng!</p>
                        <p className="text-xs text-red-600 mt-0.5">
                            Thiết bị đã ra khỏi: {violations.map((v) => v.name).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {violations.length === 0 && zones.length > 0 && currentPos && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    <p className="text-sm font-semibold text-emerald-700">Thiết bị đang trong vùng an toàn.</p>
                </div>
            )}

            {/* Add zone form */}
            {showForm && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800">Tạo vùng an toàn mới</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Tên vùng</label>
                            <input
                                type="text"
                                placeholder="VD: Trường học, Khu dân cư..."
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#00b494] focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                                Bán kính: {form.radiusMeters}m
                            </label>
                            <input
                                type="range"
                                min="50" max="5000" step="50"
                                value={form.radiusMeters}
                                onChange={(e) => setForm({ ...form, radiusMeters: Number(e.target.value) })}
                                className="w-full accent-[#00b494]"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                <span>50m</span><span>5km</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                            {pickedCenter ? (
                                <span className="text-emerald-600 font-semibold">
                                    ✓ Đã chọn: {pickedCenter.lat.toFixed(5)}, {pickedCenter.lng.toFixed(5)}
                                </span>
                            ) : currentPos ? (
                                <span>Dùng vị trí GPS hiện tại: {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}</span>
                            ) : (
                                <span className="text-amber-600">Đang chờ GPS...</span>
                            )}
                        </div>
                        <button
                            onClick={() => setPickingCenter(!pickingCenter)}
                            className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${pickingCenter
                                ? 'border-[#00b494] bg-[#00b494]/10 text-[#00b494]'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <MapPin className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => { setShowForm(false); setPickingCenter(false); setPickedCenter(null); }}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAddZone}
                            className="rounded-xl bg-gradient-to-r from-[#12a1c0] to-[#00b494] px-4 py-2 text-xs font-bold text-white hover:brightness-105"
                        >
                            Tạo vùng
                        </button>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-64 sm:h-80">
                    <GeofenceMap
                        zones={zones}
                        currentPos={currentPos}
                        pickingCenter={pickingCenter}
                        onPickCenter={(lat, lng) => {
                            setPickedCenter({ lat, lng });
                            setPickingCenter(false);
                        }}
                    />
                </div>
            </div>

            {/* Zone list */}
            {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-2xl text-center">
                    <Shield className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">Chưa có vùng an toàn nào. Nhấn "Thêm vùng" để tạo.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Danh sách vùng ({zones.length})</h3>
                    {zones.map((zone) => {
                        const isViolating = violations.some((v) => v.id === zone.id);
                        const dist = currentPos
                            ? haversineDistance(zone.centerLat, zone.centerLng, currentPos.lat, currentPos.lng)
                            : null;

                        return (
                            <div
                                key={zone.id}
                                className={`flex items-center justify-between rounded-2xl border p-4 ${isViolating ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${isViolating ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{zone.name}</p>
                                        <p className="text-[10px] text-slate-400">
                                            Bán kính {zone.radiusMeters}m ·{' '}
                                            {zone.centerLat.toFixed(4)}, {zone.centerLng.toFixed(4)}
                                            {dist !== null && ` · Cách ${Math.round(dist)}m`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(zone.id)}
                                    className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-500 hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
