import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Activity, 
  Cpu, 
  ArrowUpRight, 
  CheckCircle2,
  Database,
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { RiskZone, GeoScenario, GeoDestination } from '../../types/geoTwin';
import { soundFx } from '../../utils/audio';

interface GeoInsightsPanelProps {
  scenario: GeoScenario;
  timeOffset: number;
  activeRiskZones: RiskZone[];
  activeDestination?: GeoDestination;
  onApplyMitigation: (action: string) => void;
  className?: string;
}

export const GeoInsightsPanel: React.FC<GeoInsightsPanelProps> = ({
  scenario,
  timeOffset,
  activeRiskZones,
  activeDestination,
  onApplyMitigation,
  className = ''
}) => {
  const [explainOpen, setExplainOpen] = useState<boolean>(false);
  const [dataIntegrityOpen, setDataIntegrityOpen] = useState<boolean>(false);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  // Dynamic telemetry calculated based on activeDestination, scenario & time
  const baseCurrent = activeDestination ? activeDestination.pressure : (
    scenario === 'early_exit' ? 84 : 
    scenario === 'heavy_rain' ? 88 : 
    scenario === 'metro_disruption' ? 91 : 
    scenario === 'hotel_saturation' ? 82 : 75
  );

  const scenarioBonus = 
    scenario === 'early_exit' ? 8 : 
    scenario === 'heavy_rain' ? 12 : 
    scenario === 'metro_disruption' ? 14 : 
    scenario === 'hotel_saturation' ? 9 : 0;

  const currentPressure = Math.min(100, Math.round(baseCurrent + scenarioBonus + (timeOffset / 60) * 8));
  const predictedPressure = Math.min(100, Math.round(currentPressure + (
    scenario === 'heavy_rain' ? 14 : 
    scenario === 'metro_disruption' ? 13 : 
    scenario === 'early_exit' ? 11 : 8
  )));
  const delta = predictedPressure - currentPressure;

  // Custom data factors for Explain Decision
  const transportLoad = scenario === 'metro_disruption' ? 94 : scenario === 'heavy_rain' ? 92 : 84;
  const crowdPressure = scenario === 'early_exit' ? 95 : 82;
  const hotelOccupancy = scenario === 'hotel_saturation' ? 99 : 78;

  const handleActionClick = (actionKey: string, actionText: string) => {
    soundFx.playSuccess();
    setAppliedActions(prev => ({ ...prev, [actionKey]: true }));
    onApplyMitigation(actionText);
  };

  const recommendations = [
    {
      id: 'shuttles',
      action: 'Reroute Express Shuttles via BKC Bypass',
      why: 'Metro corridor pressure projected to exceed station threshold by 34%.',
      impact: '-18% corridor pressure in 12 mins',
      accent: 'cyan'
    },
    {
      id: 'voucher',
      action: 'Deploy Dynamic Hotel Vouchers (Zone D)',
      why: 'BKC Central cluster reaches 98.4% capacity during keynote release.',
      impact: 'Disperses 1,200 attendees to Northern Sector',
      accent: 'violet'
    },
    {
      id: 'signals',
      action: 'Synchronize Green-Phase Signals (WEH Junction)',
      why: 'Surface arterial bottleneck choking Western Express off-ramp.',
      impact: '+35s vehicle throughput priority',
      accent: 'amber'
    }
  ];

  return (
    <div className={`glass-panel border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl bg-[#070b16]/90 shadow-2xl flex flex-col gap-3 transition-all ${className}`}>
      {/* 1. Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 shadow-glow-cyan text-slate-950 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Spatial Intelligence
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                GEMINI 2.5 RAG
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Contextual Hotspot & Risk Synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">LIVE</span>
        </div>
      </div>

      {/* Scrollable Intelligence Body */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
        {/* 2. District Pressure Outlook (Current vs Predicted) */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">District Pressure Outlook</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
              HORIZON: +30 MIN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {/* Current Pressure */}
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Current Telemetry</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-display text-white">{currentPressure}%</span>
                <span className="text-[9px] font-mono text-slate-400">LOAD</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${currentPressure}%` }}
                />
              </div>
            </div>

            {/* Predicted Pressure */}
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-amber-300 uppercase">Predicted (+30M)</span>
                <span className="text-[9px] font-mono font-bold text-amber-400 flex items-center">
                  +{delta}% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-bold font-display ${predictedPressure >= 90 ? 'text-red-400' : 'text-amber-300'}`}>
                  {predictedPressure}%
                </span>
                <span className="text-[9px] font-mono text-slate-400">CRITICAL</span>
              </div>
              <div className="w-full bg-slate-800/80 h-1 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    predictedPressure >= 90 ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${predictedPressure}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Primary Bottleneck Factor */}
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-[10px] flex items-start gap-1.5 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold text-white uppercase tracking-wide">Primary Bottleneck: </span>
              {scenario === 'heavy_rain' && 'Monsoon surface water accumulation reducing WEH corridor speed by 38%.'}
              {scenario === 'metro_disruption' && 'Line 2 platform safety hold redirecting 14,000 riders to surface bus bays.'}
              {scenario === 'early_exit' && 'Concurrent keynote release at JWCC causing 400% pedestrian surge at BKC gate.'}
              {scenario === 'hotel_saturation' && 'BKC hotel cluster at 99.2% capacity; overflow redirect to Bandra Coastal required.'}
              {scenario === 'normal' && (activeDestination ? activeDestination.bottleneck : 'Steady evening ingress with minor congestion on BKC flyover ramp.')}
            </div>
          </div>
        </div>

        {/* 4. AI Recommendation Cards */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider text-[10px]">AI Recommendations</span>
            <span className="text-[9px] text-cyan-400 font-semibold">TACTICAL ACTIONS</span>
          </div>

          <div className="flex flex-col gap-2">
            {recommendations.map((rec) => {
              const isApplied = !!appliedActions[rec.id];

              return (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white leading-snug">
                        {rec.action}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-semibold">Why: </span>
                        {rec.why}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                    <div className="text-emerald-400 font-medium">
                      Impact: <span className="text-slate-200">{rec.impact}</span>
                    </div>

                    <button
                      onClick={() => handleActionClick(rec.id, rec.action)}
                      disabled={isApplied}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1 ${
                        isApplied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:scale-105'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <span>DEPLOY</span>
                          <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. [Explain Decision] Evidence Panel */}
        <div className="pt-1 flex flex-col">
          <button
            onClick={() => {
              soundFx.playClick();
              setExplainOpen(!explainOpen);
            }}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs font-mono text-cyan-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold uppercase tracking-wider text-[11px]">[Explain Decision] Evidence Rationale</span>
            </div>
            {explainOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {explainOpen && (
            <div className="mt-2 p-3 rounded-xl bg-[#03060f]/90 border border-cyan-500/30 flex flex-col gap-2.5 text-xs animate-fadeIn">
              {/* Data Factors */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  DATA FACTORS
                </span>
                <div className="grid grid-cols-3 gap-1.5 mt-1 text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-white/[0.03] border border-white/5 text-center">
                    <span className="text-slate-400 block text-[8px]">TRANSPORT</span>
                    <span className="text-cyan-300 font-bold">{transportLoad}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-white/[0.03] border border-white/5 text-center">
                    <span className="text-slate-400 block text-[8px]">CROWD</span>
                    <span className="text-violet-300 font-bold">{crowdPressure}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-white/[0.03] border border-white/5 text-center">
                    <span className="text-slate-400 block text-[8px]">HOTELS</span>
                    <span className="text-pink-300 font-bold">{hotelOccupancy}%</span>
                  </div>
                </div>
              </div>

              {/* Simulation */}
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase">SIMULATION PREDICTED:</span>
                <span className="text-amber-400 font-bold">{predictedPressure}% (Confidence 92.4%)</span>
              </div>

              {/* Knowledge Used */}
              <div className="pt-1.5 border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  KNOWLEDGE PROTOCOLS APPLIED
                </span>
                <ul className="list-disc list-inside text-[10px] font-mono text-slate-300 mt-1 space-y-0.5">
                  <li>MMRDA Urban Transit Congestion Protocol §4.2</li>
                  <li>Monsoon Flash Rainfall Dispersion Pattern (2024 Analogue)</li>
                </ul>
              </div>

              {/* Decision */}
              <div className="pt-1.5 border-t border-white/5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono">
                <span className="text-cyan-300 font-bold uppercase block mb-0.5">DECISION:</span>
                <span className="text-slate-200">
                  Activate Express Shuttle Route B bypass and extend green-phase signal priority by +35s to prevent corridor gridlock.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Secondary Collapsible: Data Integrity & Provenance */}
        <div className="pt-1 flex flex-col">
          <button
            onClick={() => {
              soundFx.playClick();
              setDataIntegrityOpen(!dataIntegrityOpen);
            }}
            className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] font-mono text-slate-400 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Data Integrity & Telemetry Provenance</span>
            </div>
            {dataIntegrityOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {dataIntegrityOpen && (
            <div className="mt-1.5 p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 text-[9px] font-mono text-slate-400 animate-fadeIn">
              <div className="flex justify-between">
                <span>Tile Basemap:</span>
                <span className="text-slate-200">Esri World Imagery (Maxar Earthstar)</span>
              </div>
              <div className="flex justify-between">
                <span>Vector Footprints:</span>
                <span className="text-slate-200">OpenStreetMap & MMRDA GIS 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Backend Gateway:</span>
                <span className="text-emerald-400">FastAPI Synchronized (127.0.0.1:8000)</span>
              </div>
              <div className="flex justify-between">
                <span>Edge Cache Latency:</span>
                <span className="text-cyan-300">14ms (Locally Grounded)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
