import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ming_shared/ming_shared.dart';

void main() {
  testWidgets('renders right-to-left in Arabic', (tester) async {
    await tester.pumpWidget(const MingShellApp(
      title: 'نقطة البيع',
      bootstrap: BootstrapConfigError('SUPABASE_URL is missing or invalid.'),
    ));

    final context = tester.element(find.byType(Scaffold));
    expect(Directionality.of(context), TextDirection.rtl);
    expect(Localizations.localeOf(context), const Locale('ar'));
    expect(find.text('نقطة البيع'), findsOneWidget);
  });

  testWidgets('shows configuration errors instead of crashing', (tester) async {
    await tester.pumpWidget(const MingShellApp(
      title: 'المطبخ',
      bootstrap: BootstrapConfigError('SUPABASE_URL is missing or invalid.'),
    ));
    expect(find.byKey(const Key('status-config-error')), findsOneWidget);
  });

  testWidgets('shows the environment when ready', (tester) async {
    await tester.pumpWidget(MingShellApp(
      title: 'المطبخ',
      bootstrap: BootstrapReady(AppConfig.parse(const {
        'APP_ENV': 'development',
        'SUPABASE_URL': 'http://127.0.0.1:54321',
        'SUPABASE_PUBLISHABLE_KEY': 'sb_publishable_x',
      })),
    ));
    expect(find.byKey(const Key('status-ready')), findsOneWidget);
  });
}
