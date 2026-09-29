import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:ming_shared/ming_shared.dart';

String _jwt(Map<String, Object?> payload) => [
      'eyJhbGciOiJIUzI1NiJ9',
      base64Url.encode(utf8.encode(jsonEncode(payload))).replaceAll('=', ''),
      'sig',
    ].join('.');

Map<String, String> _raw({
  String env = 'development',
  String url = 'http://127.0.0.1:54321',
  String key = 'sb_publishable_abc',
}) =>
    {'APP_ENV': env, 'SUPABASE_URL': url, 'SUPABASE_PUBLISHABLE_KEY': key};

void main() {
  group('AppConfig.parse', () {
    test('accepts a valid development config', () {
      final config = AppConfig.parse(_raw());
      expect(config.env, AppEnv.development);
      expect(config.supabaseUrl.host, '127.0.0.1');
    });

    test('rejects unknown or missing APP_ENV', () {
      expect(() => AppConfig.parse(_raw(env: '')), throwsA(isA<ConfigException>()));
      expect(() => AppConfig.parse(_raw(env: 'staging')), throwsA(isA<ConfigException>()));
    });

    test('rejects missing or invalid SUPABASE_URL', () {
      expect(() => AppConfig.parse(_raw(url: '')), throwsA(isA<ConfigException>()));
      expect(() => AppConfig.parse(_raw(url: 'not a url')), throwsA(isA<ConfigException>()));
    });

    test('requires https in production', () {
      expect(
        () => AppConfig.parse(_raw(env: 'production', url: 'http://x.supabase.co')),
        throwsA(isA<ConfigException>()),
      );
      expect(
        AppConfig.parse(_raw(env: 'production', url: 'https://x.supabase.co')).env,
        AppEnv.production,
      );
    });

    test('rejects a missing key', () {
      expect(() => AppConfig.parse(_raw(key: '')), throwsA(isA<ConfigException>()));
    });
  });

  group('assertPublicSupabaseKey', () {
    test('rejects sb_secret keys', () {
      expect(() => assertPublicSupabaseKey('sb_secret_abc'), throwsA(isA<ConfigException>()));
    });
    test('rejects legacy service_role JWTs', () {
      expect(
        () => assertPublicSupabaseKey(_jwt({'role': 'service_role'})),
        throwsA(isA<ConfigException>()),
      );
    });
    test('accepts legacy anon JWTs and publishable keys', () {
      expect(() => assertPublicSupabaseKey(_jwt({'role': 'anon'})), returnsNormally);
      expect(() => assertPublicSupabaseKey('sb_publishable_abc'), returnsNormally);
    });
  });
}
