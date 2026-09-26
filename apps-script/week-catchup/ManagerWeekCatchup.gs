/**
 * PubSystemLib — ManagerWeekCatchup.gs
 *
 * PROBLEM
 * -------
 * Manager hub uses “most recent DRAFT by week-ending date”.
 * If a current-calendar-week draft exists (e.g. WEEK_20SEP26) while older
 * weeks after the last owner-submitted week were never done, the hub jumps
 * ahead. Paperwork should continue from Monday of the FIRST week AFTER the
 * last SUBMITTED/APPROVED week (catch-up order).
 *
 * Finished WEEK_ tabs are moved to ARCHIVE_SPREADSHEET_ID, so the live book
 * may only contain the mistaken current-week draft. Last completed week is
 * taken from live SUBMITTED/APPROVED tabs, leftover WE*_MASTER sheets, and
 * the archive workbook.
 *
 * DEPLOYED: PubSystemLib 4.25+ (catch-up reads archive/master).
 *
 * Does not change owner Pending / Archive filters.
 */

var _lastOwnerPipelineCache = null;
var _lastOwnerPipelineCacheKey = '';

/**
 * Latest week that has left the manager desk toward the owner.
 * Looks at live WEEK_ (SUBMITTED/APPROVED), live WE*_MASTER, and archive WEEK_.
 */
function findLastOwnerPipelineWeek_(ss, cfg) {
  cfg = cfg || {};
  var key = '';
  try { key = String(ss.getId()); } catch (e0) { key = 'ss'; }
  key += '|' + (cfg.ARCHIVE_SPREADSHEET_ID || '');
  if (_lastOwnerPipelineCache && _lastOwnerPipelineCacheKey === key) {
    return _lastOwnerPipelineCache;
  }

  var best = null;
  function consider(weekEnd, status, sheet) {
    if (!weekEnd) return;
    weekEnd = stripTime_(weekEnd);
    if (!best || weekEnd.getTime() > best.weekEnd.getTime()) {
      best = { sheet: sheet || null, weekEnd: weekEnd, status: status || 'APPROVED' };
    }
  }

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name.indexOf('WEEK_') === 0) {
      var status = String(sh.getRange('A1').getValue() || '').toUpperCase();
      if (status.indexOf('SUBMITTED') === -1 && status.indexOf('APPROVED') === -1) continue;
      consider(catchupWeekEndFromSheet_(sh, name), status, sh);
      continue;
    }
    var master = parseMasterSheetNameCatchup_(name);
    if (master) {
      var fromA2 = null;
      try {
        var a2 = sh.getRange('A2').getValue();
        if (a2 instanceof Date && !isNaN(a2.getTime())) fromA2 = stripTime_(a2);
      } catch (e1) {}
      consider(fromA2 || master, 'APPROVED', sh);
    }
  }

  if (cfg.ARCHIVE_SPREADSHEET_ID) {
    try {
      var archive = SpreadsheetApp.openById(cfg.ARCHIVE_SPREADSHEET_ID);
      var aSheets = archive.getSheets();
      for (var j = 0; j < aSheets.length; j++) {
        var an = aSheets[j].getName();
        if (an.indexOf('WEEK_') !== 0) continue;
        consider(parseWeekSheetNameCatchup_(an) || catchupWeekEndFromSheet_(aSheets[j], an), 'APPROVED', aSheets[j]);
      }
    } catch (ae) {
      Logger.log('ManagerWeekCatchup: archive scan failed: ' + ae);
    }
  }

  _lastOwnerPipelineCache = best;
  _lastOwnerPipelineCacheKey = key;
  return best;
}

function managerCatchupTargetEnd_(ss, cfg) {
  var last = findLastOwnerPipelineWeek_(ss, cfg);
  if (!last) return null;
  var targetEnd = new Date(last.weekEnd.getTime());
  targetEnd.setDate(targetEnd.getDate() + 7); // next Sunday week-ending
  return stripTime_(targetEnd);
}

/**
 * Active manager week sheet: first week AFTER last submitted/approved/archived.
 * Does not pick a later calendar draft while that catch-up week is still open.
 */
function findManagerCatchupWeekSheet_(ss, cfg, createIfMissing) {
  var targetEnd = managerCatchupTargetEnd_(ss, cfg);
  if (!targetEnd) return null;

  var expectName = formatWeekSheetNameCatchup_(targetEnd);
  var existing = ss.getSheetByName(expectName);
  if (existing && !catchupWeekIsDone_(existing)) return existing;

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name.indexOf('WEEK_') !== 0) continue;
    var weekEnd = catchupWeekEndFromSheet_(sh, name);
    if (!weekEnd || weekEnd.getTime() !== targetEnd.getTime()) continue;
    if (!catchupWeekIsDone_(sh)) return sh;
  }

  // Never return a later calendar draft (that is the hub jump-ahead bug).
  if (createIfMissing && typeof createCatchupWeekSheet_ === 'function') {
    return createCatchupWeekSheet_(ss, targetEnd, cfg);
  }

  Logger.log(
    'ManagerWeekCatchup: need week ending ' +
      Utilities.formatDate(targetEnd, 'Europe/London', 'yyyy-MM-dd') +
      ' (' + expectName + ')'
  );
  return null;
}

function catchupWeekIsDone_(sh) {
  var status = String(sh.getRange('A1').getValue() || '').toUpperCase();
  return status.indexOf('SUBMITTED') !== -1 || status.indexOf('APPROVED') !== -1;
}

/**
 * Block “Start new week” if a later calendar week would skip unfinished catch-up.
 * Return null to allow; or { success:false, message } to stop.
 */
function assertManagerWeekNotJumpingAhead_(ss, cfg) {
  var catchup = findManagerCatchupWeekSheet_(ss, cfg, false);
  if (!catchup) return null;
  var catchEnd = catchupWeekEndFromSheet_(catchup, catchup.getName());
  if (!catchEnd) return null;

  var cal = currentCalendarWeekEndingSunday_();
  if (cal.getTime() <= catchEnd.getTime()) return null;

  return {
    success: false,
    message:
      'Finish week ending ' +
      Utilities.formatDate(catchEnd, 'Europe/London', 'dd MMM yyyy') +
      ' (' + catchup.getName() + ') before starting a later week. ' +
      'Manager paperwork must catch up in order after the last week submitted to the owner.'
  };
}

function wrapCatchupDraftWeek_(cfg, sheet) {
  var weekEnding = sheet.getRange('K3').getValue();
  var daysCompleted = countCompletedDays(sheet);
  var expectedDays = countExpectedDays(sheet);
  var weeklyDataComplete = isWeeklyDataComplete(cfg, sheet);
  return {
    name: sheet.getName(),
    sheet: sheet,
    date: weekEnding ? new Date(weekEnding) : null,
    daysCompleted: daysCompleted,
    expectedDays: expectedDays,
    weeklyDataComplete: weeklyDataComplete,
    isComplete: daysCompleted >= expectedDays && weeklyDataComplete,
    isReadyToSubmit: daysCompleted >= expectedDays && weeklyDataComplete
  };
}

function createCatchupWeekSheet_(ss, weekEndDate, cfg) {
  cfg = _mergeConfig(cfg);
  var template = ss.getSheetByName((cfg.SHEETS && cfg.SHEETS.TEMPLATE) || 'END OF WEEK');
  if (!template) {
    Logger.log('ManagerWeekCatchup: END OF WEEK template not found');
    return null;
  }
  var created = _createWeekSheetFromTemplate(cfg, ss, template, weekEndDate, false);
  if (created && created.success && created.weekName) {
    return ss.getSheetByName(created.weekName);
  }
  var expectName = formatWeekSheetNameCatchup_(weekEndDate);
  var existing = ss.getSheetByName(expectName);
  if (existing) return existing;
  Logger.log('ManagerWeekCatchup: create failed: ' + ((created && created.message) || 'unknown'));
  return null;
}

function hasManagerCatchupGap_(ss, cfg) {
  return !!(managerCatchupTargetEnd_(ss, cfg) && !findManagerCatchupWeekSheet_(ss, cfg, false));
}

// ── helpers ─────────────────────────────────────────────────────────────────

function stripTime_(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function currentCalendarWeekEndingSunday_() {
  var now = new Date();
  var london = Utilities.formatDate(now, 'Europe/London', 'yyyy-MM-dd');
  var p = london.split('-');
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  var day = d.getDay(); // 0 Sun
  var add = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + add);
  return stripTime_(d);
}

/** Prefer K3 date; else parse WEEK_02AUG26 style names. */
function catchupWeekEndFromSheet_(sh, name) {
  try {
    var k3 = sh.getRange('K3').getValue();
    if (k3 instanceof Date && !isNaN(k3.getTime())) return stripTime_(k3);
  } catch (e) {}
  return parseWeekSheetNameCatchup_(name);
}

function parseWeekSheetNameCatchup_(name) {
  // WEEK_02AUG26 or WEEK_2AUG26
  var m = String(name || '').match(/^WEEK_(\d{1,2})([A-Z]{3})(\d{2})$/i);
  if (!m) return null;
  var months = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };
  var mon = months[m[2].toUpperCase()];
  if (mon == null) return null;
  var year = 2000 + parseInt(m[3], 10);
  return stripTime_(new Date(year, mon, parseInt(m[1], 10)));
}

function parseMasterSheetNameCatchup_(name) {
  var m = String(name || '').match(/^WE(\d{1,2}[A-Z]{3}\d{2})_MASTER$/i);
  if (!m) return null;
  return parseWeekSheetNameCatchup_('WEEK_' + m[1]);
}

function formatWeekSheetNameCatchup_(weekEnd) {
  var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var dd = ('0' + weekEnd.getDate()).slice(-2);
  var mon = months[weekEnd.getMonth()];
  var yy = String(weekEnd.getFullYear()).slice(-2);
  return 'WEEK_' + dd + mon + yy;
}
