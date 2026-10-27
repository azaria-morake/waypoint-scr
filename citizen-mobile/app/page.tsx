"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AuthScreen } from "../components/AuthScreen";
import { SetupView } from "../components/SetupView";
import { ActiveJourneyView } from "../components/ActiveJourneyView";
import { HelpDispatchedView } from "../components/HelpDispatchedView";
import { CompletionScreen } from "../components/CompletionScreens";
import { PinModal } from "../components/PinModal";
import { MapPin, Users, Shield } from "lucide-react";

export default function CitizenMobileApp() {
  const [user, setUser] = useState<{
    user_id: string;
    full_name: string;
    phone_number: string;
  } | null>({
    user_id: "usr_thandiwe_001",
    full_name: "Thandiwe Ndlovu",
    phone_number: "+27 82 555 0199",
  });

  const [currentView, setCurrentView] = useState<"SETUP" | "ACTIVE" | "RED" | "COMPLETED">("SETUP");
  const [journeyId, setJourneyId] = useState<string>("active_journey");
  const [destination, setDestination] = useState<string>("Sandton City Mall, Sandton");
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isDuressPinMode, setIsDuressPinMode] = useState<boolean>(false);
  const [isDeceptiveDuressState, setIsDeceptiveDuressState] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Auth Complete
  const handleAuthSuccess = (authenticatedUser: {
    user_id: string;
    full_name: string;
    phone_number: string;
  }) => {
    setUser(authenticatedUser);
    setCurrentView("SETUP");
  };

  // 2. Start Monitored Journey (1st Tap)
  const handleStartJourney = async (dest: string, etaMins: number, outfitUrl?: string) => {
    setDestination(dest);
    try {
      const res = await fetch(`${apiUrl}/api/v1/journeys/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_name: dest,
          destination_lat: -26.1076,
          destination_lng: 28.0567,
          eta_minutes: etaMins,
          pre_journey_outfit_photo_url: outfitUrl || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setJourneyId(data.journey_id);
      }
    } catch (e) {
      console.warn("Using offline simulated journey ID", e);
    }
    setCurrentView("ACTIVE");
  };

  // 3. SOS Panic Button (2nd Tap)
  const handlePanicTapTwo = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/${journeyId}/panic`, {
        method: "POST",
      });
    } catch (e) {
      console.warn("Panic API fallback", e);
    }
    setCurrentView("RED");
  };

  // 4. Simulate G-Force Struggle (>3.0G)
  const handleSimulateGForce = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/${journeyId}/panic`, {
        method: "POST",
      });
    } catch (e) {
      console.warn("G-Force struggle simulation fallback", e);
    }
    setCurrentView("RED");
  };

  // 5. Simulate 2G SMS GSM-7 Fallback
  const handleSimulateSmsFallback = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/webhooks/sms-fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_sms: "WP1|+27825550199|RED|-26.2678,28.1245|78|140|42|HMAC_OK",
          sender_number: "+27825550199",
        }),
      });
    } catch (e) {
      console.warn("SMS Fallback simulation fallback", e);
    }
    setCurrentView("RED");
  };

  // 6. Dual-PIN Verification (Standard 1234 vs Duress 9999)
  const handleSubmitPin = async (enteredPin: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/journeys/${journeyId}/disarm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid security PIN");
      }

      setIsPinModalOpen(false);

      if (enteredPin === "9999") {
        // Coercion Duress PIN: Show deceptive safe screen, but backend is secretly Code Red!
        setIsDeceptiveDuressState(true);
        setCurrentView("COMPLETED");
      } else {
        // Standard safe disarm
        setIsDeceptiveDuressState(false);
        setCurrentView("COMPLETED");
      }
    } catch (e: any) {
      // Local fallback for quick test if server unreachable
      if (enteredPin === "1234") {
        setIsPinModalOpen(false);
        setIsDeceptiveDuressState(false);
        setCurrentView("COMPLETED");
      } else if (enteredPin === "9999") {
        setIsPinModalOpen(false);
        setIsDeceptiveDuressState(true);
        setCurrentView("COMPLETED");
      } else {
        throw e;
      }
    }
  };

  // Return to Setup View
  const handleReturnHome = async () => {
    try {
      await fetch(`${apiUrl}/api/v1/journeys/reset`, { method: "POST" });
    } catch (e) {
      // ignore
    }
    setCurrentView("SETUP");
    setIsDeceptiveDuressState(false);
  };

  // If not logged in, show AuthScreen (Waypoint_login_bg.png + Waypoint_login_component.png)
  if (!user) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return (
    <main className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#081018] select-none">
      {/* ========================================================= */}
      {/* LEFT PANEL: Locked Fixed Hero Panel (Doesn't scroll)      */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[420px] lg:h-full lg:sticky lg:top-0 flex flex-col justify-end p-8 lg:p-14 overflow-hidden bg-[#081018] flex-shrink-0">
        {/* Restored Original Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Waypoint_login_bg.png"
            alt="Waypoint Runner Background"
            fill
            priority
            className="object-cover object-center filter brightness-[0.88] contrast-[1.08] scale-[1.02]"
          />
          {/* Atmospheric gradient overlays for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081018] via-[#081018]/60 to-[#081018]/30 lg:bg-gradient-to-r lg:from-transparent lg:via-[#081018]/30 lg:to-[#081018]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#081018]/90" />
        </div>

        {/* Text and Icons on top of original image matching reference */}
        <div className="relative z-10 max-w-xl w-full">
          {/* Amber Accent Pill */}
          <div className="w-12 h-1 bg-[#f5a94b] rounded-full mb-6" />

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12] mb-4 drop-shadow-md">
            You can run,<br />
            <span className="text-[#f5a94b]">as far as you like.</span>
          </h2>

          {/* Subtitle Paragraph */}
          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-md leading-relaxed mb-8 drop-shadow">
            Waypoint keeps a last known location, so your people know where to look if something goes wrong.
          </p>

          {/* 3 Column Feature Badges with Icons */}
          <div className="grid grid-cols-3 pt-6 border-t border-white/15 max-w-md w-full">
            <div className="flex flex-col items-start pr-3 border-r border-white/15">
              <MapPin className="w-5 h-5 text-slate-300 mb-2 stroke-[1.8]" />
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                Last known location
              </span>
            </div>

            <div className="flex flex-col items-start px-3 border-r border-white/15">
              <Users className="w-5 h-5 text-slate-300 mb-2 stroke-[1.8]" />
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                Your trusted contacts
              </span>
            </div>

            <div className="flex flex-col items-start pl-3">
              <Shield className="w-5 h-5 text-slate-300 mb-2 stroke-[1.8]" />
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight">
                Simple and discreet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Citizen Safety Control & Onboarding Dashboard */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-screen lg:h-full lg:overflow-y-auto bg-[#081018] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 shadow-2xl">
        {currentView === "SETUP" && (
          <SetupView
            user={user}
            onStartJourney={handleStartJourney}
            onSignOut={() => setUser(null)}
          />
        )}

        {currentView === "ACTIVE" && (
          <ActiveJourneyView
            journeyId={journeyId}
            destination={destination}
            onPanicTapTwo={handlePanicTapTwo}
            onOpenPinModal={(isDuress) => {
              setIsDuressPinMode(isDuress);
              setIsPinModalOpen(true);
            }}
            onSimulateGForceStruggle={handleSimulateGForce}
            onSimulateSmsFallback={handleSimulateSmsFallback}
          />
        )}

        {currentView === "RED" && (
          <HelpDispatchedView
            journeyId={journeyId}
            onOpenPinModal={(isDuress) => {
              setIsDuressPinMode(isDuress);
              setIsPinModalOpen(true);
            }}
            onDuressTrigger={async () => {
              handleSubmitPin("9999");
            }}
          />
        )}

        {currentView === "COMPLETED" && (
          <CompletionScreen
            isDeceptiveDuress={isDeceptiveDuressState}
            onReturnHome={handleReturnHome}
          />
        )}

        {/* Dual-PIN Entry Modal */}
        <PinModal
          isOpen={isPinModalOpen}
          isDuressMode={isDuressPinMode}
          title={isDuressPinMode ? "Duress Security PIN" : "Enter Standard PIN to Disarm"}
          onClose={() => setIsPinModalOpen(false)}
          onSubmitPin={handleSubmitPin}
        />
      </div>
    </main>
  );
}
