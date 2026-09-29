import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';
import 'secure_local_storage.dart';

/// Outcome of app start-up. A configuration problem is shown on screen
/// instead of crashing, so a mis-provisioned device is easy to diagnose.
sealed class BootstrapResult {
  const BootstrapResult();
}

class BootstrapReady extends BootstrapResult {
  const BootstrapReady(this.config);
  final AppConfig config;
}

class BootstrapConfigError extends BootstrapResult {
  const BootstrapConfigError(this.message);
  final String message;
}

Future<BootstrapResult> bootstrap() async {
  final AppConfig config;
  try {
    config = AppConfig.fromEnvironment();
  } on ConfigException catch (e) {
    return BootstrapConfigError(e.message);
  }

  await Supabase.initialize(
    url: config.supabaseUrl.toString(),
    publishableKey: config.supabasePublishableKey,
    authOptions: FlutterAuthClientOptions(localStorage: SecureLocalStorage()),
    debug: config.env == AppEnv.development,
  );
  return BootstrapReady(config);
}
