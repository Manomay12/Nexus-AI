import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  Clock, 
  ShieldAlert, 
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const PressurePredictionPanel: React.FC = () => {
  const { 
    zones, 
    selectedZone, 
    setSelectedZone, 
    executePlan, 
    responsePlans, 
    hasExecutedPlan,
    setActiveTab,
    triggerVoiceBriefing
  } = useNexus();

  const [activeZoneId, setActiveZoneId] = useState<string>('zone-andheri');
  const activeZone = zones.find(z => z.id === activeZoneId) || zones[1];

  // Dynamic forecast trajectory data (0m to 60m)
  const trajectoryPoints = [
    { minute: 'Now', current: activeZone.currentPressure, predicted: activeZone.currentPressure },
    { minute: '+15m', current: activeZone.currentPressure + 4, predicted: activeZone.currentPressure + 7 },
    { minute: '+30m', current: activeZone.currentPressure + 9, predicted: activeZone.currentPressure + 16 },
    { minute: '+45m', current: activeZone.currentPressure + 14, predicted: activeZone.predictedPressure - 2 },
    { minute: '+60m', current: activeZone.currentPressure + 17, predicted: activeZone.predictedPressure }
  ];

  const handleExecute = () => {
    executePlan(responsePlans[2]); // Execute Plan C (Combined)
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Futuristic AI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <BrainCircuit className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold font-display text-white">AI Forecasting Next 60 Minutes</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
              NEURAL HORIZON v4.8
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time multi-variate pressure projection across transit gateways and hospitality sectors.
          </p>
        </div>

        {/* Zone Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => {
                soundFx.playClick();
                setActiveZoneId(z.id);
                setSelectedZone(z);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                z.id === activeZoneId
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {z.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prediction Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Core Pressure Gauges (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient Scan Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">TARGET SECTOR</span>
                <h3 className="text-xl font-bold font-display text-white">{activeZone.name}</h3>
                <span className="text-xs text-slate-400">{activeZone.district}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                activeZone.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-glow-danger' :
                activeZone.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow-warning' :
                'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                RISK: {activeZone.riskLevel}
              </div>
            </div>

            {/* Side by side Pressure Meters */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/10">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-slate-400">Current Pressure</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold font-display text-white">{activeZone.currentPressure}%</span>
                  <span className="text-xs text-slate-400 font-mono">live</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${activeZone.currentPressure}%` }} />
                </div>
              </div>

              <div className="flex flex-col border-l border-white/10 pl-4">
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Predicted (60m)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold font-display text-amber-400">{activeZone.predictedPressure}%</span>
                  <span className="text-xs text-red-400 font-mono font-bold">
                    +{activeZone.predictedPressure - activeZone.currentPressure}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${activeZone.predictedPressure}%` }} />
                </div>
              </div>
            </div>

            {/* AI Reasoning Text Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Neural Explanation:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "{activeZone.aiSummary}"
              </p>
            </div>
          </div>
        </div>

        {/* Right: Forecast Trajectory Curve & Recommended Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Animated Forecast Line Graph SVG */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono uppercase">
                  60-Minute Predictive Trajectory Curve
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-400">Baseline Trend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-warning" />
                  <span className="text-amber-300 font-bold">AI Surge Forecast</span>
                </div>
              </div>
            </div>

            {/* Stylized SVG Chart */}
            <div className="relative h-44 w-full bg-slate-950/60 rounded-xl p-3 border border-white/5 overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

                {/* Shaded Area */}
                <path
                  d={`M 0,${120 - activeZone.currentPressure} 
                     C 125,${120 - (activeZone.currentPressure + 8)} 
                       250,${120 - (activeZone.currentPressure + 16)} 
                       500,${120 - activeZone.predictedPressure} 
                     L 500,120 L 0,120 Z`}
                  fill="url(#curveGradient)"
                />

                {/* Forecast Line */}
                <path
                  d={`M 0,${120 - activeZone.currentPressure} 
                     C 125,${120 - (activeZone.currentPressure + 8)} 
                       250,${120 - (activeZone.currentPressure + 16)} 
                       500,${120 - activeZone.predictedPressure}`}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3.5"
                />

                {/* Trajectory dots */}
                <circle cx="0" cy={120 - activeZone.currentPressure} r="4" fill="#00f0ff" />
                <circle cx="250" cy={120 - (activeZone.currentPressure + 16)} r="4" fill="#f59e0b" />
                <circle cx="500" cy={120 - activeZone.predictedPressure} r="6" fill="#ef4444" />
              </svg>

              {/* Peak indicator HUD label */}
              <div className="absolute right-4 top-4 glass-panel px-2.5 py-1 rounded-lg border border-red-500/30 text-right">
                <span className="text-[9px] font-mono text-slate-400 block">PROJECTED PEAK</span>
                <span className="text-xs font-bold text-red-400 font-mono">
                  {activeZone.predictedPressure}% in 37 mins
                </span>
              </div>
            </div>

            {/* Time markers below chart */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span>NOW (19:42)</span>
              <span>+15 MINS</span>
              <span>+30 MINS</span>
              <span>+45 MINS</span>
              <span>+60 MINS (20:42)</span>
            </div>
          </div>

          {/* Recommended Actions & Execution Deck */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> AI Recommended Action Protocol:
                </span>
                <span className="text-[10px] font-mono text-emerald-400">READY FOR DISPATCH</span>
              </div>

              <div className="space-y-2">
                {[
                  { num: '1', text: 'Activate Shuttle Route B with 20-bus dedicated perimeter convoy' },
                  { num: '2', text: 'Redirect arriving stadium egress visitors to Station C Skybridge' },
                  { num: '3', text: 'Promote alternative accommodation & dining in Zone D (1,240 surplus rooms)' }
                ].map((act) => (
                  <div key={act.num} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {act.num}
                    </span>
                    <span className="text-xs text-slate-200 font-medium leading-tight">{act.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Big Action Button: Execute Response Plan */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Predicted Congestion Relief: <span className="font-bold text-emerald-400 font-mono">-52%</span>
              </div>

              <button
                onClick={handleExecute}
                disabled={hasExecutedPlan}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-cyan transform active:scale-95 ${
                  hasExecutedPlan
                    ? 'bg-emerald-500 text-slate-950 cursor-default'
                    : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-violet-600 hover:from-cyan-300 hover:to-violet-500 text-slate-950'
                }`}
              >
                {hasExecutedPlan ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Response Plan Executed & Active</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Execute Response Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
