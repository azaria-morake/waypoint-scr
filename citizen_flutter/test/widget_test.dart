import 'package:flutter_test/flutter_test.dart';
import 'package:citizen_flutter/main.dart';

void main() {
  testWidgets('WaypointCitizenApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const WaypointCitizenApp());
    expect(find.text('Waypoint'), findsWidgets);
  });
}
