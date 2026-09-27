# 0003 — Branch-aware single business, not multi-tenant

**Status:** Accepted in principle (2026-09-28). The concrete data model is designed in Phase 2.

## Context
The restaurant has two branches today and plans more. It is still one business: no separate
companies, customers-of-a-platform, or tenant isolation.

## Decision
- One Supabase project per environment holds all branches; branches are rows.
- No build, deployment, environment variable or config file identifies a branch. A device's branch
  (and cash register) is chosen at runtime from the branches the signed-in user may access.
- Phase 2 classifies every entity as **global**, **branch-specific**, or **global with branch-level
  overrides**, and defines user↔branch access (e.g. a `user_branches` link) enforced by RLS and RPC.
  OWNER: all branches; MANAGER: assigned branches; CASHIER/KITCHEN: typically one.
- A UI for managing branch permissions is not required in V1, but the security model must support it.

## Consequences
- Branch scope becomes part of authorization checks and of most indexes and reports.
- No per-branch forks of apps or databases.
