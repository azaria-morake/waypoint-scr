"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Eye,
  AlertOctagon,
  Phone,
  User,
  CheckCircle2,
  FileText,
  Key,
  Shield,
  Clock,
  Fingerprint,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { OrganizationOption } from "./LoginScreen";

interface PopiaVaultViewProps {
  currentOrg: OrganizationOption;
  isWsConnected: boolean;
  hasActiveCrisis?: boolean;
}

export const PopiaVaultView: React.FC<PopiaVaultViewProps> = ({
  currentOrg,
  isWsConnected,
  hasActiveCrisis = false,
}) => {
  const [isShieldActive, setIsShieldActive] = useState<boolean>(!hasActiveCrisis);
  const [justification, setJustification] = useState<string>("VITAL_INTERESTS_SEC11_1_D");
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "AUD-ZA-9921",
      timestamp: "12 mins ago",
      officer: currentOrg.officerName,
      badge: currentOrg.badgeNumber,
      action: "HSM_ZERO_KNOWLEDGE_PING",
      justification: "Automated Cryptographic Key Rotation",
      hash: "8f4a1c...e3b9",
      status: "VERIFIED",
    },
    {
      id: "AUD-ZA-9918",
      timestamp: "35 mins ago",
      officer: "Ops Commander Ndlovu",
      badge: "FOX-OPS-01",
      action: "SECTOR_RADIUS_CHECK",
      justification: "Spatial Geofence Synchronization",
      hash: "3b2e7d...99fa",
      status: "VERIFIED",
    },
    {
      id: "AUD-ZA-9905",
      timestamp: "2 hours ago",
      officer: "Constable Morake",
      badge: "SAPS-7491-EKU",
      action: "STATION_TERMINAL_LOGIN",
      justification: "Shift Commencement Handover",
      hash: "11de89...45aa",
      status: "VERIFIED",
    },
  ]);

  const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  const handleExecuteEmergencyDecrypt = () => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsShieldActive(false);

      // Append immutable audit log
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setAuditLogs((prev) => [
        {
          id: `AUD-ZA-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: `Just now (${nowTime})`,
          officer: currentOrg.officerName,
          badge: currentOrg.badgeNumber,
          action: "STATUTORY_EMERGENCY_DECRYPT",
          justification:
            justification === "VITAL_INTERESTS_SEC11_1_D"
              ? "Section 11(1)(d): Imminent Threat to Life or Bodily Harm"
              : justification === "POLICE_DUTY_SEC11_1_C"
              ? "Section 11(1)(c): Performance of Statutory Police Duty (SAPS)"
              : "Section 11(1)(b): Performance of Contracted Armed Response Protocol",
          hash: `${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
          status: "VERIFIED",
        },
        ...prev,
      ]);
    }, 900);
  };

  const handleRelockShield = () => {
    setIsShieldActive(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto select-none p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                POPIA Section 11 Cryptographic Vault
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory Zero-Knowledge Biometric Shield &amp; Regulatory Audit Ledger (Act 4 of 2013)
              </p>
            </div>
          </div>
        </div>

        {/* Shield Status Indicator */}
        <div className="flex items-center space-x-3">
          <div
            className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 text-xs font-mono font-bold shadow ${
              isShieldActive
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse"
            }`}
          >
            {isShieldActive ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-amber-400" />}
            <span>{isShieldActive ? "ZERO-KNOWLEDGE SHIELD LOCKED" : "SECTION 11(1)(d) UNMASKED"}</span>
          </div>

          {!isShieldActive && (
            <button
              type="button"
              onClick={handleRelockShield}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Re-lock Vault
            </button>
          )}
        </div>
      </div>

      {/* Regulatory Context Banner */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Key className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wide">
              South African Protection of Personal Information Act (POPIA) Architecture
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              At rest, all citizen identity vectors (face biometrics, next-of-kin, residential stands) are
              encrypted under AES-256-GCM. Decryption keys are held in zero-knowledge HSM vaults and only
              accessible when Code Red is triggered under statutory life-preservation clauses.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex-shrink-0">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>KMS KEY: #za-popia-c4-09</span>
        </div>
      </div>

      {/* Two Column Section: Left = Biometric Dossier, Right = Emergency Decrypt Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Protected Citizen Dossier Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Citizen Biometric Dossier (In-Transit)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ID: ZA-CIT-9102</span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              {/* Photo Container */}
              <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center shadow-inner">
                {!isShieldActive ? (
                  <img
                    src={defaultPhoto}
                    alt="Citizen"
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-950">
                    <div className="filter blur-md opacity-20 w-full h-full absolute inset-0">
                      <img src={defaultPhoto} alt="Encrypted" className="w-full h-full object-cover" />
                    </div>
                    <Lock className="w-8 h-8 text-slate-500 relative z-10 mb-2" />
                    <span className="text-[10px] font-mono font-bold text-slate-300 relative z-10 uppercase leading-tight">
                      Zero-Knowledge Encrypted
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 relative z-10 mt-1">
                      AES-256-GCM
                    </span>
                  </div>
                )}

                {!isShieldActive && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    BOLO ACTIVE
                  </div>
                )}
              </div>

              {/* Data Fields */}
              <div className="flex-1 w-full space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Citizen Legal Identity
                  </span>
                  <p className={`text-base font-black ${!isShieldActive ? "text-white" : "font-mono text-slate-400 text-xs"}`}>
                    {!isShieldActive ? "Thandiwe Ndlovu" : "[ENCRYPTED - POPIA SHIELD ACTIVE]"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Contact Phone</span>
                    <span className="font-mono font-bold text-slate-200">
                      {!isShieldActive ? "+27 82 555 0199" : "+27 82 *** ****"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Height / Build</span>
                    <span className="font-mono font-bold text-slate-200">
                      {!isShieldActive ? "165 cm • Slender" : "[ENCRYPTED]"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Emergency Contact (Next-of-Kin)</span>
                  <span className="font-mono font-bold text-slate-200 text-xs">
                    {!isShieldActive ? "Zanele Ndlovu (Sister) • +27 71 555 0812" : "[LOCKED PENDING CODE RED]"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Pre-Journey Outfit Photo Match</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {!isShieldActive ? "Yellow puffer jacket, black tights, white sneakers" : "[BLIND MATCHING ARMED]"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Statutory Decryption Request Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Unlock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Statutory Emergency Decrypt Authorization
              </h3>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              To unmask citizen biometric telemetry for dispatch and field interdiction, the officer must
              certify a legitimate statutory ground under Chapter 3 of the POPI Act.
            </p>

            {/* Justification Selector */}
            <div className="mt-4 space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Select Statutory Justification:
              </label>

              <div
                onClick={() => setJustification("VITAL_INTERESTS_SEC11_1_D")}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                  justification === "VITAL_INTERESTS_SEC11_1_D"
                    ? "bg-amber-950/40 border-amber-500/80 text-white shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="justification"
                  checked={justification === "VITAL_INTERESTS_SEC11_1_D"}
                  onChange={() => {}}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="font-bold text-amber-300">Section 11(1)(d) • Vital Interests</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Processing protects an imminent vital interest of the data subject (emergency physical threat / kidnapping).
                  </div>
                </div>
              </div>

              <div
                onClick={() => setJustification("POLICE_DUTY_SEC11_1_C")}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                  justification === "POLICE_DUTY_SEC11_1_C"
                    ? "bg-amber-950/40 border-amber-500/80 text-white shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="justification"
                  checked={justification === "POLICE_DUTY_SEC11_1_C"}
                  onChange={() => {}}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="font-bold text-cyan-300">Section 11(1)(c) • Statutory Police Duty</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Processing complies with statutory obligations of the South African Police Service (SAPS Act 68 of 1995).
                  </div>
                </div>
              </div>

              <div
                onClick={() => setJustification("CONTRACT_SEC11_1_B")}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                  justification === "CONTRACT_SEC11_1_B"
                    ? "bg-amber-950/40 border-amber-500/80 text-white shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="justification"
                  checked={justification === "CONTRACT_SEC11_1_B"}
                  onChange={() => {}}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="font-bold text-slate-200">Section 11(1)(b) • Armed Reaction Contract</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Necessary for the performance of a contracted private armed response service (PSIRA registered).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            {isShieldActive ? (
              <button
                type="button"
                onClick={handleExecuteEmergencyDecrypt}
                disabled={isDecrypting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDecrypting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Legal Signature &amp; KMS Decrypt...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Authorize Emergency Statutory Decrypt</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-300 flex items-center justify-between">
                <span className="font-bold">Vault Unmasked Under Selected Ground</span>
                <button
                  type="button"
                  onClick={handleRelockShield}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Re-lock Vault
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Immutable POPIA Cryptographic Audit Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Immutable Cryptographic Access Ledger (POPIA Section 17 &amp; 19)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            SHA-256 HMAC CHAIN
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-mono uppercase">
                <th className="pb-2">Audit ID</th>
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Authorized Officer</th>
                <th className="pb-2">Action / Query</th>
                <th className="pb-2">Statutory Justification</th>
                <th className="pb-2 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 text-cyan-400 font-bold">{log.id}</td>
                  <td className="py-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 text-slate-200">
                    <span className="font-sans font-semibold">{log.officer}</span>
                    <span className="text-[10px] text-slate-500 block">{log.badge}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes("EMERGENCY")
                          ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-sans text-xs max-w-xs">{log.justification}</td>
                  <td className="py-3 text-right text-emerald-400">{log.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
