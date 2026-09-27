-- Verifies the Phase 1 security baseline (migration *_security_baseline.sql).
-- Probe objects are created inside the transaction and rolled back.
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

-- private schema --------------------------------------------------------------
select has_schema('private', 'private schema exists');
select ok(not has_schema_privilege('anon', 'private', 'USAGE'),
  'anon has no USAGE on private');
select ok(not has_schema_privilege('authenticated', 'private', 'USAGE'),
  'authenticated has no USAGE on private');

-- new tables in public are not auto-granted to API roles ------------------------
create table public.__baseline_probe (id int primary key);

select ok(not has_table_privilege('anon', 'public.__baseline_probe', 'SELECT'),
  'anon gets no implicit SELECT on new tables');
select ok(not has_table_privilege('authenticated', 'public.__baseline_probe', 'SELECT'),
  'authenticated gets no implicit SELECT on new tables');
select ok(not has_table_privilege('authenticated', 'public.__baseline_probe', 'INSERT,UPDATE,DELETE'),
  'authenticated gets no implicit write privileges on new tables');

-- new sequences ------------------------------------------------------------------
create sequence public.__baseline_probe_seq;
select ok(not has_sequence_privilege('authenticated', 'public.__baseline_probe_seq', 'USAGE'),
  'authenticated gets no implicit USAGE on new sequences');

-- new functions are not executable by anon/authenticated/PUBLIC ----------------------
create function public.__baseline_probe_fn() returns int language sql as 'select 1';
create function private.__baseline_probe_fn() returns int language sql as 'select 1';

select ok(not has_function_privilege('anon', 'public.__baseline_probe_fn()', 'EXECUTE'),
  'anon cannot execute new public functions');
select ok(not has_function_privilege('authenticated', 'public.__baseline_probe_fn()', 'EXECUTE'),
  'authenticated cannot execute new public functions');
select ok(not has_function_privilege('authenticated', 'private.__baseline_probe_fn()', 'EXECUTE'),
  'authenticated cannot execute new private functions');

-- GraphQL removed ------------------------------------------------------------------------
select ok(not exists (select 1 from pg_extension where extname = 'pg_graphql'),
  'pg_graphql extension is not installed');

-- service_role still works for server-side tooling ----------------------------------------
select ok(has_table_privilege('service_role', 'public.__baseline_probe', 'SELECT'),
  'service_role keeps default grants');

select * from finish();
rollback;
