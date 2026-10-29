import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_theme.dart';

class LiveMapView extends StatefulWidget {
  final LatLng currentPosition;
  final LatLng destinationPosition;
  final List<LatLng> routePoints;
  final bool isEmergencyMode;
  final LatLng? responderPosition;

  const LiveMapView({
    super.key,
    required this.currentPosition,
    required this.destinationPosition,
    required this.routePoints,
    this.isEmergencyMode = false,
    this.responderPosition,
  });

  @override
  State<LiveMapView> createState() => _LiveMapViewState();
}

class _LiveMapViewState extends State<LiveMapView> with SingleTickerProviderStateMixin {
  late final MapController _mapController;
  late final AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
  }

  @override
  void didUpdateWidget(covariant LiveMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentPosition != widget.currentPosition) {
      _mapController.move(widget.currentPosition, 13.5);
    }
  }

  @override
  void dispose() {
    _mapController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: widget.currentPosition,
        initialZoom: 13.0,
        minZoom: 10.0,
        maxZoom: 18.0,
        interactionOptions: const InteractionOptions(
          flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
        ),
      ),
      children: [
        // Dark / Tactical OpenStreetMap Tiles (CartoDB Dark Matter / OSM)
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.waypoint.secure',
        ),

        // Route Polyline
        PolylineLayer(
          polylines: [
            // Background Route Casing
            Polyline(
              points: widget.routePoints,
              color: Colors.black.withOpacity(0.6),
              strokeWidth: 6.0,
            ),
            // Glowing Transit Corridor
            Polyline(
              points: widget.routePoints,
              color: widget.isEmergencyMode ? AppTheme.threatRed : AppTheme.accentAmber,
              strokeWidth: 4.0,
            ),
          ],
        ),

        // Markers
        MarkerLayer(
          markers: [
            // Origin Marker (Alberton North)
            Marker(
              point: widget.routePoints.first,
              width: 32,
              height: 32,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(Icons.trip_origin, color: Colors.white, size: 16),
              ),
            ),

            // Destination Marker (Sandton City Mall)
            Marker(
              point: widget.destinationPosition,
              width: 36,
              height: 36,
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.accentAmber,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentAmber.withOpacity(0.6),
                      blurRadius: 10,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(Icons.location_on, color: Color(0xFF0F1722), size: 22),
              ),
            ),

            // Current Citizen Marker with Pulse
            Marker(
              point: widget.currentPosition,
              width: 52,
              height: 52,
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  final scale = 1.0 + (_pulseController.value * 0.25);
                  final glowColor = widget.isEmergencyMode ? AppTheme.threatRed : AppTheme.safeGreen;
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 48 * scale,
                        height: 48 * scale,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: glowColor.withOpacity(0.35 * (1.0 - _pulseController.value)),
                        ),
                      ),
                      Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: glowColor,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: glowColor.withOpacity(0.6),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Icon(
                          widget.isEmergencyMode ? Icons.warning_rounded : Icons.navigation,
                          color: Colors.white,
                          size: 14,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),

            // Tactical Responder Marker (if Code Red active)
            if (widget.isEmergencyMode && widget.responderPosition != null)
              Marker(
                point: widget.responderPosition!,
                width: 44,
                height: 44,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.withOpacity(0.6),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.local_police_rounded, color: Colors.white, size: 22),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
