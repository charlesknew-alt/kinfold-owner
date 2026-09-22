/**
 * Cash rooms: manager till vs owner export.
 *
 * Daily (manager): cash rooms sit in the till with the rest of the money.
 *   cashLessFloat = till − £130 float − cashRooms  (F&D Daily Out)
 *
 * End of week (manager): that cash is still in the bag, so add it back
 *   eowCashAfterExpenses = actualCashToSafe + roomCash − weeklyExpenses
 *
 * Owner exportable paperwork (MASTER / Xero): do not declare cash rooms.
 */

'use strict';

var FLOAT = 130;

function cashLessFloat(cashInTill, cashRooms, floatAmount) {
  var f = floatAmount == null ? FLOAT : floatAmount;
  return (parseFloat(cashInTill) || 0) - f - (parseFloat(cashRooms) || 0);
}

function eowCashAfterExpenses(actualCashToSafe, roomCash, weeklyExpenses) {
  return (parseFloat(actualCashToSafe) || 0) + (parseFloat(roomCash) || 0) - (parseFloat(weeklyExpenses) || 0);
}

function skipCashRoomsOnOwnerExport(description) {
  var d = String(description || '').toLowerCase();
  return d.indexOf('room sales (direct') !== -1 || d.indexOf('cash rooms') !== -1;
}

function ownerMasterClearsCashRoomsCells() {
  return { C4: 0, C44: 0, C45: 0, C46: 0 };
}

if (typeof module !== 'undefined') {
  module.exports = {
    FLOAT: FLOAT,
    cashLessFloat: cashLessFloat,
    eowCashAfterExpenses: eowCashAfterExpenses,
    skipCashRoomsOnOwnerExport: skipCashRoomsOnOwnerExport,
    ownerMasterClearsCashRoomsCells: ownerMasterClearsCashRoomsCells
  };
}
