"use client";

import React, { useEffect, useState } from "react";
import { Navigation, ShieldAlert, Car, Radio } from "lucide-react";

interface MapCanvasProps {
  mode: "SETUP" | "ACTIVE" | "RED";
  progress?: number; // 0 to 1
  responderProgress?: number; // 0 to 1
  telemetrySpeed?: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mode,
  progress = 0.35,
  responderProgress = 0.65,
  telemetrySpeed = 78,
}) => {
  // Road coordinates mapped to SVG canvas 400x480
  // Point A (Alberton): (80, 420)
  // Point B (Sandton): (320, 60)
  // Route curve: (80, 420) -> (140, 310) [Voortrekker] -> (190, 240) [N12 Junction] -> (240, 150) [M1 Corridor] -> (320, 60) [Sandton]

  const routePath = "M 80,420 C 120,330 160,260 210,210 C 260,160 280,110 320,60";

  // Calculate current user position along bezier curve approximately
  const t = Math.min(Math.max(progress, 0.05), 0.95);
  // Quadratic/Cubic bezier interpolation approximation
  const userX = 80 + t * 240 + Math.sin(t * Math.PI) * 20;
  const userY = 420 - t * 360;

  // Responder position converging from base (360, 360) towards user
  const rt = Math.min(Math.max(responderProgress, 0), 1);
  const respX = 360 - rt * (360 - userX);
  const respY = 360 - rt * (360 - userY);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#eef2f5] overflow-hidden select-none">
      {/* Subtle Map Grid & Suburban Road Network */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 480"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="dangerRouteGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Map Background with suburban grid */}
        <rect width="100%" height="100%" fill="#f1f5f9" />
        <rect width="100%" height="100%" fill="url(#cityGrid)" />

        {/* Secondary street arterial lines */}
        <path d="M 0,160 L 400,160" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        <path d="M 0,310 L 400,310" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        <path d="M 160,0 L 160,480" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />
        <path d="M 280,0 L 280,480" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6,4" />

        {/* Green Belt / Parks */}
        <path
          d="M 20,40 Q 60,30 90,70 T 70,120 T 10,90 Z"
          fill="#dcfce7"
          stroke="#bbf7d0"
          strokeWidth="1"
        />
        <path
          d="M 260,280 Q 320,260 360,310 T 320,380 T 250,330 Z"
          fill="#dcfce7"
          stroke="#bbf7d0"
          strokeWidth="1"
        />

        {/* Major Highway Route (N12 / M1 Corridor) */}
        <path
          d={routePath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={routePath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Journey Route Highlight */}
        <path
          d={routePath}
          fill="none"
          stroke={mode === "RED" ? "url(#dangerRouteGradient)" : "url(#routeGradient)"}
          strokeWidth="6"
          strokeDasharray={mode === "RED" ? "12,6" : "none"}
          className={mode === "RED" ? "animate-pulse" : ""}
          strokeLinecap="round"
        />

        {/* Point A: Alberton Origin */}
        <g transform="translate(80, 420)">
          <circle r="12" fill="#0f172a" />
          <circle r="6" fill="#ffffff" />
          <text x="-25" y="24" fontSize="10" fontWeight="bold" fill="#334155">
            Point A (Alberton)
          </text>
        </g>

        {/* Point B: Sandton Destination */}
        <g transform="translate(320, 60)">
          <circle r="12" fill="#2563eb" />
          <circle r="5" fill="#ffffff" />
          <text x="-40" y="-14" fontSize="10" fontWeight="bold" fill="#1e3a8a">
            Point B (Sandton)
          </text>
        </g>

        {/* Off-ramp predicted intercept nodes in RED mode */}
        {mode === "RED" && (
          <>
            {/* Voortrekker Off-ramp */}
            <g transform="translate(140, 310)">
              <circle r="16" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
              <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x="10" y="-4" fontSize="9" fontWeight="bold" fill="#991b1b">
                Node 1: N12 / Voortrekker
              </text>
            </g>

            {/* R59 Intercept */}
            <g transform="translate(190, 240)">
              <circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="10" y="4" fontSize="9" fontWeight="bold" fill="#b45309">
                Node 2: R59 Reading Interchange
              </text>
            </g>

            {/* Converging Responder Unit */}
            <g transform={`translate(${respX}, ${respY})`}>
              <circle r="18" fill="rgba(37, 99, 235, 0.25)" className="animate-pulse" />
              <circle r="11" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
              <Car size={13} className="text-white -translate-x-[6.5px] -translate-y-[6.5px]" />
              <text x="14" y="4" fontSize="9" fontWeight="bold" fill="#1e40af">
                Fox Unit 14 (3.2 km)
              </text>
            </g>
          </>
        )}

        {/* Current Citizen User Marker */}
        <g transform={`translate(${userX}, ${userY})`}>
          <circle
            r={mode === "RED" ? "22" : "18"}
            fill={mode === "RED" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}
            className="animate-ping"
          />
          <circle
            r="12"
            fill={mode === "RED" ? "#dc2626" : "#10b981"}
            stroke="#ffffff"
            strokeWidth="3"
          />
          <text
            x="-16"
            y="-16"
            fontSize="10"
            fontWeight="bold"
            fill={mode === "RED" ? "#b91c1c" : "#065f46"}
          >
            {mode === "RED" ? "SOS" : "You"}
          </text>
        </g>
      </svg>

      {/* Floating Speed & GPS Badge */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
        <span className={`w-2 h-2 rounded-full ${mode === "RED" ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
        <span>{telemetrySpeed} km/h</span>
        <span className="text-slate-400">•</span>
        <span>140° SE</span>
      </div>

      {/* Live Road Indicator */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-slate-200 text-[11px] font-medium text-slate-600">
        N12 Southbound Corridor
      </div>
    </div>
  );
};
