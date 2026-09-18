/**
 * Shared Teya → daily paperwork totals (browser + Node tests).
 * Maps Device ID via TEYA_CHANNEL_LABELS → pdq1 (Channel A) / pdq2 (Channel B).
 * Does not write paperwork — callers fill inputs or return values for the manager to save.
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

      txns.push({
        date: isoDate,
        term: term,
        serial: serial,
        pence: signed,
        approved: approved
      });
    }
    return txns;
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
      if (dayKey && t.date !== dayKey) continue;
      if (!byDay[t.date]) {
        byDay[t.date] = { date: t.date, pdq1Pence: 0, pdq2Pence: 0, unknownPence: 0, byDevice: {} };
      }
      var day = byDay[t.date];
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

  return {
    parseCSV: parseCSV,
    buildTxns: buildTxns,
    dayTotals: dayTotals,
    totalsFromCsvText: totalsFromCsvText,
    slotForLabel: slotForLabel
  };
});
