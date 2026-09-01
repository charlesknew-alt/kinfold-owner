#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL  ' + msg);
  } else {
    console.log('ok    ' + msg);
  }
}

var src = fs.readFileSync(path.join(__dirname, '..', 'theme.js'), 'utf8');
var store = Object.create(null);
var documentStub = {
  readyState: 'complete',
  documentElement: {
    attrs: Object.create(null),
    style: {},
    setAttribute: function (k, v) { this.attrs[k] = v; },
    getAttribute: function (k) { return this.attrs[k]; }
  },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  addEventListener: function () {}
};

var sandbox = {
  window: {},
  document: documentStub,
  localStorage: {
    getItem: function (k) { return store[k] == null ? null : store[k]; },
    setItem: function (k, v) { store[k] = String(v); }
  },
  Intl: Intl,
  Date: Date,
  Math: Math,
  setInterval: function () { return 0; },
  console: console
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.runInNewContext(src, sandbox);

var T = sandbox.VarloTheme;
assert(!!T, 'VarloTheme exported');
assert(T.STORAGE_KEY === 'varlo-theme', 'storage key is varlo-theme');

// Midsummer noon UK should be daytime
var summerNoon = new Date('2026-06-21T12:00:00Z');
assert(T.isUkDaytime(summerNoon) === true, 'midsummer noon UTC is UK daytime');

// Midwinter late evening UK should be night
var winterEve = new Date('2026-12-21T22:00:00Z');
assert(T.isUkDaytime(winterEve) === false, 'midwinter 22:00 UTC is UK night');

var sun = T.ukSunTimes(summerNoon);
assert(!!sun && sun.rise < sun.set, 'ukSunTimes returns rise before set');
assert(sun.rise.getUTCHours() < 6, 'midsummer UK sunrise is early (UTC hours < 6)');

T.setPref('day');
assert(store['varlo-theme'] === 'day', 'persists day pref');
assert(T.resolveMode('day') === 'light', 'day resolves to light');
assert(documentStub.documentElement.attrs['data-theme'] === 'light', 'applies data-theme=light');

T.setPref('night');
assert(T.resolveMode('night') === 'dark', 'night resolves to dark');
assert(documentStub.documentElement.attrs['data-theme'] === 'dark', 'applies data-theme=dark');

T.setPref('auto');
assert(store['varlo-theme'] === 'auto', 'persists auto pref');
assert(['light', 'dark'].indexOf(T.resolveMode('auto')) !== -1, 'auto resolves to light or dark');

var html = fs.readFileSync(path.join(__dirname, '..', 'payroll.html'), 'utf8');
assert(html.indexOf('theme.js') !== -1, 'payroll loads theme.js');
assert(html.indexOf('data-theme-toggle') !== -1, 'payroll has theme toggle');
assert(html.indexOf('edit-modal-banner') !== -1, 'payroll keeps bank-corrected banner class');
assert(html.indexOf('[data-theme="dark"]') !== -1, 'payroll defines dark theme tokens');

var index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(index.indexOf('theme.js') !== -1, 'index loads theme.js');
assert(index.indexOf('data-theme-toggle') !== -1, 'index has theme toggle');

var hub = fs.readFileSync(path.join(__dirname, '..', 'staffhub.html'), 'utf8');
assert(hub.indexOf('theme.js') !== -1, 'staffhub loads theme.js');
assert(hub.indexOf('data-theme-toggle') !== -1, 'staffhub has theme toggle');

if (failed) {
  console.error('\n' + failed + ' failing');
  process.exit(1);
}
console.log('\nall passed');
