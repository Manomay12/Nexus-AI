import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  MapPin, 
  ChevronDown, 
  RotateCcw, 
  Search, 
  Plus, 
  Check, 
  X, 
  Sparkles,
  Building,
  Navigation,
  Compass,
  Radio
} from 'lucide-react';
import { GeoDestination } from '../../types/geoTwin';
import { MUMBAI_KNOWN_SEARCH_LANDMARKS } from '../../data/mumbaiGeographicData';
import { soundFx } from '../../utils/audio';

interface GeoDestinationSelectorProps {
  destinations: GeoDestination[];
  activeDestination: GeoDestination;
  onSelectDestination: (destination: GeoDestination) => void;
  onResetFocus: () => void;
  onAddCustomDestination?: (destination: GeoDestination) => void;
  compact?: boolean;
  className?: string;
}

export const GeoDestinationSelector: React.FC<GeoDestinationSelectorProps> = ({
  destinations,
  activeDestination,
  onSelectDestination,
  onResetFocus,
  onAddCustomDestination,
  compact = false,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalSearch, setModalSearch] = useState<string>('');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const tabletTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);

  const updateDropdownPos = () => {
    const trigger = triggerBtnRef.current || tabletTriggerRef.current || mobileTriggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right)
      });
    }
  };

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    if (!isDropdownOpen) {
      updateDropdownPos();
    }
    setIsDropdownOpen(prev => !prev);
  };

  // Close dropdown on outside click or sync on resize/scroll
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isTriggerClick = 
        (triggerBtnRef.current && triggerBtnRef.current.contains(target)) ||
        (tabletTriggerRef.current && tabletTriggerRef.current.contains(target)) ||
        (mobileTriggerRef.current && mobileTriggerRef.current.contains(target));

      if (
        dropdownPortalRef.current && 
        !dropdownPortalRef.current.contains(target) &&
        !isTriggerClick
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updateDropdownPos();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isDropdownOpen]);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableLandmarksToAdd = MUMBAI_KNOWN_SEARCH_LANDMARKS.filter(lm => 
    !destinations.some(d => d.id === lm.id) &&
    (lm.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
     lm.description.toLowerCase().includes(modalSearch.toLowerCase()))
  );

  const handleSelect = (dest: GeoDestination, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    soundFx.playClick();
    onSelectDestination(dest);
    setIsDropdownOpen(false);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    onResetFocus();
  };

  const handleAddLandmark = (lm: GeoDestination, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSuccess();
    if (onAddCustomDestination) {
      onAddCustomDestination(lm);
    }
    onSelectDestination(lm);
    setIsCustomModalOpen(false);
    setIsDropdownOpen(false);
  };

  const handleAddTypedCustom = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSuccess();
    const customDest: GeoDestination = {
      id: `custom-${Date.now()}`,
      name: query.trim(),
      shortName: query.trim().length > 16 ? query.trim().slice(0, 14) + '...' : query.trim(),
      latitude: 19.0550 + (Math.random() - 0.5) * 0.04,
      longitude: 72.8550 + (Math.random() - 0.5) * 0.04,
      zoom: 15.2,
      pitch: 50,
      bearing: 0,
      category: 'custom',
      description: `Targeted sector: ${query.trim()}`,
      pressure: 74,
      bottleneck: 'Primary arterial transit junction'
    };
    onAddCustomDestination?.(customDest);
    onSelectDestination(customDest);
    setIsCustomModalOpen(false);
    setIsDropdownOpen(false);
  };

  // Ensure top 3 destinations (JWCC BKC, Wankhede Stadium, CSIA Airport) are visible on desktop
  const primaryDesktopDestinations = destinations.slice(0, 3);
  const additionalDesktopDestinations = destinations.slice(3, 4);

  return (
    <div 
      className={`relative flex items-center gap-1.5 pointer-events-auto select-none ${className}`}
      style={{ zIndex: 60 }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ==================================================================== */}
      {/* 1. DESKTOP VIEW (hidden on < md, visible on md+): Direct Chips */}
      {/* ==================================================================== */}
      <div className="hidden md:flex items-center gap-1.5 flex-wrap">
        {/* Top 3 Core Destination Chips: Always visible on desktop */}
        {primaryDesktopDestinations.map((dest) => {
          const isActive = activeDestination.id === dest.id;

          return (
            <button
              key={dest.id}
              type="button"
              onClick={(e) => handleSelect(dest, e)}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Focus map on ${dest.name}${isActive ? ' - Currently Active' : ''}`}
              aria-pressed={isActive}
              className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md group cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 via-blue-600/20 to-violet-500/25 text-white border border-cyan-400 shadow-glow-cyan scale-[1.02]'
                  : 'bg-black/75 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 hover:border-white/30'
              }`}
            >
              {/* Glowing active dot */}
              <span 
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-cyan-400 shadow-glow-cyan animate-pulse' 
                    : 'bg-slate-500 group-hover:bg-cyan-400/60'
                }`} 
              />
              <span className="tracking-tight whitespace-nowrap">{dest.shortName}</span>
              {isActive && (
                <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}

        {/* 4th Destination Chip: Visible on xl+ screens or when not compact */}
        {!compact && additionalDesktopDestinations.map((dest) => {
          const isActive = activeDestination.id === dest.id;

          return (
            <button
              key={dest.id}
              type="button"
              onClick={(e) => handleSelect(dest, e)}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Focus map on ${dest.name}${isActive ? ' - Currently Active' : ''}`}
              aria-pressed={isActive}
              className={`hidden lg:flex glass-panel px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 items-center gap-1.5 shadow-md group cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 via-blue-600/20 to-violet-500/25 text-white border border-cyan-400 shadow-glow-cyan scale-[1.02]'
                  : 'bg-black/75 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 hover:border-white/30'
              }`}
            >
              <span 
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-cyan-400 shadow-glow-cyan animate-pulse' 
                    : 'bg-slate-500 group-hover:bg-cyan-400/60'
                }`} 
              />
              <span className="tracking-tight whitespace-nowrap">{dest.shortName}</span>
              {isActive && (
                <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}

        {/* Locations Dropdown Trigger Button */}
        <button
          ref={triggerBtnRef}
          type="button"
          onClick={handleToggleDropdown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Toggle all destination locations dropdown"
          aria-expanded={isDropdownOpen}
          className={`glass-panel px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1 shadow-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
            isDropdownOpen
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
              : 'bg-black/75 hover:bg-white/10 text-slate-400 hover:text-white border border-white/15'
          }`}
          title="Browse all locations & search"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Locations</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180 text-cyan-300' : ''}`} />
        </button>

        {/* Reset Focus Button */}
        <button
          type="button"
          onClick={handleReset}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Reset map focus to default JWCC BKC sector"
          className="glass-panel p-2 rounded-xl text-xs font-mono bg-black/75 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/15 hover:border-cyan-500/30 transition-all flex items-center justify-center shadow-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400 group"
          title="Reset Focus to Default JWCC BKC Sector"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 2. TABLET VIEW (hidden on < sm, hidden on md+, visible on sm-md) */}
      {/* ==================================================================== */}
      <div className="hidden sm:flex md:hidden items-center gap-1.5">
        <button
          ref={tabletTriggerRef}
          type="button"
          onClick={handleToggleDropdown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Open destination selector"
          className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shadow-md cursor-pointer border ${
            isDropdownOpen 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' 
              : 'bg-black/85 text-slate-200 border-white/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan" />
          <span className="text-[10px] text-slate-400">CURRENT FOCUS:</span>
          <span className="font-bold text-white max-w-[130px] truncate">{activeDestination.shortName}</span>
          <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Reset map focus"
          className="glass-panel p-2 rounded-xl text-xs font-mono bg-black/85 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/20 transition-all flex items-center justify-center cursor-pointer"
          title="Reset Focus"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. MOBILE VIEW (visible on < sm only): 44px Minimum Touch Targets */}
      {/* ==================================================================== */}
      <div className="flex sm:hidden items-center gap-1.5">
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={handleToggleDropdown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Current location and destination switcher"
          className="glass-panel px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono flex items-center gap-2 shadow-md cursor-pointer border border-cyan-500/40 bg-black/90 text-slate-100"
        >
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-white text-[11px] max-w-[110px] truncate">
            {activeDestination.shortName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Reset map focus"
          className="glass-panel min-h-[44px] min-w-[44px] rounded-xl text-xs font-mono bg-black/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/20 flex items-center justify-center cursor-pointer"
          title="Reset Focus"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 4. GLASSMORPHIC DESTINATION DROPDOWN (Rendered via createPortal to Body) */}
      {/* ==================================================================== */}
      {isDropdownOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownPortalRef}
          className="fixed glass-panel border border-cyan-500/40 bg-[#060a18]/98 backdrop-blur-2xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5 text-slate-100 animate-fadeIn"
          style={{ 
            top: window.innerWidth < 640 ? 'auto' : (dropdownPos?.top ?? 60), 
            bottom: window.innerWidth < 640 ? 0 : 'auto',
            left: window.innerWidth < 640 ? 0 : 'auto',
            right: window.innerWidth < 640 ? 0 : (dropdownPos?.right ?? 16),
            width: window.innerWidth < 640 ? '100%' : '20rem',
            maxHeight: window.innerWidth < 640 ? '80vh' : 'auto',
            borderRadius: window.innerWidth < 640 ? '24px 24px 0 0' : '16px',
            zIndex: 100 
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Select Destination
              </span>
            </div>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close destination dropdown"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination..."
              className="w-full bg-black/60 border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              autoFocus
            />
          </div>

          {/* Destinations List */}
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredDestinations.map((dest) => {
              const isActive = activeDestination.id === dest.id;

              return (
                <button
                  key={dest.id}
                  onClick={(e) => handleSelect(dest, e)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer border min-h-[44px] ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-white/[0.02] border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span 
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isActive ? 'bg-cyan-400 shadow-glow-cyan animate-pulse' : 'bg-slate-500'
                      }`} 
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{dest.name}</span>
                        {isActive && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-extrabold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                        {dest.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-300">
                      {dest.pressure}%
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 block">
                      LOAD
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredDestinations.length === 0 && (
              <div className="text-center py-4 text-xs font-mono text-slate-400">
                No matching destination
              </div>
            )}
          </div>

          {/* Add Custom Location Trigger */}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setIsCustomModalOpen(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Location</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* 5. ADD CUSTOM LOCATION MODAL (Rendered via createPortal to Body, z-120) */}
      {/* ==================================================================== */}
      {isCustomModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          style={{ zIndex: 120 }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="glass-panel border border-cyan-500/40 bg-[#060919]/98 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    Add Map Destination
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Search landmarks or target new geospatial coordinates
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Landmark */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search destination (e.g. Jio World, MMRDA, Gateway)..."
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                autoFocus
              />
            </div>

            {/* Available Landmarks to add */}
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Available Grounded Landmarks:
              </span>

              {availableLandmarksToAdd.map((lm) => (
                <div
                  key={lm.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {lm.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      {lm.description} • [{lm.latitude}°N, {lm.longitude}°E]
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddLandmark(lm, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer hover:scale-105 shadow-glow-cyan"
                  >
                    <span>Focus Here</span>
                  </button>
                </div>
              ))}

              {/* Typed custom fallback */}
              {modalSearch.trim().length > 2 && !availableLandmarksToAdd.some(lm => lm.name.toLowerCase() === modalSearch.trim().toLowerCase()) && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-cyan-200 truncate">
                      "{modalSearch.trim()}"
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400/80">
                      Geocode as custom operational sector
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAddTypedCustom(modalSearch, e)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-mono font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer hover:bg-cyan-400 shadow-glow-cyan"
                  >
                    <span>+ Focus Here</span>
                  </button>
                </div>
              )}

              {availableLandmarksToAdd.length === 0 && modalSearch.trim().length <= 2 && (
                <div className="p-4 text-center text-xs font-mono text-slate-400">
                  All preset landmarks have been added. Type a location name to target custom sector.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
