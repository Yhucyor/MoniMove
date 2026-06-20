'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../core/config/firebase';
import {
    classifyMotion,
    getMotionStateColor,
    getMotionStateIcon,
    type MotionClassification,
} from '../../services/motionClassifier';
import { Activity } from 'lucide-react';

interface Props {
    deviceId: string;
}

export default function MotionStatusCard({ deviceId }: Props) {
    const [motion, setMotion] = useState<MotionClassification | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number | null>(null);

    useEffect(() => {
        if (!deviceId) return;
        const deviceRef = ref(db, `tracking_system/devices/${deviceId}/current_data`);

        const handler = onValue(deviceRef, (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.val();

            const classification = classifyMotion({
                accel: data.mpu6050?.accel,
                gyro: data.mpu6050?.gyro,
                is_tilted: data.mpu6050?.is_tilted,
                gpsSpeed: data.gps?.speed,
                timestamp: data.timestamp,
            });

            setMotion(classification);
            setLastUpdate(Date.now());
        });

        return () => off(deviceRef, 'value', handler);
    }, [deviceId]);

    if (!motion) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-8 w-24 bg-slate-100 rounded" />
            </div>
        );
    }

    const colorClass = getMotionStateColor(motion.state);
    const icon = getMotionStateIcon(motion.state);

    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${colorClass}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Trạng thái chuyển động</span>
                </div>
                {lastUpdate && (
                    <span className="text-[9px] opacity-60">
                        {new Date(lastUpdate).toLocaleTimeString('vi-VN')}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <div>
                    <p className="text-base font-extrabold">{motion.label}</p>
                    <p className="text-[10px] opacity-70">Độ tin cậy: {(motion.confidence * 100).toFixed(0)}%</p>
                </div>
            </div>

            {motion.reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {motion.reasons.map((r, i) => (
                        <span key={i} className="inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold bg-white/50 border border-current/20">
                            {r}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
