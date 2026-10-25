"use client";

import React, { useState } from "react";
import { Search, Camera, Check, Shield, User, Clock, ChevronDown } from "lucide-react";

interface SetupViewProps {
  onStartJourney: (destination: string, etaMinutes: number, outfitUrl?: string) => Promise<void>;
  user: { full_name: string; phone_number: string };
  onSignOut: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  onStartJourney,
  user,
  onSignOut,
}) => {
  const [destination, setDestination] = useState<string>("Sandton City Mall, Sandton");
  const [etaMinutes, setEtaMinutes] = useState<number>(25);
  const [outfitAdded, setOutfitAdded] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const sampleOutfit = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStartJourney(
        destination,
        etaMinutes,
        outfitAdded ? sampleOutfit : undefined
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#15202b] flex flex-col justify-between select-none">
      {/* Top Header & Start Action Section */}
      <div className="pt-10 px-6 pb-6 flex flex-col items-center text-center">
        {/* Brand Header */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-2xl font-bold text-white tracking-tight">Waypoint</span>
          <div className="w-6 h-6 rounded-full bg-[#f6ad55] flex items-center justify-center text-slate-900 shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22l10-4 10 4L12 2z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-white leading-tight max-w-[280px] mb-8 font-sans">
          Ready to start your journey?
        </h2>

        {/* Big Mint Green Start Button (Exact Match) */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full max-w-xs py-4 px-6 rounded-full bg-[#9ee8d1] hover:bg-[#88dcbe] active:scale-[0.98] text-[#13372c] font-bold text-lg shadow-lg transition flex items-center justify-center"
        >
          {loading ? "Initializing Dead-Man's Switch..." : "Start Journey"}
        </button>
        <p className="text-xs text-slate-300 font-normal mt-3">
          Keep us with you on your way.
        </p>
      </div>

      {/* Bottom Sheet Card (Rounded Top Corners) */}
      <div className="bg-[#f8fafc] rounded-t-[2.5rem] p-6 shadow-2xl flex flex-col space-y-4">
        {/* Destination Search Box */}
        <div className="relative">
          <div className="flex items-center bg-white rounded-2xl px-4 py-3.5 border border-slate-200/80 shadow-sm">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you heading to?"
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          {/* Quick preset chips */}
          <div className="flex space-x-2 mt-2 overflow-x-auto pb-1 text-[11px]">
            {["Sandton City", "Rosebank Gautrain", "Alberton City", "OR Tambo"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDestination(`${item}, Johannesburg`)}
                className="px-2.5 py-1 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 font-medium whitespace-nowrap transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Add Outfit Photo (Dotted Box) */}
        <div
          onClick={() => setOutfitAdded(!outfitAdded)}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 flex items-center space-x-3.5 transition ${
            outfitAdded
              ? "border-emerald-400 bg-emerald-50/50"
              : "border-slate-300 bg-white hover:border-slate-400"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 overflow-hidden relative border border-slate-200">
            {outfitAdded ? (
              <img
                src={sampleOutfit}
                alt="Outfit Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Add outfit photo <span className="font-normal text-slate-500">(optional)</span>
              </h4>
              {outfitAdded && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Added
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              To help friends or responders know what you&apos;re wearing.
            </p>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="pt-1">
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">
            Emergency Contacts
          </h4>
          <div className="flex flex-col space-y-2.5">
            {/* Mom */}
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  👩🏽
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Mom (Zanele Ndlovu)</p>
                  <p className="text-[10px] text-slate-400">+27 82 555 0198</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#9ee8d1] flex items-center justify-center text-[#13372c]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Neighbor */}
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/70 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  👨🏾
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Neighbor (Lerato Khumalo)</p>
                  <p className="text-[10px] text-slate-400">+27 82 555 0197</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#9ee8d1] flex items-center justify-center text-[#13372c]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* ETA & Sign Out Info */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ETA Deadline: {etaMinutes} mins</span>
          </div>
          <button
            onClick={onSignOut}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            Signed in as {user.full_name} (Sign Out)
          </button>
        </div>
      </div>
    </div>
  );
};
