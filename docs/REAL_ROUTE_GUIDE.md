# 🛣️ ĐƯỜNG ĐI THỰC TẾ THEO ĐƯỜNG PHỐ!

## ✅ ĐÃ TÍCH HỢP ROUTING API!

Bây giờ đường đi sẽ đi theo **đường phố thực tế**, không còn là đường thẳng nữa!

---

## 🎉 TÍNH NĂNG MỚI:

### **1. OSRM Routing API**
- ✅ Tính toán đường đi thực tế theo đường phố
- ✅ Miễn phí 100%
- ✅ Không cần API key
- ✅ Hỗ trợ nhiều waypoints
- ✅ Tự động tìm đường ngắn nhất

### **2. Đường đi đẹp hơn**
- ✅ Màu xanh dương đậm (#2563eb)
- ✅ Đường viền ngoài (outline) để nổi bật
- ✅ Line join và cap mượt mà
- ✅ Độ dày 6px (dễ nhìn)

### **3. Waypoints markers**
- ✅ Điểm bắt đầu: Màu xanh lá
- ✅ Điểm trung gian: Màu tím
- ✅ Điểm kết thúc: Marker lớn với pulse

### **4. Loading indicator**
- ✅ Hiển thị "Đang tính toán đường đi..."
- ✅ Spinner animation
- ✅ Tự động ẩn khi xong

---

## 🚀 XEM NGAY:

```bash
# Stop server (Ctrl + C)
cd d:\IoT_Monitoring_Moving\frontend
rmdir /s /q .next
npm run build
npm start
```

Sau đó:
1. http://localhost:3000
2. Login: `admin` / `admin`
3. **Xem đường đi thực tế theo đường phố!** 🛣️

---

## 🗺️ CÁCH HOẠT ĐỘNG:

### **1. Định nghĩa waypoints:**
```typescript
const waypoints: [number, number][] = [
  [10.7769, 106.7009], // Điểm bắt đầu
  [10.7850, 106.7100], // Điểm trung gian 1
  [10.7920, 106.7200], // Điểm trung gian 2
  [10.8000, 106.7300], // Điểm trung gian 3
  [10.8100, 106.7400], // Điểm kết thúc
];
```

### **2. Gọi OSRM API:**
```typescript
const coords = waypoints.map(point => `${point[1]},${point[0]}`).join(';');
const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
```

### **3. Nhận route thực tế:**
API trả về hàng trăm điểm tọa độ theo đường phố thực tế!

### **4. Vẽ lên bản đồ:**
```typescript
<Polyline positions={routeCoordinates} pathOptions={{ color: '#2563eb', weight: 6 }} />
```

---

## 🎨 THIẾT KẾ:

### **Đường đi:**
- **Màu chính**: Blue (#2563eb) - Dễ nhìn
- **Outline**: Dark blue (#1e40af) - Tạo độ sâu
- **Độ dày**: 6px (chính) + 8px (outline)
- **Opacity**: 0.8 (chính) + 0.4 (outline)

### **Waypoints:**
- **Điểm bắt đầu**: Green (#10b981) - Rõ ràng
- **Điểm trung gian**: Indigo (#6366f1) - Phân biệt
- **Bán kính**: 80m - Vừa đủ

---

## 🔧 TÙY CHỈNH:

### **Thay đổi waypoints:**
Mở `MapComponent.tsx`, dòng 42:

```typescript
const waypoints: [number, number][] = [
  [10.7769, 106.7009], // Thay bằng tọa độ của bạn
  [10.8000, 106.7300], // Thêm nhiều điểm
  [10.8100, 106.7400], // ...
];
```

### **Thay đổi màu đường:**
Dòng 155:

```typescript
pathOptions={{ 
  color: '#2563eb',  // Đổi màu này
  weight: 6,         // Đổi độ dày
  opacity: 0.8       // Đổi độ mờ
}}
```

### **Thay đổi routing mode:**
Dòng 56:

```typescript
// Driving (ô tô) - mặc định
const url = `...route/v1/driving/${coords}...`;

// Walking (đi bộ)
const url = `...route/v1/foot/${coords}...`;

// Cycling (xe đạp)
const url = `...route/v1/bike/${coords}...`;
```

---

## 🌐 OSRM API:

### **Endpoint:**
```
https://router.project-osrm.org/route/v1/{profile}/{coordinates}
```

### **Profiles:**
- `driving` - Ô tô (mặc định)
- `foot` - Đi bộ
- `bike` - Xe đạp

### **Parameters:**
- `overview=full` - Trả về toàn bộ route
- `geometries=geojson` - Format GeoJSON
- `steps=true` - Trả về từng bước (optional)
- `alternatives=true` - Trả về đường thay thế (optional)

### **Response:**
```json
{
  "code": "Ok",
  "routes": [{
    "geometry": {
      "coordinates": [[lng, lat], [lng, lat], ...]
    },
    "distance": 12500,  // meters
    "duration": 1080    // seconds
  }]
}
```

---

## 💡 NÂNG CAO:

### **1. Kết nối Backend:**
Thay vì hardcode waypoints, lấy từ API:

```typescript
useEffect(() => {
  const fetchWaypoints = async () => {
    const response = await fetch('/api/device/route');
    const data = await response.json();
    setWaypoints(data.waypoints);
  };
  fetchWaypoints();
}, []);
```

### **2. Real-time tracking:**
Cập nhật vị trí mỗi 5 giây:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/device/current-position');
    const data = await response.json();
    setCurrentPosition([data.lat, data.lng]);
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

### **3. Lưu lịch sử:**
Lưu route vào database:

```typescript
const saveRoute = async (route: [number, number][]) => {
  await fetch('/api/routes', {
    method: 'POST',
    body: JSON.stringify({ route, timestamp: Date.now() })
  });
};
```

### **4. Nhiều thiết bị:**
Hiển thị nhiều routes:

```typescript
const devices = [
  { id: 1, waypoints: [...], color: '#2563eb' },
  { id: 2, waypoints: [...], color: '#dc2626' },
];

{devices.map(device => (
  <Polyline 
    key={device.id}
    positions={device.routeCoordinates}
    pathOptions={{ color: device.color }}
  />
))}
```

---

## 🐛 TROUBLESHOOTING:

### **Lỗi: CORS**
OSRM API cho phép CORS, nhưng nếu bị chặn:
- Dùng proxy server
- Hoặc gọi từ backend

### **Lỗi: Route không tìm thấy**
- Kiểm tra waypoints có hợp lệ không
- Đảm bảo các điểm không quá xa nhau
- Thử profile khác (foot, bike)

### **Lỗi: API chậm**
- Cache route đã tính
- Hoặc tự host OSRM server

### **Đường đi không hiển thị:**
- Kiểm tra Console (F12) có lỗi không
- Xem `routeCoordinates` có data không
- Thử fallback về đường thẳng

---

## 📊 SO SÁNH:

| Trước | Sau |
|-------|-----|
| Đường thẳng | Đường theo phố |
| 5 điểm | Hàng trăm điểm |
| Không thực tế | Rất thực tế |
| Không tính khoảng cách | Tính chính xác |
| Không có outline | Có outline đẹp |

---

## 🎯 ROADMAP:

### **Có thể thêm:**
1. **Traffic-aware routing** - Tránh tắc đường
2. **Alternative routes** - Đường thay thế
3. **Turn-by-turn navigation** - Chỉ đường từng bước
4. **ETA calculation** - Thời gian đến dự kiến
5. **Route optimization** - Tối ưu nhiều điểm
6. **Avoid areas** - Tránh khu vực nguy hiểm
7. **Historical routes** - Xem lại lịch sử
8. **Route comparison** - So sánh các đường
9. **Export GPX** - Xuất file GPS
10. **Offline routing** - Routing offline

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có:
- ✅ Đường đi thực tế theo đường phố
- ✅ Routing API miễn phí
- ✅ Waypoints markers đẹp
- ✅ Loading indicator
- ✅ Outline cho đường đi
- ✅ Màu sắc dễ nhìn

**Đường đi giờ đây chuyên nghiệp như Google Maps!** 🛣️✨

---

**Restart server và xem đường đi thực tế!**

```bash
rmdir /s /q .next
npm run build
npm start
```

Sau đó: http://localhost:3000 → Login → Wow! Đường đi theo phố thật! 🚗
