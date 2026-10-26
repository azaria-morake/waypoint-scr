"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Crosshair, ShieldAlert, Radio, Compass, Car } from "lucide-react";

interface TacticalGisMapProps {
  isRedAlert: boolean;
  userLat?: number;
  userLng?: number;
  speedKmh?: number;
  headingDeg?: number;
  responders: Array<{
    responder_id: string;
    callsign: string;
    role: string;
    lat: number;
    lng: number;
    status: string;
  }>;
}

export const TacticalGisMap: React.FC<TacticalGisMapProps> = ({
  isRedAlert,
  userLat = -26.2678,
  userLng = 28.1245,
  speedKmh = 78,
  headingDeg = 140,
  responders,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Default coordinate path along Alberton corridor
  const corridorRoute: [number, number][] = [
    [-26.2585, 28.1215], // 8th Ave, Alberton North
    [-26.2602, 28.1220], // Hendrik Potgieter St
    [-26.2625, 28.1228], // Voortrekker Rd past Alberton City
    [-26.2650, 28.1235], // N12 On-Ramp Approach
    [-26.2678, 28.1245], // N12 On-Ramp Struggle Point
    [-26.2640, 28.1280], // N12 East Highway
    [-26.2620, 28.1310], // Reading Interchange
  ];

  // Intercept Nodes predicted by The Way Swarm
  const interceptNodes = [
    {
      name: "Node Alpha: N12 / Voortrekker Off-Ramp",
      coords: [-26.2620, 28.1210] as [number, number],
      eta: "110s",
      action: "Pinch off eastbound on-ramp",
    },
    {
      name: "Node Bravo: R59 Sybrand van Niekerk",
      coords: [-26.2750, 28.1180] as [number, number],
      eta: "225s",
      action: "Secondary south escape vector",
    },
    {
      name: "Node Charlie: Reading Interchange",
      coords: [-26.2510, 28.1340] as [number, number],
      eta: "340s",
      action: "N3 North corridor junction",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_4v5a_1_3ddf73d20da14b7be5f09ab5";

    // Dynamically import Leaflet to avoid SSR window errors
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if already present
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear any lingering _leaflet_id from React StrictMode double invocation
      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id != null) {
        delete (container as any)._leaflet_id;
      }

      // Initialize map centered on Alberton North, Gauteng
      const map = L.map(container, {
        center: [-26.2640, 28.1245],
        zoom: 14,
        zoomControl: false,
      });

      // Add zoom control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Primary: CartoDB Dark Matter real tactical map tiles with API key
      const cartoUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

      const cartoLayer = L.tileLayer(cartoUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      });

      const osmFallback = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      );

      cartoLayer.on("tileerror", () => {
        if (!map.hasLayer(osmFallback)) {
          osmFallback.addTo(map);
        }
      });

      cartoLayer.addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Draw route polyline
      L.polyline(corridorRoute, {
        color: isRedAlert ? "#ef4444" : "#10b981",
        weight: 4,
        dashArray: isRedAlert ? "8, 8" : undefined,
        opacity: 0.85,
      }).addTo(map);

      renderDynamicLayers(L, map, markersGroup);

      // Invalidate size after layout settles to guarantee tiles render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update dynamic markers and alert styling when state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    import("leaflet").then((L) => {
      renderDynamicLayers(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [isRedAlert, userLat, userLng, speedKmh, headingDeg, responders]);

  const renderDynamicLayers = (L: any, map: any, group: any) => {
    group.clearLayers();

    // 1. User / Victim Position Marker
    const userIconHtml = isRedAlert
      ? `<div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-red-500 opacity-75"></span>
           <div class="relative flex items-center justify-center w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg text-white font-bold text-[10px]">
             SOS
           </div>
         </div>`
      : `<div class="relative flex items-center justify-center">
           <span class="absolute inline-flex h-7 w-7 animate-pulse rounded-full bg-emerald-500 opacity-60"></span>
           <div class="relative flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-md text-white font-bold text-[9px]">
             ✓
           </div>
         </div>`;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "custom-user-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(group);
    userMarker.bindPopup(
      `<div class="p-2 font-sans text-xs">
         <div class="font-bold ${isRedAlert ? "text-red-600" : "text-emerald-600"} uppercase text-sm">
           ${isRedAlert ? "🚨 CODE RED TARGET" : "🛡️ MONITORED CITIZEN"}
         </div>
         <div class="mt-1 font-semibold text-slate-800">Thandiwe Ndlovu</div>
         <div class="text-slate-600 text-[11px] mt-0.5">Alberton Corridor, Gauteng</div>
         <div class="mt-1.5 flex gap-2 text-[10px] text-slate-500">
           <span>Speed: <b>${speedKmh} km/h</b></span>
           <span>Heading: <b>${headingDeg}°</b></span>
         </div>
       </div>`
    );

    // 2. Active Responders (Fox Tactical & SAPS)
    responders.forEach((resp) => {
      const isFox = resp.callsign.toLowerCase().includes("fox");
      const isSaps = resp.callsign.toLowerCase().includes("saps");
      const bgClass = isFox ? "bg-amber-500 border-amber-300" : isSaps ? "bg-blue-600 border-blue-300" : "bg-emerald-500 border-white";

      const respIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 ${bgClass} rounded-full border-2 shadow-md text-white text-[10px]">
                 🚓
               </div>`,
        className: "custom-responder-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const rMarker = L.marker([resp.lat, resp.lng], { icon: respIcon }).addTo(group);
      rMarker.bindPopup(
        `<div class="p-1.5 font-sans text-xs">
           <div class="font-bold text-slate-900">${resp.callsign}</div>
           <div class="text-slate-600 text-[11px]">Role: ${resp.role}</div>
           <div class="text-emerald-600 text-[11px] font-semibold">Status: ${resp.status}</div>
         </div>`
      );
    });

    // 3. Predicted Intercept Choke Points (Only in Red Alert)
    if (isRedAlert) {
      interceptNodes.forEach((node) => {
        const interceptIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-7 h-7 bg-red-950/90 border-2 border-red-500 rounded-lg shadow-lg text-red-400 font-mono text-[10px] font-bold animate-bounce">
                   🎯
                 </div>`,
          className: "custom-intercept-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const iMarker = L.marker(node.coords, { icon: interceptIcon }).addTo(group);
        iMarker.bindPopup(
          `<div class="p-2 font-sans text-xs">
             <div class="font-bold text-red-600 text-xs">PREDICTED INTERCEPT CHOKE POINT</div>
             <div class="font-semibold text-slate-900 mt-1">${node.name}</div>
             <div class="text-slate-600 text-[11px] mt-0.5">ETA: <b>${node.eta}</b></div>
             <div class="text-slate-500 text-[10px] mt-1 italic">${node.action}</div>
           </div>`
        );
      });
    }
  };

  return (
    <div className="relative w-full h-[520px] bg-[#0b101b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Map HUD Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center space-x-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2.5 text-xs pointer-events-auto">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-cyan-300 font-bold">
            LAT: {userLat.toFixed(4)}° S | LNG: {userLng.toFixed(4)}° E
          </span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2 text-xs pointer-events-auto">
          <Radio className={`w-3.5 h-3.5 ${isRedAlert ? "text-red-500 animate-ping" : "text-emerald-400"}`} />
          <span className={`font-semibold ${isRedAlert ? "text-red-400 font-mono font-bold" : "text-emerald-400"}`}>
            {isRedAlert ? "CODE RED INTERCEPT ACTIVE" : "REAL GIS MAP (ALBERTON, GAUTENG)"}
          </span>
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center justify-between text-xs pointer-events-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>HEADING: <b className="font-mono text-white">{headingDeg}° (SE)</b></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>VELOCITY: <b className="font-mono text-white">{speedKmh} km/h</b></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span>NETWORK: <b className="font-mono text-cyan-300">N12 / Voortrekker Corridor</b></span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          MAP TILES: OpenStreetMap / CartoDB Dark Matter
        </div>
      </div>
    </div>
  );
};
