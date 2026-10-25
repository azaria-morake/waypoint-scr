"use client";

import React, { useState } from "react";
import { Lock, Delete, X, AlertTriangle, ShieldCheck } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPin: (pin: string) => Promise<void>;
  title?: string;
  isDuressMode?: boolean;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSubmitPin,
  title = "Enter Security PIN",
  isDuressMode = false,
}) => {
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setErrorMsg("");
      if (next.length === 4) {
        submit(next);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg("");
  };

  const submit = async (pinValue: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      await onSubmitPin(pinValue);
      setPin("");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid Security PIN");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-slate-800 shadow-2xl border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${isDuressMode ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
              {isDuressMode ? <AlertTriangle size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">
                {isDuressMode ? "Silent Hostage / Coercion protocol" : "Safe Disarm Protocol"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4-Dot Indicator */}
        <div className="flex space-x-4 my-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > idx
                  ? "bg-slate-900 border-slate-900 scale-110"
                  : "bg-slate-100 border-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className="text-xs text-red-600 font-semibold mb-2">{errorMsg}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] my-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-100 text-xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {/* Empty space */}
          </div>
          <button
            onClick={() => handleDigit("0")}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-100 text-xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Quick Test Protocols
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => submit("1234")}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition text-center"
            >
              Standard PIN (1234)
              <span className="block text-[10px] font-normal text-emerald-600">Disarms Normally</span>
            </button>
            <button
              onClick={() => submit("9999")}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold hover:bg-red-100 border border-red-200 transition text-center"
            >
              Duress PIN (9999)
              <span className="block text-[10px] font-normal text-red-600">Silent Deceptive Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
