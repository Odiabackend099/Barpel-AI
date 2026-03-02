# planning.md — Full Platform QnA Test Suite

**Date:** 2026-03-04
**Methodology:** QnA Agent Skill (real credentials, real JWT, real backend)
**Auth:** cto@barpel.ai / Eguale@2021?
**org_id:** 17a9dc94-3ed0-448b-bd44-f527eadb5317

---

## Phase 1: Infrastructure
- [ ] Verify backend running on 8001
- [ ] Start ngrok on 8001 (get public URL)
- [ ] Update Vapi assistant serverUrl to ngrok URL (so webhooks reach local backend during live calls)

## Phase 2: Knowledge Base
- [ ] Get JWT
- [ ] Upload test knowledge base document (text content via API)
- [ ] Verify DB row created in knowledge_base_chunks or knowledge_base table
- [ ] Test retrieval: POST /api/vapi/tools/queryKnowledgeBase with a question

## Phase 3: Phone Provisioning
- [ ] List available Twilio numbers (check TWILIO_MASTER creds)
- [ ] Provision inbound number (POST /api/managed-telephony/provision or onboarding flow)
- [ ] Provision outbound number
- [ ] Verify org_credentials + managed_phone_numbers dual-write

## Phase 4: Vapi + Live Tool Test
- [ ] Confirm 7 tools in org_tools (enabled=true, vapi_tool_id populated)
- [ ] POST /api/founder-console/agent/web-test → browser call
- [ ] Verify inline assistant has toolIds
- [ ] Ask agent "What day is it today?" → time awareness check
- [ ] Ask agent "Check availability for tomorrow" → checkAvailability fires
