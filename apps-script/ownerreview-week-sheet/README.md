# Owner review: "No week sheet specified" (KEEP THIS)

## Bug
Owner Pending chips call `navigateApp('?page=ownerreview&week=WEEK_…')`.
HtmlService iframes drop the query string, so `__WEEK_SHEET__` must be
baked server-side from `params.week`.

## Fix (must survive every PubSystemLib push)
In `Templates_Serve.js`:
- `_buildServeParams`: set `weekSheet` from `params.week`
- `_applyBranding`: `__WEEK_SHEET__` falls back through `week` / `weekKey`

Also:
- `Templates_Menus.js`: when iframed, only `postMessage` (no `location.href`)
- `Templates_Styles.js`: hide `.ps-header.varlo-header` when iframed

**Other agents:** do not overwrite these when shipping menu/cash-rooms changes.
Merge, don't replace `Templates_Serve.js` / navigateApp / iframed header CSS.

## Deploy
- PubSystemLib **v88** — `RESTORE ownerreview week bake (keep across menu pushes)`
- Eight Bells `/exec` @222 pinned to **88**
- Windmill `/exec` @70 pinned to **88**
