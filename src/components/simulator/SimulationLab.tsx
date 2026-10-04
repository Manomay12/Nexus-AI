import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { AIResponsePlan } from '../../types/nexus';
import { 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Flame, 
  Bus, 
  Hotel, 
  Users, 
  Clock, 
  TrendingUp, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Zap,
  SplitSquareVertical
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const SimulationLab: React.FC = () => {
  const { 
    simulationParams, 
    updateSimulationParams, 
    simulationImpact, 
    resetSimulation, 
    responsePlans, 
    activePlan, 
    executePlan, 
    hasExecutedPlan,
    currentEvent
  } = useNexus();

  const [compareMode, setCompareMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Quick emergency presets
  const applyPreset = (preset: 'early_exit' | 'metro_glitch' | 'rain_storm' | 'clear') => {
    soundFx.playClick();
    if (preset === 'early_exit') {
      updateSimulationParams({
        eventEndDeltaMinutes: -45,
        emergencyScenario: 'early_exit',
        expectedAttendance: currentEvent.baseAttendees,
        weather: 'clear'
      });
    } else if (preset === 'metro_glitch') {
      updateSimulationParams({
        emergencyScenario: 'metro_glitch',
        transportCapacityModifier: 0.65
      });
    } else if (preset === 'rain_storm') {
      updateSimulationParams({
        weather: 'monsoon',
        emergencyScenario: 'rain_storm',
        transportCapacityModifier: 0.8
      });
    } else {
      resetSimulation();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Introduction Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-slate-950 font-bold shadow-glow-cyan">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">NEXUS Simulation Lab</h2>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                ULTIMATE SCENARIO ORCHESTRATION ENGINE
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Stress-test city infrastructure, simulate early mass egress, adverse weather, or transit outages, and generate optimized multi-agency intervention matrices.
          </p>
        </div>

        {/* Quick Emergency Scenario Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('early_exit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              simulationParams.eventEndDeltaMinutes === -45
                ? 'bg-amber-500 text-slate-950 shadow-glow-warning'
                : 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Event Ends -45m Early</span>
          </button>

          <button
            onClick={() => applyPreset('rain_storm')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              simulationParams.weather === 'monsoon'
                ? 'bg-cyan-400 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Monsoon Downpour</span>
          </button>

          <button
            onClick={() => applyPreset('metro_glitch')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              simulationParams.emergencyScenario === 'metro_glitch'
                ? 'bg-red-500 text-slate-950 shadow-glow-danger'
                : 'bg-slate-900/80 hover:bg-slate-800 text-red-400 border border-red-500/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Metro Line 2 Glitch</span>
          </button>

          <button
            onClick={resetSimulation}
            title="Reset to Baseline"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Parameter Sliders (Left 5 cols) vs Real-Time Impact & Response (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Parameter Controls */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Simulation Parameters
            </span>
            <span className="text-[10px] font-mono text-slate-400">Dynamic Multi-Variate</span>
          </div>

          {/* Slider 1: Event End Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Event End Time Delta
              </span>
              <span className={`font-mono font-bold ${
                simulationParams.eventEndDeltaMinutes < 0 ? 'text-amber-400' : 'text-slate-200'
              }`}>
                {simulationParams.eventEndDeltaMinutes === 0 ? 'Scheduled (On Time)' : 
                 simulationParams.eventEndDeltaMinutes < 0 ? `${simulationParams.eventEndDeltaMinutes} Mins (Early)` : 
                 `+${simulationParams.eventEndDeltaMinutes} Mins (Delayed)`}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={simulationParams.eventEndDeltaMinutes}
              onChange={(e) => updateSimulationParams({ eventEndDeltaMinutes: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-60m (Sudden Exit)</span>
              <span>On Schedule</span>
              <span>+60m (Overtime)</span>
            </div>
          </div>

          {/* Slider 2: Expected Attendance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-violet-400" /> Expected Attendance
              </span>
              <span className="font-mono font-bold text-violet-300">
                {simulationParams.expectedAttendance.toLocaleString()} pax
              </span>
            </div>
            <input
              type="range"
              min="40000"
              max="140000"
              step="5000"
              value={simulationParams.expectedAttendance}
              onChange={(e) => updateSimulationParams({ expectedAttendance: Number(e.target.value) })}
              className="w-full accent-violet-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>40,000</span>
              <span>Base ({currentEvent.baseAttendees.toLocaleString()})</span>
              <span>140,000</span>
            </div>
          </div>

          {/* Selector 3: Weather Conditions */}
          <div className="space-y-2">
            <span className="text-xs text-slate-300 font-medium">Weather Condition</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'clear', label: 'Clear 28°C', icon: Sun },
                { id: 'monsoon', label: 'Monsoon Rain', icon: CloudRain },
                { id: 'extreme_heat', label: 'Heatwave 39°C', icon: Flame }
              ].map(w => {
                const WIcon = w.icon;
                const isSelected = simulationParams.weather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => updateSimulationParams({ weather: w.id as any })}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan font-bold'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-white/5'
                    }`}
                  >
                    <WIcon className="w-4 h-4" />
                    <span className="text-[11px]">{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider 4: Transport Fleet Capacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Bus className="w-3.5 h-3.5 text-cyan-400" /> Active Transport Fleet
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {Math.round(simulationParams.transportCapacityModifier * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={simulationParams.transportCapacityModifier}
              onChange={(e) => updateSimulationParams({ transportCapacityModifier: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>50% (Crippled)</span>
              <span>100% (Standard)</span>
              <span>150% (Max Fleet)</span>
            </div>
          </div>

          {/* Slider 5: Hotel Availability Buffer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Hotel className="w-3.5 h-3.5 text-indigo-400" /> Hotel Inventory Buffer
              </span>
              <span className="font-mono font-bold text-indigo-300">
                {Math.round(simulationParams.hotelAvailabilityBuffer * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={simulationParams.hotelAvailabilityBuffer}
              onChange={(e) => updateSimulationParams({ hotelAvailabilityBuffer: Number(e.target.value) })}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>50% (Tight)</span>
              <span>100% (Normal)</span>
              <span>120% (Expanded)</span>
            </div>
          </div>
        </div>

        {/* Right: Calculated Predicted Impacts & AI Response Strategies */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Predicted Impact Matrix */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                    AI Calculated Predicted Impact
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Weighted Model: (Crowd × 0.30) + (Transit × 0.25) + (Hotel × 0.15) + (Traffic × 0.20) + (Event × 0.10)
                  </span>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${
                simulationImpact.riskClassification === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-glow-danger' :
                simulationImpact.riskClassification === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow-warning' :
                'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {simulationImpact.riskClassification} RISK
              </div>
            </div>


            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Transport Congestion */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Transport Congestion</span>
                <span className="text-2xl font-extrabold font-display text-red-400 mt-1">
                  +{simulationImpact.transportCongestionChange}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Peak bottleneck: Station A</span>
              </div>

              {/* Hotel Surge */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Hotel Check-in Surge</span>
                <span className="text-2xl font-extrabold font-display text-amber-400 mt-1">
                  +{simulationImpact.hotelCheckinSurgeChange}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Zone A 98% booked</span>
              </div>

              {/* Traffic Delay */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Traffic Arterial Delay</span>
                <span className="text-2xl font-extrabold font-display text-red-400 mt-1">
                  +{simulationImpact.trafficDelayMinutesChange}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">+24 min egress delay</span>
              </div>

              {/* Restaurant Demand */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Restaurant Demand</span>
                <span className="text-2xl font-extrabold font-display text-cyan-300 mt-1">
                  +{simulationImpact.restaurantDemandChange}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Spike post-event</span>
              </div>
            </div>
          </div>

          {/* AI Response Strategies (Plan A, Plan B, Plan C ⭐) */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  AI Response Strategies
                </span>
                <p className="text-[11px] text-slate-400">Select an automated orchestration blueprint</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">3 Blueprints Generated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {responsePlans.map((plan) => {
                const isSelected = activePlan.id === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      soundFx.playClick();
                      // Set active plan without executing yet
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400 shadow-glow-cyan'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{plan.title.split(':')[0]}</span>
                        {plan.isRecommended && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> BEST
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight mb-2">{plan.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400">Expected Congestion Reduction:</span>
                      <span className="text-lg font-bold font-display text-emerald-400 font-mono">
                        -{plan.expectedCongestionReduction}%
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        executePlan(plan);
                      }}
                      className={`w-full py-2 rounded-lg text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        hasExecutedPlan && isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                      }`}
                    >
                      {hasExecutedPlan && isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span>Deploy Strategy</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Before vs After Impact Visualization */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Predicted Spatial Shift (Before vs After Plan)
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Overall Relief: -{activePlan.expectedCongestionReduction}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-xs font-bold text-slate-300 block mb-1">Zone A (Venue Sector)</span>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-red-400">Before: {activePlan.projectedMetrics.zoneAPressureBefore}%</span>
                  <span className="text-emerald-400 font-bold">After: {activePlan.projectedMetrics.zoneAPressureAfter}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-400 h-full" style={{ width: `${activePlan.projectedMetrics.zoneAPressureAfter}%` }} />
                  <div className="bg-red-400/40 h-full" style={{ width: `${activePlan.projectedMetrics.zoneAPressureBefore - activePlan.projectedMetrics.zoneAPressureAfter}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-xs font-bold text-slate-300 block mb-1">Zone D (Eco Buffer Sector)</span>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Before: {activePlan.projectedMetrics.zoneDPressureBefore}%</span>
                  <span className="text-cyan-400 font-bold">After: {activePlan.projectedMetrics.zoneDPressureAfter}% (Surplus Absorbed)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${activePlan.projectedMetrics.zoneDPressureAfter}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
