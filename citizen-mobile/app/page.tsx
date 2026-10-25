"use client";

import React, { useState } from "react";
import { AuthScreen } from "../components/AuthScreen";
import { SetupView } from "../components/SetupView";
import { ActiveJourneyView } from "../components/ActiveJourneyView";
import { HelpDispatchedView } from "../components/HelpDispatchedView";
import { CompletionScreen } from "../components/CompletionScreens";
import { PinModal } from "../components/PinModal";

export default function CitizenMobileApp() {
  const [user, setUser] = useState<{
    user_id: string;
    full_name: string;
    phone_number: string;
  } | null>(null);

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
    <main className="w-full min-h-screen bg-slate-950 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white relative shadow-2xl overflow-hidden flex flex-col">
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
