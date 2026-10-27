"use client";

import React from "react";
import { Lock, Unlock, ShieldCheck, Eye, AlertOctagon, Phone, User, CheckCircle2 } from "lucide-react";

interface BoloInspectorProps {
  isRedAlert: boolean;
  boloData?: {
    full_name: string;
    height_cm: number;
    build: string;
    photo_url: string;
  };
  synthesizedAttire?: string;
}

export const BoloInspector: React.FC<BoloInspectorProps> = ({
  isRedAlert,
  boloData,
  synthesizedAttire = "Yellow high-visibility puffer jacket, black athletic tights, white running shoes with reflective pink trim",
}) => {
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  return (
    <section className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Header & POPIA Shield Badge */}
      <div>
        <div className="panel-header" style={{ padding: "10px 16px" }}>
          <div className="panel-title">
            {isRedAlert ? (
              <Unlock size={16} color="var(--amber)" />
            ) : (
              <Lock size={16} color="var(--green)" />
            )}
            <span style={{ fontSize: "11px" }}>
              BOLO &amp; POPIA ZERO-KNOWLEDGE SHIELD
            </span>
          </div>

          <span className={`status-pill ${isRedAlert ? "orange" : "green"}`}>
            {isRedAlert ? "SEC 11(1)(d) UNLOCKED" : "SHIELD ACTIVE"}
          </span>
        </div>

        {/* Biometric Card & Decryption Preview */}
        <div style={{ padding: "16px", background: "var(--panel-2)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            {/* Face Photo Container */}
            <div style={{ width: "110px", height: "130px", border: "1px solid #555750", background: "#0c1012", position: "relative", flexShrink: 0, display: "grid", placeItems: "center" }}>
              {isRedAlert ? (
                <img
                  src={boloData?.photo_url || defaultPhoto}
                  alt="BOLO Citizen"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center" }}>
                  <Lock size={22} color="var(--muted)" />
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginTop: "6px" }}>
                    AES-256-GCM SEALED
                  </span>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "7px", color: "#666", marginTop: "2px" }}>
                    KMS #za-c4-09
                  </span>
                </div>
              )}

              {isRedAlert && (
                <div style={{ position: "absolute", top: "4px", right: "4px", background: "var(--red)", color: "#fff", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", fontWeight: 900, padding: "2px 4px" }}>
                  BOLO
                </div>
              )}
            </div>

            {/* Citizen Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>
                  CITIZEN FULL NAME
                </span>
                <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "14px", fontWeight: 700, color: isRedAlert ? "#fff" : "var(--muted)", margin: "2px 0 0" }}>
                  {isRedAlert ? "Thandiwe Ndlovu" : "[ENCRYPTED - POPIA SHIELD ACTIVE]"}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ border: "1px solid #3c403d", padding: "6px 8px", background: "#101415" }}>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", textTransform: "uppercase" }}>HEIGHT</span>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#eee", margin: "2px 0 0" }}>
                    {isRedAlert ? "165 cm" : "[ENCRYPTED]"}
                  </p>
                </div>
                <div style={{ border: "1px solid #3c403d", padding: "6px 8px", background: "#101415" }}>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--muted)", textTransform: "uppercase" }}>PHYSICAL BUILD</span>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#eee", margin: "2px 0 0" }}>
                    {isRedAlert ? "Slender Athletic" : "[ENCRYPTED]"}
                  </p>
                </div>
              </div>

              {/* Synthesized Live Attire */}
              <div style={{ border: "1px solid #555750", borderLeft: "3px solid var(--amber)", padding: "6px 8px", background: "#101415" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "8px", color: "var(--amber)", textTransform: "uppercase", fontWeight: 700 }}>
                    AI-SYNTHESIZED ATTIRE (NOK RECON)
                  </span>
                  {isRedAlert && <span className="status-pill green" style={{ padding: "1px 4px", fontSize: "7px" }}>LIVE VERIFIED</span>}
                </div>
                <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "#eee", margin: "4px 0 0", lineHeight: 1.4 }}>
                  {isRedAlert
                    ? `"${synthesizedAttire}"`
                    : "[POPIA Shield: Pre-journey outfit blob protected until distress event]"}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Interrogation Status */}
          <div style={{ borderTop: "1px solid #444844", paddingTop: "10px" }}>
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
              NEXT OF KIN ESCALATION CHANNELS
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
              <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff", margin: 0 }}>Zanele (Sister)</p>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", margin: "2px 0 0" }}>+27 82 555 0198</p>
                </div>
                <span className={`status-pill ${isRedAlert ? "green" : "neutral"}`} style={{ fontSize: "8px" }}>
                  {isRedAlert ? "RECON ACTIVE" : "STANDBY"}
                </span>
              </div>

              <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", fontWeight: 700, color: "#fff", margin: 0 }}>Lerato (Friend)</p>
                  <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", margin: "2px 0 0" }}>+27 82 555 0197</p>
                </div>
                <span className="status-pill neutral" style={{ fontSize: "8px" }}>
                  {isRedAlert ? "SMS ALERTED" : "STANDBY"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPIA Legal Clause Banner */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid #444844", background: "var(--panel)", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)" }}>
        ⚖️ <b style={{ color: "#eee" }}>POPIA Section 11(1)(d):</b> Personal identification and biometric photos are decrypted exclusively to save life during confirmed vital emergencies.
      </div>
    </section>
  );
};
