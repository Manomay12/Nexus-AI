import React from 'react';
import { Info, ShieldAlert, Globe2, Activity, Sparkles, CheckCircle } from 'lucide-react';

interface GeoDataLegendProps {
  className?: string;
}

export const GeoDataLegend: React.FC<GeoDataLegendProps> = ({ className = '' }) => {
  return (
    <div className={`glass-panel border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl bg-[#070b16]/90 shadow-2xl flex flex-col gap-2.5 text-xs ${className}`}>
      <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
        <Info className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-display font-bold text-white text-[11px] uppercase tracking-wider">
          Data Integrity & Telemetry Provenance
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Real Context */}
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1 shrink-0 shadow-glow-cyan" />
          <div className="leading-tight">
            <span className="font-semibold text-cyan-300 font-mono text-[10px]">
              REAL GEOGRAPHIC CONTEXT:
            </span>
            <p className="text-[10px] text-slate-300">
              Satellite basemaps, DigitalGlobe orthophotos, terrain elevation & venue geometries.
            </p>
          </div>
        </div>

        {/* Operational Simulation */}
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 mt-1 shrink-0 shadow-glow-violet" />
          <div className="leading-tight">
            <span className="font-semibold text-violet-300 font-mono text-[10px]">
              SIMULATED OPERATIONAL LAYER:
            </span>
            <p className="text-[10px] text-slate-300">
              Synthetic crowd flow, IoT turnstiles, bus GPS headway & hotel reservation rates.
            </p>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0 animate-pulse" />
          <div className="leading-tight">
            <span className="font-semibold text-amber-300 font-mono text-[10px]">
              AI PREDICTED RISK HOTSPOTS:
            </span>
            <p className="text-[10px] text-slate-300">
              Algorithmic +30m bottleneck forecasts calibrated with historical event analogies.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimers & Accuracy Banner */}
      <div className="mt-1 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] font-mono text-slate-400 flex items-center justify-between">
        <span>SATELLITE ORBITAL RESOLUTION: 0.5M GSD</span>
        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
          <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
        </span>
      </div>
    </div>
  );
};
