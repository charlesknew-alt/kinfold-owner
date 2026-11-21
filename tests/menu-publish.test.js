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

var root = path.join(__dirname, '..');
require(path.join(root, 'apps-script/menu-ai/MenuPublish.js'));
var pub = global.EBMenusPublish;
var aiGs = fs.readFileSync(path.join(root, 'apps-script/menu-ai/Code.gs'), 'utf8');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');
var page = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
var ingestJs = fs.readFileSync(path.join(root, 'menus-ingest.js'), 'utf8');

assert(pub && typeof pub.websiteMenuId === 'function', 'EBMenusPublish loads');

[
  [{ id: 'main', name: 'Main menu', kind: 'long' }, 'main'],
  [{ id: 'sunday', name: 'Sunday', kind: 'long' }, 'sunday'],
  [{ id: 'desserts', name: 'Desserts', kind: 'card' }, 'desserts'],
  [{ id: 'little-bells', name: 'Little Bells', kind: 'card' }, 'little-bells'],
  [{ id: 'specials', name: 'Specials', kind: 'card' }, 'specials'],
  [{ id: 'breakfast', name: 'Breakfast', kind: 'card' }, 'breakfast'],
  ['main', 'main'],
  [{ id: 'breakfast-2', name: 'Breakfast', kind: 'card' }, 'breakfast']
].forEach(function (row) {
  assert(pub.websiteMenuId(row[0]) === row[1], 'maps ' + JSON.stringify(row[0]) + ' → ' + row[1]);
  assert(pub.offersWebsitePublish(row[0]) === true, 'tick offered for ' + row[1]);
});

[
  { id: 'party', name: 'Party / Christmas', kind: 'party' },
  { id: 'xmas-set', name: 'Christmas Day', kind: 'long' },
  { id: 'buffet-lunch', name: 'Buffet', kind: 'card' },
  { id: 'breakfast', name: 'Breakfast buffet', kind: 'card' },
  { id: 'main-next', name: 'Main (upcoming)', kind: 'long' },
  { id: 'sandwiches', name: 'Sandwiches', kind: 'card' },
  { id: 'lunch-club', name: 'Lunch club', kind: 'card' },
  { id: 'brunch', name: 'Brunch', kind: 'long' }
].forEach(function (menu) {
  assert(pub.websiteMenuId(menu) === '', 'no website id for ' + menu.id + ' / ' + menu.name);
  assert(pub.offersWebsitePublish(menu) === false, 'no tick for ' + menu.name);
});

assert(pub.sectionToMenu('Desserts') === 'desserts', 'Desserts section corresponds to desserts');
assert(pub.sectionToMenu('Little Bells') === 'little-bells', 'Little Bells section corresponds to little-bells');
assert(pub.sectionToMenu('Special Mains') === 'specials', 'Special Mains corresponds to specials');
assert(pub.sectionToMenu('Breakfast') === 'breakfast', 'Breakfast section corresponds to breakfast');
assert(pub.sectionToMenu('Sunday Roasts') === '', 'Sunday Roasts stays a section, not its own menu');
assert(pub.sectionToMenu('Sandwiches') === '', 'Sandwiches stays a section');
assert(pub.sectionToMenu('Mains') === '', 'Mains stays a section on the main sheet');
assert(pub.sectionToMenu('Nibbles') === '', 'Nibbles stays a section');

assert(JSON.stringify(pub.tagsToList('gf, v option')) === JSON.stringify(['gf', 'v option']),
  'comma tags stay phrases');
assert(JSON.stringify(pub.tagsToList('vg & gf')) === JSON.stringify(['vg', 'gf']),
  'vg & gf splits into two tags');
assert(JSON.stringify(pub.tagsToList('v with gf option')) === JSON.stringify(['v', 'gf option']),
  'with-option splits the hard mark from the option');
assert(JSON.stringify(pub.tagsToList('gf option')) === JSON.stringify(['gf option']),
  'a single option phrase stays one tag');
assert(JSON.stringify(pub.tagsToList(['VG', ''])) === JSON.stringify(['VG']),
  'array tags are trimmed and empties dropped');
assert(pub.tagsToList('').length === 0, 'blank tags are an empty list');

var body = pub.buildPublishBody({
  menu: { id: 'main', name: 'Main menu', kind: 'long' },
  title: 'Main menu',
  version: 'IV',
  savedAt: '2026-11-21T12:00:00.000Z',
  dishes: [
    { section: 'Mains', name: 'Pie', description: 'gravy', price: '16.50', tags: 'gf', lunchClub: true, fromMenu: 'main' },
    { section: 'Desserts', name: 'Brownie', description: 'ice cream', price: '7.95', tags: 'v with gf option' },
    { section: 'Nibbles', name: '  ', description: 'skip' },
    { section: 'Sunday Roasts', name: 'Beef', description: 'yorkie', price: 18.5, tags: '' }
  ],
  highlights: [{ name: '', description: 'nope' }],
  pdfBase64: 'QQ=='
});
assert(body && body.menu === 'main' && body.version === 'IV', 'payload menu id and Roman version');
assert(body.title === 'Main menu' && body.savedAt === '2026-11-21T12:00:00.000Z', 'title and savedAt');
assert(body.dishes.length === 3, 'nameless dishes dropped');
assert(body.dishes[0].section === 'Mains' && body.dishes[0].lunchClub === undefined &&
  body.dishes[0].fromMenu === undefined, 'dish keeps section and drops book-only fields');
assert(JSON.stringify(body.dishes[1].tags) === JSON.stringify(['v', 'gf option']), 'dish tags are a string array');
assert(body.dishes[2].section === 'Sunday Roasts' && body.dishes[2].price === '18.5',
  'section name is not rewritten; price is a string');
assert(body.highlights === undefined, 'empty highlights are omitted');
assert(body.pdfBase64 === 'QQ==', 'pdfBase64 is passed through for the script to fill');

var withHi = pub.buildPublishBody({
  menuId: 'specials',
  menuName: 'Specials',
  version: 'II',
  savedAt: '2026-11-21T18:00:00.000Z',
  dishes: [{ section: 'Special Mains', name: 'Rib', description: 'jammy', price: '22', tags: [] }],
  highlights: [{ title: 'Pie of the day', body: 'ask the team' }]
});
assert(withHi.menu === 'specials' && withHi.highlights &&
  withHi.highlights[0].name === 'Pie of the day' &&
  withHi.highlights[0].description === 'ask the team',
  'highlights map title/body when present');

assert(pub.buildPublishBody({ menu: { id: 'party', name: 'Party / Christmas', kind: 'party' }, dishes: [{ name: 'Soup' }] }) === null,
  'Christmas payload is refused');
assert(pub.buildPublishBody({ menuId: 'main-next', menuName: 'Main (upcoming)', dishes: [{ name: 'Pie' }] }) === null,
  'upcoming Main payload is refused');

assert(pub.publishEndpoint('') === 'https://www.eightbellsbolney.com/api/menus/publish',
  'default origin is the Eight Bells site');
assert(pub.publishEndpoint('https://www.eightbellsbolney.com/') ===
  'https://www.eightbellsbolney.com/api/menus/publish',
  'trailing slash is stripped');
assert(pub.publishEndpoint('https://www.eightbellsbolney.com/api/menus/publish') ===
  'https://www.eightbellsbolney.com/api/menus/publish',
  'full path is not doubled');
assert(pub.publishEndpoint('http://example.com') === '', 'non-https publish URL is refused');

assert(aiGs.indexOf('function publishSavedMenu_') !== -1, 'Apps Script publishes after a saved sheet');
assert(aiGs.indexOf('muteHttpExceptions: true') !== -1, 'UrlFetch uses muteHttpExceptions');
assert(aiGs.indexOf('MENU_PUBLISH_SECRET') !== -1 && aiGs.indexOf('MENU_PUBLISH_URL') !== -1,
  'script properties are MENU_PUBLISH_SECRET and MENU_PUBLISH_URL');
assert(aiGs.indexOf("Authorization: 'Bearer ' + secret") !== -1, 'bearer header is the publish secret');
assert(aiGs.indexOf('Website publishing is not set up yet.') !== -1,
  'missing secret skips with a clear message');
assert(aiGs.indexOf('Live on the website') !== -1, 'success message is Live on the website');
assert(aiGs.indexOf('menuHtmlToPdfBlob_') !== -1, 'website PDF uses the Email converter');
(function () {
  var fn = aiGs.split('function publishSavedMenu_')[1] || '';
  fn = fn.split('function publishMenuStatus_')[0] || fn;
  assert(fn.indexOf('Logger.log') === -1, 'publish path does not log (secret stays out of the logs)');
  assert(fn.indexOf('getMenusState_') === -1, 'publish does not touch getMenusState');
})();
(function () {
  var saveFn = aiGs.split('function savePrintHistory_')[1].split('function hasPrintHistory_')[0];
  assert(saveFn.indexOf('publishSavedMenu_') === -1 && saveFn.indexOf('UrlFetchApp') === -1,
    'print-history save does not publish (retries stay in-house)');
  var stateFn = aiGs.split('function getMenusState_')[1].split('function saveMenusState_')[0];
  assert(stateFn.indexOf('MENU_PUBLISH') === -1 && stateFn.indexOf('publish') === -1,
    'getMenusState is unchanged');
})();
assert(aiGs.indexOf("action === 'publishSavedMenu'") !== -1 &&
  aiGs.indexOf("action === 'publishMenuStatus'") !== -1,
  'publish actions are on the existing web app');
var manifest = fs.readFileSync(path.join(root, 'apps-script/menu-ai/appsscript.json'), 'utf8');
assert(manifest.indexOf('ANYONE_ANONYMOUS') !== -1, 'web app access stays Anyone');
assert(manifest.indexOf('script.external_request') !== -1, 'UrlFetch scope already present');

assert(printJs.indexOf('id="publishToWebsite" checked') !== -1,
  'Save step ticks Publish to website on by default');
assert(printJs.indexOf('websiteMenu') !== -1 && printJs.indexOf('SAVE_DISHES') !== -1,
  'preview snapshots the sheet dishes at Generate, not the live editor');
assert(printJs.indexOf('publishSavedSheet') !== -1, 'publish runs from the Save click');
assert(page.indexOf('MenuPublish.js') !== -1 && page.indexOf('id="publishNote"') !== -1,
  'Menus page loads the mapper and has a publish note');
assert(page.indexOf('Live on the website') !== -1, 'success toast copy is in the Menus page');
assert(ingestJs.indexOf("action === 'publishSavedMenu'") !== -1 &&
  ingestJs.indexOf('publish !== true') !== -1,
  'client checks the script can publish before POSTing');
assert(ingestJs.indexOf('pollPublishStatus_') !== -1,
  'client reads the publish result (no-cors POST cannot)');

require(path.join(root, 'menus.js'));
require(path.join(root, 'menus-print.js'));
var api = global.EBMenus;
var print = global.EBMenuPrint;
var mainHtml = print.build(api.menuById('main'), [
  api.dish('Mains', 'Pie', 'gravy', '16.50', 'gf'),
  api.dish('Desserts', 'Brownie', 'ice cream', '7.95', 'v')
], {});
assert(mainHtml.indexOf('id="publishToWebsite" checked') !== -1, 'Main preview shows the tick on');
assert(mainHtml.indexOf('"websiteMenu":"main"') !== -1, 'Main preview records website id main');
assert(mainHtml.indexOf('"section":"Desserts"') !== -1 &&
  mainHtml.indexOf('"section":"Mains"') !== -1,
  'Main preview snapshots drop-in sections for publish');
var partyHtml = print.build(api.menuById('party'), [
  api.dish('Starters', 'Soup', 'bread', '', '')
], { meta: { title: 'Christmas Party Menu' } });
assert(partyHtml.indexOf('id="publishToWebsite"') === -1, 'Christmas preview has no publish tick');
api.addCustomMenu({ name: 'Breakfast', kind: 'card' });
var breakfastHtml = print.build(api.menuById('breakfast'), [
  api.dish('Breakfast', 'Eggs', 'toast', '9.50', '')
], {});
assert(breakfastHtml.indexOf('"websiteMenu":"breakfast"') !== -1, 'Breakfast card can publish');
api.addCustomMenu({ name: 'Buffet', kind: 'card' });
var buffet = api.MENUS.filter(function (m) { return m.name === 'Buffet'; })[0];
var buffetHtml = print.build(buffet, [api.dish('Buffet', 'Carvery', '', '18', '')], {});
assert(buffetHtml.indexOf('id="publishToWebsite"') === -1, 'Buffet preview has no publish tick');

// Drive auth help (live v114) must stay in the repo so a deploy cannot drop it.
assert(/function driveAuthUrl_\(\)/.test(aiGs), 'driveAuthUrl_ kept');
assert(/function driveAuthHelp_\(/.test(aiGs), 'driveAuthHelp_ kept');
assert(/function historyHtmlFolderCreateOrOpen_\(/.test(aiGs), 'historyHtmlFolderCreateOrOpen_ kept');
assert(/authUrl: driveAuthUrl_\(\)/.test(aiGs), 'driveStatus reports authUrl');
assert(/AUTH LINK/.test(aiGs) && /throw new Error\(driveAuthHelp_\(driveErr, authUrl\)\)/.test(aiGs),
  'AUTHORIZE_DRIVE_PRINT_HISTORY logs auth link and step-by-step help');
assert(/function publishSavedMenu_|publishSavedMenu/.test(aiGs), 'publish-to-website code still present');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll menu-publish checks passed');
