# Phase 1 QA — 16 November 2026

## Result

Production build and TypeScript checks pass. Six tests pass. **Live Gemini generation passed for both QA tickets** using `gemini-3.5-flash-lite`. Copy, TXT/PDF exports, and generated-summary persistence passed. Earlier OpenAI attempts returned HTTP 429. No credentials are included in this report.

## Test tickets created in the user's browser

- **QA TEST — MV Harbor Light**: installation, Pending SE; distinct overseer/SE/T2 participants; Nadav approval; missing license and pending reboot; reviewed technical window 09:15–10:15 (1 hour).
- **QA TEST — MV Overnight**: completed maintenance; 15–16 November overnight timestamps; the ordinary conjunction “or” produces no manager alert; reviewed technical window 23:45–00:20 (35 minutes).

These are synthetic source threads, clearly labeled QA TEST. Both now have real Gemini-generated summaries saved in the user's browser. Existing user tickets were preserved. Test follow-up timers were canceled after checking persistence.

## Verified

- Ticket creation, metadata edits, status changes, saved-ticket search and status filter.
- Ticket and reminder persistence after reload.
- Automatic timestamp extraction, overnight rollover, duration recalculation.
- Manager alert on Nadav; no false manager alert for the conjunction “or”.
- Missing-key generation validation and local ping toast.
- Previous isolated browser checks verified active Skill editing/persistence, exact active Skill in the generation request, rendered summary, TXT/PDF downloads, JSON backup excluding keys, and mobile navigation without horizontal overflow. Those generation checks used a mocked response, not a live provider.
- The API route rejects missing required request fields with HTTP 400.
- Real OpenAI requests reach the provider after launching Node with the Windows certificate store and network access. Provider HTTP 429 errors appear in the app without losing the ticket or leaving generation stuck.
- Live Gemini installation report correctly isolated Nadav's directive, classified all three engineering/business roles, used the reviewed one-hour technical window, and recommended the requested 30-minute follow-up.
- Live Gemini maintenance report correctly identified no manager directives, preserved the two-day date range and 35-minute technical duration, marked the ticket Completed, and reported no open action items.
- Copy text placed the generated report in the clipboard. TXT and PDF downloads passed for both live reports. PDF text extraction confirmed report sections and expected directive/duration values; both PDFs are one-page A4 files.
- Reloading retained the generated maintenance summary. Gemini is saved as the selected provider, with the tested model ID.

## Fixed during QA

Manual datetime edits could revert during browser interaction because the input event did not update React state. Both date fields now synchronize on input as well as change. Retesting confirmed the edited start time stays saved and recalculates duration from 40 to 35 minutes. The production build passes after this fix.

Provider errors now distinguish known exhausted-quota codes, rate limits, invalid keys, permission failures, and unavailable models. Two additional tests verify quota/rate-limit classification and that arbitrary provider error text is not reflected into the interface.

The default Gemini model was updated to the successfully tested `gemini-3.5-flash-lite`.

## Remaining coverage and limitations

OpenAI generation remains blocked by its provider-side 429 response. Anthropic was not tested with a live key. Actual OS notification delivery depends on browser permission; only the local test toast and reminder state were verified in the user's browser. Gemini free-tier testing used synthetic content only. The current PDF exporter omits decorative emoji and non-ASCII characters from report text; TXT preserves the complete Markdown.
