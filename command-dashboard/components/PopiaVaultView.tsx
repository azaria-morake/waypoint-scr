"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Eye,
  AlertOctagon,
  Phone,
  User,
  CheckCircle2,
  FileText,
  Key,
  Shield,
  Clock,
  Fingerprint,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface PopiaVaultViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
  hasActiveCrisis?: boolean;
}

export const PopiaVaultView: React.FC<PopiaVaultViewProps> = ({
  currentOrg,
  isWsConnected,
  hasActiveCrisis = false,
}) => {
  const [isShieldActive, setIsShieldActive] = useState<boolean>(!hasActiveCrisis);
  const [justification, setJustification] = useState<string>("VITAL_INTERESTS_SEC11_1_D");
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "AUD-ZA-9921",
      timestamp: "12 mins ago",
      officer: currentOrg.officerName,
      badge: currentOrg.badgeNumber,
      action: "HSM_ZERO_KNOWLEDGE_PING",
      justification: "Automated Cryptographic Key Rotation",
      hash: "8f4a1c...e3b9",
      status: "VERIFIED",
    },
    {
      id: "AUD-ZA-9918",
      timestamp: "35 mins ago",
      officer: "Ops Commander Ndlovu",
      badge: "FOX-OPS-01",
      action: "SECTOR_RADIUS_CHECK",
      justification: "Spatial Geofence Synchronization",
      hash: "3b2e7d...99fa",
      status: "VERIFIED",
    },
    {
      id: "AUD-ZA-9912",
      timestamp: "1 hour ago",
      officer: "Constable Morake",
      badge: "SAPS-7491-EKU",
      action: "ENCLAVE_POLICY_AUDIT",
      justification: "Statutory Law Enforcement Access Verification",
      hash: "1a8f9c...44d2",
      status: "VERIFIED",
    },
  ]);

  const handleToggleShield = () => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      const nextState = !isShieldActive;
      setIsShieldActive(nextState);

      const nowTime = "Just now";
      const newEntry = {
        id: `AUD-ZA-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: nowTime,
        officer: currentOrg.officerName,
        badge: currentOrg.badgeNumber,
        action: nextState ? "SEAL_ZERO_KNOWLEDGE_VAULT" : "STATUTORY_EMERGENCY_DECRYPT",
        justification: nextState
          ? "Incident Closed — Cryptographic Shield Restored"
          : "Section 11(1)(d) Vital Interests (Imminent Threat to Life)",
        hash: "e4d8a1...71c2",
        status: "VERIFIED",
      };

      setAuditLogs((prev) => [newEntry, ...prev]);
    }, 800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "4px" }}>
      {/* Top Banner Strip */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Shield size={18} />
            <span>POPIA ZERO-KNOWLEDGE CRYPTOGRAPHIC VAULT</span>
          </div>
          <span className={`status-pill ${isShieldActive ? "green" : "red"}`}>
            {isShieldActive ? "● SHIELD SEALED (ENCRYPTED)" : "⚠️ EMERGENCY DECRYPTED"}
          </span>
        </div>

        <div style={{ padding: "16px 20px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              Protection of Personal Information Act (POPIA No. 4 of 2013)
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
              Statutory Enclave: Section 11(1)(d) Vital Interests &amp; Section 12 Identity Masking
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--cyan)" }}>
            HARDWARE HSM: NITRO ENCLAVE&nbsp;&nbsp;|&nbsp;&nbsp;CIPHER: AES-256-GCM
          </div>
        </div>
      </section>

      {/* Grid: Decryption Override & Masked Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "14px" }}>
        {/* Left Column: Decryption Controller */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Key size={16} />
              <span>STATUTORY OVERRIDE CONTROLLER</span>
            </div>
            <span className="status-pill orange">OFFICER AUTHORIZATION</span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--panel-2)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
              Citizen identities and biometric tracking vectors remain cryptographically scrambled until a verified Code Red distress trigger or statutory statutory warrant occurs.
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "10px 12px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
              <span style={{ fontSize: "8px", color: "var(--muted)", textTransform: "uppercase" }}>LEGAL JUSTIFICATION GROUND:</span>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--amber)", marginTop: "2px" }}>
                Section 11(1)(d) — Vital Interests (Imminent Threat to Life)
              </div>
              <div style={{ fontSize: "8px", color: "var(--muted)", marginTop: "2px" }}>
                Authorized Operator: {currentOrg.officerName} ({currentOrg.badgeNumber})
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleShield}
              disabled={isDecrypting}
              className={`quick ${isShieldActive ? "danger" : ""}`}
              style={{ width: "100%", padding: "12px", fontSize: "10px" }}
            >
              {isDecrypting ? (
                <span>ROTATING CRYPTOGRAPHIC KEYS...</span>
              ) : isShieldActive ? (
                <>
                  <Unlock size={14} />
                  <span>EMERGENCY DECRYPT (VITAL INTERESTS ESCALATION)</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>RE-SEAL ZERO-KNOWLEDGE SHIELD</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Masked Citizen PII Preview */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Eye size={16} />
              <span>MASKED CITIZEN PII PREVIEW</span>
            </div>
            <span className={`status-pill ${isShieldActive ? "green" : "red"}`}>
              {isShieldActive ? "ZERO-KNOWLEDGE" : "PLAIN TEXT EXPOSED"}
            </span>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", background: "var(--panel-2)", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>CITIZEN FULL NAME:</span>
              <b style={{ color: isShieldActive ? "var(--muted)" : "#fff" }}>
                {isShieldActive ? "TH****** ND****" : "Thandiwe Ndlovu"}
              </b>
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>NATIONAL ID NUMBER:</span>
              <b style={{ color: isShieldActive ? "var(--muted)" : "var(--cyan)" }}>
                {isShieldActive ? "960412 **** 084" : "960412 0184 084"}
              </b>
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>PHONE MSISDN:</span>
              <b style={{ color: isShieldActive ? "var(--muted)" : "var(--amber)" }}>
                {isShieldActive ? "+27 82 *** 0198" : "+27 82 555 0198"}
              </b>
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>DESTINATION ADDRESS:</span>
              <b style={{ color: isShieldActive ? "var(--muted)" : "#fff" }}>
                {isShieldActive ? "Sa****** Ci** M***" : "Sandton City Mall, Sandton"}
              </b>
            </div>
          </div>
        </section>
      </div>

      {/* Section 3: Immutable POPIA Audit Ledger */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <FileText size={16} />
            <span>IMMUTABLE STATUTORY ACCESS AUDIT TRAIL</span>
          </div>
          <span className="status-pill green">HASH VERIFIED</span>
        </div>

        <div style={{ padding: "8px 14px", overflowX: "auto", background: "var(--panel-2)" }}>
          <table className="w-full text-left font-mono text-xs" style={{ minWidth: "680px" }}>
            <thead>
              <tr style={{ color: "var(--muted)", borderBottom: "1px solid #444844", fontSize: "9px" }}>
                <th style={{ padding: "8px 4px" }}>AUDIT ID</th>
                <th style={{ padding: "8px 4px" }}>TIMESTAMP</th>
                <th style={{ padding: "8px 4px" }}>OPERATOR</th>
                <th style={{ padding: "8px 4px" }}>ACTION</th>
                <th style={{ padding: "8px 4px" }}>JUSTIFICATION</th>
                <th style={{ padding: "8px 4px" }}>HASH</th>
                <th style={{ padding: "8px 4px", textAlign: "right" }}>STATUS</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "10px", color: "#ddd" }}>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #282c2a" }}>
                  <td style={{ padding: "8px 4px", color: "var(--amber)", fontWeight: 700 }}>{log.id}</td>
                  <td style={{ padding: "8px 4px", color: "var(--muted)" }}>{log.timestamp}</td>
                  <td style={{ padding: "8px 4px" }}>{log.officer}</td>
                  <td style={{ padding: "8px 4px", color: "var(--cyan)" }}>{log.action}</td>
                  <td style={{ padding: "8px 4px", color: "#ccc" }}>{log.justification}</td>
                  <td style={{ padding: "8px 4px", color: "var(--muted)", fontFamily: "monospace" }}>{log.hash}</td>
                  <td style={{ padding: "8px 4px", textAlign: "right" }}>
                    <span className="status-pill green" style={{ padding: "1px 5px", fontSize: "7px" }}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
