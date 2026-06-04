# 🏗️ Architecture - Google Maps Integration

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              MonitorTab.tsx (Container)                    │  │
│  │  - Dynamic import GoogleMapComponent                       │  │
│  │  - SSR disabled                                            │  │
│  │  - Loading state                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         GoogleMapComponent.tsx (Main Component)            │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  State Management:                                          │  │
│  │  ├─ map: google.maps.Map                                   │  │
│  │  ├─ center: {lat, lng}                                     │  │
│  │  ├─ currentPosition: {lat, lng}                            │  │
│  │  ├─ directions: DirectionsResult                           │  │
│  │  ├─ mapStyle: 'standard' | 'silver' | 'night' | 'retro'   │  │
│  │  ├─ showRoute: boolean                                     │  │
│  │  ├─ showSafeZone: boolean                                  │  │
│  │  ├─ speed, distance, duration                              │  │
│  │  └─ safeZoneCircle: google.maps.Circle                     │  │
│  │                                                             │  │
│  │  Effects:                                                   │  │
│  │  ├─ useEffect #1: Fetch device data on mount               │  │
│  │  ├─ useEffect #2: Real-time updates (5s interval)          │  │
│  │  └─ useEffect #3: Update safe zone circle                  │  │
│  │                                                             │  │
│  │  Google Maps Components:                                    │  │
│  │  ├─ LoadScript (API loader)                                │  │
│  │  ├─ GoogleMap (map container)                              │  │
│  │  ├─ Marker (device position)                               │  │
│  │  ├─ DirectionsRenderer (route display)                     │  │
│  │  └─ Autocomplete (places search)                           │  │
│  │                                                             │  │
│  │  UI Overlays:                                               │  │
│  │  ├─ Search Bar (top center)                                │  │
│  │  ├─ Device Info Card (top left)                            │  │
│  │  ├─ Map Style Selector (top right)                         │  │
│  │  ├─ Quick Controls (bottom left)                           │  │
│  │  └─ Location Info (bottom right)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              api.ts (Backend Service)                      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  Functions:                                                 │  │
│  │  ├─ getCurrentPosition(deviceId)                           │  │
│  │  │   → GET /api/devices/{id}/position                      │  │
│  │  │   → Returns: {lat, lng, speed, timestamp}               │  │
│  │  │                                                          │  │
│  │  ├─ getDeviceRoute(deviceId)                               │  │
│  │  │   → GET /api/devices/{id}/route                         │  │
│  │  │   → Returns: {waypoints[], distance, duration}          │  │
│  │  │                                                          │  │
│  │  ├─ getDeviceInfo(deviceId)                                │  │
│  │  │   → GET /api/devices/{id}                               │  │
│  │  │   → Returns: {id, name, status, battery}                │  │
│  │  │                                                          │  │
│  │  └─ Fallback data if backend unavailable                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Google Maps APIs                            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                           │    │
│  │  1. Maps JavaScript API                                  │    │
│  │     ├─ Load map tiles                                    │    │
│  │     ├─ Render map with styles                            │    │
│  │     ├─ Handle zoom/pan                                   │    │
│  │     └─ Display markers                                   │    │
│  │                                                           │    │
│  │  2. Directions API                                       │    │
│  │     ├─ Calculate route from waypoints                    │    │
│  │     ├─ Optimize path                                     │    │
│  │     ├─ Return distance & duration                        │    │
│  │     └─ Provide turn-by-turn directions                   │    │
│  │                                                           │    │
│  │  3. Places API                                           │    │
│  │     ├─ Autocomplete suggestions                          │    │
│  │     ├─ Place details                                     │    │
│  │     ├─ Geocoding                                         │    │
│  │     └─ Reverse geocoding                                 │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Backend API (Your Server)                   │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                           │    │
│  │  Endpoints:                                              │    │
│  │  ├─ GET /api/devices/{id}/position                       │    │
│  │  ├─ GET /api/devices/{id}/route                          │    │
│  │  ├─ GET /api/devices/{id}                                │    │
│  │  └─ GET /api/devices/{id}/history                        │    │
│  │                                                           │    │
│  │  Database:                                               │    │
│  │  ├─ Device info                                          │    │
│  │  ├─ Position history                                     │    │
│  │  ├─ Routes                                               │    │
│  │  └─ Alerts                                               │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Initial Load
```
User opens Monitor tab
    ↓
MonitorTab dynamically imports GoogleMapComponent
    ↓
GoogleMapComponent mounts
    ↓
useEffect #1 triggers
    ↓
Fetch device data from backend API
    ├─ getDeviceInfo(deviceId)
    ├─ getCurrentPosition(deviceId)
    └─ getDeviceRoute(deviceId)
    ↓
If backend returns waypoints
    ↓
Call Google Directions API
    ├─ origin: first waypoint
    ├─ destination: last waypoint
    └─ waypoints: middle points
    ↓
Google returns DirectionsResult
    ├─ route geometry
    ├─ distance
    └─ duration
    ↓
Update state and render map
```

### 2. Real-time Updates
```
Every 5 seconds (setInterval)
    ↓
Call getCurrentPosition(deviceId)
    ↓
Backend returns new position
    ↓
Update currentPosition state
    ↓
Map marker moves to new position
    ↓
Safe zone circle updates (if enabled)
```

### 3. Places Search
```
User clicks search button
    ↓
Search bar opens with Autocomplete
    ↓
User types location name
    ↓
Google Places API returns suggestions
    ↓
User selects a place
    ↓
onPlaceChanged callback fires
    ↓
Extract place.geometry.location
    ↓
Update center state
    ↓
Map pans to new location with zoom
```

### 4. Directions Calculation
```
Backend provides waypoints
    ↓
Create DirectionsService instance
    ↓
Call directionsService.route({
    origin: waypoints[0],
    destination: waypoints[last],
    waypoints: waypoints[1...-1],
    travelMode: DRIVING
})
    ↓
Google calculates optimal route
    ↓
Returns DirectionsResult
    ↓
DirectionsRenderer displays route on map
```

---

## 🗂️ File Structure

```
frontend/
├── src/
│   ├── features/
│   │   └── dashboard/
│   │       ├── GoogleMapComponent.tsx    ← Main Google Maps component
│   │       ├── MapComponent.tsx          ← Old Leaflet (backup)
│   │       ├── MonitorTab.tsx            ← Container
│   │       ├── DeviceCard.tsx
│   │       ├── ListDevicesTab.tsx
│   │       ├── AboutTab.tsx
│   │       └── SettingsTab.tsx
│   │
│   ├── services/
│   │   └── api.ts                        ← Backend API calls
│   │
│   ├── core/
│   │   └── config/
│   │       └── firebase.ts
│   │
│   └── component/
│       └── layout/
│           ├── Header.tsx
│           └── Sidebar.tsx
│
├── app/
│   ├── page.tsx                          ← Login page
│   ├── DeviceCard/
│   │   └── page.tsx                      ← Dashboard
│   └── layout.tsx
│
├── .env.local                            ← API keys
├── package.json                          ← Dependencies
├── setup-google-maps.bat                 ← Setup script
└── tsconfig.json

docs/
├── GOOGLE_MAPS_INTEGRATION.md            ← Full guide
├── GOOGLE_MAPS_SETUP.md                  ← Setup instructions
├── QUICK_START_GOOGLE_MAPS.md            ← Quick start
└── ARCHITECTURE_GOOGLE_MAPS.md           ← This file
```

---

## 🔌 Dependencies

### Production
```json
{
  "@react-google-maps/api": "^2.x",
  "@googlemaps/js-api-loader": "^1.x",
  "react": "19.x",
  "next": "16.x",
  "lucide-react": "^1.x"
}
```

### Development
```json
{
  "@types/react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^4.x"
}
```

---

## 🎨 Component Hierarchy

```
MonitorTab
└── GoogleMapComponent
    ├── LoadScript
    │   └── GoogleMap
    │       ├── Marker (device position)
    │       ├── DirectionsRenderer (route)
    │       └── Circle (safe zone - via useEffect)
    │
    ├── Search Bar (Autocomplete)
    │   └── LoadScript
    │       └── Autocomplete
    │           └── input
    │
    ├── Device Info Card
    │   ├── Speed display
    │   ├── Distance display
    │   ├── Duration display
    │   └── Status display
    │
    ├── Map Style Selector
    │   └── Style buttons (4 options)
    │
    ├── Quick Controls
    │   ├── Toggle route button
    │   ├── Toggle safe zone button
    │   └── Center on device button
    │
    └── Location Info
        ├── Coordinates display
        └── Address display
```

---

## 🔐 Security

### API Key Protection
```
1. Environment Variables
   - Store in .env.local (not committed to git)
   - Use NEXT_PUBLIC_ prefix for client-side access

2. API Restrictions
   - HTTP referrers: localhost:3000, yourdomain.com
   - API restrictions: Only enable needed APIs

3. Rate Limiting
   - Google provides $200 credit/month
   - Set budget alerts in Google Cloud Console

4. Backend Proxy (Optional)
   - Proxy Google API calls through your backend
   - Hide API key from client
   - Add additional rate limiting
```

### Data Flow Security
```
Frontend → Backend API → Database
    ↓
Google Maps APIs (separate, direct from client)
```

---

## 📊 State Management

### Component State (useState)
```typescript
// Map instance
const [map, setMap] = useState<google.maps.Map | null>(null);

// Position & center
const [center, setCenter] = useState({lat, lng});
const [currentPosition, setCurrentPosition] = useState({lat, lng});

// UI state
const [mapStyle, setMapStyle] = useState('standard');
const [showRoute, setShowRoute] = useState(true);
const [showSafeZone, setShowSafeZone] = useState(true);
const [searchOpen, setSearchOpen] = useState(false);

// Data
const [directions, setDirections] = useState<DirectionsResult | null>(null);
const [speed, setSpeed] = useState(45);
const [distance, setDistance] = useState(12.5);
const [duration, setDuration] = useState('18 phút');

// Google Maps objects
const [safeZoneCircle, setSafeZoneCircle] = useState<Circle | null>(null);
```

### Refs (useRef)
```typescript
// Autocomplete instance
const autocompleteRef = useRef<Autocomplete | null>(null);

// Search input element
const searchInputRef = useRef<HTMLInputElement>(null);
```

---

## 🚀 Performance Optimizations

### 1. Dynamic Import
```typescript
// Avoid SSR issues and reduce initial bundle
const GoogleMapComponent = dynamic(
  () => import('./GoogleMapComponent'),
  { ssr: false }
);
```

### 2. useCallback for Map Handlers
```typescript
const onLoad = useCallback((map: google.maps.Map) => {
  setMap(map);
}, []);
```

### 3. Debounced Updates
```typescript
// Real-time updates every 5s (not every second)
setInterval(updatePosition, 5000);
```

### 4. Conditional Rendering
```typescript
// Only render DirectionsRenderer when data is ready
{showRoute && directions && (
  <DirectionsRenderer directions={directions} />
)}
```

### 5. Cleanup Effects
```typescript
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval); // Cleanup
}, []);
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test API service functions
describe('api.ts', () => {
  test('getCurrentPosition returns position', async () => {
    const position = await getCurrentPosition('device-001');
    expect(position).toHaveProperty('lat');
    expect(position).toHaveProperty('lng');
  });
});
```

### Integration Tests
```typescript
// Test component with mocked Google Maps
describe('GoogleMapComponent', () => {
  test('renders map with marker', () => {
    render(<GoogleMapComponent />);
    expect(screen.getByText('MoniMove - 01')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
// Test full user flow
describe('Monitor Tab', () => {
  test('user can search for location', async () => {
    // Open monitor tab
    // Click search button
    // Type location
    // Select from autocomplete
    // Verify map pans to location
  });
});
```

---

## 📈 Scalability

### Multiple Devices
```typescript
// Current: Single device
const deviceId = 'device-001';

// Future: Multiple devices
const [devices, setDevices] = useState<Device[]>([]);
devices.map(device => (
  <Marker key={device.id} position={device.position} />
));
```

### Marker Clustering
```typescript
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const clusterer = new MarkerClusterer({
  map,
  markers: deviceMarkers
});
```

### WebSocket for Real-time
```typescript
// Current: Polling every 5s
setInterval(fetchPosition, 5000);

// Future: WebSocket
const ws = new WebSocket('ws://backend/devices');
ws.onmessage = (event) => {
  const position = JSON.parse(event.data);
  updatePosition(position);
};
```

---

## 🎯 Future Enhancements

1. **Traffic Layer**
   - Show real-time traffic
   - Optimize routes based on traffic

2. **Heatmap**
   - Visualize device density
   - Show popular routes

3. **Geofencing**
   - Define custom safe zones
   - Alerts when device leaves zone

4. **History Playback**
   - Replay past routes
   - Timeline slider

5. **Multi-device Support**
   - Track multiple devices
   - Device filtering
   - Marker clustering

6. **Offline Support**
   - Cache map tiles
   - Queue API calls
   - Sync when online

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-29  
**Author:** Kiro AI Assistant
