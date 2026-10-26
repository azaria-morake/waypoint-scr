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
  const [timeStr, setTimeStr] = useState<string>("OCT 26 2026  22:26");

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
    <header className="w-full bg-[#eae5dc] border-b border-[#cfc8bc] px-5 py-2 flex items-center justify-between text-black select-none z-30 flex-shrink-0 shadow-sm">
      {/* Left: Tactical Reticle Logo + Title */}
      <div className="flex items-center space-x-3.5">
        {/* Exact Reticle Target SVG from Mockup */}
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
            {/* Outer ring */}
            <circle cx="18" cy="18" r="14" stroke="#111" strokeWidth="2.5" />
            {/* Inner ring */}
            <circle cx="18" cy="18" r="9" stroke="#111" strokeWidth="1.8" />
            {/* Tick marks */}
            <line x1="18" y1="1" x2="18" y2="35" stroke="#111" strokeWidth="2.2" />
            <line x1="1" y1="18" x2="35" y2="18" stroke="#111" strokeWidth="2.2" />
            {/* Center red glowing dot */}
            <circle cx="18" cy="18" r="4.2" fill="#dc2626" />
            <circle cx="18" cy="18" r="1.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Title & Stencil Monospace Tagline */}
        <div className="flex items-center space-x-3.5">
          <h1 className="font-sans font-black tracking-[0.14em] text-2xl text-black uppercase leading-none">
            BOLO CONSOLE
          </h1>
          <div className="hidden md:flex flex-col text-[10px] font-mono font-bold text-black uppercase tracking-wider pl-3.5 border-l border-neutral-400 leading-tight">
            <span>TACTICAL AI GUARDIAN</span>
            <span className="text-neutral-700">SECTOR 2 CORRIDOR WATCHDOG</span>
          </div>
        </div>
      </div>

      {/* Right: Status, Clock, Event & Notification Tray */}
      <div className="flex items-center space-x-4">
        {/* System Online Status */}
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#14b8a6] inline-block shadow-sm" />
          <div className="text-left font-mono leading-tight">
            <span className="font-black text-[10px] sm:text-[11px] text-black tracking-wider block">
              {isWsConnected ? "SYSTEM ONLINE" : "CONNECTING..."}
            </span>
            <span className="text-[10px] font-bold text-neutral-800 tracking-wider block">
              {timeStr}
            </span>
          </div>
        </div>

        {/* Divider */}
        <span className="h-6 w-[1.5px] bg-neutral-400 hidden sm:block" />

        {/* Hackathon Event Attribution */}
        <div className="hidden lg:flex flex-col text-right font-mono text-[10px] font-bold text-black tracking-wider leading-tight">
          <span>FNB AOTY HACKATHON 2026</span>
          <span className="text-neutral-800">ARTIFICIAL STAR</span>
        </div>

        {/* Existing Notification Tray */}
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
