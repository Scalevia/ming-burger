-- =============================================================================
-- Phase 1 — Security baseline
--
-- Creates NO business tables. It only changes defaults so that everything
-- added in later phases is closed unless explicitly opened:
--
--   1. New tables / sequences / functions created by `postgres` in `public`
--      are NOT automatically granted to the Data API roles (anon, authenticated).
--      Supabase grants them by default; each later migration must GRANT
--      explicitly, in addition to enabling RLS.
--   2. New functions are NOT executable by PUBLIC (Postgres default) — so a
--      SECURITY DEFINER RPC is never callable by `anon` by accident.
--   3. A `private` schema for internal helpers. It is not listed in the API's
--      exposed schemas (supabase/config.toml, and the hosted project's
--      "Exposed schemas" setting), and no API role has USAGE on it yet.
--   4. pg_graphql is removed: the system uses PostgREST + RPC only.
--
-- service_role keeps access to new objects in `public` (used only server-side by
-- Edge Functions / CI, never shipped to a client).
-- =============================================================================

-- 1. No implicit Data API grants on new objects in `public`.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;

-- service_role (server-side only) keeps access to new objects. Stated explicitly so local
-- (auto_expose_new_tables = false) and hosted projects end up in the same state.
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to service_role;
alter default privileges for role postgres in schema public
  grant execute on functions to service_role;

-- 2. New functions (any schema) are not executable by PUBLIC.
alter default privileges for role postgres
  revoke execute on functions from public;

-- 3. Internal schema for helpers (authorization checks, stock engine, ...).
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
comment on schema private is
  'Internal helpers. Never exposed through the Data API. Access is granted per object in later phases.';

-- 4. GraphQL endpoint is not used.
drop extension if exists pg_graphql;
