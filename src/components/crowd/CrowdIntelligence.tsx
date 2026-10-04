import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  Users, 
  ShieldAlert, 
  ArrowRight, 
  Activity, 
  Zap, 
  Compass, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const CrowdIntelligence: React.FC = () => {
  const { currentEvent, triggerVoiceBriefing } = useNexus();
  const [gatesReconfigured, setGatesReconfigured] = useState(false);

  const gates = [
    { id: 'gate-1', name: 'Gate 1 (Central Metro Link)', flowRate: '480 pax/min', density: '4.8 pax/m²', status: 'CRITICAL', capacity: 96 },
    { id: 'gate-2', name: 'Gate 2 (North Concourse)', flowRate: '290 pax/min', density: '3.1 pax/m²', status: 'MODERATE', capacity: 68 },
    { id: 'gate-3', name: 'Gate 3 (East Transit Loop)', flowRate: '340 pax/min', density: '3.6 pax/m²', status: 'HIGH', capacity: 82 },
    { id: 'gate-4', name: 'Gate 4 (Skybridge Express B)', flowRate: '160 pax/min', density: '1.4 pax/m²', status: 'STABLE', capacity: 38 },
    { id: 'gate-5', name: 'Gate 5 (VIP / Hospitality Deck)', flowRate: '95 pax/min', density: '1.1 pax/m²', status: 'STABLE', capacity: 26 },
    { id: 'gate-6', name: 'Gate 6 (Southern Boulevard)', flowRate: '410 pax/min', density: '4.2 pax/m²', status: 'HIGH', capacity: 89 }
  ];

  const handleReconfigureTurnstiles = () => {
    soundFx.playSuccess();
    setGatesReconfigured(true);
    triggerVoiceBriefing("Automated turnstile bypass engaged. Gates 1 and 6 switched to unhindered bidirectional egress.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Crowd Intelligence & Density Dynamics</h2>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                OPTICAL SENSOR TELEMETRY & CRUSH PREVENTION
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Millisecond-level crowd velocity analysis, ingress-to-egress turnstile reversal, and corridor bottleneck suppression.
          </p>
        </div>

        <button
          onClick={handleReconfigureTurnstiles}
          disabled={gatesReconfigured}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-cyan ${
            gatesReconfigured
              ? 'bg-emerald-500 text-slate-950 cursor-default'
              : 'bg-gradient-to-r from-cyan-400 to-violet-600 hover:from-cyan-300 hover:to-violet-500 text-slate-950'
          }`}
        >
          {gatesReconfigured ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Turnstiles Reconfigured</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Reconfigure Egress Turnstiles</span>
            </>
          )}
        </button>
      </div>

      {/* Real-Time Turnstile Gate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gates.map((gate) => {
          const isCrit = gate.status === 'CRITICAL';
          const isHigh = gate.status === 'HIGH';

          return (
            <div
              key={gate.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isCrit ? 'glass-panel border-red-500/40 shadow-glow-danger' :
                isHigh ? 'glass-panel border-amber-500/40 shadow-glow-warning' :
                'glass-panel border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isCrit ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    isHigh ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {gate.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{gate.flowRate}</span>
                </div>

                <h4 className="text-sm font-bold text-white font-display mb-1">{gate.name}</h4>
                <div className="text-xs text-slate-300 font-mono">
                  Density: <span className="text-white font-bold">{gate.density}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Capacity Saturation</span>
                  <span className={isCrit ? 'text-red-400 font-bold' : 'text-slate-300'}>{gate.capacity}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isCrit ? 'bg-red-500' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${gate.capacity}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
