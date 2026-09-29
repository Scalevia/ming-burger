# 0008 — Idempotency via client_request_id

**Status:** Accepted (Phase 0; implemented per module)

## Decision
Every command that creates something (order, added items, payment, refund, shift open/close)
carries a client-generated UUID `client_request_id`, unique in the database. Replaying the same
request returns the original result instead of creating a duplicate. Records also keep an optional
`client_created_at` next to the server's `created_at`.

## Consequences
- Safe retries after timeouts and double taps.
- A future offline queue can replay commands safely. Offline mode itself is out of V1.
