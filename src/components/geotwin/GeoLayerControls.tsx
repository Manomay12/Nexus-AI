import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Box, 
  Route, 
  Flame, 
  Car, 
  AlertTriangle, 
  TrendingUp, 
  Globe2, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { GeoTwinLayerConfig } from '../../types/geoTwin';
import { soundFx } from '../../utils/audio';

interface GeoLayerControlsProps {
  layers: GeoTwinLayerConfig;
  onToggleLayer: (layerKey: keyof GeoTwinLayerConfig) => void;
  onSetAllLayers?: (enable: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const GeoLayerControls: React.FC<GeoLayerControlsProps> = ({
  layers,
  onToggleLayer,
  onSetAllLayers,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const layerDefs: Array<{
    key: keyof GeoTwinLayerConfig;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'base' | 'operational' | 'intelligence';
    color: string;
  }> = [
    {
      key: 'satelliteImagery',
      label: 'Satellite Imagery',
      sublabel: 'Real Earth Orbit Basemap',
      icon: Globe2,
      category: 'base',
      color: 'text-cyan-400'
    },
    {
      key: 'buildings',
      label: 'Buildings',
      sublabel: '3D Extruded Footprints',
      icon: Box,
      category: 'base',
      color: 'text-violet-400'
    },
    {
      key: 'roads',
      label: 'Roads',
      sublabel: 'Arterial Highways & Corridors',
      icon: Route,
      category: 'operational',
      color: 'text-slate-300'
    },
    {
      key: 'venues',
      label: 'Venues',
      sublabel: 'JWCC, Stadiums & Hubs',
      icon: MapPin,
      category: 'operational',
      color: 'text-violet-400'
    },
    {
      key: 'crowdDensity',
      label: 'Crowd Density',
      sublabel: 'GPU Heatmap (Green → Red)',
      icon: Flame,
      category: 'operational',
      color: 'text-pink-400'
    },
    {
      key: 'traffic',
      label: 'Traffic',
      sublabel: 'Live Speed & Congestion Lines',
      icon: Car,
      category: 'operational',
      color: 'text-amber-400'
    },
    {
      key: 'riskZones',
      label: 'Risk Zones',
      sublabel: 'Translucent Threat Buffers',
      icon: AlertTriangle,
      category: 'intelligence',
      color: 'text-red-400'
    },
    {
      key: 'predictedMovement',
      label: 'Predicted Movement',
      sublabel: 'Animated Directional Vectors',
      icon: TrendingUp,
      category: 'intelligence',
      color: 'text-emerald-400'
    }
  ];

  const filteredLayers = layerDefs.filter(d => 
    d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sublabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = layerDefs.filter(d => !!layers[d.key]).length;

  // COLLAPSED ICON RAIL MODE (Gives map maximum horizontal space)
  if (isCollapsed) {
    return (
      <div className={`glass-panel border border-white/10 rounded-2xl p-2 backdrop-blur-xl bg-[#070b16]/90 shadow-2xl flex flex-col items-center gap-2.5 transition-all duration-300 w-14 ${className}`}>
        {/* Expand Trigger Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleCollapse?.();
          }}
          className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-105"
          title="Show Layers Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-1" />

        {/* Stack of layer icons with status dots */}
        <div className="flex flex-col gap-2 items-center overflow-y-auto max-h-[calc(100vh-14rem)] py-1">
          {layerDefs.map(def => {
            const Icon = def.icon;
            const isEnabled = !!layers[def.key];

            return (
              <button
                key={def.key}
                onClick={() => {
                  soundFx.playClick();
                  onToggleLayer(def.key);
                }}
                className={`relative p-2 rounded-xl border transition-all ${
                  isEnabled 
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-glow-cyan' 
                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                }`}
                title={`${def.label}: ${isEnabled ? 'ACTIVE' : 'OFF'}`}
              >
                <Icon className="w-4 h-4" />
                <span 
                  className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                    isEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-transparent'
                  }`} 
                />
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-1 pt-2 border-t border-white/10 text-[9px] font-mono text-cyan-300 font-bold">
          <span>{activeCount}</span>
          <span className="text-[8px] text-slate-500">ON</span>
        </div>
      </div>
    );
  }

  // EXPANDED CONTROL PANEL
  return (
    <div className={`glass-panel border border-white/10 rounded-2xl p-3 backdrop-blur-xl bg-[#070b16]/90 shadow-2xl flex flex-col gap-2.5 transition-all duration-300 ${className}`}>
      {/* Header with Collapse toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-white">Spatial Layers</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                {activeCount}/{layerDefs.length}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Telemetry controls</p>
          </div>
        </div>

        {/* Collapse button */}
        {onToggleCollapse && (
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleCollapse();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-cyan-300 bg-white/5 hover:bg-cyan-500/10 border border-white/10 transition-colors"
            title="Collapse to icon rail"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Hide</span>
          </button>
        )}
      </div>

      {/* Search Layers Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search layers..."
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Quick All / Clear actions */}
      <div className="flex items-center justify-between px-1 text-[10px] font-mono">
        <span className="text-slate-400 uppercase tracking-wider text-[9px]">Toggle Visibility:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSetAllLayers) onSetAllLayers(true);
            }}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 transition-colors border border-white/5"
          >
            All On
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSetAllLayers) onSetAllLayers(false);
            }}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition-colors border border-white/5"
          >
            All Off
          </button>
        </div>
      </div>

      {/* Layers Scrollable List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-20rem)] pr-0.5">
        {filteredLayers.map((def) => {
          const Icon = def.icon;
          const isEnabled = !!layers[def.key];

          return (
            <button
              key={def.key}
              onClick={() => {
                soundFx.playClick();
                onToggleLayer(def.key);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`group flex items-center justify-between p-2 rounded-xl text-left transition-all duration-150 border ${
                isEnabled
                  ? 'bg-white/[0.04] border-white/15 text-white shadow-sm'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                  isEnabled 
                    ? 'bg-cyan-500/10 border-cyan-500/30 ' + def.color 
                    : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium tracking-tight truncate">
                    <span className={isEnabled ? 'text-white' : 'text-slate-400'}>{def.label}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">
                    {def.sublabel}
                  </div>
                </div>
              </div>

              {/* Status Pill Switch */}
              <div className="flex items-center ml-2 shrink-0">
                <div className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                  isEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700/60 justify-start'
                }`}>
                  <div className="w-3 h-3 rounded-full bg-white shadow-md transform transition-transform" />
                </div>
              </div>
            </button>
          );
        })}

        {filteredLayers.length === 0 && (
          <div className="p-3 text-center text-xs font-mono text-slate-400">
            No matching layers found
          </div>
        )}
      </div>

      {/* Layer Classification Footnote */}
      <div className="pt-2 border-t border-white/10 text-[9px] font-mono text-slate-400 flex items-center justify-between mt-auto">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
          GEOGRAPHIC
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
          PREDICTIVE AI
        </span>
      </div>
    </div>
  );
};
