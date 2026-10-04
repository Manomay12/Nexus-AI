import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  Smartphone, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Clock, 
  Hotel, 
  Utensils, 
  Bus, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Activity,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const VisitorMobileApp: React.FC = () => {
  const { currentEvent } = useNexus();
  const [selectedTab, setSelectedTab] = useState<'route' | 'hotel' | 'dining'>('route');

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
      {/* Container with intro banner */}
      <div className="mb-4 text-center max-w-md">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          STAKEHOLDER: VISITOR COMPANION APP
        </span>
        <h2 className="text-xl font-bold font-display text-white mt-1">Personal Mega-Event Guide</h2>
        <p className="text-xs text-slate-400">
          Simulated smartphone viewport demonstrating attendee personal travel guidance.
        </p>
      </div>

      {/* Realistic Smartphone Mockup */}
      <div className="relative w-full max-w-[360px] h-[720px] rounded-[44px] bg-[#0A0D18] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between select-none">
        {/* Top Notch / Dynamic Island */}
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 flex items-center justify-between px-6 z-30">
          <span className="text-[10px] font-mono text-white">19:42</span>
          <div className="w-20 h-3.5 bg-black rounded-full" />
          <div className="flex items-center gap-1 text-[10px] text-white">
            <span>5G</span>
            <div className="w-3.5 h-2 border border-white rounded-sm bg-white" />
          </div>
        </div>

        {/* App Content Header */}
        <div className="pt-8 px-4 pb-3 bg-gradient-to-b from-slate-900 to-transparent border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">YOUR PASS</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Event Ending Soon</span>
            </div>
          </div>
          <h3 className="text-base font-bold text-white font-display mt-0.5">{currentEvent.name}</h3>
          <span className="text-[10px] text-cyan-400 font-mono">{currentEvent.venueName}</span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* AI Killer Recommendation Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/40 shadow-glow-cyan">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEXUS Personal Guidance:</span>
            </div>
            <p className="text-xs text-white font-medium leading-relaxed">
              "Leave through <span className="text-cyan-300 font-bold underline">Exit B</span> in 12 minutes to avoid peak congestion at the Main Station."
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] font-mono">
              <span className="text-emerald-400">Walking Time: 4 mins</span>
              <span className="text-cyan-300 font-bold">Crowd: LOW (38%)</span>
            </div>
          </div>

          {/* Quick Sub-Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5">
            {[
              { id: 'route', label: 'Egress Route', icon: Navigation },
              { id: 'hotel', label: 'Hotels', icon: Hotel },
              { id: 'dining', label: 'Dining', icon: Utensils }
            ].map(tab => {
              const TIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedTab(tab.id as any);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                    selectedTab === tab.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TIcon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Recommended Route */}
          {selectedTab === 'route' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Recommended Low-Crowd Route</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">18 MINS TOTAL</span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Concourse Exit Gate B (4 min walk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span>Electric Shuttle B (Express to Metro C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Rapid Transit Line 3 (Zero Queues)</span>
                  </div>
                </div>

                <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 mt-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Start Live Turn-by-Turn</span>
                </button>
              </div>

              {/* Crowd Radar Indicator */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">EXIT B CONGESTION</span>
                  <span className="text-xs font-bold text-emerald-400">Optimal (42% Capacity)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">MAIN GATE</span>
                  <span className="text-xs font-bold text-red-400">Severe (96% Jammed)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Available Hotels */}
          {selectedTab === 'hotel' && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Zone D Eco-Resort & Spa</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">$160/night</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Free express shuttle from Exit B. 1,240 verified rooms open.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300">15% Event Voucher Active</span>
                  <button className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 text-[10px] font-bold">
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Nearby Dining */}
          {selectedTab === 'dining' && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Skyline Pavilion Dining</span>
                  <span className="text-[10px] text-emerald-400 font-mono">14 Tables Open</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Late-night menu open until 02:00. Fast pedestrian access from Exit B.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Home Indicator */}
        <div className="p-2 flex justify-center bg-slate-950">
          <div className="w-28 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
