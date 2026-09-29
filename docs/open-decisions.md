# Open decisions

Decisions that are not made yet, grouped by when they block work. Never assume an answer; update this
file when one is decided (and add an ADR if it shapes the architecture).

## Blocking Phase 1 completion (actions, not design)

| # | Item | Owner | Status |
|---|---|---|---|
| P1-0 | Push `main` + `phase-1/foundation` to GitHub and review the first CI run (push was not permitted from the agent session) | ScaleVia | Open |
| P1-1 | Enable WSL2 + reboot so Docker Desktop can run local Supabase on the dev machine | Developer | Open |
| P1-2 | Approve the Supabase ownership structure (dedicated `Ming Burger` org for Production) — `environments.md` §4 | ScaleVia | Open |
| P1-3 | Access to Supabase (Tech@scalevia.net) to create the **Dev** project, or create it and share an access token via GitHub Environment secrets | ScaleVia | Open |
| P1-4 | Access to Vercel (Tech@scalevia.net): create the project (root `apps/web`) connected to the GitHub repo; Pro team for commercial use | ScaleVia | Open |
| P1-5 | Region choice (Paris vs Frankfurt), after measuring from a branch network | ScaleVia / client | Open |
| P1-6 | Android SDK 36 + license acceptance on the dev machine (local Android builds) | Developer | Open |
| P1-7 | GitHub: branch protection on `main`, Environments `dev`/`production` | ScaleVia | Open |

## Needed before Phase 2 (Domain Design) — affect the schema

| # | Question |
|---|---|
| D-1 | The real menu (from the client) — drives modifiers, variants and combos |
| D-2 | Modifiers / add-ons in V1? |
| D-3 | Variants / sizes (single/double, small/large)? |
| D-4 | Combos / meals? |
| D-5 | Kitchen stations per branch (one screen vs grill/fryer/drinks)? |
| D-6 | Payment timing: takeaway pay-first? dine-in pay-at-end? can an unpaid order be closed? |
| D-7 | Discounts: percentage/amount, order/item level, who may apply them |
| D-8 | Several cashiers on one cash drawer in one shift? |
| D-9 | Which language is mandatory for product/category names (AR, EN, both)? Receipt language? |
| D-10 | Tax / service calculation order and rounding (from the accountant; values can come later) |
| D-11 | Inventory units and precision (e.g. 3 decimals for kg) |
| D-12 | Branch differences: does each branch have its own menu availability, prices, recipes, suppliers, stock? Can stock move between branches (transfers)? Central kitchen/warehouse? |
| D-13 | Is the negative-stock policy global or per branch? |

## Can be decided later without affecting the database architecture

Printer hardware and connection, and which device prints kitchen tickets · actual tax/service values ·
number of registers per branch · wallet providers · domain name · landing content and design ·
monitoring tool · PITR · report layouts · 4G router · e-receipt (tax authority) integration ·
production hardware platform (Android / Windows / iPad) · final Android application IDs.
