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

## Fix (PubSystemLib — shared by Windmill + Eight Bells)
In `Templates_Serve.js`:
- Map `params.week` → `weekSheet` in `_buildServeParams`
- Fall back `week` / `weekKey` / `sheetName` when substituting `__WEEK_SHEET__`

## Deploy
- PubSystemLib **v82** — `Owner review bake week into __WEEK_SHEET__`
- **Windmill** pinned to **82**, `/exec` redeployed @66
  (`AKfycbxgzF9DVJQ2sBPVGMWCfXsaAn5-3SUzWXuURGbu4lE__ccPowt0vWmQKqY43qtyGXgP`)
- **Eight Bells** pinned to **82**, `/exec` redeployed @214
  (`AKfycbz4Q-UMy3o8Z6bjYrQMsWbRB4mSs1iHqz2CHAgYhT9QvakBY0pnutRbyQ2YUwpFnYtIww`)

Verified both venue `/exec` responses embed
`var weekSheetName = 'WEEK_…'` when `?week=` is present.
