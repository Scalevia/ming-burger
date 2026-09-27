import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ming_shared/ming_shared.dart';

void main() {
  setUp(() => FlutterSecureStorage.setMockInitialValues({}));

  test('persists, reads and removes the session in secure storage', () async {
    final storage = SecureLocalStorage();
    await storage.initialize();
    expect(await storage.hasAccessToken(), isFalse);

    await storage.persistSession('{"access_token":"t"}');
    expect(await storage.hasAccessToken(), isTrue);
    expect(await storage.accessToken(), '{"access_token":"t"}');

    await storage.removePersistedSession();
    expect(await storage.hasAccessToken(), isFalse);
    expect(await storage.accessToken(), isNull);
  });
}
