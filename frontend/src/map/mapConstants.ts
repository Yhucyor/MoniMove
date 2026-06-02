/**
 * Google Maps Constants & Utilities for IoT Monitoring
 */

export const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 }; // HCMC
export const DEFAULT_ZOOM = 12;
export const BG_MIN_ZOOM = 17;

export const CATEGORY_MAP = {
  device: { bg: '#12a1c0', icon: '📍', label: 'Thiết bị' },
  checkpoint: { bg: '#F95738', icon: '🎯', label: 'Điểm kiểm tra' },
  warning: { bg: '#D97706', icon: '⚠️', label: 'Cảnh báo' },
  safe_zone: { bg: '#10b981', icon: '🛡️', label: 'Vùng an toàn' },
  destination: { bg: '#8B5CF6', icon: '🏁', label: 'Đích đến' },
  parking: { bg: '#EC4899', icon: '🅿️', label: 'Bãi đỗ xe' },
  service: { bg: '#733667', icon: '🔧', label: 'Dịch vụ' },
};

const normalizeTypeValue = (value: string | undefined | null): string | null => {
  if (typeof value === 'string') return value.toLowerCase().trim();
  return null;
};

/**
 * Tạo SVG pin teardrop cho device markers
 * - Có badge số thứ tự (nếu có)
 * - Có icon category
 */
export const createPinMarkerSvg = (category: string, order?: number): string => {
  const cat = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP] || { 
    bg: '#083D77', 
    icon: '📍', 
    label: 'Point' 
  };
  const col = cat.bg;
  const icon = cat.icon || '📍';

  const badge = order != null ? `
    <circle cx="43" cy="13" r="8" fill="white" stroke="${col}" stroke-width="1.5"/>
    <text x="43" y="13" text-anchor="middle" dominant-baseline="central"
      font-size="9" font-weight="800" font-family="Arial,sans-serif" fill="${col}">${order}</text>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="52" viewBox="0 0 60 52">
    <defs>
      <filter id="pin-sh" x="-25%" y="-15%" width="150%" height="145%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.30" flood-color="#000"/>
      </filter>
      <linearGradient id="pin-gr" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${col}"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0.82"/>
      </linearGradient>
    </defs>

    <!-- Teardrop pin -->
    <g filter="url(#pin-sh)">
      <path d="M30 48 C30 48 15 33 15 20 C15 11 21.5 5 30 5 C38.5 5 45 11 45 20 C45 33 30 48 30 48Z"
        fill="url(#pin-gr)" stroke="white" stroke-width="2"/>
      <!-- White inner circle -->
      <circle cx="30" cy="20" r="10" fill="white" opacity="0.25"/>
      <!-- Category ICON -->
      <text x="30" y="20" text-anchor="middle" dominant-baseline="central"
        font-size="13" fill="white">${icon}</text>
    </g>

    ${badge}
  </svg>`;
};

/**
 * Tạo SVG dot tròn cho background markers
 */
export const createBgDotSvg = (category: string): string => {
  const cat = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP] || { 
    bg: '#083D77', 
    icon: '📍' 
  };
  const col = cat.bg;
  const icon = cat.icon || '📍';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <filter id="bg-sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.2" flood-color="#000"/>
    </filter>
    <g filter="url(#bg-sh)">
      <circle cx="14" cy="14" r="12" fill="${col}" fill-opacity="0.9"/>
      <text x="14" y="14" text-anchor="middle" dominant-baseline="central" font-size="13" fill="white">${icon}</text>
    </g>
  </svg>`;
};

/**
 * Helper để encode SVG thành data URL cho Google Maps
 */
export const svgToDataUrl = (svgString: string): string => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

export const escapeHtml = (value: string | number | null | undefined): string => 
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
