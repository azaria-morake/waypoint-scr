"use client";

import React, { useState, useEffect } from "react";
import { TacticalNavbar } from "../components/TacticalNavbar";
import { TacticalGisMap } from "../components/TacticalGisMap";
import { BoloInspector } from "../components/BoloInspector";
import { SwarmMatrix } from "../components/SwarmMatrix";
import { B2BOpsDrawer } from "../components/B2BOpsDrawer";

export default function CommandDashboardPage() {
  const [currentTier, setCurrentTier] = useState<"TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV">("TIER_2_PRO");
  const [orgName, setOrgName] = useState<string>("Fox Tactical Security");
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isRedAlert, setIsRedAlert] = useState<boolean>(false);
  const [telemetrySpeed, setTelemetrySpeed] = useState<number>(78);
  const [telemetryHeading, setTelemetryHeading] = useState<number>(140);
  const [voiceMinutesUsed, setVoiceMinutesUsed] = useState<number>(182);
  const [voiceMinutesLimit, setVoiceMinutesLimit] = useState<number>(1000);
  const [responders, setResponders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [boloData, setBoloData] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
  const defaultOrgId = "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b"; // Fox Tactical

  // Fetch initial state
  const loadDashboardState = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/dashboard/state`);
      if (res.ok) {
        const data = await res.json();
        setIsRedAlert(data.journey?.status === "RED");
        setResponders(data.responders || []);
        setAuditLogs(data.popia_audit_logs || []);
        setBoloData(data.bolo);
        if (data.organization) {
          setOrgName(data.organization.org_name);
          setCurrentTier(data.organization.tier);
          setVoiceMinutesUsed(data.organization.voice_minutes_used);
          setVoiceMinutesLimit(data.organization.voice_minutes_limit);
        }
      }
    } catch (e) {
      console.warn("Could not fetch initial dashboard state:", e);
    }
  };

  useEffect(() => {
    loadDashboardState();
  }, []);

  // WebSocket Connection
  useEffect(() => {
    let ws: WebSocket;
    const connectWs = () => {
      try {
        ws = new WebSocket(`${wsUrl}/ws/command/${defaultOrgId}`);

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "TELEMETRY_PING") {
              setTelemetrySpeed(data.speed_kmh);
              setTelemetryHeading(data.heading_deg);
            } else if (data.type === "JOURNEY_RED_ALERT" || data.type === "SWARM_AWAKENED") {
              setIsRedAlert(true);
            } else if (data.type === "TIER_UPDATED") {
              setCurrentTier(data.tier);
            }
            loadDashboardState();
          } catch (err) {
            console.error("WS message parse error", err);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          // Reconnect after 3s
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        console.warn("WS error:", err);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Tenant / Tier Switching
  const handleTierChange = async (newTier: "TIER_1_STARTER" | "TIER_2_PRO" | "TIER_3_GOV") => {
    setCurrentTier(newTier);
    if (newTier === "TIER_1_STARTER") setOrgName("Alberton North Community Policing Forum");
    if (newTier === "TIER_2_PRO") setOrgName("Fox Tactical Security");
    if (newTier === "TIER_3_GOV") setOrgName("SAPS Flying Squad (Sector 2)");

    try {
      await fetch(`${apiUrl}/api/v1/organizations/${defaultOrgId}/tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier }),
      });
    } catch (e) {
      console.warn("Tier update API fallback", e);
    }
  };

  // Triggers
  const triggerSos = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/active_journey/panic`, { method: "POST" });
    } catch (e) {}
    setIsRedAlert(true);
    setTimeout(loadDashboardState, 500);
  };

  const triggerDuress = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/active_journey/disarm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: "9999" }),
      });
    } catch (e) {}
    setIsRedAlert(true);
    setTimeout(loadDashboardState, 500);
  };

  const triggerGForce = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/active_journey/panic`, { method: "POST" });
    } catch (e) {}
    setIsRedAlert(true);
    setTimeout(loadDashboardState, 500);
  };

  const triggerSms = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/webhooks/sms-fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_sms: "WP1|+27825550199|RED|-26.2678,28.1245|78|140|42|HMAC_OK",
          sender_number: "+27825550199",
        }),
      });
    } catch (e) {}
    setIsRedAlert(true);
    setTimeout(loadDashboardState, 500);
  };

  const resetAll = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/reset`, { method: "POST" });
    } catch (e) {}
    setIsRedAlert(false);
    setTimeout(loadDashboardState, 500);
  };

  // Trigger B2B custom agent
  const handleTriggerTask = async (category: string, target: string) => {
    const res = await fetch(`${apiUrl}/api/v1/b2b/custom-agents/task_runner/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_property_or_client: target,
        callback_number: "+27825550199",
      }),
    });
    const data = await res.json();
    setVoiceMinutesUsed((prev) => prev + (data.voice_minutes_billed || 2));
    loadDashboardState();
    return data;
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Tactical Navbar */}
      <TacticalNavbar
        currentTier={currentTier}
        currentOrgName={orgName}
        onTierChange={handleTierChange}
        isWsConnected={isWsConnected}
        onTriggerSos={triggerSos}
        onTriggerDuress={triggerDuress}
        onTriggerGForce={triggerGForce}
        onTriggerSms={triggerSms}
        onReset={resetAll}
      />

      {/* Main Tactical Grid Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Column: Live Tactical GIS Map (7 cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          <TacticalGisMap
            isRedAlert={isRedAlert}
            speedKmh={telemetrySpeed}
            headingDeg={telemetryHeading}
            responders={responders}
          />

          {/* The Way Swarm Execution Matrix */}
          <SwarmMatrix
            isRedAlert={isRedAlert}
            currentTier={currentTier}
          />
        </section>

        {/* Right Column: BOLO Inspector & B2B Ops (5 cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          <BoloInspector
            isRedAlert={isRedAlert}
            boloData={boloData}
          />

          <B2BOpsDrawer
            voiceMinutesUsed={voiceMinutesUsed}
            voiceMinutesLimit={voiceMinutesLimit}
            onTriggerTask={handleTriggerTask}
            auditLogs={auditLogs}
          />
        </section>
      </main>
    </div>
  );
}
