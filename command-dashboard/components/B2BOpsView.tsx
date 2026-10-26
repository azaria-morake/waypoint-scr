"use client";

import React, { useState } from "react";
import {
  Zap,
  PhoneCall,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  PhoneForwarded,
  UserCheck,
  Building,
  Volume2,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface B2BOpsViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
}

export const B2BOpsView: React.FC<B2BOpsViewProps> = ({ currentOrg, isWsConnected }) => {
  const [voiceMinutesUsed, setVoiceMinutesUsed] = useState<number>(184);
  const voiceMinutesLimit = 1000;
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [activeTaskResult, setActiveTaskResult] = useState<{
    category: string;
    target: string;
    status: string;
    action: string;
    details: string;
    latencyMs: number;
    transcript?: Array<{ speaker: string; text: string }>;
  } | null>(null);

  const usagePercent = Math.min(Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100), 100);

  const handleRunTask = (category: string, target: string) => {
    setLoadingTask(category);
    setActiveTaskResult(null);

    setTimeout(() => {
      setLoadingTask(null);
      setVoiceMinutesUsed((prev) => prev + 2);

      if (category === "ALARM_VERIFICATION") {
        setActiveTaskResult({
          category: "Automated Alarm Audio Verification",
          target,
          status: "FALSE ALARM • PREMISES SECURE",
          action: "Outbound Automated Audio Callout & Perimeter Sensor Ingestion",
          details: "Client confirmed domestic worker triggered passive infrared sensor on patio. No armed deployment required.",
          latencyMs: 380,
          transcript: [
            { speaker: "Waypoint AI Dispatch", text: "Fox Tactical Automated Alert for Stand 104 Meyersdal. A perimeter trip was detected at 19:14. Please confirm safety." },
            { speaker: "Sipho Mthembu (Client)", text: "Hi, all good! Domestic worker opened the patio door before disarming. We are safe." },
            { speaker: "Waypoint AI Dispatch", text: "Acknowledged Mr. Mthembu. Alert cancelled, stand status reset to green." },
          ],
        });
      } else if (category === "CLIENT_WELFARE_CHECK") {
        setActiveTaskResult({
          category: "High-Value VIP Welfare Check",
          target,
          status: "CLIENT CONFIRMED SAFE",
          action: "Scheduled AI Welfare Ping & Dual-PIN Challenge",
          details: "Client safely authenticated identity via voice biometric matching. Device battery: 94%.",
          latencyMs: 420,
          transcript: [
            { speaker: "Waypoint AI Dispatch", text: "Good evening Mrs. Dlamini, this is your scheduled evening waypoint check-in. Is everything secure at your residence?" },
            { speaker: "Mrs. Nomvula Dlamini", text: "Good evening. Yes, gate is locked and we are home safe." },
            { speaker: "Waypoint AI Dispatch", text: "Thank you Mrs. Dlamini. Night patrol Fox-08 will pass your street at 21:00." },
          ],
        });
      } else {
        setActiveTaskResult({
          category: "Guard Patrol Post Check-In",
          target,
          status: "POST MANNED & VERIFIED",
          action: "Dead-Man Radio Ping & GPS NFC Wand Verification",
          details: "Officer Khumalo at Post 3 (Boom Gate) acknowledged dead-man signal in 4.2 seconds.",
          latencyMs: 290,
          transcript: [
            { speaker: "Waypoint C4i Ping", text: "Post 3 dead-man verification ping initiated. Officer confirm status." },
            { speaker: "Guard Khumalo (Post 3)", text: "Post 3 acknowledged. Sector boom secure, zero perimeter breaches." },
            { speaker: "Waypoint C4i Ping", text: "Timestamp logged in control room ledger." },
          ],
        });
      }
    }, 1100);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto select-none p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950/50">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                Commercial B2B Operations Runner
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated security control room workflows, voice check-ins &amp; metered minutes engine
              </p>
            </div>
          </div>
        </div>

        {/* Metered Voice Minutes Card */}
        <div className="flex items-center space-x-4 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs gap-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Metered Voice AI Balance</span>
              <span className="font-mono font-bold text-white">
                {voiceMinutesUsed} / {voiceMinutesLimit} min
              </span>
            </div>
            <div className="w-44 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-500/30">
            {100 - usagePercent}% REMAINING
          </span>
        </div>
      </div>

      {/* Subscription Tier Banner */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs font-bold text-white">
              {currentOrg.name} • Commercial Terminal Profile
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Subscription Level: <b className="text-cyan-300 font-mono">{currentOrg.tier}</b> • Unlimited Telemetry Vectors • High-Concurrency Voice Dispatch
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
          COMMERCIAL LICENSE ACTIVE
        </span>
      </div>

      {/* The 3 Interactive Commercial Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Task 1: Perimeter Alarm Verification */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                2.0 MIN / RUN
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">Perimeter Alarm Verification</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Automated outbound voice callout &amp; property contact on passive infrared beam trip to filter false alarms.
            </p>

            <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Test Client Stand</span>
              <span className="font-bold text-white">Stand 104 Meyersdal Eco Estate</span>
              <span className="text-slate-400 block text-[10px] mt-0.5">Contact: Sipho Mthembu (+27 82 555 0199)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleRunTask("ALARM_VERIFICATION", "Stand 104 Meyersdal Eco Estate")}
            disabled={loadingTask !== null}
            className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingTask === "ALARM_VERIFICATION" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Executing Automated Call...</span>
              </>
            ) : (
              <>
                <PhoneForwarded className="w-3.5 h-3.5" />
                <span>Trigger Alarm Verification</span>
              </>
            )}
          </button>
        </div>

        {/* Task 2: VIP Welfare Check */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                1.5 MIN / RUN
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">VIP Client Welfare Check</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Scheduled safety welfare call with high-value VIP resident, validating dual-PIN protocol and health check.
            </p>

            <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">VIP Target</span>
              <span className="font-bold text-white">Mrs. Nomvula Dlamini (Villa 18)</span>
              <span className="text-slate-400 block text-[10px] mt-0.5">Status: Scheduled Night Check (20:00)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleRunTask("CLIENT_WELFARE_CHECK", "Villa 18, Alberton North")}
            disabled={loadingTask !== null}
            className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingTask === "CLIENT_WELFARE_CHECK" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Connecting Welfare Bot...</span>
              </>
            ) : (
              <>
                <PhoneForwarded className="w-3.5 h-3.5" />
                <span>Execute Welfare Check</span>
              </>
            )}
          </button>
        </div>

        {/* Task 3: Guard Dead-Man Check-In */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                0.5 MIN / RUN
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">Guard Patrol Dead-Man Ping</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Automated dead-man radio challenge to physical boom gate security posts to verify alertness and post integrity.
            </p>

            <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sector Post</span>
              <span className="font-bold text-white">Post 3: Alberton Sector Boom Gate</span>
              <span className="text-slate-400 block text-[10px] mt-0.5">Assigned: Officer Khumalo (Fox Patrol)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleRunTask("GUARD_CHECKIN", "Post 3 Boom Gate")}
            disabled={loadingTask !== null}
            className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loadingTask === "GUARD_CHECKIN" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Pinging Post Guard Radio...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Guard Ping</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Result Dossier (When a Task is Triggered) */}
      {activeTaskResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 mb-8">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Automated Task Execution Report
                </h3>
                <span className="text-[11px] text-cyan-400 font-bold">
                  {activeTaskResult.category} • {activeTaskResult.target}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-slate-400">Latency: <b className="text-cyan-300">{activeTaskResult.latencyMs}ms</b></span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/40">
                {activeTaskResult.status}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block uppercase text-[10px] mb-1">Execution Summary:</span>
            {activeTaskResult.details}
          </div>

          {/* Transcript Box */}
          {activeTaskResult.transcript && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Live Voice Synthesis &amp; Audio Telephony Transcript:
              </span>
              <div className="space-y-2">
                {activeTaskResult.transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                      msg.speaker.includes("Waypoint")
                        ? "bg-slate-900 border border-slate-800 text-cyan-200"
                        : "bg-cyan-950/40 border border-cyan-800/40 text-slate-100 ml-auto text-right"
                    }`}
                  >
                    <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                      {msg.speaker}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
