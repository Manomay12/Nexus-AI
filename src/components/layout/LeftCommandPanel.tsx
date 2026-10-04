import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  Globe, 
  Layers, 
  TrendingUp, 
  Users, 
  Hotel, 
  Bus, 
  Cpu, 
  SlidersHorizontal, 
  Zap, 
  Bell, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const LeftCommandPanel: React.FC = () => {
  const { activeTab, setActiveTab, alerts, simulationImpact } = useNexus();

  const navItems = [
    { id: 'command', label: 'Command Center', icon: Globe, badge: 'LIVE' },
    { id: 'geotwin', label: 'Geo-Twin Satellite', icon: Compass, badge: 'NEW' },
    { id: 'twin', label: '3D Digital Twin', icon: Layers },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'crowd', label: 'Crowd Intelligence', icon: Users },
    { id: 'hospitality', label: 'Hospitality Engine', icon: Hotel },
    { id: 'transport', label: 'Transport Network', icon: Bus },
    { id: 'simulator', label: 'Scenario Simulator', icon: SlidersHorizontal, highlight: true },
    { id: 'orchestrator', label: 'Response Planner', icon: Zap },
    { id: 'alerts', label: 'Alerts Hub', icon: Bell, alertCount: alerts.filter(a => !a.resolved).length },
    { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 h-[calc(100vh-4rem)] flex flex-col justify-between py-4 px-3 select-none z-30 shrink-0">
      {/* Brand & Logo Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-glow-cyan">
            <Cpu className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-wider text-white">NEXUS</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight truncate">
              Predict. Orchestrate.
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(item.id);
                }}
                onMouseEnter={() => soundFx.playHover()}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/10 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      KILLER
                    </span>
                  )}
                  {item.alertCount && item.alertCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-glow-danger">
                      {item.alertCount}
                    </span>
                  ) : null}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Control Health Card */}
      <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">ORCHESTRATOR HEALTH</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">99.98%</span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[94%]" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
          <span>Active Nodes: 142</span>
          <span>Latency: 18ms</span>
        </div>
      </div>
    </aside>
  );
};
