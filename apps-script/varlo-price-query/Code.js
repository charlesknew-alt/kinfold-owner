/**
 * Varlo Price Query — shared Drink Pricing for Eight Bells + Windmill managers.
 *
 * Source of truth: Kinfold Inns — Invoice Management System spreadsheet
 *   - Category Config (GP / cash / wastage) when present
 *   - Price Query History (owner-visible log of manager queries)
 *
 * Live /exec is deployed from this project. Managers open:
 *   .../exec?venue=eightbells   or   .../exec?venue=windmill
 */

var INVOICE_SPREADSHEET_IDS = [
  '1GTsuJrbhrKRSP0tUMfnOPkaDX-b5UCfT4Xt0slZui3w',
  '1eloQsSzFv-h9kP_Vs39j1gcqZKz5fa4YtvfqMQwD4-Y'
];

var HISTORY_SHEET = 'Price Query History';
var CATEGORY_SHEET_CANDIDATES = [
  'Category Config',
  'Categories',
  'CATEGORY CONFIG',
  'CategoryConfig'
];

/** Pack-mode defaults when Category Config has no mode/unit columns. */
var MODE_DEFAULTS = {
  'Cask': { mode: 'draught', unit: 'gal', wastage: 0.10, cash: 3.50, gp: 0.675 },
  'Lager': { mode: 'draught', unit: 'L', wastage: 0.05, cash: 3.50, gp: 0.675 },
  'Cider': { mode: 'draught', unit: 'L', wastage: 0.05, cash: 3.50, gp: 0.700 },
  'Craft Keg': { mode: 'draught', unit: 'L', wastage: 0.05, cash: 3.50, gp: 0.675 },
  'Draught Alcoholic': { mode: 'draught', unit: 'L', wastage: 0.07, cash: 3.50, gp: 0.700 },
  'Draught Soft': { mode: 'draught', unit: 'L', wastage: 0.03, cash: 0, gp: 0.650 },
  'Spirits': { mode: 'spirit', wastage: 0.02, cash: 3.00, gp: 0.750 },
  'Wines': { mode: 'wine', wastage: 0, cash: 0, gp: 0.680 },
  'Bottled Beer & Cider': { mode: 'each', wastage: 0, cash: 0, gp: 0.650 },
  'Soft Drinks': { mode: 'each', wastage: 0, cash: 0, gp: 0.650 },
  'Snacks & Sundries': { mode: 'each', wastage: 0, cash: 0, gp: 0.550 }
};

var VENUE_LABELS = {
  eightbells: 'The Eight Bells, Bolney',
  eb: 'The Eight Bells, Bolney',
  'eight bells': 'The Eight Bells, Bolney',
  windmill: 'The Windmill Inn, Littleworth',
  wm: 'The Windmill Inn, Littleworth',
  'windmill inn': 'The Windmill Inn, Littleworth'
};

function doGet(e) {
  e = e || {};
  var p = e.parameter || {};
  var venueKey = normalizeVenueKey_(p.venue || p.pub || p.role || '');
  var venueLabel = VENUE_LABELS[venueKey] || 'Varlo';
  var t = HtmlService.createTemplateFromFile('Index');
  t.venueKey = venueKey || 'eightbells';
  t.venueLabel = venueLabel;
  t.webAppUrl = ScriptApp.getService().getUrl();
  return t.evaluate()
    .setTitle('Varlo · Price Query')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include_(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Client: load category map (Category Config + mode defaults). */
function getPriceQueryCategories() {
  var fromSheet = readCategoryConfigFromInvoice_();
  var out = {};
  Object.keys(MODE_DEFAULTS).forEach(function (key) {
    var d = MODE_DEFAULTS[key];
    var s = fromSheet[key] || fromSheet[key.toLowerCase()] || null;
    out[key] = {
      mode: (s && s.mode) || d.mode,
      unit: (s && s.unit) || d.unit || null,
      gp: (s && isFinite(s.gp)) ? s.gp : d.gp,
      cash: (s && isFinite(s.cash)) ? s.cash : d.cash,
      wastage: (s && isFinite(s.wastage)) ? s.wastage : d.wastage,
      source: s ? 'category-config' : 'default'
    };
  });
  // Include any extra Bar categories from the sheet that we know how to mode-map
  Object.keys(fromSheet).forEach(function (key) {
    if (out[key]) return;
    var s = fromSheet[key];
    if (!s || !s.mode) return;
    out[key] = s;
    out[key].source = 'category-config';
  });
  return {
    ok: true,
    categories: out,
    configSource: Object.keys(fromSheet).length ? 'invoice-category-config' : 'built-in-defaults',
    spreadsheetId: openInvoiceSpreadsheet_().getId()
  };
}

/**
 * Client: persist a manager query so the owner can see it.
 * Writes Price Query History on the Invoice Management spreadsheet
 * (same workbook as Invoicing Category Config / price tools).
 */
function logPriceQuery(entry) {
  entry = entry || {};
  var ss = openInvoiceSpreadsheet_();
  var sh = ensureHistorySheet_(ss);
  var venueKey = normalizeVenueKey_(entry.venueKey || entry.venue || '');
  var venueLabel = VENUE_LABELS[venueKey] || String(entry.venueLabel || venueKey || '');
  var row = [
    new Date(),
    venueLabel,
    venueKey,
    String(entry.productName || ''),
    String(entry.category || ''),
    Number(entry.packCostExVat) || '',
    Number(entry.vatPct) || '',
    Number(entry.serves) || '',
    Number(entry.costPerServe) || '',
    Number(entry.suggestedGp) || '',
    Number(entry.suggestedCash) || '',
    Number(entry.suggestedBlended) || '',
    Number(entry.gpAchievedPct) || '',
    String(entry.role || 'manager'),
    Session.getActiveUser().getEmail() || ''
  ];
  sh.appendRow(row);
  return { ok: true, sheet: HISTORY_SHEET, spreadsheetId: ss.getId() };
}

function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

// ── internals ──────────────────────────────────────────────────────────

function normalizeVenueKey_(raw) {
  var s = String(raw || '').trim().toLowerCase();
  if (!s) return '';
  if (VENUE_LABELS[s]) {
    if (s === 'eb' || s.indexOf('eight') >= 0) return 'eightbells';
    if (s === 'wm' || s.indexOf('windmill') >= 0) return 'windmill';
    return s;
  }
  if (s.indexOf('eight') >= 0 || s.indexOf('bolney') >= 0) return 'eightbells';
  if (s.indexOf('windmill') >= 0 || s.indexOf('littleworth') >= 0) return 'windmill';
  return s;
}

function openInvoiceSpreadsheet_() {
  var lastErr = null;
  for (var i = 0; i < INVOICE_SPREADSHEET_IDS.length; i++) {
    try {
      return SpreadsheetApp.openById(INVOICE_SPREADSHEET_IDS[i]);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error('Cannot open Invoice Management spreadsheet: ' + (lastErr && lastErr.message));
}

function ensureHistorySheet_(ss) {
  var sh = ss.getSheetByName(HISTORY_SHEET);
  if (!sh) {
    sh = ss.insertSheet(HISTORY_SHEET);
    sh.appendRow([
      'Timestamp',
      'Venue',
      'Venue key',
      'Product',
      'Category',
      'Pack cost ex VAT',
      'VAT %',
      'Serves',
      'Cost per serve',
      'Suggested @GP',
      'Suggested @Cash',
      'Suggested blended',
      'GP% at blended',
      'Role',
      'User email'
    ]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readCategoryConfigFromInvoice_() {
  var ss = openInvoiceSpreadsheet_();
  var sh = null;
  for (var i = 0; i < CATEGORY_SHEET_CANDIDATES.length; i++) {
    sh = ss.getSheetByName(CATEGORY_SHEET_CANDIDATES[i]);
    if (sh) break;
  }
  if (!sh) {
    // Fuzzy: any sheet whose name contains "categor"
    var sheets = ss.getSheets();
    for (var j = 0; j < sheets.length; j++) {
      if (/categor/i.test(sheets[j].getName())) {
        sh = sheets[j];
        break;
      }
    }
  }
  if (!sh) return {};

  var values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return {};

  var headers = values[0].map(function (h) {
    return String(h || '').trim().toLowerCase();
  });

  function col(names) {
    for (var n = 0; n < names.length; n++) {
      var idx = headers.indexOf(names[n]);
      if (idx >= 0) return idx;
    }
    return -1;
  }

  var iSub = col(['subcategory', 'category', 'name', 'sub category']);
  var iDept = col(['department', 'dept']);
  var iGp = col(['targetgp', 'target gp', 'gp%', 'gp', 'target_gp']);
  var iCash = col(['cash', 'cash target', 'cashtarget', 'cash_target', '£ cash']);
  var iWaste = col(['wastage', 'waste', 'wastage%', 'waste%']);
  var iMode = col(['mode', 'pricing mode', 'pack mode']);
  var iUnit = col(['unit', 'default unit']);
  var iActive = col(['active', 'enabled']);

  if (iSub < 0) iSub = 0;

  var map = {};
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var sub = String(row[iSub] || '').trim();
    if (!sub) continue;
    if (iActive >= 0) {
      var a = row[iActive];
      if (a === false || a === 0 || String(a).toLowerCase() === 'no' || String(a).toLowerCase() === 'n') continue;
    }
    if (iDept >= 0) {
      var dept = String(row[iDept] || '').trim().toLowerCase();
      // Price Query is bar drinks — skip obvious kitchen/rooms rows unless named in MODE_DEFAULTS
      if (dept && dept !== 'bar' && !MODE_DEFAULTS[sub]) continue;
    }

    var def = MODE_DEFAULTS[sub] || {};
    var gpRaw = iGp >= 0 ? row[iGp] : '';
    var gp = parseGp_(gpRaw, def.gp);
    var cash = iCash >= 0 ? parseFloat(row[iCash]) : def.cash;
    if (!isFinite(cash)) cash = def.cash || 0;
    var waste = iWaste >= 0 ? parseWaste_(row[iWaste], def.wastage) : (def.wastage || 0);
    var mode = iMode >= 0 && row[iMode] ? String(row[iMode]).trim().toLowerCase() : (def.mode || '');
    var unit = iUnit >= 0 && row[iUnit] ? String(row[iUnit]).trim() : (def.unit || null);
    if (!mode) continue;

    map[sub] = {
      mode: mode,
      unit: unit,
      gp: gp,
      cash: cash,
      wastage: waste
    };
  }
  return map;
}

function parseGp_(raw, fallback) {
  if (raw === '' || raw === null || raw === undefined) return fallback;
  var n = Number(raw);
  if (!isFinite(n)) {
    var s = String(raw).replace(/%/g, '').trim();
    n = Number(s);
  }
  if (!isFinite(n)) return fallback;
  // Sheet may store 67.5 or 0.675
  if (n > 1) n = n / 100;
  return n;
}

function parseWaste_(raw, fallback) {
  if (raw === '' || raw === null || raw === undefined) return fallback || 0;
  var n = Number(raw);
  if (!isFinite(n)) {
    n = Number(String(raw).replace(/%/g, '').trim());
  }
  if (!isFinite(n)) return fallback || 0;
  if (n > 1) n = n / 100;
  return n;
}
