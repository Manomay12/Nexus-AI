import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useNexus } from '../../context/NexusContext';
import { CityZone } from '../../types/nexus';
import { 
  RotateCcw, 
  ShieldAlert, 
  Car
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Futuristic Cyberpunk Midnight Black styling for Google Maps
const CYBERPUNK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#05070e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0d18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#748ba7" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f0ff" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#091428" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#10b981" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#0044aa" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0066ff" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f0ff" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e1b4b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b5cf6" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#02040a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#02040a" }],
  },
];

interface GoogleMapsViewProps {
  heightClass?: string;
  onSelectZone?: (zone: CityZone) => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  heightClass = 'h-[640px]',
  onSelectZone,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { currentEvent, zones, selectedZone, setSelectedZone } = useNexus();
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [trafficLayer, setTrafficLayer] = useState<any>(null);
  const [isTrafficActive, setIsTrafficActive] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Center coordinate mapping based on mega-event
  const getEventCenter = (): { lat: number; lng: number; zoom: number } => {
    switch (currentEvent.id) {
      case 'mumbai-sports':
        return { lat: 19.0500, lng: 72.8400, zoom: 12 };
      case 'monaco-f1':
        return { lat: 43.7384, lng: 7.4246, zoom: 14 };
      case 'melbourne-cricket':
        return { lat: -37.8199, lng: 144.9834, zoom: 13 };
      case 'tomorrowland':
        return { lat: 51.0914, lng: 4.3854, zoom: 14 };
      default:
        return { lat: 19.0500, lng: 72.8400, zoom: 12 };
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      setOptions({
        key: GOOGLE_MAPS_API_KEY,
        v: 'weekly',
      });

      Promise.all([importLibrary('maps'), importLibrary('marker')])
        .then(([mapsLib]) => {
          if (!mapRef.current) return;
          const g = (window as any).google;
          if (!g || !g.maps) return;

          const centerConfig = getEventCenter();

          const map = new mapsLib.Map(mapRef.current, {
            center: { lat: centerConfig.lat, lng: centerConfig.lng },
            zoom: centerConfig.zoom,
            styles: CYBERPUNK_MAP_STYLE as any,
            mapTypeId: mapType,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          // Add Traffic Layer
          const traffic = new mapsLib.TrafficLayer();
          traffic.setMap(isTrafficActive ? map : null);
          setTrafficLayer(traffic);
          setMapInstance(map);

          // Add Zone Markers
          zones.forEach((zone) => {
            const markerColor =
              zone.riskLevel === 'CRITICAL' ? '#EF4444' :
              zone.riskLevel === 'HIGH' ? '#F59E0B' :
              zone.riskLevel === 'MODERATE' ? '#00F0FF' : '#10B981';

            // SVG Marker Icon
            const markerSvg = `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(markerColor)}"/><stop offset="100%" stop-color="#05070E"/></linearGradient></defs><path d="M19 0C8.5 0 0 8.5 0 19c0 14 19 29 19 29s19-15 19-29c0-10.5-8.5-19-19-19z" fill="url(%23g)" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="19" cy="19" r="7" fill="#FFFFFF"/></svg>`;

            const marker = new g.maps.Marker({
              position: { lat: zone.latLng[0], lng: zone.latLng[1] },
              map: map,
              title: zone.name,
              icon: {
                url: markerSvg,
                scaledSize: new g.maps.Size(34, 42),
                anchor: new g.maps.Point(17, 42),
              },
              animation: zone.riskLevel === 'CRITICAL' ? g.maps.Animation.BOUNCE : undefined,
            });

            // InfoWindow
            const infoWindow = new g.maps.InfoWindow({
              content: `
                <div style="background:#0a0e1a; color:#f8fafc; padding:12px; border-radius:12px; font-family:'Outfit',sans-serif; border:1px solid rgba(0,240,255,0.4); max-width:220px;">
                  <div style="font-size:10px; color:#00f0ff; font-family:monospace; text-transform:uppercase; font-weight:bold;">${zone.district}</div>
                  <div style="font-size:13px; font-weight:bold; margin-top:2px; color:#ffffff;">${zone.name}</div>
                  <div style="margin-top:6px; font-size:11px; color:#cbd5e1;">
                    Pressure: <strong style="color:${markerColor}; font-size:12px;">${zone.currentPressure}% (${zone.riskLevel})</strong><br/>
                    Hotel: <strong>${zone.hotelCapacityPercent}%</strong> • Transit: <strong>${zone.transportLoadPercent}%</strong>
                  </div>
                  <div style="margin-top:6px; font-size:10px; color:#94a3b8;">${zone.recommendedAction}</div>
                </div>
              `,
            });

            marker.addListener('click', () => {
              soundFx.playClick();
              setSelectedZone(zone);
              if (onSelectZone) onSelectZone(zone);
              infoWindow.open(map, marker);
            });
          });

          // Draw Arterial Transit Corridors Polylines
          const transitCoords = zones.map((z) => ({ lat: z.latLng[0], lng: z.latLng[1] }));
          const transitLine = new g.maps.Polyline({
            path: transitCoords,
            geodesic: true,
            strokeColor: '#00f0ff',
            strokeOpacity: 0.7,
            strokeWeight: 3.5,
          });
          transitLine.setMap(map);
        })
        .catch((err: any) => {
          setLoadError(err?.message || 'Failed to initialize Google Maps Platform');
        });
    } catch (err: any) {
      setLoadError(err?.message || 'Google Maps loader initialization error');
    }
  }, [currentEvent, mapType]);

  // Toggle Traffic Layer
  const handleToggleTraffic = () => {
    soundFx.playClick();
    if (trafficLayer && mapInstance) {
      if (isTrafficActive) {
        trafficLayer.setMap(null);
        setIsTrafficActive(false);
      } else {
        trafficLayer.setMap(mapInstance);
        setIsTrafficActive(true);
      }
    }
  };

  // Switch Map Type
  const handleToggleMapType = (type: 'roadmap' | 'hybrid') => {
    soundFx.playClick();
    setMapType(type);
    if (mapInstance) {
      mapInstance.setMapTypeId(type);
    }
  };

  const handleRecenter = () => {
    soundFx.playClick();
    if (mapInstance) {
      const c = getEventCenter();
      mapInstance.setCenter({ lat: c.lat, lng: c.lng });
      mapInstance.setZoom(c.zoom);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#05070e] shadow-2xl`}>
      {/* Google Maps Canvas Element */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Top HUD: Google Maps Telemetry & Layer Overlays */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-3 border border-cyan-500/30 shadow-glow-cyan">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              GOOGLE MAPS PLATFORM // LIVE GEOSPATIAL
            </span>
            <span className="text-xs font-bold text-white font-display">
              {currentEvent.location}
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Traffic Layer Toggle */}
        <button
          onClick={handleToggleTraffic}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all glass-panel border ${
            isTrafficActive 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-glow-warning' 
              : 'text-slate-400 hover:text-white border-white/10'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Live Traffic: {isTrafficActive ? 'ON' : 'OFF'}</span>
        </button>

        {/* Roadmap vs Satellite Toggle */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 border border-white/10">
          <button
            onClick={() => handleToggleMapType('roadmap')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              mapType === 'roadmap' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cyber Dark
          </button>
          <button
            onClick={() => handleToggleMapType('hybrid')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              mapType === 'hybrid' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Re-center button */}
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="p-2 rounded-xl glass-panel text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Error Fallback Notice if any */}
      {loadError && (
        <div className="absolute inset-0 bg-[#05070e]/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Google Maps Platform Notice</h4>
          <p className="text-xs text-slate-300 max-w-md mb-3">{loadError}</p>
          <span className="text-[10px] font-mono text-cyan-300">
            Falling back to 3D Digital Twin or Vector Radar view.
          </span>
        </div>
      )}

      {/* Bottom Floating Sector Details Panel */}
      {selectedZone && (
        <div className="absolute bottom-4 right-4 z-10 glass-panel p-4 rounded-2xl border border-cyan-500/40 max-w-sm w-full shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">{selectedZone.district}</span>
              <h4 className="text-sm font-bold text-white font-display">{selectedZone.name}</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              selectedZone.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
              selectedZone.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {selectedZone.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
            <div className="p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400 text-[10px] block">HOTEL OCCUPANCY</span>
              <span className="text-white font-bold">{selectedZone.hotelCapacityPercent}%</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400 text-[10px] block">TRANSIT LOAD</span>
              <span className="text-white font-bold">{selectedZone.transportLoadPercent}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedZone.aiSummary}</p>
        </div>
      )}
    </div>
  );
};
