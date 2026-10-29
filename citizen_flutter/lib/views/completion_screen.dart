import 'package:flutter/material.dart';

class CompletionScreen extends StatelessWidget {
  final bool isDeceptiveDuress;
  final VoidCallback onReturnHome;

  const CompletionScreen({
    super.key,
    required this.isDeceptiveDuress,
    required this.onReturnHome,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    children: [
                      const SizedBox(height: 30),
                      // Checkmark Badge
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
                        ),
                        child: const Icon(
                          Icons.check_circle_outline_rounded,
                          color: Color(0xFF059669),
                          size: 48,
                        ),
                      ),

                      const SizedBox(height: 20),

                      const Text(
                        'Journey Ended Safely',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Your journey has been marked as completed. All emergency contacts have been notified that you arrived safely.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF64748B),
                          height: 1.4,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Tactical Status Card
                      if (!isDeceptiveDuress)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.verified_user_rounded, color: Color(0xFF059669), size: 18),
                                  SizedBox(width: 8),
                                  Text(
                                    'COMMAND DASHBOARD NOTIFIED',
                                    style: TextStyle(
                                      color: Color(0xFF047857),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 6),
                              Text(
                                'Tactical control room confirmed safe arrival. Emergency alert stood down, siren silenced, and POPIA privacy shield restored.',
                                style: TextStyle(
                                  color: Color(0xFF065F46),
                                  fontSize: 11,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFFECACA)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFDC2626),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'DURESS SILENT PROTOCOL ACTIVE',
                                    style: TextStyle(
                                      color: Color(0xFFB91C1C),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'To any coerced observer, this screen looks 100% normal. Behind the scenes, the tactical control room and SAPS are actively tracking at Code Red with full swarm dispatch!',
                                style: TextStyle(
                                  color: Color(0xFF991B1B),
                                  fontSize: 11,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),

                      const SizedBox(height: 20),

                      // Journey Details Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 8,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _buildSummaryRow('Destination', 'Sandton City Mall'),
                            const Divider(color: Color(0xFFF1F5F9), height: 16),
                            _buildSummaryRow('Status', 'Disarmed (Safe)', isHighlight: true),
                            const Divider(color: Color(0xFFF1F5F9), height: 16),
                            _buildSummaryRow('Dead-Man\'s Switch', 'Released'),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Return Home CTA
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: onReturnHome,
                      icon: const Icon(Icons.home_outlined, size: 20),
                      label: const Text(
                        'Return to Waypoint Home',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        elevation: 3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF64748B),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isHighlight ? const Color(0xFF059669) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }
}
