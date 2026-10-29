import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_flutter/main.dart';

void main() {
  testWidgets('WaypointCitizenApp flow: Splash -> Login', (WidgetTester tester) async {
    await tester.pumpWidget(const WaypointCitizenApp());
    await tester.pump();

    // Verify Splash Screen appears with headline & branding
    expect(find.text('WAYPOINT'), findsOneWidget);
    expect(find.text('Connecting to Waypoint Mesh...'), findsOneWidget);

    // Tap splash to immediately trigger transition to AuthScreen
    await tester.tap(find.text('Connecting to Waypoint Mesh...'));
    await tester.pumpAndSettle();

    // Verify Login Screen appears with the sliding card below midpoint
    expect(find.text('Run as far as you like'), findsOneWidget);
    expect(find.text('Quick Demo as Thandiwe Ndlovu'), findsOneWidget);
  });
}
