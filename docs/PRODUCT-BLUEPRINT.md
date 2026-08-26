# ActionBridge Product Blueprint

## North-star workflow

**Input → Understand → Authorize → Execute → Observe → Verify → Decide**

## Surfaces

### Command Center
- active task state
- latest verification state
- human-control posture
- product explanation

### Task Workspace
- goal and success criteria
- recipient E.164
- region
- language/locale
- quick-start templates
- explicit authorization checkbox
- AI/recording-transcription disclosure guidance
- execution plan

### Live Call Center
- call ID
- live status
- confidence
- task completion
- developer-facing events
- explicit indication that active-call termination is not supported by the current CALL-E API

### Results & Evidence
- completion state
- confidence
- strict structured result
- evidence
- explicit human decision gate

### History
- recent outcomes
- local persistence for hackathon deployment
- clear disclosure that it is not a server audit database

### Settings & Safety
- human approval posture
- AI disclosure
- server credential boundary
- bounded execution
- persistence limitation
- webhook configuration
- public no-call mode

### Documentation
- workflow explanation
- CALL-E integration explanation
- observation and verification model

## Backend blueprint

`/api/calls/prepare` — validate the task and produce a short-lived signed plan token; it does not call CALL-E.

`/api/calls` — create a validated, authorized CALL-E task when both deliberate live-call gates are enabled.

`/api/calls/[id]` — retrieve live/terminal status.

`/api/calls/[id]/events` — retrieve and normalize CALL-E developer-facing events.

`/api/calle/webhook` — receive and acknowledge terminal CALL-E webhook events after validating the event identifier.

## Deliberate scope boundary

A full commercial release should add authentication, durable database persistence, server-side audit logs, multi-candidate orchestration, comparison/ranking, durable approval records and enterprise policy controls. The public hackathon deployment also stays in no-call mode unless a controlled environment deliberately enables both live-call gates.
