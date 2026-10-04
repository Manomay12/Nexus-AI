import React, { useState } from 'react';
import { useNexus, MEGA_EVENTS } from '../../context/NexusContext';
import { StakeholderRole } from '../../types/nexus';
import { 
  Radio, 
  Clock, 
  Users, 
  Activity, 
  BrainCircuit, 
  Volume2, 
  VolumeX, 
  Bell, 
  Mic, 
  MicOff, 
  ChevronDown,
  Shield,
  Hotel,
  Bus,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const TopStatusBar: React.FC = () => {
  const { 
    currentEvent, 
    setEventId, 
    liveTime, 
    simulationImpact, 
    currentStakeholder, 
    setStakeholder,
    isAudioMuted,
    toggleAudioMute,
    isVoiceSpeaking,
    triggerVoiceBriefing,
    stopVoiceBriefing,
    alerts,
    setActiveTab,
    setActiveCopilotOpen
  } = useNexus();

  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const unreadAlertsCount = alerts.filter(a => !a.resolved).length;

  const getPressureColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400 bg-red-950/60 border-red-500/40 shadow-glow-danger';
      case 'HIGH': return 'text-amber-400 bg-amber-950/60 border-amber-500/40 shadow-glow-warning';
      case 'MODERATE': return 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 shadow-glow-cyan';
      default: return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40 shadow-glow-emerald';
    }
  };

  const getRoleIcon = (role: StakeholderRole) => {
    switch (role) {
      case 'commander': return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      case 'hospitality': return <Hotel className="w-3.5 h-3.5 text-indigo-400" />;
      case 'transport': return <Bus className="w-3.5 h-3.5 text-violet-400" />;
      case 'visitor': return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <header className="relative z-40 w-full h-16 glass-panel border-b border-white/10 px-4 flex items-center justify-between gap-3 select-none">
      {/* Left: Live Event Selector & Status Badge */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsEventMenuOpen(!isEventMenuOpen);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">LIVE EVENT</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors font-display truncate max-w-[200px] md:max-w-none">
              {currentEvent.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
          </button>

          {/* Event Dropdown */}
          {isEventMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Select Mega-Event Arena
              </div>
              {MEGA_EVENTS.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setEventId(ev.id);
                    setIsEventMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex flex-col gap-0.5 transition-all ${
                    ev.id === currentEvent.id 
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{ev.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{ev.venueName} • {ev.baseAttendees.toLocaleString()} pax</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Real-Time Telemetry Badges */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Live Clock */}
        <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 leading-none">LOCAL TIME</span>
            <span className="text-xs font-mono font-bold text-white leading-tight mt-0.5">{liveTime}</span>
          </div>
        </div>

        {/* Attendees Count */}
        <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 leading-none">ATTENDEES</span>
            <span className="text-xs font-mono font-bold text-cyan-300 leading-tight mt-0.5">
              {currentEvent.baseAttendees.toLocaleString()}
            </span>
          </div>
        </div>

        {/* City Pressure */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${getPressureColor(simulationImpact.riskClassification)}`}>
          <Activity className="w-3.5 h-3.5" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono opacity-80 leading-none">CITY PRESSURE</span>
            <span className="text-xs font-bold font-display leading-tight mt-0.5">
              {simulationImpact.riskClassification} ({simulationImpact.compositePressureScore}%)
            </span>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 border-cyan-500/20">
          <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 leading-none">AI CONFIDENCE</span>
            <span className="text-xs font-bold text-violet-300 leading-tight mt-0.5">94%</span>
          </div>
        </div>
      </div>

      {/* Right: Stakeholder Role Switcher, Voice Briefing, SFX, Alerts & Copilot */}
      <div className="flex items-center gap-2">
        {/* Stakeholder View Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsRoleMenuOpen(!isRoleMenuOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/30 transition-all text-xs font-medium text-slate-200"
          >
            {getRoleIcon(currentStakeholder)}
            <span className="capitalize font-mono text-xs hidden sm:inline">{currentStakeholder}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 uppercase">
                Switch Stakeholder View
              </div>
              {[
                { id: 'commander', label: 'Event Commander', desc: 'Full city command & dispatch' },
                { id: 'hospitality', label: 'Hospitality Provider', desc: 'Hotel & dining yield control' },
                { id: 'transport', label: 'Transport Operator', desc: 'Transit network & fleet routing' },
                { id: 'visitor', label: 'Visitor Mobile', desc: 'Personal attendee mobile app' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setStakeholder(r.id as StakeholderRole);
                    setIsRoleMenuOpen(false);
                    if (r.id === 'visitor') setActiveTab('visitor_app');
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all ${
                    currentStakeholder === r.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {getRoleIcon(r.id as StakeholderRole)}
                  <div>
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice of NEXUS Spoken Audio Briefing (Nvidia / Web Speech) */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (isVoiceSpeaking) stopVoiceBriefing();
            else triggerVoiceBriefing();
          }}
          title={isVoiceSpeaking ? "Stop Voice Briefing" : "Play Voice Briefing (Voice of NEXUS)"}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
            isVoiceSpeaking 
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan animate-pulse' 
              : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border-white/10 hover:border-cyan-500/30'
          }`}
        >
          {isVoiceSpeaking ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline text-[11px] font-mono">
            {isVoiceSpeaking ? 'Speaking Briefing...' : 'Voice AI'}
          </span>
        </button>

        {/* Audio Synthesizer SFX Mute/Unmute */}
        <button
          onClick={() => {
            toggleAudioMute();
            if (isAudioMuted) soundFx.playClick();
          }}
          title={isAudioMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Intelligent Alerts Bell */}
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('alerts');
          }}
          title="Active City Alerts"
          className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-glow-danger">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* AI Copilot Quick Launch */}
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveCopilotOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Copilot</span>
        </button>
      </div>
    </header>
  );
};
