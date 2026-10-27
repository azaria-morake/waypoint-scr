"use client";

import React from "react";
import { Shield, ShieldAlert, Radio, ArrowRight, Lock, CheckCircle2, Award, Crosshair } from "lucide-react";

export interface OrganizationOption {
  orgId: string;
  name: string;
  shortCode: string;
  badge: string;
  role: string;
  officerName: string;
  officerRank: string;
  badgeNumber: string;
  division: string;
  tier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV";
  themeColor: string;
  borderColor: string;
  accentBg: string;
  textColor: string;
  icon: React.ElementType;
  description: string;
  resourcesSummary: string;
}

interface LoginScreenProps {
  onSelectOrg: (org: OrganizationOption) => void;
}

export const ORGANIZATIONS: OrganizationOption[] = [
  {
    orgId: "saps-ekurhuleni-gov-001",
    name: "South African Police Service (SAPS)",
    shortCode: "SAPS FLYING SQUAD",
    badge: "SAPS",
    role: "National Law Enforcement & Armed Tactical Intercept C4i",
    officerName: "Constable Morake",
    officerRank: "Tactical Constable",
    badgeNumber: "SAPS-7491-EKU",
    division: "Ekurhuleni Flying Squad • Sector 2 Rapid Response",
    tier: "TIER_3_GOV",
    themeColor: "var(--amber)",
    borderColor: "var(--amber)",
    accentBg: "rgba(235, 168, 35, 0.1)",
    textColor: "var(--amber)",
    icon: Shield,
    description: "Full statutory SAPS tactical jurisdiction, direct Flying Squad dispatch, POPIA Section 11(1)(d) vital-interest criminal intelligence access.",
    resourcesSummary: "Flying Squad Intercept Units 302 & 308, Air Wing Relay, SAPS Ekurhuleni Radio Mesh",
  },
  {
    orgId: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Fox Tactical Security",
    shortCode: "FOX ARMED RESPONSE",
    badge: "FOX",
    role: "Private Security Control Room & Armed Response Operations",
    officerName: "Ops Commander Ndlovu",
    officerRank: "Tactical Operations Director",
    badgeNumber: "PSIRA-FOX-104",
    division: "Alberton North Armed Reaction & High-Risk Intercept",
    tier: "TIER_2_PRO",
    themeColor: "var(--orange)",
    borderColor: "var(--orange)",
    accentBg: "rgba(230, 104, 27, 0.1)",
    textColor: "var(--orange)",
    icon: ShieldAlert,
    description: "Commercial armed response control room. B2B metered voice AI automation, multi-unit CAD routing, and high-frequency live GPS tracking.",
    resourcesSummary: "Fox Tactical Units 14 & 08 (Armed Reaction), Automated Twilio/WhatsApp Voice CAD Gateway",
  },
  {
    orgId: "cpf-alberton-north-001",
    name: "Alberton North Community Policing Forum (CPF)",
    shortCode: "CPF SECTOR 2",
    badge: "CPF",
    role: "Community Watch & Volunteer Rapid Alert Coordination",
    officerName: "Coordinator Van Zyl",
    officerRank: "Sector 2 Patrol Lead",
    badgeNumber: "CPF-SEC2-022",
    division: "Alberton North Community Safety & First Responder Relay",
    tier: "TIER_1_STARTER",
    themeColor: "var(--teal)",
    borderColor: "var(--teal)",
    accentBg: "rgba(30, 94, 90, 0.1)",
    textColor: "var(--teal)",
    icon: Radio,
    description: "Community first-responder relay, unverified observation ingestion, and neighbourhood alert broadcast.",
    resourcesSummary: "CPF Patrol Unit 04, Volunteer Radio Net, Local WhatsApp Alert Group Integration",
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectOrg }) => {
  return (
    <main className="console">
      {/* Top Header */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Crosshair size={39} strokeWidth={2.5} />
            <span />
          </div>

          <div className="brand-name">
            <h1>BOLO CONSOLE</h1>
            <div>
              TACTICAL AGENCY AUTHENTICATION
              <span className="divider">|</span>
              OPERATOR TERMINAL SELECTOR
            </div>
          </div>
        </div>

        <div className="system-meta">
          <div className="system-status">
            <span />
            TERMINAL STANDBY
          </div>
          <div>OCT 26 2026&nbsp;&nbsp; 22:26</div>
        </div>

        <div className="hackathon">
          FNB AOTY HACKATHON 2026
          <br />
          ARTIFICIAL STAR
        </div>
      </header>

      {/* Main Selection Area */}
      <div className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1100px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span className="status-pill green" style={{ marginBottom: "10px" }}>
              ● MULTI-TENANT C4i ENCLAVE ACTIVE
            </span>
            <h2 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff", margin: "10px 0 4px" }}>
              SELECT OPERATING LAW ENFORCEMENT AGENCY
            </h2>
            <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "13px", color: "var(--muted)", margin: 0 }}>
              Authenticate terminal session credentials for Sector 2 corridor monitoring and armed response dispatch.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {ORGANIZATIONS.map((org) => {
              const Icon = org.icon;

              return (
                <section
                  key={org.orgId}
                  className="panel"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "border-color 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => onSelectOrg(org)}
                >
                  <div className="panel-header" style={{ padding: "12px 16px" }}>
                    <div className="panel-title">
                      <div style={{ width: "30px", height: "30px", border: "1px solid var(--amber)", color: "var(--amber)", display: "grid", placeItems: "center" }}>
                        <Icon size={17} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{org.shortCode}</span>
                    </div>
                    <span className="status-pill orange">{org.tier.replace("_", " ")}</span>
                  </div>

                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--panel-2)", flex: 1 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "17px", fontWeight: 700, color: "#fff" }}>
                        {org.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", color: "var(--muted)", marginTop: "4px", lineHeight: 1.5 }}>
                        {org.role}
                      </div>
                    </div>

                    <div className="metrics" style={{ padding: 0 }}>
                      <div className="metric">
                        <span className="metric-label">ASSIGNED OFFICER</span>
                        <span className="metric-value" style={{ fontSize: "13px" }}>{org.officerName}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">RANK / TITLE</span>
                        <span className="metric-value" style={{ fontSize: "13px", color: "var(--cyan)" }}>{org.officerRank}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">BADGE NUMBER</span>
                        <span className="metric-value" style={{ fontSize: "13px", color: "var(--amber)" }}>{org.badgeNumber}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">DIVISION</span>
                        <span className="metric-value" style={{ fontSize: "12px", color: "#ddd" }}>{org.division}</span>
                      </div>
                    </div>

                    <div style={{ border: "1px solid #3c403d", padding: "12px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
                      <b style={{ color: "#fff" }}>RESOURCES:&nbsp;&nbsp;</b>{org.resourcesSummary}
                    </div>
                  </div>

                  <div style={{ padding: "12px 16px", borderTop: "1px solid #444844", background: "var(--panel)" }}>
                    <button
                      type="button"
                      className="quick"
                      style={{ width: "100%", padding: "10px", fontSize: "13px", fontWeight: 700, borderColor: "var(--orange)", color: "var(--orange)" }}
                    >
                      <span>AUTHENTICATE TERMINAL SESSION</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="console-footer">
        <span>BOLO CONSOLE&nbsp;&nbsp;//&nbsp;&nbsp;OPERATOR AUTHENTICATION</span>
        <span>
          FNB AOTY HACKATHON 2026&nbsp;&nbsp;
          <b>//</b>&nbsp;&nbsp;ARTIFICIAL STAR
        </span>
      </footer>
    </main>
  );
};
