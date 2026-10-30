#!/usr/bin/env bash
# ==============================================================================
# Waypoint — Ultra Low-Spec Android Emulator Launcher
# Optimized for Dual-Core / 8GB RAM host systems (Intel Haswell / HD Graphics)
# Downscaled to 360x800 @ 160dpi (89% fewer pixels, pixelated & smooth)
# ==============================================================================

EMULATOR_BIN="$HOME/Android/Sdk/emulator/emulator"
AVD_NAME="ditiro_drone"

if [ ! -f "$EMULATOR_BIN" ]; then
  EMULATOR_BIN=$(which emulator 2>/dev/null)
fi

if [ -z "$EMULATOR_BIN" ]; then
  echo "❌ Error: Android emulator binary not found in $HOME/Android/Sdk/emulator/emulator or PATH."
  exit 1
fi

echo "🚀 Starting Android emulator '$AVD_NAME' in Low-Resolution Pixelated Mode..."
echo "⚙️  Resolution: 360x800 @ 160dpi | RAM: 1280MB | No Audio | No Boot Anim"

# Allow user to choose GPU backend (defaults to 'host' for Intel HD Graphics offload)
GPU_MODE="${1:-host}"

# If emulator is already running, just downscale it immediately!
RUNNING_DEVICE=$(adb devices 2>/dev/null | grep "emulator-" | awk '{print $1}' | head -n 1)
if [ -n "$RUNNING_DEVICE" ]; then
  echo "✓ Emulator is already running on $RUNNING_DEVICE."
  echo "Applying instant downscaling to 360x800 @ 160dpi & disabling animations..."
  adb shell wm size 360x800
  adb shell wm density 160
  adb shell settings put global window_animation_scale 0
  adb shell settings put global transition_animation_scale 0
  adb shell settings put global animator_duration_scale 0
  echo "✅ Instant downscale applied! The emulator is now rendering in pixelated low-spec mode."
  exit 0
fi

"$EMULATOR_BIN" -avd "$AVD_NAME" \
  -gpu "$GPU_MODE" \
  -memory 1280 \
  -no-boot-anim \
  -no-audio \
  -camera-back none \
  -camera-front none \
  -cores 2 \
  -netdelay none \
  -netspeed full \
  -no-snapshot-load "${@:2}" &

EMU_PID=$!
echo "⏳ Waiting for emulator adb connection to lock in 360x800 scaled resolution..."

# Background subshell to apply wm size & performance settings once booted
(
  adb wait-for-device
  while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 2
  done
  # Enforce scaled 360x800 rendering in Android WindowManager
  adb shell wm size 360x800 2>/dev/null
  adb shell wm density 160 2>/dev/null
  # Disable OS window animations to save Intel GPU cycles
  adb shell settings put global window_animation_scale 0 2>/dev/null
  adb shell settings put global transition_animation_scale 0 2>/dev/null
  adb shell settings put global animator_duration_scale 0 2>/dev/null
  echo "✅ Screen resolution locked to 360x800 (160 dpi) and animations disabled for ultra-smooth rendering."
) &

wait $EMU_PID
