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

assert(html.indexOf('function toggleTableSort') !== -1, 'toggleTableSort exists');
assert(html.indexOf('function getDisplayEmployeeIndexes') !== -1, 'getDisplayEmployeeIndexes exists');
assert(html.indexOf('function updateSortIndicators') !== -1, 'updateSortIndicators exists');
assert(html.indexOf('data-sort="name"') !== -1, 'Employee header is sortable');
assert(html.indexOf('data-sort="gross"') !== -1, 'Gross header is sortable');
assert(html.indexOf('data-sort="net"') !== -1, 'Net header is sortable');
assert(html.indexOf('tableSort={col:null,dir:\'asc\'}') !== -1 || html.indexOf('tableSort={col:null,dir:"asc"}') !== -1, 'default sort is null (import order)');
assert(html.indexOf('getDisplayEmployeeIndexes().map') !== -1, 'renderTable uses display indexes');
assert(/const payable\s*=\s*employees\.filter/.test(html) || /const payable=employees\.filter/.test(html), 'Wise payable still filtered from employees array');
assert(/payable\.map\(e=>/.test(html) || /payable\.map\(e =>/.test(html) || /payable\.map\(e=>\{/.test(html), 'Wise CSV still maps payable (not display order helper)');
assert(html.indexOf('Never mutates `employees`') !== -1 || html.indexOf('never mutates') !== -1 || html.indexOf('Display-only table sort') !== -1, 'comment documents display-only sort');
assert(index.indexOf('payroll.html?v=20261101-table-sort') !== -1, 'index.html cache-bust bumped for payroll');

// Smoke-test display index sorting without reordering source array
var sortBlock = html.match(/function getDisplayEmployeeIndexes\(\)\{[\s\S]*?\n\}/);
var netFn = html.match(/function getNetPay\(emp\)\{return emp\.amount-getDeductionTotal\(emp\);\}/);
var dedFn = html.match(/function getDeductionTotal\(emp\)\{return\(emp\.deductions\|\|\[\]\)\.reduce\(\(s,d\)=>s\+d\.amount,0\);\}/);
assert(!!sortBlock && !!netFn && !!dedFn, 'can extract sort + net helpers');
if (sortBlock && netFn && dedFn) {
  // eslint-disable-next-line no-new-func
  var fn = new Function(
    'employees',
    'tableSort',
    dedFn[0] + '\n' + netFn[0] + '\n' + sortBlock[0] + '\n' +
    'return getDisplayEmployeeIndexes();'
  );
  var employees = [
    { name: 'Zoe', amount: 100, deductions: [] },
    { name: 'Amy', amount: 300, deductions: [{ amount: 50, reason: 'adv' }] },
    { name: 'Ben', amount: 200, deductions: [] }
  ];
  var byName = fn(employees, { col: 'name', dir: 'asc' });
  assert(byName.join(',') === '1,2,0', 'name asc → Amy, Ben, Zoe');
  var byNameDesc = fn(employees, { col: 'name', dir: 'desc' });
  assert(byNameDesc.join(',') === '0,2,1', 'name desc → Zoe, Ben, Amy');
  var byGross = fn(employees, { col: 'gross', dir: 'asc' });
  assert(byGross.join(',') === '0,2,1', 'gross asc → 100,200,300');
  var byNet = fn(employees, { col: 'net', dir: 'desc' });
  // Zoe 100, Amy 250, Ben 200 → desc Amy, Ben, Zoe = 1,2,0
  assert(byNet.join(',') === '1,2,0', 'net desc uses getNetPay');
  var def = fn(employees, { col: null, dir: 'asc' });
  assert(def.join(',') === '0,1,2', 'null sort keeps original order');
  assert(employees[0].name === 'Zoe' && employees[1].name === 'Amy', 'source employees array unchanged');
}

if (failed) {
  console.error('\n' + failed + ' failure(s)');
  process.exit(1);
}
console.log('\nAll payroll table-sort checks passed');
