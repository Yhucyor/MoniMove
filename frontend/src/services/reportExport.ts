/**
 * Report Export Service
 * Xuất báo cáo hoạt động theo ngày/tuần/tháng dạng CSV hoặc JSON
 */

import type { DevicePosition, AlertLog } from './api';

export type ReportRange = 'day' | 'week' | 'month';

export interface ActivityReport {
    deviceId: string;
    range: ReportRange;
    from: number;
    to: number;
    totalPoints: number;
    totalDistanceKm: number;
    avgSpeedKmh: number;
    maxSpeedKmh: number;
    activeTimeMinutes: number;
    stationaryTimeMinutes: number;
    alertCount: number;
    alertsByType: Record<string, number>;
    positions: DevicePosition[];
    alerts: AlertLog[];
}

export function buildReport(
    deviceId: string,
    range: ReportRange,
    positions: DevicePosition[],
    alerts: AlertLog[],
): ActivityReport {
    const now = Date.now();
    const rangeMs: Record<ReportRange, number> = {
        day: 86400000,
        week: 604800000,
        month: 2592000000,
    };
    const from = now - rangeMs[range];
    const filtered = positions.filter((p) => p.timestamp >= from && p.timestamp <= now);
    const filteredAlerts = alerts.filter((a) => a.timestamp >= from && a.timestamp <= now);

    // Calculate total distance
    let totalDistanceKm = 0;
    for (let i = 1; i < filtered.length; i++) {
        const p1 = filtered[i - 1];
        const p2 = filtered[i];
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((p1.lat * Math.PI) / 180) *
            Math.cos((p2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        totalDistanceKm += (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    const speeds = filtered.map((p) => p.speed ?? 0);
    const avgSpeedKmh = speeds.length > 0 ? speeds.reduce((s, v) => s + v, 0) / speeds.length : 0;
    const maxSpeedKmh = speeds.length > 0 ? Math.max(...speeds) : 0;

    // Active vs stationary (speed threshold 2 km/h)
    const activePoints = filtered.filter((p) => (p.speed ?? 0) > 2).length;
    const stationaryPoints = filtered.length - activePoints;
    const totalMins = filtered.length > 0 ? (filtered[filtered.length - 1].timestamp - filtered[0].timestamp) / 60000 : 0;
    const activeTimeMinutes = filtered.length > 0 ? (activePoints / filtered.length) * totalMins : 0;
    const stationaryTimeMinutes = totalMins - activeTimeMinutes;

    // Alerts by type
    const alertsByType: Record<string, number> = {};
    filteredAlerts.forEach((a) => {
        const t = a.alertType || 'unknown';
        alertsByType[t] = (alertsByType[t] ?? 0) + 1;
    });

    return {
        deviceId,
        range,
        from,
        to: now,
        totalPoints: filtered.length,
        totalDistanceKm,
        avgSpeedKmh,
        maxSpeedKmh,
        activeTimeMinutes,
        stationaryTimeMinutes,
        alertCount: filteredAlerts.length,
        alertsByType,
        positions: filtered,
        alerts: filteredAlerts,
    };
}

/** Xuất CSV */
export function exportReportCsv(report: ActivityReport): void {
    const lines: string[] = [];
    const rangeLabel = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }[report.range];
    const dateStr = new Date(report.from).toLocaleDateString('vi-VN');

    lines.push(`Báo cáo hoạt động MoniMove - ${rangeLabel} ${dateStr}`);
    lines.push(`Thiết bị,${report.deviceId}`);
    lines.push(`Từ,${new Date(report.from).toLocaleString('vi-VN')}`);
    lines.push(`Đến,${new Date(report.to).toLocaleString('vi-VN')}`);
    lines.push(`Tổng điểm GPS,${report.totalPoints}`);
    lines.push(`Tổng quãng đường (km),${report.totalDistanceKm.toFixed(2)}`);
    lines.push(`Tốc độ TB (km/h),${report.avgSpeedKmh.toFixed(1)}`);
    lines.push(`Tốc độ tối đa (km/h),${report.maxSpeedKmh.toFixed(1)}`);
    lines.push(`Thời gian di chuyển (phút),${report.activeTimeMinutes.toFixed(0)}`);
    lines.push(`Thời gian đứng yên (phút),${report.stationaryTimeMinutes.toFixed(0)}`);
    lines.push(`Tổng sự cố,${report.alertCount}`);
    lines.push('');
    lines.push('Sự cố theo loại');
    Object.entries(report.alertsByType).forEach(([type, count]) => {
        lines.push(`${type},${count}`);
    });
    lines.push('');
    lines.push('Lịch sử GPS');
    lines.push('Thời gian,Vĩ độ,Kinh độ,Tốc độ (km/h)');
    report.positions.forEach((p) => {
        lines.push(`${new Date(p.timestamp).toLocaleString('vi-VN')},${p.lat},${p.lng},${(p.speed ?? 0).toFixed(1)}`);
    });

    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monimove_${report.deviceId}_${report.range}_${dateStr.replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/** Xuất JSON */
export function exportReportJson(report: ActivityReport): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monimove_${report.deviceId}_${report.range}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
