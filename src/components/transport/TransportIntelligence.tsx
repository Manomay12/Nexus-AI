import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { TransportRoute } from '../../types/nexus';
import { 
  Bus, 
  Train, 
  Car, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Layers,
  ShieldAlert,
  Navigation
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const TransportIntelligence: React.FC = () => {
  const { transportRoutes, triggerVoiceBriefing } = useNexus();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-c');
  const [activeModality, setActiveModality] = useState<string>('all');
  const [dispatchedBuses, setDispatchedBuses] = useState<boolean>(false);

  const selectedRoute = transportRoutes.find(r => r.id === selectedRouteId) || transportRoutes[2];

  const handleDispatchShuttles = () => {
    soundFx.playSuccess();
    setDispatchedBuses(true);
    triggerVoiceBriefing("Automated auxiliary shuttle dispatch authorized. 24 double-decker electric buses routed to Gate 4.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Bus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Transport Network Intelligence</h2>
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">
                MULTI-MODAL FLEET ORCHESTRATION & DYNAMIC ROUTING
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time monitoring of rapid rail headways, electric bus convoys, arterial traffic flow, and autonomous route re-balancing.
          </p>
        </div>

        {/* Fleet Status HUD */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="glass-panel px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">ACTIVE BUSES</span>
            <span className="text-sm font-bold text-cyan-300">{dispatchedBuses ? '184 (+24)' : '160'}</span>
          </div>
          <div className="glass-panel px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">METRO HEADWAY</span>
            <span className="text-sm font-bold text-emerald-400">2.4 min</span>
          </div>
          <div className="glass-panel px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">NETWORK LOAD</span>
            <span className="text-sm font-bold text-amber-400">89%</span>
          </div>
        </div>
      </div>

      {/* Bottleneck Warning Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-red-500/40 bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-400 uppercase font-mono tracking-wider">
                BOTTLENECK PREDICTION:
              </span>
              <span className="text-xs font-mono text-white font-bold">
                Metro Station A will reach 112% capacity in 24 minutes.
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Current train dwell time: 92s. Crowd concourse inflow rate: 410 pax/min.
            </p>
          </div>
        </div>

        <button
          onClick={handleDispatchShuttles}
          disabled={dispatchedBuses}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-cyan shrink-0 ${
            dispatchedBuses
              ? 'bg-emerald-500 text-slate-950 cursor-default'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
          }`}
        >
          {dispatchedBuses ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>24 Shuttles Deployed</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Deploy 24 Shuttles</span>
            </>
          )}
        </button>
      </div>

      {/* KILLER FEATURE: ROUTE COMPARISON ENGINE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Dynamic Route Comparison Engine
            </span>
            <h3 className="text-lg font-bold font-display text-white">
              Alternative Transit Corridor Recommendations
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Target Destination: South Terminal Hub</span>
        </div>

        {/* 3 Routes: FASTEST vs LOWEST CROWD vs AI RECOMMENDED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transportRoutes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            const isRecommended = route.tag === 'AI RECOMMENDED';

            return (
              <div
                key={route.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedRouteId(route.id);
                }}
                className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                  isSelected
                    ? isRecommended 
                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400 shadow-glow-cyan' 
                      : 'bg-gradient-to-b from-violet-950/40 to-slate-900/90 border-violet-400 shadow-glow-violet'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10'
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-400 to-violet-600 text-slate-950 px-3 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded-bl-lg flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> OPTIMAL
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      route.tag === 'FASTEST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      route.tag === 'LOWEST CROWD' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {route.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{route.mode}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-3 font-display">{route.name}</h4>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-mono block">TRAVEL TIME</span>
                      <span className="text-xl font-bold font-display text-white mt-0.5 block">
                        {route.durationMinutes} mins
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 font-mono block">CROWD LEVEL</span>
                      <span className={`text-xl font-bold font-display mt-0.5 block ${
                        route.crowdLevelPercent > 80 ? 'text-red-400' : 
                        route.crowdLevelPercent > 50 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {route.crowdLevelPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Waypoint steps */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">TRANSIT CORRIDOR</span>
                    {route.waypoints.map((wp, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className="truncate">{wp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Corridor Selected' : 'Route Attendees'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
