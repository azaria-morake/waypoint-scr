"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Navigation,
  Compass,
  MapPin,
  Car,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Shield,
  Activity,
  Bot,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface ActionChip {
  action_id: string;
  label: string;
  rationale: string;
  primary: boolean;
}

interface TrafficControlCoPilotProps {
  currentOrg: OrganizationOption;
  isRedAlert: boolean;
  onOpenWhatsAppRecon: () => void;
  onConvergeUnits?: () => void;
  extractedAttire?: string | null;
}

export const TrafficControlCoPilot: React.FC<TrafficControlCoPilotProps> = ({
  currentOrg,
  isRedAlert,
  onOpenWhatsAppRecon,
  onConvergeUnits,
  extractedAttire,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [auditData, setAuditData] = useState<any>(null);
  const [liaisonBriefing, setLiaisonBriefing] = useState<string>(
    "Constable Morake, BOLO Young online. Sector telemetry stream active and monitoring corridor vectors."
  );
  const [threatLevel, setThreatLevel] = useState<string>("MODERATE");
  const [actionChips, setActionChips] = useState<ActionChip[]>([]);
  const [operatorPrompt, setOperatorPrompt] = useState<string>("");
  const [isLiaising, setIsLiaising] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch real-time audit report from Traffic Control Agent
  const fetchAudit = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/traffic-control/audit?operator_name=${encodeURIComponent(currentOrg.officerName)}`);
      if (res.ok) {
        const data = await res.json();
        setAuditData(data.audit);
        if (data.liaison) {
          setLiaisonBriefing(data.liaison.briefing);
          setThreatLevel(data.liaison.threat_level);
          setActionChips(data.liaison.action_chips || []);
        }
      }
    } catch (e) {
      console.warn("Traffic Control audit fetch error:", e);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 4000);
    return () => clearInterval(interval);
  }, [currentOrg, isRedAlert]);

  // Handle Action Chip selection
  const handleActionClick = (chip: ActionChip) => {
    if (chip.action_id === "DEPLOY_NOK_RECON") {
      onOpenWhatsAppRecon();
    } else if (chip.action_id === "INTERCEPT_CONVERGE" && onConvergeUnits) {
      onConvergeUnits();
    } else {
      // Send as operator prompt
      handleSendPrompt(chip.label);
    }
  };

  // Ask or instruct Traffic Control Agent
  const handleSendPrompt = async (queryText?: string) => {
    const q = queryText || operatorPrompt;
    if (!q.trim() || isLiaising) return;

    setOperatorPrompt("");
    setIsLiaising(true);

    try {
      const res = await fetch(`${apiUrl}/api/v1/traffic-control/liaise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_query: q,
          operator_name: currentOrg.officerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiaisonBriefing(data.briefing);
        setThreatLevel(data.threat_level);
        if (data.action_chips) {
          setActionChips(data.action_chips);
        }
      }
    } catch (e) {
      console.warn("Liaison error:", e);
    } finally {
      setIsLiaising(false);
    }
  };

  const isStagnant = auditData?.location_audit?.is_stagnant || isRedAlert;
  const attireMissing = !extractedAttire && auditData?.appearance_audit?.appearance_gap_detected;

  return (
    <section className="panel" style={{ width: "100%", margin: 0 }}>
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="panel-header"
        style={{ cursor: "pointer", padding: "10px 16px" }}
      >
        <div className="panel-title">
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "1px solid var(--amber)",
              background: "#18140e",
              color: "var(--amber)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Bot size={16} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                BOLO YOUNG
              </span>
              <span className={`status-pill ${threatLevel === "CRITICAL" ? "red" : threatLevel === "HIGH" ? "orange" : "green"}`}>
                {threatLevel}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", color: "var(--muted)", marginTop: "2px" }}>
              Liaison: {currentOrg.officerName} • Sector 2 Corridor Co-Pilot
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)" }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Co-Pilot Panel */}
      {isExpanded && (
        <div style={{ padding: "14px 16px", background: "var(--panel-2)", display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid #444844" }}>
          {/* Live Audit Checklist Badges */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px" }}>
            {/* Kinematics / Stagnation Status */}
            <div
              style={{
                border: "1px solid #444844",
                borderLeft: `3px solid ${isStagnant ? "var(--red)" : "var(--green)"}`,
                padding: "8px 10px",
                background: "#101415",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Activity size={16} color={isStagnant ? "var(--red)" : "var(--green)"} />
              <div style={{ overflow: "hidden" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: isStagnant ? "var(--red)" : "var(--green)", display: "block" }}>
                  {isStagnant ? "⚠️ TARGET STAGNANT (>90s)" : "✓ TELEMETRY STREAM NOMINAL"}
                </span>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {auditData?.location_audit?.stagnation_summary || "0 km/h baseline"}
                </span>
              </div>
            </div>

            {/* Appearance / Attire Gap Status */}
            <div
              style={{
                border: "1px solid #444844",
                borderLeft: `3px solid ${extractedAttire ? "var(--green)" : attireMissing ? "var(--orange)" : "var(--cyan)"}`,
                padding: "8px 10px",
                background: "#101415",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Shield size={16} color={extractedAttire ? "var(--green)" : attireMissing ? "var(--orange)" : "var(--cyan)"} />
              <div style={{ overflow: "hidden" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: extractedAttire ? "var(--green)" : attireMissing ? "var(--orange)" : "var(--cyan)", display: "block" }}>
                  {extractedAttire
                    ? "✓ VISUAL ATTIRE CONFIRMED"
                    : attireMissing
                    ? "⚠️ VISUAL ATTIRE GAP DETECTED"
                    : "✓ PRE-DEPARTURE PHOTO MATCH"}
                </span>
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {extractedAttire || "Clothing unverified for today's run"}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Control Agent Tactical Briefing Box */}
          <div style={{ border: "1px solid #555750", borderLeft: "4px solid var(--amber)", padding: "10px 14px", background: "#101415", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--amber)", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
              <Sparkles size={13} />
              <span>BOLO YOUNG TACTICAL BRIEFING:</span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "#eee", lineHeight: 1.5 }}>
              {liaisonBriefing}
            </p>
          </div>

          {/* Action Chips: Structured Options for Constable Morake */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", fontSize: "9px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              OPERATOR DIRECTIVES (CLICK TO EXECUTE):
            </span>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {actionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleActionClick(chip)}
                  className={`quick ${chip.primary ? "danger" : ""}`}
                  style={{
                    fontSize: "10px",
                    padding: "6px 12px",
                    borderColor: chip.primary ? "var(--red)" : "var(--orange)",
                    color: chip.primary ? "var(--red)" : "var(--orange)",
                  }}
                >
                  <span>{chip.label}</span>
                </button>
              ))}

              {/* Direct WhatsApp Recon Trigger button if not already present */}
              {!actionChips.some((c) => c.action_id === "DEPLOY_NOK_RECON") && (
                <button
                  type="button"
                  onClick={onOpenWhatsAppRecon}
                  className="quick"
                  style={{
                    fontSize: "10px",
                    padding: "6px 12px",
                    borderColor: "#078e76",
                    color: "#20cbb0",
                  }}
                >
                  <MessageSquare size={13} />
                  <span>LAUNCH WHATSAPP RECON (SISTER ZANELE)</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Input Bar for Constable Morake */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid #3c403d" }}>
            <input
              type="text"
              value={operatorPrompt}
              onChange={(e) => setOperatorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
              placeholder="Ask BOLO Young (e.g., 'What is closest unit?', 'Is target moving?')..."
              style={{
                flex: 1,
                background: "#0c1012",
                border: "1px solid #555750",
                padding: "8px 12px",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "11px",
                color: "#fff",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => handleSendPrompt()}
              disabled={!operatorPrompt.trim() || isLiaising}
              className="quick"
              style={{ padding: "8px 14px", borderColor: "var(--orange)", color: "var(--orange)", opacity: (!operatorPrompt.trim() || isLiaising) ? 0.4 : 1 }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
