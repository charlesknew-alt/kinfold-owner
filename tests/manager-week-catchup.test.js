#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

var src = fs.readFileSync(
  path.join(__dirname, '..', 'apps-script', 'week-catchup', 'ManagerWeekCatchup.gs'),
  'utf8'
);

var sandbox = {
  Utilities: {
    formatDate: function (d) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }
  },
  Logger: { log: function () {} },
  console: console
};
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

var parsed = sandbox.parseWeekSheetNameCatchup_('WEEK_02AUG26');
assert(parsed && typeof parsed.getTime === 'function' && !isNaN(parsed.getTime()), 'parse WEEK_02AUG26 to Date');
assert(parsed.getFullYear() === 2026 && parsed.getMonth() === 7 && parsed.getDate() === 2, 'WEEK_02AUG26 is 2 Aug 2026');

var named = sandbox.formatWeekSheetNameCatchup_(parsed);
assert(named === 'WEEK_02AUG26', 'format round-trips WEEK_02AUG26, got ' + named);

var target = new Date(parsed.getTime());
target.setDate(target.getDate() + 7);
target = sandbox.stripTime_(target);
assert(sandbox.formatWeekSheetNameCatchup_(target) === 'WEEK_09AUG26', 'next week after 2 Aug is WEEK_09AUG26');

var sep = sandbox.parseWeekSheetNameCatchup_('WEEK_20SEP26');
assert(sep.getTime() > target.getTime(), 'WEEK_20SEP26 is after catch-up target');

var master = sandbox.parseMasterSheetNameCatchup_('WE02AUG26_MASTER');
assert(master && master.getFullYear() === 2026 && master.getMonth() === 7 && master.getDate() === 2, 'WE02AUG26_MASTER is 2 Aug 2026');
assert(sandbox.parseMasterSheetNameCatchup_('TABS LOG') == null, 'non-master name ignored');

if (failed) {
  console.error('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\nall passed');
