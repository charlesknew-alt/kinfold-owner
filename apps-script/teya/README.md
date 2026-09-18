# Teya → Windmill daily PDQ — idiot-proof steps

Do these in order. Stop after each step if something looks wrong.

**You only touch two Apps Script projects:** PubSystemLib + Windmill takings.  
Do **not** create a new web-app deployment. Pinning a new library version is enough (same lesson as the owner `shell=owner` fix).

---

## Step 0 — Open the right files from GitHub

On your PC, open this PR branch file (or download raw):

- `apps-script/teya/Teya.gs`  
  https://github.com/charlesknew-alt/kinfold-owner/blob/cursor/teya-daily-prefill-ba46/apps-script/teya/Teya.gs

Keep it open in a browser tab. You will copy **all** of it.

---

## Step 1 — Replace PubSystemLib `Teya.gs`

1. Open PubSystemLib:  
   https://script.google.com/d/1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU/edit
2. In the left file list, click **`Teya.gs`** (or `Teya.js` — same file).
3. Select **all** existing text → Delete.
4. Paste the **entire** contents of `apps-script/teya/Teya.gs` from GitHub.
5. **Ctrl+S** / Save.  
   Top of the file should now say `Teya.gs (v3)` and include `teyaInjectDailyPrefill_`.

---

## Step 2 — One-line change in `Templates_Serve.js`

Still in **PubSystemLib**:

1. Open **`Templates_Serve.js`**.
2. Find this function (Ctrl+F: `serveDailyEntryForm`):

```js
function serveDailyEntryForm(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(DAILY_FORM_HTML, cfg, params), cfg, 'Daily Entry');
}
```

3. Change **only** the `return` line to:

```js
function serveDailyEntryForm(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(teyaInjectDailyPrefill_(cfg, DAILY_FORM_HTML), cfg, params), cfg, 'Daily Entry');
}
```

4. Save.

(If `_mergeConfig` is named `mergeConfig_` in your file, leave that as-is — only change the `DAILY_FORM_HTML` part to wrap it with `teyaInjectDailyPrefill_(cfg, …)`.)

---

## Step 3 — New PubSystemLib library version

1. In PubSystemLib: **Deploy** → **New version** (or Manage versions → New).
2. Description: `Teya CSV daily PDQ prefill`.
3. **Write down the version number** (e.g. 63).

---

## Step 4 — Pin Windmill to that version

1. Open Windmill takings:  
   https://script.google.com/d/1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO/edit
2. Left sidebar → **Libraries** → **PubSystemLib**.
3. Change Version to the number from Step 3 (not HEAD unless you always use HEAD).
4. Save.

Optional but tidy: do the same pin on Eight Bells takings  
(`1fca4JFXwFDJQ-Y8xqvobcw85eGfyIn-khndOTNlQ2CWrdQl3LRBcW_Pr`). EB has `TEYA_ENABLED: false`, so the dropzone will not appear there.

---

## Step 5 — Add one wrapper in Windmill `Code.js`

Still in **Windmill takings**, open **`Code.js`**.

Near the other wrappers (`getDayData` / `saveDayData`), paste:

```js
function teyaDayTotalsFromCsv(csvText, dayKey) {
  return PubSystemLib.teyaDayTotalsFromCsv(VENUE_CONFIG, csvText, dayKey);
}
```

Save.

(This is required — the browser calls `google.script.run.teyaDayTotalsFromCsv`, which must exist on the **venue** project.)

---

## Step 6 — Check it works

1. Open Windmill daily entry the way managers normally do  
   (manager hub → daily, or spreadsheet menu **Daily Entry**).
2. In section **Cash & Cards**, **above** “PDQ Terminal 1”, you should see:  
   **Prefill PDQ from Teya** + a file picker.
3. Export a Teya transaction CSV (same as Card Takings).
4. Drop / choose that CSV.
5. PDQ Terminal 1 and 2 should fill (Channel A → 1, Channel B → 2).
6. Check the numbers → click **Save** as usual.  
   **PDQ Rooms** is still manual.

If the box is missing: library version not pinned, or Step 2 line not saved.  
If file pick fails with a function error: Step 5 wrapper missing.  
If numbers look wrong: confirm Device IDs still match `VENUE_CONFIG.TEYA_CHANNEL_LABELS` (`oOj2CqaI` / `7KckI3g7`).

---

## Do NOT do these

- Do not create a **new** web-app `/exec` URL.
- Do not paste into Eight Bells `Code.js` unless you want the wrapper there too (unused).
- Do not set API secrets yet — that is the **next** step after CSV prefill works.

---

## Already done in Windmill config (no change needed)

```js
TEYA_ENABLED: true,
TEYA_MID: '5151716',
TEYA_CHANNEL_LABELS: {
  'oOj2CqaI': 'Channel A',  // → pdq1
  '7KckI3g7': 'Channel B'   // → pdq2
}
```

---

## Next step (after this works)

Teya partner OAuth app → Script Properties `TEYA_CLIENT_ID` / `TEYA_CLIENT_SECRET` / `TEYA_STORE_ID` → live `fetchTeyaTransactions` instead of CSV.
