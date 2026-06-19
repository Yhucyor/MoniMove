import React from 'react';
import { MapPin, Gauge, Clock, Shield, Navigation } from 'lucide-react';
import { CATEGORY_MAP } from './mapConstants';
interface ExtendedDeviceMarker {
  id?: string;
  name?: string;
  category?: string;
  type?: string;
  lat: number;
  lng: number;
  speed?: number;
  status?: string;
  lastUpdate?: string;
  travel_from_prev?: {
    distance?: number;
    duration?: number;
  };
  tags?: string[];
}

interface PinPopupProps {
  poi: ExtendedDeviceMarker;
  index?: number;
  currency?: string;
}


export default function PinPopup({ poi, index, currency = 'VND' }: PinPopupProps) {
  const typeKey = poi.category ?? poi.type ?? 'device';
  const cat = CATEGORY_MAP[typeKey as keyof typeof CATEGORY_MAP] || { 
    bg: '#083D77', 
    icon: '📍', 
    label: 'Device' 
  };

  return (
    <div 
      style={{
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
        minWidth: '240px',
        maxWidth: '280px',
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '2px solid #f1f5f9',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: cat.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          {cat.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '2px',
          }}>
            {poi.name}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            fontWeight: '600',
          }}>
            {cat.label}
            {index != null && ` • #${index}`}
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        marginBottom: '12px',
      }}>
        {/* Location */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
        }}>
          <MapPin 
            style={{ 
              width: '14px', 
              height: '14px', 
              color: '#06b6d4',
              flexShrink: 0,
            }} 
          />
          <span style={{ 
            color: '#475569',
            fontFamily: 'monospace',
            fontSize: '11px',
          }}>
            {poi.lat.toFixed(5)}°N, {poi.lng.toFixed(5)}°E
          </span>
        </div>

        {/* Speed */}
        {poi.speed != null && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '12px',
          }}>
            <Gauge 
              style={{ 
                width: '14px', 
                height: '14px', 
                color: '#3b82f6',
                flexShrink: 0,
              }} 
            />
            <span style={{ color: '#475569' }}>
              Tốc độ: <strong style={{ color: '#1e293b' }}>{poi.speed} km/h</strong>
            </span>
          </div>
        )}

        {/* Status */}
        {poi.status && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '12px',
          }}>
            <Shield 
              style={{ 
                width: '14px', 
                height: '14px', 
                color: poi.status === 'active' ? '#10b981' : 
                       poi.status === 'warning' ? '#f59e0b' : '#94a3b8',
                flexShrink: 0,
              }} 
            />
            <span style={{ color: '#475569' }}>
              Trạng thái: <strong style={{ 
                color: poi.status === 'active' ? '#10b981' : 
                       poi.status === 'warning' ? '#f59e0b' : '#94a3b8'
              }}>
                {poi.status === 'active' ? 'Hoạt động' : 
                 poi.status === 'warning' ? 'Cảnh báo' : 'Không hoạt động'}
              </strong>
            </span>
          </div>
        )}

        {/* Last Update */}
        {poi.lastUpdate && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '12px',
          }}>
            <Clock 
              style={{ 
                width: '14px', 
                height: '14px', 
                color: '#8b5cf6',
                flexShrink: 0,
              }} 
            />
            <span style={{ color: '#475569' }}>
              Cập nhật: <strong style={{ color: '#1e293b' }}>{poi.lastUpdate}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Travel Info */}
      {poi.travel_from_prev && (
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '8px',
          padding: '8px 10px',
          marginTop: '10px',
          border: '1px solid #bae6fd',
        }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: '#0369a1',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Navigation style={{ width: '12px', height: '12px' }} />
            Từ điểm trước
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#0c4a6e',
            display: 'flex',
            gap: '12px',
          }}>
            {poi.travel_from_prev.distance != null && (
              <span>
                📏 <strong>{(poi.travel_from_prev.distance / 1000).toFixed(1)} km</strong>
              </span>
            )}
            {poi.travel_from_prev.duration != null && (
              <span>
                ⏱️ <strong>{Math.round(poi.travel_from_prev.duration / 60)} phút</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {poi.tags && poi.tags.length > 0 && (
        <div style={{ 
          marginTop: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
        }}>
          {poi.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
