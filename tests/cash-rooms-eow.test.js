#!/usr/bin/env node
'use strict';

var path = require('path');
var logic = require('../apps-script/cash-rooms-eow/cashRoomsEow.js');
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

// Daily: rooms in the till, taken off F&D so Daily Out adds up
assert(logic.cashLessFloat(430, 50) === 250, 'till 430 with £50 rooms → £250 F&D (430−130−50)');
assert(logic.cashLessFloat(130, 0) === 0, 'float only, no rooms → 0');
assert(logic.cashLessFloat(200, 20, 130) === 50, 'explicit float arg');

// EOW was short by rooms after the daily deduct; add rooms back into the bag
assert(logic.eowCashAfterExpenses(800, 120, 50) === 870, 'EOW = safe 800 + rooms 120 − expenses 50');
assert(logic.eowCashAfterExpenses(800, 0, 50) === 750, 'no rooms → previous F&D-only figure');
assert(logic.eowCashAfterExpenses(100, 40, 150) === -10, 'expenses can exceed cash');

// Owner export skips cash-room income lines, keeps PDQ rooms and pub cash
assert(logic.skipCashRoomsOnOwnerExport('Room Sales (Direct Only)') === true, 'skip Room Sales Direct');
assert(logic.skipCashRoomsOnOwnerExport('Cash Rooms') === true, 'skip Cash Rooms');
assert(logic.skipCashRoomsOnOwnerExport('Room PDQ Payments') === false, 'keep Room PDQ (card)');
assert(logic.skipCashRoomsOnOwnerExport('Wet Sales') === false, 'keep Wet Sales');
assert(logic.skipCashRoomsOnOwnerExport('Cash Payments Pub') === false, 'keep Cash Payments Pub');
assert(logic.skipCashRoomsOnOwnerExport('Room Cleaning') === false, 'keep Room Cleaning expense');

var cleared = logic.ownerMasterClearsCashRoomsCells();
assert(cleared.C4 === 0 && cleared.C44 === 0 && cleared.C45 === 0 && cleared.C46 === 0,
  'frozen MASTER zeros Room Sales + rooms banking cells');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll checks passed');
