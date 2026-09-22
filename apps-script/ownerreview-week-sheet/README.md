# Owner review: "No week sheet specified"

## Bug
Owner Pending chips call `navigateApp('?page=ownerreview&week=WEEK_…')`.
Apps Script HtmlService iframes drop the URL query string, so the client
cannot read `week` via `getUrlParam`. The server must bake the week into
`__WEEK_SHEET__`.

`_buildServeParams` previously set `weekKey` / `sheetName` from `params.week`
but **not** `weekSheet`. `_applyBranding` only filled `__WEEK_SHEET__` from
`params.weekSheet`, so owner review opened with an empty week and threw:

> Error: No week sheet specified

A later PubSystemLib push (v83) overwrote the first fix; restored in v85.

Also: when iframed in the owner portal, `navigateApp` must **not** also do
`window.location.href` — that reloads inside the HtmlService sandbox and
drops `?week=`. Parent `postMessage` navigation alone is enough.

## Fix (PubSystemLib)
- `Templates_Serve.js`: map `params.week` → `weekSheet` / `__WEEK_SHEET__`
- `Templates_Menus.js`: skip iframe self-navigation after `postMessage`

## Deploy
- PubSystemLib **v85**
- **Eight Bells** pinned to **85**, `/exec` @216
- **Windmill** pinned to **85**, `/exec` @68
