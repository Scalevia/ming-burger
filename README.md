# Ming Burger

Operations platform for **one restaurant business with multiple branches**
(currently 2, designed for more — branch-aware, not multi-tenant SaaS).

| App | Path | Stack | Language |
|---|---|---|---|
| Public landing page + Admin dashboard | [`apps/web`](apps/web) | React Router 8 (static: prerender + SPA), Vercel | Landing AR + EN · Admin AR |
| POS (cashier) | [`apps/pos`](apps/pos) | Flutter | AR |
| Kitchen display | [`apps/kitchen`](apps/kitchen) | Flutter | AR |
| Shared Flutter code | [`packages/shared`](packages/shared) | Dart | — |
| Backend | [`supabase`](supabase) | Supabase: PostgreSQL, Auth, RLS, RPC, Realtime, Storage | — |

**Current phase:** Phase 1 — Foundation (no business features yet). See [`docs/`](docs).

## Prerequisites

Exact versions are pinned in [`docs/environments.md`](docs/environments.md).

- Node.js 22.23.x (`.nvmrc`) and pnpm 11.28.0 (`npm i -g pnpm@11.28.0`)
- Docker Desktop (WSL2 backend on Windows) — required for local Supabase
- Flutter 3.47.5 (Dart 3.13.4)
- Supabase CLI: installed automatically as a pinned dev dependency (`pnpm exec supabase`)

## First-time setup

```bash
pnpm install                 # web deps + pinned Supabase CLI
flutter pub get              # Flutter workspace (run at repo root)
pnpm db:start                # local Supabase in Docker; prints API URL + publishable key
```

Create local config files from the templates (they are git-ignored):

- `apps/web/.env.local` from `apps/web/.env.example`
- `apps/pos/config/dev.json` from `apps/pos/config/dev.example.json` (same for `apps/kitchen`)

Put the **publishable** key from `pnpm db:start` in them. Never use the secret key
in any app — both the web app and the Flutter apps refuse to start with one.

## Everyday commands

| Task | Command |
|---|---|
| Web dev server | `pnpm web:dev` → http://localhost:5173 (`/ar`, `/en`, `/admin`) |
| Web checks (types, lint, format, tests) | `pnpm web:check` |
| Web production build + verification | `pnpm web:build && pnpm --filter @ming/web verify:build` |
| Preview the static build with Vercel rewrites/headers | `pnpm --filter @ming/web preview` |
| POS app | `cd apps/pos && flutter run --dart-define-from-file=config/dev.json` |
| Kitchen app | `cd apps/kitchen && flutter run --dart-define-from-file=config/dev.json` |
| Flutter checks | `flutter analyze` (root) and `flutter test` (in each package) |
| Database: new migration | `pnpm db:new <name>` |
| Database: rebuild from migrations | `pnpm db:reset` |
| Database: tests (pgTAP) | `pnpm db:test` |
| Database: lint | `pnpm db:lint` |

## Rules

- **Schema changes only through migrations** in `supabase/migrations`, reviewed in a PR.
  Never change a hosted database from the Supabase dashboard.
- **Secrets never enter git or any client app.** Only `VITE_*` / `--dart-define`
  public values are used by clients. See [`docs/environments.md`](docs/environments.md).
- **Branch-aware:** nothing may assume a single branch. Branch and register are
  runtime data, not build-time configuration.
- Work is delivered phase by phase; see [`docs/architecture.md`](docs/architecture.md).
