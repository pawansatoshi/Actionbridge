# ActionBridge

> **From intention to real-world action.**

ActionBridge is a goal-driven phone-work orchestration product built for **CALL-E: Your Code Is Calling**. It turns a real-world goal into a controlled workflow: define the task, authorize a call, execute through CALL-E, observe status/events, verify the result, inspect evidence, and keep consequential decisions under human control.

## Product surfaces

- **Command Center** — operating overview and control posture.
- **Task Workspace** — goal, recipient, region, locale, examples and explicit authorization.
- **Live Call Center** — call state, developer events, confidence, completion and controlled hangup.
- **Results & Evidence** — structured result, evidence and explicit human decision gate.
- **History** — recent outcomes stored locally in the browser for the no-database hackathon build.
- **Settings & Safety** — runtime safety boundaries and production configuration guidance.
- **Documentation** — product workflow, CALL-E integration and deployment model.

## Core workflow

`Goal → Validate → Authorize → CALL-E → Status + Events → Structured Result → Evidence → Human Decision`

The phone call is the execution layer, not the product gimmick. ActionBridge is designed for vendor coordination, appointment recovery, field operations, customer follow-up and other workflows where software reaches a boundary that still requires a phone conversation.

## CALL-E integration

The application uses the documented Developer API surfaces:

- `POST /v1/calls`
- `GET /v1/calls/{call_id}`
- `GET /v1/calls/{call_id}/events`
- `POST /v1/calls/{call_id}/hangup`
- terminal webhook receiver at `/api/calle/webhook`

CALL-E's public integration documentation describes live task progress, structured results, events, transcripts and terminal webhooks. ActionBridge keeps those calls server-side and exposes only the minimum state required by the UI.

## Safety boundaries

- Live calling is disabled unless `CALLE_LIVE_ENABLED=true` is deliberately configured.
- Every call requires task-specific authorization from the UI.
- Phone numbers are validated as E.164.
- Region and locale are validated.
- Task size is bounded.
- A lightweight request rate limit is applied before a live call is created.
- Each workflow receives an idempotency key.
- CALL-E credentials never reach client-side JavaScript.
- The agent is instructed to identify itself as AI.
- No purchases, financial commitments, legal commitments, or unrelated consequential actions are authorized by default.
- Active calls have a controlled server-side hangup route.
- Terminal webhook requests can be protected with `CALLE_WEBHOOK_SECRET`.

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
ACTIONBRIDGE_WEBHOOK_URL=
CALLE_WEBHOOK_SECRET=
```

Never expose `CALLE_API_KEY` through a `NEXT_PUBLIC_*` variable.

## Hackathon status

The application is a genuine runtime CALL-E integration rather than a simulated voice demo. The remaining external submission gates are the controlled live-call verification, public demo video, upstream CALL-E community PR and Devpost submission. These cannot be truthfully marked complete without the corresponding external credentials/access.

## Engineering documents

- `docs/PRODUCT-BLUEPRINT.md` — complete product surface and workflow blueprint.
- `docs/ARCHITECTURE.md` — runtime architecture and production boundaries.
- `docs/QA-CHECKLIST.md` — verification checklist.
- `docs/supabase-schema.sql` — optional durable production persistence schema.
