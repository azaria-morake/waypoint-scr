import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  final Function(UserProfile user) onSuccess;

  const AuthScreen({super.key, required this.onSuccess});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  bool _isSignUp = false;
  bool _obscurePin = true;
  bool _isLoading = false;
  String? _errorMessage;

  final TextEditingController _phoneController = TextEditingController(text: '+27825550199');
  final TextEditingController _pinController = TextEditingController(text: '1234');
  final TextEditingController _nameController = TextEditingController(text: 'Thandiwe Ndlovu');

  late final AnimationController _slideController;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    // Slides smoothly from bottom and settles below midpoint
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 1.0),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _slideController,
        curve: Curves.easeOutCubic,
      ),
    );

    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    _phoneController.dispose();
    _pinController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _handleAuth() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final phone = _phoneController.text.trim();
    final pin = _pinController.text.trim();
    final name = _nameController.text.trim();

    try {
      UserProfile? user;
      if (_isSignUp) {
        user = await ApiService.signup(
          phoneNumber: phone,
          fullName: name.isNotEmpty ? name : 'Citizen Commuter',
          standardPin: pin.isNotEmpty ? pin : '1234',
          duressPin: '9999',
        );
      } else {
        user = await ApiService.login(
          phoneNumber: phone,
          pin: pin.isNotEmpty ? pin : '1234',
        );
      }

      if (user != null) {
        widget.onSuccess(user);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception:', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _demoLogin() {
    widget.onSuccess(UserProfile.defaultDemoUser());
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenHeight = mediaQuery.size.height;
    final screenWidth = mediaQuery.size.width;

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: Stack(
        children: [
          // 1. Fullscreen Runner Image Backdrop
          Positioned.fill(
            child: Image.asset(
              'assets/images/Waypoint_login_bg.png',
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
            ),
          ),

          // 2. Subtle Upper Atmospheric Tint
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.25),
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.4),
                  ],
                  stops: const [0.0, 0.35, 1.0],
                ),
              ),
            ),
          ),

          // 3. Sliding White Card anchored strictly BELOW the Midpoint of the Screen
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            // Takes up below-midpoint space (max 54% of screen height)
            height: screenHeight * 0.54,
            child: SlideTransition(
              position: _slideAnimation,
              child: Align(
                alignment: Alignment.bottomCenter,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Container(
                    width: screenWidth,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(36),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.35),
                          blurRadius: 30,
                          offset: const Offset(0, -6),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      top: false,
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 20,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Small Grab Handle Pill
                            Center(
                              child: Container(
                                width: 36,
                                height: 4,
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFCBD5E1),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),

                            // Header: WAYPOINT & Run as far as you like
                            Center(
                              child: Column(
                                children: [
                                  const Text(
                                    'WAYPOINT',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 2.0,
                                      color: Color(0xFF0F172A),
                                      fontFamily: 'Roboto',
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    'Run as far as you like',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF64748B),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 14),

                            // Error Message Banner (if any)
                            if (_errorMessage != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFFFECACA)),
                                ),
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(
                                    color: Color(0xFFDC2626),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                            ],

                            // Quick Demo Shortcut Button (Top Highlight)
                            ElevatedButton.icon(
                              onPressed: _demoLogin,
                              icon: const Icon(Icons.bolt, color: AppTheme.accentAmber, size: 18),
                              label: const Text(
                                'Quick Demo as Thandiwe Ndlovu',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0F172A),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                elevation: 2,
                              ),
                            ),

                            const SizedBox(height: 12),

                            // "Or continue with phone / pin" Divider
                            Row(
                              children: [
                                const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                  child: Text(
                                    _isSignUp ? 'Or sign up with details' : 'Or enter credentials',
                                    style: const TextStyle(
                                      color: Color(0xFF94A3B8),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                              ],
                            ),

                            const SizedBox(height: 12),

                            // Optional Full Name for Sign Up
                            if (_isSignUp) ...[
                              _buildCompactField(
                                controller: _nameController,
                                hint: 'Full Name (e.g. Thandiwe Ndlovu)',
                                icon: Icons.person_outline,
                              ),
                              const SizedBox(height: 8),
                            ],

                            // Phone / Email Field
                            _buildCompactField(
                              controller: _phoneController,
                              hint: 'Mobile Phone (+27 82 555 0199)',
                              icon: Icons.phone_android_outlined,
                              keyboardType: TextInputType.phone,
                            ),

                            const SizedBox(height: 8),

                            // 4-Digit Security PIN Field
                            _buildCompactField(
                              controller: _pinController,
                              hint: '4-Digit PIN (e.g. 1234)',
                              icon: Icons.lock_outline,
                              keyboardType: TextInputType.number,
                              obscureText: _obscurePin,
                              suffix: InkWell(
                                onTap: () => setState(() => _obscurePin = !_obscurePin),
                                child: Icon(
                                  _obscurePin ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                  color: const Color(0xFF94A3B8),
                                  size: 18,
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // Submit Button
                            OutlinedButton(
                              onPressed: _isLoading ? null : _handleAuth,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFF0F172A), width: 1.5),
                                backgroundColor: const Color(0xFFF8FAFC),
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Color(0xFF0F172A),
                                      ),
                                    )
                                  : Text(
                                      _isSignUp ? 'Create My Account' : 'Sign In',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                            ),

                            const SizedBox(height: 10),

                            // Bottom Toggle Link
                            Center(
                              child: InkWell(
                                onTap: () {
                                  setState(() {
                                    _isSignUp = !_isSignUp;
                                    _errorMessage = null;
                                  });
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(4.0),
                                  child: RichText(
                                    text: TextSpan(
                                      children: [
                                        TextSpan(
                                          text: _isSignUp
                                              ? 'Already have an account? '
                                              : 'Don\'t have an account? ',
                                          style: const TextStyle(
                                            color: Color(0xFF64748B),
                                            fontSize: 12,
                                          ),
                                        ),
                                        TextSpan(
                                          text: _isSignUp ? 'Sign In' : 'Sign Up',
                                          style: const TextStyle(
                                            color: Color(0xFF0284C7),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
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
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffix,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        style: const TextStyle(
          color: Color(0xFF0F172A),
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          isDense: true,
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
          prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 18),
          suffixIcon: suffix != null
              ? Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: suffix,
                )
              : null,
          suffixIconConstraints: const BoxConstraints(minWidth: 20, minHeight: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
        ),
      ),
    );
  }
}
