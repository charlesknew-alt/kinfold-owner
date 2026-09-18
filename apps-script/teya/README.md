# Idiot-proof: Teya Gmail → Windmill daily PDQ

Teya told you: **no API** for daily card sales. Reports come by **email** (you already get them in Gmail). This setup reads those emails and fills PDQ 1 / 2.

**Trading day:** paperwork day **D** = sales **D 5:00am → (D+1) 5:00am** UK.  
Yesterday’s paperwork (filled this morning) = **yesterday 5am → today 5am**.

Do these steps **in order**.

---

## STEP 1 — Confirm the emails (2 minutes)

In **your** Gmail (the same Google account that owns the Windmill Apps Script):

1. Search: `from:teya.com newer_than:14d`  
2. Open a recent daily report.  
3. Note:
   - Sender (often `noreply@teya.com` or `reporting@teya.com`)
   - Subject (e.g. Daily Settlement Report)
   - Attachment type: **CSV** (best) or **PDF**

In Teya Business Portal, confirm **daily settlement / report emails are ON** for this Gmail address.

**Best case:** attachment is a **transaction CSV** (columns like Date, Time, Device ID, Status, Sales) — same as Card Takings.  
**PDF-only:** still works, but may only give a **grand total** (all on PDQ 1) unless the PDF lists Channel A/B. If so, ask Teya if they can attach CSV, or export Activity CSV to the same inbox.

---

## STEP 2 — Replace PubSystemLib `Teya.gs`

1. Open & copy **all** of:  
   https://github.com/charlesknew-alt/kinfold-owner/blob/cursor/teya-daily-prefill-ba46/apps-script/teya/Teya.gs  
2. Open PubSystemLib:  
   https://script.google.com/d/1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU/edit  
3. Open **`Teya.gs`** → select all → delete → paste → Save.  
4. Top must say **`v6`** and **Gmail**.

---

## STEP 3 — One line in `Templates_Serve.js` (PubSystemLib)

Find `serveDailyEntryForm` and set the return to:

```js
return _wrap(_applyBranding(teyaInjectDailyPrefill_(cfg, DAILY_FORM_HTML), cfg, params), cfg, 'Daily Entry');
```

Save.

---

## STEP 4 — New library version

PubSystemLib → **Deploy** → **New version**  
Description: `Teya Gmail PDQ ingest 5am-5am`  
**Write down the version number.**

---

## STEP 5 — Pin Windmill + enable Drive (for PDF)

1. Open Windmill:  
   https://script.google.com/d/1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO/edit  
2. **Libraries** → PubSystemLib → pin Step 4 version → Save.  
3. If reports are **PDF**: left sidebar **Services** (or +) → add **Drive API** → Save.  
   (CSV-only: you can skip Drive.)

---

## STEP 6 — Windmill `Code.js` wrappers

Paste these (keep any you already added):

```js
function teyaPullDayTotals(dayKey) {
  return PubSystemLib.teyaPullDayTotals(VENUE_CONFIG, dayKey);
}
function teyaIngestEmails() {
  return PubSystemLib.teyaIngestEmails(VENUE_CONFIG);
}
function teyaInstallEmailTrigger() {
  return PubSystemLib.teyaInstallEmailTrigger(VENUE_CONFIG);
}
function teyaIngestEmailsTrigger() {
  PubSystemLib.teyaIngestEmails(VENUE_CONFIG);
}
```

Save. **No new `/exec` deployment.**

---

## STEP 7 — Authorise Gmail (once)

1. In Windmill editor, choose function **`teyaIngestEmails`**.  
2. Click **Run**.  
3. Review permissions → Allow **Gmail** (and Drive if PDF).  
4. Check **Executions** / Logs: should say it ingested messages (or skipped already-seen).

If it errors on permissions, run again and accept all scopes.

---

## STEP 8 — Install the morning trigger (once)

1. Choose function **`teyaInstallEmailTrigger`**.  
2. **Run**.  
3. Should install a daily **06:30 Europe/London** job that calls `teyaIngestEmailsTrigger`.

(Triggers → check it appears.)

---

## STEP 9 — Test on Daily Entry

1. Open Windmill **Daily Entry**.  
2. Select **yesterday** (usual morning paperwork).  
3. Above PDQ 1: **Pull PDQ from Teya email** → click **Pull from Teya email**.  
4. PDQ 1 / 2 fill → check → **Save**. Rooms still manual.

---

## If something fails

| Problem | Fix |
|---|---|
| Button missing | Steps 3–5 (inject + library pin) |
| `teyaPullDayTotals` not a function | Step 6 |
| Gmail permission / auth error | Step 7 as the **owner** Google account |
| No data for trading day | Step 1 emails; run `teyaIngestEmails` again; wait for today’s morning report |
| PDF but no terminal split | Totals may all land on PDQ 1 — ask Teya for CSV attachment or export Activity CSV to this Gmail |
| Drive OCR error | Step 5 enable Drive API |

---

## What you do **not** need

- Teya API client id / secret / store UUID  
- Manual CSV upload on the daily form (optional fallback still exists in Card Takings for viewing)
