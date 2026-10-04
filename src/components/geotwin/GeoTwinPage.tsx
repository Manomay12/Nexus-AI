import React, { useState, useEffect, useCallback } from 'react';
import { 
  GeoLocationEntity, 
  RiskZone, 
  TrafficCorridor, 
  GeoTwinLayerConfig, 
  GeoScenario,
  GeoVisualizationMode,
  GeoDestination
} from '../../types/geoTwin';
import { geoApi } from '../../services/geoApiService';
import { 
  MUMBAI_OPERATIONAL_VENUES, 
  MUMBAI_OPERATIONAL_HOTELS, 
  MUMBAI_OPERATIONAL_TRANSIT, 
  MUMBAI_ROAD_CORRIDORS, 
  MUMBAI_RISK_ZONES,
  MUMBAI_DEFAULT_DESTINATIONS
} from '../../data/mumbaiGeographicData';

import { GeoTwinMap } from './GeoTwinMap';
import { GeoModeControls } from './GeoModeControls';
import { GeoLayerControls } from './GeoLayerControls';
import { GeoInsightsPanel } from './GeoInsightsPanel';
import { PredictionTimeline } from './PredictionTimeline';
import { GeoSimulationControls } from './GeoSimulationControls';
import { LocationIntelligenceCard } from './LocationIntelligenceCard';
import { DependencyNetwork } from './DependencyNetwork';
import { NexusTips } from './NexusTips';

import { 
  Globe, 
  Layers, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Maximize2,
  Minimize2,
  X,
  Keyboard,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFx } from '../../utils/audio';

export const GeoTwinPage: React.FC = () => {
  // Visualization mode: 'satellite' | 'map' | '3d_twin' | 'heatmap' | 'ai_prediction'
  const [mode, setMode] = useState<GeoVisualizationMode>('satellite');

  // Layer configuration
  const [layers, setLayers] = useState<GeoTwinLayerConfig>({
    satelliteImagery: true,
    buildings: true,
    roads: true,
    venues: true,
    crowdDensity: true,
    traffic: true,
    riskZones: true,
    predictedMovement: true,
    // Aliases
    satellite: true,
    buildings3d: true,
    hotels: true,
    transport: true,
    crowdPressure: true,
    trafficPressure: true,
    aiRisk: true,
    weatherImpact: false,
    dependencyNetwork: false
  });

  // State for simulation & time
  const [scenario, setScenario] = useState<GeoScenario>('normal');
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<GeoLocationEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Centralized active destination state for map, camera, HUD & AI intelligence
  const [destinations, setDestinations] = useState<GeoDestination[]>(MUMBAI_DEFAULT_DESTINATIONS);
  const [activeDestination, setActiveDestination] = useState<GeoDestination>(MUMBAI_DEFAULT_DESTINATIONS[0]);

  // Layout refinement states
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isLayersCollapsed, setIsLayersCollapsed] = useState<boolean>(false);
  const [isScenarioTrayOpen, setIsScenarioTrayOpen] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // Entities state grounded in authentic Mumbai coordinates
  const [venues, setVenues] = useState<GeoLocationEntity[]>(MUMBAI_OPERATIONAL_VENUES);
  const [hotels, setHotels] = useState<GeoLocationEntity[]>(MUMBAI_OPERATIONAL_HOTELS);
  const [transport, setTransport] = useState<GeoLocationEntity[]>(MUMBAI_OPERATIONAL_TRANSIT);
  const [trafficCorridors, setTrafficCorridors] = useState<TrafficCorridor[]>(MUMBAI_ROAD_CORRIDORS);
  const [riskZones, setRiskZones] = useState<RiskZone[]>(MUMBAI_RISK_ZONES);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Check whether tips/hotspots were dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('nexus_geotwin_tips_dismissed');
      if (dismissed === 'true') {
        setShowHotspots(false);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch live backend data if available
  useEffect(() => {
    let isMounted = true;
    const loadGeoData = async () => {
      try {
        const data = await geoApi.fetchLocations();
        if (isMounted && data) {
          if (data.venues && data.venues.length > 0) setVenues(data.venues);
          if (data.hotels && data.hotels.length > 0) setHotels(data.hotels);
          if (data.transport && data.transport.length > 0) setTransport(data.transport);
          if (data.traffic_corridors && data.traffic_corridors.length > 0) setTrafficCorridors(data.traffic_corridors);
          if (data.risk_zones && data.risk_zones.length > 0) setRiskZones(data.risk_zones);
          setIsBackendConnected(true);
        }
      } catch (err) {
        console.warn('[GEO-TWIN] Using authentic local Mumbai spatial dataset:', err);
      }
    };

    loadGeoData();
    return () => { isMounted = false; };
  }, []);

  // Update dynamic pressure multipliers when scenario or time changes
  useEffect(() => {
    const timeMult = 1.0 + (timeOffset / 60) * 0.18;
    const scenarioMult = 
      scenario === 'early_exit' ? 1.25 : 
      scenario === 'heavy_rain' ? 1.30 : 
      scenario === 'metro_disruption' ? 1.35 : 
      scenario === 'hotel_saturation' ? 1.15 : 1.0;

    // Dynamically adjust venue pressures
    setVenues(MUMBAI_OPERATIONAL_VENUES.map(v => ({
      ...v,
      current_pressure: Math.min(100, Math.round((v.current_pressure || 75) * timeMult * scenarioMult)),
      predicted_pressure: Math.min(100, Math.round((v.predicted_pressure || 85) * timeMult * scenarioMult))
    })));

    // Dynamically adjust corridor congestion
    setTrafficCorridors(MUMBAI_ROAD_CORRIDORS.map(c => ({
      ...c,
      congestion_level: Math.min(100, Math.round(c.congestion_level * (scenario === 'heavy_rain' ? 1.24 : timeMult))),
      risk: c.congestion_level > 80 ? 'CRITICAL' : c.congestion_level > 65 ? 'HIGH' : 'STABLE'
    })));
  }, [scenario, timeOffset]);

  // Central Destination Selection & Camera Dispatch
  const handleSelectDestination = useCallback((dest: GeoDestination) => {
    setActiveDestination(dest);
    // Associate with matching entity if exists
    const matchingVenue = venues.find(v => 
      v.id.toLowerCase().includes(dest.id.toLowerCase()) || 
      dest.id.toLowerCase().includes(v.id.toLowerCase()) || 
      v.name.toLowerCase().includes(dest.shortName.toLowerCase())
    );
    if (matchingVenue) {
      setSelectedEntity(matchingVenue);
    } else {
      const matchingHotel = hotels.find(h => 
        h.id.toLowerCase().includes(dest.id.toLowerCase()) || 
        h.name.toLowerCase().includes(dest.shortName.toLowerCase())
      );
      if (matchingHotel) {
        setSelectedEntity(matchingHotel);
      } else {
        const matchingTransit = transport.find(t => 
          t.id.toLowerCase().includes(dest.id.toLowerCase()) || 
          t.name.toLowerCase().includes(dest.shortName.toLowerCase())
        );
        if (matchingTransit) {
          setSelectedEntity(matchingTransit);
        }
      }
    }
    showToast(`Focus Relocated: ${dest.name.toUpperCase()}`);
  }, [venues, hotels, transport]);

  const handleResetFocus = useCallback(() => {
    setActiveDestination(MUMBAI_DEFAULT_DESTINATIONS[0]);
    setSelectedEntity(null);
    setScenario('normal');
    setTimeOffset(0);
    showToast('Sector map and simulation reset to baseline (JWCC BKC)');
  }, []);

  const handleAddCustomDestination = useCallback((newDest: GeoDestination) => {
    setDestinations(prev => {
      if (prev.some(d => d.id === newDest.id)) return prev;
      return [...prev, newDest];
    });
    setActiveDestination(newDest);
    showToast(`Added Destination: ${newDest.name}`);
  }, []);

  // Keyboard Shortcuts Handler: M, L, S, R, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in an input
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case 'm':
        case 'M':
          e.preventDefault();
          soundFx.playClick();
          setIsFocusMode(prev => !prev);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          soundFx.playClick();
          setIsLayersCollapsed(prev => !prev);
          break;
        case 's':
        case 'S':
          e.preventDefault();
          soundFx.playClick();
          setIsScenarioTrayOpen(prev => !prev);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          soundFx.playClick();
          handleResetFocus();
          break;
        case 'Escape':
          e.preventDefault();
          if (isFocusMode) {
            soundFx.playClick();
            setIsFocusMode(false);
          } else if (isScenarioTrayOpen) {
            soundFx.playClick();
            setIsScenarioTrayOpen(false);
          } else if (selectedEntity) {
            soundFx.playClick();
            setSelectedEntity(null);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, isScenarioTrayOpen, selectedEntity]);

  const handleToggleLayer = (key: keyof GeoTwinLayerConfig) => {
    setLayers(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Sync aliases
      if (key === 'satelliteImagery') next.satellite = next.satelliteImagery;
      if (key === 'buildings') next.buildings3d = next.buildings;
      if (key === 'crowdDensity') next.crowdPressure = next.crowdDensity;
      if (key === 'traffic') next.trafficPressure = next.traffic;
      if (key === 'riskZones') next.aiRisk = next.riskZones;
      return next;
    });
  };

  const handleSetAllLayers = (enable: boolean) => {
    setLayers({
      satelliteImagery: enable,
      buildings: enable,
      roads: enable,
      venues: enable,
      crowdDensity: enable,
      traffic: enable,
      riskZones: enable,
      predictedMovement: enable,
      satellite: enable,
      buildings3d: enable,
      hotels: enable,
      transport: enable,
      crowdPressure: enable,
      trafficPressure: enable,
      aiRisk: enable,
      weatherImpact: enable,
      dependencyNetwork: false
    });
  };

  const handleModeChange = (newMode: GeoVisualizationMode) => {
    setMode(newMode);
    // Automatically enable relevant layer on mode activation
    setLayers(prev => ({
      ...prev,
      satelliteImagery: newMode === 'satellite' ? true : prev.satelliteImagery,
      buildings: newMode === '3d_twin' ? true : prev.buildings,
      buildings3d: newMode === '3d_twin' ? true : prev.buildings3d,
      crowdDensity: newMode === 'heatmap' ? true : prev.crowdDensity,
      predictedMovement: newMode === 'ai_prediction' ? true : prev.predictedMovement
    }));
    showToast(`Visualization Mode Switched: ${newMode.toUpperCase()}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // IMMERSIVE FULL-SCREEN FOCUS MAP MODE
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#05070E] flex flex-col overflow-hidden text-slate-100 select-none animate-fadeIn">
        {/* Fullscreen Map Canvas */}
        <GeoTwinMap
          mode={mode}
          layers={layers}
          scenario={scenario}
          timeOffset={timeOffset}
          selectedEntity={selectedEntity}
          onSelectEntity={(ent) => setSelectedEntity(ent)}
          venues={venues}
          hotels={hotels}
          transport={transport}
          activeDestination={activeDestination}
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
          onResetFocus={handleResetFocus}
          onAddCustomDestination={handleAddCustomDestination}
          isFocusMode={true}
          onToggleFocusMode={() => setIsFocusMode(false)}
          onChangeMode={handleModeChange}
          onToggleLayer={handleToggleLayer}
          className="w-full h-full"
        />

        {/* Floating Selected Entity Card */}
        {selectedEntity && (
          <div className="absolute top-20 right-6 z-40 pointer-events-auto">
            <LocationIntelligenceCard
              entity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
              onDispatchAction={(action) => showToast(action)}
            />
          </div>
        )}

        {/* Floating Bottom Minimal Control Deck in Focus Mode */}
        <div className="absolute bottom-4 left-4 right-4 z-40 pointer-events-auto flex flex-col items-center gap-2 max-w-2xl mx-auto">
          <PredictionTimeline
            timeOffset={timeOffset}
            onChangeTimeOffset={(val) => setTimeOffset(val)}
            compact={true}
            className="w-full"
          />
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[200] glass-panel border border-cyan-500/50 bg-[#05091a]/95 px-4 py-2.5 rounded-2xl shadow-glow-cyan text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // STANDARD DESKTOP 3-PANEL COMMAND CENTER FIT WITHIN 100dvh
  return (
    <div className="relative w-full h-[100dvh] max-h-full flex flex-col gap-2.5 overflow-hidden text-slate-100 p-2.5 select-none font-sans">
      {/* 1. TOP LIVE STATUS BAR (Streamlined height ~48px) */}
      <div className="glass-panel border border-white/10 rounded-2xl p-2.5 px-4 flex items-center justify-between backdrop-blur-xl bg-[#060919]/90 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 text-slate-950 font-bold shadow-glow-cyan">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold font-display tracking-wider text-white">
                NEXUS GEO-TWIN
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                REAL GEOSPATIAL TWIN
              </span>
              {isBackendConnected ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  FASTAPI CONNECTED
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  HYBRID EDGE CACHED
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              "See the city. Understand the pressure. Predict what happens next."
            </p>
          </div>
        </div>

        {/* Top Right: Status Telemetry & Help/Tips */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] text-slate-400">CURRENT FOCUS</span>
            <span className="text-cyan-300 font-bold text-[11px] tracking-wide">
              {activeDestination.shortName.toUpperCase()}
            </span>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] text-slate-400">ACTIVE SCENARIO</span>
            <span className="text-white font-bold text-[11px] uppercase">
              {scenario === 'normal' ? 'BASELINE SCHEDULE' : scenario.replace('_', ' ')}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] text-slate-400">TEMPORAL OFFSET</span>
            <span className="text-violet-300 font-bold text-[11px]">
              {timeOffset >= 0 ? `+${timeOffset}m` : `${timeOffset}m`}
            </span>
          </div>

          <span className="w-[1px] h-6 bg-white/10 hidden sm:inline-block" />

          {/* Tips Tour & Shortcuts Trigger */}
          <NexusTips
            onFocusMapAction={() => setIsFocusMode(true)}
            onOpenScenarioAction={() => setIsScenarioTrayOpen(true)}
            onToggleLayersAction={() => setIsLayersCollapsed(prev => !prev)}
            onResetMapAction={handleResetFocus}
          />
        </div>
      </div>

      {/* 2. MAIN 3-PANEL CSS GRID WORKSPACE (Fits 100dvh, zero page scroll) */}
      <div 
        className="relative flex-1 min-h-0 w-full grid gap-3 overflow-hidden transition-all duration-300"
        style={{
          gridTemplateColumns: isLayersCollapsed 
            ? '56px 1fr minmax(280px, 27%)' 
            : 'minmax(220px, 17%) 1fr minmax(300px, 27.5%)'
        }}
      >
        {/* LEFT COLUMN: SPATIAL LAYERS PANEL (~17% or collapsed 56px rail) */}
        <div className="h-full min-h-0 overflow-hidden z-20 transition-all duration-300">
          <GeoLayerControls
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onSetAllLayers={handleSetAllLayers}
            isCollapsed={isLayersCollapsed}
            onToggleCollapse={() => setIsLayersCollapsed(prev => !prev)}
            className="h-full"
          />
        </div>

        {/* CENTER COLUMN: HERO SATELLITE MAP (~55% to ~75% DOMINANT HERO) */}
        <div className="relative h-full w-full rounded-2xl overflow-hidden flex flex-col min-w-0 border border-white/10 shadow-2xl">
          {/* Top Floating Visualization Mode Switcher */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
            <GeoModeControls
              currentMode={mode}
              onChangeMode={handleModeChange}
              compact={false}
            />
          </div>

          {/* Interactive MapLibre GL Satellite + 3D Twin Map Engine */}
          <GeoTwinMap
            mode={mode}
            layers={layers}
            scenario={scenario}
            timeOffset={timeOffset}
            selectedEntity={selectedEntity}
            onSelectEntity={(ent) => setSelectedEntity(ent)}
            venues={venues}
            hotels={hotels}
            transport={transport}
            activeDestination={activeDestination}
            destinations={destinations}
            onSelectDestination={handleSelectDestination}
            onResetFocus={handleResetFocus}
            onAddCustomDestination={handleAddCustomDestination}
            isFocusMode={false}
            onToggleFocusMode={() => setIsFocusMode(true)}
            onChangeMode={handleModeChange}
            onToggleLayer={handleToggleLayer}
            showFocusHotspot={showHotspots}
            className="w-full h-full"
          />

          {/* Cascading Dependency Network Overlay (if toggled) */}
          {layers.dependencyNetwork && (
            <div className="absolute top-20 left-4 right-4 z-20 pointer-events-auto max-w-3xl mx-auto">
              <DependencyNetwork scenario={scenario} />
            </div>
          )}

          {/* Floating Selected Entity Card */}
          {selectedEntity && (
            <div className="absolute top-16 right-4 z-30 pointer-events-auto max-w-sm animate-fadeIn">
              <LocationIntelligenceCard
                entity={selectedEntity}
                onClose={() => setSelectedEntity(null)}
                onDispatchAction={(action) => showToast(action)}
              />
            </div>
          )}

          {/* BOTTOM FLOATING COMMAND DOCK (Timeline + Collapsible Scenario Tray) */}
          <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto flex flex-col items-center gap-2 max-w-4xl mx-auto">
            {/* Timeline Scrubbing Bar */}
            <PredictionTimeline
              timeOffset={timeOffset}
              onChangeTimeOffset={(val) => setTimeOffset(val)}
              compact={true}
              className="w-full"
            />

            {/* Collapsible Scenario Injection Command Tray */}
            <GeoSimulationControls
              currentScenario={scenario}
              onSelectScenario={(sc) => {
                setScenario(sc);
                showToast(`Scenario Activated: ${sc.toUpperCase().replace('_', ' ')}`);
              }}
              onReset={() => {
                setScenario('normal');
                setTimeOffset(0);
                showToast('Simulation reset to baseline operations');
              }}
              isOpen={isScenarioTrayOpen}
              onToggleOpen={() => setIsScenarioTrayOpen(prev => !prev)}
              className="w-full"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: AI INTELLIGENCE & DECISION LAYER (~27.5%) */}
        <div className="h-full min-h-0 overflow-hidden z-20 flex flex-col">
          <GeoInsightsPanel
            scenario={scenario}
            timeOffset={timeOffset}
            activeRiskZones={riskZones}
            activeDestination={activeDestination}
            onApplyMitigation={(action) => showToast(`Tactical Mitigation Applied: ${action}`)}
            className="h-full overflow-hidden"
          />
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] glass-panel border border-cyan-500/50 bg-[#05091a]/95 px-4 py-2.5 rounded-2xl shadow-glow-cyan text-xs font-mono text-cyan-300 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
