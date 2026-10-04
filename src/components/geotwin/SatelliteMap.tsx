import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GeoLocationEntity, 
  RiskZone, 
  TrafficCorridor, 
  GeoTwinLayerConfig, 
  GeoScenario 
} from '../../types/geoTwin';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  MapPin, 
  Layers, 
  ShieldAlert,
  Navigation,
  Activity
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface SatelliteMapProps {
  venues: GeoLocationEntity[];
  hotels: GeoLocationEntity[];
  transport: GeoLocationEntity[];
  trafficCorridors: TrafficCorridor[];
  riskZones: RiskZone[];
  layers: GeoTwinLayerConfig;
  scenario: GeoScenario;
  timeOffset: number;
  selectedEntity: GeoLocationEntity | null;
  onSelectEntity: (entity: GeoLocationEntity | null) => void;
  className?: string;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  venues,
  hotels,
  transport,
  trafficCorridors,
  riskZones,
  layers,
  scenario,
  timeOffset,
  selectedEntity,
  onSelectEntity,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapEngine, setMapEngine] = useState<'mapbox' | 'orbital_canvas'>('orbital_canvas');
  const [zoomLevel, setZoomLevel] = useState<number>(13.5);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<GeoLocationEntity | null>(null);

  // Mapbox GL instance reference if active
  const mapboxInstance = useRef<any>(null);

  // Center coordinates (BKC Mumbai: [72.8683, 19.0657])
  const centerCoord: [number, number] = [72.8683, 19.0657];

  // Try initializing Mapbox GL if token exists
  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken.trim() === '' || mapboxToken === 'your_mapbox_token_here') {
      setMapEngine('orbital_canvas');
      return;
    }

    let isMounted = true;

    const initMapbox = async () => {
      try {
        const mapboxglModule = await import('mapbox-gl');
        const mapboxgl = mapboxglModule.default || mapboxglModule;
        (mapboxgl as any).accessToken = mapboxToken;

        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: centerCoord,
          zoom: 13.8,
          pitch: 55,
          bearing: -17
        });

        map.on('load', () => {
          if (!isMounted) return;
          mapboxInstance.current = map;
          setMapEngine('mapbox');

          // Add 3D building extrusions
          const layersList = map.getStyle().layers;
          const labelLayerId = layersList?.find(
            (l: any) => l.type === 'symbol' && l.layout && l.layout['text-field']
          )?.id;

          if (!map.getLayer('3d-buildings')) {
            map.addLayer(
              {
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 14,
                paint: {
                  'fill-extrusion-color': '#06b6d4',
                  'fill-extrusion-height': ['get', 'height'],
                  'fill-extrusion-base': ['get', 'min_height'],
                  'fill-extrusion-opacity': 0.65
                }
              },
              labelLayerId
            );
          }
        });

        map.on('error', () => {
          console.warn('[MAPBOX] Mapbox failed to authenticate or load tiles, falling back to Orbital Canvas Engine');
          setMapEngine('orbital_canvas');
        });
      } catch (err) {
        console.warn('[MAPBOX] Mapbox GL dynamic load error:', err);
        setMapEngine('orbital_canvas');
      }
    };

    initMapbox();

    return () => {
      isMounted = false;
      if (mapboxInstance.current) {
        mapboxInstance.current.remove();
        mapboxInstance.current = null;
      }
    };
  }, []);

  // Update Mapbox 3D buildings visibility when layers.buildings3d toggles
  useEffect(() => {
    if (mapEngine === 'mapbox' && mapboxInstance.current && mapboxInstance.current.getLayer('3d-buildings')) {
      mapboxInstance.current.setLayoutProperty(
        '3d-buildings',
        'visibility',
        layers.buildings3d ? 'visible' : 'none'
      );
    }
  }, [layers.buildings3d, mapEngine]);

  // High-fidelity Orbital Canvas Rendering Loop
  useEffect(() => {
    if (mapEngine !== 'orbital_canvas') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseAngle = 0;

    // Set canvas dimensions to parent
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Coordinate projection: Lon/Lat -> Screen X/Y
    const project = (coord: [number, number], width: number, height: number) => {
      const lonScale = 14000 * Math.pow(2, zoomLevel - 13.5);
      const latScale = 14000 * Math.pow(2, zoomLevel - 13.5);

      const x = width / 2 + (coord[0] - centerCoord[0]) * lonScale + panOffset.x;
      const y = height / 2 - (coord[1] - centerCoord[1]) * latScale + panOffset.y;
      return { x, y };
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      pulseAngle += 0.04;

      // 1. Futuristic Dark Satellite Background & Coastal Geometry
      ctx.clearRect(0, 0, width, height);

      // Deep space / ocean backdrop
      ctx.fillStyle = '#050813';
      ctx.fillRect(0, 0, width, height);

      // Coastal and Land Contour
      ctx.fillStyle = '#081024';
      ctx.beginPath();
      // Simulated coastline curve
      const p1 = project([72.81, 18.90], width, height);
      const p2 = project([72.82, 19.04], width, height);
      const p3 = project([72.84, 19.12], width, height);
      const p4 = project([72.86, 19.20], width, height);
      const p5 = project([72.95, 19.20], width, height);
      const p6 = project([72.95, 18.90], width, height);

      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      ctx.lineTo(p5.x, p5.y);
      ctx.lineTo(p6.x, p6.y);
      ctx.closePath();
      ctx.fill();

      // Satellite Imagery Grid Matrix
      if (layers.satellite) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.07)';
        ctx.lineWidth = 1;
        const gridSize = 40 * Math.pow(2, zoomLevel - 13.5);
        const offsetX = (panOffset.x % gridSize);
        const offsetY = (panOffset.y % gridSize);

        for (let x = offsetX; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = offsetY; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 2. 3D Building Extrusions (City Blocks)
      if (layers.buildings3d) {
        const blocks = [
          { coord: [72.8683, 19.0657] as [number, number], w: 60, h: 40, elevation: 28 },
          { coord: [72.8620, 19.0680] as [number, number], w: 50, h: 35, elevation: 20 },
          { coord: [72.8650, 19.0630] as [number, number], w: 45, h: 30, elevation: 24 },
          { coord: [72.8710, 19.0640] as [number, number], w: 55, h: 38, elevation: 32 },
          { coord: [72.8550, 19.0600] as [number, number], w: 40, h: 25, elevation: 18 }
        ];

        blocks.forEach(b => {
          const pt = project(b.coord, width, height);
          const elev = b.elevation * (zoomLevel / 13.5);

          // Base footprint
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1;
          ctx.fillRect(pt.x - b.w / 2, pt.y - b.h / 2, b.w, b.h);
          ctx.strokeRect(pt.x - b.w / 2, pt.y - b.h / 2, b.w, b.h);

          // 3D Isometric Roof extrusion
          ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
          ctx.fillRect(pt.x - b.w / 2, pt.y - b.h / 2 - elev, b.w, b.h);
          ctx.strokeRect(pt.x - b.w / 2, pt.y - b.h / 2 - elev, b.w, b.h);

          // Isometric edges
          ctx.beginPath();
          ctx.moveTo(pt.x - b.w / 2, pt.y - b.h / 2);
          ctx.lineTo(pt.x - b.w / 2, pt.y - b.h / 2 - elev);
          ctx.moveTo(pt.x + b.w / 2, pt.y - b.h / 2);
          ctx.lineTo(pt.x + b.w / 2, pt.y - b.h / 2 - elev);
          ctx.moveTo(pt.x - b.w / 2, pt.y + b.h / 2);
          ctx.lineTo(pt.x - b.w / 2, pt.y + b.h / 2 - elev);
          ctx.moveTo(pt.x + b.w / 2, pt.y + b.h / 2);
          ctx.lineTo(pt.x + b.w / 2, pt.y + b.h / 2 - elev);
          ctx.stroke();
        });
      }

      // 3. Traffic Corridors Layer
      if (layers.trafficPressure) {
        trafficCorridors.forEach(corridor => {
          const from = project(corridor.from_coord, width, height);
          const to = project(corridor.to_coord, width, height);

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);

          const isCritical = corridor.risk === 'CRITICAL' || corridor.congestion_level >= 85;
          ctx.strokeStyle = isCritical ? '#f43f5e' : corridor.risk === 'HIGH' ? '#f59e0b' : '#10b981';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Outer Glow
          ctx.strokeStyle = isCritical ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.2)';
          ctx.lineWidth = 10;
          ctx.stroke();
        });
      }

      // 4. Crowd Pressure Heatmap Rings
      if (layers.crowdPressure) {
        venues.forEach(v => {
          const pt = project(v.coordinates, width, height);
          const radius = (v.current_pressure || 60) * 1.2;

          const radGrad = ctx.createRadialGradient(pt.x, pt.y, 5, pt.x, pt.y, radius);
          radGrad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
          radGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)');
          radGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 5. AI Predicted Risk Hotspots Layer
      if (layers.aiRisk) {
        riskZones.forEach(zone => {
          const pt = project(zone.center, width, height);
          const pulse = Math.sin(pulseAngle) * 8;
          const radius = 45 + pulse;

          // Outer pulse ring
          ctx.strokeStyle = zone.risk_level === 'CRITICAL' ? 'rgba(244, 63, 94, 0.8)' : 'rgba(245, 158, 11, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Shaded risk disk
          ctx.fillStyle = zone.risk_level === 'CRITICAL' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.15)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Zone Tag text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`AI RISK: ${zone.name.split(' ')[0]}`, pt.x, pt.y - radius - 6);
        });
      }

      // 6. Entity Markers (Venues, Hotels, Transport)
      const allEntitiesToRender: GeoLocationEntity[] = [];
      if (layers.venues) allEntitiesToRender.push(...venues);
      if (layers.hotels) allEntitiesToRender.push(...hotels);
      if (layers.transport) allEntitiesToRender.push(...transport);

      allEntitiesToRender.forEach(entity => {
        const pt = project(entity.coordinates, width, height);
        const isSelected = selectedEntity?.id === entity.id;
        const isHovered = hoveredEntity?.id === entity.id;

        // Pin color determination
        let pinColor = '#06b6d4'; // default cyan
        if (entity.entity_type === 'venue') pinColor = '#8b5cf6'; // violet
        else if (entity.entity_type === 'hotel') pinColor = '#f59e0b'; // amber
        else if (['metro', 'rail', 'airport', 'bus_hub'].includes(entity.entity_type)) pinColor = '#10b981'; // emerald

        // Glow ring if selected or hovered
        if (isSelected || isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = pinColor;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Main node pin circle
        ctx.fillStyle = pinColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#050814';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // White core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(entity.name, pt.x, pt.y + 18);

        // Subtext with capacity or pressure
        if (entity.capacity) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px monospace';
          ctx.fillText(`${(entity.capacity / 1000).toFixed(0)}k PAX`, pt.x, pt.y + 28);
        }
      });

      // 7. Orbital Satellite Crosshairs in Center
      const centerPt = project(centerCoord, width, height);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerPt.x, centerPt.y, 35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerPt.x - 45, centerPt.y);
      ctx.lineTo(centerPt.x + 45, centerPt.y);
      ctx.moveTo(centerPt.x, centerPt.y - 45);
      ctx.lineTo(centerPt.x, centerPt.y + 45);
      ctx.stroke();

      // Scanline animation sweep
      const scanY = (Date.now() / 15) % height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY);
      scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, width, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    mapEngine,
    zoomLevel,
    panOffset,
    layers,
    venues,
    hotels,
    transport,
    trafficCorridors,
    riskZones,
    selectedEntity,
    hoveredEntity
  ]);

  // Handle Mouse Interactions for the Orbital Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Check hit test for hovering entities
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const lonScale = 14000 * Math.pow(2, zoomLevel - 13.5);
    const latScale = 14000 * Math.pow(2, zoomLevel - 13.5);

    const allEntities = [...venues, ...hotels, ...transport];
    const hit = allEntities.find(ent => {
      const x = rect.width / 2 + (ent.coordinates[0] - centerCoord[0]) * lonScale + panOffset.x;
      const y = rect.height / 2 - (ent.coordinates[1] - centerCoord[1]) * latScale + panOffset.y;
      const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return dist <= 14;
    });

    setHoveredEntity(hit || null);
    if (hit && !hoveredEntity) soundFx.playHover();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredEntity) {
      soundFx.playClick();
      onSelectEntity(hoveredEntity);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoomLevel(prev => Math.min(16, Math.max(11, prev + zoomDelta)));
  };

  // Quick navigation helpers
  const handleResetView = () => {
    soundFx.playClick();
    setZoomLevel(13.5);
    setPanOffset({ x: 0, y: 0 });
    if (mapboxInstance.current) {
      mapboxInstance.current.flyTo({ center: centerCoord, zoom: 13.8, pitch: 55, bearing: -17 });
    }
  };

  const handleFocusLocation = (coords: [number, number], zoom: number = 14.5) => {
    soundFx.playClick();
    if (mapboxInstance.current) {
      mapboxInstance.current.flyTo({ center: coords, zoom, pitch: 50 });
    } else {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const lonScale = 14000 * Math.pow(2, zoom - 13.5);
      const latScale = 14000 * Math.pow(2, zoom - 13.5);
      setZoomLevel(zoom);
      setPanOffset({
        x: -(coords[0] - centerCoord[0]) * lonScale,
        y: (coords[1] - centerCoord[1]) * latScale
      });
    }
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#050814] select-none ${className}`}>
      {/* Mapbox Container */}
      <div 
        ref={mapContainerRef} 
        className={`absolute inset-0 w-full h-full ${mapEngine === 'mapbox' ? 'block' : 'hidden'}`} 
      />

      {/* Interactive Orbital Canvas Container */}
      {mapEngine === 'orbital_canvas' && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Top Map HUD Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/15 bg-black/60 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-white font-bold">MUMBAI METROPOLE SECTOR</span>
          <span className="text-slate-400">|</span>
          <span className="text-cyan-300">ZOOM: {zoomLevel.toFixed(1)}x</span>
          <span className="text-slate-400">|</span>
          <span className="text-violet-300 uppercase">
            {mapEngine === 'mapbox' ? 'MAPBOX SATELLITE 3D' : 'ORBITAL RECON ENGINE'}
          </span>
        </div>
      </div>

      {/* Quick Location Navigation Hub */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => handleFocusLocation([72.8683, 19.0657], 14.5)}
          className="glass-panel px-2.5 py-1.5 rounded-xl text-xs font-mono bg-black/60 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-white/10 transition-colors"
        >
          JWCC BKC
        </button>
        <button
          onClick={() => handleFocusLocation([72.8258, 18.9322], 14.5)}
          className="glass-panel px-2.5 py-1.5 rounded-xl text-xs font-mono bg-black/60 hover:bg-violet-500/20 hover:text-violet-300 text-slate-300 border border-white/10 transition-colors"
        >
          Wankhede Stadium
        </button>
        <button
          onClick={() => handleFocusLocation([72.8744, 19.0896], 14.0)}
          className="glass-panel px-2.5 py-1.5 rounded-xl text-xs font-mono bg-black/60 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-white/10 transition-colors"
        >
          CSMIA Airport
        </button>
      </div>

      {/* Bottom Map Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            setZoomLevel(prev => Math.min(16, prev + 0.5));
          }}
          className="p-2 rounded-xl glass-panel bg-black/70 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setZoomLevel(prev => Math.max(11, prev - 0.5));
          }}
          className="p-2 rounded-xl glass-panel bg-black/70 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl glass-panel bg-black/70 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Recenter Map"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
