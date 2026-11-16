export type Status = 'Active' | 'Pending SE' | 'Completed';
export type Ticket = { id: string; vessel: string; se: string; t2: string; overseer: string; type: 'Installation' | 'Maintenance'; status: Status; start: string; end: string; raw: string; summary: string; updatedAt: number; reminder: number | null };
export type Settings = { provider: 'openai' | 'gemini' | 'anthropic'; apiKey: string; model: string; sound: boolean; notifications: boolean };
export const DEFAULT_SETTINGS: Settings = { provider: 'openai', apiKey: '', model: 'gpt-4.1-mini', sound: true, notifications: false };
export const DEFAULT_SKILL = `# SKILL: MARITIME T2 SUPPORT & INSTALLATION DOCUMENTATION ENGINE

## 1. IDENTITY & PURPOSE
You are an internal Tier 2 (T2) Technical Support Documentation Analyst for maritime ship system installations and maintenance.
- Your job is to transform messy, raw Slack threads into clean, audit-ready technical documentation.
- **CRITICAL:** You DO NOT write replies to customers or chat messages. You only generate internal structured notes, timeline reports, and urgent alert flags for the T2 engineer.

## 2. ROLE CLASSIFICATION RULES (STRICT)
When reading the pasted Slack thread, classify every participant into one of these 4 buckets:
1. **OVERSEER / BUSINESS MANAGEMENT:** Whoever initiates the thread with commercial details, vessel schedules, scopes of work, or pre-installation files. *(Rule: Never label them as the SE or T2).*
2. **SE (System Engineer):** The field engineer physically working on the ship/hardware.
3. **T2 (Tier 2 Support):** The remote support specialist handling configuration, escalation, and documentation (the user of this app).
4. **MANAGERS (NADAV & OR):** Watch specifically for messages, tags, or reactions from **Nadav** or **Or**.

## 3. PRIORITY & ALERT TRIGGERS
Scan the thread for the following high-priority conditions:
- **MANAGER OVERRIDE:** Any instruction, scope change, deadline shift, or approval from **Nadav** or **Or** must be isolated at the very top of the report under \`🚨 MANAGER DIRECTIVES (NADAV / OR)\`.
- **PING / NOTIFICATION FLAGS:** Flag any unresolved blocker, pending reboot, missing license/hardware, or "waiting on SE/Vessel" state under \`🔔 ACTION ITEMS & PING ALERTS\` so the T2 engineer knows when to set a local follow-up reminder.

## 4. TIME & DURATION CALCULATION
- Extract the **Start Time** (earliest relevant technical/ticket message) and **Latest/End Time** (final message in the paste).
- Calculate the **Total Elapsed Time** (in hours and minutes). If dates span multiple days, note the exact date range.

## 5. REQUIRED OUTPUT FORMAT
Output the report using clean, scannable Markdown in this exact order:

### 🚨 MANAGER DIRECTIVES (NADAV / OR)
- *(Quote or summarize exact instructions from Nadav or Or. If none, write: "No manager directives in this thread.")*

### 📋 TICKET HEADER & METADATA
- **Vessel / Ship:** [Name or "Not Specified"]
- **Category:** [New Installation / Maintenance]
- **Overseer / Business Mgmt:** [Name(s)]
- **Field SE:** [Name(s)]
- **T2 Engineer:** [Name(s)]
- **Work Window:** [Start Date/Time] → [End Date/Time] (**Total Duration:** [X hrs Y mins])
- **Current Status:** [In Progress / Pending SE / Blocked / Completed]

### 🛠️ TECHNICAL SUMMARY & TIMELINE
- *(Concise, chronological bullet points of what happened: hardware installed, configs changed, errors found, and fixes applied. Strip out Slack fluff, greetings, and irrelevant chatter.)*

### 🔔 ACTION ITEMS & PING ALERTS
- *(Bullet list of what needs follow-up, who owns the next step, and recommended ping interval—e.g., "Ping SE in 30 mins to verify router reboot.")*`;
export function newTicket(): Ticket { return { id: crypto.randomUUID(), vessel: '', se: '', t2: '', overseer: '', type: 'Installation', status: 'Active', start: '', end: '', raw: '', summary: '', updatedAt: Date.now(), reminder: null }; }
export function duration(start: string, end: string) { if (!start || !end) return '—'; const m = Math.round((new Date(end).getTime()-new Date(start).getTime())/60000); return !Number.isFinite(m) || m < 0 ? 'Invalid window' : `${Math.floor(m/60)}h ${m%60}m`; }
export function detectAlerts(raw: string) {
  // OR is a name only when capitalized with mention/author context, never the conjunction.
  const manager = /\bnadav\b/i.test(raw) || /(?:@(?:Or|OR)\b|^\s*(?:Or|OR)(?:\s+[A-Z][a-z]+)?\s*(?:[:\-]|\[|\d)|^\s*(?:Or|OR)\s*$)/m.test(raw);
  const blocker = /\b(blocked|blocker|waiting (?:on|for)|pending reboot|missing (?:license|hardware)|unresolved)\b/i.test(raw);
  return { manager, blocker };
}
function localInput(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
export function extractTimes(raw: string, base = new Date()): {start: string; end: string; assumedDate: boolean} | null {
  const values: Date[] = []; let day = new Date(base.getFullYear(), base.getMonth(), base.getDate()); let explicit = false; let previous = -1;
  for (const line of raw.split('\n')) {
    const date = line.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (date) { day = new Date(+date[1], +date[2]-1, +date[3]); explicit = true; previous = -1; }
    const time = line.match(/(?:\b|T)(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?\b/i);
    if (!time) continue;
    let h = +time[1]; const m = +time[2]; if (m > 59 || h > 23 || (time[3] && (h < 1 || h > 12))) continue;
    if (time[3]) h = h%12 + (time[3].toUpperCase()==='PM'?12:0);
    const minute = h*60+m;
    if (!date && previous >= 18*60 && minute < 6*60) day.setDate(day.getDate()+1);
    const value = new Date(day); value.setHours(h,m,0,0); values.push(value); previous = minute;
  }
  if (!values.length) return null;
  return {start:localInput(new Date(Math.min(...values.map(d=>d.getTime())))),end:localInput(new Date(Math.max(...values.map(d=>d.getTime())))),assumedDate:!explicit};
}
export function validateTicket(value: unknown): value is Ticket {
  if (!value || typeof value !== 'object') return false; const t = value as Record<string,unknown>;
  return ['id','vessel','se','t2','overseer','start','end','raw','summary'].every(k=>typeof t[k]==='string') && ['Active','Pending SE','Completed'].includes(String(t.status)) && ['Installation','Maintenance'].includes(String(t.type)) && typeof t.updatedAt==='number' && Number.isFinite(t.updatedAt) && (t.reminder===null || (typeof t.reminder==='number' && Number.isFinite(t.reminder)));
}
