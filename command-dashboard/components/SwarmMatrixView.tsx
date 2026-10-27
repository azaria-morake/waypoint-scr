"use client";

import React, { useState } from "react";
import {
  Cpu,
  Activity,
  Radio,
  MessageSquare,
  Navigation,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Sparkles,
  Zap,
  Shield,
  Play,
  RotateCcw,
  Check,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface SwarmMatrixViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
  hasActiveCrisis?: boolean;
}

function Panel({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          {icon}
          <span>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const SwarmMatrixView: React.FC<SwarmMatrixViewProps> = ({
  currentOrg,
  isWsConnected,
  hasActiveCrisis = false,
}) => {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(hasActiveCrisis);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationActive(true);
      setExpandedAgent(2);
    }, 1200);
  };

  const handleResetSimulation = () => {
    setSimulationActive(false);
    setExpandedAgent(0);
  };

  const agents = [
    {
      id: 0,
      number: "01",
      name: "BOLO Young (Traffic Control Guardian)",
      role: "Continuous Telemetry Audit, Stagnation Detection & Human Operator Co-Pilot",
      icon: Activity,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "88ms" : "1Hz Baseline",
      summary: simulationActive
        ? "BOLO Young: Flagged target stagnation (>90s roadside stop) on N12 corridor. Liaising live with Constable Morake and dispatching Recon."
        : "BOLO Young: Standby — continuous telemetry and kinematics audit across Sector 2 corridors.",
      specs: [
        { label: "Tactical Persona", value: "BOLO Young (Tactical Enforcer)" },
        { label: "Kinematics Analysis", value: "Stagnation (>90s) & G-Force Spike" },
        { label: "Liaison Channel", value: "Direct Operator Command Console" },
        { label: "Confidence Score", value: simulationActive ? "96.4%" : "99.9% Nominal" },
      ],
      output: {
        speed: simulationActive ? "78.4 km/h (High Risk)" : "Stationary / Idle",
        heading: simulationActive ? "140° South-East" : "350° North",
        g_force: simulationActive ? "3.8G Spike (Struggle Verified)" : "1.0G (Nominal Gravity)",
        choke_point: simulationActive ? "Voortrekker Rd off-ramp southbound bridge" : "None",
      },
    },
    {
      id: 1,
      number: "02",
      name: "Interceptor Radar Agent",
      role: "PostGIS Spatial Radius & Intercept Choke Point Calculator",
      icon: Radio,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "195ms" : "Standby",
      summary: simulationActive
        ? "Searched 5km geofence. Matched Fox-14 (ETA 2.2m) & SAPS-302 (ETA 4.5m) to pinch off westbound on-ramp."
        : "5km statutory geofence active across Sector 2. Ready for tactical dispatch.",
      specs: [
        { label: "Spatial Index", value: "PostGIS ST_DWithin 5000m" },
        { label: "Route Optimizer", value: "OSRM Highway Mesh v4" },
        { label: "Fleet Coverage", value: "4 Sector Patrol Units" },
        { label: "Pinch Point Geometry", value: "Node #4812 (Reading Interchange)" },
      ],
      output: {
        selected_unit_1: "Fox Tactical Unit 14 (ETA 2.2 min)",
        selected_unit_2: "SAPS Flying Squad 302 (ETA 4.5 min)",
        intercept_vector: "-26.3150, 28.1600 (Highway off-ramp)",
        convergence_status: simulationActive ? "VECTORING UNITS" : "RESTING",
      },
    },
    {
      id: 2,
      number: "03",
      name: "NOK Recon Agent (WhatsApp Bridge)",
      role: "Multimodal Next-of-Kin Interrogation & Clothing Attire Extraction",
      icon: MessageSquare,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "412ms" : "Standby",
      summary: simulationActive
        ? "Engaged next-of-kin Zanele Ndlovu. Extracted verified attire: 'Black hoodie with yellow reflective trim & grey denim jeans'."
        : "Encrypted WhatsApp bridge connected to Twilio Sandbox. Armed for victim confirmation.",
      specs: [
        { label: "Next of Kin Contact", value: "Zanele Ndlovu (+27 82 555 0198)" },
        { label: "Extraction Model", value: "Gemini 2.5 Structured JSON Function" },
        { label: "POPIA Justification", value: "Section 11(1)(d) Vital Interests" },
        { label: "Attire Confidence", value: "95% (High Precision)" },
      ],
      transcript: simulationActive
        ? [
            { sender: "WAYPOINT RECON AGENT", text: "Zanele, Waypoint Emergency Command. Is Thandiwe wearing her red tracksuit today?" },
            { sender: "Zanele Ndlovu (Sister)", text: "No, she changed before leaving! She is wearing her black hoodie with yellow reflective trim and grey denim jeans." },
            { sender: "WAYPOINT RECON AGENT", text: "Confirmed: Black hoodie with yellow trim & grey jeans. Transmitted to patrol units." },
          ]
        : null,
      extracted_attire: "Black hoodie with yellow reflective trim, grey denim jeans",
    },
    {
      id: 3,
      number: "04",
      name: "CAD Liaison Agent (SAPS 10111 Bridge)",
      role: "Statutory Law Enforcement Dispatch & Provincial CAD Broadcast",
      icon: Navigation,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "92ms" : "Standby",
      summary: simulationActive
        ? "Generated and transmitted formal statutory Code Red dispatch docket to SAPS Provincial Command Centre."
        : "SAPS 10111 CAD REST & WebHook pipeline standby on authenticated mutual-TLS bridge.",
      specs: [
        { label: "CAD Docket ID", value: simulationActive ? "SAPS-EKU-2026-9041" : "STANDBY" },
        { label: "Statutory Classification", value: "Schedule 1 GBV / Kidnap Alert" },
        { label: "Encryption Cipher", value: "AES-256-GCM + Hardware HSM" },
        { label: "Dispatch Priority", value: "Priority 1 (Immediate Converge)" },
      ],
      output: {
        cad_endpoint: "saps-gauteng-cad.gov.za/api/v1/dispatch",
        payload_hash: simulationActive ? "0x7f4a...e3b9" : "None",
        officer_sign_off: `${currentOrg.officerName} (${currentOrg.officerRank})`,
        broadcast_status: simulationActive ? "TRANSMITTED TO PROVINCIAL CAD" : "STANDBY",
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "4px" }}>
      {/* Top Banner Strip */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Cpu size={18} />
            <span>THE WAY SWARM&nbsp;&nbsp;//&nbsp;&nbsp;MULTI-AGENT ENGINE</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={`status-pill ${simulationActive ? "red" : "green"}`}>
              {simulationActive ? "● SWARM ENGAGED" : "● BASELINE MONITORING"}
            </span>

            {!simulationActive ? (
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="quick danger"
                style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}
              >
                {isSimulating ? "AWAKENING SWARM..." : "SIMULATE CODE RED TRIGGER"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="quick"
                style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}
              >
                <RotateCcw size={14} />
                RESET SWARM TO IDLE
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "14px 20px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              The Way Swarm Multi-Agent Engine
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
              Autonomous 4-tier tactical reasoning mesh supervised by Google Gemini
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", color: "var(--cyan)" }}>
            MUTUAL-TLS SECURE&nbsp;&nbsp;|&nbsp;&nbsp;SECTOR 2 CORRIDOR MESH
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="bottom-grid" style={{ marginTop: 0 }}>
        <Panel title="ACTIVE SUB-AGENTS" icon={<Cpu size={16} />}>
          <div className="metrics" style={{ padding: 0 }}>
            <div className="metric">
              <span className="metric-label">TOTAL UNITS</span>
              <span className="metric-value">4</span>
            </div>
            <div className="metric">
              <span className="metric-label">SWARM STATE</span>
              <span className="metric-value" style={{ color: simulationActive ? "var(--red)" : "var(--green)", fontSize: "15px" }}>
                {simulationActive ? "ENGAGED" : "STANDBY"}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="REASONING LATENCY" icon={<Zap size={16} />}>
          <div className="metrics" style={{ padding: 0 }}>
            <div className="metric">
              <span className="metric-label">MEAN P95</span>
              <span className="metric-value" style={{ color: "var(--cyan)" }}>312ms</span>
            </div>
            <div className="metric">
              <span className="metric-label">PIPELINE</span>
              <span className="metric-value" style={{ fontSize: "13px" }}>Parallel Async</span>
            </div>
          </div>
        </Panel>

        <Panel title="SUPERVISORY AI &amp; POPIA" icon={<Shield size={16} />}>
          <div className="metrics" style={{ padding: 0 }}>
            <div className="metric">
              <span className="metric-label">MODEL</span>
              <span className="metric-value" style={{ fontSize: "14px" }}>Gemini 2.5 Flash</span>
            </div>
            <div className="metric">
              <span className="metric-label">POPIA COMPLIANCE</span>
              <span className="metric-value" style={{ color: "var(--green)", fontSize: "13px" }}>Sec 11(1)(d)</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* 4 Agent Dossier Panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isExpanded = expandedAgent === agent.id;
          const isDone = agent.status === "COMPLETED";

          return (
            <section key={agent.id} className="panel">
              <div
                className="panel-header"
                onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                style={{ cursor: "pointer", background: isExpanded ? "#101415" : "transparent" }}
              >
                <div className="panel-title">
                  <div style={{ width: "28px", height: "28px", border: "1px solid var(--amber)", color: "var(--amber)", display: "grid", placeItems: "center" }}>
                    <IconComponent size={15} />
                  </div>
                  <span style={{ fontSize: "14px" }}>
                    AGENT {agent.number}&nbsp;&nbsp;//&nbsp;&nbsp;{agent.name}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`status-pill ${isDone ? "green" : "neutral"}`}>
                    {agent.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", color: "var(--muted)" }}>
                    {agent.latency}
                  </span>
                  <div style={{ color: "var(--muted)" }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: "16px", background: "#0e1213", borderTop: "1px solid #444844" }}>
                  {/* Summary */}
                  <div style={{ border: "1px solid #555750", padding: "10px 14px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "13px", color: "#eee", lineHeight: 1.5, marginBottom: "14px" }}>
                    <b style={{ color: "var(--amber)" }}>OPERATIONAL ACTION:&nbsp;&nbsp;</b>
                    {agent.summary}
                  </div>

                  {/* Specs Grid */}
                  <div className="metrics" style={{ marginBottom: "14px", padding: 0 }}>
                    {agent.specs.map((spec, i) => (
                      <div key={i} className="metric">
                        <span className="metric-label">{spec.label}</span>
                        <span className="metric-value" style={{ fontSize: "13px", color: "#fff" }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp Transcript if present */}
                  {agent.transcript && (
                    <div style={{ border: "1px solid #078e76", padding: "12px", background: "#06201b", marginBottom: "14px" }}>
                      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", fontWeight: 700, color: "#20cbb0", textTransform: "uppercase", marginBottom: "8px" }}>
                        LIVE WHATSAPP RECON TRANSCRIPT (AUTO-CONTACT WITH SISTER)
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {agent.transcript.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "8px 12px",
                              background: msg.sender.includes("AGENT") ? "#073b30" : "#122622",
                              border: "1px solid #0c5647",
                              fontFamily: "var(--font-ibm-plex-mono), monospace",
                              fontSize: "13px",
                              color: "#fff",
                            }}
                          >
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cyan)", marginBottom: "3px" }}>{msg.sender}</div>
                            <div>{msg.text}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #078e76", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", color: "var(--amber)" }}>
                        SYNTHESIZED ATTIRE:&nbsp;&nbsp;<b style={{ color: "#fff" }}>{agent.extracted_attire}</b>
                      </div>
                    </div>
                  )}

                  {/* Payload Outputs */}
                  {agent.output && (
                    <div style={{ border: "1px solid #3c403d", padding: "10px 14px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px" }}>
                      <div style={{ fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", marginBottom: "6px" }}>
                        STRUCTURED OUTPUT PAYLOAD:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "6px" }}>
                        {Object.entries(agent.output).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #282c2a", paddingBottom: "2px" }}>
                            <span style={{ color: "var(--muted)" }}>{k}:</span>
                            <b style={{ color: "#eee" }}>{String(v)}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
