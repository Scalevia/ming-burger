# Architecture Decision Records

| # | Decision | Status |
|---|---|---|
| [0001](0001-supabase-platform.md) | Supabase as the backend platform, one project per environment | Accepted |
| [0002](0002-database-enforced-rules.md) | Business rules in PostgreSQL; closed-by-default grants | Accepted |
| [0003](0003-branch-aware-single-business.md) | Branch-aware single business, not multi-tenant | Accepted (model in Phase 2) |
| [0004](0004-web-react-router-static.md) | Web: React Router 8, static prerender + SPA, Vercel | Accepted after Phase 1 spike (Vercel deploy pending) |
| [0005](0005-flutter-workspace.md) | Flutter pub workspace, shared package, runtime device config | Accepted |
| [0006](0006-negative-stock-policy.md) | Negative stock: BLOCK by default, centralised policy | Accepted |
| [0007](0007-languages-and-i18n.md) | Languages and lightweight i18n | Accepted |
| [0008](0008-idempotency.md) | Idempotency via client_request_id | Accepted |
| [0009](0009-hash-based-csp.md) | Per-page hash-based CSP for the static web app | Accepted |

Template: Context → Decision → Consequences. Superseded records are kept and marked, never deleted.
