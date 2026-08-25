# Varlo Auth

Standalone Apps Script for the unified Varlo login. Stores SHA-256
password hashes in Script Properties.

This is **not** Eight Bells or Windmill takings. Do not add `page=`
routing here. Venue `/exec` IDs stay as they are.

Live web app (execute as owner, access anyone):

`https://script.google.com/macros/s/AKfycbyghJc5aFAK7pqBo5_ih5IGILWungoJnhwWxy_9MImlcH13sKmpfGU6a4NIt0CjLgvN/exec`

Script ID: `1ntEo1XsIewRpCcvZLIvIJI1P8udFEFzhVri68B5cXWO6_4Q_EswLepjT`

Hashes are already in Script Properties. `action=bootstrap` only works
while no owner hash exists.

## Redeploy

```bash
cd apps-script/varlo-auth
clasp push
# then create a new version and update the existing web app deployment
```

Keep `appsscript.json` `webapp.access` as `ANYONE_ANONYMOUS` or `/exec`
will 404.

## Endpoint

JSONP from GitHub Pages (callback required to read the result):

- `?action=ping`
- `?action=login&role=owner|eightbells|windmill&password=…`
- `?action=set&role=eightbells|windmill&ownerPassword=…&newPassword=…`
- `?action=status&ownerPassword=…`
