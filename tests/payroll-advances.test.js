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
var index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(html.indexOf('action=staffAdvances') !== -1, 'calls Staff Hub action=staffAdvances');
assert(html.indexOf('&from=') !== -1 && html.indexOf('&to=') !== -1, 'passes from/to window');
assert(html.indexOf('&key=') !== -1, 'passes key query param');
assert(html.indexOf('varlo.payroll.advancesKey') !== -1, 'localStorage key name present');
assert(html.indexOf('Advances key') !== -1, 'Advances key label present');
assert(html.indexOf('Key needed') !== -1, 'key needed state copy present');
assert(html.indexOf('id="advancesPanel"') !== -1, 'advances panel markup present');
assert(html.indexOf('+ deduction') !== -1, '+ deduction control present');
assert(html.indexOf('function applyAdvanceDeduction') !== -1, 'applyAdvanceDeduction helper present');
assert(html.indexOf('function loadStaffAdvances') !== -1, 'loadStaffAdvances helper present');
assert(html.indexOf('>3</div> Advances') !== -1 || html.indexOf('3</div> Advances') !== -1, 'workflow step Advances present');
assert(html.indexOf('never makes or queues a payment') !== -1 || html.indexOf('never make or queue') !== -1, 'no-payment copy present');
assert(index.indexOf('payroll.html?v=20261101-advances-step') !== -1, 'index cache-bust bumped for advances');

// Must not embed a committed secret value. Property name may appear only in a never-commit warning.
assert(/never commit OWNER_ADVANCES_KEY/.test(html), 'comment warns never to commit OWNER_ADVANCES_KEY');
assert(!/key=['"][A-Za-z0-9_-]{12,}['"]/.test(html), 'no hardcoded key= secret in HTML');
assert(html.indexOf("credentials: 'omit'") !== -1 || html.indexOf('credentials: "omit"') !== -1, 'advances fetch omits credentials');

// Name-match helper smoke test
var norm = html.match(/function normalizePersonName_\(name\) \{[\s\S]*?\n\}/);
var find = html.match(/function findEmployeeIndexForAdvance_\(adv\) \{[\s\S]*?\n\}/);
assert(!!norm && !!find, 'can extract name-match helpers');
if (norm && find) {
  // eslint-disable-next-line no-new-func
  var fn = new Function(
    'employees',
    'adv',
    norm[0] + '\n' + find[0] + '\nreturn findEmployeeIndexForAdvance_(adv);'
  );
  var employees = [
    { name: 'James Jordan' },
    { name: 'Callum Johnson' },
    { name: 'Sean Dickens-Shone' }
  ];
  assert(fn(employees, { employeeName: 'James Jordan' }) === 0, 'matches James Jordan');
  assert(fn(employees, { payeeName: 'Callum Johnson' }) === 1, 'matches Callum via payeeName');
  assert(fn(employees, { employeeName: 'Sean Dickens Shone' }) === 2, 'matches Sean with hyphen normalized');
  assert(fn(employees, { employeeName: 'Random Supplier Ltd' }) === -1, 'ignores non-employees');
}

// Deduction reference helper
var ref = html.match(/function advanceReference_\(adv\) \{[\s\S]*?\n\}/);
var amt = html.match(/function advanceAmount_\(adv\) \{[\s\S]*?\n\}/);
var uk = html.match(/function formatAdvanceDateUk_\(iso\) \{[\s\S]*?\n\}/);
assert(!!ref && !!amt && !!uk, 'can extract advance helpers');
if (ref && amt && uk) {
  // eslint-disable-next-line no-new-func
  var helpers = new Function(
    uk[0] + '\n' + amt[0] + '\n' + ref[0] +
    '\nreturn { advanceAmount_: advanceAmount_, advanceReference_: advanceReference_ };'
  )();
  assert(helpers.advanceAmount_({ amount: 200 }) === 200, 'amount helper reads amount');
  var reason = helpers.advanceReference_({ date: '2026-10-21', paySource: 'Wise', note: '' });
  assert(/Advance/.test(reason) && /Wise/.test(reason), 'reference prefills Advance + source');
  assert(helpers.advanceReference_({ note: 'Staff advance JJ' }) === 'Staff advance JJ', 'note preferred as reference');
}

if (failed) {
  console.error('\n' + failed + ' failure(s)');
  process.exit(1);
}
console.log('\nAll payroll advances checks passed');
