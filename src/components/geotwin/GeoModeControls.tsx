import React from 'react';
import { 
  Globe2, 
  Map, 
  Box, 
  Flame, 
  Sparkles,
  Layers,
  TrendingUp,
  Compass
} from 'lucide-react';
import { GeoVisualizationMode } from '../../types/geoTwin';
import { soundFx } from '../../utils/audio';

interface GeoModeControlsProps {
  currentMode: GeoVisualizationMode;
  onChangeMode: (mode: GeoVisualizationMode) => void;
  compact?: boolean;
  className?: string;
}

export const GeoModeControls: React.FC<GeoModeControlsProps> = ({
  currentMode,
  onChangeMode,
  compact = false,
  className = ''
}) => {
  const modes: Array<{
    id: GeoVisualizationMode;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'satellite',
      label: 'SATELLITE',
      description: 'High-Res Earth Imagery',
      icon: Globe2,
      badge: 'REAL'
    },
    {
      id: 'map',
      label: 'MAP',
      description: 'Streets & Labels',
      icon: Map
    },
    {
      id: '3d_twin',
      label: '3D TWIN',
      description: 'Extruded City Meshes',
      icon: Box,
      badge: '60°'
    },
    {
      id: 'heatmap',
      label: 'HEATMAP',
      description: 'Crowd Density Gradient',
      icon: Flame,
      badge: 'GPU'
    },
    {
      id: 'ai_prediction',
      label: 'AI PREDICTION',
      description: 'Directional Flow Vectors',
      icon: TrendingUp,
      badge: 'AI'
    }
  ];

  return (
    <div className={`glass-panel border border-white/15 rounded-2xl p-1.5 backdrop-blur-xl bg-[#060919]/90 shadow-2xl flex items-center gap-1 text-xs font-mono select-none ${className}`}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => {
              soundFx.playClick();
              onChangeMode(mode.id);
            }}
            onMouseEnter={() => soundFx.playHover()}
            title={mode.description}
            className={`group relative flex items-center gap-1.5 ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-2 text-[11px]'} rounded-xl transition-all duration-300 font-bold tracking-wider ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-cyan-300'
            }`} />

            <span className="font-display">{mode.label}</span>

            {mode.badge && (
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono tracking-tight ${
                isActive 
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' 
                  : 'bg-white/10 text-slate-400 border border-white/5'
              }`}>
                {mode.badge}
              </span>
            )}

            {isActive && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
            )}
          </button>
        );
      })}
    </div>
  );
};
