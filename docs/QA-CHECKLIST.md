# ActionBridge QA Checklist

## Product
- [x] Command Center
- [x] New Task
- [x] Live Calls
- [x] Results & Evidence
- [x] History (explicitly browser-local)
- [x] Settings & Safety
- [x] Documentation
- [x] Mobile navigation
- [x] Quick-start task examples

## CALL-E
- [x] Server-side API integration
- [x] Strict task-level structured result schema
- [x] Recipient-level structured result schema
- [x] Idempotency key derived from the signed workflow nonce
- [x] Status polling
- [x] Developer events endpoint normalized to the UI contract
- [x] Terminal webhook endpoint with current unsigned event-id validation
- [x] Public no-call production gate
- [x] Active-call termination explicitly treated as unsupported by the current CALL-E Developer API

## Security and compliance
- [x] E.164 validation
- [x] Region/locale pairing validation against the current CALL-E supported list
- [x] Task length validation
- [x] Signed short-lived plan token
- [x] Server-only CALL-E API secret
- [x] Basic request rate limiting
- [x] Dedicated `ACTIONBRIDGE_APPROVAL_SECRET` supported for controlled live environments
- [x] Production live-call feature flag
- [x] Additional public-production live-call gate
- [x] AI disclosure requirement in execution prompt
- [x] Recording/transcription notice and consent/legal-basis requirement documented
- [x] Emergency/safety-critical and high-risk decision/advice categories blocked

## Verification status

The following must be checked again after the latest repository changes and should not be marked complete from documentation alone:

- [ ] GitHub Actions `typecheck` passes on the latest main commit
- [ ] GitHub Actions `build` passes on the latest main commit
- [ ] Vercel production deployment reaches READY on the latest main commit
- [ ] Public demo remains no-call by default
- [ ] Browser task planning works on desktop
- [ ] Browser task planning works on mobile
- [ ] CALL-E event list renders returned `data` entries
- [ ] A controlled live CALL-E call completes successfully with the current API contract
- [ ] Terminal webhook delivery is received and event-id validation passes

## Controlled live verification

- [ ] Enable both live gates in a controlled environment
- [ ] Configure a strong `ACTIONBRIDGE_APPROVAL_SECRET`
- [ ] Use a recipient/number for which the caller has the required authorization, notices and consent/legal basis
- [ ] Execute one authorized CALL-E test call
- [ ] Verify real CALL-E event payloads against the deployed endpoint
- [ ] Verify terminal webhook delivery
- [ ] Reconcile returned structured result, completion confidence and evidence
- [ ] Confirm that no duplicate call is created when the same approved workflow is retried

## Known intentional limitations

- Browser-local history is not a multi-user audit database.
- The current public demo intentionally does not place live calls.
- The current CALL-E public Developer API does not expose a supported hangup operation, so ActionBridge does not claim active-call termination.
- The current webhook receiver acknowledges/correlates terminal events but does not replace the status API as the authoritative read path.
