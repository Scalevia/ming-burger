# Architecture

Summary of the approved Phase 0 architecture review and the decisions confirmed afterwards.
Individual decisions with their reasoning are in [`decisions/`](decisions); anything not yet
decided is tracked in [`open-decisions.md`](open-decisions.md).

## Business context

- **One business, multiple branches** (Branch 1, Branch 2, more expected). The system is
  **branch-aware**, but it is **not** multi-tenant SaaS: no companies, organizations or tenant isolation.
- Staff roles: `OWNER`, `MANAGER`, `CASHIER`, `KITCHEN`. Users can be linked to one or more branches
  (e.g. OWNER: all; MANAGER: some; CASHIER/KITCHEN: one). The data model is defined in Phase 2.
- Production-grade system, deliberately simple: no microservices, queues, caches or extra services.

## Components and responsibilities

| Layer | Responsible for | Never responsible for |
|---|---|---|
| **Flutter POS** | Cashier UI, cart as a *draft*, calling RPCs, generating `client_request_id`, printing (via `PrinterService`) | Final prices/totals, payment status, stock changes |
| **Flutter Kitchen** | Tickets, Realtime subscription + resync, status changes via RPC | Deciding which status transition is allowed |
| **Web** (React Router, static) | Public landing (prerendered, AR/EN), Admin SPA (AR) | Security — route guards are UX only |
| **Supabase Auth** | Identity, JWT, refresh tokens, MFA, session revocation | Roles/permissions (kept in the database) |
| **PostgreSQL** | Source of truth: schema, constraints, state machines, money, stock, audit | Presentation |
| **RLS + explicit GRANTs** | Who can read which rows; direct writes to low-risk master data | Multi-step business logic |
| **RPC (PL/pgSQL)** | Every sensitive/multi-step command: orders, payments, refunds, stock movements, purchases, shifts | — |
| **Triggers** | `updated_at`, audit, append-only enforcement, versioning, Realtime signals | Hidden business flows |
| **Edge Functions** | Only operations needing the secret key: staff user administration | CRUD, order logic |
| **Realtime** | "Something changed" signal | Being the source of truth |
| **Storage** | Public product/landing images; manager-only uploads | Sensitive files (V1) |

## Principles

1. **The database enforces the rules.** Clients send intent (`product_id`, `quantity`), never
   prices, totals or statuses. Each multi-step command is a single RPC = a single transaction.
2. **Closed by default.** RLS on every exposed table; no implicit grants to API roles
   (enforced from Phase 1 by the baseline migration and tested with pgTAP); functions are
   not executable by `PUBLIC`; helpers live in the unexposed `private` schema.
3. **History is immutable.** Orders snapshot names/prices/costs/tax rates; stock movements and
   payments are append-only; corrections are compensating entries; soft delete for master data.
4. **Idempotency from day one.** A client-generated `client_request_id` on every creating command, so
   retries never duplicate and an offline queue can be added later.
5. **Branch-aware everywhere.** No component assumes a single branch; branch and register are runtime
   data, never build-time configuration.
6. **Phase by phase, vertical slices:** DB → RLS → RPC → API → UI → tests → security review → docs,
   stopping for approval after every phase.

## Confirmed V1 decisions (2026-09-28)

| Topic | Decision |
|---|---|
| Recipes / ingredient-based stock | In V1 (simple: one recipe per product, base units) |
| Negative stock | `BLOCK` by default; `ALLOW_WITH_ALERT` possible later as a setting, without redesign ([ADR-0006](decisions/0006-negative-stock-policy.md)) |
| Connectivity | Online-only + 4G backup; idempotency ready for a future offline queue |
| Modifiers | Undecided — impact analysis in Phase 2 |
| Printing | Customer receipt + kitchen ticket; `PrinterService` abstraction only until hardware is chosen |
| Tax / service charge | Fully configurable (rates, inclusive/exclusive, order); no hard-coded values |
| Cash registers | Multi-register capable; number unknown |
| Payments | `CASH`, `CARD`, `WALLET` — recorded only; no gateway; no card data stored |
| Languages | Admin, POS, Kitchen: Arabic only. Landing: Arabic + English |
| Web | React Router 8 framework mode, static (prerender + SPA), Vercel ([ADR-0004](decisions/0004-web-react-router-static.md)) |
| Signup | Public signup disabled from Phase 1 |
| Hardware | Not decided; Android is the development target only |

## Phase plan

| Phase | Slice |
|---|---|
| 0 | Architecture review ✅ |
| **1** | **Foundation** — repo, environments, security baseline, CI, app skeletons, React Router spike |
| 2 | Domain design (document only): ERD, branch model, state machines, permission matrix, modifiers impact — decision gate |
| 3 | Identity & access: profiles, roles, user↔branch access, audit base, `admin-users` Edge Function, logins |
| 4 | Settings, branches & registers |
| 5 | Catalog (+ storage, public views) |
| 6 | Inventory core |
| 7 | Suppliers & purchases |
| 8 | Recipes |
| 9 | Tables & shifts |
| 10 | Orders (POS selling UI) |
| 11 | Payments & refunds |
| 12 | Kitchen (Realtime + Kitchen app) |
| 13 | Reports & overview |
| 14 | Public landing (may move earlier — only needs phases 4–5) |
| 15 | Printing integration (once hardware is chosen) |
| 16 | Hardening |
| 17 | Production & go-live |
