"use client";

import React from "react";
import {
  Compass,
  MapPin,
  Bell,
  Network,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  Radio,
  ExternalLink,
  Bot,
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
  hasActiveJourney = false,
}) => {
  const OrgIcon = currentOrg.icon;

  const incidentCount = activeAlertCount > 0 ? activeAlertCount : 3;

  return (
    <aside className="w-60 bg-[#0d0f14] border-r border-[#222733] flex flex-col justify-between select-none h-full flex-shrink-0 z-20">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Officer / Terminal Profile Strip */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-[#141822] border border-[#232938]">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentOrg.themeColor} flex items-center justify-center text-white shadow flex-shrink-0`}>
              <OrgIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentOrg.officerName}
              </div>
              <div className="text-[10px] text-amber-400 font-mono font-semibold truncate">
                {currentOrg.officerRank}
              </div>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#232938] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="truncate">{currentOrg.name}</span>
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        </div>

        {/* Sidebar Navigation Items Styled Exactly as Attached Mockup */}
        <nav className="px-3 pt-3 space-y-1 overflow-y-auto flex-1">
          {/* 1. CONSOLE */}
          <button
            type="button"
            onClick={() => onTabChange("OVERVIEW")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "OVERVIEW"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Compass className={`w-4 h-4 ${activeTab === "OVERVIEW" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>CONSOLE</span>
            </div>
          </button>

          {/* 2. LIVE MAP */}
          <button
            type="button"
            onClick={() => onTabChange("LIVE_MAP")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "LIVE_MAP"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <MapPin className={`w-4 h-4 ${activeTab === "LIVE_MAP" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>LIVE MAP</span>
            </div>
          </button>

          {/* 3. INCIDENTS (with red pill count) */}
          <button
            type="button"
            onClick={() => onTabChange("BOLO_YOUNG")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "BOLO_YOUNG"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Bell className={`w-4 h-4 ${activeTab === "BOLO_YOUNG" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>INCIDENTS</span>
            </div>
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {incidentCount}
            </span>
          </button>

          {/* 4. AGENTS */}
          <button
            type="button"
            onClick={() => onTabChange("SWARM_MATRIX")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "SWARM_MATRIX"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Network className={`w-4 h-4 ${activeTab === "SWARM_MATRIX" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>AGENTS</span>
            </div>
          </button>

          {/* 5. JOURNEYS */}
          <button
            type="button"
            onClick={() => onTabChange("B2B_OPS")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "B2B_OPS"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className={`w-4 h-4 ${activeTab === "B2B_OPS" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>JOURNEYS</span>
            </div>
          </button>

          {/* 6. ANALYTICS */}
          <button
            type="button"
            onClick={() => onTabChange("OVERVIEW")}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>ANALYTICS</span>
            </div>
          </button>

          {/* 7. SETTINGS / POPIA VAULT */}
          <button
            type="button"
            onClick={() => onTabChange("POPIA_VAULT")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider transition cursor-pointer ${
              activeTab === "POPIA_VAULT"
                ? "bg-[#221c13] text-[#f59e0b] border border-[#f59e0b]/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className={`w-4 h-4 ${activeTab === "POPIA_VAULT" ? "text-[#f59e0b]" : "text-slate-400"}`} />
              <span>SETTINGS</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Status Boxes Matching Mockup */}
      <div className="p-3 space-y-2 border-t border-[#222733] flex-shrink-0">
        {/* Box 1: Waypoint Secure / Citizen App Online */}
        <div className="bg-[#12151c] border border-[#252b38] rounded-xl p-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">
              WAYPOINT SECURE
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5 pl-4">
            CITIZEN APP ONLINE
          </p>
        </div>

        {/* Box 2: Safer Communities. Stronger Together. */}
        <div className="bg-[#12151c] border border-[#252b38] rounded-xl p-2.5">
          <div className="text-[9px] font-black text-slate-300 tracking-wider font-mono uppercase leading-tight">
            SAFER COMMUNITIES.<br />
            STRONGER TOGETHER.
          </div>
          <div className="w-10 h-0.5 bg-[#f59e0b] rounded mt-2" />
        </div>

        {/* Agency Switcher / Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-black/40 hover:bg-white/5 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold transition cursor-pointer"
        >
          <LogOut className="w-3 h-3 text-slate-500" />
          <span>SWITCH AGENCY</span>
        </button>
      </div>
    </aside>
  );
};
