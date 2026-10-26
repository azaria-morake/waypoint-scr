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
      setExpandedAgent(2); // Auto-expand Agent 3 (WhatsApp Attire)
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
      accent: "cyan",
      borderClass: "border-cyan-500/40",
      bgClass: "bg-cyan-950/20",
      textClass: "text-cyan-400",
      summary: simulationActive
        ? "BOLO Young: Flagged target stagnation (>90s roadside stop) on N12 corridor. Liaising live with Constable Morake and dispatching Recon."
        : "BOLO Young: Standby — continuous telemetry and kinematics audit across Sector 2 corridors.",
      specs: [
        { label: "Tactical Persona", value: "BOLO Young (Be On The Lookout / Tactical Enforcer)" },
        { label: "Kinematics Analysis", value: "Stagnation (>90s) & G-Force Spike Detection" },
        { label: "Liaison Channel", value: "Direct Operator Command Console & Action Chips" },
        { label: "Current Confidence", value: simulationActive ? "96.4%" : "99.9% Nominal" },
      ],
      output: {
        speed: simulationActive ? "78.4 km/h (High Risk)" : "Stationary / Idle",
        heading: simulationActive ? "140° South-East" : "350° North",
        g_force: simulationActive ? "3.8G Spike (Physical Struggle Verified)" : "1.0G (Nominal Gravity)",
        target_choke_point: simulationActive ? "Voortrekker Rd off-ramp southbound bridge" : "None",
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
      accent: "blue",
      borderClass: "border-blue-500/40",
      bgClass: "bg-blue-950/20",
      textClass: "text-blue-400",
      summary: simulationActive
        ? "Searched 5km geofence. Matched Fox-14 (ETA 2.2m) & SAPS-302 (ETA 4.5m) to pinch off westbound on-ramp."
        : "5km statutory geofence active across Sector 2. Ready for tactical dispatch.",
      specs: [
        { label: "Spatial Index", value: "PostGIS ST_DWithin 5000m" },
        { label: "Route Optimizer", value: "OSRM Highway Mesh v4" },
        { label: "Fleet Coverage", value: "4 Sector Patrol Units" },
        { label: "Pinch Point Calculation", value: simulationActive ? "3 Choke Points Locked" : "Idle" },
      ],
      output: {
        units_converging: simulationActive ? "Fox-14 (Armed Response) & SAPS-302 (Flying Squad)" : "0 Units (Patrolling)",
        eta_to_target: simulationActive ? "2.2 Minutes (Pinch Vector Established)" : "N/A",
        intercept_node: simulationActive ? "Node Alpha: N12 / Voortrekker Off-Ramp" : "None",
      },
    },
    {
      id: 2,
      number: "03",
      name: "Warden NOK Recon Agent",
      role: "Automated WhatsApp AI Interrogation & Attire Extractor",
      icon: MessageSquare,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "740ms" : "Armed",
      accent: "amber",
      borderClass: "border-amber-500/40",
      bgClass: "bg-amber-950/20",
      textClass: "text-amber-400",
      summary: simulationActive
        ? "Automated WhatsApp voice bot contacted Sister Zanele. Extracted yellow puffer jacket & running attire."
        : "Emergency Next-of-Kin protocol armed. Zero automated contact until Code Red escalation.",
      specs: [
        { label: "Conversational Core", value: "Gemini 2.5 Flash Multimodal" },
        { label: "Emergency Contact", value: "Zanele Ndlovu (Sister, Primary)" },
        { label: "Delivery Channel", value: "Interactive WhatsApp & Voice API" },
        { label: "Attire Synthesis", value: simulationActive ? "3 Key Visual Features Extracted" : "Pending" },
      ],
      transcript: [
        { sender: "Waypoint Swarm AI", text: "🚨 URGENT: Thandiwe triggered an emergency alert near Alberton. What was she wearing when she left?" },
        { sender: "Zanele (Sister)", text: "Oh god!! She went running in her yellow puffer jacket and black tights!" },
        { sender: "Waypoint Swarm AI", text: "Thank you Zanele. Fox Tactical responders are converging now. Stay by your phone." },
      ],
      extracted_attire: "Yellow high-visibility puffer jacket, black athletic tights, white running shoes",
    },
    {
      id: 3,
      number: "04",
      name: "Dispatcher CAD Agent",
      role: "Automated Voice CAD Callouts & Statutory Authority Handover",
      icon: Navigation,
      status: simulationActive ? "COMPLETED" : "IDLE",
      latency: simulationActive ? "312ms" : "Standby",
      accent: "emerald",
      borderClass: "border-emerald-500/40",
      bgClass: "bg-emerald-950/20",
      textClass: "text-emerald-400",
      summary: simulationActive
        ? "Synthesized BOLO audio dispatched to SAPS 10111 & Fox Tactical CAD. Tactical channel open."
        : "CAD integration webhooks active. Ready for automated voice broadcasting.",
      specs: [
        { label: "Dispatch Channel", value: "SAPS 10111 CAD + Private Armed Radio" },
        { label: "Voice Synthesis", value: "Tactical TTS (112 Words/Min)" },
        { label: "POPIA Sign-Off", value: "Section 11(1)(d) Vital Interests" },
        { label: "Broadcast Status", value: simulationActive ? "Audio Streamed to Responders" : "Quiet" },
      ],
      output: {
        cad_incident_id: simulationActive ? "CAD-ALB-8921" : "None",
        audio_packet_dispatched: simulationActive ? "14.2s Tactical Audio Snippet" : "None",
        authority_handover: simulationActive ? "SAPS Sector Commander Notified" : "Standby",
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto select-none p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-950/50">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                The Way Swarm Multi-Agent Engine
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous 4-tier tactical reasoning mesh supervised by Gemini 2.5 Flash
              </p>
            </div>
          </div>
        </div>

        {/* Quick Simulation Controls for Reviewers / Judges */}
        <div className="flex items-center space-x-3">
          {!simulationActive ? (
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-red-950/50 transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Awakening Swarm...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Simulate Code Red Trigger</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Swarm to Idle</span>
            </button>
          )}

          <div className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center space-x-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${simulationActive ? "bg-red-500 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
            <span className="font-mono text-slate-300 text-[11px] font-bold">
              {simulationActive ? "SWARM ENGAGED" : "BASELINE MONITORING"}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Sub-Agents
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">4</span>
            <span className="text-xs text-emerald-400 font-bold">Autonomous</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sentinel • Interceptor • Warden • CAD</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Mean Reasoning Latency
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-cyan-400 font-mono">312ms</span>
            <span className="text-xs text-slate-400">P95 benchmark</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Parallel async execution</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Supervisory AI Model
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-black text-white">Gemini 2.5 Flash</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Multi-modal &amp; function calling</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            POPIA Statutory Shield
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400">Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Section 11(1)(d) Vital Interests</div>
        </div>
      </div>

      {/* The 4 Agent Dossier Cards */}
      <div className="space-y-4">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isExpanded = expandedAgent === agent.id;
          const isDone = agent.status === "COMPLETED";

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDone
                  ? "bg-slate-900/90 border-slate-700/80 shadow-xl"
                  : "bg-slate-900/50 border-slate-800/80"
              }`}
            >
              {/* Agent Header / Trigger */}
              <div
                onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                      isDone ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        AGENT {agent.number}
                      </span>
                      <h3 className="text-sm font-black text-white">{agent.name}</h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isDone
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">{agent.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-mono text-slate-400">LATENCY</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{agent.latency}</span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Agent Expanded Dossier */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/60 mt-1">
                  {/* Summary Callout */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wide block mb-1">
                      Operational Action:
                    </span>
                    {agent.summary}
                  </div>

                  {/* Specification Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {agent.specs.map((spec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[10px] text-slate-400 font-medium">{spec.label}</div>
                        <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Agent 3 Specific: WhatsApp Live Interrogation Transcript */}
                  {agent.transcript && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Live WhatsApp Multimodal Recon Transcript</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Auto-contact with Sister</span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {agent.transcript.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                              msg.sender.includes("AI")
                                ? "bg-cyan-950/60 text-cyan-200 border border-cyan-800/40 ml-0 mr-auto"
                                : "bg-slate-800 text-slate-100 ml-auto mr-0 text-right"
                            }`}
                          >
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                              {msg.sender}
                            </div>
                            <div>{msg.text}</div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Synthesized Attire for Responders:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {agent.extracted_attire}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Telemetry Output Details */}
                  {agent.output && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide mb-2">
                        Structured Output Payload:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                        {Object.entries(agent.output).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-slate-800/60 pb-1">
                            <span className="text-slate-400">{k}:</span>
                            <span className="font-bold text-slate-200">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
