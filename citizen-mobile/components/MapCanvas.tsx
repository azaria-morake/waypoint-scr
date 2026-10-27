"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Navigation, ShieldAlert, Car, Radio } from "lucide-react";
import { REAL_ALBERTON_TO_SANDTON_ROUTE, getCoordinatesAtProgress } from "./ActiveJourneyView";

interface MapCanvasProps {
  mode: "SETUP" | "ACTIVE" | "RED";
  progress?: number;
  responderProgress?: number;
  telemetrySpeed?: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mode,
  progress = 0,
  responderProgress = 0.65,
  telemetrySpeed = 78,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Real Gauteng corridor: 14 8th Ave, Alberton North -> Sandton City Mall, Sandton (25-min route)
  const originCoords: [number, number] = REAL_ALBERTON_TO_SANDTON_ROUTE[0];
  const destCoords: [number, number] = REAL_ALBERTON_TO_SANDTON_ROUTE[REAL_ALBERTON_TO_SANDTON_ROUTE.length - 1];
  const corridorRoute: [number, number][] = REAL_ALBERTON_TO_SANDTON_ROUTE;

  // Smooth continuous interpolation along corridor
  const currentCoords = getCoordinatesAtProgress(REAL_ALBERTON_TO_SANDTON_ROUTE, progress);

  useEffect(() => {
    let isMounted = true;
    const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY || "cb1_4v5a_1_3ddf73d20da14b7be5f09ab5";

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

      const map = L.map(container, {
        center: currentCoords,
        zoom: 15,
        zoomControl: false,
      });

      // Primary: CartoDB Voyager clean mobile road tiles with API key
      const cartoUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      const cartoLayer = L.tileLayer(cartoUrl, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
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

      // Draw real road polyline
      L.polyline(corridorRoute, {
        color: mode === "RED" ? "#ef4444" : "#10b981",
        weight: 5,
        opacity: 0.85,
        dashArray: mode === "RED" ? "6, 6" : undefined,
      }).addTo(map);

      renderMarkers(L, map, markersGroup);

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

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    import("leaflet").then((L) => {
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current);
      if (mapInstanceRef.current) {
        if (!mapInstanceRef.current.getBounds().contains(currentCoords)) {
          mapInstanceRef.current.panTo(currentCoords, { animate: true });
        }
      }
    });
  }, [mode, progress, currentCoords]);

  const renderMarkers = (L: any, map: any, group: any) => {
    group.clearLayers();

    // 1. Origin Marker
    const originIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white shadow-md font-bold">
               A
             </div>`,
      className: "custom-origin-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(originCoords, { icon: originIcon })
      .bindPopup("<b>Departure</b><br/>14 8th Avenue, Alberton North")
      .addTo(group);

    // 2. Destination Marker
    const destIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white shadow-md font-bold">
               B
             </div>`,
      className: "custom-dest-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(destCoords, { icon: destIcon })
      .bindPopup("<b>Destination</b><br/>Sandton City Mall, Sandton")
      .addTo(group);

    // 3. User Live Marker
    const userMarkerHtml =
      mode === "RED"
        ? `<div class="relative flex items-center justify-center">
             <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-red-500 opacity-75"></span>
             <div class="relative flex items-center justify-center w-7 h-7 bg-red-600 rounded-full border-2 border-white shadow-lg text-white font-bold text-xs">
               SOS
             </div>
           </div>`
        : `<div class="relative flex items-center justify-center">
             <span class="absolute inline-flex h-8 w-8 animate-pulse rounded-full bg-emerald-500 opacity-60"></span>
             <div class="relative flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-md text-white font-bold text-xs">
               ▲
             </div>
           </div>`;

    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: "custom-user-live",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    L.marker(currentCoords, { icon: userIcon })
      .bindPopup(`<b>You (Live GPS)</b><br/>Speed: ${telemetrySpeed} km/h`)
      .addTo(group);

    // 4. Converging Responder (in RED mode)
    if (mode === "RED") {
      const respCoords: [number, number] = [-26.2628, 28.1205];
      const respIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-7 h-7 bg-amber-500 rounded-full border-2 border-white shadow-lg text-white text-xs animate-bounce">
                 🚓
               </div>`,
        className: "custom-resp-live",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker(respCoords, { icon: respIcon })
        .bindPopup("<b>Fox Security Unit 14</b><br/>Converging - ETA 2.2 min")
        .addTo(group);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 overflow-hidden select-none">
      {/* Real OpenStreetMap Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Speed & Status Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-md flex items-center space-x-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${mode === "RED" ? "bg-red-500 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
        <span className="font-mono text-white text-[11px] font-semibold">
          {mode === "RED" ? "TACTICAL ARMED CONVERGENCE" : `GPS: Alberton North (${telemetrySpeed} km/h)`}
        </span>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-600 font-mono border border-slate-200 shadow-sm">
        OpenStreetMap • Real GIS
      </div>
    </div>
  );
};
