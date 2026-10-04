import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  Hotel, 
  Utensils, 
  Car, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  TrendingDown, 
  Compass, 
  Percent, 
  BedDouble, 
  DollarSign,
  Share2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const HospitalityEngine: React.FC = () => {
  const { 
    zones, 
    redistributionActive, 
    executeRedistribution, 
    setSelectedZone,
    setActiveTab
  } = useNexus();

  // Zone A (Venue) and Zone D
  const zoneA = zones.find(z => z.id === 'zone-venue') || zones[0];
  const zoneD = zones.find(z => z.id === 'zone-d') || zones[4];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Spatial Hospitality Intelligence */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Hotel className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Hospitality Capacity Engine</h2>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                ECOSYSTEM VISUALIZATION & DYNAMIC YIELD REDISTRIBUTION
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time tracking of city room inventories, restaurant seat turnovers, parking lots, and AI-governed crowd redistribution.
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="glass-panel px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">TOTAL ROOMS</span>
            <span className="text-sm font-bold text-white">26,200</span>
          </div>
          <div className="glass-panel px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">CITY-WIDE VACANCY</span>
            <span className="text-sm font-bold text-cyan-300">2,995 (11.4%)</span>
          </div>
        </div>
      </div>

      {/* KILLER FEATURE: AI REDISTRIBUTION RECOMMENDATION BOX */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-indigo-950/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> UNDERUTILIZED SECTOR DETECTED
              </span>
              <span className="text-xs font-mono text-cyan-400">ZONE D SURPLUS ENGINE</span>
            </div>

            <h3 className="text-lg font-bold text-white font-display">
              Zone D has 1,240 available hotel rooms while Zone A is at {zoneA.hotelCapacityPercent}% occupancy.
            </h3>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              AI recommendation: Redirect 18% of incoming visitors toward Zone D using combined rapid shuttle transit vouchers, guaranteed restaurant seating, and dynamic discount bundling.
            </p>

            {/* Before vs After Visual Comparison Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Zone A Before</span>
                <span className="text-xl font-bold font-display text-red-400 block mt-0.5">97%</span>
                <span className="text-[10px] text-slate-400">Severe Congestion</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Zone A After AI</span>
                <span className="text-xl font-bold font-display text-emerald-400 block mt-0.5">78%</span>
                <span className="text-[10px] text-emerald-400 font-mono">-19% Stabilized</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Zone D Absorption</span>
                <span className="text-xl font-bold font-display text-cyan-300 block mt-0.5">
                  {redistributionActive ? '61%' : '48%'}
                </span>
                <span className="text-[10px] text-slate-400">Surplus Absorbed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Avg Room Rate Cap</span>
                <span className="text-xl font-bold font-display text-indigo-300 block mt-0.5">$210</span>
                <span className="text-[10px] text-slate-400">Prevents Gouging</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="lg:w-72 shrink-0 flex flex-col justify-center items-center p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center gap-3">
            <span className="text-xs font-mono text-cyan-300">
              {redistributionActive ? 'ORCHESTRATION IN PROGRESS' : '1-CLICK DISPATCH'}
            </span>

            <button
              onClick={executeRedistribution}
              disabled={redistributionActive}
              className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glow-cyan transform active:scale-95 ${
                redistributionActive
                  ? 'bg-emerald-500 text-slate-950 cursor-default'
                  : 'bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950'
              }`}
            >
              {redistributionActive ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Redistribution Active (18%)</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Redirect 18% Visitors</span>
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-400 leading-tight">
              Pushes push notifications & shuttle tickets to 14,200 mobile attendees.
            </span>
          </div>
        </div>
      </div>

      {/* Spatial City Ecosystem Grid (All 6 Zones) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">
            Spatial Sector Capacity Ecosystem
          </h3>
          <span className="text-xs text-slate-400 font-mono">6 Metropolitan Zones Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const isCritical = zone.hotelCapacityPercent >= 90;

            return (
              <div
                key={zone.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedZone(zone);
                }}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {zone.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{zone.district}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      zone.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                      zone.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {zone.riskLevel}
                    </span>
                  </div>

                  {/* 4 Pillars: Hotels, Dining, Parking, Emergency */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
                        <BedDouble className="w-3 h-3 text-cyan-400" />
                        <span>HOTEL OCCUPANCY</span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-white'}`}>
                          {zone.hotelCapacityPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400">{zone.availableRooms} open</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
                        <Utensils className="w-3 h-3 text-indigo-400" />
                        <span>DINING SEATS</span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="font-bold text-white">{zone.restaurantDemandPercent}%</span>
                        <span className="text-[10px] text-slate-400">{zone.availableTables} tables</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
                        <Car className="w-3 h-3 text-violet-400" />
                        <span>PARKING SURPLUS</span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="font-bold text-white">{zone.parkingAvailabilityPercent}%</span>
                        <span className="text-[10px] text-slate-400">Available</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-0.5">
                        <ShieldAlert className="w-3 h-3 text-emerald-400" />
                        <span>EMERGENCY READY</span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="font-bold text-emerald-400">100%</span>
                        <span className="text-[10px] text-slate-400">&lt; 4m ETA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Avg Rate: {zone.avgRoomRate}</span>
                  <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Inspect Sector <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
