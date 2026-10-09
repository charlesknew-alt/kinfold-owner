/**
 * ============================================================================
 * PubSystemLib — Templates_Serve.gs (v4.3 - clean)
 * ============================================================================
 * Public serve* functions used by venue doGet to render HTML.
 * Each function applies venue branding (paint colours, identity text) and
 * returns HtmlOutput.
 *
 * Tokens substituted in _applyBranding:
 *   __SHARED_STYLES__       - the shared design system stylesheet
 *   __VARLO_MARK__          - inline Varlo SVG mark
 *   __VARLO_BOOT__          - phone/pad/pc screen-mode boot script
 *   __VENUE_NAME__          - "The Eight Bells"
 *   __VENUE_LOCATION__      - "Bolney"
 *   __VENUE_FULL__          - "The Eight Bells, Bolney"
 *   __VENUE_SHORT__         - "Eight Bells"
 *   __VENUE_EMOJI__         - legacy
 *   __PAINT__               - venue paint colour
 *   __PAINT_DEEP__          - darker variant (auto-derived if not set)
 *   __PAINT_PALE__          - lighter variant (auto-derived if not set)
 *   __PAINT_WASH__          - very pale tint (auto-derived if not set)
 *   __PRIMARY_COLOR__       - legacy alias for __PAINT__
 *   __WEEK_SHEET__          - week sheet name from URL param
 *   __DAY_INDEX__           - day index 0-6 from URL param
 *   __SHEET_NAME__          - legacy
 *   __WEEK_SHEET_NAME__     - legacy
 * ============================================================================
 */

function _applyBranding(html, cfg, params) {
  cfg = cfg || {};
  params = params || {};

  var paint = cfg.PAINT_COLOR || cfg.PRIMARY_COLOR || '#8E9B8A';
  var paintDeep = cfg.PAINT_DEEP || _shadeColor(paint, -25);
  var paintPale = cfg.PAINT_PALE || _shadeColor(paint, 25);
  var paintWash = cfg.PAINT_WASH || _shadeColor(paint, 65);

  // Inject SHARED_STYLES first (so paint tokens inside it get substituted too)
  html = html.split('__SHARED_STYLES__').join(SHARED_STYLES);
  html = html.split('__VARLO_HEADER_MENU__').join(VARLO_HEADER_WITH_MENU);
  html = html.split('__VARLO_HEADER_OWNER_MENU__').join(VARLO_HEADER_OWNER_WITH_MENU);
  html = html.split('__VARLO_MARK__').join(VARLO_MARK_SVG);
  html = html.split('__VARLO_BOOT__').join(VARLO_BOOT_JS);
  try {
    html = html.split('__HOSPITALITY_YARNS_JSON__').join(JSON.stringify(getHospitalityYarnBank_()));
  } catch (yarnErr) {
    html = html.split('__HOSPITALITY_YARNS_JSON__').join(JSON.stringify(HOSPITALITY_YARNS_ || []));
  }

  var tokens = {
    '__VENUE_NAME__':       cfg.VENUE_NAME       || 'The Pub',
    '__VENUE_LOCATION__':   cfg.VENUE_LOCATION   || '',
    '__VENUE_FULL__':       cfg.VENUE_FULL       || cfg.VENUE_NAME || 'The Pub',
    '__VENUE_SHORT__':      cfg.VENUE_SHORT      || cfg.VENUE_NAME || 'Pub',
    '__VENUE_EMOJI__':      cfg.VENUE_EMOJI      || '🍺',
    '__PAINT__':            paint,
    '__PAINT_DEEP__':       paintDeep,
    '__PAINT_PALE__':       paintPale,
    '__PAINT_WASH__':       paintWash,
    '__PRIMARY_COLOR__':    paint,
    '__GRADIENT_FROM__':    paintDeep,
    '__GRADIENT_TO__':      paint,
    // Chips navigate with ?week=WEEK_… — HtmlService iframes drop query
    // strings, so week must be baked into __WEEK_SHEET__ server-side.
    '__WEEK_SHEET__':       params.weekSheet || params.week || params.weekKey || params.sheetName || '',
    '__DAY_INDEX__':        String(params.dayIndex == null ? '0' : params.dayIndex),
    '__SHEET_NAME__':       params.sheetName || params.weekSheet || params.week || params.weekKey || '',
    '__WEEK_SHEET_NAME__':  params.weekSheet || params.sheetName || params.week || params.weekKey || ''
  };
  for (var token in tokens) {
    html = html.split(token).join(tokens[token]);
  }
  return html;
}

function _wrap(html, cfg, title) {
  cfg = _mergeConfig(cfg);
  var fullTitle = 'Varlo · ' + (cfg.VENUE_SHORT || 'Pub') + ' — ' + title;
  return HtmlService.createHtmlOutput(html)
    .setTitle(fullTitle)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _buildServeParams(params) {
  params = params || {};
  // Owner/manager chips use ?week=WEEK_…; bake that into weekSheet so
  // _applyBranding can fill __WEEK_SHEET__ (iframe sandbox loses query params).
  var weekSheet = params.weekSheet || params.week || params.weekKey || params.sheet || '';
  return {
    week: weekSheet,
    weekKey: weekSheet,
    weekSheet: weekSheet,
    dayIndex: String(params.day == null ? (params.dayIndex == null ? '0' : params.dayIndex) : params.day),
    sheetName: params.sheet || weekSheet,
    ot: params.ot || '',
    ownerToken: params.ownerToken || '',
    ownerKey: params.ownerKey || '',
    // Owner portal handshake — must not be stripped
    shell: params.shell || '',
    portal: params.portal || '',
    from: params.from || '',
    role: params.role || ''
  };
}

var NOT_AUTHORISED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not authorised</title>
  __SHARED_STYLES__
  <style>
    body.varlo-shell { margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
    .na-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 20px; }
    .na-card { max-width: 420px; text-align: center; }
    .na-card h1 { font-size: 1.4rem; margin: 0 0 8px; color: var(--ink, #1a1a1a); }
    .na-card p { margin: 0 0 20px; color: var(--ink-muted, #5a5a5a); line-height: 1.45; }
    .na-card a {
      display: inline-block; padding: 12px 20px; border-radius: 8px;
      background: var(--paint, #8E9B8A); color: #fff; text-decoration: none; font-weight: 600;
    }
  </style>
</head>
<body class="varlo-shell">
__VARLO_BOOT__
<header class="ps-header varlo-header">
  <div class="ps-header-inner">
    <div class="varlo-brand">
      __VARLO_MARK__
      <div class="varlo-brand-text">
        <div class="varlo-word" aria-label="Varlo">Varlo</div>
        <div class="varlo-word-sub">__VENUE_FULL__ · Manager · <span class="varlo-mode-pip"></span></div>
      </div>
    </div>
  </div>
</header>
<main class="na-main">
  <div class="na-card">
    <h1>Not authorised</h1>
    <p>Owner tools are not available from the manager portal. Use the owner login, or open Owner Week Review from the spreadsheet menu.</p>
    <a href="?page=menu" target="_top">Back to manager hub</a>
  </div>
</main>
</body>
</html>`;

function serveNotAuthorised(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(NOT_AUTHORISED_HTML, cfg, params || {}), cfg, 'Not authorised');
}

function _serveOwnerOrDeny(cfg, params, serveFn) {
  cfg = _mergeConfig(cfg);
  params = params || {};
  if (!_allowOwnerAccess(cfg, params)) {
    return serveNotAuthorised(cfg, params);
  }
  return serveFn(cfg, params);
}

// ============================================================================
// SERVE FUNCTIONS — one per page. Each applies branding and wraps the
// template constant from Templates_Menus/Forms/Views/Utils.
// ============================================================================

function serveMainMenu(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(MAIN_MENU_HTML, cfg, params), cfg, 'Manager');
}
function serveOwnerMenu(cfg, params) {
  return _serveOwnerOrDeny(cfg, params, function(c, p) {
    return _wrap(_applyBranding(OWNER_MENU_HTML, c, p), c, 'Owner');
  });
}
function serveCardDay(cfg, params) {
  return _serveOwnerOrDeny(cfg, params, function(c, p) {
    return _wrap(_applyBranding(CARD_DAY_HTML, c, p), c, 'Card Takings');
  });
}
function serveDailyEntryForm(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(teyaInjectDailyPrefill_(cfg, DAILY_FORM_HTML), cfg, params), cfg, 'Daily Entry');
}
function serveWeeklyForm(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(WEEKLY_FORM_HTML, cfg, params), cfg, 'Weekly Cash Up');
}
function serveOwnerWeekReview(cfg, params) {
  return _serveOwnerOrDeny(cfg, params, function(c, p) {
    return _wrap(_applyBranding(OWNER_REVIEW_STANDALONE_HTML, c, p), c, 'Owner Review');
  });
}
function serveMasterSheetView(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(MASTER_VIEW_HTML, cfg, params), cfg, 'Master Sheet');
}
function serveAllWeeksStatus(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(ALL_WEEKS_HTML, cfg, params), cfg, 'All Weeks');
}
function serveWeekReport(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(WEEK_REPORT_HTML, cfg, params), cfg, 'Week Report');
}
function serveSelectWeek(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(SELECT_WEEK_HTML, cfg, params), cfg, 'Select Week');
}
function serveSetTabAnchor(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(SET_TAB_ANCHOR_HTML, cfg, params), cfg, 'Tab Anchor');
}
function serveStyledDialog(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(STYLED_DIALOG_HTML, cfg, params), cfg, 'Dialog');
}
function serveKegCosting(cfg, params) {
  cfg = _mergeConfig(cfg);
  return _wrap(_applyBranding(KEG_COSTING_HTML, cfg, params), cfg, 'Price Query');
}

/**
 * Returns the inner body content of a page as a string. Reserved for future
 * SPA-style content swapping; currently not used by the active templates.
 * Kept here so the venue Code.gs getPageContent wrapper has something to call.
 */
function getPageContent(cfg, pageName, params) {
  cfg = _mergeConfig(cfg);
  params = params || {};
  var serveParams = _serveParamsFromRequest(params);
  var ownerPages = { owner: 1, ownermenu: 1, ownerreview: 1, cardday: 1 };
  if (ownerPages[pageName] && !_allowOwnerAccess(cfg, Object.assign({}, params, serveParams))) {
    var denied = _applyBranding(NOT_AUTHORISED_HTML, cfg, serveParams);
    var deniedMatch = denied.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return deniedMatch ? deniedMatch[1] : denied;
  }
  var template;
  switch (pageName) {
    case 'menu':        template = MAIN_MENU_HTML; break;
    case 'owner':
    case 'ownermenu':   template = OWNER_MENU_HTML; break;
    case 'daily':       template = DAILY_FORM_HTML; break;
    case 'weekly':      template = WEEKLY_FORM_HTML; break;
    case 'masterview':  template = MASTER_VIEW_HTML; break;
    case 'ownerreview': template = OWNER_REVIEW_STANDALONE_HTML; break;
    case 'cardday':     template = CARD_DAY_HTML; break;
    case 'allweeks':    template = ALL_WEEKS_HTML; break;
    case 'weekreport':  template = WEEK_REPORT_HTML; break;
    case 'selectweek':  template = SELECT_WEEK_HTML; break;
    case 'tabanchor':   template = SET_TAB_ANCHOR_HTML; break;
    case 'kegcosting':
    case 'pricequery':  template = KEG_COSTING_HTML; break;
    default:            template = MAIN_MENU_HTML;
  }
  var branded = _applyBranding(template, cfg, serveParams);
  var match = branded.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : branded;
}

/**
 * Default router used by venue doGet. Reads page param and routes.
 */
function routePage(cfg, e) {
  cfg = _mergeConfig(cfg);
  var params = (e && e.parameter) || {};
  var page = params.page || 'menu';
  var serveParams = _buildServeParams(params);
  switch (page) {
    case 'daily':       return serveDailyEntryForm(cfg, serveParams);
    case 'weekly':      return serveWeeklyForm(cfg, serveParams);
    case 'masterview':  return serveMasterSheetView(cfg, serveParams);
    case 'allweeks':    return serveAllWeeksStatus(cfg, serveParams);
    case 'ownerreview': return serveOwnerWeekReview(cfg, serveParams);
    case 'cardday':     return serveCardDay(cfg, serveParams);
    case 'owner':
    case 'ownermenu':   return serveOwnerMenu(cfg, serveParams);
    case 'selectweek':  return serveSelectWeek(cfg, serveParams);
    case 'tabanchor':   return serveSetTabAnchor(cfg, serveParams);
    case 'weekreport':  return serveWeekReport(cfg, serveParams);
    case 'kegcosting':
    case 'pricequery':  return serveKegCosting(cfg, serveParams);
    case 'menu':
    default:            return serveMainMenu(cfg, serveParams);
  }
}
