"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  Crosshair,
  Radio,
  Compass,
  Car,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  MapPin,
  Locate,
  Volume2,
  Clock,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Satellite,
  AlertCircle,
  Loader2,
  Bot,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  FileText,
  Share2,
  BarChart2,
  Zap,
  Network,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";
import { NotificationTray, NotificationItem } from "./NotificationTray";
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
  notifications = [],
  onClearNotification = () => {},
  onClearAllNotifications = () => {},
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const patrolLayerRef = useRef<any>(null);
  const alertLayerRef = useRef<any>(null);
  const userGpsLayerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const queryIntervalRef = useRef<any>(null);

  // Real Device Geolocation State
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
  const [gpsLockStatus, setGpsLockStatus] = useState<"SEARCHING" | "LOCKED" | "DENIED">("SEARCHING");
  const [queryAttempts, setQueryAttempts] = useState<number>(1);
  const [showLockSuccessAlert, setShowLockSuccessAlert] = useState<boolean>(false);

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
          <div class="relative flex items-center justify-center cursor-pointer">
            <span class="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-cyan-400 opacity-60"></span>
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-cyan-500/40"></span>
            <div class="relative flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-full border-2 border-white shadow-2xl text-slate-950 font-black text-sm">
              📍
            </div>
          </div>
        `,
        className: "custom-officer-gps",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([loc.lat, loc.lng], {
        icon: gpsIcon,
        zIndexOffset: 1000,
      }).addTo(group);

      const accStr = loc.accuracy ? `±${Math.round(loc.accuracy)}m` : "Ground-Truth";

      marker.bindPopup(`
        <div class="p-2.5 font-sans text-xs min-w-[220px]">
          <div class="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-200">
            <span class="font-black text-cyan-600 uppercase text-[10px] tracking-wider">Terminal Focal Point</span>
            <span class="bg-cyan-50 text-cyan-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">GPS LOCKED</span>
          </div>
          <div class="font-bold text-slate-900 text-sm">${currentOrg.officerName}</div>
          <div class="text-slate-600 text-xs font-medium">${currentOrg.name} (${currentOrg.officerRank})</div>
          <div class="mt-2 text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
            <div><b>LAT:</b> ${loc.lat.toFixed(5)}° S</div>
            <div><b>LNG:</b> ${loc.lng.toFixed(5)}° E</div>
            <div class="text-[10px] text-cyan-700 font-semibold">ACCURACY: ${accStr}</div>
          </div>
          <div class="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            ✓ ${loc.source}
          </div>
        </div>
      `);

      if (flyTo) {
        map.invalidateSize();
        map.flyTo([loc.lat, loc.lng], 15, { animate: true, duration: 1.3 });
        setTimeout(() => {
          marker.openPopup();
        }, 1400);
      }
    },
    [currentOrg]
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

      // Dismiss lock success badge after 4 seconds
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

    // Single query execution
    const runQuery = () => {
      setQueryAttempts((prev) => prev + 1);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSuccess(pos, "Device Hardware GPS");
          // Clear polling loop once acquired
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
          } else {
            console.warn(`GPS query attempt #${queryAttempts} waiting:`, err.message);
            // Keep searching...
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0, // Force fresh real-time sensor reading
        }
      );
    };

    // 1. Initial immediate query
    runQuery();

    // 2. Set up watchPosition for stream updates
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

    // 3. Keep polling every 3 seconds until lock is established
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
  }, [handleLocationSuccess, queryAttempts]);

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

      // Clean up previous instance
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

      // Carto Dark Matter standard raster tiles with authorized key
      const cartoUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

      const cartoLayer = L.tileLayer(cartoUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        minZoom: 1,
        maxZoom: 20,
        updateWhenIdle: false, // Don't delay tile loading!
        updateWhenZooming: true,
        keepBuffer: 6,
      });

      const osmFallback = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
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

      // Dedicated layer groups
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

      // Attach ResizeObserver to container to guarantee tiles update on ANY zoom/layout change
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMoveEvents: true });
          }
        });
        ro.observe(container);
      }

      // Multi-pass size invalidation as browser renders frames
      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 350);
      setTimeout(() => map.invalidateSize(), 700);

      // Start continuous real GPS querying immediately
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
      const isSaps = unit.id.startsWith("SAPS");

      const carIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center transition-all duration-700">
            <div class="w-6 h-6 rounded-full bg-[#082a27] border border-[#2dd4bf] shadow-md flex items-center justify-center text-[#2dd4bf] text-xs">
              🚗
            </div>
          </div>
        `,
        className: "patrol-marker-moving",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(coords, { icon: carIcon })
        .bindPopup(`
          <div class="p-2 font-sans text-xs">
            <div class="font-bold text-[#2dd4bf]">${unit.callsign}</div>
            <div class="text-slate-700 text-[11px] font-semibold">${unit.role}</div>
            <div class="text-slate-500 text-[10px] mt-0.5">Patrolling Active Sector Beat</div>
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

    // Focal coordinates (Selected alert or Katlehong demo incident hotspot)
    const coords: [number, number] =
      selectedAlert && selectedAlert.status === "RED"
        ? [selectedAlert.lat, selectedAlert.lng]
        : [-26.315, 28.16];

    // 1. Tactical Geofence Outer (Red translucent ring with solid border)
    L.circle(coords, {
      radius: 4600,
      color: "#dc2626",
      fillColor: "#dc2626",
      fillOpacity: 0.16,
      weight: 1.8,
    }).addTo(group);

    // 2. Tactical Geofence Inner Ring
    L.circle(coords, {
      radius: 2200,
      color: "#ef4444",
      fillColor: "transparent",
      weight: 1.2,
      dashArray: "4, 4",
    }).addTo(group);

    // 3. Agent Route (Amber dotted line approaching target)
    const routeCoords: [number, number][] = [
      [coords[0] + 0.018, coords[1] - 0.028],
      [coords[0] + 0.009, coords[1] - 0.012],
      coords,
    ];
    L.polyline(routeCoords, {
      color: "#f59e0b",
      weight: 2,
      dashArray: "4, 4",
    }).addTo(group);

    // 4. BOLO Young Waypoint Triangle Marker
    const boloMarkerIcon = L.divIcon({
      html: `
        <div class="w-5 h-5 rounded bg-amber-500 border border-white text-black font-black text-[10px] flex items-center justify-center shadow-md">
          ▲
        </div>
      `,
      className: "bolo-route-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker(routeCoords[0], { icon: boloMarkerIcon })
      .bindPopup(`<div class="p-1.5 font-mono text-xs font-bold text-amber-500">BOLO Young Route Intercept Vector</div>`)
      .addTo(group);

    // 5. Town Labels
    const createTownLabel = (name: string) =>
      L.divIcon({
        html: `<div class="text-[11px] font-mono font-bold text-slate-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] select-none pointer-events-none">${name}</div>`,
        className: "tactical-town-marker",
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });

    L.marker([coords[0] + 0.003, coords[1]], { icon: createTownLabel("Katlehong"), interactive: false }).addTo(group);
    L.marker([coords[0] + 0.024, coords[1] + 0.045], { icon: createTownLabel("Vosloorus"), interactive: false }).addTo(group);
    L.marker([coords[0] - 0.016, coords[1] - 0.04], { icon: createTownLabel("Thokoza"), interactive: false }).addTo(group);

    // 6. Center Incident Hotspot Pin
    const distressIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-red-500 opacity-75"></span>
          <div class="relative flex items-center justify-center w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow-2xl text-white font-black text-[8px]">
            ●
          </div>
        </div>
      `,
      className: "crisis-marker-live",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const attireHtml = currentAttire
      ? `<div class="mt-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] leading-tight">
           <div class="font-bold text-emerald-800 flex items-center gap-1">✓ Verified Attire (NOK Recon):</div>
           <div class="mt-0.5 font-medium">${currentAttire}</div>
         </div>`
      : `<div class="mt-2 p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] leading-tight">
           <div class="font-bold text-amber-800">⚠️ Attire Unconfirmed</div>
           <div class="text-slate-600 mt-0.5">Deploy WhatsApp Recon to verify clothing</div>
         </div>`;

    const citizenTitle = selectedAlert?.citizenName || "POSSIBLE GBV - DISTRESS SIGNAL";
    const triggerText = selectedAlert?.triggerSource || "Subject sent SOS via Waypoint";

    L.marker(coords, { icon: distressIcon })
      .bindPopup(`
        <div class="p-2 font-sans text-xs min-w-[200px]">
          <div class="font-black text-red-600 text-xs">🚨 CODE RED DISTRESS SIGNAL</div>
          <div class="font-bold text-slate-900 mt-1">${citizenTitle}</div>
          <div class="text-slate-600 text-[11px] mt-0.5">Trigger: <b>${triggerText}</b></div>
          <div class="text-slate-500 font-mono text-[10px] mt-1">${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}</div>
          ${attireHtml}
        </div>
      `)
      .addTo(group);

    if (selectedAlert) {
      map.flyTo(coords, 14, { animate: true });
    }
  }, [selectedAlert, currentAttire]);

  // Recenter Click Handler
  const handleRecenter = () => {
    if (deviceLocation) {
      renderOfficerPin(deviceLocation, true);
    } else {
      startContinuousGpsQuery();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden select-none bg-[#090a0f] p-3 gap-2.5">
      {/* Top Banner Row: Active Incident Alert Card + 3 Header Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch gap-2.5 flex-shrink-0">
        {/* Left: Active Incident Alert Card (Solid Crimson) */}
        <div className="flex-1 bg-[#c2221b] border border-red-700 rounded p-2.5 px-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Rounded red warning square */}
            <div className="w-10 h-10 rounded bg-[#d63832] flex items-center justify-center flex-shrink-0 text-white shadow-inner">
              <AlertTriangle className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="bg-[#f59e0b] text-black font-extrabold text-[9.5px] px-2 py-0.5 rounded-sm font-mono uppercase tracking-wider">
                  ACTIVE INCIDENT
                </span>
                {selectedAlert && (
                  <span className="text-[10px] font-mono text-red-200">
                    ID: {selectedAlert.id}
                  </span>
                )}
              </div>
              <div className="text-white font-black text-sm uppercase tracking-wide truncate mt-0.5">
                {selectedAlert ? selectedAlert.message : "POSSIBLE GBV - DISTRESS SIGNAL"}
              </div>
              <div className="text-xs text-red-100 font-mono flex items-center space-x-1.5 truncate">
                <span>Katlehong, Gauteng</span>
                <span>•</span>
                <span>4.2 km</span>
                <span>•</span>
                <span>{selectedAlert ? selectedAlert.timestamp : "3 min ago"}</span>
                {currentAttire && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-300 font-bold">Attire: {currentAttire}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToBolo}
            className="ml-3 px-3 py-1.5 rounded bg-[#3a0808] hover:bg-[#520a0a] border border-red-700/80 text-white text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5 transition flex-shrink-0 cursor-pointer shadow-sm"
          >
            <span>VIEW DETAILS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: 3 Quick Header Action Buttons with glowing borders */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Button 1: WHATSAPP RECON */}
          <button
            type="button"
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded border border-[#059669] bg-[#052016] hover:bg-[#073623] text-[#34d399] font-mono text-xs font-bold tracking-wider transition shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#34d399] flex-shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-xs">WHATSAPP</div>
              <div className="text-[9.5px] text-emerald-400 font-mono">RECON</div>
            </div>
          </button>

          {/* Button 2: OPEN IN NEW WINDOW */}
          <button
            type="button"
            onClick={() => window.open("/bolo-young", "BoloYoungConsole", "width=1280,height=820")}
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded border border-[#334155] bg-[#0e121b] hover:bg-[#161c2b] text-[#cbd5e1] font-mono text-xs font-bold tracking-wider transition shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-xs">OPEN IN NEW</div>
              <div className="text-[9.5px] text-slate-400 font-mono">WINDOW</div>
            </div>
          </button>

          {/* Button 3: LIVE TACTICAL MAP */}
          <button
            type="button"
            onClick={handleRecenter}
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded border border-[#4338ca] bg-[#0c102a] hover:bg-[#141b44] text-[#818cf8] font-mono text-xs font-bold tracking-wider transition shadow-sm cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-xs">LIVE TACTICAL</div>
              <div className="text-[9.5px] text-indigo-400 font-mono">MAP</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Column (Map + Waveform + 3 Cards) | Right Column (Feed + Agents) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Column (8 cols): Map Canvas + Waveform Bar + Bottom 3-Card Row */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
          {/* Map Canvas Frame */}
          <div className="relative flex-1 min-h-[300px] rounded border border-[#1e2430] bg-[#07090e] overflow-hidden shadow-inner">
            {/* North Compass Arrow (top-left) */}
            <div className="absolute top-3 left-3 z-[400] pointer-events-none flex flex-col items-center justify-center bg-black/75 border border-neutral-700/80 rounded px-2 py-1 text-slate-200 font-mono text-[11px] font-bold shadow">
              <span>N</span>
              <span className="text-xs leading-none">▲</span>
            </div>

            {/* Scale Indicator 2km (bottom-left) */}
            <div className="absolute bottom-3 left-3 z-[400] pointer-events-none flex items-center space-x-2 bg-black/75 border border-neutral-700/80 rounded px-2.5 py-1 text-slate-200 font-mono text-[11px] shadow">
              <span>2 km</span>
              <div className="flex items-center">
                <span className="h-2 w-[1.5px] bg-slate-300"></span>
                <span className="w-12 h-[1.5px] bg-slate-300"></span>
                <span className="h-2 w-[1.5px] bg-slate-300"></span>
              </div>
            </div>

            {/* Tactical Legend Box (bottom-right) */}
            <div className="absolute bottom-3 right-3 z-[400] pointer-events-auto bg-[#0a0c12]/90 backdrop-blur-sm border border-[#1e2430] rounded p-2.5 text-[10.5px] font-mono space-y-1.5 shadow-xl text-slate-300">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shadow-sm"></span>
                <span>Incident Location</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full border border-red-500 inline-block"></span>
                <span>Geofence (20km)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-4 h-0.5 border-t-2 border-amber-400 border-dashed inline-block"></span>
                <span>Agent Route</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#082a27] border border-[#2dd4bf] inline-flex items-center justify-center text-[8px] text-[#2dd4bf]">
                  🚗
                </span>
                <span>Mobile Unit</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="text-amber-500 font-black text-xs leading-none">▲</span>
                <span>BOLO Young</span>
              </div>
            </div>

            {/* Tactical GPS Overlays */}
            {gpsLockStatus === "SEARCHING" && (
              <div className="absolute top-3 left-14 z-[400] pointer-events-auto bg-slate-900/90 border border-amber-500/50 rounded px-3 py-1 flex items-center space-x-2 text-xs text-amber-300 shadow">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="font-mono text-[11px]">Acquiring Device GPS... (Attempt #{queryAttempts})</span>
              </div>
            )}

            {showLockSuccessAlert && deviceLocation && (
              <div className="absolute top-3 left-14 z-[400] pointer-events-auto bg-slate-900/90 border border-emerald-500/50 rounded px-3 py-1 flex items-center space-x-2 text-xs text-emerald-300 shadow">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">GPS Locked (±{Math.round(deviceLocation.accuracy)}m)</span>
              </div>
            )}

            {/* Real Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 cursor-crosshair" />
          </div>

          {/* Audio Dispatch Waveform Bar */}
          <div className="h-11 bg-[#0c0e14] border border-[#1e2430] rounded px-3 flex items-center justify-between text-xs flex-shrink-0 shadow">
            {/* Left: Waveform animation + BOLO YOUNG identity */}
            <div className="flex items-center space-x-3">
              <div className="flex items-end space-x-0.5 h-4 w-5">
                <span className="w-1 bg-[#10b981] rounded-full animate-pulse h-3"></span>
                <span className="w-1 bg-[#10b981] rounded-full animate-pulse h-4 delay-75"></span>
                <span className="w-1 bg-[#10b981] rounded-full animate-pulse h-2 delay-150"></span>
                <span className="w-1 bg-[#10b981] rounded-full animate-pulse h-3.5 delay-100"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-xs tracking-wider font-mono">BOLO YOUNG</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#10b981] bg-[#06241b] text-[#34d399]">
                    ACTIVE
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block leading-tight">
                  Traffic Control AI Guardian
                </span>
              </div>
            </div>

            {/* Center: Tactical voice quote */}
            <div className="hidden md:block text-slate-200 font-mono text-xs truncate max-w-md">
              &quot;Unit 01, confirm visual on suspect. Maintain 2 block perimeter.&quot;
            </div>

            {/* Right: Timestamp and speaker icon */}
            <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
              <span>22:26:41</span>
              <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
            </div>
          </div>

          {/* Bottom 3-Card Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 flex-shrink-0">
            {/* Card 1: QUICK ACTIONS */}
            <div className="bg-[#0c0e14] border border-[#1e2430] rounded p-2.5 px-3 flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-amber-500 font-mono text-xs font-bold tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>QUICK ACTIONS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => alert("🚨 PANIC DISPATCH: All available sector units converging on Katlehong hotspot.")}
                  className="bg-[#7f1d1d] hover:bg-[#991b1b] border border-red-600 text-white font-mono text-[10px] font-bold py-1.5 px-1 rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <AlertCircle className="w-3 h-3 text-red-300" />
                  <span>PANIC</span>
                </button>
                <button
                  type="button"
                  onClick={handleConvergeUnits}
                  className="bg-[#121622] hover:bg-[#1a2030] border border-[#2a324b] text-slate-200 font-mono text-[10px] font-bold py-1.5 px-1 rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <Car className="w-3 h-3 text-cyan-400" />
                  <span>DISPATCH</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateToBolo}
                  className="bg-[#121622] hover:bg-[#1a2030] border border-[#2a324b] text-slate-200 font-mono text-[10px] font-bold py-1.5 px-1 rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>LOG INCIDENT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText("-26.315, 28.16 (Katlehong, Gauteng)");
                    alert("Sector Coordinates copied: -26.315, 28.16");
                  }}
                  className="bg-[#121622] hover:bg-[#1a2030] border border-[#2a324b] text-slate-200 font-mono text-[10px] font-bold py-1.5 px-1 rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-slate-400" />
                  <span>SHARE LOCATION</span>
                </button>
              </div>
            </div>

            {/* Card 2: SYSTEM METRICS */}
            <div className="bg-[#0c0e14] border border-[#1e2430] rounded p-2.5 px-3 flex flex-col justify-between">
              <div className="flex items-center space-x-1.5 text-amber-500 font-mono text-xs font-bold tracking-wider mb-2">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>SYSTEM METRICS</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-left">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">ACTIVE AGENTS</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">4/6</div>
                </div>
                <div className="border-l border-neutral-800 pl-1.5">
                  <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">AVG. RESPONSE</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">2.8 min</div>
                </div>
                <div className="border-l border-neutral-800 pl-1.5">
                  <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">CITIZEN REPORTS</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">12 (24h)</div>
                </div>
                <div className="border-l border-neutral-800 pl-1.5">
                  <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">UPTIME</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">99.9%</div>
                </div>
              </div>
            </div>

            {/* Card 3: POLPIA / PRIVACY */}
            <div className="bg-[#0c0e14] border border-[#1e2430] rounded p-2.5 px-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 text-amber-500 font-mono text-xs font-bold tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>POLPIA / PRIVACY</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#10b981] bg-[#06241b] text-[#34d399] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                  <span>COMPLIANT</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                <div className="text-slate-300">Zero-Knowledge Architecture</div>
                <div>End-to-End Encryption</div>
                <div>No Personal Data Storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Incident Feed + Agent Status */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
          {/* Top Box: LIVE INCIDENT FEED */}
          <div className="flex-1 min-h-0 bg-[#0c0e14] border border-[#1e2430] rounded p-3 flex flex-col overflow-hidden shadow">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2430]">
              <div className="flex items-center space-x-1.5 font-mono text-xs font-bold tracking-wider text-white">
                <span className="text-amber-500 font-bold">&gt;</span>
                <span>LIVE INCIDENT FEED</span>
              </div>
              <span className="text-[10px] font-mono text-[#34d399] bg-[#0c1318] border border-[#10b981]/50 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                <span>AUTO-REFRESH</span>
              </span>
            </div>

            <div className="mt-2.5 flex-1 overflow-y-auto space-y-2 pr-1">
              {/* Dynamic Alert from mobile if active */}
              {incomingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="p-2.5 rounded border border-red-500/90 bg-red-950/40 hover:bg-red-950/60 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-[#dc2626] text-white font-mono font-extrabold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                      HIGH
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5">
                    {alert.citizenName} • {alert.triggerSource}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {alert.lat.toFixed(4)}°, {alert.lng.toFixed(4)}° • {alert.speedKmh} km/h
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 leading-snug">{alert.message}</div>
                </div>
              ))}

              {/* Mockup Incident 1: HIGH */}
              <div
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([-26.315, 28.16], 14, { animate: true });
                  }
                }}
                className="p-2.5 rounded border border-[#1f2430] bg-[#07090e] hover:border-neutral-700 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#dc2626] text-white font-mono font-extrabold text-[9px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                    HIGH
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">22:23</span>
                </div>
                <div className="text-xs font-bold text-white mt-1.5">POSSIBLE GBV - DISTRESS SIGNAL</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Katlehong, Gauteng • 4.2 km</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Subject sent SOS via Waypoint. Audio stream active.
                </div>
              </div>

              {/* Mockup Incident 2: MED */}
              <div className="p-2.5 rounded border border-[#1f2430] bg-[#07090e] hover:border-neutral-700 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="bg-[#f59e0b] text-black font-mono font-extrabold text-[9px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                    MED
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">22:17</span>
                </div>
                <div className="text-xs font-bold text-white mt-1.5">SUSPICIOUS VEHICLE</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Vosloorus, Gauteng • 7.8 km</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Plate: BZ 74 PL GP. Moving north. No units on scene.
                </div>
              </div>

              {/* Mockup Incident 3: LOW */}
              <div className="p-2.5 rounded border border-[#1f2430] bg-[#07090e] hover:border-neutral-700 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="bg-[#10b981] text-black font-mono font-extrabold text-[9px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                    LOW
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">22:03</span>
                </div>
                <div className="text-xs font-bold text-white mt-1.5">THEFT IN PROGRESS</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Thokoza, Gauteng • 12.1 km</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Citizen report via app. Units dispatched.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Box: AGENT STATUS */}
          <div className="h-56 bg-[#0c0e14] border border-[#1e2430] rounded p-3 flex flex-col flex-shrink-0 overflow-hidden shadow">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e2430]">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold tracking-wider text-white">
                {/* 3-node connected network icon in amber */}
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="2.5" />
                  <circle cx="5" cy="19" r="2.5" />
                  <circle cx="19" cy="19" r="2.5" />
                  <line x1="12" y1="7.5" x2="5" y2="16.5" />
                  <line x1="12" y1="7.5" x2="19" y2="16.5" />
                </svg>
                <span>AGENT STATUS</span>
              </div>
              <span className="text-[10px] font-mono text-slate-300 bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded">
                4 ACTIVE
              </span>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-500 border-b border-neutral-800">
                    <th className="pb-1.5 font-bold">AGENT</th>
                    <th className="pb-1.5 font-bold">STATUS</th>
                    <th className="pb-1.5 font-bold">LOCATION</th>
                    <th className="pb-1.5 font-bold text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                  {/* Row 1: BOLO Young */}
                  <tr className="hover:bg-neutral-900/40">
                    <td className="py-2 flex items-center space-x-1.5 text-slate-200 font-medium">
                      <span className="text-amber-500 text-xs font-black">▲</span>
                      <span>BOLO Young</span>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-[#78350f] border border-amber-500/60 text-amber-300 text-[9px] font-bold">
                        EN ROUTE
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">Katlehong</td>
                    <td className="py-2 text-right text-slate-300 font-bold">3 min</td>
                  </tr>

                  {/* Row 2: Agent 01 */}
                  <tr className="hover:bg-neutral-900/40">
                    <td className="py-2 flex items-center space-x-1.5 text-slate-200 font-medium">
                      <span className="text-[#2dd4bf] text-xs">🚗</span>
                      <span>Agent 01</span>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-[#083344] border border-cyan-500/60 text-cyan-300 text-[9px] font-bold">
                        ON SITE
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">Vosloorus</td>
                    <td className="py-2 text-right text-slate-300 font-bold">6 min</td>
                  </tr>

                  {/* Row 3: Agent 02 */}
                  <tr className="hover:bg-neutral-900/40">
                    <td className="py-2 flex items-center space-x-1.5 text-slate-200 font-medium">
                      <span className="text-[#2dd4bf] text-xs">🚗</span>
                      <span>Agent 02</span>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-[#042f2e] border border-teal-500/60 text-teal-300 text-[9px] font-bold">
                        PATROLLING
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">Thokoza</td>
                    <td className="py-2 text-right text-slate-300 font-bold">12 min</td>
                  </tr>

                  {/* Row 4: Agent 03 */}
                  <tr className="hover:bg-neutral-900/40">
                    <td className="py-2 flex items-center space-x-1.5 text-slate-200 font-medium">
                      <span className="text-[#2dd4bf] text-xs">🚗</span>
                      <span>Agent 03</span>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded bg-[#1e293b] border border-slate-600 text-slate-400 text-[9px] font-bold">
                        AVAILABLE
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">Sector 2</td>
                    <td className="py-2 text-right text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
