#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

var html = fs.readFileSync(path.join(__dirname, '..', 'payroll.html'), 'utf8');

assert(html.indexOf('id="wiseExclusionPanel"') !== -1, 'wiseExclusionPanel markup exists');
assert(html.indexOf('id="downloadWarn"') !== -1, 'downloadWarn near Download button exists');
assert(html.indexOf('function hasValidBankDetails') !== -1, 'hasValidBankDetails helper exists');
assert(html.indexOf('function bankDigits') !== -1, 'bankDigits helper exists');
assert(html.indexOf('function wiseSortForCsv') !== -1, 'wiseSortForCsv helper exists');
assert(html.indexOf('function updateWiseExclusionPanel') !== -1, 'updateWiseExclusionPanel exists');
assert(html.indexOf('function collectTableDropouts') !== -1, 'collectTableDropouts exists');
assert(html.indexOf('function getMissingWontPayItems') !== -1, 'getMissingWontPayItems exists');
assert(html.indexOf('Missing / won\'t pay') !== -1, 'Missing / won\'t pay panel copy exists');
assert(html.indexOf('Download blocked') !== -1, 'Download blocked copy exists');
assert(html.indexOf('position:sticky') !== -1, 'sticky Missing panel CSS exists');
assert(html.indexOf('const payable=employees.filter') !== -1 || html.indexOf('const payable = employees.filter') !== -1 || html.indexOf('payable=employees.filter') !== -1, 'download builds payable subset');
assert(/payable\.map\(e=>/.test(html) || /payable\.map\(e =>/.test(html) || /payable\.map\(e=>\{/.test(html), 'Wise CSV rows come from payable only');
assert(html.indexOf('sourceDropouts') !== -1, 'sourceDropouts tracking exists');
assert(html.indexOf('lastDownloadLeftOut') !== -1, 'lastDownloadLeftOut tracking exists');
assert(html.indexOf('no-bank-tag') !== -1, 'NO BANK row tag exists');
assert(html.indexOf('wiseSortForCsv(e)') !== -1, 'CSV uses wiseSortForCsv');
assert(html.indexOf('wiseAcctForCsv(e)') !== -1, 'CSV uses wiseAcctForCsv');
assert(html.indexOf('idx===8||idx===9') !== -1, 'sort/account fields are quoted in CSV');
assert(html.indexOf('#editRowModal') !== -1, 'edit modal contrast CSS still present (do not regress)');
assert(/if\(neg\.length\|\|noBank\.length\)/.test(html), 'download hard-blocks on zero-net or no-bank');

// Extract and smoke-test hasValidBankDetails + wise CSV formatters
var bankFn = html.match(/function bankDigits\(e\)\{[\s\S]*?\n\}/);
var validFn = html.match(/function hasValidBankDetails\(e\)\{[\s\S]*?\n\}/);
var sortFn = html.match(/function wiseSortForCsv\(e\)\{[\s\S]*?\n\}/);
var acctFn = html.match(/function wiseAcctForCsv\(e\)\{[\s\S]*?\n\}/);
assert(!!bankFn && !!validFn && !!sortFn && !!acctFn, 'can extract bank helpers');
if (bankFn && validFn && sortFn && acctFn) {
  // eslint-disable-next-line no-new-func
  var helpers = new Function(
    bankFn[0] + '\n' +
    validFn[0] + '\n' +
    sortFn[0] + '\n' +
    acctFn[0] + '\n' +
    'return {bankDigits:bankDigits,hasValidBankDetails:hasValidBankDetails,wiseSortForCsv:wiseSortForCsv,wiseAcctForCsv:wiseAcctForCsv};'
  )();
  var hasValidBankDetails = helpers.hasValidBankDetails;
  var wiseSortForCsv = helpers.wiseSortForCsv;
  var wiseAcctForCsv = helpers.wiseAcctForCsv;

  assert(hasValidBankDetails({ sortCode: '20-00-00', accountNumber: '12345678' }) === true, 'valid bank passes');
  assert(hasValidBankDetails({ sortCode: '', accountNumber: '12345678' }) === false, 'missing sort fails');
  assert(hasValidBankDetails({ sortCode: '20-00-00', accountNumber: '' }) === false, 'missing account fails');
  assert(hasValidBankDetails({ sortCode: '20-00', accountNumber: '1234567' }) === false, 'short bank fails');
  assert(hasValidBankDetails({ sortCode: '200000', accountNumber: '12345678' }) === true, 'unhyphenated sort ok');

  // Jude Charman case — leading zeros must validate and survive CSV formatting
  var jude = { sortCode: '04-36-05', accountNumber: '09380302', name: 'Jude Charman', amount: 127.52 };
  assert(hasValidBankDetails(jude) === true, 'Jude sort 043605 / acct 09380302 is valid (leading zeros OK)');
  assert(wiseSortForCsv(jude) === '04-36-05', 'Jude sort kept as 04-36-05 for Wise CSV');
  assert(wiseAcctForCsv(jude) === '09380302', 'Jude account keeps leading zero in Wise CSV');
  assert(hasValidBankDetails({ sortCode: '043605', accountNumber: '09380302' }) === true, 'unhyphenated leading-zero sort still valid');
  assert(wiseSortForCsv({ sortCode: '043605', accountNumber: '09380302' }) === '04-36-05', 'normalises bare 043605 to 04-36-05');
}

if (failed) {
  console.error('\n' + failed + ' failure(s)');
  process.exit(1);
}
console.log('\nAll payroll wise-exclusion checks passed');
