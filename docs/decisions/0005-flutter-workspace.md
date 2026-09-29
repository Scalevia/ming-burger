# 0005 — Flutter: pub workspace, shared package, runtime device configuration

**Status:** Accepted (Phase 1)

## Decision
- One Dart pub workspace (root `pubspec.yaml`, single `pubspec.lock`): `apps/pos`, `apps/kitchen`,
  `packages/shared`.
- Build-time configuration is limited to public values (`APP_ENV`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`) via `--dart-define-from-file`; `AppConfig` rejects secret keys.
  Branch and cash register are **runtime** selections (ADR-0003).
- The Supabase session is stored in platform secure storage (`SecureLocalStorage`), not shared
  preferences. Android backups are disabled for both apps.
- Printing goes through `PrinterService` (layout-level `PrintDocument`), with an
  `UnconfiguredPrinterService` until hardware is chosen.
- Android is the **development** target only; other platforms are added with
  `flutter create --platforms=...` once hardware is decided. Application IDs
  (`com.mingburger.ming_pos`, `com.mingburger.ming_kitchen`) can still change before the first release.
- State management and routing packages (proposal: Riverpod, go_router) are added in Phase 3, when
  there is state and navigation to manage.
