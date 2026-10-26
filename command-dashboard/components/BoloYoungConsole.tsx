"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  ExternalLink,
  MessageSquare,
  Send,
  Sparkles,
  ShieldAlert,
  Car,
  Compass,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  UserCheck,
  ShieldCheck,
  Layers,
  ArrowRight,
  Trash2,
  Terminal,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";
import { WhatsAppReconModal } from "./WhatsAppReconModal";

export interface ActionChip {
  action_id: string;
  label: string;
  rationale: string;
  primary?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "OPERATOR" | "BOLO_YOUNG";
  senderName: string;
  text: string;
  timestamp: string;
  threatLevel?: string;
  suggestedActions?: ActionChip[];
}

export interface ObservationEntry {
  id: string;
  timestamp: string;
  tag: string;
  text: string;
}

interface BoloYoungConsoleProps {
  currentOrg: OrganizationOption;
  hasActiveEmergency?: boolean;
  extractedAttire?: string | null;
  onAttireExtracted?: (attire: string) => void;
  isPopout?: boolean;
  onNavigateToMap?: () => void;
}

const STORAGE_KEY = "waypoint_bolo_chat_history";

export const BoloYoungConsole: React.FC<BoloYoungConsoleProps> = ({
  currentOrg,
  hasActiveEmergency = false,
  extractedAttire,
  onAttireExtracted,
  isPopout = false,
  onNavigateToMap,
}) => {
  // Persistent Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: ChatMessage[] = JSON.parse(saved);
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [hasActiveJourney, setHasActiveJourney] = useState<boolean>(false);
  const [journeyStatus, setJourneyStatus] = useState<string>("IDLE");
  const [auditData, setAuditData] = useState<any>(null);
  const [threatLevel, setThreatLevel] = useState<string>("NOMINAL");
  const [observationLogs, setObservationLogs] = useState<ObservationEntry[]>([
    {
      id: "obs-init-1",
      timestamp: "Just now",
      tag: "STANDBY",
      text: "Sector 2 corridor radar sweep: 0 active citizen beacons detected. CARTO mesh nominal.",
    },
    {
      id: "obs-init-2",
      timestamp: "Just now",
      tag: "WATCHDOG",
      text: "Autonomous watchdog active. Awaiting journey start signals from citizen mobile clients.",
    },
  ]);

  const [operatorPrompt, setOperatorPrompt] = useState<string>("");
  const [isLiaising, setIsLiaising] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [currentAttire, setCurrentAttire] = useState<string | null>(extractedAttire || null);
  const [unitsConverged, setUnitsConverged] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Persist chatHistory to localStorage on each change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
        window.dispatchEvent(new Event("waypoint_chat_updated"));
      } catch (e) {}
    }
  }, [chatHistory]);

  // Synchronize chat history across tabs/popout windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setChatHistory(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    const handleLocalUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setChatHistory(JSON.parse(saved));
      } catch (err) {}
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("waypoint_chat_updated", handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("waypoint_chat_updated", handleLocalUpdate);
    };
  }, []);

  // Sync attire
  useEffect(() => {
    if (extractedAttire) {
      setCurrentAttire(extractedAttire);
    }
  }, [extractedAttire]);

  // Fetch real-time audit & observation logs
  const fetchAudit = async () => {
    try {
      const res = await fetch(
        `${apiUrl}/api/v1/traffic-control/audit?operator_name=${encodeURIComponent(currentOrg.officerName)}`
      );
      if (res.ok) {
        const data = await res.json();
        setHasActiveJourney(data.has_active_journey || false);
        setJourneyStatus(data.journey_status || "IDLE");
        setAuditData(data.audit);
        setThreatLevel(data.threat_level || "NOMINAL");

        if (data.observation_log && data.observation_log.length > 0) {
          setObservationLogs(data.observation_log);
        }

        // If active journey is running, sync BOLO Young conversational messages
        if (data.has_active_journey) {
          const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const destName = data.audit?.location_audit?.destination?.name || "Sandton City Mall, Sandton";

          setChatHistory((prev) => {
            let updated = [...prev];

            // 1. Initial Journey Start Message (Message 1) MUST ALWAYS be present
            const hasStart = updated.some((m) => m.id === "msg-journey-start");
            if (!hasStart) {
              const startMsg: ChatMessage = {
                id: "msg-journey-start",
                sender: "BOLO_YOUNG",
                senderName: "BOLO Young (Traffic Control)",
                text: `Constable Morake, Thandiwe Ndlovu has activated a journey to ${destName}. Status is currently safe (GREEN). I am monitoring corridor telemetry and dead-man's switch countdown. I will alert you immediately if any anomaly or route deviation occurs.`,
                timestamp: nowTime,
                threatLevel: "NOMINAL",
              };
              updated = [startMsg, ...updated];
            }

            // 2. Emergency Red Alert Message (Message 2) MUST be appended upon RED alert
            if (data.journey_status === "RED") {
              const hasRed = updated.some((m) => m.id === "msg-red-alert" || m.threatLevel === "CRITICAL");
              if (!hasRed) {
                const redMsg: ChatMessage = {
                  id: "msg-red-alert",
                  sender: "BOLO_YOUNG",
                  senderName: "BOLO Young (Traffic Control)",
                  text:
                    data.liaison?.briefing ||
                    "🚨 RED ALERT: Constable Morake, emergency distress signal confirmed on Thandiwe Ndlovu. Telemetry stationary at zero velocity near the N12 off-ramp corridor. Stagnation threshold breached (>90s). Immediate intervention required.",
                  timestamp: nowTime,
                  threatLevel: "CRITICAL",
                  suggestedActions:
                    data.liaison?.action_chips && data.liaison.action_chips.length > 0
                      ? data.liaison.action_chips
                      : [
                          {
                            action_id: "DEPLOY_NOK_RECON",
                            label: "🚀 Deploy WhatsApp Recon Agent (Next-of-Kin)",
                            rationale: "Contact sister Zanele Ndlovu to extract attire description.",
                            primary: true,
                          },
                          {
                            action_id: "INTERCEPT_CONVERGE",
                            label: "🚓 Converge Units (Fox-14 & SAPS-302)",
                            rationale: "Direct Fox-14 and SAPS-302 to coordinate intercept.",
                            primary: false,
                          },
                          {
                            action_id: "BROADCAST_CAD",
                            label: "📡 Broadcast BOLO to SAPS 10111 CAD",
                            rationale: "Issue statutory inter-agency alert across Gauteng provincial command.",
                            primary: false,
                          },
                        ],
                };
                updated = [...updated, redMsg];
              }
            }

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        } else {
          // When no active journey is running (standby / reset), clear past chat
          setChatHistory((prev) => {
            if (prev.length > 0) {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch (e) {}
              return [];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.warn("Audit fetch error:", e);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 4000);
    return () => clearInterval(interval);
  }, [currentOrg]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLiaising]);

  // Clear Chat History
  const handleClearChat = () => {
    if (confirm("Reset conversation thread with BOLO Young?")) {
      setChatHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event("waypoint_chat_updated"));
      } catch (e) {}
    }
  };

  // Handle Contextual Suggested Action Click (From a specific message)
  const handleActionClick = (action: ActionChip) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (action.action_id === "DEPLOY_NOK_RECON") {
      setIsWhatsAppOpen(true);
      setChatHistory((prev) => [
        ...prev,
        {
          id: "msg-op-" + Date.now(),
          sender: "OPERATOR",
          senderName: `${currentOrg.officerName} (${currentOrg.officerRank})`,
          text: `Operator Directive: Authorized Deploy Next-of-Kin WhatsApp Recon (${action.label})`,
          timestamp: nowTime,
        },
        {
          id: "msg-by-" + (Date.now() + 1),
          sender: "BOLO_YOUNG",
          senderName: "BOLO Young (Traffic Control)",
          text: "Understood, Constable. WhatsApp Recon Bridge initialized with Sister Zanele Ndlovu (+27 82 555 0198). Monitoring inbound intel for attire extraction.",
          timestamp: nowTime,
          threatLevel: "CRITICAL",
        },
      ]);
    } else if (action.action_id === "INTERCEPT_CONVERGE") {
      handleConvergeUnits();
    } else {
      handleSendPrompt(action.label);
    }
  };

  // Converge fleet units
  const handleConvergeUnits = () => {
    setUnitsConverged(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatHistory((prev) => [
      ...prev,
      {
        id: "msg-op-" + Date.now(),
        sender: "OPERATOR",
        senderName: `${currentOrg.officerName} (${currentOrg.officerRank})`,
        text: "Operator Directive: Converge all available sector armed response units on pinch point immediately.",
        timestamp: nowTime,
      },
      {
        id: "msg-by-" + (Date.now() + 1),
        sender: "BOLO_YOUNG",
        senderName: "BOLO Young (Traffic Control)",
        text: "Confirmed, Constable. Converge directive transmitted: Fox-14 (ETA 2.1m) and SAPS Flying Squad 302 (ETA 4.3m) have locked intercept vectors on the N12 off-ramp.",
        timestamp: nowTime,
        threatLevel: "CRITICAL",
      },
    ]);
  };

  // Send interactive question or directive to BOLO Young
  const handleSendPrompt = async (queryText?: string) => {
    const q = queryText || operatorPrompt;
    if (!q.trim() || isLiaising) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: "msg-op-" + Date.now(),
      sender: "OPERATOR",
      senderName: `${currentOrg.officerName} (${currentOrg.officerRank})`,
      text: q,
      timestamp: nowTime,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setOperatorPrompt("");
    setIsLiaising(true);

    try {
      const res = await fetch(`${apiUrl}/api/v1/traffic-control/liaise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_query: q,
          operator_name: currentOrg.officerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setThreatLevel(data.threat_level || "NOMINAL");

        setChatHistory((prev) => [
          ...prev,
          {
            id: "msg-by-" + Date.now(),
            sender: "BOLO_YOUNG",
            senderName: "BOLO Young (Traffic Control)",
            text: data.briefing,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            threatLevel: data.threat_level,
            suggestedActions: data.action_chips && data.action_chips.length > 0 ? data.action_chips : undefined,
          },
        ]);
      }
    } catch (e) {
      console.warn("Liaison error:", e);
    } finally {
      setIsLiaising(false);
    }
  };

  // Open Popout Window
  const handleOpenPopout = () => {
    window.open(
      "/bolo-young",
      "BoloYoungC4iConsole",
      "width=1280,height=820,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
    );
  };

  const isStagnant = auditData?.location_audit?.is_stagnant || false;
  const loc = auditData?.location_audit;
  const target = auditData?.target;
  const nok = auditData?.next_of_kin;

  return (
    <div className={`flex flex-col h-full w-full bg-slate-950 text-slate-100 ${isPopout ? "min-h-screen" : ""}`}>
      {/* Top C4i Header Bar */}
      <header className="p-4 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-amber-950/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-black text-white uppercase tracking-wider">
                BOLO Young
              </h1>
              <span className="text-xs text-amber-400 font-mono font-semibold">
                • Traffic Control AI Guardian
              </span>
              <span
                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                  threatLevel === "CRITICAL"
                    ? "bg-red-950 text-red-300 border-red-500 animate-pulse"
                    : threatLevel === "HIGH"
                    ? "bg-amber-950 text-amber-300 border-amber-500"
                    : "bg-emerald-950 text-emerald-300 border-emerald-500"
                }`}
              >
                {hasActiveJourney ? (threatLevel === "CRITICAL" ? "CRITICAL RED" : "SAFE TRANSIT") : "STANDBY"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Liaising with {currentOrg.officerName} ({currentOrg.officerRank}) • Sector 2 Corridor Watchdog
            </p>
          </div>
        </div>

        {/* Top Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* WhatsApp Recon Quick Trigger (Only active when journey is active) */}
          <button
            type="button"
            onClick={() => setIsWhatsAppOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Recon</span>
          </button>

          {/* Reset/Clear Chat History */}
          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset conversation thread"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Popout in New Window Button (Only if not already popout) */}
          {!isPopout && (
            <button
              type="button"
              onClick={handleOpenPopout}
              title="Open BOLO Young in dedicated secondary monitor window"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open in New Window</span>
            </button>
          )}

          {/* Return to Map button (if provided) */}
          {onNavigateToMap && (
            <button
              type="button"
              onClick={onNavigateToMap}
              className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Tactical Map</span>
            </button>
          )}
        </div>
      </header>

      {/* Main 2-Column Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* LEFT / CENTER: Clean Interactive Natural Dialogue Stream */}
        <div className="flex-1 flex flex-col bg-slate-950 p-5 overflow-hidden">
          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl mb-3">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  BOLO Young Tactical Liaison
                </h3>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                  {hasActiveJourney
                    ? "Citizen journey is active. You are connected to BOLO Young. Speak naturally or give directives to the traffic controller."
                    : "BOLO Young is on watch. Sector 2 corridor is clear with zero active emergency journeys. Type below to query BOLO Young on sector readiness, or he will notify you as soon as a citizen journey is triggered."}
                </p>
                <div className="mt-4 flex items-center space-x-2 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Dual-Monitor Ready • Conversational State Persisted</span>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isAgent = msg.sender === "BOLO_YOUNG";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? "items-start" : "items-end"} animate-in fade-in duration-200`}
                  >
                    <div className="flex items-center space-x-2 mb-1 px-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                        isAgent
                          ? "bg-slate-900 border border-indigo-500/30 text-slate-200 shadow-indigo-950/20"
                          : "bg-indigo-600 text-white shadow-indigo-900/40"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                      {/* CONTEXTUAL ACTION BUTTONS: Shown only when proposed in this specific message */}
                      {isAgent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center space-x-2 flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleActionClick(action)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow active:scale-95 cursor-pointer ${
                                action.primary
                                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-950/40"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                              }`}
                            >
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLiaising && (
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-mono animate-pulse p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>BOLO Young is synthesizing response with Google Gemini...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Interactive Command Line Input */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
            <input
              type="text"
              value={operatorPrompt}
              onChange={(e) => setOperatorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
              placeholder="Speak with BOLO Young (e.g., 'What is sector status?', 'Which patrol is closest?', 'Vector units to highway')..."
              className="flex-1 bg-slate-900 text-xs text-white px-4 py-3 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none placeholder-slate-500 shadow-inner"
            />
            <button
              type="button"
              onClick={() => handleSendPrompt()}
              disabled={!operatorPrompt.trim() || isLiaising}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold transition active:scale-95 disabled:opacity-40 cursor-pointer flex items-center space-x-1.5 shadow"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE PANEL: Live Polls / LLM Observation Trail + Telemetry & Biometrics */}
        <aside className="w-full lg:w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col p-5 overflow-y-auto space-y-4 flex-shrink-0 shadow-2xl">
          {/* SECTION 1: LIVE POLLS (LLM Thought & Autonomous Observation Trail) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Live Polls &amp; LLM Trail</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                AUTONOMOUS
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 text-[11px] font-mono">
              {observationLogs.map((obs) => (
                <div
                  key={obs.id}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/90 leading-tight space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        obs.tag === "RED_ALERT"
                          ? "bg-red-950 text-red-300 border border-red-500/40"
                          : obs.tag === "BEACON_LOCKED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-cyan-300"
                      }`}
                    >
                      {obs.tag}
                    </span>
                    <span className="text-[9px] text-slate-500">{obs.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-snug">{obs.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>BOLO Autonomous Radar Loop</span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* SECTION 2: Live Telemetry & Kinematics */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                <Activity className="w-4 h-4" />
                <span>Telemetry Radar</span>
              </div>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  !hasActiveJourney
                    ? "bg-slate-800 text-slate-400"
                    : isStagnant
                    ? "bg-red-950 text-red-300 border border-red-500/40 animate-pulse"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {!hasActiveJourney ? "STANDBY" : isStagnant ? "⚠️ STAGNANT (>90s)" : "✓ IN TRANSIT"}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Velocity:</span>
                <span className="text-white font-bold">
                  {hasActiveJourney ? `${loc?.current_speed_kmh ?? 0} km/h` : "0 km/h (No Beacons)"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coordinates:</span>
                <span className="text-cyan-300">
                  {hasActiveJourney && loc?.current_coordinates
                    ? `${loc.current_coordinates[0].toFixed(4)}°, ${loc.current_coordinates[1].toFixed(4)}°`
                    : "Sector 2 Grid Active"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Route Corridor:</span>
                <span className="text-white truncate max-w-[170px]" title={loc?.origin?.name}>
                  {hasActiveJourney ? loc?.origin?.name || "Corridor In Transit" : "Clear (Standby)"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Signal Stream:</span>
                <span className="text-emerald-400">1Hz Full-Duplex WSS</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Target Citizen Profile */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800 text-xs text-white font-bold">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Target Citizen Profile</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Status:</span>
                <span className="text-white font-bold">
                  {hasActiveJourney ? target?.citizen_name || "Thandiwe Ndlovu" : "No Active Journey"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline BOLO:</span>
                <span className="text-slate-300 font-mono">
                  {hasActiveJourney ? "28 yrs • 168cm • Athletic" : "Awaiting journey beacon"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next of Kin:</span>
                <span className="text-emerald-400 font-medium">
                  {nok?.name || "Zanele Ndlovu"} ({nok?.relationship || "Sister"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NOK Phone:</span>
                <span className="text-slate-300 font-mono">{nok?.phone || "+27 82 555 0198"}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Attire Verification Intel */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Attire Verification</span>
              </div>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  currentAttire
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {currentAttire ? "✓ CONFIRMED" : hasActiveJourney ? "GAP DETECTED" : "STANDBY"}
              </span>
            </div>

            <div className="mt-3 text-xs leading-relaxed">
              {currentAttire ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <div className="font-bold text-[10px] text-emerald-400 uppercase tracking-wide">
                    Live Verified Description (NOK Recon):
                  </div>
                  <div className="mt-1 font-semibold text-white">"{currentAttire}"</div>
                  <div className="mt-1 text-[10px] text-emerald-400/80">
                    Confidence: 95% • Pushed to CAD and sector vehicles
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">
                    {hasActiveJourney ? "⚠️ Attire Description Needed" : "Standby Mode"}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {hasActiveJourney
                      ? "Pre-departure photo registered, but today's clothing description is unconfirmed."
                      : "Ready to cross-reference BOLO attire profile upon journey activation."}
                  </p>
                  {hasActiveJourney && (
                    <button
                      type="button"
                      onClick={() => setIsWhatsAppOpen(true)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Open WhatsApp Recon
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Responding Patrol Fleet */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Sector Reaction Fleet</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {unitsConverged ? "CONVERGING" : "CRUISING"}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Fox Tactical 14</div>
                  <div className="text-[10px] text-slate-400">Armed Sector Reaction</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-xs">ETA 2.1m</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">SAPS Flying Squad 302</div>
                  <div className="text-[10px] text-slate-400">Gauteng Provincial Highway Patrol</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-xs">ETA 4.3m</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* WhatsApp Recon Modal */}
      <WhatsAppReconModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onAttireExtracted={(attire) => {
          setCurrentAttire(attire);
          if (onAttireExtracted) onAttireExtracted(attire);
        }}
      />
    </div>
  );
};
