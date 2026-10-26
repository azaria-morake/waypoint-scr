"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Navigation,
  Compass,
  MapPin,
  Car,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Shield,
  Activity,
  Bot,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface ActionChip {
  action_id: string;
  label: string;
  rationale: string;
  primary: boolean;
}

interface TrafficControlCoPilotProps {
  currentOrg: OrganizationOption;
  isRedAlert: boolean;
  onOpenWhatsAppRecon: () => void;
  onConvergeUnits?: () => void;
  extractedAttire?: string | null;
}

export const TrafficControlCoPilot: React.FC<TrafficControlCoPilotProps> = ({
  currentOrg,
  isRedAlert,
  onOpenWhatsAppRecon,
  onConvergeUnits,
  extractedAttire,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [auditData, setAuditData] = useState<any>(null);
  const [liaisonBriefing, setLiaisonBriefing] = useState<string>(
    "Constable Morake, BOLO Young online. Sector telemetry stream active and monitoring corridor vectors."
  );
  const [threatLevel, setThreatLevel] = useState<string>("MODERATE");
  const [actionChips, setActionChips] = useState<ActionChip[]>([]);
  const [operatorPrompt, setOperatorPrompt] = useState<string>("");
  const [isLiaising, setIsLiaising] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch real-time audit report from Traffic Control Agent
  const fetchAudit = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/traffic-control/audit?operator_name=${encodeURIComponent(currentOrg.officerName)}`);
      if (res.ok) {
        const data = await res.json();
        setAuditData(data.audit);
        if (data.liaison) {
          setLiaisonBriefing(data.liaison.briefing);
          setThreatLevel(data.liaison.threat_level);
          setActionChips(data.liaison.action_chips || []);
        }
      }
    } catch (e) {
      console.warn("Traffic Control audit fetch error:", e);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 4000);
    return () => clearInterval(interval);
  }, [currentOrg, isRedAlert]);

  // Handle Action Chip selection
  const handleActionClick = (chip: ActionChip) => {
    if (chip.action_id === "DEPLOY_NOK_RECON") {
      onOpenWhatsAppRecon();
    } else if (chip.action_id === "INTERCEPT_CONVERGE" && onConvergeUnits) {
      onConvergeUnits();
    } else {
      // Send as operator prompt
      handleSendPrompt(chip.label);
    }
  };

  // Ask or instruct Traffic Control Agent
  const handleSendPrompt = async (queryText?: string) => {
    const q = queryText || operatorPrompt;
    if (!q.trim() || isLiaising) return;

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
        setLiaisonBriefing(data.briefing);
        setThreatLevel(data.threat_level);
        if (data.action_chips) {
          setActionChips(data.action_chips);
        }
      }
    } catch (e) {
      console.warn("Liaison error:", e);
    } finally {
      setIsLiaising(false);
    }
  };

  const isStagnant = auditData?.location_audit?.is_stagnant || isRedAlert;
  const attireMissing = !extractedAttire && auditData?.appearance_audit?.appearance_gap_detected;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden select-none">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition border-b border-slate-800"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white shadow">
            <Bot className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-amber-400">BOLO Young</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">| Traffic Control Co-Pilot</span>
              </h3>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  threatLevel === "CRITICAL"
                    ? "bg-red-950 text-red-300 border-red-500/50 animate-pulse"
                    : threatLevel === "HIGH"
                    ? "bg-amber-950 text-amber-300 border-amber-500/40"
                    : "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {threatLevel}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Liaising with {currentOrg.officerName} • Corridor Telemetry Guardian
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Co-Pilot Panel */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 bg-slate-950/50">
          {/* Live Audit Checklist Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Kinematics / Stagnation Status */}
            <div
              className={`p-2 rounded-xl border flex items-center space-x-2 ${
                isStagnant
                  ? "bg-red-950/40 border-red-500/50 text-red-300"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${isStagnant ? "text-red-400 animate-ping" : "text-emerald-400"}`} />
              <div className="overflow-hidden">
                <span className="font-bold block text-[10px]">
                  {isStagnant ? "⚠️ TARGET STAGNANT (>90s)" : "✓ TELEMETRY STREAM NOMINAL"}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {auditData?.location_audit?.stagnation_summary || "0 km/h baseline"}
                </span>
              </div>
            </div>

            {/* Appearance / Attire Gap Status */}
            <div
              className={`p-2 rounded-xl border flex items-center space-x-2 ${
                extractedAttire
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                  : attireMissing
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${extractedAttire ? "text-emerald-400" : "text-amber-400"}`} />
              <div className="overflow-hidden">
                <span className="font-bold block text-[10px]">
                  {extractedAttire
                    ? "✓ VISUAL ATTIRE CONFIRMED"
                    : attireMissing
                    ? "⚠️ VISUAL ATTIRE GAP DETECTED"
                    : "✓ PRE-DEPARTURE PHOTO MATCH"}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {extractedAttire || "Clothing unverified for today's run"}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Control Agent Tactical Briefing Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed shadow-inner">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-[10px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>BOLO Young Tactical Briefing:</span>
            </div>
            <p className="text-slate-300 text-xs font-sans">
              {liaisonBriefing}
            </p>
          </div>

          {/* Action Chips: Structured Options for Constable Morake */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
              Operator Directives (Click to Execute):
            </span>

            <div className="flex flex-wrap gap-2">
              {actionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleActionClick(chip)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow active:scale-95 ${
                    chip.primary
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              ))}

              {/* Direct WhatsApp Recon Trigger button if not already present */}
              {!actionChips.some((c) => c.action_id === "DEPLOY_NOK_RECON") && (
                <button
                  type="button"
                  onClick={onOpenWhatsAppRecon}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Launch WhatsApp Recon (Sister Zanele)</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Input Bar for Constable Morake */}
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
            <input
              type="text"
              value={operatorPrompt}
              onChange={(e) => setOperatorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
              placeholder="Ask BOLO Young (e.g., 'What is closest unit?', 'Is target moving?')..."
              className="flex-1 bg-slate-900 text-xs text-white px-3.5 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none placeholder-slate-500"
            />
            <button
              type="button"
              onClick={() => handleSendPrompt()}
              disabled={!operatorPrompt.trim() || isLiaising}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
