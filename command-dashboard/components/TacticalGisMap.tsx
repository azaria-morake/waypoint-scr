"use client";

import React, { useState, useEffect } from "react";
import { Navigation, ShieldAlert, Radio, Compass, Car, Crosshair } from "lucide-react";

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
  // Breadcrumb trajectory
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ x: number; y: number }>>([
    { x: 120, y: 380 },
    { x: 145, y: 340 },
    { x: 180, y: 290 },
    { x: 215, y: 235 },
  ]);

  // Anonymized green citizen dots
  const greenCitizens = [
    { id: 1, x: 90, y: 140, callsign: "CIT-8821 (DMS Safe)" },
    { id: 2, x: 280, y: 110, callsign: "CIT-4190 (DMS Safe)" },
    { id: 3, x: 330, y: 320, callsign: "CIT-9034 (DMS Safe)" },
    { id: 4, x: 80, y: 280, callsign: "CIT-1120 (DMS Safe)" },
  ];

  const currentX = 230;
  const currentY = 210;

  return (
    <div className="relative w-full h-[520px] bg-[#0b101b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Map HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2.5 text-xs">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-cyan-300 font-bold">
            LAT: {userLat.toFixed(4)}° S | LNG: {userLng.toFixed(4)}° E
          </span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2 text-xs">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">
            {speedKmh} km/h • {headingDeg}° SE
          </span>
        </div>
      </div>

      {/* Alert Level Pill */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div
          className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center space-x-2 shadow-lg backdrop-blur-md ${
            isRedAlert
              ? "bg-red-950/90 border-red-500/80 text-red-200 animate-pulse"
              : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isRedAlert ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
          <span>{isRedAlert ? "CODE RED: SWARM INTERCEPT ACTIVE" : "GREEN MONITORING: JURISDICTION NORMAL"}</span>
        </div>
      </div>

      {/* SVG GIS Layer */}
      <svg
        className="w-full h-full"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Tactical grid pattern */}
          <pattern id="tacGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="1.5" fill="#334155" />
          </pattern>

          {/* Radar sweep gradient */}
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Grid */}
        <rect width="100%" height="100%" fill="#070c16" />
        <rect width="100%" height="100%" fill="url(#tacGrid)" />

        {/* Jurisdiction Geofence Polygon (Alberton Sector) */}
        <polygon
          points="40,80 260,40 540,90 560,420 320,460 60,440"
          fill="rgba(6, 182, 212, 0.04)"
          stroke="#0891b2"
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />
        <text x="70" y="70" fill="#0891b2" fontSize="11" fontWeight="bold" letterSpacing="1">
          ALBERTON NORTH JURISDICTION GEOFENCE (CPF SECTOR 4)
        </text>

        {/* Major Highways (N12 / Voortrekker / R59) */}
        <path
          d="M 60,450 C 140,360 190,280 250,210 C 310,140 370,80 440,30"
          fill="none"
          stroke="#334155"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 60,450 C 140,360 190,280 250,210 C 310,140 370,80 440,30"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Arterial Crossing: Voortrekker Ave */}
        <path d="M 40,280 L 360,330" stroke="#1e293b" strokeWidth="4" />
        <text x="50" y="270" fill="#64748b" fontSize="9" fontWeight="bold">
          Voortrekker Ave
        </text>

        {/* Arterial Crossing: R59 Reading Interchange */}
        <path d="M 180,480 L 320,30" stroke="#1e293b" strokeWidth="4" />
        <text x="280" y="60" fill="#64748b" fontSize="9" fontWeight="bold">
          R59 Highway
        </text>

        {/* Anonymized Green Citizens */}
        {greenCitizens.map((cit) => (
          <g key={cit.id} transform={`translate(${cit.x}, ${cit.y})`}>
            <circle r="4" fill="#10b981" />
            <circle r="12" fill="rgba(16, 185, 129, 0.15)" />
            <text x="8" y="3" fill="#6ee7b7" fontSize="8" fontWeight="bold">
              {cit.callsign}
            </text>
          </g>
        ))}

        {/* Red Alert Breadcrumb Trail */}
        {isRedAlert && (
          <>
            {/* Breadcrumb line */}
            <path
              d="M 120,380 L 145,340 L 180,290 L 215,235 L 230,210"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="4,4"
            />
            {breadcrumbs.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r="4" fill="#dc2626" opacity="0.7" />
            ))}

            {/* Predicted Off-ramp Intercept Node 1 */}
            <g transform="translate(250, 210)">
              <circle r="36" fill="rgba(239, 68, 68, 0.15)" className="animate-ping" />
              <circle r="22" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="28" y="-8" fill="#f87171" fontSize="10" fontWeight="bold">
                🎯 Target Intercept Node 1
              </text>
              <text x="28" y="6" fill="#fca5a5" fontSize="8">
                N12 / Voortrekker Off-ramp (ETA 2.4 min)
              </text>
            </g>

            {/* Predicted Intercept Node 2 */}
            <g transform="translate(310, 140)">
              <circle r="18" fill="rgba(245, 158, 11, 0.1)" />
              <circle r="12" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
              <text x="20" y="4" fill="#fbbf24" fontSize="9" fontWeight="bold">
                Secondary Node: R59 Reading
              </text>
            </g>

            {/* Active Citizen Target */}
            <g transform={`translate(${currentX}, ${currentY})`}>
              <circle r="28" fill="rgba(239, 68, 68, 0.3)" className="animate-ping" />
              <circle r="10" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
              <text x="-35" y="-18" fill="#f87171" fontSize="11" fontWeight="bold">
                THANDIWE NDLOVU (SOS)
              </text>
            </g>
          </>
        )}

        {/* Responders Patrol Vehicles */}
        {responders.map((r, idx) => {
          // Map responder coordinates to SVG bounds approximately
          const rx = 180 + idx * 75;
          const ry = 360 - idx * 45;
          return (
            <g key={r.responder_id || idx} transform={`translate(${rx}, ${ry})`}>
              <circle r="16" fill="rgba(59, 130, 246, 0.2)" className="animate-pulse" />
              <circle r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
              <text x="12" y="3" fill="#93c5fd" fontSize="9" fontWeight="bold">
                {r.callsign}
              </text>
              <text x="12" y="14" fill="#60a5fa" fontSize="8">
                {r.status} • {r.role}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Protected Citizen (Safe DMS)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-slate-300">Emergency Distress Incident</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Patrol Units Converging</span>
          </div>
        </div>

        <div className="text-slate-500 text-[11px] font-mono">
          PostGIS Haversine Engine: 5km Radius
        </div>
      </div>
    </div>
  );
};
