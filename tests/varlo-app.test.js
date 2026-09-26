#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var auth = fs.readFileSync(path.join(__dirname, '..', 'apps-script/varlo-auth/Code.js'), 'utf8');
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

function extract(name) {
  var m = html.match(new RegExp("['\"]" + name + "['\"]\\s*:\\s*'([^']+)'"));
  return m ? m[1] : '';
}

var ebHub = extract('hub-eightbells');
var wmHub = extract('hub-windmill');
var ebPaper = extract('paperwork-eightbells');
var wmPaper = extract('paperwork-windmill');
var card = extract('cardtakings-eightbells');
var cardWm = extract('cardtakings-windmill');
var roomsWm = extract('rooms-windmill');

assert(ebHub.indexOf('/exec') !== -1 && ebHub.indexOf('page=') === -1, 'EB manager hub has no page=');
assert(wmHub.indexOf('/exec') !== -1 && wmHub.indexOf('page=') === -1, 'WM manager hub has no page=');
assert(ebHub.indexOf('shell=') === -1, 'EB manager hub has no shell=');
assert(wmHub.indexOf('shell=') === -1, 'WM manager hub has no shell=');

assert(ebPaper.indexOf('page=owner') !== -1 && ebPaper.indexOf('shell=owner') !== -1, 'EB owner paperwork keeps page=owner&shell=owner');
assert(wmPaper.indexOf('page=owner') !== -1 && wmPaper.indexOf('shell=owner') !== -1, 'WM owner paperwork keeps page=owner&shell=owner');
assert(card.indexOf('page=cardday') !== -1 && card.indexOf('shell=owner') !== -1, 'EB card takings keeps page=cardday&shell=owner');
assert(cardWm.indexOf('card-takings.html') !== -1, 'WM card takings is standalone card-takings.html');
assert(cardWm.indexOf('page=') === -1, 'WM card takings does not use Apps Script page=');
assert(html.indexOf("openApp('cardtakings-windmill'") !== -1, 'WM owner tile opens cardtakings-windmill');
assert(html.indexOf('Teya CSV') !== -1, 'WM tile mentions Teya CSV');
assert(html.indexOf('function restoreFromHash') !== -1 && html.indexOf('systemFromHash') !== -1, 'hash restore reopens app after refresh');
assert(html.indexOf('restoreFromHash();') !== -1, 'hash restore runs on boot');

var cardHtml = fs.readFileSync(path.join(__dirname, '..', 'card-takings.html'), 'utf8');
assert(cardHtml.indexOf('buildTxnsTeya') !== -1, 'card-takings.html has Teya parser');
assert(cardHtml.indexOf('does not feed into paperwork') !== -1 || cardHtml.indexOf('not linked to paperwork') !== -1, 'card-takings.html says it is not paperwork');
assert(cardHtml.indexOf('SUCCEEDED') !== -1, 'Teya SUCCEEDED status handled');

// Parse sample Teya CSV with the same column aliases
var sample = fs.readFileSync(path.join(__dirname, '..', 'samples', 'windmill-teya-transaction-report.csv'), 'utf8');
assert(sample.indexOf('Payment type') !== -1 && sample.indexOf('Sales') !== -1, 'sample Teya CSV present');
assert(sample.indexOf('Device name') !== -1 && sample.indexOf('Device ID') !== -1, 'sample has device columns');

assert(html.indexOf('function withOwnerShell') !== -1, 'owner iframe helper kept');
assert(html.indexOf('function stripOwnerShell') !== -1, 'manager iframe strips shell=owner');
assert(html.indexOf('function withStaffMenus') !== -1 && html.indexOf('mode=staff') !== -1,
  'Eight Bells manager Menus get mode=staff');
assert(html.indexOf('id="managerHomeEb"') !== -1 && html.indexOf('id="managerHomeWm"') !== -1,
  'manager roles land on a home tile menu');
assert(html.indexOf("openApp('hub-eightbells'") !== -1 && html.indexOf("openApp('menus-eightbells'") !== -1,
  'EB manager home has paperwork and Menus');
assert(html.indexOf("openApp('pricequery-eightbells'") !== -1, 'EB manager home has drink pricing');
assert(html.indexOf("openApp('hub-windmill'") !== -1 && html.indexOf("openApp('rooms-windmill'") !== -1,
  'WM manager home has paperwork and Rooms');
assert(roomsWm.indexOf('rooms-windmill.html') !== -1, 'WM rooms opens rooms-windmill.html');
assert(html.indexOf('MANAGER_APPS') !== -1, 'manager apps are allowlisted');
assert(html.indexOf('menusFab') === -1 && html.indexOf('roomsFab') === -1, 'manager FABs removed in favour of home tiles');
assert(html.indexOf('openOwnerReview') === -1, 'does not touch openOwnerReview');
var managerChunk = html.match(/id="managerView"[\s\S]*?<\/div>\s*<script>/);
assert(managerChunk && !/Owner tools|owner paperwork|page=owner/.test(managerChunk[0]),
  'manager chrome has no owner-paperwork link');

assert(html.indexOf('#1c1610') !== -1 && html.indexOf('#f6f0e6') !== -1, 'Varlo ink + cream tokens');
assert(html.indexOf('#b68a3a') !== -1 && html.indexOf('#24362c') !== -1, 'Varlo brass + forest tokens');
assert(html.indexOf("Fraunces") !== -1 && html.indexOf('Source Sans 3') !== -1, 'Varlo fonts');

assert(html.indexOf('1106') === -1, 'Eight Bells manager PIN is not in the page');
assert(html.indexOf('1978') === -1, 'Windmill manager PIN is not in the page');
assert(html.indexOf('Manager passwords') !== -1, 'owner panel exists');
assert(html.indexOf("data-role=\"owner\"") !== -1, 'unified login has owner role');
assert(html.indexOf("data-role=\"eightbells\"") !== -1, 'unified login has Eight Bells role');
assert(html.indexOf("data-role=\"windmill\"") !== -1, 'unified login has Windmill role');

assert(auth.indexOf('PropertiesService.getScriptProperties()') !== -1, 'auth stores hashes in Script Properties');
assert(auth.indexOf('function doGet') !== -1 && auth.indexOf('function doPost') !== -1, 'auth exposes doGet/doPost');
assert(auth.indexOf('callback') !== -1, 'auth supports JSONP');
assert(auth.indexOf('HASH_EIGHTBELLS') !== -1 && auth.indexOf('HASH_WINDMILL') !== -1, 'auth has manager hash keys');
assert(auth.indexOf('routePage') === -1, 'auth script does not implement the venue page router');

if (failed) {
  console.error('\n' + failed + ' check(s) failed');
  process.exit(1);
}
console.log('\nAll checks passed');
