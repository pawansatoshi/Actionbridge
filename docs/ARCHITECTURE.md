# ActionBridge Architecture

## Runtime flow

`Goal → Validation → Explicit UI Authorization → CALL-E → Status/Events → Structured Result → Evidence → Human Decision`

## Safety controls

1. `CALLE_LIVE_ENABLED` is a server-side live-call gate.
2. `ACTIONBRIDGE_ALLOW_PROD_LIVE` is an additional production gate; keep it false for public/demo deployments.
3. The UI prepares a short-lived signed plan token bound to the exact goal, recipient, region and locale, then sends an explicit confirmation flag only after the user checks the authorization control.
4. Requests are bounded to a validated E.164 recipient, a currently supported CALL-E region/locale pair and a bounded task length.
5. The server applies a lightweight per-origin request limit.
6. The signed workflow nonce is reused as the CALL-E idempotency key so the same approved workflow is retry-safe.
7. CALL-E credentials never reach client-side code.
8. The public deployment is intended to remain in no-call mode unless both live gates are deliberately enabled in a controlled environment.
9. The execution prompt requires AI disclosure, respects applicable recording/transcription notice requirements, and rejects emergency/safety-critical and high-risk decision/advice categories.
10. Terminal webhooks are treated as correlation/acknowledgement input; the CALL-E status endpoint remains the authoritative read path used by the UI.

## CALL-E surfaces used

- `POST /v1/calls`
- `GET /v1/calls/{call_id}`
- `GET /v1/calls/{call_id}/events`
- terminal webhook delivery via the configured ActionBridge endpoint

The current CALL-E public Developer API lists call creation, result retrieval, developer-facing events and terminal webhooks. It does not list a supported hangup operation, so ActionBridge does not claim active-call termination as an integration capability.

## Persistence boundary

The current hackathon build keeps recent history in browser `localStorage` so the product remains deployable without forcing a paid database. This is intentionally labeled **local history**, not an audit log. A production multi-user release should replace this adapter with authenticated Postgres/Supabase or another durable store and associate tasks/calls with a user identity.

## Product boundary

The current build intentionally does not auto-book, purchase, negotiate binding contracts, or perform unrelated consequential actions. Results are presented for human review.

## Deployment checklist

- Configure `CALLE_API_KEY` as a Vercel server environment variable.
- Configure a strong `ACTIONBRIDGE_APPROVAL_SECRET` in controlled live environments.
- Keep `CALLE_LIVE_ENABLED=false` for public/demo deployments.
- Keep `ACTIONBRIDGE_ALLOW_PROD_LIVE=false` for public/demo deployments.
- Configure `ACTIONBRIDGE_WEBHOOK_URL` only when terminal result delivery/correlation is required.
- Use the current CALL-E unsigned webhook model; validate `CALL-E-Event-Id` against the event body identifier.
- Run typecheck and production build.
- Use the public deployment as a no-call preview.
- Perform live CALL-E verification only from a deliberately controlled environment with both live gates enabled and the required recipient authorization/consent/compliance basis in place.
