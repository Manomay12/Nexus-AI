import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { 
  Zap, 
  AlertTriangle, 
  Clock, 
  Bus, 
  Train, 
  Smartphone, 
  Shield, 
  Users, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const ResponseOrchestrator: React.FC = () => {
  const { activePlan, executePlan, hasExecutedPlan } = useNexus();
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const handleSimulate = () => {
    soundFx.playClick();
    setIsSimulating(true);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          soundFx.playSuccess();
          return 3;
        }
        soundFx.playHover();
        return prev + 1;
      });
    }, 900);
  };

  const handleApprove = () => {
    executePlan(activePlan);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">AI Response Orchestrator</h2>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                SYNCHRONIZED MULTI-AGENCY TACTICAL TIMELINE
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Autonomous synthesis of cross-departmental operations: Fleet mobilization, citizen notifications, physical perimeter gates, and steward dispatch.
          </p>
        </div>

        {/* Action Buttons: Simulate vs Approve */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-cyan"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Plan'}</span>
          </button>

          <button
            onClick={handleApprove}
            disabled={hasExecutedPlan}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-cyan ${
              hasExecutedPlan
                ? 'bg-emerald-500 text-slate-950 cursor-default'
                : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-violet-600 hover:from-cyan-300 hover:to-violet-500 text-slate-950'
            }`}
          >
            {hasExecutedPlan ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Plan Approved & Deployed</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Approve Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Critical Alert Trigger Box */}
      <div className="glass-panel p-5 rounded-2xl border border-red-500/40 bg-red-950/20 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider">
              ⚠ CRITICAL RISK DETECTED
            </span>
            <span className="text-[10px] font-mono text-slate-400">T-MINUS 37 MINUTES</span>
          </div>
          <h3 className="text-base font-bold text-white font-display">
            "Stadium exit predicted to overload Metro Line 2."
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            AI has generated an automated 4-stage coordinated response blueprint: <span className="text-cyan-300 font-bold">{activePlan.title}</span>. 
            Execution will reduce projected corridor congestion by <span className="text-emerald-400 font-bold font-mono">52%</span>.
          </p>
        </div>
      </div>

      {/* Response Timeline: T-30, T-20, T-15, T-5 */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Coordinated Orchestration Sequence
            </span>
            <h3 className="text-lg font-bold font-display text-white">Timeline Stages</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Current Status: <span className="text-emerald-400 font-bold font-mono">{hasExecutedPlan ? 'DISPATCHED' : isSimulating ? 'SIMULATING' : 'READY'}</span>
          </span>
        </div>

        {/* The 4 Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {activePlan.timelineSteps.map((step, idx) => {
            const isStepActive = isSimulating && currentStepIndex === idx;
            const isStepCompleted = (isSimulating && currentStepIndex > idx) || hasExecutedPlan;

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                  isStepCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-emerald'
                    : isStepActive
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan scale-105'
                    : 'bg-slate-900/60 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {step.timeOffset}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{step.agency}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 font-display">{step.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    isStepCompleted ? 'text-emerald-400' : isStepActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'
                  }`}>
                    {isStepCompleted ? 'Deployed' : isStepActive ? 'Simulating' : 'Stage Primed'}
                  </span>

                  {isStepCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Projected Impact Bottom HUD */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">CORRIDOR PRESSURE:</span>
            <span className="text-red-400 font-bold">88% BEFORE</span>
            <span>➔</span>
            <span className="text-emerald-400 font-bold">54% AFTER INTERVENTION</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <TrendingDown className="w-4 h-4" />
            <span>ESTIMATED CONGESTION SAVED: 18,400 PASSENGERS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
