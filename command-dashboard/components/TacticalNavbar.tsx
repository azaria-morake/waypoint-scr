"use client";

import React from "react";
import { Shield, ShieldAlert, Radio, Server, RefreshCw, Zap, MessageSquare, AlertTriangle } from "lucide-react";

interface TacticalNavbarProps {
  currentTier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV";
  currentOrgName: string;
  onTierChange: (tier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV") => void;
  isWsConnected: boolean;
  onTriggerSos: () => void;
  onTriggerDuress: () => void;
  onTriggerGForce: () => void;
  onTriggerSms: () => void;
  onReset: () => void;
}

export const TacticalNavbar: React.FC<TacticalNavbarProps> = ({
  currentTier,
  currentOrgName,
  onTierChange,
  isWsConnected,
  onTriggerSos,
  onTriggerDuress,
  onTriggerGForce,
  onTriggerSms,
  onReset,
}) => {
  return (
    <header className="topbar">
      {/* Brand & Control Room Badge */}
      <div className="brand">
        <div className="brand-mark">
          <Shield size={28} />
          <span />
        </div>
        <div className="brand-name">
          <h1>WAYPOINT SECURE</h1>
          <div>
            TACTICAL C4i
            <span className="divider">|</span>
            {currentOrgName}
          </div>
        </div>
      </div>

      {/* Tenant Context / Subscription Tier Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", borderLeft: "2px solid var(--ink)", paddingLeft: "18px" }}>
        <button
          type="button"
          onClick={() => onTierChange("TIER_1_STARTER")}
          className="quick"
          style={{
            padding: "4px 8px",
            fontSize: "9px",
            borderColor: currentTier === "TIER_1_STARTER" ? "var(--teal)" : "#555750",
            color: currentTier === "TIER_1_STARTER" ? "var(--teal)" : "var(--muted)",
          }}
        >
          TIER 1: CPF
        </button>
        <button
          type="button"
          onClick={() => onTierChange("TIER_2_PRO")}
          className="quick"
          style={{
            padding: "4px 8px",
            fontSize: "9px",
            borderColor: currentTier === "TIER_2_PRO" ? "var(--orange)" : "#555750",
            color: currentTier === "TIER_2_PRO" ? "var(--orange)" : "var(--muted)",
          }}
        >
          TIER 2: FOX
        </button>
        <button
          type="button"
          onClick={() => onTierChange("TIER_3_GOV")}
          className="quick"
          style={{
            padding: "4px 8px",
            fontSize: "9px",
            borderColor: currentTier === "TIER_3_GOV" ? "var(--amber)" : "#555750",
            color: currentTier === "TIER_3_GOV" ? "var(--amber)" : "var(--muted)",
          }}
        >
          TIER 3: SAPS
        </button>
      </div>

      {/* Emergency Simulation Bar & System Health */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            type="button"
            onClick={onTriggerSos}
            className="quick danger"
            style={{ padding: "4px 8px", fontSize: "9px" }}
          >
            SOS
          </button>
          <button
            type="button"
            onClick={onTriggerDuress}
            className="quick"
            style={{ padding: "4px 8px", fontSize: "9px", borderColor: "var(--orange)", color: "var(--orange)" }}
          >
            DURESS
          </button>
          <button
            type="button"
            onClick={onTriggerGForce}
            className="quick"
            style={{ padding: "4px 8px", fontSize: "9px", borderColor: "var(--amber)", color: "var(--amber)" }}
          >
            3.8G
          </button>
          <button
            type="button"
            onClick={onReset}
            className="quick"
            style={{ padding: "4px 6px", fontSize: "9px" }}
            title="Reset to Normal"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        <div className="system-meta" style={{ margin: 0, paddingLeft: "16px" }}>
          <div className="system-status">
            <span />
            {isWsConnected ? "ONLINE" : "STANDBY"}
          </div>
        </div>
      </div>
    </header>
  );
};
