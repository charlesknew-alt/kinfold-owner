# Manager portals (GitHub Pages)

Canonical copies of the venue manager hubs. Drink Pricing on both venues
opens the shared **Varlo Price Query** web app (not `page=kegcosting`):

| Venue | Drink Pricing URL |
|---|---|
| Eight Bells | `https://script.google.com/macros/s/AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA/exec?venue=eightbells` |
| Windmill | `https://script.google.com/macros/s/AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA/exec?venue=windmill` |

## Already live on owner (kinfold-owner Pages)

These match this folder (hard-refresh if cached):

- https://owner.kinfoldinns.co.uk/manager-portals/eightbells/
- https://owner.kinfoldinns.co.uk/manager-portals/windmill/
- Owner hub manager login also has Drink Pricing tiles (EB + WM) → same `/exec?venue=…`

## Not yet live on dedicated manager domains

Cloud agents can push `kinfold-owner` but get **403** on:

- https://github.com/charlesknew-alt/eightbells-manager → `manager.eightbellsbolney.com`
- https://github.com/charlesknew-alt/windmill-manager → `manager.windmilllittleworth.com`

### Charles: copy + push (one shot)

```bash
# From a clone of kinfold-owner (main):
git clone https://github.com/charlesknew-alt/eightbells-manager.git
cp manager-portals/eightbells/index.html eightbells-manager/index.html
cd eightbells-manager && git add index.html && git commit -m "Drink Pricing → Varlo Price Query (?venue=eightbells)" && git push && cd ..

git clone https://github.com/charlesknew-alt/windmill-manager.git
cp manager-portals/windmill/index.html windmill-manager/index.html
cp manager-portals/windmill/theme.js windmill-manager/theme.js
cd windmill-manager && git add index.html theme.js && git commit -m "Add Drink Pricing → Varlo Price Query (?venue=windmill)" && git push
```

Or grant the Cursor GitHub App **push** on both manager repos so agents can deploy next time.

### After Pages deploys — verify

1. Open Drink Pricing on each manager hub.
2. Confirm the iframe/URL is `…/exec?venue=eightbells` or `…/exec?venue=windmill` (not `page=kegcosting`).
3. Hard-refresh both hubs.

### Minimal one-line fix (Eight Bells only)

If you prefer not to replace the whole file, in `eightbells-manager/index.html` change:

```js
url: HUB + '?page=kegcosting'
```

to:

```js
url: 'https://script.google.com/macros/s/AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA/exec?venue=eightbells'
```

Windmill’s live hub currently has **no** Drink Pricing tile — copy the full `manager-portals/windmill/index.html` (adds the tile).

## Apps Script web app access (required before managers can use the tile)

Anonymous curl of the `/exec` currently returns Google **Access Denied** until the owner
authorizes the web app once:

1. Sign in as **charlesknew@gmail.com**
2. Open  
   `https://script.google.com/macros/s/AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA/exec?venue=eightbells`
3. Click **Review Permissions** → Allow Sheets access
4. Confirm Deploy → Who has access: **Anyone** (Execute as: Me)

Re-pin EB + WM takings libraries to PubSystemLib **v91** so hub Price Query tiles redirect.
