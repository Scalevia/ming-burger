import 'package:flutter/widgets.dart';
import 'package:ming_shared/ming_shared.dart';

import 'app_title.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final result = await bootstrap();
  runApp(MingShellApp(title: appTitle, bootstrap: result));
}
