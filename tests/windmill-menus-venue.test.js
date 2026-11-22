#!/usr/bin/env node
'use strict';

/**
 * Windmill full menu system — venue isolation (local mocks only).
 * Never hits live Apps Script, never writes Script Properties.
 *
 * Proves: Windmill uses MENUS_WINDMILL; Eight Bells stays on MENUS;
 * empty Windmill has every menu type + empty catalogue; branding assets
 * and print venue logo/fonts are wired; never inherits EB dishes.
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
assert(emptyWm.venue === 'windmill', 'empty Windmill state has venue');
assert(Array.isArray(emptyWm.dishCatalogue) && emptyWm.dishCatalogue.length === 0,
  'empty Windmill catalogue starts empty');
['main', 'main-next', 'sunday', 'party', 'sandwiches', 'specials', 'desserts',
  'little-bells', 'lunch-club'].forEach(function (id) {
  assert(Array.isArray(emptyWm.book[id]) && emptyWm.book[id].length === 0,
    'empty Windmill book has empty ' + id);
  assert(emptyWm.menuVersions[id] === 1, 'empty Windmill menuVersions has ' + id);
});
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
  'missing Windmill book returns empty venue state, not null EB stub');

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
assert(page.indexOf('Cormorant Garamond') !== -1 && page.indexOf('Outfit') !== -1,
  'Windmill UI loads Cormorant Garamond + Outfit');
assert(page.indexOf('images/windmill-logo.png') !== -1,
  'Windmill UI references the Windmill logo asset');
assert(page.indexOf('html.venue-windmill') !== -1,
  'Windmill venue CSS class scopes branding');
assert(page.indexOf("venue: menuVenue") !== -1, 'client save payload includes venue');
assert(page.indexOf("gotVenue !== 'windmill'") !== -1,
  'client refuses to apply an old non-venue (Eight Bells) book when venue=windmill');
assert(page.indexOf('windmillCloudReady') !== -1 &&
  page.indexOf('not saving to the live Eight Bells book') !== -1,
  'client blocks Windmill cloud writes until Menu AI returns venue=windmill');
assert(page.indexOf("STAFF_MENU_IDS = ['specials', 'main', 'main-next', 'sunday'") !== -1,
  'Windmill staff sees full day-to-day menu set (not Specials-only)');
assert(page.indexOf('if (isWindmillVenue) return m.id === \'specials\'') === -1,
  'visibleMenus no longer Specials-only for Windmill');
assert(page.indexOf('allowEmpty') !== -1,
  'applyCloudState can apply an empty Windmill book');

assert(ingest.indexOf('setCloudVenue') !== -1 && ingest.indexOf('getCloudVenue') !== -1,
  'menus-ingest exposes setCloudVenue / getCloudVenue');
assert(ingest.indexOf("action === 'getMenusState'") !== -1 &&
  ingest.indexOf('&venue=') !== -1,
  'cloudGet appends venue for getMenusState');
assert(ingest.indexOf("action === 'listPrintHistory'") !== -1 &&
  ingest.indexOf('listPrintHistory') !== -1,
  'cloudGet / withCloudVenue also scope listPrintHistory');
assert(ingest.indexOf('withCloudVenue_') !== -1,
  'menu-book cloud writes attach venue');
assert(ingest.indexOf("action === 'savePrintHistory'") !== -1,
  'print-history cloud writes attach venue');
assert(aiGs.indexOf('HISTIDX_WINDMILL') !== -1 &&
  aiGs.indexOf('historySetVenueCtx_') !== -1,
  'Code.gs scopes print history index by venue');
assert(aiGs.indexOf("venue: historyVenueCtx_") !== -1 ||
  aiGs.indexOf('venue: historyVenueCtx_') !== -1,
  'listPrintHistory response includes venue');
assert(printJs.indexOf('logo-tr-wm') !== -1 &&
  printJs.indexOf('logo-tr-frame') === -1 &&
  printJs.indexOf('Mains (page 1 — balance)') !== -1 &&
  printJs.indexOf('mainsTake') !== -1 &&
  printJs.indexOf('Mains (continued)') !== -1,
  'Windmill print uses unframed official logo block and can split Mains across pages');
assert(printJs.indexOf('venuePending') !== -1 &&
  printJs.indexOf('eb-menu-prints-wm') !== -1,
  'Windmill print history refuses unscoped EB cloud list and uses -wm local store');

assert(printJs.indexOf('function venueLogoFile') !== -1 &&
  printJs.indexOf('windmill-logo.png') !== -1,
  'print uses venueLogoFile → windmill-logo.png');
assert(/logo-tr\.logo-tr-wm\{[^}]*opacity:1/.test(printJs),
  'Windmill print logo CSS keeps opacity 1 (no soften)');
assert(printJs.indexOf('Crimson Text') !== -1 && printJs.indexOf('Roboto') !== -1 &&
  printJs.indexOf('family=Crimson+Text') !== -1 && printJs.indexOf('family=Roboto') !== -1 &&
  printJs.indexOf('Windmill smart country-pub type') !== -1,
  'print loads Windmill smart country-pub fonts (Crimson Text + Roboto)');
assert(printJs.indexOf("printVenue !== 'windmill'") !== -1 ||
  printJs.indexOf("printVenue === 'windmill'") !== -1,
  'print preview hides Publish to website for Windmill');
assert(printJs.indexOf('Windmill website publish is not wired yet') !== -1,
  'publishSavedSheet skips Windmill → Eight Bells site');
assert(printJs.indexOf("asset('eight-bells-logo.png')") === -1,
  'print no longer hardcodes eight-bells-logo outside venueLogoFile');
assert(printJs.indexOf('(?:venue|pub)=windmill') !== -1 ||
  printJs.indexOf('pub)=windmill') !== -1,
  'printVenueId treats ?pub=windmill the same as ?venue=windmill');
assert(page.indexOf('function menuTabLabel') !== -1 &&
  page.indexOf("return 'Little Ones'") !== -1,
  'Windmill kids tab display label is Little Ones');
assert(page.indexOf("menu.id === 'little-bells' && isWindmillVenue") !== -1,
  'Little Ones label is Windmill-only (id stays little-bells)');
assert(fs.readFileSync(path.join(root, 'menus.js'), 'utf8')
  .indexOf("{ id: 'little-bells', name: 'Little Bells'") !== -1,
  'menus.js keeps little-bells id and Little Bells built-in name for Eight Bells');

var wmEntry = fs.readFileSync(path.join(root, 'menus-windmill.html'), 'utf8');
assert(wmEntry.indexOf('venue=windmill') !== -1 && wmEntry.indexOf('mode=staff') !== -1,
  'menus-windmill.html stable entry opens staff + venue=windmill');
assert(fs.readFileSync(path.join(root, 'manager-portals/windmill/index.html'), 'utf8')
  .indexOf('menus-windmill.html') !== -1,
  'Windmill manager portal Menus tile uses menus-windmill.html');

// Brand assets present (copied from live windmilllittleworth.com — not invented).
assert(fs.existsSync(path.join(root, 'images/windmill-logo.png')),
  'images/windmill-logo.png exists');
assert(fs.existsSync(path.join(root, 'images/windmill-logo-header.png')),
  'images/windmill-logo-header.png exists');
assert(fs.existsSync(path.join(root, 'images/eight-bells-logo.png')),
  'Eight Bells logo still present');

// —— 4. Isolation scenario (pure logic) ——
(function () {
  var eb = {
    updatedAt: 1000,
    book: {
      specials: [
        { id: 'eb1', section: 'Special Mains', name: 'Korean Crispy Chilli Beef', price: '16' },
        { id: 'eb2', section: 'Special Mains', name: 'Szechuan Chilli Pork Noodles', price: '15' }
      ],
      main: [
        { id: 'ebm1', section: 'Mains', name: 'Eight Bells Sirloin', price: '24' }
      ]
    },
    dishCatalogue: [
      { name: 'Korean Crispy Chilli Beef', price: '16' }
    ],
    menuVersions: { specials: 9, main: 4 }
  };
  var wm = sync.emptyWindmillState();
  assert(wm.book.specials.length === 0, 'Windmill starts with zero specials');
  assert(wm.book.main.length === 0, 'Windmill starts with zero main dishes');
  assert(wm.dishCatalogue.length === 0, 'Windmill catalogue starts empty');
  assert(eb.book.specials.length === 2, 'Eight Bells fixture still has its specials');
  assert(sync.menusPropKey('windmill') !== sync.menusPropKey('eightbells'),
    'venues do not share a Script Properties key');

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
  assert(saved.state.book.main.length === 0, 'Windmill main stays empty after specials save');
  assert(JSON.stringify(eb) === ebBefore,
    'Eight Bells fixture untouched by Windmill applyMenuSave');
  assert(saved.state.book.specials.every(function (d) {
    return !/Korean|Szechuan/i.test(d.name || '');
  }), 'Windmill book does not contain Eight Bells specials names');

  var savedMain = sync.applyMenuSave(saved.state, {
    menuId: 'main',
    expectedVersion: 1,
    dishes: [
      { id: 'wm2', section: 'Mains', name: 'Windmill Seabass', price: '21' }
    ]
  });
  assert(savedMain.ok === true, 'Windmill main first save succeeds');
  assert(savedMain.state.book.main[0].name === 'Windmill Seabass',
    'Windmill main stores Windmill dish');
  assert(JSON.stringify(eb) === ebBefore,
    'Eight Bells fixture untouched by Windmill main save');
})();

// —— 5. Dish-count / footer: every Windmill dish once, never past allergy ——
(function windmillDishCountAndFooter() {
  // Minimal DOM so printVenueId() can see Windmill.
  global.document = {
    documentElement: { dataset: { menusVenue: 'windmill', previewPub: 'windmill' } }
  };
  global.location = { search: '?venue=windmill', href: 'http://localhost/menus.html?venue=windmill' };
  // Fresh load of print after venue stubs (menus.js already may be cached).
  delete require.cache[require.resolve(path.join(root, 'menus.js'))];
  delete require.cache[require.resolve(path.join(root, 'menus-print.js'))];
  require(path.join(root, 'menus.js'));
  require(path.join(root, 'menus-print.js'));
  var api = global.EBMenus;
  var print = global.EBMenuPrint;
  assert(print.isWindmillPrint() === true, 'dish-count fixture runs as Windmill print');

  var starters = [
    'Soup of the Day', 'Prawn Cocktail', 'Halloumi Fries', 'Chicken Liver Pate',
    'Whitebait', 'Goats Cheese Tart'
  ];
  var mains = [
    'Beer Battered Cod', 'Steak and Ale Pie', 'Honey Roast Ham', 'Beef Burger',
    'Chicken Supreme', 'Lamb Shank', 'Vegetable Curry', 'Seabass Fillet',
    'Wild Mushroom Risotto', 'Pork Belly'
  ];
  var sides = ['Chunky Chips', 'Skinny Fries', 'House Salad', 'Seasonal Veg'];
  var dishes = [];
  starters.forEach(function (n, i) {
    dishes.push(api.dish(
      'Starters',
      n,
      'starter description with garnish ' + i + ' and extra words for wrap height',
      '7.95',
      i % 2 ? 'v' : ''
    ));
  });
  mains.forEach(function (n, i) {
    dishes.push(api.dish(
      'Mains',
      n,
      'long main description with mash gravy peas lemon butter sauce ' + i +
        ' and a little more text to force page height for the risotto overflow case',
      '16.50',
      n.indexOf('Risotto') !== -1 ? 'gf, v' : ''
    ));
  });
  sides.forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.50', 'v'));
  });

  var layoutMap = api.normalizeSectionLayout({
    Starters: { width: 'full', frame: false },
    Mains: { width: 'full', frame: false },
    Sides: { width: 'column', frame: false },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: 'Ask the team for today’s sandwiches.' }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: false },
    promos: []
  });
  assert(planned.pages === 2, 'Windmill Main with full Starters+Mains plans two pages');
  assert(planned.p1 && planned.p1.mains === true, 'planner pulls some Mains onto page 1');
  assert(planned.p1.mainsTake > 0 && planned.p1.mainsTake < mains.length,
    'page 1 takes a Mains prefix only (remainder continue on page 2)');

  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: false },
    layout: planned,
    promos: []
  });
  // Strip styles / scripts so name matches stay in body text.
  var body = sheet.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');
  var a4 = (body.split('mode-panel mode-a5')[0] || body);
  var pages = a4.split(/class="page fill-page/);
  assert(pages.length >= 3, 'print emits at least two A4 pages');

  function dishNameHits(html, name) {
    // Count only dish-name spans so short names do not match inside others.
    var re = new RegExp(
      'class="dish-name"[^>]*>\\s*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*<',
      'g'
    );
    var m = html.match(re);
    return m ? m.length : 0;
  }

  starters.concat(mains).concat(sides).forEach(function (name) {
    assert(dishNameHits(a4, name) === 1,
      'Windmill dish "' + name + '" appears exactly once across printed pages');
  });
  assert(/Mains \(continued\)/.test(a4), 'overflowing Mains continue with continued heading');
  assert(dishNameHits(a4, 'Wild Mushroom Risotto') === 1,
    'Wild Mushroom Risotto is not clipped/lost — prints exactly once');

  // Structural footer guard: within each page, no dish-name after the allergy block.
  for (var pi = 1; pi < pages.length; pi++) {
    var pageHtml = pages[pi];
    var allergyAt = pageHtml.search(/class="allergy"/i);
    if (allergyAt < 0) continue;
    var afterAllergy = pageHtml.slice(allergyAt);
    assert(!/class="dish-name"/.test(afterAllergy),
      'page ' + pi + ' has no dish-name after the allergy footer');
  }

  // Eight Bells print path: restore venue and confirm no Windmill logo class on <img>.
  global.document.documentElement.dataset = {};
  global.location = { search: '', href: 'http://localhost/menus.html' };
  delete require.cache[require.resolve(path.join(root, 'menus-print.js'))];
  require(path.join(root, 'menus-print.js'));
  var printEb = global.EBMenuPrint;
  assert(printEb.isWindmillPrint() === false, 'Eight Bells venue restores after Windmill fixture');
  var ebPlan = printEb.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: false },
    promos: []
  });
  var ebSheet = printEb.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: false },
    layout: ebPlan,
    promos: []
  });
  var ebBody = ebSheet.replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(!/<img[^>]*logo-tr-wm/.test(ebBody),
    'Eight Bells print <img> does not use Windmill logo class');
  assert(!/windmill-logo\.png/.test(ebBody),
    'Eight Bells print does not reference windmill-logo.png');
})();

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll windmill-menus-venue checks passed');
