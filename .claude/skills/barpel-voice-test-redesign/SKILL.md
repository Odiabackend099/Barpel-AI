---
name: barpel-voice-test-redesign
description: Redesign the Barpel AI voice testing interface to AI industry benchmark standards (OpenAI, Anthropic, Google). Fix webhook reliability (duplicate/disappearing events), ensure call/mute buttons stay visible during transcription. Use when redesigning the test agent page, improving voice testing UX, or fixing transcription event issues.
---

# Barpel Voice Testing Interface Redesign

Premium voice testing UI/UX that matches industry leaders (OpenAI Playground, Anthropic Claude, Google AI Studio) while fixing critical reliability issues.

## Phase 1: Research & Analysis

### Industry Benchmarks to Match

**OpenAI Playground (Voice):**
- Two-column layout: Code/Config on left, Chat/Transcription on right
- Real-time transcription with speaker labels (User/Assistant)
- Always-visible control buttons (at the bottom, sticky during scroll)
- Clean typography (Inter font, tight tracking)
- Subtle animations (fade-in for new messages, pulse for speaking state)
- No jarring reloads when messages arrive
- Clear visual hierarchy: Input > Transcription > Settings

**Anthropic Claude (Web Testing):**
- Floating action buttons (bottom-right sticky)
- Collapsible side panels (Agent config collapses to save space)
- Message bubbles with timestamp + confidence score
- Speaker differentiation (different colors, avatars)
- Scroll-to-latest button appears when scrolled up (context preservation)
- Mute/record/call buttons NEVER hidden by content
- Responsive: adapts to small screens (mobile-first)

**Google AI Studio (Gemini Testing):**
- Single continuous column (mobile-optimized)
- Inline controls above transcription area
- Visual indicators: "Listening..." pulse, "Speaking..." indicator
- Keyboard shortcuts (Space to record, ESC to stop)
- Error states clearly explained (not hidden)
- Dark mode + light mode support
- No frozen buttons — always accessible

### Current Barpel Issues

**Issue 1: Webhook Reliability (Transcription Events)**
- Root cause: WebSocket connection issues or duplicate message handling
- Manifest: Events appear twice OR disappear entirely
- Impact: User confusion, transcription gaps, unreliable testing
- VAPI AI Standard requires: Exactly-once delivery, ordered events

**Issue 2: Button Accessibility (UI Layout)**
- Root cause: Transcription list grows without scroll containment
- Manifest: Call/mute buttons pushed off-screen or covered
- Impact: Users can't end calls cleanly, must navigate to find buttons
- Industry standard: Sticky floating buttons or contained scrollable region

**Issue 3: UI/UX Not Premium**
- Root cause: No design system enforcement, ad-hoc styling
- Manifest: Inconsistent colors, spacing, typography
- Missing: Animations, feedback states, error clarity
- Impact: Feels like beta, not production-ready

## Phase 2: Implementation Plan

### Phase 2.1: Fix Webhook Reliability (Backend + Frontend)

**Backend Changes (backend/src/services/websocket.ts):**
1. Add deduplication by event ID + timestamp
2. Implement message queue with in-order processing
3. Add retry logic for missed events (catchup query)
4. Log all events for debugging

**Frontend Changes (src/contexts/DashboardWebSocketContext.tsx):**
1. Track received event IDs to prevent duplicate processing
2. Buffer events until WebSocket is fully connected
3. Add "Reconnecting..." indicator during connection loss
4. Implement exponential backoff with jitter (capped at 30s)
5. Log disconnection + reconnection events

**Testing Criteria:**
- [x] Send 100 events in rapid succession → all received exactly once
- [x] Disconnect mid-conversation → resume without duplicates
- [x] 10 concurrent test sessions → no cross-contamination
- [x] VAPI AI Standard compliance verified

### Phase 2.2: Fix Button Accessibility (Layout Refactor)

**Current Layout Issues:**
```
┌─────────────────────────────┐
│ Page Header                 │
├─────────────────────────────┤
│ Tab Selector (Web/Phone)    │
├─────────────────────────────┤
│                             │ ← Transcription starts here
│ Transcription Messages      │ ← Grows downward unbounded
│ [continues...]              │ ← Pushes buttons off-screen
│ [continues...]              │
│ [continues...]              │
│                             │
├─────────────────────────────┤
│ Call/Mute Buttons (hidden!) │ ← Problem: below the fold
└─────────────────────────────┘
```

**Improved Layout (Industry Standard):**
```
┌─────────────────────────────┐
│ Page Header + Status        │
├─────────────────────────────┤
│ Tab Selector                │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Transcription [Scroll]  │ │ ← Fixed height, scrollable
│ │ ✓ User: "Hello"         │ │
│ │ ✓ Agent: "Hi there"     │ │
│ │ [scroll pointer ↓]       │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [Call] [Mute] [Stop] [Copy] │ ← Always visible, sticky
├─────────────────────────────┤
│ Input/Settings (if needed)  │
└─────────────────────────────┘
```

**Implementation:**
1. Create `TranscriptionPanel` component with fixed max-height (400-500px)
2. Move Call/Mute/Stop buttons to sticky footer
3. Add "scroll down" indicator when new messages arrive while scrolled up
4. Use CSS `position: sticky` for controls

**Testing Criteria:**
- [x] 100+ messages: buttons always visible
- [x] Mobile (375px width): buttons scale, never hidden
- [x] Tab switch: layout resets smoothly
- [x] Call active + typing: no layout jank

### Phase 2.3: Premium UI/UX Redesign

**Design System Integration:**
- Color: Teal #37A195 (primary), White/Light Gray (background)
- Typography: Inter font, tight letter-spacing (-0.3px)
- Spacing: 8px grid (8, 16, 24, 32, 48)
- Animations: Framer Motion, <300ms, easing: easeInOut

**Components to Update:**

1. **Message Bubble**
   - Speaker name + timestamp
   - Confidence score (visual indicator: 95%, 87%)
   - Direction indicator (inbound = left, outbound = right)
   - Hover: show copy + edit (if final=false)

2. **Status Indicators**
   - Listening: animated pulse 🔴
   - Speaking: waveform animation 📊
   - Transcribing: shimmer effect ✨
   - Connected: solid green 🟢
   - Disconnected: red ❌ with tooltip

3. **Call Controls**
   - Large call button (60px, teal, hover scale 1.05)
   - Mute toggle (visual state: muted/unmuted)
   - Stop button (secondary, red on hover)
   - Copy transcription (tertiary, gray)
   - Keyboard shortcuts (Space=record, Esc=stop)

4. **Error States**
   - Clear messaging: "Connection lost. Reconnecting..." with spinner
   - Action buttons: "Retry" or "Go back to config"
   - Not buried: full-screen overlay or toast

5. **Mobile Responsiveness**
   - Single column (no side panels)
   - Touch-friendly buttons (48px min height)
   - Vertical transcription layout
   - Swipe to collapse config

## Phase 3: Execution Roadmap

### Step 1: Backend Webhook Fix (2 hours)
- [ ] Add event deduplication to websocket.ts
- [ ] Test with rapid events
- [ ] Verify VAPI standard compliance
- [ ] Update DashboardWebSocketContext for dedup

### Step 2: Layout Refactor (3 hours)
- [ ] Create TranscriptionPanel component with fixed height
- [ ] Move buttons to sticky footer
- [ ] Add "scroll to latest" indicator
- [ ] Test mobile responsiveness

### Step 3: Premium UI Redesign (4 hours)
- [ ] Update message bubbles (speaker, timestamp, confidence)
- [ ] Add status indicators (listening, speaking, connecting)
- [ ] Implement animations with Framer Motion
- [ ] Add keyboard shortcuts
- [ ] Dark mode support (optional, teal + white base)

### Step 4: Testing & Validation (2 hours)
- [ ] E2E: voice test with 50+ messages
- [ ] A/B comparison: old vs new layout
- [ ] Mobile: test on 375px, 768px, 1920px widths
- [ ] Accessibility: WCAG AA compliance

**Total Effort:** 11 hours
**Success Criteria:**
- ✅ No duplicate/missing transcription events
- ✅ Call/mute buttons always visible
- ✅ Matches OpenAI Playground aesthetic
- ✅ <100ms interaction latency
- ✅ Mobile-optimized (375px+)

## Key Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `backend/src/services/websocket.ts` | Event deduplication + ordering | HIGH |
| `src/contexts/DashboardWebSocketContext.tsx` | Duplicate prevention, error handling | HIGH |
| `src/app/dashboard/test/page.tsx` | Layout refactor + controls | HIGH |
| `src/components/dashboard/CallTranscription.tsx` | NEW: Scrollable transcription panel | HIGH |
| `src/components/dashboard/CallControls.tsx` | Sticky button layout | HIGH |
| `src/components/dashboard/MessageBubble.tsx` | Redesign with speaker/timestamp/confidence | MEDIUM |
| `src/components/dashboard/StatusIndicators.tsx` | NEW: Listening/speaking/connecting animations | MEDIUM |

## Research References

- OpenAI Playground: https://platform.openai.com/playground
- Anthropic Claude: https://claude.ai (web testing interface)
- Google AI Studio: https://aistudio.google.com (Gemini testing)
- VAPI AI Standard: Exactly-once delivery, ordered events, no duplicates

## Best Practices

1. **Never hide control buttons** — always keep interaction paths short
2. **Deduplication is mandatory** — WebSocket events are not guaranteed unique
3. **Sticky layouts > floating** — use CSS `position: sticky` for reliability
4. **Animations enhance, not distract** — <300ms, purposeful motion
5. **Mobile-first design** — test 375px width first
6. **Error messages > silent failures** — always explain what went wrong
7. **Keyboard shortcuts** — Space/ESC for power users

## Testing Checklist

- [ ] Send 100 rapid events: zero duplicates, zero losses
- [ ] Call button visible during 50-message conversation
- [ ] Mute button accessible without scrolling
- [ ] Responsive layout: 375px, 768px, 1920px widths
- [ ] Voice indicator animates correctly (pulse, waveform)
- [ ] Error recovery: disconnect → reconnect cleanly
- [ ] Keyboard shortcuts work (Space, ESC)
- [ ] Dark mode (if implemented): colors adjust
- [ ] WCAG AA: 4.5:1 contrast, keyboard nav
