# 🗺️ Smart Google Maps Integration Guide

## Tổng quan

Hệ thống Smart Map đã được tích hợp vào dự án IoT Monitoring với các tính năng nâng cao:

- ✅ **Custom Markers** với SVG động và icon đẹp mắt
- ✅ **Search Bar** tìm kiếm thiết bị và địa điểm
- ✅ **Route Layer** hiển thị lộ trình với mũi tên chỉ hướng
- ✅ **Info Popup** hiển thị thông tin chi tiết khi hover
- ✅ **Multiple Map Styles** (Standard, Silver, Night, Retro)
- ✅ **Safe Zone Circle** vùng an toàn xung quanh thiết bị
- ✅ **Real-time Updates** cập nhật vị trí theo thời gian thực

## 📁 Cấu trúc File

```
frontend/src/features/dashboard/
├── SmartGoogleMap.tsx          # Component chính
└── smart-map/
    ├── mapConstants.ts         # Constants và SVG utilities
    ├── types.ts                # TypeScript type definitions
    ├── MapSearchBar.tsx        # Search bar component
    ├── MapMarkers.tsx          # Markers rendering component
    ├── RouteLayer.tsx          # Route polyline component
    └── PinPopup.tsx            # Info popup component
```

## 🚀 Cách sử dụng

### 1. Thay thế component Map hiện tại

Mở file `frontend/app/page.tsx` hoặc file dashboard của bạn và import component mới:

```tsx
import SmartGoogleMap from '../src/features/dashboard/SmartGoogleMap';

// Trong component của bạn:
<SmartGoogleMap />
```

### 2. Hoặc sử dụng trong MonitorTab

Mở file `frontend/src/features/dashboard/MonitorTab.tsx` và thay thế:

```tsx
// Thay vì:
import GoogleMapComponent from './GoogleMapComponent';

// Sử dụng:
import SmartGoogleMap from './SmartGoogleMap';

// Trong render:
<SmartGoogleMap />
```

## 🎨 Tính năng chính

### 1. Custom Markers

Markers được tạo bằng SVG động với:
- Icon category (📍, 🎯, ⚠️, 🛡️, 🏁, etc.)
- Badge số thứ tự
- Màu sắc theo loại thiết bị
- Shadow và gradient đẹp mắt

### 2. Search Bar

- Tìm kiếm thiết bị theo tên
- Dropdown kết quả với icon và category
- Auto-complete với debounce
- Clear button để xóa nhanh

### 3. Route Layer

- Hiển thị đường đi giữa các điểm
- Mũi tên chỉ hướng di chuyển
- Nhiều màu sắc cho các đoạn đường
- Hỗ trợ geometry từ backend

### 4. Info Popup

Hiển thị khi hover vào marker (zoom >= 14):
- Tên thiết bị và category
- Tọa độ GPS
- Tốc độ hiện tại
- Trạng thái (active/warning/inactive)
- Thời gian cập nhật
- Thông tin di chuyển từ điểm trước

### 5. Map Controls

**Top Left - Device Info Card:**
- Tốc độ hiện tại
- Quãng đường đã đi
- Thời gian di chuyển
- Trạng thái an toàn

**Top Right - Map Style Selector:**
- Standard (mặc định)
- Silver (xám trắng)
- Night (tối màu)
- Retro (cổ điển)

**Bottom Left - Quick Controls:**
- Toggle hiện/ẩn lộ trình
- Toggle hiện/ẩn vùng an toàn
- Button về vị trí hiện tại

**Bottom Right - Location Info:**
- Tọa độ GPS chi tiết
- Địa chỉ hiện tại

## 🔧 Tùy chỉnh

### Thay đổi màu sắc categories

Mở `smart-map/mapConstants.ts`:

```typescript
export const CATEGORY_MAP = {
  device: { bg: '#12a1c0', icon: '📍', label: 'Thiết bị' },
  checkpoint: { bg: '#F95738', icon: '🎯', label: 'Điểm kiểm tra' },
  warning: { bg: '#D97706', icon: '⚠️', label: 'Cảnh báo' },
  // Thêm categories mới tại đây
};
```

### Thay đổi zoom mặc định

Mở `smart-map/mapConstants.ts`:

```typescript
export const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 }; // HCMC
export const DEFAULT_ZOOM = 12; // Thay đổi giá trị này
export const BG_MIN_ZOOM = 17; // Zoom tối thiểu để hiện background POIs
```

### Thay đổi màu route

Mở `smart-map/RouteLayer.tsx`:

```typescript
const ROUTE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
// Thêm hoặc thay đổi màu sắc
```

### Thêm map style mới

Mở `SmartGoogleMap.tsx` và thêm vào `MAP_STYLES`:

```typescript
const MAP_STYLES = {
  standard: null,
  silver: [...],
  night: [...],
  retro: [...],
  // Thêm style mới
  custom: [
    { elementType: "geometry", stylers: [{ color: "#your-color" }] },
    // ... thêm styling rules
  ]
};
```

## 🔌 Tích hợp với Backend

### Device Position API

Component mong đợi API trả về:

```typescript
interface DevicePosition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  speed?: number;
  status?: 'active' | 'inactive' | 'warning';
  lastUpdate?: string;
  tags?: string[];
}
```

### Route API

Component mong đợi API trả về:

```typescript
interface RouteResponse {
  waypoints: [number, number][]; // [lat, lng][]
  distance?: number; // meters
  duration?: number; // seconds
}
```

### Travel Info (optional)

Nếu backend cung cấp geometry cho route:

```typescript
interface TravelInfo {
  distance?: number;
  duration?: number;
  geometry?: [number, number][]; // [lat, lng][]
}
```

## 📱 Responsive Design

Component đã được tối ưu cho:
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024+)
- ⚠️ Mobile (cần điều chỉnh thêm cho màn hình nhỏ)

## 🎯 Performance Tips

1. **Marker Caching**: SVG markers được cache để tránh tạo lại
2. **Debounced Search**: Search có delay 300ms để giảm API calls
3. **Conditional Rendering**: Background POIs chỉ hiện khi zoom >= 17
4. **Cleanup**: Polylines và circles được cleanup khi unmount

## 🐛 Troubleshooting

### Markers không hiển thị

Kiểm tra:
1. Google Maps API key đã được set trong `.env.local`
2. API key đã enable Maps JavaScript API
3. Data từ backend có đúng format (lat, lng là numbers)

### Route không vẽ

Kiểm tra:
1. `itineraryPois` có ít nhất 2 điểm
2. Tọa độ lat/lng hợp lệ (lat: -90 to 90, lng: -180 to 180)
3. `showRoute` state = true

### Search không hoạt động

Kiểm tra:
1. `searchQuery` state được update đúng
2. API search được gọi và trả về đúng format
3. `SearchResult[]` có đúng structure

### Popup không hiện khi hover

Kiểm tra:
1. Zoom level >= 14
2. Marker có `onMouseOver` handler
3. `hoveredPoiId` state được set đúng

## 📚 Tài liệu tham khảo

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/)

## 🎉 Demo

Để xem demo:

```bash
cd frontend
npm run dev
```

Mở trình duyệt tại `http://localhost:3000` và đăng nhập để xem bản đồ.

## 📝 Notes

- Component sử dụng TypeScript để type safety
- Tất cả styles được inline để dễ customize
- SVG markers được tạo động để dễ thay đổi màu sắc và icon
- Component tương thích với cả Leaflet và Google Maps (có thể switch)

## 🔄 Migration từ component cũ

Nếu bạn đang dùng `GoogleMapComponent.tsx` hoặc `MapComponent.tsx`:

1. Backup component cũ
2. Import `SmartGoogleMap` thay thế
3. Kiểm tra API endpoints vẫn hoạt động
4. Test các tính năng: markers, routes, search
5. Customize theo nhu cầu

---

**Tác giả**: MoniMove Team  
**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2026-05-30
