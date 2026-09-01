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
assert(html.indexOf('function hasValidBankDetails') !== -1, 'hasValidBankDetails helper exists');
assert(html.indexOf('function updateWiseExclusionPanel') !== -1, 'updateWiseExclusionPanel exists');
assert(html.indexOf('function collectTableDropouts') !== -1, 'collectTableDropouts exists');
assert(html.indexOf('Not going into the Wise file') !== -1, 'pre-download panel title copy exists');
assert(html.indexOf('Left out of Wise file') !== -1, 'post-download panel title copy exists');
assert(html.indexOf('const payable=employees.filter') !== -1 || html.indexOf('const payable = employees.filter') !== -1 || html.indexOf('payable=employees.filter') !== -1, 'download builds payable subset');
assert(/payable\.map\(e=>/.test(html) || /payable\.map\(e =>/.test(html), 'Wise CSV rows come from payable only');
assert(html.indexOf('sourceDropouts') !== -1, 'sourceDropouts tracking exists');
assert(html.indexOf('lastDownloadLeftOut') !== -1, 'lastDownloadLeftOut tracking exists');
assert(html.indexOf('no-bank-tag') !== -1, 'NO BANK row tag exists');
assert(html.indexOf('#editRowModal') !== -1, 'edit modal contrast CSS still present (do not regress)');

// Extract and smoke-test hasValidBankDetails
var m = html.match(/function hasValidBankDetails\(e\)\{[\s\S]*?\n\}/);
assert(!!m, 'can extract hasValidBankDetails');
if (m) {
  // eslint-disable-next-line no-new-func
  var hasValidBankDetails = new Function('return (' + m[0] + ')')();
  assert(hasValidBankDetails({ sortCode: '20-00-00', accountNumber: '12345678' }) === true, 'valid bank passes');
  assert(hasValidBankDetails({ sortCode: '', accountNumber: '12345678' }) === false, 'missing sort fails');
  assert(hasValidBankDetails({ sortCode: '20-00-00', accountNumber: '' }) === false, 'missing account fails');
  assert(hasValidBankDetails({ sortCode: '20-00', accountNumber: '1234567' }) === false, 'short bank fails');
  assert(hasValidBankDetails({ sortCode: '200000', accountNumber: '12345678' }) === true, 'unhyphenated sort ok');
}

if (failed) {
  console.error('\n' + failed + ' failure(s)');
  process.exit(1);
}
console.log('\nAll payroll wise-exclusion checks passed');
