# ActionBridge

> **From intention to real-world action.**

ActionBridge is a goal-driven phone-work orchestration product built for **CALL-E: Your Code Is Calling**. It turns a real-world goal into a controlled workflow: define the task, authorize a call, execute through CALL-E, verify the result, inspect evidence, and keep consequential decisions under human control.

## Product surfaces

- **Command Center** — operating overview and active-task state.
- **Task Workspace** — goal, recipient, region, locale and explicit authorization.
- **Live Call Center** — live execution state, call ID, confidence and completion.
- **Results & Evidence** — structured result and evidence presentation.
- **History** — recent verified call outcomes and audit-oriented state.
- **Settings & Safety** — human approval, AI disclosure, server-side credentials and bounded execution controls.
- **Documentation** — product model, workflow and expansion path.

## Core architecture

`Goal → Planner → Authorization → CALL-E Orchestrator → Call State → Result Parser → Evidence → Human Decision`

The phone call is the execution layer, not the product gimmick. The product is designed for workflows such as vendor coordination, appointment recovery, field operations, customer follow-up and other tasks where software reaches a boundary that still requires a phone conversation.

## Safety boundaries

- Every real call requires explicit task-specific authorization.
- The agent is instructed to identify itself as an AI assistant.
- No purchases, financial commitments, legal commitments, or unrelated consequential actions are authorized by default.
- Phone numbers are validated as E.164.
- CALL-E credentials are server-side only.
- Requests use idempotency keys.
- Status is polled until a terminal state or a bounded retry limit.
- Results distinguish completion, confidence and evidence.

## Stack

- Next.js 15.5.21
- React 19
- TypeScript
- CALL-E Developer API
- GitHub Actions
- Vercel

## Local development

Requires Node.js 20.x and a CALL-E API key.

```bash
npm install
cp .env.example .env.local
# add CALLE_API_KEY to .env.local
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
```

## Environment

```text
CALLE_API_KEY=server-side-secret
CALLE_BASE_URL=https://api.heycall-e.com
```

Never expose `CALLE_API_KEY` through a `NEXT_PUBLIC_*` variable or client-side code.

## Hackathon compliance

The application is designed for genuine runtime CALL-E execution rather than a simulated voice demo. The final submission also requires the public demonstration and the required CALL-E community contribution/Devpost entry.

## Release checklist

- [x] Product concept and feasibility
- [x] Complete product roadmap and blueprint
- [x] Multi-surface responsive UI
- [x] CALL-E creation endpoint
- [x] CALL-E status endpoint
- [x] Explicit authorization
- [x] Structured results/evidence UI
- [x] Safety and server-side secret handling
- [x] Production Next.js security version
- [x] Pinned Node 20.x runtime
- [x] CI/typecheck/build configuration
- [ ] Real production CALL-E test with configured secret
- [ ] Final public demo recording
- [ ] CALL-E community PR (requires write permission to the upstream repository)
- [ ] Final Devpost submission

The last four items depend on external credentials/access and cannot be truthfully marked complete from source control alone.
