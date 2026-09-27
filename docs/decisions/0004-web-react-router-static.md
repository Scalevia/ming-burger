# 0004 — Web: React Router 8 (static prerender + SPA) on Vercel

**Status:** Accepted after the Phase 1 verification spike. Pending: first real Vercel deployment.

## Context
One web app serves a public, bilingual landing page (needs SEO and link previews) and a protected
Arabic admin dashboard (a pure client app talking to Supabase). Approved direction:
"React Router v7 + prerender + SPA admin", subject to a spike.

## Decision
- React Router **8.4** framework mode with `ssr: false` and `prerender: ["/", "/ar", "/en"]`.
  v8 (June 2026) is v7's successor with the same framework mode; its breaking changes are removals
  of v7 future flags, ESM-only packages, Node ≥ 22.22 and React ≥ 19.2.7. Starting a new project on
  7.x would schedule an unnecessary major migration.
- Output is fully static (`build/client`) and deployed to **Vercel** with framework preset "Other";
  `/admin/*` is rewritten to `__spa-fallback.html`.
- Build-time data (the menu, later) is fetched in prerender loaders; pages can refresh it client-side.

## Spike results (Phase 1, local build + headless Chrome)

| Check | Result |
|---|---|
| `/ar`, `/en`, `/` prerendered with real content in the HTML | Pass |
| `<html lang dir>` per language (`ar`/`rtl`, `en`/`ltr`) | Pass |
| Title, description, Open Graph, canonical, hreflang (ar, en, x-default) | Pass |
| Admin not prerendered; admin and Supabase code not preloaded by landing pages | Pass |
| Deep-link refresh `/admin/orders/123` renders the SPA (vercel.json rewrite, local emulation) | Pass |
| supabase-js initialises in the SPA; no console errors | Pass |
| Strict CSP (ADR-0009): hydration works; an injected inline script is blocked | Pass |
| Unknown public route returns HTTP 404 | Pass |
| Supabase sign-in round trip | Deferred to Phase 3 (no users or login yet) |
| Real Vercel deployment | **Pending** — needs access to the Vercel account |

Finding: in v8 the prerender loader receives the raw request (`/en.data`); loaders must use the
normalised `url` argument. Caught by the spike and fixed.

## Consequences
- No server runtime: smaller attack surface, simple hosting, no SSR auth cookies.
- Menu changes on the landing page appear after client refresh; a rebuild (deploy hook) refreshes
  the SEO HTML.
- If a server-rendered public site is ever needed (e.g. online ordering), revisit this decision.
