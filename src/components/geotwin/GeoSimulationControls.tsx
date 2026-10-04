import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  CloudRain, 
  Users, 
  Train, 
  Hotel, 
  Check, 
  Sparkles,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeoScenario } from '../../types/geoTwin';
import { soundFx } from '../../utils/audio';

interface CustomVariables {
  attendance: number; // in thousands (50k - 120k)
  eventEndTime: number; // in minutes offset (-60m to +60m)
  transportLoad: number; // percent (40% - 100%)
  hotelOccupancy: number; // percent (60% - 100%)
}

interface GeoSimulationControlsProps {
  currentScenario: GeoScenario;
  onSelectScenario: (scenario: GeoScenario, customVars?: CustomVariables) => void;
  onReset: () => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  className?: string;
}

export const GeoSimulationControls: React.FC<GeoSimulationControlsProps> = ({
  currentScenario,
  onSelectScenario,
  onReset,
  isOpen: controlledIsOpen,
  onToggleOpen,
  className = ''
}) => {
  // Support either controlled or internal open state
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = onToggleOpen || (() => setInternalIsOpen(prev => !prev));

  // Staged scenario selection before clicking [RUN SIMULATION]
  const [stagedScenario, setStagedScenario] = useState<GeoScenario>(currentScenario);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPhase, setSimulationPhase] = useState<'IDLE' | 'CURRENT' | 'SIMULATING' | 'PREDICTED'>('IDLE');

  // Custom variables
  const [variables, setVariables] = useState<CustomVariables>({
    attendance: 85,
    eventEndTime: 0,
    transportLoad: 82,
    hotelOccupancy: 78
  });

  const quickScenarios: Array<{
    id: GeoScenario;
    label: string;
    sublabel: string;
    weather?: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    vars: Partial<CustomVariables>;
  }> = [
    {
      id: 'early_exit',
      label: 'Event Ends Early',
      sublabel: 'Sudden crowd surge at JWCC gate',
      icon: Users,
      accentColor: 'text-pink-400',
      vars: { attendance: 95, eventEndTime: -45, transportLoad: 92, hotelOccupancy: 84 }
    },
    {
      id: 'heavy_rain',
      label: 'Monsoon Downpour',
      sublabel: 'WEH flood & speed reduction',
      weather: 'Heavy Rainfall (55mm/h)',
      icon: CloudRain,
      accentColor: 'text-blue-400',
      vars: { attendance: 80, eventEndTime: 0, transportLoad: 96, hotelOccupancy: 90 }
    },
    {
      id: 'metro_disruption',
      label: 'Metro Line 2 Disruption',
      sublabel: '14,000 riders diverted to buses',
      icon: Train,
      accentColor: 'text-amber-400',
      vars: { attendance: 85, eventEndTime: 0, transportLoad: 98, hotelOccupancy: 78 }
    },
    {
      id: 'hotel_saturation',
      label: 'BKC Hotel Saturation',
      sublabel: '99% cluster occupancy',
      icon: Hotel,
      accentColor: 'text-violet-400',
      vars: { attendance: 90, eventEndTime: +15, transportLoad: 80, hotelOccupancy: 99 }
    }
  ];

  const handleSelectQuick = (sc: typeof quickScenarios[0]) => {
    soundFx.playClick();
    setStagedScenario(sc.id);
    setVariables(prev => ({ ...prev, ...sc.vars }));
  };

  const handleSelectBaseline = () => {
    soundFx.playClick();
    setStagedScenario('normal');
    setVariables({
      attendance: 65,
      eventEndTime: 0,
      transportLoad: 68,
      hotelOccupancy: 72
    });
  };

  const handleRunSimulation = () => {
    soundFx.playSuccess();
    setIsSimulating(true);
    setSimulationPhase('CURRENT');

    // Simulate multi-stage transition: Current -> Simulating -> Predicted
    setTimeout(() => {
      setSimulationPhase('SIMULATING');
    }, 400);

    setTimeout(() => {
      setSimulationPhase('PREDICTED');
      onSelectScenario(stagedScenario, variables);
    }, 900);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationPhase('IDLE');
    }, 1500);
  };

  const handleResetBaseline = () => {
    soundFx.playClick();
    setStagedScenario('normal');
    setVariables({
      attendance: 65,
      eventEndTime: 0,
      transportLoad: 68,
      hotelOccupancy: 72
    });
    onReset();
  };

  const getScenarioDisplayName = (sc: GeoScenario) => {
    switch (sc) {
      case 'early_exit': return 'Event Ends Early';
      case 'heavy_rain': return 'Monsoon Downpour';
      case 'metro_disruption': return 'Metro Line 2 Disruption';
      case 'hotel_saturation': return 'BKC Hotel Saturation';
      default: return 'Baseline';
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <AnimatePresence>
        {/* EXPANDED COMMAND TRAY (Slides Upward via Framer Motion) */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl glass-panel border border-cyan-500/30 bg-[#060a18]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl flex flex-col gap-3.5 mb-2 z-30 pointer-events-auto"
          >
            {/* Tray Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold font-display uppercase tracking-wider text-white">
                      Scenario Injection Lab
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                      WHAT-IF ENGINE
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    Inject sudden operational disruptions to stress-test city transit and response capacity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetBaseline}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Reset to baseline schedule"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={toggleOpen}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Collapse Scenario Tray"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Columns: Baseline + Quick Scenarios (Left) & Custom Variables (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Left: Quick Scenarios */}
              <div className="md:col-span-7 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="uppercase tracking-wider">Quick Stress Scenarios</span>
                  <span className="text-[10px] text-cyan-400">SELECT TO ARMED STATE</span>
                </div>

                {/* Baseline Option */}
                <button
                  onClick={handleSelectBaseline}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    stagedScenario === 'normal'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-glow-cyan'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${
                      stagedScenario === 'normal' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Baseline Standard Event Schedule</div>
                      <div className="text-[10px] font-mono text-slate-400">Nominal 65k attendance, scheduled egress, optimal headway</div>
                    </div>
                  </div>
                  {stagedScenario === 'normal' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ARMED
                    </span>
                  )}
                </button>

                {/* Quick 4 Scenarios in 2x2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickScenarios.map((sc) => {
                    const Icon = sc.icon;
                    const isStaged = stagedScenario === sc.id;

                    return (
                      <button
                        key={sc.id}
                        onClick={() => handleSelectQuick(sc)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                          isStaged
                            ? 'bg-gradient-to-br from-cyan-500/20 to-transparent border-cyan-500/60 shadow-glow-cyan text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`p-1.5 rounded-lg border transition-colors ${
                            isStaged ? 'bg-cyan-500/20 border-cyan-500/40 ' + sc.accentColor : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isStaged && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {sc.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                            {sc.sublabel}
                          </div>
                          {sc.weather && (
                            <div className="text-[9px] font-mono text-blue-300 mt-0.5 flex items-center gap-1">
                              <span>Weather: {sc.weather}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Custom Variable Sliders */}
              <div className="md:col-span-5 flex flex-col gap-2.5 p-3 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-white/5">
                  <span className="uppercase tracking-wider">Custom Variables</span>
                  <span className="text-[10px] text-cyan-400">FINE-TUNE MULTIPLIERS</span>
                </div>

                {/* Slider 1: Attendance */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Attendance</span>
                    <span className="text-cyan-300 font-bold">{variables.attendance},000</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="120"
                    value={variables.attendance}
                    onChange={(e) => setVariables(v => ({ ...v, attendance: Number(e.target.value) }))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 2: Event End Time */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Event End Time</span>
                    <span className="text-violet-300 font-bold">
                      {variables.eventEndTime === 0 ? 'On Schedule' : variables.eventEndTime > 0 ? `+${variables.eventEndTime}m late` : `${variables.eventEndTime}m early`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="15"
                    value={variables.eventEndTime}
                    onChange={(e) => setVariables(v => ({ ...v, eventEndTime: Number(e.target.value) }))}
                    className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 3: Transport Capacity Load */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Transport Load</span>
                    <span className="text-amber-300 font-bold">{variables.transportLoad}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={variables.transportLoad}
                    onChange={(e) => setVariables(v => ({ ...v, transportLoad: Number(e.target.value) }))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 4: Hotel Occupancy */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Hotel Occupancy</span>
                    <span className="text-pink-300 font-bold">{variables.hotelOccupancy}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={variables.hotelOccupancy}
                    onChange={(e) => setVariables(v => ({ ...v, hotelOccupancy: Number(e.target.value) }))}
                    className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* RUN SIMULATION BUTTON */}
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold font-display tracking-wider text-xs shadow-glow-cyan hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <Zap className="w-4 h-4 text-slate-950 animate-bounce" />
                      <span>SIMULATING CASCADE ({simulationPhase})...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>RUN SIMULATION</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Phase Progression Indicator */}
            {isSimulating && (
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-cyan-300 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${simulationPhase === 'CURRENT' ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>Current State</span>
                  <span className="text-slate-500">→</span>
                  <span className={`w-2 h-2 rounded-full ${simulationPhase === 'SIMULATING' ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>Stress Simulation</span>
                  <span className="text-slate-500">→</span>
                  <span className={`w-2 h-2 rounded-full ${simulationPhase === 'PREDICTED' ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>Predicted State</span>
                </div>
                <span className="text-white font-bold">RECALCULATING SPATIAL HEATMAP...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPACT FLOATING TRIGGER BAR (Always visible at bottom when collapsed) */}
      <motion.button
        onClick={() => {
          soundFx.playClick();
          toggleOpen();
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-panel border border-cyan-500/40 bg-[#070b16]/95 hover:bg-[#0c1328]/95 px-4 py-2 rounded-full shadow-2xl text-xs font-mono text-slate-200 flex items-center gap-3 pointer-events-auto backdrop-blur-xl group transition-all"
        title="Click to expand/collapse Scenario Injection Lab"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold font-display tracking-wider text-white">
            SCENARIO INJECTION
          </span>
        </div>

        <span className="w-[1px] h-3.5 bg-white/15" />

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase">ACTIVE:</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400 uppercase tracking-wide">
            {getScenarioDisplayName(currentScenario)}
          </span>
        </div>

        {/* Toggle Chevron */}
        <div className="text-slate-400 group-hover:text-cyan-300 transition-colors ml-1">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </motion.button>
    </div>
  );
};
