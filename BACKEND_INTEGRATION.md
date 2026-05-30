# 🔌 HƯỚNG DẪN KẾT NỐI BACKEND - FRONTEND

## ✅ ĐÃ TẠO API SERVICE!

Frontend giờ đây có thể kết nối với Backend để lấy dữ liệu thực tế!

---

## 📁 CẤU TRÚC:

```
frontend/
├── src/
│   └── services/
│       └── api.ts          ← API Service (mới tạo)
├── .env.local              ← Cấu hình API URL
└── src/features/dashboard/
    └── MapComponent.tsx    ← Đã cập nhật để dùng API
```

---

## 🎯 API ENDPOINTS CẦN:

Backend cần cung cấp các endpoints sau:

### **1. Lấy vị trí hiện tại**
```
GET /api/devices/{deviceId}/position
```

**Response:**
```json
{
  "lat": 10.8100,
  "lng": 106.7400,
  "timestamp": 1234567890,
  "speed": 45,
  "heading": 90
}
```

### **2. Lấy lộ trình**
```
GET /api/devices/{deviceId}/route
```

**Response:**
```json
{
  "deviceId": "device-001",
  "waypoints": [
    [10.7769, 106.7009],
    [10.7850, 106.7100],
    [10.8100, 106.7400]
  ],
  "distance": 12500,
  "duration": 1080
}
```

### **3. Lấy thông tin thiết bị**
```
GET /api/devices/{deviceId}
```

**Response:**
```json
{
  "id": "device-001",
  "name": "MoniMove - 01",
  "status": "active",
  "battery": 85,
  "lastUpdate": 1234567890
}
```

### **4. Lấy lịch sử vị trí**
```
GET /api/devices/{deviceId}/history?start={timestamp}&end={timestamp}
```

**Response:**
```json
[
  {
    "lat": 10.7769,
    "lng": 106.7009,
    "timestamp": 1234567890,
    "speed": 40
  },
  ...
]
```

### **5. Gửi cảnh báo**
```
POST /api/alerts
```

**Body:**
```json
{
  "deviceId": "device-001",
  "alertType": "collision",
  "message": "Phát hiện va chạm!",
  "timestamp": 1234567890
}
```

---

## ⚙️ CẤU HÌNH:

### **Bước 1: Cập nhật API URL**

Mở file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Thay đổi URL theo backend của bạn:
- Local: `http://localhost:3001/api`
- Production: `https://your-backend.com/api`

### **Bước 2: Restart server**
```bash
# Stop server (Ctrl + C)
npm run build
npm start
```

---

## 🔄 CÁCH HOẠT ĐỘNG:

### **1. Khi component mount:**
```typescript
useEffect(() => {
  // Lấy thông tin thiết bị
  const deviceInfo = await getDeviceInfo(deviceId);
  
  // Lấy vị trí hiện tại
  const position = await getCurrentPosition(deviceId);
  
  // Lấy lộ trình
  const route = await getDeviceRoute(deviceId);
}, []);
```

### **2. Real-time update (mỗi 5 giây):**
```typescript
setInterval(async () => {
  const position = await getCurrentPosition(deviceId);
  setCurrentPosition([position.lat, position.lng]);
}, 5000);
```

### **3. Tính đường đi thực tế:**
```typescript
// Lấy waypoints từ backend
const route = await getDeviceRoute(deviceId);

// Gọi OSRM để tính đường đi theo đường phố
const osrmResponse = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}`);
```

---

## 🛠️ BACKEND EXAMPLE (Node.js/Express):

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const devices = {
  'device-001': {
    id: 'device-001',
    name: 'MoniMove - 01',
    status: 'active',
    position: { lat: 10.8100, lng: 106.7400, speed: 45 },
    route: {
      waypoints: [
        [10.7769, 106.7009],
        [10.7850, 106.7100],
        [10.8100, 106.7400]
      ]
    }
  }
};

// Get device info
app.get('/api/devices/:deviceId', (req, res) => {
  const device = devices[req.params.deviceId];
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

// Get current position
app.get('/api/devices/:deviceId/position', (req, res) => {
  const device = devices[req.params.deviceId];
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json({
    ...device.position,
    timestamp: Date.now()
  });
});

// Get route
app.get('/api/devices/:deviceId/route', (req, res) => {
  const device = devices[req.params.deviceId];
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json({
    deviceId: device.id,
    waypoints: device.route.waypoints,
    distance: 12500,
    duration: 1080
  });
});

// Send alert
app.post('/api/alerts', (req, res) => {
  console.log('Alert received:', req.body);
  res.json({ success: true, alertId: Date.now() });
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
```

---

## 🔥 FIREBASE REALTIME DATABASE:

Nếu dùng Firebase:

```typescript
import { getDatabase, ref, onValue } from 'firebase/database';

// Lắng nghe vị trí real-time
const db = getDatabase();
const positionRef = ref(db, `devices/${deviceId}/position`);

onValue(positionRef, (snapshot) => {
  const data = snapshot.val();
  setCurrentPosition([data.lat, data.lng]);
  setSpeed(data.speed);
});
```

---

## 📊 FALLBACK DATA:

Nếu backend chưa sẵn sàng, API service sẽ tự động dùng fallback data:

```typescript
// Trong api.ts
catch (error) {
  console.error('Error:', error);
  // Trả về data mẫu
  return {
    lat: 10.8100,
    lng: 106.7400,
    timestamp: Date.now()
  };
}
```

---

## 🐛 DEBUG:

### **Kiểm tra API có hoạt động:**
```bash
# Test endpoint
curl http://localhost:3001/api/devices/device-001
```

### **Xem Console log:**
```typescript
// Trong MapComponent
console.log('Device info:', deviceInfo);
console.log('Position:', position);
console.log('Route:', route);
```

### **Kiểm tra Network tab:**
1. Mở F12 → Network
2. Refresh trang
3. Xem các request đến backend

---

## 🎯 CHECKLIST:

- [ ] Backend đang chạy
- [ ] CORS đã được enable
- [ ] API URL đã cấu hình đúng trong `.env.local`
- [ ] Endpoints trả về đúng format
- [ ] Frontend đã restart sau khi đổi `.env.local`

---

## 💡 TIPS:

### **1. Proxy để tránh CORS:**
Trong `next.config.ts`:
```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*'
    }
  ];
}
```

### **2. Authentication:**
Thêm token vào headers:
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### **3. Error handling:**
```typescript
try {
  const data = await getCurrentPosition(deviceId);
} catch (error) {
  // Show error notification
  alert('Không thể kết nối backend!');
}
```

---

## 🚀 BƯỚC TIẾP THEO:

1. **Tạo backend API** theo format trên
2. **Cập nhật `.env.local`** với URL backend
3. **Restart frontend**
4. **Test kết nối**

---

**Hãy cho tôi biết:**
1. Backend của bạn đang chạy ở đâu?
2. API endpoints có format như thế nào?
3. Cần tôi giúp tạo backend không?

Tôi sẽ giúp bạn kết nối! 🔌
