"use client";

import React from "react";
import {
  Shield,
  Activity,
  Car,
  Radio,
  Lock,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Server,
  Zap,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface ActivityItem {
  id: string;
  timestamp: string;
  type: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
  title: string;
  description: string;
}

interface StationOverviewViewProps {
  currentOrg: OrganizationOption;
  recentActivities: ActivityItem[];
  isWsConnected: boolean;
  onNavigateToMap: () => void;
}

export const StationOverviewView: React.FC<StationOverviewViewProps> = ({
  currentOrg,
  recentActivities,
  isWsConnected,
  onNavigateToMap,
}) => {
  const OrgIcon = currentOrg.icon;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "4px" }}>
      {/* Top Banner Strip */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <OrgIcon size={18} />
            <span>{currentOrg.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="status-pill green">
              {isWsConnected ? "● LIVE C4i STREAM" : "OFFLINE"}
            </span>
            <button
              type="button"
              onClick={onNavigateToMap}
              className="quick"
              style={{ padding: "6px 14px", fontSize: "9px" }}
            >
              <Radio size={14} />
              OPEN LIVE TACTICAL MAP
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", background: "var(--panel)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                display: "grid",
                placeItems: "center",
                border: "1.5px solid var(--amber)",
                background: "#18140e",
                color: "var(--amber)",
              }}
            >
              <OrgIcon size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  {currentOrg.shortCode}
                </span>
                <span className="status-pill orange">{currentOrg.tier.replace("_", " ")}</span>
              </div>
              <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                Sector Division:&nbsp;&nbsp;<b style={{ color: "#eee" }}>{currentOrg.division}</b>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
            <div style={{ borderLeft: "1px solid #444844", paddingLeft: "14px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>TERMINAL SESSION</span>
              <b style={{ color: "var(--cyan)" }}>C4I-TERM-EKU-09</b>
            </div>
            <div style={{ borderLeft: "1px solid #444844", paddingLeft: "14px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>SECTOR STATUS</span>
              <b style={{ color: "var(--green)" }}>STANDBY / GREEN</b>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Officer Profile & Station Tactical Resources */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "14px" }}>
        {/* Left Column: Officer Profile */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <UserCheck size={16} />
              <span>OFFICER &amp; AGENT DOSSIER</span>
            </div>
            <span className="status-pill green">ACTIVE ON DUTY</span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--panel-2)" }}>
            <div style={{ border: "1px solid #454944", padding: "12px 14px", background: "#101415", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)" }}>ASSIGNED OPERATOR</span>
                <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                  {currentOrg.officerName}
                </div>
                <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--cyan)", fontWeight: 600 }}>
                  {currentOrg.officerRank}
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                <span style={{ fontSize: "8px", color: "var(--muted)" }}>BADGE / PSIRA</span>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--amber)", marginTop: "2px" }}>
                  {currentOrg.badgeNumber}
                </div>
              </div>
            </div>

            <div className="metrics" style={{ padding: 0 }}>
              <div className="metric">
                <span className="metric-label">SHIFT DURATION</span>
                <span className="metric-value" style={{ fontSize: "11px" }}>06:00 – 18:00 SAST</span>
              </div>
              <div className="metric">
                <span className="metric-label">RADIO CHANNEL</span>
                <span className="metric-value" style={{ fontSize: "11px", color: "var(--amber)" }}>CH-04 (464.550 MHz)</span>
              </div>
              <div className="metric">
                <span className="metric-label">OPERATIONAL DIVISION</span>
                <span className="metric-value" style={{ fontSize: "10px", color: "#ddd" }}>{currentOrg.division}</span>
              </div>
              <div className="metric">
                <span className="metric-label">STATUTORY INTERCEPT</span>
                <span className="metric-value" style={{ fontSize: "10px", color: "var(--green)" }}>Level 3 Armed Authorized</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Station Resources & Fleet */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Car size={16} />
              <span>TACTICAL FLEET ASSETS</span>
            </div>
            <span className="status-pill neutral">4 / 4 ACTIVE</span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--panel-2)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ border: "1px solid #454944", padding: "10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>Fox Tactical Unit 14</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "2px" }}>Armed • 2 Officers</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--cyan)", marginTop: "4px" }}>Patrolling N12 Corridor</div>
                </div>
                <span className="status-pill green" style={{ height: "fit-content", padding: "2px 6px" }}>ONLINE</span>
              </div>

              <div style={{ border: "1px solid #454944", padding: "10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>Fox Tactical Unit 08</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "2px" }}>Armed • 2 Officers</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--cyan)", marginTop: "4px" }}>Patrolling Ring Rd East</div>
                </div>
                <span className="status-pill green" style={{ height: "fit-content", padding: "2px 6px" }}>ONLINE</span>
              </div>

              <div style={{ border: "1px solid #454944", padding: "10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>SAPS Flying Squad 302</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "2px" }}>Intercept • 2 Officers</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--amber)", marginTop: "4px" }}>Standby Reading Interchange</div>
                </div>
                <span className="status-pill blue" style={{ height: "fit-content", padding: "2px 6px" }}>STANDBY</span>
              </div>

              <div style={{ border: "1px solid #454944", padding: "10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff" }}>Alberton CPF Unit 04</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "2px" }}>Volunteer Patrol</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--cyan)", marginTop: "4px" }}>Patrolling 8th Avenue</div>
                </div>
                <span className="status-pill green" style={{ height: "fit-content", padding: "2px 6px" }}>ONLINE</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "4px" }}>
              <div style={{ border: "1px solid #3c403d", padding: "8px", textAlign: "center", background: "#0d1112" }}>
                <Lock size={14} style={{ margin: "0 auto", color: "var(--green)" }} />
                <span style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "4px" }}>POPIA VAULT</span>
                <b style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "#fff" }}>HSM Sealed</b>
              </div>
              <div style={{ border: "1px solid #3c403d", padding: "8px", textAlign: "center", background: "#0d1112" }}>
                <Cpu size={14} style={{ margin: "0 auto", color: "var(--cyan)" }} />
                <span style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "4px" }}>THE WAY SWARM</span>
                <b style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "#fff" }}>Gemini 3 Hub</b>
              </div>
              <div style={{ border: "1px solid #3c403d", padding: "8px", textAlign: "center", background: "#0d1112" }}>
                <Radio size={14} style={{ margin: "0 auto", color: "var(--amber)" }} />
                <span style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", marginTop: "4px" }}>RADIO MESH</span>
                <b style={{ display: "block", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "#fff" }}>Repeater 99%</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: Recent Operational Activities Ledger */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Activity size={16} />
            <span>OPERATIONAL ACTIVITIES LEDGER</span>
          </div>
          <span className="status-pill green">REAL-TIME STATION LEDGER</span>
        </div>

        <div className="incident-feed" style={{ maxHeight: "300px", overflowY: "auto" }}>
          {recentActivities.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)" }}>
              No recent alerts or distress incidents recorded in this session. The sector is at rest.
            </div>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="feed-item">
                <div className="feed-top">
                  <span className={`severity ${act.type === "ALERT" ? "high" : act.type === "WARNING" ? "med" : "low"}`}>
                    {act.type}
                  </span>
                  <strong>{act.title}</strong>
                  <time>{act.timestamp}</time>
                </div>
                <p style={{ margin: "4px 0 0 78px" }}>{act.description}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
