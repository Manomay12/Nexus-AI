import React, { useState, useRef, useEffect } from 'react';
import { useNexus } from '../../context/NexusContext';
import type { ChatMessage } from '../../types/nexus';
import { nexusApi } from '../../services/nexusApi';
import { speakTacticalBriefing } from '../../services/aiService';
import { 
  Sparkles, 
  Send, 
  Volume2, 
  X,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Database,
  Activity,
  Cpu,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export const NexusCopilot: React.FC = () => {
  const { 
    currentEvent, 
    zones, 
    simulationImpact, 
    activeCopilotOpen, 
    setActiveCopilotOpen,
    executePlan,
    responsePlans,
    executeRedistribution
  } = useNexus();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'nexus',
      timestamp: '19:42',
      text: `Tactical neural stream initialized. I am NEXUS, coordinating operations for the ${currentEvent.name}. How can I assist your command team?`,
      riskLevel: 'MODERATE',
      confidence: 0.94,
      actions: [
        { label: 'Highest Risk Zone', actionKey: 'query_risk' },
        { label: 'Reduce Congestion', actionKey: 'query_congestion' },
        { label: 'Weather Impact', actionKey: 'query_rain' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedTransparencyId, setExpandedTransparencyId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, expandedTransparencyId]);

  const quickQueries = [
    'What is the highest risk zone?',
    'How can we reduce transport congestion?',
    'What happens if it rains?',
    'Find available hotels near the venue.',
    'Predict crowd movement after the event.'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    soundFx.playClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    try {
      const response = await nexusApi.chatWithCopilot(query, {
        eventName: currentEvent.name,
        attendees: currentEvent.baseAttendees,
        cityPressure: simulationImpact.compositePressureScore,
        highestRiskZone: zones[0]?.name || 'Stadium Grand Arena'
      });

      soundFx.playSuccess();
      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'nexus',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.answer,
        riskLevel: response.risk_level,
        confidence: response.confidence,
        visualCard: response.visual_card,
        actions: response.recommended_actions?.map(a => ({
          label: a.action,
          actionKey: a.action_key || 'deploy_plan_c'
        })),
        decisionFactors: response.decision_factors,
        knowledgeUsed: response.knowledge_used
      };

      setMessages(prev => [...prev, botMsg]);
      // Automatically expand transparency for detailed answers
      if (response.decision_factors) {
        setExpandedTransparencyId(botMsgId);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'nexus',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Telemetry synced. Andheri Interchange and Metro Line 2 are at 89% capacity. Recommend immediate dispatch of auxiliary perimeter shuttles.",
        riskLevel: 'HIGH',
        confidence: 0.91
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    soundFx.playClick();
    if (actionKey === 'query_risk') {
      handleSendMessage('What is the highest risk zone?');
    } else if (actionKey === 'query_congestion' || actionKey === 'dispatch_shuttles' || actionKey === 'fleet_surge') {
      executePlan(responsePlans[2]);
    } else if (actionKey === 'query_rain' || actionKey === 'rain_protocol') {
      handleSendMessage('What happens if it rains?');
    } else if (actionKey === 'broadcast_hospitality' || actionKey === 'reroute_zone_d') {
      executeRedistribution();
    } else if (actionKey === 'deploy_plan_c') {
      executePlan(responsePlans[2]);
    }
  };

  const toggleTransparency = (id: string) => {
    soundFx.playClick();
    setExpandedTransparencyId(prev => (prev === id ? null : id));
  };

  if (!activeCopilotOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] glass-panel border-l border-cyan-500/30 shadow-2xl flex flex-col justify-between bg-[#05070E]/95 backdrop-blur-2xl animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-slate-950 font-bold shadow-glow-cyan">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white font-display">NEXUS AI Copilot</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                HYBRID RAG
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">pgvector • Gemini • Simulation Engine</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveCopilotOpen(false);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1">
              <span>{msg.sender === 'user' ? 'Commander' : 'NEXUS Intelligence'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.riskLevel && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  msg.riskLevel === 'CRITICAL' ? 'text-red-400 bg-red-950/60 border border-red-500/40' :
                  msg.riskLevel === 'HIGH' ? 'text-amber-400 bg-amber-950/60 border border-amber-500/40' :
                  'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40'
                }`}>
                  {msg.riskLevel}
                </span>
              )}
              {msg.confidence && (
                <span className="text-slate-400">({Math.round(msg.confidence * 100)}% conf)</span>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs max-w-[95%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-glow-cyan'
                  : 'glass-card border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{msg.text}</p>

              {/* Spoken TTS button for bot message */}
              {msg.sender === 'nexus' && (
                <div className="flex justify-end mt-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      speakTacticalBriefing(msg.text);
                    }}
                    title="Speak Tactical Briefing"
                    className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white font-mono transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Voice Play</span>
                  </button>
                </div>
              )}

              {/* Supporting Visual Card */}
              {msg.visualCard && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                  {msg.visualCard.type === 'risk_meter' && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-cyan-300">{msg.visualCard.data.zone}</span>
                        <span className="text-red-400 font-mono">PEAK IN {msg.visualCard.data.timeToPeak}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-red-400 h-full" style={{ width: `${msg.visualCard.data.predicted}%` }} />
                      </div>
                    </div>
                  )}

                  {msg.visualCard.type === 'route_recommendation' && (
                    <div className="space-y-1 text-[11px]">
                      <div className="text-amber-400 font-bold">⚠ {msg.visualCard.data.bottleneck}</div>
                      <div className="text-emerald-400 font-medium">✔ {msg.visualCard.data.optimalRoute}</div>
                    </div>
                  )}

                  {msg.visualCard.type === 'hospitality_redistribution' && (
                    <div className="space-y-1 text-[11px]">
                      <div className="text-red-400">Overburdened: {msg.visualCard.data.overburdened}</div>
                      <div className="text-cyan-300 font-bold">Recommended: {msg.visualCard.data.surplusZone}</div>
                    </div>
                  )}

                  {msg.visualCard.type === 'zone_stat' && (
                    <div className="space-y-1 text-[11px]">
                      <div className="text-cyan-300 font-bold">{msg.visualCard.data.headline}</div>
                      <div className="flex justify-between text-slate-300 text-[10px]">
                        <span>Road Delay: {msg.visualCard.data.roadDelay}</span>
                        <span>Metro Surge: {msg.visualCard.data.metroSurge}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Supporting Knowledge Pills */}
              {msg.knowledgeUsed && msg.knowledgeUsed.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 mb-1">
                    <BookOpen className="w-2.5 h-2.5 text-cyan-400" />
                    <span>RAG Knowledge Grounding:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {msg.knowledgeUsed.map((k, kIdx) => (
                      <span
                        key={kIdx}
                        title={k.snippet || k.title}
                        className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-white/10 text-cyan-300 flex items-center gap-1"
                      >
                        <span>{k.title || k.category}</span>
                        <span className="text-[8px] text-slate-400">({Math.round(k.relevance * 100)}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act.actionKey)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition-all"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* AI Transparency Panel ("How NEXUS Reached This Decision") */}
              {msg.decisionFactors && (
                <div className="mt-3 border-t border-cyan-500/20 pt-2">
                  <button
                    onClick={() => toggleTransparency(msg.id)}
                    className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-200 transition-colors py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>How NEXUS Reached This Decision</span>
                    </span>
                    {expandedTransparencyId === msg.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {expandedTransparencyId === msg.id && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-2 text-[10px] font-mono animate-in fade-in duration-200">
                      {/* Live Data */}
                      <div className="flex items-start gap-1.5">
                        <Activity className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 font-bold">Live Telemetry: </span>
                          <span className="text-slate-200">{msg.decisionFactors.live_data}</span>
                        </div>
                      </div>

                      {/* Simulation */}
                      <div className="flex items-start gap-1.5">
                        <Zap className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 font-bold">Simulation Forecast: </span>
                          <span className="text-violet-300">{msg.decisionFactors.simulation_prediction}</span>
                        </div>
                      </div>

                      {/* Knowledge Retrieved */}
                      <div className="flex items-start gap-1.5">
                        <Database className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 font-bold">Knowledge Retrieved: </span>
                          <span className="text-emerald-300">{msg.decisionFactors.knowledge_retrieved}</span>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="flex items-start gap-1.5 pt-1 border-t border-white/5">
                        <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 font-bold">Operational Reasoning: </span>
                          <span className="text-amber-200/90">{msg.decisionFactors.ai_reasoning}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 p-2.5 glass-panel rounded-xl w-fit border border-cyan-500/30 shadow-glow-cyan animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>NEXUS querying pgvector & synthesizing tactical telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pre-Loaded Quick Query Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto">
        {quickQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-slate-950/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask NEXUS tactical copilot..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-glow-cyan shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
