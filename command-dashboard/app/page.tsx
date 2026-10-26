"use client";

import React, { useState, useEffect } from "react";
import { Bot, ShieldAlert, ArrowRight, X } from "lucide-react";
import { LoginScreen, OrganizationOption, ORGANIZATIONS } from "../components/LoginScreen";
import { TacticalSidebar, NavTab } from "../components/TacticalSidebar";
import { StationOverviewView } from "../components/StationOverviewView";
import { LiveMapView, LiveAlertItem } from "../components/LiveMapView";
import { SwarmMatrixView } from "../components/SwarmMatrixView";
import { PopiaVaultView } from "../components/PopiaVaultView";
import { B2BOpsView } from "../components/B2BOpsView";
import { BoloYoungConsole } from "../components/BoloYoungConsole";
import { NotificationItem } from "../components/NotificationTray";
import { BoloConsoleHeader } from "../components/BoloConsoleHeader";
import { BoloConsoleFooter } from "../components/BoloConsoleFooter";

interface ActivityItem {
  id: string;
  timestamp: string;
  type: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
  title: string;
  description: string;
}

export default function CommandDashboardPage() {
  const [currentOrg, setCurrentOrg] = useState<OrganizationOption | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("LIVE_MAP");
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [incomingAlerts, setIncomingAlerts] = useState<LiveAlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<LiveAlertItem | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [extractedAttire, setExtractedAttire] = useState<string | null>(null);
  const [hasActiveJourney, setHasActiveJourney] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    type: "INFO" | "CRITICAL";
    title: string;
    message: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-init-1",
      timestamp: "Just now",
      type: "INFO",
      title: "BOLO Young AI Active",
      message: "Sector 2 corridor radar listening on active telemetry feed.",
      source: "BOLO Young",
      actionType: "OPEN_BOLO",
    },
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  // Helper: Ensure BOLO Young journey start message is in chat history
  const ensureBoloJourneyStartMessage = (destination?: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("waypoint_bolo_chat_history");
      const msgs = raw ? JSON.parse(raw) : [];
      const exists = msgs.some((m: any) => m.id === "msg-journey-start");
      if (!exists) {
        const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const destName = destination || "Sandton City Mall, Sandton";
        const newMsg = {
          id: "msg-journey-start",
          sender: "BOLO_YOUNG",
          senderName: "BOLO Young (Traffic Control)",
          text: `Constable Morake, Thandiwe Ndlovu has activated a journey to ${destName}. Status is currently safe (GREEN). I am monitoring corridor telemetry and dead-man's switch countdown. I will alert you immediately if any anomaly or route deviation occurs.`,
          timestamp: nowTime,
          threatLevel: "NOMINAL",
        };
        localStorage.setItem("waypoint_bolo_chat_history", JSON.stringify([newMsg, ...msgs]));
        window.dispatchEvent(new Event("waypoint_chat_updated"));
      }
    } catch (e) {}
  };

  // Helper: Ensure BOLO Young emergency red alert message is in chat history
  const ensureBoloRedAlertMessage = (briefing?: string, actionChips?: any[]) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("waypoint_bolo_chat_history");
      const msgs = raw ? JSON.parse(raw) : [];
      const exists = msgs.some((m: any) => m.id === "msg-red-alert" || m.threatLevel === "CRITICAL");
      if (!exists) {
        const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMsg = {
          id: "msg-red-alert",
          sender: "BOLO_YOUNG",
          senderName: "BOLO Young (Traffic Control)",
          text:
            briefing ||
            "🚨 RED ALERT: Constable Morake, emergency distress signal confirmed on Thandiwe Ndlovu. Telemetry stationary at zero velocity near the N12 off-ramp corridor. Stagnation threshold breached (>90s). Immediate intervention required.",
          timestamp: nowTime,
          threatLevel: "CRITICAL",
          suggestedActions: actionChips && actionChips.length > 0 ? actionChips : [
            {
              action_id: "DEPLOY_NOK_RECON",
              label: "🚀 Deploy WhatsApp Recon Agent (Next-of-Kin)",
              rationale: "Contact sister Zanele Ndlovu to extract attire description.",
              primary: true,
            },
            {
              action_id: "INTERCEPT_CONVERGE",
              label: "🚓 Converge Units (Fox-14 & SAPS-302)",
              rationale: "Direct Fox-14 and SAPS-302 to coordinate intercept.",
              primary: false,
            },
            {
              action_id: "BROADCAST_CAD",
              label: "📡 Broadcast BOLO to SAPS 10111 CAD",
              rationale: "Issue statutory inter-agency alert across Gauteng provincial command.",
              primary: false,
            },
          ],
        };
        localStorage.setItem("waypoint_bolo_chat_history", JSON.stringify([...msgs, newMsg]));
        window.dispatchEvent(new Event("waypoint_chat_updated"));
      }
    } catch (e) {}
  };

  // Check saved organization session on mount
  useEffect(() => {
    try {
      const savedOrgId = sessionStorage.getItem("waypoint_c4i_org_id");
      if (savedOrgId) {
        const found = ORGANIZATIONS.find((o) => o.orgId === savedOrgId);
        if (found) {
          handleSelectOrg(found);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Handle Organization Selection / Login
  const handleSelectOrg = (org: OrganizationOption) => {
    setCurrentOrg(org);
    setActiveTab("OVERVIEW");
    try {
      sessionStorage.setItem("waypoint_c4i_org_id", org.orgId);
    } catch (e) {}

    // Initialize Notification Tray
    setNotifications([
      {
        id: "notif-" + Date.now(),
        timestamp: "Just now",
        type: "INFO",
        title: "BOLO Young AI Active",
        message: `Corridor guardian authenticated for ${org.officerName} (${org.officerRank}).`,
        source: "BOLO Young",
        actionType: "OPEN_BOLO",
      },
    ]);

    // Initialize Station Ledger with realistic startup activities
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setRecentActivities([
      {
        id: "act-init-1",
        timestamp: "Just now",
        type: "SUCCESS",
        title: `C4i Terminal Session Initialized`,
        description: `Terminal authenticated for ${org.officerName} (${org.officerRank}) under ${org.name}.`,
      },
      {
        id: "act-init-2",
        timestamp: "2 mins ago",
        type: "INFO",
        title: "Sector Patrol Fleet Synchronized",
        description: "4 armed response and community patrol units reporting operational telemetry in Sector 2.",
      },
      {
        id: "act-init-3",
        timestamp: "5 mins ago",
        type: "INFO",
        title: "POPIA Section 11 Encryption Vault Active",
        description: "Zero-knowledge cryptographic keys locked. Citizen identities masked pending distress escalation.",
      },
    ]);
  };

  // Handle Logout / Switch Organization
  const handleLogout = () => {
    setCurrentOrg(null);
    setIncomingAlerts([]);
    setSelectedAlert(null);
    try {
      sessionStorage.removeItem("waypoint_c4i_org_id");
    } catch (e) {}
  };

  // WebSocket Connection for the selected organization
  useEffect(() => {
    if (!currentOrg) return;

    let ws: WebSocket;
    const connectWs = () => {
      try {
        ws = new WebSocket(`${wsUrl}/ws/command/${currentOrg.orgId}`);

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const nowTime = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            // 1. Live Distress Alert Triggered from Mobile
            if (data.type === "JOURNEY_RED_ALERT" || data.type === "SWARM_AWAKENED") {
              const alertItem: LiveAlertItem = {
                id: data.incident_id || data.journey_id || String(Date.now()),
                journeyId: data.journey_id || "active_journey",
                timestamp: nowTime,
                citizenName: "Thandiwe Ndlovu",
                triggerSource: data.trigger_source || "SECOND_TAP",
                lat: data.lat || -26.2678,
                lng: data.lng || 28.1245,
                speedKmh: data.speed_kmh || 78,
                headingDeg: data.heading_deg || 140,
                status: "RED",
                message:
                  data.message ||
                  "🚨 Code Red distress signal received. The Way Swarm multi-agent engine deployed.",
              };

              setIncomingAlerts((prev) => [alertItem, ...prev.filter((a) => a.id !== alertItem.id)]);
              setSelectedAlert(alertItem);
              setHasActiveJourney(true);
              ensureBoloJourneyStartMessage();
              ensureBoloRedAlertMessage(data.message);

              setActiveToast({
                id: "toast-red-" + Date.now(),
                type: "CRITICAL",
                title: "🚨 RED ALERT: Citizen Distress Signal",
                message: "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required.",
              });

              // Append to real recent activities
              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "ALERT",
                  title: "🚨 Code Red Distress Triggered",
                  description: `Citizen Thandiwe Ndlovu initiated emergency SOS (${alertItem.triggerSource}).`,
                },
                ...prev,
              ]);

              // Push Critical Notification to Tray
              setNotifications((prev) => [
                {
                  id: "notif-red-" + Date.now(),
                  timestamp: nowTime,
                  type: "CRITICAL",
                  title: "🚨 Red Alert: Citizen Distress",
                  message: "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required. Click to engage BOLO Young.",
                  source: "BOLO Young",
                  actionType: "OPEN_BOLO",
                },
                ...prev,
              ]);
            }

            // 1b. Citizen Journey Activated (1st Tap Start)
            else if (data.type === "JOURNEY_STARTED") {
              setHasActiveJourney(true);
              ensureBoloJourneyStartMessage(data.destination);

              setActiveToast({
                id: "toast-start-" + Date.now(),
                type: "INFO",
                title: "🟢 BOLO Young AI: Active Journey Monitored",
                message: "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey.",
              });

              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "INFO",
                  title: "🟢 Citizen Journey Activated",
                  description: `Thandiwe Ndlovu started safe journey to ${data.destination || "Sandton"}. BOLO Young watching.`,
                },
                ...prev,
              ]);

              // Push Journey Started Notification to Tray (As requested)
              setNotifications((prev) => [
                {
                  id: "notif-start-" + Date.now(),
                  timestamp: nowTime,
                  type: "INFO",
                  title: "Journey Activated • Safe Transit",
                  message: "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey.",
                  source: "BOLO Young",
                  actionType: "OPEN_BOLO",
                },
                ...prev,
              ]);
            }

            // 2. Citizen Safely Disarmed (Entered 1234)
            else if (data.type === "JOURNEY_DISARMED") {
              setHasActiveJourney(false);
              setActiveToast(null);

              setIncomingAlerts((prev) =>
                prev.map((a) =>
                  a.status === "RED"
                    ? {
                        ...a,
                        status: "RESOLVED",
                        message: "Citizen entered Standard PIN. Journey ended safely.",
                      }
                    : a
                )
              );

              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "SUCCESS",
                  title: "✅ Safe Arrival Disarm Protocol",
                  description: "Citizen entered Standard PIN 1234. Journey disarmed safely, alert stood down.",
                },
                ...prev,
              ]);

              setNotifications((prev) => [
                {
                  id: "notif-disarm-" + Date.now(),
                  timestamp: nowTime,
                  type: "SUCCESS",
                  title: "Journey Disarmed (Safe Arrival)",
                  message: "Citizen entered Standard PIN. Journey ended safely. BOLO Young standing down.",
                  source: "BOLO Young",
                  actionType: "OPEN_BOLO",
                },
                ...prev,
              ]);

              // Clear past emergency chat history
              try {
                localStorage.removeItem("waypoint_bolo_chat_history");
                window.dispatchEvent(new Event("waypoint_chat_updated"));
              } catch (e) {}
            }

            // 3. Recon Intel Acquired (WhatsApp Recon)
            else if (data.type === "RECON_INTEL_ACQUIRED") {
              if (data.attire) {
                setExtractedAttire(data.attire);
              }
              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "SUCCESS",
                  title: "🎯 NOK Recon Intel Acquired",
                  description: data.message || `Victim attire confirmed: ${data.attire}`,
                },
                ...prev,
              ]);

              // Push Success Notification to Tray
              setNotifications((prev) => [
                {
                  id: "notif-attire-" + Date.now(),
                  timestamp: nowTime,
                  type: "SUCCESS",
                  title: "🎯 NOK Attire Verified",
                  message: `Confirmed: "${data.attire}". Transmitted to BOLO Young & patrol dispatch vectors.`,
                  source: "NOK Recon Agent",
                  actionType: "OPEN_BOLO",
                },
                ...prev,
              ]);
            }

            // 4. Recon WhatsApp Thread Opened
            else if (data.type === "RECON_THREAD_STARTED") {
              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "INFO",
                  title: "💬 WhatsApp Recon Thread Opened",
                  description: `Recon Agent engaged ${data.contact} (${data.phone}) via encrypted WhatsApp bridge.`,
                },
                ...prev,
              ]);
            }

            // 5. Demo Loop Reset
            else if (data.type === "JOURNEY_RESET") {
              setHasActiveJourney(false);
              setActiveToast(null);
              setIncomingAlerts([]);
              setSelectedAlert(null);
              setExtractedAttire(null);

              // Clear past emergency chat history
              try {
                localStorage.removeItem("waypoint_bolo_chat_history");
                window.dispatchEvent(new Event("waypoint_chat_updated"));
              } catch (e) {}

              setRecentActivities((prev) => [
                {
                  id: "act-" + Date.now(),
                  timestamp: nowTime,
                  type: "INFO",
                  title: "Tactical Sector Reset to IDLE",
                  description: "Emergency alerts cleared. Sector returned to resting baseline.",
                },
                ...prev,
              ]);
            }
          } catch (err) {
            console.error("WS message parse error:", err);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          setTimeout(connectWs, 3000);
        };
      } catch (err) {
        console.warn("WebSocket connection error:", err);
      }
    };

    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, [currentOrg, wsUrl]);

  // Autonomous BOLO Audit Polling (Guarantees immediate detection if user triggers journey anywhere)
  useEffect(() => {
    if (!currentOrg) return;

    const pollAudit = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/v1/traffic-control/audit?operator_name=${encodeURIComponent(currentOrg.officerName)}`
        );
        if (res.ok) {
          const data = await res.json();
          const active = data.has_active_journey || false;
          setHasActiveJourney(active);

          if (active && data.journey_status === "GREEN") {
            setNotifications((prev) => {
              if (!prev.some((n) => n.id.startsWith("notif-start"))) {
                const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return [
                  {
                    id: "notif-start-" + Date.now(),
                    timestamp: nowTime,
                    type: "INFO",
                    title: "Journey Activated • Safe Transit",
                    message: "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey.",
                    source: "BOLO Young",
                    actionType: "OPEN_BOLO",
                  },
                  ...prev,
                ];
              }
              return prev;
            });

            setActiveToast((prev) => {
              if (!prev || prev.type !== "CRITICAL") {
                return {
                  id: "toast-start",
                  type: "INFO",
                  title: "🟢 BOLO Young AI: Active Journey Monitored",
                  message: "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey.",
                };
              }
              return prev;
            });

            ensureBoloJourneyStartMessage(data.audit?.location_audit?.destination?.name);
          } else if (active && data.journey_status === "RED") {
            setNotifications((prev) => {
              if (!prev.some((n) => n.id.startsWith("notif-red"))) {
                const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return [
                  {
                    id: "notif-red-" + Date.now(),
                    timestamp: nowTime,
                    type: "CRITICAL",
                    title: "🚨 Red Alert: Citizen Distress",
                    message: "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required. Click to engage BOLO Young.",
                    source: "BOLO Young",
                    actionType: "OPEN_BOLO",
                  },
                  ...prev,
                ];
              }
              return prev;
            });

            setActiveToast({
              id: "toast-red",
              type: "CRITICAL",
              title: "🚨 RED ALERT: Citizen Distress Signal",
              message: "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required.",
            });

            setIncomingAlerts((prev) => {
              if (prev.length === 0 || !prev.some((a) => a.status === "RED")) {
                const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return [
                  {
                    id: "alert-red-" + Date.now(),
                    journeyId: "active_journey",
                    timestamp: nowTime,
                    citizenName: "Thandiwe Ndlovu",
                    triggerSource: "SECOND_TAP",
                    lat: data.audit?.location_audit?.current_coordinates?.[0] || -26.2678,
                    lng: data.audit?.location_audit?.current_coordinates?.[1] || 28.1245,
                    speedKmh: 0,
                    headingDeg: 140,
                    status: "RED",
                    message: "🚨 Code Red distress signal received. The Way Swarm multi-agent engine deployed.",
                  },
                  ...prev,
                ];
              }
              return prev;
            });

            // Ensure BOTH start message and red alert message exist in proper sequence!
            ensureBoloJourneyStartMessage(data.audit?.location_audit?.destination?.name);
            ensureBoloRedAlertMessage(data.liaison?.briefing, data.liaison?.action_chips);
          } else if (!active) {
            setActiveToast(null);
          }
        }
      } catch (e) {}
    };

    pollAudit();
    const interval = setInterval(pollAudit, 2000);
    return () => clearInterval(interval);
  }, [currentOrg, apiUrl]);

  // Acknowledge Alert Handler
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/reset`, { method: "POST" });
    } catch (e) {}

    setIncomingAlerts((prev) => prev.filter((a) => a.id !== alertId));
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(null);
    }
  };

  // Notification Handlers
  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // IF NOT LOGGED IN: Show Organization Selection Portal for Judges
  if (!currentOrg) {
    return <LoginScreen onSelectOrg={handleSelectOrg} />;
  }

  // LOGGED IN DASHBOARD VIEW
  return (
    <div className="w-full h-screen bg-[#0a0c10] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Header Bar (Warm Off-White / Cream) */}
      <BoloConsoleHeader
        notifications={notifications}
        onOpenBoloYoung={() => setActiveTab("BOLO_YOUNG")}
        onClearNotification={handleClearNotification}
        onClearAllNotifications={handleClearAllNotifications}
        isWsConnected={isWsConnected}
      />

      {/* Main Center Area: Left Sidebar + Active View */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Side Menu Navigation */}
        <TacticalSidebar
          currentOrg={currentOrg}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isWsConnected={isWsConnected}
          activeAlertCount={incomingAlerts.filter((a) => a.status === "RED").length}
          hasActiveJourney={hasActiveJourney}
          notifications={notifications}
          onClearNotification={handleClearNotification}
          onClearAllNotifications={handleClearAllNotifications}
        />

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col h-full bg-[#0a0c10] ${activeTab === "LIVE_MAP" || activeTab === "BOLO_YOUNG" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {activeTab === "OVERVIEW" && (
            <StationOverviewView
              currentOrg={currentOrg}
              recentActivities={recentActivities}
              isWsConnected={isWsConnected}
              onNavigateToMap={() => setActiveTab("LIVE_MAP")}
            />
          )}

          {activeTab === "LIVE_MAP" && (
            <LiveMapView
              currentOrg={currentOrg}
              isWsConnected={isWsConnected}
              incomingAlerts={incomingAlerts}
              selectedAlert={selectedAlert}
              onSelectAlert={setSelectedAlert}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              extractedAttire={extractedAttire}
              onAttireExtracted={setExtractedAttire}
              onNavigateToBolo={() => setActiveTab("BOLO_YOUNG")}
              notifications={notifications}
              onClearNotification={handleClearNotification}
              onClearAllNotifications={handleClearAllNotifications}
            />
          )}

          {activeTab === "BOLO_YOUNG" && (
            <BoloYoungConsole
              currentOrg={currentOrg}
              hasActiveEmergency={incomingAlerts.some((a) => a.status === "RED") || selectedAlert?.status === "RED"}
              extractedAttire={extractedAttire}
              onAttireExtracted={setExtractedAttire}
              onNavigateToMap={() => setActiveTab("LIVE_MAP")}
            />
          )}

          {activeTab === "SWARM_MATRIX" && (
            <SwarmMatrixView
              currentOrg={currentOrg}
              isWsConnected={isWsConnected}
              hasActiveCrisis={incomingAlerts.some((a) => a.status === "RED")}
            />
          )}

          {activeTab === "POPIA_VAULT" && (
            <PopiaVaultView
              currentOrg={currentOrg}
              isWsConnected={isWsConnected}
              hasActiveCrisis={incomingAlerts.some((a) => a.status === "RED")}
            />
          )}

          {activeTab === "B2B_OPS" && (
            <B2BOpsView
              currentOrg={currentOrg}
              isWsConnected={isWsConnected}
            />
          )}
        </main>
      </div>

      {/* Bottom Footer Bar (Warm Off-White / Cream) */}
      <BoloConsoleFooter />

      {/* Global Floating Toast Banner (Visible on all dashboard screens) */}
      {activeToast && (
        <div className="fixed top-5 right-6 z-[9999] max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div
            className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start space-x-3.5 ${
              activeToast.type === "CRITICAL"
                ? "bg-red-950/95 border-red-500 text-white shadow-red-950/60 ring-2 ring-red-500/30"
                : "bg-slate-900/95 border-emerald-500/80 text-white shadow-emerald-950/40 ring-2 ring-emerald-500/20"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${
                activeToast.type === "CRITICAL"
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-emerald-500 text-slate-950 shadow-md"
              }`}
            >
              {activeToast.type === "CRITICAL" ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5 text-slate-950" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {activeToast.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-snug">
                {activeToast.message}
              </p>
              <div className="mt-3 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("BOLO_YOUNG");
                    setActiveToast(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow cursor-pointer ${
                    activeToast.type === "CRITICAL"
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
                  }`}
                >
                  <span>Engage BOLO Young</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
