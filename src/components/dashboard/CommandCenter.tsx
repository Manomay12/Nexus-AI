import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { CityDigitalTwin } from '../digitaltwin/CityDigitalTwin';
import { PressurePredictionPanel } from '../forecast/PressurePredictionPanel';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Hotel, 
  Bus, 
  ArrowRight, 
  Zap, 
  Sparkles,
  Layers,
  SlidersHorizontal,
  Clock,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const CommandCenter: React.FC = () => {
  const { 
    currentEvent, 
    zones, 
    selectedZone, 
    setSelectedZone, 
    simulationImpact, 
    setActiveTab, 
    hasExecutedPlan,
    activePlan
  } = useNexus();

  const highRiskZone = zones.find(z => z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH') || zones[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE EVENT ATTENDEES</span>
            <div className="text-2xl font-bold font-display text-white mt-0.5">
              {currentEvent.baseAttendees.toLocaleString()}
            </div>
          </div>
          <Users className="w-6 h-6 text-cyan-400 opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">CITY PRESSURE INDEX</span>
            <div className={`text-2xl font-bold font-display mt-0.5 ${
              simulationImpact.riskClassification === 'CRITICAL' ? 'text-red-400' :
              simulationImpact.riskClassification === 'HIGH' ? 'text-amber-400' : 'text-cyan-300'
            }`}>
              {simulationImpact.compositePressureScore}% ({simulationImpact.riskClassification})
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-amber-400 opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">HOSPITALITY BUFFER</span>
            <div className="text-2xl font-bold font-display text-indigo-300 mt-0.5">
              2,995 Rooms Open
            </div>
          </div>
          <Hotel className="w-6 h-6 text-indigo-400 opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">TRANSIT HEADWAYS</span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-0.5">
              2.4m Optimal
            </div>
          </div>
          <Bus className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Main 3D Digital Twin Centerpiece with Integrated Command HUDs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Digital Twin (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Quick Twin Switch Banner */}
          <div className="glass-panel p-2.5 px-4 rounded-2xl border border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Spatial Visual Intelligence
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                | Switch perspective
              </span>
            </div>

            <div className="flex items-center p-1 rounded-xl glass-panel bg-black/60 border border-white/10 text-xs font-mono">
              <button
                className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow-cyan flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D TWIN</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('geotwin');
                }}
                className="px-3 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>GEO-TWIN</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  NEW
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <CityDigitalTwin heightClass="h-[520px]" showControls={true} />
          </div>

          {/* Quick Trigger Shortcuts Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Tactical Shortcuts:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('geotwin');
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-display flex items-center gap-1.5 transition-all shadow-glow-cyan"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geo-Twin Satellite</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('simulator');
                }}
                className="px-3 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-xs font-bold font-display flex items-center gap-1.5 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>What-If Simulator</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('hospitality');
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold font-display flex items-center gap-1.5 transition-all"
              >
                <Hotel className="w-3.5 h-3.5" />
                <span>Redistribute Visitors</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('orchestrator');
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-display flex items-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Response Planner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Tactical HUD (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Urgent Bottleneck Alert Card */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/40 shadow-glow-danger bg-red-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold font-mono text-red-400 uppercase">
                  PEAK BOTTLENECK ALERT
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">T - 37 MINS</span>
            </div>

            <h4 className="text-sm font-bold text-white font-display">
              {highRiskZone.name}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pressure projected to surge from <strong className="text-white">{highRiskZone.currentPressure}%</strong> to <strong className="text-red-400">{highRiskZone.predictedPressure}%</strong>.
            </p>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('orchestrator');
              }}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow-danger transition-all mt-1"
            >
              <span>Deploy Multi-Agency Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Underutilized Hospitality Sector Spotlight */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                  OPPORTUNITY SECTOR
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">1,240 ROOMS</span>
            </div>

            <h4 className="text-sm font-bold text-white font-display">
              Zone D Northern Eco Gateway
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Zone D can absorb 18% of stadium arrivals to prevent venue sector exhaustion.
            </p>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('hospitality');
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow-cyan transition-all mt-1"
            >
              <span>Incentivize Zone D</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Orchestration Status */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE BLUEPRINT</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{activePlan.title}</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                -{activePlan.expectedCongestionReduction}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {hasExecutedPlan ? 'Deployed to 14 inter-agency nodes' : 'Primed for automated dispatch'}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Pressure Prediction Horizon Section */}
      <PressurePredictionPanel />
    </div>
  );
};
