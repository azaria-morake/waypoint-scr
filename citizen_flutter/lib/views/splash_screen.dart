import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onConnected;

  const SplashScreen({super.key, required this.onConnected});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _fadeAnimation;
  String _statusText = 'Connecting to Waypoint Mesh...';
  Timer? _transitionTimer;
  Timer? _statusTimer;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _fadeAnimation = CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    );

    // Dynamic tactical connection simulation
    _statusTimer = Timer(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() {
          _statusText = 'Synchronizing corridor sentinels...';
        });
      }
    });

    // Auto-proceed to Login after connecting
    _transitionTimer = Timer(const Duration(milliseconds: 2800), () {
      if (mounted) {
        widget.onConnected();
      }
    });
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    _transitionTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: InkWell(
        onTap: widget.onConnected, // allow tap to skip
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Stack(
          children: [
            // Fullscreen Runner Image Backdrop
            Positioned.fill(
              child: Image.asset(
                'assets/images/Waypoint_login_bg.png',
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
            ),

            // Atmospheric Gradient Overlays for Readability & Cinematic Tone
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.55),
                      AppTheme.bgDark.withValues(alpha: 0.35),
                      AppTheme.bgDark.withValues(alpha: 0.92),
                      AppTheme.bgDark,
                    ],
                    stops: const [0.0, 0.35, 0.75, 1.0],
                  ),
                ),
              ),
            ),

            // Top Header: Waypoint Branding
            SafeArea(
              child: Align(
                alignment: Alignment.topCenter,
                child: Padding(
                  padding: const EdgeInsets.only(top: 18.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Image.asset(
                        'assets/images/waypoint_logo_icon.png',
                        width: 28,
                        height: 28,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.shield_outlined,
                          size: 28,
                          color: AppTheme.accentAmber,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'WAYPOINT',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Main Narrative & Features & Connecting Status
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 20.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Amber Accent Pill
                    Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.accentAmber,
                        borderRadius: BorderRadius.circular(2),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentAmber.withValues(alpha: 0.6),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Headline
                    RichText(
                      text: const TextSpan(
                        children: [
                          TextSpan(
                            text: 'You can run,\n',
                            style: TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                          TextSpan(
                            text: 'as far as you like.',
                            style: TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              color: AppTheme.accentAmber,
                              height: 1.15,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Subtitle
                    const Text(
                      'Waypoint keeps a last known location, so your people know where to look if something goes wrong.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSlate300,
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // 3 Feature Badges in Grid
                    Container(
                      padding: const EdgeInsets.only(top: 18),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(
                            color: Colors.white.withValues(alpha: 0.15),
                            width: 1,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          _buildFeatureBadge(
                            Icons.location_on_outlined,
                            'Last known location',
                            showDivider: true,
                          ),
                          _buildFeatureBadge(
                            Icons.people_outline,
                            'Your trusted contacts',
                            showDivider: true,
                          ),
                          _buildFeatureBadge(
                            Icons.shield_outlined,
                            'Simple and discreet',
                            showDivider: false,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Connecting Status Pill with Radar Pulse
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F1722).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppTheme.accentAmber.withValues(alpha: 0.35),
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black45,
                            blurRadius: 16,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          AnimatedBuilder(
                            animation: _fadeAnimation,
                            builder: (context, child) {
                              return Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppTheme.accentAmber.withValues(
                                    alpha: 0.4 + (_fadeAnimation.value * 0.6),
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppTheme.accentAmber.withValues(alpha: 0.8),
                                      blurRadius: 6,
                                      spreadRadius: _fadeAnimation.value * 2,
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _statusText,
                              style: const TextStyle(
                                color: AppTheme.textSlate200,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppTheme.accentAmber,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureBadge(IconData icon, String text, {bool showDivider = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6),
        decoration: BoxDecoration(
          border: showDivider
              ? Border(
                  right: BorderSide(
                    color: Colors.white.withValues(alpha: 0.15),
                    width: 1,
                  ),
                )
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppTheme.accentAmber, size: 18),
            const SizedBox(height: 6),
            Text(
              text,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSlate300,
                fontWeight: FontWeight.w500,
                height: 1.25,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
