# Smart Map Components

Thư mục này chứa các component và utilities cho Google Maps integration trong dự án IoT Monitoring.

## 📦 Components

### 1. `mapConstants.ts`
**Mục đích**: Định nghĩa constants, categories, và SVG utilities

**Exports**:
- `DEFAULT_CENTER`: Tọa độ trung tâm mặc định (HCMC)
- `DEFAULT_ZOOM`: Zoom level mặc định
- `BG_MIN_ZOOM`: Zoom tối thiểu để hiện background markers
- `CATEGORY_MAP`: Mapping categories với màu sắc và icon
- `createPinMarkerSvg()`: Tạo SVG pin marker
- `createBgDotSvg()`: Tạo SVG dot marker
- `svgToDataUrl()`: Convert SVG sang data URL
- `escapeHtml()`: Escape HTML characters

**Sử dụng**:
```typescript
import { CATEGORY_MAP, createPinMarkerSvg, svgToDataUrl } from './mapConstants';

const svg = createPinMarkerSvg('device', 1);
const dataUrl = svgToDataUrl(svg);
```

---

### 2. `types.ts`
**Mục đích**: TypeScript type definitions

**Types**:
- `DevicePosition`: Vị trí thiết bị cơ bản
- `RoutePoint`: Điểm trên route
- `TravelInfo`: Thông tin di chuyển giữa 2 điểm
- `DeviceMarker`: Device marker với thông tin bổ sung
- `SearchResult`: Kết quả tìm kiếm

**Sử dụng**:
```typescript
import { DeviceMarker, SearchResult } from './types';

const marker: DeviceMarker = {
  id: 'device-001',
  name: 'Device 1',
  lat: 10.7769,
  lng: 106.7009,
  category: 'device',
  originalIndex: 0,
};
```

---

### 3. `MapSearchBar.tsx`
**Mục đích**: Search bar component với dropdown kết quả

**Props**:
```typescript
interface MapSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  searchResults: SearchResult[];
  searchLoading: boolean;
  handleSelectPoi: (poi: SearchResult) => void;
  setSearchedPoi: (poi: SearchResult | null) => void;
}
```

**Features**:
- Auto-complete với debounce
- Dropdown kết quả với icon và category
- Clear button
- Loading state
- Keyboard navigation ready

**Sử dụng**:
```tsx
<MapSearchBar
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  showDropdown={showDropdown}
  setShowDropdown={setShowDropdown}
  searchResults={searchResults}
  searchLoading={searchLoading}
  handleSelectPoi={handleSelectPoi}
  setSearchedPoi={setSearchedPoi}
/>
```

---

### 4. `MapMarkers.tsx`
**Mục đích**: Render tất cả markers trên map

**Props**:
```typescript
interface MapMarkersProps {
  currentZoom: number;
  backgroundPois: DevicePosition[];
  searchedPoi: SearchResult | null;
  itineraryPoiIds: Set<string>;
  itineraryPois: DeviceMarker[];
  onPoiClick?: (poi: DevicePosition | DeviceMarker) => void;
  isRainy?: boolean;
  prefetchPoi?: (poi: DevicePosition | DeviceMarker) => void;
  currency?: string;
}
```

**Features**:
- Background markers (hiện khi zoom >= 17)
- Searched marker
- Itinerary markers với số thứ tự
- Hover popup (zoom >= 14)
- Opacity điều chỉnh theo thời tiết
- Icon caching để tăng performance

**Sử dụng**:
```tsx
<MapMarkers
  currentZoom={currentZoom}
  backgroundPois={backgroundPois}
  searchedPoi={searchedPoi}
  itineraryPoiIds={itineraryPoiIds}
  itineraryPois={itineraryPois}
  onPoiClick={handlePoiClick}
  isRainy={false}
  currency="VND"
/>
```

---

### 5. `RouteLayer.tsx`
**Mục đích**: Vẽ polyline route giữa các markers

**Props**:
```typescript
interface RouteLayerProps {
  itineraryPois: DeviceMarker[];
  selectedDay?: number;
}
```

**Features**:
- Vẽ polyline giữa các điểm
- Mũi tên chỉ hướng
- Nhiều màu sắc cho các đoạn
- Hỗ trợ geometry từ backend
- Auto cleanup khi unmount

**Sử dụng**:
```tsx
<RouteLayer 
  itineraryPois={itineraryPois} 
  selectedDay={selectedDay} 
/>
```

---

### 6. `PinPopup.tsx`
**Mục đích**: Info popup hiển thị chi tiết marker

**Props**:
```typescript
interface PinPopupProps {
  poi: DeviceMarker;
  index?: number;
  currency?: string;
}
```

**Features**:
- Hiển thị tên và category
- Tọa độ GPS
- Tốc độ, trạng thái
- Thời gian cập nhật
- Travel info từ điểm trước
- Tags

**Sử dụng**:
```tsx
<PinPopup 
  poi={deviceMarker} 
  index={1} 
  currency="VND" 
/>
```

---

## 🎨 Customization

### Thêm category mới

Mở `mapConstants.ts`:

```typescript
export const CATEGORY_MAP = {
  // Existing categories...
  
  // Thêm category mới
  my_category: { 
    bg: '#FF5733',      // Màu nền
    icon: '🚀',         // Icon emoji
    label: 'My Label'   // Label hiển thị
  },
};
```

### Thay đổi màu route

Mở `RouteLayer.tsx`:

```typescript
const ROUTE_COLORS = [
  '#3b82f6',  // Blue
  '#ef4444',  // Red
  '#10b981',  // Green
  '#f59e0b',  // Orange
  '#8b5cf6',  // Purple
  // Thêm màu mới
];
```

### Tùy chỉnh marker size

Mở `mapConstants.ts`:

```typescript
// Trong createPinMarkerSvg()
return `<svg xmlns="http://www.w3.org/2000/svg" 
  width="60"    // Thay đổi width
  height="52"   // Thay đổi height
  viewBox="0 0 60 52">
  ...
</svg>`;
```

### Thay đổi zoom threshold

Mở `mapConstants.ts`:

```typescript
export const BG_MIN_ZOOM = 17;  // Background markers
```

Mở `MapMarkers.tsx`:

```typescript
const activeHoveredPoi = (currentZoom >= 14 && hoveredPoiId)
  // Thay 14 thành giá trị khác
```

---

## 🔧 Performance Tips

1. **Icon Caching**: 
   - SVG icons được cache trong Map
   - Không tạo lại icon cho cùng category/order

2. **Conditional Rendering**:
   - Background POIs chỉ render khi zoom >= 17
   - Popup chỉ render khi zoom >= 14

3. **Cleanup**:
   - Polylines được cleanup trong useEffect
   - Circles được cleanup khi unmount

4. **Memoization**:
   - Sử dụng useMemo cho expensive calculations
   - Cache icon URLs

---

## 🐛 Common Issues

### Issue: Markers không hiển thị
**Solution**: 
- Kiểm tra lat/lng là numbers, không phải strings
- Kiểm tra zoom level
- Kiểm tra Google Maps API key

### Issue: Route không vẽ
**Solution**:
- Cần ít nhất 2 điểm trong itineraryPois
- Kiểm tra tọa độ hợp lệ
- Kiểm tra travel_from_prev có geometry

### Issue: Popup không hiện
**Solution**:
- Zoom phải >= 14
- Hover vào marker
- Kiểm tra hoveredPoiId state

### Issue: Search không hoạt động
**Solution**:
- Kiểm tra searchResults format
- Kiểm tra handleSelectPoi được gọi
- Kiểm tra dropdown state

---

## 📚 Dependencies

```json
{
  "@react-google-maps/api": "^2.x",
  "react": "^18.x",
  "lucide-react": "^0.x"
}
```

---

## 🔄 Version History

### v1.0.0 (2026-05-30)
- Initial release
- Basic markers, routes, search
- Multiple map styles
- Info popups
- Safe zone circles

---

## 📝 TODO

- [ ] Add clustering for many markers
- [ ] Add heatmap layer
- [ ] Add traffic layer toggle
- [ ] Add drawing tools
- [ ] Add measure distance tool
- [ ] Add export route to GPX/KML
- [ ] Add offline map support
- [ ] Add custom map tiles

---

**Maintainer**: MoniMove Team  
**License**: MIT
