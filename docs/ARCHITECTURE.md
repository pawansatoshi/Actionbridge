# ActionBridge Architecture

## Runtime flow

`Goal → Validation → Explicit Authorization → CALL-E → Status/Events → Structured Result → Evidence → Human Decision`

## Safety controls

1. `CALLE_LIVE_ENABLED` is a server-side kill switch. It defaults to `false`.
2. Every call request must contain explicit task authorization.
3. Requests are bounded to a validated E.164 recipient, locale and task length.
4. The server applies a lightweight per-origin request limit.
5. Each workflow receives a unique idempotency key.
6. CALL-E credentials never reach client-side code.
7. Active calls can be stopped through the server-side hangup route.
8. Terminal results can be delivered through the webhook receiver.

## CALL-E surfaces used

- `POST /v1/calls`
- `GET /v1/calls/{call_id}`
- `GET /v1/calls/{call_id}/events`
- `POST /v1/calls/{call_id}/hangup`
- terminal webhook via `POST /api/calle/webhook`

CALL-E documents its Developer API as supporting creation, result retrieval, developer-facing events and terminal webhooks. The application uses those documented surfaces rather than inventing a browser-side calling protocol.

## Persistence boundary

The current hackathon build keeps recent history in browser `localStorage` so the product remains deployable without forcing a paid database. This is intentionally labeled **local history**, not an audit log. A production multi-user release should replace this adapter with authenticated Postgres/Supabase or another durable store and associate tasks/calls with a user identity.

## Product boundary

The current build intentionally does not auto-book, purchase, negotiate binding contracts, or perform unrelated consequential actions. Results are presented for human review.

## Deployment checklist

- Configure `CALLE_API_KEY` as a Vercel server environment variable.
- Keep `CALLE_LIVE_ENABLED=false` until a controlled live test is ready.
- Configure `ACTIONBRIDGE_WEBHOOK_URL` to the deployed `/api/calle/webhook` endpoint.
- Configure `CALLE_WEBHOOK_SECRET` and the matching provider-side secret if supported.
- Run typecheck and production build.
- Perform one controlled live call with a test recipient.
- Verify status, events, structured result, evidence and hangup behavior.
