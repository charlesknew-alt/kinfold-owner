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
 * INSTALL (PubSystemLib)
 * ----------------------
 * 1. PubSystemLib → New file → name: ManagerWeekCatchup.gs → paste this whole file → Save.
 * 2. Find findMostRecentDraftWeek (or whatever getDetailedWeekStatus / _findWeekSheetForForm
 *    uses to pick the active manager week). At the START of that function, add:
 *
 *      var catchup = findManagerCatchupWeekSheet_(ss);
 *      if (catchup) return catchup;
 *
 *    (Use the same Spreadsheet `ss` variable the function already has.)
 *
 * 3. Find startNewWeek / startNewWeekImpl (creates the next WEEK_* tab). At the START:
 *
 *      var blocked = assertManagerWeekNotJumpingAhead_(ss);
 *      if (blocked) return blocked; // { success:false, message:"..." }
 *
 * 4. Deploy → New version of PubSystemLib.
 * 5. Windmill (+ Eight Bells if same hub logic) → Libraries → pin new version → Save.
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
    var weekEnd = teyaSafeWeekEndFromSheet_(sh, name);
    if (!weekEnd) continue;
    var status = String(sh.getRange('A1').getValue() || '').toUpperCase();
    if (status.indexOf('SUBMITTED') === -1 && status.indexOf('APPROVED') === -1) continue;
    if (!best || weekEnd.getTime() > best.weekEnd.getTime()) {
      best = { sheet: sh, weekEnd: weekEnd, status: status };
    }
  }
  return best;
}

/**
 * Active manager week sheet: first week AFTER last SUBMITTED/APPROVED.
 * Creates the WEEK_* tab if missing (via createCatchupWeekSheet_ hook).
 * Returns null only if no owner-pipeline week exists yet (brand-new venue).
 */
function findManagerCatchupWeekSheet_(ss) {
  var last = findLastOwnerPipelineWeek_(ss);
  if (!last) return null;

  var targetEnd = new Date(last.weekEnd.getTime());
  targetEnd.setDate(targetEnd.getDate() + 7); // next Sunday week-ending
  targetEnd = stripTime_(targetEnd);

  // Prefer existing incomplete sheet on/after target, earliest first
  var sheets = ss.getSheets();
  var candidates = [];
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name.indexOf('WEEK_') !== 0) continue;
    var weekEnd = teyaSafeWeekEndFromSheet_(sh, name);
    if (!weekEnd) continue;
    if (weekEnd.getTime() < targetEnd.getTime()) continue;
    var status = String(sh.getRange('A1').getValue() || '').toUpperCase();
    if (status.indexOf('APPROVED') !== -1 && status.indexOf('SUBMITTED') === -1) {
      // approved alone still counts as past manager desk — skip
    }
    var done =
      status.indexOf('SUBMITTED') !== -1 ||
      status.indexOf('APPROVED') !== -1;
    if (done) continue;
    candidates.push({ sheet: sh, weekEnd: weekEnd });
  }
  candidates.sort(function (a, b) { return a.weekEnd.getTime() - b.weekEnd.getTime(); });
  if (candidates.length) return candidates[0].sheet;

  // No open sheet at target — create target week (not “this calendar week”)
  if (typeof createCatchupWeekSheet_ === 'function') {
    return createCatchupWeekSheet_(ss, targetEnd);
  }
  if (typeof startNewWeekImpl === 'function') {
    // Many codebases take an optional week-ending Date — try that
    try {
      var created = startNewWeekImpl(ss, targetEnd);
      if (created && created.getSheet) return created;
      if (created && created.sheet) return created.sheet;
    } catch (e1) {
      try {
        var created2 = startNewWeekImpl(targetEnd);
        if (created2 && created2.getSheet) return created2;
        if (created2 && created2.sheet) return created2.sheet;
      } catch (e2) {}
    }
  }

  // Fallback: resolve by expected sheet name if your namer matches
  var expectName = formatWeekSheetNameCatchup_(targetEnd);
  var existing = ss.getSheetByName(expectName);
  if (existing) return existing;

  Logger.log(
    'ManagerWeekCatchup: need week ending ' +
      Utilities.formatDate(targetEnd, 'Europe/London', 'yyyy-MM-dd') +
      ' (' + expectName + ') but could not create — wire createCatchupWeekSheet_.'
  );
  return null;
}

/**
 * Block “Start new week” if it would skip past an unfinished catch-up week.
 * Return null to allow; or { success:false, message } to stop.
 */
function assertManagerWeekNotJumpingAhead_(ss) {
  var catchup = findManagerCatchupWeekSheet_(ss);
  if (!catchup) return null;
  var catchEnd = teyaSafeWeekEndFromSheet_(catchup, catchup.getName());
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
function teyaSafeWeekEndFromSheet_(sh, name) {
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

/**
 * OPTIONAL — implement in WeekSetup.js if startNewWeekImpl cannot take a Date.
 * Must create the same WEEK_* layout as a normal new week, A1 = DRAFT, K3 = weekEnd.
 *
 * function createCatchupWeekSheet_(ss, weekEndDate) { ... return sheet; }
 */
