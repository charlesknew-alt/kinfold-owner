/**
 * PubSystemLib - Teya.gs (v8) — Gmail settlement report → Windmill PDQ guide
 *
 * Teya has no merchant API for daily card sales. Reports arrive by email
 * (noreply@teya.com / reporting@teya.com). This file:
 *   1) Reads those emails from the Apps Script owner's Gmail
 *   2) Parses settlement PDF (By sales channel) via Drive OCR, or CSV
 *   3) Shows Channel A/B totals as a GUIDE only (midnight→midnight UK)
 *
 * Manager still types PDQ 1 / 2 from the card machines. After-midnight pub
 * sales sit on the next Teya calendar day, so figures can disagree with till.
 *
 * PASTE over PubSystemLib Teya.gs, then Templates_Serve one-liner (see README).
 * Windmill wrappers + one-time Gmail auth + daily trigger — see README.
 */

/** Use library mergeConfig_ when present; otherwise use cfg as-is (VENUE_CONFIG). */
function teyaMergeConfig_(cfg) {
  cfg = cfg || {};
  try {
    if (typeof mergeConfig_ === 'function') return mergeConfig_(cfg);
  } catch (e) {}
  return cfg;
}

function teyaIsEnabled_(cfg) {
  cfg = teyaMergeConfig_(cfg);
  return cfg.TEYA_ENABLED === true;
}

function teyaIsEnabled(cfg) {
  return teyaIsEnabled_(cfg);
}

/** Inject Pull UI into daily form when TEYA_ENABLED. */
function teyaInjectDailyPrefill_(cfg, html) {
  cfg = teyaMergeConfig_(cfg);
  if (!teyaIsEnabled_(cfg) || !html) return html;
  var needle = '<label class="ps-label" for="pdq1">';
  if (html.indexOf(needle) === -1) {
    needle = 'for="pdq1"';
    if (html.indexOf(needle) === -1) return html;
    return html.replace(needle, teyaDailyPrefillHtml_() + needle);
  }
  return html.replace(needle, teyaDailyPrefillHtml_() + needle);
}

function teyaDailyPrefillHtml_() {
  return [
    '<div id="teyaPrefillBox" class="ps-card" style="margin-bottom:14px;">',
    '<div style="font-family:var(--serif);font-size:18px;margin-bottom:8px;">Teya card guide</div>',
    '<p class="ps-hint" style="margin:0 0 10px;">',
    '<strong>Guide only \\u2014 type PDQ 1 and PDQ 2 from the card machines yourself.</strong> ',
    'Teya figures are <strong>midnight to midnight</strong> (00:00\\u201323:59). ',
    'Late drinks after midnight land on the <em>next</em> Teya day, so these numbers can disagree with the till. ',
    'Use them as a check, not the final entry.',
    '</p>',
    '<button type="button" id="teyaPullBtn" class="ps-btn ps-btn-secondary ps-btn-block">Show Teya guide from email</button>',
    '<div id="teyaGuidePanel" style="display:none;margin-top:12px;padding:10px 12px;border-left:3px solid #c0635a;background:rgba(192,99,90,0.08);">',
    '<div style="font-weight:600;margin-bottom:6px;">Teya guide (midnight\\u2013midnight)</div>',
    '<div id="teyaGuideFigures" style="font-size:15px;margin-bottom:8px;"></div>',
    '<p id="teyaGuideWarn" class="ps-hint" style="margin:0;color:#8a3a32;">',
    'Warning: after-midnight sales are not on this day\\u2019s Teya total. Enter what the machines actually show.',
    '</p>',
    '</div>',
    '<div id="teyaPrefillMsg" class="ps-hint" style="min-height:1.2em;margin-top:8px;"></div>',
    '</div>',
    '<script>',
    '(function(){',
    'var btn=document.getElementById("teyaPullBtn");',
    'var msg=document.getElementById("teyaPrefillMsg");',
    'var panel=document.getElementById("teyaGuidePanel");',
    'var figs=document.getElementById("teyaGuideFigures");',
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
    'return londonYesterday();',
    '}',
    'function showGuide(a,b,detail){',
    'if(figs)figs.innerHTML="Channel A / PDQ 1 guide: <strong>\\u00a3"+a+"</strong><br>Channel B / PDQ 2 guide: <strong>\\u00a3"+b+"</strong>";',
    'if(panel)panel.style.display="block";',
    'setMsg(detail||("Guide loaded \\u2014 type the machine readings into PDQ 1 and PDQ 2."),false);',
    '}',
    'btn.addEventListener("click",function(){',
    'if(!google||!google.script||!google.script.run){setMsg("google.script.run unavailable",true);return;}',
    'btn.disabled=true;setMsg("Checking Teya emails\\u2026",false);',
    'if(panel)panel.style.display="none";',
    'var dayKey=dayKeyFromForm();',
    'google.script.run',
    '.withSuccessHandler(function(res){',
    'btn.disabled=false;',
    'if(!res||!res.success){setMsg((res&&res.message)||"Teya email pull failed",true);return;}',
    'showGuide(res.pdq1,res.pdq2,res.message);',
    '})',
    '.withFailureHandler(function(err){btn.disabled=false;setMsg(String(err),true);})',
    '.teyaPullDayTotals(dayKey);',
    '});',
    '})();',
    '</script>'
  ].join('');
}

/**
 * Pull PDQ totals for paperwork dayKey (YYYY-MM-DD).
 * Ingests recent Teya Gmail reports first, then reads cache / parses attachments.
 * Venue: function teyaPullDayTotals(dayKey) { return PubSystemLib.teyaPullDayTotals(VENUE_CONFIG, dayKey); }
 */
function teyaPullDayTotals(cfg, dayKey) {
  cfg = teyaMergeConfig_(cfg);
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya is disabled for this venue (TEYA_ENABLED).' };
  }

  dayKey = String(dayKey || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    dayKey = teyaLondonYesterday_();
  }

  try {
    teyaIngestEmails(cfg); // refresh from Gmail (idempotent)
  } catch (ingestErr) {
    Logger.log('teyaIngestEmails: ' + (ingestErr && ingestErr.message ? ingestErr.message : ingestErr));
  }

  var cached = teyaCacheGetDay_(dayKey);
  if (cached && cached.pdq1 != null) {
    return {
      success: true,
      date: dayKey,
      pdq1: cached.pdq1,
      pdq2: cached.pdq2,
      count: cached.count || 0,
      source: cached.source || 'gmail',
      guideOnly: true,
      message:
        'GUIDE ONLY for ' + dayKey + ' (Teya midnight\\u2013midnight): Channel A £' + cached.pdq1 +
        ' · Channel B £' + cached.pdq2 +
        '. After-midnight drinks are on the next Teya day — type machine readings into PDQ 1 / 2.' +
        (cached.note ? ' (' + cached.note + ')' : '')
    };
  }

  return {
    success: false,
    message:
      'No Teya email guide for ' + dayKey +
      ' (midnight\\u2013midnight). Check Gmail for reporting@teya.com / noreply@teya.com, ' +
      'run teyaIngestEmails, and confirm daily settlement emails are on in the Teya Business Portal.'
  };
}

/**
 * Scan Gmail for recent Teya reports, parse attachments, cache day totals.
 * Venue: function teyaIngestEmails() { return PubSystemLib.teyaIngestEmails(VENUE_CONFIG); }
 */
function teyaIngestEmails(cfg) {
  cfg = teyaMergeConfig_(cfg);
  if (!teyaIsEnabled_(cfg)) {
    return { success: false, message: 'Teya disabled.' };
  }

  var query =
    '(from:noreply@teya.com OR from:reporting@teya.com OR from:teya.com) ' +
    '(subject:Settlement OR subject:settlement OR subject:Daily OR subject:Activity OR subject:transaction OR subject:Report OR has:attachment) ' +
    'newer_than:14d';

  var threads = GmailApp.search(query, 0, 30);
  var processed = 0;
  var skipped = 0;
  var errors = [];

  for (var t = 0; t < threads.length; t++) {
    var msgs = threads[t].getMessages();
    for (var m = 0; m < msgs.length; m++) {
      var msg = msgs[m];
      var msgId = msg.getId();
      if (teyaCacheSeenMessage_(msgId)) {
        skipped++;
        continue;
      }
      try {
        var result = teyaParseMessage_(cfg, msg);
        if (result && result.days) {
          Object.keys(result.days).forEach(function (dk) {
            teyaCachePutDay_(dk, result.days[dk]);
          });
          processed++;
        }
        teyaCacheMarkMessage_(msgId);
      } catch (err) {
        errors.push(msgId + ': ' + (err && err.message ? err.message : String(err)));
      }
    }
  }

  return {
    success: true,
    processed: processed,
    skipped: skipped,
    errors: errors,
    message: 'Ingested ' + processed + ' new Teya message(s); skipped ' + skipped + ' already seen.'
  };
}

/**
 * Install a morning trigger (06:30 Europe/London) to ingest Teya emails.
 * Venue: function teyaInstallEmailTrigger() { return PubSystemLib.teyaInstallEmailTrigger(VENUE_CONFIG); }
 */
function teyaInstallEmailTrigger(cfg) {
  cfg = teyaMergeConfig_(cfg);
  var handlers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < handlers.length; i++) {
    if (handlers[i].getHandlerFunction() === 'teyaIngestEmailsTrigger') {
      ScriptApp.deleteTrigger(handlers[i]);
    }
  }
  ScriptApp.newTrigger('teyaIngestEmailsTrigger')
    .timeBased()
    .atHour(6)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone('Europe/London')
    .create();
  return { success: true, message: 'Installed daily 06:30 Europe/London trigger → teyaIngestEmailsTrigger.' };
}

function teyaIngestEmailsTrigger() {
  try {
    if (typeof VENUE_CONFIG !== 'undefined') {
      teyaIngestEmails(VENUE_CONFIG);
    }
  } catch (e) {
    Logger.log(String(e));
  }
}

// ── Message / attachment parsing ────────────────────────────────────────────

function teyaParseMessage_(cfg, msg) {
  var atts = msg.getAttachments({ includeInlineImages: false, includeAttachments: true });
  var days = {};
  var any = false;

  for (var i = 0; i < atts.length; i++) {
    var att = atts[i];
    var name = String(att.getName() || '').toLowerCase();
    var mime = String(att.getContentType() || '').toLowerCase();
    var parsed = null;

    if (name.indexOf('.csv') !== -1 || mime.indexOf('csv') !== -1 || mime.indexOf('text/') === 0) {
      parsed = teyaTotalsFromCsvText_(cfg, att.getDataAsString('UTF-8'));
    } else if (name.indexOf('.pdf') !== -1 || mime.indexOf('pdf') !== -1) {
      parsed = teyaTotalsFromPdfBlob_(cfg, att.copyBlob(), att.getName());
    }

    if (parsed && parsed.days) {
      Object.keys(parsed.days).forEach(function (dk) {
        days[dk] = parsed.days[dk];
        any = true;
      });
    }
  }

  if (!any) {
    var body = (msg.getPlainBody() || '') + '\n' + (msg.getSubject() || '');
    var bodyParsed = teyaTotalsFromSettlementText_(cfg, body);
    if (bodyParsed && bodyParsed.days) {
      Object.keys(bodyParsed.days).forEach(function (dk) {
        days[dk] = bodyParsed.days[dk];
        any = true;
      });
    }
  }

  if (!any) return null;
  return { days: days };
}

function teyaTotalsFromCsvText_(cfg, csvText) {
  var labels = cfg.TEYA_CHANNEL_LABELS || {};
  var rows = teyaParseCsvRows_(csvText);
  if (!rows.length) return null;
  var txns = teyaBuildTxns_(rows);
  if (!txns.length) return null;

  // Bucket by Teya calendar day (midnight→midnight UK) — guide only for paperwork
  var byDay = {};
  for (var i = 0; i < txns.length; i++) {
    var t = txns[i];
    if (!t.approved) continue;
    var trd = t.date; // calendar day on the export
    if (!byDay[trd]) byDay[trd] = [];
    byDay[trd].push(t);
  }

  var days = {};
  Object.keys(byDay).forEach(function (dk) {
    var totals = teyaDayTotalsFromTxns_(byDay[dk], labels);
    days[dk] = {
      pdq1: totals.pdq1,
      pdq2: totals.pdq2,
      count: totals.count,
      source: 'gmail-csv',
      note: 'midnight\\u2013midnight guide'
    };
  });
  return { days: days };
}

function teyaTotalsFromPdfBlob_(cfg, blob, filename) {
  var text = '';
  try {
    text = teyaOcrPdfToText_(blob, filename || 'teya.pdf');
  } catch (err) {
    Logger.log('PDF OCR failed: ' + err);
    return null;
  }
  if (!text) return null;
  return teyaTotalsFromSettlementText_(cfg, text);
}

function teyaOcrPdfToText_(blob, filename) {
  if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.create) {
    var resource = { name: 'teya-ocr-' + Date.now(), mimeType: MimeType.GOOGLE_DOCS };
    var file = Drive.Files.create(resource, blob, { ocrLanguage: 'en' });
    var id = file.id;
    try {
      var doc = DocumentApp.openById(id);
      var text = doc.getBody().getText();
      DriveApp.getFileById(id).setTrashed(true);
      return text;
    } catch (e) {
      try { DriveApp.getFileById(id).setTrashed(true); } catch (e2) {}
      throw e;
    }
  }

  if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.insert) {
    var res2 = { title: 'teya-ocr-' + Date.now(), mimeType: MimeType.GOOGLE_DOCS };
    var file2 = Drive.Files.insert(res2, blob, { ocr: true, ocrLanguage: 'en' });
    var id2 = file2.id;
    try {
      var doc2 = DocumentApp.openById(id2);
      var text2 = doc2.getBody().getText();
      DriveApp.getFileById(id2).setTrashed(true);
      return text2;
    } catch (e3) {
      try { DriveApp.getFileById(id2).setTrashed(true); } catch (e4) {}
      throw e3;
    }
  }

  throw new Error(
    'PDF received but Drive API is not enabled. In Windmill Apps Script: Services → Add Drive API.'
  );
}

/**
 * Parse Teya settlement PDF / email text.
 * Uses "By sales channel" device rows (gross Sales), never net Settlement amount.
 * Day key = sales date on the report (Teya midnight→midnight calendar day).
 */
function teyaTotalsFromSettlementText_(cfg, text) {
  var labels = cfg.TEYA_CHANNEL_LABELS || {};
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
    if (/^(visa|mastercard|total|sales|fees|paid|gbp|teya)$/i.test(id)) continue;
    var pence = Math.round(parseFloat(match[3].replace(/,/g, '')) * 100);
    devices[id] = (devices[id] || 0) + pence;
  }

  var dayKey = teyaParseSalesDayFromSettlement_(raw);
  if (!dayKey) dayKey = teyaLondonYesterday_();

  var ids = Object.keys(devices);
  var days = {};

  if (ids.length) {
    var pdq1 = 0;
    var pdq2 = 0;
    var count = 0;
    for (var i = 0; i < ids.length; i++) {
      var did = ids[i];
      var p = devices[did];
      var slot = teyaSlotForLabel_(labels[did] || '');
      if (!slot && did === 'oOj2CqaI') slot = 1;
      if (!slot && did === '7KckI3g7') slot = 2;
      if (slot === 1) pdq1 += p;
      else if (slot === 2) pdq2 += p;
      count += 1;
    }
    if (pdq1 === 0 && pdq2 === 0 && ids.length === 2) {
      ids.sort();
      pdq1 = devices[ids[0]];
      pdq2 = devices[ids[1]];
    } else if (pdq1 === 0 && pdq2 === 0 && ids.length === 1) {
      pdq1 = devices[ids[0]];
    }
    days[dayKey] = {
      pdq1: (pdq1 / 100).toFixed(2),
      pdq2: (pdq2 / 100).toFixed(2),
      count: count,
      source: 'gmail-settlement-pdf',
      note: 'midnight\\u2013midnight guide'
    };
    return { days: days };
  }

  // Gross Sales line only (not settlement/net paid)
  var salesLine = raw.match(/(?:^|\n)\s*Sales\s+([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}|[0-9]+\.[0-9]{2})/i);
  if (salesLine) {
    var grand = parseFloat(salesLine[1].replace(/,/g, ''));
    days[dayKey] = {
      pdq1: grand.toFixed(2),
      pdq2: '0.00',
      count: 0,
      source: 'gmail-settlement-total',
      note: 'Sales total only (no channel split) — midnight\\u2013midnight guide'
    };
    return { days: days };
  }

  return null;
}

function teyaParseSalesDayFromSettlement_(raw) {
  var breakdown = raw.match(/Sales\s+breakdown[\s\S]{0,400}/i);
  if (breakdown) {
    var d1 = teyaParseLongDate_(breakdown[0]);
    if (d1) return d1;
  }
  var schemeBlock = raw.match(/By\s+schemes[\s\S]{0,200}/i);
  if (schemeBlock) {
    var d2 = teyaParseLongDate_(schemeBlock[0]);
    if (d2) return d2;
  }
  // Avoid "Paid on" — strip that clause then try
  var withoutPaid = raw.replace(/Paid\s+on[\s\S]{0,40}/i, ' ');
  var d3 = teyaParseLongDate_(withoutPaid);
  if (d3) return d3;
  var iso = withoutPaid.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  return null;
}

function teyaParseLongDate_(text) {
  var months = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9,
    oct: 10, nov: 11, dec: 12
  };
  var m = String(text || '').match(
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})\b/i
  );
  if (!m) {
    m = String(text || '').match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(20\d{2})\b/);
  }
  if (!m) return null;
  var mon = months[m[1].toLowerCase()];
  if (!mon) return null;
  return m[3] + '-' + ('0' + mon).slice(-2) + '-' + ('0' + parseInt(m[2], 10)).slice(-2);
}

// ── Trading day / totals helpers ────────────────────────────────────────────

/** Kept for compatibility; Teya guide uses calendar (midnight) day on the export. */
function teyaTradingDayKeyFromParts_(isoDate, hour, minute) {
  return isoDate;
}

function teyaDayTotalsFromTxns_(txns, labels) {
  var pdq1 = 0;
  var pdq2 = 0;
  var count = 0;
  for (var i = 0; i < txns.length; i++) {
    var t = txns[i];
    var id = t.serial || t.term || '';
    var slot = teyaSlotForLabel_(labels[id] || '');
    if (!slot && id === 'oOj2CqaI') slot = 1;
    if (!slot && id === '7KckI3g7') slot = 2;
    if (slot === 1) pdq1 += t.pence;
    else if (slot === 2) pdq2 += t.pence;
    count++;
  }
  if (pdq1 === 0 && pdq2 === 0) {
    var by = {};
    for (var j = 0; j < txns.length; j++) {
      var id2 = txns[j].serial || txns[j].term || 'Unknown';
      by[id2] = (by[id2] || 0) + txns[j].pence;
    }
    var ids = Object.keys(by).sort();
    if (ids.length === 2) {
      pdq1 = by[ids[0]];
      pdq2 = by[ids[1]];
    } else if (ids.length === 1) {
      pdq1 = by[ids[0]];
    }
  }
  return {
    pdq1: (pdq1 / 100).toFixed(2),
    pdq2: (pdq2 / 100).toFixed(2),
    count: count
  };
}

function teyaSlotForLabel_(label) {
  var s = String(label || '').toUpperCase();
  if (s.indexOf('CHANNEL A') !== -1 || s === 'A') return 1;
  if (s.indexOf('CHANNEL B') !== -1 || s === 'B') return 2;
  if (s.indexOf('1') !== -1 && s.indexOf('2') === -1) return 1;
  if (s.indexOf('2') !== -1) return 2;
  return 0;
}

function teyaLondonYesterday_() {
  var today = Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd').split('-');
  var utc = Date.UTC(+today[0], +today[1] - 1, +today[2]);
  return Utilities.formatDate(new Date(utc - 86400000), 'Europe/London', 'yyyy-MM-dd');
}

function teyaAddCalendarDays_(ymd, delta) {
  var p = ymd.split('-');
  var utc = Date.UTC(+p[0], +p[1] - 1, +p[2] + delta);
  return Utilities.formatDate(new Date(utc), 'UTC', 'yyyy-MM-dd');
}

// ── Cache (Script Properties) ───────────────────────────────────────────────

function teyaCacheGetAll_() {
  var raw = PropertiesService.getScriptProperties().getProperty('TEYA_EMAIL_CACHE') || '{}';
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function teyaCachePutAll_(obj) {
  var keys = Object.keys(obj).filter(function (k) { return /^\d{4}-\d{2}-\d{2}$/.test(k); }).sort();
  while (keys.length > 21) {
    delete obj[keys.shift()];
  }
  PropertiesService.getScriptProperties().setProperty('TEYA_EMAIL_CACHE', JSON.stringify(obj));
}

function teyaCacheGetDay_(dayKey) {
  var all = teyaCacheGetAll_();
  return all[dayKey] || null;
}

function teyaCachePutDay_(dayKey, data) {
  var all = teyaCacheGetAll_();
  all[dayKey] = data;
  all[dayKey].ingestedAt = new Date().toISOString();
  teyaCachePutAll_(all);
}

function teyaCacheSeenMessage_(msgId) {
  var raw = PropertiesService.getScriptProperties().getProperty('TEYA_SEEN_MSG_IDS') || '[]';
  var arr;
  try { arr = JSON.parse(raw); } catch (e) { arr = []; }
  return arr.indexOf(msgId) !== -1;
}

function teyaCacheMarkMessage_(msgId) {
  var raw = PropertiesService.getScriptProperties().getProperty('TEYA_SEEN_MSG_IDS') || '[]';
  var arr;
  try { arr = JSON.parse(raw); } catch (e) { arr = []; }
  arr.push(msgId);
  while (arr.length > 200) arr.shift();
  PropertiesService.getScriptProperties().setProperty('TEYA_SEEN_MSG_IDS', JSON.stringify(arr));
}

// ── CSV row parser (transaction export) ─────────────────────────────────────

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
  if (!colDate || !colAmt) return [];

  var approvedMap = {
    SUCCEEDED: 1, SUCCESS: 1, APPROVED: 1, AUTHORISED: 1, AUTHORIZED: 1, COMPLETED: 1, '': 1
  };
  var txns = [];
  for (var i = 0; i < rows.length; i++) {
    var raw = rows[i];
    var dateStr = String(raw[colDate] || '').trim();
    var timeStr = colTime ? String(raw[colTime] || '').trim() : '12:00:00';
    if (!dateStr) continue;
    var isoDate = dateStr;
    var mSlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    var mIso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mSlash) {
      isoDate = mSlash[3] + '-' + ('0' + mSlash[2]).slice(-2) + '-' + ('0' + mSlash[1]).slice(-2);
    } else if (!mIso) continue;
    if (timeStr.length === 5) timeStr += ':00';
    var hm = timeStr.split(':');
    var hour = parseInt(hm[0], 10);
    var minute = parseInt(hm[1] || '0', 10);
    if (isNaN(hour)) hour = 12;
    if (isNaN(minute)) minute = 0;

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
      hour: hour,
      minute: minute,
      term: term,
      serial: serial,
      pence: isRefund ? -Math.abs(pence) : pence,
      approved: !!approvedMap[status]
    });
  }
  return txns;
}
