/**
 * Shared Teya → daily paperwork totals (browser + Node tests).
 * Maps Device ID via TEYA_CHANNEL_LABELS → pdq1 (Channel A) / pdq2 (Channel B).
 * Teya settlement window: midnight → midnight (00:00–23:59). Guide only for pub paperwork
 * (after-midnight drinks belong on the next Teya calendar day).
 * Does not write paperwork — callers show a guide; manager types machine readings.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TeyaDayTotals = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var APPROVED = {
    SUCCEEDED: 1, SUCCESS: 1, APPROVED: 1, AUTHORISED: 1, AUTHORIZED: 1, COMPLETED: 1, '': 1
  };

  function pickCol(header, candidates) {
    var i, j, h, m;
    for (i = 0; i < candidates.length; i++) {
      if (header.indexOf(candidates[i]) !== -1) return candidates[i];
    }
    for (j = 0; j < header.length; j++) {
      h = String(header[j] || '').toLowerCase();
      for (m = 0; m < candidates.length; m++) {
        if (h.indexOf(String(candidates[m]).toLowerCase()) !== -1) return header[j];
      }
    }
    return null;
  }

  function parseCSV(text) {
    var rows = [];
    var row = [];
    var cur = '';
    var inQ = false;
    var i;
    var s = String(text || '').replace(/^\uFEFF/, '');
    for (i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (inQ) {
        if (ch === '"') {
          if (s.charAt(i + 1) === '"') { cur += '"'; i++; }
          else inQ = false;
        } else cur += ch;
      } else if (ch === '"') {
        inQ = true;
      } else if (ch === ',') {
        row.push(cur); cur = '';
      } else if (ch === '\n') {
        row.push(cur); cur = '';
        rows.push(row); row = [];
      } else if (ch === '\r') {
        /* skip */
      } else {
        cur += ch;
      }
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    if (!rows.length) return [];
    var header = rows[0].map(function (h) { return String(h || '').replace(/^\uFEFF/, '').trim(); });
    var out = [];
    for (i = 1; i < rows.length; i++) {
      if (rows[i].length === 1 && rows[i][0] === '') continue;
      var obj = {};
      for (var k = 0; k < header.length; k++) {
        obj[header[k]] = rows[i][k] !== undefined ? rows[i][k] : '';
      }
      out.push(obj);
    }
    return out;
  }

  function buildTxns(rows) {
    if (!rows || !rows.length) return [];
    var header = Object.keys(rows[0] || {});
    var colDate = pickCol(header, ['Date']);
    var colTime = pickCol(header, ['Time']);
    var colAmt = pickCol(header, ['Amount', 'Sales', 'Sale', 'Value']);
    var colTerm = pickCol(header, ['Device name', 'Device Name', 'Terminal name', 'Terminal']);
    var colSer = pickCol(header, ['Device ID', 'Device Id', 'Device id', 'Terminal ID']);
    var colStat = pickCol(header, ['Status']);
    var colType = pickCol(header, ['Payment type', 'Payment Type', 'Type']);

    if (!colDate) throw new Error('No Date column found (Teya export).');
    if (!colAmt) throw new Error('No Amount/Sales column found (Teya export).');

    var txns = [];
    for (var i = 0; i < rows.length; i++) {
      var raw = rows[i];
      var dateStr = String(raw[colDate] || '').trim();
      var timeStr = colTime ? String(raw[colTime] || '').trim() : '00:00:00';
      if (!dateStr) continue;

      var isoDate = dateStr;
      var mSlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      var mIso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (mSlash) {
        isoDate = mSlash[3] + '-' + mSlash[2].padStart(2, '0') + '-' + mSlash[1].padStart(2, '0');
      } else if (!mIso) {
        continue;
      }
      if (timeStr.length === 5) timeStr += ':00';

      var amtStr = String(raw[colAmt] || '0').replace(/[^0-9.\-]/g, '');
      var amt = parseFloat(amtStr);
      if (isNaN(amt)) amt = 0;
      var pence = Math.round(amt * 100);

      var status = colStat ? String(raw[colStat] || '').trim().toUpperCase() : 'SUCCEEDED';
      var approved = !!APPROVED[status];
      var type = colType ? String(raw[colType] || '').trim().toUpperCase() : 'PAYMENT';
      var isRefund = type.indexOf('REFUND') !== -1 || type.indexOf('RETURN') !== -1 || amt < 0;
      var signed = isRefund ? -Math.abs(pence) : pence;

      var term = colTerm ? String(raw[colTerm] || '').trim() : '';
      var serial = colSer ? String(raw[colSer] || '').trim() : '';
      if (!term) term = serial || 'Unknown';

      var hm = timeStr.split(':');
      var hour = parseInt(hm[0], 10);
      var minute = parseInt(hm[1] || '0', 10);
      if (isNaN(hour)) hour = 12;
      if (isNaN(minute)) minute = 0;

      txns.push({
        date: isoDate,
        hour: hour,
        minute: minute,
        term: term,
        serial: serial,
        pence: signed,
        approved: approved
      });
    }
    return txns;
  }

  /** Teya guide day = calendar date on the sale (midnight→midnight). */
  function tradingDayKey(isoDate, hour, minute) {
    return isoDate;
  }

  function addCalendarDays(ymd, delta) {
    var p = String(ymd || '').split('-');
    if (p.length !== 3) return ymd;
    var utc = Date.UTC(+p[0], +p[1] - 1, +p[2] + delta);
    var d = new Date(utc);
    return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
  }

  /** Channel A → pdq1, Channel B → pdq2. Unknown devices stay in byDevice only. */
  function slotForLabel(label) {
    var s = String(label || '').toUpperCase();
    if (s.indexOf('CHANNEL A') !== -1 || s === 'A' || /\bA\b/.test(s) && s.indexOf('B') === -1) return 1;
    if (s.indexOf('CHANNEL B') !== -1 || s === 'B' || /\bB\b/.test(s)) return 2;
    if (s.indexOf('1') !== -1 && s.indexOf('2') === -1) return 1;
    if (s.indexOf('2') !== -1) return 2;
    return 0;
  }

  /**
   * @param {object[]} txns
   * @param {object} channelLabels map deviceId → label (e.g. TEYA_CHANNEL_LABELS)
   * @param {string} [dayKey] YYYY-MM-DD; if omitted, all days returned
   */
  function dayTotals(txns, channelLabels, dayKey) {
    var labels = channelLabels || {};
    var byDay = {};

    for (var i = 0; i < txns.length; i++) {
      var t = txns[i];
      if (!t.approved) continue;
      // Teya guide window is midnight→midnight (calendar date on the sale)
      var dk = tradingDayKey(t.date, t.hour, t.minute);
      if (dayKey && dk !== dayKey) continue;
      if (!byDay[dk]) {
        byDay[dk] = { date: dk, pdq1Pence: 0, pdq2Pence: 0, unknownPence: 0, byDevice: {} };
      }
      var day = byDay[dk];
      var id = t.serial || t.term || 'Unknown';
      if (!day.byDevice[id]) {
        day.byDevice[id] = {
          deviceId: id,
          label: labels[id] || t.term || id,
          pence: 0,
          count: 0
        };
      }
      day.byDevice[id].pence += t.pence;
      day.byDevice[id].count += 1;

      var slot = slotForLabel(labels[id] || '');
      if (!slot && id === 'oOj2CqaI') slot = 1;
      if (!slot && id === '7KckI3g7') slot = 2;
      if (slot === 1) day.pdq1Pence += t.pence;
      else if (slot === 2) day.pdq2Pence += t.pence;
      else day.unknownPence += t.pence;
    }

    function finish(d) {
      return {
        date: d.date,
        pdq1: (d.pdq1Pence / 100).toFixed(2),
        pdq2: (d.pdq2Pence / 100).toFixed(2),
        pdq1Pence: d.pdq1Pence,
        pdq2Pence: d.pdq2Pence,
        unknownPence: d.unknownPence,
        byDevice: d.byDevice
      };
    }

    if (dayKey) {
      return byDay[dayKey] ? finish(byDay[dayKey]) : null;
    }
    return Object.keys(byDay).sort().map(function (k) { return finish(byDay[k]); });
  }

  function totalsFromCsvText(csvText, channelLabels, dayKey) {
    var rows = parseCSV(csvText);
    var txns = buildTxns(rows);
    return dayTotals(txns, channelLabels, dayKey);
  }

  var MONTHS = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9,
    oct: 10, nov: 11, dec: 12
  };

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /** Parse "Thursday, September 17, 2026" or "Sep 18, 2026" → YYYY-MM-DD */
  function parseLongDate(text) {
    var m = String(text || '').match(
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})\b/i
    );
    if (!m) {
      m = String(text || '').match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(20\d{2})\b/);
    }
    if (!m) return null;
    var mon = MONTHS[m[1].toLowerCase()];
    if (!mon) return null;
    return m[3] + '-' + pad2(mon) + '-' + pad2(parseInt(m[2], 10));
  }

  /**
   * Parse Teya settlement PDF / email OCR text.
   * Uses "By sales channel" device rows (gross Sales), not net Settlement amount.
   * Day key = sales date on the report (Teya midnight→midnight calendar day).
   */
  function totalsFromSettlementText(text, channelLabels, dayKey) {
    var labels = channelLabels || {};
    var raw = String(text || '');
    if (!raw) return null;

    var salesSection = raw;
    var chIdx = raw.search(/by\s+sales\s+channel/i);
    if (chIdx !== -1) {
      salesSection = raw.slice(chIdx, chIdx + 800);
      var endIdx = salesSection.search(/\bUnderstand\b|\bManage your business\b/i);
      if (endIdx > 0) salesSection = salesSection.slice(0, endIdx);
    }

    var channelRe =
      /\b([A-Za-z0-9]{6,12})\s+(\d+)\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})\b/g;
    var devices = {};
    var match;
    while ((match = channelRe.exec(salesSection)) !== null) {
      var id = match[1];
      // Skip scheme names / noise
      if (/^(visa|mastercard|total|sales|fees|paid|gbp|teya)$/i.test(id)) continue;
      var pence = Math.round(parseFloat(match[3].replace(/,/g, '')) * 100);
      devices[id] = (devices[id] || 0) + pence;
    }

    var day = null;
    // Prefer date under Sales breakdown (not "Paid on")
    var breakdown = raw.match(/Sales\s+breakdown[\s\S]{0,400}/i);
    if (breakdown) day = parseLongDate(breakdown[0]);
    if (!day) {
      var schemeBlock = raw.match(/By\s+schemes[\s\S]{0,200}/i);
      if (schemeBlock) day = parseLongDate(schemeBlock[0]);
    }
    if (!day) day = parseLongDate(raw);
    if (!day) {
      var iso = raw.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
      if (iso) day = iso[1] + '-' + iso[2] + '-' + iso[3];
    }
    if (dayKey && day && day !== dayKey) return null;
    if (dayKey && !day) day = dayKey;
    if (!day) return null;

    var ids = Object.keys(devices);
    if (!ids.length) {
      // Gross Sales line (not settlement/net)
      var salesLine = raw.match(/(?:^|\n)\s*Sales\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})/i);
      if (!salesLine) return null;
      var grand = Math.round(parseFloat(salesLine[1].replace(/,/g, '')) * 100);
      var one = {
        date: day,
        pdq1: (grand / 100).toFixed(2),
        pdq2: '0.00',
        pdq1Pence: grand,
        pdq2Pence: 0,
        unknownPence: 0,
        byDevice: {},
        note: 'Settlement Sales total only (no channel split)'
      };
      return dayKey ? one : [one];
    }

    var pdq1 = 0;
    var pdq2 = 0;
    var unknown = 0;
    var byDevice = {};
    for (var i = 0; i < ids.length; i++) {
      var did = ids[i];
      var p = devices[did];
      byDevice[did] = {
        deviceId: did,
        label: labels[did] || did,
        pence: p,
        count: 0
      };
      var slot = slotForLabel(labels[did] || '');
      if (!slot && did === 'oOj2CqaI') slot = 1;
      if (!slot && did === '7KckI3g7') slot = 2;
      if (slot === 1) pdq1 += p;
      else if (slot === 2) pdq2 += p;
      else unknown += p;
    }
    // Two unmapped devices → sort and assign A/B
    if (pdq1 === 0 && pdq2 === 0 && ids.length === 2) {
      ids.sort();
      pdq1 = devices[ids[0]];
      pdq2 = devices[ids[1]];
      unknown = 0;
    } else if (pdq1 === 0 && pdq2 === 0 && ids.length === 1) {
      pdq1 = devices[ids[0]];
      unknown = 0;
    }

    var result = {
      date: day,
      pdq1: (pdq1 / 100).toFixed(2),
      pdq2: (pdq2 / 100).toFixed(2),
      pdq1Pence: pdq1,
      pdq2Pence: pdq2,
      unknownPence: unknown,
      byDevice: byDevice,
      note: ''
    };
    return dayKey ? result : [result];
  }

  return {
    parseCSV: parseCSV,
    buildTxns: buildTxns,
    dayTotals: dayTotals,
    totalsFromCsvText: totalsFromCsvText,
    totalsFromSettlementText: totalsFromSettlementText,
    parseLongDate: parseLongDate,
    tradingDayKey: tradingDayKey,
    addCalendarDays: addCalendarDays,
    slotForLabel: slotForLabel
  };
});
