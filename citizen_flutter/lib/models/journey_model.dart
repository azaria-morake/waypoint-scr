import 'dart:math' as math;
import 'package:latlong2/latlong.dart';

enum JourneyStatus {
  setup,
  active,
  red,
  completed,
  duressCompleted,
}

class JourneyModel {
  final String id;
  final String destinationName;
  final LatLng destinationCoord;
  final int etaMinutes;
  final String? outfitPhotoUrl;
  JourneyStatus status;
  double progress; // 0.0 to 1.0
  double speedKmh;
  double headingDeg;
  double gForce;
  int batteryPercent;

  JourneyModel({
    required this.id,
    required this.destinationName,
    required this.destinationCoord,
    required this.etaMinutes,
    this.outfitPhotoUrl,
    this.status = JourneyStatus.active,
    this.progress = 0.0,
    this.speedKmh = 42.0,
    this.headingDeg = 140.0,
    this.gForce = 1.05,
    this.batteryPercent = 92,
  });

  // Alberton North -> Sandton City Mall Real Route
  static final List<LatLng> albertonToSandtonRoute = [
    const LatLng(-26.2585, 28.1215), // Alberton North Departure
    const LatLng(-26.2602, 28.1220), // Hendrik Potgieter St
    const LatLng(-26.2625, 28.1228), // Voortrekker Rd
    const LatLng(-26.2550, 28.1150), // N12 Reading Interchange
    const LatLng(-26.2380, 28.0920), // N12 Alberton Interchange
    const LatLng(-26.2200, 28.0650), // M2 Highway
    const LatLng(-26.2080, 28.0450), // M2 Crown Interchange
    const LatLng(-26.1920, 28.0380), // M1 North
    const LatLng(-26.1680, 28.0400), // M1 Houghton
    const LatLng(-26.1450, 28.0430), // M1 Rosebank
    const LatLng(-26.1250, 28.0510), // M1 Bramley
    const LatLng(-26.1120, 28.0550), // Grayston Dr
    const LatLng(-26.1076, 28.0567), // Sandton City Mall
  ];

  static LatLng getCoordinateAtProgress(List<LatLng> route, double progress) {
    if (route.isEmpty) return const LatLng(-26.2585, 28.1215);
    if (route.length == 1 || progress <= 0.0) return route.first;
    if (progress >= 1.0) return route.last;

    final distances = <double>[0.0];
    double totalDist = 0.0;
    for (int i = 0; i < route.length - 1; i++) {
      final dLat = route[i + 1].latitude - route[i].latitude;
      final dLng = route[i + 1].longitude - route[i].longitude;
      final dist = math.sqrt(dLat * dLat + dLng * dLng);
      totalDist += dist;
      distances.add(totalDist);
    }

    final targetDist = progress * totalDist;
    for (int i = 0; i < distances.length - 1; i++) {
      if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
        final segDist = distances[i + 1] - distances[i];
        final frac = segDist > 0 ? (targetDist - distances[i]) / segDist : 0.0;
        final lat = route[i].latitude + (route[i + 1].latitude - route[i].latitude) * frac;
        final lng = route[i].longitude + (route[i + 1].longitude - route[i].longitude) * frac;
        return LatLng(lat, lng);
      }
    }

    return route.last;
  }
}
