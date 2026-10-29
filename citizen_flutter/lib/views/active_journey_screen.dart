import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../models/journey_model.dart';
import '../services/api_service.dart';
import '../services/telemetry_service.dart';
import '../theme/app_theme.dart';
import '../widgets/live_map_view.dart';
import '../widgets/pin_modal.dart';

class ActiveJourneyScreen extends StatefulWidget {
  final String journeyId;
  final String destination;
  final Future<void> Function() onPanicTapTwo;
  final Function(bool isDuress) onOpenPinModal;
  final Future<void> Function() onSimulateGForceStruggle;
  final Future<void> Function() onSimulateSmsFallback;

  const ActiveJourneyScreen({
    super.key,
    required this.journeyId,
    required this.destination,
    required this.onPanicTapTwo,
    required this.onOpenPinModal,
    required this.onSimulateGForceStruggle,
    required this.onSimulateSmsFallback,
  });

  @override
  State<ActiveJourneyScreen> createState() => _ActiveJourneyScreenState();
}

class _ActiveJourneyScreenState extends State<ActiveJourneyScreen> with SingleTickerProviderStateMixin {
  static const int totalDurationSec = 25 * 60; // 25 mins
  int _secondsRemaining = totalDurationSec;
  double _progress = 0.0;
  double _speed = 42.0;
  double _gForce = 1.05;
  bool _panicLoading = false;
  Timer? _countdownTimer;

  late LatLng _currentCoord;
  final TelemetryService _telemetryService = TelemetryService();
  late final AnimationController _glowController;

  @override
  void initState() {
    super.initState();
    _currentCoord = JourneyModel.albertonToSandtonRoute.first;

    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    // Physical sensor monitoring for real struggle spike
    _telemetryService.startSensorMonitoring(
      onStruggle: (spikeGForce) {
        if (mounted) {
          setState(() => _gForce = spikeGForce);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('⚠️ Sudden struggle detected (${spikeGForce.toStringAsFixed(1)}G)! Escalating to Code Red...'),
              backgroundColor: AppTheme.threatRed,
              duration: const Duration(seconds: 3),
            ),
          );
          widget.onSimulateGForceStruggle();
        }
      },
    );

    // Live journey simulation timer & backend telemetry sync
    int pingCounter = 0;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        }
        final elapsed = totalDurationSec - _secondsRemaining;
        _progress = (elapsed / totalDurationSec).clamp(0.0, 1.0);

        // Realistic route velocity
        if (elapsed < 120) {
          _speed = 42.0 + (elapsed % 8);
        } else if (elapsed > 1350) {
          _speed = 38.0 + (elapsed % 6);
        } else {
          _speed = 76.0 + (elapsed % 12);
        }

        _currentCoord = JourneyModel.getCoordinateAtProgress(
          JourneyModel.albertonToSandtonRoute,
          _progress,
        );

        pingCounter++;
        if (pingCounter % 2 == 0) {
          ApiService.pingTelemetry(
            journeyId: widget.journeyId,
            lat: _currentCoord.latitude,
            lng: _currentCoord.longitude,
            speedKmh: _speed,
            headingDeg: 140.0,
            gForce: _gForce,
            battery: 92,
            citizenName: 'Thandiwe Ndlovu',
          );
        }
      });
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _telemetryService.stopSensorMonitoring();
    _glowController.dispose();
    super.dispose();
  }

  String _formatTimer(int totalSeconds) {
    final mins = totalSeconds ~/ 60;
    final secs = totalSeconds % 60;
    return '$mins:${secs < 10 ? '0' : ''}$secs';
  }

  Future<void> _handlePanic() async {
    setState(() => _panicLoading = true);
    try {
      await widget.onPanicTapTwo();
    } finally {
      if (mounted) setState(() => _panicLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background Live Map
          Positioned.fill(
            child: LiveMapView(
              currentPosition: _currentCoord,
              destinationPosition: JourneyModel.albertonToSandtonRoute.last,
              routePoints: JourneyModel.albertonToSandtonRoute,
              isEmergencyMode: false,
            ),
          ),

          // Top Status Pill
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 20,
            right: 20,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFBBF0DC).withOpacity(0.96),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFA2E5CC)),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 15,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Color(0xFF047857),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Green Journey Active',
                                style: TextStyle(
                                  color: Color(0xFF0E3B2E),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                              Text(
                                '• Tracking you until you arrive.',
                                style: TextStyle(
                                  color: Color(0xFF16503F),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF9EE8D1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              _formatTimer(_secondsRemaining),
                              style: const TextStyle(
                                color: Color(0xFF0E3B2E),
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'DMS Countdown',
                            style: TextStyle(
                              color: Color(0xFF16503F),
                              fontSize: 9,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Center SOS Panic Button (Glowing Large Red Circle)
          Center(
            child: AnimatedBuilder(
              animation: _glowController,
              builder: (context, child) {
                final scale = 1.0 + (_glowController.value * 0.08);
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Pulsing Glow
                    Container(
                      width: 220 * scale,
                      height: 220 * scale,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.red.withOpacity(0.18 * (1.0 - _glowController.value * 0.5)),
                      ),
                    ),
                    Container(
                      width: 180 * scale,
                      height: 180 * scale,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.red.withOpacity(0.28),
                      ),
                    ),
                    // Core SOS Button
                    InkWell(
                      onTap: _panicLoading ? null : _handlePanic,
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        width: 156,
                        height: 156,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const RadialGradient(
                            center: Alignment(-0.2, -0.2),
                            colors: [
                              Color(0xFFFF5A5A),
                              Color(0xFFF03A3A),
                              Color(0xFFD32F2F),
                            ],
                          ),
                          border: Border.all(color: Colors.white.withOpacity(0.5), width: 4),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.6),
                              blurRadius: 30,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (_panicLoading)
                              const CircularProgressIndicator(color: Colors.white)
                            else ...[
                              const Text(
                                'I FEEL UNSAFE',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 15,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '(TAP AGAIN TO CALL FOR HELP)',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 9,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          // Bottom Control Sheet
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 540),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFDFBF7),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 25,
                        offset: Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Share Journey Link
                      InkWell(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Tracking link copied: https://waypoint.secure/j/${widget.journeyId}'),
                              backgroundColor: const Color(0xFF1E293B),
                            ),
                          );
                        },
                        child: const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.share_outlined, color: Color(0xFF475569), size: 16),
                              SizedBox(width: 6),
                              Text(
                                'Share Journey',
                                style: TextStyle(
                                  color: Color(0xFF334155),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 6),

                      // Safe Disarm Button
                      ElevatedButton(
                        onPressed: () => widget.onOpenPinModal(false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0F172A),
                          elevation: 1,
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Column(
                              children: [
                                Text(
                                  'I\'m Safe / End Journey',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Standard PIN (e.g. 1234)',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),
                      const Divider(color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 8),

                      // Telemetry Diagnostics
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppTheme.safeGreen,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Telemetry: ${_speed.toStringAsFixed(0)} km/h • 140° SE • ${_gForce.toStringAsFixed(2)}G',
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          const Text(
                            'LTE Connected',
                            style: TextStyle(
                              color: Color(0xFF475569),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),

                      // Demo Simulation Triggers
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: widget.onSimulateGForceStruggle,
                              icon: const Icon(Icons.bolt, color: Color(0xFFB45309), size: 14),
                              label: const Text(
                                'Simulate 3.8G Struggle',
                                style: TextStyle(
                                  color: Color(0xFF92400E),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: OutlinedButton.styleFrom(
                                backgroundColor: const Color(0xFFFFFBEB),
                                side: const BorderSide(color: Color(0xFFFDE68A)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: widget.onSimulateSmsFallback,
                              icon: const Icon(Icons.sms_outlined, color: Color(0xFF1D4ED8), size: 14),
                              label: const Text(
                                'Simulate 2G SMS Packet',
                                style: TextStyle(
                                  color: Color(0xFF1E40AF),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: OutlinedButton.styleFrom(
                                backgroundColor: const Color(0xFFEFF6FF),
                                side: const BorderSide(color: Color(0xFFBFDBFE)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
