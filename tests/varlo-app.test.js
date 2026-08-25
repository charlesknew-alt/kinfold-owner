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
  var m = html.match(new RegExp("['\"]?" + name + "['\"]?\\s*:\\s*'([^']+)'"));
  return m ? m[1] : '';
}

var ebHub = extract('eightbells');
var wmHub = extract('windmill');
var ebPaper = extract('paperwork-eightbells');
var wmPaper = extract('paperwork-windmill');
var card = extract('cardtakings-eightbells');

assert(ebHub.indexOf('/exec') !== -1 && ebHub.indexOf('page=') === -1, 'EB manager hub has no page=');
assert(wmHub.indexOf('/exec') !== -1 && wmHub.indexOf('page=') === -1, 'WM manager hub has no page=');
assert(ebHub.indexOf('shell=') === -1, 'EB manager hub has no shell=');
assert(wmHub.indexOf('shell=') === -1, 'WM manager hub has no shell=');

assert(ebPaper.indexOf('page=owner') !== -1 && ebPaper.indexOf('shell=owner') !== -1, 'EB owner paperwork keeps page=owner&shell=owner');
assert(wmPaper.indexOf('page=owner') !== -1 && wmPaper.indexOf('shell=owner') !== -1, 'WM owner paperwork keeps page=owner&shell=owner');
assert(card.indexOf('page=cardday') !== -1 && card.indexOf('shell=owner') !== -1, 'EB card takings keeps page=cardday&shell=owner');

assert(html.indexOf('function withOwnerShell') !== -1, 'owner iframe helper kept');
assert(html.indexOf('function stripOwnerShell') !== -1, 'manager iframe strips shell=owner');
assert(html.indexOf('openOwnerReview') === -1, 'does not touch openOwnerReview');
assert(!/Owner tools|owner paperwork|page=owner/.test(html.match(/id="managerView"[\s\S]*id="roomsFab"/)[0]), 'manager chrome has no owner-paperwork link');

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
