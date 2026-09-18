/**
 * PubSystemLib - Teya.gs (v5) — LIVE API pull for Windmill daily PDQ
 *
 * Trading day (same as card takings): 05:00 → 05:00 Europe/London.
 * Paperwork day D uses card sales from D 05:00 to (D+1) 05:00.
 * Morning fill: yesterday's paperwork ← yesterday 5am → today 5am.
 *
 * PASTE: replace entire Teya.gs / Teya.js in PubSystemLib with this file.
 * Then one-line change in Templates_Serve.js (see apps-script/teya/README.md).
 *
 * Script Properties (Windmill project):
 *   TEYA_CLIENT_ID, TEYA_CLIENT_SECRET, TEYA_STORE_ID (UUID)
 * Optional: TEYA_PDQ1_TERMINAL_IDS, TEYA_PDQ2_TERMINAL_IDS
 */

function teyaIsEnabled_(cfg) {
  cfg = mergeConfig_(cfg || {});
  return cfg.TEYA_ENABLED === true;
}

function teyaIsEnabled(cfg) {
  return teyaIsEnabled_(cfg);
}

/** Inject "Pull from Teya" into daily form when TEYA_ENABLED. */
function teyaInjectDailyPrefill_(cfg, html) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg) || !html) return html;
  var needle = '<label class="ps-label" for="pdq1">';
  if (html.indexOf(needle) === -1) {
    needle = 'for="pdq1"';
    if (html.indexOf(needle) === -1) return html;
    return html.replace(needle, teyaDailyPrefillHtml_() + needle);
  }
  return html.replace(needle, teyaDailyPrefillHtml_() + needle);
}

/** Daily-form UI: one button, no CSV. Trading day 5am–5am. */
function teyaDailyPrefillHtml_() {
  return [
    '<div id="teyaPrefillBox" class="ps-card" style="margin-bottom:14px;">',
    '<div style="font-family:var(--serif);font-size:18px;margin-bottom:8px;">Pull PDQ from Teya</div>',
    '<p class="ps-hint" style="margin:0 0 10px;">',
    'Live Teya sales for this paperwork day: <strong>5am\\u21925am</strong> UK ',
    '(e.g. yesterday\\u2019s paperwork = yesterday 5am \\u2192 today 5am). ',
    'Fills PDQ 1 / 2. Does not save \\u2014 check, then Save. Rooms PDQ stays manual.',
    '</p>',
    '<button type="button" id="teyaPullBtn" class="ps-btn ps-btn-secondary ps-btn-block">Pull from Teya now</button>',
    '<div id="teyaPrefillMsg" class="ps-hint" style="min-height:1.2em;margin-top:8px;"></div>',
    '</div>',
    '<script>',
    '(function(){',
    'var btn=document.getElementById("teyaPullBtn");',
    'var msg=document.getElementById("teyaPrefillMsg");',
    'if(!btn)return;',
    'function setMsg(t,err){if(!msg)return;msg.textContent=t||"";msg.style.color=err?"#c0635a":"";}',
    'function londonYmd(d){',
    'var fmt=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"});',
    'return fmt.format(d);',
    '}',
    'function londonYesterday(){',
    'var parts=londonYmd(new Date()).split("-");',
    'var utc=Date.UTC(+parts[0],+parts[1]-1,+parts[2]);',
    'return londonYmd(new Date(utc-86400000));',
    '}',
    'function dayKeyFromForm(){',
    'try{',
    'if(typeof weekDates!=="undefined"&&weekDates&&typeof currentDayIndex==="number"&&weekDates[currentDayIndex]){',
    'var w=weekDates[currentDayIndex];',
    'if(w.isoDate&&/^\\d{4}-\\d{2}-\\d{2}$/.test(w.isoDate))return w.isoDate;',
    'if(w.date&&/^\\d{4}-\\d{2}-\\d{2}$/.test(w.date))return w.date;',
    'if(w.ymd&&/^\\d{4}-\\d{2}-\\d{2}$/.test(w.ymd))return w.ymd;',
    '}',
    '}catch(e){}',
    'var el=document.getElementById("dayDate")||document.querySelector("[data-day-key]");',
    'if(el){var v=el.value||el.getAttribute("data-day-key")||"";if(/^\\d{4}-\\d{2}-\\d{2}$/.test(v))return v;}',
    // Morning paperwork: default to yesterday (completed trading day ending today 5am)
    'return londonYesterday();',
    '}',
    'function fillPdq(a,b,detail){',
    'var x=document.getElementById("pdq1");var y=document.getElementById("pdq2");',
    'if(x)x.value=a;if(y)y.value=b;',
    'if(typeof calculateAll==="function")calculateAll();',
    'setMsg(detail||("Filled PDQ 1 = \\u00a3"+a+", PDQ 2 = \\u00a3"+b),false);',
    '}',
    'btn.addEventListener("click",function(){',
    'if(!google||!google.script||!google.script.run){setMsg("google.script.run unavailable",true);return;}',
    'btn.disabled=true;setMsg("Talking to Teya\\u2026",false);',
    'var dayKey=dayKeyFromForm();',
    'google.script.run',
    '.withSuccessHandler(function(res){',
    'btn.disabled=false;',
    'if(!res||!res.success){setMsg((res&&res.message)||"Teya pull failed",true);return;}',
    'fillPdq(res.pdq1,res.pdq2,res.message);',
    '})',
    '.withFailureHandler(function(err){btn.disabled=false;setMsg(String(err),true);})',
    '.teyaPullDayTotals(dayKey);',
    '});',
    '})();',
    '</script>'
  ].join('');
}

/**
 * LIVE pull for paperwork dayKey (YYYY-MM-DD).
 * Card window = dayKey 05:00 → (dayKey+1) 05:00 Europe/London.
 * Venue: function teyaPullDayTotals(dayKey) { return PubSystemLib.teyaPullDayTotals(VENUE_CONFIG, dayKey); }
 */
function teyaPullDayTotals(cfg, dayKey) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya is disabled for this venue (TEYA_ENABLED).' };
  }

  dayKey = String(dayKey || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    // Default: yesterday (morning paperwork for the night just closed at 5am today)
    dayKey = teyaLondonYesterday_();
  }

  var creds = teyaReadCreds_(cfg);
  if (!creds.ok) return { success: false, message: creds.message };

  try {
    var token = teyaFetchAccessToken_(creds.clientId, creds.clientSecret);
    var win = teyaTradingWindowIso_(dayKey);
    var payments = teyaListPaymentsForWindow_(token, creds.storeId, win.startIso, win.endIso);
    var totals = teyaPaymentsToPdq_(payments, cfg, creds);
    if (!totals.count) {
      return {
        success: false,
        message:
          'No successful Teya sales for trading day ' + dayKey +
          ' (5am\\u20135am UK: ' + win.startIso + ' \\u2192 ' + win.endIso + '). ' +
          'Check credentials / terminal map (run teyaListTerminals).'
      };
    }
    return {
      success: true,
      date: dayKey,
      windowStart: win.startIso,
      windowEnd: win.endIso,
      pdq1: totals.pdq1,
      pdq2: totals.pdq2,
      byDevice: totals.byDevice,
      count: totals.count,
      message:
        'Teya ' + dayKey + ' (5am\\u20135am): PDQ 1 £' + totals.pdq1 + ' · PDQ 2 £' + totals.pdq2 +
        ' (' + totals.count + ' sale' + (totals.count === 1 ? '' : 's') + ')'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Teya API error: ' + (err && err.message ? err.message : String(err))
    };
  }
}

/**
 * Setup helper — list stores/terminals so you can map PDQ 1 / 2.
 * Venue: function teyaListTerminals() { return PubSystemLib.teyaListTerminals(VENUE_CONFIG); }
 * Run from Apps Script editor → Run → teyaListTerminals → Executions / Logs.
 */
function teyaListTerminals(cfg) {
  cfg = mergeConfig_(cfg || {});
  var creds = teyaReadCreds_(cfg);
  if (!creds.ok) return { success: false, message: creds.message };
  try {
    var token = teyaFetchAccessToken_(creds.clientId, creds.clientSecret);
    var stores = teyaFetchJson_(
      'https://api.teya.com/poslink/v1/stores',
      token
    );
    var storeList = stores.stores || stores.data || stores.items || (Array.isArray(stores) ? stores : []);
    var out = [];
    for (var i = 0; i < storeList.length; i++) {
      var s = storeList[i] || {};
      var sid = s.store_id || s.id || s.storeId || '';
      var terms = [];
      if (sid) {
        try {
          var tr = teyaFetchJson_(
            'https://api.teya.com/poslink/v1/stores/' + encodeURIComponent(sid) + '/terminals',
            token
          );
          terms = tr.terminals || tr.data || tr.items || (Array.isArray(tr) ? tr : []);
        } catch (e1) {
          terms = [{ error: String(e1.message || e1) }];
        }
      }
      out.push({ store: s, terminals: terms });
    }
    Logger.log(JSON.stringify(out, null, 2));
    return { success: true, stores: out, message: 'Logged store/terminal list — check Executions log.' };
  } catch (err) {
    return { success: false, message: 'Teya API error: ' + (err && err.message ? err.message : String(err)) };
  }
}

/** Kept for compatibility; prefer teyaPullDayTotals. */
function fetchTeyaTransactions(cfg, weekSheetName) {
  var pull = teyaPullDayTotals(cfg, teyaLondonYesterday_());
  pull.weekSheetName = weekSheetName || '';
  return pull;
}

/** CSV path retained but unused by the daily UI. */
function teyaDayTotalsFromCsv(cfg, csvText, dayKey) {
  cfg = mergeConfig_(cfg || {});
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya is disabled for this venue (TEYA_ENABLED).' };
  }
  if (!csvText) return { success: false, message: 'No CSV text provided.' };
  var labels = cfg.TEYA_CHANNEL_LABELS || {};
  var all = teyaParseCsvToDayTotals_(csvText, labels, null);
  if (!all || !all.length) return { success: false, message: 'No approved Teya sales in that CSV.' };
  var totals = dayKey ? null : all[all.length - 1];
  if (dayKey) {
    for (var i = 0; i < all.length; i++) if (all[i].date === dayKey) totals = all[i];
  }
  if (!totals) {
    return { success: false, message: 'No sales for ' + dayKey + '.' };
  }
  return {
    success: true,
    date: totals.date,
    pdq1: totals.pdq1,
    pdq2: totals.pdq2,
    byDevice: totals.byDevice,
    message: 'Teya CSV ' + totals.date + ': PDQ 1 £' + totals.pdq1 + ' · PDQ 2 £' + totals.pdq2
  };
}

// ── Credentials ─────────────────────────────────────────────────────────────

function teyaReadCreds_(cfg) {
  var props = PropertiesService.getScriptProperties();
  var clientId = props.getProperty('TEYA_CLIENT_ID') || cfg.TEYA_CLIENT_ID || '';
  var clientSecret = props.getProperty('TEYA_CLIENT_SECRET') || cfg.TEYA_CLIENT_SECRET || '';
  var storeId = props.getProperty('TEYA_STORE_ID') || cfg.TEYA_STORE_ID || '';
  var pdq1Ids = props.getProperty('TEYA_PDQ1_TERMINAL_IDS') || cfg.TEYA_PDQ1_TERMINAL_IDS || '';
  var pdq2Ids = props.getProperty('TEYA_PDQ2_TERMINAL_IDS') || cfg.TEYA_PDQ2_TERMINAL_IDS || '';

  if (!clientId || !clientSecret || !storeId) {
    return {
      ok: false,
      message:
        'Missing Teya API credentials. In Windmill Apps Script: Project Settings → Script properties, set ' +
        'TEYA_CLIENT_ID, TEYA_CLIENT_SECRET, TEYA_STORE_ID (UUID). ' +
        'MID ' + (cfg.TEYA_MID || '(unset)') + ' is not enough on its own. See apps-script/teya/README.md.'
    };
  }
  return {
    ok: true,
    clientId: clientId,
    clientSecret: clientSecret,
    storeId: storeId,
    pdq1Ids: teyaSplitIds_(pdq1Ids),
    pdq2Ids: teyaSplitIds_(pdq2Ids)
  };
}

function teyaSplitIds_(s) {
  return String(s || '')
    .split(/[\s,;]+/)
    .map(function (x) { return x.trim(); })
    .filter(Boolean);
}

function teyaLondonToday_() {
  return Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd');
}

function teyaLondonYesterday_() {
  var today = teyaLondonToday_().split('-');
  var utc = Date.UTC(+today[0], +today[1] - 1, +today[2]);
  return Utilities.formatDate(new Date(utc - 86400000), 'Europe/London', 'yyyy-MM-dd');
}

/** Paperwork day D → [D 05:00, D+1 05:00) Europe/London as ISO-8601 with offset. */
function teyaTradingWindowIso_(dayKey) {
  var next = teyaAddCalendarDays_(dayKey, 1);
  return {
    startIso: teyaLondonWallToIso_(dayKey, '05:00:00'),
    endIso: teyaLondonWallToIso_(next, '05:00:00')
  };
}

function teyaAddCalendarDays_(ymd, delta) {
  var p = ymd.split('-');
  var utc = Date.UTC(+p[0], +p[1] - 1, +p[2] + delta);
  return Utilities.formatDate(new Date(utc), 'UTC', 'yyyy-MM-dd');
}

function teyaLondonWallToIso_(ymd, hms) {
  var midday = new Date(ymd + 'T12:00:00Z');
  var raw = Utilities.formatDate(midday, 'Europe/London', 'Z');
  var m = String(raw).match(/^([+-])(\d{2})(\d{2})$/);
  var off = m ? m[1] + m[2] + ':' + m[3] : '+00:00';
  return ymd + 'T' + hms + off;
}

// ── HTTP / OAuth ────────────────────────────────────────────────────────────

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
    throw new Error('OAuth token HTTP ' + code + ': ' + body.slice(0, 240));
  }
  var json = JSON.parse(body);
  if (!json.access_token) throw new Error('OAuth response missing access_token');
  return json.access_token;
}

function teyaFetchJson_(url, accessToken) {
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + accessToken, Accept: 'application/json' },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('HTTP ' + code + ' for ' + url + ': ' + body.slice(0, 300));
  }
  return body ? JSON.parse(body) : {};
}

function teyaListPaymentsForWindow_(accessToken, storeId, startIso, endIso) {
  var all = [];
  var offset = 0;
  var limit = 100;
  for (var page = 0; page < 50; page++) {
    var url =
      'https://api.teya.com/poslink/v2/payment-requests' +
      '?store_id=' + encodeURIComponent(storeId) +
      '&transaction_type=SALE' +
      '&status=SUCCESSFUL' +
      '&start_date_time=' + encodeURIComponent(startIso) +
      '&end_date_time=' + encodeURIComponent(endIso) +
      '&limit=' + limit +
      '&offset=' + offset +
      '&sort=ASC';
    var json = teyaFetchJson_(url, accessToken);
    var batch = json.items || json.data || json.payment_requests || (Array.isArray(json) ? json : []);
    if (!batch.length) break;
    for (var i = 0; i < batch.length; i++) all.push(batch[i]);
    if (batch.length < limit) break;
    offset += limit;
  }
  return all;
}

function teyaPaymentsToPdq_(payments, cfg, creds) {
  var labels = cfg.TEYA_CHANNEL_LABELS || {};
  var pdq1Set = {};
  var pdq2Set = {};
  var i;
  for (i = 0; i < (creds.pdq1Ids || []).length; i++) pdq1Set[creds.pdq1Ids[i]] = 1;
  for (i = 0; i < (creds.pdq2Ids || []).length; i++) pdq2Set[creds.pdq2Ids[i]] = 1;

  // Also honour Channel A/B labels keyed by device/terminal id
  Object.keys(labels).forEach(function (id) {
    var slot = teyaSlotForLabel_(labels[id]);
    if (slot === 1) pdq1Set[id] = 1;
    if (slot === 2) pdq2Set[id] = 1;
  });

  var pdq1 = 0;
  var pdq2 = 0;
  var unknown = 0;
  var count = 0;
  var byDevice = {};

  for (i = 0; i < payments.length; i++) {
    var p = payments[i] || {};
    var status = String(p.status || '').toUpperCase();
    if (status && status !== 'SUCCESSFUL' && status !== 'SUCCEEDED' && status !== 'SUCCESS' && status !== 'APPROVED') {
      continue;
    }
    var tid = String(p.terminal_id || p.terminalId || (p.terminal && p.terminal.id) || '');
    var pence = teyaAmountToPence_(p);
    if (!pence) continue;
    count += 1;
    if (!byDevice[tid]) byDevice[tid] = { deviceId: tid, label: labels[tid] || tid, pence: 0, count: 0 };
    byDevice[tid].pence += pence;
    byDevice[tid].count += 1;

    if (pdq1Set[tid]) pdq1 += pence;
    else if (pdq2Set[tid]) pdq2 += pence;
    else {
      // If only two terminals seen and no map yet, assign by sorted id order once we finish — for now unknown
      unknown += pence;
    }
  }

  // Auto-map if no explicit map and exactly two terminals
  var ids = Object.keys(byDevice).sort();
  if (!Object.keys(pdq1Set).length && !Object.keys(pdq2Set).length && ids.length === 2) {
    pdq1 = byDevice[ids[0]].pence;
    pdq2 = byDevice[ids[1]].pence;
    unknown = 0;
    byDevice[ids[0]].label = 'PDQ 1 (auto)';
    byDevice[ids[1]].label = 'PDQ 2 (auto)';
  } else if (!Object.keys(pdq1Set).length && !Object.keys(pdq2Set).length && ids.length === 1) {
    pdq1 = byDevice[ids[0]].pence;
    pdq2 = 0;
    unknown = 0;
  }

  return {
    pdq1: (pdq1 / 100).toFixed(2),
    pdq2: (pdq2 / 100).toFixed(2),
    unknownPence: unknown,
    count: count,
    byDevice: byDevice
  };
}

function teyaAmountToPence_(p) {
  // Prefer captured/authorised amount; fall back to requested_amount (minor units).
  var candidates = [
    p.amount, p.Amount,
    p.captured_amount, p.capturedAmount,
    p.authorised_amount, p.authorized_amount,
    p.requested_amount, p.requestedAmount
  ];
  for (var i = 0; i < candidates.length; i++) {
    var a = candidates[i];
    if (a == null) continue;
    var value = (typeof a === 'object') ? (a.amount != null ? a.amount : a.value) : a;
    if (value == null || value === '') continue;
    var n = Number(value);
    if (isNaN(n)) continue;
    // POSLink examples use minor units (1500 = £15.00)
    return Math.round(n);
  }
  return 0;
}

function teyaSlotForLabel_(label) {
  var s = String(label || '').toUpperCase();
  if (s.indexOf('CHANNEL A') !== -1 || s === 'A') return 1;
  if (s.indexOf('CHANNEL B') !== -1 || s === 'B') return 2;
  if (s.indexOf('1') !== -1 && s.indexOf('2') === -1) return 1;
  if (s.indexOf('2') !== -1) return 2;
  return 0;
}

// ── CSV helpers (kept; UI no longer uses them) ──────────────────────────────

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
  var colAmt = teyaPickCol_(header, ['Amount', 'Sales', 'Sale', 'Value']);
  var colTerm = teyaPickCol_(header, ['Device name', 'Device Name', 'Terminal name', 'Terminal']);
  var colSer = teyaPickCol_(header, ['Device ID', 'Device Id', 'Device id', 'Terminal ID']);
  var colStat = teyaPickCol_(header, ['Status']);
  var colType = teyaPickCol_(header, ['Payment type', 'Payment Type', 'Type']);
  if (!colDate || !colAmt) return [];
  var approvedMap = {
    SUCCEEDED: 1, SUCCESS: 1, APPROVED: 1, AUTHORISED: 1, AUTHORIZED: 1, COMPLETED: 1, '': 1
  };
  var txns = [];
  for (var i = 0; i < rows.length; i++) {
    var raw = rows[i];
    var dateStr = String(raw[colDate] || '').trim();
    if (!dateStr) continue;
    var isoDate = dateStr;
    var mSlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    var mIso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mSlash) {
      isoDate = mSlash[3] + '-' + ('0' + mSlash[2]).slice(-2) + '-' + ('0' + mSlash[1]).slice(-2);
    } else if (!mIso) continue;
    var amt = parseFloat(String(raw[colAmt] || '0').replace(/[^0-9.\-]/g, ''));
    if (isNaN(amt)) amt = 0;
    var pence = Math.round(amt * 100);
    var status = colStat ? String(raw[colStat] || '').trim().toUpperCase() : 'SUCCEEDED';
    var type = colType ? String(raw[colType] || '').trim().toUpperCase() : 'PAYMENT';
    var isRefund = type.indexOf('REFUND') !== -1 || amt < 0;
    var serial = colSer ? String(raw[colSer] || '').trim() : '';
    var term = colTerm ? String(raw[colTerm] || '').trim() : (serial || 'Unknown');
    txns.push({
      date: isoDate,
      term: term,
      serial: serial,
      pence: isRefund ? -Math.abs(pence) : pence,
      approved: !!approvedMap[status]
    });
  }
  return txns;
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
