#!/usr/bin/env node
'use strict';

/**
 * Website publish after Print history lands — including background retry.
 * Mocks network/publish; never calls live Apps Script or eightbellsbolney.com.
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

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

var root = path.join(__dirname, '..');
var page = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');

assert(page.indexOf('id="publishNote"') !== -1 &&
  page.indexOf('function showPublishNote_') !== -1,
  'Menus tab has a lasting #publishNote banner (not only preview UI)');
assert(page.indexOf('handlePrintSavedForWebsite') !== -1 &&
  page.indexOf('showPublishNote_') !== -1,
  'Save wires publish status into showPublishNote_ on the Menus tab');
assert(page.indexOf('Waiting for Print history before publishing') !== -1 ||
  printJs.indexOf('Waiting for Print history before publishing') !== -1,
  'waiting copy exists when first history confirm fails');
assert(printJs.indexOf('confirmWebsitePublishReady') !== -1 &&
  printJs.indexOf('handlePrintSavedForWebsite') !== -1 &&
  printJs.indexOf('settlePendingWebsitePublishes_') !== -1,
  'print module queues publish until Print history confirms the sheet');
assert(printJs.indexOf('hasPendingWebsitePublishes_') !== -1,
  'background upload loop keeps going while a publish is waiting');

// Load modules for behavioural tests (no live network).
require(path.join(root, 'apps-script/menu-ai/MenuPublish.js'));
require(path.join(root, 'menus.js'));
require(path.join(root, 'menus-print.js'));
var print = global.EBMenuPrint;

// Never hit live Apps Script / website publish API from these tests.
global.fetch = function () {
  return Promise.reject(new Error('fetch_blocked_in_menu_publish_retry_test'));
};
global.EBMenuIngest = {
  cloudPost: function () {
    return Promise.reject(new Error('cloud_blocked_in_menu_publish_retry_test'));
  },
  getCloudUrl: function () { return ''; }
};

assert(print && typeof print.handlePrintSavedForWebsite === 'function' &&
  typeof print.confirmWebsitePublishReady === 'function' &&
  typeof print.setWebsitePublishFn === 'function' &&
  typeof print.resetWebsitePublishState === 'function',
  'publish-retry helpers are exported on EBMenuPrint');

function makeRequest(id) {
  return {
    id: id,
    menuId: 'main',
    menuName: 'Main menu',
    menuKind: 'long',
    title: 'Main menu',
    roman: 'V',
    savedAt: '2026-11-21T12:14:00.000Z',
    dishes: [{ section: 'Mains', name: 'Pie', description: 'gravy', price: '16.50', tags: [] }]
  };
}

function runScenarios() {
  print.resetWebsitePublishState();

  // --- 1. Publish ticked, first history confirm fails, later confirm → publish once ---
  var calls1 = [];
  var notes1 = [];
  print.setWebsitePublishFn(function (req) {
    calls1.push(req.id);
    return Promise.resolve({ ok: true, published: true, message: 'Live on the website' });
  });
  return print.handlePrintSavedForWebsite({
    publish: true,
    cloudSynced: false,
    source: 'local',
    request: makeRequest('pmwqddq8m')
  }, function (kind, text) {
    notes1.push({ kind: kind, text: text });
  }).then(function (res) {
    assert(res && res.waiting === true, '1: waits when first Print-history confirm fails');
    assert(calls1.length === 0, '1: does not publish before history lands');
    assert(notes1.some(function (n) {
      return n.kind === 'info' && /Waiting for Print history/.test(n.text);
    }), '1: lasting waiting message on Menus status callback');
    assert(print.websitePublishStatus('pmwqddq8m') === 'pending', '1: status is pending');
    // Do not let background flush hit the network in this unit test.
    print.cancelPendingPrintUploads();
    return print.confirmWebsitePublishReady('pmwqddq8m');
  }).then(function (res) {
    assert(res && res.published === true, '1: publishes after background history confirm');
    assert(calls1.length === 1 && calls1[0] === 'pmwqddq8m', '1: website publish called once');
    assert(notes1.some(function (n) {
      return n.kind === 'ok' && /Live on the website/.test(n.text);
    }), '1: lasting success message after preview would have closed');
    assert(print.websitePublishStatus('pmwqddq8m') === 'published', '1: marked published');

    // --- 4. Already published → no second publish ---
    return print.confirmWebsitePublishReady('pmwqddq8m');
  }).then(function (res) {
    assert(res && res.already === true, '4: second confirm is skipped');
    assert(calls1.length === 1, '4: no second publish after success');
    return print.handlePrintSavedForWebsite({
      publish: true,
      cloudSynced: true,
      source: 'cloud',
      request: makeRequest('pmwqddq8m')
    }, function () {});
  }).then(function (res) {
    assert(res && res.already === true, '4: re-Save of same id does not publish again');
    assert(calls1.length === 1, '4: publish count still one');

    // --- 3. Publish not ticked → never publish even if history lands ---
    print.resetWebsitePublishState();
    var calls3 = [];
    print.setWebsitePublishFn(function (req) {
      calls3.push(req.id);
      return Promise.resolve({ ok: true, published: true, message: 'Live on the website' });
    });
    return print.handlePrintSavedForWebsite({
      publish: false,
      cloudSynced: false,
      source: 'local',
      request: makeRequest('no-pub-id')
    }, function () {}).then(function (res) {
      assert(res && res.skipped === true && res.reason === 'not_ticked',
        '3: skipped when Publish was not ticked');
      return print.confirmWebsitePublishReady('no-pub-id');
    }).then(function (res) {
      assert(res === null, '3: history landing does nothing without a queued publish');
      assert(calls3.length === 0, '3: website publish never called when unticked');
    });
  }).then(function () {
    // --- 2. Publish ticked, sheet never lands → no publish, lasting failure ---
    print.resetWebsitePublishState();
    print.setWebsitePublishWaitMs(40);
    var calls2 = [];
    var notes2 = [];
    print.setWebsitePublishFn(function (req) {
      calls2.push(req.id);
      return Promise.resolve({ ok: true, published: true, message: 'Live on the website' });
    });
    return print.handlePrintSavedForWebsite({
      publish: true,
      cloudSynced: false,
      source: 'local',
      request: makeRequest('never-lands')
    }, function (kind, text) {
      notes2.push({ kind: kind, text: text });
    }).then(function (res) {
      assert(res && res.waiting === true, '2: starts waiting when history is missing');
      print.cancelPendingPrintUploads();
      return wait(80);
    }).then(function () {
      assert(calls2.length === 0, '2: no website publish when sheet never lands');
      assert(print.websitePublishStatus('never-lands') === 'failed', '2: status is failed');
      assert(notes2.some(function (n) {
        return n.kind === 'err' && /did not reach Print history/.test(n.text);
      }), '2: lasting failure message on Menus status callback');
      return print.confirmWebsitePublishReady('never-lands');
    }).then(function (res) {
      assert(res === null, '2: late history confirm after timeout does not publish');
      assert(calls2.length === 0, '2: still no publish after late confirm');
    });
  }).then(function () {
    // --- 5. Messages target Menus UI (#publishNote), not the closing preview ---
    assert(/id="publishNote"[\s\S]*?<div id="editor">/.test(page) ||
      (page.indexOf('id="publishNote"') < page.indexOf('id="editor"')),
      '5: #publishNote sits on the main Menus page outside #editor');
    assert(page.indexOf('EBMenuPrint.handlePrintSavedForWebsite(info, showPublishNote_)') !== -1,
      '5: status callback is showPublishNote_ on the Menus tab');
    var pubNoteFn = page.split('function showPublishNote_')[1] || '';
    pubNoteFn = pubNoteFn.split('window.EBMenusOnPrintSaved')[0] || pubNoteFn;
    assert(pubNoteFn.indexOf("getElementById('publishNote')") !== -1,
      '5: showPublishNote_ writes into #publishNote (survives preview close)');

    // Immediate success path still shows lasting ok on Menus UI.
    print.resetWebsitePublishState();
    var notes5 = [];
    var calls5 = [];
    print.setWebsitePublishFn(function (req) {
      calls5.push(req.id);
      return Promise.resolve({ ok: true, published: true, message: 'Live on the website' });
    });
    return print.handlePrintSavedForWebsite({
      publish: true,
      cloudSynced: true,
      source: 'cloud',
      request: makeRequest('synced-ok')
    }, function (kind, text) {
      notes5.push({ kind: kind, text: text });
    }).then(function () {
      assert(calls5.length === 1, '5: synced Save publishes once');
      assert(notes5.some(function (n) { return n.kind === 'ok'; }),
        '5: success note is delivered to Menus status callback');
      // Failure path message also via same callback.
      print.resetWebsitePublishState();
      var notesFail = [];
      print.setWebsitePublishFn(function () {
        return Promise.reject(new Error('Could not reach the website. The sheet is still saved in Print history.'));
      });
      return print.handlePrintSavedForWebsite({
        publish: true,
        cloudSynced: true,
        source: 'cloud',
        request: makeRequest('synced-fail')
      }, function (kind, text) {
        notesFail.push({ kind: kind, text: text });
      }).then(function () {
        assert(false, '5: publish failure should reject');
      }, function () {
        assert(notesFail.some(function (n) {
          return n.kind === 'err' && /still saved in Print history/.test(n.text);
        }), '5: failure note is delivered to Menus status callback');
      });
    });
  }).then(function () {
    print.resetWebsitePublishState();
    if (failed) {
      console.error('\n' + failed + ' check(s) failed');
      process.exit(1);
    }
    console.log('\nAll menu-publish-retry checks passed');
  }).catch(function (err) {
    console.error('FAIL  unexpected error: ' + (err && err.stack || err));
    process.exit(1);
  });
}

runScenarios();
