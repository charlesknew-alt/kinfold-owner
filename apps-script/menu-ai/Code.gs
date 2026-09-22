/**
 * Eight Bells Menu AI — Google Apps Script
 *
 * Reads a menu photo/PDF page (base64) with Gemini and returns clean dish JSON
 * for the staff Menus tool. API key stays in Script Properties (never in the website).
 *
 * Setup (once):
 * 1. https://script.google.com → New project → paste this file as Code.gs
 * 2. Project Settings → Script properties → Add GEMINI_API_KEY = (Google AI Studio key)
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL into Menus → Upload / paste → “AI reader URL”
 *
 * Free Gemini quota applies to your Google AI Studio project (AI credits).
 */

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var body = JSON.parse(raw);
    var result = readMenuWithGemini_(body);
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: 'eight-bells-menu-ai',
    hint: 'POST JSON { imageBase64, mimeType, fileName }'
  });
}

function doOptions() {
  return json_({ ok: true });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readMenuWithGemini_(body) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    return { ok: false, error: 'GEMINI_API_KEY is not set in Script Properties.' };
  }
  var b64 = body.imageBase64 || body.base64 || '';
  var mime = body.mimeType || 'image/jpeg';
  if (!b64) return { ok: false, error: 'Missing imageBase64.' };
  // strip data-URL prefix if present
  var comma = b64.indexOf(',');
  if (b64.indexOf('data:') === 0 && comma !== -1) {
    mime = b64.slice(5, b64.indexOf(';')) || mime;
    b64 = b64.slice(comma + 1);
  }

  var prompt =
    'You are extracting an Eight Bells (Bolney) pub menu from an image or scan.\n' +
    'Return ONLY valid JSON (no markdown) with this shape:\n' +
    '{\n' +
    '  "kind": "party" | "long" | "card",\n' +
    '  "title": "e.g. Christmas Party Menu",\n' +
    '  "subtitle": "",\n' +
    '  "coursePrices": "e.g. 2 courses £32.95 · 3 courses £39.95" or "",\n' +
    '  "dishes": [\n' +
    '    { "section": "Starters"|"Mains"|"Desserts"|"Nibbles"|"Pub classics & Burgers"|"Sides"|"Sandwiches",\n' +
    '      "name": "Dish name",\n' +
    '      "description": "short description",\n' +
    '      "price": "12.95" or "",\n' +
    '      "tags": "gf / v / vg / gf option / av" lowercase as on menu }\n' +
    '  ],\n' +
    '  "notes": "pre-order / deposit line if present"\n' +
    '}\n' +
    'Rules:\n' +
    '- Ignore logos, holly, decorative text, addresses, allergy keys unless in notes.\n' +
    '- Use kind "party" for set menus (Christmas / party / fixed 2&3 course).\n' +
    '- Do not invent dishes. Prefer fewer clean dishes over OCR junk.\n' +
    '- Normalise AV / GF AVAILABLE into tags like "gf option" or "gf" as appropriate.\n';

  var model = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') ||
    'gemini-3.6-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    model + ':generateContent?key=' + encodeURIComponent(key);

  var payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: mime, data: b64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  if (code < 200 || code >= 300) {
    return { ok: false, error: 'Gemini HTTP ' + code + ': ' + text.slice(0, 400) };
  }
  var parsed = JSON.parse(text);
  var parts = (((parsed || {}).candidates || [])[0] || {}).content || {};
  var partList = parts.parts || [];
  var outText = '';
  for (var i = 0; i < partList.length; i++) {
    if (partList[i].text) outText += partList[i].text;
  }
  outText = String(outText || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  var menu;
  try {
    menu = JSON.parse(outText);
  } catch (e2) {
    return { ok: false, error: 'Gemini returned non-JSON', raw: outText.slice(0, 800) };
  }
  return {
    ok: true,
    source: 'gemini',
    fileName: body.fileName || '',
    menu: menu
  };
}
