# Phase 1 — Foundation: report

**Date:** 2026-09-28 · **Branch:** `phase-1/foundation` · **Status:** implemented locally; external steps pending (see §5)

## 1. Scope delivered

- Monorepo: `apps/web`, `apps/pos`, `apps/kitchen`, `packages/shared`, `supabase`, `docs`, `.github`.
- Supabase: local configuration (signup disabled, only `public` exposed, no auto-exposed tables,
  unused services off); **security baseline migration** (no business tables); pgTAP tests;
  signup-rejection check; manual migration deploy workflow for hosted projects.
- Web: React Router 8 static app — prerendered `/`, `/ar`, `/en`; admin SPA shell; per-page
  hash-based CSP; security headers; build verification script; local preview server that
  applies `vercel.json`.
- Flutter: pub workspace; POS and Kitchen shells (Arabic, RTL); validated public-only config;
  Supabase session in secure storage; `PrinterService` abstraction; Android hardening.
- CI: secret scan (full history), database, web, Flutter (incl. Android debug builds).
- Docs: architecture, environments (versions, secrets matrix, **ownership structure**, region
  measurements, hosted setup checklist), 9 ADRs, open decisions.
- **Branch-aware check:** no config, env var, build flavor or deployment identifies a branch; one
  Supabase project per environment serves all branches (ADR-0003).

## 2. Verification performed

| Area | Check | Result |
|---|---|---|
| Web | typecheck (TS 6), ESLint, Prettier | Pass |
| Web | Unit tests (env/key guards, i18n parity, language helpers) | 22/22 pass |
| Web | `verify-build.mjs` (prerender, lang/dir, SEO tags, no admin preload, CSP, secret scan) | All pass |
| Web | Secret scanner negative test (planted fake key) | Detected |
| Web | Headless Chrome: `/admin/orders/123` deep link, `/admin`, `/en` | Pass, no console errors |
| Web | CSP negative test (injected inline script) | Blocked |
| Web | ESLint blocks `dangerouslySetInnerHTML` | Pass |
| Flutter | `flutter analyze` (strict) | No issues |
| Flutter | Tests: shared 13, POS 1, Kitchen 1 | 15/15 pass |
| Database | Migration + pgTAP file parsed by the PostgreSQL 17 parser (libpg_query) | Pass |
| Database | Migration executed + pgTAP run | **Not yet** — needs Docker (local) or CI |
| Repo | gitleaks on git history | No leaks |

## 3. Issues found and fixed during the phase

- Prerender loader received `/en.data` as the request URL (React Router 8) → English page rendered
  Arabic content. Fixed by using the normalised `url` argument; covered by `verify-build.mjs`.
- Secret scan false positive on library strings → scanner now looks for key material / non-anon JWTs.
- `auto_expose_new_tables = false` could make local and hosted grants differ for `service_role`
  → migration now states `service_role` default grants explicitly.
- Android: release builds lacked the `INTERNET` permission; backups disabled for secure storage.

## 4. Deferred to later phases (by design)

Supabase sign-in round trip (Phase 3), UI library choice (Phase 3), Riverpod/go_router (Phase 3),
password policy and MFA settings (Phase 3), printer implementations (hardware decision).

## 5. Pending external steps

See [`../open-decisions.md`](../open-decisions.md) items P1-1 … P1-7: push + CI run, WSL2/Docker,
Supabase Dev project, Vercel project and first deployment, ownership approval, region, Android SDK.
