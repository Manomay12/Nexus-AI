import React from 'react';
import { 
  Network, 
  MapPin, 
  Train, 
  Hotel, 
  Car, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GeoScenario } from '../../types/geoTwin';

interface DependencyNetworkProps {
  scenario: GeoScenario;
  className?: string;
}

export const DependencyNetwork: React.FC<DependencyNetworkProps> = ({
  scenario,
  className = ''
}) => {
  // Define dependency nodes and their state based on scenario
  const nodes = [
    {
      id: 'venue',
      name: 'JWCC Concourse',
      type: 'venue',
      role: 'Source Generator',
      load: scenario === 'early_exit' ? 96 : 78,
      status: scenario === 'early_exit' ? 'CRITICAL' : 'STABLE',
      x: 10,
      y: 50
    },
    {
      id: 'corridor',
      name: 'BKC Central Roadway',
      type: 'traffic',
      role: 'Arterial Funnel',
      load: scenario === 'heavy_rain' ? 94 : scenario === 'early_exit' ? 88 : 68,
      status: scenario === 'heavy_rain' || scenario === 'early_exit' ? 'CRITICAL' : 'STABLE',
      x: 35,
      y: 50
    },
    {
      id: 'metro',
      name: 'Metro Line 2 Station',
      type: 'metro',
      role: 'Mass Transit Evacuation',
      load: scenario === 'metro_disruption' ? 98 : 72,
      status: scenario === 'metro_disruption' ? 'DISRUPTED' : 'STABLE',
      x: 60,
      y: 25
    },
    {
      id: 'bypass',
      name: 'Zone D Shuttle Arterial',
      type: 'shuttle',
      role: 'Contingency Bypass',
      load: scenario === 'metro_disruption' ? 86 : 42,
      status: scenario === 'metro_disruption' ? 'HIGH LOAD' : 'OPTIMAL',
      x: 60,
      y: 75
    },
    {
      id: 'hotel',
      name: 'Hospitality Cluster (BKC)',
      type: 'hotel',
      role: 'Terminal Absorption',
      load: scenario === 'hotel_saturation' ? 99 : 82,
      status: scenario === 'hotel_saturation' ? 'SATURATED' : 'STABLE',
      x: 88,
      y: 50
    }
  ];

  return (
    <div className={`glass-panel border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl bg-[#070b16]/95 shadow-2xl flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
              Cascading Dependency Topology
            </span>
            <p className="text-[10px] font-mono text-slate-400">Infrastructure failure propagation mapping</p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/10">
          5 CRITICAL NODES
        </span>
      </div>

      {/* Topology Diagram Container */}
      <div className="relative w-full h-44 rounded-xl bg-black/40 border border-white/5 p-2 overflow-hidden flex items-center justify-between">
        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="line-grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="line-grad-alert" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Node 1 to Node 2 */}
          <line 
            x1="20%" y1="50%" x2="38%" y2="50%" 
            stroke={scenario === 'early_exit' ? 'url(#line-grad-alert)' : 'url(#line-grad-cyan)'} 
            strokeWidth={scenario === 'early_exit' ? '3' : '2'}
            strokeDasharray={scenario === 'early_exit' ? '4 2' : 'none'}
          />

          {/* Node 2 to Node 3 (Metro) */}
          <line 
            x1="45%" y1="50%" x2="62%" y2="30%" 
            stroke={scenario === 'metro_disruption' ? '#f43f5e' : 'url(#line-grad-cyan)'} 
            strokeWidth={scenario === 'metro_disruption' ? '3' : '2'}
            strokeDasharray={scenario === 'metro_disruption' ? '6 3' : 'none'}
          />

          {/* Node 2 to Node 4 (Bypass) */}
          <line 
            x1="45%" y1="50%" x2="62%" y2="70%" 
            stroke="url(#line-grad-cyan)" 
            strokeWidth="2" 
          />

          {/* Node 3 to Node 5 (Hotel) */}
          <line 
            x1="70%" y1="30%" x2="85%" y2="50%" 
            stroke="url(#line-grad-cyan)" 
            strokeWidth="2" 
          />

          {/* Node 4 to Node 5 (Hotel) */}
          <line 
            x1="70%" y1="70%" x2="85%" y2="50%" 
            stroke="url(#line-grad-cyan)" 
            strokeWidth="2" 
          />
        </svg>

        {/* Node Cards */}
        {nodes.map((node) => {
          const isCritical = node.status === 'CRITICAL' || node.status === 'DISRUPTED' || node.status === 'SATURATED';

          return (
            <div 
              key={node.id} 
              className="z-10 flex flex-col items-center max-w-[120px] text-center"
            >
              <div className={`p-2 rounded-xl border transition-all duration-300 ${
                isCritical 
                  ? 'bg-red-500/20 border-red-500 shadow-glow-amber scale-105' 
                  : 'bg-[#0b1020] border-cyan-500/30 shadow-md'
              }`}>
                {node.type === 'venue' && <MapPin className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />}
                {node.type === 'traffic' && <Car className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />}
                {node.type === 'metro' && <Train className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />}
                {node.type === 'shuttle' && <Car className="w-4 h-4 text-violet-400" />}
                {node.type === 'hotel' && <Hotel className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />}
              </div>

              <span className="text-[10px] font-bold text-white mt-1 leading-tight truncate w-full">
                {node.name}
              </span>
              <span className={`text-[9px] font-mono font-bold mt-0.5 ${
                isCritical ? 'text-red-400' : 'text-cyan-300'
              }`}>
                {node.load}% LOAD
              </span>
              <span className="text-[8px] font-mono text-slate-500 truncate">
                {node.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
