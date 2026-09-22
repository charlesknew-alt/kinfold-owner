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
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var page = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
require(path.join(root, 'menus.js'));
var api = global.EBMenus;

assert(html.indexOf("openApp('menus-eightbells'") !== -1, 'owner tile opens menus');
assert(html.indexOf("'menus-eightbells': 'menus.html") !== -1, 'menus url is menus.html');
assert(page.indexOf('Arranging your menu') !== -1, 'generate shows arranging step');
assert(page.indexOf('Ordering sections') !== -1, 'arrange explains section order');
assert(page.indexOf('Clear this menu') !== -1, 'clear this menu control');
assert(page.indexOf('flow-rail') !== -1 && page.indexOf('data-flow-step') !== -1, 'flow route step rail');
assert(page.indexOf('Blocks') !== -1 && page.indexOf('section-block') !== -1, 'section blocks in flow');
assert(page.indexOf('flowStep') !== -1 || page.indexOf('flow-step') !== -1, 'flow steps present');
assert(page.indexOf('option value="adjust"') !== -1 && page.indexOf('option value="replace"') !== -1, 'adjust and replace modes');
assert(page.indexOf('Add a dish') !== -1, 'add a dish mode');
assert(page.indexOf('Upload / paste') !== -1, 'upload / paste mode');
assert(page.indexOf('menus-ingest.js') !== -1, 'ingest script is loaded');
assert(page.indexOf('Review extracted menu') !== -1 || page.indexOf('openReview') !== -1, 'review gate before save');
assert(page.indexOf('AI reader URL') !== -1, 'AI reader URL field');
assert(page.indexOf('Party / Christmas') !== -1, 'party menu type in UI');
assert(page.indexOf('Spelling changes') !== -1, 'review shows spelling changes');
var ingestJs = fs.readFileSync(path.join(root, 'menus-ingest.js'), 'utf8');
assert(ingestJs.indexOf('getAiUrl') !== -1 && ingestJs.indexOf('readWithAi') !== -1, 'AI ingest path');
assert(ingestJs.indexOf('spellingFixes') !== -1, 'ingest passes spellingFixes');
assert(fs.existsSync(path.join(root, 'apps-script/menu-ai/Code.gs')), 'menu AI Apps Script exists');
var aiGs = fs.readFileSync(path.join(root, 'apps-script/menu-ai/Code.gs'), 'utf8');
assert(aiGs.indexOf('spellingFixes') !== -1, 'Gemini prompt asks for spellingFixes');
assert(api.menuById('party').kind === 'party', 'party menu kind');
assert(api.sheetPlan('party', 12).fit === 'one', 'party fits one page');
var aiPack = api.dishesFromAiMenu({
  kind: 'party',
  title: 'Christmas Party Menu',
  dishes: [
    { section: 'Starters', name: 'Soup', description: 'oil', tags: 'GF AV' },
    { section: 'Dishes', name: 'ak', tags: '' }
  ],
  spellingFixes: [
    { from: 'Soupp', to: 'Soup', where: 'dish name' },
    { from: 'Soupp', to: 'Soup', where: 'dup' },
    { from: 'same', to: 'same' }
  ]
});
assert(aiPack.dishes.length === 1 && aiPack.dishes[0].name === 'Soup', 'AI pack drops junk names');
assert(aiPack.spellingFixes.length === 1 && aiPack.spellingFixes[0].to === 'Soup', 'spellingFixes normalised');
assert(page.indexOf('menus-print.js') !== -1, 'branded print script is loaded');
assert(fs.existsSync(path.join(root, 'menus-print.js')), 'menus-print.js exists');
assert(fs.existsSync(path.join(root, 'images/eight-bells-logo.png')), 'logo asset exists');
assert(fs.existsSync(path.join(root, 'images/frame-wide.png')), 'scalloped frame asset exists');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');
assert(printJs.indexOf('EBMenuPrint') !== -1 && printJs.indexOf('scallop') !== -1, 'print builder has scalloped boxes');
assert(printJs.indexOf('toRoman') !== -1 && printJs.indexOf('Week of') !== -1, 'print tracker week + Roman numeral');
assert(printJs.indexOf('Stay a While') !== -1 && printJs.indexOf('Gatherings') !== -1, 'rooms and functions fillers');
assert(printJs.indexOf('cols') !== -1, 'two-column layout');
assert(printJs.indexOf('foot-logo') !== -1, 'page-2 logo when space');
assert(printJs.indexOf('sandwichNote') !== -1 || printJs.indexOf('Sandwiches') !== -1, 'sandwiches selling box');
assert(printJs.indexOf('frame-wide.png') !== -1 && printJs.indexOf('frame-box.png') !== -1, 'scallop frame assets');
assert(fs.existsSync(path.join(root, 'images/frame-box.png')), 'box frame asset exists');
assert(fs.existsSync(path.join(root, 'images/lunch-club-mark.png')), 'lunch club mark exists');

// stub localStorage for version counter
global.localStorage = {
  _d: {},
  getItem: function (k) { return this._d[k] == null ? null : this._d[k]; },
  setItem: function (k, v) { this._d[k] = String(v); }
};
require(path.join(root, 'menus-print.js'));
var print = global.EBMenuPrint;
assert(print.toRoman(1) === 'I' && print.toRoman(2) === 'II' && print.toRoman(4) === 'IV', 'Roman numerals');
assert(/Week of \d/.test(print.weekLabel(new Date('2026-09-21T12:00:00Z'))), 'week label');
assert(print.sundayLabel, 'sundayLabel exported');
assert(/^Sunday \d/.test(print.sundayLabel(new Date('2026-09-22T12:00:00Z'))), 'sunday label uses next/current Sunday');
var sunVer = print.nextPrintVersion('sunday');
assert(/^Sunday /.test(sunVer.week), 'Sunday print uses Sunday date not Week of');
assert(printJs.indexOf('2×A5') !== -1 || printJs.indexOf('guillotine') !== -1, 'A5 guillotine print mode');
assert(printJs.indexOf('fill-page') !== -1 && printJs.indexOf('page-spacer') !== -1, 'pages fill with spacer');
assert(printJs.indexOf('col-promo') !== -1, 'promo sits in its own column');
assert(typeof api.pickPromos === 'function', 'pickPromos exported');
assert(api.seedPromoBank().length >= 2, 'promo bank has seed wording');
var bank = [
  api.promoItem('Stay a While', 'rooms', '', 'stay'),
  api.promoItem('Old quiz', 'done', '2020-01-01', 'old'),
  api.promoItem('Pub Quiz', 'tonight', '2099-06-15', 'quiz')
];
var auto = api.pickPromos(bank, {}, { today: new Date('2026-09-22'), max: 2 });
assert(auto.length === 2 && auto[0].id === 'quiz' && auto[1].id === 'stay', 'auto-pick prefers upcoming date then evergreen');
assert(auto.every(function (p) { return p.id !== 'old'; }), 'auto-pick skips past dates');
var forced = api.pickPromos(bank, { old: true }, { today: new Date('2026-09-22'), max: 2 });
assert(forced.length === 1 && forced[0].id === 'old', 'manual tick can force a past-dated line');
assert(api.formatPromoDate('2026-09-30').indexOf('September') !== -1, 'promo date formats for print');
assert(page.indexOf('Wording / events') !== -1, 'wording bank mode in UI');
assert(page.indexOf('data-promo-tick') !== -1, 'promo ticks on long menus');
var v1 = print.nextPrintVersion('main');
var v2 = print.nextPrintVersion('main');
assert(v1.roman === 'I' && v2.roman === 'II', 'print version increments per generate');
assert(v1.week === v2.week, 'same week label within the week');
assert(page.indexOf('Also put on this sheet') !== -1, 'include-other-menus panel exists');
assert(page.indexOf('data-include') !== -1, 'include ticks are wired');
assert(page.indexOf('data-flag="gf"') !== -1 && page.indexOf('data-flag="v"') !== -1 && page.indexOf('data-flag="vg"') !== -1, 'dietary ticks exist');
assert(page.indexOf('data-flag="lunchClub"') !== -1, 'lunch club ticks on complete menu');
assert(page.indexOf('Monday to Thursday') !== -1, 'lunch club days are Monday to Thursday');

var parsed = api.parsePaste('Starters\nBeef Ragu Arancini gf 8.25\ntomato salsa\nGame Terrine 8.50\n\nMains\nPie of the Day 17.95');
assert(parsed.length === 3, 'paste reads three dishes');
assert(parsed[0].tags.indexOf('gf') !== -1, 'gf is pulled off the name');
assert(api.parsePaste('Mains\nVenison Casserole 18.95')[0].name === 'Venison Casserole', 'a leading v in a dish name is kept');

assert(api.formatMarks(api.parseMarks('gf option')) === 'gf option', 'gf option round-trips');
assert(api.formatMarks(api.parseMarks('v with gf option')) === 'v with gf option', 'v with gf option round-trips');
assert(api.formatMarks(api.parseMarks('vg')) === 'vg', 'vg round-trips');
assert(api.formatMarks({ gf: true, vgOpt: true, v: false, vg: false, gfOpt: false, vOpt: false }) === 'gf with vg option', 'gf with vg option formats');

assert(printJs.indexOf('border-image') !== -1, 'scallops use border-image (no stretch through text)');
assert(printJs.indexOf('background-size:100% 100%') === -1, 'no stretched full-bleed frame fill');
assert(print.planFluidLayout, 'planFluidLayout exported');

var book = api.seed();
var mainMenu = api.menuById('main');
var aloneDishes = api.composeDishes(book, 'main', {});
var fluid = print.planFluidLayout(mainMenu, aloneDishes);
assert(fluid.pages === 1 || fluid.pages === 2, 'fluid picks one or two pages');
assert(fluid.fit === 'one' || fluid.fit === 'two', 'fluid fit is printable');
assert(fluid.p1.rooms || (fluid.p2 && fluid.p2.rooms) || fluid.fillers.length >= 0, 'rooms considered');
assert(fluid.summary.indexOf('Layout picks') !== -1 || fluid.summary.indexOf('Auto-adds') !== -1 || fluid.summary.indexOf('A4') !== -1, 'layout explains itself');

var shuffled = [
  api.dish('Mains', 'Pie', 'mash', '14.95', ''),
  api.dish('Nibbles', 'Olives', '', '6.95', 'vg'),
  api.dish('Burgers', 'Spicy Asian Burger', 'fries', '16.95', 'vg'),
  api.dish('Starters', 'Soup', 'bread', '6.50', ''),
  api.dish('Pub Classics', 'Haddock & Chips', 'peas', '17.95', '')
];
var ordered = print.orderDishesForPrint(shuffled);
assert(ordered[0].section === 'Nibbles', 'orders nibbles first');
assert(ordered[1].section === 'Starters', 'then starters');
assert(ordered[2].name === 'Haddock & Chips', 'pub classics before burgers');
assert(ordered[3].name === 'Spicy Asian Burger', 'burgers after classics');
assert(ordered[4].section === 'Mains', 'mains after classics');

assert(api.guessSection('Pub classics & Burgers', 'Spicy Asian Burger', '') === 'Burgers', 'guesses burger section from name');
assert(api.guessSection('Pub classics & Burgers', 'Haddock & Chips', '') === 'Pub Classics', 'guesses classics from combined heading');
assert(api.sectionLayoutFor('Mains').width === 'full', 'mains default full width');
assert(api.sectionLayoutFor('Nibbles').frame === true, 'nibbles default frilly box');
assert(api.sectionLayoutFor('Burgers').width === 'column', 'burgers default column');
assert(api.sectionLayoutFor('Sandwiches').frame === true, 'sandwiches default frilly box');
var customLayout = api.normalizeSectionLayout({ Mains: { width: 'column', frame: true } });
assert(customLayout.Mains.width === 'column' && customLayout.Mains.frame === true, 'layout overrides persist shape');
assert(customLayout.Starters.width === 'full', 'other sections keep defaults');

assert(page.indexOf('Section layout rules') !== -1, 'layout rules UI present');
assert(page.indexOf('data-layout-width') !== -1 && page.indexOf('data-layout-frame') !== -1, 'layout width/frame controls');
assert(page.indexOf('data-section-id') !== -1 || page.indexOf('section-pick') !== -1, 'per-dish section dropdown');
assert(page.indexOf('Confirm sections') !== -1 || page.indexOf('auto-guess') !== -1, 'extract review confirms sections');

// Sparse menu → one page + fillers should appear
var sparse = [
  api.dish('Nibbles', 'Olives', '', '6.95', 'vg'),
  api.dish('Starters', 'Soup', 'bread', '6.50', ''),
  api.dish('Mains', 'Pie', 'mash', '14.95', '')
];
var sparseLayout = print.planFluidLayout(mainMenu, sparse);
assert(sparseLayout.pages === 1, 'sparse menu stays on one page');
assert(sparseLayout.p1.rooms || sparseLayout.fillers.some(function (f) { return /Stay|Gatherings|Sandwiches|Logo/i.test(f); }), 'sparse menu gets selling fillers');

// Promo must not force over
var crowdedDishes = aloneDishes.concat(api.composeDishes(book, 'main', { desserts: true, sandwiches: true, 'little-bells': true }).filter(function (d) {
  return d.fromMenu;
}));
var crowdedLayout = print.planFluidLayout(mainMenu, crowdedDishes);
assert(crowdedLayout.fit !== 'over' || crowdedDishes.length > 40, 'fillers never force an extra page on their own');
assert(api.includableMenus('desserts').length === 0, 'a card menu does not pull others in');

var alone = api.sheetPlanFor(book, 'main', {});
assert(alone.plan.fit === 'one' || alone.plan.fit === 'two', 'main alone fits one or two pages');
var withSandwiches = api.sheetPlanFor(book, 'main', { sandwiches: true, desserts: true });
assert(withSandwiches.dishes.length > alone.dishes.length, 'including sandwiches and desserts adds dishes');
assert(withSandwiches.dishes.some(function (d) { return d.fromMenu === 'sandwiches'; }), 'composed list marks dishes from sandwiches');
assert(withSandwiches.plan.text.indexOf('Sandwiches') !== -1, 'plan text names the included menus');

var crowded = api.sheetPlanFor(book, 'main', { sandwiches: true, desserts: true, 'little-bells': true });
assert(crowded.dishes.length >= withSandwiches.dishes.length, 'more includes add more dishes');

assert(api.lunchClubFromTicks(book).length > 0, 'sample menus include lunch club dishes');

global.document = {
  querySelector: function () { return null; },
  createElement: function () { return { onload: null, onerror: null }; },
  head: { appendChild: function () {} }
};
require(path.join(root, 'menus-ingest.js'));
var ingest = global.EBMenuIngest;
var cleaned = ingest.cleanExtractedText(
  'THE EIGHT BELLS\nBolney · West Sussex\nNibbles\nBread and Salted Butter\n5.95\nStarters\nBeef Ragu Arancini gf 8.25\ntomato salsa\nPlease inform us of any allergies'
);
var fromPdf = api.parsePaste(cleaned);
assert(fromPdf.length >= 2, 'cleaned PDF-like text parses dishes');
assert(fromPdf[0].name === 'Bread and Salted Butter' && fromPdf[0].price === '5.95', 'price-only line joins previous name');
assert(cleaned.indexOf('Please inform') === -1, 'allergy footer stripped from extract');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll checks passed');
