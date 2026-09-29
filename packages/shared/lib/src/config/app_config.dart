import 'dart:convert';

/// Build-time configuration, supplied with
/// `--dart-define-from-file=config/<env>.json` (see config/*.example.json).
///
/// Only PUBLIC values are allowed: the Supabase URL and publishable key.
/// The branch and cash register a device works for are deliberately NOT
/// build-time settings — one build serves every branch, and the device's
/// branch is selected at runtime from the branches the signed-in user may access.
enum AppEnv { development, preview, production }

class ConfigException implements Exception {
  ConfigException(this.message);
  final String message;

  @override
  String toString() => 'ConfigException: $message';
}

class AppConfig {
  const AppConfig({
    required this.env,
    required this.supabaseUrl,
    required this.supabasePublishableKey,
  });

  final AppEnv env;
  final Uri supabaseUrl;
  final String supabasePublishableKey;

  /// Reads the values compiled in via --dart-define(-from-file).
  factory AppConfig.fromEnvironment() => AppConfig.parse(const {
        'APP_ENV': String.fromEnvironment('APP_ENV'),
        'SUPABASE_URL': String.fromEnvironment('SUPABASE_URL'),
        'SUPABASE_PUBLISHABLE_KEY':
            String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY'),
      });

  /// Validates raw values. Throws [ConfigException] on anything unsafe or missing.
  factory AppConfig.parse(Map<String, String> raw) {
    final envName = raw['APP_ENV']?.trim() ?? '';
    final env = AppEnv.values.where((e) => e.name == envName).firstOrNull;
    if (env == null) {
      throw ConfigException(
        'APP_ENV must be one of ${AppEnv.values.map((e) => e.name).join(', ')}.',
      );
    }

    final urlText = raw['SUPABASE_URL']?.trim() ?? '';
    final url = Uri.tryParse(urlText);
    if (urlText.isEmpty || url == null || !url.hasScheme || url.host.isEmpty) {
      throw ConfigException('SUPABASE_URL is missing or invalid.');
    }
    if (env == AppEnv.production && url.scheme != 'https') {
      throw ConfigException('SUPABASE_URL must use https in production.');
    }

    final key = raw['SUPABASE_PUBLISHABLE_KEY']?.trim() ?? '';
    if (key.isEmpty) {
      throw ConfigException('SUPABASE_PUBLISHABLE_KEY is missing.');
    }
    assertPublicSupabaseKey(key);

    return AppConfig(env: env, supabaseUrl: url, supabasePublishableKey: key);
  }
}

/// Rejects keys that must never ship inside an app: `sb_secret_...` keys and
/// legacy JWT keys whose role is not `anon` (e.g. `service_role`).
void assertPublicSupabaseKey(String key) {
  if (key.startsWith('sb_secret_')) {
    throw ConfigException(
      'A Supabase SECRET key was configured. Apps may only use the publishable key.',
    );
  }
  final parts = key.split('.');
  if (parts.length == 3) {
    Object? role;
    try {
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      role = (jsonDecode(payload) as Map<String, Object?>)['role'];
    } on Object {
      throw ConfigException('Supabase key looks like a JWT but could not be decoded.');
    }
    if (role != 'anon') {
      throw ConfigException('Supabase key has role "$role"; only public keys are allowed.');
    }
  }
}
