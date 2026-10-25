"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Home, ArrowLeft } from "lucide-react";

interface CompletionScreenProps {
  isDeceptiveDuress: boolean;
  onReturnHome: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  isDeceptiveDuress,
  onReturnHome,
}) => {
  return (
    <div className="relative w-full min-h-screen bg-[#f8fafc] flex flex-col justify-between p-6 text-slate-800 select-none animate-in fade-in duration-300">
      <div className="pt-16 flex flex-col items-center text-center">
        {/* Safe Checkmark Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
          Journey Ended Safely
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
          Your journey has been marked as completed. All emergency contacts have been notified that you arrived safely.
        </p>

        {/* Deceptive silent indicator for reviewer / tester only */}
        {isDeceptiveDuress && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-3.5 text-xs text-left max-w-xs shadow-sm">
            <div className="flex items-center space-x-1.5 font-bold text-red-700 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>DURESS SILENT PROTOCOL ACTIVE</span>
            </div>
            <p className="text-[11px] text-red-600 leading-snug">
              To any coerced observer, this screen looks 100% normal. Behind the scenes, the tactical control room and SAPS are actively tracking at Code Red with full swarm dispatch!
            </p>
          </div>
        )}

        <div className="w-full max-w-xs bg-white rounded-2xl p-4 mt-8 border border-slate-200/80 shadow-sm text-left">
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Destination</span>
            <span className="font-semibold text-slate-800">Sandton City Mall</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-emerald-600">Disarmed (Safe)</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-slate-500">Dead-Man&apos;s Switch</span>
            <span className="font-semibold text-slate-800">Released</span>
          </div>
        </div>
      </div>

      <div className="pb-8 flex flex-col space-y-3 items-center">
        <button
          onClick={onReturnHome}
          className="w-full max-w-xs py-4 rounded-full bg-[#15202b] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Waypoint Home</span>
        </button>
      </div>
    </div>
  );
};
