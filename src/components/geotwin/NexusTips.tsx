import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Keyboard, 
  HelpCircle, 
  Lightbulb, 
  Check,
  Maximize2,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

const STORAGE_KEY = 'nexus_geotwin_tips_dismissed';

interface NexusTipsProps {
  onFocusMapAction?: () => void;
  onOpenScenarioAction?: () => void;
  onToggleLayersAction?: () => void;
  onResetMapAction?: () => void;
}

export const NexusTips: React.FC<NexusTipsProps> = ({
  onFocusMapAction,
  onOpenScenarioAction,
  onToggleLayersAction,
  onResetMapAction
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [showKeyboardModal, setShowKeyboardModal] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const tips = [
    {
      id: 'tip-1',
      number: 'TIP 01',
      title: 'Inspect Operational Entities',
      description: 'Click any glowing location marker on the satellite basemap to inspect its live and predicted operational pressure, local capacity, and dispatch tactical mitigations.',
      actionLabel: 'Try Location Selection'
    },
    {
      id: 'tip-2',
      number: 'TIP 02',
      title: 'Focus Map / Fullscreen Hero',
      description: 'Use FOCUS MAP (top-right of the map or press "M") to explore high-resolution satellite geography across Mumbai without dashboard distractions. Press "Esc" to exit.',
      actionLabel: 'Preview Focus Mode',
      action: onFocusMapAction
    },
    {
      id: 'tip-3',
      number: 'TIP 03',
      title: 'Scenario Injection Lab',
      description: 'Open the floating command bar at the bottom (or press "S") to inject stress scenarios such as Monsoon Downpours, Metro Disruption, or Event Egress Surges.',
      actionLabel: 'Open Scenarios',
      action: onOpenScenarioAction
    },
    {
      id: 'tip-4',
      number: 'TIP 04',
      title: 'Temporal Timeline Slider',
      description: 'Drag the timeline slider (-30m to +120m) to simulate how crowd and traffic pressure cascades across the city into the future.',
      actionLabel: 'Explore Horizon'
    },
    {
      id: 'tip-5',
      number: 'TIP 05',
      title: 'Tactical Risk Zones & Layers',
      description: 'Toggle Risk Zones and 3D Extruded Buildings in the Spatial Layers panel (or press "L") to visualize where NEXUS predicts critical bottlenecks.',
      actionLabel: 'Toggle Layers',
      action: onToggleLayersAction
    }
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    soundFx.playClick();
    setIsDismissed(true);
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        console.warn('localStorage access failed', e);
      }
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (currentTipIndex > 0) {
      setCurrentTipIndex(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Help & Shortcuts Floating Trigger Button (Always available in top-right) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            soundFx.playClick();
            setShowKeyboardModal(true);
          }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors flex items-center gap-1 text-[11px] font-mono"
          title="Keyboard Shortcuts & Help"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>

        {isDismissed && (
          <button
            onClick={() => {
              soundFx.playClick();
              setIsDismissed(false);
              setCurrentTipIndex(0);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-300 border border-white/10 transition-colors flex items-center gap-1 text-[11px] font-mono"
            title="Re-open NEXUS Onboarding Tips"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tips</span>
          </button>
        )}
      </div>

      {/* Onboarding Floating Tooltip Card */}
      {!isDismissed && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] glass-panel border border-cyan-500/40 bg-[#060a18]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-glow-cyan text-slate-100 flex flex-col gap-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono tracking-wider text-cyan-300 uppercase">
                  {tips[currentTipIndex].number}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({currentTipIndex + 1}/{tips.length})
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Dismiss Tips"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <div>
            <h4 className="text-xs font-bold text-white font-display tracking-wide mb-1">
              {tips[currentTipIndex].title}
            </h4>
            <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
              {tips[currentTipIndex].description}
            </p>
          </div>

          {/* Action (if any) */}
          {tips[currentTipIndex].action && (
            <button
              onClick={() => {
                soundFx.playClick();
                tips[currentTipIndex].action?.();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{tips[currentTipIndex].actionLabel}</span>
            </button>
          )}

          {/* Footer Controls & Persistent Checkbox */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={currentTipIndex === 0}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 px-2.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{currentTipIndex === tips.length - 1 ? 'Got it' : 'Next'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={handleDismiss}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
              >
                Dismiss
              </button>
            </div>

            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1 text-[10px] font-mono text-slate-400 select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-700 bg-black/50 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3 h-3"
              />
              <span>Don't show tips again</span>
            </label>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel border border-white/15 bg-[#060919]/95 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">NEXUS Tactical Commands</p>
                </div>
              </div>

              <button
                onClick={() => setShowKeyboardModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts Table */}
            <div className="flex flex-col gap-2 text-xs font-mono">
              {[
                { key: 'M', desc: 'Toggle FOCUS MAP Mode (Fullscreen Hero)' },
                { key: 'L', desc: 'Toggle Spatial Layers Panel (Collapse / Expand)' },
                { key: 'S', desc: 'Open / Close Scenario Injection Command Tray' },
                { key: 'R', desc: 'Reset Map Camera to JWCC BKC Sector' },
                { key: 'Esc', desc: 'Exit Focus Mode / Close Panels' },
                { key: '?', desc: 'Open Keyboard Shortcuts Help' }
              ].map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <span className="text-slate-300 text-[11px]">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-black/60 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-inner">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowKeyboardModal(false)}
                className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
