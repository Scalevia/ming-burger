# 0007 — Languages and lightweight i18n

**Status:** Accepted (2026-09-28)

## Decision
- Admin dashboard, POS and Kitchen: **Arabic only** in V1 (RTL).
- Public landing page: **Arabic + English** at `/ar` and `/en`, prerendered, with hreflang and
  `x-default` → `/`.
- Dynamic public content: paired columns `name_ar` / `name_en`, `description_ar` / `description_en`,
  only on publicly shown fields. Static UI strings: `apps/web/app/i18n/ar.json` and `en.json`;
  a unit test enforces identical keys.
- No i18n framework and no JSON translation columns.
