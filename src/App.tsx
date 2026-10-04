import React, { useState } from 'react';
import { NexusProvider, useNexus } from './context/NexusContext';
import { LandingHero } from './components/landing/LandingHero';
import { TopStatusBar } from './components/layout/TopStatusBar';
import { LeftCommandPanel } from './components/layout/LeftCommandPanel';
import { CommandCenter } from './components/dashboard/CommandCenter';
import { CityDigitalTwin } from './components/digitaltwin/CityDigitalTwin';
import { PressurePredictionPanel } from './components/forecast/PressurePredictionPanel';
import { CrowdIntelligence } from './components/crowd/CrowdIntelligence';
import { HospitalityEngine } from './components/hospitality/HospitalityEngine';
import { TransportIntelligence } from './components/transport/TransportIntelligence';
import { SimulationLab } from './components/simulator/SimulationLab';
import { ResponseOrchestrator } from './components/orchestrator/ResponseOrchestrator';
import { AlertCenter } from './components/alerts/AlertCenter';
import { AnalyticsHub } from './components/analytics/AnalyticsHub';
import { VisitorMobileApp } from './components/stakeholders/VisitorMobileApp';
import { NexusCopilot } from './components/copilot/NexusCopilot';
import { GeoTwinPage } from './components/geotwin/GeoTwinPage';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { soundFx } from './utils/audio';

const NexusAppContent: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const { activeTab, setActiveTab, currentStakeholder, setStakeholder } = useNexus();

  // If visitor role is selected, show visitor app
  if (currentStakeholder === 'visitor' && !showLanding) {
    return (
      <div className="min-h-screen bg-[#05070E] flex flex-col text-slate-100">
        <TopStatusBar />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
            <button
              onClick={() => {
                soundFx.playClick();
                setStakeholder('commander');
                setActiveTab('command');
              }}
              className="flex items-center gap-2 text-xs font-mono text-cyan-300 hover:text-white glass-panel px-3 py-1.5 rounded-xl border border-cyan-500/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Command Center</span>
            </button>
          </div>
          <VisitorMobileApp />
        </div>
        <NexusCopilot />
      </div>
    );
  }

  // If user is on landing hero
  if (showLanding) {
    return (
      <LandingHero
        onEnterCommand={() => {
          setShowLanding(false);
          setActiveTab('command');
        }}
        onExploreTwin={() => {
          setShowLanding(false);
          setActiveTab('twin');
        }}
      />
    );
  }

  // Active view content router
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCenter />;
      case 'geotwin':
        return <GeoTwinPage />;
      case 'twin':
        return (
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Full-Screen 3D City Digital Twin</h2>
                <span className="text-[10px] font-mono text-cyan-400">
                  REAL-TIME SPATIAL RECONSTRUCTION // 60 FPS WEBGL
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Click any building or sector to inspect telemetry
              </span>
            </div>
            <CityDigitalTwin heightClass="h-[calc(100vh-14rem)] min-h-[600px]" showControls={true} />
          </div>
        );
      case 'forecast':
        return <PressurePredictionPanel />;
      case 'crowd':
        return <CrowdIntelligence />;
      case 'hospitality':
        return <HospitalityEngine />;
      case 'transport':
        return <TransportIntelligence />;
      case 'simulator':
        return <SimulationLab />;
      case 'orchestrator':
        return <ResponseOrchestrator />;
      case 'alerts':
        return <AlertCenter />;
      case 'analytics':
        return <AnalyticsHub />;
      case 'visitor_app':
        return <VisitorMobileApp />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070E] flex flex-col text-slate-100 overflow-hidden font-sans">
      {/* Top Status Bar */}
      <TopStatusBar />

      {/* Main Command Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Command Panel Navigation */}
        <LeftCommandPanel />

        {/* Dynamic Center Stage Content Area */}
        <main className={`flex-1 ${activeTab === 'geotwin' ? 'overflow-hidden p-2 flex flex-col h-[calc(100vh-3.5rem)]' : 'overflow-y-auto p-4 md:p-6'} bg-[#05070E]/60 relative cyber-dots`}>
          {/* Top Quick Return to Hero Link */}
          {activeTab !== 'geotwin' && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowLanding(true);
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Cinematic Hero</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold">ALL SYSTEMS NOMINAL</span>
              </div>
            </div>
          )}

          {/* Active View Module */}
          <div className={activeTab === 'geotwin' ? 'w-full h-full flex-1 overflow-hidden' : 'max-w-7xl mx-auto pb-12'}>
            {renderActiveTabContent()}
          </div>
        </main>
      </div>

      {/* Floating AI Event Copilot */}
      <NexusCopilot />
    </div>
  );
};

export default function App() {
  return (
    <NexusProvider>
      <NexusAppContent />
    </NexusProvider>
  );
}
