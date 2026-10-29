import 'package:flutter/material.dart';

class AppTheme {
  // Brand & Interface Color Tokens
  static const Color bgDark = Color(0xFF081018);
  static const Color cardDark = Color(0xFF0F1722);
  static const Color cardBorder = Color(0xFF1E2938);
  static const Color inputDark = Color(0xFF131B24);
  static const Color inputBorder = Color(0xFF222D3B);
  
  // Tactical Highlights
  static const Color accentAmber = Color(0xFFF5A94B);
  static const Color accentAmberHover = Color(0xFFE4993D);
  static const Color safeGreen = Color(0xFF22C55E);
  static const Color threatRed = Color(0xFFEF4444);
  static const Color threatRedDark = Color(0xFFD32F2F);
  static const Color emergencyCoral = Color(0xFFFF7660);

  // Status & Telemetry
  static const Color mintGreen = Color(0xFFBBF0DC);
  static const Color mintGreenDark = Color(0xFF0E3B2E);
  static const Color lightSheetBg = Color(0xFFFDFBF7);

  // Text Colors
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textSlate200 = Color(0xFFE2E8F0);
  static const Color textSlate300 = Color(0xFFCBD5E1);
  static const Color textSlate400 = Color(0xFF94A3B8);
  static const Color textSlate500 = Color(0xFF64748B);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      primaryColor: accentAmber,
      colorScheme: const ColorScheme.dark(
        primary: accentAmber,
        secondary: safeGreen,
        error: threatRed,
        surface: cardDark,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: bgDark,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textWhite,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: cardDark,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: cardBorder, width: 1),
        ),
      ),
    );
  }
}
