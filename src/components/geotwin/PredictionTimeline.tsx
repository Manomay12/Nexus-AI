import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  FastForward
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface PredictionTimelineProps {
  timeOffset: number; // in minutes (-30 to +60)
  onChangeTimeOffset: (minutes: number) => void;
  compact?: boolean;
  className?: string;
}

export const PredictionTimeline: React.FC<PredictionTimelineProps> = ({
  timeOffset,
  onChangeTimeOffset,
  compact = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  const steps = [
    { offset: -30, label: '-30m', tag: 'HISTORICAL', color: 'text-slate-400' },
    { offset: 0, label: 'NOW', tag: 'CURRENT SENSORS', color: 'text-cyan-400' },
    { offset: 15, label: '+15m', tag: 'SIMULATED', color: 'text-violet-400' },
    { offset: 30, label: '+30m', tag: 'PREDICTED', color: 'text-amber-400' },
    { offset: 60, label: '+60m', tag: 'OUTLOOK', color: 'text-red-400' }
  ];

  // Auto playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (timeOffset >= 60) {
        setIsPlaying(false);
      } else {
        onChangeTimeOffset(Math.min(60, timeOffset + 5 * playSpeed));
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, timeOffset, onChangeTimeOffset]);

  // Determine current mode tag
  const getCurrentTag = () => {
    if (timeOffset < 0) return { label: 'HISTORICAL OBSERVATION', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    if (timeOffset === 0) return { label: 'LIVE SENSOR TELEMETRY', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    if (timeOffset <= 30) return { label: 'SIMULATED DISPERSION', bg: 'bg-violet-500/20 text-violet-300 border-violet-500/30' };
    return { label: 'AI PREDICTED PRESSURE HOTSPOT', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const tagInfo = getCurrentTag();

  return (
    <div className={`glass-panel border border-white/10 rounded-2xl ${compact ? 'p-2 px-3 gap-1.5' : 'p-3.5 gap-2.5'} backdrop-blur-xl bg-[#070b16]/90 shadow-2xl flex flex-col ${className}`}>
      {/* Top Bar: Playback Controls & Status Tag */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} rounded-xl font-mono font-semibold border transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'SIMULATE FORWARD'}</span>
          </button>

          {/* Reset to NOW */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPlaying(false);
              onChangeTimeOffset(0);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="Reset to live current time"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed selector */}
          <button
            onClick={() => {
              soundFx.playClick();
              setPlaySpeed(prev => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
            }}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            <span>{playSpeed}x</span>
          </button>
        </div>

        {/* Current State Tag */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1.5 ${tagInfo.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            {tagInfo.label}
          </span>
          <span className="text-xs font-mono font-bold text-white px-2 py-1 rounded bg-white/5 border border-white/10">
            T {timeOffset >= 0 ? `+${timeOffset}m` : `${timeOffset}m`}
          </span>
        </div>
      </div>

      {/* Scrubbing Bar & Discrete Markers */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={-30}
            max={60}
            step={5}
            value={timeOffset}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChangeTimeOffset(val);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Discrete Milestones */}
        <div className="flex items-center justify-between px-1">
          {steps.map((step) => {
            const isSelected = Math.abs(timeOffset - step.offset) < 5;
            return (
              <button
                key={step.offset}
                onClick={() => {
                  soundFx.playClick();
                  onChangeTimeOffset(step.offset);
                }}
                className={`flex flex-col items-center transition-all ${
                  isSelected ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 ring-2 ring-cyan-400/30' : 'bg-slate-600'}`} />
                <span className={`text-[11px] font-mono font-bold mt-1 ${isSelected ? step.color : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">
                  {step.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
