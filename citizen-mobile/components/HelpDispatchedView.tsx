"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Check, PhoneCall, AlertTriangle, Radio } from "lucide-react";
import { MapCanvas } from "./MapCanvas";

interface HelpDispatchedViewProps {
  journeyId: string;
  onOpenPinModal: (isDuress: boolean) => void;
  onDuressTrigger: () => Promise<void>;
}

export const HelpDispatchedView: React.FC<HelpDispatchedViewProps> = ({
  journeyId,
  onOpenPinModal,
  onDuressTrigger,
}) => {
  const [responderDistanceKm, setResponderDistanceKm] = useState<number>(3.2);
  const [etaMinutes, setEtaMinutes] = useState<number>(4);
  const [responderProgress, setResponderProgress] = useState<number>(0.2);

  // Simulate responder vehicle converging
  useEffect(() => {
    const interval = setInterval(() => {
      setResponderDistanceKm((prev) => (prev > 0.3 ? Number((prev - 0.1).toFixed(1)) : 0.2));
      setResponderProgress((prev) => (prev < 0.9 ? prev + 0.05 : 0.9));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-900 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Rescue Map */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          mode="RED"
          progress={0.42}
          responderProgress={responderProgress}
          telemetrySpeed={82}
        />
      </div>

      {/* Top Banner (Coral/Red Alert Pill) */}
      <div className="relative z-10 pt-10 px-6 flex justify-center">
        <div className="w-full max-w-sm bg-[#ff7660]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-red-400 flex items-center justify-between text-white animate-pulse">
          <div className="flex flex-col">
            <h3 className="text-sm font-black tracking-wide uppercase">
              HELP IS ON THE WAY
            </h3>
            <p className="text-[11px] font-semibold text-white/90">
              • Way Swarm Active
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold bg-white/20 px-2 py-1 rounded">
              {etaMinutes} MIN ETA
            </span>
            <span className="block text-[9px] text-white/90 mt-0.5">
              {responderDistanceKm} km away
            </span>
          </div>
        </div>
      </div>

      {/* Mid Status Beacon */}
      <div className="relative z-10 mx-auto bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-red-500/50 shadow-lg flex items-center space-x-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span className="font-semibold">Fox Tactical Unit 14 Converging</span>
      </div>

      {/* Bottom Sheet Card */}
      <div className="relative z-10 bg-[#fdfbf7] rounded-t-[2.5rem] px-6 pt-5 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] flex flex-col space-y-3.5">
        {/* Coordination Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-3">
            We&apos;re coordinating your help
          </h4>
          <div className="flex flex-col space-y-2.5">
            {/* Checklist item 1 */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-[#9ee8d1] flex items-center justify-center text-[#13372c] flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                Checking with Mom (Sister WhatsApp AI Agent)
              </span>
            </div>

            {/* Checklist item 2 */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-[#9ee8d1] flex items-center justify-center text-[#13372c] flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                Alerting local patrol (Fox Tactical &amp; Alberton CPF)
              </span>
            </div>

            {/* Checklist item 3 */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-[#9ee8d1] flex items-center justify-center text-[#13372c] flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                Broadcasting profile (POPIA Sec 11 Unlocked)
              </span>
            </div>
          </div>
        </div>

        {/* Cancel Alert Button (Coral/Red) */}
        <button
          onClick={() => onOpenPinModal(false)}
          className="w-full py-3.5 rounded-full bg-[#ff7660] hover:bg-[#f0654e] active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center"
        >
          Cancel Alert (Requires PIN)
        </button>

        {/* Duress PIN Button (White Pill) */}
        <button
          onClick={() => onOpenPinModal(true)}
          className="w-full py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-sm transition flex flex-col items-center justify-center active:scale-[0.99]"
        >
          <span>Duress PIN</span>
          <span className="text-[10px] font-normal text-slate-500">
            Enter standard PIN to end, or silent duress PIN if you cannot speak.
          </span>
        </button>
      </div>
    </div>
  );
};
