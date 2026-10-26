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

  // Generate patrol units around the real acquired center [lat, lng]
  const generatePatrolUnits = useCallback((centerLat: number, centerLng: number) => {
    return [
      {
        id: "FOX-14",
        callsign: "Fox Tactical 14",
        role: "Armed Sector Reaction",
        route: [
          [centerLat + 0.0035, centerLng - 0.003],
          [centerLat + 0.0018, centerLng + 0.0025],
          [centerLat - 0.002, centerLng + 0.0038],
          [centerLat - 0.0038, centerLng - 0.001],
          [centerLat + 0.001, centerLng - 0.0035],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
      {
        id: "FOX-08",
        callsign: "Fox Tactical 08",
        role: "Community Patrol Intercept",
        route: [
          [centerLat - 0.0028, centerLng - 0.0035],
          [centerLat - 0.001, centerLng - 0.0018],
          [centerLat + 0.0025, centerLng + 0.0012],
          [centerLat + 0.0042, centerLng + 0.0028],
        ] as [number, number][],
        step: 0,
        direction: 1,
      },
      {
        id: "SAPS-302",
        callsign: "SAPS Flying Squad 302",
        role: "Highway Tactical Beat",
        route: [
          [centerLat + 0.005, centerLng + 0.0045],
          [centerLat + 0.0028, centerLng + 0.0028],
          [centerLat - 0.001, centerLng + 0.001],
          [centerLat - 0.0042, centerLng - 0.0028],
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

      // Initialize map centered on South Africa baseline
      const map = L.map(container, {
        center: [-26.2640, 28.1245],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "topleft" }).addTo(map);

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
            <div class="w-7 h-7 rounded-full ${
              isSaps ? "bg-blue-600" : "bg-amber-500"
            } border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              🚓
            </div>
          </div>
        `,
        className: "patrol-marker-moving",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(coords, { icon: carIcon })
        .bindPopup(`
          <div class="p-2 font-sans text-xs">
            <div class="font-bold ${isSaps ? "text-blue-600" : "text-amber-600"}">${unit.callsign}</div>
            <div class="text-slate-700 text-[11px] font-semibold">${unit.role}</div>
            <div class="text-slate-500 text-[10px] mt-0.5">Patrolling Active Sector Beat</div>
          </div>
        `)
        .addTo(group);
    });
  }, [patrolUnits]);

  // Render Active Emergency Triggers (Only if an incoming alert is selected / active)
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = alertLayerRef.current;

    if (!L || !map || !group) return;

    group.clearLayers();

    if (!selectedAlert || selectedAlert.status !== "RED") return;

    const distressIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-12 w-12 animate-ping rounded-full bg-red-500 opacity-75"></span>
          <div class="relative flex items-center justify-center w-9 h-9 bg-red-600 rounded-full border-2 border-white shadow-2xl text-white font-black text-xs">
            SOS
          </div>
        </div>
      `,
      className: "crisis-marker-live",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const coords: [number, number] = [selectedAlert.lat, selectedAlert.lng];

    const attireHtml = currentAttire
      ? `<div class="mt-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] leading-tight">
           <div class="font-bold text-emerald-800 flex items-center gap-1">✓ Verified Attire (NOK Recon):</div>
           <div class="mt-0.5 font-medium">${currentAttire}</div>
         </div>`
      : `<div class="mt-2 p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[10px] leading-tight">
           <div class="font-bold text-amber-800">⚠️ Attire Unconfirmed</div>
           <div class="text-slate-600 mt-0.5">Deploy WhatsApp Recon to verify clothing</div>
         </div>`;

    L.marker(coords, { icon: distressIcon })
      .bindPopup(`
        <div class="p-2 font-sans text-xs min-w-[200px]">
          <div class="font-black text-red-600 text-xs">🚨 CODE RED DISTRESS SIGNAL</div>
          <div class="font-bold text-slate-900 mt-1">${selectedAlert.citizenName}</div>
          <div class="text-slate-600 text-[11px] mt-0.5">Trigger: <b>${selectedAlert.triggerSource}</b></div>
          <div class="text-slate-500 font-mono text-[10px] mt-1">${selectedAlert.lat.toFixed(5)}, ${selectedAlert.lng.toFixed(5)}</div>
          ${attireHtml}
        </div>
      `)
      .addTo(group);

    map.flyTo(coords, 15, { animate: true });
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
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden select-none">
      {/* Left/Center Column: Leaflet GIS Map Canvas */}
      <div className="relative flex-1 h-full w-full min-h-0 bg-[#0b101b] overflow-hidden">
        {/* Top Floating HUD */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 pointer-events-none">
          {/* Station / Officer Identity Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2.5 text-xs pointer-events-auto">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <span className="font-bold text-white block leading-tight">{currentOrg.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentOrg.officerName} • {currentOrg.officerRank}
              </span>
            </div>
          </div>

          {/* Focal GPS Pinning HUD Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className={`px-3.5 py-2 rounded-xl border shadow-md flex items-center space-x-2.5 text-xs pointer-events-auto transition active:scale-95 cursor-pointer ${
              gpsLockStatus === "LOCKED"
                ? "bg-slate-900/95 border-cyan-500 text-cyan-300 hover:bg-slate-800"
                : gpsLockStatus === "SEARCHING"
                ? "bg-slate-900/95 border-amber-500/70 text-amber-300 animate-pulse"
                : "bg-slate-900/95 border-red-500/60 text-red-300 hover:bg-slate-800"
            }`}
          >
            {gpsLockStatus === "LOCKED" ? (
              <Locate className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : gpsLockStatus === "SEARCHING" ? (
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <div className="text-left">
              <span className="font-bold block leading-tight">
                {gpsLockStatus === "LOCKED"
                  ? "Recenter My Location"
                  : gpsLockStatus === "SEARCHING"
                  ? "Acquiring Device GPS..."
                  : "GPS Permission Needed"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {gpsLockStatus === "LOCKED" && deviceLocation
                  ? `Lat: ${deviceLocation.lat.toFixed(4)}°, Lng: ${deviceLocation.lng.toFixed(4)}° (±${Math.round(deviceLocation.accuracy)}m)`
                  : gpsLockStatus === "SEARCHING"
                  ? `Polling sensor... (Attempt #${queryAttempts})`
                  : "Click to Retry Location Query"}
              </span>
            </div>
          </button>

          {/* Refresh GPS Trigger */}
          <button
            type="button"
            onClick={startContinuousGpsQuery}
            title="Re-query Device GPS Stream"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white shadow-md pointer-events-auto transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${gpsLockStatus === "SEARCHING" ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {/* BOLO Young AI Console Navigation + Popout Trigger */}
          <div className="flex items-center space-x-1 pointer-events-auto">
            <button
              type="button"
              onClick={onNavigateToBolo}
              className="px-3.5 py-2 rounded-xl border border-amber-500/50 bg-slate-900/95 hover:bg-slate-800 text-slate-100 shadow-md flex items-center space-x-2 text-xs transition active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="font-bold block leading-tight flex items-center gap-1.5">
                  <span className="text-amber-400 font-extrabold">BOLO Young</span>
                  {incomingAlerts.some((a) => a.status === "RED") && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Switch to Console
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => window.open("/bolo-young", "BoloYoungC4iConsole", "width=1280,height=820")}
              title="Pop out BOLO Young in new window"
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 shadow-md transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Click hint pill */}
          <div className="hidden xl:flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 pointer-events-auto">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Click map to pin focal point</span>
          </div>
        </div>

        {/* Tactical Banner Overlay: Acquiring Device GPS Lock */}
        {gpsLockStatus === "SEARCHING" && (
          <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[1000] pointer-events-auto">
            <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/50 shadow-2xl flex items-start space-x-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
                <Satellite className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                    Acquiring Device GPS Lock
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Query #{queryAttempts}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Continuously querying device sensors & Wi-Fi triangulation. Please ensure location access is allowed in your browser.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Map will automatically fly to your coordinates once locked.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Banner Overlay: GPS Lock Established Confirmation */}
        {showLockSuccessAlert && deviceLocation && (
          <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[1000] pointer-events-auto">
            <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/60 shadow-2xl flex items-start space-x-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                    Device GPS Lock Confirmed
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    ±{Math.round(deviceLocation.accuracy)}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 mt-1 font-mono">
                  Focal Point: {deviceLocation.lat.toFixed(5)}° S, {deviceLocation.lng.toFixed(5)}° E
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Banner Overlay: GPS Permission Denied */}
        {gpsLockStatus === "DENIED" && (
          <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[1000] pointer-events-auto">
            <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/50 shadow-2xl flex items-start space-x-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-red-400 uppercase tracking-wide text-[11px] block">
                  Location Access Blocked
                </span>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Browser location permission is disabled. Click the site settings icon in your address bar to allow location, or click anywhere on the map to manually set your terminal pin.
                </p>
                <button
                  type="button"
                  onClick={startContinuousGpsQuery}
                  className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 transition"
                >
                  Retry Location Permission
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real Leaflet Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 cursor-crosshair" />


        {/* Bottom Floating Telemetry Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-lg flex items-center justify-between text-xs pointer-events-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Active Patrols: <b className="font-mono text-white">{patrolUnits.length} Units Cruising</b>
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Sector Focal:{" "}
                <b className="font-mono text-cyan-300">
                  {deviceLocation ? `${deviceLocation.lat.toFixed(4)}° S, ${deviceLocation.lng.toFixed(4)}° E` : "Searching Device Fix"}
                </b>
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CARTO Dark Matter • Authorized Key Active</span>
          </div>
        </div>
      </div>

      {/* Right Column: Live Incoming Alerts Feed (Clean/Empty at rest) */}
      <aside className="w-full lg:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-5 flex-shrink-0 z-10 shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Incoming Citizen Alerts
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                incomingAlerts.length > 0
                  ? "bg-red-950 text-red-300 border-red-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {incomingAlerts.length} Active
            </span>
          </div>

          {/* Alert Content / Empty State at Rest */}
          <div className="mt-4 flex-1 flex flex-col justify-center">
            {incomingAlerts.length === 0 ? (
              /* CLEAN RESTING STATE: Empty feed until Thandi triggers an alert */
              <div className="flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 my-auto">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Listening for Distress Signals
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                  No active emergencies in this sector. All citizen journeys are green or idle.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-[10px] text-slate-400 font-mono flex items-center justify-center space-x-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Real triggers from mobile app will appear here instantly</span>
                </div>
              </div>
            ) : (
              /* POPULATED ALERT FEED: When Thandi triggers SOS */
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {incomingAlerts.map((alert) => {
                  const isSelected = selectedAlert?.id === alert.id;
                  const isRed = alert.status === "RED";

                  return (
                    <div
                      key={alert.id}
                      onClick={() => onSelectAlert(alert)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-950/40 border-red-500 shadow-xl"
                          : isRed
                          ? "bg-slate-950/90 border-red-500/50 hover:border-red-400"
                          : "bg-slate-950/60 border-emerald-500/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isRed ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
                          <h4 className="text-xs font-black text-white tracking-wide">
                            {isRed ? "🚨 CODE RED DISTRESS" : "✅ JOURNEY COMPLETED"}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <div className="text-sm font-bold text-white">
                          {alert.citizenName}
                        </div>
                        <div className="text-xs text-red-400 font-medium mt-0.5">
                          Trigger Source: <b className="text-white">{alert.triggerSource}</b>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-1">
                          GPS: {alert.lat.toFixed(4)}°, {alert.lng.toFixed(4)}° • {alert.speedKmh} km/h
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 leading-snug">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>{isSelected ? "Currently Tracking" : "Track on Map"}</span>
                        </button>

                        {onAcknowledgeAlert && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcknowledgeAlert(alert.id);
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Channel Info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>WebSocket Live Hub</span>
          </span>
          <span className="font-mono text-slate-400">
            {deviceLocation ? `Device Ground Truth (±${Math.round(deviceLocation.accuracy)}m)` : "Awaiting Lock"}
          </span>
        </div>
      </aside>

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
