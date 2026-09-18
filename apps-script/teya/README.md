# Teya → Windmill daily PDQ prefill

You already started this: PubSystemLib has a **placeholder** `Teya.gs` (`fetchTeyaTransactions` stub), and Windmill `VENUE_CONFIG` already has:

```js
TEYA_ENABLED: true,
TEYA_MID: '5151716',
TEYA_CHANNEL_LABELS: {
  'oOj2CqaI': 'Channel A',  // → PDQ Terminal 1
  '7KckI3g7': 'Channel B'   // → PDQ Terminal 2
}
```

There are **no Teya API client secrets** in Script Properties yet. Until those exist, use the **CSV prefill** path (same export as Card Takings).

## Apps Script project IDs

| Project | scriptId |
|---|---|
| PubSystemLib | `1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU` |
| Windmill takings | `1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO` |
| Eight Bells takings | `1fca4JFXwFDJQ-Y8xqvobcw85eGfyIn-khndOTNlQ2CWrdQl3LRBcW_Pr` |

Daily form is `page=daily` → `PubSystemLib.serveDailyEntryForm` (`Templates_Forms.js`). Card sales fields: `pdq1`, `pdq2`, `pdqRooms`, `cardAdjustments`.

## What to paste (Apps Script — this agent cannot clasp-push for you)

### 1. Replace PubSystemLib `Teya.gs`

Open PubSystemLib → `Teya.gs` → replace the whole file with [`Teya.gs`](./Teya.gs) from this folder.

Then **Deploy → New library version**, and in the Windmill (and Eight Bells) venue projects pin PubSystemLib to that version.

New library entry points:

| Function | Purpose |
|---|---|
| `teyaIsEnabled(cfg)` | Gate on `TEYA_ENABLED` |
| `teyaDayTotalsFromCsv(cfg, csvText, dayKey)` | CSV → `{ pdq1, pdq2, byDevice }` for one day |
| `fetchTeyaTransactions(cfg, weekSheetName)` | Live API when Script Properties are set; otherwise returns a clear “use CSV” message |

### 2. Venue wrapper (Windmill `Code.js`)

```js
function teyaDayTotalsFromCsv(csvText, dayKey) {
  return PubSystemLib.teyaDayTotalsFromCsv(VENUE_CONFIG, csvText, dayKey);
}
```

### 3. Daily form UI

In PubSystemLib `Templates_Forms.js` (daily entry), near the PDQ inputs:

1. Inject `window.TEYA_CHANNEL_LABELS = …` from `cfg.TEYA_CHANNEL_LABELS` when `TEYA_ENABLED`.
2. Paste [`daily-prefill-snippet.html`](./daily-prefill-snippet.html).
3. Optionally embed [`../../teya-day-totals.js`](../../teya-day-totals.js) for client-side parse fallback.

Manager drops the Teya CSV → PDQ 1 / 2 fill → they still hit **Save**. `pdqRooms` stays manual.

## API credentials (later)

Create an OAuth app in the [Teya partner portal](https://partner.teya.com) / [docs](https://docs.teya.com/), then set **Script Properties** on PubSystemLib or the Windmill project:

- `TEYA_CLIENT_ID`
- `TEYA_CLIENT_SECRET`
- `TEYA_STORE_ID`

`fetchTeyaTransactions` will then call POSLink `GET /poslink/v2/payment-requests`. Until that works end-to-end, CSV prefill is the production path.

## Repo helpers (this Pages site)

| File | Role |
|---|---|
| `teya-day-totals.js` | Shared parser + Channel A/B → pdq1/pdq2 |
| `samples/windmill-teya-transaction-report.csv` | Fixture |
| `tests/teya-day-totals.test.js` | Asserts sample day totals |

Owner **Card Takings** remains a read-only viewer (`card-takings.html`) and still does not write paperwork.
