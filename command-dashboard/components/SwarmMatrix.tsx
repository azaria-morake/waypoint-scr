"use client";

import React, { useState } from "react";
import { Cpu, Activity, Radio, MessageSquare, Navigation, CheckCircle2, ChevronDown, ChevronUp, Clock, AlertTriangle } from "lucide-react";

interface SwarmMatrixProps {
  isRedAlert: boolean;
  currentTier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV";
  swarmLogs?: Array<{
    agent_name: string;
    action_taken: string;
    latency_ms: number;
    structured_output: any;
    transcript?: string;
  }>;
}

export const SwarmMatrix: React.FC<SwarmMatrixProps> = ({
  isRedAlert,
  currentTier,
  swarmLogs,
}) => {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(2); // NOK Agent expanded by default

  const isTier1 = currentTier === "TIER_1_STARTER";

  // Pre-configured real-time benchmark multi-agent data
  const agents = [
    {
      id: 0,
      name: "Agent 1: Telemetry & Kinematics",
      role: "Kinematics Classification & Off-Ramp Intercept Predictor",
      icon: Activity,
      status: isRedAlert ? "COMPLETED" : "IDLE",
      latency: isRedAlert ? "112ms" : "—",
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-950/20",
      pillColor: "bg-cyan-950 text-cyan-300 border-cyan-500/40",
      summary: isRedAlert
        ? "Classified high-speed movement (78 km/h). G-Force spike (3.8G). Target: N12 / Voortrekker off-ramp."
        : "Monitoring telemetry stream at 1Hz over secure WebSocket...",
      details: {
        speed: "78.0 km/h (In-Vehicle High Risk)",
        heading: "140° South-East",
        g_force: "3.8G Anomaly (Physical Struggle Confirmed)",
        predicted_off_ramp: "N12 Voortrekker Road Off-ramp (Lat -26.2620, Lng 28.1210)",
        confidence: "94.2%",
      },
    },
    {
      id: 1,
      name: "Agent 2: Proximity Broadcast & Radar",
      role: "5km PostGIS Spatial Radius Responder Matcher",
      icon: Radio,
      status: isRedAlert ? "COMPLETED" : "IDLE",
      latency: isRedAlert ? "240ms" : "—",
      color: "var(--cyan)",
      pillColor: "status-pill blue",
      summary: isRedAlert
        ? "5km spatial geofence searched. 2 armed response units alerted in Alberton sector."
        : "Jurisdiction geofence active across 5km Alberton North zone...",
      details: {
        search_radius: "5.0 km Haversine / PostGIS",
        units_found: 2,
        units: [
          "Fox Security Unit 14 (Tactical Armed) - 3.2 km",
          "Fox Security Unit 08 (Armed Response) - 4.1 km",
        ],
        broadcast_channels: "CAD Webhook + Tactical WebSocket Stream",
      },
    },
    {
      id: 2,
      name: "Agent 3: NOK Recon & Interrogation",
      role: "Automated WhatsApp & AI Voice Attire Extractor",
      icon: MessageSquare,
      status: isRedAlert ? "COMPLETED" : "IDLE",
      latency: isRedAlert ? "850ms" : "—",
      color: "border-amber-500/40 text-amber-400 bg-amber-950/20",
      pillColor: "bg-amber-950 text-amber-300 border-amber-500/40",
      summary: isRedAlert
        ? "WhatsApp agent contacted sister Zanele Ndlovu. Extracted yellow puffer jacket & running attire."
        : "Next-of-Kin bot armed for automated vital-interest interrogation...",
      details: {
        contact: "Zanele Ndlovu (Sister, Priority 1)",
        channel: "WhatsApp Interactive AI Voice & Text Bot",
        extracted_attire: "Yellow high-visibility puffer jacket, black athletic tights, white running shoes",
        transcript: [
          { sender: "Waypoint Swarm AI", text: "🚨 URGENT: Thandiwe triggered an emergency alert near Alberton. What was she wearing when she left?" },
          { sender: "Zanele (Sister)", text: "Oh god!! She went running in her yellow puffer jacket and black tights!" },
          { sender: "Waypoint Swarm AI", text: "Thank you Zanele. Fox Tactical responders are converging now. Stay by your phone." },
        ],
      },
    },
    {
      id: 3,
      name: "Agent 4: Dispatch & CAD Routing",
      role: "Fastest Intercept Routing & Automated Voice CAD Dispatch",
      icon: Navigation,
      status: isRedAlert ? "COMPLETED" : "IDLE",
      latency: isRedAlert ? "310ms" : "—",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
      pillColor: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
      summary: isRedAlert
        ? "Fastest intercept calculated. Dispatched CAD telemetry payload to Fox Tactical Unit 14."
        : "Automated Computer-Aided Dispatch (CAD) engine standby...",
      details: {
        assigned_unit: "Fox Tactical Unit 14 (Commander: Sgt. Mokoena)",
        distance: "3.2 km",
        eta: "4 minutes",
        dispatch_method: "Push Notification + Live Trajectory HUD Sync",
        intercept_checkpoint: "Voortrekker Rd off-ramp southbound bridge",
      },
    },
  ];

  return (
    <section className="panel" style={{ width: "100%" }}>
      {/* Header */}
      <div className="panel-header" style={{ padding: "10px 16px" }}>
        <div className="panel-title">
          <Cpu size={16} color="var(--cyan)" />
          <span style={{ fontSize: "11px" }}>
            THE WAY SWARM&nbsp;&nbsp;//&nbsp;&nbsp;PARALLEL MULTI-AGENT MATRIX
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className={`status-pill ${isRedAlert ? "orange" : "neutral"}`}>
            {isRedAlert ? "4 AGENTS ACTIVE" : "STANDBY"}
          </span>
          <span className="status-pill green">ALL AGENTS UNLOCKED</span>
        </div>
      </div>

      {/* 4 Parallel Agent Cards Grid */}
      <div style={{ padding: "16px", background: "var(--panel-2)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isExpanded = expandedAgent === agent.id;

          return (
            <div
              key={agent.id}
              style={{
                border: "1px solid #444844",
                borderLeft: `3px solid ${isExpanded ? "var(--amber)" : "#555750"}`,
                padding: "14px",
                background: "#101415",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon size={15} color="var(--amber)" />
                  <h4 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>
                    {agent.name}
                  </h4>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className={`status-pill ${agent.status.includes("ACTIVE") || agent.status.includes("COMPLETED") ? "green" : "neutral"}`} style={{ fontSize: "7px" }}>
                    {agent.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)" }}>
                    {agent.latency}
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                {agent.summary}
              </p>

              {/* Expand/Collapse details button */}
              {isRedAlert && !agent.status.includes("RESTRICTED") && (
                <div style={{ borderTop: "1px solid #282c2a", paddingTop: "8px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="quick"
                    style={{ width: "100%", padding: "6px", fontSize: "9px" }}
                  >
                    <span>{isExpanded ? "HIDE EXECUTION PAYLOAD" : "VIEW AGENT OUTPUT & TRANSCRIPT"}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: "8px", padding: "10px", background: "#0c1012", border: "1px solid #3c403d", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
                      {Object.entries(agent.details).map(([key, val]) => {
                        if (key === "transcript" && Array.isArray(val)) {
                          return (
                            <div key={key} style={{ marginTop: "6px" }}>
                              <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: "9px", display: "block", marginBottom: "4px" }}>
                                [LIVE WHATSAPP RECON TRANSCRIPT]:
                              </span>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#06201b", border: "1px solid #078e76", padding: "8px" }}>
                                {val.map((msg, idx) => (
                                  <div key={idx} style={{ fontSize: "9px", color: "#eee" }}>
                                    <b style={{ color: "var(--cyan)" }}>{msg.sender}:&nbsp;</b>
                                    <span>{msg.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (Array.isArray(val)) {
                          return (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", padding: "2px 0" }}>
                              <span style={{ color: "var(--muted)" }}>{key}:</span>
                              <span style={{ color: "#fff" }}>{val.join(", ")}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", padding: "2px 0" }}>
                            <span style={{ color: "var(--muted)" }}>{key}:</span>
                            <span style={{ color: "#fff" }}>{String(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
