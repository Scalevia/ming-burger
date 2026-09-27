import 'package:flutter_test/flutter_test.dart';
import 'package:ming_kitchen/app_title.dart';
import 'package:ming_shared/ming_shared.dart';

void main() {
  testWidgets('boots the Arabic shell and reports missing configuration', (tester) async {
    await tester.pumpWidget(const MingShellApp(
      title: appTitle,
      bootstrap: BootstrapConfigError('APP_ENV must be one of development, preview, production.'),
    ));
    expect(find.text(appTitle), findsOneWidget);
    expect(find.textContaining('APP_ENV'), findsOneWidget);
  });
}
