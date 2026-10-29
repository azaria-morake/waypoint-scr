import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'models/journey_model.dart';
import 'models/user_model.dart';
import 'services/api_service.dart';
import 'theme/app_theme.dart';
import 'views/active_journey_screen.dart';
import 'views/auth_screen.dart';
import 'views/completion_screen.dart';
import 'views/help_dispatched_screen.dart';
import 'views/setup_screen.dart';
import 'views/splash_screen.dart';
import 'widgets/pin_modal.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.bgDark,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const WaypointCitizenApp());
}

class WaypointCitizenApp extends StatelessWidget {
  const WaypointCitizenApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Waypoint',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainAppController(),
    );
  }
}

class MainAppController extends StatefulWidget {
  const MainAppController({super.key});

  @override
  State<MainAppController> createState() => _MainAppControllerState();
}

class _MainAppControllerState extends State<MainAppController> {
  bool _showSplash = true;
  UserProfile? _user;
  JourneyStatus _status = JourneyStatus.setup;
  String _journeyId = 'active_journey';
  String _destination = 'Sandton City Mall, Sandton';
  bool _isDeceptiveDuress = false;

  void _handleSplashConnected() {
    setState(() {
      _showSplash = false;
    });
  }

  void _handleAuthSuccess(UserProfile user) {
    setState(() {
      _user = user;
      _status = JourneyStatus.setup;
    });
  }

  Future<void> _handleStartJourney(
    String destination,
    int etaMinutes,
    String? outfitUrl,
  ) async {
    _destination = destination;
    final id = await ApiService.startJourney(
      destinationName: destination,
      destinationLat: -26.1076,
      destinationLng: 28.0567,
      etaMinutes: etaMinutes,
      outfitPhotoUrl: outfitUrl,
    );

    if (mounted) {
      setState(() {
        _journeyId = id;
        _status = JourneyStatus.active;
      });
    }
  }

  Future<void> _handlePanic() async {
    await ApiService.panic(_journeyId);
    if (mounted) {
      setState(() {
        _status = JourneyStatus.red;
      });
    }
  }

  Future<void> _handleSimulateGForce() async {
    await ApiService.panic(_journeyId);
    if (mounted) {
      setState(() {
        _status = JourneyStatus.red;
      });
    }
  }

  Future<void> _handleSimulateSmsFallback() async {
    await ApiService.sendSmsFallback(
      rawSms: 'WP1|+27825550199|RED|-26.2550,28.1150|78|140|42|HMAC_OK',
      senderNumber: '+27825550199',
    );
    if (mounted) {
      setState(() {
        _status = JourneyStatus.red;
      });
    }
  }

  Future<void> _handleSubmitPin(String enteredPin) async {
    final res = await ApiService.disarm(
      journeyId: _journeyId,
      pin: enteredPin,
    );

    if (res['mode'] == 'SILENT_COERCION' || enteredPin == '9999') {
      setState(() {
        _isDeceptiveDuress = true;
        _status = JourneyStatus.duressCompleted;
      });
    } else {
      setState(() {
        _isDeceptiveDuress = false;
        _status = JourneyStatus.completed;
      });
    }
  }

  void _handleOpenPinModal(bool isDuress) {
    PinModal.show(
      context: context,
      isDuressMode: isDuress,
      title: isDuress ? 'Duress Security PIN' : 'Enter Standard PIN to Disarm',
      onSubmitPin: _handleSubmitPin,
    );
  }

  Future<void> _handleReturnHome() async {
    await ApiService.resetJourney();
    if (mounted) {
      setState(() {
        _status = JourneyStatus.setup;
        _isDeceptiveDuress = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. Splash Screen: Opened & connecting with runner image backdrop & narrative
    if (_showSplash) {
      return SplashScreen(onConnected: _handleSplashConnected);
    }

    // 2. Login Screen: Runner backdrop with sliding card below midpoint
    if (_user == null) {
      return AuthScreen(onSuccess: _handleAuthSuccess);
    }

    // 3. Main Interface: Clean mobile UI (no images)
    switch (_status) {
      case JourneyStatus.setup:
        return SetupScreen(
          user: _user!,
          onStartJourney: _handleStartJourney,
          onSignOut: () => setState(() => _user = null),
        );

      case JourneyStatus.active:
        return ActiveJourneyScreen(
          journeyId: _journeyId,
          destination: _destination,
          onPanicTapTwo: _handlePanic,
          onOpenPinModal: _handleOpenPinModal,
          onSimulateGForceStruggle: _handleSimulateGForce,
          onSimulateSmsFallback: _handleSimulateSmsFallback,
        );

      case JourneyStatus.red:
        return HelpDispatchedScreen(
          journeyId: _journeyId,
          onOpenPinModal: _handleOpenPinModal,
          onDuressTrigger: () => _handleSubmitPin('9999'),
        );

      case JourneyStatus.completed:
      case JourneyStatus.duressCompleted:
        return CompletionScreen(
          isDeceptiveDuress: _isDeceptiveDuress,
          onReturnHome: _handleReturnHome,
        );
    }
  }
}
