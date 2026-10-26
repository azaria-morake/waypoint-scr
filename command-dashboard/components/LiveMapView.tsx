"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Car,
  ChevronRight,
  FileText,
  MapPin,
  MessageSquare,
  Navigation,
  Radio,
  Shield,
  Siren,
  Target,
  Users,
  Zap,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";
import { NotificationItem } from "./NotificationTray";
import { WhatsAppReconModal } from "./WhatsAppReconModal";

export interface LiveAlertItem {
  id: string;
  journeyId: string;
  timestamp: string;
  citizenName: string;
  triggerSource: string;
  lat: number;
  lng: number;
  speedKmh: number;
  headingDeg: number;
  status: "RED" | "RESOLVED";
  message: string;
}

interface LiveMapViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
  incomingAlerts: LiveAlertItem[];
  selectedAlert: LiveAlertItem | null;
  onSelectAlert: (alert: LiveAlertItem | null) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  extractedAttire?: string | null;
  onAttireExtracted?: (attire: string) => void;
  onNavigateToBolo?: () => void;
  notifications?: NotificationItem[];
  onClearNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
}

interface DeviceLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source: string;
}

function Panel({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          {icon}
          <span>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  currentOrg,
  isWsConnected,
  incomingAlerts,
  selectedAlert,
  onSelectAlert,
  onAcknowledgeAlert,
  extractedAttire,
  onAttireExtracted,
  onNavigateToBolo,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const patrolLayerRef = useRef<any>(null);
  const alertLayerRef = useRef<any>(null);
  const userGpsLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const queryIntervalRef = useRef<any>(null);

  // Real Device Geolocation State
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
  const [gpsLockStatus, setGpsLockStatus] = useState<"SEARCHING" | "LOCKED" | "DENIED">("SEARCHING");
  const [queryAttempts, setQueryAttempts] = useState<number>(1);
  const [showLockSuccessAlert, setShowLockSuccessAlert] = useState<boolean>(false);
  const [incidentOpen, setIncidentOpen] = useState<boolean>(true);

  // Dynamic patrol units
  const [patrolUnits, setPatrolUnits] = useState<Array<{
    id: string;
    callsign: string;
    role: string;
    route: [number, number][];
    step: number;
    direction: number;
  }>>([]);

  // WhatsApp Recon State
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [currentAttire, setCurrentAttire] = useState<string | null>(extractedAttire || null);

  useEffect(() => {
    if (extractedAttire) {
      setCurrentAttire(extractedAttire);
    }
  }, [extractedAttire]);

  // Tactical Convergence: redirect patrol units toward the incident
  const handleConvergeUnits = useCallback(() => {
    if (!selectedAlert) return;
    const targetLat = selectedAlert.lat;
    const targetLng = selectedAlert.lng;
    setPatrolUnits((prev) =>
      prev.map((unit, idx) => ({
        ...unit,
        route: [
          [targetLat + (idx === 0 ? 0.0015 : -0.0015), targetLng + (idx === 0 ? 0.0015 : -0.0015)],
          [targetLat, targetLng],
        ],
        step: 0,
      }))
    );
  }, [selectedAlert]);

  // Generate patrol units around the real acquired center [lat, lng] matching mockup
  const generatePatrolUnits = useCallback((centerLat: number, centerLng: number) => {
    return [
      {
        id: "AGENT-01",
        callsign: "Agent 01",
        role: "On Site (Vosloorus)",
        route: [
          [centerLat + 0.022, centerLng + 0.042],
          [centerLat + 0.020, centerLng + 0.040],
          [centerLat + 0.024, centerLng + 0.044],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
      {
        id: "AGENT-02",
        callsign: "Agent 02",
        role: "Patrolling (Thokoza)",
        route: [
          [centerLat - 0.016, centerLng - 0.038],
          [centerLat - 0.014, centerLng - 0.035],
          [centerLat - 0.018, centerLng - 0.040],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
      {
        id: "AGENT-03",
        callsign: "Agent 03",
        role: "Available (Sector 2)",
        route: [
          [centerLat - 0.034, centerLng + 0.002],
          [centerLat - 0.032, centerLng + 0.004],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
      {
        id: "UNIT-NORTH",
        callsign: "Mobile Unit",
        role: "Sector Perimeter Guard",
        route: [
          [centerLat + 0.026, centerLng - 0.012],
          [centerLat + 0.024, centerLng - 0.010],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
    ];
  }, []);

  // Render Officer Real Focal Marker on Leaflet map
  const renderOfficerPin = useCallback(
    (loc: DeviceLocation, flyTo: boolean = true) => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;
      const group = userGpsLayerRef.current;

      if (!L || !map || !group) return;

      group.clearLayers();

      // Accuracy radius circle if available
      if (loc.accuracy && loc.accuracy > 0 && loc.accuracy < 5000) {
        L.circle([loc.lat, loc.lng], {
          radius: loc.accuracy,
          color: "#06b6d4",
          fillColor: "#06b6d4",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "4, 6",
        }).addTo(group);
      }

      // Custom pulsing neon cyan focal radar marker
      const gpsIcon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:#06b6d4;opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:#0891b2;border-radius:50%;border:2px solid #ffffff;color:#fff;font-size:12px;">
              📍
            </div>
          </div>
        `,
        className: "custom-officer-gps",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([loc.lat, loc.lng], {
        icon: gpsIcon,
        zIndexOffset: 1000,
      }).addTo(group);

      if (flyTo) {
        map.invalidateSize();
        map.flyTo([loc.lat, loc.lng], 15, { animate: true, duration: 1.3 });
      }
    },
    []
  );

  // Apply real ground-truth position
  const handleLocationSuccess = useCallback(
    (pos: GeolocationPosition, sourceLabel: string = "Device GPS Lock") => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 20;

      const loc: DeviceLocation = {
        lat,
        lng,
        accuracy,
        timestamp: pos.timestamp,
        source: `${sourceLabel} (±${Math.round(accuracy)}m)`,
      };

      setDeviceLocation(loc);
      setGpsLockStatus("LOCKED");
      setShowLockSuccessAlert(true);
      setPatrolUnits(generatePatrolUnits(lat, lng));
      renderOfficerPin(loc, true);

      setTimeout(() => {
        setShowLockSuccessAlert(false);
      }, 4000);
    },
    [generatePatrolUnits, renderOfficerPin]
  );

  // Continuous Geolocation Query Loop
  const startContinuousGpsQuery = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsLockStatus("DENIED");
      return;
    }

    setGpsLockStatus("SEARCHING");

    const runQuery = () => {
      setQueryAttempts((prev) => prev + 1);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSuccess(pos, "Device Hardware GPS");
          if (queryIntervalRef.current) {
            clearInterval(queryIntervalRef.current);
            queryIntervalRef.current = null;
          }
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setGpsLockStatus("DENIED");
            if (queryIntervalRef.current) {
              clearInterval(queryIntervalRef.current);
              queryIntervalRef.current = null;
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
        }
      );
    };

    runQuery();

    if (watchIdRef.current == null) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            handleLocationSuccess(pos, "Continuous Device GPS Stream");
            if (queryIntervalRef.current) {
              clearInterval(queryIntervalRef.current);
              queryIntervalRef.current = null;
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setGpsLockStatus("DENIED");
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      } catch (e) {
        console.warn("watchPosition error:", e);
      }
    }

    if (queryIntervalRef.current) {
      clearInterval(queryIntervalRef.current);
    }
    queryIntervalRef.current = setInterval(() => {
      setDeviceLocation((current) => {
        if (!current) {
          runQuery();
        } else if (queryIntervalRef.current) {
          clearInterval(queryIntervalRef.current);
          queryIntervalRef.current = null;
        }
        return current;
      });
    }, 3000);
  }, [handleLocationSuccess]);

  // Clean up watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (queryIntervalRef.current) {
        clearInterval(queryIntervalRef.current);
        queryIntervalRef.current = null;
      }
    };
  }, []);

  // Map Initialization Effect
  useEffect(() => {
    let isMounted = true;
    const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_4v5a_1_3ddf73d20da14b7be5f09ab5";

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id != null) {
        delete (container as any)._leaflet_id;
      }

      // Initialize map centered on Katlehong baseline matching tactical console
      const map = L.map(container, {
        center: [-26.315, 28.16],
        zoom: 13,
        zoomControl: false,
      });

      const cartoUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

      const cartoLayer = L.tileLayer(cartoUrl, {
        attribution: '&copy; CARTO',
        subdomains: "abcd",
        minZoom: 1,
        maxZoom: 20,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 6,
      });

      const osmFallback = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
          updateWhenIdle: false,
        }
      );

      cartoLayer.on("tileerror", () => {
        if (!map.hasLayer(osmFallback)) {
          osmFallback.addTo(map);
        }
      });

      cartoLayer.addTo(map);

      userGpsLayerRef.current = L.layerGroup().addTo(map);
      patrolLayerRef.current = L.layerGroup().addTo(map);
      alertLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Click on map: manual repositioning fallback
      map.on("click", (e: any) => {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;
        const manualLoc: DeviceLocation = {
          lat: clickedLat,
          lng: clickedLng,
          accuracy: 10,
          timestamp: Date.now(),
          source: "Manual Terminal Map Pin",
        };
        setDeviceLocation(manualLoc);
        setGpsLockStatus("LOCKED");
        setPatrolUnits(generatePatrolUnits(clickedLat, clickedLng));
        renderOfficerPin(manualLoc, false);
      });

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMoveEvents: true });
          }
        });
        ro.observe(container);
      }

      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 350);

      startContinuousGpsQuery();

      return () => {
        if (ro) ro.disconnect();
      };
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Patrol Movement Animation Loop (every 2.5s)
  useEffect(() => {
    if (patrolUnits.length === 0) return;

    const timer = setInterval(() => {
      setPatrolUnits((prev) =>
        prev.map((unit) => {
          let nextStep = unit.step + unit.direction;
          let nextDir = unit.direction;
          if (nextStep >= unit.route.length) {
            nextStep = unit.route.length - 2;
            nextDir = -1;
          } else if (nextStep < 0) {
            nextStep = 1;
            nextDir = 1;
          }
          return { ...unit, step: nextStep, direction: nextDir };
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, [patrolUnits.length]);

  // Render Moving Patrol Units on Leaflet Layer
  useEffect(() => {
    const L = leafletRef.current;
    const group = patrolLayerRef.current;
    if (!L || !group || patrolUnits.length === 0) return;

    group.clearLayers();

    patrolUnits.forEach((unit) => {
      const coords = unit.route[unit.step] || unit.route[0];

      const carIcon = L.divIcon({
        html: `
          <div style="width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#0b2625;color:#3ad7bd;box-shadow:0 0 0 2px rgba(37,201,173,0.12);">
            🚗
          </div>
        `,
        className: "patrol-marker-moving",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker(coords, { icon: carIcon })
        .bindPopup(`
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;padding:4px;">
            <b style="color:#25c9ad;">${unit.callsign}</b>
            <div style="color:#aaa;">${unit.role}</div>
          </div>
        `)
        .addTo(group);
    });
  }, [patrolUnits]);

  // Render Active Emergency Triggers & Tactical Geofence
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = alertLayerRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    const coords: [number, number] =
      selectedAlert && selectedAlert.status === "RED"
        ? [selectedAlert.lat, selectedAlert.lng]
        : [-26.315, 28.16];

    // Tactical Geofence Outer (Red translucent ring with solid border)
    L.circle(coords, {
      radius: 4600,
      color: "#ff3e24",
      fillColor: "#c22b1b",
      fillOpacity: 0.18,
      weight: 2,
    }).addTo(group);

    // Tactical Geofence Inner Ring
    L.circle(coords, {
      radius: 2200,
      color: "#ff3e24",
      fillColor: "rgba(95, 22, 17, 0.2)",
      fillOpacity: 0.2,
      weight: 2,
      dashArray: "6, 6",
    }).addTo(group);

    // Agent Route (Amber dotted line approaching target)
    const routeCoords: [number, number][] = [
      [coords[0] + 0.018, coords[1] - 0.028],
      [coords[0] + 0.009, coords[1] - 0.012],
      coords,
    ];
    L.polyline(routeCoords, {
      color: "#eba823",
      weight: 2.5,
      dashArray: "9, 5",
    }).addTo(group);

    // BOLO Young Waypoint Triangle Marker
    const boloMarkerIcon = L.divIcon({
      html: `
        <div style="color:#eba823;font-size:16px;">
          ▲
        </div>
      `,
      className: "bolo-route-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker(routeCoords[0], { icon: boloMarkerIcon })
      .bindPopup(`<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;font-bold;color:#eba823;">BOLO Young Route Intercept</div>`)
      .addTo(group);

    // Town Labels
    const createTownLabel = (name: string) =>
      L.divIcon({
        html: `<div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#e5e4dd;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${name}</div>`,
        className: "tactical-town-marker",
        iconSize: [90, 20],
        iconAnchor: [45, 10],
      });

    L.marker([coords[0] + 0.003, coords[1]], { icon: createTownLabel("Katlehong"), interactive: false }).addTo(group);
    L.marker([coords[0] + 0.024, coords[1] + 0.045], { icon: createTownLabel("Vosloorus"), interactive: false }).addTo(group);
    L.marker([coords[0] - 0.016, coords[1] - 0.04], { icon: createTownLabel("Thokoza"), interactive: false }).addTo(group);

    // Center Incident Core Dot
    const distressIcon = L.divIcon({
      html: `
        <div style="width:20px;height:20px;border-radius:50%;background:#f5f2e9;border:6px solid #d9381e;box-shadow:0 0 18px rgba(255,67,41,0.8);"></div>
      `,
      className: "crisis-marker-live",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const citizenTitle = selectedAlert?.citizenName || "POSSIBLE GBV - DISTRESS SIGNAL";

    L.marker(coords, { icon: distressIcon })
      .bindPopup(`
        <div style="font-family:'IBM Plex Mono',monospace;padding:6px;font-size:11px;min-width:210px;">
          <div style="font-weight:700;color:#d9381e;">ACTIVE INCIDENT</div>
          <div style="font-weight:700;margin-top:2px;color:#111;">${citizenTitle}</div>
          <div style="color:#555;font-size:10px;margin-top:2px;">${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}</div>
          ${currentAttire ? `<div style="margin-top:4px;padding:3px;background:#e6fffa;border:1px solid #38b2ac;color:#234e52;border-radius:3px;">Attire: ${currentAttire}</div>` : ""}
        </div>
      `)
      .addTo(group);

    if (selectedAlert) {
      map.flyTo(coords, 14, { animate: true });
    }
  }, [selectedAlert, currentAttire]);

  const handleRecenter = () => {
    if (deviceLocation) {
      renderOfficerPin(deviceLocation, true);
    } else {
      startContinuousGpsQuery();
    }
  };

  return (
    <div className="main-content">
      {/* INCIDENT STRIP */}
      {incidentOpen && (
        <div className="incident-strip">
          <div className="incident-symbol">
            <AlertTriangle size={26} />
          </div>

          <div className="incident-copy">
            <span>ACTIVE INCIDENT</span>
            <strong>{selectedAlert ? selectedAlert.message : "POSSIBLE GBV - DISTRESS SIGNAL"}</strong>
            <small>
              Katlehong, Gauteng&nbsp;&nbsp;•&nbsp;&nbsp;4.2 km&nbsp;&nbsp;•&nbsp;&nbsp;{selectedAlert ? selectedAlert.timestamp : "3 min ago"}
              {currentAttire && `  •  Attire: ${currentAttire}`}
            </small>
          </div>

          <button className="details-button" type="button" onClick={onNavigateToBolo}>
            VIEW DETAILS
            <ChevronRight size={18} />
          </button>

          <button
            className="close-incident"
            type="button"
            onClick={() => setIncidentOpen(false)}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ACTION ROW */}
      <div className="action-row">
        <button
          type="button"
          className="action-button whatsapp"
          onClick={() => setIsWhatsAppOpen(true)}
        >
          <MessageSquare size={21} />
          <span>
            WHATSAPP
            <br />
            RECON
          </span>
        </button>

        <button
          type="button"
          className="action-button"
          onClick={() => window.open("/bolo-young", "BoloYoungConsole", "width=1280,height=820")}
        >
          <Navigation size={21} />
          <span>
            OPEN IN NEW
            <br />
            WINDOW
          </span>
        </button>

        <button
          type="button"
          className="action-button tactical"
          onClick={handleRecenter}
        >
          <MapPin size={21} />
          <span>
            LIVE TACTICAL
            <br />
            MAP
          </span>
        </button>
      </div>

      {/* DASHBOARD GRID: MAP + RIGHT COLUMN */}
      <div className="dashboard-grid">
        <div className="primary-column">
          {/* MAP CANVAS */}
          <div className="map">
            {/* North Compass Indicator */}
            <div className="north">
              <span>N</span>
              <div />
            </div>

            {/* Tactical Scale Indicator */}
            <div className="map-scale">
              <span>2 km</span>
              <div />
            </div>

            {/* Tactical Legend Box */}
            <div className="map-legend">
              <div>
                <span className="legend-dot red-dot" />
                Incident Location
              </div>
              <div>
                <span className="legend-ring" />
                Geofence (20km)
              </div>
              <div>
                <span className="legend-route" />
                Agent Route
              </div>
              <div>
                <Car size={14} />
                Mobile Unit
              </div>
              <div>
                <span className="legend-triangle" />
                BOLO Young
              </div>
            </div>

            {/* GPS Lock Overlays */}
            {gpsLockStatus === "SEARCHING" && (
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "60px",
                  zIndex: 20,
                  background: "rgba(10,14,15,0.9)",
                  border: "1px solid var(--amber)",
                  borderRadius: "3px",
                  padding: "4px 10px",
                  color: "var(--amber)",
                  fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>Acquiring Device GPS... (#{queryAttempts})</span>
              </div>
            )}

            {showLockSuccessAlert && deviceLocation && (
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "60px",
                  zIndex: 20,
                  background: "rgba(10,14,15,0.9)",
                  border: "1px solid #18d49e",
                  borderRadius: "3px",
                  padding: "4px 10px",
                  color: "#18d49e",
                  fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle2 size={13} />
                <span>GPS Locked (±{Math.round(deviceLocation.accuracy)}m)</span>
              </div>
            )}

            {/* Real Interactive Leaflet Map Layer */}
            <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} />
          </div>

          {/* BOLO COMMAND BAR */}
          <div className="bolo-command">
            <div className="bolo-icon">
              <Activity size={28} />
            </div>

            <div className="bolo-info">
              <div>
                BOLO YOUNG
                <span className="status-pill green">ACTIVE</span>
              </div>
              <small>Traffic Control AI Guardian</small>
            </div>

            <div className="command-divider" />

            <div className="command-message">
              “Unit 01, confirm visual on suspect.
              <br />
              Maintain 2 block perimeter.”
            </div>

            <div className="command-time">
              22:26:41
              <Activity size={16} />
            </div>
          </div>

          {/* BOTTOM CONTROL ROW */}
          <div className="bottom-grid">
            <Panel title="QUICK ACTIONS" icon={<Zap size={17} />}>
              <div className="quick-actions">
                <button
                  type="button"
                  className="quick danger"
                  onClick={() => alert("🚨 PANIC DISPATCH: All available sector units converging on Katlehong hotspot.")}
                >
                  <AlertTriangle size={17} />
                  PANIC
                </button>
                <button
                  type="button"
                  className="quick"
                  onClick={handleConvergeUnits}
                >
                  <Siren size={17} />
                  DISPATCH
                </button>
                <button
                  type="button"
                  className="quick"
                  onClick={onNavigateToBolo}
                >
                  <FileText size={17} />
                  LOG INCIDENT
                </button>
                <button
                  type="button"
                  className="quick"
                  onClick={() => {
                    navigator.clipboard?.writeText("-26.315, 28.16 (Katlehong, Gauteng)");
                    alert("Sector Coordinates copied: -26.315, 28.16");
                  }}
                >
                  <MapPin size={17} />
                  SHARE LOCATION
                </button>
              </div>
            </Panel>

            <Panel title="SYSTEM METRICS" icon={<BarChart3 size={17} />}>
              <div className="metrics">
                <Metric label="ACTIVE AGENTS" value="4/6" />
                <Metric label="AVG. RESPONSE" value="2.8 min" />
                <Metric label="CITIZEN REPORTS" value="12 (24h)" />
                <Metric label="UPTIME" value="99.9%" />
              </div>
            </Panel>

            <Panel
              title="POPIA / PRIVACY"
              icon={<Shield size={17} />}
              action={<span className="status-pill green">● COMPLIANT</span>}
            >
              <div className="privacy">
                <div>Zero-Knowledge Architecture</div>
                <div>End-to-End Encryption</div>
                <div>No Personal Data Storage</div>
              </div>
            </Panel>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="right-column">
          <Panel
            title="LIVE INCIDENT FEED"
            icon={<Radio size={17} />}
            action={<span className="status-pill green">● AUTO-REFRESH</span>}
          >
            <div className="incident-feed">
              {incomingAlerts.map((alert) => (
                <div
                  className="feed-item"
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="feed-top">
                    <span className="severity high">HIGH</span>
                    <strong>{alert.citizenName} • {alert.triggerSource}</strong>
                    <time>{alert.timestamp}</time>
                  </div>

                  <div className="feed-location">
                    {alert.lat.toFixed(4)}°, {alert.lng.toFixed(4)}°&nbsp;&nbsp;•&nbsp;&nbsp;{alert.speedKmh} km/h
                  </div>

                  <p>{alert.message}</p>
                </div>
              ))}

              <div
                className="feed-item"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([-26.315, 28.16], 14, { animate: true });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="feed-top">
                  <span className="severity high">HIGH</span>
                  <strong>POSSIBLE GBV - DISTRESS SIGNAL</strong>
                  <time>22:23</time>
                </div>

                <div className="feed-location">
                  Katlehong, Gauteng&nbsp;&nbsp;•&nbsp;&nbsp;4.2 km
                </div>

                <p>Subject sent SOS via Waypoint. Audio stream active.</p>
              </div>

              <div className="feed-item">
                <div className="feed-top">
                  <span className="severity med">MED</span>
                  <strong>SUSPICIOUS VEHICLE</strong>
                  <time>22:17</time>
                </div>

                <div className="feed-location">
                  Vosloorus, Gauteng&nbsp;&nbsp;•&nbsp;&nbsp;7.8 km
                </div>

                <p>Plate: BZ 74 PL GP. Moving north. No units on scene.</p>
              </div>

              <div className="feed-item">
                <div className="feed-top">
                  <span className="severity low">LOW</span>
                  <strong>THEFT IN PROGRESS</strong>
                  <time>22:03</time>
                </div>

                <div className="feed-location">
                  Thokoza, Gauteng&nbsp;&nbsp;•&nbsp;&nbsp;12.1 km
                </div>

                <p>Citizen report via app. Units dispatched.</p>
              </div>
            </div>
          </Panel>

          <Panel
            title="AGENT STATUS"
            icon={<Users size={17} />}
            action={<span className="status-pill neutral">4 ACTIVE</span>}
          >
            <div className="agent-table">
              <div className="table-head">
                <span>AGENT</span>
                <span>STATUS</span>
                <span>LOCATION</span>
                <span>ETA</span>
              </div>

              {/* Row 1: BOLO Young */}
              <div className="agent-row">
                <span className="agent-name">
                  <Target size={15} />
                  BOLO Young
                </span>
                <span className="status-pill orange">EN ROUTE</span>
                <span>Katlehong</span>
                <span>3 min</span>
              </div>

              {/* Row 2: Agent 01 */}
              <div className="agent-row">
                <span className="agent-name">
                  <Car size={15} />
                  Agent 01
                </span>
                <span className="status-pill green">ON SITE</span>
                <span>Vosloorus</span>
                <span>6 min</span>
              </div>

              {/* Row 3: Agent 02 */}
              <div className="agent-row">
                <span className="agent-name">
                  <Car size={15} />
                  Agent 02
                </span>
                <span className="status-pill blue">PATROLLING</span>
                <span>Thokoza</span>
                <span>12 min</span>
              </div>

              {/* Row 4: Agent 03 */}
              <div className="agent-row">
                <span className="agent-name">
                  <Car size={15} />
                  Agent 03
                </span>
                <span className="status-pill neutral">AVAILABLE</span>
                <span>Sector 2</span>
                <span>—</span>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      {/* Real-time Next-of-Kin WhatsApp Recon Modal */}
      <WhatsAppReconModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onAttireExtracted={(attire) => {
          setCurrentAttire(attire);
          if (onAttireExtracted) onAttireExtracted(attire);
        }}
      />
    </div>
  );
};
