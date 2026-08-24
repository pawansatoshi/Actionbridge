# ActionBridge

> **From intention to real-world action.**

ActionBridge is a goal-driven phone-work orchestration application built for **CALL-E: Your Code Is Calling**. It converts a user's real-world phone task into a bounded workflow, executes the live conversation through CALL-E, verifies the result, and keeps consequential follow-up decisions under explicit human control.

## Why it exists

Many useful tasks fail at the boundary between software and the physical world: calling a service provider, confirming availability, collecting a quote, checking a status, or resolving an exception. ActionBridge is designed around that boundary rather than around generic conversational AI.

## Core workflow

1. **Define** — user states the goal, recipient, region and locale.
2. **Authorize** — a real call requires explicit, task-specific consent.
3. **Execute** — ActionBridge sends the bounded task to CALL-E.
4. **Verify** — the app polls the CALL-E call until it reaches a terminal state.
5. **Structure** — results are returned as a summary, facts, confidence and next step, plus CALL-E evidence.
6. **Decide** — consequential actions remain subject to human approval.

## Safety boundaries

- The agent is instructed to identify itself as an AI assistant.
- No purchases, financial commitments, legal commitments, or unrelated consequential actions are authorized by default.
- Phone numbers are validated as E.164 before a call is created.
- CALL-E credentials are server-side only.
- Requests use an idempotency key to make retries safer.
- The UI clearly distinguishes an in-progress call from a verified completion.

## Stack

- Next.js 15
- React 19
- TypeScript
- CALL-E API
- GitHub Actions CI

## Local development

Requirements: Node.js 20+ and a CALL-E account/API key.

```bash
npm install
cp .env.example .env.local
# add CALLE_API_KEY to .env.local
npm run dev
```

Then open `http://localhost:3000`.

Production verification:

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

CALL-E's official rules require a functional application using CALL-E at runtime, a public demonstration, and a pull request to the `awesome-phone-call-agents` repository. The project is therefore designed around genuine runtime CALL-E execution rather than a simulated voice demo.

## Demo story

The clearest demonstration is a service-coordination task: enter a recipient and a concrete goal, authorize the call, show the live status transition, and finish on the structured result/evidence view. This makes the problem, CALL-E integration and product value visible in one continuous flow.

## Status

**Production-ready MVP implementation on `feat/roadmap-complete`.**

Remaining external submission actions are intentionally outside the application code: deploy the branch to the chosen hosting provider, record the public demo, and submit the required CALL-E community PR and Devpost entry.
