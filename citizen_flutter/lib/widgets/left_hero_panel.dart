import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class LeftHeroPanel extends StatelessWidget {
  final bool isCompact;

  const LeftHeroPanel({
    super.key,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isCompact) {
      return Container(
        height: 180,
        width: double.infinity,
        decoration: const BoxDecoration(
          color: AppTheme.bgDark,
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: Image.asset(
                'assets/images/Waypoint_login_bg.png',
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.3),
                      AppTheme.bgDark.withOpacity(0.85),
                      AppTheme.bgDark,
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.accentAmber,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 8),
                  RichText(
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: 'You can run, ',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        TextSpan(
                          text: 'as far as you like.',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.accentAmber,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Waypoint keeps a last known location for your people.',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSlate300,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      height: double.infinity,
      color: AppTheme.bgDark,
      child: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/images/Waypoint_login_bg.png',
              fit: BoxFit.cover,
              alignment: Alignment.center,
            ),
          ),
          // Atmospheric Overlays
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.4),
                    AppTheme.bgDark.withOpacity(0.6),
                    AppTheme.bgDark.withOpacity(0.95),
                  ],
                ),
              ),
            ),
          ),
          // Narrative Content
          Padding(
            padding: const EdgeInsets.all(36.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Amber Accent Pill
                Container(
                  width: 48,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.accentAmber,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),

                // Headline
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: 'You can run,\n',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          height: 1.15,
                        ),
                      ),
                      TextSpan(
                        text: 'as far as you like.',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.accentAmber,
                          height: 1.15,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Subtitle
                const Text(
                  'Waypoint keeps a last known location, so your people know where to look if something goes wrong.',
                  style: TextStyle(
                    fontSize: 15,
                    color: AppTheme.textSlate300,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 28),

                // 3 Column Feature Badges
                Container(
                  padding: const EdgeInsets.only(top: 20),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: Colors.white.withOpacity(0.15),
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureBadge(IconData icon, String text, {bool showDivider = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          border: showDivider
              ? Border(
                  right: BorderSide(
                    color: Colors.white.withOpacity(0.15),
                    width: 1,
                  ),
                )
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppTheme.textSlate300, size: 20),
            const SizedBox(height: 6),
            Text(
              text,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSlate300,
                fontWeight: FontWeight.w500,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
