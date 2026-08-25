# Varlo Owner Portal

Owner dashboard for The Windmill Inn and The Eight Bells.

Lives at [owner.kinfoldinns.co.uk](https://owner.kinfoldinns.co.uk).

## Paperwork Apps Scripts (found 2026-08-25)

There is **no separate "paperwork" project**. Owner paperwork (`page=owner`)
and Card Takings (`page=cardday`) are pages on the **takings** web apps.
`clasp list` only shows standalone Drive scripts; the venue apps are
container-bound to the takings spreadsheets and do not appear there.

Live `/exec` IDs were matched with `clasp deployments`, not guessed:

| Role | Project title | scriptId | Live /exec |
|---|---|---|---|
| Eight Bells paperwork + cardday + manager hub | Eight Bells Takings (bound to sheet `Eight Bells Takings`) | `1fca4JFXwFDJQ-Y8xqvobcw85eGfyIn-khndOTNlQ2CWrdQl3LRBcW_Pr` | `AKfycbz4Q-UMy3o8Z6bjYrQMsWbRB4mSs1iHqz2CHAgYhT9QvakBY0pnutRbyQ2YUwpFnYtIww` |
| Windmill paperwork + manager hub | Windmill Inn Takings (bound to sheet `Windmill Inn Takings`) | `1UEG3IgPKxKJoVo9NpHT3RGvUTza2a_-V9ur8cBh-WrpfyXM5YoLkgoVO` | `AKfycbxgzF9DVJQ2sBPVGMWCfXsaAn5-3SUzWXuURGbu4lE__ccPowt0vWmQKqY43qtyGXgP` |
| Shared library (NA gate + HTML) | PubSystemLib | `1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU` | not a venue web app |

Venue `doGet` is `PubSystemLib.routePage(VENUE_CONFIG, e)`. The
"Owner tools are not available from the manager portal" gate lives in
PubSystemLib (`_allowOwnerAccess` / `_serveOwnerOrDeny`), not a second
script. PubSystemLib **v58** honours `shell=owner` (aliases
`portal` / `from` / `role=owner`) for `owner` / `cardday` / `ownerreview`.
Venues pin that library version and the existing `/exec` deployments
were updated (EB @192, WM @47). Do not put an owner-paperwork link
back on the manager hub.

### Full `clasp list` (charlesknew@gmail.com) — standalone only

```
PubSystemLib         - 1JgPyQgHHD_DA9w28CJFth-7Bs3SNnt59vTERrxGhMJqd1g-y-j_YuOYU
Untitled project     - 1wYZPM2i8UDizfNjgB1pKc4T0QF-lXuBs6l_PXMluyCHT6wkyyyjJgZ6G   (empty stub)
Scanning OCR         - 1qojWWYmXf1P8ob10qyYmNQBqos_VQDrMvHnA0mAKZWD5bNJfArYyOmb2   (bill scanner)
Untitled project     - 1buhVlgXKbtgydba6CTKztTsEyMemOv-Z4h7Ik_fiJxARFAWxLdTP5nbc   (Connecteam helper)
Kinfold Setup        - 1cVBr_cKx__jjTlEGF06INcprtEfavdl3BahPVhlk61nOZbn5zRFy5gYW   (invoice sheet setup)
```

None of those five is paperwork. Bound takings scripts above are the
paperwork web apps.
