#!/usr/bin/env node
'use strict';

/**
 * Windmill Specials venue isolation — local mocks only.
 * Never hits live Apps Script, never writes Script Properties.
 *
 * Proves: Windmill uses MENUS_WINDMILL; Eight Bells stays on MENUS;
 * getMenusState returns a venue key; empty Windmill does not inherit EB dishes.
 */

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

var root = path.join(__dirname, '..');
var sync = require(path.join(root, 'apps-script/menu-ai/MenusSyncLogic.js'));
var aiGs = fs.readFileSync(path.join(root, 'apps-script/menu-ai/Code.gs'), 'utf8');
var page = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
var ingest = fs.readFileSync(path.join(root, 'menus-ingest.js'), 'utf8');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');

// —— 1. Venue helpers ——
assert(sync.normalizeVenue('windmill') === 'windmill', 'normalizeVenue accepts windmill');
assert(sync.normalizeVenue('WM') === 'windmill', 'normalizeVenue accepts WM alias');
assert(sync.normalizeVenue('') === 'eightbells', 'blank venue defaults to eightbells');
assert(sync.normalizeVenue('eightbells') === 'eightbells', 'normalizeVenue keeps eightbells');
assert(sync.menusPropKey('eightbells') === 'MENUS', 'Eight Bells property key is MENUS');
assert(sync.menusPropKey('windmill') === 'MENUS_WINDMILL', 'Windmill property key is MENUS_WINDMILL');
assert(sync.menusBackupPrefix('windmill') === 'MENUS_WINDMILL_BAK_',
  'Windmill backups use a separate prefix');
assert(sync.menusBackupPrefix('eightbells') === 'MENUS_BAK_',
  'Eight Bells backup prefix unchanged');

var emptyWm = sync.emptyWindmillState();
assert(emptyWm.venue === 'windmill' && Array.isArray(emptyWm.book.specials) &&
  emptyWm.book.specials.length === 0,
  'empty Windmill state has venue + empty specials');
assert(!emptyWm.book.main, 'empty Windmill state has no main menu');
assert(JSON.stringify(emptyWm).indexOf('Korean') === -1 &&
  JSON.stringify(emptyWm).indexOf('Szechuan') === -1,
  'empty Windmill state does not embed Eight Bells specials names');

// —— 2. Apps Script wiring ——
assert(aiGs.indexOf('function normalizeMenusVenue_') !== -1, 'Code.gs has normalizeMenusVenue_');
assert(aiGs.indexOf('MENUS_WINDMILL') !== -1, 'Code.gs references MENUS_WINDMILL');
assert(aiGs.indexOf('getMenusState_(body.venue)') !== -1 ||
  aiGs.indexOf('getMenusState_(p.venue)') !== -1,
  'getMenusState receives venue from GET/POST');
assert(/function getMenusState_\(venue\)/.test(aiGs), 'getMenusState_ accepts venue');
assert(aiGs.indexOf("venues: ['eightbells', 'windmill']") !== -1,
  'getMenusState advertises both venues');
assert(aiGs.indexOf("venue === 'windmill'") !== -1 &&
  aiGs.indexOf('emptyWindmillState') !== -1,
  'missing Windmill book returns empty Specials, not null EB stub');

// Windmill save must write MENUS_WINDMILL and must not hardcode propWrite_('MENUS') alone in saveMenuState_
(function () {
  var saveFn = aiGs.split('function saveMenuState_')[1].split('function saveMenusState_')[0];
  assert(saveFn.indexOf('menusPropKey_') !== -1 && saveFn.indexOf('propWrite_(propKey') !== -1,
    'saveMenuState_ writes via venue prop key');
  assert(saveFn.indexOf("propWrite_('MENUS'") === -1,
    'saveMenuState_ does not hardcode write to MENUS');
  assert(saveFn.indexOf('normalizeMenusVenue_') !== -1, 'saveMenuState_ normalizes venue');
})();

(function () {
  var wholeFn = aiGs.split('function saveMenusState_')[1] || '';
  assert(wholeFn.indexOf('menusPropKey_') !== -1 && wholeFn.indexOf('propWrite_(propKey') !== -1,
    'saveMenusState_ writes via venue prop key');
  assert(wholeFn.indexOf("propWrite_('MENUS'") === -1,
    'saveMenusState_ does not hardcode write to MENUS');
})();

(function () {
  var pubFn = aiGs.split('function publishSavedMenu_')[1].split('function publishMenuStatus_')[0];
  assert(pubFn.indexOf("normalizeMenusVenue_(body.venue) === 'windmill'") !== -1,
    'publishSavedMenu_ refuses Windmill → Eight Bells website publish');
})();

// Eight Bells default path still exists (prop key MENUS for eightbells).
assert(aiGs.indexOf("=== 'windmill' ? 'MENUS_WINDMILL' : 'MENUS'") !== -1 ||
  aiGs.indexOf("menusPropKey_(venue)") !== -1,
  'Eight Bells still maps to MENUS');

// —— 3. Client ——
assert(page.indexOf("venue=windmill") !== -1 || page.indexOf("menuVenue") !== -1,
  'menus.html reads venue from the URL');
assert(page.indexOf("storageSuffix = isWindmillVenue ? '-wm' : ''") !== -1,
  'Windmill uses separate localStorage keys');
assert(page.indexOf('The Windmill Inn · Littleworth') !== -1,
  'Windmill brands the Menus header');
assert(page.indexOf("venue: menuVenue") !== -1, 'client save payload includes venue');
assert(page.indexOf("gotVenue !== 'windmill'") !== -1,
  'client refuses to apply an old non-venue (Eight Bells) book when venue=windmill');
assert(page.indexOf('windmillCloudReady') !== -1 &&
  page.indexOf('not saving to the live Eight Bells book') !== -1,
  'client blocks Windmill cloud writes until Menu AI returns venue=windmill');
assert(page.indexOf("isWindmillVenue\n      ? ['specials']") !== -1 ||
  /STAFF_MENU_IDS = isWindmillVenue\s*\n?\s*\? \['specials'\]/.test(page),
  'Windmill staff menus are Specials-only');
assert(page.indexOf('allowEmpty') !== -1,
  'applyCloudState can apply an empty Windmill Specials book');

assert(ingest.indexOf('setCloudVenue') !== -1 && ingest.indexOf('getCloudVenue') !== -1,
  'menus-ingest exposes setCloudVenue / getCloudVenue');
assert(ingest.indexOf("action === 'getMenusState'") !== -1 &&
  ingest.indexOf('&venue=') !== -1,
  'cloudGet appends venue for getMenusState');
assert(ingest.indexOf('withCloudVenue_') !== -1,
  'menu-book cloud writes attach venue');

assert(printJs.indexOf("printVenue !== 'windmill'") !== -1,
  'print preview hides Publish to website for Windmill');
assert(printJs.indexOf('Windmill website publish is not wired yet') !== -1,
  'publishSavedSheet skips Windmill → Eight Bells site');

var wmEntry = fs.readFileSync(path.join(root, 'menus-windmill.html'), 'utf8');
assert(wmEntry.indexOf('venue=windmill') !== -1 && wmEntry.indexOf('mode=staff') !== -1,
  'menus-windmill.html stable entry opens staff + venue=windmill');
assert(fs.readFileSync(path.join(root, 'manager-portals/windmill/index.html'), 'utf8')
  .indexOf('menus-windmill.html') !== -1,
  'Windmill manager portal Menus tile uses menus-windmill.html');

// —— 4. Isolation scenario (pure logic) ——
(function () {
  var eb = {
    updatedAt: 1000,
    book: {
      specials: [
        { id: 'eb1', section: 'Special Mains', name: 'Korean Crispy Chilli Beef', price: '16' },
        { id: 'eb2', section: 'Special Mains', name: 'Szechuan Chilli Pork Noodles', price: '15' }
      ]
    },
    menuVersions: { specials: 9 }
  };
  var wm = sync.emptyWindmillState();
  assert(wm.book.specials.length === 0, 'Windmill starts with zero specials');
  assert(eb.book.specials.length === 2, 'Eight Bells fixture still has its specials');
  assert(sync.menusPropKey('windmill') !== sync.menusPropKey('eightbells'),
    'venues do not share a Script Properties key');

  // Saving Windmill specials must not mutate the EB fixture object.
  var ebBefore = JSON.stringify(eb);
  var saved = sync.applyMenuSave(wm, {
    menuId: 'specials',
    expectedVersion: 1,
    dishes: [
      { id: 'wm1', section: 'Special Mains', name: 'Windmill Pie of the Day', price: '14' }
    ]
  });
  assert(saved.ok === true, 'Windmill specials first save succeeds');
  assert(saved.state.book.specials[0].name === 'Windmill Pie of the Day',
    'Windmill save stores Windmill dish');
  assert(JSON.stringify(eb) === ebBefore,
    'Eight Bells fixture untouched by Windmill applyMenuSave');
  assert(saved.state.book.specials.every(function (d) {
    return !/Korean|Szechuan/i.test(d.name || '');
  }), 'Windmill book does not contain Eight Bells specials names');
})();

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll windmill-menus-venue checks passed');
