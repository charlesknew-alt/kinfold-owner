# Manager portals (GitHub Pages)

Canonical copies of the venue manager hubs. Drink Pricing on both venues
opens the real **Varlo drinks-pricing** app (BAR STAFF TOOL — not Apps Script
Price Query, not `page=kegcosting`):

| Venue | Drink Pricing URL |
|---|---|
| Eight Bells | `https://app.varlo.co.uk/drinks-pricing?venue=eightbells` |
| Windmill | `https://app.varlo.co.uk/drinks-pricing?venue=windmill` |

Venue is passed as `?venue=eightbells|windmill`. The app requires a Varlo
login; after sign-in the account may also scope which pub you work in.
Unauthenticated hits redirect to `/login` (middleware may move `venue` onto
the login URL and strip it from `next` — if that bites, open  
`/login?next=%2Fdrinks-pricing%3Fvenue%3D…` instead).

## Already live on owner (kinfold-owner Pages)

These match this folder (hard-refresh if cached):

- https://owner.kinfoldinns.co.uk/manager-portals/eightbells/
- https://owner.kinfoldinns.co.uk/manager-portals/windmill/
- Owner hub manager login also has Drink Pricing tiles (EB + WM) → same drinks-pricing URLs

## Not yet live on dedicated manager domains

Cloud agents can push `kinfold-owner` but often get **403** on:

- https://github.com/charlesknew-alt/eightbells-manager → `manager.eightbellsbolney.com`
- https://github.com/charlesknew-alt/windmill-manager → `manager.windmilllittleworth.com`

### Charles: copy + push (one shot)

```bash
# From a clone of kinfold-owner (main):
bash manager-portals/CHARLES_DEPLOY.sh
```

Or manually:

```bash
git clone https://github.com/charlesknew-alt/eightbells-manager.git
cp manager-portals/eightbells/index.html eightbells-manager/index.html
cd eightbells-manager && git add index.html && git commit -m "Drink Pricing → app.varlo.co.uk/drinks-pricing (?venue=eightbells)" && git push && cd ..

git clone https://github.com/charlesknew-alt/windmill-manager.git
cp manager-portals/windmill/index.html windmill-manager/index.html
cp manager-portals/windmill/theme.js windmill-manager/theme.js
cd windmill-manager && git add index.html theme.js && git commit -m "Drink Pricing → app.varlo.co.uk/drinks-pricing (?venue=windmill)" && git push
```

Or grant the Cursor GitHub App **push** on both manager repos so agents can deploy next time.

### After Pages deploys — verify

1. Open Drink Pricing on each manager hub.
2. Confirm the iframe/URL is `https://app.varlo.co.uk/drinks-pricing?venue=…` (not `/exec` Price Query, not `page=kegcosting`).
3. Sign in to Varlo if prompted; confirm Price now / Suggest→Accept→TouchOffice flow.
4. Hard-refresh both hubs.

### Minimal one-line fix (Eight Bells only)

If you prefer not to replace the whole file, in `eightbells-manager/index.html` change the pricing `url` to:

```js
url: 'https://app.varlo.co.uk/drinks-pricing?venue=eightbells'
```

## PubSystemLib hub Price Query tile

Paperwork hubs still have a Price Query tile that used to open Apps Script
`/exec` (via kegcosting redirect). Point `VARLO_PRICE_QUERY_URL` at
`https://app.varlo.co.uk/drinks-pricing` and re-pin EB + WM takings libraries
to the new PubSystemLib version so hub tiles match the manager portals.
