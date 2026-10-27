"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Radio,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Target,
  Terminal,
  Trash2,
  UserCheck,
  Zap,
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
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
        window.dispatchEvent(new Event("waypoint_chat_updated"));
      } catch (e) {}
    }
  }, [chatHistory]);

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

  useEffect(() => {
    if (extractedAttire) {
      setCurrentAttire(extractedAttire);
    }
  }, [extractedAttire]);

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

        if (data.has_active_journey) {
          const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const destName = data.audit?.location_audit?.destination?.name || "Sandton City Mall, Sandton";

          setChatHistory((prev) => {
            let updated = [...prev];

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
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAudit();
    const timer = setInterval(fetchAudit, 2500);
    return () => clearInterval(timer);
  }, [currentOrg]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleChatScroll = () => {
    if (chatScrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      isNearBottomRef.current = distanceFromBottom < 80;
    }
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [chatHistory, isLiaising]);

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = textToSend || operatorPrompt;
    if (!prompt.trim()) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "OPERATOR",
      senderName: `${currentOrg.officerName} (${currentOrg.officerRank})`,
      text: prompt,
      timestamp: nowTime,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setOperatorPrompt("");
    setIsLiaising(true);
    isNearBottomRef.current = true;
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const res = await fetch(`${apiUrl}/api/v1/traffic-control/liaise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_name: currentOrg.officerName,
          operator_query: prompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.briefing || data.reply || "Directive received. Sector parameters updated.";
        const chips: ActionChip[] = (data.action_chips || data.suggested_actions || []).map((c: any) => ({
          action_id: c.action_id || c.id || "ACTION",
          label: c.label || c.title,
          rationale: c.rationale || c.description || "",
          primary: !!c.primary,
        }));
        const agentMsg: ChatMessage = {
          id: "bolo-" + Date.now(),
          sender: "BOLO_YOUNG",
          senderName: "BOLO Young (Traffic Control)",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          threatLevel: data.threat_level || "NOMINAL",
          suggestedActions: chips.length > 0 ? chips : undefined,
        };
        setChatHistory((prev) => [...prev, agentMsg]);
      } else {
        throw new Error(`API returned ${res.status}`);
      }
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: "bolo-err-" + Date.now(),
        sender: "BOLO_YOUNG",
        senderName: "BOLO Young (Traffic Control)",
        text: `Affirmative, ${currentOrg.officerName}. Monitoring Sector 2 corridor grid. All patrol units active and ready for tactical dispatch.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatHistory((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLiaising(false);
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
  };

  const handleActionClick = async (action: ActionChip) => {
    if (action.action_id === "DEPLOY_NOK_RECON") {
      setIsWhatsAppOpen(true);
      return;
    }
    if (action.action_id === "INTERCEPT_CONVERGE") {
      setUnitsConverged(true);
      handleSendPrompt("Units converging on target coordinates. Intercept perimeter established.");
      return;
    }
    if (action.action_id === "BROADCAST_CAD") {
      handleSendPrompt("BOLO broadcast transmitted to SAPS 10111 Provincial CAD network.");
      return;
    }
    handleSendPrompt(`Execute directive: ${action.label}`);
  };

  const handleClearChat = () => {
    setChatHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("waypoint_chat_updated"));
    } catch (e) {}
  };

  const isStagnant = auditData?.kinematics_audit?.is_stagnant || false;
  const loc = auditData?.location_audit;
  const target = auditData?.target;
  const nok = auditData?.next_of_kin;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: "var(--panel)",
        color: "var(--paper)",
        minHeight: isPopout ? "100vh" : "0",
      }}
    >
      {/* Top C4i Header Bar */}
      <section className="panel" style={{ borderLeft: 0, borderRight: 0, borderTop: 0 }}>
        <div className="panel-header" style={{ padding: "8px 20px", height: "auto", minHeight: "58px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "1.5px solid var(--amber)",
                background: "#18140e",
                color: "var(--amber)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
                  BOLO YOUNG
                </span>
                <span className={`status-pill ${threatLevel === "CRITICAL" ? "red" : hasActiveJourney ? "green" : "neutral"}`}>
                  {threatLevel === "CRITICAL" ? "CRITICAL RED" : hasActiveJourney ? "SAFE TRANSIT" : "STANDBY"}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", marginTop: "2px" }}>
                Traffic Control AI Guardian&nbsp;&nbsp;|&nbsp;&nbsp;Liaison: {currentOrg.officerName} ({currentOrg.officerRank})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsWhatsAppOpen(true)}
              className="quick"
              style={{ borderColor: "#078e76", color: "#20cbb0", padding: "6px 12px", fontSize: "9px" }}
            >
              <MessageSquare size={13} />
              WHATSAPP RECON
            </button>

            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation thread"
                className="quick"
                style={{ padding: "6px 10px", fontSize: "9px" }}
              >
                <Trash2 size={13} />
              </button>
            )}

            {!isPopout && (
              <button
                type="button"
                onClick={() => window.open("/bolo-young", "BoloYoungConsole", "width=1280,height=820")}
                className="quick"
                style={{ padding: "6px 12px", fontSize: "9px" }}
              >
                <ExternalLink size={13} />
                NEW WINDOW
              </button>
            )}

            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="quick"
                style={{ borderColor: "var(--amber)", color: "var(--amber)", padding: "6px 12px", fontSize: "9px" }}
              >
                <MapPin size={13} />
                LIVE MAP
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* LEFT / CENTER: Interactive Natural Dialogue Stream */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0e1213", padding: "16px", minWidth: 0, overflow: "hidden" }}>
          {/* Conversation Feed */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleChatScroll}
            style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingRight: "6px" }}
          >
            {chatHistory.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", padding: "40px 20px", maxWidth: "480px" }}>
                <div style={{ width: "48px", height: "48px", border: "1.5px solid var(--amber)", margin: "0 auto 14px", display: "grid", placeItems: "center", color: "var(--amber)", background: "#18140e" }}>
                  <Activity size={24} />
                </div>
                <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>
                  BOLO YOUNG TACTICAL LIAISON
                </div>
                <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", marginTop: "8px", lineHeight: 1.6 }}>
                  {hasActiveJourney
                    ? "Citizen journey beacon active. Connected to BOLO Young. Speak naturally or give directives to the traffic controller."
                    : "BOLO Young is standing by on Sector 2 corridor grid. Continuous kinematic audit active. He will alert you immediately once a citizen triggers transit."}
                </p>
                <div style={{ marginTop: "16px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--cyan)" }}>
                  ● DUAL-MONITOR READY&nbsp;&nbsp;|&nbsp;&nbsp;CONVERSATION PERSISTED
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isAgent = msg.sender === "BOLO_YOUNG";

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAgent ? "flex-start" : "flex-end",
                      width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", padding: "0 4px" }}>
                      <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", fontWeight: 700, color: isAgent ? "var(--amber)" : "var(--cyan)" }}>
                        {msg.senderName}
                      </span>
                      <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)" }}>
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "14px 16px",
                        background: isAgent ? "var(--panel-2)" : "#181d20",
                        border: isAgent ? "1.5px solid #75776f" : "1.5px solid #555750",
                        borderLeft: isAgent ? "5px solid var(--amber)" : "1.5px solid #555750",
                        borderRight: !isAgent ? "5px solid var(--cyan)" : undefined,
                        color: "#eee",
                        fontFamily: "var(--font-ibm-plex-mono), monospace",
                        fontSize: "11px",
                        lineHeight: 1.65,
                      }}
                    >
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>

                      {isAgent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #444844", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {msg.suggestedActions.map((action, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleActionClick(action)}
                              className={`quick ${action.primary ? "danger" : ""}`}
                              style={{ padding: "5px 10px", fontSize: "9px" }}
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--amber)" }}>
                <RefreshCw size={12} className="animate-spin" />
                <span>BOLO Young synthesizing tactical response with Gemini...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Command Line Input */}
          <div style={{ paddingTop: "12px", borderTop: "1.5px solid #444844", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={operatorPrompt}
              onChange={(e) => setOperatorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
              placeholder="Transmit tactical directive to BOLO Young (e.g. 'Converge units to N12', 'Confirm suspect attire')..."
              style={{
                flex: 1,
                background: "#101415",
                border: "1.5px solid #75776f",
                padding: "10px 14px",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "11px",
                color: "#fff",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => handleSendPrompt()}
              disabled={!operatorPrompt.trim() || isLiaising}
              className="quick"
              style={{ padding: "10px 18px", borderColor: "var(--amber)", color: "var(--amber)" }}
            >
              <span>TRANSMIT</span>
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE PANEL: Telemetry, Target Profile & Attire */}
        <aside
          style={{
            width: "360px",
            borderLeft: "2px solid #555750",
            background: "#0b0e0f",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "14px",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {/* Section 1: LLM Trail & Observation Feed */}
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Terminal size={14} />
                <span>OBSERVATION TRAIL</span>
              </div>
              <span className="status-pill green">AUTONOMOUS</span>
            </div>

            <div style={{ maxHeight: "170px", overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {observationLogs.map((obs) => (
                <div key={obs.id} style={{ border: "1px solid #3c403d", padding: "6px 8px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={`status-pill ${obs.tag === "RED_ALERT" ? "red" : obs.tag === "BEACON_LOCKED" ? "green" : "neutral"}`} style={{ padding: "1px 5px", fontSize: "7px" }}>
                      {obs.tag}
                    </span>
                    <span style={{ fontSize: "7px", color: "var(--muted)" }}>{obs.timestamp}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "8px", color: "#ccc", lineHeight: 1.4 }}>{obs.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Telemetry Radar */}
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Activity size={14} />
                <span>TELEMETRY RADAR</span>
              </div>
              <span className={`status-pill ${!hasActiveJourney ? "neutral" : isStagnant ? "red" : "green"}`}>
                {!hasActiveJourney ? "STANDBY" : isStagnant ? "STAGNANT" : "TRANSIT"}
              </span>
            </div>

            <div className="metrics" style={{ padding: "6px" }}>
              <div className="metric">
                <span className="metric-label">VELOCITY</span>
                <span className="metric-value" style={{ fontSize: "12px" }}>
                  {hasActiveJourney ? `${loc?.current_speed_kmh ?? 0} km/h` : "0 km/h"}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">STREAM STATUS</span>
                <span className="metric-value" style={{ fontSize: "12px", color: "var(--green)" }}>1Hz WSS Locked</span>
              </div>
              <div className="metric">
                <span className="metric-label">COORDINATES</span>
                <span className="metric-value" style={{ fontSize: "9px", color: "var(--cyan)" }}>
                  {hasActiveJourney && loc?.current_coordinates
                    ? `${loc.current_coordinates[0].toFixed(4)}°, ${loc.current_coordinates[1].toFixed(4)}°`
                    : "-26.315°, 28.160°"}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">CORRIDOR</span>
                <span className="metric-value" style={{ fontSize: "9px", color: "#ddd" }}>
                  {hasActiveJourney ? loc?.origin?.name || "N12 East Corridor" : "Sector 2 Clear"}
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Target Profile */}
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <UserCheck size={14} />
                <span>TARGET CITIZEN PROFILE</span>
              </div>
            </div>

            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>TARGET:</span>
                <b style={{ color: "#fff" }}>{hasActiveJourney ? target?.citizen_name || "Thandiwe Ndlovu" : "No Active Journey"}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>BIO PROFILE:</span>
                <span style={{ color: "#ccc" }}>28 yrs • 168cm • Athletic</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>NEXT OF KIN:</span>
                <b style={{ color: "var(--green)" }}>{nok?.name || "Zanele Ndlovu"} ({nok?.relationship || "Sister"})</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>NOK PHONE:</span>
                <span style={{ color: "var(--amber)" }}>{nok?.phone || "+27 82 555 0198"}</span>
              </div>
            </div>
          </section>

          {/* Section 4: Attire Verification Intel */}
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <ShieldCheck size={14} />
                <span>ATTIRE RECON INTEL</span>
              </div>
              <span className={`status-pill ${currentAttire ? "green" : "orange"}`}>
                {currentAttire ? "CONFIRMED" : "UNCONFIRMED"}
              </span>
            </div>

            <div style={{ padding: "12px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
              {currentAttire ? (
                <div style={{ border: "1px solid #078e76", padding: "10px", background: "#06201b" }}>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "#20cbb0", textTransform: "uppercase" }}>
                    VERIFIED ATTIRE (NOK RECON):
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                    &ldquo;{currentAttire}&rdquo;
                  </div>
                  <div style={{ fontSize: "8px", color: "var(--muted)", marginTop: "4px" }}>
                    Confidence: 95% • Pushed to CAD vectors
                  </div>
                </div>
              ) : (
                <div style={{ border: "1px solid #555750", padding: "10px", background: "#101415" }}>
                  <div style={{ fontSize: "8px", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase" }}>
                    ATTIRE UNCONFIRMED
                  </div>
                  <p style={{ margin: "4px 0 8px", fontSize: "9px", color: "var(--muted)", lineHeight: 1.4 }}>
                    Deploy WhatsApp Recon to verify victim clothing description.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppOpen(true)}
                    className="quick"
                    style={{ width: "100%", borderColor: "#078e76", color: "#20cbb0" }}
                  >
                    OPEN WHATSAPP RECON
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Patrol Fleet */}
          <section className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <Car size={14} />
                <span>SECTOR FLEET DISPATCH</span>
              </div>
              <span className="status-pill blue">{unitsConverged ? "CONVERGING" : "CRUISING"}</span>
            </div>

            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>Fox Tactical 14</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)" }}>Armed Intercept Unit</div>
                </div>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "11px", fontWeight: 700, color: "var(--cyan)" }}>ETA 2.1m</span>
              </div>

              <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>SAPS Flying Squad 302</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)" }}>Highway Patrol Intercept</div>
                </div>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "11px", fontWeight: 700, color: "var(--cyan)" }}>ETA 4.3m</span>
              </div>
            </div>
          </section>
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
