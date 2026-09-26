# Manager hub → Food Menus tile

Adds a **Menus** card under **Records** on the Eight Bells manager hub
(`manager.eightbellsbolney.com`). Hidden on Windmill (no `FOOD_MENUS_URL`).

## What it opens
`https://owner.kinfoldinns.co.uk/menus.html?mode=staff` — simplified floor UI
(Dishes → Generate) on the same cloud menu book as the owner Menus tool.

## Shipped in
- **PubSystemLib** v87 (`FOOD_MENUS_URL` / `__FOOD_MENUS_DISPLAY__` tokens;
  Records tile + `openFoodMenus()` in `Templates_Menus.js`)
- **Eight Bells venue** `VENUE_CONFIG.FOOD_MENUS_URL` + library pin **87**
- Live web app redeploy `@219`

## Venue config
```js
FOOD_MENUS_URL: 'https://owner.kinfoldinns.co.uk/menus.html?mode=staff&v=…'
```
