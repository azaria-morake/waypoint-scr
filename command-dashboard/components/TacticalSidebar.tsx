"use client";

import React from "react";
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  ShieldCheck,
  Zap,
  LogOut,
  Radio,
  Shield,
  ChevronRight,
  Layers,
  Bot,
  ExternalLink,
  Bell,
  MessageSquare,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";
import { NotificationTray, NotificationItem } from "./NotificationTray";

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
  notifications = [],
  onClearNotification = () => {},
  onClearAllNotifications = () => {},
}) => {
  const OrgIcon = currentOrg.icon;

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none h-screen flex-shrink-0 z-30">
      {/* Top Branding, Active Profile & Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header with Global Notification Tray */}
        <div className="p-4 px-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-black text-white uppercase tracking-wider font-sans">
                Waypoint Secure
              </h1>
              <div className="flex items-center space-x-1.5 text-[9px] text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isWsConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                <span>{isWsConnected ? "C4i Mesh Online" : "Connecting..."}</span>
              </div>
            </div>
          </div>

          {/* Global Notification Tray (Visible on Every Screen) */}
          <NotificationTray
            notifications={notifications}
            onOpenBoloYoung={() => onTabChange("BOLO_YOUNG")}
            onClearNotification={onClearNotification}
            onClearAll={onClearAllNotifications}
          />
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Officer / Terminal Profile Card */}
          <div className="p-3.5 mx-3 my-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentOrg.themeColor} flex items-center justify-center text-white shadow`}>
                <OrgIcon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {currentOrg.officerName}
                </div>
                <div className="text-[11px] text-cyan-400 font-medium truncate">
                  {currentOrg.officerRank}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {currentOrg.badgeNumber}
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 truncate max-w-[130px] font-medium text-[10px]">
                {currentOrg.name}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20 font-mono">
                ONLINE
              </span>
            </div>
          </div>

          {/* Side Menu Navigation */}
          <div className="px-3 space-y-1">
            {/* SECTION 1: Tactical Control */}
            <div className="px-3 pt-2 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Operational C4i
            </div>

            {/* 1. Station Overview (Default at rest) */}
            <button
              type="button"
              onClick={() => onTabChange("OVERVIEW")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "OVERVIEW"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Station Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 2. Live Tactical GIS Map */}
            <button
              type="button"
              onClick={() => onTabChange("LIVE_MAP")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "LIVE_MAP"
                  ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span>Live Tactical Map</span>
              </div>
              <div className="flex items-center space-x-1">
                {activeAlertCount > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {activeAlertCount}
                  </span>
                ) : (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === "LIVE_MAP" ? "bg-slate-900/40 text-slate-900 font-bold" : "bg-slate-800 text-slate-400"}`}>
                    RADAR
                  </span>
                )}
              </div>
            </button>

            {/* 3. BOLO Young AI Tactical Co-Pilot Console */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onTabChange("BOLO_YOUNG")}
                className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === "BOLO_YOUNG"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold"
                    : activeAlertCount > 0
                    ? "bg-red-950/80 border border-red-500/80 text-white shadow-lg shadow-red-950/50"
                    : hasActiveJourney
                    ? "bg-emerald-950/80 border border-emerald-500/70 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <Bot className={`w-4 h-4 ${
                      activeTab === "BOLO_YOUNG" 
                        ? "text-slate-950" 
                        : activeAlertCount > 0 
                        ? "text-red-400" 
                        : hasActiveJourney 
                        ? "text-emerald-400" 
                        : "text-amber-400"
                    }`} />
                    {/* Glowing ping indicator on icon */}
                    {activeAlertCount > 0 ? (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    ) : hasActiveJourney ? (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    ) : null}
                  </div>
                  <span>BOLO Young AI</span>
                </div>

                {/* Status Indicator / Notification Icon Badge */}
                <div className="flex items-center space-x-1.5">
                  {activeAlertCount > 0 ? (
                    <span className="bg-red-600 text-white text-[9px] font-mono px-2 py-0.5 rounded-md font-black flex items-center space-x-1 shadow-md animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>🚨 RED ALERT</span>
                    </span>
                  ) : hasActiveJourney ? (
                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-mono px-2 py-0.5 rounded-md font-black flex items-center space-x-1 shadow-md shadow-emerald-500/20 animate-pulse">
                      <Bell className="w-3 h-3 text-slate-950 fill-slate-950 animate-bounce" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      activeTab === "BOLO_YOUNG" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-amber-300"
                    }`}>
                      WATCHING
                    </span>
                  )}
                </div>
              </button>

              {/* Quick Popout Window Button */}
              <button
                type="button"
                onClick={() => window.open("/bolo-young", "BoloYoungC4iConsole", "width=1280,height=820")}
                title="Open BOLO Young in popout window"
                className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          {/* SECTION 2: Intelligence & Swarm */}
          <div className="px-3 pt-3.5 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
            AI Swarm &amp; Legal Shield
          </div>

          {/* 3. The Way Swarm AI Matrix */}
          <button
            type="button"
            onClick={() => onTabChange("SWARM_MATRIX")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "SWARM_MATRIX"
                ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Cpu className="w-4 h-4" />
              <span>The Way Swarm AI</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === "SWARM_MATRIX" ? "bg-slate-900/40 text-slate-900 font-bold" : "bg-slate-800 text-cyan-300"}`}>
              4 AGENTS
            </span>
          </button>

          {/* 4. POPIA Section 11 Vault */}
          <button
            type="button"
            onClick={() => onTabChange("POPIA_VAULT")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "POPIA_VAULT"
                ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4" />
              <span>POPIA Section 11 Vault</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === "POPIA_VAULT" ? "bg-slate-900/40 text-slate-900 font-bold" : "bg-slate-800 text-emerald-300"}`}>
              KMS LOCK
            </span>
          </button>

          {/* SECTION 3: Fleet & Automations */}
          <div className="px-3 pt-3.5 pb-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
            Commercial Fleet Ops
          </div>

          {/* 5. B2B Operations Runner */}
          <button
            type="button"
            onClick={() => onTabChange("B2B_OPS")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "B2B_OPS"
                ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-4 h-4" />
              <span>B2B Operations Runner</span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${activeTab === "B2B_OPS" ? "bg-slate-900/40 text-slate-900 font-bold" : "bg-slate-800 text-amber-300"}`}>
              AUTO
            </span>
          </button>
        </div>
      </div>
    </div>

      {/* Bottom Switch Organization / Logout & System Status */}
      <div className="p-4 border-t border-slate-800 flex flex-col space-y-2.5">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Switch Agency / Station</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
          <span>TERMINAL: C4I-EKU-09</span>
          <span>v2.4-AOTY</span>
        </div>
      </div>
    </aside>
  );
};
