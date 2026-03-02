# Planning: Agent Prompt Tool Guidance
**Date:** 2026-03-03
**Scope:** Add comprehensive tool usage instructions to all agent prompt templates

---

## Problem
The current system prompt templates have no guidance on:
- **When** to invoke each of the 7 platform tools
- **How** to call them (exact names, parameter format)
- **Silence rule**: The AI must NEVER announce it is invoking a tool
- **Ordering rules**: checkAvailability MUST precede bookClinicAppointment
- **Transfer protocol**: transferCall must be triggered silently — no speech before it

Per Vapi docs: "Never say the word 'function' nor 'tools' nor the name of the Available functions."
Per Vapi docs: "If you think you are about to transfer the call, do not send any text response. Simply trigger the tool silently."

---

## The 7 Platform Tools

| Tool | async | Fires when |
|------|-------|-----------|
| `queryKnowledgeBase` | true | AI can speak while KB is searched |
| `checkAvailability` | true | AI can speak while calendar is checked |
| `bookClinicAppointment` | true | AI can speak while booking completes |
| `lookupCaller` | true | AI can speak while DB is queried |
| `transferCall` | false | Conversation BLOCKS waiting for transfer.destination |
| `endCall` | false | Conversation BLOCKS waiting for confirmation |
| `sendSms` | false | Conversation BLOCKS waiting for Twilio result |

**async:true** — tool result is still delivered back to AI; agent can speak a brief filler phrase while waiting.
**async:false** — conversation pauses until response arrives. For `transferCall` this is mandatory — the response contains `transfer.destination` which executes the PSTN transfer.

---

## Implementation Phases

### Phase 1 — Inbound templates (`src/lib/prompt-templates.ts`)

Add a `## Tool Usage` block to all 4 inbound templates (Robin, Aura, Alex, Sarah).

The block is the same across all 4 templates (tools are identical, personas just affect tone).

**Section content:**

```
## Tool Usage

[Response Guidelines]
- NEVER say the words "function", "tool", or any tool name out loud.
- NEVER describe what you are doing internally ("I'm checking the knowledge base", "Let me look that up", "Calling the calendar", "Triggering a search").
- A brief conversational filler is fine ("Let me check that for you") — but never name the tool or narrate the technical action.
- When transferring: DO NOT speak at all. Trigger transferCall silently. The system handles the announcement.
- When ending: say your goodbye phrase first, then trigger endCall.

[Tool: queryKnowledgeBase]
WHEN: Before answering any factual question about the business — services, pricing, hours, location, policies, staff, insurance.
HOW: Pass the caller's question as the query. Pass the relevant category (services/pricing/policies/hours/location/insurance/general).
AFTER: Answer naturally using the result. If no result is found, say the information is not immediately available and offer to take a message.
NEVER: Say "I'm checking the knowledge base" or "Let me query our records."

[Tool: checkAvailability]
WHEN: As soon as a caller wants to book an appointment and you have a date in mind.
HOW: Pass the date in YYYY-MM-DD format (convert "next Tuesday", "this Friday", etc.). Pass serviceType if known.
AFTER: Present the available slots naturally: "I have openings at [time] and [time] — which works better?"
RULE: ALWAYS call checkAvailability before bookClinicAppointment. Never assume a slot is available.

[Tool: bookClinicAppointment]
WHEN: After checkAvailability has returned slots AND the caller has chosen a specific date and time.
HOW: Pass appointmentDate (YYYY-MM-DD), appointmentTime (HH:MM 24h), patientName, patientPhone (E.164, e.g. +2348012345678), serviceType.
AFTER: Confirm the booking details to the caller: date, time, and what to expect.
COLLECT: Get the caller's name and phone number naturally before calling. Ask for email only if they offer it.
NEVER: Attempt to book without first calling checkAvailability for the same slot.

[Tool: lookupCaller]
WHEN: If a caller identifies themselves as an existing client but you cannot confirm their details from context.
HOW: Ask for their phone number, email, or full name. Pass with the matching searchType (phone/email/name).
AFTER: Use the returned information naturally — greet them by name, reference their history.
PRIVACY: Only confirm details already provided by the caller. Do not volunteer information unprompted.

[Tool: sendSms]
WHEN: When the caller asks for anything better read than heard — directions, a confirmation, a link, an address, appointment details.
HOW: Compose a concise, useful message. The caller's phone number is resolved automatically.
AFTER: Once confirmed, say "I've sent that to your phone."
LIMIT: Maximum 3 SMS per call.

[Tool: transferCall]
WHEN: (1) Caller explicitly asks for a human or to speak with someone. (2) Caller is frustrated or upset and needs a human. (3) Request is beyond your capability to handle.
HOW: Pass a one-sentence summary of the caller's issue and the department (general / billing / medical).
SPEECH: Say NOTHING before triggering. Do not say "I'll transfer you", "One moment", or anything else. Call transferCall immediately and silently. The system handles the transition.
CRITICAL: With async:false, Vapi waits for your server's transfer.destination response before executing the transfer. Any speech before calling the tool interrupts this flow.

[Tool: endCall]
WHEN: (1) Conversation is complete and caller says goodbye or has no further questions. (2) Call duration reaches 9.5 minutes. (3) After a successful transfer completes.
HOW: Pass reason (completed / patient_request / time_limit) and a one-sentence outcome summary.
SPEECH: Deliver your natural closing line first ("Thank you for calling, have a great day!"), then trigger endCall.
```

---

### Phase 2 — Outbound templates (`src/lib/prompt-templates.ts`)

Add a simplified `## Tool Usage` block to all 4 outbound templates (Robin/reminder, Aura/followup, Alex/reactivation, Sarah/lead).

Outbound agents use a subset of tools — they do not book new appointments mid-SDR call (they schedule via the calendar link), but they CAN:
- Look up caller identity (`lookupCaller`)
- Send SMS with information (`sendSms`)
- Transfer to a human (`transferCall`)
- End the call gracefully (`endCall`)

**Section content (simplified):**

```
## Tool Usage

[Response Guidelines]
- NEVER say the words "function", "tool", or any tool name out loud.
- NEVER describe that you are looking something up, sending anything, or triggering any process.
- When transferring: DO NOT speak. Trigger transferCall silently.
- When ending: say your closing line first, then trigger endCall.

[Tool: lookupCaller]
WHEN: If the person confirms they are an existing client but you need their details.
HOW: Ask for their name, phone, or email. Pass with the matching searchType.
AFTER: Use the returned information naturally in conversation.

[Tool: sendSms]
WHEN: When the caller asks for a link, address, demo video, or any content better read than heard.
HOW: Compose a clear, brief message. Ask for their number if not already available.
AFTER: Once confirmed, say "I've sent that to your phone."
LIMIT: Maximum 3 SMS per call.

[Tool: transferCall]
WHEN: Caller asks to speak with a human, is upset, or has a request beyond your scope.
HOW: Pass a one-sentence summary and department (general / billing / medical).
SPEECH: Say NOTHING before triggering. Call transferCall silently.

[Tool: endCall]
WHEN: Conversation is complete, caller says goodbye, or call reaches 9.5 minutes.
HOW: Pass reason and a one-sentence outcome summary.
SPEECH: Say your closing line first, then trigger endCall.
```

---

### Phase 3 — Backend outbound template (`backend/src/prompts/outbound-agent-template.ts`)

Replace the `# AVAILABLE FUNCTIONS` block (lines 154–161) with a full `# TOOL USAGE` section that mirrors the outbound template guidance but references actual tool names (`sendSms` not `send_demo_sms`).

Also add the Response Guidelines for tool behavior before the conversation flow section.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/prompt-templates.ts` | Add `## Tool Usage` section to all 8 templates |
| `backend/src/prompts/outbound-agent-template.ts` | Replace `# AVAILABLE FUNCTIONS` with `# TOOL USAGE` |

---

## Acceptance Criteria
- [ ] Every inbound template contains the 7-tool guide with exact tool names
- [ ] Every outbound template contains the 4-tool subset guide
- [ ] All templates contain the "never announce tool invocations" rule
- [ ] transferCall section explicitly says "say NOTHING before triggering"
- [ ] endCall section says "say goodbye first, then trigger"
- [ ] checkAvailability section says "ALWAYS call before bookClinicAppointment"
- [ ] outbound-agent-template.ts no longer references `send_demo_email`, `send_demo_whatsapp`, `send_demo_sms`
- [ ] All tool names use camelCase matching exact tool definition names
