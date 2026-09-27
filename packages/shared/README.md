# ming_shared

Shared foundation for the POS and Kitchen apps:

- `AppConfig` — validated build-time config (public values only; rejects secret keys)
- `bootstrap()` — Supabase initialisation with the session stored in platform secure storage
- `PrinterService` — printing contract for the customer receipt and kitchen ticket (no hardware implementation yet)
- `MingShellApp` — Arabic, right-to-left base app
