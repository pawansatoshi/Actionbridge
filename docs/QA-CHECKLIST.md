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
- [x] Strict structured result schema
- [x] Idempotency key
- [x] Status polling
- [x] Developer events endpoint
- [x] Terminal webhook endpoint
- [x] Active-call hangup endpoint
- [x] Live-call kill switch

## Security
- [x] E.164 validation
- [x] Locale validation
- [x] Task length validation
- [x] Explicit authorization gate
- [x] Server-only API secret
- [x] Basic request rate limiting
- [x] Webhook secret support
- [x] Production live-call feature flag

## Remaining environment verification
- [ ] `npm ci` with a regenerated lockfile
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Vercel deployment READY
- [ ] `CALLE_LIVE_ENABLED=true` controlled test
- [ ] Verify real CALL-E event payloads against the deployed endpoint
- [ ] Verify terminal webhook delivery
- [ ] Verify hangup on an active call
- [ ] Verify production database/auth if moving beyond hackathon-local history

## Known intentional limitation
Browser-local history is not a multi-user audit database. It is clearly labeled in the UI and documentation so the product does not claim a persistence capability it does not have.
