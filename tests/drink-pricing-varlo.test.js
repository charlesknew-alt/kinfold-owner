
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var DRINKS = 'https://app.varlo.co.uk/drinks-pricing';
var OLD_PRICE_EXEC = 'AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA';
var root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

var index = read('index.html');
assert(index.indexOf(DRINKS) !== -1, 'index.html uses app.varlo.co.uk/drinks-pricing');
assert(index.indexOf('drinks-pricing?venue=eightbells') !== -1, 'Eight Bells venue param');
assert(index.indexOf('drinks-pricing?venue=windmill') !== -1, 'Windmill venue param');
assert(index.indexOf(OLD_PRICE_EXEC) === -1, 'no Apps Script Price Query /exec on index');
assert(index.indexOf('page=kegcosting') === -1, 'no kegcosting on index');
assert(index.indexOf("openApp('pricequery-eightbells'") !== -1, 'EB manager home Drink Pricing tile');
assert(index.indexOf("openApp('pricequery-windmill'") !== -1, 'WM manager home Drink Pricing tile');
assert(/windmill:\s*\[[^\]]*pricequery-windmill/.test(index), 'WM MANAGER_APPS lists pricequery-windmill');

var eb = read('manager-portals/eightbells/index.html');
assert(eb.indexOf(DRINKS) !== -1, 'EB manager portal uses drinks-pricing');
assert(eb.indexOf('venue=eightbells') !== -1, 'EB portal venue param');
assert(eb.indexOf(OLD_PRICE_EXEC) === -1, 'EB portal not Apps Script Price Query');
assert(eb.indexOf('page=kegcosting') === -1, 'EB portal not kegcosting');

var wm = read('manager-portals/windmill/index.html');
assert(wm.indexOf(DRINKS) !== -1, 'WM manager portal uses drinks-pricing');
assert(wm.indexOf('venue=windmill') !== -1, 'WM portal venue param');
assert(wm.indexOf(OLD_PRICE_EXEC) === -1, 'WM portal not Apps Script Price Query');

console.log('drink-pricing-drinks-app: ok');
