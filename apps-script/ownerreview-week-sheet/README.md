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
- Push PubSystemLib via clasp and create a new version
- Pin Windmill + Eight Bells to that version and redeploy `/exec`
