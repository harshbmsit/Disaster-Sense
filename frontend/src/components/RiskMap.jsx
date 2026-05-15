import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const riskZones = [
  { name: "Koramangala",     lat: 12.9352, lng: 77.6245, fused: 52.5, flood: 60, quake: 40, cyclone: 55, level: "warning"  },
  { name: "Whitefield",      lat: 12.9698, lng: 77.7499, fused: 47.4, flood: 45, quake: 50, cyclone: 47, level: "advisory" },
  { name: "Electronic City", lat: 12.8399, lng: 77.6770, fused: 19.5, flood: 15, quake: 20, cyclone: 25, level: "monitor"  },
  { name: "Bellandur",       lat: 12.9257, lng: 77.6762, fused: 72.8, flood: 80, quake: 60, cyclone: 75, level: "critical" },
  { name: "HSR Layout",      lat: 12.9116, lng: 77.6473, fused: 31.5, flood: 35, quake: 25, cyclone: 34, level: "advisory" },
  { name: "Indiranagar",     lat: 12.9784, lng: 77.6408, fused: 21.4, flood: 18, quake: 22, cyclone: 24, level: "monitor"  },
  { name: "Marathahalli",    lat: 12.9591, lng: 77.6974, fused: 56.9, flood: 62, quake: 48, cyclone: 58, level: "warning"  },
  { name: "JP Nagar",        lat: 12.9063, lng: 77.5857, fused: 78.4, flood: 85, quake: 65, cyclone: 80, level: "critical" },
];

const getLevel = (score) => {
  if (score < 30) return 'monitor';
  if (score < 60) return 'advisory';
  if (score < 80) return 'warning';
  return 'critical';
};

const getLevelColorHex = (level) => {
  if (level === 'monitor') return '#22C55E';
  if (level === 'advisory') return '#3B82F6';
  if (level === 'warning') return '#F97316';
  return '#EF4444';
};

const getBadgeStyle = (level) => {
  if (level === 'monitor') return 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30';
  if (level === 'advisory') return 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30';
  if (level === 'warning') return 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30';
  return 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30';
};

export default function RiskMap({ filter, riskGrid }) {
  
  const fallbackZones = [
    { name: "Koramangala",     lat: 12.9352, lng: 77.6245, fused: 52.5, flood: 60, quake: 40, cyclone: 55, level: "warning"  },
    { name: "Whitefield",      lat: 12.9698, lng: 77.7499, fused: 47.4, flood: 45, quake: 50, cyclone: 47, level: "advisory" },
    { name: "Electronic City", lat: 12.8399, lng: 77.6770, fused: 19.5, flood: 15, quake: 20, cyclone: 25, level: "monitor"  },
    { name: "Bellandur",       lat: 12.9257, lng: 77.6762, fused: 72.8, flood: 80, quake: 60, cyclone: 75, level: "critical" },
    { name: "HSR Layout",      lat: 12.9116, lng: 77.6473, fused: 31.5, flood: 35, quake: 25, cyclone: 34, level: "advisory" },
    { name: "Indiranagar",     lat: 12.9784, lng: 77.6408, fused: 21.4, flood: 18, quake: 22, cyclone: 24, level: "monitor"  },
    { name: "Marathahalli",    lat: 12.9591, lng: 77.6974, fused: 56.9, flood: 62, quake: 48, cyclone: 58, level: "warning"  },
    { name: "JP Nagar",        lat: 12.9063, lng: 77.5857, fused: 78.4, flood: 85, quake: 65, cyclone: 80, level: "critical" },
  ];

  // Map backend format to existing format, use fallback if empty
  const zones = riskGrid && riskGrid.length > 0 
    ? riskGrid.map(z => ({
        name: z.area || z.name,
        lat: z.lat,
        lng: z.lng,
        fused: z.fused_score || z.fused,
        flood: z.flood_risk || z.flood,
        quake: z.earthquake_risk || z.quake,
        cyclone: z.cyclone_risk || z.cyclone,
        level: z.level
      }))
    : fallbackZones;

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
      <MapContainer 
        key="bengaluru-map"
        center={[12.9716, 77.5946]} 
        zoom={12} 
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#000000' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        {zones.map((zone, idx) => {
          let score = 0;
          if (filter === 'all') score = zone.fused;
          if (filter === 'flood') score = zone.flood;
          if (filter === 'quake') score = zone.quake;
          if (filter === 'cyclone') score = zone.cyclone;

          const activeLevel = filter === 'all' ? zone.level : getLevel(score);
          const hexColor = getLevelColorHex(activeLevel);

          return (
            <React.Fragment key={idx}>
              {/* Outer blob */}
              <Circle 
                center={[zone.lat, zone.lng]}
                radius={score * 0.8 + 200}
                pathOptions={{ color: hexColor, fillColor: hexColor, fillOpacity: 0.08, stroke: false }}
              />
              {/* Middle blob */}
              <Circle 
                center={[zone.lat, zone.lng]}
                radius={score * 0.5 + 120}
                pathOptions={{ color: hexColor, fillColor: hexColor, fillOpacity: 0.18, stroke: false }}
              />
              {/* Inner core */}
              <Circle 
                center={[zone.lat, zone.lng]}
                radius={score * 0.2 + 40}
                pathOptions={{ color: 'white', weight: 1, opacity: 0.4, fillColor: hexColor, fillOpacity: 0.45 }}
              />
              {/* Center Marker */}
              <CircleMarker
                center={[zone.lat, zone.lng]}
                radius={6}
                pathOptions={{ color: 'white', opacity: 0.8, weight: 1, fillColor: hexColor, fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                  <div className="bg-[rgba(3,3,3,0.9)] border border-white/[0.1] rounded-lg p-2 text-white font-sans min-w-[120px]">
                    <div className="font-bold text-sm mb-1 tracking-wide">{zone.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">{filter === 'all' ? 'Fused' : filter.charAt(0).toUpperCase() + filter.slice(1)} Score:</span>
                      <span className="text-xs font-bold" style={{ color: hexColor }}>{score}</span>
                    </div>
                  </div>
                </Tooltip>
                
                <Popup className="custom-popup">
                  <div className="bg-[rgba(3,3,3,0.95)] border border-white/[0.1] rounded-xl p-4 text-white font-sans min-w-[200px] shadow-2xl">
                    <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                    <div className="h-px w-full bg-white/[0.1] mb-3"></div>
                    
                    <div className="flex flex-col gap-2 text-sm text-white/80">
                      <div className="flex justify-between"><span>🌊 Flood Risk:</span> <span className="font-medium">{zone.flood}/100</span></div>
                      <div className="flex justify-between"><span>🌍 Earthquake Risk:</span> <span className="font-medium">{zone.quake}/100</span></div>
                      <div className="flex justify-between"><span>🌀 Cyclone Risk:</span> <span className="font-medium">{zone.cyclone}/100</span></div>
                    </div>
                    
                    <div className="h-px w-full bg-white/[0.1] my-3"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold">⚡ Fused Score:</span>
                      <span className="font-bold">{zone.fused}/100</span>
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeStyle(zone.level)} tracking-wide inline-block`}>
                        {zone.level.charAt(0).toUpperCase() + zone.level.slice(1)}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-[1000] bg-[rgba(3,3,3,0.85)] border border-white/[0.1] backdrop-blur-[10px] rounded-xl p-3 shadow-lg pointer-events-none">
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Risk Levels</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22C55E]"></div>
            <span className="text-sm text-white/80">Monitor <span className="text-white/40 text-xs">(0-30)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
            <span className="text-sm text-white/80">Advisory <span className="text-white/40 text-xs">(30-60)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
            <span className="text-sm text-white/80">Warning <span className="text-white/40 text-xs">(60-80)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
            <span className="text-sm text-white/80">Critical <span className="text-white/40 text-xs">(80-100)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
