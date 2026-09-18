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
 * DEPLOYED 18 Sep 2026: PubSystemLib v71 (LIB_VERSION 4.24).
 * Eight Bells /exec @203 and Windmill /exec @54 pin library v71.
 *
 * INSTALL (PubSystemLib)
 * ----------------------
 * Wired into findMostRecentDraftWeek, _findWeekSheetForForm, and
 * startNewWeekImpl. Venues must pin this library version.
 *
 * Does not change owner Pending / Archive filters.
 */

/**
 * Latest week that has left the manager desk toward the owner.
 * Status in A1 (case-insensitive) containing SUBMITTED or APPROVED.
 */
function findLastOwnerPipelineWeek_(ss) {
  var sheets = ss.getSheets();
  var best = null; // { sheet, weekEnd, status }
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name.indexOf('WEEK_') !== 0) continue;
    var weekEnd = catchupWeekEndFromSheet_(sh, name);
    if (!weekEnd) continue;
    var status = String(sh.getRange('A1').getValue() || '').toUpperCase();
    if (status.indexOf('SUBMITTED') === -1 && status.indexOf('APPROVED') === -1) continue;
    if (!best || weekEnd.getTime() > best.weekEnd.getTime()) {
      best = { sheet: sh, weekEnd: weekEnd, status: status };
    }
  }
  return best;
}

function managerCatchupTargetEnd_(ss) {
  var last = findLastOwnerPipelineWeek_(ss);
  if (!last) return null;
  var targetEnd = new Date(last.weekEnd.getTime());
  targetEnd.setDate(targetEnd.getDate() + 7); // next Sunday week-ending
  return stripTime_(targetEnd);
}

/**
 * Active manager week sheet: first week AFTER last SUBMITTED/APPROVED.
 * Does not pick a later calendar draft while that catch-up week is still open.
 * Pass createIfMissing=true to create the WEEK_* tab via createCatchupWeekSheet_.
 * Returns null if no owner-pipeline week exists yet (brand-new venue).
 */
function findManagerCatchupWeekSheet_(ss, cfg, createIfMissing) {
  var targetEnd = managerCatchupTargetEnd_(ss);
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
      ' (' + expectName + ') — not creating from status read.'
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
function assertManagerWeekNotJumpingAhead_(ss) {
  var catchup = findManagerCatchupWeekSheet_(ss);
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

function formatWeekSheetNameCatchup_(weekEnd) {
  var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var dd = ('0' + weekEnd.getDate()).slice(-2);
  var mon = months[weekEnd.getMonth()];
  var yy = String(weekEnd.getFullYear()).slice(-2);
  return 'WEEK_' + dd + mon + yy;
}
