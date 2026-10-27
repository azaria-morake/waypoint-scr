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

export interface CitizenLiveLocation {
  journeyId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  headingDeg: number;
  gForce?: number;
  battery?: number;
  status: "GREEN" | "RED";
  citizenName: string;
  destinationName?: string;
  timestamp: string;
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
  citizenLocation?: CitizenLiveLocation | null;
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
  citizenLocation,
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

  // Render Dynamic Citizen Movement & Tactical Corridor Layer (Green or Red)
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = alertLayerRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    const isJourneyActive = Boolean(citizenLocation || selectedAlert);
    const isRed = (citizenLocation && citizenLocation.status === "RED") || (selectedAlert && selectedAlert.status === "RED");

    const coords: [number, number] = citizenLocation
      ? [citizenLocation.lat, citizenLocation.lng]
      : selectedAlert
      ? [selectedAlert.lat, selectedAlert.lng]
      : [-26.2585, 28.1215];

    // Real Gauteng Alberton -> Sandton Transit Corridor Waypoints
    const corridorRoute: [number, number][] = [
      [-26.2585, 28.1215], // 14 8th Ave, Alberton North (Departure)
      [-26.2602, 28.1220], // Hendrik Potgieter St
      [-26.2625, 28.1228], // Voortrekker Rd
      [-26.2650, 28.1235], // Approach
      [-26.2678, 28.1245], // N12 on-ramp corridor (Distress Anomaly site)
    ];

    // 1. Draw Origin Marker (Departure)
    const originIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;background:#0f172a;border:2px solid #38bdf8;border-radius:50%;color:#38bdf8;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(56,189,248,0.5);">A</div>`,
      className: "corridor-origin-pin",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(corridorRoute[0], { icon: originIcon })
      .bindPopup(`<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;"><b>Departure Point</b><br/>14 8th Ave, Alberton North</div>`)
      .addTo(group);

    // 2. Draw Destination Marker (Sandton City Mall)
    const destIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;background:#0f172a;border:2px solid #10b981;border-radius:50%;color:#10b981;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(16,185,129,0.5);">B</div>`,
      className: "corridor-dest-pin",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(corridorRoute[corridorRoute.length - 1], { icon: destIcon })
      .bindPopup(`<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;"><b>Target Destination</b><br/>${citizenLocation?.destinationName || "Sandton City Mall, Sandton"}</div>`)
      .addTo(group);

    // 3. Draw Corridor Polyline (Green when safe transit, Red dashed when distressed)
    L.polyline(corridorRoute, {
      color: isRed ? "#ef4444" : "#10b981",
      weight: 4,
      opacity: 0.85,
      dashArray: isRed ? "8, 6" : undefined,
    }).addTo(group);

    // 4. Sector Town Labels
    const createTownLabel = (name: string) =>
      L.divIcon({
        html: `<div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#e5e4dd;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${name}</div>`,
        className: "tactical-town-marker",
        iconSize: [90, 20],
        iconAnchor: [45, 10],
      });

    L.marker([corridorRoute[0][0] - 0.003, corridorRoute[0][1] + 0.005], { icon: createTownLabel("Alberton North"), interactive: false }).addTo(group);
    L.marker([-26.315 + 0.003, 28.16], { icon: createTownLabel("Katlehong"), interactive: false }).addTo(group);
    L.marker([-26.315 + 0.024, 28.16 + 0.045], { icon: createTownLabel("Vosloorus"), interactive: false }).addTo(group);
    L.marker([-26.315 - 0.016, 28.16 - 0.04], { icon: createTownLabel("Thokoza"), interactive: false }).addTo(group);

    // 5. Citizen Live Movement Pin (Green or Red)
    if (isRed) {
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

      // Intercept route vector
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

      // BOLO Young Intercept Marker
      const boloMarkerIcon = L.divIcon({
        html: `<div style="color:#eba823;font-size:16px;">▲</div>`,
        className: "bolo-route-icon",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(routeCoords[0], { icon: boloMarkerIcon })
        .bindPopup(`<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:bold;color:#eba823;">BOLO Young Intercept Vector</div>`)
        .addTo(group);

      // Pulsing RED Distress Marker
      const redDistressIcon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <div style="position:absolute;width:46px;height:46px;border-radius:50%;background:#ef4444;opacity:0.4;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:#dc2626;opacity:0.6;animation:pulse 1.8s ease-in-out infinite;"></div>
            <div style="position:relative;width:26px;height:26px;border-radius:50%;background:#b91c1c;border:2.5px solid #ffffff;color:#fff;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(239,68,68,0.95);">
              SOS
            </div>
          </div>
        `,
        className: "crisis-marker-live",
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });

      const citizenTitle = citizenLocation?.citizenName || selectedAlert?.citizenName || "Thandiwe Ndlovu";

      L.marker(coords, { icon: redDistressIcon, zIndexOffset: 2000 })
        .bindPopup(`
          <div style="font-family:'IBM Plex Mono',monospace;padding:6px;font-size:11px;min-width:220px;">
            <div style="font-weight:700;color:#d9381e;">🚨 CODE RED DISTRESS EVENT</div>
            <div style="font-weight:700;margin-top:2px;color:#111;">${citizenTitle}</div>
            <div style="color:#555;font-size:10px;margin-top:2px;">${coords[0].toFixed(5)}°, ${coords[1].toFixed(5)}° • ${citizenLocation?.speedKmh ?? 0} km/h</div>
            <div style="color:#b91c1c;font-size:10px;margin-top:2px;font-weight:600;">Status: Struggle Anomaly / Panic Triggered</div>
            ${currentAttire ? `<div style="margin-top:4px;padding:3px;background:#e6fffa;border:1px solid #38b2ac;color:#234e52;border-radius:3px;">Attire: ${currentAttire}</div>` : ""}
          </div>
        `)
        .addTo(group);
    } else {
      // Pulsing GREEN Safe Transit Beacon Marker
      const greenTransitIcon = L.divIcon({
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <div style="position:absolute;width:42px;height:42px;border-radius:50%;background:#10b981;opacity:0.35;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:#059669;opacity:0.5;animation:pulse 2s ease-in-out infinite;"></div>
            <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#047857;border:2px solid #ffffff;color:#fff;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(16,185,129,0.85);">
              ▲
            </div>
          </div>
        `,
        className: "green-transit-marker-live",
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const citizenTitle = citizenLocation?.citizenName || "Thandiwe Ndlovu";

      L.marker(coords, { icon: greenTransitIcon, zIndexOffset: 2000 })
        .bindPopup(`
          <div style="font-family:'IBM Plex Mono',monospace;padding:6px;font-size:11px;min-width:220px;">
            <div style="font-weight:700;color:#059669;">🟢 SAFE JOURNEY ACTIVE</div>
            <div style="font-weight:700;margin-top:2px;color:#111;">${citizenTitle}</div>
            <div style="color:#555;font-size:10px;margin-top:2px;">${coords[0].toFixed(5)}°, ${coords[1].toFixed(5)}° • ${citizenLocation?.speedKmh ?? 68} km/h</div>
            <div style="color:#047857;font-size:10px;margin-top:2px;font-weight:600;">Stream: 1Hz WSS Locked • Corridor Nominal</div>
          </div>
        `)
        .addTo(group);
    }

    if (isJourneyActive) {
      map.panTo(coords, { animate: true, duration: 0.8 });
    }
  }, [citizenLocation, selectedAlert, currentAttire]);

  const handleRecenter = () => {
    if (citizenLocation) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([citizenLocation.lat, citizenLocation.lng], 15, { animate: true });
      }
    } else if (deviceLocation) {
      renderOfficerPin(deviceLocation, true);
    } else {
      startContinuousGpsQuery();
    }
  };

  const isRed = (citizenLocation && citizenLocation.status === "RED") || (selectedAlert && selectedAlert.status === "RED");
  const isSafeActive = citizenLocation && citizenLocation.status === "GREEN";

  return (
    <div className="main-content">
      {/* INCIDENT / JOURNEY STRIP */}
      {incidentOpen && (
        <div className={`incident-strip ${isSafeActive ? "safe-journey-strip" : ""}`} style={{ borderColor: isSafeActive ? "rgba(16,185,129,0.4)" : undefined, background: isSafeActive ? "linear-gradient(90deg, rgba(6,78,59,0.25) 0%, rgba(15,23,42,0.9) 100%)" : undefined }}>
          <div className="incident-symbol" style={{ color: isSafeActive ? "#10b981" : "#ff3e24" }}>
            {isSafeActive ? <Navigation size={26} /> : <AlertTriangle size={26} />}
          </div>

          <div className="incident-copy">
            <span style={{ color: isSafeActive ? "#10b981" : "#ff3e24" }}>
              {isRed ? "ACTIVE INCIDENT" : isSafeActive ? "SAFE TRANSIT ACTIVE" : "SECTOR PATROL STANDBY"}
            </span>
            <strong style={{ color: isSafeActive ? "#e6fffa" : "#fff" }}>
              {isRed
                ? (selectedAlert ? selectedAlert.message : "🚨 CODE RED DISTRESS SIGNAL • Rapid Response Intercept Deployed")
                : isSafeActive
                ? `🟢 ${citizenLocation?.citizenName || "Thandiwe Ndlovu"} en route to ${citizenLocation?.destinationName || "Sandton City Mall"}`
                : "Sector 2 Corridor Watchdog Active • Zero Active Distress Beacons"}
            </strong>
            <small style={{ color: isSafeActive ? "#94a3b8" : undefined }}>
              {isRed
                ? `Alberton / N12 Corridor • ${(citizenLocation?.lat || selectedAlert?.lat || -26.2678).toFixed(4)}°, ${(citizenLocation?.lng || selectedAlert?.lng || 28.1245).toFixed(4)}° • ${citizenLocation?.speedKmh ?? 0} km/h ${currentAttire ? `• Attire: ${currentAttire}` : ""}`
                : isSafeActive
                ? `Alberton Corridor • ${(citizenLocation?.lat || -26.2585).toFixed(4)}°, ${(citizenLocation?.lng || 28.1215).toFixed(4)}° • ${citizenLocation?.speedKmh ?? 68} km/h • 1Hz WSS Nominal`
                : "Katlehong / Vosloorus / Thokoza Sector • 4 Reaction Units Cruising"}
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
                <span className="legend-dot green-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                Safe Transit
              </div>
              <div>
                <span className="legend-dot red-dot" />
                Distress (SOS)
              </div>
              <div>
                <span className="legend-ring" />
                Geofence Ring
              </div>
              <div>
                <span className="legend-route" />
                Corridor Vector
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
