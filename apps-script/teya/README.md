# Idiot-proof: Teya live pull → Windmill daily PDQ

**Goal:** On Windmill Daily Entry, a **Pull from Teya now** button fills PDQ 1 / 2 from live card sales.  
**No CSV.**  
**Trading day:** paperwork day **D** = sales from **D 5:00am → (D+1) 5:00am** UK.  
Example: yesterday’s paperwork (filled this morning) = **yesterday 5am → today 5am**.

Do the steps **in order**. Tick them off.

---

## STEP 1 — Get three secrets from Teya (once)

You need these (MID `5151716` alone is **not** enough):

| Name | What |
|---|---|
| `TEYA_CLIENT_ID` | OAuth client id |
| `TEYA_CLIENT_SECRET` | OAuth client secret |
| `TEYA_STORE_ID` | Store **UUID** (looks like `f04fe1ce-e7bd-…`, not `5151716`) |

Where to get them:

1. Open [partner.teya.com](https://partner.teya.com) (or whatever portal Teya gave you when you started API setup).  
2. Or email Teya support: *“Please send client id, client secret, and store UUID for Windmill MID 5151716 so we can call POSLink payment-requests.”*  
3. Keep them in a password manager. **Do not put them in GitHub.**

Stop here until you have all three. The button cannot work without them.

---

## STEP 2 — Replace PubSystemLib `Teya.gs`

1. Open this file in a browser (select all → copy):  
   https://github.com/charlesknew-alt/kinfold-owner/blob/cursor/teya-daily-prefill-ba46/apps-script/teya/Teya.gs  
2. Open PubSystemLib:  
   https://script.google.com/d/1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU/edit  
3. Left list → **`Teya.gs`** (or `Teya.js`) → select **all** → Delete.  
4. Paste the GitHub file.  
5. Top of file must say **`v5`** and mention **5:00**.  
6. **Save** (Ctrl+S / disk icon).

---

## STEP 3 — One line in `Templates_Serve.js` (still PubSystemLib)

1. Open **`Templates_Serve.js`**.  
2. Ctrl+F: `serveDailyEntryForm`  
3. Find:

```js
return _wrap(_applyBranding(DAILY_FORM_HTML, cfg, params), cfg, 'Daily Entry');
```

4. Change it to:

```js
return _wrap(_applyBranding(teyaInjectDailyPrefill_(cfg, DAILY_FORM_HTML), cfg, params), cfg, 'Daily Entry');
```

5. **Save.**  
   (Leave `_mergeConfig` / `mergeConfig_` as already written — only change the `DAILY_FORM_HTML` part.)

---

## STEP 4 — New library version

1. In PubSystemLib: **Deploy** → **New version** (or Manage versions → New).  
2. Description: `Teya live PDQ pull 5am-5am`.  
3. **Write down the version number** (example: 63).

---

## STEP 5 — Pin Windmill to that version

1. Open Windmill takings:  
   https://script.google.com/d/1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO/edit  
2. Left → **Libraries** → **PubSystemLib**.  
3. Set **Version** to the number from Step 4 (not an old one).  
4. Save.

Optional: same pin on Eight Bells. EB has Teya off, so no button there.

---

## STEP 6 — Windmill `Code.js` wrappers

In Windmill **`Code.js`**, near `getDayData` / `saveDayData`, you should already have `teyaDayTotalsFromCsv`.  

**Also add these two** (if missing):

```js
function teyaPullDayTotals(dayKey) {
  return PubSystemLib.teyaPullDayTotals(VENUE_CONFIG, dayKey);
}
function teyaListTerminals() {
  return PubSystemLib.teyaListTerminals(VENUE_CONFIG);
}
```

**Save.**  
Do **not** create a new web-app `/exec` URL.

---

## STEP 7 — Put secrets in Windmill Script properties

Still in **Windmill** project:

1. **Project Settings** (gear) → **Script properties**.  
2. Add three rows:

| Property | Value |
|---|---|
| `TEYA_CLIENT_ID` | *(from Step 1)* |
| `TEYA_CLIENT_SECRET` | *(from Step 1)* |
| `TEYA_STORE_ID` | *(store UUID from Step 1)* |

3. Save.

---

## STEP 8 — Map the two card machines (once)

1. In Windmill editor, top dropdown → choose function **`teyaListTerminals`**.  
2. Click **Run**. Authorise if asked.  
3. Open **Executions** (or View → Logs) → copy the terminal id(s).  
4. Back in Script properties, add:

| Property | Value |
|---|---|
| `TEYA_PDQ1_TERMINAL_IDS` | id for Channel A / PDQ Terminal 1 |
| `TEYA_PDQ2_TERMINAL_IDS` | id for Channel B / PDQ Terminal 2 |

If there are exactly two terminals and you skip this, the code auto-assigns them.

---

## STEP 9 — Test

1. Open Windmill **Daily Entry** (manager hub or spreadsheet menu).  
2. Select the day you’re filling (usually **yesterday**).  
3. In **Cash & Cards**, above PDQ Terminal 1, you should see **Pull PDQ from Teya**.  
4. Click **Pull from Teya now**.  
5. PDQ 1 / 2 fill from sales **5am that day → 5am next day** UK.  
6. Check the numbers → enter Rooms if needed → **Save**.

### If it fails

| Message | What to do |
|---|---|
| Missing Teya API credentials | Step 7 |
| OAuth token HTTP 4xx | Wrong client id/secret (Step 1 / 7) |
| HTTP 403/404 on payment-requests | Wrong `TEYA_STORE_ID` |
| No successful Teya sales | Wrong day, or terminals not mapped (Step 8), or ask Teya if SoftPOS taps appear in POSLink |
| Button missing | Step 3 not saved, or library version not pinned (Steps 4–5) |
| `teyaPullDayTotals` is not a function | Step 6 wrapper missing |

---

## Do not

- Do not create a **new** `/exec` deployment.  
- Do not paste secrets into GitHub.  
- Do not expect midnight–midnight totals — it is always **5am–5am**.
