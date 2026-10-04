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
    if (action === 'savePrintHistory') {
      return json_(savePrintHistory_(body.entry || body));
    }
    if (action === 'getPrintHistory') {
      return json_(getPrintHistory_(body.id || (body.entry && body.entry.id)));
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
  if (action === 'getPrintHistory') return json_(getPrintHistory_(p.id));
  if (action === 'deletePrintHistory') return json_(deletePrintHistory_(p.id));
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
    hint: 'GET/POST actions: listPrintHistory, savePrintHistory, getPrintHistory, deletePrintHistory, emailPrintHistory, getMenusState, saveMenusState, reviewLayout, reviewSpelling; or ?bridge=1',
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
    if (action === 'savePrintHistory') return savePrintHistory_(body.entry || body);
    if (action === 'getPrintHistory') return getPrintHistory_(body.id || (body.entry && body.entry.id));
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
    'Your job: if ANY pair of opposite columns will not start and finish level, you MUST add feature panels ' +
    'under the shorter stack. Do not release uneven columns. This is a blanket layout rule for every pair — ' +
    'Little Bells vs Desserts, Sides vs Sandwiches, Sandwiches vs Burgers, Events vs Classics — never one special case.\n' +
    'Return ONLY valid JSON (no markdown):\n' +
    '{\n' +
    '  "density": "airy"|"roomy"|"normal"|"tight"|"compact",\n' +
    '  "sandwichesOn": "page1"|"page2"|"omit",\n' +
    '  "sidesOn": "page1"|"page2",\n' +
    '  "dropFootLogo": true|false,\n' +
    '  "okToPrint": true|false,\n' +
    '  "columnBalance": {\n' +
    '    "page1": { "shorter": "left"|"right"|"even", "panels": 0|1|2 },\n' +
    '    "page2": { "shorter": "left"|"right"|"even", "panels": 0|1|2 }\n' +
    '  },\n' +
    '  "notes": "one short sentence for staff"\n' +
    '}\n' +
    'SHARED TYPE SCALE (CRITICAL — blanket policy for every menu):\n' +
    '- Titles, dish names and descriptions must be the SAME size on page 1 and page 2.\n' +
    '- Never leave page 1 enlarged/airy while page 2 is compact/smaller — one density for the whole menu.\n' +
    '- Maximise that shared size: the packed page is the ceiling. Move Sides or feature panels ' +
    'OFF the packed page onto the roomier page so both can enlarge together.\n' +
    '- Sandwiches (fillings or tip/sell box) stay on page 2 in a column — quieter, lower-margin. ' +
    'Do not pull them onto page 1 to even leftover. Only use sandwichesOn page1 if page 2 cannot fit them.\n' +
    '- If layout.sandwichesLocked is true, sandwichesOn must be page1 or page2 — NEVER omit. Staff ticked Sandwiches; you only choose which page.\n' +
    '- If sandwichesLocked is false, sandwichesOn should be omit (they were not ticked on Dishes).\n' +
    '- Prefer fewer feature panels on the packed page over shrinking type. One panel is enough when two ' +
    'would force smaller shared type.\n' +
    '- Feature panels are LITTLE promotions — never a tall empty frame. Balance columns with food ' +
    '(Sides / sandwich sell box under the shorter stack) first; only then add a compact promo foot.\n' +
    '- dropFootLogo: true when keeping the page-2 logo would force tight/compact type — readable mains/desserts ' +
    'beat a second logo. Always prefer larger shared type over decorative chrome.\n' +
    '- After type is set, both pages should fill top→bottom (no blank bottom third with content jammed up).\n' +
    '- Moving Sides / feature boxes between pages to equalise fill is required when it raises ' +
    'shared type; inventing a third page is not. Leave Sandwiches on page 2.\n' +
    'COLUMN BALANCE RULES (mandatory before okToPrint):\n' +
    '- Read layout.columns (leftFood / rightFood / shorter). If shorter is left or right, panels MUST be 1 or 2.\n' +
    '- panels:0 is only allowed when shorter is "even".\n' +
    '- Large holes (big |gap|): panels=2 (stack event + rooms filler). Modest holes: panels=1.\n' +
    '- Put panels ONLY under the shorter side — never pile onto the taller food stack.\n' +
    '- Each event / feature title may appear ONLY ONCE on the whole menu. If page 1 used “Next Pub Quiz”, ' +
    'page 2 must pick a different unused title (e.g. Stay a While / Gatherings) — never reprint the same box.\n' +
    '- If page2 is null, omit page2 or set shorter:"even", panels:0.\n' +
    '- okToPrint may be true once columnBalance fixes the hole; set false only if type would be unreadable.\n' +
    'OTHER GOLDEN RULES:\n' +
    '1. COLUMNS start on the same top baseline and finish at the same bottom point. ' +
    'Category titles (Little Bells / Desserts / Sides / Sandwiches / Burgers / Classics) MUST share that top baseline. ' +
    'Frilly frames sit UNDER the title — they must not drop a heading below its neighbour. ' +
    'A little leftover under the shorter stack MUST get a small feature panel (panels:1). ' +
    'Do not leave a blank band under kids plates, puddings, sides or sandwiches. ' +
    'Solo column (no food partner) stays half-width; do not fill the empty half with rooms copy.\n' +
    '2. PAGE COUNT: only ONE or TWO pages. Never a third. Fill each used page top to bottom evenly.\n' +
    '3. READABILITY: never shrink below comfortable type. Prefer tight over compact.\n' +
    '4. Feature panels: prefer contrasting frames (box beside wide/oval). Use Stay a While / Gatherings / quiz wording.\n' +
    '5. PAGE 1: LEFT often Sharing/events; RIGHT = Burgers then Pub Classics. Sandwiches prefer page 2 column.\n' +
    '6. Allergy footer must stay visible; lunch-club key stays in footer when ticked.\n' +
    '7. Prefer sandwichesOn page2 (fillings or sell box), always as a column. ' +
    'Never omit sandwiches when sandwichesLocked is true. ' +
    'Move sidesOn to page1 when that raises the shared density.\n' +
    '8. Respect party paper choice (A4 or 2×A5).\n' +
    '9. SECTION WIDTH “both” / best-fit: choose column OR full for balance on THIS sheet.\n' +
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
    if (/^HIST_/i.test(k)) {
      try { props.deleteProperty(k); removed++; } catch (e) {}
    }
  });
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
    // Drop HTML blobs only — keep HISTIDX / HISTDEL so devices still list sheets.
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
    try { return DriveApp.getFolderById(id); } catch (e) {}
  }
  try {
    var folder = DriveApp.createFolder('Eight Bells Menu Print History');
    try { props.setProperty('HIST_FOLDER_ID', folder.getId()); } catch (e2) {}
    return folder;
  } catch (e3) {
    return null;
  }
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
var HISTORY_PROPS_HTML_MAX_ = 3;

function historyPrunePropsHtml_(list) {
  var sorted = historySortNewest_(list || []);
  sorted.slice(HISTORY_PROPS_HTML_MAX_).forEach(function (drop) {
    if (drop && drop.id) propDelete_('HIST_' + historySafeId_(drop.id));
  });
}

/** Ids that still have HIST_<id>_n HTML chunks in Script Properties. */
function historyDiscoverStoredIds_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties() || {};
  var ids = {};
  Object.keys(all).forEach(function (k) {
    var m = String(k).match(/^HIST_([a-zA-Z0-9_-]+)_n$/);
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

function historyMetaFromHtmlTitle_(id, html) {
  var title = '';
  var m = String(html || '').match(/<title>([^<]*)<\/title>/i);
  if (m) title = String(m[1] || '').trim();
  var roman = '';
  var rm = title.match(/—\s*([IVXLCDM]+)\s*$/);
  if (rm) roman = rm[1];
  var menuId = 'main';
  var menuName = 'Menu';
  if (/sunday/i.test(title)) {
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
  } else if (title) {
    menuName = title.replace(/\s+—\s*[IVXLCDM]+\s*$/, '').replace(/\s+Wk\b.*$/i, '').trim() || menuName;
  }
  var week = '';
  var wm = title.match(/\b((?:Sunday|Week of)\s+[^—]+)/i);
  if (wm) week = wm[1].replace(/\s+/g, ' ').trim();
  return {
    id: id,
    menuId: menuId,
    menuName: menuName,
    roman: roman,
    n: 0,
    week: week,
    weekKey: '',
    hideDate: false,
    generatedAt: Date.now(),
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
    var html = propRead_('HIST_' + id) || historyReadHtmlDrive_(id);
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
  // Clear legacy Script Properties chunks + Drive file.
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
  return {
    id: String(entry.id || ''),
    menuId: String(entry.menuId || 'main'),
    menuName: String(entry.menuName || entry.menuId || 'Menu'),
    roman: String(entry.roman || ''),
    n: entry.n || 0,
    week: String(entry.week || ''),
    weekKey: String(entry.weekKey || ''),
    hideDate: !!entry.hideDate,
    generatedAt: entry.generatedAt || Date.now(),
    dayKey: String(entry.dayKey || '')
  };
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

function listPrintHistory_() {
  var list = historyRebuildIndexIfEmpty_();
  list = historyPrune_(list);
  try { historyWriteIndex_(list); } catch (e) {}
  return { ok: true, source: 'props', items: list, deletedIds: historyReadDeleted_() };
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
  // Explicit save from a device re-adds the sheet (clears a prior delete tombstone).
  historyUnmarkDeleted_(safe);
  // Prefer Drive for HTML; fall back to Script Properties so phone can still
  // download when Drive OAuth has not been granted yet.
  propDelete_('HIST_' + safe);
  var htmlText = String(raw.html);
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
    try {
      propWrite_('HIST_' + safe, htmlText);
      if (propRead_('HIST_' + safe)) source = 'props';
    } catch (eProp) {
      if (isQuotaError_(eProp)) {
        // Drop older prop HTML and retry once.
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
  if (source === 'props') historyPrunePropsHtml_(list);
  try {
    historyWriteIndex_(list);
  } catch (e2) {
    if (isQuotaError_(e2)) {
      freeHistoryHtmlBlobs_();
      historyWriteIndex_(list.slice(0, Math.min(HISTORY_MAX_, HISTORY_PROPS_HTML_MAX_)));
    } else {
      throw e2;
    }
  }
  return {
    ok: true,
    source: source,
    entry: meta,
    warning: source === 'props'
      ? 'Stored in Script Properties (Drive not authorised yet — re-auth Apps Script for full archive)'
      : ''
  };
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
  // Prefer Drive; fall back to legacy Script Properties chunks.
  var html = historyReadHtmlDrive_(id) || propRead_('HIST_' + id);
  if (!html) {
    return { ok: false, error: 'Sheet not found in cloud history' };
  }
  var entry = meta ? historyMetaOnly_(meta) : {
    id: id,
    menuId: 'main',
    menuName: 'Menu',
    roman: '',
    n: 0,
    week: '',
    weekKey: '',
    hideDate: false,
    generatedAt: Date.now(),
    dayKey: ''
  };
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
