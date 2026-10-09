# Cash Rooms off till total (both manager panels)

## Bug
**Cash Rooms** was shown but not subtracted from **Total Cash in Till** when calculating:
- Cash less float
- Cash to nearest £5
- Actual-to-safe check
- Daily Out / sales vs received

PDQ Rooms already came off card totals; Cash Rooms should come off till cash the same way.

## Fix (PubSystemLib — shared by Windmill + Eight Bells)
`cashLessFloat = cashInTill − £130 float − cashRooms`

Also rewrite sheet column **E** formulas to `=D{row}-130-U{row}` on save so the spreadsheet matches the form.

## Deploy
Pushed via clasp to PubSystemLib; pin a **new library version** on Windmill and Eight Bells venue scripts.
