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
 *
 * EMAIL (Print history → Email button):
 * Run AUTHORIZE_EMAIL_SENDING once (dropdown above ▶ Run), then Allow.
 * Sends to pub@eightbellsbolney.com with no mail-client popup.
 * Reply-To: your @kinfoldinns.co.uk Send-as alias (when present).
 * From alias is OFF by default — Gmail “Send mail as” via Outlook SMTP was
 * bouncing with “Authentication unsuccessful”. Set Script Property
 * MENU_EMAIL_USE_FROM=1 after fixing Gmail → Accounts → Send mail as.
 *
 * DRIVE (Print history HTML archive for phone ↔ PC):
 * Run AUTHORIZE_DRIVE_PRINT_HISTORY once → Allow Google Drive.
 * Without this, sheets fall back to Script Properties (small quota).
 */

/**
 * ★ ONE-TIME: select this in the function dropdown (top toolbar) → Run → Allow.
 * Grants Drive so print HTML lands in “Eight Bells Menu Print History”
 * instead of Script Properties (fixes phone download + quota wipes).
 */
function AUTHORIZE_DRIVE_PRINT_HISTORY() {
  var folder = historyHtmlFolder_();
  if (!folder) {
    throw new Error('Drive still not authorised — click Allow on the permission prompt, then Run again');
  }
  var probeName = '_varlo_drive_probe.txt';
  var existing = folder.getFilesByName(probeName);
  while (existing.hasNext()) {
    try { existing.next().setTrashed(true); } catch (e0) {}
  }
  var file = folder.createFile(probeName, 'ok ' + new Date().toISOString(), MimeType.PLAIN_TEXT);
  var id = file.getId();
  try { file.setTrashed(true); } catch (e1) {}
  Logger.log('Drive authorised. Folder: ' + folder.getName() + ' (' + folder.getId() + ')');
  return {
    ok: true,
    folderId: folder.getId(),
    folderName: folder.getName(),
    probeFileId: id
  };
}

/**
 * ★ ONE-TIME: select this in the function dropdown (top toolbar) → Run → Allow.
 * Grants permission so Print history Email can send without a mail-client popup.
 * Also logs which Gmail Send-as aliases Apps Script can use (kinfoldinns.co.uk).
 */
function AUTHORIZE_EMAIL_SENDING() {
  var remaining = MailApp.getRemainingDailyQuota();
  var aliases = [];
  try { aliases = GmailApp.getAliases() || []; } catch (err) { aliases = []; }
  var replyTo = resolveMenuEmailFrom_(aliases);
  var useFrom = menuEmailUseFromAlias_();
  Logger.log('Mail authorised. Remaining daily quota: ' + remaining);
  Logger.log('Gmail Send-as aliases: ' + JSON.stringify(aliases));
  Logger.log('Menu emails From alias enabled: ' + useFrom +
    ' → From: ' + (useFrom && replyTo ? replyTo : '(primary Google account)') +
    '; Reply-To: ' + (replyTo || '(none)'));
  return {
    ok: true,
    remaining: remaining,
    aliases: aliases,
    replyTo: replyTo,
    useFrom: useFrom
  };
}

/** @deprecated use AUTHORIZE_EMAIL_SENDING */
function authorizeMail_() {
  return AUTHORIZE_EMAIL_SENDING();
}

/** Read JSON from text/plain fetch OR form field `payload` (iframe form POST). */
function readPostBody_(e) {
  e = e || {};
  if (e.parameter && e.parameter.payload) {
    return String(e.parameter.payload);
  }
  if (e.postData && e.postData.contents) {
    var contents = String(e.postData.contents || '');
    var type = String((e.postData.type || '')).toLowerCase();
    if (type.indexOf('application/x-www-form-urlencoded') !== -1) {
      var m = contents.match(/(?:^|&)payload=([^&]*)/);
      if (m) {
        try {
          return decodeURIComponent(m[1].replace(/\+/g, ' '));
        } catch (err) {
          return m[1];
        }
      }
    }
    return contents;
  }
  return '{}';
}

function doPost(e) {
  try {
    var raw = readPostBody_(e);
    var body = JSON.parse(raw || '{}');
    var action = body && body.action ? String(body.action) : '';
    // Shared print history (Drive) — same web app URL, works on PC and phone.
    if (action === 'listPrintHistory') {
      return json_(listPrintHistory_());
    }
    if (action === 'pruneOrphanPrintHistory') {
      return json_(pruneOrphanPrintHistory_());
    }
    if (action === 'savePrintHistory') {
      return json_(savePrintHistory_(body.entry || body));
    }
    if (action === 'getPrintHistory') {
      return json_(getPrintHistory_(body.id || (body.entry && body.entry.id)));
    }
    if (action === 'hasPrintHistory') {
      return json_(hasPrintHistory_(body.id || (body.entry && body.entry.id)));
    }
    if (action === 'deletePrintHistory') {
      return json_(deletePrintHistory_(body.id));
    }
    if (action === 'emailPrintHistory') {
      return json_(emailPrintHistory_(body));
    }
    // Shared live menu book (dishes, blurbs, wording, layout) across devices.
    if (action === 'getMenusState') {
      return json_(getMenusState_());
    }
    if (action === 'saveMenusState') {
      return json_(saveMenusState_(body.state || body));
    }
    // Optional: check a planned print layout before staff export.
    if (action === 'reviewLayout') {
      return json_(reviewLayoutWithGemini_(body));
    }
    if (action === 'reviewSpelling') {
      return json_(reviewSpellingWithGemini_(body));
    }
    var result = readMenuWithGemini_(body);
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  // Hidden iframe bridge so GitHub Pages can call this script reliably
  // (browser fetch POST to /exec breaks on Google’s 302 redirect).
  if (String(p.bridge || '') === '1') {
    return HtmlService.createHtmlOutput(cloudBridgeHtml_())
      .setTitle('Menu cloud bridge')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (String(p.models || '') === '1') {
    return json_(listGeminiModels_());
  }
  // GET reads (fast, CORS-friendly) — same actions as POST.
  var action = String(p.action || '');
  if (action === 'listPrintHistory') return json_(listPrintHistory_());
  if (action === 'pruneOrphanPrintHistory') return json_(pruneOrphanPrintHistory_());
  if (action === 'getPrintHistory') return json_(getPrintHistory_(p.id));
  if (action === 'hasPrintHistory') return json_(hasPrintHistory_(p.id));
  if (action === 'deletePrintHistory') return json_(deletePrintHistory_(p.id));
  if (action === 'driveStatus') return json_(historyDriveStatus_());
  if (action === 'getMenusState') return json_(getMenusState_());
  // Email by id — HTML is in Drive / legacy props.
  if (action === 'emailPrintHistory') {
    return json_(emailPrintHistory_({ id: p.id, to: p.to }));
  }
  // Emergency: free Script Properties when print HTML blew the 500KB cap.
  if (action === 'purgeHistory') {
    return json_(purgeHistoryProps_());
  }
  // Rebuild HISTIDX from remaining HTML blobs / Drive files (no re-upload).
  if (action === 'rebuildPrintHistoryIndex') {
    return json_(rebuildPrintHistoryIndex_());
  }
  return json_({
    ok: true,
    service: 'eight-bells-menu-ai',
    hint: 'GET/POST actions: listPrintHistory, pruneOrphanPrintHistory, savePrintHistory, getPrintHistory, hasPrintHistory, deletePrintHistory, emailPrintHistory, getMenusState, saveMenusState, reviewLayout, reviewSpelling; or ?bridge=1',
    mailQuota: (function () {
      try { return MailApp.getRemainingDailyQuota(); } catch (err) { return null; }
    })()
  });
}

/**
 * Called from the bridge iframe via google.script.run — bypasses fetch/302 issues.
 */
function bridgeApi(action, body) {
  action = String(action || '');
  body = body && typeof body === 'object' ? body : {};
  try {
    if (action === 'listPrintHistory') return listPrintHistory_();
    if (action === 'pruneOrphanPrintHistory') return pruneOrphanPrintHistory_();
    if (action === 'savePrintHistory') return savePrintHistory_(body.entry || body);
    if (action === 'getPrintHistory') return getPrintHistory_(body.id || (body.entry && body.entry.id));
    if (action === 'hasPrintHistory') return hasPrintHistory_(body.id || (body.entry && body.entry.id));
    if (action === 'deletePrintHistory') return deletePrintHistory_(body.id);
    if (action === 'emailPrintHistory') return emailPrintHistory_(body);
    if (action === 'getMenusState') return getMenusState_();
    if (action === 'saveMenusState') return saveMenusState_(body.state || body);
    if (action === 'reviewLayout') return reviewLayoutWithGemini_(body);
    if (action === 'reviewSpelling') return reviewSpellingWithGemini_(body);
    return { ok: false, error: 'Unknown action: ' + action };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function cloudBridgeHtml_() {
  // Kept for diagnostics. Live clients write via no-cors POST (nested HtmlService
  // sandboxes cannot receive postMessage from the parent GitHub Pages iframe).
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>cloud bridge</title></head><body>',
    '<p>Menu cloud bridge — clients use no-cors POST + GET verify.</p>',
    '</body></html>'
  ].join('');
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

function callGemini_(key, parts, generationConfig, opts) {
  opts = opts || {};
  var models = geminiModels_();
  var maxModels = parseInt(opts.maxModels, 10);
  if (isNaN(maxModels) || maxModels < 1) maxModels = models.length;
  var lastErr = '';
  for (var i = 0; i < models.length && i < maxModels; i++) {
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
    '    { "section": "Nibbles"|"Starters"|"Sharing Plates"|"Item Boost"|"Special Starters"|"Special Mains"|"Special Desserts"|"Pub Classics"|"Burgers"|"Sunday Roasts"|"Mains"|"Little Bells"|"Sandwiches"|"Sides"|"Sauces"|"Desserts",\n' +
    '      "name": "Dish name only — never a section title",\n' +
    '      "description": "short description",\n' +
    '      "price": "12.95" or "",\n' +
    '      "tags": "gf / v / vg / df / gf option / av" lowercase as on menu (df = dairy free) }\n' +
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
    '- DESCRIPTION (critical): Keep every “Served with…” / garnish line on that dish.\n' +
    '  The last dish before the allergy footer still needs its description — never drop it.\n' +
    '  Never put the allergy footer (“Please inform us of any allergies…”) into a dish description.\n' +
    '- Normalise AV / GF AVAILABLE into tags like "gf option" or "gf" as appropriate.\n' +
    '- Put DF / dairy free in tags as "df" (or "df option") — never leave DF hardwired in the dish name.\n' +
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
 * Review a planned 1–2 page print layout (no image). Staff Generate calls this
 * BEFORE the PDF opens so Gemini checks opposite columns and adds feature panels
 * wherever a short stack would leave a blank band — any sheet, not one special case.
 */
function reviewLayoutWithGemini_(body) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    return { ok: false, error: 'GEMINI_API_KEY is not set in Script Properties.' };
  }
  var layout = body.layout || body;
  var prompt =
    'You are the final gate before an Eight Bells (Bolney) pub menu PDF opens.\n' +
    'The JS planner has already placed the food. Honour staff Blocks locks. ' +
    'Do not undo the food map. You may only: set sectionWidths for Best-fit sections, ' +
    'drop extra feature panels, and refuse to clip dishes.\n' +
    'Return ONLY valid JSON (no markdown):\n' +
    '{\n' +
    '  "density": "airy"|"roomy"|"normal"|"tight"|"compact",\n' +
    '  "sandwichesOn": "page1"|"page2"|"omit",\n' +
    '  "sidesOn": "page1"|"page2",\n' +
    '  "dropFootLogo": true|false,\n' +
    '  "okToPrint": true|false,\n' +
    '  "sectionWidths": { "<section name>": "column"|"full"|"split" },\n' +
    '  "columnBalance": {\n' +
    '    "page1": { "shorter": "left"|"right"|"even", "panels": 0|1|2 },\n' +
    '    "page2": { "shorter": "left"|"right"|"even", "panels": 0|1|2 }\n' +
    '  },\n' +
    '  "notes": "one short sentence for staff"\n' +
    '}\n' +
    'FOOD MAP (default — change only to stop clipping):\n' +
    '- Page 1: Sharing | Burgers (then Pub Classics). Do NOT put Sides or Sandwiches under Sharing.\n' +
    '- Page 2: Mains, Desserts, then Sides beside Sandwiches.\n' +
    '- sidesOn is page2 so Sides sit with Sandwiches. Never sidesOn page1 when Sharing/Burgers already occupy page 1.\n' +
    '- sandwichesOn is page2 (quieter column). Never omit when sandwichesLocked is true.\n' +
    '- If sandwichesLocked is false, sandwichesOn should be omit.\n' +
    'BEST-FIT WIDTHS: layout.bestFit lists EVERY section staff set to “Best fit (AI chooses)”. ' +
    'For those only, set sectionWidths to column, full, or split — any category may use any of the three. ' +
    'column = half opposite another section; full = one full-bleed stack; ' +
    'split = that one category across two even columns (shorter height — use when a single stack would clip or look sparse). ' +
    'Prefer column or split so food fits. Locked Column / Full must not change.\n' +
    'SHARED TYPE SCALE:\n' +
    '- Same title/name/description size on both pages. Maximise that shared size.\n' +
    '- Prefer fewer feature panels on the packed page over shrinking type.\n' +
    '- dropFootLogo: true when a page-2 logo would force tight/compact type.\n' +
    '- After type is set, fill each used page top→bottom. Never a third page.\n' +
    'COLUMN BALANCE (after food is placed):\n' +
    '- Food first. If a hole exists because Sides were taken off page 2, set sidesOn page2 — do not fill that hole with two event panels.\n' +
    '- A solo food column stays half-width; do not fill the empty half with Gatherings / Large Functions.\n' +
    '- Small leftover under a shorter FOOD stack: panels 1 only if it fits with a gap. panels 2 only for a huge leftover after food.\n' +
    '- panels:0 only when shorter is "even". Put panels ONLY under the shorter side.\n' +
    '- Each feature-panel title AND body only once per printed menu (both pages). Never reprint ALL TIPS / Stay a While / Gatherings to fill leftover — pick a different unused bank panel or leave empty.\n' +
    '- Short Specials beside tall Sandwiches: nest unused Sides into that leftover when they share the page. Do not duplicate a panel to fill the hole. Do not mark fit=over to force a panel.\n' +
    'OTHER GOLDEN RULES:\n' +
    '1. COLUMNS start on the same top baseline and finish at the same bottom point. ' +
    'Category titles line up across columns: a frilly section (Desserts / Sandwiches) puts its title INSIDE the frame; the unframed neighbour (Little Bells / Sides) sits as pair-head on the same baseline. ' +
    'A little leftover under the shorter stack gets a SMALL evergreen panel (Stay a While / Gatherings) only if it fits with a decent gap after the food. ' +
    'Never auto-pick a dated event (Sip & Paint) as leftover under kids or puddings.\n' +
    '2. PAGE COUNT: only ONE or TWO pages. Content must NEVER fall off the page. ' +
    'Drop leftover feature panels and foot logos before hiding a dish. Two pages if one would clip at minimum type; never clip food.\n' +
    '3. READABILITY: never shrink below comfortable type. Prefer tight over compact.\n' +
    '4. Feature panels: prefer contrasting frames (rect box beside oval wide). Adjacent frilly food boxes must not match — different wave or corner so they do not look like a work project. Use Stay a While / Gatherings / quiz wording.\n' +
    '5. PAGE 1: LEFT Sharing; RIGHT Burgers then Pub Classics.\n' +
    '6. Allergy footer must stay visible; lunch-club key stays in footer when ticked.\n' +
    '7. sandwichesOn page2; sidesOn page2 beside Sandwiches. Never omit locked sandwiches.\n' +
    '8. Respect party paper choice (A4 or 2×A5).\n' +
    '9. SECTION WIDTH “both” / best-fit: YOU choose column, full, or split in sectionWidths so this sheet fits.\n' +
    'Layout JSON follows:\n' + JSON.stringify(layout).slice(0, 7000);

  var called = callGemini_(key, [{ text: prompt }], {
    temperature: 0.2,
    responseMimeType: 'application/json'
  }, { maxModels: 2 });
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
  if (layout.sandwichesLocked && sandwichesOn === 'omit') {
    sandwichesOn = (layout.p2 && layout.p2.sandwiches) ? 'page2' : 'page1';
  }
  if (layout.sandwichesLocked === false && sandwichesOn !== 'omit' &&
      !(layout.p1 && layout.p1.sandwiches) && !(layout.p2 && layout.p2.sandwiches)) {
    sandwichesOn = 'omit';
  }
  var sidesOn = String(advice.sidesOn || '').toLowerCase();
  if (['page1', 'page2'].indexOf(sidesOn) === -1) sidesOn = '';
  var hasSharing = !!(layout.sections && (layout.sections['Sharing Plates'] || layout.sections.Sharing));
  if (layout.pages === 2 && hasSharing) {
    if (sidesOn === 'page1') sidesOn = 'page2';
    if (sandwichesOn === 'page1') sandwichesOn = 'page2';
  }

  var sectionWidths = {};
  if (advice.sectionWidths && typeof advice.sectionWidths === 'object') {
    var bestFit = Array.isArray(layout.bestFit) ? layout.bestFit : [];
    Object.keys(advice.sectionWidths).forEach(function (sec) {
      var w = String(advice.sectionWidths[sec] || '').toLowerCase();
      if (w !== 'column' && w !== 'full' && w !== 'split') return;
      if (bestFit.length && bestFit.indexOf(sec) === -1) return;
      sectionWidths[sec] = w;
    });
  }

  function normPage(raw, fallbackShorter) {
    raw = raw && typeof raw === 'object' ? raw : {};
    var shorter = String(raw.shorter || fallbackShorter || 'even').toLowerCase();
    if (['left', 'right', 'even'].indexOf(shorter) === -1) shorter = 'even';
    var panels = parseInt(raw.panels, 10);
    if (isNaN(panels) || panels < 0) panels = 0;
    if (panels > 2) panels = 2;
    // Never release an uneven pair with zero panels.
    if (shorter !== 'even' && panels < 1) panels = 1;
    if (shorter === 'even') panels = 0;
    return { shorter: shorter, panels: panels };
  }

  var cols = layout.columns || {};
  var fb1 = (cols.page1 && cols.page1.shorter) || 'even';
  var fb2 = (cols.page2 && cols.page2.shorter) || 'even';
  var columnBalance = {
    page1: normPage(advice.columnBalance && advice.columnBalance.page1, fb1),
    page2: cols.page2 ? normPage(advice.columnBalance && advice.columnBalance.page2, fb2) :
      { shorter: 'even', panels: 0 }
  };

  return {
    ok: true,
    source: 'gemini-layout',
    model: called.model,
    density: density,
    sandwichesOn: sandwichesOn,
    sidesOn: sidesOn || undefined,
    dropFootLogo: !!advice.dropFootLogo,
    okToPrint: advice.okToPrint !== false,
    columnBalance: columnBalance,
    sectionWidths: sectionWidths,
    notes: String(advice.notes || '').slice(0, 280)
  };
}

/**
 * Proof-read the live dish list before Generate. Returns spellingFixes only —
 * never invents dishes. Local typo map still runs if this is offline.
 */
function reviewSpellingWithGemini_(body) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    return { ok: false, error: 'GEMINI_API_KEY is not set in Script Properties.' };
  }
  var dishes = Array.isArray(body.dishes) ? body.dishes.slice(0, 80) : [];
  var slim = dishes.map(function (d) {
    return {
      id: String((d && d.id) || ''),
      name: String((d && d.name) || '').slice(0, 120),
      description: String((d && d.description) || '').slice(0, 240)
    };
  });
  var prompt =
    'Proof-read this Eight Bells (Bolney) pub menu. British English.\n' +
    'Read each NAME and DESCRIPTION as a whole sentence, not isolated words.\n' +
    'Return ONLY valid JSON:\n' +
    '{ "spellingFixes": [ { "from": "typo as written", "to": "correction", "where": "name|description", "dishId": "id", "snippet": "the full name or description" } ] }\n' +
    'Rules:\n' +
    '- Only real spelling / OCR mistakes in that sentence. Do not restyle, rename, or rewrite dishes.\n' +
    '- Do not change plurals (onions, noodles, tomatoes) to singular, or the other way around.\n' +
    '- Do not change real food words: malted bread, smoked, salted, pickled, toasted, chilli, fillet.\n' +
    '- Prefer British spelling (chilli, fillet, colour) only when the written form is wrong.\n' +
    '- Keep intentional names (Wagyu, Nduja, Padron, MP).\n' +
    '- If a word is correct in context, omit it. If nothing is wrong, return {"spellingFixes":[]}.\n' +
    'Dishes:\n' + JSON.stringify(slim).slice(0, 9000);

  var called = callGemini_(key, [{ text: prompt }], {
    temperature: 0.1,
    responseMimeType: 'application/json'
  }, { maxModels: 2 });
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
    return { ok: false, error: 'Gemini returned non-JSON' };
  }
  var fixes = Array.isArray(advice.spellingFixes) ? advice.spellingFixes : [];
  var clean = [];
  var seen = {};
  fixes.forEach(function (f) {
    if (!f) return;
    var from = String(f.from || '').trim();
    var to = String(f.to || '').trim();
    if (!from || !to || from.toLowerCase() === to.toLowerCase()) return;
    var keepWord = {
      malted: 1, smoked: 1, onions: 1, onion: 1, noodles: 1, noodle: 1,
      salted: 1, pickled: 1, toasted: 1, roasted: 1
    };
    if (keepWord[from.toLowerCase()]) return;
    if (from.toLowerCase() + 's' === to.toLowerCase() || to.toLowerCase() + 's' === from.toLowerCase()) return;
    var keyFix = from.toLowerCase() + '>' + to.toLowerCase() + '>' + String(f.dishId || '');
    if (seen[keyFix]) return;
    seen[keyFix] = true;
    clean.push({
      from: from.slice(0, 80),
      to: to.slice(0, 80),
      where: String(f.where || 'name').slice(0, 20),
      dishId: String(f.dishId || ''),
      snippet: String(f.snippet || '').slice(0, 240)
    });
  });
  return {
    ok: true,
    source: 'gemini-spelling',
    model: called.model,
    spellingFixes: clean.slice(0, 40)
  };
}

/* ——— Shared staff data ———
 * MENUS_* in Script Properties (small JSON).
 * Print HTML in Drive (Script Properties 500KB quota is too small for sheets).
 */

/** Match client HISTORY_MAX so PC/phone keep the same shared archive. */
var HISTORY_MAX_ = 60;
/** Ids removed on any device — stop other PCs re-uploading them. */
var HISTORY_DELETED_MAX_ = 80;
var PROP_CHUNK_ = 8500;

function isQuotaError_(err) {
  var msg = String(err && err.message ? err.message : err || '');
  return /quota|exceeded the property storage/i.test(msg);
}

function propDeletePrefix_(props, prefix) {
  var oldN = parseInt(props.getProperty(prefix + '_n') || '0', 10) || 0;
  var keys = [prefix + '_n'];
  for (var i = 0; i < oldN + 5; i++) keys.push(prefix + '_' + i);
  keys.forEach(function (k) {
    try { props.deleteProperty(k); } catch (e) {}
  });
}

/**
 * Delete every Script Property used for print HTML / index / tombstones.
 * Emergency only (?action=purgeHistory) — do not call from normal saves.
 */
function purgeHistoryProps_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties() || {};
  var keys = Object.keys(all);
  var removed = 0;
  keys.forEach(function (k) {
    if (/^HIST/i.test(k)) {
      try { props.deleteProperty(k); removed++; } catch (e) {}
    }
  });
  return { ok: true, removed: removed, keysBefore: keys.length };
}

/**
 * Free Script Properties space without wiping the shared index / tombstones.
 * (Older code called purgeHistoryProps_ on quota → empty Print history on PC.)
 */
function freeHistoryHtmlBlobs_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties() || {};
  var removed = 0;
  Object.keys(all).forEach(function (k) {
    if (k === 'HIST_FOLDER_ID') return;
    if (k.indexOf('HISTIDX') === 0 || k.indexOf('HISTDEL') === 0) return;
    // Plain HIST_* and gzip HISTGZ_* blobs — never the index/tombstones.
    if (/^HISTGZ_/i.test(k) || /^HIST_/i.test(k)) {
      try { props.deleteProperty(k); removed++; } catch (e) {}
    }
  });
  // Props HTML gone — drop any index rows that Drive cannot serve either.
  try { historyPruneOrphanIndex_(historyReadIndex_()); } catch (e2) {}
  return removed;
}

function propWrite_(prefix, text) {
  var props = PropertiesService.getScriptProperties();
  text = String(text || '');
  var n = Math.ceil(text.length / PROP_CHUNK_) || 1;
  propDeletePrefix_(props, prefix);
  var batch = {};
  batch[prefix + '_n'] = String(n);
  for (var i = 0; i < n; i++) {
    batch[prefix + '_' + i] = text.substring(i * PROP_CHUNK_, (i + 1) * PROP_CHUNK_);
  }
  try {
    props.setProperties(batch, false);
  } catch (err) {
    if (!isQuotaError_(err)) throw err;
    // CRITICAL: never free HTML blobs when writing HISTIDX / HISTDEL.
    // That race created zombie Print history rows (id in list, HTML gone) —
    // owner saw “shared” sheets manager could not open, and Save verify
    // false-passed on list membership alone.
    if (prefix === 'HISTIDX' || prefix === 'HISTDEL') {
      if (prefix === 'HISTIDX') {
        try {
          var parsed = JSON.parse(text || '[]');
          if (Array.isArray(parsed) && parsed.length > HISTORY_PROPS_HTML_MAX_) {
            text = JSON.stringify(parsed.slice(0, HISTORY_PROPS_HTML_MAX_));
            n = Math.ceil(text.length / PROP_CHUNK_) || 1;
            propDeletePrefix_(props, prefix);
            batch = {};
            batch[prefix + '_n'] = String(n);
            for (var j = 0; j < n; j++) {
              batch[prefix + '_' + j] = text.substring(j * PROP_CHUNK_, (j + 1) * PROP_CHUNK_);
            }
          }
        } catch (eTrim) {}
      }
      props.setProperties(batch, false);
      return;
    }
    // HTML blob write — drop older blobs only, then retry this sheet.
    freeHistoryHtmlBlobs_();
    props.setProperties(batch, false);
  }
}

function propRead_(prefix) {
  var props = PropertiesService.getScriptProperties();
  var n = parseInt(props.getProperty(prefix + '_n') || '0', 10) || 0;
  if (n <= 0) return '';
  var parts = [];
  for (var i = 0; i < n; i++) {
    parts.push(props.getProperty(prefix + '_' + i) || '');
  }
  return parts.join('');
}

function propDelete_(prefix) {
  propDeletePrefix_(PropertiesService.getScriptProperties(), prefix);
}

function historySafeId_(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
}

function historySortNewest_(list) {
  return (list || []).slice().sort(function (a, b) {
    return (b.generatedAt || 0) - (a.generatedAt || 0);
  });
}

function historyReadIndex_() {
  try {
    var parsed = JSON.parse(propRead_('HISTIDX') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function historyWriteIndex_(list) {
  propWrite_('HISTIDX', JSON.stringify(list || []));
}

/**
 * Drive folder for print HTML (avoids Script Properties 500KB cap).
 * Returns null when Drive is not authorised — callers fall back to props.
 */
function historyHtmlFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = String(props.getProperty('HIST_FOLDER_ID') || '');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) {
      // Stale / trashed folder id — clear and recreate below.
      try { props.deleteProperty('HIST_FOLDER_ID'); } catch (e0) {}
    }
  }
  try {
    var existing = DriveApp.getFoldersByName('Eight Bells Menu Print History');
    if (existing.hasNext()) {
      var found = existing.next();
      try { props.setProperty('HIST_FOLDER_ID', found.getId()); } catch (e1) {}
      return found;
    }
    var folder = DriveApp.createFolder('Eight Bells Menu Print History');
    try { props.setProperty('HIST_FOLDER_ID', folder.getId()); } catch (e2) {}
    return folder;
  } catch (e3) {
    return null;
  }
}

/** Diagnose Drive for print HTML (curl ?action=driveStatus). */
function historyDriveStatus_() {
  var props = PropertiesService.getScriptProperties();
  var storedId = String(props.getProperty('HIST_FOLDER_ID') || '');
  var out = {
    ok: true,
    storedFolderId: storedId || '',
    folderId: '',
    folderName: '',
    canWrite: false,
    error: '',
    createError: '',
    getError: ''
  };
  if (storedId) {
    try {
      var byId = DriveApp.getFolderById(storedId);
      out.folderId = byId.getId();
      out.folderName = byId.getName();
    } catch (eGet) {
      out.getError = String(eGet && eGet.message ? eGet.message : eGet);
    }
  }
  try {
    var folder = historyHtmlFolder_();
    if (!folder) {
      out.ok = false;
      // Probe the raw create error so we know if this is auth vs quota.
      try {
        DriveApp.createFolder('Eight Bells Menu Print History');
      } catch (eCreate) {
        out.createError = String(eCreate && eCreate.message ? eCreate.message : eCreate);
      }
      out.error = out.createError || out.getError ||
        'DriveApp could not open or create the print-history folder — run AUTHORIZE_DRIVE_PRINT_HISTORY';
      return out;
    }
    out.folderId = folder.getId();
    out.folderName = folder.getName();
    var probeName = '_varlo_drive_status_probe.txt';
    var file = folder.createFile(probeName, 'ok ' + new Date().toISOString(), MimeType.PLAIN_TEXT);
    out.canWrite = !!(file && file.getId());
    try { file.setTrashed(true); } catch (e1) {}
  } catch (err) {
    out.ok = false;
    out.error = String(err && err.message ? err.message : err);
  }
  return out;
}

function historyWriteHtmlDrive_(id, html) {
  var safe = historySafeId_(id);
  if (!safe) throw new Error('Bad history id for Drive write');
  var folder = historyHtmlFolder_();
  if (!folder) {
    throw new Error(
      'Drive not authorised — open Apps Script, Run any function, accept Drive access, then Sync again'
    );
  }
  var name = safe + '.html';
  var existing = folder.getFilesByName(name);
  while (existing.hasNext()) {
    try { existing.next().setTrashed(true); } catch (e) {}
  }
  var blob = Utilities.newBlob(String(html || ''), MimeType.HTML, name);
  var file = folder.createFile(blob);
  if (!file || !file.getId()) throw new Error('Drive createFile returned empty');
}

/** Keep only the newest N Script-Properties HTML blobs (quota is ~500KB). */
var HISTORY_PROPS_HTML_MAX_ = 8;

/** Gzip+base64 into Script Properties — fits real menu sheets when Drive auth is missing. */
function historyWriteHtmlPropsGzip_(id, html) {
  var safe = historySafeId_(id);
  if (!safe) throw new Error('Bad history id');
  var gz = Utilities.gzip(Utilities.newBlob(String(html || ''), 'text/html', safe + '.html'));
  var b64 = Utilities.base64Encode(gz.getBytes());
  propDelete_('HIST_' + safe);
  propWrite_('HISTGZ_' + safe, b64);
  if (!propRead_('HISTGZ_' + safe)) throw new Error('gzip props write not readable');
  return b64.length;
}

function historyReadHtmlPropsGzip_(id) {
  var safe = historySafeId_(id);
  if (!safe) return '';
  var b64 = '';
  try { b64 = propRead_('HISTGZ_' + safe) || ''; } catch (e0) { b64 = ''; }
  if (!b64) return '';
  try {
    var bytes = Utilities.base64Decode(b64);
    var blob = Utilities.newBlob(bytes, 'application/x-gzip');
    return Utilities.ungzip(blob).getDataAsString() || '';
  } catch (e1) {
    return '';
  }
}

/**
 * True when this sheet’s HTML is fetchable (Drive preferred, then gzip/props).
 * Index rows without HTML cause “not in the cloud yet” on phones/managers.
 */
function historyHasHtml_(id) {
  id = historySafeId_(id);
  if (!id) return false;
  // Props first — cheap; Drive next (can be slow / auth-flake on list).
  try {
    if (propRead_('HISTGZ_' + id) || propRead_('HIST_' + id)) return true;
  } catch (e2) {}
  try {
    if (historyReadHtmlDrive_(id)) return true;
  } catch (e1) {}
  return false;
}

/**
 * Drop Script-Properties HTML for older sheets, but only when Drive still has
 * a copy — never leave HISTIDX rows that getPrintHistory cannot open.
 * When Drive cannot take the blob, drop the sheet from the shared index too
 * (props-only archive is capped; listing without HTML breaks manager phones).
 */
function historyPrunePropsHtml_(list) {
  var sorted = historySortNewest_(list || []);
  var dropIds = {};
  sorted.slice(HISTORY_PROPS_HTML_MAX_).forEach(function (drop) {
    if (!drop || !drop.id) return;
    var safe = historySafeId_(drop.id);
    var onDrive = false;
    try { onDrive = !!historyReadHtmlDrive_(safe); } catch (e) { onDrive = false; }
    if (onDrive) {
      propDelete_('HIST_' + safe);
      return;
    }
    // No Drive backup — remove from the shared list instead of orphaning.
    dropIds[safe] = true;
    try { historyDeleteHtml_(safe); } catch (e2) {}
  });
  if (Object.keys(dropIds).length) {
    var kept = sorted.filter(function (r) {
      return r && r.id && !dropIds[historySafeId_(r.id)];
    });
    try { historyWriteIndex_(kept); } catch (e3) {}
  }
}

/**
 * Remove index rows whose HTML is gone (props wipe / failed Drive write).
 * Returns the kept list; writes HISTIDX when anything was dropped.
 */
function historyPruneOrphanIndex_(list) {
  var src = list || historyReadIndex_();
  var kept = [];
  var dropped = 0;
  src.forEach(function (row) {
    if (!row || !row.id) return;
    if (historyHasHtml_(row.id)) {
      kept.push(row);
      return;
    }
    dropped += 1;
    // Clear any empty Drive stubs / leftover prop keys.
    try { historyDeleteHtml_(row.id); } catch (e) {}
  });
  if (dropped > 0) {
    try { historyWriteIndex_(kept); } catch (e2) {}
  }
  return { items: kept, dropped: dropped };
}

/** Ids that still have HIST_/HISTGZ_ HTML chunks in Script Properties. */
function historyDiscoverStoredIds_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties() || {};
  var ids = {};
  Object.keys(all).forEach(function (k) {
    var m = String(k).match(/^HIST(?:GZ)?_([a-zA-Z0-9_-]+)_n$/);
    if (m && m[1]) ids[m[1]] = true;
  });
  // Also pick up HTML files already in the Drive print-history folder.
  try {
    var folder = historyHtmlFolder_();
    if (folder) {
      var files = folder.getFiles();
      while (files.hasNext()) {
        var f = files.next();
        var name = String(f.getName() || '');
        var dm = name.match(/^([a-zA-Z0-9_-]+)\.html$/i);
        if (dm && dm[1]) ids[dm[1]] = true;
      }
    }
  } catch (eDrive) {}
  return Object.keys(ids);
}

/**
 * Recover original Save time from history id (`p` + Date.now().toString(36)).
 * Never invent "now" — that is what stamped every row 14:19 after HISTIDX wipe.
 * Round-trip + recent-window checks block handmade ids like `pmainvi…`.
 */
function historyStampFromId_(id) {
  var s = String(id || '');
  var m = s.match(/^p([0-9a-z]+)$/i);
  if (!m) return 0;
  var body = m[1].toLowerCase();
  var now = Date.now();
  var oldest = now - 400 * 24 * 60 * 60 * 1000; // ~13 months of menu history
  // Date.now().toString(36) is ~8 chars in 2024–2030; id may append a random tail.
  for (var len = Math.min(body.length, 10); len >= 8; len--) {
    var prefix = body.slice(0, len);
    var n = parseInt(prefix, 36);
    if (!isFinite(n) || n < oldest || n > now + 86400000) continue;
    if (n.toString(36) !== prefix) continue;
    // Remainder (if any) is a short random suffix from Generate, not more timestamp digits.
    var rest = body.slice(len);
    if (rest.length > 6) continue;
    return n;
  }
  return 0;
}

/** Prefer <meta name="eb-generated-at"> (or SAVE_META.generatedAt) baked into HTML. */
function historyStampFromHtml_(html) {
  var s = String(html || '');
  var m = s.match(/name=["']eb-generated-at["'][^>]*content=["'](\d{13})["']/i) ||
    s.match(/content=["'](\d{13})["'][^>]*name=["']eb-generated-at["']/i) ||
    s.match(/data-eb-generated-at=["'](\d{13})["']/i);
  if (m) {
    var n = Number(m[1]);
    if (n > 1.4e12 && n < 2.2e12) return n;
  }
  var sm = s.match(/SAVE_META\s*=\s*(\{[\s\S]*?\});/);
  if (sm) {
    try {
      var obj = JSON.parse(sm[1]);
      var g = Number(obj && (obj.generatedAt || obj.createdAt) || 0);
      if (g > 1.4e12 && g < 2.2e12) return g;
    } catch (e) {}
  }
  return 0;
}

function historyStampFromDriveFile_(id) {
  try {
    var safe = historySafeId_(id);
    if (!safe) return 0;
    var folder = historyHtmlFolder_();
    if (!folder) return 0;
    var files = folder.getFilesByName(safe + '.html');
    if (!files.hasNext()) return 0;
    var created = files.next().getDateCreated();
    if (created) return created.getTime();
  } catch (e) {}
  return 0;
}

/** Best original Save stamp for a stored sheet — never Date.now(). */
function historyRecoverStamp_(id, html) {
  return historyStampFromHtml_(html) ||
    historyStampFromId_(id) ||
    historyStampFromDriveFile_(id) ||
    0;
}

/**
 * When HISTIDX was rebuilt with Date.now(), many rows share one minute.
 * Re-derive each stamp from HTML / id / Drive created time (min with existing).
 */
function historyRepairBulkNowStamps_(list) {
  var src = list || [];
  if (src.length < 3) return src;
  var byMinute = {};
  src.forEach(function (r) {
    var ts = Number(r && (r.generatedAt || r.createdAt) || 0) || 0;
    if (!ts) return;
    var key = String(Math.floor(ts / 60000));
    byMinute[key] = (byMinute[key] || 0) + 1;
  });
  var polluted = null;
  Object.keys(byMinute).forEach(function (k) {
    if (byMinute[k] >= 3) polluted = Number(k);
  });
  if (polluted == null) return src;
  var changed = false;
  var out = src.map(function (r) {
    if (!r || !r.id) return r;
    var ts = Number(r.generatedAt || r.createdAt || 0) || 0;
    if (!ts || Math.floor(ts / 60000) !== polluted) return r;
    var html = '';
    try {
      html = historyReadHtmlDrive_(r.id) || historyReadHtmlPropsGzip_(r.id) || propRead_('HIST_' + r.id) || '';
    } catch (e) { html = ''; }
    var recovered = historyRecoverStamp_(r.id, html);
    if (!recovered || recovered >= ts) return r;
    changed = true;
    var created = Number(r.createdAt || 0) || 0;
    return Object.assign({}, r, {
      generatedAt: recovered,
      createdAt: created && created < recovered ? created : recovered
    });
  });
  if (changed) {
    try { historyWriteIndex_(out); } catch (e2) {}
  }
  return out;
}

function historyMetaFromHtmlTitle_(id, html) {
  var title = '';
  var m = String(html || '').match(/<title>([^<]*)<\/title>/i);
  if (m) title = String(m[1] || '').trim();
  var roman = '';
  var rm = title.match(/—\s*([IVXLCDM]+)\s*$/);
  if (rm) roman = rm[1];
  var menuId = 'main';
  var menuName = 'Menu';
  if (/\bsunday\b/i.test(title)) {
    menuId = 'sunday';
    menuName = 'Sunday';
  } else if (/dessert/i.test(title)) {
    menuId = 'desserts';
    menuName = 'Desserts';
  } else if (/main/i.test(title)) {
    menuId = 'main';
    menuName = 'Main menu';
  } else if (/special/i.test(title)) {
    menuId = 'specials';
    menuName = 'Specials';
  } else if (/sandwich/i.test(title)) {
    menuId = 'sandwiches';
    menuName = 'Sandwiches';
  } else if (title) {
    menuName = title.replace(/\s+—\s*[IVXLCDM]+\s*$/, '').replace(/\s+(?:Wk|Sun)\b.*$/i, '').trim() || menuName;
  }
  // Prefer "Sunday 4th October" / "Week of …" — never "Sunday Sun 4th Oct"
  // (that doubled into "Sunday Sunday Sun …" in the UI label).
  var week = '';
  var wm = title.match(/\b(Week of\s+\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]+(?:\s+\d{4})?)/i);
  if (wm) {
    week = wm[1].replace(/\s+/g, ' ').trim();
  } else {
    var sm = title.match(/\bSun(?:day)?\s+(\d{1,2}(?:st|nd|rd|th))\s+([A-Za-z]+)(?:\s+(\d{4}))?/i);
    if (sm) {
      week = 'Sunday ' + sm[1] + ' ' + sm[2] + (sm[3] ? ' ' + sm[3] : '');
    }
  }
  // Never Date.now() on rebuild — that rewrote every stamp to 14:19 (flow178 hole).
  var stamp = historyRecoverStamp_(id, html);
  if (!stamp) stamp = 1; // sort-stable placeholder; client repair / next save can improve
  return {
    id: id,
    menuId: menuId,
    menuName: menuName,
    roman: roman,
    n: 0,
    week: week,
    weekKey: '',
    hideDate: false,
    generatedAt: stamp,
    createdAt: stamp,
    dayKey: ''
  };
}

/**
 * If HISTIDX was wiped by an old quota purge but HTML blobs remain, rebuild
 * the list so PC/phone Print history is not empty.
 */
function historyRebuildIndexIfEmpty_() {
  var list = historyReadIndex_();
  if (list && list.length) return list;
  var deleted = {};
  historyReadDeleted_().forEach(function (id) { deleted[String(id)] = true; });
  var rebuilt = [];
  historyDiscoverStoredIds_().forEach(function (id) {
    if (deleted[id]) return;
    var html = historyReadHtmlDrive_(id) || historyReadHtmlPropsGzip_(id) || propRead_('HIST_' + id);
    if (!html) return;
    rebuilt.push(historyMetaFromHtmlTitle_(id, html));
  });
  if (rebuilt.length) {
    rebuilt = historySortNewest_(rebuilt);
    try { historyWriteIndex_(rebuilt); } catch (e) {}
  }
  return rebuilt;
}

function historyReadHtmlDrive_(id) {
  var safe = historySafeId_(id);
  if (!safe) return '';
  try {
    var folder = historyHtmlFolder_();
    var files = folder.getFilesByName(safe + '.html');
    if (!files.hasNext()) return '';
    return files.next().getBlob().getDataAsString() || '';
  } catch (e) {
    return '';
  }
}

function historyDeleteHtmlDrive_(id) {
  var safe = historySafeId_(id);
  if (!safe) return;
  try {
    var folder = historyHtmlFolder_();
    var files = folder.getFilesByName(safe + '.html');
    while (files.hasNext()) {
      try { files.next().setTrashed(true); } catch (e) {}
    }
  } catch (e2) {}
}

function historyDeleteHtml_(id) {
  var safe = historySafeId_(id);
  if (!safe) return;
  // Clear gzip + legacy Script Properties chunks + Drive file.
  propDelete_('HISTGZ_' + safe);
  propDelete_('HIST_' + safe);
  historyDeleteHtmlDrive_(safe);
}

function historyPrune_(list) {
  var sorted = historySortNewest_(list);
  if (sorted.length <= HISTORY_MAX_) return sorted;
  var keep = sorted.slice(0, HISTORY_MAX_);
  var keepIds = {};
  keep.forEach(function (r) { keepIds[r.id] = true; });
  sorted.slice(HISTORY_MAX_).forEach(function (drop) {
    historyDeleteHtml_(drop.id);
  });
  return keep;
}

function historyMetaOnly_(entry) {
  entry = entry || {};
  var generatedAt = Number(entry.generatedAt || entry.createdAt || 0) || Date.now();
  var createdAt = Number(entry.createdAt || entry.generatedAt || 0) || generatedAt;
  return {
    id: String(entry.id || ''),
    menuId: String(entry.menuId || 'main'),
    menuName: String(entry.menuName || entry.menuId || 'Menu'),
    roman: String(entry.roman || ''),
    n: entry.n || 0,
    week: String(entry.week || ''),
    weekKey: String(entry.weekKey || ''),
    hideDate: !!entry.hideDate,
    generatedAt: generatedAt,
    createdAt: createdAt,
    dayKey: String(entry.dayKey || '')
  };
}

/**
 * Print history timestamp = original Save only.
 * Retries / re-uploads / index rebuilds must never replace an older
 * generatedAt with a newer "now". Always keep min(existing, incoming).
 * Brand-new id (no existing row) keeps the incoming stamp as-is.
 */
function historyPreserveGeneratedAt_(existing, incoming) {
  var meta = historyMetaOnly_(incoming || {});
  if (!existing) {
    meta.createdAt = Number((incoming && incoming.createdAt) || meta.generatedAt);
    return meta;
  }
  var oldTs = Number(existing.generatedAt || existing.createdAt || 0) || 0;
  var newTs = Number(meta.generatedAt || meta.createdAt || 0) || 0;
  if (oldTs && newTs) {
    meta.generatedAt = Math.min(oldTs, newTs);
  } else {
    meta.generatedAt = oldTs || newTs || meta.generatedAt;
  }
  var oldCreated = Number(existing.createdAt || oldTs || 0) || 0;
  var newCreated = Number((incoming && incoming.createdAt) || newTs || 0) || 0;
  if (oldCreated && newCreated) {
    meta.createdAt = Math.min(oldCreated, newCreated);
  } else {
    meta.createdAt = oldCreated || newCreated || meta.generatedAt;
  }
  if (existing.dayKey && Number(meta.generatedAt) === oldTs) {
    meta.dayKey = existing.dayKey;
  }
  return meta;
}

function historyReadDeleted_() {
  try {
    var parsed = JSON.parse(propRead_('HISTDEL') || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    return [];
  }
}

function historyWriteDeleted_(ids) {
  var list = [];
  var seen = {};
  (ids || []).forEach(function (id) {
    id = String(id || '');
    if (!id || seen[id]) return;
    seen[id] = true;
    list.push(id);
  });
  if (list.length > HISTORY_DELETED_MAX_) {
    list = list.slice(-HISTORY_DELETED_MAX_);
  }
  propWrite_('HISTDEL', JSON.stringify(list));
}

function historyMarkDeleted_(id) {
  id = historySafeId_(id);
  if (!id) return;
  var list = historyReadDeleted_().filter(function (x) { return x !== id; });
  list.push(id);
  historyWriteDeleted_(list);
}

function historyUnmarkDeleted_(id) {
  id = historySafeId_(id);
  if (!id) return;
  historyWriteDeleted_(historyReadDeleted_().filter(function (x) { return x !== id; }));
}

function rebuildPrintHistoryIndex_() {
  // Force a rebuild even when HISTIDX is a non-empty stale list.
  try { propDelete_('HISTIDX'); } catch (e0) {}
  var deleted = {};
  historyReadDeleted_().forEach(function (id) { deleted[String(id)] = true; });
  var candidates = historyDiscoverStoredIds_();
  // Last-known shared sheets (in case getProperties() omits chunk keys).
  ['pmujuzoge', 'pmujpewru', 'pmuizsmvo'].forEach(function (id) {
    if (candidates.indexOf(id) === -1) candidates.push(id);
  });
  var rebuilt = [];
  candidates.forEach(function (id) {
    if (!id || deleted[id]) return;
    var html = '';
    try { html = historyReadHtmlDrive_(id) || ''; } catch (e1) { html = ''; }
    if (!html) {
      try { html = historyReadHtmlPropsGzip_(id) || ''; } catch (eGz) { html = ''; }
    }
    if (!html) {
      try { html = propRead_('HIST_' + id) || ''; } catch (e2) { html = ''; }
    }
    if (!html) return;
    rebuilt.push(historyMetaFromHtmlTitle_(id, html));
  });
  rebuilt = historySortNewest_(rebuilt);
  if (rebuilt.length) {
    try { historyWriteIndex_(rebuilt); } catch (e3) {}
  }
  return {
    ok: true,
    source: 'props',
    rebuilt: rebuilt.length,
    items: rebuilt,
    deletedIds: historyReadDeleted_()
  };
}

/**
 * When Drive is unavailable, only list rows that still have props HTML.
 * Cheap (prop key read) — stops zombie “shared” rows with no downloadable sheet.
 * When Drive works, trust the index (Sync / getPrintHistory prune orphans).
 * Does not call createFolder on every list (that 403’d and slowed phones).
 */
function historyDriveLikelyAvailable_() {
  var props = PropertiesService.getScriptProperties();
  var id = String(props.getProperty('HIST_FOLDER_ID') || '');
  if (!id) return false;
  try {
    return !!DriveApp.getFolderById(id);
  } catch (e) {
    return false;
  }
}

function historyFilterListed_(list) {
  var src = list || [];
  if (historyDriveLikelyAvailable_()) return src;
  var kept = [];
  var dropped = 0;
  src.forEach(function (row) {
    if (!row || !row.id) return;
    var safe = historySafeId_(row.id);
    var has = false;
    try {
      has = !!(propRead_('HISTGZ_' + safe) || propRead_('HIST_' + safe));
    } catch (e1) { has = false; }
    if (has) {
      kept.push(row);
      return;
    }
    dropped += 1;
  });
  if (dropped > 0) {
    try { historyWriteIndex_(kept); } catch (e2) {}
  }
  return kept;
}

function listPrintHistory_() {
  var list = historyRebuildIndexIfEmpty_();
  // One-time fix for flow178 hole: HISTIDX rebuild stamped Date.now() on every row.
  list = historyRepairBulkNowStamps_(list);
  list = historyPrune_(list);
  list = historyFilterListed_(list);
  try { historyWriteIndex_(list); } catch (e) {}
  // Light GET: return the index fast. Full Drive-per-row checks stay on
  // pruneOrphanPrintHistory_ / Sync now (those hung phones past 12s).
  return {
    ok: true,
    source: 'props',
    items: list,
    deletedIds: historyReadDeleted_(),
    orphansDropped: 0
  };
}

/** Explicit Sync cleanup — same as list, but reports how many orphans went. */
function pruneOrphanPrintHistory_() {
  var pruned = historyPruneOrphanIndex_(historyReadIndex_());
  return {
    ok: true,
    source: 'props',
    dropped: pruned.dropped || 0,
    items: pruned.items || [],
    deletedIds: historyReadDeleted_()
  };
}

function savePrintHistory_(raw) {
  if (!raw || !raw.html) {
    return { ok: false, error: 'Missing entry.html' };
  }
  var meta = historyMetaOnly_(raw);
  if (!meta.id) {
    meta.id = 'p' + Number(meta.generatedAt || Date.now()).toString(36);
  }
  var safe = historySafeId_(meta.id);
  if (!safe) return { ok: false, error: 'Bad history id' };
  meta.id = safe;
  // Keep the original Save time when re-pushing HTML/index for the same id.
  var existing = null;
  var priorList = historyReadIndex_();
  for (var pi = 0; pi < priorList.length; pi++) {
    if (priorList[pi] && priorList[pi].id === safe) {
      existing = priorList[pi];
      break;
    }
  }
  meta = historyPreserveGeneratedAt_(existing, meta);
  meta.id = safe;
  // Explicit save from a device re-adds the sheet (clears a prior delete tombstone).
  historyUnmarkDeleted_(safe);
  // Prefer Drive for HTML; small props fallback only when Drive is unavailable.
  propDelete_('HIST_' + safe);
  var htmlText = String(raw.html);
  // Prefer stamp baked into HTML / encoded in id over a polluted "now".
  var recovered = historyRecoverStamp_(safe, htmlText);
  if (recovered && (!meta.generatedAt || Number(meta.generatedAt) > recovered)) {
    meta.generatedAt = recovered;
    if (!meta.createdAt || Number(meta.createdAt) > recovered) {
      meta.createdAt = recovered;
    }
  }
  var source = '';
  var driveErr = '';
  try {
    historyWriteHtmlDrive_(safe, htmlText);
    if (historyReadHtmlDrive_(safe)) source = 'drive';
    else driveErr = 'Drive write OK but file not readable';
  } catch (e) {
    driveErr = String(e && e.message ? e.message : e);
  }
  if (!source) {
    // Drive missing — store gzip’d HTML in Script Properties (menus compress well).
    // Plain uncompressed props cannot hold real sheets and caused zombie index rows.
    try {
      historyWriteHtmlPropsGzip_(safe, htmlText);
      if (historyReadHtmlPropsGzip_(safe)) source = 'props-gzip';
    } catch (eGz) {
      driveErr = (driveErr ? driveErr + '; ' : '') +
        'gzip-props: ' + String(eGz && eGz.message ? eGz.message : eGz);
      if (isQuotaError_(eGz) || /quota|exceeded/i.test(String(eGz))) {
        try {
          historyPrunePropsHtml_(historyReadIndex_());
          historyWriteHtmlPropsGzip_(safe, htmlText);
          if (historyReadHtmlPropsGzip_(safe)) source = 'props-gzip';
        } catch (eGz2) {
          driveErr += '; retry: ' + String(eGz2 && eGz2.message ? eGz2.message : eGz2);
        }
      }
    }
  }
  if (!source && htmlText.length <= 28000) {
    try {
      propWrite_('HIST_' + safe, htmlText);
      if (propRead_('HIST_' + safe)) source = 'props';
    } catch (eProp) {
      if (isQuotaError_(eProp)) {
        historyPrunePropsHtml_(historyReadIndex_());
        try {
          propWrite_('HIST_' + safe, htmlText);
          if (propRead_('HIST_' + safe)) source = 'props';
        } catch (eProp2) {}
      }
    }
  }
  // Never index a sheet the phone cannot download (meta without HTML).
  if (!source) {
    return {
      ok: false,
      error: 'Could not store sheet HTML — authorise Drive in Apps Script, then Sync again' +
        (driveErr ? ' (' + driveErr + ')' : '')
    };
  }
  var list = historyReadIndex_().filter(function (r) { return r.id !== meta.id; });
  list.unshift(meta);
  list = historyPrune_(list);
  if (source === 'props' || source === 'props-gzip') historyPrunePropsHtml_(list);
  try {
    historyWriteIndex_(list);
  } catch (e2) {
    if (isQuotaError_(e2)) {
      // Do NOT freeHistoryHtmlBlobs_ here — that deleted the sheet we just saved.
      try {
        historyWriteIndex_(list.slice(0, Math.min(list.length, HISTORY_PROPS_HTML_MAX_)));
      } catch (e3) {
        return {
          ok: false,
          error: 'Could not update shared index (Script Properties full). Run AUTHORIZE_DRIVE_PRINT_HISTORY.'
        };
      }
    } else {
      throw e2;
    }
  }
  // Honesty check: HTML must still be fetchable after index write.
  if (!historyHasHtml_(safe)) {
    try {
      historyWriteIndex_(historyReadIndex_().filter(function (r) { return r.id !== safe; }));
    } catch (e4) {}
    return {
      ok: false,
      error: 'Sheet HTML vanished after save (quota/Drive). Run AUTHORIZE_DRIVE_PRINT_HISTORY, then Save again.'
    };
  }
  return {
    ok: true,
    source: source,
    entry: meta,
    warning: (source === 'props' || source === 'props-gzip')
      ? 'Stored in Script Properties (Drive not authorised yet — run AUTHORIZE_DRIVE_PRINT_HISTORY for full archive)'
      : ''
  };
}

/**
 * Tiny existence check for Save verify — avoids shipping full sheet HTML through
 * the iOS iframe → outer-page postMessage relay (that path hung Print history).
 */
function hasPrintHistory_(id) {
  id = historySafeId_(id);
  if (!id) return { ok: false, error: 'Missing id' };
  return { ok: true, exists: historyHasHtml_(id), id: id };
}

function getPrintHistory_(id) {
  id = historySafeId_(id);
  if (!id) return { ok: false, error: 'Missing id' };
  var list = historyReadIndex_();
  var meta = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      meta = list[i];
      break;
    }
  }
  // Prefer Drive; fall back to gzip props, then legacy plain props.
  var html = historyReadHtmlDrive_(id) || historyReadHtmlPropsGzip_(id) || propRead_('HIST_' + id);
  if (!html) {
    // Index lied — drop the orphan so owner/manager lists stay honest.
    if (meta) {
      try {
        historyWriteIndex_(list.filter(function (r) { return r.id !== id; }));
      } catch (e) {}
    }
    return { ok: false, error: 'Sheet not found in cloud history', orphanPruned: !!meta };
  }
  var entry = meta ? historyMetaOnly_(meta) : historyMetaFromHtmlTitle_(id, html);
  // Never invent "now" when serving a stored sheet — recover if meta was polluted.
  var recovered = historyRecoverStamp_(id, html);
  if (recovered) {
    var cur = Number(entry.generatedAt || entry.createdAt || 0) || 0;
    if (!cur || cur > recovered) {
      entry.generatedAt = recovered;
      entry.createdAt = Number(entry.createdAt || 0) && Number(entry.createdAt) < recovered
        ? Number(entry.createdAt)
        : recovered;
    }
  }
  entry.html = html;
  return { ok: true, source: 'props', entry: entry };
}

function deletePrintHistory_(id) {
  id = historySafeId_(id);
  if (!id) return { ok: false, error: 'Missing id' };
  historyDeleteHtml_(id);
  var list = historyReadIndex_().filter(function (r) { return r.id !== id; });
  historyWriteIndex_(list);
  historyMarkDeleted_(id);
  return { ok: true, source: 'props', id: id };
}

var MENU_EMAIL_DEFAULT_ = 'pub@eightbellsbolney.com';
/** Prefer this domain among Gmail “Send mail as” aliases (see Gmail → Accounts). */
var MENU_EMAIL_FROM_DOMAIN_ = 'kinfoldinns.co.uk';

/**
 * Pick the kinfoldinns Send-as alias: Script Property MENU_EMAIL_FROM if known,
 * else the first @kinfoldinns.co.uk alias on the script owner’s Gmail.
 */
function resolveMenuEmailFrom_(aliases) {
  var props = PropertiesService.getScriptProperties();
  var preferred = String(props.getProperty('MENU_EMAIL_FROM') || '').trim();
  var list = Array.isArray(aliases) ? aliases : [];
  if (!list.length) {
    try { list = GmailApp.getAliases() || []; } catch (err) { list = []; }
  }
  if (preferred) {
    for (var i = 0; i < list.length; i++) {
      if (String(list[i]).toLowerCase() === preferred.toLowerCase()) return list[i];
    }
  }
  var domain = '@' + MENU_EMAIL_FROM_DOMAIN_.toLowerCase();
  for (var j = 0; j < list.length; j++) {
    if (String(list[j]).toLowerCase().slice(-domain.length) === domain) return list[j];
  }
  if (preferred && preferred.indexOf('@') !== -1) return preferred;
  return '';
}

/**
 * Opt-in: use Gmail “Send mail as” From. Default off — Outlook SMTP for
 * admin@kinfoldinns.co.uk was returning “Authentication unsuccessful” bounces.
 * Set Script Property MENU_EMAIL_USE_FROM=1 after fixing Send mail as.
 */
function menuEmailUseFromAlias_() {
  var props = PropertiesService.getScriptProperties();
  var raw = String(props.getProperty('MENU_EMAIL_USE_FROM') || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

/**
 * Send a saved print sheet by email (no client mailto popup).
 * Sends from the script owner’s primary Gmail (reliable) with Reply-To set to
 * the kinfoldinns alias. Optional From alias via MENU_EMAIL_USE_FROM=1.
 */
function emailPrintHistory_(body) {
  body = body || {};
  var props = PropertiesService.getScriptProperties();
  var to = String(body.to || props.getProperty('MENU_EMAIL_TO') || MENU_EMAIL_DEFAULT_).trim();
  var entry = body.entry && typeof body.entry === 'object' ? body.entry : {};
  var html = String(entry.html || '');
  if (!html && (body.id || entry.id)) {
    var got = getPrintHistory_(body.id || entry.id);
    if (got && got.ok && got.entry) {
      entry = got.entry;
      html = String(entry.html || '');
    }
  }
  if (!html) return { ok: false, error: 'Missing sheet HTML to email' };
  if (!to || to.indexOf('@') === -1) return { ok: false, error: 'Bad email address' };

  var menuName = String(entry.menuName || entry.menuId || 'Menu');
  var week = String(entry.week || '');
  var roman = String(entry.roman || '');
  var subjectParts = [menuName];
  if (week) subjectParts.push(week);
  if (roman) subjectParts.push(roman);
  var subject = subjectParts.join(' · ');
  var safeName = (menuName + (roman ? ' - ' + roman : ''))
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || 'menu';
  var pdfName = safeName + '.pdf';
  var attachments = [];
  var attachedAs = '';
  try {
    attachments.push(menuHtmlToPdfBlob_(html, pdfName));
    attachedAs = pdfName;
  } catch (pdfErr) {
    // Fallback: HTML attachment if PDF conversion fails on a rare sheet.
    var htmlName = safeName + '.html';
    attachments.push(Utilities.newBlob(html, 'text/html', htmlName));
    attachedAs = htmlName + ' (PDF convert failed: ' +
      String(pdfErr && pdfErr.message ? pdfErr.message : pdfErr).slice(0, 120) + ')';
  }
  var plain =
    'Eight Bells menu: ' + subject + '\n\n' +
    'Printable PDF attached (' + attachedAs + ').\n';
  var htmlBody =
    '<p>Eight Bells menu: <strong>' + subject.replace(/</g, '&lt;') + '</strong></p>' +
    '<p>Printable <strong>PDF</strong> attached — ready to print.</p>';
  var alias = resolveMenuEmailFrom_();
  var useFrom = menuEmailUseFromAlias_() && !!alias;
  var fromUsed = useFrom ? alias : '';
  var mailOpts = {
    htmlBody: htmlBody,
    attachments: attachments,
    name: 'Eight Bells Menus'
  };
  // Reply-To keeps kinfoldinns in the thread without forcing broken Send-as SMTP.
  if (alias) mailOpts.replyTo = alias;
  if (fromUsed) mailOpts.from = fromUsed;

  var source = 'gmail';
  try {
    if (fromUsed) {
      GmailApp.sendEmail(to, subject, plain, mailOpts);
    } else {
      // Primary account — same path that delivered HTML menus before the From alias.
      MailApp.sendEmail({
        to: to,
        subject: subject,
        body: plain,
        htmlBody: htmlBody,
        attachments: attachments,
        name: 'Eight Bells Menus',
        replyTo: alias || undefined
      });
      source = 'mail';
    }
  } catch (err) {
    try {
      MailApp.sendEmail({
        to: to,
        subject: subject,
        body: plain,
        htmlBody: htmlBody,
        attachments: attachments,
        name: 'Eight Bells Menus',
        replyTo: alias || undefined
      });
      fromUsed = '';
      source = 'mail';
    } catch (err2) {
      return {
        ok: false,
        error: 'Could not send email: ' + String(err && err.message ? err.message : err)
      };
    }
  }
  return {
    ok: true,
    source: source,
    to: to,
    from: fromUsed || null,
    replyTo: alias || null,
    subject: subject,
    filename: attachedAs,
    sendMode: fromUsed ? 'alias-from' : 'primary-replyto',
    build: 'sendas-fix-76b'
  };
}

/**
 * Turn a saved print-sheet HTML into a PDF blob for email attachment.
 * Scripts/toolbars stripped so the PDF is the printable menu only.
 */
function menuHtmlToPdfBlob_(html, filenamePdf) {
  var raw = String(html || '');
  var styles = '';
  raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function (_m, css) {
    styles += css + '\n';
    return '';
  });
  var bodyHtml = raw;
  var bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) bodyHtml = bodyMatch[1];
  bodyHtml = bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
  styles +=
    '@page{size:A4;margin:0}' +
    'html,body{background:#fff!important;margin:0;padding:0}' +
    '.toolbar,#previewToolbar{display:none!important}' +
    '.sheet-stack.mode-a5{display:none!important}' +
    'body.paper-a5 .mode-a5{display:block!important}body.paper-a5 .mode-a4{display:none!important}' +
    'body.paper-a4 .mode-a5{display:none!important}body.paper-a4 .mode-a4{display:block!important}';
  var page =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    styles +
    '</style></head><body>' +
    bodyHtml +
    '</body></html>';
  var out = HtmlService.createHtmlOutput(page).setWidth(794).setHeight(1123);
  var pdf = out.getAs(MimeType.PDF);
  pdf.setName(String(filenamePdf || 'menu.pdf'));
  return pdf;
}

function getMenusState_() {
  var raw = propRead_('MENUS');
  if (!raw) return { ok: true, source: 'props', state: null };
  try {
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: true, source: 'props', state: null };
    }
    // Ignore empty stub so a fresh phone does not wipe local dishes.
    var book = parsed.book || {};
    var hasDish = false;
    Object.keys(book).forEach(function (k) {
      if (Array.isArray(book[k]) && book[k].length) hasDish = true;
    });
    if (!hasDish) return { ok: true, source: 'props', state: null };
    return { ok: true, source: 'props', state: parsed };
  } catch (e) {
    return { ok: false, error: 'Could not read shared menus state: ' + String(e && e.message ? e.message : e) };
  }
}

function saveMenusState_(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Missing state' };
  }
  if (!raw.book || typeof raw.book !== 'object') {
    return { ok: false, error: 'Missing state.book' };
  }
  var updatedAt = Number(raw.updatedAt) || Date.now();
  var state = {
    updatedAt: updatedAt,
    book: raw.book,
    metaBook: raw.metaBook && typeof raw.metaBook === 'object' ? raw.metaBook : {},
    includes: raw.includes && typeof raw.includes === 'object' ? raw.includes : {},
    promoBank: Array.isArray(raw.promoBank) ? raw.promoBank : [],
    promoTicks: raw.promoTicks && typeof raw.promoTicks === 'object' ? raw.promoTicks : {},
    sectionLayout: raw.sectionLayout && typeof raw.sectionLayout === 'object' ? raw.sectionLayout : {},
    // Shared dish catalogue (deduped titles + price history) for autocomplete.
    dishCatalogue: Array.isArray(raw.dishCatalogue) ? raw.dishCatalogue : [],
    extraMenus: Array.isArray(raw.extraMenus) ? raw.extraMenus : [],
    extraSections: Array.isArray(raw.extraSections) ? raw.extraSections : []
  };
  propWrite_('MENUS', JSON.stringify(state));
  return { ok: true, source: 'props', updatedAt: updatedAt };
}
