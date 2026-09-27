# Eight Bells Menu AI (Gemini)

Turns a Canva/JPEG Christmas (or any) menu photo into **clean dish JSON** for the staff Menus tool — same idea as the website conversion, but staff can run it themselves.

## Why this exists

Browser OCR alone cannot read a decorative Christmas poster reliably. This Apps Script calls **Gemini** (your AI credits / Google AI Studio quota) with the image and returns structured starters / mains / desserts.

## One-time setup

1. Open [script.google.com](https://script.google.com) → **New project**
2. Replace `Code.gs` with `apps-script/menu-ai/Code.gs` from this repo
3. **Project Settings → Script properties**
   - `GEMINI_API_KEY` = key from [Google AI Studio](https://aistudio.google.com/apikey)
   - optional: `GEMINI_MODEL` = `gemini-3.6-flash` (default)
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the web app URL
6. On [owner.kinfoldinns.co.uk/menus.html](https://owner.kinfoldinns.co.uk/menus.html) → **Upload / paste** → paste that URL into **AI reader URL** → Save

The API key never goes in the GitHub Pages site.

## Cost

Uses your Gemini API quota (often free tier is enough for staff menu updates). Each upload = one vision request.

## Spelling changes

Gemini must return a `spellingFixes` list (from → to) for every typo/OCR fix it made. The Menus review screen shows these **before** you save.

## Shared menus + print history

The same web app stores staff data in **Script Properties** (no extra Drive login):

- `MENUS_*` — live dishes, party blurbs, promo bank, layout, **dish catalogue** (deduped titles + price history for autocomplete; same on PC and phone)
- `HISTIDX` + `HIST_{id}_*` — recent generated print sheets (capped to fit Apps Script quota)

Actions: `getMenusState`, `saveMenusState`, `listPrintHistory`, `savePrintHistory`, `getPrintHistory`, `deletePrintHistory`, `emailPrintHistory` (GmailApp → `pub@eightbellsbolney.com` with a **printable PDF** attachment, **From** your Gmail “Send mail as” `@kinfoldinns.co.uk` alias; override with Script Properties `MENU_EMAIL_TO` / `MENU_EMAIL_FROM`).

After pulling, push with `clasp push` from this folder, then update the live web-app deployment
(`clasp deploy -i <deploymentId> -d "…"`). Local browser storage remains a backup / offline cache.

### One-time Gmail authorisation (Email button)

After adding mail / Gmail scopes, the **script owner** must grant send permission once:

1. Open the Menu AI project in [script.google.com](https://script.google.com)
2. Select function `AUTHORIZE_EMAIL_SENDING` → **Run**
3. Review permissions → Allow
4. Check **Executions / Logs** — it lists your Gmail Send-as aliases and which `@kinfoldinns.co.uk` address will be used as From

The From address must already exist under Gmail → Settings → Accounts → **Send mail as**. Optional Script Property `MENU_EMAIL_FROM` pins a specific alias.

Until that is done, Print history **Email** returns a permission error. After Allow, Email sends on click with no mail-client popup.

## Layout review (optional)

Redeploy the same web app after pulling updates. Generate can POST `{ "action": "reviewLayout", "layout": { … } }` so Gemini checks page balance before the print preview opens. Without a redeploy, Generate still works and skips that step.
