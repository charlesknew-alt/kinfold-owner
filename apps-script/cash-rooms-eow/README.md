# Cash rooms: manager bag vs owner export

Eight Bells (and Windmill, same library) drop **cash room payments into the till** with the rest of the money.

## Manager daily
Cash Rooms is entered on Daily Entry. F&D figures take it off the till:

`cashLessFloat = till − £130 − cashRooms`

so Daily Out still adds up. (PubSystemLib v81.)

## Manager end of week
That deduct made **Cash after expenses / Cash to Charlie short** by the week’s room cash, because EOW still used safe cash only.

Fix: add rooms back into the bag total

`D45 = G14 + U14 − D42`  
`weekly form = actualCashToSafe + roomCash − expenses`

Managers still see Room Cash so the numbers match the physical envelope.

## Owner paperwork / Xero
Cash rooms are **not declared**:

- Xero API and CSV skip **Room Sales (Direct Only)** / **Cash Rooms**
- Frozen `WE*_MASTER` zeros C4 and C44–C46
- Owner master UI hides Room Sales Direct and Rooms Cash Banking

Room **PDQ** (card) is unchanged.

## Live
Pushed to PubSystemLib as **4.34** (library **version 83**).

Live pins (deployed 22 Sep 2026):

| Project | Pin |
|---|---|
| PubSystemLib | **v83** (`4.34`) |
| Eight Bells takings `/exec` | library **v83**, web app **@215** |
| Windmill takings `/exec` | library **v83**, web app **@67** |

Hard-refresh both manager hubs.
