"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, ShieldAlert, ArrowRight, X } from "lucide-react";
import { LoginScreen, OrganizationOption, ORGANIZATIONS } from "../components/LoginScreen";
import { TacticalSidebar, NavTab } from "../components/TacticalSidebar";
import { StationOverviewView } from "../components/StationOverviewView";
import { LiveMapView, LiveAlertItem, CitizenLiveLocation } from "../components/LiveMapView";
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
  const [currentOrg, setCurrentOrg] = useState<OrganizationOption | null>(ORGANIZATIONS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>("LIVE_MAP");
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [incomingAlerts, setIncomingAlerts] = useState<LiveAlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<LiveAlertItem | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [extractedAttire, setExtractedAttire] = useState<string | null>(null);
  const [hasActiveJourney, setHasActiveJourney] = useState<boolean>(false);
  const [citizenLocation, setCitizenLocation] = useState<CitizenLiveLocation | null>(null);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    type: "INFO" | "CRITICAL";
    title: string;
    message: string;
  } | null>(null);

  const dismissedToastsRef = useRef<Set<string>>(new Set());

  const handleDismissToast = (targetTab?: NavTab) => {
    if (activeToast) {
      if (activeToast.type === "CRITICAL") {
        dismissedToastsRef.current.add("red");
      } else {
        dismissedToastsRef.current.add("start");
      }
    }
    setActiveToast(null);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };
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

            // 0. Live Telemetry Ping Stream (Green or Red)
            if (data.type === "TELEMETRY_PING") {
              const isRed = incomingAlerts.some((a) => a.status === "RED") || selectedAlert?.status === "RED";
              const curLat = Number(data.lat);
              const curLng = Number(data.lng);
              const curSpeed = Number(data.speed_kmh ?? 78);
              const curHeading = Number(data.heading_deg ?? 140);
              const newLoc: CitizenLiveLocation = {
                journeyId: data.journey_id || "active_journey",
                lat: curLat,
                lng: curLng,
                speedKmh: curSpeed,
                headingDeg: curHeading,
                gForce: Number(data.g_force ?? 1.1),
                battery: Number(data.battery ?? 90),
                status: isRed ? "RED" : "GREEN",
                citizenName: data.citizen_name || "Thandiwe Ndlovu",
                destinationName: "Sandton City Mall, Sandton",
                timestamp: nowTime,
              };
              setCitizenLocation(newLoc);
              setHasActiveJourney(true);
              if (selectedAlert && selectedAlert.status === "RED") {
                setSelectedAlert((prev) =>
                  prev ? { ...prev, lat: curLat, lng: curLng, speedKmh: curSpeed, headingDeg: curHeading } : null
                );
              }
            }

            // 0b. Initial State Snapshot from Command Hub
            else if (data.type === "SNAPSHOT") {
              if (data.journey && ["GREEN", "AMBER", "RED"].includes(data.journey.status)) {
                const isRed = data.journey.status === "RED";
                setHasActiveJourney(true);
                setCitizenLocation({
                  journeyId: data.journey.journey_id || "active_journey",
                  lat: isRed ? -26.2678 : (data.journey.origin_lat || -26.2585),
                  lng: isRed ? 28.1245 : (data.journey.origin_lng || 28.1215),
                  speedKmh: isRed ? 0 : 64,
                  headingDeg: 140,
                  status: isRed ? "RED" : "GREEN",
                  citizenName: "Thandiwe Ndlovu",
                  destinationName: data.journey.destination_name || "Sandton City Mall, Sandton",
                  timestamp: nowTime,
                });
              }
            }

            // 1. Live Distress Alert Triggered from Mobile
            else if (data.type === "JOURNEY_RED_ALERT" || data.type === "SWARM_AWAKENED") {
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
              setCitizenLocation({
                journeyId: data.journey_id || "active_journey",
                lat: data.lat || -26.2678,
                lng: data.lng || 28.1245,
                speedKmh: data.speed_kmh || 78,
                headingDeg: data.heading_deg || 140,
                status: "RED",
                citizenName: "Thandiwe Ndlovu",
                destinationName: "Sandton City Mall, Sandton",
                timestamp: nowTime,
              });
              ensureBoloJourneyStartMessage();
              ensureBoloRedAlertMessage(data.message);

              dismissedToastsRef.current.delete("red");
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
              setCitizenLocation({
                journeyId: data.journey_id || "active_journey",
                lat: data.lat || -26.2585,
                lng: data.lng || 28.1215,
                speedKmh: data.speed_kmh || 45,
                headingDeg: data.heading_deg || 140,
                status: "GREEN",
                citizenName: data.citizen_name || "Thandiwe Ndlovu",
                destinationName: data.destination || "Sandton City Mall, Sandton",
                timestamp: nowTime,
              });
              ensureBoloJourneyStartMessage(data.destination);

              if (!dismissedToastsRef.current.has("start")) {
                setActiveToast({
                  id: "toast-start-" + Date.now(),
                  type: "INFO",
                  title: "🟢 BOLO Young AI: Active Journey Monitored",
                  message: "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey.",
                });
              }

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

            // 2. Citizen Safely Disarmed (Verified Safe PIN)
            else if (data.type === "JOURNEY_DISARMED") {
              setHasActiveJourney(false);
              setCitizenLocation(null);
              dismissedToastsRef.current.clear();
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
                  description: "Citizen verified safe disarm PIN. Journey disarmed safely, alert stood down.",
                },
                ...prev,
              ]);

              setNotifications((prev) => [
                {
                  id: "notif-disarm-" + Date.now(),
                  timestamp: nowTime,
                  type: "SUCCESS",
                  title: "Journey Disarmed (Safe Arrival)",
                  message: "Citizen verified safe disarm PIN. Journey ended safely. BOLO Young standing down.",
                  source: "BOLO Young",
                  actionType: "OPEN_BOLO",
                },
                ...prev,
              ]);

              // Add Safe Arrival Announcement from BOLO Young to chat history
              try {
                const raw = localStorage.getItem("waypoint_bolo_chat_history");
                const msgs = raw ? JSON.parse(raw) : [];
                const safeArrivalMsg = {
                  id: "msg-safe-arrival-" + Date.now(),
                  sender: "BOLO_YOUNG",
                  senderName: "BOLO Young (Traffic Control)",
                  text: "Constable Morake, Thandiwe Ndlovu has entered verified safe disarm PIN and arrived safely. Safe disarm protocol confirmed. All tactical reaction units are standing down to baseline patrols.",
                  timestamp: nowTime,
                  threatLevel: "NOMINAL",
                  suggestedActions: [
                    {
                      action_id: "SECTOR_SWEEP",
                      label: "🔄 Sector Routine Patrol",
                      rationale: "Return units to standard cruising circuits.",
                      primary: true,
                    },
                    {
                      action_id: "STATION_CHECK",
                      label: "🛡️ Station Readiness Diagnostic",
                      rationale: "Verify communication links with SAPS-302 and Fox-14.",
                      primary: false,
                    },
                  ],
                };
                if (!msgs.some((m: any) => m.id.startsWith("msg-safe-arrival"))) {
                  localStorage.setItem("waypoint_bolo_chat_history", JSON.stringify([...msgs, safeArrivalMsg]));
                  window.dispatchEvent(new Event("waypoint_chat_updated"));
                }
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
              setCitizenLocation(null);
              dismissedToastsRef.current.clear();
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

            if (!dismissedToastsRef.current.has("start")) {
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
            }

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

            if (!dismissedToastsRef.current.has("red")) {
              setActiveToast({
                id: "toast-red",
                type: "CRITICAL",
                title: "🚨 RED ALERT: Citizen Distress Signal",
                message: "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required.",
              });
            }

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
            setCitizenLocation(null);
            dismissedToastsRef.current.clear();
            setActiveToast(null);
          }
        }
      } catch (e) {}
    };

    pollAudit();
    const interval = setInterval(pollAudit, 2000);
    return () => clearInterval(interval);
  }, [currentOrg, apiUrl]);

  // Real-time Corridor Progression Simulation (Advances coordinates every 2.5s when journey is active)
  useEffect(() => {
    if (!hasActiveJourney) return;
    const CORRIDOR_POINTS: [number, number][] = [
      [-26.2585, 28.1215],
      [-26.2602, 28.1220],
      [-26.2625, 28.1228],
      [-26.2650, 28.1235],
      [-26.2678, 28.1245],
    ];
    let step = 0;
    const interval = setInterval(() => {
      setCitizenLocation((prev) => {
        const isRed = prev?.status === "RED" || incomingAlerts.some((a) => a.status === "RED") || selectedAlert?.status === "RED";
        step = (step + 1) % CORRIDOR_POINTS.length;
        const pt = CORRIDOR_POINTS[step];
        const newLat = isRed ? -26.2678 : pt[0];
        const newLng = isRed ? 28.1245 : pt[1];
        const newSpeed = isRed ? 0 : 58 + (step * 4);
        if (selectedAlert && selectedAlert.status === "RED") {
          setSelectedAlert((a) => a ? { ...a, lat: newLat, lng: newLng, speedKmh: newSpeed } : null);
        }
        return {
          journeyId: prev?.journeyId || "active_journey",
          lat: newLat,
          lng: newLng,
          speedKmh: newSpeed,
          headingDeg: 140,
          status: isRed ? "RED" : "GREEN",
          citizenName: "Thandiwe Ndlovu",
          destinationName: prev?.destinationName || "Sandton City Mall, Sandton",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [hasActiveJourney, incomingAlerts, selectedAlert]);

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
    <div className="console">
      {/* Top Header Bar */}
      <BoloConsoleHeader
        notifications={notifications}
        onOpenBoloYoung={() => setActiveTab("BOLO_YOUNG")}
        onClearNotification={handleClearNotification}
        onClearAllNotifications={handleClearAllNotifications}
        isWsConnected={isWsConnected}
      />

      {/* Main Center Area: Left Sidebar + Active View */}
      <div className="workspace">
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
        {activeTab === "LIVE_MAP" ? (
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
            citizenLocation={citizenLocation}
          />
        ) : activeTab === "BOLO_YOUNG" ? (
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex", overflow: "hidden" }}>
            <BoloYoungConsole
              currentOrg={currentOrg}
              hasActiveEmergency={incomingAlerts.some((a) => a.status === "RED") || selectedAlert?.status === "RED"}
              extractedAttire={extractedAttire}
              onAttireExtracted={setExtractedAttire}
              onNavigateToMap={() => setActiveTab("LIVE_MAP")}
            />
          </div>
        ) : (
          <div className="main-content" style={{ display: "flex", flexDirection: "column" }}>
            {activeTab === "OVERVIEW" && (
              <StationOverviewView
                currentOrg={currentOrg}
                recentActivities={recentActivities}
                isWsConnected={isWsConnected}
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
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <BoloConsoleFooter />

      {/* Global Floating Toast Banner (Visible on all dashboard screens) */}
      {activeToast && (
        <div className="fixed top-5 right-6 z-[9999] max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <section
            className="panel"
            style={{
              borderColor: activeToast.type === "CRITICAL" ? "var(--red)" : "var(--orange)",
              borderWidth: "2px",
              boxShadow: activeToast.type === "CRITICAL" ? "0 0 20px rgba(217,56,30,0.35)" : "0 0 20px rgba(230,104,27,0.25)",
            }}
          >
            <div
              className="panel-header"
              style={{
                background: activeToast.type === "CRITICAL" ? "#2a0d09" : "#1f150a",
                borderBottomColor: activeToast.type === "CRITICAL" ? "var(--red)" : "var(--orange)",
              }}
            >
              <div className="panel-title">
                {activeToast.type === "CRITICAL" ? (
                  <ShieldAlert size={16} color="var(--red)" />
                ) : (
                  <Bot size={16} color="var(--orange)" />
                )}
                <span style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                  {activeToast.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDismissToast()}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  padding: "4px",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: "14px 16px", background: "var(--panel-2)" }}>
              <p style={{
                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                fontSize: "11px",
                lineHeight: 1.6,
                color: "#e8e5dc",
                margin: 0,
              }}>
                {activeToast.message}
              </p>

              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleDismissToast("BOLO_YOUNG")}
                  className={`quick ${activeToast.type === "CRITICAL" ? "danger" : ""}`}
                  style={{
                    fontSize: "10px",
                    padding: "6px 14px",
                    borderColor: activeToast.type === "CRITICAL" ? "var(--red)" : "var(--orange)",
                    color: activeToast.type === "CRITICAL" ? "var(--red)" : "var(--orange)",
                  }}
                >
                  <span>ENGAGE BOLO YOUNG</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissToast()}
                  className="quick"
                  style={{ fontSize: "10px", padding: "6px 12px", borderColor: "#555750", color: "var(--muted)" }}
                >
                  DISMISS
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
