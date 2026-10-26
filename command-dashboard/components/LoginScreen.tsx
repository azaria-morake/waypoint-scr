"use client";

import React from "react";
import { Shield, ShieldAlert, Radio, ArrowRight, Lock, CheckCircle2, Award } from "lucide-react";

export interface OrganizationOption {
  orgId: string;
  name: string;
  shortCode: string;
  badge: string;
  role: string;
  officerName: string;
  officerRank: string;
  badgeNumber: string;
  division: string;
  tier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV";
  themeColor: string;
  borderColor: string;
  accentBg: string;
  textColor: string;
  icon: React.ElementType;
  description: string;
  resourcesSummary: string;
}

interface LoginScreenProps {
  onSelectOrg: (org: OrganizationOption) => void;
}

export const ORGANIZATIONS: OrganizationOption[] = [
  {
    orgId: "saps-ekurhuleni-gov-001",
    name: "South African Police Service (SAPS)",
    shortCode: "SAPS FLYING SQUAD",
    badge: "SAPS",
    role: "National Law Enforcement & Armed Tactical Intercept C4i",
    officerName: "Constable Morake",
    officerRank: "Tactical Constable",
    badgeNumber: "SAPS-7491-EKU",
    division: "Ekurhuleni Flying Squad • Sector 2 Rapid Response",
    tier: "TIER_3_GOV",
    themeColor: "from-blue-600 to-indigo-900",
    borderColor: "border-blue-500/40 hover:border-blue-400",
    accentBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    textColor: "text-blue-400",
    icon: Shield,
    description: "Full statutory SAPS tactical jurisdiction, direct Flying Squad dispatch, POPIA Section 11(1)(d) vital-interest criminal intelligence access.",
    resourcesSummary: "Flying Squad Intercept Units 302 & 308, Air Wing Relay, SAPS Ekurhuleni Radio Mesh",
  },
  {
    orgId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Fox Tactical Security",
    shortCode: "FOX ARMED RESPONSE",
    badge: "FOX",
    role: "Private Security Control Room & Armed Response Operations",
    officerName: "Ops Commander Ndlovu",
    officerRank: "Tactical Operations Director",
    badgeNumber: "PSIRA-FOX-104",
    division: "Alberton North Armed Reaction & High-Risk Intercept",
    tier: "TIER_2_PRO",
    themeColor: "from-amber-500 to-amber-800",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    accentBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    textColor: "text-amber-400",
    icon: ShieldAlert,
    description: "Commercial armed response control room. B2B metered voice AI automation, multi-unit CAD routing, and high-frequency live GPS tracking.",
    resourcesSummary: "Fox Tactical Units 14 & 08 (Armed Reaction), Automated Twilio/WhatsApp Voice CAD Gateway",
  },
  {
    orgId: "cpf-alberton-north-001",
    name: "Alberton North Community Policing Forum (CPF)",
    shortCode: "CPF SECTOR 2",
    badge: "CPF",
    role: "Community Watch & Volunteer Rapid Alert Coordination",
    officerName: "Coordinator Van Zyl",
    officerRank: "Sector 2 Patrol Lead",
    badgeNumber: "CPF-SEC2-022",
    division: "Alberton North Community Safety & First Responder Relay",
    tier: "TIER_1_STARTER",
    themeColor: "from-teal-500 to-emerald-800",
    borderColor: "border-teal-500/40 hover:border-teal-400",
    accentBg: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    textColor: "text-teal-400",
    icon: Radio,
    description: "Neighborhood safety watch network. Direct 5km proximity broadcasting, citizen escalation listening, and volunteer patrol mesh.",
    resourcesSummary: "CPF Patrol Units Alpha & Bravo, Local Community Repeater, Emergency First-Aid Response",
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectOrg }) => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full pt-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-4 shadow-sm">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-semibold tracking-wide">FNB APP OF THE YEAR 2026 • COMPETITION JUDGE PORTAL</span>
        </div>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-950/50">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase font-sans text-white">
            Waypoint Secure
          </h1>
          <span className="text-xs bg-slate-800 text-emerald-400 font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
            TACTICAL C4i
          </span>
        </div>

        <p className="text-sm text-slate-400 max-w-xl">
          Select an authorized responder agency below to enter its specialized command terminal, view its assigned officer, and monitor live district safety.
        </p>
      </header>

      {/* Organization Options Grid */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {ORGANIZATIONS.map((org) => {
          const Icon = org.icon;
          return (
            <div
              key={org.orgId}
              onClick={() => onSelectOrg(org)}
              className={`group bg-slate-900/90 hover:bg-slate-900 rounded-3xl border ${org.borderColor} p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:shadow-2xl`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${org.themeColor} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${org.accentBg}`}>
                    {org.tier.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                  {org.name}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  {org.role}
                </p>

                {/* Officer on Duty Badge */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Officer on Duty:</span>
                    <span className="font-bold text-white flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{org.officerName}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {org.officerRank} • <span className="font-mono text-slate-300">{org.badgeNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {org.division}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                  {org.description}
                </p>
              </div>

              {/* Card Footer & Action */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                  {org.shortCode}
                </span>
                <button
                  type="button"
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 transition-all`}
                >
                  <span>Launch C4i</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full pt-4 pb-2 border-t border-slate-900 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>POPIA Act No. 4 of 2013 Statutory Compliance • End-to-End Encrypted C4i Telemetry</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Alberton / Sandton Central Sector • Port 3000
        </div>
      </footer>
    </div>
  );
};
