import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Persists the Supabase session (access + refresh token) in the platform's
/// secure storage (Android Keystore / iOS Keychain / Windows DPAPI) instead of
/// the default shared preferences.
class SecureLocalStorage extends LocalStorage {
  SecureLocalStorage({
    this.storage = const FlutterSecureStorage(),
    this.key = 'ming.supabase.session',
  });

  final FlutterSecureStorage storage;
  final String key;

  @override
  Future<void> initialize() async {}

  @override
  Future<bool> hasAccessToken() => storage.containsKey(key: key);

  @override
  Future<String?> accessToken() => storage.read(key: key);

  @override
  Future<void> persistSession(String persistSessionString) =>
      storage.write(key: key, value: persistSessionString);

  @override
  Future<void> removePersistedSession() => storage.delete(key: key);
}
