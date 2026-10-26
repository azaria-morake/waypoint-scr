"use client";

import React from "react";
import {
  Map,
  Bell,
  ShieldCheck,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";
import { NotificationItem } from "./NotificationTray";

export type NavTab = "OVERVIEW" | "LIVE_MAP" | "BOLO_YOUNG" | "SWARM_MATRIX" | "POPIA_VAULT" | "B2B_OPS";

interface TacticalSidebarProps {
  currentOrg: OrganizationOption;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogout: () => void;
  isWsConnected: boolean;
  activeAlertCount?: number;
  hasActiveJourney?: boolean;
  notifications?: NotificationItem[];
  onClearNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
}

export const TacticalSidebar: React.FC<TacticalSidebarProps> = ({
  currentOrg,
  activeTab,
  onTabChange,
  onLogout,
  isWsConnected,
  activeAlertCount = 0,
}) => {
  const incidentCount = activeAlertCount > 0 ? activeAlertCount : 3;

  return (
    <aside className="w-52 bg-[#0c0d12] border-r border-[#1e222d] flex flex-col justify-between select-none h-full flex-shrink-0 z-20">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-2">
        {/* Navigation Items Matching Reference Mockup */}
        <nav className="px-2 space-y-1.5 overflow-y-auto flex-1">
          {/* 1. CONSOLE */}
          <button
            type="button"
            onClick={() => onTabChange("OVERVIEW")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "OVERVIEW"
                ? "bg-[#1f1912] text-amber-500 border border-amber-600/50"
                : "text-amber-500 hover:bg-white/5"
            }`}
          >
            {/* Tactical Reticle Icon */}
            <div className="w-5 h-5 rounded border border-amber-500/80 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full border border-amber-500" />
            </div>
            <span>CONSOLE</span>
          </button>

          {/* 2. LIVE MAP (Active in mockup: Solid Burnt-Orange Fill) */}
          <button
            type="button"
            onClick={() => onTabChange("LIVE_MAP")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "LIVE_MAP"
                ? "bg-[#c25e1a] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Map className="w-4 h-4 flex-shrink-0 text-white" />
            <span>LIVE MAP</span>
          </button>

          {/* 3. INCIDENTS (with Red Pill Badge) */}
          <button
            type="button"
            onClick={() => onTabChange("BOLO_YOUNG")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "BOLO_YOUNG"
                ? "bg-[#c25e1a] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span>INCIDENTS</span>
            </div>
            <span className="bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              {incidentCount}
            </span>
          </button>

          {/* 4. AGENTS */}
          <button
            type="button"
            onClick={() => onTabChange("SWARM_MATRIX")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "SWARM_MATRIX"
                ? "bg-[#c25e1a] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {/* 3-node connected network icon */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2.5" />
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="19" cy="19" r="2.5" />
              <line x1="12" y1="7.5" x2="5" y2="16.5" />
              <line x1="12" y1="7.5" x2="19" y2="16.5" />
            </svg>
            <span>AGENTS</span>
          </button>

          {/* 5. JOURNEYS */}
          <button
            type="button"
            onClick={() => onTabChange("B2B_OPS")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "B2B_OPS"
                ? "bg-[#c25e1a] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>JOURNEYS</span>
          </button>

          {/* 6. ANALYTICS */}
          <button
            type="button"
            onClick={() => onTabChange("OVERVIEW")}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 flex-shrink-0" />
            <span>ANALYTICS</span>
          </button>

          {/* 7. SETTINGS */}
          <button
            type="button"
            onClick={() => onTabChange("POPIA_VAULT")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "POPIA_VAULT"
                ? "bg-[#c25e1a] text-white shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>SETTINGS</span>
          </button>
        </nav>
      </div>

      {/* Bottom Status Boxes Matching Reference Mockup */}
      <div className="p-2.5 space-y-2 border-t border-[#1e222d] flex-shrink-0">
        {/* Box 1: Waypoint Secure / Citizen App Online */}
        <div className="bg-[#10131a] border border-[#1e2430] rounded p-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">
              WAYPOINT SECURE
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5 pl-4">
            CITIZEN APP ONLINE
          </p>
        </div>

        {/* Box 2: Safer Communities. Stronger Together. */}
        <div className="bg-[#10131a] border border-[#1e2430] rounded p-2.5">
          <div className="text-[9.5px] font-black text-slate-300 tracking-wider font-mono uppercase leading-snug">
            SAFER COMMUNITIES.<br />
            STRONGER TOGETHER.
          </div>
          <div className="w-10 h-0.5 bg-[#f59e0b] rounded mt-2" />
        </div>

        {/* Subtle Switch Agency Trigger */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-1.5 py-1 text-slate-500 hover:text-slate-300 text-[9px] font-mono transition cursor-pointer"
        >
          <LogOut className="w-2.5 h-2.5" />
          <span>Switch Agency ({currentOrg.name})</span>
        </button>
      </div>
    </aside>
  );
};
