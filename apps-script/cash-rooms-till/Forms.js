/**
 * ============================================================================
 * PubSystemLib — Forms.gs (v2 - faithful rewrite from original Eight Bells)
 * ============================================================================
 * Server-side callbacks for the three main HTML forms.
 * v2: rebuilt directly from canonical Eight Bells code to preserve exact
 * return shapes that the HTML files depend on.
 *
 * Every public function takes VENUE_CONFIG as the first arg (passed by the
 * venue's thin stub) and the form-data payload as subsequent args.
 *
 * KEY BEHAVIOUR PRESERVED:
 *   - Monday tab balance walks unapproved weeks via getRunningTabsAsOfDate
 *   - Owner-edit save never overwrites formula columns E, F, K, P, Q
 *   - Weekly expense storage uses both row-cells AND AA1 JSON for resilience
 * ============================================================================
 */

/** Column E = Total Cash (D) − £130 float − Rooms Cash (U). Rows 7–13. */
function ensureCashLessFloatIncludesRooms_(sheet) {
  if (!sheet) return;
  for (var r = 7; r <= 13; r++) {
    sheet.getRange(r, 5).setFormula('=D' + r + '-130-U' + r);
  }
  // Totals row if present
  try {
    var e14 = String(sheet.getRange(14, 5).getFormula() || '');
    if (e14.indexOf('SUM') !== -1 || e14 === '') {
      // leave SUM / blank alone
    } else if (e14.indexOf('U14') === -1) {
      sheet.getRange(14, 5).setFormula('=D14-130-U14');
    }
  } catch (e) {}
}

function getSelectedDayIndex(cfg) {
  cfg = _mergeConfig(cfg);
  const scriptProps = PropertiesService.getScriptProperties();
  const dayIndex = scriptProps.getProperty('SELECTED_DAY_INDEX');
  
  Logger.log('=== Getting selected day index ===');
  Logger.log('Retrieved from ScriptProperties: ' + dayIndex);
  
  if (dayIndex !== null && dayIndex !== undefined && dayIndex !== '') {
    scriptProps.deleteProperty('SELECTED_DAY_INDEX');
    const index = parseInt(dayIndex);
    Logger.log('Returning day index: ' + index);
    return index;
  }
  
  Logger.log('No day index found, returning null');
  return null;
}

function getWeekInfoForForm(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);
  const weekSheet = _findWeekSheetForForm(cfg, weekSheetName);
  
  const weekEnding = weekSheet.getRange('K3').getValue();  // Changed from I3
  if (!weekEnding) {
    throw new Error('Week ending date not found.');
  }
  
  const weekEndingDate = new Date(weekEnding);
  const weekDates = getWeekDates(weekEndingDate);
  
  const weekDatesSimple = weekDates.map(d => ({
    dayName: d.dayName,
    shortDate: d.shortDate,
    longDate: d.longDate,
    displayDate: d.displayDate,
    isoDate: d.isoDate
  }));
  
  const runningBalances = getRunningBalances(cfg);
  const status = weekSheet.getRange('A1').getValue();
  const weekStatus = status ? status.replace('STATUS: ', '') : 'DRAFT';
  
  return {
    weekSheet: weekSheet.getName(),
    weekEnding: Utilities.formatDate(weekEndingDate, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    weekRange: `${weekDates[0].longDate} - ${weekDates[6].longDate}`,
    weekDates: weekDatesSimple,
    runningBalances: runningBalances,
    status: weekStatus
  };
}

function getDayData(cfg, weekSheetName, row) {
  cfg = _mergeConfig(cfg);
  const ss = _ss(cfg);
  const sheet = ss.getSheetByName(weekSheetName);
  
  if (!sheet) {
    throw new Error('Week sheet not found: ' + weekSheetName);
  }

  // Columns D–U in one read (was one getRange per cell).
  var v = sheet.getRange(row, 4, 1, 18).getValues()[0];
  return {
    cash: v[0] || 0,            // D
    cashLessFloat: v[1] || 0,   // E
    cashToSafe: v[2] || 0,      // F
    actualToSafe: v[3] || 0,    // G
    dailyOutNotes: v[4] || '',  // H
    pdq1: v[5] || 0,            // I
    pdq2: v[6] || 0,            // J
    grossOnTill: v[8] || 0,     // L
    netOnTill: v[9] || 0,       // M
    itemVoid: v[10] || 0,       // N
    tabs: v[11] || 0,           // O
    salesNotes: v[14] || '',    // R
    pdqRooms: v[15] || 0,       // S
    cashRooms: v[17] || 0,      // U
    receipts: _getDayReceipts(sheet, row),
    cardAdjustments: _getDayCardAdjustments(sheet, row)
  };
}

/**
 * One round-trip for Daily Entry: week header, day figures, previous tab
 * balance, and receipt categories. Replaces the old chain of three calls.
 */
function getDailyEntryBundle(cfg, weekSheetName, dayIndex) {
  cfg = _mergeConfig(cfg);
  var idx = parseInt(dayIndex, 10);
  if (isNaN(idx) || idx < 0) idx = 0;
  if (idx > 6) idx = 6;
  var week = getWeekInfoForForm(cfg, weekSheetName);
  var row = 7 + idx;
  var day = getDayData(cfg, week.weekSheet, row);
  var previousTabBalance = 0;
  try {
    previousTabBalance = getPreviousDayTabBalance(cfg, week.weekSheet, row) || 0;
  } catch (eBal) {
    previousTabBalance = 0;
  }
  var categories = [];
  try {
    categories = getExpenseCategories(cfg) || [];
  } catch (eCat) {
    categories = [];
  }
  return {
    week: week,
    day: day,
    previousTabBalance: previousTabBalance,
    categories: categories,
    dayIndex: idx,
    row: row
  };
}

/**
 * ============================================================================
 * DAILY RECEIPTS (cash taken from the till that day)
 * ----------------------------------------------------------------------------
 * Distinct from end-of-week receipts (rows 24-41, column D). Daily receipts
 * are cash already removed from the till, so the counted cash (D->E->F->G) is
 * already lower by that amount and they must NOT be re-subtracted in D42/D45.
 *
 * Itemised store lives on the week sheet in AB1 as JSON keyed by day row:
 *   { "7": [ { cat: 24, desc: "milk", amt: 7 }, ... ], "8": [...], ... }
 *   cat = END OF WEEK expense row (24-41).
 *
 * Rolled up per category into F24:F41 (amount) + G24:G41 (descriptions) -
 * which MASTER XERO now reads alongside D - and per day into V7:V13 with the
 * week total in V14.
 * ============================================================================
 */
function _readReceiptsStore(sheet) {
  var raw = sheet.getRange('AB1').getValue();
  if (!raw) return {};
  try {
    var obj = JSON.parse(raw);
    return (obj && typeof obj === 'object') ? obj : {};
  } catch (e) {
    return {};
  }
}

function _getDayReceipts(sheet, row) {
  var store = _readReceiptsStore(sheet);
  var items = store[String(row)] || [];
  return items.map(function(it) {
    return {
      cat: parseInt(it.cat, 10) || 0,
      desc: (it.desc || '').toString(),
      amt: parseFloat(it.amt) || 0
    };
  });
}

/**
 * Rebuild the F/G per-category roll-up and the V per-day totals from the AB1
 * store. Cleared-then-written so removed receipts never leave stale figures.
 */
function _applyDailyReceiptsRollup(cfg, sheet) {
  var store = _readReceiptsStore(sheet);

  var sums = {};       // catRow -> total amount
  var descs = {};      // catRow -> array of "desc GBP x.xx"
  var dayTotals = {};  // dayRow -> total amount

  for (var dayKey in store) {
    if (!store.hasOwnProperty(dayKey)) continue;
    var dayRow = parseInt(dayKey, 10);
    if (!(dayRow >= 7 && dayRow <= 13)) continue;
    var items = store[dayKey] || [];
    var dayTotal = 0;
    for (var i = 0; i < items.length; i++) {
      var cat = parseInt(items[i].cat, 10);
      var amt = parseFloat(items[i].amt) || 0;
      if (!(cat >= 24 && cat <= 41)) continue;
      sums[cat] = (sums[cat] || 0) + amt;
      var desc = (items[i].desc || '').toString().trim();
      if (!descs[cat]) descs[cat] = [];
      descs[cat].push(desc || 'Receipt');   // note only - amount already shown in column F
      dayTotal += amt;
    }
    dayTotals[dayRow] = dayTotal;
  }

  // Per-category roll-up -> F (amount) + G (descriptions), rows 24-41.
  sheet.getRange('F24:G41').clearContent();
  for (var catRow = 24; catRow <= 41; catRow++) {
    if (sums[catRow]) {
      sheet.getRange(catRow, 6).setValue(Math.round(sums[catRow] * 100) / 100); // F
      sheet.getRange(catRow, 7).setValue((descs[catRow] || []).join(', '));      // G
    }
  }

  // Per-day totals -> V7:V13, week total -> V14.
  var weekTotal = 0;
  for (var r = 7; r <= 13; r++) {
    var t = dayTotals[r] || 0;
    sheet.getRange(r, 22).setValue(t ? Math.round(t * 100) / 100 : ''); // V
    weekTotal += t;
  }
  sheet.getRange(14, 22).setValue(Math.round(weekTotal * 100) / 100);   // V14

  return weekTotal;
}

/**
 * ============================================================================
 * CARD ADJUSTMENTS (bank transfers / cash-back)
 * ----------------------------------------------------------------------------
 * Corrections to the card / PDQ side, distinct from cash receipts.
 *   - Bank transfer (e.g. refunding a customer overcharged on the card): nets
 *     against the week's card total. Signed net (refund OUT = +, money IN = -)
 *     rolls to W7:W13 with the week net in W14, which MASTER XERO C6 reads.
 *   - Cash-back (customer paid extra on card and took cash): already balances
 *     itself (card up, cash down), so it is recorded for the trail only -
 *     totals roll to X7:X13 / X14, read by no formula.
 *
 * Itemised store lives on the week sheet in AC1 as JSON keyed by day row:
 *   { "7": [ { method:'transfer_out'|'transfer_in'|'cashback', amt, reason }, ... ], ... }
 * ============================================================================
 */
function _readCardAdjStore(sheet) {
  var raw = sheet.getRange('AC1').getValue();
  if (!raw) return {};
  try {
    var o = JSON.parse(raw);
    return (o && typeof o === 'object') ? o : {};
  } catch (e) {
    return {};
  }
}

function _getDayCardAdjustments(sheet, row) {
  var store = _readCardAdjStore(sheet);
  var items = store[String(row)] || [];
  return items.map(function(it) {
    return {
      method: (it.method || '').toString(),
      amt: parseFloat(it.amt) || 0,
      reason: (it.reason || '').toString()
    };
  });
}

/**
 * Rebuild the W (transfers) and X (cash-back) roll-up from the AC1 store.
 * Cleared-then-written so removed items never leave stale figures.
 */
function _applyCardAdjustmentsRollup(cfg, sheet) {
  var store = _readCardAdjStore(sheet);
  var transferByDay = {};   // dayRow -> signed net (out=+, in=-)
  var cashbackByDay = {};   // dayRow -> total

  for (var k in store) {
    if (!store.hasOwnProperty(k)) continue;
    var dr = parseInt(k, 10);
    if (!(dr >= 7 && dr <= 13)) continue;
    var items = store[k] || [];
    var tNet = 0, cSum = 0;
    for (var i = 0; i < items.length; i++) {
      var m = (items[i].method || '').toString();
      var a = parseFloat(items[i].amt) || 0;
      if (m === 'transfer_out') tNet += a;
      else if (m === 'transfer_in') tNet -= a;
      else if (m === 'cashback') cSum += a;
    }
    transferByDay[dr] = tNet;
    cashbackByDay[dr] = cSum;
  }

  // W (col 23) = transfers, X (col 24) = cash-back; rows 7-13 + totals row 14.
  sheet.getRange('W7:X14').clearContent();
  var wTot = 0, xTot = 0;
  for (var r = 7; r <= 13; r++) {
    var t = transferByDay[r] || 0;
    var c = cashbackByDay[r] || 0;
    sheet.getRange(r, 23).setValue(t ? Math.round(t * 100) / 100 : '');
    sheet.getRange(r, 24).setValue(c ? Math.round(c * 100) / 100 : '');
    wTot += t;
    xTot += c;
  }
  sheet.getRange(14, 23).setValue(Math.round(wTot * 100) / 100);  // W14 -> C6
  sheet.getRange(14, 24).setValue(Math.round(xTot * 100) / 100);  // X14 (audit)

  return { transferNet: wTot, cashback: xTot };
}

/**
 * Week-level views of the daily receipts (AB1) and card adjustments (AC1),
 * used by the weekly form (duplicate guard) and the owner review (display).
 * Day rows 7-13 map Monday..Sunday. Category names read from column A.
 */
function _getWeekDailyReceipts(sheet) {
  var store = _readReceiptsStore(sheet);
  var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var out = [];
  for (var k in store) {
    if (!store.hasOwnProperty(k)) continue;
    var row = parseInt(k, 10);
    if (!(row >= 7 && row <= 13)) continue;
    var day = dayNames[row - 7] || ('Day ' + (row - 6));
    var items = store[k] || [];
    for (var i = 0; i < items.length; i++) {
      var cat = parseInt(items[i].cat, 10);
      var name = (cat >= 24 && cat <= 41) ? (sheet.getRange(cat, 1).getValue() || ('Row ' + cat)) : ('Row ' + cat);
      out.push({
        day: day, dayRow: row, cat: cat, category: name,
        amount: parseFloat(items[i].amt) || 0,
        description: (items[i].desc || '').toString()
      });
    }
  }
  return out;
}

function _getWeekCardAdjustments(sheet) {
  var store = _readCardAdjStore(sheet);
  var dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var items = [];
  var transferNet = 0, cashback = 0;
  for (var k in store) {
    if (!store.hasOwnProperty(k)) continue;
    var row = parseInt(k, 10);
    if (!(row >= 7 && row <= 13)) continue;
    var day = dayNames[row - 7] || ('Day ' + (row - 6));
    var arr = store[k] || [];
    for (var i = 0; i < arr.length; i++) {
      var m = (arr[i].method || '').toString();
      var a = parseFloat(arr[i].amt) || 0;
      if (m === 'transfer_out') transferNet += a;
      else if (m === 'transfer_in') transferNet -= a;
      else if (m === 'cashback') cashback += a;
      items.push({ day: day, method: m, amt: a, reason: (arr[i].reason || '').toString() });
    }
  }
  return {
    transferNet: Math.round(transferNet * 100) / 100,
    cashback: Math.round(cashback * 100) / 100,
    items: items
  };
}

function saveDayData(cfg, data) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(data.weekSheet);
  
  if (!sheet) {
    throw new Error('Week sheet not found: ' + data.weekSheet);
  }
  
  const row = data.row;
  
  sheet.getRange(row, 4).setValue(data.cash);              // D: Cash
  sheet.getRange(row, 7).setValue(data.actualToSafe);      // G: Actual to safe
  sheet.getRange(row, 8).setValue(data.dailyOutNotes);     // H: Daily Out Notes
  sheet.getRange(row, 9).setValue(data.pdq1);              // I: PDQ 1
  sheet.getRange(row, 10).setValue(data.pdq2);             // J: PDQ 2
  sheet.getRange(row, 12).setValue(data.grossOnTill);      // L: Gross on Till
  sheet.getRange(row, 13).setValue(data.netOnTill);        // M: Net on Till
  sheet.getRange(row, 14).setValue(data.itemVoid);         // N: Item Void
  sheet.getRange(row, 15).setValue(data.tabs);             // O: Tabs
  sheet.getRange(row, 18).setValue(data.salesNotes || ''); // R: Sales Notes
  sheet.getRange(row, 19).setValue(data.pdqRooms);         // S: Rooms Card (UPDATED)
  sheet.getRange(row, 21).setValue(data.cashRooms);        // U: Room Cash (UPDATED)

  // E = cash − float − rooms cash (rooms cash is in the till count but not F&D)
  ensureCashLessFloatIncludesRooms_(sheet);

  // -- Daily receipts (cash from till) --------------------------------------
  // Only touch the store when the form actually sends a receipts array (an
  // empty array legitimately means "no receipts today"). Older callers that
  // omit the field leave any existing receipts untouched.
  if (data.receipts !== undefined) {
    var store = _readReceiptsStore(sheet);
    var incoming = Array.isArray(data.receipts) ? data.receipts : [];
    var cleaned = [];
    for (var ri = 0; ri < incoming.length; ri++) {
      var cat = parseInt(incoming[ri].cat, 10);
      var amt = parseFloat(incoming[ri].amt) || 0;
      if (!(cat >= 24 && cat <= 41)) continue;
      if (!amt) continue;
      cleaned.push({ cat: cat, desc: (incoming[ri].desc || '').toString().trim(), amt: amt });
    }
    if (cleaned.length) {
      store[String(row)] = cleaned;
    } else {
      delete store[String(row)];
    }
    sheet.getRange('AB1').setValue(JSON.stringify(store));
    _applyDailyReceiptsRollup(cfg, sheet);
  }

  // -- Card adjustments (bank transfers / cash-back) ------------------------
  if (data.cardAdjustments !== undefined) {
    var caStore = _readCardAdjStore(sheet);
    var caIn = Array.isArray(data.cardAdjustments) ? data.cardAdjustments : [];
    var caClean = [];
    for (var ci = 0; ci < caIn.length; ci++) {
      var m = (caIn[ci].method || '').toString();
      var a = parseFloat(caIn[ci].amt) || 0;
      if (['transfer_out', 'transfer_in', 'cashback'].indexOf(m) === -1) continue;
      if (!a) continue;
      caClean.push({ method: m, amt: a, reason: (caIn[ci].reason || '').toString().trim() });
    }
    if (caClean.length) {
      caStore[String(row)] = caClean;
    } else {
      delete caStore[String(row)];
    }
    sheet.getRange('AC1').setValue(JSON.stringify(caStore));
    _applyCardAdjustmentsRollup(cfg, sheet);
  }

  SpreadsheetApp.flush();
  
  return { success: true };
}

function getPreviousDayTabBalance(cfg, weekSheetName, dayRow) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const weekSheet = ss.getSheetByName(weekSheetName);
  
  if (!weekSheet) {
    Logger.log('Week sheet not found: ' + weekSheetName);
    return 0;
  }
  
  // Get the week ending date from the current sheet (this is THIS week's Sunday)
  const weekEndingDate = weekSheet.getRange('K3').getValue();
  if (!(weekEndingDate instanceof Date)) {
    Logger.log('Week ending date not a Date: ' + weekEndingDate);
    return 0;
  }
  
  // Previous Sunday = this week's Sunday minus 7 days
  const previousSunday = new Date(weekEndingDate);
  previousSunday.setDate(previousSunday.getDate() - 7);
  previousSunday.setHours(0, 0, 0, 0);
  
  // Baseline: the running tab total as of end of previous Sunday.
  // This walks anchor + approved + unapproved week chain, so it reflects
  // reality even when N weeks are submitted-but-unapproved between the
  // anchor and the current week.
  const baseline = getRunningTabsAsOfDate(cfg, previousSunday);
  
  if (dayRow === 7) {
    // MONDAY - just return the previous Sunday's closing balance
    return baseline;
  }
  
  // TUESDAY to SUNDAY - add this week's daily movements from Monday up
  // to (but not including) the current day.
  let balance = baseline;
  if (dayRow > 7) {
    var movements = weekSheet.getRange(7, 15, dayRow - 7, 1).getValues();
    for (var mi = 0; mi < movements.length; mi++) {
      balance += movements[mi][0] || 0;
    }
  }
  return balance;
}

function getPreviousWeekTabBalance(cfg, currentWeekEnding) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabsLog = ss.getSheetByName(cfg.SHEETS.RUNNING_BALANCE); // 'TABS LOG'
  
  if (!tabsLog) {
    Logger.log('TABS LOG sheet not found');
    return 0;
  }
  
  // Calculate the previous week's ending date (7 days before)
  const prevWeekEnding = new Date(currentWeekEnding);
  prevWeekEnding.setDate(prevWeekEnding.getDate() - 7);
  
  // Search for this date in TABS LOG (Column A)
  const lastRow = tabsLog.getLastRow();
  if (lastRow < 4) {
    // No data in tabs log yet
    return 0;
  }
  
  const dateRange = tabsLog.getRange(4, 1, lastRow - 3, 1).getValues(); // Column A from row 4
  const cumulativeRange = tabsLog.getRange(4, 3, lastRow - 3, 1).getValues(); // Column C from row 4
  
  // Format dates for comparison
  const prevWeekStr = Utilities.formatDate(prevWeekEnding, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  for (let i = 0; i < dateRange.length; i++) {
    if (dateRange[i][0] instanceof Date) {
      const rowDateStr = Utilities.formatDate(dateRange[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (rowDateStr === prevWeekStr) {
        Logger.log('Found previous week tab balance: ' + cumulativeRange[i][0]);
        return cumulativeRange[i][0] || 0;
      }
    }
  }
  
  // If exact date not found, try to find the previous week's WEEK_ sheet
  // This handles unapproved weeks that haven't been added to TABS LOG yet
  const prevWeekSheetName = findPreviousWeekSheet(cfg, currentWeekEnding);
  if (prevWeekSheetName) {
    const prevWeekSheet = ss.getSheetByName(prevWeekSheetName);
    if (prevWeekSheet) {
      // Get the total tabs from O14 (sum of daily tab movements for that week)
      const prevWeekTotalTabs = prevWeekSheet.getRange('O14').getValue() || 0;
      
      // Now we need the balance BEFORE that week, and add the week's movements
      // Recursively get the previous week's closing balance
      const prevPrevWeekEnding = new Date(prevWeekEnding);
      prevPrevWeekEnding.setDate(prevPrevWeekEnding.getDate() - 7);
      
      // Look for that in TABS LOG
      const prevPrevWeekStr = Utilities.formatDate(prevPrevWeekEnding, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      for (let i = 0; i < dateRange.length; i++) {
        if (dateRange[i][0] instanceof Date) {
          const rowDateStr = Utilities.formatDate(dateRange[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          if (rowDateStr === prevPrevWeekStr) {
            const baseBalance = cumulativeRange[i][0] || 0;
            Logger.log('Calculated from unapproved week: ' + baseBalance + ' + ' + prevWeekTotalTabs);
            return baseBalance + prevWeekTotalTabs;
          }
        }
      }
      
      // If still not found, just return the week's tab total as starting point
      // (This handles the very first weeks)
      return getLastKnownTabBalance(cfg) + prevWeekTotalTabs;
    }
  }
  
  // Fallback: return the most recent cumulative total in TABS LOG
  return getLastKnownTabBalance(cfg);
}

function findPreviousWeekSheet(cfg, currentWeekEnding) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  // Calculate previous week ending date
  const prevWeekEnding = new Date(currentWeekEnding);
  prevWeekEnding.setDate(prevWeekEnding.getDate() - 7);
  
  // Generate expected sheet name (format: WEEK_25JAN26)
  const dayStr = ('0' + prevWeekEnding.getDate()).slice(-2);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthStr = months[prevWeekEnding.getMonth()];
  const yearStr = String(prevWeekEnding.getFullYear()).slice(-2);
  const expectedName = 'WEEK_' + dayStr + monthStr + yearStr;
  
  // Check if this sheet exists
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === expectedName) {
      return expectedName;
    }
  }
  
  return null;
}

function getLastKnownTabBalance(cfg) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabsLog = ss.getSheetByName(cfg.SHEETS.RUNNING_BALANCE);
  
  if (!tabsLog) return 0;
  
  const lastRow = tabsLog.getLastRow();
  if (lastRow < 4) return 0;
  
  return tabsLog.getRange(lastRow, 3).getValue() || 0; // Column C
}

function getCachedWeekInfo(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);
  return getWeekInfoForForm(cfg, weekSheetName);
}

function getSalesVsReceived(cfg, weekSheetName, row) {
  cfg = _mergeConfig(cfg);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(weekSheetName);
  if (!sheet) return 0;
  
  return sheet.getRange(row, 15).getValue() || 0;
}

function getWeeklyFormData(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);

  // Fast path (v4.15): openById + light week finder. Avoid findMostRecentDraftWeek
  // and getRunningBalances — both were freezing Weekly Cash Up in the web app.
  const weekSheet = _findWeekSheetForForm(cfg, weekSheetName);

  const status = weekSheet.getRange('A1').getValue();
  const weekStatus = status ? String(status).replace('STATUS: ', '') : 'DRAFT';

  if (weekStatus === 'APPROVED') {
    return {
      status: 'APPROVED',
      weekSheet: weekSheet.getName(),
      weekEnding: '',
      weekRange: 'This week is already approved'
    };
  }

  const weekEnding = weekSheet.getRange('K3').getValue();
  if (!weekEnding) {
    throw new Error('Week ending date not found on ' + weekSheet.getName());
  }
  const weekEndingDate = new Date(weekEnding);
  const weekDates = getWeekDates(weekEndingDate);

  const row14 = weekSheet.getRange(14, 4, 1, 18).getValues()[0];
  const dailyCash = row14[0] || 0;
  const cashLessFloat = row14[1] || 0;
  const cashToSafe = row14[2] || 0;
  const actualCashToSafe = row14[3] || 0;
  const cardTotal = row14[7] || 0;
  const grossOnTill = row14[8] || 0;
  const netOnTill = row14[9] || 0;
  const tabs = row14[11] || 0;
  const dailyOut = row14[13] || 0;
  const roomsCard = row14[15] || 0;
  const roomCash = row14[17] || 0;

  const wetSales = weekSheet.getRange('D17').getValue() || 0;
  const foodSales = weekSheet.getRange('D18').getValue() || 0;
  const grossSales = weekSheet.getRange('H17').getValue() || 0;
  const netSales = weekSheet.getRange('H18').getValue() || 0;

  const projectedTabs = tabs;
  const runningBalances = { tabs: tabs, cashDiff: 0 };
  
  // Calculate total expenses (UPDATED rows: 24-41)
  let totalExpenses = 0;
  const expenseRows = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41];
  expenseRows.forEach(function(row) {
    totalExpenses += weekSheet.getRange(row, 4).getValue() || 0;
  });
  
  // Get weekly figures (UPDATED cells)
  const actualDailyCashAfterExpenses = weekSheet.getRange('D45').getValue() || 0;
  const cashToCharlie = weekSheet.getRange('D46').getValue() || 0;
  const differenceCashToCharlie = weekSheet.getRange('D47').getValue() || 0;
  const dailyCashShort = weekSheet.getRange('D49').getValue() || 0;
  const weeklyDifferenceSales = weekSheet.getRange('D51').getValue() || 0;
  const tabToNetDiff = weekSheet.getRange('D53').getValue() || 0;
  
  // Weekly notes (UPDATED cell: A55)
  const weekNotes = weekSheet.getRange('A55').getValue() || '';
  
  // Load expenses - check cells first, then JSON storage
  let expenses = {};
  const expensesJson = weekSheet.getRange('AA1').getValue();
  
  // First check if any expenses exist in the actual cells (D24-D41)
  let hasExpensesInCells = false;
  const expenseCategories = [
    'Room Cleaning', 'Pub Cleaning', 'Temp Kitchen Staff', 'Temp Bar Staff',
    'FOH Temp Staff', 'Room Supplies (no VAT)', 'Room Supplies (vatable)', 'Bar Supplies (no VAT)',
    'Bar Supplies (vatable)', 'Bar Direct Costs (no VAT)', 'Kitchen Supplies (no VAT)',
    'Kitchen Supplies (vatable)', 'Joint Pub Expenses (no VAT)', 
    'Joint Pub Expenses (vatable)', 'Pub Maintenance (no VAT)', 'Cleaning Supplies (vatable)',
    'Refunds', 'Custom Expense'
  ];
  
  for (let i = 0; i < 18; i++) {
    const row = 24 + i;
    const amount = weekSheet.getRange(row, 4).getValue() || 0;
    const descriptionsCell = weekSheet.getRange(row, 5).getValue() || '';
    
    if (amount !== 0) {
      hasExpensesInCells = true;
      if (!expenses[row]) {
        expenses[row] = [];
      }
      
      // Parse descriptions from Column E (format: "desc1 £10.00, desc2 £20.00")
      if (descriptionsCell) {
        const descParts = descriptionsCell.split(', ');
        for (let j = 0; j < descParts.length; j++) {
          // Extract description and amount from format "description £XX.XX"
          const match = descParts[j].match(/^(.+?)\s*£([\d.]+)$/);
          if (match) {
            expenses[row].push({
              description: match[1].trim(),
              amount: parseFloat(match[2]) || 0
            });
          } else {
            // If format doesn't match, use the whole string as description
            expenses[row].push({
              description: descParts[j].trim(),
              amount: amount / descParts.length  // Split amount evenly
            });
          }
        }
      } else {
        // No description in Column E, use generic
        expenses[row].push({
          description: 'Expense',
          amount: amount
        });
      }
    }
  }
  
  // If no expenses in cells, try loading from JSON
  if (!hasExpensesInCells && expensesJson) {
    try {
      expenses = JSON.parse(expensesJson);
    } catch (e) {
      Logger.log('Error parsing expenses: ' + e.message);
      expenses = {};
    }
  }
  
  return {
    weekSheet: weekSheet.getName(),
    status: weekStatus,
    weekEnding: Utilities.formatDate(weekEndingDate, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    weekRange: weekDates[0].longDate + ' - ' + weekDates[6].longDate,
    
    // Daily totals
    dailyCash: dailyCash,
    cashLessFloat: cashLessFloat,
    cashToSafe: cashToSafe,
    actualCashToSafe: actualCashToSafe,
    cardTotal: cardTotal,
    grossOnTill: grossOnTill,
    netOnTill: netOnTill,
    tabs: tabs,
    dailyOut: dailyOut,
    roomsCard: roomsCard,
    roomCash: roomCash,
    
    // TouchOffice
    wetSales: wetSales,
    foodSales: foodSales,
    grossSales: grossSales,
    netSales: netSales,
    
    // Calculated figures
    totalExpenses: totalExpenses,
    actualDailyCashAfterExpenses: actualDailyCashAfterExpenses,
    cashToCharlie: cashToCharlie,
    differenceCashToCharlie: differenceCashToCharlie,
    dailyCashShort: dailyCashShort,
    weeklyDifferenceSales: weeklyDifferenceSales,
    tabToNetDiff: tabToNetDiff,
    
    // Running balances
    runningTabBalance: projectedTabs,
    runningCashDiff: runningBalances.cashDiff,
    
    // Notes and expenses
    weeklyNotes: weekNotes,
    expenseDetails: expenses,
    dailyReceipts: _getWeekDailyReceipts(weekSheet)
  };
}

function saveWeeklyFormData(cfg, data) {
  cfg = _mergeConfig(cfg);
  const ss = _ss(cfg);
  const weekSheet = ss.getSheetByName(data.weekSheet);
  
  if (!weekSheet) {
    return { success: false, message: 'Week sheet not found: ' + data.weekSheet };
  }
  
  try {
    // Save TouchOffice data (UPDATED cells: D17, D18, H17, H18)
    weekSheet.getRange('D17').setValue(data.wetSales || 0);
    weekSheet.getRange('D18').setValue(data.foodSales || 0);
    weekSheet.getRange('H17').setValue(data.grossSales || 0);
    weekSheet.getRange('H18').setValue(data.netSales || 0);
    
    // Save Cash to Charlie (UPDATED cell: D46)
    weekSheet.getRange('D46').setValue(data.cashToCharlie || 0);
    
    // Save weekly notes (UPDATED cell: A55)
    weekSheet.getRange('A55').setValue(data.weeklyNotes || '');
    
    // Parse expense details if it's a JSON string
    let expenseDetails = data.expenseDetails;
    if (typeof expenseDetails === 'string') {
      try {
        expenseDetails = JSON.parse(expenseDetails);
      } catch (e) {
        Logger.log('Error parsing expense details: ' + e.message);
        expenseDetails = {};
      }
    }
    
    // Save expenses as JSON to AA1 for reference
    weekSheet.getRange('AA1').setValue(JSON.stringify(expenseDetails));
    
    // Write expense totals to expense rows (UPDATED rows: 24-41, 18 categories)
    const expenseCategories = [
      'Room Cleaning', 'Pub Cleaning', 'Temp Kitchen Staff', 'Temp Bar Staff',
      'FOH Temp Staff', 'Room Supplies (no VAT)', 'Room Supplies (vatable)', 'Bar Supplies (no VAT)',
      'Bar Supplies (vatable)', 'Bar Direct Costs (no VAT)', 'Kitchen Supplies (no VAT)',
      'Kitchen Supplies (vatable)', 'Joint Pub Expenses (no VAT)', 
      'Joint Pub Expenses (vatable)', 'Pub Maintenance (no VAT)', 'Cleaning Supplies (vatable)',
      'Refunds', 'Custom Expense'
    ];
    
    for (let i = 0; i < 18; i++) {
      const row = 24 + i;
      const categoryName = expenseCategories[i];
      
      // Try multiple formats: row number, row as string (from JSON), category name
      const items = expenseDetails[row] || expenseDetails[row.toString()] || expenseDetails[categoryName] || [];
      
      let total = 0;
      let descriptions = [];
      for (let j = 0; j < items.length; j++) {
        total += parseFloat(items[j].amount) || 0;
        // Collect descriptions (with amount for clarity)
        if (items[j].description) {
          descriptions.push(items[j].description + ' £' + (parseFloat(items[j].amount) || 0).toFixed(2));
        }
      }
      
      // Write the total to Column D (even if 0, to clear old values)
      weekSheet.getRange(row, 4).setValue(total);
      
      // Write descriptions to Column E (comma-separated)
      weekSheet.getRange(row, 5).setValue(descriptions.join(', '));
    }
    
    SpreadsheetApp.flush();
    
    return { success: true };
    
  } catch (error) {
    Logger.log('Error saving weekly data: ' + error.message);
    return { success: false, message: error.toString() };
  }
}

function getWeeklyDataForForm(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);
  return getWeeklyFormData(cfg, weekSheetName);
}

function saveWeeklyData(cfg, data) {
  cfg = _mergeConfig(cfg);
  return saveWeeklyFormData(cfg, data);
}

function getExpenseCategories(cfg) {
  cfg = _mergeConfig(cfg);
  const ss = _ss(cfg);
  const templateSheet = ss.getSheetByName('END OF WEEK');
  
  if (!templateSheet) {
    throw new Error('END OF WEEK template not found');
  }
  
  const categories = [];
  const iconMap = {
    'room': '🛏️',
    'pub': '🏠',
    'clean': '🧹',
    'kitchen': '🍽️',
    'bar': '🍻',
    'staff': '👨‍🍳',
    'temp': '👷',
    'maintenance': '🔧',
    'refund': '🔄',
    'custom': '✨',
    'other': '✨',
    'supply': '📦',
    'direct': '📦',
    'joint': '🤝'
  };
  
  const nameCells = templateSheet.getRange(24, 1, 18, 1).getValues();
  for (let i = 0; i < nameCells.length; i++) {
    const row = 24 + i;
    const name = nameCells[i][0] || '';
    if (name) {
      let icon = '💰';
      const nameLower = name.toLowerCase();
      for (let keyword in iconMap) {
        if (nameLower.includes(keyword)) {
          icon = iconMap[keyword];
          break;
        }
      }
      
      categories.push({
        row: row,
        name: name,
        icon: icon
      });
    }
  }
  
  return categories;
}

function getOwnerWeekReviewFull(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);
  _requireOwnerAccessOrThrow(cfg);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!weekSheetName) {
    throw new Error('No week sheet specified');
  }
  
  var weekSheet = ss.getSheetByName(weekSheetName);
  
  if (!weekSheet) {
    throw new Error('Week sheet not found: ' + weekSheetName);
  }
  
  var sheetName = weekSheet.getName();
  
  // Get week ending date from K3
  var weekEndingRaw = weekSheet.getRange('K3').getValue();
  var weekEnding = '';
  if (weekEndingRaw instanceof Date) {
    weekEnding = Utilities.formatDate(weekEndingRaw, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  } else {
    weekEnding = weekEndingRaw.toString();
  }
  
  // Get status from A1
  var status = weekSheet.getRange('A1').getValue() || 'DRAFT';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DAILY DATA (Rows 7-13, Columns D-U)
  // ─────────────────────────────────────────────────────────────────────────────
  var dailyData = [];
  
  // Calculate dates for each day (week ending is Sunday)
  var weekEndDate = new Date(weekEndingRaw);
  var dates = [];
  for (var d = 6; d >= 0; d--) {
    var dayDate = new Date(weekEndDate);
    dayDate.setDate(weekEndDate.getDate() - d);
    dates.push(Utilities.formatDate(dayDate, Session.getScriptTimeZone(), 'dd/MM'));
  }
  
  // Column mapping (D=4 through U=21)
  // D=4:Cash, E=5:CashLessFloat, F=6:CashToSafe, G=7:ActualToSafe, H=8:CashDiffNotes
  // I=9:PDQ1, J=10:PDQ2, K=11:CardTotal, L=12:GrossOnTill, M=13:NetOnTill, N=14:ItemVoid
  // O=15:Tabs, P=16:TabChecker, Q=17:DailyOut, R=18:DailyOutNotes
  // S=19:RoomsCard, T=20:AirbnbBacs, U=21:RoomCash
  
  for (var i = 0; i < 7; i++) {
    var row = 7 + i; // Rows 7-13
    dailyData.push({
      date: dates[i],
      cash: weekSheet.getRange(row, 4).getValue() || 0,           // D
      cashLessFloat: weekSheet.getRange(row, 5).getValue() || 0,  // E
      cashToSafe: weekSheet.getRange(row, 6).getValue() || 0,     // F
      actualToSafe: weekSheet.getRange(row, 7).getValue() || 0,   // G
      cashDiffNotes: weekSheet.getRange(row, 8).getValue() || '', // H
      pdq1: weekSheet.getRange(row, 9).getValue() || 0,           // I
      pdq2: weekSheet.getRange(row, 10).getValue() || 0,          // J
      cardTotal: weekSheet.getRange(row, 11).getValue() || 0,     // K
      grossOnTill: weekSheet.getRange(row, 12).getValue() || 0,   // L
      netOnTill: weekSheet.getRange(row, 13).getValue() || 0,     // M
      itemVoid: weekSheet.getRange(row, 14).getValue() || 0,      // N
      tabs: weekSheet.getRange(row, 15).getValue() || 0,          // O
      tabChecker: weekSheet.getRange(row, 16).getValue() || 0,    // P
      dailyOut: weekSheet.getRange(row, 17).getValue() || 0,      // Q
      dailyOutNotes: weekSheet.getRange(row, 18).getValue() || '',// R
      roomsCard: weekSheet.getRange(row, 19).getValue() || 0,     // S
      airbnbBacs: weekSheet.getRange(row, 20).getValue() || 0,    // T
      roomCash: weekSheet.getRange(row, 21).getValue() || 0       // U
    });
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TOTALS (Row 14 - read from sheet, not editable)
  // ─────────────────────────────────────────────────────────────────────────────
  var totals = {
    cash: weekSheet.getRange(14, 4).getValue() || 0,
    cashLessFloat: weekSheet.getRange(14, 5).getValue() || 0,
    cashToSafe: weekSheet.getRange(14, 6).getValue() || 0,
    actualToSafe: weekSheet.getRange(14, 7).getValue() || 0,
    pdq1: weekSheet.getRange(14, 9).getValue() || 0,
    pdq2: weekSheet.getRange(14, 10).getValue() || 0,
    cardTotal: weekSheet.getRange(14, 11).getValue() || 0,
    grossOnTill: weekSheet.getRange(14, 12).getValue() || 0,
    netOnTill: weekSheet.getRange(14, 13).getValue() || 0,
    itemVoid: weekSheet.getRange(14, 14).getValue() || 0,
    tabs: weekSheet.getRange(14, 15).getValue() || 0,
    dailyOut: weekSheet.getRange(14, 17).getValue() || 0,
    roomsCard: weekSheet.getRange(14, 19).getValue() || 0,
    airbnbBacs: weekSheet.getRange(14, 20).getValue() || 0,
    roomCash: weekSheet.getRange(14, 21).getValue() || 0
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TOUCHOFFICE DATA
  // Wet Sales: D17, Food Sales: D18, Gross Sales: H17, Net Sales: H18
  // ─────────────────────────────────────────────────────────────────────────────
  var touchOffice = {
    wet: weekSheet.getRange('D17').getValue() || 0,
    food: weekSheet.getRange('D18').getValue() || 0,
    gross: weekSheet.getRange('H17').getValue() || 0,
    net: weekSheet.getRange('H18').getValue() || 0
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION CHECKER (read-only display)
  // Gross diff: H19, Net diff: H20
  // ─────────────────────────────────────────────────────────────────────────────
  var validation = {
    grossDiff: weekSheet.getRange('H19').getValue() || 0,
    netDiff: weekSheet.getRange('H20').getValue() || 0
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSES (Rows 24-41, Column D)
  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSES (Rows 24-41, Names from Column A, Amounts from Column D, Descriptions from Column E)
  // ─────────────────────────────────────────────────────────────────────────────
  var expenses = [];
  
  for (var row = 24; row <= 41; row++) {
    var expenseName = weekSheet.getRange(row, 1).getValue() || 'Expense ' + row; // Column A
    var amount = weekSheet.getRange(row, 4).getValue() || 0; // Column D
    var description = weekSheet.getRange(row, 5).getValue() || ''; // Column E - descriptions
    expenses.push({
      key: 'exp' + row,
      name: expenseName,
      amount: amount,
      description: description
    });
  }
  
  // Total Expenses from D42
  var totalExpenses = weekSheet.getRange('D42').getValue() || 0;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BALANCES & TOTAL FIGURES
  // ─────────────────────────────────────────────────────────────────────────────
  var totalFigures = {
    totalCashToSafe: weekSheet.getRange('G14').getValue() || 0,      // Total Cash from daily amounts to safe
    cashAfterExpenses: weekSheet.getRange('D45').getValue() || 0,    // Cash after expenses
    cashToCharlie: weekSheet.getRange('D46').getValue() || 0,        // Cash to Charlie (EDITABLE)
    dailyCashShort: (weekSheet.getRange('F14').getValue() || 0) - (weekSheet.getRange('G14').getValue() || 0), // F14-G14
    weeklyCashShort: weekSheet.getRange('D47').getValue() || 0,      // Weekly cash short
    purchasesLessPayments: weekSheet.getRange('D51').getValue() || 0, // Purchases less payments balance
    tabBalance: weekSheet.getRange('D53').getValue() || 0            // Tab Balance
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RUNNING BALANCES (from Running Balances sheet)
  // ─────────────────────────────────────────────────────────────────────────────
  var runningBalances = { tabs: 0, roomCash: 0, cashDiff: 0 };
  var weeklyChanges = { tabs: 0, roomCash: 0, cashDiff: 0 };
  
  try {
    var balances = getRunningBalances(cfg);
    
    // For TABS: we want the running balance AS OF THE START of this week
    // (i.e. end of the previous Sunday). Without this, the "Previous Balance"
    // shown for an older week would include the tab activity of every week
    // AFTER it as well, making the New Balance wrong.
    var prevSundayForTabs = null;
    if (weekEndDate instanceof Date && !isNaN(weekEndDate.getTime())) {
      prevSundayForTabs = new Date(weekEndDate);
      prevSundayForTabs.setDate(weekEndDate.getDate() - 7);
      prevSundayForTabs.setHours(0, 0, 0, 0);
    }
    runningBalances.tabs = (prevSundayForTabs ? getRunningTabsAsOfDate(cfg, prevSundayForTabs) : (balances.tabs || 0));
    
    // For Room Cash and Cash Diff: these logs only update at approval, so the
    // current latest figure equals the balance going into any unapproved week.
    runningBalances.roomCash = balances.roomsCash || 0;
    runningBalances.cashDiff = balances.cashDiff || 0;
    
    // Weekly changes from this week's data
    weeklyChanges.tabs = totals.tabs;
    weeklyChanges.roomCash = totals.roomCash;
    weeklyChanges.cashDiff = totalFigures.purchasesLessPayments;
  } catch (e) {
    Logger.log('Error getting running balances: ' + e.message);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // WEEKLY NOTES (D56)
  // ─────────────────────────────────────────────────────────────────────────────
  var weeklyNotes = weekSheet.getRange('D56').getValue() || '';
  
  return {
    weekSheet: sheetName,
    weekEnding: weekEnding,
    status: status,
    dailyData: dailyData,
    totals: totals,
    touchOffice: touchOffice,
    validation: validation,
    expenses: expenses,
    totalExpenses: totalExpenses,
    totalFigures: totalFigures,
    runningBalances: runningBalances,
    weeklyChanges: weeklyChanges,
    weeklyNotes: weeklyNotes,
    dailyReceipts: _getWeekDailyReceipts(weekSheet),
    cardAdjustments: _getWeekCardAdjustments(weekSheet)
  };
}

function saveOwnerWeekEditsFull(cfg, data) {
  cfg = _mergeConfig(cfg);
  var denied = _guardOwner(cfg);
  if (denied) return denied;
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var weekSheet = ss.getSheetByName(data.weekSheet);
    
    if (!weekSheet) {
      return { success: false, message: 'Week sheet not found: ' + data.weekSheet };
    }
    
    // ─────────────────────────────────────────────────────────────────────────────
    // SAVE DAILY DATA (Rows 7-13)
    // Only manager-input columns are written. Formula-driven columns
    // (E cashLessFloat, F cashToSafe, K cardTotal, P tabChecker, Q dailyOut)
    // are deliberately skipped — they live on the sheet as live formulas
    // and recalculate from the inputs we DO write. Writing them here would
    // overwrite the formulas with static values.
    // ─────────────────────────────────────────────────────────────────────────────
    for (var i = 0; i < 7; i++) {
      var row = 7 + i;
      var dayData = data.dailyData[i];
      
      weekSheet.getRange(row, 4).setValue(dayData.cash);           // D
      // Column E (cashLessFloat) — formula, do not overwrite
      // Column F (cashToSafe)    — formula, do not overwrite
      weekSheet.getRange(row, 7).setValue(dayData.actualToSafe);   // G
      weekSheet.getRange(row, 8).setValue(dayData.cashDiffNotes);  // H
      weekSheet.getRange(row, 9).setValue(dayData.pdq1);           // I
      weekSheet.getRange(row, 10).setValue(dayData.pdq2);          // J
      // Column K (cardTotal)    — formula, do not overwrite
      weekSheet.getRange(row, 12).setValue(dayData.grossOnTill);   // L
      weekSheet.getRange(row, 13).setValue(dayData.netOnTill);     // M
      weekSheet.getRange(row, 14).setValue(dayData.itemVoid);      // N
      weekSheet.getRange(row, 15).setValue(dayData.tabs);          // O
      // Column P (tabChecker)   — formula, do not overwrite
      // Column Q (dailyOut)     — formula, do not overwrite
      weekSheet.getRange(row, 18).setValue(dayData.dailyOutNotes); // R
      weekSheet.getRange(row, 19).setValue(dayData.roomsCard);     // S
      weekSheet.getRange(row, 20).setValue(dayData.airbnbBacs);    // T
      weekSheet.getRange(row, 21).setValue(dayData.roomCash);      // U
    }
    ensureCashLessFloatIncludesRooms_(weekSheet);
    
    // ─────────────────────────────────────────────────────────────────────────────
    // SAVE TOUCHOFFICE DATA
    // Wet: D17, Food: D18, Gross: H17, Net: H18
    // ─────────────────────────────────────────────────────────────────────────────
    weekSheet.getRange('D17').setValue(data.touchOffice.wet);
    weekSheet.getRange('D18').setValue(data.touchOffice.food);
    weekSheet.getRange('H17').setValue(data.touchOffice.gross);
    weekSheet.getRange('H18').setValue(data.touchOffice.net);
    
    // ─────────────────────────────────────────────────────────────────────────────
    // SAVE EXPENSES (Rows 24-41, Column D)
    // ─────────────────────────────────────────────────────────────────────────────
    for (var key in data.expenses) {
      // Key format is 'exp24', 'exp25', etc - extract row number
      var rowNum = parseInt(key.replace('exp', ''));
      if (rowNum >= 24 && rowNum <= 41) {
        weekSheet.getRange(rowNum, 4).setValue(data.expenses[key]); // Column D
      }
    }
    
    // ─────────────────────────────────────────────────────────────────────────────
    // SAVE CASH TO CHARLIE (D46)
    // ─────────────────────────────────────────────────────────────────────────────
    weekSheet.getRange('D46').setValue(data.cashToCharlie);
    
    // ─────────────────────────────────────────────────────────────────────────────
    // SAVE WEEKLY NOTES (D56)
    // ─────────────────────────────────────────────────────────────────────────────
    weekSheet.getRange('D56').setValue(data.weeklyNotes);
    
    SpreadsheetApp.flush();
    
    return { success: true, message: 'All changes saved successfully' };
    
  } catch (e) {
    Logger.log('Error in saveOwnerWeekEditsFull: ' + e.message);
    return { success: false, message: e.message };
  }
}

function saveAndApproveWeekFull(cfg, data) {
  cfg = _mergeConfig(cfg);
  var denied = _guardOwner(cfg);
  if (denied) return denied;
  try {
    // First save all edits
    var saveResult = saveOwnerWeekEditsFull(cfg, data);
    
    if (!saveResult.success) {
      return saveResult;
    }
    
    // Then approve the week
    var approveResult = approveAndArchiveWeek(cfg, data.weekSheet);
    
    if (approveResult && approveResult.success) {
      return {
        success: true,
        masterSheet: approveResult.masterSheet,
        message: 'Week saved and approved successfully'
      };
    } else {
      return {
        success: false,
        message: approveResult ? approveResult.message : 'Unknown error during approval'
      };
    }
    
  } catch (e) {
    Logger.log('Error in saveAndApproveWeekFull: ' + e.message);
    return { success: false, message: e.message };
  }
}


/**
 * Build the data shape the WEEK_REPORT_HTML page expects (per renderReport).
 * Adapted from the original Windmill Inn pub takings Code.gs (function of
 * the same name). Falls back to the most recent draft week when no
 * weekSheetName is supplied, matching the old behaviour.
 */
function getWeekReportDataEnhanced(cfg, weekSheetName) {
  cfg = _mergeConfig(cfg);
  const ss = _ss(cfg);
  let weekSheet;
  
  if (weekSheetName) {
    weekSheet = _findWeekSheetLiveOrArchive_(cfg, weekSheetName);
  } else {
    const draftWeek = findMostRecentDraftWeek(cfg);
    if (!draftWeek) {
      throw new Error('No active week found.');
    }
    weekSheet = ss.getSheetByName(draftWeek.name) || _findWeekSheetLiveOrArchive_(cfg, draftWeek.name);
  }
  
  if (!weekSheet) {
    throw new Error('Week sheet not found: ' + (weekSheetName || '(no name provided)'));
  }
  
  const status = weekSheet.getRange('A1').getValue();
  const weekStatus = status ? String(status).replace('STATUS: ', '') : cfg.STATUS.DRAFT;
  
  const weekEnding = weekSheet.getRange('K3').getValue();
  const weekEndingDate = new Date(weekEnding);
  const weekDates = getWeekDates(weekEndingDate);
  
  const dailyData = [];
  for (let i = 0; i < 7; i++) {
    const row = 7 + i;
    dailyData.push({
      day: weekDates[i].dayName,
      date: weekDates[i].shortDate,
      cash: weekSheet.getRange(row, 4).getValue() || 0,
      pdq1: weekSheet.getRange(row, 9).getValue() || 0,
      pdq2: weekSheet.getRange(row, 10).getValue() || 0,
      grossOnTill: weekSheet.getRange(row, 12).getValue() || 0,
      netOnTill: weekSheet.getRange(row, 13).getValue() || 0,
      itemVoid: weekSheet.getRange(row, 14).getValue() || 0,
      tabs: weekSheet.getRange(row, 15).getValue() || 0,
      actualToSafe: weekSheet.getRange(row, 7).getValue() || 0,
      dailyOut: weekSheet.getRange(row, 17).getValue() || 0,
      pdqRooms: weekSheet.getRange(row, 19).getValue() || 0,
      cashRooms: weekSheet.getRange(row, 21).getValue() || 0,
      notes: weekSheet.getRange(row, 8).getValue() || ''
    });
  }
  
  const grossSales = weekSheet.getRange('H17').getValue() || 0;
  const netSales = weekSheet.getRange('H18').getValue() || 0;
  const totalTabChange = weekSheet.getRange('O14').getValue() || 0;
  const totalCashInSafe = weekSheet.getRange('F14').getValue() || 0;
  
  const touchOfficeWetSales = weekSheet.getRange('D17').getValue() || 0;
  const touchOfficeFoodSales = weekSheet.getRange('D18').getValue() || 0;
  
  let expenses = {};
  const expensesJson = weekSheet.getRange('AA1').getValue();
  if (expensesJson) {
    try {
      expenses = JSON.parse(expensesJson);
    } catch (e) {
      expenses = {};
    }
  }
  
  let totalExpenses = 0;
  const expenseRows = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41];
  expenseRows.forEach(function(row) {
    totalExpenses += weekSheet.getRange(row, 4).getValue() || 0;
  });
  
  const cashToCharlie = weekSheet.getRange('D46').getValue() || 0;
  const cashDifference = weekSheet.getRange('D47').getValue() || 0;
  const actualCashAfterExpenses = weekSheet.getRange('D45').getValue() || 0;
  const weeklyDifferenceSalesToPayments = weekSheet.getRange('D51').getValue() || 0;
  const runningBalances = getRunningBalances(cfg);
  
  const weekNotes = weekSheet.getRange('A55').getValue() || '';
  
  return {
    weekSheet: weekSheet.getName(),
    status: weekStatus,
    weekEnding: Utilities.formatDate(weekEndingDate, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    weekRange: weekDates[0].longDate + ' - ' + weekDates[6].longDate,
    dailyData: dailyData,
    grossSales: grossSales,
    netSales: netSales,
    totalTabChange: totalTabChange,
    runningTabBalance: runningBalances.tabs + totalTabChange,
    totalCashInSafe: totalCashInSafe,
    touchOfficeWetSales: touchOfficeWetSales,
    touchOfficeFoodSales: touchOfficeFoodSales,
    expenses: expenses,
    totalExpenses: totalExpenses,
    actualCashAfterExpenses: actualCashAfterExpenses,
    cashToCharlie: cashToCharlie,
    cashDifference: cashDifference,
    weeklyDifferenceSalesToPayments: weeklyDifferenceSalesToPayments,
    runningCashDiff: runningBalances.cashDiff,
    runningBalance: runningBalances.cashDiff + cashDifference,
    weekNotes: weekNotes
  };
}