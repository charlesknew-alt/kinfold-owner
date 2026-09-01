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

assert(html.indexOf('STAFF_HUB_FETCH_TIMEOUT_MS') !== -1, 'fetch timeout constant present');
assert(html.indexOf('function fetchStaffHubJson') !== -1, 'fetchStaffHubJson helper present');
assert(html.indexOf('function formatXeroPullError') !== -1, 'formatXeroPullError helper present');
assert(html.indexOf('Reconnect Xero') !== -1, 'Reconnect Xero copy present');
assert(html.indexOf('Timed out waiting for Xero') !== -1, 'timeout copy present');
assert(html.indexOf('AbortController') !== -1, 'AbortController used');
assert(html.indexOf('retrySelectPayRun') !== -1, 'payslip retry handler present');
assert(html.indexOf('action=listPayRuns') !== -1, 'listPayRuns still used');
assert(!/await fetch\(STAFF_HUB_API \+ '\?action=listPayRuns/.test(html), 'listPayRuns no longer uses bare fetch');
assert(!/await fetch\(STAFF_HUB_API \+ '\?action=listPayslips/.test(html), 'listPayslips no longer uses bare fetch');
assert(html.indexOf('wiseExclusionPanel') !== -1 || html.indexOf('Missing / won') !== -1 || html.indexOf('Not going into the Wise file') !== -1, 'missing-payees / Wise exclusion UI preserved');

// Smoke-test formatXeroPullError by extracting + evaluating with stubs
var m = html.match(/function formatXeroPullError\(err\) \{[\s\S]*?\n\}/);
assert(!!m, 'can extract formatXeroPullError');
if (m) {
  var fnBody =
    'var currentEntity = "eightbells";\n' +
    'var STAFF_HUB_FETCH_TIMEOUT_MS = 45000;\n' +
    'function venueLabel(){ return currentEntity === "eightbells" ? "Eight Bells" : "Windmill"; }\n' +
    m[0] +
    '\nreturn formatXeroPullError;';
  // eslint-disable-next-line no-new-func
  var formatXeroPullError = new Function(fnBody)();
  var auth = formatXeroPullError(new Error('invalid_grant: refresh token expired'));
  assert(auth.title === 'Reconnect Xero', 'auth errors map to Reconnect Xero');
  var rate = formatXeroPullError(new Error('Xero API 429 on GET PayRuns?page=1 after 5 attempts (rate limited).'));
  assert(rate.title === 'Xero rate limit', '429 maps to rate limit');
  var gate = formatXeroPullError(new Error('Xero API 504 on GET PayRuns?page=1: Gateway Time-out'));
  assert(gate.title === 'Xero timed out', '504 maps to timed out');
  var abort = formatXeroPullError(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));
  assert(abort.title === 'Timed out waiting for Xero', 'AbortError maps to timeout title');
}

if (failed) {
  console.error('\n' + failed + ' failure(s)');
  process.exit(1);
}
console.log('\nAll payroll xero-pull checks passed');
