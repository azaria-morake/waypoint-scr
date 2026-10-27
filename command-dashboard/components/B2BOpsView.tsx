"use client";

import React, { useState } from "react";
import {
  Zap,
  PhoneCall,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  PhoneForwarded,
  UserCheck,
  Building,
  Volume2,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface B2BOpsViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
}

export const B2BOpsView: React.FC<B2BOpsViewProps> = ({ currentOrg, isWsConnected }) => {
  const [voiceMinutesUsed, setVoiceMinutesUsed] = useState<number>(184);
  const voiceMinutesLimit = 1000;
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [activeTaskResult, setActiveTaskResult] = useState<{
    category: string;
    target: string;
    status: string;
    action: string;
    details: string;
    latencyMs: number;
    transcript?: Array<{ speaker: string; text: string }>;
  } | null>(null);

  const usagePercent = Math.min(Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100), 100);

  const handleRunTask = (category: string, target: string) => {
    setLoadingTask(category);
    setActiveTaskResult(null);

    setTimeout(() => {
      setLoadingTask(null);
      setVoiceMinutesUsed((prev) => prev + 2);

      if (category === "ALARM_VERIFICATION") {
        setActiveTaskResult({
          category: "Automated Alarm Audio Verification",
          target,
          status: "FALSE ALARM • PREMISES SECURE",
          action: "Outbound Automated Audio Callout & Perimeter Sensor Ingestion",
          details: "Client confirmed domestic worker triggered passive infrared sensor on patio. No armed deployment required.",
          latencyMs: 380,
          transcript: [
            { speaker: "Waypoint AI Dispatch", text: "Fox Tactical Automated Alert for Stand 104 Meyersdal. A perimeter trip was detected at 19:14. Please confirm safety." },
            { speaker: "Sipho Mthembu (Client)", text: "Hi, all good! Domestic worker opened the patio door before disarming. We are safe." },
            { speaker: "Waypoint AI Dispatch", text: "Acknowledged Mr. Mthembu. Alert cancelled, stand status reset to green." },
          ],
        });
      } else if (category === "CLIENT_WELFARE_CHECK") {
        setActiveTaskResult({
          category: "High-Value VIP Welfare Check",
          target,
          status: "CLIENT CONFIRMED SAFE",
          action: "Scheduled AI Welfare Ping & Dual-PIN Challenge",
          details: "Client safely authenticated identity via voice biometric matching. Device battery: 94%.",
          latencyMs: 420,
          transcript: [
            { speaker: "Waypoint AI Dispatch", text: "Good evening Mrs. Dlamini, this is your scheduled evening waypoint check-in. Is everything secure at your residence?" },
            { speaker: "Mrs. Nomvula Dlamini", text: "Good evening. Yes, gate is locked and we are home safe." },
            { speaker: "Waypoint AI Dispatch", text: "Thank you Mrs. Dlamini. Night patrol Fox-08 will pass your street at 21:00." },
          ],
        });
      } else {
        setActiveTaskResult({
          category: "Guard Patrol Post Check-In",
          target,
          status: "POST MANNED & VERIFIED",
          action: "Dead-Man Radio Ping & GPS NFC Wand Verification",
          details: "Officer Khumalo at Post 3 (Boom Gate) acknowledged dead-man signal in 4.2 seconds.",
          latencyMs: 290,
          transcript: [
            { speaker: "Waypoint C4i Ping", text: "Post 3 dead-man verification ping initiated. Officer confirm status." },
            { speaker: "Guard Khumalo (Post 3)", text: "Post 3 acknowledged. Sector boom secure, zero perimeter breaches." },
            { speaker: "Waypoint C4i Ping", text: "Timestamp logged in control room ledger." },
          ],
        });
      }
    }, 1100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "4px" }}>
      {/* Top Banner Strip */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Zap size={18} />
            <span>COMMERCIAL B2B OPERATIONS RUNNER</span>
          </div>
          <span className="status-pill green">METERED VOICE AI ACTIVE</span>
        </div>

        <div style={{ padding: "16px 20px", background: "var(--panel)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
              Automated Security Control Room Workflows
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
              {currentOrg.name}&nbsp;&nbsp;|&nbsp;&nbsp;Tier:&nbsp;<b style={{ color: "var(--amber)" }}>{currentOrg.tier}</b>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
            <div style={{ borderLeft: "1px solid #444844", paddingLeft: "12px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>VOICE QUOTA</span>
              <b style={{ color: "var(--green)" }}>{voiceMinutesUsed} / {voiceMinutesLimit} MIN</b>
            </div>
            <div style={{ borderLeft: "1px solid #444844", paddingLeft: "12px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>REMAINING</span>
              <b style={{ color: "var(--cyan)" }}>{100 - usagePercent}% BALANCE</b>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Automation Tasks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px" }}>
        {/* Task 1: Perimeter Alarm Verification */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <AlertCircle size={15} />
              <span>ALARM VERIFICATION</span>
            </div>
            <span className="status-pill neutral">2.0 MIN / RUN</span>
          </div>

          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--panel-2)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
              Automated outbound voice callout &amp; property contact on passive infrared beam trip to filter false alarms.
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>TEST STAND:</span>
              <b style={{ color: "#fff" }}>Stand 104 Meyersdal Eco Estate</b>
              <div style={{ color: "var(--amber)", marginTop: "2px" }}>Sipho Mthembu (+27 82 555 0199)</div>
            </div>

            <button
              type="button"
              onClick={() => handleRunTask("ALARM_VERIFICATION", "Stand 104 Meyersdal Eco Estate")}
              disabled={loadingTask !== null}
              className="quick danger"
              style={{ width: "100%", padding: "10px" }}
            >
              {loadingTask === "ALARM_VERIFICATION" ? (
                <span>EXECUTING AUTOMATED CALL...</span>
              ) : (
                <>
                  <PhoneForwarded size={13} />
                  <span>TRIGGER VERIFICATION CALL</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Task 2: High-Value VIP Welfare Check */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <UserCheck size={15} />
              <span>VIP WELFARE CHECK</span>
            </div>
            <span className="status-pill neutral">1.5 MIN / RUN</span>
          </div>

          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--panel-2)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
              Scheduled conversational AI welfare call, dead-man pin challenge &amp; battery integrity check.
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>VIP CLIENT:</span>
              <b style={{ color: "#fff" }}>Stand 42 Bassonia Ridge</b>
              <div style={{ color: "var(--cyan)", marginTop: "2px" }}>Mrs. Nomvula Dlamini (+27 83 444 0211)</div>
            </div>

            <button
              type="button"
              onClick={() => handleRunTask("CLIENT_WELFARE_CHECK", "Stand 42 Bassonia Ridge")}
              disabled={loadingTask !== null}
              className="quick"
              style={{ width: "100%", padding: "10px", borderColor: "var(--cyan)", color: "var(--cyan)" }}
            >
              {loadingTask === "CLIENT_WELFARE_CHECK" ? (
                <span>CHALLENGING BIOMETRICS...</span>
              ) : (
                <>
                  <Volume2 size={13} />
                  <span>START VIP WELFARE PING</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Task 3: Guard Post Dead-Man Ping */}
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Shield size={15} />
              <span>GUARD POST PING</span>
            </div>
            <span className="status-pill neutral">1.0 MIN / RUN</span>
          </div>

          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--panel-2)" }}>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
              Dead-man signal challenge via encrypted radio repeater &amp; NFC patrol wand confirmation.
            </div>

            <div style={{ border: "1px solid #3c403d", padding: "8px 10px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px" }}>
              <span style={{ color: "var(--muted)", display: "block" }}>POST VECTOR:</span>
              <b style={{ color: "#fff" }}>Post 3 (Meyersdal Main Boom Gate)</b>
              <div style={{ color: "var(--green)", marginTop: "2px" }}>Officer Khumalo (Guard ID: FOX-GD-31)</div>
            </div>

            <button
              type="button"
              onClick={() => handleRunTask("GUARD_POST_CHECK", "Post 3 (Meyersdal Main Boom Gate)")}
              disabled={loadingTask !== null}
              className="quick"
              style={{ width: "100%", padding: "10px", borderColor: "var(--amber)", color: "var(--amber)" }}
            >
              {loadingTask === "GUARD_POST_CHECK" ? (
                <span>INTERROGATING POST...</span>
              ) : (
                <>
                  <Zap size={13} />
                  <span>SEND DEAD-MAN PING</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Task Result / Transcript */}
      {activeTaskResult && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <CheckCircle size={16} />
              <span>RUN EXECUTION RESULT&nbsp;&nbsp;//&nbsp;&nbsp;{activeTaskResult.category}</span>
            </div>
            <span className="status-pill green">{activeTaskResult.status}</span>
          </div>

          <div style={{ padding: "16px", background: "#0e1213", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ border: "1px solid #555750", padding: "10px 14px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "#eee" }}>
              <b style={{ color: "var(--amber)" }}>TARGET:&nbsp;&nbsp;</b>{activeTaskResult.target}&nbsp;&nbsp;|&nbsp;&nbsp;<b style={{ color: "var(--cyan)" }}>LATENCY:&nbsp;&nbsp;</b>{activeTaskResult.latencyMs}ms
              <div style={{ color: "var(--muted)", marginTop: "4px" }}>{activeTaskResult.details}</div>
            </div>

            {activeTaskResult.transcript && (
              <div style={{ border: "1px solid #3c403d", padding: "12px", background: "#101415", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", fontWeight: 700, color: "var(--cyan)", textTransform: "uppercase", marginBottom: "4px" }}>
                  TRANSCRIBED AUDIO LOG:
                </div>
                {activeTaskResult.transcript.map((line, idx) => (
                  <div key={idx} style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "#ddd" }}>
                    <b style={{ color: line.speaker.includes("AI") ? "var(--amber)" : "#fff" }}>{line.speaker}:&nbsp;</b>
                    <span>&ldquo;{line.text}&rdquo;</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
