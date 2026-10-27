"use client";

import React, { useState, useEffect } from "react";
import { Share2, Lock, Radio, Activity, Zap, MessageSquare } from "lucide-react";
import { MapCanvas } from "./MapCanvas";

interface ActiveJourneyViewProps {
  journeyId: string;
  destination: string;
  onPanicTapTwo: () => Promise<void>;
  onOpenPinModal: (isDuress: boolean) => void;
  onSimulateGForceStruggle: () => Promise<void>;
  onSimulateSmsFallback: () => Promise<void>;
}

export const ActiveJourneyView: React.FC<ActiveJourneyViewProps> = ({
  journeyId,
  destination,
  onPanicTapTwo,
  onOpenPinModal,
  onSimulateGForceStruggle,
  onSimulateSmsFallback,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(24 * 60 + 32);
  const [speed, setSpeed] = useState<number>(78);
  const [gForce, setGForce] = useState<number>(1.1);
  const [progress, setProgress] = useState<number>(0.32);
  const [panicLoading, setPanicLoading] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const CORRIDOR_ROUTE: [number, number][] = [
    [-26.2585, 28.1215],
    [-26.2602, 28.1220],
    [-26.2625, 28.1228],
    [-26.2650, 28.1235],
    [-26.2678, 28.1245],
  ];

  // Countdown timer for Dead-Man's Switch and live telemetry streaming
  useEffect(() => {
    let pingCounter = 0;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      let currentProg = 0.32;
      setProgress((prev) => {
        const next = prev < 0.95 ? prev + 0.003 : 0.95;
        currentProg = next;
        return next;
      });

      const currentSpeed = 74 + Math.floor(Math.sin(Date.now() / 2000) * 6);
      setSpeed(currentSpeed);

      pingCounter++;
      if (pingCounter % 2 === 0) {
        const curIdx = Math.min(Math.floor(currentProg * (CORRIDOR_ROUTE.length - 1)), CORRIDOR_ROUTE.length - 1);
        const nextIdx = Math.min(curIdx + 1, CORRIDOR_ROUTE.length - 1);
        const frac = (currentProg * (CORRIDOR_ROUTE.length - 1)) - curIdx;
        const curLat = CORRIDOR_ROUTE[curIdx][0] + (CORRIDOR_ROUTE[nextIdx][0] - CORRIDOR_ROUTE[curIdx][0]) * frac;
        const curLng = CORRIDOR_ROUTE[curIdx][1] + (CORRIDOR_ROUTE[nextIdx][1] - CORRIDOR_ROUTE[curIdx][1]) * frac;

        fetch(`${apiUrl}/api/v1/telemetry/ping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journey_id: journeyId,
            lat: curLat,
            lng: curLng,
            speed_kmh: currentSpeed,
            heading_deg: 140,
            g_force: 1.1,
            battery: 92,
            citizen_name: "Thandiwe Ndlovu",
          }),
        }).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [journeyId, apiUrl]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePanicClick = async () => {
    setPanicLoading(true);
    try {
      await onPanicTapTwo();
    } finally {
      setPanicLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-900 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Interactive Map */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          mode="ACTIVE"
          progress={progress}
          telemetrySpeed={speed}
        />
      </div>

      {/* Top Banner (Mint Green Pill) */}
      <div className="relative z-10 pt-10 px-6 flex justify-center">
        <div className="w-full max-w-lg bg-[#bbf0dc]/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-lg border border-[#a2e5cc] flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
              <h3 className="text-sm font-bold text-[#0e3b2e]">
                Green Journey Active
              </h3>
            </div>
            <p className="text-[11px] text-[#16503f] font-medium mt-0.5">
              • Tracking you until you arrive.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#0e3b2e] bg-[#9ee8d1] px-2 py-1 rounded-md">
              {formatTimer(secondsRemaining)}
            </span>
            <span className="block text-[9px] text-[#16503f] mt-0.5">DMS Countdown</span>
          </div>
        </div>
      </div>

      {/* Middle SOS Panic Button Overlay (Large Red Glowing Circle) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Glow Rings */}
          <div className="absolute w-64 h-64 rounded-full bg-red-400/20 animate-ping duration-1000" />
          <div className="absolute w-52 h-52 rounded-full bg-red-500/30 animate-pulse" />

          {/* Main 2nd-Tap SOS Emergency Button */}
          <button
            onClick={handlePanicClick}
            disabled={panicLoading}
            className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#ff5a5a] via-[#f03a3a] to-[#d32f2f] hover:from-[#f03a3a] hover:to-[#b71c1c] active:scale-95 text-white shadow-[0_0_50px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center text-center p-4 border-4 border-white/40 transition cursor-pointer"
          >
            <span className="text-base font-black tracking-tight leading-tight uppercase font-sans">
              I FEEL UNSAFE
            </span>
            <span className="text-[11px] font-semibold text-white/90 leading-tight mt-1">
              (TAP AGAIN TO CALL FOR HELP)
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Card */}
      <div className="relative z-10 bg-[#fdfbf7] rounded-t-[2.5rem] px-6 sm:px-8 pt-5 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] flex flex-col space-y-3 max-w-2xl mx-auto w-full">
        {/* Share Journey Action */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "My Waypoint Journey",
                text: `Tracking my journey to ${destination} via Waypoint Secure.`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              alert(`Journey tracking link copied: https://waypoint.secure/j/${journeyId}`);
            }
          }}
          className="w-full py-2.5 text-center text-xs font-bold text-slate-700 hover:text-slate-900 border-b border-slate-200/80 flex items-center justify-center space-x-1.5 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Journey</span>
        </button>

        {/* End Journey (PIN Verification) */}
        <button
          onClick={() => onOpenPinModal(false)}
          className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center active:scale-[0.99] transition"
        >
          <span className="text-sm font-bold text-slate-800">
            I&apos;m Safe / End Journey
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Standard PIN (e.g. 1234)
          </span>
        </button>

        {/* Telemetry Diagnostic Strip & Simulation Triggers */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
            <span className="flex items-center space-x-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Telemetry: {speed} km/h • 140° SE • {gForce}G</span>
            </span>
            <span className="font-semibold text-slate-600">LTE Connected</span>
          </div>

          {/* Quick Simulation Testing Triggers for Demo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSimulateGForceStruggle}
              className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-semibold flex items-center justify-center space-x-1 transition"
            >
              <Zap className="w-3 h-3" />
              <span>Simulate 3.8G Struggle</span>
            </button>
            <button
              onClick={onSimulateSmsFallback}
              className="py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-semibold flex items-center justify-center space-x-1 transition"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Simulate 2G SMS Packet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
