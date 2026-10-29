import 'package:flutter/material.dart';
import '../models/contact_model.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/left_hero_panel.dart';

class SetupScreen extends StatefulWidget {
  final UserProfile user;
  final Future<void> Function(String destination, int etaMinutes, String? outfitUrl) onStartJourney;
  final VoidCallback onSignOut;

  const SetupScreen({
    super.key,
    required this.user,
    required this.onStartJourney,
    required this.onSignOut,
  });

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  final TextEditingController _destinationController =
      TextEditingController(text: 'Sandton City Mall, Sandton');
  int _etaMinutes = 25;
  bool _outfitAdded = true;
  bool _isLoading = false;
  late List<EmergencyContact> _contacts;

  final List<String> _quickDestinations = [
    'Sandton City',
    'Rosebank Gautrain',
    'Alberton City',
    'OR Tambo',
  ];

  @override
  void initState() {
    super.initState();
    _contacts = EmergencyContact.defaultContacts();
  }

  @override
  void dispose() {
    _destinationController.dispose();
    super.dispose();
  }

  Future<void> _handleStart() async {
    setState(() => _isLoading = true);
    try {
      await widget.onStartJourney(
        _destinationController.text.trim(),
        _etaMinutes,
        _outfitAdded ? 'assets/images/runner_portrait.png' : null,
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAddContactDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController(text: '+27');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: AppTheme.cardBorder),
        ),
        title: const Text('Add Emergency Contact', style: TextStyle(color: Colors.white, fontSize: 18)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Contact Name',
                labelStyle: TextStyle(color: AppTheme.textSlate400),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.inputBorder)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.accentAmber)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                labelStyle: TextStyle(color: AppTheme.textSlate400),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.inputBorder)),
                focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: AppTheme.accentAmber)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textSlate400)),
          ),
          ElevatedButton(
            onPressed: () {
              final name = nameCtrl.text.trim();
              final phone = phoneCtrl.text.trim();
              if (name.isNotEmpty && phone.isNotEmpty) {
                setState(() {
                  _contacts.add(
                    EmergencyContact(
                      id: 'c_${DateTime.now().millisecondsSinceEpoch}',
                      name: name,
                      phone: phone,
                      initial: name.substring(0, 1).toUpperCase(),
                      initialBg: const Color(0xFF1F2D3A),
                      initialColor: const Color(0xFF38BDF8),
                      active: true,
                    ),
                  );
                });
                Navigator.of(ctx).pop();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentAmber,
              foregroundColor: const Color(0xFF121820),
            ),
            child: const Text('Add Contact', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showSettingsDialog() {
    final urlCtrl = TextEditingController();
    ApiService.getBaseUrl().then((val) => urlCtrl.text = val);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.cardDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: AppTheme.cardBorder),
        ),
        title: const Row(
          children: [
            Icon(Icons.tune, color: AppTheme.accentAmber, size: 20),
            SizedBox(width: 8),
            Text('Waypoint Sentinel Settings', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('User: ${widget.user.fullName}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            Text('Phone: ${widget.user.phoneNumber}', style: const TextStyle(color: AppTheme.textSlate400, fontSize: 12)),
            const Divider(color: AppTheme.cardBorder, height: 24),
            const Text('Backend API URL', style: TextStyle(color: AppTheme.textSlate300, fontSize: 12)),
            const SizedBox(height: 4),
            TextField(
              controller: urlCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13, fontFamily: 'monospace'),
              decoration: const InputDecoration(
                hintText: 'http://localhost:8000',
                hintStyle: TextStyle(color: AppTheme.textSlate500),
                filled: true,
                fillColor: AppTheme.inputDark,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(10)),
                  borderSide: BorderSide(color: AppTheme.inputBorder),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Security Credentials', style: TextStyle(color: AppTheme.textSlate300, fontSize: 12)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.inputDark,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.inputBorder),
              ),
              child: const Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Safe Disarm PIN:', style: TextStyle(color: AppTheme.textSlate400, fontSize: 12)),
                      Text('1234', style: TextStyle(color: AppTheme.safeGreen, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Duress Coercion PIN:', style: TextStyle(color: AppTheme.textSlate400, fontSize: 12)),
                      Text('9999', style: TextStyle(color: AppTheme.threatRed, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              widget.onSignOut();
              Navigator.of(ctx).pop();
            },
            child: const Text('Sign Out', style: TextStyle(color: AppTheme.threatRed)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (urlCtrl.text.isNotEmpty) {
                await ApiService.setBaseUrl(urlCtrl.text.trim());
              }
              if (ctx.mounted) Navigator.of(ctx).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentAmber,
              foregroundColor: const Color(0xFF121820),
            ),
            child: const Text('Save Settings', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: isWide
          ? Row(
              children: [
                const Expanded(flex: 5, child: LeftHeroPanel(isCompact: false)),
                Expanded(
                  flex: 5,
                  child: Container(
                    decoration: const BoxDecoration(
                      border: Border(left: BorderSide(color: Color(0xFF1E2938))),
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 36),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 580),
                          child: _buildDashboardContent(),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                child: _buildDashboardContent(),
              ),
            ),
    );
  }

  Widget _buildDashboardContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top Header: Logo + Profile Button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
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
                const SizedBox(width: 10),
                const Text(
                  'Waypoint',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
            InkWell(
              onTap: _showSettingsDialog,
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: const Icon(Icons.person_outline, color: AppTheme.textSlate300, size: 22),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Heading Section
        const Text(
          'Ready to start your journey?',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: Colors.white,
            letterSpacing: -0.5,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Set up Waypoint in a few steps and keep your people in the loop.',
          style: TextStyle(
            fontSize: 14,
            color: AppTheme.textSlate400,
            fontWeight: FontWeight.normal,
          ),
        ),

        const SizedBox(height: 24),

        // Action Row: Start Journey CTA + Settings Gear
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleStart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentAmber,
                  foregroundColor: const Color(0xFF121820),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  elevation: 6,
                  shadowColor: AppTheme.accentAmber.withOpacity(0.35),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.play_arrow_rounded, color: Color(0xFF121820), size: 22),
                    const SizedBox(width: 8),
                    Text(
                      _isLoading ? 'Initializing Transit Mesh...' : 'Start Journey',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF121820),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            InkWell(
              onTap: _showSettingsDialog,
              borderRadius: BorderRadius.circular(18),
              child: Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: const Icon(Icons.settings_outlined, color: AppTheme.textSlate300, size: 22),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Main Dashboard Card Container
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.cardDark,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppTheme.cardBorder),
            boxShadow: const [
              BoxShadow(
                color: Colors.black38,
                blurRadius: 20,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Input Box
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.inputDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.inputBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: AppTheme.textSlate400, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _destinationController,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'Where are you heading to?',
                          hintStyle: TextStyle(color: AppTheme.textSlate500, fontSize: 14),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.navigation, color: AppTheme.textSlate400, size: 18),
                      onPressed: () => _destinationController.text = 'Sandton City Mall, Sandton',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Quick Destination Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _quickDestinations.map((dest) {
                    final isSelected = _destinationController.text.toLowerCase().contains(
                          dest.toLowerCase().split(' ')[0],
                        );
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _destinationController.text = '$dest, Johannesburg';
                          });
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.accentAmber.withOpacity(0.12)
                                : AppTheme.inputDark,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppTheme.accentAmber : AppTheme.inputBorder,
                            ),
                          ),
                          child: Text(
                            dest,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? AppTheme.accentAmber : AppTheme.textSlate400,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Outfit Photo Card
              InkWell(
                onTap: () => setState(() => _outfitAdded = !_outfitAdded),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _outfitAdded
                        ? const Color(0xFF102220).withOpacity(0.8)
                        : AppTheme.inputDark,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: _outfitAdded
                          ? AppTheme.safeGreen.withOpacity(0.5)
                          : AppTheme.inputBorder,
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A2330),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF243345)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: _outfitAdded
                            ? Image.asset(
                                'assets/images/runner_portrait.png',
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.person,
                                  color: AppTheme.safeGreen,
                                  size: 24,
                                ),
                              )
                            : const Icon(Icons.camera_alt_outlined, color: AppTheme.textSlate400, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _outfitAdded ? 'Outfit photo attached' : 'Add outfit photo (optional)',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Helps responders and friends recognise what you\'re wearing.',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSlate400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1A2330),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF243345)),
                        ),
                        child: Icon(
                          _outfitAdded ? Icons.check : Icons.add,
                          color: _outfitAdded ? AppTheme.safeGreen : AppTheme.textSlate300,
                          size: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Emergency Contacts Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Emergency Contacts',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  InkWell(
                    onTap: _showAddContactDialog,
                    child: const Text(
                      '+ Add Contact',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.accentAmber,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              Column(
                children: _contacts.map((contact) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.inputDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.inputBorder),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: contact.initialBg,
                          child: Text(
                            contact.initial,
                            style: TextStyle(
                              color: contact.initialColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                contact.name,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                contact.phone,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.textSlate400,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppTheme.safeGreen,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(Icons.check, color: Colors.white, size: 16),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Footer Row
        Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: Color(0xFF1E2938))),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.schedule, color: AppTheme.textSlate400, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'ETA Deadline: $_etaMinutes mins',
                    style: const TextStyle(color: AppTheme.textSlate400, fontSize: 12),
                  ),
                ],
              ),
              const Row(
                children: [
                  Icon(Icons.shield_outlined, color: AppTheme.safeGreen, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'Dead-Man Switch: Active',
                    style: TextStyle(color: AppTheme.safeGreen, fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
