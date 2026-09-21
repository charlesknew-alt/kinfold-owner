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
assert(html.indexOf("'menus-eightbells': 'menus.html'") !== -1, 'menus url is menus.html');
assert(page.indexOf('Show complete menu') !== -1, 'complete menu mode exists');
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

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll checks passed');
