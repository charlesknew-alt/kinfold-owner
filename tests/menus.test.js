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
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');
assert(printJs.indexOf('EBMenuPrint') !== -1 && printJs.indexOf('wavy') !== -1, 'print builder has wavy frames');
assert(printJs.indexOf('eight-bells-logo') !== -1, 'print builder uses the logo');
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

var book = api.seed();
assert(api.includableMenus('main').some(function (m) { return m.id === 'sandwiches'; }), 'main can include sandwiches');
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
