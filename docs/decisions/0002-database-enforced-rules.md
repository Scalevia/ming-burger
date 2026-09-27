# 0002 — Business rules in PostgreSQL; closed-by-default grants

**Status:** Accepted (Phase 0; baseline implemented in Phase 1)

## Context
Every client (POS, Kitchen, Admin) talks to the Supabase Data API directly. Anyone holding the
publishable key can call the API without our UI, so UI restrictions are not security.

## Decision
- Sensitive and multi-step operations (orders, payments, refunds, stock movements, purchases,
  shifts, role changes) are **RPC functions**; API roles get no direct write access to those tables.
- Low-risk master data may be written directly, protected by RLS, column grants and audit triggers.
- RPCs are `SECURITY DEFINER` with an empty `search_path`, check permissions first, and take typed
  inputs only (no mass assignment).
- **Closed by default** (migration `*_security_baseline.sql`, Phase 1): new tables, sequences and
  functions in `public` get no grants for `anon`/`authenticated`; functions are not executable by
  `PUBLIC`; helpers live in the unexposed `private` schema. `supabase/config.toml` sets
  `auto_expose_new_tables = false` and exposes only `public`.

## Consequences
- Every later migration must GRANT explicitly and enable RLS — forgetting fails closed, not open.
- pgTAP tests assert the baseline on every CI run.
