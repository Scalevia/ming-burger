# Environments, versions and secrets

## 1. Pinned versions (Phase 1, 2026-09-28)

Upgrades are deliberate: change the version here, in the pin location, and in CI in the same PR.

### Toolchain

| Tool | Version | Pinned in |
|---|---|---|
| Node.js | 22.23.2 (LTS "Jod"; React Router 8 needs ≥ 22.22) | `.nvmrc`, `engines` |
| pnpm | 11.28.0 | `package.json#packageManager` |
| Supabase CLI | 2.118.0 | root `package.json` devDependency |
| PostgreSQL (local) | 17 (major) | `supabase/config.toml` — must match hosted projects |
| Flutter / Dart | 3.47.5 / 3.13.4 (DevTools 2.60.0) | pubspecs `environment`, CI `flutter-version` |
| Docker Desktop | 4.91.0 (Docker CLI 29.8.0) | developer machine |
| gitleaks | 8.30.1 | CI |
| CI runner | ubuntu-24.04 | `.github/workflows/*` (actions pinned to commit SHAs) |

**Why these versions**

- **Flutter 3.47.5**: newest stable line, five patch releases in (released 2026-09-18). Every planned
  dependency supports it (supabase_flutter ≥ 3.35, go_router 18 ≥ 3.44, flutter_riverpod 3.4 needs Dart ^3.12).
  Upgraded from 3.22.2 (June 2024), which could not run Dart pub workspaces or current packages.
- **Node 22.23** rather than 24: satisfies React Router 8 while staying on the major line already used
  by other tools on the development machine. Node 22 is supported until April 2027 — plan a move to 24 before then.
- **pnpm 11.28** rather than 12.x: 12.0 was one month old; 11.x is mature.
- **TypeScript 6.0.3** rather than 7.0: typescript-eslint supports `<6.1` only.

### Web dependencies (`apps/web/package.json`, exact pins)

react / react-dom 19.3.0 · react-router + @react-router/dev 8.4.0 · vite 8.3.1 · typescript 6.0.3 ·
@supabase/supabase-js 2.117.2 · isbot 5.2.2 · vitest 5.0.2 · eslint 10.11.0 · typescript-eslint 8.70.1 ·
eslint-plugin-react-hooks 7.1.1 · prettier 3.9.9

### Flutter dependencies (`packages/shared/pubspec.yaml`, exact pins; lockfile: root `pubspec.lock`)

supabase_flutter 2.17.2 · flutter_secure_storage 11.2.0 · flutter_lints 6.0.0

## 2. Environments

| | Local | Dev (hosted) | Production (hosted) |
|---|---|---|---|
| Purpose | Development, tests | Integration, client demos, preview deployments | The restaurant |
| Supabase | Docker via CLI | Project `ming-burger-dev` | Project `ming-burger-prod` |
| Web | `pnpm web:dev` | Vercel **Preview** deployments | Vercel **Production** |
| Flutter | `--dart-define-from-file=config/dev.json` | `config/preview.json` | `config/production.json` |
| Data | Seed data | Test data only | Real data — never copied down to dev |
| Schema changes | `pnpm db:new`, `pnpm db:reset` | `Deploy database` workflow (manual) | Same workflow, **reviewer approval required** |

**One Supabase project per environment serves every branch.** Branches are rows in the database,
not separate projects, deployments or builds. No configuration file, environment variable or build
flavor contains a branch identifier.

## 3. Keys and secrets matrix

| Value | Secret? | Used by | Stored in |
|---|---|---|---|
| Supabase URL | No | Web, POS, Kitchen | `VITE_SUPABASE_URL` / `SUPABASE_URL` |
| Supabase **publishable** key (`sb_publishable_…`) | No (public, protected by RLS) | Web, POS, Kitchen | `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` |
| Supabase **secret** key (`sb_secret_…`, formerly service_role) | **Yes** | Edge Functions only (Phase 3+) | Supabase Edge Function secrets. Never in git, Vercel, or any app |
| Database password | **Yes** | Migration deploys | GitHub Environment secret `SUPABASE_DB_PASSWORD` |
| Supabase personal access token | **Yes** | Migration deploys | GitHub Environment secret `SUPABASE_ACCESS_TOKEN` |
| Project ref | No (but not advertised) | Migration deploys | GitHub Environment secret `SUPABASE_PROJECT_REF` |
| Public site URL | No | Web build | `VITE_SITE_URL` (Vercel env var per environment) |

Guards in place:

- The web app (`app/lib/env.ts`) and the Flutter apps (`AppConfig`) **refuse to start** with a secret key
  or a legacy `service_role` JWT.
- `verify-build.mjs` fails the build if key material appears in the shipped web bundle.
- gitleaks scans the full git history on every push.
- `.gitignore` excludes `.env*` (except `.env.example`) and `config/*.json` (except `*.example.json`).

## 4. Ownership structure (proposed — needs approval before Production is created)

Goal: ScaleVia builds and operates the system now; the client can become the direct owner of
Production later **without migrating the project, changing URLs/keys, or downtime.**

### Supabase

| Organization | Owner now | Contains | Billing |
|---|---|---|---|
| `ScaleVia` (existing, Tech@scalevia.net) | ScaleVia | `ming-burger-dev` | ScaleVia |
| **`Ming Burger`** (new, dedicated) | ScaleVia (Tech@scalevia.net) | **`ming-burger-prod` only** | Pro plan — ideally the client's payment method from day one |

Handover = invite the client's account to the `Ming Burger` organization as **Owner**, move billing to
them, and reduce ScaleVia to Developer/Admin. The project itself never moves.

Why not put Production in the ScaleVia organization: handing it over later would require a project
transfer between organizations (billing/plan changes, more risk) and mixes client data with agency assets.

Organization hygiene: MFA required for every member; as few members as possible;
the CI access token belongs to a named account and is rotated when people leave.

### Vercel

- Vercel **Hobby is limited to non-commercial use** — a restaurant website needs a **Pro** team.
- Same pattern: a dedicated `Ming Burger` team owned by Tech@scalevia.net now, handed over later.
- The production domain should be registered **in the client's name**, at a registrar the client controls.

### GitHub

- The repository stays in the `Scalevia` organization; source ownership at handover follows the contract.

### Region

Cannot be changed after a project is created. TCP connect time measured from the development machine
(2026-09-28, median of 5):

| AWS region | Location | Latency |
|---|---|---|
| eu-west-3 | Paris | **~94 ms** |
| eu-west-1 | Ireland | ~103 ms |
| eu-central-1 | Frankfurt | ~110 ms |
| me-central-1 | UAE | ~199 ms |
| ap-south-1 | Mumbai | ~198 ms |

(Confirm which of these Supabase offers in the "new project" dialog. The Middle East regions measured
slower than Europe from this network.)

Recommendation: **Paris (eu-west-3)** or Frankfurt. The difference is small, so **re-measure from each
branch's network** before creating Production, and create Dev in the same region.
Re-measure with:
`curl -s -o /dev/null -w "%{time_connect}\n" https://dynamodb.eu-west-3.amazonaws.com/ping`

## 5. Hosted project setup checklist (applied when each project is created)

Supabase (both Dev and Production):

- [ ] Region per section 4; Postgres major version 17 (must match `supabase/config.toml`)
- [ ] Authentication → Sign In / Providers: **Allow new users to sign up = OFF**; anonymous sign-ins OFF
- [ ] API settings → Exposed schemas: **`public` only** (remove `graphql_public`; never add `private`)
- [ ] Data API: new tables not exposed automatically (if the setting exists; the baseline migration revokes the grants regardless)
- [ ] Database → SSL enforcement ON
- [ ] Apply migrations only with the `Deploy database` workflow
- [ ] Production only: Pro plan, daily backups verified; PITR decision (Phase 17)

GitHub:

- [ ] Environments `dev` and `production` with the three secrets from section 3
- [ ] `production` environment: required reviewers
- [ ] Branch protection on `main`: PR required, CI must pass

Vercel:

- [ ] Project root directory `apps/web`; framework preset "Other"; settings come from `apps/web/vercel.json`
- [ ] Environment variables — Preview: Dev Supabase URL + publishable key, `VITE_APP_ENV=preview`;
      Production: Prod values, `VITE_APP_ENV=production`, `VITE_SITE_URL=https://<domain>`
- [ ] Node.js version 22.x

## 6. Developer machine setup (Windows)

1. Enable WSL2 (admin PowerShell: `wsl --install --no-distribution`), then **reboot**.
2. Install Docker Desktop (WSL2 backend) and start it once. On 8 GB machines, stop unused containers
   or start Supabase with `-x studio,imgproxy,logflare,vector` to save memory.
3. Node 22.23.x, `npm i -g pnpm@11.28.0`.
4. Flutter 3.47.5: `flutter upgrade` (or `git checkout 3.47.5` in the Flutter SDK), `flutter doctor`.
5. For Android builds: Android SDK Platform 36 + build-tools (Android Studio → SDK Manager), then
   `flutter doctor --android-licenses` — **the developer reads and accepts the licenses personally**.
