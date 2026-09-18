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

var all = Teya.totalsFromCsvText(sample, labels, null);
assert(Array.isArray(all) && all.length === 1, 'sample has one calendar day');
assert(all[0].date === '2026-09-17', 'day is 2026-09-17');

var one = Teya.totalsFromCsvText(sample, labels, '2026-09-17');
assert(one && one.pdq1 === '474.30', 'Channel A → pdq1 = 474.30 (got ' + (one && one.pdq1) + ')');
assert(one && one.pdq2 === '3763.25', 'Channel B → pdq2 = 3763.25 (got ' + (one && one.pdq2) + ')');
assert(one.unknownPence === 0, 'no unknown-device pence');

assert(Teya.slotForLabel('Channel A') === 1, 'slot Channel A = 1');
assert(Teya.slotForLabel('Channel B') === 2, 'slot Channel B = 2');

var missing = Teya.totalsFromCsvText(sample, labels, '2099-01-01');
assert(missing === null, 'missing day returns null');

var teyaGs = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/Teya.gs'), 'utf8');
assert(teyaGs.indexOf('function teyaDayTotalsFromCsv') !== -1, 'Teya.gs has teyaDayTotalsFromCsv');
assert(teyaGs.indexOf('function fetchTeyaTransactions') !== -1, 'Teya.gs has fetchTeyaTransactions');
assert(teyaGs.indexOf('TEYA_CLIENT_ID') !== -1, 'Teya.gs documents API Script Properties');
assert(teyaGs.indexOf('placeholder') === -1 || teyaGs.indexOf('v3') !== -1, 'Teya.gs is v3 implementation not empty stub');

var snippet = fs.readFileSync(
  path.join(__dirname, '..', 'apps-script/teya/daily-prefill-snippet.html'),
  'utf8'
);
assert(snippet.indexOf('pdq1') !== -1 && snippet.indexOf('teyaCsvFile') !== -1, 'daily snippet fills pdq1 via file input');

var readme = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/README.md'), 'utf8');
assert(readme.indexOf('TEYA_CHANNEL_LABELS') !== -1, 'teya README mentions channel labels');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll Teya day-total checks passed');
