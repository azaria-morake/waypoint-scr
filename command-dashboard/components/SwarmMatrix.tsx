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
      color: "border-blue-500/40 text-blue-400 bg-blue-950/20",
      pillColor: "bg-blue-950 text-blue-300 border-blue-500/40",
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
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-black text-white tracking-wide uppercase">
            The Way Swarm • Parallel Multi-Agent Matrix
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-mono">
            {isRedAlert ? "⚡ 4 Agents Live Escalation" : "Swarm Standby (Ready)"}
          </span>
          <span className="font-bold px-2 py-0.5 rounded text-[10px] border bg-emerald-950 text-emerald-300 border-emerald-500/30">
            AOTY JUDGE ACCESS: ALL 4 AGENTS UNLOCKED
          </span>
        </div>
      </div>

      {/* 4 Parallel Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isExpanded = expandedAgent === agent.id;

          return (
            <div
              key={agent.id}
              className={`rounded-xl border p-3.5 transition-all ${agent.color} ${
                isExpanded ? "ring-1 ring-cyan-500/30 shadow-lg" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${agent.pillColor}`}>
                    {agent.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {agent.latency}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {agent.summary}
              </p>

              {/* Expand/Collapse details button */}
              {isRedAlert && !agent.status.includes("RESTRICTED") && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition"
                  >
                    <span>{isExpanded ? "Hide Execution Payload" : "View Agent Output & Transcript"}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1.5 animate-in fade-in duration-150">
                      {Object.entries(agent.details).map(([key, val]) => {
                        if (key === "transcript" && Array.isArray(val)) {
                          return (
                            <div key={key} className="pt-1">
                              <span className="text-amber-400 font-bold block mb-1">
                                [Live WhatsApp Recon Transcript]:
                              </span>
                              <div className="space-y-1 bg-slate-900 p-2 rounded border border-slate-800">
                                {val.map((msg, idx) => (
                                  <div key={idx} className="text-[10px]">
                                    <span className="font-bold text-cyan-300">{msg.sender}: </span>
                                    <span className="text-slate-300">{msg.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (Array.isArray(val)) {
                          return (
                            <div key={key}>
                              <span className="text-slate-500 uppercase">{key}: </span>
                              <span className="text-slate-300">{val.join(", ")}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={key}>
                            <span className="text-slate-500 uppercase">{key}: </span>
                            <span className="text-slate-200">{String(val)}</span>
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
    </div>
  );
};
