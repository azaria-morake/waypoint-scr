"use client";

import React from "react";
import { Lock, Unlock, ShieldCheck, Eye, AlertOctagon, Phone, User, CheckCircle2 } from "lucide-react";

interface BoloInspectorProps {
  isRedAlert: boolean;
  boloData?: {
    full_name: string;
    height_cm: number;
    build: string;
    photo_url: string;
  };
  synthesizedAttire?: string;
}

export const BoloInspector: React.FC<BoloInspectorProps> = ({
  isRedAlert,
  boloData,
  synthesizedAttire = "Yellow high-visibility puffer jacket, black athletic tights, white running shoes with reflective pink trim",
}) => {
  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col justify-between select-none">
      {/* Header & POPIA Shield Badge */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            {isRedAlert ? (
              <Unlock className="w-5 h-5 text-amber-400 animate-bounce" />
            ) : (
              <Lock className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              BOLO &amp; POPIA Zero-Knowledge Shield
            </h3>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              isRedAlert
                ? "bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {isRedAlert ? "SEC 11(1)(d) UNLOCKED" : "SHIELD ACTIVE"}
          </span>
        </div>

        {/* Biometric Card & Decryption Preview */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          {/* Face Photo Container */}
          <div className="relative w-32 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center">
            {isRedAlert ? (
              <img
                src={boloData?.photo_url || defaultPhoto}
                alt="BOLO Citizen"
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
              />
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-950">
                <div className="filter blur-md opacity-25 w-full h-full absolute inset-0">
                  <img
                    src={defaultPhoto}
                    alt="Encrypted"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Lock className="w-7 h-7 text-slate-500 relative z-10 mb-1" />
                <span className="text-[9px] font-mono font-bold text-slate-400 relative z-10 uppercase leading-tight">
                  AES-256-GCM Encrypted
                </span>
                <span className="text-[8px] font-mono text-slate-600 relative z-10 mt-1">
                  KMS Key: #za-c4-09
                </span>
              </div>
            )}

            {isRedAlert && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                BOLO
              </div>
            )}
          </div>

          {/* Citizen Details */}
          <div className="flex-1 w-full space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">
                Citizen Full Name
              </span>
              <p className={`text-base font-black ${isRedAlert ? "text-white" : "font-mono text-slate-400 text-xs"}`}>
                {isRedAlert ? "Thandiwe Ndlovu" : "[ENCRYPTED - POPIA SHIELD ACTIVE]"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Height
                </span>
                <p className="font-semibold text-slate-200">
                  {isRedAlert ? "165 cm" : "[ENCRYPTED]"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Physical Build
                </span>
                <p className="font-semibold text-slate-200">
                  {isRedAlert ? "Slender Athletic" : "[ENCRYPTED]"}
                </p>
              </div>
            </div>

            {/* Synthesized Live Attire (From Agent 3 NOK Recon) */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center space-x-1">
                <span>AI-Synthesized Attire (NOK Recon)</span>
                {isRedAlert && (
                  <span className="text-emerald-400 text-[9px] font-bold">● LIVE VERIFIED</span>
                )}
              </span>
              <p
                className={`text-xs mt-0.5 rounded-lg p-2 ${
                  isRedAlert
                    ? "bg-amber-950/40 border border-amber-600/30 text-amber-200 font-medium"
                    : "bg-slate-950 text-slate-500 font-mono text-[11px]"
                }`}
              >
                {isRedAlert
                  ? `"${synthesizedAttire}"`
                  : "[POPIA Shield: Pre-journey outfit blob protected until distress event]"}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Interrogation Status */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Next of Kin Escalation Channels
          </span>
          <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xs">👩🏽</span>
                <div>
                  <p className="font-bold text-slate-200">Zanele (Sister)</p>
                  <p className="text-[10px] text-slate-500">+27 82 555 0198</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRedAlert ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "text-slate-600"}`}>
                {isRedAlert ? "AI WhatsApp Reconn" : "STANDBY"}
              </span>
            </div>

            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-xs">👨🏾</span>
                <div>
                  <p className="font-bold text-slate-200">Lerato (Friend)</p>
                  <p className="text-[10px] text-slate-500">+27 82 555 0197</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRedAlert ? "bg-blue-950 text-blue-400 border border-blue-500/30" : "text-slate-600"}`}>
                {isRedAlert ? "SMS Alerted" : "STANDBY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* POPIA Legal Clause Banner */}
      <div className="mt-4 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-500 leading-tight">
        ⚖️ <span className="font-semibold text-slate-400">POPIA Section 11(1)(d):</span> Personal identification and biometric photos are automatically decrypted exclusively to save life during confirmed vital emergencies.
      </div>
    </div>
  );
};
