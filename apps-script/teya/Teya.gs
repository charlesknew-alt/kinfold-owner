/**
 * PubSystemLib - Teya.gs (v3)
 * Teya → daily PDQ prefill (Windmill only — gated on cfg.TEYA_ENABLED).
 * Eight Bells: TEYA_ENABLED: false in VENUE_CONFIG.
 *
 * PASTE: replace the entire Teya.gs / Teya.js file in PubSystemLib with this file.
 * Then change ONE line in Templates_Serve.js (see apps-script/teya/README.md).
 * Then create a new library version and pin Windmill (+ EB) to it.
 *
 * CSV path works today. API path needs Script Properties:
 *   TEYA_CLIENT_ID, TEYA_CLIENT_SECRET, TEYA_STORE_ID
 */

function teyaIsEnabled_(cfg) {
  cfg = mergeConfig_(cfg || {});
  return cfg.TEYA_ENABLED === true;
}

function teyaIsEnabled(cfg) {
  return teyaIsEnabled_(cfg);
}

/**
 * Inject the "Prefill PDQ from Teya" dropzone into daily form HTML when TEYA_ENABLED.
 * Call from Templates_Serve.js serveDailyEntryForm — see README.
 */
function teyaInjectDailyPrefill_(cfg, html) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg) || !html) return html;
  var needle = '<label class="ps-label" for="pdq1">';
  if (html.indexOf(needle) === -1) {
    needle = "for=\"pdq1\"";
    if (html.indexOf(needle) === -1) return html;
    return html.replace(needle, teyaDailyPrefillHtml_() + needle);
  }
  return html.replace(needle, teyaDailyPrefillHtml_() + needle);
}

/** HTML + client script for the daily form dropzone (no external CDN). */
function teyaDailyPrefillHtml_() {
  return [
    '<div id="teyaPrefillBox" class="ps-card" style="margin-bottom:14px;">',
    '<div style="font-family:var(--serif);font-size:18px;margin-bottom:8px;">Prefill PDQ from Teya</div>',
    '<p class="ps-hint" style="margin:0 0 10px;">Drop the Teya transaction CSV for this day. ',
    'Fills PDQ Terminal 1 / 2 (Channel A / B). Does not save — check numbers, then Save. ',
    'Rooms PDQ stays manual.</p>',
    '<input type="file" id="teyaCsvFile" accept=".csv,text/csv" style="width:100%;margin-bottom:8px;">',
    '<div id="teyaPrefillMsg" class="ps-hint" style="min-height:1.2em;"></div>',
    '</div>',
    '<script>',
    '(function(){',
    'var fileInput=document.getElementById("teyaCsvFile");',
    'var msg=document.getElementById("teyaPrefillMsg");',
    'if(!fileInput)return;',
    'function setMsg(t,err){if(!msg)return;msg.textContent=t||"";msg.style.color=err?"#c0635a":"";}',
    'function fillPdq(a,b,detail){',
    'var x=document.getElementById("pdq1");var y=document.getElementById("pdq2");',
    'if(x)x.value=a;if(y)y.value=b;',
    'if(typeof calculateAll==="function")calculateAll();',
    'setMsg(detail||("Filled PDQ 1 = \\u00a3"+a+", PDQ 2 = \\u00a3"+b),false);',
    '}',
    'fileInput.addEventListener("change",function(){',
    'var f=fileInput.files&&fileInput.files[0];if(!f)return;',
    'var reader=new FileReader();',
    'reader.onload=function(){',
    'var text=String(reader.result||"");',
    'if(!google||!google.script||!google.script.run){setMsg("google.script.run unavailable",true);return;}',
    'google.script.run',
    '.withSuccessHandler(function(res){',
    'if(!res||!res.success){setMsg((res&&res.message)||"Teya prefill failed",true);return;}',
    'fillPdq(res.pdq1,res.pdq2,res.message);',
    '})',
    '.withFailureHandler(function(err){setMsg(String(err),true);})',
    '.teyaDayTotalsFromCsv(text,"");',
    '};',
    'reader.onerror=function(){setMsg("Could not read that file.",true);};',
    'reader.readAsText(f);',
    '});',
    '})();',
    '</script>'
  ].join('');
}

/**
 * Summarise approved Teya sales for a calendar day into pdq1 / pdq2.
 * Channel A → pdq1, Channel B → pdq2 via cfg.TEYA_CHANNEL_LABELS.
 * If dayKey is blank, uses the first date found in the CSV.
 */
function teyaDayTotalsFromCsv(cfg, csvText, dayKey) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya is disabled for this venue (TEYA_ENABLED).' };
  }
  if (!csvText) {
    return { success: false, message: 'No CSV text provided.' };
  }

  var labels = cfg.TEYA_CHANNEL_LABELS || {};
  var all = teyaParseCsvToDayTotals_(csvText, labels, null);
  if (!all || !all.length) {
    return { success: false, message: 'No approved Teya sales found in that CSV.' };
  }

  var totals = null;
  if (dayKey) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].date === dayKey) { totals = all[i]; break; }
    }
    if (!totals) {
      return {
        success: false,
        message: 'No sales for ' + dayKey + ' (CSV has ' + all.map(function (d) { return d.date; }).join(', ') + ').'
      };
    }
  } else {
    totals = all[0];
    if (all.length > 1) {
      // Prefer most recent date
      totals = all[all.length - 1];
    }
  }

  return {
    success: true,
    date: totals.date,
    pdq1: totals.pdq1,
    pdq2: totals.pdq2,
    byDevice: totals.byDevice,
    unknownPence: totals.unknownPence,
    message: 'Teya ' + totals.date + ': PDQ 1 £' + totals.pdq1 + ' · PDQ 2 £' + totals.pdq2
  };
}

/**
 * Week-sheet fetch hook. Tries live API when Script Properties are set;
 * otherwise returns a clear CSV fallback message.
 */
function fetchTeyaTransactions(cfg, weekSheetName) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya disabled (TEYA_ENABLED).' };
  }

  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty('TEYA_CLIENT_ID') || '';
  var clientSecret = props.getProperty('TEYA_CLIENT_SECRET') || '';
  var storeId = props.getProperty('TEYA_STORE_ID') || '';

  if (!clientId || !clientSecret || !storeId) {
    return {
      success: false,
      message:
        'Teya API credentials not in Script Properties (need TEYA_CLIENT_ID, TEYA_CLIENT_SECRET, TEYA_STORE_ID). ' +
        'Until then, use CSV prefill on daily entry. ' +
        'MID ' + (cfg.TEYA_MID || '(unset)') + ', week ' + (weekSheetName || '') + '.'
    };
  }

  try {
    var token = teyaFetchAccessToken_(clientId, clientSecret);
    var payments = teyaListPayments_(token, storeId);
    var labels = cfg.TEYA_CHANNEL_LABELS || {};
    var days = teyaPaymentsToDayTotals_(payments, labels);
    return {
      success: true,
      message: 'Fetched ' + payments.length + ' payment(s) from Teya POSLink.',
      days: days,
      weekSheetName: weekSheetName || ''
    };
  } catch (err) {
    return {
      success: false,
      message: 'Teya API error: ' + (err && err.message ? err.message : String(err))
    };
  }
}

// ── CSV helpers ─────────────────────────────────────────────────────────────

function teyaParseCsvToDayTotals_(csvText, channelLabels, dayKey) {
  var rows = teyaParseCsvRows_(csvText);
  var txns = teyaBuildTxns_(rows);
  return teyaDayTotals_(txns, channelLabels, dayKey);
}

function teyaParseCsvRows_(text) {
  var rows = [];
  var row = [];
  var cur = '';
  var inQ = false;
  var s = String(text || '').replace(/^\uFEFF/, '');
  for (var i = 0; i < s.length; i++) {
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
    } else if (ch !== '\r') {
      cur += ch;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  if (!rows.length) return [];
  var header = rows[0].map(function (h) { return String(h || '').replace(/^\uFEFF/, '').trim(); });
  var out = [];
  for (var r = 1; r < rows.length; r++) {
    if (rows[r].length === 1 && rows[r][0] === '') continue;
    var obj = {};
    for (var k = 0; k < header.length; k++) {
      obj[header[k]] = rows[r][k] !== undefined ? rows[r][k] : '';
    }
    out.push(obj);
  }
  return out;
}

function teyaPickCol_(header, candidates) {
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

function teyaBuildTxns_(rows) {
  if (!rows || !rows.length) return [];
  var header = Object.keys(rows[0] || {});
  var colDate = teyaPickCol_(header, ['Date']);
  var colTime = teyaPickCol_(header, ['Time']);
  var colAmt = teyaPickCol_(header, ['Amount', 'Sales', 'Sale', 'Value']);
  var colTerm = teyaPickCol_(header, ['Device name', 'Device Name', 'Terminal name', 'Terminal']);
  var colSer = teyaPickCol_(header, ['Device ID', 'Device Id', 'Device id', 'Terminal ID']);
  var colStat = teyaPickCol_(header, ['Status']);
  var colType = teyaPickCol_(header, ['Payment type', 'Payment Type', 'Type']);
  if (!colDate) throw new Error('No Date column found (Teya export).');
  if (!colAmt) throw new Error('No Amount/Sales column found (Teya export).');

  var approvedMap = {
    SUCCEEDED: 1, SUCCESS: 1, APPROVED: 1, AUTHORISED: 1, AUTHORIZED: 1, COMPLETED: 1, '': 1
  };
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
      isoDate = mSlash[3] + '-' + ('0' + mSlash[2]).slice(-2) + '-' + ('0' + mSlash[1]).slice(-2);
    } else if (!mIso) {
      continue;
    }
    if (timeStr.length === 5) timeStr += ':00';

    var amtStr = String(raw[colAmt] || '0').replace(/[^0-9.\-]/g, '');
    var amt = parseFloat(amtStr);
    if (isNaN(amt)) amt = 0;
    var pence = Math.round(amt * 100);
    var status = colStat ? String(raw[colStat] || '').trim().toUpperCase() : 'SUCCEEDED';
    var approved = !!approvedMap[status];
    var type = colType ? String(raw[colType] || '').trim().toUpperCase() : 'PAYMENT';
    var isRefund = type.indexOf('REFUND') !== -1 || type.indexOf('RETURN') !== -1 || amt < 0;
    var signed = isRefund ? -Math.abs(pence) : pence;
    var term = colTerm ? String(raw[colTerm] || '').trim() : '';
    var serial = colSer ? String(raw[colSer] || '').trim() : '';
    if (!term) term = serial || 'Unknown';
    txns.push({ date: isoDate, term: term, serial: serial, pence: signed, approved: approved });
  }
  return txns;
}

function teyaSlotForLabel_(label) {
  var s = String(label || '').toUpperCase();
  if (s.indexOf('CHANNEL A') !== -1 || s === 'A') return 1;
  if (s.indexOf('CHANNEL B') !== -1 || s === 'B') return 2;
  if (s.indexOf('1') !== -1 && s.indexOf('2') === -1) return 1;
  if (s.indexOf('2') !== -1) return 2;
  return 0;
}

function teyaDayTotals_(txns, channelLabels, dayKey) {
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
      day.byDevice[id] = { deviceId: id, label: labels[id] || t.term || id, pence: 0, count: 0 };
    }
    day.byDevice[id].pence += t.pence;
    day.byDevice[id].count += 1;
    var slot = teyaSlotForLabel_(labels[id] || '');
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

  if (dayKey) return byDay[dayKey] ? finish(byDay[dayKey]) : null;
  return Object.keys(byDay).sort().map(function (k) { return finish(byDay[k]); });
}

// ── Live API (POSLink) ──────────────────────────────────────────────────────

function teyaFetchAccessToken_(clientId, clientSecret) {
  var url = 'https://id.teya.com/oauth/v2/oauth-token';
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('OAuth token HTTP ' + code + ': ' + body.slice(0, 200));
  }
  var json = JSON.parse(body);
  if (!json.access_token) throw new Error('OAuth response missing access_token');
  return json.access_token;
}

function teyaListPayments_(accessToken, storeId) {
  var url =
    'https://api.teya.com/poslink/v2/payment-requests' +
    '?store_id=' + encodeURIComponent(storeId) +
    '&transaction_type=SALE&page_size=100';
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('payment-requests HTTP ' + code + ': ' + body.slice(0, 300));
  }
  var json = JSON.parse(body);
  if (Array.isArray(json)) return json;
  if (json.items) return json.items;
  if (json.data) return json.data;
  if (json.payment_requests) return json.payment_requests;
  return [];
}

function teyaPaymentsToDayTotals_(payments, channelLabels) {
  var txns = [];
  for (var i = 0; i < payments.length; i++) {
    var p = payments[i] || {};
    var status = String(p.status || p.Status || '').toUpperCase();
    var approved =
      status === 'SUCCEEDED' || status === 'SUCCESS' || status === 'APPROVED' ||
      status === 'COMPLETED' || status === 'CAPTURED';
    var amount = p.amount || p.Amount || {};
    var value = typeof amount === 'object' ? (amount.value != null ? amount.value : amount.amount) : amount;
    var pence = 0;
    if (typeof value === 'number') {
      pence = (Math.abs(value) < 100000 && String(value).indexOf('.') !== -1)
        ? Math.round(value * 100)
        : Math.round(value);
    } else {
      pence = Math.round(parseFloat(String(value || '0').replace(/[^0-9.\-]/g, '')) * 100);
    }
    var created = String(p.created_at || p.createdAt || p.timestamp || p.date || '').slice(0, 10);
    var terminalId = String(p.terminal_id || p.terminalId || (p.terminal && p.terminal.id) || '');
    var termName = String((p.terminal && (p.terminal.name || p.terminal.label)) || terminalId || 'Unknown');
    if (!created) continue;
    txns.push({
      date: created,
      term: termName,
      serial: terminalId,
      pence: pence,
      approved: approved
    });
  }
  return teyaDayTotals_(txns, channelLabels, null);
}
