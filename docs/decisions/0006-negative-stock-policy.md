# 0006 — Negative stock: BLOCK by default, centralised policy

**Status:** Accepted (2026-09-28). Implemented in the inventory phase.

## Decision
- Every stock change goes through one database function that applies a stock movement. The
  negative-stock check lives only there.
- Policy setting `negative_stock_policy`: `BLOCK` (V1 default) | `ALLOW_WITH_ALERT` (future).
- Applies to decreasing movements (SALE, WASTE, ADJUSTMENT down). Increases (PURCHASE,
  SALE_REVERSAL) are unaffected. Stock counts set the counted quantity (≥ 0).
- A blocked sale returns a structured error (`INSUFFICIENT_STOCK`, item, product), not a generic failure.
- Whether the policy is global or per branch is decided in Phase 2 (branch model).

## Consequences
- Switching policy is a settings change, not a redesign; per-item overrides can be added later.
- Operational risk the client should accept knowingly: wrong recipes or unrecorded purchases can
  block sales at peak time; managers need a fast receive/adjust path.
