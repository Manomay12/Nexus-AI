import React from 'react';
import { useNexus } from '../../context/NexusContext';
import { IntelligentAlert } from '../../types/nexus';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const AlertCenter: React.FC = () => {
  const { alerts, resolveAlert, dismissAlert, executePlan, responsePlans, executeRedistribution } = useNexus();

  const handleSimulateOrAction = (alert: IntelligentAlert) => {
    soundFx.playClick();
    if (alert.severity === 'critical') {
      executePlan(responsePlans[2]);
    } else if (alert.severity === 'opportunity' || alert.severity === 'warning') {
      executeRedistribution();
    }
    resolveAlert(alert.id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">Intelligent Alert System</h2>
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                ROOT-CAUSE TELEMETRY & MULTI-TIER ESCALATION
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Predictive warnings generated from real-time crowd velocity, station ingress counters, and hotel aggregator telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
            1 CRITICAL
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            1 WARNING
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            1 OPPORTUNITY
          </span>
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isOpportunity = alert.severity === 'opportunity';

          return (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col gap-4 ${
                alert.resolved
                  ? 'bg-slate-900/40 border-white/5 opacity-60'
                  : isCritical
                  ? 'glass-panel border-red-500/40 shadow-glow-danger'
                  : isWarning
                  ? 'glass-panel border-amber-500/40 shadow-glow-warning'
                  : 'glass-panel border-emerald-500/40 shadow-glow-emerald'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-lg border ${
                    isCritical ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    isWarning ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {isCritical ? <AlertCircle className="w-4 h-4" /> :
                     isWarning ? <AlertTriangle className="w-4 h-4" /> :
                     <Sparkles className="w-4 h-4" />}
                  </span>

                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {alert.severity} • {alert.zone}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ETA to Peak: <strong className="text-white">{alert.etaToPeak}</strong>
                  </span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white font-display">
                "{alert.title}"
              </h3>

              {/* Detailed Breakdown: Why? Impact? Recommended Action? */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    WHY? (ROOT CAUSE)
                  </span>
                  <p className="text-slate-200 leading-relaxed">{alert.why}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    IMPACT CASCADE
                  </span>
                  <p className="text-slate-200 leading-relaxed">{alert.impact}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1">
                    RECOMMENDED ACTION
                  </span>
                  <p className="text-slate-200 leading-relaxed">{alert.recommendedAction}</p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {alert.resolved ? 'Status: Resolved & Mitigated' : 'Status: Escalation Active'}
                </span>

                <div className="flex items-center gap-2">
                  {!alert.resolved && (
                    <button
                      onClick={() => handleSimulateOrAction(alert)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        isCritical
                          ? 'bg-red-500 hover:bg-red-400 text-white shadow-glow-danger'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isCritical ? 'Execute Mitigation' : 'Simulate Response'}</span>
                    </button>
                  )}

                  {alert.resolved && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Actioned</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
