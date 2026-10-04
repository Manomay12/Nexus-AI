import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Marker, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: any[];
}

import { 
  GeoLocationEntity, 
  RiskZone, 
  TrafficCorridor, 
  GeoTwinLayerConfig, 
  GeoScenario,
  GeoVisualizationMode,
  GeoDestination
} from '../../types/geoTwin';

import { 
  MUMBAI_BUILDING_FOOTPRINTS, 
  MUMBAI_ROAD_CORRIDORS, 
  MUMBAI_CROWD_HEATMAP_POINTS, 
  MUMBAI_PREDICTED_FLOW_PATHS 
} from '../../data/mumbaiGeographicData';

import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  Compass, 
  Navigation, 
  Globe2, 
  Map as MapIcon, 
  Box, 
  Flame, 
  TrendingUp, 
  Radio, 
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import { GeoModeControls } from './GeoModeControls';
import { GeoDestinationSelector } from './GeoDestinationSelector';
import { soundFx } from '../../utils/audio';

interface GeoTwinMapProps {
  mode: GeoVisualizationMode;
  layers: GeoTwinLayerConfig;
  scenario: GeoScenario;
  timeOffset: number;
  selectedEntity: GeoLocationEntity | null;
  onSelectEntity: (entity: GeoLocationEntity | null) => void;
  venues: GeoLocationEntity[];
  hotels: GeoLocationEntity[];
  transport: GeoLocationEntity[];
  activeDestination?: GeoDestination;
  destinations?: GeoDestination[];
  onSelectDestination?: (destination: GeoDestination) => void;
  onResetFocus?: () => void;
  onAddCustomDestination?: (destination: GeoDestination) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  onChangeMode?: (mode: GeoVisualizationMode) => void;
  onToggleLayer?: (layerKey: keyof GeoTwinLayerConfig) => void;
  showFocusHotspot?: boolean;
  className?: string;
}

export const GeoTwinMap: React.FC<GeoTwinMapProps> = ({
  mode,
  layers,
  scenario,
  timeOffset,
  selectedEntity,
  onSelectEntity,
  venues,
  hotels,
  transport,
  activeDestination,
  destinations,
  onSelectDestination,
  onResetFocus,
  onAddCustomDestination,
  isFocusMode = false,
  onToggleFocusMode,
  onChangeMode,
  onToggleLayer,
  showFocusHotspot = false,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(14.6);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0657,
    lng: 72.8683
  });

  // Center on Bandra Kurla Complex (Jio World Convention Centre)
  const centerCoord: [number, number] = [72.8683, 19.0657];

  // Tile sources for authentic maps
  const ESRI_SATELLITE_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const CARTO_DARK_TILE = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png';

  // Resize MapLibre GL smoothly when Focus Mode toggles or layout shifts
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstance.current?.resize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFocusMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstance.current?.resize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Smooth camera flyTo when central activeDestination changes
  useEffect(() => {
    if (!mapInstance.current || !isMapReady || !activeDestination) return;

    mapInstance.current.flyTo({
      center: [activeDestination.longitude, activeDestination.latitude],
      zoom: activeDestination.zoom,
      pitch: activeDestination.pitch ?? 55,
      bearing: activeDestination.bearing ?? -15,
      duration: 1600,
      essential: true
    });

    setActiveCoords({
      lat: activeDestination.latitude,
      lng: activeDestination.longitude
    });
  }, [activeDestination, isMapReady]);

  // 1. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    let isMounted = true;

    try {
      const map = new Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [ESRI_SATELLITE_TILE],
              tileSize: 256,
              attribution: '© Esri, Maxar, Earthstar Geographics'
            },
            'carto-dark': {
              type: 'raster',
              tiles: [CARTO_DARK_TILE],
              tileSize: 256,
              attribution: '© CartoDB, OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'satellite-base',
              type: 'raster',
              source: 'esri-satellite',
              minzoom: 0,
              maxzoom: 20,
              paint: {
                'raster-opacity': 1.0,
                'raster-contrast': 0.1,
                'raster-saturation': 0.15
              }
            },
            {
              id: 'carto-dark-base',
              type: 'raster',
              source: 'carto-dark',
              minzoom: 0,
              maxzoom: 20,
              paint: {
                'raster-opacity': 0.0 // Toggle based on mode
              }
            }
          ]
        },
        center: centerCoord,
        zoom: 14.6,
        pitch: 52,
        bearing: -18,
        maxPitch: 75
      });

      map.on('load', () => {
        if (!isMounted) return;
        mapInstance.current = map;
        setIsMapReady(true);
        setupGeoJsonLayers(map);
      });

      map.on('move', () => {
        const c = map.getCenter();
        setActiveCoords({ lat: Number(c.lat.toFixed(4)), lng: Number(c.lng.toFixed(4)) });
        setZoomLevel(Number(map.getZoom().toFixed(1)));
      });

      map.on('error', (e: any) => {
        console.warn('[GEOTWIN MAP] Tile fetch notice:', e);
        setIsDemoMode(true);
      });
    } catch (err) {
      console.error('[GEOTWIN MAP] MapLibre initialization failure:', err);
      setIsDemoMode(true);
    }

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 2. Setup GeoJSON Sources & Layers
  const setupGeoJsonLayers = (map: Map) => {
    // A. 3D Buildings GeoJSON Source
    const buildingsGeoJson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: MUMBAI_BUILDING_FOOTPRINTS.map(b => ({
        type: 'Feature',
        id: b.id,
        properties: {
          id: b.id,
          name: b.name,
          height: b.height,
          base_height: b.baseHeight || 0,
          category: b.category,
          color: b.category === 'venue' ? '#8b5cf6' : b.category === 'hotel' ? '#f59e0b' : b.category === 'transit' ? '#10b981' : '#06b6d4'
        },
        geometry: {
          type: 'Polygon',
          coordinates: b.coordinates
        }
      }))
    };

    if (!map.getSource('mumbai-buildings')) {
      map.addSource('mumbai-buildings', {
        type: 'geojson',
        data: buildingsGeoJson
      });

      // 3D Extrusion Layer
      map.addLayer({
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'mumbai-buildings',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.85
        }
      });
    }

    // B. Real Road Corridors GeoJSON Source
    const roadsGeoJson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: MUMBAI_ROAD_CORRIDORS.map(r => ({
        type: 'Feature',
        id: r.id,
        properties: {
          name: r.name,
          congestion: r.congestion_level,
          risk: r.risk,
          color: r.risk === 'CRITICAL' ? '#f43f5e' : r.risk === 'HIGH' ? '#f59e0b' : '#10b981'
        },
        geometry: {
          type: 'LineString',
          coordinates: r.path || [r.from_coord, r.to_coord]
        }
      }))
    };

    if (!map.getSource('mumbai-roads')) {
      map.addSource('mumbai-roads', {
        type: 'geojson',
        data: roadsGeoJson
      });

      // Road glow buffer
      map.addLayer({
        id: 'roads-glow',
        type: 'line',
        source: 'mumbai-roads',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 8,
          'line-opacity': 0.35,
          'line-blur': 3
        }
      });

      // Sharp arterial line
      map.addLayer({
        id: 'roads-sharp',
        type: 'line',
        source: 'mumbai-roads',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
          'line-opacity': 0.95
        }
      });
    }

    // C. GPU Crowd Density Heatmap Source
    const crowdGeoJson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: MUMBAI_CROWD_HEATMAP_POINTS.map((pt, idx) => ({
        type: 'Feature',
        id: idx,
        properties: {
          weight: pt.weight
        },
        geometry: {
          type: 'Point',
          coordinates: pt.coordinates
        }
      }))
    };

    if (!map.getSource('mumbai-crowd')) {
      map.addSource('mumbai-crowd', {
        type: 'geojson',
        data: crowdGeoJson
      });

      // GPU Crowd Heatmap (Green -> Yellow -> Red gradient)
      map.addLayer({
        id: 'crowd-heatmap',
        type: 'heatmap',
        source: 'mumbai-crowd',
        maxzoom: 17,
        paint: {
          // Increase weight based on point weight property
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
          // Increase intensity as zoom level increases
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 16, 2.8],
          // Green = Low density, Yellow = Medium, Red = High risk
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 255, 128, 0)',
            0.2, 'rgba(16, 185, 129, 0.45)',  // Emerald Green
            0.5, 'rgba(245, 158, 11, 0.75)',  // Amber Yellow
            0.8, 'rgba(239, 68, 68, 0.92)',   // Crimson Red
            1.0, 'rgba(255, 0, 80, 1.0)'      // Deep Risk Scarlet
          ],
          // Heatmap radius based on zoom level
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 11, 15, 16, 45],
          'heatmap-opacity': 0.85
        }
      });
    }

    // D. Animated AI Predicted Movement Paths Source
    const flowGeoJson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: MUMBAI_PREDICTED_FLOW_PATHS.map(f => ({
        type: 'Feature',
        id: f.id,
        properties: {
          name: f.name,
          flowRate: f.flowRate,
          direction: f.direction,
          risk: f.congestionRisk,
          color: f.congestionRisk === 'CRITICAL' ? '#f43f5e' : f.congestionRisk === 'HIGH' ? '#f59e0b' : '#10b981'
        },
        geometry: {
          type: 'LineString',
          coordinates: f.path
        }
      }))
    };

    if (!map.getSource('mumbai-flow')) {
      map.addSource('mumbai-flow', {
        type: 'geojson',
        data: flowGeoJson
      });

      // Directional dashed flow layer
      map.addLayer({
        id: 'flow-arrows',
        type: 'line',
        source: 'mumbai-flow',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.9,
          'line-dasharray': [2, 3]
        }
      });
    }

    // E. Risk Zone Polygons (Translucent pulsing buffers)
    const riskZonesGeoJson: GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'BKC Core Axis', risk: 'CRITICAL', color: '#f43f5e' },
          geometry: {
            type: 'Polygon',
            coordinates: [generateCirclePolygon([72.8683, 19.0657], 0.65)]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Andheri Junction', risk: 'HIGH', color: '#f59e0b' },
          geometry: {
            type: 'Polygon',
            coordinates: [generateCirclePolygon([72.8468, 19.1197], 0.50)]
          }
        }
      ]
    };

    if (!map.getSource('mumbai-risk-zones')) {
      map.addSource('mumbai-risk-zones', {
        type: 'geojson',
        data: riskZonesGeoJson
      });

      map.addLayer({
        id: 'risk-zones-fill',
        type: 'fill',
        source: 'mumbai-risk-zones',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.22
        }
      });

      map.addLayer({
        id: 'risk-zones-outline',
        type: 'line',
        source: 'mumbai-risk-zones',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.8,
          'line-dasharray': [3, 2]
        }
      });
    }

    // Start dash animation loop for AI Prediction mode
    let dashOffset = 0;
    const animateFlow = () => {
      if (map.getLayer('flow-arrows')) {
        dashOffset = (dashOffset + 0.08) % 5;
        // Pulse opacity slightly
        const pulseOpacity = 0.75 + Math.sin(Date.now() / 300) * 0.2;
        map.setPaintProperty('flow-arrows', 'line-opacity', pulseOpacity);
      }
      animFrameRef.current = requestAnimationFrame(animateFlow);
    };
    animateFlow();
  };

  // Helper circle polygon generator
  function generateCirclePolygon(center: [number, number], radiusKm: number, points: number = 32): [number, number][] {
    const coords: [number, number][] = [];
    const distanceX = radiusKm / (111.320 * Math.cos(center[1] * (Math.PI / 180)));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = center[0] + distanceX * Math.cos(theta);
      const y = center[1] + distanceY * Math.sin(theta);
      coords.push([Number(x.toFixed(6)), Number(y.toFixed(6))]);
    }
    return coords;
  }

  // 3. Synchronize Mode & Camera Transitions
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapReady) return;

    soundFx.playClick();

    switch (mode) {
      case 'satellite':
        // High-resolution real satellite basemap
        if (map.getLayer('satellite-base')) map.setPaintProperty('satellite-base', 'raster-opacity', 1.0);
        if (map.getLayer('carto-dark-base')) map.setPaintProperty('carto-dark-base', 'raster-opacity', 0.0);
        map.flyTo({
          center: centerCoord,
          zoom: 14.8,
          pitch: 45,
          bearing: -15,
          duration: 1800
        });
        break;

      case 'map':
        // Geographic dark streets & road labels
        if (map.getLayer('satellite-base')) map.setPaintProperty('satellite-base', 'raster-opacity', 0.15);
        if (map.getLayer('carto-dark-base')) map.setPaintProperty('carto-dark-base', 'raster-opacity', 1.0);
        map.flyTo({
          center: centerCoord,
          zoom: 14.2,
          pitch: 20,
          bearing: 0,
          duration: 1600
        });
        break;

      case '3d_twin':
        // Volumetric 3D building extrusions
        if (map.getLayer('satellite-base')) map.setPaintProperty('satellite-base', 'raster-opacity', 0.7);
        if (map.getLayer('carto-dark-base')) map.setPaintProperty('carto-dark-base', 'raster-opacity', 0.3);
        map.flyTo({
          center: [72.8683, 19.0657],
          zoom: 15.6,
          pitch: 62, // 60° cinematic 3D pitch
          bearing: 32,
          duration: 2000
        });
        break;

      case 'heatmap':
        // Spotlight GPU crowd density
        if (map.getLayer('satellite-base')) map.setPaintProperty('satellite-base', 'raster-opacity', 0.45);
        if (map.getLayer('carto-dark-base')) map.setPaintProperty('carto-dark-base', 'raster-opacity', 0.55);
        map.flyTo({
          center: [72.8675, 19.0655],
          zoom: 15.0,
          pitch: 35,
          bearing: -10,
          duration: 1600
        });
        break;

      case 'ai_prediction':
        // Highlight directional evacuation vectors
        if (map.getLayer('satellite-base')) map.setPaintProperty('satellite-base', 'raster-opacity', 0.65);
        if (map.getLayer('carto-dark-base')) map.setPaintProperty('carto-dark-base', 'raster-opacity', 0.35);
        map.flyTo({
          center: [72.8660, 19.0645],
          zoom: 15.2,
          pitch: 52,
          bearing: 45,
          duration: 1800
        });
        break;
    }
  }, [mode, isMapReady]);

  // 4. Synchronize Layer Toggles
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapReady) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    // Satellite Imagery
    const showSatellite = layers.satelliteImagery !== false && (layers.satellite !== false);
    if (map.getLayer('satellite-base')) {
      map.setPaintProperty('satellite-base', 'raster-opacity', showSatellite ? (mode === 'map' ? 0.2 : 1.0) : 0.0);
    }

    // Buildings 3D
    const showBuildings = (layers.buildings !== false && layers.buildings3d !== false) || mode === '3d_twin';
    setVisibility('buildings-3d', showBuildings);

    // Roads & Corridors
    const showRoads = (layers.roads !== false && layers.traffic !== false);
    setVisibility('roads-glow', showRoads);
    setVisibility('roads-sharp', showRoads);

    // Crowd Density Heatmap
    const showCrowd = (layers.crowdDensity !== false && layers.crowdPressure !== false) || mode === 'heatmap';
    setVisibility('crowd-heatmap', showCrowd);

    // Predicted Movement Flow Arrows
    const showFlow = (layers.predictedMovement !== false) || mode === 'ai_prediction';
    setVisibility('flow-arrows', showFlow);

    // Risk Zones
    const showRisk = (layers.riskZones !== false && layers.aiRisk !== false);
    setVisibility('risk-zones-fill', showRisk);
    setVisibility('risk-zones-outline', showRisk);
  }, [layers, mode, isMapReady]);

  // 5. Render Interactive HTML Markers for Venues, Hotels, Transit
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapReady) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (layers.venues === false) return;

    const allEntities = [...venues, ...hotels, ...transport];

    allEntities.forEach(entity => {
      const isSelected = selectedEntity?.id === entity.id;

      // Pin color determined by entity type
      let borderColor = '#06b6d4'; // Cyan default
      let bgGrad = 'from-cyan-500/80 to-blue-600/80';
      if (entity.entity_type === 'venue') {
        borderColor = '#8b5cf6';
        bgGrad = 'from-violet-500 to-purple-700';
      } else if (entity.entity_type === 'hotel') {
        borderColor = '#f59e0b';
        bgGrad = 'from-amber-500 to-orange-600';
      } else if (['metro', 'rail', 'airport', 'bus_hub'].includes(entity.entity_type)) {
        borderColor = '#10b981';
        bgGrad = 'from-emerald-500 to-teal-700';
      }

      // Marker element
      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none transition-transform hover:scale-110';
      el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1.0)';

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <!-- Pulse Ring if Selected -->
          ${isSelected ? `
            <span class="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-cyan-400 opacity-60 animate-ping"></span>
          ` : ''}

          <!-- Pin Icon Dot -->
          <div class="w-5 h-5 rounded-full bg-gradient-to-br ${bgGrad} border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white font-bold">
            ${entity.entity_type === 'venue' ? '★' : entity.entity_type === 'hotel' ? 'H' : 'T'}
          </div>

          <!-- Label Card -->
          <div class="mt-1 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] font-bold whitespace-nowrap shadow-xl flex items-center gap-1">
            <span>${entity.name.split(' ')[0]}</span>
            ${entity.current_pressure ? `<span class="text-cyan-300 font-bold">${entity.current_pressure}%</span>` : ''}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        soundFx.playClick();
        onSelectEntity(entity);
        // Smoothly zoom camera to selected entity
        mapInstance.current?.flyTo({
          center: entity.coordinates as [number, number],
          zoom: 16.2,
          pitch: 58,
          duration: 1200
        });
      });

      const marker = new Marker({ element: el })
        .setLngLat(entity.coordinates as LngLatLike)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [venues, hotels, transport, selectedEntity, isMapReady, layers.venues]);

  // Quick focus helpers
  const handleFocus = (coords: [number, number], zoom: number = 15.4, pitch: number = 55) => {
    soundFx.playClick();
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: coords,
        zoom,
        pitch,
        duration: 1500
      });
    }
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    if (onResetFocus) {
      onResetFocus();
    } else if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: centerCoord,
        zoom: 14.6,
        pitch: 52,
        bearing: -18,
        duration: 1400
      });
    }
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#050814] select-none ${className}`}>
      {/* MapLibre Map Container (z-index: 0) */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0" 
      />

      {/* Top HUD: Spatial Status & GPS Coordinates (z-index: 30) */}
      <div 
        className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto"
        style={{ zIndex: 30 }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-white/15 bg-black/75 backdrop-blur-md flex items-center gap-2.5 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan"></span>
          <span className="text-white font-extrabold tracking-wider">MUMBAI SPATIAL SECTOR</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-bold">
            [{activeCoords.lat.toFixed(4)}°N, {activeCoords.lng.toFixed(4)}°E]
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">ZOOM: {zoomLevel}x</span>
          <span className="text-slate-500">|</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {mode.toUpperCase()} MODE
          </span>
        </div>

        {/* Demo Mode or Live Satellite Indicator */}
        {isDemoMode ? (
          <div className="glass-panel px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/60 backdrop-blur-md flex items-center gap-1.5 text-amber-300 text-[10px] font-mono font-bold">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>DEMO MODE (SYNTHETIC SATELLITE CACHE)</span>
          </div>
        ) : (
          <div className="glass-panel px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 backdrop-blur-md flex items-center gap-1.5 text-emerald-300 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>REAL SATELLITE BASEMAP</span>
          </div>
        )}
      </div>

      {/* Top Right Destination Chips & Focus Map Button (Only in Normal View) */}
      {!isFocusMode && (
        <div 
          className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-auto"
          style={{ zIndex: 60 }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {destinations && activeDestination && onSelectDestination && onResetFocus && (
            <GeoDestinationSelector
              destinations={destinations}
              activeDestination={activeDestination}
              onSelectDestination={onSelectDestination}
              onResetFocus={onResetFocus}
              onAddCustomDestination={onAddCustomDestination}
              compact={false}
            />
          )}

          {/* Dedicated Focus Map / Maximize Satellite Button */}
          <div className="relative ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onToggleFocusMode?.();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="glass-panel px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 hover:text-cyan-100 border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center gap-1.5 shadow-glow-cyan group cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400"
              title="Maximize Satellite View (Press 'M')"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>FOCUS MAP</span>
            </button>

            {/* First-time guidance hotspot beacon */}
            {showFocusHotspot && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none" title="Explore satellite view in full screen">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute" />
                <span className="w-2 h-2 rounded-full bg-cyan-300 relative shadow-glow-cyan" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Focus Mode Command Chrome (When in Focus Mode - z-index: 60) */}
      {isFocusMode && (
        <div 
          className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none animate-fadeIn"
          style={{ zIndex: 60 }}
        >
          {/* Left: Exit Focus */}
          <div 
            className="flex items-center gap-2 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onToggleFocusMode?.();
              }}
              className="glass-panel px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-black/85 hover:bg-white/10 text-slate-200 hover:text-white border border-white/20 transition-all flex items-center gap-2 shadow-2xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>← Exit Focus</span>
              <kbd className="px-1.5 py-0.2 rounded text-[9px] bg-white/10 text-slate-400 font-normal">ESC</kbd>
            </button>
          </div>

          {/* Center: Mode Switcher in Focus Mode */}
          {onChangeMode && (
            <div 
              className="pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GeoModeControls
                currentMode={mode}
                onChangeMode={onChangeMode}
                compact={true}
              />
            </div>
          )}

          {/* Right: Destination Chips & Layer Toggles in Focus Mode */}
          <div 
            className="flex items-center gap-2 pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {destinations && activeDestination && onSelectDestination && onResetFocus && (
              <GeoDestinationSelector
                destinations={destinations}
                activeDestination={activeDestination}
                onSelectDestination={onSelectDestination}
                onResetFocus={onResetFocus}
                onAddCustomDestination={onAddCustomDestination}
                compact={false}
              />
            )}

            {/* Quick Layer Toggles in Focus Mode */}
            {onToggleLayer && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playClick();
                    onToggleLayer('crowdDensity');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all cursor-pointer ${
                    layers.crowdDensity ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-black/70 text-slate-400 border-white/10'
                  }`}
                >
                  Heatmap: {layers.crowdDensity ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playClick();
                    onToggleLayer('riskZones');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all cursor-pointer ${
                    layers.riskZones ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-black/70 text-slate-400 border-white/10'
                  }`}
                >
                  Risk Zones: {layers.riskZones ? 'ON' : 'OFF'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Map Navigation Controls (Floating Map UI - z-index: 30) */}
      <div 
        className="absolute bottom-4 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            soundFx.playClick();
            mapInstance.current?.zoomIn();
          }}
          className="p-2.5 rounded-xl glass-panel bg-black/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            mapInstance.current?.zoomOut();
          }}
          className="p-2.5 rounded-xl glass-panel bg-black/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl glass-panel bg-black/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 transition-colors shadow-lg"
          title="Recenter Sector"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
