"""
Waypoint Secure - 2G / Load-Shedding Compressed GSM-7 SMS Gateway
Parses 160-char GSM packets during load-shedding LTE blackouts.
Format: WP1|<phone>|<trigger_code>|<lat>,<lng>|<speed>|<heading>|<battery>|<hmac_hex>
"""
import re
from typing import Tuple, Dict, Any
from app.security.crypto import SecurityCrypto

class SmsGateway:
    @staticmethod
    def parse_gsm_packet(raw_sms: str) -> Tuple[bool, Dict[str, Any]]:
        clean = raw_sms.strip()
        parts = clean.split("|")

        if len(parts) < 8 or parts[0] != "WP1":
            return False, {"error": "Invalid GSM signature. Must start with 'WP1|' and contain 8 segments."}

        phone_number = parts[1].strip()
        trigger_code = parts[2].strip().upper()
        coords_raw = parts[3].strip()
        speed_raw = parts[4].strip()
        heading_raw = parts[5].strip()
        battery_raw = parts[6].strip()
        hmac_sig = parts[7].strip()

        # 1. Verify HMAC
        hmac_valid = SecurityCrypto.verify_sms_hmac(clean)
        if not hmac_valid:
            return False, {"error": "HMAC-SHA256 signature verification failed. Packet dropped."}

        # 2. Parse Coordinates
        try:
            lat_str, lng_str = coords_raw.split(",")
            lat = float(lat_str.strip())
            lng = float(lng_str.strip())
        except Exception:
            return False, {"error": f"Invalid coordinate format in SMS packet: {coords_raw}"}

        # 3. Parse Kinematics
        speed_match = re.search(r"(\d+(\.\d+)?)", speed_raw)
        speed_kmh = float(speed_match.group(1)) if speed_match else 0.0

        heading_match = re.search(r"(\d+(\.\d+)?)", heading_raw)
        heading_deg = float(heading_match.group(1)) if heading_match else 0.0

        bat_match = re.search(r"(\d+)", battery_raw)
        battery = int(bat_match.group(1)) if bat_match else 50

        is_emergency = trigger_code in ["RED", "SOS", "PANIC", "EMG"]

        return True, {
            "phone_number": phone_number,
            "trigger_code": trigger_code,
            "is_emergency": is_emergency,
            "lat": lat,
            "lng": lng,
            "speed_kmh": speed_kmh,
            "heading_deg": heading_deg,
            "battery": battery,
            "hmac_verified": True
        }
