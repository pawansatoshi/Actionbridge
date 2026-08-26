# ActionBridge

> **From intention to real-world action.**

**Website:** https://actionbridge.vercel.app

ActionBridge is a goal-driven phone-work orchestration product built for **CALL-E: Your Code Is Calling**. It turns a real-world goal into a controlled workflow: define the task, review the proposed action, explicitly authorize it in the UI, execute through CALL-E in a deliberately enabled environment, observe status/events, inspect the returned result and evidence, and keep consequential decisions under human control.

## Product surfaces

- **Command Center** — operating overview and control posture.
- **Task Workspace** — goal, recipient, region, locale, examples and explicit authorization.
- **Live Call Center** — call state, developer events, confidence and completion, with the current CALL-E API limitation on active-call termination made explicit.
- **Results & Evidence** — structured result, evidence and explicit human decision gate.
- **History** — recent outcomes stored locally in the browser for the no-database hackathon build.
- **Settings & Safety** — runtime safety boundaries and production configuration guidance.
- **Documentation** — product workflow, CALL-E integration and deployment model.

## Core workflow

`Goal → Validate → Authorize → CALL-E → Status + Events → Structured Result → Evidence → Human Decision`

The phone call is the execution layer, not the product gimmick. ActionBridge is designed for vendor coordination, appointment recovery, field operations, customer follow-up and other bounded workflows where software reaches a boundary that still requires a phone conversation.

## CALL-E integration

The application uses the current documented Developer API surfaces:

- `POST /v1/calls`
- `GET /v1/calls/{call_id}`
- `GET /v1/calls/{call_id}/events`
- terminal webhook delivery to the configured ActionBridge endpoint

CALL-E returns task status, structured results, completion confidence, evidence and developer-facing events. ActionBridge keeps provider credentials server-side and exposes only the minimum state required by the UI. The current public Developer API documentation does not list an active-call hangup operation, so ActionBridge does not claim or expose a hangup control.

## Safety and compliance boundaries

- Public/demo production stays in **no-call mode** unless `CALLE_LIVE_ENABLED=true` and `ACTIONBRIDGE_ALLOW_PROD_LIVE=true` are deliberately configured together.
- The UI requires an explicit confirmation flag before the execution endpoint will proceed, and the signed short-lived plan is bound to the exact goal, recipient, region and locale.
- Phone numbers are validated as E.164.
- Region and locale are validated against the current CALL-E supported list.
- Task size is bounded.
- A lightweight request rate limit is applied before a live call is created.
- The approval nonce is reused as the CALL-E idempotency key so replaying the same approved workflow does not intentionally create a second call.
- CALL-E credentials never reach client-side JavaScript.
- The agent is instructed to identify itself as AI and to respect required recording/transcription notices and consent.
- Emergency/safety-critical and high-risk medical, legal, financial, insurance, employment, housing, credit, education and government-benefit decision/advice workflows are outside the supported scope.
- No unrelated purchases, financial commitments, legal commitments or other consequential actions are authorized by the execution prompt.
- Webhook handling follows the current unsigned CALL-E delivery model by validating the event identifier against `CALL-E-Event-Id`; the webhook is an acknowledgement/correlation surface, while the status API remains the authoritative read path for the UI.

CALL-E's current terms place responsibility for recipient authorization, required notices/consents, recording/transcription legal basis, opt-outs and applicable telecommunications/privacy compliance on the caller.

## Persistence boundary

The hackathon deployment intentionally uses browser-local history so it can run without forcing a paid database. It is explicitly labeled **local history**, not a server audit log. `docs/supabase-schema.sql` defines the production task/call/audit model for a later authenticated Postgres/Supabase deployment.

A commercial multi-user release should add authenticated user identity, durable persistence, server-side audit records, policy controls and multi-candidate orchestration.

## Stack

- Next.js 15.5.21
- React 19
- TypeScript
- CALL-E Developer API
- GitHub Actions
- Vercel
- Node.js 24.x runtime

## Local development

```bash
npm install
cp .env.example .env.local
# configure server-side values
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
```

## Environment

```text
CALLE_API_KEY=
CALLE_BASE_URL=https://api.heycall-e.com
CALLE_LIVE_ENABLED=false
ACTIONBRIDGE_ALLOW_PROD_LIVE=false
ACTIONBRIDGE_APPROVAL_SECRET=
ACTIONBRIDGE_WEBHOOK_URL=
```

Never expose `CALLE_API_KEY` through a `NEXT_PUBLIC_*` variable.

## Hackathon status

The application contains a real server-side CALL-E integration. The public deployment is intentionally configured as a no-call preview so reviewers can inspect the planning, execution-state and verification surfaces without triggering an outbound call. Controlled live verification remains an opt-in environment step rather than a public-demo behavior.

## Engineering documents

- `docs/PRODUCT-BLUEPRINT.md` — product surface and workflow blueprint.
- `docs/ARCHITECTURE.md` — runtime architecture and production boundaries.
- `docs/QA-CHECKLIST.md` — verification checklist and known limitations.
- `docs/supabase-schema.sql` — optional durable production persistence schema.
