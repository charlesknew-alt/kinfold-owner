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
assert(html.indexOf('menus-eightbells') !== -1 && html.indexOf("system === 'menus-eightbells' && sessionRole !== 'eightbells'") !== -1, 'only Eight Bells manager opens menus from the manager sign-in');
assert(page.indexOf('id="lunchClub"') !== -1, 'dish form has a lunch club tick');
assert(page.indexOf('Paste from ChatGPT or Canva') !== -1, 'paste box is labelled');
assert(page.indexOf('Monday to Thursday') !== -1, 'lunch club days are Monday to Thursday');

var parsed = api.parsePaste('Starters\nBeef Ragu Arancini gf 8.25\ntomato salsa\nGame Terrine 8.50\n\nMains\nPie of the Day 17.95');
assert(parsed.length === 3, 'paste reads three dishes');
assert(parsed[0].section === 'Starters' && parsed[0].price === '8.25', 'first dish keeps section and price');
assert(parsed[0].description === 'tomato salsa', 'line under a priced dish is the description');
assert(parsed[0].tags.indexOf('gf') !== -1, 'gf is pulled off the name');
assert(parsed[0].name.indexOf('gf') === -1, 'name no longer contains gf');
assert(api.parsePaste('Mains\nVenison Casserole 18.95')[0].name === 'Venison Casserole', 'a leading v in a dish name is kept');
assert(parsed[2].section === 'Mains', 'section changes at Mains');

var lunch = api.parsePaste('Desserts\nSticky Toffee Pudding 7.95 lunch club');
assert(lunch[0].lunchClub === true, 'lunch club on a pasted line ticks the dish');

var card = api.sheetPlan('desserts', 6);
assert(card.fit === 'two-up', 'desserts stay two copies on one sheet');
var crowded = api.sheetPlan('desserts', 9);
assert(crowded.fit === 'over', 'a crowded dessert card is too full');
var longMenu = api.sheetPlan('main', 28);
assert(longMenu.fit === 'two', 'a long main menu runs to two pages');

var book = api.seed();
var ticked = api.lunchClubFromTicks(book);
assert(ticked.length > 0, 'sample menus include lunch club dishes');
assert(ticked.every(function (row) { return row.dish.lunchClub; }), 'only ticked dishes are gathered');
book.main.forEach(function (d) { d.lunchClub = false; });
book.sunday.forEach(function (d) { d.lunchClub = false; });
book.desserts.forEach(function (d) { d.lunchClub = false; });
book.sandwiches.forEach(function (d) { d.lunchClub = false; });
book['little-bells'].forEach(function (d) { d.lunchClub = false; });
assert(api.lunchClubFromTicks(book).length === 0, 'with no ticks the lunch club is not gathered from other menus');
assert(book['lunch-club'].length === 12, 'the separate lunch club menu is still there');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll checks passed');
