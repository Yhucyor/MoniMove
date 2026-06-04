# Google Maps API Setup Guide

## 🗺️ Tích hợp Google Maps API với React

Dự án đã được tích hợp Google Maps API với các tính năng:
- ✅ **Google Maps** với nhiều style (Standard, Silver, Night, Retro)
- ✅ **Directions API** - Tính toán đường đi thực tế theo đường phố
- ✅ **Places Autocomplete** - Tìm kiếm địa điểm với gợi ý tự động
- ✅ **Real-time tracking** - Theo dõi vị trí thiết bị real-time
- ✅ **Safe Zone** - Vùng an toàn 500m xung quanh thiết bị
- ✅ **Custom UI** - Giao diện đẹp giống Google Maps

---

## 📋 Bước 1: Lấy Google Maps API Key

### 1.1. Truy cập Google Cloud Console
Vào: https://console.cloud.google.com/

### 1.2. Tạo Project mới (nếu chưa có)
1. Click vào dropdown project ở góc trên bên trái
2. Click "New Project"
3. Đặt tên project: `IoT-Monitoring`
4. Click "Create"

### 1.3. Enable APIs
Vào **APIs & Services** → **Library** và enable các API sau:

1. **Maps JavaScript API** ✅
   - Để hiển thị bản đồ
   
2. **Directions API** ✅
   - Để tính toán đường đi

3. **Places API** ✅
   - Để tìm kiếm địa điểm

4. **Geocoding API** (Optional)
   - Để chuyển đổi địa chỉ thành tọa độ

### 1.4. Tạo API Key
1. Vào **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy API key vừa tạo

### 1.5. Bảo mật API Key (Recommended)
1. Click vào API key vừa tạo
2. Trong **Application restrictions**:
   - Chọn **HTTP referrers (web sites)**
   - Thêm: `http://localhost:3000/*`
   - Thêm: `https://yourdomain.com/*` (khi deploy)
3. Trong **API restrictions**:
   - Chọn **Restrict key**
   - Chọn các API đã enable ở trên
4. Click **Save**

---

## 📋 Bước 2: Cấu hình Project

### 2.1. Thêm API Key vào `.env.local`

Mở file `frontend/.env.local` và thêm:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
XXX...` bằng API key thực của bạn

**⚠️ LƯU Ý:** Thay `AIzaSy
### 2.2. Restart Development Server

```bash
# Stop server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run build
npm start
```

---

## 🎯 Các tính năng đã tích hợp

### 1. **Google Maps với Multiple Styles**
- Standard (mặc định)
- Silver (xám bạc)
- Night (tối)
- Retro (cổ điển)

### 2. **Directions API - Đường đi thực tế**
```typescript
// Tự động tính toán đường đi từ waypoints
const directionsService = new google.maps.DirectionsService();
directionsService.route({
  origin: startPoint,
  destination: endPoint,
  waypoints: middlePoints,
  travelMode: google.maps.TravelMode.DRIVING
});
```

### 3. **Places Autocomplete - Tìm kiếm địa điểm**
```typescript
// Search bar với autocomplete
<Autocomplete
  onPlaceChanged={onPlaceChanged}
>
  <input placeholder="Tìm kiếm địa điểm..." />
</Autocomplete>
```

### 4. **Real-time Position Updates**
- Cập nhật vị trí mỗi 5 giây
- Hiển thị tốc độ, quãng đường, thời gian
- Marker với animation

### 5. **Safe Zone Circle**
- Vùng an toàn 500m radius
- Toggle hiện/ẩn
- Màu xanh lá với opacity

---

## 🔧 Cấu trúc Code

### Files đã tạo/sửa:

```
frontend/
├── src/
│   ├── features/
│   │   └── dashboard/
│   │       ├── GoogleMapComponent.tsx  ← NEW (Google Maps)
│   │       ├── MapComponent.tsx        ← OLD (Leaflet)
│   │       └── MonitorTab.tsx          ← UPDATED
│   └── services/
│       └── api.ts                      ← Backend API calls
├── .env.local                          ← API Key config
└── package.json                        ← Dependencies
```

### Dependencies đã cài:
```json
{
  "@react-google-maps/api": "^2.x",
  "@googlemaps/js-api-loader": "^1.x"
}
```

---

## 🚀 Sử dụng

### 1. Khởi động server
```bash
cd frontend
npm run build
npm start
```

### 2. Truy cập
```
http://localhost:3000
```

### 3. Đăng nhập
- Username: `admin`
- Password: `admin`

### 4. Vào tab "Monitor"
- Xem bản đồ Google Maps
- Thử đổi style bản đồ (góc trên phải)
- Tìm kiếm địa điểm (thanh search ở giữa trên)
- Toggle đường đi và vùng an toàn (góc dưới trái)

---

## 🎨 UI Components

### Top Center - Search Bar
```typescript
// Click để mở search
// Gõ địa điểm → Chọn từ gợi ý → Map tự động pan đến vị trí
```

### Top Left - Device Info Card
- Tốc độ (km/h)
- Quãng đường (km)
- Thời gian di chuyển
- Trạng thái thiết bị

### Top Right - Map Style Selector
- Standard
- Silver
- Night
- Retro

### Bottom Left - Quick Controls
- Hiện/Ẩn lộ trình
- Hiện/Ẩn vùng an toàn
- Về vị trí hiện tại

### Bottom Right - Location Info
- Tọa độ hiện tại (lat, lng)
- Địa chỉ
- Thông tin đường đi

---

## 🔄 So sánh Leaflet vs Google Maps

| Feature | Leaflet (Cũ) | Google Maps (Mới) |
|---------|--------------|-------------------|
| **Miễn phí** | ✅ Hoàn toàn | ⚠️ $200/tháng free credit |
| **Directions** | ❌ Cần OSRM | ✅ Built-in |
| **Places Search** | ❌ Không có | ✅ Autocomplete |
| **Map Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Routing Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Customization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 💰 Google Maps Pricing

### Free Tier
- **$200 credit/tháng** (miễn phí)
- Đủ cho ~28,000 map loads/tháng
- Đủ cho ~40,000 directions requests/tháng

### Tính toán cho dự án này:
```
Giả sử 100 users/ngày:
- Map loads: 100 users × 30 ngày = 3,000 loads/tháng
- Directions: 100 users × 5 routes × 30 = 15,000 requests/tháng
→ Hoàn toàn MIỄN PHÍ với $200 credit
```

### Nếu vượt quá:
- Map loads: $7/1000 loads
- Directions: $5/1000 requests
- Places Autocomplete: $2.83/1000 requests

**💡 Tip:** Enable billing nhưng set budget alert để không bị charge bất ngờ

---

## 🐛 Troubleshooting

### Lỗi: "Google Maps API Key Required"
**Nguyên nhân:** Chưa thêm API key hoặc API key sai

**Giải pháp:**
1. Check file `.env.local` có đúng format không
2. Restart server sau khi thêm API key
3. Clear browser cache

### Lỗi: "This page can't load Google Maps correctly"
**Nguyên nhân:** API key chưa enable đủ APIs

**Giải pháp:**
1. Vào Google Cloud Console
2. Enable: Maps JavaScript API, Directions API, Places API
3. Đợi 1-2 phút để APIs active

### Lỗi: "RefererNotAllowedMapError"
**Nguyên nhân:** API key bị restrict referrer

**Giải pháp:**
1. Vào Credentials → Edit API key
2. Thêm `http://localhost:3000/*` vào HTTP referrers
3. Save và thử lại

### Map không hiện directions
**Nguyên nhân:** Backend không trả về waypoints

**Giải pháy:**
1. Check console log: `Device info:`, `Error fetching route:`
2. Đảm bảo backend API đang chạy
3. Check fallback data trong `api.ts`

---

## 📚 API Documentation

### Google Maps APIs sử dụng:
1. **Maps JavaScript API**
   - Docs: https://developers.google.com/maps/documentation/javascript

2. **Directions API**
   - Docs: https://developers.google.com/maps/documentation/directions

3. **Places API**
   - Docs: https://developers.google.com/maps/documentation/places

### React Library:
- **@react-google-maps/api**
  - Docs: https://react-google-maps-api-docs.netlify.app/

---

## 🎓 Học thêm

### Customize Map Styles
- Style Wizard: https://mapstyle.withgoogle.com/
- Tạo style riêng và thêm vào `MAP_STYLES`

### Advanced Features
- Traffic Layer
- Heatmaps
- Drawing Tools
- Street View

---

## ✅ Checklist

- [ ] Tạo Google Cloud Project
- [ ] Enable Maps JavaScript API
- [ ] Enable Directions API
- [ ] Enable Places API
- [ ] Tạo API Key
- [ ] Restrict API Key (security)
- [ ] Thêm API Key vào `.env.local`
- [ ] Restart server
- [ ] Test map hiển thị
- [ ] Test directions
- [ ] Test places search
- [ ] Test real-time updates

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có:
- ✅ Google Maps với UI đẹp
- ✅ Directions API cho đường đi thực tế
- ✅ Places Autocomplete cho tìm kiếm
- ✅ Real-time tracking
- ✅ Multiple map styles
- ✅ Safe zone visualization

**Next steps:**
1. Kết nối backend thực để lấy dữ liệu thiết bị
2. Thêm nhiều thiết bị trên map
3. Thêm history playback
4. Thêm alerts và notifications
