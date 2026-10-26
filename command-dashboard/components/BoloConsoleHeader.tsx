"use client";

import React, { useState, useEffect } from "react";
import { NotificationTray, NotificationItem } from "./NotificationTray";

interface BoloConsoleHeaderProps {
  notifications?: NotificationItem[];
  onOpenBoloYoung?: () => void;
  onClearNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  isWsConnected?: boolean;
}

export const BoloConsoleHeader: React.FC<BoloConsoleHeaderProps> = ({
  notifications = [],
  onOpenBoloYoung = () => {},
  onClearNotification = () => {},
  onClearAllNotifications = () => {},
  isWsConnected = true,
}) => {
  const [timeStr, setTimeStr] = useState<string>("OCT 27 2026  00:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const m = months[now.getMonth()];
      const d = String(now.getDate()).padStart(2, "0");
      const y = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${m} ${d} ${y}  ${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#eae5dc] border-b border-[#d2ccc0] px-5 py-2.5 flex items-center justify-between text-stone-900 select-none z-30 shadow-sm flex-shrink-0">
      {/* Left: Reticle Logo & Industrial Title */}
      <div className="flex items-center space-x-3.5">
        {/* Reticle Target Icon */}
        <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center relative shadow-sm flex-shrink-0 overflow-hidden">
          <div className="absolute inset-1 rounded-full border border-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm animate-pulse" />
          <div className="absolute w-full h-[1.5px] bg-amber-500/80" />
          <div className="absolute h-full w-[1.5px] bg-amber-500/80" />
        </div>

        {/* Title & Stencil Monospace Tagline */}
        <div className="flex items-baseline space-x-3.5">
          <h1 className="font-sans font-black tracking-wider text-xl sm:text-2xl text-stone-950 uppercase leading-none">
            BOLO CONSOLE
          </h1>
          <div className="hidden md:flex flex-col text-[10px] font-mono font-bold text-stone-600 uppercase tracking-widest pl-3.5 border-l border-stone-400 leading-tight">
            <span>TACTICAL AI GUARDIAN</span>
            <span className="text-stone-500">SECTOR 2 CORRIDOR WATCHDOG</span>
          </div>
        </div>
      </div>

      {/* Right: Status, Clock, Event & Notification Tray */}
      <div className="flex items-center space-x-4">
        {/* System Online Status */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-[2px] bg-emerald-600 inline-block shadow-sm" />
          <div className="text-left font-mono leading-tight">
            <span className="font-black text-[10px] sm:text-[11px] text-stone-900 tracking-wider block">
              {isWsConnected ? "SYSTEM ONLINE" : "CONNECTING..."}
            </span>
            <span className="text-[10px] font-bold text-stone-600 tracking-wider block">
              {timeStr}
            </span>
          </div>
        </div>

        {/* Divider */}
        <span className="h-6 w-[1px] bg-stone-400 hidden sm:block" />

        {/* Hackathon Event Attribution */}
        <div className="hidden lg:flex flex-col text-right font-mono text-[10px] font-bold text-stone-800 tracking-wider leading-tight">
          <span>FNB AOTY HACKATHON 2026</span>
          <span className="text-stone-600">ARTIFICIAL STAR</span>
        </div>

        {/* Retain Existing Notification Tray */}
        <div className="pl-1">
          <NotificationTray
            notifications={notifications}
            onOpenBoloYoung={onOpenBoloYoung}
            onClearNotification={onClearNotification}
            onClearAll={onClearAllNotifications}
          />
        </div>
      </div>
    </header>
  );
};
