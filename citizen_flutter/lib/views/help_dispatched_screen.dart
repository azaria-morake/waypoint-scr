import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../models/journey_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/live_map_view.dart';

class HelpDispatchedScreen extends StatefulWidget {
  final String journeyId;
  final Function(bool isDuress) onOpenPinModal;
  final Future<void> Function() onDuressTrigger;

  const HelpDispatchedScreen({
    super.key,
    required this.journeyId,
    required this.onOpenPinModal,
    required this.onDuressTrigger,
  });

  @override
  State<HelpDispatchedScreen> createState() => _HelpDispatchedScreenState();
}

class _HelpDispatchedScreenState extends State<HelpDispatchedScreen> {
  double _responderDistanceKm = 3.2;
  int _etaMinutes = 4;
  double _responderProgress = 0.2;
  Timer? _responderTimer;

  // Static citizen emergency location along N12 corridor
  final LatLng _emergencyLocation = const LatLng(-26.2550, 28.1150);

  @override
  void initState() {
    super.initState();
    // Simulate responder convergence and send periodic distress coordinates
    _responderTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!mounted) return;
      setState(() {
        if (_responderDistanceKm > 0.3) {
          _responderDistanceKm = double.parse((_responderDistanceKm - 0.1).toStringAsFixed(1));
        }
        if (_responderProgress < 0.9) {
          _responderProgress += 0.05;
        }
      });

      ApiService.pingTelemetry(
        journeyId: widget.journeyId,
        lat: _emergencyLocation.latitude,
        lng: _emergencyLocation.longitude,
        speedKmh: 0.0,
        headingDeg: 140.0,
        gForce: 3.2,
        battery: 88,
        citizenName: 'Thandiwe Ndlovu',
      );
    });
  }

  @override
  void dispose() {
    _responderTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final responderCoord = JourneyModel.getCoordinateAtProgress(
      JourneyModel.albertonToSandtonRoute,
      _responderProgress,
    );

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background Map with Emergency Red Overlays
          Positioned.fill(
            child: LiveMapView(
              currentPosition: _emergencyLocation,
              destinationPosition: JourneyModel.albertonToSandtonRoute.last,
              routePoints: JourneyModel.albertonToSandtonRoute,
              isEmergencyMode: true,
              responderPosition: responderCoord,
            ),
          ),

          // Top Emergency Banner
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
                    color: const Color(0xFFFF7660).withOpacity(0.96),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF87171)),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black38,
                        blurRadius: 18,
                        offset: Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'HELP IS ON THE WAY',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            '• Way Swarm Active',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '$_etaMinutes MIN ETA',
                              style: const TextStyle(
                                color: Colors.white,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${_responderDistanceKm.toStringAsFixed(1)} km away',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 10,
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

          // Mid Status Beacon
          Positioned(
            top: MediaQuery.of(context).padding.top + 84,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.85),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.threatRed.withOpacity(0.6)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.threatRed,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Fox Tactical Unit 14 Converging',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Sheet Card
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 540),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
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
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Coordination Checklist Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'We\'re coordinating your help',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildChecklistItem('Checking with Mom (Sister WhatsApp AI Agent)'),
                            const SizedBox(height: 8),
                            _buildChecklistItem('Alerting local patrol (Fox Tactical & Alberton CPF)'),
                            const SizedBox(height: 8),
                            _buildChecklistItem('Broadcasting profile (POPIA Sec 11 Unlocked)'),
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Cancel Alert Button (Requires PIN)
                      ElevatedButton(
                        onPressed: () => widget.onOpenPinModal(false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF7660),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          elevation: 2,
                        ),
                        child: const Text(
                          'Cancel Alert (Requires PIN)',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Duress PIN Button (Silent Protocol)
                      OutlinedButton(
                        onPressed: () => widget.onOpenPinModal(true),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0F172A),
                          side: const BorderSide(color: Color(0xFFCBD5E1)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        child: const Column(
                          children: [
                            Text(
                              'Duress PIN',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Enter standard PIN to end, or silent duress PIN if you cannot speak.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
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

  Widget _buildChecklistItem(String title) {
    return Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
            color: Color(0xFF9EE8D1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: Color(0xFF13372C), size: 14),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Color(0xFF334155),
            ),
          ),
        ),
      ],
    );
  }
}
