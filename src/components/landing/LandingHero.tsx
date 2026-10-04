import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { CityDigitalTwin } from '../digitaltwin/CityDigitalTwin';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Hotel, 
  Bus, 
  Activity, 
  Play,
  Cpu
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface LandingHeroProps {
  onEnterCommand: () => void;
  onExploreTwin: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterCommand, onExploreTwin }) => {
  const { currentEvent, simulationImpact } = useNexus();

  return (
    <div className="relative w-full min-h-screen bg-[#05070E] overflow-hidden flex flex-col justify-between select-none">
      {/* 3D City Digital Twin Backdrop with cinematic vignette */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
        <CityDigitalTwin heightClass="h-full w-full" showControls={false} />
      </div>

      {/* Cybernetic Dark Gradient Overlays for Cinematic Readability */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-[#05070E] via-[#05070E]/60 to-transparent" />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-r from-[#05070E]/90 via-[#05070E]/40 to-transparent" />
      <div className="absolute inset-0 z-1 pointer-events-none scanline-overlay opacity-30" />

      {/* Navigation Header */}
      <header className="relative z-20 w-full px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-slate-950 shadow-glow-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-white">NEXUS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                AI ORCHESTRATOR
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">
              PREDICT THE PRESSURE. ORCHESTRATE THE CITY.
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs font-mono text-cyan-300 border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>GLOBAL EVENT READY</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onEnterCommand();
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-cyan flex items-center gap-2"
          >
            <span>Launch Mission Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Center Body */}
      <main className="relative z-10 px-6 md:px-12 py-12 max-w-5xl flex flex-col justify-center">
        {/* Event Scope Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/40 w-fit mb-6 shadow-glow-cyan animate-in fade-in duration-700">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-200 tracking-wider">
            MEGA-EVENT HOSPITALITY & MOBILITY ORCHESTRATION
          </span>
        </div>

        {/* Exact Headline specified in Prompt */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-[1.08] mb-6">
          When Millions Move,<br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Intelligence Must Move First.
          </span>
        </h1>

        {/* Exact Subheadline specified in Prompt */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8 font-sans">
          NEXUS AI predicts crowd pressure, anticipates hospitality demand, and orchestrates smarter movement during the world's largest events.
        </p>

        {/* Dual Primary & Secondary CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <button
            onClick={() => {
              soundFx.playClick();
              onEnterCommand();
            }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-display font-extrabold text-sm uppercase tracking-wider transition-all shadow-glow-cyan flex items-center gap-3 transform hover:-translate-y-0.5"
          >
            <Globe className="w-4 h-4" />
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onExploreTwin();
            }}
            className="px-8 py-4 rounded-2xl glass-panel hover:bg-white/10 text-white font-display font-bold text-sm uppercase tracking-wider transition-all border border-cyan-500/30 hover:border-cyan-400 flex items-center gap-3"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore Digital Twin</span>
          </button>
        </div>

        {/* 4 LIVE FLOATING SPATIAL METRICS SPECIFIED IN PROMPT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          {/* Metric 1 */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-3xl font-black font-display text-white">84,000</span>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider mt-0.5">
              Active Visitors
            </span>
          </div>

          {/* Metric 2 */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-3xl font-black font-display text-white">72%</span>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider mt-0.5">
              Hotel Capacity
            </span>
          </div>

          {/* Metric 3 */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-3xl font-black font-display text-white">89%</span>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-wider mt-0.5">
              Transport Load
            </span>
          </div>

          {/* Metric 4 */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-3xl font-black font-display text-emerald-400">Low</span>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider mt-0.5">
              City Risk Level
            </span>
          </div>
        </div>
      </main>

      {/* Global Mega-Events Ticker Footer */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-4 border-t border-white/10 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold">MONITORED SPECTACLES:</span>
          <span>🏏 Cricket World Cup</span>
          <span>🏎 Formula 1 Grand Prix</span>
          <span>🎶 Tomorrowland</span>
          <span>🏅 Olympic Games</span>
        </div>
        <div>
          <span>NEXUS v4.8 • Apple Vision Pro Spatial Telemetry Core</span>
        </div>
      </footer>
    </div>
  );
};
