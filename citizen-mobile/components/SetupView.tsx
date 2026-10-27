"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Camera,
  Check,
  Shield,
  User,
  Clock,
  Play,
  Settings,
  Navigation,
  Plus,
  X,
} from "lucide-react";

interface SetupViewProps {
  onStartJourney: (destination: string, etaMinutes: number, outfitUrl?: string) => Promise<void>;
  user: { full_name: string; phone_number: string };
  onSignOut: () => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  initial: string;
  initialBg: string;
  initialColor: string;
  active: boolean;
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
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactPhone, setNewContactPhone] = useState<string>("");

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: "c1",
      name: "Mom (Zanele Ndlovu)",
      phone: "+27 82 555 0198",
      initial: "M",
      initialBg: "#3d2b1a",
      initialColor: "#f5a94b",
      active: true,
    },
    {
      id: "c2",
      name: "Neighbor (Lerato Khumalo)",
      phone: "+27 82 555 0197",
      initial: "N",
      initialBg: "#252d3a",
      initialColor: "#cbd5e1",
      active: true,
    },
  ]);

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

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      initial: newContactName.trim().charAt(0).toUpperCase() || "C",
      initialBg: "#1f2d3a",
      initialColor: "#38bdf8",
      active: true,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    setShowAddContactModal(false);
  };

  const quickDestinations = [
    "Sandton City",
    "Rosebank Gautrain",
    "Alberton City",
    "OR Tambo",
  ];

  return (
    <div className="w-full min-h-screen bg-[#081018] text-slate-100 flex flex-col justify-between p-6 sm:p-10 xl:p-14 select-none overflow-y-auto">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full justify-between gap-6">
        {/* Top Header: Logo + Profile Button */}
        <div>
          <header className="flex items-center justify-between w-full mb-8">
            {/* Waypoint Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 relative flex items-center justify-center">
                <Image
                  src="/waypoint_logo_icon.png"
                  alt="Waypoint Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Waypoint</span>
            </div>

            {/* Profile Avatar Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-11 h-11 rounded-2xl bg-[#121922] border border-[#202936] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
              title="Profile & Settings"
            >
              <User className="w-5 h-5" />
            </button>
          </header>

          {/* Heading Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2.5">
              Ready to start your journey?
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-normal">
              Set up Waypoint in a few steps and keep your people in the loop.
            </p>
          </div>

          {/* Action Row: Start Journey CTA + Settings Gear */}
          <div className="flex items-center gap-3.5 mb-7">
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="flex-1 py-3.5 px-7 rounded-2xl bg-[#f5a94b] hover:bg-[#e4993d] active:scale-[0.99] text-[#121820] font-bold text-base shadow-lg shadow-amber-950/20 transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#121820] text-[#121820]" />
              <span>{loading ? "Initializing Transit Mesh..." : "Start Journey"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-14 h-14 rounded-2xl bg-[#121922] border border-[#202936] flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer flex-shrink-0"
              title="Transit Parameters & Dead-Man Switch"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Main Dashboard Card Container */}
          <div className="bg-[#0f1722] border border-[#1e2938] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            {/* Search Input Box */}
            <div className="relative flex items-center bg-[#131b24] border border-[#222d3b] rounded-2xl px-4 py-3.5 shadow-inner">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you heading to?"
                className="w-full bg-transparent text-sm sm:text-base font-medium text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setDestination("Sandton City Mall, Sandton")}
                className="text-slate-400 hover:text-white transition ml-2 cursor-pointer"
                title="Current Destination"
              >
                <Navigation className="w-4 h-4 rotate-45" />
              </button>
            </div>

            {/* Quick Destination Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {quickDestinations.map((item) => {
                const isSelected = destination.toLowerCase().includes(item.toLowerCase().split(" ")[0]);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDestination(`${item}, Johannesburg`)}
                    className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border border-[#f5a94b] text-[#f5a94b]"
                        : "bg-[#131b24] border border-[#222d3b] text-slate-400 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Outfit Photo Card */}
            <div
              onClick={() => setOutfitAdded(!outfitAdded)}
              className={`cursor-pointer border-1.5 border-dashed rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition ${
                outfitAdded
                  ? "border-emerald-500/50 bg-[#102220]/60"
                  : "border-[#283547] bg-[#121923] hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#1a2330] flex items-center justify-center flex-shrink-0 text-slate-400 border border-[#243345] overflow-hidden">
                  {outfitAdded ? (
                    <img
                      src={sampleOutfit}
                      alt="Outfit Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {outfitAdded ? "Outfit photo attached" : "Add outfit photo (optional)"}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Helps responders and friends recognise what you&apos;re wearing.
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#1a2330] border border-[#243345] flex items-center justify-center text-slate-300">
                {outfitAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-white">Emergency Contacts</span>
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(true)}
                  className="text-xs sm:text-sm font-semibold text-[#f5a94b] hover:underline cursor-pointer"
                >
                  + Add Contact
                </button>
              </div>

              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#131b24] border border-[#202b3a]"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: contact.initialBg,
                        color: contact.initialColor,
                      }}
                    >
                      {contact.initial}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{contact.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{contact.phone}</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#22c55e] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <footer className="flex items-center justify-between pt-4 pb-2 text-xs text-slate-400 border-t border-slate-800/60 mt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ETA Deadline: {etaMinutes} mins</span>
          </div>

          <div>
            <span>Signed in as {user.full_name || "Thandiwe Ndlovu"}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="text-[#f5a94b] font-semibold hover:underline ml-1.5 cursor-pointer"
            >
              (Sign Out)
            </button>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1722] border border-[#1e2938] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#f5a94b]" />
                <h3 className="text-lg font-bold text-white">Journey Safety Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  ETA TIMEOUT DURATION
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 35, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEtaMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        etaMinutes === mins
                          ? "bg-[#f5a94b] text-[#121820]"
                          : "bg-[#131b24] text-slate-300 border border-[#222d3b]"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#131b24] border border-[#202b3a] space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Statutory Dead-Man&apos;s Switch</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  If you fail to disarm with PIN 1234 before the ETA deadline expires, automatic CAD escalation alerts Fox Tactical and SAPS Flying Squad.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 rounded-xl bg-[#f5a94b] text-[#121820] font-bold text-sm cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddContact}
            className="bg-[#0f1722] border border-[#1e2938] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Emergency Contact</h3>
              <button
                type="button"
                onClick={() => setShowAddContactModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name &amp; Relation
              </label>
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="e.g. Sister (Naledi Ndlovu)"
                className="w-full bg-[#131b24] border border-[#222d3b] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                South African Mobile Number
              </label>
              <input
                type="text"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="+27 82 555 0196"
                className="w-full bg-[#131b24] border border-[#222d3b] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#f5a94b] text-[#121820] font-bold text-sm cursor-pointer"
            >
              Add Trusted Contact
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
