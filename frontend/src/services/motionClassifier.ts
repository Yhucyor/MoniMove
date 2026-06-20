/**
 * Motion Classifier Service
 * AI-based classification of device motion state using sensor fusion
 * Phân loại trạng thái chuyển động: đứng yên, di chuyển, va chạm, ngã
 */

export type MotionState =
  | "stationary" // Đứng yên
  | "walking" // Đi bộ chậm
  | "moving" // Di chuyển bình thường
  | "fast_moving" // Di chuyển nhanh
  | "impact" // Va chạm
  | "fallen" // Ngã đổ
  | "unknown";

export interface MotionClassification {
  state: MotionState;
  confidence: number; // 0–1
  label: string; // Vietnamese label
  severity: "normal" | "warning" | "critical";
  reasons: string[];
}

export interface SensorSnapshot {
  accel?: { x: number; y: number; z: number };
  gyro?: { x: number; y: number; z: number };
  is_tilted?: boolean;
  gpsSpeed?: number; // km/h
  timestamp?: number;
}

// Feature extraction
// Input: accel trong m/s² (như phần cứng ESP32 gửi), gyro trong rad/s
// Normalize accel về đơn vị G để so sánh (1G = 9.81 m/s²)
const G = 9.81;

function extractFeatures(s: SensorSnapshot) {
  // Normalize về G
  const ax = (s.accel?.x ?? 0) / G;
  const ay = (s.accel?.y ?? 0) / G;
  const az = (s.accel?.z ?? G) / G; // ~1G khi đứng thẳng

  const gx = s.gyro?.x ?? 0;
  const gy = s.gyro?.y ?? 0;
  const gz = s.gyro?.z ?? 0;

  const totalAccel = Math.sqrt(ax ** 2 + ay ** 2 + az ** 2);
  const totalGyro = Math.sqrt(gx ** 2 + gy ** 2 + gz ** 2);

  // Tilt angle from vertical (degrees)
  const tiltAngle =
    totalAccel > 0
      ? Math.acos(Math.min(Math.abs(az) / totalAccel, 1)) * (180 / Math.PI)
      : 0;

  // Net accel excluding gravity component (dynamic acceleration)
  const dynamicAccel = Math.abs(totalAccel - 1.0); // 1G là trọng lực

  return {
    totalAccel,
    totalGyro,
    tiltAngle,
    dynamicAccel,
    ax,
    ay,
    az,
    gx,
    gy,
    gz,
  };
}

/**
 * Rule-based classifier with confidence scoring
 * Ưu tiên: fallen > impact > fast_moving > moving > walking > stationary
 */
export function classifyMotion(snapshot: SensorSnapshot): MotionClassification {
  const f = extractFeatures(snapshot);
  const speed = snapshot.gpsSpeed ?? 0;
  const reasons: string[] = [];

  // ── FALLEN ──────────────────────────────────────────────────────────────
  if (snapshot.is_tilted === true || f.tiltAngle > 60) {
    const conf = snapshot.is_tilted
      ? 0.95
      : Math.min(0.5 + (f.tiltAngle - 60) / 60, 0.9);
    reasons.push(`Góc nghiêng ${f.tiltAngle.toFixed(0)}°`);
    if (snapshot.is_tilted) reasons.push("Cảm biến is_tilted=true");
    return {
      state: "fallen",
      confidence: conf,
      label: "Ngã đổ",
      severity: "critical",
      reasons,
    };
  }

  // ── IMPACT ──────────────────────────────────────────────────────────────
  if (f.totalAccel > 2.5 || f.dynamicAccel > 1.5) {
    const conf = Math.min(0.6 + (f.totalAccel - 2.5) / 5, 0.95);
    reasons.push(`Gia tốc tổng ${f.totalAccel.toFixed(2)}G`);
    if (f.totalGyro > 3)
      reasons.push(`Con quay ${f.totalGyro.toFixed(1)} rad/s`);
    return {
      state: "impact",
      confidence: conf,
      label: "Va chạm mạnh",
      severity: "critical",
      reasons,
    };
  }

  // ── FAST MOVING ─────────────────────────────────────────────────────────
  if (speed > 40) {
    reasons.push(`Tốc độ ${speed.toFixed(0)} km/h`);
    return {
      state: "fast_moving",
      confidence: 0.9,
      label: "Di chuyển nhanh",
      severity: speed >= 80 ? "warning" : "normal",
      reasons,
    };
  }

  // ── MOVING (normal) ─────────────────────────────────────────────────────
  if (speed > 5 || f.dynamicAccel > 0.3 || f.totalGyro > 1.0) {
    const conf = Math.min(0.6 + speed / 60 + f.dynamicAccel, 0.9);
    reasons.push(`Tốc độ ${speed.toFixed(0)} km/h`);
    if (f.dynamicAccel > 0.3)
      reasons.push(`Gia tốc động ${f.dynamicAccel.toFixed(2)}G`);
    return {
      state: "moving",
      confidence: conf,
      label: "Đang di chuyển",
      severity: "normal",
      reasons,
    };
  }

  // ── WALKING ─────────────────────────────────────────────────────────────
  if (speed > 1 || f.dynamicAccel > 0.15 || f.totalGyro > 0.5) {
    reasons.push("Rung nhẹ / bước chân");
    return {
      state: "walking",
      confidence: 0.7,
      label: "Đi bộ",
      severity: "normal",
      reasons,
    };
  }

  // ── STATIONARY ──────────────────────────────────────────────────────────
  reasons.push("Gia tốc ổn định, tốc độ = 0");
  return {
    state: "stationary",
    confidence: 0.85,
    label: "Đứng yên",
    severity: "normal",
    reasons,
  };
}

export function getMotionStateColor(state: MotionState): string {
  switch (state) {
    case "fallen":
      return "text-red-600 bg-red-50 border-red-200";
    case "impact":
      return "text-red-500 bg-red-50 border-red-200";
    case "fast_moving":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "moving":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "walking":
      return "text-cyan-600 bg-cyan-50 border-cyan-200";
    case "stationary":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    default:
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

export function getMotionStateIcon(state: MotionState): string {
  switch (state) {
    case "fallen":
      return "🆘";
    case "impact":
      return "💥";
    case "fast_moving":
      return "🏎️";
    case "moving":
      return "🚗";
    case "walking":
      return "🚶";
    case "stationary":
      return "⏸️";
    default:
      return "❓";
  }
}
