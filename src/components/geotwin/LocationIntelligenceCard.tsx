import React from 'react';
import { 
  X, 
  MapPin, 
  Hotel, 
  Train, 
  Car, 
  Users, 
  AlertTriangle, 
  Navigation, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { GeoLocationEntity } from '../../types/geoTwin';
import { soundFx } from '../../utils/audio';

interface LocationIntelligenceCardProps {
  entity: GeoLocationEntity | null;
  onClose: () => void;
  onDispatchAction?: (actionText: string) => void;
  className?: string;
}

export const LocationIntelligenceCard: React.FC<LocationIntelligenceCardProps> = ({
  entity,
  onClose,
  onDispatchAction,
  className = ''
}) => {
  if (!entity) return null;

  const getEntityBadge = () => {
    switch (entity.entity_type) {
      case 'venue':
        return { label: 'EVENT VENUE', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' };
      case 'hotel':
        return { label: 'HOSPITALITY', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'metro':
      case 'rail':
      case 'bus_hub':
      case 'airport':
        return { label: 'TRANSIT INFRASTRUCTURE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'URBAN POI', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    }
  };

  const badge = getEntityBadge();

  return (
    <div className={`glass-panel border border-white/20 rounded-2xl p-4 backdrop-blur-2xl bg-[#050814]/95 shadow-2xl flex flex-col gap-3 max-w-sm w-full animate-fadeIn ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${badge.color}`}>
              {badge.label}
            </span>
            {entity.risk_level && (
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                entity.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                entity.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {entity.risk_level} RISK
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold font-display text-white">{entity.name}</h3>
          <p className="text-[10px] font-mono text-slate-400 truncate">{entity.address}</p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Satellite Thumbnail (Real context preview) */}
      {entity.metadata?.satellite_preview ? (
        <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10 group">
          <img 
            src={entity.metadata.satellite_preview} 
            alt={entity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[9px] font-mono text-cyan-300 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30">
            <Layers className="w-3 h-3" />
            <span>ORBITAL RECONNAISSANCE</span>
          </div>
          <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-300 bg-black/60 px-1.5 py-0.5 rounded">
            [{entity.coordinates[1].toFixed(4)}°N, {entity.coordinates[0].toFixed(4)}°E]
          </div>
        </div>
      ) : (
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>GEO COORDINATES</span>
          </span>
          <span className="text-white font-bold">
            [{entity.coordinates[1].toFixed(4)}°N, {entity.coordinates[0].toFixed(4)}°E]
          </span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {entity.capacity && (
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[9px] font-mono text-slate-400">MAX CAPACITY</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5">
              {entity.capacity.toLocaleString()} PAX
            </span>
          </div>
        )}

        {entity.occupancy_percent !== undefined && (
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[9px] font-mono text-slate-400">HOTEL OCCUPANCY</span>
            <span className="text-sm font-bold font-mono text-amber-300 mt-0.5">
              {entity.occupancy_percent}%
            </span>
          </div>
        )}

        {entity.capacity_per_hour !== undefined && (
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[9px] font-mono text-slate-400">THROUGHPUT RATE</span>
            <span className="text-sm font-bold font-mono text-emerald-300 mt-0.5">
              {entity.capacity_per_hour.toLocaleString()} /HR
            </span>
          </div>
        )}

        {entity.current_pressure !== undefined && (
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[9px] font-mono text-slate-400">PRESSURE LOAD</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-sm font-bold font-mono ${
                entity.current_pressure >= 80 ? 'text-red-400' : 'text-cyan-300'
              }`}>
                {entity.current_pressure}%
              </span>
              {entity.predicted_pressure && (
                <span className="text-[9px] font-mono text-amber-400">
                  (&rarr; {entity.predicted_pressure}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Attributes */}
      {entity.metadata && (
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {entity.metadata.gates && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
              {entity.metadata.gates} Egress Portals
            </span>
          )}
          {entity.metadata.active_turnstiles && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
              {entity.metadata.active_turnstiles} Active Turnstiles
            </span>
          )}
          {entity.metadata.available_rooms !== undefined && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-amber-500/20">
              {entity.metadata.available_rooms} Rooms Vacant
            </span>
          )}
          {entity.metadata.active_electric_shuttles && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-emerald-300 border border-emerald-500/20">
              {entity.metadata.active_electric_shuttles} Shuttles Staged
            </span>
          )}
        </div>
      )}

      {/* Actionable Tactical Intervention */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
        <button
          onClick={() => {
            soundFx.playSuccess();
            if (onDispatchAction) {
              onDispatchAction(`Orchestrate tactical response at ${entity.name}`);
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold shadow-glow-cyan transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ORCHESTRATE INTERVENTION</span>
        </button>
      </div>
    </div>
  );
};
