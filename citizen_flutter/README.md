# Waypoint Citizen — Flutter Mobile Application

A cross-platform Flutter mobile client for **Waypoint Secure**, matching the tactical commuter safety specification outlined in `.brief/Engineering.md` and the reference UI (`Waypoint Safety Onboarding Dashboard-2.png`).

---

## 🚀 Key Features

1. **Authentication & Quick Demo Entry**:
   - Phone number and 4-digit PIN authentication with fallback demo profile (`Thandiwe Ndlovu`, `+27 82 555 0199`).
   - One-tap "Quick Demo as Thandiwe Ndlovu" for instant evaluation.

2. **Safety Onboarding Dashboard (Setup Screen)**:
   - Pixel-accurate match to the design reference:
     - Locked left hero showcase with atmospheric runner photography and feature badges (*Last known location*, *Your trusted contacts*, *Simple and discreet*).
     - Searchable destination input with quick destination chips: *Sandton City*, *Rosebank Gautrain*, *Alberton City*, *OR Tambo*.
     - Visual Verification Outfit photo upload card with preview (`assets/images/runner_portrait.png`).
     - Emergency Contacts list (*Mom: Zanele Ndlovu*, *Neighbor: Lerato Khumalo*) with status indicators and "+ Add Contact" modal.
     - Primary CTA: Amber `#F5A94B` **Start Journey** button.
     - Settings modal with configurable backend API URL and PIN inspection.

3. **Active Journey & Dead-Man's Switch (DMS)**:
   - Interactive live map powered by `flutter_map` and OpenStreetMap tiles displaying the real Alberton North to Sandton City Mall transit corridor.
   - Live citizen position marker with animated radar pulse.
   - Mint green status bar with real-time countdown timer for the Dead-Man's Switch.
   - **Large Glowing SOS Panic Button**: 2nd-Tap emergency trigger with animated glow rings.
   - **Hardware Sensor Monitoring**: Listens to accelerometer events via `sensors_plus` to automatically detect struggle/violent force spikes (> 3.0G) and escalate to Code Red.
   - **2G SMS GSM-7 Fallback**: Interactive simulation button to test offline SMS telemetry transmission.

4. **Emergency Help Dispatched (Code Red)**:
   - Red alert state with converging tactical responder unit marker (*Fox Tactical Unit 14*).
   - Dynamic responder distance and ETA calculator.
   - Tactical coordination checklist (*Sister WhatsApp AI Agent, local patrol CPF, POPIA Sec 11 broadcast*).

5. **Dual-PIN Anti-Coercion Security Keypad**:
   - **Standard Safe PIN (`1234`)**: Confirms safe arrival, de-escalates emergency sirens, and restores POPIA privacy shield.
   - **Silent Duress PIN (`9999`)**: Coercion-resistant protocol. Displays an identical "Safe Journey Ended" screen to any attacker/hijacker while silently broadcasting an emergency Code Red distress payload to SAPS and armed tactical teams.

---

## 📁 Architecture Overview

```
citizen_flutter/
├── lib/
│   ├── main.dart                  # App controller and root state coordinator
│   ├── theme/
│   │   └── app_theme.dart         # Design system tokens (#081018, #0F1722, #F5A94B, #22C55E)
│   ├── models/
│   │   ├── user_model.dart        # UserProfile data model
│   │   ├── contact_model.dart     # EmergencyContact data model
│   │   └── journey_model.dart     # JourneyModel, transit corridor coordinates & interpolation
│   ├── services/
│   │   ├── api_service.dart       # REST client for core-backend API with offline fallback
│   │   └── telemetry_service.dart # Accelerometer listener (> 3.0G struggle detector)
│   ├── widgets/
│   │   ├── live_map_view.dart     # flutter_map widget with polylines and pulse markers
│   │   ├── left_hero_panel.dart   # Reusable locked hero panel with brand photography
│   │   └── pin_modal.dart         # 4-digit keypad modal (1234 safe vs 9999 duress)
│   └── views/
│       ├── auth_screen.dart       # Authentication console
│       ├── setup_screen.dart      # Safety Onboarding Dashboard (reference UI)
│       ├── active_journey_screen.dart # Live map, DMS countdown & SOS panic
│       ├── help_dispatched_screen.dart # Code Red tactical swarm dispatch
│       └── completion_screen.dart # Safe vs deceptive duress completion
├── assets/
│   └── images/                    # UI images, runner background, portraits, and icons
└── test/
    └── widget_test.dart           # Widget test suite (passes with exit code 0)
```

---

## 🛠️ How to Run

### 1. Run on Connected Linux Desktop
```bash
cd citizen_flutter
flutter run -d linux
```

### 2. Run on Android Emulator (Ultra Low-Spec / 8GB RAM Mode)
```bash
# Launch the emulator in 360x800 pixelated low-spec mode (89% fewer pixels, CPU < 15%):
./citizen_flutter/start_emulator_low_graphics.sh

# If the emulator is already running, downscale on the fly via adb:
adb shell wm size 360x800 && adb shell wm density 160

# Run the Flutter App on the connected emulator
cd citizen_flutter
flutter run -d emulator-5554 --no-enable-impeller
```

### 3. Run Automated Tests
```bash
cd citizen_flutter
flutter test
```

### 4. Backend Connection
The application connects to the Waypoint backend service:
- Default Linux Desktop / Local: `http://localhost:8000`
- Default Android Emulator: `http://10.0.2.2:8000`
- Custom URL: Tap the settings gear icon on the setup dashboard to set a custom host IP or domain.
