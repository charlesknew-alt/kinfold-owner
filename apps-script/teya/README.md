# Teya live API → Windmill daily PDQ

**No CSV.** Managers click **Pull from Teya now** on daily entry; Apps Script calls Teya’s POSLink API and fills PDQ 1 / 2.

You already have in Windmill `VENUE_CONFIG`:

```js
TEYA_ENABLED: true,
TEYA_MID: '5151716',
TEYA_CHANNEL_LABELS: {
  'oOj2CqaI': 'Channel A',  // short Device IDs from the portal CSV
  '7KckI3g7': 'Channel B'
}
```

`TEYA_MID` alone is **not** enough. The live list API needs:

| Script property | What it is |
|---|---|
| `TEYA_CLIENT_ID` | OAuth client id from Teya |
| `TEYA_CLIENT_SECRET` | OAuth client secret |
| `TEYA_STORE_ID` | Store **UUID** (not `5151716`) |

Optional (if auto-map / Channel labels don’t match API terminal UUIDs):

| Script property | What it is |
|---|---|
| `TEYA_PDQ1_TERMINAL_IDS` | Comma-separated terminal id(s) → PDQ 1 |
| `TEYA_PDQ2_TERMINAL_IDS` | Comma-separated terminal id(s) → PDQ 2 |

---

## A — Get Teya API credentials (do this once)

Teya’s realtime payment list is **POSLink**. Typical path:

1. Open the Teya developer / partner portal: [partner.teya.com](https://partner.teya.com) (or staging `partner.teya.xyz`).
2. Create / open your OAuth application (Device Code / partner app) → copy **Client ID** + **Client Secret**.
3. Connect the **Windmill** merchant Teya ID (same login as [business.teya.com](https://business.teya.com)).
4. List stores → copy the Windmill **store UUID** (`TEYA_STORE_ID`).
5. Register the ePOS / integration against that store if the portal asks you to (`POST /poslink/v1/epos/register`) — that often returns the M2M `client_id` / `client_secret` used for listing payments.
6. Keep the three values somewhere safe (password manager). **Do not commit them to GitHub.**

If you’re unsure which screen shows the store UUID: after code is deployed, run `teyaListTerminals` in the Windmill script editor (Step D) — it logs stores + terminals.

If Teya support helped you “start API setup” before, ask them for: **client id, client secret, store UUID** for MID `5151716`.

---

## B — Paste code (PubSystemLib + Windmill)

### B1. Replace PubSystemLib `Teya.gs`

1. Open https://script.google.com/d/1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU/edit  
2. Open **`Teya.gs`** (or `Teya.js`) → select all → delete.  
3. Paste **all** of [`Teya.gs`](./Teya.gs) from this folder (header says **v4**).  
4. Save.

### B2. One line in `Templates_Serve.js`

Find `serveDailyEntryForm` and make the return:

```js
return _wrap(_applyBranding(teyaInjectDailyPrefill_(cfg, DAILY_FORM_HTML), cfg, params), cfg, 'Daily Entry');
```

Save.

### B3. New library version

Deploy → New version → note the number (e.g. 63).

### B4. Pin Windmill

https://script.google.com/d/1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO/edit  

Libraries → PubSystemLib → that version → Save.

### B5. Windmill `Code.js` wrappers

You already added `teyaDayTotalsFromCsv`. Keep it. **Also add:**

```js
function teyaPullDayTotals(dayKey) {
  return PubSystemLib.teyaPullDayTotals(VENUE_CONFIG, dayKey);
}
function teyaListTerminals() {
  return PubSystemLib.teyaListTerminals(VENUE_CONFIG);
}
```

Save. (No new `/exec` deployment needed.)

---

## C — Put secrets in Windmill Script properties

In **Windmill takings** project:

1. **Project Settings** (gear) → **Script properties**  
2. Add:

| Property | Value |
|---|---|
| `TEYA_CLIENT_ID` | *(from Teya)* |
| `TEYA_CLIENT_SECRET` | *(from Teya)* |
| `TEYA_STORE_ID` | *(store UUID)* |

Save.

---

## D — Map terminals (once)

1. In Windmill editor: select function **`teyaListTerminals`** → **Run**.  
2. Open **Executions** / Logs → you’ll see store UUID(s) and terminal id(s).  
3. Put the two card machines into Script properties:

| Property | Value |
|---|---|
| `TEYA_PDQ1_TERMINAL_IDS` | terminal id for Channel A / PDQ 1 |
| `TEYA_PDQ2_TERMINAL_IDS` | terminal id for Channel B / PDQ 2 |

If there are exactly two terminals and you skip this, the code auto-assigns sorted ids to PDQ 1 / 2.

---

## E — Test

1. Open Windmill **Daily Entry**.  
2. Above PDQ Terminal 1: **Pull PDQ from Teya** → **Pull from Teya now**.  
3. PDQ 1 / 2 fill from live SUCCESSFUL sales for that calendar day.  
4. Check → **Save**. Rooms still manual.

### If it fails

| Message | Fix |
|---|---|
| Missing Teya API credentials | Step C |
| OAuth token HTTP 401/400 | Wrong client id/secret |
| payment-requests HTTP 403/404 | Wrong store UUID or scopes |
| No successful Teya sales | Wrong day, or POSLink doesn’t see standalone taps — email Teya support with MID `5151716` and ask which API lists **Business Portal terminal sales** in realtime |

---

## Honest note

Teya’s documented **realtime** list API is POSLink `GET /poslink/v2/payment-requests`. That is what this code calls.  
Settlement reporting (SOAP) is **after** settlement — not live.  
If Windmill’s SoftPOS taps never appear in POSLink, Teya support must enable the right product/API for MID `5151716` — we can’t invent a private portal endpoint.
