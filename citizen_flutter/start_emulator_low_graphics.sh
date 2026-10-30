#!/usr/bin/env bash
# ==============================================================================
# Waypoint — Low-Graphics & Low-RAM Android Emulator Launcher
# Optimized for 8GB RAM host systems.
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

echo "🚀 Starting Android emulator '$AVD_NAME' with lowest graphics and reduced memory..."
echo "⚙️  Options: -gpu swiftshader | -memory 1536MB | -no-boot-anim | -no-audio"

"$EMULATOR_BIN" -avd "$AVD_NAME" \
  -gpu swiftshader \
  -memory 1536 \
  -no-boot-anim \
  -no-audio \
  -camera-back none \
  -camera-front none \
  -cores 2 "$@"
