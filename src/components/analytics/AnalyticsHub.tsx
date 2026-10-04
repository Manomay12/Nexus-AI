import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Hotel, 
  Clock, 
  ShieldCheck, 
  Smile, 
  Zap, 
  Compass,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const AnalyticsHub: React.FC = () => {
  const { currentEvent, hasExecutedPlan, activePlan } = useNexus();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Executive Predictive Analytics</h2>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                ORCHESTRATION EFFICIENCY & INTERVENTION ROI
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Historical benchmarking and algorithmic telemetry measuring city resilience, crowd dispersal efficiency, and hospitality yield optimization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI INTERVENTION ROI: +410%
          </span>
        </div>
      </div>

      {/* 6 Core Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CROWD DISTRIBUTION EFFICIENCY</span>
          <span className="text-2xl font-extrabold font-display text-cyan-300 mt-1">94.2%</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4% vs Unmanaged
          </span>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">HOSPITALITY UTILIZATION</span>
          <span className="text-2xl font-extrabold font-display text-indigo-300 mt-1">88.6%</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Balanced Zone D Yield
          </span>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AVG TRAVEL TIME</span>
          <span className="text-2xl font-extrabold font-display text-white mt-1">21 mins</span>
          <span className="text-[10px] text-emerald-400 mt-0.5">Reduced from 48m</span>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CONGESTION REDUCTION</span>
          <span className="text-2xl font-extrabold font-display text-emerald-400 mt-1">
            {hasExecutedPlan ? `-${activePlan.expectedCongestionReduction}%` : '-34%'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Through Dynamic Routing</span>
        </div>

        {/* Metric 5 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AI INTERVENTION IMPACT</span>
          <span className="text-2xl font-extrabold font-display text-violet-400 mt-1">HIGH</span>
          <span className="text-[10px] text-violet-300 mt-0.5">6 bottlenecks prevented</span>
        </div>

        {/* Metric 6 */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase">VISITOR SATISFACTION</span>
          <span className="text-2xl font-extrabold font-display text-amber-300 mt-1">4.9 / 5.0</span>
          <span className="text-[10px] text-emerald-400 mt-0.5">99.1% Positive Feedback</span>
        </div>
      </div>

      {/* Futuristic Visual Charts & Sankey Crowd Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sankey-Style Crowd Flow Visualization */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Multi-Node Crowd Flow Dispersal (Sankey Matrix)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">72,480 PAX DISPERSED</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visualizing passenger flow from the primary arena gates through transit modes to final hospitality sectors.
            </p>

            {/* Custom Flow Vector Graphic */}
            <div className="space-y-3">
              {/* Flow Bar 1 */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Exit Gate A ➔ Metro Line 2 (Cap Restrictor Active)</span>
                  <span className="text-cyan-300 font-bold">24,000 pax (33%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[33%]" />
                </div>
              </div>

              {/* Flow Bar 2 */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Exit Gate B ➔ Autonomous Shuttles to Zone D</span>
                  <span className="text-violet-300 font-bold">22,400 pax (31%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full w-[31%]" />
                </div>
              </div>

              {/* Flow Bar 3 */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Skybridge Walkway ➔ South Terminal Line 3</span>
                  <span className="text-emerald-300 font-bold">18,200 pax (25%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-[25%]" />
                </div>
              </div>

              {/* Flow Bar 4 */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Perimeter Boulevard ➔ Geo-Fenced Ride Shares</span>
                  <span className="text-amber-300 font-bold">7,880 pax (11%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[11%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Bottleneck risk reduced by: 78%</span>
            <span className="text-cyan-400">Zero Crush Incidents Reported</span>
          </div>
        </div>

        {/* Travel Time & Ingress/Egress Trends */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Average Travel Time Comparison
              </span>
              <span className="text-[10px] font-mono text-emerald-400">AI SAVES 27 MINS/PAX</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-world telemetry comparison of traditional unmanaged egress vs NEXUS AI coordinated orchestration.
            </p>

            <div className="relative h-44 w-full bg-slate-950/60 rounded-xl p-3 border border-white/5 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                {/* Traditional Unmanaged line (Red dashed) */}
                <path
                  d="M 0,90 Q 100,75 200,20 T 400,10"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4"
                />
                {/* AI Orchestrated line (Cyan smooth) */}
                <path
                  d="M 0,90 Q 100,70 200,55 T 400,60"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="3"
                />
              </svg>

              <div className="absolute top-3 right-3 glass-panel p-2 rounded-lg text-[10px] font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-0.5 bg-red-400" />
                  <span>Unmanaged: Up to 58 min</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <span className="w-2 h-0.5 bg-cyan-400" />
                  <span>NEXUS Managed: 21 min Flat</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Aggregated Traveler Time Saved: 32,600 hours</span>
            <span className="text-emerald-400 font-bold">Carbon Emissions Cut: -42%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
