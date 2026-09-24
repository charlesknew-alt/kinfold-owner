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
    // Optional second use: check a planned print layout before staff export.
    if (body && body.action === 'reviewLayout') {
      return json_(reviewLayoutWithGemini_(body));
    }
    var result = readMenuWithGemini_(body);
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet(e) {
  if (e && e.parameter && String(e.parameter.models || '') === '1') {
    return json_(listGeminiModels_());
  }
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

/** Prefer a working flash model — 3.6 can 503 under load and leave staff stuck on “Reading…”. */
function geminiModels_() {
  var preferred = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || '';
  // Put known-good flash models first; property override still tried early if set.
  var list = [
    preferred,
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ];
  var out = [];
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    var m = String(list[i] || '').trim();
    if (!m || seen[m]) continue;
    seen[m] = true;
    out.push(m);
  }
  return out;
}

function listGeminiModels_() {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) return { ok: false, error: 'GEMINI_API_KEY is not set in Script Properties.' };
  var resp = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key),
    { muteHttpExceptions: true }
  );
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  if (code < 200 || code >= 300) {
    return { ok: false, error: 'ListModels HTTP ' + code + ': ' + text.slice(0, 400) };
  }
  var parsed = JSON.parse(text);
  var names = [];
  (parsed.models || []).forEach(function (m) {
    var name = String(m.name || '').replace(/^models\//, '');
    var methods = m.supportedGenerationMethods || [];
    if (methods.indexOf('generateContent') !== -1) names.push(name);
  });
  return { ok: true, models: names, preferred: geminiModels_() };
}

function callGemini_(key, parts, generationConfig) {
  var models = geminiModels_();
  var lastErr = '';
  for (var i = 0; i < models.length; i++) {
    var model = models[i];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      model + ':generateContent?key=' + encodeURIComponent(key);
    var payload = {
      contents: [{ role: 'user', parts: parts }],
      generationConfig: generationConfig || { temperature: 0.1, responseMimeType: 'application/json' }
    };
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    var text = resp.getContentText();
    if (code >= 200 && code < 300) {
      return { ok: true, model: model, text: text };
    }
    lastErr = 'Gemini HTTP ' + code + ' (' + model + '): ' + String(text || '').slice(0, 280);
    // Try next model on overload / not found; stop on auth errors
    if (code === 401 || code === 403) break;
  }
  return { ok: false, error: lastErr || 'Gemini request failed' };
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
  // Huge Canva exports blow past practical limits and hang staff on “Reading…”
  if (b64.length > 6 * 1024 * 1024) {
    return {
      ok: false,
      error: 'Image is too large for the AI reader. Export a smaller PNG/JPG (under ~4MB) or take a clearer photo of the page.'
    };
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
    '    { "section": "Nibbles"|"Starters"|"Sharing Plates"|"Item Boost"|"Pub Classics"|"Burgers"|"Mains"|"Little Bells"|"Sandwiches"|"Sides"|"Sauces"|"Desserts",\n' +
    '      "name": "Dish name only — never a section title",\n' +
    '      "description": "short description",\n' +
    '      "price": "12.95" or "",\n' +
    '      "tags": "gf / v / vg / gf option / av" lowercase as on menu }\n' +
    '  ],\n' +
    '  "notes": "pre-order / deposit line if present",\n' +
    '  "spellingFixes": [\n' +
    '    { "from": "exact text as printed/OCR would see", "to": "corrected text used in dishes", "where": "dish name|description|section|title|notes" }\n' +
    '  ]\n' +
    '}\n' +
    'Rules:\n' +
    '- Ignore logos, holly, decorative text, addresses, allergy keys unless in notes.\n' +
    '- Section headings (STARTERS, MAINS, LITTLE BELLS, etc.) set the "section" field only — never invent a dish named after a heading.\n' +
    '- Put every dish in the section it sits under on the page. Use Little Bells for kids dishes.\n' +
    '- Use kind "party" for set menus (Christmas / party / fixed 2&3 course).\n' +
    '- Do not invent dishes. Prefer fewer clean dishes over OCR junk.\n' +
    '- Normalise AV / GF AVAILABLE into tags like "gf option" or "gf" as appropriate.\n' +
    '- SPELLING (critical): Correct clear typos and OCR misreads in names and descriptions.\n' +
    '  List EVERY change in spellingFixes (from → to). Staff must see these in review.\n' +
    '  If nothing was corrected, return "spellingFixes": [] — never omit the field.\n' +
    '  Prefer British English only when fixing real errors; do not rename intentional dish styling.\n';

  var called = callGemini_(key, [
    { text: prompt },
    { inlineData: { mimeType: mime, data: b64 } }
  ], {
    temperature: 0.1,
    responseMimeType: 'application/json'
  });
  if (!called.ok) {
    return { ok: false, error: called.error };
  }
  var parsed = JSON.parse(called.text);
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
    model: called.model,
    fileName: body.fileName || '',
    menu: menu
  };
}

/**
 * Review a planned 1–2 page print layout (no image). Staff Generate can call this
 * so Gemini checks balance / blank areas before the PDF opens.
 */
function reviewLayoutWithGemini_(body) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    return { ok: false, error: 'GEMINI_API_KEY is not set in Script Properties.' };
  }
  var layout = body.layout || body;
  var prompt =
    'You are checking an Eight Bells (Bolney) pub menu print layout before staff export to PDF.\n' +
    'Return ONLY valid JSON (no markdown):\n' +
    '{\n' +
    '  "density": "airy"|"roomy"|"normal"|"tight"|"compact",\n' +
    '  "sandwichesOn": "page1"|"page2"|"omit",\n' +
    '  "dropFootLogo": true|false,\n' +
    '  "okToPrint": true|false,\n' +
    '  "notes": "one short sentence for staff"\n' +
    '}\n' +
    'GOLDEN RULES (do not invent sections staff did not list):\n' +
    '1. COLUMNS (CRITICAL): when two columns sit opposite each other, both MUST start on the same top baseline ' +
    'AND finish at exactly the same bottom point — never leave one column half as tall as the other. ' +
    'Feature / event panels exist ONLY to even those heights: put a panel under the SHORTER food stack; ' +
    'if Sides is short, use ONE small panel beside it — never a stack of three panels taller than Sides. ' +
    'Do not add panels when there is no gap to fill.\n' +
    '2. PAGE COUNT: only ever ONE full page, or TWO full pages if needed. Never a third page. ' +
    'If content fits on one page, use one page. Always fill each used page top to bottom — ' +
    'if a page looks sparse, open spacing between categories (airy/roomy) rather than leaving a big empty footer.\n' +
    '3. READABILITY: never shrink type below a comfortable customer-readable size. Prefer tight over compact. ' +
    'If it still will not fit on two readable pages, set okToPrint false and say so in notes — ' +
    'staff should remove sections or put Desserts / Little Bells / Sandwiches on separate card menus.\n' +
    '4. EVENT / FEATURE PANELS: only where they even opposite columns. Prefer at most ONE box per column ' +
    '(1–2 blurbs). Never stack multiple scallops beside a short list. Side-by-side panels should contrast — ' +
    'one rectangular box beside one oval/wide scallop — never two matching rectangles next to each other.\n' +
    '5. PAGE 1 FOOD COLUMNS: LEFT = Stay a While / events / Sharing when used as a column; ' +
    'RIGHT = Burgers then Pub Classics under them.\n' +
    '6. Allergy footer (gf / v / vg) must remain fully visible. If any lunch-club ticks exist, keep the ' +
    'Bells Lunch Club knife-and-fork key in the footer.\n' +
    '7. Prefer sandwichesOn page2 beside sides/sauces on long menus. Drop the foot logo only if it forces overflow.\n' +
    '8. Item Boost (e.g. Fish of the Day / specials) stays where staff put it on the long sheet. ' +
    'Sandwiches, Desserts and Little Bells as their own menus print as two A5 copies on one landscape A4 (guillotine).\n' +
    '9. Party / occasion menus: staff choose full A4 or 2×A5 — respect that paper choice; do not invent a third format.\n' +
    '10. SECTION WIDTH “both” / best-fit: when staff set a section to best fit for this page, choose column OR full ' +
    'width for that section based on what balances THIS sheet (partner columns, leftover room, readability) — ' +
    'not a fixed “prefer column” rule.\n' +
    'Layout JSON follows:\n' + JSON.stringify(layout).slice(0, 6000);

  var called = callGemini_(key, [{ text: prompt }], {
    temperature: 0.2,
    responseMimeType: 'application/json'
  });
  if (!called.ok) {
    return { ok: false, error: called.error };
  }
  var parsed = JSON.parse(called.text);
  var parts = (((parsed || {}).candidates || [])[0] || {}).content || {};
  var partList = parts.parts || [];
  var outText = '';
  for (var i = 0; i < partList.length; i++) {
    if (partList[i].text) outText += partList[i].text;
  }
  outText = String(outText || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  var advice;
  try {
    advice = JSON.parse(outText);
  } catch (e2) {
    return { ok: false, error: 'Gemini layout review returned non-JSON', raw: outText.slice(0, 500) };
  }
  var density = String(advice.density || 'normal').toLowerCase();
  if (['airy', 'roomy', 'normal', 'tight', 'compact'].indexOf(density) === -1) density = 'normal';
  var sandwichesOn = String(advice.sandwichesOn || 'page2').toLowerCase();
  if (['page1', 'page2', 'omit'].indexOf(sandwichesOn) === -1) sandwichesOn = 'page2';
  return {
    ok: true,
    source: 'gemini-layout',
    model: called.model,
    density: density,
    sandwichesOn: sandwichesOn,
    dropFootLogo: !!advice.dropFootLogo,
    okToPrint: advice.okToPrint !== false,
    notes: String(advice.notes || '').slice(0, 280)
  };
}
