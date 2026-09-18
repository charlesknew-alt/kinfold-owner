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
assert(teyaGs.indexOf('function teyaPullDayTotals') !== -1, 'Teya.gs has teyaPullDayTotals');
assert(teyaGs.indexOf('function teyaListTerminals') !== -1, 'Teya.gs has teyaListTerminals');
assert(teyaGs.indexOf('Pull from Teya now') !== -1, 'Teya.gs UI is API pull button');
assert(teyaGs.indexOf('teyaCsvFile') === -1, 'Teya.gs daily UI has no CSV file input');
assert(teyaGs.indexOf('poslink/v2/payment-requests') !== -1, 'Teya.gs calls POSLink payment-requests');
assert(teyaGs.indexOf('TEYA_CLIENT_ID') !== -1, 'Teya.gs documents API Script Properties');
assert(teyaGs.indexOf('v4') !== -1, 'Teya.gs is v4 live API');

var readme = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/README.md'), 'utf8');
assert(readme.indexOf('TEYA_STORE_ID') !== -1, 'teya README mentions store UUID');
assert(readme.indexOf('Pull from Teya now') !== -1, 'teya README is API-first');
assert(readme.indexOf('No CSV') !== -1, 'teya README says no CSV');
assert(readme.indexOf('Script properties') !== -1, 'teya README has Script properties step');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll Teya day-total checks passed');
