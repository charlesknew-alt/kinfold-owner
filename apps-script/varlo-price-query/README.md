# Varlo Price Query

Shared **Drink Pricing / Price Query** for Eight Bells and Windmill managers.

## What it does

- Same three-pillar calculator (GP / cash / ★ blended) managers already know
- Loads **Category Config** GP / cash / wastage from the Invoice Management spreadsheet when available
- **Logs every saved query** to sheet `Price Query History` on that workbook (owner-visible)
- Venue-scoped via `?venue=eightbells` or `?venue=windmill`
- Phone-friendly; works in manager hub iframes

## Live URL

After deploy, the `/exec` URL is stored in manager portals and PubSystemLib redirects.

## Charles: first-time auth

1. Open the Apps Script project **Varlo Price Query**
2. Run `getPriceQueryCategories` once from the editor → Allow Drive/Sheets access
3. Deploy → Manage deployments → Web app → **New version** (execute as you, access Anyone)
4. Confirm a test query appears on **Price Query History** in  
   [Kinfold Inns — Invoice Management System](https://docs.google.com/spreadsheets/d/1GTsuJrbhrKRSP0tUMfnOPkaDX-b5UCfT4Xt0slZui3w/edit)

## Deploy from this folder

```bash
cd apps-script/varlo-price-query
clasp push
clasp deploy -d "Varlo Price Query"
```

Owner history location: Invoice Management spreadsheet → tab **Price Query History**.
