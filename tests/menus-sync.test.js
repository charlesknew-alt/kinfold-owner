#!/usr/bin/env node
'use strict';

/**
 * Menu AI shared-state sync — local mocks only (never hits production Apps Script).
 * Covers: stale conflict, seed/empty guard on every menu, legacy whole-book
 * merge safety, no auto-push on pull/sync, per-menu save isolation,
 * Little Bells print-history menuId.
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

function fullMenu(section, prefix, n) {
  var out = [];
  for (var i = 0; i < (n || 12); i++) {
    out.push(dish(section, prefix + ' ' + (i + 1)));
  }
  return out;
}

function fullMain() {
  return fullMenu('Mains', 'Live Dish', 12);
}

function baseState() {
  return {
    updatedAt: 1000,
    book: {
      main: fullMain(),
      sunday: [dish('Sunday Roasts', 'Sirloin of Beef')],
      specials: fullMenu('Special Mains', 'Special Dish', 10),
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
    menuVersions: { main: 5, sunday: 2, specials: 1, 'little-bells': 1 }
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

// —— 2. Seed / near-empty cannot replace any full menu ——
(function () {
  var current = baseState();
  var seedOnly = [dish('Mains', '10oz Sirloin Steak')];
  assert(sync.isNearEmptyOrSeedMenu(seedOnly) === true,
    'single seed steak counts as near-empty/seed');
  var result = sync.applyMenuSave(current, {
    menuId: 'main',
    expectedVersion: 5,
    dishes: seedOnly
  });
  assert(result.ok === false && result.rejected === true,
    'seed Main save is rejected');
  assert(result.error === 'seed_or_empty_menu', 'reject error is seed_or_empty_menu');
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
  var result = sync.applyMenuSave(current, {
    menuId: 'specials',
    expectedVersion: 1,
    dishes: [dish('Special Mains', '10oz Sirloin Steak')]
  });
  assert(result.ok === false && result.rejected === true,
    'seed/near-empty Specials cannot replace a full Specials');
  assert(result.state.book.specials.length === 10,
    'rejected Specials save leaves the full Specials intact');
})();

(function () {
  var current = baseState();
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: [dish('Mains', '10oz Sirloin Steak')],
      sunday: current.book.sunday,
      specials: current.book.specials,
      'little-bells': current.book['little-bells']
    },
    // Client clock ahead (old page bumped updatedAt) — Main still protected by seed guard.
    updatedAt: 99999
  });
  assert(whole.ok === false && whole.rejected === true,
    'legacy whole-book save refuses seed Main over full Main');
  assert(whole.error === 'seed_or_empty_menu', 'legacy seed reject uses seed_or_empty_menu');
})();

(function () {
  var current = baseState();
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: current.book.main,
      sunday: current.book.sunday,
      specials: [dish('Special Mains', 'Lonely leftover')],
      'little-bells': current.book['little-bells']
    },
    updatedAt: 99999
  });
  assert(whole.ok === false && whole.rejected === true,
    'legacy whole-book save refuses near-empty Specials over full Specials');
})();

// —— 2b. Legacy saveMenusState must not clobber newer per-menu edits ——
(function () {
  // New device already version-saved Main to v5. Old cached page bumps updatedAt
  // and pushes a whole book with an older Main + a real Specials edit.
  var current = baseState(); // main:5, specials:1
  var oldMain = fullMenu('Mains', 'Old Cache Dish', 12);
  var newSpecials = fullMenu('Special Mains', 'Phone Special', 10);
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: oldMain,
      sunday: current.book.sunday,
      specials: newSpecials,
      'little-bells': current.book['little-bells']
    },
    updatedAt: 99999 // old client always bumps — must not unlock Main
  });
  assert(whole.ok === true, 'legacy save merges non-stale diffs');
  assert(whole.merged && whole.merged.indexOf('specials') !== -1,
    'legacy save applies the Specials edit (still at baseline v1)');
  assert(whole.skippedStale && whole.skippedStale.indexOf('main') !== -1,
    'legacy save skips Main which is already past baseline version');
  assert(whole.state.book.main[0].name === 'Live Dish 1',
    'legacy save does not clobber newer Main with old cache');
  assert(whole.state.book.specials[0].name === 'Phone Special 1',
    'legacy save does update Specials');
  assert(whole.state.menuVersions.main === 5 && whole.state.menuVersions.specials === 2,
    'legacy save only bumps the merged menu version');
})();

(function () {
  // Client pulled an older book clock — every differing menu is stale → conflict.
  var current = baseState();
  current.updatedAt = 5000;
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: fullMenu('Mains', 'Stale Main', 12),
      sunday: current.book.sunday,
      specials: fullMenu('Special Mains', 'Stale Special', 10),
      'little-bells': current.book['little-bells']
    },
    updatedAt: 1000 // older than server
  });
  assert(whole.ok === false && whole.conflict === true,
    'legacy save conflicts when client updatedAt is older than server');
  assert(whole.state.book.main[0].name === 'Live Dish 1',
    'conflict leaves server Main untouched');
})();

(function () {
  // expectedVersions on legacy path: stale Main, fresh Specials.
  var current = baseState();
  var whole = sync.applyWholeBookSave(current, {
    book: {
      main: fullMenu('Mains', 'Wrong Main', 12),
      sunday: current.book.sunday,
      specials: fullMenu('Special Mains', 'Ok Special', 10),
      'little-bells': current.book['little-bells']
    },
    updatedAt: 99999,
    expectedVersions: { main: 4, specials: 1 } // main stale (server 5), specials ok
  });
  assert(whole.ok === true && whole.merged.indexOf('specials') !== -1,
    'legacy save with expectedVersions merges only non-stale menus');
  assert(whole.skippedStale.indexOf('main') !== -1,
    'legacy save with expectedVersions skips stale Main');
  assert(whole.state.book.main[0].name === 'Live Dish 1',
    'stale expectedVersion does not overwrite Main');
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
assert(ingestJs.indexOf('seed_or_empty_menu') !== -1,
  'cloud verify reports seed/empty reject when version did not advance');
assert(aiGs.indexOf('seed_or_empty_menu') !== -1 ||
  fs.readFileSync(path.join(root, 'apps-script/menu-ai/MenusSyncLogic.js'), 'utf8')
    .indexOf('seedGuardMenu') !== -1,
  'server seed guard applies via seedGuardMenu for every menu');
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
