# TechnicalSupport_Reporting

Portside — Maritime T2 Documentation

A responsive internal documentation workspace built with Next.js App Router, TypeScript, Tailwind CSS, Lucide, React Markdown, and jsPDF.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Add an API key and model in **API & Ping Settings**, paste a Slack thread (or try the example), review the metadata and extracted timestamps, then generate documentation.

```sh
npm run typecheck
npm test
npm run build
```

## Behavior

- The full supplied maritime Skill is the default. Upload Markdown/text, edit, reset, and **Save & activate**. Every request uses the active saved Skill in the provider's system instruction field.
- Tickets, settings, Skill, and reminder deadlines persist in this browser's localStorage. No database or account is required. JSON backup/restore includes tickets and the active Skill, excluding API keys. Restore requires reviewing a replacement confirmation.
- OpenAI, Gemini, and Anthropic are supported through `/api/generate`. API keys are forwarded to the selected provider, are not logged or stored by the server, and remain in plaintext browser storage. Use a trusted machine and HTTPS outside localhost. Set a model ID supported by your account.
- Manager name detection is a conservative local alert heuristic; the AI report determines actual directives. Or is detected as a mention or author rather than the ordinary conjunction. Review generated notes before using them.
- Timestamp extraction supports ISO date headers and 12/24-hour times, including overnight rollover. Time-only threads use today's local date and explicitly ask for review. Work window elapsed time is not a timesheet or a measure of active labor.
- Reminders use browser notifications, an audio chime, and in-app toasts. Keep the app open for timely alerts; background throttling can delay them. Overdue saved reminders fire on reopening. No service worker or closed-browser push delivery is claimed.
- TXT retains the generated Markdown. PDF uses built-in Helvetica with ASCII-safe text and automatic page breaks, so decorative emoji/non-Latin characters are omitted. No provider call is required for exports.

The server route is intended for this internal workspace. Put authentication and rate limits in front of it before exposing a hosted instance broadly. There are no live API tests without a user-supplied provider key.
