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
