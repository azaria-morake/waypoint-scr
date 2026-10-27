"use client";

import React, { useState } from "react";
import { PhoneCall, Shield, FileText, CheckCircle, Clock, Zap, AlertCircle } from "lucide-react";

interface B2BOpsDrawerProps {
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  onTriggerTask: (category: string, target: string) => Promise<any>;
  auditLogs: Array<{
    audit_id: string;
    action: string;
    responder_id: string;
    ip_address: string;
    justification: string;
    accessed_at: string;
  }>;
}

export const B2BOpsDrawer: React.FC<B2BOpsDrawerProps> = ({
  voiceMinutesUsed,
  voiceMinutesLimit,
  onTriggerTask,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<"B2B_RUNNER" | "POPIA_LEDGER">("B2B_RUNNER");
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [taskOutput, setTaskOutput] = useState<any>(null);

  const usagePercent = Math.min(Math.round((voiceMinutesUsed / voiceMinutesLimit) * 100), 100);

  const handleRun = async (category: string, target: string) => {
    setLoadingTask(category);
    try {
      const res = await onTriggerTask(category, target);
      setTaskOutput(res);
    } catch (e: any) {
      alert(`Task execution error: ${e.message}`);
    } finally {
      setLoadingTask(null);
    }
  };

  return (
    <section className="panel" style={{ width: "100%" }}>
      {/* Top Header & Tabs */}
      <div className="panel-header" style={{ padding: "10px 16px", flexWrap: "wrap", height: "auto", minHeight: "58px", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("B2B_RUNNER")}
            className="quick"
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              borderColor: activeTab === "B2B_RUNNER" ? "var(--amber)" : "#555750",
              color: activeTab === "B2B_RUNNER" ? "var(--amber)" : "var(--muted)",
            }}
          >
            <Zap size={13} />
            <span>COMMERCIAL B2B RUNNER</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("POPIA_LEDGER")}
            className="quick"
            style={{
              padding: "6px 12px",
              fontSize: "10px",
              borderColor: activeTab === "POPIA_LEDGER" ? "var(--cyan)" : "#555750",
              color: activeTab === "POPIA_LEDGER" ? "var(--cyan)" : "var(--muted)",
            }}
          >
            <FileText size={13} />
            <span>POPIA CRYPTOGRAPHIC AUDIT LEDGER</span>
          </button>
        </div>

        {/* Metered Voice Minutes Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "1px solid #3c403d", padding: "6px 12px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          <PhoneCall size={14} color="var(--green)" />
          <div>
            <span style={{ fontSize: "8px", color: "var(--muted)", display: "block" }}>VOICE AI BILLING</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#eee" }}>
              {voiceMinutesUsed} / {voiceMinutesLimit} MIN ({usagePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: Commercial B2B Runner */}
      {activeTab === "B2B_RUNNER" && (
        <div style={{ padding: "16px", background: "var(--panel-2)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {/* Task 1: Alarm Verification */}
            <div style={{ border: "1px solid #3c403d", padding: "14px", background: "#101415", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>Alarm Verification</h4>
                  <span className="status-pill orange">+2.0 MIN</span>
                </div>
                <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                  Automated audio check &amp; property contact call on perimeter alarm trip.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRun("ALARM_VERIFICATION", "42 Voortrekker Road, Alberton")}
                disabled={loadingTask !== null}
                className="quick danger"
                style={{ marginTop: "12px", width: "100%", padding: "8px", fontSize: "10px" }}
              >
                {loadingTask === "ALARM_VERIFICATION" ? "EXECUTING CALL..." : "EXECUTE VERIFICATION"}
              </button>
            </div>

            {/* Task 2: Client Welfare Check */}
            <div style={{ border: "1px solid #3c403d", padding: "14px", background: "#101415", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>Client Welfare Check</h4>
                  <span className="status-pill orange">+2.0 MIN</span>
                </div>
                <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                  Scheduled safety check-in call with high-value VIP residential client.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRun("CLIENT_WELFARE_CHECK", "Client: Sipho Mthembu (Stand 104)")}
                disabled={loadingTask !== null}
                className="quick"
                style={{ marginTop: "12px", width: "100%", padding: "8px", fontSize: "10px", borderColor: "var(--cyan)", color: "var(--cyan)" }}
              >
                {loadingTask === "CLIENT_WELFARE_CHECK" ? "CHECKING WELFARE..." : "EXECUTE WELFARE CHECK"}
              </button>
            </div>

            {/* Task 3: Guard Check-In */}
            <div style={{ border: "1px solid #3c403d", padding: "14px", background: "#101415", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>Guard Patrol Check-In</h4>
                  <span className="status-pill orange">+1.0 MIN</span>
                </div>
                <p style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                  Heartbeat patrol verification on stationary guard posts and boom gates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRun("GUARD_CHECKIN", "Post 3: Alberton Sector Boom Gate")}
                disabled={loadingTask !== null}
                className="quick"
                style={{ marginTop: "12px", width: "100%", padding: "8px", fontSize: "10px", borderColor: "var(--amber)", color: "var(--amber)" }}
              >
                {loadingTask === "GUARD_CHECKIN" ? "VERIFYING..." : "EXECUTE GUARD PING"}
              </button>
            </div>
          </div>

          {/* Execution Result Log */}
          {taskOutput && (
            <div style={{ border: "1px solid #078e76", padding: "12px 14px", background: "#06201b", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#20cbb0", fontWeight: 700, marginBottom: "4px" }}>
                <span>✓ TASK {taskOutput.task_category} COMPLETED IN {taskOutput.latency_ms}MS</span>
                <span>BILLED: +{taskOutput.voice_minutes_billed} VOICE MINS</span>
              </div>
              <p style={{ color: "#eee", margin: 0 }}>{taskOutput.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: POPIA Cryptographic Ledger */}
      {activeTab === "POPIA_LEDGER" && (
        <div style={{ padding: "16px", background: "var(--panel-2)", overflowX: "auto" }}>
          <div style={{ border: "1px solid #3c403d" }}>
            <div className="agent-table">
              <div className="table-head">
                <span>TIMESTAMP (UTC)</span>
                <span>AUDIT ACTION</span>
                <span>RESPONDER</span>
                <span>JUSTIFICATION</span>
                <span>IP HASH</span>
              </div>

              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.audit_id} className="agent-row" style={{ fontSize: "10px" }}>
                    <span>{log.accessed_at?.slice(0, 19).replace("T", " ")}</span>
                    <span style={{ color: "var(--amber)" }}>{log.action}</span>
                    <span>{log.responder_id || "SYSTEM_DISPATCH"}</span>
                    <span style={{ color: "var(--muted)" }}>{log.justification}</span>
                    <span style={{ color: "var(--cyan)" }}>{log.ip_address}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "10px" }}>
                  No active POPIA decryptions logged during idle green monitoring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
