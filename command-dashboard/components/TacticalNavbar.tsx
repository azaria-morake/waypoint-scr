"use client";

import React from "react";
import { Shield, ShieldAlert, Radio, Server, RefreshCw, Zap, MessageSquare, AlertTriangle } from "lucide-react";

interface TacticalNavbarProps {
  currentTier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV";
  currentOrgName: string;
  onTierChange: (tier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV") => void;
  isWsConnected: boolean;
  onTriggerSos: () => void;
  onTriggerDuress: () => void;
  onTriggerGForce: () => void;
  onTriggerSms: () => void;
  onReset: () => void;
}

export const TacticalNavbar: React.FC<TacticalNavbarProps> = ({
  currentTier,
  currentOrgName,
  onTierChange,
  isWsConnected,
  onTriggerSos,
  onTriggerDuress,
  onTriggerGForce,
  onTriggerSms,
  onReset,
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-3 select-none flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Control Room Badge */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black text-white tracking-wider uppercase font-sans">
              Waypoint Secure
            </h1>
            <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              TACTICAL C4i
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Control Room: {currentOrgName}</span>
          </p>
        </div>
      </div>

      {/* Tenant Context / Subscription Tier Switcher */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 px-2.5">
          Tenant Context:
        </span>
        <button
          onClick={() => onTierChange("TIER_1_STARTER")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            currentTier === "TIER_1_STARTER"
              ? "bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tier 1: CPF
        </button>
        <button
          onClick={() => onTierChange("TIER_2_PRO")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            currentTier === "TIER_2_PRO"
              ? "bg-slate-800 text-amber-400 shadow-sm border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tier 2: Fox Tactical
        </button>
        <button
          onClick={() => onTierChange("TIER_3_GOV")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            currentTier === "TIER_3_GOV"
              ? "bg-slate-800 text-red-400 shadow-sm border border-red-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tier 3: SAPS
        </button>
      </div>

      {/* Emergency Simulation Bar & System Health */}
      <div className="flex items-center space-x-2">
        {/* Test Vectors */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-medium mr-1">Simulate:</span>
          <button
            onClick={onTriggerSos}
            className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-600/40 text-red-300 font-semibold transition"
          >
            2nd-Tap SOS
          </button>
          <button
            onClick={onTriggerDuress}
            className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/40 text-amber-300 font-semibold transition"
          >
            Duress 9999
          </button>
          <button
            onClick={onTriggerGForce}
            className="px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-600/40 text-purple-300 font-semibold transition"
          >
            3.8G Spike
          </button>
          <button
            onClick={onTriggerSms}
            className="px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-600/40 text-blue-300 font-semibold transition"
          >
            2G GSM-7
          </button>
          <button
            onClick={onReset}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset to Normal"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* WebSocket Status */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="font-semibold text-slate-300">
            {isWsConnected ? "LIVE STREAM" : "OFFLINE"}
          </span>
        </div>
      </div>
    </header>
  );
};
