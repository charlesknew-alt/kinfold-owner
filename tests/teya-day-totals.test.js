#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var Teya = require('../teya-day-totals.js');

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

var labels = {
  oOj2CqaI: 'Channel A',
  '7KckI3g7': 'Channel B'
};

var sample = fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'windmill-teya-transaction-report.csv'),
  'utf8'
);

var settlementTxt = fs.readFileSync(
  path.join(__dirname, '..', 'samples', 'teya-settlement-report-ocr.txt'),
  'utf8'
);

assert(Teya.tradingDayKey('2026-09-17', 2, 0) === '2026-09-17', 'after midnight stays calendar day');
assert(Teya.tradingDayKey('2026-09-17', 12, 0) === '2026-09-17', 'noon stays calendar day');
assert(Teya.tradingDayKey('2026-09-17', 23, 0) === '2026-09-17', 'evening stays calendar day');

var settled = Teya.totalsFromSettlementText(settlementTxt, labels, '2026-09-17');
assert(settled && settled.pdq1 === '474.30', 'settlement PDF Channel A → pdq1 = 474.30 (got ' + (settled && settled.pdq1) + ')');
assert(settled && settled.pdq2 === '3763.25', 'settlement PDF Channel B → pdq2 = 3763.25 (got ' + (settled && settled.pdq2) + ')');
assert(settled && settled.date === '2026-09-17', 'settlement sales day is 2026-09-17');

var all = Teya.totalsFromCsvText(sample, labels, null);
assert(Array.isArray(all) && all.length >= 1, 'sample CSV has at least one settlement day');

var one = Teya.totalsFromCsvText(sample, labels, '2026-09-17');
assert(one && one.pdq1 === '474.30', 'CSV Channel A → pdq1 = 474.30 (got ' + (one && one.pdq1) + ')');
assert(one && one.pdq2 === '3763.25', 'CSV Channel B → pdq2 = 3763.25 (got ' + (one && one.pdq2) + ')');
assert(one.unknownPence === 0, 'no unknown-device pence');

var teyaGs = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/Teya.gs'), 'utf8');
assert(teyaGs.indexOf('function teyaPullDayTotals') !== -1, 'Teya.gs has teyaPullDayTotals');
assert(teyaGs.indexOf('function teyaIngestEmails') !== -1, 'Teya.gs has teyaIngestEmails');
assert(teyaGs.indexOf('GmailApp.search') !== -1, 'Teya.gs searches Gmail');
assert(teyaGs.indexOf('Show Teya guide from email') !== -1, 'Teya.gs UI is guide pull');
assert(teyaGs.indexOf('Guide only') !== -1 || teyaGs.indexOf('GUIDE ONLY') !== -1, 'Teya.gs marks guide only');
assert(teyaGs.indexOf('teyaCsvFile') === -1, 'Teya.gs daily UI has no CSV file input');
assert(teyaGs.indexOf('by\\s+sales\\s+channel') !== -1, 'Teya.gs parses By sales channel');
assert(teyaGs.indexOf('midnight') !== -1, 'Teya.gs documents midnight window');
assert(teyaGs.indexOf('teyaPdfToText_') !== -1 || teyaGs.indexOf('teyaOcrPdfToText_') !== -1, 'Teya.gs converts PDF to text');
assert(teyaGs.indexOf('ocr: true') === -1, 'Teya.gs does not use deprecated Drive OCR flag');
assert(teyaGs.indexOf('function teyaClearSeenMessages') !== -1, 'Teya.gs can clear seen cache');

var readme = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/README.md'), 'utf8');
assert(readme.indexOf('Gmail') !== -1, 'teya README is Gmail-first');
assert(readme.indexOf('midnight') !== -1, 'teya README documents midnight window');
assert(readme.indexOf('guide') !== -1, 'teya README says guide');
assert(readme.indexOf('STEP 1') !== -1 && readme.indexOf('STEP 9') !== -1, 'teya README has steps 1-9');
assert(/no API/i.test(readme), 'teya README notes no API');
assert(readme.indexOf('oOj2CqaI') !== -1, 'teya README documents Windmill device IDs');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll Teya day-total checks passed');
