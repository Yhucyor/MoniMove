# 🔧 Fix: "google is not defined" Error

## ❌ Lỗi gặp phải

```
ReferenceError: google is not defined
src/features/dashboard/GoogleMapComponent.tsx (284:21)
```

## ✅ Đã fix

### 1. Fixed GoogleMapComponent.tsx
Thêm check `window.google` trước khi sử dụng:

```tsx
// ❌ Trước (lỗi)
<Marker
  icon={{
    path: google.maps.SymbolPath.CIRCLE,
    // ...
  }}
/>

// ✅ Sau (đã fix)
{window.google && (
  <Marker
    icon={{
      path: window.google.maps.SymbolPath.CIRCLE,
      // ...
    }}
  />
)}
```

### 2. Switched to SmartGoogleMap
MonitorTab.tsx đã được update để sử dụng **SmartGoogleMap** thay vì GoogleMapComponent cũ.

**SmartGoogleMap** có nhiều ưu điểm hơn:
- ✅ Không có lỗi "google is not defined"
- ✅ Custom markers đẹp hơn
- ✅ Search bar với dropdown
- ✅ Route layer với arrows
- ✅ Info popup khi hover
- ✅ Multiple map styles
- ✅ Better performance

## 🚀 Cách chạy

```bash
cd frontend
npm run dev
```

Truy cập: `http://localhost:3000`

## 🔄 Nếu muốn quay lại GoogleMapComponent cũ

### Option 1: Sử dụng script
```bash
cd frontend
use-original-map.bat
```

### Option 2: Manual
Mở `src/features/dashboard/MonitorTab.tsx` và thay đổi:

```tsx
// Thay vì SmartGoogleMap
const SmartGoogleMap = dynamic(
  () => import('./SmartGoogleMap'),
  { ssr: false }
);

// Dùng GoogleMapComponent
const GoogleMapComponent = dynamic(
  () => import('./GoogleMapComponent'),
  { ssr: false }
);
```

## 🐛 Tại sao lỗi này xảy ra?

### Nguyên nhân:
1. **Google Maps API chưa load xong** khi component render
2. **SSR (Server-Side Rendering)** - `google` object không tồn tại trên server
3. **Race condition** - Component render trước khi LoadScript hoàn thành

### Giải pháp:
1. ✅ **Check window.google** trước khi sử dụng
2. ✅ **Dynamic import** với `ssr: false`
3. ✅ **LoadScript wrapper** để đảm bảo API đã load
4. ✅ **Conditional rendering** cho các phần dùng google object

## 📝 Best Practices

### 1. Luôn check window.google
```tsx
// ✅ Good
{window.google && (
  <Marker icon={{ path: window.google.maps.SymbolPath.CIRCLE }} />
)}

// ❌ Bad
<Marker icon={{ path: google.maps.SymbolPath.CIRCLE }} />
```

### 2. Sử dụng dynamic import
```tsx
// ✅ Good
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);

// ❌ Bad
import MapComponent from './MapComponent';
```

### 3. Sử dụng LoadScript
```tsx
// ✅ Good
<LoadScript googleMapsApiKey={apiKey}>
  <GoogleMap>
    {/* Your markers */}
  </GoogleMap>
</LoadScript>

// ❌ Bad
<GoogleMap>
  {/* Your markers */}
</GoogleMap>
```

### 4. Handle loading state
```tsx
// ✅ Good
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

// ❌ Bad
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);
```

## 🎯 Recommended Solution

**Sử dụng SmartGoogleMap** (đã được tích hợp):

### Ưu điểm:
1. ✅ Không có lỗi "google is not defined"
2. ✅ Đã handle tất cả edge cases
3. ✅ Custom markers đẹp hơn
4. ✅ Nhiều features hơn
5. ✅ Better performance
6. ✅ Full documentation

### Cách sử dụng:
```tsx
import dynamic from 'next/dynamic';

const SmartGoogleMap = dynamic(
  () => import('./SmartGoogleMap'),
  { ssr: false }
);

export default function MonitorTab() {
  return <SmartGoogleMap />;
}
```

## 📚 Tài liệu liên quan

- **SMART_MAP_GUIDE.md** - Hướng dẫn sử dụng SmartGoogleMap
- **SMART_MAP_SUMMARY.md** - Tổng kết features
- **smart-map/README.md** - Component documentation

## ✅ Checklist

- [x] Fixed GoogleMapComponent.tsx
- [x] Switched to SmartGoogleMap
- [x] Updated MonitorTab.tsx
- [x] Tested và hoạt động tốt

## 🎉 Kết luận

Lỗi đã được fix! Bạn có thể:

1. ✅ Sử dụng **SmartGoogleMap** (khuyến nghị)
2. ✅ Hoặc sử dụng **GoogleMapComponent** đã fix

**Khuyến nghị: Sử dụng SmartGoogleMap để có trải nghiệm tốt nhất! 🚀**

---

**Fixed by**: Kiro AI Assistant  
**Date**: 2026-05-30  
**Status**: ✅ Resolved
