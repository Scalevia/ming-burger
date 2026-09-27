import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../supabase/bootstrap.dart';

/// Arabic-only (V1), right-to-left base app used by the POS and Kitchen apps.
/// Phase 1 shows a placeholder; features arrive in later phases.
class MingShellApp extends StatelessWidget {
  const MingShellApp({super.key, required this.title, required this.bootstrap});

  final String title;
  final BootstrapResult bootstrap;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: title,
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      theme: ThemeData(colorSchemeSeed: const Color(0xFFB45309)),
      home: Scaffold(
        appBar: AppBar(title: Text(title)),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: switch (bootstrap) {
              BootstrapReady(:final config) => Text(
                  'قيد الإنشاء — البيئة: ${config.env.name}',
                  key: const Key('status-ready'),
                ),
              BootstrapConfigError(:final message) => Text(
                  'خطأ في إعدادات التطبيق:\n$message',
                  key: const Key('status-config-error'),
                  textAlign: TextAlign.center,
                ),
            },
          ),
        ),
      ),
    );
  }
}
