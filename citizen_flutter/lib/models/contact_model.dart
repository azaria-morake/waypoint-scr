import 'package:flutter/material.dart';

class EmergencyContact {
  final String id;
  final String name;
  final String phone;
  final String initial;
  final Color initialBg;
  final Color initialColor;
  bool active;

  EmergencyContact({
    required this.id,
    required this.name,
    required this.phone,
    required this.initial,
    required this.initialBg,
    required this.initialColor,
    this.active = true,
  });

  static List<EmergencyContact> defaultContacts() {
    return [
      EmergencyContact(
        id: 'c1',
        name: 'Mom (Zanele Ndlovu)',
        phone: '+27 82 555 0198',
        initial: 'M',
        initialBg: const Color(0xFF3D2B1A),
        initialColor: const Color(0xFFF5A94B),
        active: true,
      ),
      EmergencyContact(
        id: 'c2',
        name: 'Neighbor (Lerato Khumalo)',
        phone: '+27 82 555 0197',
        initial: 'N',
        initialBg: const Color(0xFF252D3A),
        initialColor: const Color(0xFFCBD5E1),
        active: true,
      ),
    ];
  }
}
