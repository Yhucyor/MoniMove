# 🤖 Hệ thống Cảnh báo Tự động - HOÀN THÀNH!

## ✅ Đã tạo

Web giờ sẽ **TỰ ĐỘNG** phân tích dữ liệu từ Firebase và tạo alerts khi phát hiện bất thường!

## 🎯 Các cảnh báo tự động

### 1. 🔴 **Ngã đổ** (Critical)
**Điều kiện**: Góc nghiêng X hoặc Y > 45°
```
Phát hiện: mpu6050.angle_x > 45° hoặc angle_y > 45°
→ Tạo alert: "Cảnh báo nghiêm trọng: Thiết bị bị ngã với góc nghiêng 75°!"
→ Hiệu ứng: Viền đỏ + Âm thanh
→ Cooldown: 60 giây
```

### 2. 🔴 **Va chạm** (Critical)
**Điều kiện**: Gia tốc > 2.5G
```
Phát hiện: sqrt(accel_x² + accel_y² + accel_z²) > 2.5G
→ Tạo alert: "Phát hiện va chạm mạnh với gia tốc 3.2G!"
→ Hiệu ứng: Viền đỏ + Âm thanh
→ Cooldown: 30 giây
```

### 3. 🟡 **Tốc độ cao** (Warning)
**Điều kiện**: Tốc độ > 80 km/h
```
Phát hiện: gps.speed > 80
→ Tạo alert: "Tốc độ hiện tại 95 km/h vượt quá giới hạn!"
→ Hiệu ứng: Notification vàng
→ Cooldown: 120 giây
```

### 4. 🟡 **Pin yếu** (Warning)
**Điều kiện**: Pin < 20%
```
Phát hiện: battery < 20
→ Tạo alert: "Pin thiết bị còn 15%. Cần sạc pin."
→ Cooldown: 300 giây (5 phút)
```

### 5. 🔴 **Pin cực thấp** (Critical)
**Điều kiện**: Pin < 10%
```
Phát hiện: battery < 10
→ Tạo alert: "Pin chỉ còn 8%! Sắp mất kết nối."
→ Hiệu ứng: Viền đỏ + Âm thanh
→ Cooldown: 180 giây
```

### 6. 🟡 **Nhiệt độ cao** (Warning)
**Điều kiện**: Nhiệt độ > 60°C
```
Phát hiện: temperature > 60
→ Tạo alert: "Nhiệt độ thiết bị 65°C quá cao!"
→ Cooldown: 300 giây
```

### 7. 🔵 **Mất GPS** (Info)
**Điều kiện**: Không có tọa độ GPS
```
Phát hiện: !gps.latitude || !gps.longitude
→ Tạo alert: "Thiết bị đang mất tín hiệu GPS."
→ Cooldown: 180 giây
```

### 8. 🔵 **Dừng bất thường** (Info)
**Điều kiện**: Dừng > 10 phút
```
Phát hiện: speed = 0 và timestamp > 10 phút
→ Tạo alert: "Thiết bị đã dừng lại hơn 10 phút."
→ Cooldown: 600 giây
```

## 🚀 Cách hoạt động

```
ESP32 Device
    ↓
Firebase Realtime Database
    ↓ (onValue listener)
Alert Processor Hook
    ↓ (Check 8 rules)
Tự động tạo Alert
    ↓
AlertsOverlay Component
    ↓
Hiển thị cho User!
```

## 📊 Data Structure Expected

Để alert processor hoạt động, Firebase cần có cấu trúc:

```json
tracking_system/
└── devices/
    └── DEVICE_ESP32_01/
        └── current_data/
            ├── gps/
            │   ├── latitude: 10.8045
            │   ├── longitude: 106.7380
            │   ├── speed: 45
            │   └── heading: 180
            ├── mpu6050/
            │   ├── angle_x: 15.5
            │   ├── angle_y: 8.2
            │   ├── angle_z: 2.1
            │   ├── accel_x: 0.5
            │   ├── accel_y: 0.3
            │   └── accel_z: 1.0
            ├── battery: 85
            ├── temperature: 35.5
            ├── humidity: 65
            └── timestamp: 1735654800000
```

## 🧪 Test thực tế

### Scenario 1: Test ngã đổ

Cập nhật Firebase:
```json
tracking_system/devices/DEVICE_ESP32_01/current_data/mpu6050/angle_x: 60
```

→ **Kết quả**: Sau 5 giây, alert tự động xuất hiện với viền đỏ!

### Scenario 2: Test tốc độ cao

Cập nhật Firebase:
```json
tracking_system/devices/DEVICE_ESP32_01/current_data/gps/speed: 95
```

→ **Kết quả**: Alert vàng "Tốc độ 95 km/h vượt quá giới hạn!"

### Scenario 3: Test pin yếu

Cập nhật Firebase:
```json
tracking_system/devices/DEVICE_ESP32_01/current_data/battery: 15
```

→ **Kết quả**: Alert vàng "Pin còn 15%"

### Scenario 4: Test va chạm

Cập nhật Firebase:
```json
tracking_system/devices/DEVICE_ESP32_01/current_data/mpu6050:
  accel_x: 2.5
  accel_y: 1.8
  accel_z: 1.2
```

→ **Kết quả**: Alert đỏ "Phát hiện va chạm mạnh!"

## 🔧 Tùy chỉnh Rules

### Thay đổi ngưỡng

Mở `alertProcessor.ts`:

```typescript
// Thay đổi ngưỡng ngã đổ từ 45° sang 30°
{
  type: 'Ngã đổ',
  condition: (data) => {
    const angleX = Math.abs(data.mpu6050?.angle_x || 0);
    const angleY = Math.abs(data.mpu6050?.angle_y || 0);
    return angleX > 30 || angleY > 30; // ← Thay đổi tại đây
  },
  // ...
}

// Thay đổi ngưỡng tốc độ từ 80 sang 60
{
  type: 'Cảnh báo tốc độ',
  condition: (data) => (data.gps?.speed || 0) > 60, // ← Thay đổi
  // ...
}
```

### Thêm rule mới

```typescript
const ALERT_RULES: AlertRule[] = [
  // ... existing rules
  
  // Rule mới: Độ ẩm cao
  {
    type: 'Độ ẩm cao',
    severity: 'warning',
    condition: (data) => (data.humidity || 0) > 80,
    message: (data) => 
      `Độ ẩm ${data.humidity}% quá cao! Có thể ảnh hưởng thiết bị.`,
    cooldown: 300,
  },
];
```

### Thay đổi cooldown

```typescript
{
  type: 'Ngã đổ',
  // ...
  cooldown: 60, // 60 giây → Thay đổi thành 30, 120, etc.
}
```

## ⚙️ Cooldown System

**Cooldown** ngăn spam alerts:

- **Ngã đổ**: 60s - Không tạo alert mới nếu < 60s
- **Va chạm**: 30s 
- **Tốc độ**: 120s (2 phút)
- **Pin yếu**: 300s (5 phút)
- **Nhiệt độ**: 300s

→ Giúp tránh quá nhiều notifications!

## 🗑️ Auto Cleanup

Hệ thống **tự động xóa** alerts cũ > 7 ngày mỗi 1 giờ.

```typescript
// Trong useAlertProcessor.ts
cleanupOldAlerts(); // Chạy mỗi 1 giờ
```

## 📱 Features Bổ sung

### Mark as Read

```typescript
import { markAlertAsRead } from '../services/alertProcessor';

// Mark alert đã đọc
await markAlertAsRead('alert_id_here');
```

### Get Unread Count

```typescript
import { getUnreadAlertsCount } from '../services/alertProcessor';

// Đếm số alerts chưa đọc
const count = await getUnreadAlertsCount('DEVICE_ESP32_01');
console.log(`${count} unread alerts`);
```

## 🐛 Debug

### Check processor đang chạy

Mở Console (F12):
```
Tìm: "🔍 Alert processor started for device: DEVICE_ESP32_01"
```

### Check alerts được tạo

```
Tìm: "✅ Alert created: Ngã đổ for DEVICE_ESP32_01"
```

### Check Firebase structure

Vào Firebase Console → Realtime Database:
```
tracking_system/
├── devices/DEVICE_ESP32_01/current_data/ ← Phải có data ở đây
└── alerts/ ← Alerts tự động xuất hiện ở đây
```

## ✅ Kết luận

**Hệ thống tự động hoàn chỉnh!**

✅ Web tự động phân tích dữ liệu  
✅ Tự động tạo 8 loại alerts  
✅ Cooldown chống spam  
✅ Auto cleanup alerts cũ  
✅ Mark as read  
✅ Unread count  
✅ Build thành công  

**Chỉ cần ESP32 gửi data → Alerts tự động xuất hiện! 🚀**

---

**Version**: 2.0.0 - Auto Alert System  
**Date**: 2026-05-30  
**Status**: ✅ Production Ready  
**Author**: Kiro AI Assistant
