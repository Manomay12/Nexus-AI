import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { CityDigitalTwin } from '../digitaltwin/CityDigitalTwin';
import { GoogleMapsView } from './GoogleMapsView';
import { 
  Layers, 
  Users, 
  Hotel, 
  Car, 
  Bus, 
  Utensils, 
  ParkingSquare, 
  ShieldAlert, 
  Compass, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Maximize2,
  Map as MapIcon
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const CityPressureMap: React.FC = () => {
  const { 
    zones, 
    selectedZone, 
    setSelectedZone, 
    mapLayers, 
    toggleMapLayer 
  } = useNexus();

  const [viewMode, setViewMode] = useState<'3d' | 'google' | 'hologram'>('google');

  const layerItems = [
    { key: 'crowdDensity', label: 'Crowd Density', icon: Users, color: 'text-cyan-400' },
    { key: 'hotelOccupancy', label: 'Hotel Occupancy', icon: Hotel, color: 'text-indigo-400' },
    { key: 'traffic', label: 'Traffic Heatmap', icon: Car, color: 'text-amber-400' },
    { key: 'transportLoad', label: 'Transport Load', icon: Bus, color: 'text-violet-400' },
    { key: 'restaurantDemand', label: 'Restaurant Demand', icon: Utensils, color: 'text-emerald-400' },
    { key: 'parkingAvailability', label: 'Parking Surplus', icon: ParkingSquare, color: 'text-blue-400' }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top Layer Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Spatial Telemetry Layers:
          </span>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {layerItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = (mapLayers as any)[item.key];

            return (
              <button
                key={item.key}
                onClick={() => toggleMapLayer(item.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isEnabled ? item.color : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3D vs Google Maps vs 2D Hologram Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('google');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              viewMode === 'google' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('3d');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              viewMode === '3d' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Twin
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setViewMode('hologram');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'hologram' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hologram 2D
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      {viewMode === 'google' ? (
        <GoogleMapsView heightClass="h-[640px]" />
      ) : viewMode === '3d' ? (
        <CityDigitalTwin heightClass="h-[640px]" showControls={true} />
      ) : (
        /* Holographic 2D Vector Radar Map */
        <div className="relative h-[640px] w-full rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden bg-[#05070E] p-6 flex flex-col justify-between cyber-grid">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400">VECTOR RADAR // HOLOGRAPHIC MODE</span>
            <span className="text-slate-400">Scale: 1:25,000</span>
          </div>

          {/* Center concentric radar lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/15 animate-ping opacity-25" />
            <div className="w-[380px] h-[380px] rounded-full border border-cyan-500/20" />
            <div className="w-[220px] h-[220px] rounded-full border border-cyan-500/30" />
          </div>

          {/* Interactive Zone Pins in 2D Space */}
          <div className="relative w-full h-full">
            {zones.map((zone) => {
              // Convert 3D coordinates to 2D percentage positions
              const leftPercent = 50 + (zone.coordinates.x * 2.8);
              const topPercent = 50 + (zone.coordinates.z * 2.8);

              const isSelected = selectedZone?.id === zone.id;

              return (
                <div
                  key={zone.id}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedZone(zone);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div className={`p-2.5 rounded-2xl glass-panel border transition-all flex items-center gap-2 shadow-2xl ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-glow-cyan scale-110'
                      : 'border-white/10 hover:border-cyan-500/40 hover:scale-105'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      zone.riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-glow-danger animate-ping' :
                      zone.riskLevel === 'HIGH' ? 'bg-amber-400 shadow-glow-warning' : 'bg-cyan-400 shadow-glow-cyan'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white font-display whitespace-nowrap">{zone.name}</span>
                      <span className="text-[9px] font-mono text-cyan-300">Pressure: {zone.currentPressure}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Spatial Inspection Panel on clicked zone */}
          {selectedZone && (
            <div className="absolute bottom-6 right-6 glass-panel p-5 rounded-2xl border border-cyan-500/40 max-w-sm w-full shadow-2xl z-20 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{selectedZone.district}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">
                  {selectedZone.riskLevel}
                </span>
              </div>
              <h4 className="text-base font-bold text-white font-display mb-3">{selectedZone.name}</h4>

              {/* Exact Metrics specified in Prompt */}
              <div className="space-y-2 text-xs font-mono mb-4">
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Hotel Capacity:</span>
                  <span className="text-white font-bold">{selectedZone.hotelCapacityPercent}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Transport Load:</span>
                  <span className="text-white font-bold">{selectedZone.transportLoadPercent}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Restaurant Demand:</span>
                  <span className="text-white font-bold">{selectedZone.restaurantDemandPercent}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 font-bold">
                  <span>AI Risk Prediction:</span>
                  <span>CRITICAL IN 45 MINUTES</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3">{selectedZone.aiSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
