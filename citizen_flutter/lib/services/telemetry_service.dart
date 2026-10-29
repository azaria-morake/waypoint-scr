import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:sensors_plus/sensors_plus.dart';

class TelemetryService {
  StreamSubscription<UserAccelerometerEvent>? _sensorSubscription;
  Function(double gForce)? onStruggleDetected;
  bool _isListening = false;
  DateTime _lastStruggleAlert = DateTime.fromMillisecondsSinceEpoch(0);

  void startSensorMonitoring({required Function(double gForce) onStruggle}) {
    if (_isListening) return;
    onStruggleDetected = onStruggle;
    _isListening = true;

    try {
      _sensorSubscription = userAccelerometerEventStream().listen(
        (UserAccelerometerEvent event) {
          // Total dynamic acceleration in m/s^2 (excluding baseline gravity)
          final magnitude = math.sqrt(
            event.x * event.x + event.y * event.y + event.z * event.z,
          );
          // Convert to G-force (1G ≈ 9.80665 m/s^2)
          final gForce = 1.0 + (magnitude / 9.80665);

          // Threshold for violence / struggle / collision: > 3.0G
          if (gForce > 3.0) {
            final now = DateTime.now();
            if (now.difference(_lastStruggleAlert).inSeconds > 5) {
              _lastStruggleAlert = now;
              debugPrint('TelemetryService: Struggle detected! G-force: ${gForce.toStringAsFixed(2)}G');
              onStruggleDetected?.call(gForce);
            }
          }
        },
        onError: (err) {
          debugPrint('Sensors not available or permission denied: $err');
        },
      );
    } catch (e) {
      debugPrint('Error attaching sensor listener: $e');
    }
  }

  void stopSensorMonitoring() {
    _sensorSubscription?.cancel();
    _sensorSubscription = null;
    _isListening = false;
  }
}
