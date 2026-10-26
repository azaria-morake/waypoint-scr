"use client";

import React from "react";
import {
  Shield,
  Activity,
  Car,
  Radio,
  Lock,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Server,
  Zap,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface ActivityItem {
  id: string;
  timestamp: string;
  type: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
  title: string;
  description: string;
}

interface StationOverviewViewProps {
  currentOrg: OrganizationOption;
  recentActivities: ActivityItem[];
  isWsConnected: boolean;
  onNavigateToMap: () => void;
}

export const StationOverviewView: React.FC<StationOverviewViewProps> = ({
  currentOrg,
  recentActivities,
  isWsConnected,
  onNavigateToMap,
}) => {
  const OrgIcon = currentOrg.icon;

  return (
    <div className="flex-1 p-6 flex flex-col space-y-6 max-w-7xl w-full mx-auto select-none overflow-y-auto">
      {/* Top Banner / Welcome Strip */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentOrg.themeColor} flex items-center justify-center text-white shadow-xl flex-shrink-0`}>
            <OrgIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                {currentOrg.name}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentOrg.accentBg}`}>
                {currentOrg.tier.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Station Sector: <span className="text-white font-medium">{currentOrg.division}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center space-x-2.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isWsConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <div>
              <div className="text-[10px] text-slate-400">Station Terminal</div>
              <div className="font-bold text-white font-mono">
                {isWsConnected ? "LIVE C4i STREAM" : "OFFLINE"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToMap}
            className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Radio className="w-4 h-4" />
            <span>Open Live Tactical Map</span>
          </button>
        </div>
      </div>

      {/* Grid: Officer Profile & Station Tactical Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Person Agent / Officer Profile (5 cols) */}
        <section className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Officer &amp; Agent Information
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE ON DUTY
              </span>
            </div>

            {/* Officer Details */}
            <div className="mt-5 space-y-3.5">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Assigned Officer</div>
                  <div className="text-base font-black text-white mt-0.5">
                    {currentOrg.officerName}
                  </div>
                  <div className="text-xs text-cyan-400 font-semibold">
                    {currentOrg.officerRank}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Badge / Registration</div>
                  <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                    {currentOrg.badgeNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Shift Duration</span>
                  <span className="font-bold text-white font-mono">06:00 – 18:00 SAST</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Radio Channel</span>
                  <span className="font-bold text-white font-mono">CH-04 Tactical (464.550 MHz)</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">Operational Division</span>
                <span className="font-semibold text-slate-200 text-xs">
                  {currentOrg.division}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">Dispatch Authorization</span>
                <span className="font-semibold text-emerald-400 text-xs flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Level 3 Statutory Armed Tactical Intercept Authorized</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Terminal: <b className="text-slate-300 font-mono">C4I-TERM-EKU-09</b></span>
            <span>Station Status: <b className="text-emerald-400">Green / Standby</b></span>
          </div>
        </section>

        {/* Right Column: Station Resources & Tactical Fleet (7 cols) */}
        <section className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Station Tactical Assets &amp; Fleet Units
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                4 / 4 Units Active
              </span>
            </div>

            {/* Tactical Units Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    14
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Fox Tactical Unit 14</h4>
                    <p className="text-[11px] text-slate-400">Armed Response • 2 Officers</p>
                    <span className="text-[10px] text-slate-400">Patrolling N12 / Voortrekker</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    08
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Fox Tactical Unit 08</h4>
                    <p className="text-[11px] text-slate-400">Armed Response • 2 Officers</p>
                    <span className="text-[10px] text-slate-400">Patrolling Ring Rd East</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    302
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">SAPS Flying Squad 302</h4>
                    <p className="text-[11px] text-slate-400">High-Speed Intercept • 2 Officers</p>
                    <span className="text-[10px] text-slate-400">Standby Reading Interchange</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    CPF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Alberton CPF Unit 04</h4>
                    <p className="text-[11px] text-slate-400">Community Watch • Patrol Volunteer</p>
                    <span className="text-[10px] text-slate-400">Patrolling 8th Ave / Hendrik</span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center">
                <Lock className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400">POPIA Vault</span>
                <span className="text-xs font-bold text-white mt-0.5">Hardware HSM Sealed</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center">
                <Cpu className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400">The Way Swarm</span>
                <span className="text-xs font-bold text-white mt-0.5">Gemini 3 Hub Standby</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center">
                <Radio className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400">Radio Mesh</span>
                <span className="text-xs font-bold text-white mt-0.5">Alberton Repeater 99%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Sector Coverage: <b className="text-slate-300">5.0 km Alberton North / N12 East Tactical Grid</b>
          </div>
        </section>
      </div>

      {/* Section 3: Recent Operational Activities Ledger */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Recent Operational Activities &amp; Incident Actions
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time Station Ledger
          </span>
        </div>

        {/* Chronological Activities Feed */}
        <div className="mt-4 space-y-2.5">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent alerts or distress incidents recorded in this session. The sector is at rest.
            </div>
          ) : (
            recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between hover:border-slate-700 transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {act.type === "ALERT" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                    ) : act.type === "SUCCESS" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{act.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 flex-shrink-0 ml-3">
                  <Clock className="w-3 h-3" />
                  <span>{act.timestamp}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
