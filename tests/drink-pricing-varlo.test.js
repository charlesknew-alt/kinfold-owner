
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var PRICE = 'AKfycbwNucEJW1QJA1-UEUJrKcZ43geuFoatcwgOINfPaN39uYEowEIgpHru_9Du6rhk9i1rLA';
var root = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

var index = read('index.html');
assert(index.indexOf(PRICE) !== -1, 'index.html uses Varlo Price Query /exec');
assert(index.indexOf('venue=eightbells') !== -1, 'Eight Bells venue param');
assert(index.indexOf('venue=windmill') !== -1, 'Windmill venue param');
assert(index.indexOf('page=kegcosting') === -1, 'no kegcosting on index');
assert(index.indexOf("openApp('pricequery-eightbells'") !== -1, 'EB manager home Drink Pricing tile');
assert(index.indexOf("openApp('pricequery-windmill'") !== -1, 'WM manager home Drink Pricing tile');
assert(/windmill:\s*\[[^\]]*pricequery-windmill/.test(index), 'WM MANAGER_APPS lists pricequery-windmill');

var eb = read('manager-portals/eightbells/index.html');
assert(eb.indexOf(PRICE) !== -1, 'EB manager portal uses Varlo Price Query');
assert(eb.indexOf('venue=eightbells') !== -1, 'EB portal venue param');
assert(eb.indexOf("page=kegcosting") === -1, 'EB portal not kegcosting');

var wm = read('manager-portals/windmill/index.html');
assert(wm.indexOf(PRICE) !== -1, 'WM manager portal uses Varlo Price Query');
assert(wm.indexOf('venue=windmill') !== -1, 'WM portal venue param');

var code = read('apps-script/varlo-price-query/Code.js');
assert(code.indexOf('Price Query History') !== -1, 'logs to Price Query History');
assert(code.indexOf('logPriceQuery') !== -1, 'logPriceQuery export');
assert(code.indexOf('getPriceQueryCategories') !== -1, 'loads Category Config');

console.log('drink-pricing-varlo-unify: ok');
