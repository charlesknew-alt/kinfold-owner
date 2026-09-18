# Idiot-proof: Teya Gmail → Windmill PDQ guide

Teya told you: **no API** for daily card sales. Reports come by **email**. This setup reads those emails and shows Channel A / B totals as a **guide only**.

**Important for managers:**
- Teya is **midnight to midnight** (00:00–23:59).
- Pubs sell a lot **after midnight**. Those sales sit on the **next** Teya calendar day.
- So the guide can disagree with what the card machines show for “last night”.
- **Always type PDQ 1 and PDQ 2 from the machines.** Use Teya as a check, not the final numbers.

Do these steps **in order**.

---

## STEP 1 — Confirm the emails (2 minutes)

In **your** Gmail (the same Google account that owns the Windmill Apps Script):

1. Search: `from:teya.com newer_than:14d`  
2. Open a recent **Your daily settlement report** (`reporting@teya.com`).  
3. Note the PDF attachment, e.g. `Teya_settlement_report_5151716_18.09.2026.pdf`

That PDF has **By sales channel** with device IDs:
- `oOj2CqaI` → Channel A → **PDQ 1 guide**
- `7KckI3g7` → Channel B → **PDQ 2 guide**

Use **Sales** by channel (gross), not the net “Settlement amount paid”.

In Teya Business Portal, confirm **daily settlement emails are ON** for this Gmail address.

---

## STEP 2 — Replace PubSystemLib `Teya.gs`

1. Open & copy **all** of:  
   https://github.com/charlesknew-alt/kinfold-owner/blob/cursor/teya-daily-prefill-ba46/apps-script/teya/Teya.gs  
2. Open PubSystemLib:  
   https://script.google.com/d/1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU/edit  
3. Open **`Teya.gs`** → select all → delete → paste → Save.  
4. Top must say **`v8`** and **guide** (and include `teyaPdfToText_` / `teyaMergeConfig_`).

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
Description: `Teya Gmail PDQ guide midnight-midnight`  
**Write down the version number.**

---

## STEP 5 — Pin Windmill + enable Drive (for PDF)

1. Open Windmill:  
   https://script.google.com/d/1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO/edit  
2. **Libraries** → PubSystemLib → pin Step 4 version → Save.  
3. Settlement reports are **PDF**: left sidebar **Services** → add **Drive API** → Save.

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
function teyaClearSeenMessages() {
  return PubSystemLib.teyaClearSeenMessages(VENUE_CONFIG);
}
```

Save. **No new `/exec` deployment.**

---

## STEP 7 — Authorise Gmail (once)

1. In Windmill editor, choose function **`teyaIngestEmails`**.  
2. Click **Run**.  
3. Review permissions → Allow **Gmail** and **Drive**.  
4. Check **Executions** / Logs: should say it ingested messages (or skipped already-seen).

---

## STEP 8 — Install the morning trigger (once)

1. Choose function **`teyaInstallEmailTrigger`**.  
2. **Run**.  
3. Should install a daily **06:30 Europe/London** job that calls `teyaIngestEmailsTrigger`.

---

## STEP 9 — Test on Daily Entry

1. Open Windmill **Daily Entry**.  
2. Select **yesterday** (usual morning paperwork).  
3. Above PDQ 1: **Teya card guide** → **Show Teya guide from email**.  
4. Guide figures appear with the midnight warning — **do not treat them as final**.  
5. Type PDQ 1 / 2 from the machines → **Save**. Rooms still manual.

Example guide from sample report (2026-09-17): Channel A ≈ **£474.30**, Channel B ≈ **£3,763.25**.

---

## If something fails

| Problem | Fix |
|---|---|
| Button missing | Steps 3–5 (inject + library pin) |
| `teyaPullDayTotals` not a function | Step 6 |
| Gmail / Drive permission error | Step 7 as the **owner** Google account |
| No guide for day | Step 1 emails; run `teyaIngestEmails`; wait for morning settlement PDF |
| Guide ≠ machines | Expected — midnight–midnight vs late pub trade; type machine readings |
| Drive OCR error | Step 5 enable Drive API |

---

## What you do **not** need

- Teya API client id / secret / store UUID  
- Manual CSV upload on the daily form (optional fallback still exists in Card Takings for viewing)
