# 🗺️ TÍNH NĂNG BẢN ĐỒ MỚI

## ✨ Đã thêm các tính năng:

### 1. **4 Kiểu Bản Đồ (Map Styles)**
Bạn có thể chọn giữa 4 kiểu bản đồ khác nhau:

- **Standard** - Bản đồ chuẩn OpenStreetMap (giống Google Maps)
- **Satellite** - Hình ảnh vệ tinh (giống ảnh bạn gửi)
- **Terrain** - Bản đồ địa hình (hiện núi, đồi)
- **Dark** - Bản đồ tối (đẹp cho ban đêm)

**Cách dùng**: Click vào panel "Map Style" ở góc trên bên phải

---

### 2. **Lộ Trình Di Chuyển (Route)**
- Hiển thị đường đi của thiết bị IoT
- Đường màu xanh dương với đường gạch nét
- Các điểm dừng được đánh dấu bằng vòng tròn nhỏ

**Cách dùng**: Click nút "Hiện/Ẩn lộ trình" ở góc dưới bên phải

---

### 3. **Vùng An Toàn (Safety Zone)**
- Vòng tròn màu xanh lá quanh thiết bị
- Bán kính 500m
- Dùng để cảnh báo khi thiết bị ra khỏi vùng

---

### 4. **Marker Thiết Bị Đẹp Hơn**
- Icon tròn gradient xanh lá + xanh dương
- Hiệu ứng pulse (nhấp nháy)
- Viền trắng và shadow đẹp

**Click vào marker** để xem thông tin:
- Tọa độ GPS (Lat/Lng)
- Tốc độ hiện tại
- Trạng thái kết nối

---

### 5. **Info Badge**
Góc trên bên trái hiển thị:
- Tên thành phố (Ho Chi Minh City)
- Số thiết bị đang hoạt động
- Chấm xanh nhấp nháy (live status)

---

## 🎨 GIAO DIỆN

```
┌─────────────────────────────────────────────┐
│ [Info Badge]              [Map Style Panel] │
│  • Ho Chi Minh City        ┌──────────┐     │
│    1 thiết bị              │ Standard │     │
│                            │ Satellite│     │
│                            │ Terrain  │     │
│         🗺️                 │ Dark     │     │
│      BẢN ĐỒ               └──────────┘     │
│                                             │
│      [Marker với pulse]                     │
│      [Vùng an toàn]                         │
│      [Lộ trình]                             │
│                                             │
│                      [Toggle Route Button]  │
└─────────────────────────────────────────────┘
```

---

## 🔧 TÙY CHỈNH

### Thay đổi tọa độ:
Mở file: `frontend/src/features/dashboard/MapComponent.tsx`

```typescript
// Dòng 52: Thay đổi tọa độ trung tâm
const centerPosition: [number, number] = [10.7769, 106.7009]; // TP.HCM

// Dòng 58-64: Thay đổi lộ trình
const routePoints: [number, number][] = [
  [10.7769, 106.7009], // Điểm bắt đầu
  [10.7850, 106.7100],
  // ... thêm điểm của bạn
];
```

### Thay đổi màu sắc:
```typescript
// Dòng 145: Màu vùng an toàn
color: '#00b494',        // Màu viền
fillColor: '#00b494',    // Màu tô

// Dòng 155: Màu lộ trình
color: '#12a1c0',        // Màu đường
weight: 4,               // Độ dày
```

### Thay đổi bán kính vùng an toàn:
```typescript
// Dòng 143
radius={500}  // 500 mét, đổi thành 1000 cho 1km
```

---

## 🌐 THÊM KIỂU BẢN ĐỒ MỚI

Muốn thêm kiểu bản đồ khác? Thêm vào object `MAP_STYLES`:

```typescript
const MAP_STYLES = {
  // ... các style cũ
  
  // Thêm style mới
  light: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
};
```

**Nguồn bản đồ miễn phí:**
- OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- CartoDB Dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- CartoDB Light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- Esri Satellite: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- OpenTopoMap: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`

---

## 📱 RESPONSIVE

Bản đồ tự động điều chỉnh:
- Desktop: Hiển thị đầy đủ controls
- Mobile: Controls nhỏ gọn hơn
- Zoom bằng chuột hoặc touch

---

## 🚀 TÍNH NĂNG NÂNG CAO (Có thể thêm sau)

### 1. Real-time GPS Tracking
```typescript
// Cập nhật vị trí từ Firebase/API
useEffect(() => {
  const interval = setInterval(() => {
    // Fetch GPS data từ backend
    fetchGPSData().then(data => {
      setCurrentPosition([data.lat, data.lng]);
    });
  }, 5000); // Cập nhật mỗi 5 giây
  
  return () => clearInterval(interval);
}, []);
```

### 2. Nhiều Thiết Bị
```typescript
const devices = [
  { id: 1, name: 'MoniMove-01', position: [10.7769, 106.7009] },
  { id: 2, name: 'MoniMove-02', position: [10.8000, 106.7200] },
];

{devices.map(device => (
  <Marker key={device.id} position={device.position} icon={customIcon}>
    <Popup>{device.name}</Popup>
  </Marker>
))}
```

### 3. Heatmap (Bản đồ nhiệt)
Hiển thị mật độ di chuyển

### 4. Geofencing Alert
Cảnh báo khi thiết bị ra khỏi vùng an toàn

### 5. Traffic Layer
Hiển thị tình trạng giao thông

---

## 🐛 TROUBLESHOOTING

### Lỗi: "window is not defined"
✅ Đã fix bằng dynamic import

### Lỗi: Bản đồ không hiển thị
- Kiểm tra internet connection
- Thử đổi sang map style khác
- Xem Console có lỗi không (F12)

### Lỗi: Marker không hiện
- Kiểm tra tọa độ có đúng không
- Zoom in/out để tìm marker

---

## 📊 SO SÁNH VỚI BẢN CŨ

| Tính năng | Bản cũ | Bản mới |
|-----------|--------|---------|
| Kiểu bản đồ | 1 (Standard) | 4 (Standard, Satellite, Terrain, Dark) |
| Lộ trình | ❌ | ✅ |
| Vùng an toàn | ❌ | ✅ |
| Marker đẹp | ❌ | ✅ (Pulse animation) |
| Info badge | ❌ | ✅ |
| Toggle controls | ❌ | ✅ |
| Popup chi tiết | Đơn giản | Chi tiết (GPS, Speed, Status) |

---

## 🎯 DEMO

Để xem bản đồ mới:

1. Chạy dev server:
```bash
cd d:\IoT_Monitoring_Moving\frontend
npm run dev
```

2. Truy cập: http://localhost:3000
3. Đăng nhập (admin/admin)
4. Vào trang Dashboard
5. Xem bản đồ với tất cả tính năng mới!

---

## 💡 GỢI Ý TIẾP THEO

1. **Kết nối Firebase Realtime Database** để cập nhật GPS real-time
2. **Thêm nhiều thiết bị** trên cùng 1 bản đồ
3. **Lưu lịch sử lộ trình** vào database
4. **Thêm filter** theo thời gian (hôm nay, tuần này, tháng này)
5. **Export lộ trình** ra file GPX/KML

---

Bạn thích tính năng nào nhất? Muốn tôi thêm gì nữa không? 🚀
