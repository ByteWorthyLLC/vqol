# Aggregate Receiver Example

This Cloudflare Worker-style example accepts the optional VQOL aggregate payload
and stores it in a KV namespace named `VQOL_AGGREGATE_KV`.

It is intentionally minimal:

- `POST` only.
- JSON only.
- Small payload limit.
- No patient identifiers required by the client payload.
- Returns `204` when accepted.

Practices should add their own authentication, rate limiting, origin policy,
retention policy, and operational logging before production use.
