#!/usr/bin/env node
'use strict';

/**
 * Menu AI shared-state sync — local mocks only (never hits production Apps Script).
 * Covers: stale conflict, seed/empty Main guard, no auto-push on pull/sync,
 * per-menu save isolation, Little Bells print-history menuId.
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
var page = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');
var aiGs = fs.readFileSync(path.join(root, 'apps-script/menu-ai/Code.gs'), 'utf8');

function dish(section, name) {
  return { id: 'd-' + name.replace(/\s+/g, '-'), section: section, name: name, description: '', price: '10', tags: '' };
}

function fullMain() {
  var out = [];
  for (var i = 0; i < 12; i++) {
    out.push(dish('Mains', 'Live Dish ' + (i + 1)));
  }
  return out;
}

function baseState() {
  return {
    updatedAt: 1000,
    book: {
      main: fullMain(),
      sunday: [dish('Sunday Roasts', 'Sirloin of Beef')],
      'little-bells': [dish('Little Bells', 'Fish Fingers')]
    },
    metaBook: {},
    includes: {},
    promoBank: [],
    promoTicks: {},
    promoDeck: { order: [], used: [] },
    sectionLayout: {},
    dishCatalogue: [],
    extraMenus: [],
    extraSections: [],
    menuVersions: { main: 5, sunday: 2, 'little-bells': 1 }
  };
}

// —— 1. Stale device cannot overwrite a newer server menu ——
(function () {
  var current = baseState();
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 4, // stale — server is on 5
    dishes: [dish('Mains', 'Stale overwrite attempt')]
  });
  assert(result.ok === false && result.conflict === true,
    'stale device gets a conflict response');
  assert(result.error === 'stale_menu_version', 'conflict error is stale_menu_version');
  assert(current.book.main.length === 12 &&
    result.state.book.main.length === 12 &&
    result.state.book.main[0].name === 'Live Dish 1',
    'conflict does not overwrite the newer server Main');
  assert(result.version === 5, 'conflict reports the current server version');
})();

(function () {
  var current = baseState();
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 5,
    dishes: fullMain().concat([dish('Mains', 'Extra Pie')])
  });
  assert(result.ok === true && result.version === 6,
    'matching version saves and increments');
  assert(result.state.book.main.length === 13, 'successful save updates dishes');
  assert(result.state.menuVersions.sunday === 2,
    'successful Main save leaves other menu versions untouched');
})();

// —— 2. Seed / near-empty Main cannot replace a full Main ——
(function () {
  var current = baseState();
  var seedOnly = [dish('Mains', '10oz Sirloin Steak')];
  assert(sync.isNearEmptyOrSeedMain(seedOnly) === true,
    'single seed steak counts as near-empty/seed Main');
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 5,
    dishes: seedOnly
  });
  assert(result.ok === false && result.rejected === true,
    'seed Main save is rejected');
  assert(result.error === 'seed_or_empty_main', 'reject error is seed_or_empty_main');
  assert(result.state.book.main.length === 12,
    'rejected seed save leaves the full Main intact');
})();

(function () {
  var current = baseState();
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 5,
    dishes: []
  });
  assert(result.ok === false && result.rejected === true,
    'empty Main cannot replace a full Main');
})();

(function () {
  var current = baseState();
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: [dish('Mains', '10oz Sirloin Steak')],
      sunday: current.book.sunday
    },
    updatedAt: Date.now()
  });
  assert(whole.ok === false && whole.rejected === true,
    'legacy whole-book save also refuses seed Main over full Main');
})();

// —— 3. Open / focus / Sync must not auto-push the local cache ——
assert(page.indexOf('cloudAutoPushEnabled = false') !== -1,
  'client disables cloud auto-push flag');
assert(page.indexOf('Never auto-push the whole local cache') !== -1 ||
  page.indexOf('never auto-push') !== -1,
  'client documents no auto-push of local cache');
assert(page.indexOf('remoteAt < cloudUpdatedAt') === -1,
  'client no longer pushes when local updatedAt looks newer');
assert(page.indexOf('Empty cloud — seed once from this device') === -1,
  'client no longer seeds empty cloud from local cache on pull');
assert(/function pullMenusFromCloud\(\) \{[\s\S]*?action:\s*'getMenusState'[\s\S]*?\}/.test(page) &&
  page.indexOf('Uploaded this device') === -1,
  'pullMenusFromCloud is pull-only (no upload-this-device note)');
assert(page.indexOf('pushMenusToCloud().then') === -1 ||
  /function syncNowFromCloud\(\) \{[\s\S]*?pullMenusFromCloud\(\)[\s\S]*?syncPrintHistoryToCloud/.test(page),
  'Sync now pulls menus then syncs print history without menu auto-push');
(function () {
  var start = page.indexOf('function syncNowFromCloud()');
  var end = page.indexOf('function loadIncludes()', start);
  assert(start !== -1 && end !== -1, 'syncNowFromCloud is defined');
  var syncFn = page.slice(start, end);
  assert(syncFn.indexOf('pushMenusToCloud(') === -1,
    'syncNowFromCloud does not call pushMenusToCloud');
  assert(syncFn.indexOf('pushMenuToCloud(') === -1,
    'syncNowFromCloud does not call pushMenuToCloud');
  assert(syncFn.indexOf('saveMenusState') === -1,
    'syncNowFromCloud does not whole-book saveMenusState');
})();
(function () {
  var start = page.indexOf('function pullMenusFromCloud()');
  var end = page.indexOf('function refreshAfterSync_()', start);
  assert(start !== -1 && end !== -1, 'pullMenusFromCloud is defined');
  var pullFn = page.slice(start, end);
  assert(pullFn.indexOf('pushMenusToCloud') === -1 &&
    pullFn.indexOf('pushMenuToCloud') === -1 &&
    pullFn.indexOf('saveMenusState') === -1 &&
    pullFn.indexOf('saveMenuState') === -1,
    'pullMenusFromCloud never posts a save');
})();

// —— 4. Per-menu save does not clobber other menus ——
(function () {
  var current = baseState();
  var sundayBefore = current.book.sunday.slice();
  var kidsBefore = current.book['little-bells'].slice();
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 5,
    dishes: [dish('Mains', 'Only Main Changed'), dish('Mains', 'Second'), dish('Mains', 'Third'),
      dish('Mains', 'Fourth'), dish('Mains', 'Fifth'), dish('Mains', 'Sixth'),
      dish('Mains', 'Seventh'), dish('Mains', 'Eighth'), dish('Mains', 'Ninth')]
  });
  assert(result.ok === true, 'per-menu Main save succeeds');
  assert(result.state.book.main[0].name === 'Only Main Changed', 'Main dishes updated');
  assert(result.state.book.sunday.length === sundayBefore.length &&
    result.state.book.sunday[0].name === sundayBefore[0].name,
    'Sunday untouched by Main save');
  assert(result.state.book['little-bells'].length === kidsBefore.length &&
    result.state.book['little-bells'][0].name === kidsBefore[0].name,
    'Little Bells untouched by Main save');
  assert(result.state.menuVersions.sunday === 2 &&
    result.state.menuVersions['little-bells'] === 1 &&
    result.state.menuVersions.main === 6,
    'only Main version increments');
})();

assert(page.indexOf("action: 'saveMenuState'") !== -1,
  'client posts saveMenuState for per-menu saves');
assert(page.indexOf('buildMenuSavePayload_') !== -1 &&
  page.indexOf('expectedVersion') !== -1,
  'client sends expectedVersion with the edited menu only');
var ingestJs = fs.readFileSync(path.join(root, 'menus-ingest.js'), 'utf8');
assert(ingestJs.indexOf("action === 'saveMenuState'") !== -1 &&
  ingestJs.indexOf('stale_menu_version') !== -1,
  'cloud verify detects per-menu conflict after no-cors write');
assert(ingestJs.indexOf('seed_or_empty_main') !== -1,
  'cloud verify reports seed/empty reject when version did not advance');
assert(aiGs.indexOf('saveMenuState_') !== -1 &&
  aiGs.indexOf('menusBackupBeforeWrite_') !== -1,
  'Apps Script has per-menu save and backup-before-write');
assert(aiGs.indexOf("action === 'saveMenuState'") !== -1,
  'Apps Script routes saveMenuState');
assert(aiGs.indexOf('driveAuthUrl_') !== -1 &&
  aiGs.indexOf('driveAuthHelp_') !== -1 &&
  aiGs.indexOf('historyHtmlFolderCreateOrOpen_') !== -1 &&
  aiGs.indexOf('authUrl: driveAuthUrl_()') !== -1,
  'v114 Drive auth help behaviour kept');

// —— 5. Little Bells history/print uses the correct menu id ——
(function () {
  var meta = sync.historyMetaFromHtmlTitle('pmwqantg6',
    '<html><head><title>Little Bells Wk 21 Nov — XII</title></head><body></body></html>');
  assert(meta.menuId === 'little-bells',
    'HTML title "Little Bells" rebuilds as menuId little-bells (not main)');
  assert(/Little Bells/i.test(meta.menuName),
    'rebuild keeps Little Bells as menuName');
})();

(function () {
  var coerced = sync.coercePrintMenuId('main', 'Little Bells');
  assert(coerced.menuId === 'little-bells' && coerced.menuName === 'Little Bells',
    'coerce fixes menuId main + menuName Little Bells (pmwqantg6 shape)');
})();

(function () {
  var mainMeta = sync.historyMetaFromHtmlTitle('x',
    '<html><head><title>Main menu Wk 21 Nov — I</title></head></html>');
  assert(mainMeta.menuId === 'main', 'Main menu title still maps to main');
})();

assert(printJs.indexOf('coercePrintMenuId') !== -1 ||
  printJs.indexOf('little-bells') !== -1 && printJs.indexOf('/little\\s*bells/i.test(menuName)') !== -1,
  'print history normalize coerces Little Bells menuId');
assert(aiGs.indexOf('little\\s*bells') !== -1 || aiGs.indexOf('little-bells') !== -1,
  'Apps Script history meta recognises Little Bells');
assert(page.indexOf('MenusSyncLogic.js') !== -1,
  'menus.html loads MenusSyncLogic.js');
assert(fs.existsSync(path.join(root, 'apps-script/menu-ai/MenusSyncLogic.js')),
  'MenusSyncLogic.js is in the Apps Script project folder');

// Source-level: old last-write-wins push path is gone
assert(page.indexOf('Last-write-wins') === -1,
  'last-write-wins comment removed from client');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll menus-sync checks passed');
