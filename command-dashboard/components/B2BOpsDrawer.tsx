"use client";

import React, { useState } from "react";
import { PhoneCall, Shield, FileText, CheckCircle, Clock, Zap, AlertCircle } from "lucide-react";

interface B2BOpsDrawerProps {
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  onTriggerTask: (category: string, target: string) => Promise<any>;
  auditLogs: Array<{
    audit_id: string;
    action: string;
    responder_id: string;
    ip_address: string;
    justification: string;
    accessed_at: string;
  }>;
}

export const B2BOpsDrawer: React.FC<B2BOpsDrawerProps> = ({
  voiceMinutesUsed,
  voiceMinutesLimit,
  onTriggerTask,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<"B2B_RUNNER" | "POPIA_LEDGER">("B2B_RUNNER");
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [taskOutput, setTaskOutput] = useState<any>(null);

  const usagePercent = Math.min(Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100), 100);

  const handleRun = async (category: string, target: string) => {
    setLoadingTask(category);
    try {
      const res = await onTriggerTask(category, target);
      setTaskOutput(res);
    } catch (e: any) {
      alert(`Task execution error: ${e.message}`);
    } finally {
      setLoadingTask(null);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col select-none">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("B2B_RUNNER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === "B2B_RUNNER"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Commercial B2B Operations Runner</span>
          </button>

          <button
            onClick={() => setActiveTab("POPIA_LEDGER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === "POPIA_LEDGER"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>POPIA Cryptographic Audit Ledger</span>
          </button>
        </div>

        {/* Metered Voice Minutes Indicator */}
        <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">Metered Voice AI Billing</span>
            <span className="font-mono font-bold text-slate-200">
              {voiceMinutesUsed} / {voiceMinutesLimit} min ({usagePercent}%)
            </span>
          </div>
          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Commercial B2B Runner */}
      {activeTab === "B2B_RUNNER" && (
        <div className="mt-4 flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Task 1: Alarm Verification */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Alarm Verification</h4>
                  <span className="text-[9px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-600/30">
                    +2.0 min
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Automated audio check &amp; property contact call on perimeter alarm trip.
                </p>
              </div>
              <button
                onClick={() => handleRun("ALARM_VERIFICATION", "42 Voortrekker Road, Alberton")}
                disabled={loadingTask !== null}
                className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-xs font-bold text-slate-200 rounded-lg transition"
              >
                {loadingTask === "ALARM_VERIFICATION" ? "Executing Call..." : "Execute Verification"}
              </button>
            </div>

            {/* Task 2: Client Welfare Check */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Client Welfare Check</h4>
                  <span className="text-[9px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-600/30">
                    +2.0 min
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Scheduled safety check-in call with high-value VIP residential client.
                </p>
              </div>
              <button
                onClick={() => handleRun("CLIENT_WELFARE_CHECK", "Client: Sipho Mthembu (Stand 104)")}
                disabled={loadingTask !== null}
                className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-xs font-bold text-slate-200 rounded-lg transition"
              >
                {loadingTask === "CLIENT_WELFARE_CHECK" ? "Checking Welfare..." : "Execute Welfare Check"}
              </button>
            </div>

            {/* Task 3: Guard Check-In */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Guard Patrol Check-In</h4>
                  <span className="text-[9px] font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-600/30">
                    +1.0 min
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Heartbeat patrol verification on stationary guard posts and boom gates.
                </p>
              </div>
              <button
                onClick={() => handleRun("GUARD_CHECKIN", "Post 3: Alberton Sector Boom Gate")}
                disabled={loadingTask !== null}
                className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-xs font-bold text-slate-200 rounded-lg transition"
              >
                {loadingTask === "GUARD_CHECKIN" ? "Verifying..." : "Execute Guard Ping"}
              </button>
            </div>
          </div>

          {/* Execution Result Log */}
          {taskOutput && (
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                <span>✓ Task {taskOutput.task_category} Completed in {taskOutput.latency_ms}ms</span>
                <span>Billed: +{taskOutput.voice_minutes_billed} Voice Mins</span>
              </div>
              <p className="text-slate-300">{taskOutput.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: POPIA Cryptographic Ledger */}
      {activeTab === "POPIA_LEDGER" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <th className="pb-2">Timestamp (UTC)</th>
                <th className="pb-2">Audit Action</th>
                <th className="pb-2">Responder CallSign</th>
                <th className="pb-2">Legal Statutory Justification</th>
                <th className="pb-2">IP Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-slate-950/40">
                    <td className="py-2 text-slate-400">{log.accessed_at?.slice(0, 19).replace("T", " ")}</td>
                    <td className="py-2 text-amber-400 font-bold">{log.action}</td>
                    <td className="py-2 text-slate-300">{log.responder_id || "SYSTEM_DISPATCH"}</td>
                    <td className="py-2 text-slate-400">{log.justification}</td>
                    <td className="py-2 text-slate-500">{log.ip_address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 font-sans">
                    No active POPIA decryptions logged during idle green monitoring. Decryptions occur strictly upon Code Red distress trigger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
