# 0001 — Supabase as the backend platform

**Status:** Accepted (Phase 0)

## Context
One restaurant business with a few branches needs a relational source of truth with transactions,
authentication, row-level authorization, realtime updates for kitchens and image storage, without
running its own servers.

## Decision
Use Supabase: PostgreSQL, Auth, RLS, RPC (PL/pgSQL), Realtime, Storage, and Edge Functions only
where the secret key is needed. **One project per environment** (dev, production); every branch
lives in the same project as data. GraphQL is disabled. Production runs on a paid plan (backups,
no pausing).

## Consequences
- All business invariants can be enforced in one transactional database.
- Internet connectivity at each branch is a dependency (mitigation: 4G failover; idempotency ready
  for a future offline queue — ADR-0008).
- RLS and `SECURITY DEFINER` functions are security-critical and must be tested (pgTAP in CI).
