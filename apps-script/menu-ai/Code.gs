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
    hint: 'POST actions: listPrintHistory, savePrintHistory, getPrintHistory, deletePrintHistory, getMenusState, saveMenusState, reviewLayout; or imageBase64 for AI read'
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
    'Your job: if ANY pair of opposite columns will not finish level, you MUST add feature panels ' +
    'under the shorter stack. Do not release uneven columns. This applies to every generation — ' +
    'Sandwiches vs Burgers, Sides vs Sandwiches, Events vs Classics, or any other opposite pair.\n' +
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
    '- Maximise that shared size: the packed page is the ceiling. Move Sandwiches (incl. tip/sell box), ' +
    'Sides, or feature panels OFF the packed page onto the roomier page so both can enlarge together.\n' +
    '- Prefer sandwichesOn page1 (named fillings OR tip/sell box) whenever page 2 holds mains + desserts — ' +
    'do not park the sandwich sell box on page 2 next to desserts if page 1 has room.\n' +
    '- Prefer fewer feature panels on the packed page over shrinking type. One panel is enough when two ' +
    'would force smaller shared type.\n' +
    '- After type is set, both pages should fill top→bottom (no blank bottom third with content jammed up).\n' +
    '- Moving Sandwiches / Sides / feature boxes between pages to equalise fill is required when it raises ' +
    'shared type; inventing a third page is not.\n' +
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
    '1. COLUMNS start on the same top baseline and finish at the same bottom point.\n' +
    '2. PAGE COUNT: only ONE or TWO pages. Never a third. Fill each used page top to bottom evenly.\n' +
    '3. READABILITY: never shrink below comfortable type. Prefer tight over compact.\n' +
    '4. Feature panels: prefer contrasting frames (box beside wide/oval). Use Stay a While / Gatherings / quiz wording.\n' +
    '5. PAGE 1: LEFT often Sandwiches/events/Sharing; RIGHT = Burgers then Pub Classics.\n' +
    '6. Allergy footer must stay visible; lunch-club key stays in footer when ticked.\n' +
    '7. Prefer sandwichesOn page1 (fillings or sell box) so page 2 mains/desserts can stay large. ' +
    'Move sidesOn to page1 when that raises the shared density.\n' +
    '8. Respect party paper choice (A4 or 2×A5).\n' +
    '9. SECTION WIDTH “both” / best-fit: choose column OR full for balance on THIS sheet.\n' +
    'Layout JSON follows:\n' + JSON.stringify(layout).slice(0, 7000);

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
  var sandwichesOn = String(advice.sandwichesOn || 'page1').toLowerCase();
  if (['page1', 'page2', 'omit'].indexOf(sandwichesOn) === -1) sandwichesOn = 'page1';
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

/* ——— Shared staff data (Script Properties) ———
 * Survives across phones/PCs without Drive OAuth.
 *   MENUS_*   — live dishes / meta / promos / layout
 *   HISTIDX + HIST_{id}_* — generated print sheets (capped for quota)
 */

var HISTORY_MAX_ = 12;
var PROP_CHUNK_ = 8500;

function propDeletePrefix_(props, prefix) {
  var oldN = parseInt(props.getProperty(prefix + '_n') || '0', 10) || 0;
  var keys = [prefix + '_n'];
  for (var i = 0; i < oldN + 5; i++) keys.push(prefix + '_' + i);
  keys.forEach(function (k) {
    try { props.deleteProperty(k); } catch (e) {}
  });
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
  props.setProperties(batch, false);
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

function historyDeleteHtml_(id) {
  var safe = historySafeId_(id);
  if (!safe) return;
  propDelete_('HIST_' + safe);
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

function listPrintHistory_() {
  var list = historyPrune_(historyReadIndex_());
  historyWriteIndex_(list);
  return { ok: true, source: 'props', items: list };
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
  try {
    propWrite_('HIST_' + safe, String(raw.html));
  } catch (e) {
    // Quota — drop older sheets and retry once.
    var slim = historyPrune_(historyReadIndex_()).slice(0, Math.max(3, HISTORY_MAX_ - 4));
    historyReadIndex_().forEach(function (r) {
      if (!slim.some(function (k) { return k.id === r.id; })) historyDeleteHtml_(r.id);
    });
    historyWriteIndex_(slim);
    propWrite_('HIST_' + safe, String(raw.html));
  }
  var list = historyReadIndex_().filter(function (r) { return r.id !== meta.id; });
  list.unshift(meta);
  list = historyPrune_(list);
  historyWriteIndex_(list);
  return { ok: true, source: 'props', entry: meta };
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
  var html = propRead_('HIST_' + id);
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
  return { ok: true, source: 'props', id: id };
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
    sectionLayout: raw.sectionLayout && typeof raw.sectionLayout === 'object' ? raw.sectionLayout : {}
  };
  propWrite_('MENUS', JSON.stringify(state));
  return { ok: true, source: 'props', updatedAt: updatedAt };
}
