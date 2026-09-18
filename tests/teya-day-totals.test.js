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

var teyaGs = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/Teya.gs'), 'utf8');
assert(teyaGs.indexOf('function teyaPullDayTotals') !== -1, 'Teya.gs has teyaPullDayTotals');
assert(teyaGs.indexOf('function teyaIngestEmails') !== -1, 'Teya.gs has teyaIngestEmails');
assert(teyaGs.indexOf('GmailApp.search') !== -1, 'Teya.gs searches Gmail');
assert(teyaGs.indexOf('Pull from Teya email') !== -1, 'Teya.gs UI is email pull');
assert(teyaGs.indexOf('teyaCsvFile') === -1, 'Teya.gs daily UI has no CSV file input');
assert(teyaGs.indexOf('teyaTradingDayKeyFromParts_') !== -1, 'Teya.gs has 5am trading day');
assert(teyaGs.indexOf('v6') !== -1, 'Teya.gs is v6 Gmail');

var readme = fs.readFileSync(path.join(__dirname, '..', 'apps-script/teya/README.md'), 'utf8');
assert(readme.indexOf('Gmail') !== -1, 'teya README is Gmail-first');
assert(readme.indexOf('5am') !== -1, 'teya README documents 5am trading day');
assert(readme.indexOf('STEP 1') !== -1 && readme.indexOf('STEP 9') !== -1, 'teya README has steps 1-9');
assert(/no API/i.test(readme), 'teya README notes no API');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll Teya day-total checks passed');
