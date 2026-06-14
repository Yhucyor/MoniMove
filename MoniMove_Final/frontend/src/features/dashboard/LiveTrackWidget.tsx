'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation, Gauge, Route, RefreshCw } from 'lucide-react';
import { getTracker, resetTracker } from '../../services/realtimeTracker';
import { subscribeDevicePosition } from '../../services/firebaseRealtime';

interface Props {
    deviceId: string;
}

export default function LiveTrackWidget({ deviceId }: Props) {
    const [stats, setStats] = useState({
        points: 0,
        distanceKm: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        durationMin: 0,
    });
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!deviceId) return;
        const tracker = getTracker(deviceId);
        startTimeRef.current = Date.now();

        const unsub = subscribeDevicePosition(deviceId, (pos) => {
            tracker.addPoint(pos.lat, pos.lng, pos.speed ?? 0);

            const durationMin = (Date.now() - startTimeRef.current) / 60000;
            setStats({
                points: tracker.length,
                distanceKm: tracker.getTotalDistance(),
                avgSpeed: tracker.getAvgSpeed(),
                maxSpeed: tracker.getMaxSpeed(),
                durationMin,
            });
        });

        return () => {
            unsub();
        };
    }, [deviceId]);

    const handleReset = () => {
        resetTracker(deviceId);
        startTimeRef.current = Date.now();
        setStats({ points: 0, distanceKm: 0, avgSpeed: 0, maxSpeed: 0, durationMin: 0 });
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Route className="h-4 w-4 text-[#00b494]" />
                    Live Track (phiên hiện tại)
                </h3>
                <button
                    onClick={handleReset}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1"
                >
                    <RefreshCw className="h-3 w-3" />
                    Reset
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Điểm GPS</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{stats.points}</p>
                </div>
                <div className="rounded-xl bg-[#00b494]/5 border border-[#00b494]/20 p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-[#00b494]/70 tracking-wider">Quãng đường</p>
                    <p className="text-lg font-black text-[#00b494] mt-0.5">{stats.distanceKm.toFixed(2)}</p>
                    <p className="text-[8px] text-[#00b494]/60 font-semibold">km</p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-blue-400 tracking-wider flex items-center justify-center gap-0.5">
                        <Gauge className="h-2.5 w-2.5" /> Tốc độ TB
                    </p>
                    <p className="text-lg font-black text-blue-600 mt-0.5">{stats.avgSpeed.toFixed(0)}</p>
                    <p className="text-[8px] text-blue-400 font-semibold">km/h</p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-amber-400 tracking-wider flex items-center justify-center gap-0.5">
                        <Navigation className="h-2.5 w-2.5" /> Tốc độ Max
                    </p>
                    <p className={`text-lg font-black mt-0.5 ${stats.maxSpeed >= 80 ? 'text-red-500' : 'text-amber-600'}`}>
                        {stats.maxSpeed.toFixed(0)}
                    </p>
                    <p className="text-[8px] text-amber-400 font-semibold">km/h</p>
                </div>
            </div>

            {stats.points > 0 && (
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang ghi hành trình · {Math.floor(stats.durationMin)}p {Math.floor((stats.durationMin % 1) * 60)}s
                </div>
            )}
        </div>
    );
}
