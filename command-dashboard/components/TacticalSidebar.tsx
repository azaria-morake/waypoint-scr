"use client";

import React from "react";
import {
  Siren,
  Map,
  AlertTriangle,
  Users,
  Navigation,
  BarChart3,
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

  const navItems: Array<{ icon: any; label: string; tab: NavTab }> = [
    { icon: Map, label: "LIVE MAP", tab: "LIVE_MAP" },
    { icon: AlertTriangle, label: "INCIDENTS", tab: "BOLO_YOUNG" },
    { icon: Users, label: "AGENTS", tab: "SWARM_MATRIX" },
    { icon: Navigation, label: "JOURNEYS", tab: "B2B_OPS" },
    { icon: BarChart3, label: "ANALYTICS", tab: "OVERVIEW" },
    { icon: Settings, label: "SETTINGS", tab: "POPIA_VAULT" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <Siren size={25} />
        <span>CONSOLE</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ icon: Icon, label, tab }) => (
          <button
            key={label}
            type="button"
            className={`nav-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => onTabChange(tab)}
          >
            <Icon size={21} />
            <span>{label}</span>

            {label === "INCIDENTS" && (
              <b className="incident-count">{incidentCount}</b>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="waypoint-card">
        <div className="waypoint-status">
          <span />
          WAYPOINT SECURE
        </div>
        <small>CITIZEN APP ONLINE</small>
      </div>

      <div className="sidebar-motto">
        SAFER COMMUNITIES.
        <br />
        STRONGER TOGETHER.
        <div />
      </div>

      {/* Switch Agency Option */}
      <button
        type="button"
        onClick={onLogout}
        style={{
          marginTop: "14px",
          background: "transparent",
          border: 0,
          color: "#73766f",
          fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
          fontSize: "9px",
          cursor: "pointer",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "4px",
        }}
      >
        <LogOut size={12} />
        <span>Switch Agency ({currentOrg.name})</span>
      </button>
    </aside>
  );
};
