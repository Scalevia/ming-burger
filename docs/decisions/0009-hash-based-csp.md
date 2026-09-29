# 0009 — Per-page hash-based CSP for the static web app

**Status:** Accepted (Phase 1)

## Context
React Router emits page-specific inline scripts (hydration data). A static header CSP would need
`'unsafe-inline'`, which removes most XSS protection — important because supabase-js keeps the
admin session in browser storage.

## Decision
- A post-build step (`apps/web/scripts/inject-csp.mjs`) adds a
  `<meta http-equiv="Content-Security-Policy">` to every generated HTML file with SHA-256 hashes of
  exactly that page's inline scripts; `connect-src` and `img-src` allow only the configured Supabase origin.
- Directives a `<meta>` cannot carry (`frame-ancestors`), plus `X-Frame-Options`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy` and HSTS, are sent from `vercel.json`.
- ESLint forbids `dangerouslySetInnerHTML`.

## Consequences
- Verified: hydration works under the policy, and an injected inline script is blocked.
- Adding third-party scripts or inline styles later requires a deliberate policy change.
