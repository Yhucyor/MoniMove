# 🗺️ Bản Đồ MoniMove - Hướng Dẫn Sử Dụng

## 🎉 Đã Thêm Bản Đồ Kiểu Mới!

Bản đồ giờ đây có giao diện giống Google Maps với nhiều tính năng mới:

---

## ✨ Tính Năng Chính

### 1. 🎨 4 Kiểu Bản Đồ
Click vào panel **"Map Style"** ở góc trên phải để chọn:

- **Standard** 🗺️ - Bản đồ đường phố chuẩn
- **Satellite** 🛰️ - Hình ảnh vệ tinh (giống ảnh bạn gửi)
- **Terrain** ⛰️ - Bản đồ địa hình
- **Dark** 🌙 - Chế độ tối

### 2. 🛣️ Lộ Trình Di Chuyển
- Đường màu xanh dương nối các điểm
- Các điểm dừng được đánh dấu
- Bật/tắt bằng nút **"Hiện/Ẩn lộ trình"**

### 3. 🎯 Vùng An Toàn
- Vòng tròn xanh lá bán kính 500m
- Cảnh báo khi thiết bị ra khỏi vùng

### 4. 📍 Marker Thiết Bị
- Icon tròn gradient đẹp mắt
- Hiệu ứng pulse (nhấp nháy)
- Click vào để xem thông tin chi tiết:
  - Tọa độ GPS
  - Tốc độ
  - Trạng thái kết nối

### 5. ℹ️ Info Badge
Góc trên trái hiển thị:
- Tên thành phố
- Số thiết bị đang hoạt động
- Trạng thái live

---

## 🎮 Cách Sử Dụng

### Xem Bản Đồ:
1. Chạy server: `npm run dev`
2. Đăng nhập với `admin/admin`
3. Vào trang Dashboard
4. Bản đồ sẽ hiển thị ở tab "Monitor"

### Thay Đổi Kiểu Bản Đồ:
1. Click vào panel **"Map Style"** (góc trên phải)
2. Chọn kiểu bạn thích
3. Bản đồ sẽ đổi ngay lập tức

### Ẩn/Hiện Lộ Trình:
1. Click nút **"Hiện lộ trình"** (góc dưới phải)
2. Lộ trình sẽ ẩn/hiện

### Xem Thông Tin Thiết Bị:
1. Click vào marker (chấm tròn xanh)
2. Popup sẽ hiện thông tin chi tiết

---

## 🔧 Tùy Chỉnh

### Thay Đổi Vị Trí:
Mở file: `src/features/dashboard/MapComponent.tsx`

```typescript
// Dòng 52: Đổi tọa độ trung tâm
const centerPosition: [number, number] = [10.7769, 106.7009];

// Dòng 58-64: Đổi lộ trình
const routePoints: [number, number][] = [
  [10.7769, 106.7009], // Điểm 1
  [10.7850, 106.7100], // Điểm 2
  // Thêm điểm của bạn...
];
```

### Thay Đổi Màu:
```typescript
// Màu lộ trình (dòng 155)
color: '#12a1c0',  // Đổi thành màu bạn thích

// Màu vùng an toàn (dòng 145)
color: '#00b494',
fillColor: '#00b494',
```

### Thay Đổi Bán Kính Vùng An Toàn:
```typescript
// Dòng 143
radius={500}  // 500m, đổi thành 1000 cho 1km
```

---

## 🚀 Tính Năng Nâng Cao (Có Thể Thêm)

### 1. Real-time GPS Tracking
Cập nhật vị trí từ Firebase mỗi 5 giây

### 2. Nhiều Thiết Bị
Hiển thị nhiều thiết bị trên cùng 1 bản đồ

### 3. Lịch Sử Lộ Trình
Xem lại lộ trình theo ngày/tuần/tháng

### 4. Cảnh Báo Geofencing
Thông báo khi thiết bị ra khỏi vùng

### 5. Traffic Layer
Hiển thị tình trạng giao thông

---

## 📱 Responsive

Bản đồ hoạt động tốt trên:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

---

## 🐛 Khắc Phục Lỗi

### Bản đồ không hiển thị?
1. Kiểm tra internet
2. Thử đổi sang map style khác
3. Refresh trang (Ctrl + F5)
4. Xem Console (F12) có lỗi không

### Marker không hiện?
1. Kiểm tra tọa độ
2. Zoom in/out
3. Thử click vào bản đồ

---

## 📊 Giao Diện

```
┌──────────────────────────────────────────────┐
│ ℹ️ Ho Chi Minh City    🎨 Map Style Panel   │
│   • 1 thiết bị          ┌──────────────┐    │
│                         │ ✓ Standard   │    │
│                         │   Satellite  │    │
│         🗺️              │   Terrain    │    │
│    BẢN ĐỒ TP.HCM       │   Dark       │    │
│                         └──────────────┘    │
│                                              │
│    📍 Marker (pulse)                         │
│    🎯 Vùng an toàn (500m)                    │
│    🛣️ Lộ trình (đường xanh)                 │
│                                              │
│                    [✓ Hiện lộ trình]         │
└──────────────────────────────────────────────┘
```

---

## 🎯 Demo

**Xem ngay:**
1. `cd frontend`
2. `npm run dev`
3. Mở http://localhost:3000
4. Login: `admin/admin`
5. Vào Dashboard → Tab Monitor

---

## 💡 Gợi Ý

Muốn bản đồ đẹp hơn nữa?
- Thêm animation cho marker
- Thêm search địa điểm
- Thêm direction (chỉ đường)
- Thêm weather overlay
- Thêm 3D buildings

**Bạn muốn thêm tính năng nào? Hãy nói với tôi!** 🚀

---

## 📞 Hỗ Trợ

Gặp vấn đề? Hãy:
1. Xem file `MAP_FEATURES.md` để biết chi tiết
2. Check Console (F12) xem lỗi
3. Hỏi tôi với thông tin cụ thể

**Happy Mapping! 🗺️✨**
