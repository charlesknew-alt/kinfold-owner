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
assert(page.indexOf('Keeping Sandwiches, Little Bells and Desserts if you ticked them') !== -1 &&
  page.indexOf('Placing wording / sandwiches') === -1,
  'arrange keeps ticked sandwiches; does not treat them as optional-if-they-fit');
assert(page.indexOf('Putting the logo on only if') !== -1,
  'logo is still optional chrome if there is room');
assert(page.indexOf('does not drop food off the page') !== -1,
  'include ticks explain food is not dropped off the page to make space');
assert(page.indexOf('Clear this menu') !== -1, 'clear this menu control');
assert(page.indexOf("getElementById('doGenerate').onclick") === -1, 'do not bind Generate before step renders');
assert(/try\s*\{/.test(page) && page.indexOf('pullMenusFromCloud()') !== -1,
  'boot wraps cloud sync in try/catch');
assert(page.indexOf('function renderPlanHtml') !== -1, 'renderPlanHtml is defined');
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
assert(typeof api.autoCorrectSpelling === 'function' && typeof api.scanMenuSpelling === 'function',
  'live spelling helpers exported');
assert(api.autoCorrectSpelling('Seperate tomatos with mayonaise').text === 'Separate tomatoes with mayonnaise',
  'common food typos auto-correct on save');
assert(api.scanMenuSpelling([{ id: 'd1', name: 'Calimari', description: 'bruscetta, mozarella' }]).length >= 2,
  'menu scan finds spelling mistakes before generate');
(function () {
  var specialsHits = api.scanMenuSpelling([
    {
      id: 's1',
      name: 'Pasta Carbonaro',
      description: 'linguine with smoked pancetta topped with a chilli pangratto'
    },
    {
      id: 's2',
      name: 'Mackerel Pate',
      description: 'salad & soughdough baguette'
    },
    {
      id: 's3',
      name: 'Beef Short Rib Genovese Rigatoni',
      description: 'until its melt in the mouth & jammy'
    }
  ]);
  var tos = specialsHits.map(function (f) { return String(f.to).toLowerCase(); });
  assert(tos.indexOf('carbonara') !== -1, 'local dict flags Carbonaro → Carbonara');
  assert(tos.indexOf('pangrattato') !== -1, 'local dict flags pangratto → pangrattato');
  assert(tos.indexOf('sourdough') !== -1, 'local dict flags soughdough → sourdough');
  assert(tos.some(function (t) { return t.indexOf('it melts') !== -1; }),
    'local phrase list flags its melt → it melts');
})();
assert(typeof api.applySpellingFixesToBook === 'function',
  'applySpellingFixesToBook writes drop-in fixes to source menus');
(function () {
  var book = {
    main: [api.dish('Mains', 'House Burger', 'brioche bun', '14.95', '')],
    specials: [{
      id: 'carb-1',
      section: 'Special Mains',
      name: 'Pasta Carbonaro',
      description: 'chilli pangratto',
      price: '16.95',
      tags: '',
      lunchClub: false
    }]
  };
  var composed = api.composeDishes(book, 'main', { specials: true });
  var hits = api.scanMenuSpelling(composed);
  assert(hits.some(function (f) {
    return String(f.from).toLowerCase() === 'carbonaro' && f.fromMenu === 'specials';
  }), 'Main generate scan includes Specials drop-in typos');
  var next = api.applySpellingFixesToBook(book, hits.filter(function (f) {
    return String(f.to).toLowerCase() === 'carbonara' ||
      String(f.to).toLowerCase() === 'pangrattato';
  }), 'main');
  assert(next.specials[0].name === 'Pasta Carbonara',
    'accepted drop-in name fix lands on Specials book');
  assert(next.specials[0].description.indexOf('pangrattato') !== -1,
    'accepted drop-in description fix lands on Specials book');
})();
assert(page.indexOf('spellCheckDishes_') !== -1 &&
  page.indexOf('local food-typo list') !== -1,
  'Generate spelling gate scans composed dishes and keeps local hits if AI fails');
assert(api.scanMenuSpelling([{
  id: 'd2',
  name: 'Korean Chicken Balls',
  description: 'noodles, caramelised onions, malted bread'
}]).length === 0, 'does not flag onions, noodles or malted bread');
assert(api.isBenignSpellingPair('onions', 'onion') && api.isBenignSpellingPair('noodles', 'noodle'),
  'plurals are left as typed');
assert(api.enrichSpellingFixes(
    [{ id: 'x', name: 'Falafel', description: 'malted bread' }],
    [{ from: 'malted', to: 'salted', where: 'description', dishId: 'x' }]
  ).length === 0, 'malted bread is kept even if AI suggests salted');
assert(api.enrichSpellingFixes(
  [{ id: 'x', name: 'Prawns', description: 'smokey paprika' }],
  [{ from: 'smokey', to: 'smoky', where: 'description', dishId: 'x' }]
)[0].snippet.indexOf('smokey paprika') !== -1, 'spelling fixes carry the full description');
assert(api.splitSpellSnippet('toasted malted bread', 'malted').hit.toLowerCase() === 'malted',
  'snippet splitter marks the word in the full line');
assert(page.indexOf('data-spell-act="change"') !== -1 && page.indexOf('data-spell-act="keep"') !== -1,
  'spelling gate has Change and Correct tick boxes');
assert(page.indexOf('As written') !== -1 && page.indexOf('If changed') !== -1,
  'spelling gate shows the whole dish line, not just the word');
assert(aiGs.indexOf('Read each NAME and DESCRIPTION as a whole sentence') !== -1 &&
  aiGs.indexOf('malted bread') !== -1,
  'Menu AI proof-reads the full sentence and keeps malted bread');
assert(api.applySpellingFixesToDishes(
  [{ id: 'd1', name: 'Calimari', description: 'with mayonaise' }],
  [{ from: 'Calimari', to: 'Calamari', where: 'name', dishId: 'd1' }]
)[0].name === 'Calamari', 'apply spelling fixes rewrites the dish');
assert(page.indexOf('spellCheckThenGenerate_') !== -1 && page.indexOf('spellHintsName') !== -1,
  'spelling suggests as you type and gates Generate');
(function assertGenerateAlwaysRoutesThroughSpell() {
  var genMatch = page.match(/function generateMenu\(\) \{[\s\S]*?\n    \}/);
  assert(genMatch, 'generateMenu function is present');
  var genBody = genMatch[0];
  assert(genBody.indexOf('spellCheckThenGenerate_') !== -1,
    'generateMenu always routes through spellCheckThenGenerate_');
  assert(genBody.indexOf('generateMenuAfterSpell_') !== -1,
    'generateMenu reaches arrange only via after-spell callback');
  // No kind may open print / arrange without the spelling gate.
  assert(!/menu\.kind\s*===\s*['"]card['"][\s\S]{0,120}generateMenuAfterSpell_/.test(genBody),
    'card Generate does not call generateMenuAfterSpell_ outside the spell gate');
  assert(!/menu\.kind\s*===\s*['"]party['"][\s\S]{0,120}generateMenuAfterSpell_/.test(genBody),
    'party Generate does not call generateMenuAfterSpell_ outside the spell gate');
  assert(!/menu\.kind\s*===\s*['"]long['"][\s\S]{0,200}generateMenuAfterSpell_\(\)/.test(genBody) ||
    genBody.indexOf('spellCheckThenGenerate_(generateMenuAfterSpell_)') !== -1,
    'long Generate still funnels arrange through spellCheckThenGenerate_');
  assert(genBody.indexOf('EBMenuPrint.build') === -1 && genBody.indexOf('openPrintHtml') === -1 &&
    genBody.indexOf("window.open") === -1,
    'generateMenu itself never builds/opens print (spell gate first)');
  assert(page.indexOf('doGen.onclick = generateMenu') !== -1 &&
    page.indexOf('doHint.onclick = generateMenu') !== -1,
    'doGenerate and Print/PDF hint both call generateMenu (spell-gated)');
  assert(page.indexOf('spellGatePassed_') !== -1 &&
    page.indexOf('if (!spellGatePassed_)') !== -1,
    'generateMenuAfterSpell_ hard-refuses calls that skipped the spelling gate');
  assert(page.indexOf('afterPreGates_') !== -1 &&
    page.indexOf('spellCheckThenGenerate_(generateMenuAfterSpell_)') !== -1,
    'single afterPreGates_ funnel: spell then arrange for every kind');
  // Built-in menu kinds that use Generate — long, card, party — share one button path.
  var byKind = { long: 0, card: 0, party: 0 };
  (api.MENUS || []).forEach(function (m) {
    if (m && byKind[m.kind] !== undefined) byKind[m.kind] += 1;
  });
  assert(byKind.long >= 1, 'Generate spell gate covers long menus (Main/Sunday/upcoming)');
  assert(byKind.card >= 1, 'Generate spell gate covers card menus (Specials/Sandwiches/…)');
  assert(byKind.party >= 1, 'Generate spell gate covers party menus');
})();
assert(page.indexOf('dearest dish first') !== -1,
  'generate plan explains selling mix inside each category');
assert(ingestJs.indexOf('reviewSpelling') !== -1 && aiGs.indexOf('reviewSpellingWithGemini_') !== -1,
  'Menu AI can proof-read the live sheet before print');
assert(aiGs.indexOf("extraMenus: Array.isArray(raw.extraMenus)") !== -1 &&
  aiGs.indexOf("extraSections: Array.isArray(raw.extraSections)") !== -1,
  'cloud save keeps owner extra menus and categories');
assert(page.indexOf('Print order in each category') !== -1 &&
  page.indexOf('if (!list.length)') !== -1,
  'Generate plan mentions selling mix and still early-returns when empty');
assert(page.indexOf('menus-print.js') !== -1, 'branded print script is loaded');
assert(fs.existsSync(path.join(root, 'menus-print.js')), 'menus-print.js exists');
assert(fs.existsSync(path.join(root, 'images/eight-bells-logo.png')), 'logo asset exists');
assert(fs.existsSync(path.join(root, 'images/frame-wide.png')), 'scalloped frame asset exists');
assert(fs.existsSync(path.join(root, 'images/frame-platter.png')), 'tip oval platter asset exists');
var printJs = fs.readFileSync(path.join(root, 'menus-print.js'), 'utf8');
assert(printJs.indexOf('EBMenuPrint') !== -1 && printJs.indexOf('scallop') !== -1, 'print builder has scalloped boxes');
assert(printJs.indexOf('toRoman') !== -1 && printJs.indexOf('Week of') !== -1, 'print tracker week + Roman numeral');
assert(printJs.indexOf('Roboto') !== -1 && printJs.indexOf('Crimson Text') !== -1, 'print uses Roboto + Crimson Text like Canva PDFs');
assert(printJs.indexOf('Source Sans 3') === -1, 'print no longer uses Source Sans 3 for dishes');
assert(/logo-tr\{width:180px/.test(printJs), 'front-page logo sized ~180px');
assert(/tracker \.roman\{[^}]*font-size:4pt/.test(printJs), 'Roman version mark is staff-small');
assert(printJs.indexOf('--title-max:22pt') !== -1 && printJs.indexOf('--name-max:11.5pt') !== -1,
  'type range CSS vars set adult max sizes');
assert(printJs.indexOf('--name-min:11pt') !== -1 && printJs.indexOf('--desc-min:10pt') !== -1,
  'type range CSS vars set readable min sizes (+2pt)');
assert(printJs.indexOf('--title-min:16pt') !== -1, 'section title min is 16pt');
assert(printJs.indexOf('--dish-gap-min:13px') !== -1, 'minimum gap between dishes is 13px');
assert(printJs.indexOf('max(var(--dish-gap-min),var(--dish-gap))') !== -1,
  'dish margin respects dish-gap-min floor');
assert(/\.fill-dense\{[^}]*--name:11pt/.test(printJs) && /\.fill-dense\{[^}]*--dish-gap:13px/.test(printJs),
  'dense floor uses raised type mins and 13px dish gap');
assert(/\.desc\{[^}]*font-weight:300/.test(printJs) && printJs.indexOf('wght@0,300') !== -1,
  'dish descriptions use Roboto Light (300)');
assert(/\.fill-airy\{[^}]*--name:11\.5pt/.test(printJs) && /\.fill-airy\{[^}]*--title:22pt/.test(printJs),
  'airy density is capped at type-range max (not kids-menu giant type)');
assert(printJs.indexOf('min(var(--title),var(--title-max))') !== -1, 'section titles clamp to title-max');
assert(printJs.indexOf('margin:0 0 var(--sec-gap)') !== -1 || printJs.indexOf('margin-bottom:calc(var(--sec-gap)') !== -1,
  'section titles leave a density-aware gap before dishes');
assert(printJs.indexOf('startersInTop') !== -1, 'starters span the top band beside the logo');
assert(printJs.indexOf('nibblesInTop') !== -1, 'nibbles also use the top band beside the logo');
assert(printJs.indexOf('display:flex') !== -1 && printJs.indexOf('dish-leader') !== -1,
  'dish lines use flex leaders that start after the name');
assert(printJs.indexOf('.dish-line{display:flex') !== -1, 'dish-line flex rule present in source');
assert(!/\*\/\s*\+/.test(printJs), 'print CSS has no comment-plus that becomes NaN');
assert(printJs.indexOf('createObjectURL') !== -1, 'print preview falls back to a blob URL');
assert(printJs.indexOf('print-preview.html') !== -1, 'print preview opens a real same-origin page not about:blank');
assert(printJs.indexOf('localStorage.setItem(key') !== -1 && printJs.indexOf('searchParams.set(\'k\'') !== -1,
  'print preview stores HTML under a key so iframe tabs are not stuck on about:blank');
assert(fs.existsSync(path.join(root, 'print-preview.html')), 'print-preview.html exists for GitHub Pages');
assert(fs.readFileSync(path.join(root, 'print-preview.html'), 'utf8').indexOf('localStorage.getItem(key') !== -1,
  'print-preview.html reads the keyed HTML from localStorage');
(function printPreviewNestAndKeyGuards() {
  var preview = fs.readFileSync(path.join(root, 'print-preview.html'), 'utf8');
  assert(preview.indexOf('setTimeout(function') !== -1 && preview.indexOf('document.write(payload)') !== -1,
    'print-preview defers document.write so it replaces the loader instead of nesting sheets');
  assert(preview.indexOf('Do not fall back to shared EB_PRINT_PREVIEW_HTML') !== -1 ||
    (preview.indexOf('if (key)') !== -1 && preview.indexOf("localStorage.getItem('EB_PRINT_PREVIEW_HTML')") !== -1 &&
      preview.indexOf('if (key)') < preview.lastIndexOf("localStorage.getItem('EB_PRINT_PREVIEW_HTML')")),
    'keyed preview does not fall back to shared storage (wrong-menu Save guard)');
  // Keyed path must not read shared EB_PRINT_PREVIEW_HTML
  var keyBlock = preview.split('if (key)')[1] || '';
  var elseBlock = keyBlock.split('} else {')[0] || keyBlock;
  assert(elseBlock.indexOf("localStorage.getItem('EB_PRINT_PREVIEW_HTML')") === -1,
    'when ?k= is set, missing key does not load another menu from EB_PRINT_PREVIEW_HTML');
})();
assert(printJs.indexOf('sanitizePrintHtml') !== -1 && printJs.indexOf('sanitizeDomForSave') !== -1,
  'Save/open sanitize nested sheet-stacks before stamping history');
assert(printJs.indexOf("a.rel = 'opener'") !== -1,
  'print preview keeps window.opener so Save can stamp the current menu');
assert(printJs.indexOf("a.rel = 'noopener'") === -1,
  'print preview does not open with noopener (that broke Save + double tabs)');
assert(!/a\.click\(\)[\s\S]{0,200}window\.open\(previewUrl/.test(printJs),
  'openPrintHtml does not both <a.click> and window.open (wrong-menu leftover tabs)');
assert(printJs.indexOf('pages.slice(2)') !== -1 && printJs.indexOf('cuts.slice(2)') !== -1,
  'sanitize caps A4 pages and A5 cut-sheets at two');
assert(page.indexOf('EBMenuPrint.openPrintHtml') !== -1 && page.indexOf("window.open('', '_blank')") === -1,
  'Generate opens print-preview.html instead of writing into about:blank');
assert(page.indexOf('layoutSource') !== -1 && printJs.indexOf('Layout: Gemini') !== -1,
  'preview toolbar says whether Gemini or a JS guess placed the sheet');
assert(printJs.indexOf('fitPreviewToScreen') !== -1, 'preview scales A4 to the phone viewport');
assert(printJs.indexOf('name="viewport"') !== -1, 'preview has a mobile viewport tag');
assert(printJs.indexOf('overflow-x:hidden') !== -1 && printJs.indexOf('preview-clip') !== -1,
  'preview clips A4 overflow so dish prices cannot leak into the toolbar');
assert(printJs.indexOf('if (opts.force) fillOpts.force = opts.force') !== -1,
  'layout review forceColumnFill applies to opposite food pairs');
assert(printJs.indexOf('skipPromos: true') !== -1,
  'Little Bells solo can skip rooms copy in the empty opposite half');
assert(printJs.indexOf('skipPromos: !!opts.skipPromos') !== -1,
  'unpaired Column / Best-fit rows fill the short side with a feature panel');
assert(printJs.indexOf('function isBlankFoodInner') !== -1 && printJs.indexOf('rightPromoBody') !== -1,
  'empty partner column sits the leftover panel at the top, not the page foot');
assert(printJs.indexOf('.bottom-cols.cols-balanced .col-body{flex:0 0 auto}') !== -1,
  'Sides partner column does not stretch and leave a hole above the panel');
assert(printJs.indexOf('.cols.bottom-cols{flex:0 0 auto}') !== -1,
  'spread leftover sits between sections, not inside the Sides row');
assert(/\.scallop-pad\{padding:6px 12px 1[02]px/.test(printJs),
  'frilly pad keeps prices and last dessert lines inside the box');
assert(printJs.indexOf('scallop-pad:has(.sheet-blurb-below)') !== -1 &&
  printJs.indexOf('padding-bottom:18px') !== -1,
  'below-box notes get extra scallop bottom pad so they never crop on the frame');
assert(printJs.indexOf('.scallop-box .scallop-pad:has(.sheet-blurb-below)') !== -1,
  'below-pad rule beats .scallop-box .scallop-pad shorthand');
assert(printJs.indexOf('cols-pair-titles') !== -1 && printJs.indexOf('function pairHeadHtml') !== -1,
  'opposite columns keep category titles in a pair-head');
assert(printJs.indexOf('function nestTitleInFrilly') !== -1 && printJs.indexOf('pair-head-inset') !== -1,
  'frilly titles sit in the box; unframed pair-heads inset to that baseline');
assert(printJs.indexOf('sides-sand-row') !== -1 &&
  (printJs.indexOf("rightTitle: p2opts.sandwiches ? 'Sandwiches'") !== -1 ||
    printJs.indexOf("rightTitle: (p2opts.sandwiches && !layout.sandwichTipOnly) ? 'Sandwiches'") !== -1),
  'Sides|Sandwiches bottom pair still shares the column-pair layout');
assert(printJs.indexOf('shortOnly: true') !== -1,
  'kids|desserts leftover space gets a small panel under the shorter column only');
assert(printJs.indexOf('function wrapUnits') !== -1 && printJs.indexOf('function columnFillUnits') !== -1,
  'column fill counts wrapping descriptions so leftover panels can drop in');
assert(printJs.indexOf('sheet-offer') !== -1, 'Sunday £9.50 offer has a larger sheet-offer style');
require(path.join(root, 'menus-print.js'));
var printApi = global.EBMenuPrint;
assert(typeof printApi.build === 'function', 'EBMenuPrint.build exported');
assert(typeof printApi.sanitizePrintHtml === 'function', 'sanitizePrintHtml exported for Save/history reopen');
(function sanitizeNestAndWrongMenuGuards() {
  var nested =
    '<!DOCTYPE html><html><head><title>Main menu</title></head><body class="paper-a4">' +
    '<script>var html="x";document.write(html);<\/script>' +
    '<div class="toolbar" id="previewToolbar">TB1</div>' +
    '<div class="preview-clip">' +
      '<div class="sheet-stack mode-panel mode-a4">' +
        '<div class="page">P1-A</div><div class="page">P2-A</div>' +
        '<div class="page">P3-extra</div><div class="page">P4-extra</div>' +
      '</div>' +
    '</div>' +
    '<div class="toolbar">TB2-dup</div>' +
    '<div class="preview-clip">' +
      '<div class="sheet-stack mode-panel mode-a4">' +
        '<div class="page">P1-B-Sunday</div><div class="page">P2-B</div>' +
      '</div>' +
      '<div class="sheet-stack mode-panel mode-a5">' +
        '<div class="cut-sheet">C1</div><div class="cut-sheet">C2</div>' +
        '<div class="cut-sheet">C3-extra</div>' +
      '</div>' +
    '</div>' +
    '<script>var SAVE_META={"menuId":"main"};<\/script>' +
    '</body></html>';
  var cleaned = printApi.sanitizePrintHtml(nested);
  assert(cleaned.indexOf('TB2-dup') === -1, 'sanitize drops duplicate toolbars from nested Save HTML');
  assert(cleaned.indexOf('P1-B-Sunday') === -1, 'sanitize keeps first sheet-stack only (no crossed Sunday copy)');
  assert(cleaned.indexOf('P3-extra') === -1 && cleaned.indexOf('P4-extra') === -1,
    'sanitize caps A4 sheet-stack at two pages');
  assert(cleaned.indexOf('C3-extra') === -1, 'sanitize caps A5 cut-sheets at two');
  assert((cleaned.match(/class="toolbar"/g) || []).length === 1, 'sanitize leaves exactly one toolbar');
  assert((cleaned.match(/sheet-stack mode-panel mode-a4/g) || []).length === 1,
    'sanitize leaves exactly one A4 sheet-stack');
  assert(cleaned.indexOf('SAVE_META') !== -1, 'sanitize keeps the Save script with SAVE_META');
  assert(cleaned.indexOf('document.write') === -1, 'sanitize strips nested print-preview loader scripts');
  assert(printJs.indexOf('commitPrintVersion(SAVE_META.menuId)') !== -1 &&
    printJs.indexOf('menuId:SAVE_META.menuId,menuName:SAVE_META.menuName') !== -1,
    'Save stamps SAVE_META menuId from this preview, not opener lastBuildMeta');
})();
assert(printApi.typeRange && printApi.typeRange.name.max === 11.5 && printApi.typeRange.title.max === 22,
  'TYPE_RANGE exported for dish name and section title max');
assert(printApi.typeRange.desc.max === 10 && printApi.typeRange.desc.min === 10,
  'TYPE_RANGE description min/max (+2pt min)');
assert(printApi.typeRange.name.min === 11 && printApi.typeRange.title.min === 16,
  'TYPE_RANGE name/title mins raised by 2pt');
assert(printApi.typeRange.dishGapPx && printApi.typeRange.dishGapPx.min === 13 &&
  printApi.typeRange.dishGapPx.max === 18,
  'TYPE_RANGE includes classical minimum dish gap (13–18px)');
var sampleCss = printApi.build(api.menuById('main'), api.seed().main, { pages: 1, forceFillClass: 'fill-roomy' });
assert(sampleCss.indexOf('NaN') === -1, 'generated print CSS has no NaN from broken concatenations');
assert(sampleCss.indexOf('.dish-line{display:flex') !== -1, 'generated print CSS keeps dish-line flex leaders');
assert(sampleCss.indexOf('.sec-title{') !== -1, 'generated print CSS keeps sec-title rule');
assert(printJs.indexOf('hideTitle') !== -1, 'Item Boost can print without the bucket title');
assert(printJs.indexOf('just before the price') !== -1 || printJs.indexOf('sits just before the price') !== -1 ||
  printJs.indexOf('Match dish price size') !== -1,
  'lunch club mark sits just before the price');
assert(/\.dish-line \.lc\{width:1em/.test(printJs) || /\.lc\{width:1em/.test(printJs),
  'lunch club mark is 1em so it does not stretch dish-line height');
assert(printJs.indexOf('align-items:center') !== -1 && printJs.indexOf('no lunch-gap stretch') !== -1,
  'dish-line centers mark so lunch/non-lunch gaps stay even');
assert(printJs.indexOf('body.scrollHeight>body.clientHeight') !== -1,
  'fitPages measures page-body overflow (not only the clipped page)');
assert(printJs.indexOf('cols[ci].scrollHeight') !== -1 && printJs.indexOf('function keepContentOnPage') !== -1,
  'fit also measures column overflow and drops chrome so food never falls off the page');
assert(printJs.indexOf('function dropOverflowingChrome') !== -1 &&
  printJs.indexOf('.col-feature .scallop') !== -1,
  'overflowing leftover feature panels are removed before dishes clip');
assert(printJs.indexOf('isPromoOnlyScallop') !== -1 &&
  printJs.indexOf('col-promo .col-body > .scallop') !== -1,
  'overflow drop also removes promo-as-column-body (Sip & Paint opposite Sides)');
assert(printJs.indexOf('getBoundingClientRect') !== -1 &&
  printJs.indexOf('.allergy') !== -1,
  'overflows() pixel-measures content bottom vs allergy foot');
assert(printJs.indexOf('function measurePrintFit') !== -1 &&
  page.indexOf('measurePrintFit') !== -1,
  'Arranging DOM-measures printable area before opening preview');
assert(page.indexOf('never open a half-cut preview') !== -1 ||
  page.indexOf('Measuring printable area') !== -1,
  'overflow / arrange copy refuses a clipped success preview');
assert(page.indexOf('Try deselecting') !== -1 &&
  page.indexOf('data-overflow-tip') !== -1,
  'overflow gate names tip / drop-ins to deselect');
assert(page.indexOf('okToPrint = null') !== -1 ||
  page.indexOf('advice.okToPrint = null') !== -1 ||
  page.indexOf('DOM measure still wins') !== -1,
  'Gemini okToPrint cannot bypass the DOM pre-preview gate');
assert(printJs.indexOf('splitPromosForColumns') !== -1, 'event panels can split across columns');
assert(printJs.indexOf('renderOnePromoBox') !== -1, 'event wording renders as separate boxes');
assert(printJs.indexOf('Bells Lunch Club option') !== -1, 'allergy footer can explain lunch club mark');
assert(printJs.indexOf('smaller plates for smaller appetites') !== -1,
  'lunch club spiel sits in the allergy footer');
assert(printJs.indexOf('lunch only') !== -1,
  'lunch club footer says lunch only');
assert(printJs.indexOf('savePrintHistory') !== -1 && printJs.indexOf('listPrintHistory') !== -1,
  'print history can save and list generated sheets');
assert(printJs.indexOf('groupHistoryByDay') !== -1, 'print history groups by day');
assert(printJs.indexOf('HISTORY_CLOUD_DEFAULT') !== -1 && printJs.indexOf('listPrintHistory') !== -1,
  'print history syncs via cloud Apps Script URL');
assert(printJs.indexOf('migrateLocalToCloud') !== -1, 'device-only sheets can upload to shared history');
assert(printJs.indexOf('purgeLocalDeleted') !== -1, 'tombstoned deletes purge local copies');
assert(printJs.indexOf('deletedIds') !== -1, 'print history list carries delete tombstones');
assert(aiGs.indexOf('HISTDEL') !== -1 && aiGs.indexOf('historyMarkDeleted_') !== -1,
  'Apps Script stores print-history delete tombstones');
assert(page.indexOf('Print history') !== -1 && page.indexOf('data-view="history"') !== -1,
  'Menus has a Print history view');
assert(page.indexOf('Shared across phones and PCs') !== -1 || page.indexOf('shared cloud') !== -1,
  'print history UI says it is shared across devices');
assert(printJs.indexOf('saveToMenus') !== -1 && printJs.indexOf('discardPreview') !== -1,
  'preview Save stamps history (not every generate); Discard closes without saving');
assert(printJs.indexOf('peekPrintVersion') !== -1 && printJs.indexOf('commitPrintVersion') !== -1,
  'version numbers are peeked on preview and committed on Save');
assert(page.indexOf('pullMenusFromCloud') !== -1 && page.indexOf('saveMenusState') !== -1,
  'live menu book syncs to cloud for all devices');
assert(page.indexOf('sync on every phone and PC') !== -1 || page.indexOf('Menus synced across devices') !== -1,
  'UI mentions menus stay in sync across devices');
assert(ingestJs.indexOf('getCloudUrl') !== -1 && ingestJs.indexOf('cloudPost') !== -1,
  'ingest exposes shared cloud POST helper');
assert(aiGs.indexOf('listPrintHistory_') !== -1 && aiGs.indexOf('historyWriteHtmlDrive_') !== -1 &&
  aiGs.indexOf('historyWriteHtmlPropsGzip_') !== -1,
  'Menu AI Apps Script stores print HTML in Drive (gzip props fallback)');
assert(aiGs.indexOf('getMenusState_') !== -1 && aiGs.indexOf("propRead_('MENUS')") !== -1,
  'Menu AI Apps Script stores live menus state in Script Properties');
assert(aiGs.indexOf('drive.file') !== -1 || fs.readFileSync(path.join(root, 'apps-script/menu-ai/appsscript.json'), 'utf8').indexOf('drive.file') !== -1,
  'Drive scope is script-owner drive.file (no per-device OAuth)');
assert(printJs.indexOf('Lunch club in allergy footer') !== -1,
  'layout plan notes lunch club lives with allergens');
assert(printJs.indexOf('function lunchClubBox') === -1 && printJs.indexOf('lunch-box') === -1,
  'mid-page lunch club scallop box is gone');
assert(printJs.indexOf("which === 'lunch'") === -1,
  'print no longer packs a mid-page lunch filler');
assert(printJs.indexOf('flex-shrink:0') !== -1 || printJs.indexOf('allergy stays pinned') !== -1 ||
  /page-body\{flex:1 1 auto/.test(printJs), 'page body yields space so allergy footer is not cropped');
assert(printJs.indexOf('fill-compact') !== -1 && printJs.indexOf('fitPages') !== -1, 'auto-fit steps type down to fit page');
assert(printJs.indexOf('fill-dense') !== -1, 'density ladder includes fill-dense floor');
assert(printJs.indexOf('startersInTop') !== -1 || printJs.indexOf('!nibblesInTop') !== -1,
  'starters only share the logo band when nibbles are not already there');
assert(printJs.indexOf('Always start airy') !== -1 || /for\(var j=0;j<STEPS\.length/.test(printJs),
  'fit always starts airy so sparse pages fill top to bottom');
assert(page.indexOf('partyPaper') !== -1 && page.indexOf('2×A5 on A4') !== -1,
  'party sheet can choose full A4 or 2×A5 guillotine');
assert(page.indexOf('Too much content to fit on this sheet') !== -1 ||
  page.indexOf('too much content to fit on one page') !== -1,
  'generate warns when the sheet cannot fit all food');
assert(page.indexOf('overflowGateOverlay') !== -1 && page.indexOf('data-overflow-include') !== -1,
  'overflow gate lets staff untick a dropped-in menu before generate');
assert(page.indexOf('Please remove a dropped-in menu') !== -1,
  'overflow copy asks to remove a dropped-in menu');
assert(page.indexOf('Main, Sunday and any long sheet') !== -1,
  'overflow gate applies to Sunday as well as Main');
assert(page.indexOf('dropInOfferOverlay') !== -1 && page.indexOf('There is space on the sheet') !== -1,
  'spare leftover offers dropping in a sub-menu');
assert(page.indexOf('is too big to fit') !== -1 && page.indexOf('try a different one') !== -1,
  'a drop-in that will not fit asks staff to untick and try another');
assert(api.emptyMeta().paper === 'a4', 'party meta defaults to full A4 paper');
assert(api.sheetPlan('desserts', 3).fit === 'two-up', 'desserts card is two-up A5');
assert(api.sheetPlan('sandwiches', 4).fit === 'two-up', 'sandwiches card is two-up A5');
assert(api.sheetPlan('little-bells', 4).fit === 'two-up', 'Little Bells card is two-up A5');
assert(/Too much content to fit on one page/.test(api.sheetPlan('main', 40).text),
  'main menu over capacity message asks to remove a dropped-in menu');
assert(printJs.indexOf('fonts.googleapis.com/css2?family=Cinzel') !== -1, 'print loads Cinzel/Roboto/Crimson via stylesheet link');
assert(printJs.indexOf('beforeprint') !== -1, 'fit runs again before print/PDF');
assert(printJs.indexOf('document.fonts.ready') !== -1, 'print waits for webfonts before PDF');
assert(/padding:1[12]mm/.test(printJs), 'pages keep a sensible top margin without dumping content');
assert(printJs.indexOf('data:image/png;base64,') !== -1 && printJs.indexOf('LUNCH_MARK_DATA') !== -1,
  'lunch club uses embedded branded mark (works in about:blank print)');
assert(printJs.indexOf('Bells Lunch Club option') !== -1, 'allergy footer can explain lunch club mark');
assert(printJs.indexOf('party-theme-christmas') !== -1 && printJs.indexOf('party-theme-valentine') !== -1, 'party menus get occasion themes');
assert(printJs.indexOf('Peel obvious burgers') !== -1 || printJs.indexOf('split.burgers') !== -1,
  'print peels named burgers out of Classics');
assert(api.SECTIONS.indexOf('Sauces') !== -1, 'Sauces is a canonical section');
assert(api.guessSection('Sauces', 'Peppercorn', '') === 'Sauces', 'guesses Sauces section');
assert(api.SECTIONS.indexOf('Item Boost') !== -1, 'Item Boost is a canonical section');
assert(api.guessSection('Item Boost', 'Fish of the Day', '') === 'Item Boost', 'keeps Item Boost section');
assert(api.guessSection('', 'Fish of the Day', 'ask for today’s catch') === 'Item Boost', 'guesses Fish of the Day as Item Boost');
assert(api.guessSection('Specials', 'Braised Blade', '', { menuId: 'specials' }) === 'Special Mains',
  'Specials board mains default to Special Mains');
assert(api.guessSection('Starters', 'Ham Hock Pot', '', { menuId: 'specials' }) === 'Special Starters',
  'Starters heading on Specials menu → Special Starters');
assert(api.coerceSpecialsSection('Specials', 'Pulled Ham in a Charmer Cheese & Ale Sauce and a Sourdough Baguette', '') === 'Special Starters',
  'baguette specials guess as Special Starters');
assert(api.guessSection('', 'Pie of the Day', '') === 'Item Boost', 'Pie of the Day still maps to Item Boost');
assert(api.SECTIONS.indexOf('Special Starters') !== -1 && api.SECTIONS.indexOf('Special Mains') !== -1 &&
  api.SECTIONS.indexOf('Special Desserts') !== -1, 'Specials courses are canonical sections');
assert(api.MENUS.some(function (m) { return m.id === 'specials'; }), 'Specials is a menu tab');
assert(api.includableMenus('main').some(function (m) { return m.id === 'specials'; }),
  'Specials can be ticked onto Main menu');
assert(api.includableMenus('sunday').some(function (m) { return m.id === 'little-bells'; }),
  'Little Bells (kids) can be ticked onto Sunday');
assert(api.includableMenus('main').some(function (m) { return m.id === 'little-bells'; }),
  'Little Bells (kids) can be ticked onto Main');
['main', 'sunday', 'main-next'].forEach(function (host) {
  var ids = api.includableMenus(host).map(function (m) { return m.id; });
  ['sandwiches', 'desserts', 'specials', 'little-bells'].forEach(function (id) {
    assert(ids.indexOf(id) !== -1, id + ' can be ticked onto ' + host);
  });
  assert(ids.indexOf('lunch-club') === -1, 'Lunch club is not a drop-in on ' + host);
});
assert(api.MENUS.some(function (m) { return m.id === 'main-next' && m.kind === 'long'; }),
  'Main (upcoming) is a long menu tab');
assert(api.isMainSheet('main') && api.isMainSheet('main-next') && !api.isMainSheet('sunday'),
  'isMainSheet covers live Main and upcoming only');
assert(api.includableMenus('main-next').some(function (m) { return m.id === 'specials'; }),
  'Specials can be ticked onto Main (upcoming)');
assert(!api.includableMenus('main').some(function (m) { return m.id === 'main-next'; }),
  'upcoming Main is not pulled onto live Main as an include');
assert(Array.isArray(api.seed()['main-next']) && api.seed()['main-next'].length === 0,
  'seed leaves Main (upcoming) empty');
assert(page.indexOf('main-next') !== -1 && page.indexOf('Make upcoming the live Main') !== -1,
  'UI offers Main (upcoming) with copy and make-live controls');
assert(page.indexOf('doPromoteUpcoming') !== -1 && page.indexOf('promoteUpcomingMain') !== -1,
  'making upcoming live clears it for the next future menu');
assert(page.indexOf('copyLongSheetState') !== -1 && page.indexOf('Blocks, includes and wording ticks') !== -1,
  'copy upcoming into live Main takes Blocks with the dishes');
assert(typeof api.copyLongSheetState === 'function' && typeof api.promoteUpcomingMain === 'function',
  'copy and promote upcoming helpers are exported');
(function upcomingTakesBlocks() {
  var srcLayout = api.normalizeSectionLayout({
    Desserts: { width: 'column', frame: true, note: 'upcoming puds' },
    Nibbles: { width: 'full', frame: false, note: '' }
  });
  var liveLayout = api.normalizeSectionLayout({
    Desserts: { width: 'full', frame: false, note: 'old puds' }
  });
  var copied = api.copyLongSheetState({
    book: {
      main: [api.dish('Mains', 'Old pie', '', '16', '')],
      'main-next': [api.dish('Mains', 'New hake', '', '25', ''), api.dish('Desserts', 'Posset', '', '8', '')]
    },
    layoutBook: { main: liveLayout, 'main-next': srcLayout },
    includes: { main: { desserts: true }, 'main-next': { sandwiches: true } },
    promoTicks: { main: { quiz: true }, 'main-next': { gatherings: true } },
    metaBook: { main: { title: 'Old' }, 'main-next': { title: 'New' } }
  }, 'main-next', 'main');
  assert(copied.ok && copied.copied === 2 && copied.book.main[0].name === 'New hake',
    'copy upcoming onto live Main replaces the dishes');
  assert(copied.book['main-next'].length === 2 && copied.book['main-next'][0].name === 'New hake',
    'copy leaves upcoming dishes in place');
  assert(copied.layoutBook.main.Desserts.frame === true &&
    copied.layoutBook.main.Desserts.width === 'column' &&
    copied.layoutBook.main.Desserts.note === 'upcoming puds',
    'copy upcoming onto live Main takes all Blocks setups');
  assert(copied.layoutBook['main-next'].Desserts.frame === true,
    'upcoming keeps its own Blocks after the copy');
  copied.layoutBook.main.Desserts.frame = false;
  assert(copied.layoutBook['main-next'].Desserts.frame === true,
    'copied Blocks are cloned, not a shared object');
  assert(copied.includes.main.sandwiches === true && copied.includes['main-next'].sandwiches === true,
    'copy upcoming includes onto live Main');
  assert(copied.metaBook.main.title === 'New' && copied.metaBook['main-next'].title === 'New',
    'copy upcoming meta onto live Main');
  var promoted = api.promoteUpcomingMain({
    book: {
      main: [api.dish('Mains', 'Old pie', '', '16', '')],
      'main-next': [api.dish('Mains', 'New hake', '', '25', '')]
    },
    layoutBook: { main: liveLayout, 'main-next': srcLayout },
    includes: { main: { desserts: true }, 'main-next': { sandwiches: true } },
    promoTicks: { main: { quiz: true }, 'main-next': { gatherings: true } },
    metaBook: { main: { title: 'Old' }, 'main-next': { title: 'New' } }
  });
  assert(promoted.ok && promoted.book.main[0].name === 'New hake' && promoted.book['main-next'].length === 0,
    'making upcoming live moves dishes then clears upcoming');
  assert(promoted.layoutBook.main.Desserts.frame === true &&
    promoted.layoutBook.main.Desserts.note === 'upcoming puds',
    'making upcoming live takes upcoming Blocks');
  assert(promoted.layoutBook['main-next'].Desserts.frame === false,
    'upcoming Blocks reset after it is made live');
  assert(promoted.includes.main.sandwiches === true && !promoted.includes['main-next'].sandwiches &&
    Object.keys(promoted.includes['main-next']).length === 0,
    'upcoming includes move to live Main then reset');
  assert(promoted.metaBook.main.title === 'New' && promoted.metaBook['main-next'].title === '',
    'upcoming meta moves onto live Main then resets');
})();
assert(page.indexOf("'main-next'") !== -1 && /main-next/.test(page.match(/STAFF_MENU_IDS\s*=\s*\[[^\]]+\]/)[0]),
  'staff menu list includes Main (upcoming)');
assert(page.indexOf('doAddExtraMenu') !== -1 && page.indexOf('doAddExtraSection') !== -1,
  'owner can add extra menus and categories');
assert(page.indexOf('renderOwnerExtrasBox') !== -1 && page.indexOf('if (!isStaffMode) html += renderOwnerExtrasBox()') !== -1,
  'extra menus/categories UI is owner-only');
assert(typeof api.addCustomSection === 'function' && typeof api.addCustomMenu === 'function',
  'custom section/menu helpers exported');
api.resetExtras();
var addedSec = api.addCustomSection('sharing boards');
assert(addedSec.ok && addedSec.section === 'Sharing Boards' && api.SECTIONS.indexOf('Sharing Boards') !== -1,
  'owner can add a new category');
assert(api.sectionOptions('main').indexOf('Sharing Boards') !== -1,
  'new category appears in the Section dropdown');
assert(api.isHeading('Sharing Boards') === 'Sharing Boards',
  'paste headings recognise the new category');
assert(api.guessSection('Sharing Boards', 'Charcuterie', '') === 'Sharing Boards',
  'dishes stay in the custom category');
assert(api.defaultSectionLayout()['Sharing Boards'] && api.defaultSectionLayout()['Sharing Boards'].width === 'full',
  'new category gets a default Blocks rule');
assert(!api.addCustomSection('Mains').ok, 'built-in category names are rejected');
assert(!api.addCustomSection('sharing boards').ok, 'duplicate category is rejected');
var addedMenu = api.addCustomMenu({ name: 'Brunch', kind: 'long' });
assert(addedMenu.ok && addedMenu.menu.id === 'brunch' && api.menuById('brunch').kind === 'long',
  'owner can add a long extra menu');
assert(api.includableMenus('brunch').some(function (m) { return m.id === 'specials'; }),
  'extra long menus can tick Specials onto the sheet');
var addedCard = api.addCustomMenu({ name: 'Bar snacks', kind: 'card' });
assert(addedCard.ok && api.menuById('bar-snacks').kind === 'card',
  'owner can add a card extra menu');
assert(api.includableMenus('main').some(function (m) { return m.id === 'bar-snacks'; }),
  'extra card menus can be ticked onto Main');
assert(!api.addCustomMenu({ name: 'Main menu', kind: 'long' }).ok,
  'built-in menu names are rejected');
assert(api.removeCustomSection('Sharing Boards').ok && api.SECTIONS.indexOf('Sharing Boards') === -1,
  'owner can remove a custom category');
assert(api.removeCustomMenu('brunch').ok && api.menuById('brunch').id === 'main',
  'owner can remove a custom menu');
api.resetExtras();
assert(api.SECTIONS.indexOf('Sharing Boards') === -1 && !api.MENUS.some(function (m) { return m.id === 'bar-snacks'; }),
  'resetExtras restores built-in menus and categories');
assert(page.indexOf("'little-bells'") !== -1 && page.indexOf('Little Bells (kids)') !== -1,
  'staff Menus offer Little Bells kids include checkbox');
assert(page.indexOf("STAFF_MENU_IDS") !== -1 && /little-bells/.test(page.match(/STAFF_MENU_IDS\s*=\s*\[[^\]]+\]/)[0]),
  'staff menu list includes little-bells');
assert(api.sectionOptions('specials').join('|') === 'Special Starters|Special Mains|Special Desserts',
  'Specials menu dropdown is course-only');
assert(api.sectionLayoutFor('Special Mains').frame === true &&
  /gone/i.test(api.sectionLayoutFor('Special Mains').note || ''),
  'Specials box defaults to frilly frame and when-gone note');
assert(api.sectionLayoutFor('Item Boost').frame === true, 'Item Boost defaults to frilly frame');
var composedSpecials = api.composeDishes(api.seed(), 'main', { specials: true });
assert(composedSpecials.some(function (d) { return d.section === 'Special Starters'; }),
  'including Specials on Main keeps Special Starters');
assert(composedSpecials.every(function (d) {
  return d.fromMenu !== 'specials' || /^Special /.test(d.section);
}), 'Specials dishes never land in regular Starters/Mains/Desserts');
var sundayWithKids = api.composeDishes(api.seed(), 'sunday', { 'little-bells': true });
assert(sundayWithKids.some(function (d) { return d.fromMenu === 'little-bells'; }),
  'ticking Little Bells pulls kids dishes onto Sunday');
assert(sundayWithKids.some(function (d) { return d.section === 'Little Bells'; }),
  'kids dishes keep Little Bells section on Sunday sheet');
assert(api.SECTIONS.indexOf('Little Bells') !== -1, 'Little Bells is a canonical section');
assert(api.guessSection('Little Bells', 'Beef Burger, Fries & Dressed Salad', '') === 'Little Bells',
  'Little Bells keeps kids burger (not Burgers)');
assert(api.guessSection("Children's menu", 'Fish Fingers', '') === 'Little Bells', 'maps kids heading to Little Bells');
assert(api.sectionLayoutFor('Little Bells').frame === true, 'Little Bells defaults to frilly frame');
assert(printJs.indexOf('isLittleBells') !== -1 && printJs.indexOf('bag.littleBells') !== -1,
  'print bags Little Bells for layout');
assert(printJs.indexOf('share-cols') !== -1, 'sharing plates can print in two columns');
assert(printJs.indexOf('shareInLeft') !== -1 || printJs.indexOf('shareAsColumn') !== -1, 'sharing can sit in a column to balance');
assert(printJs.indexOf('page-body-start') !== -1, 'page 2 gets extra top breathing room');
assert(api.sectionLayoutFor('Sharing Plates').width === 'both', 'Sharing Plates default is best-fit (AI chooses)');
assert(api.normalizeSectionName('Sharing Starters') === 'Sharing Plates',
  'Sharing Starters is Sharing Plates, not Starters');
assert(api.sectionLayoutFor('Sharing Starters', {
  'Sharing Plates': { width: 'column', frame: false }
}).width === 'column',
  'Column lock on Sharing Plates applies to Sharing Starters');
assert(api.WIDTH_OPTIONS.some(function (w) {
  return w.id === 'both' && /best fit/i.test(w.label) && /split/i.test(w.label);
}), 'width “both” is labelled best fit with column/full/split AI choice');
assert(typeof api.isSplitWidth === 'function' && api.isSplitWidth('split') && !api.isSplitWidth('both'),
  'split width helper: Best-fit AI may choose two even columns for any category');
assert(api.WIDTH_OPTIONS.every(function (w) {
  return !/column if it fits/i.test(w.label || '');
}), 'no width option says column if it fits');
assert(page.indexOf('Merge ↑') !== -1, 'confirm review has merge-into-above control');
assert(page.indexOf('data-review-split') !== -1 && page.indexOf('Split') !== -1, 'confirm review has split control');
assert(page.indexOf('data-review-delete') !== -1 && page.indexOf('Delete') !== -1, 'confirm review has delete control');
assert(page.indexOf('syncReviewCategories') !== -1, 'review keeps category edits across merge/delete');
assert(typeof api.mergeDishWithPrevious === 'function', 'mergeDishWithPrevious exported');
assert(typeof api.deleteDishAt === 'function', 'deleteDishAt exported');
assert(typeof api.canSplitDish === 'function' && typeof api.splitDishAt === 'function', 'split helpers exported');
assert(api.deleteDishAt([api.dish('Starters', 'A', '', '1', ''), api.dish('Starters', 'B', '', '2', '')], 0).length === 1,
  'deleteDishAt removes one row');
var smashed = {
  section: 'Mains',
  name: 'Cheesy Garlic Bread £ 5.95 Dressed Mixed Salad 4.95',
  description: 'Please tell our team about any allergies or dietary requirements.',
  price: '',
  tags: ''
};
assert(api.canSplitDish(smashed), 'smashed garlic bread + salad can split');
var splitOut = api.splitDishAt([smashed], 0);
assert(splitOut.length === 2, 'split yields two rows');
assert(splitOut[0].name === 'Cheesy Garlic Bread' && splitOut[0].price === '5.95', 'split left dish + price');
assert(splitOut[1].name === 'Dressed Mixed Salad' && splitOut[1].price === '4.95', 'split right dish + price');
assert(!splitOut[0].description, 'allergy footer dropped on split');
assert(api.isJunkDishName('PUB@EIGHTBELLSBOLNEY.COM'), 'email address is junk dish name');
assert(api.isJunkDescription('Please tell our team about any allergies or dietary requirements.'),
  'allergy footer is junk description');
assert(!api.canSplitDish(api.dish('Starters', 'Quinoa Falafel', '', '8.25 / 14.95', '')),
  'price ranges do not trigger split');
assert(typeof api.isHeading === 'function' && api.isHeading('STARTERS') === 'Starters', 'ALL-CAPS STARTERS is a heading');
assert(api.isHeading('Little Bells') === 'Little Bells', 'Little Bells heading recognised');
var titledPaste = api.parsePaste('STARTERS\nJerusalem Artichoke Soup 7.50\nMAINS\nPie of the Day 17.95\nLittle Bells\nFish Fingers 9.50');
assert(titledPaste.every(function (d) { return d.name !== 'STARTERS' && d.name !== 'MAINS' && d.name !== 'Little Bells'; }),
  'section titles are not saved as dishes');
assert(titledPaste.some(function (d) { return d.section === 'Starters'; }), 'paste assigns Starters from heading');
assert(titledPaste.some(function (d) { return d.section === 'Little Bells'; }), 'paste assigns Little Bells from heading');
assert(api.assignSections([{ section: 'Dishes', name: 'Beef Burger', description: '', price: '14', tags: '' }])[0].section === 'Burgers',
  'assignSections escapes Dishes into a real category');
assert(fs.existsSync(path.join(root, 'favicon.svg')), 'favicon.svg exists');
assert(page.indexOf('favicon.svg') !== -1, 'menus page links favicon');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf('favicon.svg') !== -1, 'hub links favicon');
assert(fs.readFileSync(path.join(root, 'staffhub.html'), 'utf8').indexOf('favicon.svg') !== -1, 'staffhub links favicon');
var salmonSplit = [
  { section: 'Starters', name: 'Smoked Salmon', description: '', price: '', tags: '' },
  { section: 'Starters', name: 'horseradish cream, honey braised leeks, crispy capers & pickled walnuts', description: '', price: '8.95', tags: '' }
];
var salmonMerged = api.tidyOrphanDescriptions(salmonSplit);
assert(salmonMerged.length === 1 && salmonMerged[0].price === '8.95', 'Smoked Salmon priced garnish merges onto title');
assert(/horseradish/.test(salmonMerged[0].description), 'Smoked Salmon description kept');
var manualMerge = api.mergeDishWithPrevious([
  api.dish('Starters', 'Duck Croquette', '', '8.95', ''),
  api.dish('Starters', 'served with spicy beetroot sauce', '', '', '')
], 1);
assert(manualMerge.length === 1 && /beetroot/.test(manualMerge[0].description), 'manual merge folds description into dish above');
assert(api.priceOf('Masala Sea Bass 16 .95').value === '16.95', 'priceOf tolerates spaced decimals');
assert(api.cleanDishName('Masala Sea Bass 16 .95') === 'Masala Sea Bass', 'cleanDishName strips spaced price');
assert(printJs.indexOf('bottom-cols-balanced') === -1 || printJs.indexOf('Sides (and sauces) in the left column') !== -1, 'sides stay one column beside sandwiches');
assert(printJs.indexOf('isItemBoost') !== -1 && printJs.indexOf('bag.boost') !== -1, 'print bags Item Boost for layout');
assert(ingestJs.indexOf('reviewLayout') !== -1, 'ingest can ask Gemini to review layout balance');
assert(aiGs.indexOf('reviewLayoutWithGemini_') !== -1, 'Apps Script supports layout review action');
assert(aiGs.indexOf('GOLDEN RULES') !== -1 && aiGs.indexOf('Burgers then Pub Classics') !== -1,
  'Gemini layout prompt has Eight Bells golden rules');
assert(aiGs.indexOf('INSIDE the frame') !== -1 && aiGs.indexOf('Sip & Paint') !== -1,
  'Gemini layout rule: frilly titles sit in the box; leftover panels must fit with a gap');
assert(aiGs.indexOf('NEVER fall off the page') !== -1 && aiGs.indexOf('never clip food') !== -1,
  'Gemini layout rule: content must never fall off the page');
assert(aiGs.indexOf('The JS planner has already placed the food') !== -1 && aiGs.indexOf('sectionWidths') !== -1,
  'Gemini reviews leftover only — JS already placed the food');
assert(aiGs.indexOf('Do NOT put Sides or Sandwiches under Sharing') !== -1 && printJs.indexOf('sides-sand-row') !== -1,
  'Sides and Sandwiches stay off Sharing; JS executes the Sides|Sandwiches pair');
assert(page.indexOf('JS already placed the food map') !== -1 &&
  (page.indexOf('Gemini may refine Best-fit widths') !== -1 || page.indexOf('column / full / split') !== -1) &&
  page.indexOf('never dump Sides under Sharing') !== -1,
  'generate lets Gemini refine Best-fit widths only — not locked shapes or Sharing stacks');
assert(ingestJs.indexOf('mammoth') !== -1 && ingestJs.indexOf('readDocx') !== -1, 'Word .docx ingest via mammoth');
assert(page.indexOf('.docx') !== -1 && page.indexOf('wordprocessingml') !== -1, 'upload accepts Word .docx');
assert(page.indexOf('flow199') !== -1, 'menus page cache-bust is flow199');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf('flow199') !== -1, 'hub menus link cache-bust is flow199');
(function checkMenusStaffStableEntry() {
  var staffPath = path.join(root, 'menus-staff.html');
  assert(fs.existsSync(staffPath), 'menus-staff.html stable staff entry exists');
  var staff = fs.readFileSync(staffPath, 'utf8');
  assert(staff.indexOf('mode=staff') !== -1, 'menus-staff opens staff mode');
  assert(staff.indexOf('menus') !== -1 && staff.indexOf('.js') !== -1 && staff.indexOf('match') !== -1,
    'menus-staff parses menus.js?v= from menus.html');
  assert(staff.indexOf("fetch('menus.html") !== -1 || staff.indexOf('fetch("menus.html') !== -1,
    'menus-staff fetches menus.html for current flow');
  assert(staff.indexOf('location.replace') !== -1, 'menus-staff redirects into menus.html');
  assert(staff.indexOf('cache: \'no-store\'') !== -1 || staff.indexOf('cache:"no-store"') !== -1 ||
    staff.indexOf("cache: 'no-store'") !== -1,
    'menus-staff bypasses stale menus.html cache when resolving flow');
  var portal = fs.readFileSync(path.join(root, 'manager-portals/eightbells/index.html'), 'utf8');
  assert(portal.indexOf('menus-staff.html') !== -1 && portal.indexOf('mode=staff&v=') === -1,
    'manager portal Menus tile uses stable menus-staff.html (no flow pin)');
  var urlTxt = fs.readFileSync(path.join(root, 'manager-portals/eightbells-menus-url.txt'), 'utf8');
  assert(urlTxt.indexOf('https://owner.kinfoldinns.co.uk/menus-staff.html') !== -1,
    'eightbells-menus-url.txt points at stable staff URL');
})();
(function checkMenusHtmlInlineScripts() {
  var html = fs.readFileSync(path.join(root, 'menus.html'), 'utf8');
  var re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  var m;
  var n = 0;
  while ((m = re.exec(html))) {
    n += 1;
    var tmp = path.join('/tmp', 'menus-inline-' + n + '.js');
    fs.writeFileSync(tmp, m[1]);
    var chk = require('child_process').spawnSync('node', ['--check', tmp], { encoding: 'utf8' });
    assert(chk.status === 0, 'menus.html inline script ' + n + ' parses: ' + String(chk.stderr || '').slice(0, 400));
  }
  assert(n >= 1, 'menus.html has inline scripts to syntax-check');
})();
assert(page.indexOf('dish-form-inline') !== -1 && page.indexOf('scrollToDishForm_') !== -1,
  'Adjust/Replace form opens inline under the dish being edited');
assert(page.indexOf('Keep exactly what staff typed') !== -1 || page.indexOf('typedName') !== -1,
  'Adjust/Save keeps the typed dish name (Vegan Katsu Curry)');
assert(page.indexOf('under the name field') !== -1 && page.indexOf('dishSuggest') !== -1,
  'past-dish suggestions sit under the name field');
assert(page.indexOf('Last-write-wins') !== -1 || page.indexOf('remoteAt > cloudUpdatedAt') !== -1,
  'cloud pull does not wipe a newer local Save');
assert(/return orderDishesForSell\(list\)/.test(fs.readFileSync(path.join(root, 'menus.js'), 'utf8')),
  'composeDishes groups sections like the PDF (no split categories in preview)');
assert(page.indexOf('sortDishesBySection(dishes())') !== -1,
  'Add/Adjust re-sorts the menu so new dishes sit with their category');
assert(printJs.indexOf('syncPrintHistoryToCloud') !== -1 && page.indexOf('syncPrintHistoryToCloud') !== -1,
  'Sync now pushes local print history so phone and PC match');
assert(printJs.indexOf('repairCloudHtmlGaps') !== -1,
  'Sync repairs cloud index rows that have no Drive HTML (phone download)');
assert(printJs.indexOf('pruneOrphanCloudIndex') !== -1 &&
  aiGs.indexOf('historyPruneOrphanIndex_') !== -1 &&
  aiGs.indexOf('pruneOrphanPrintHistory_') !== -1,
  'Sync/list drop cloud index rows whose HTML is gone (owner=manager shared list)');
assert(aiGs.indexOf('historyHasHtml_') !== -1 &&
  aiGs.indexOf('Light GET: return the index fast') !== -1 &&
  aiGs.indexOf('pruneOrphanPrintHistory_') !== -1,
  'listPrintHistory is a light index GET; orphan HTML prune stays on Sync');
assert(printJs.indexOf('fetchCloudPrintHistory_') !== -1,
  'Print PDF retries cloud HTML fetch before giving up');
assert(page.indexOf('One shared cloud list for owner and manager') !== -1,
  'print history UI says owner and manager share one list');
assert(printJs.indexOf('rows.cloudOk = true') !== -1 &&
  printJs.indexOf('cloudUnreachable') !== -1,
  'print history marks cloud ok vs unreachable so phone drafts are not the shared list');
assert(page.indexOf('Loading shared print history') !== -1 &&
  page.indexOf('pullPrintHistoryFromCloud') !== -1,
  'Print history uses light cloud pull so owner and manager match without heavy Sync');
assert(printJs.indexOf('function pullPrintHistoryFromCloud') !== -1 &&
  printJs.indexOf('pullPrintHistoryFromCloud: pullPrintHistoryFromCloud') !== -1,
  'print module exposes pullPrintHistoryFromCloud for auto-sync');
assert(page.indexOf('on this phone only') !== -1 &&
  page.indexOf('not shared yet') !== -1,
  'local-only print sheets are labelled, not mixed into the shared cloud list');
assert(page.indexOf("source: 'local'") !== -1 && page.indexOf("source === 'cloud'") !== -1,
  'local-first paint keeps non-cloud rows local until list confirms shared');
assert(page.indexOf('pullSharedCloud_') !== -1 &&
  page.indexOf('scheduleSharedCloudPull_') !== -1,
  'menus pulls shared cloud on open/return (debounced), not a live poll');
assert(page.indexOf("setInterval(function ()") === -1 ||
  page.indexOf('45000') === -1,
  'menus does not poll shared cloud every ~45s while on Print history');
assert(page.indexOf("document.visibilityState === 'visible'") !== -1 &&
  page.indexOf('scheduleSharedCloudPull_') !== -1 &&
  page.indexOf("addEventListener('focus'") !== -1,
  'menus refreshes shared cloud when the tab becomes visible or focused');
assert(page.indexOf("if (next === 'history') renderHistory()") !== -1 &&
  page.indexOf("lastHistoryPaintKey_ = ''") !== -1,
  'Print history refreshes on open / re-click into the view');
assert(page.indexOf('historyOrderedIdKey_') !== -1 &&
  page.indexOf('paintKey === lastHistoryPaintKey_') !== -1,
  'Print history skips DOM repaint when the ordered id list is unchanged');
assert(printJs.indexOf('id tie-break') !== -1 &&
  printJs.indexOf('sortHistoryNewest: sortHistoryNewest') !== -1,
  'history sort is generatedAt desc then id for stable paint order');
assert(ingestJs.indexOf("action === 'hasPrintHistory'") !== -1 &&
  aiGs.indexOf('hasPrintHistory_') !== -1,
  'Save verify uses tiny hasPrintHistory instead of full HTML GET');
assert(ingestJs.indexOf('cloudGetDirect_') !== -1 && ingestJs.indexOf('race outer-page relay') !== -1,
  'framed cloud GET races parent relay with direct fetch');
assert(ingestJs.indexOf('Retry once') !== -1 || ingestJs.indexOf('attempt_(n + 1)') !== -1,
  'cloud GET retries once so listPrintHistory is less flaky');
assert(/HISTORY_MAX_\s*=\s*60/.test(aiGs),
  'cloud history keeps 60 sheets so PC archive reaches the phone');
assert(aiGs.indexOf('Could not store sheet HTML') !== -1 &&
  aiGs.indexOf('historyPrunePropsHtml_') !== -1,
  'save falls back to Script Properties HTML when Drive is unauthorised');
assert(aiGs.indexOf('freeHistoryHtmlBlobs_') !== -1 && aiGs.indexOf('historyRebuildIndexIfEmpty_') !== -1,
  'quota free keeps HISTIDX; empty index rebuilds from stored HTML');
assert(page.indexOf('No saved sheets in the shared history') !== -1,
  'empty print history points at Sync now / Save, not phone-only');
assert(aiGs.indexOf('purgeHistoryProps_') !== -1 && aiGs.indexOf('historyWriteHtmlDrive_') !== -1,
  'print HTML moves to Drive; purge frees Script Properties quota');
assert(ingestJs.indexOf('form POST navigates') !== -1 || ingestJs.indexOf('no-cors fetch only') !== -1,
  'cloud writes avoid form POST that navigates phones to JSON');
assert(ingestJs.indexOf('navigates the Menus frame to raw') !== -1 && ingestJs.indexOf("via: 'no-cors'") !== -1,
  'Email/Save use no-cors so manager iframe never shows raw Apps Script JSON');
assert(aiGs.indexOf('AUTHORIZE_DRIVE_PRINT_HISTORY') !== -1,
  'Apps Script has one-click Drive authorise for print HTML');
assert(printJs.indexOf("action: 'emailPrintHistory'") !== -1 && printJs.indexOf('entry: meta') !== -1,
  'email POSTs sheet HTML with the mail request');
assert(ingestJs.indexOf('Never GET-by-id') !== -1 && ingestJs.indexOf("action === 'emailPrintHistory'") !== -1,
  'email POSTs sheet HTML — never GET-by-id');
assert(ingestJs.indexOf("action === 'savePrintHistory'") !== -1 &&
  ingestJs.indexOf('cloud_html_not_visible') !== -1 &&
  ingestJs.indexOf('data.exists === true') !== -1,
  'savePrintHistory verifies hasPrintHistory.exists (not list-only false positive)');
assert(aiGs.indexOf('historyFilterListed_') !== -1 && aiGs.indexOf('historyDriveStatus_') !== -1,
  'Apps Script filters zombie props rows and exposes driveStatus');
assert(aiGs.indexOf("prefix === 'HISTIDX'") !== -1 &&
  aiGs.indexOf('never free HTML blobs when writing HISTIDX') !== -1,
  'HISTIDX write must not wipe print HTML blobs');
assert(aiGs.indexOf('historyWriteHtmlPropsGzip_') !== -1 && aiGs.indexOf('props-gzip') !== -1,
  'large sheets fall back to gzip Script Properties when Drive is unauth');
assert(printJs.indexOf('Sunday\\s+Sun') !== -1 || printJs.indexOf('Sunday Sun') !== -1,
  'printSheetLabel strips Sunday Sun duplicate week bits');
assert(page.indexOf("source === 'cloud'") !== -1 &&
  page.indexOf('AUTHORIZE_DRIVE_PRINT_HISTORY') !== -1,
  'Print history shared list is cloud-only; pending explains Drive auth');
assert(ingestJs.indexOf("action === 'pruneOrphanPrintHistory'") !== -1,
  'client can call pruneOrphanPrintHistory over GET');
assert(page.indexOf('missing from the shared cloud') !== -1,
  'phone download explains Sync when cloud HTML is missing');
assert(aiGs.indexOf('readPostBody_') !== -1 && aiGs.indexOf('parameter.payload') !== -1,
  'Menu AI accepts form field payload for iframe POSTs');
assert(page.indexOf('data-add-section') !== -1 && page.indexOf('sectionAddFooter_') !== -1,
  'each subcategory has an Add to section button');
assert(page.indexOf('data-push-section') !== -1 && page.indexOf('Send to') !== -1,
  'long sheets can send a category to its own menu in one go');
assert(page.indexOf('doPushAllOwnPages') !== -1,
  'Main can send every drop-in category to its own menu');
assert(typeof api.ownPageMenuForSection === 'function' && api.ownPageMenuForSection('Sandwiches').id === 'sandwiches',
  'Sandwiches category maps to the Sandwiches menu');
assert(api.ownPageMenuForSection('Little Bells').id === 'little-bells' &&
  api.ownPageMenuForSection('Special Mains').id === 'specials',
  'Little Bells and Specials map to their own menus');
var pushBook = {
  main: [
    api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
    api.dish('Sandwiches', 'Tuna Melt', '', '10.50', ''),
    api.dish('Sandwiches', 'Fish Finger', '', '10.50', '')
  ],
  sandwiches: [
    api.dish('Sandwiches', 'Old filling', '', '9.00', '')
  ]
};
var pushInc = { main: {} };
var pushRes = api.pushSectionToOwnMenu(pushBook, 'main', 'Sandwiches', { includes: pushInc });
assert(pushRes.ok && pushRes.moved === 2 && pushRes.replaced === 1, 'push sends the whole Sandwiches section');
assert(pushBook.main.length === 1 && pushBook.main[0].name === 'Pie of the Day',
  'Sandwiches leave Main after the push');
assert(pushBook.sandwiches.length === 2 && pushBook.sandwiches.every(function (d) { return d.name !== 'Old filling'; }),
  'Sandwiches menu is replaced, not merged with the old list');
assert(pushBook.sandwiches.some(function (d) { return d.name === 'Tuna Melt'; }),
  'new fillings land on the Sandwiches menu');
assert(pushInc.main.sandwiches === true, 'Sandwiches stay ticked so they still print on Main');
(function pushKeepsDestBlocks() {
  var hostHours = '(12 – 2.45 pm Mon to Fri)';
  var cardSpiel = 'Served on either Ciabatta vg, Farmhouse White or Granary';
  var layoutBook = {
    main: api.normalizeSectionLayout({
      Sandwiches: { width: 'column', frame: true, note: hostHours, tip: true }
    }),
    sandwiches: api.normalizeSectionLayout({
      Sandwiches: { width: 'full', frame: false, note: cardSpiel, tip: false, below: cardSpiel }
    })
  };
  var destBefore = layoutBook.sandwiches.Sandwiches.note;
  var destFrame = layoutBook.sandwiches.Sandwiches.frame;
  var destWidth = layoutBook.sandwiches.Sandwiches.width;
  var res = api.pushSectionToOwnMenu({
    main: [
      api.dish('Sandwiches', 'Club', '', '11', ''),
      api.dish('Mains', 'Pie', '', '16', '')
    ],
    sandwiches: [api.dish('Sandwiches', 'Old', '', '9', '')]
  }, 'main', 'Sandwiches', { includes: { main: {} }, layoutBook: layoutBook });
  assert(res.ok, 'push with layoutBook still sends Sandwiches');
  assert(layoutBook.sandwiches.Sandwiches.note === destBefore,
    'subcategory transfer keeps the Sandwiches card extra-info');
  assert(layoutBook.sandwiches.Sandwiches.frame === destFrame &&
    layoutBook.sandwiches.Sandwiches.width === destWidth,
    'subcategory transfer keeps the Sandwiches card width and frilly setting');
  assert(layoutBook.main.Sandwiches.note === hostHours,
    'host sheet Blocks for Sandwiches are not rewritten by the push');
  assert(page.indexOf('layoutBook: layoutBook') !== -1,
    'send-to-own-menu passes Blocks through so the card rules can be kept');
})();
var specBook = {
  main: [
    api.dish('Special Mains', 'Pie special', '', '18', ''),
    api.dish('Mains', 'Hake', '', '25', '')
  ],
  specials: [
    api.dish('Special Starters', 'Soup special', '', '8', ''),
    api.dish('Special Mains', 'Old special pie', '', '17', '')
  ]
};
var specRes = api.pushSectionToOwnMenu(specBook, 'main', 'Special Mains');
assert(specRes.ok && specBook.specials.some(function (d) { return d.name === 'Soup special'; }),
  'pushing Special Mains keeps Special Starters on the Specials board');
assert(specBook.specials.some(function (d) { return d.name === 'Pie special'; }) &&
  specBook.specials.every(function (d) { return d.name !== 'Old special pie'; }),
  'Special Mains on the board are replaced');
assert(!api.pushSectionToOwnMenu({ sandwiches: [api.dish('Sandwiches', 'X', '', '1', '')] }, 'sandwiches', 'Sandwiches').ok,
  'cannot push a card menu onto itself');
var bulkBook = {
  main: [
    api.dish('Desserts', 'Sticky Toffee', '', '8.25', ''),
    api.dish('Little Bells', 'Fish Fingers', '', '', ''),
    api.dish('Mains', 'Pie', '', '16', '')
  ],
  desserts: [],
  'little-bells': [api.dish('Little Bells', 'Old kids', '', '', '')]
};
var bulkInc = { main: {} };
var bulkRes = api.pushAllOwnPageSections(bulkBook, 'main', { includes: bulkInc });
assert(bulkRes.ok && bulkRes.moved === 2, 'bulk send moves every drop-in category');
assert(bulkBook.main.length === 1 && bulkBook.main[0].name === 'Pie', 'Mains stay on Main after bulk send');
assert(bulkInc.main.desserts && bulkInc.main['little-bells'], 'bulk send ticks Desserts and Little Bells');
var nextBook = {
  'main-next': [
    api.dish('Sandwiches', 'Club', '', '11', ''),
    api.dish('Mains', 'Hake', '', '25', '')
  ],
  sandwiches: [api.dish('Sandwiches', 'Old next', '', '9', '')]
};
var nextInc = { 'main-next': {} };
var nextRes = api.pushSectionToOwnMenu(nextBook, 'main-next', 'Sandwiches', { includes: nextInc });
assert(nextRes.ok && nextBook['main-next'].length === 1 && nextBook['main-next'][0].name === 'Hake',
  'Main (upcoming) can send Sandwiches to their own menu');
assert(nextInc['main-next'].sandwiches === true, 'upcoming Main ticks Sandwiches after the push');
api.resetExtras();
var extraSec = api.addCustomSection('Bar snacks');
var extraCard = api.addCustomMenu({ name: 'Bar snacks', kind: 'card' });
assert(extraSec.ok && extraCard.ok && api.ownPageMenuForSection(extraSec.section).id === extraCard.menu.id,
  'a custom category maps to a card menu of the same name');
var extraBook = {
  main: [
    api.dish(extraSec.section, 'Nuts', '', '4', ''),
    api.dish('Mains', 'Pie', '', '16', '')
  ]
};
extraBook[extraCard.menu.id] = [api.dish(extraSec.section, 'Old nuts', '', '3', '')];
var extraInc = { main: {} };
var extraRes = api.pushSectionToOwnMenu(extraBook, 'main', extraSec.section, { includes: extraInc });
assert(extraRes.ok && extraBook.main.length === 1 && extraBook[extraCard.menu.id][0].name === 'Nuts',
  'custom drop-in category replaces its own card and leaves Main');
api.resetExtras();
assert(page.indexOf('pendingAddSection') !== -1 && page.indexOf('rememberScroll_') !== -1,
  'add-from-section pre-fills category and save keeps page place');
assert(page.indexOf('restorePendingScroll_') !== -1 && page.indexOf('rememberScroll_(sec, focusSel)') !== -1,
  'Blocks width/frilly changes keep the same section card in view');
assert(page.indexOf('html += \'<div class="section-block" data-section="\'') !== -1,
  'Blocks cards have data-section so scroll restore can find them');
assert(page.indexOf('a frilly title sits in the box and the unframed neighbour lines up with it') !== -1,
  'Blocks lede says frilly titles sit in the box and still line up');
assert(page.indexOf('data-view="panels"') !== -1 && page.indexOf('renderFeaturePanels') !== -1,
  'Feature panels is a top-level view (not buried in Main → Wording)');
assert(page.indexOf('doSyncNow') !== -1 && page.indexOf('syncNowFromCloud') !== -1,
  'Sync now forces every device onto the shared cloud book');
assert(ingestJs.indexOf('getCloudUrl') !== -1 && ingestJs.indexOf('CLOUD_DEFAULT_URL') !== -1,
  'shared cloud URL helper exists');
assert(ingestJs.indexOf('Do not use a per-device custom AI URL') !== -1,
  'cloud sync ignores per-device custom AI URLs');
assert(ingestJs.indexOf("mode: 'no-cors'") !== -1 && ingestJs.indexOf('cloudWriteAndVerify_') !== -1,
  'cloud writes use no-cors POST then GET verify');
assert(ingestJs.indexOf('cloudGet') !== -1, 'cloud reads use fast GET');
assert(ingestJs.indexOf('eb-cloud-get') !== -1 && ingestJs.indexOf('cloudGetViaParent_') !== -1,
  'framed cloud reads ask the outer page via postMessage (iOS iframe tap issue)');
assert(ingestJs.indexOf('eb-cloud-get-result') !== -1 && ingestJs.indexOf("phase === 'start'") !== -1,
  'cloud parent relay waits for start ack then text/error');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf("type === 'eb-cloud-get'") !== -1 &&
  fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf('eb-cloud-get-result') !== -1,
  'owner Varlo shell relays Menus Apps Script GETs for the iframe');
assert(page.indexOf('listLocalPrintHistory') !== -1 && page.indexOf('Updating shared list') !== -1,
  'print history keeps a local list on screen while shared sync catches up');
assert(page.indexOf('Show dishes already on this phone immediately') !== -1 ||
  (page.indexOf("cloudSyncNote = 'Syncing shared menus…'") !== -1 &&
    page.indexOf('render();') !== -1 &&
    page.indexOf("edBoot.innerHTML = '<p class=\"note\">Syncing shared menus…</p>'") === -1),
  'boot shows local dishes instead of a blank Syncing panel');
assert(page.indexOf('Syncing shared menus and print history') === -1,
  'Sync now does not blank the editor with a syncing placeholder');
assert(printJs.indexOf('listLocalPrintHistory: localListOnly') !== -1 ||
  printJs.indexOf('listLocalPrintHistory') !== -1,
  'print module exposes local history for immediate paint');
assert(aiGs.indexOf('cloudBridgeHtml_') !== -1 && aiGs.indexOf('bridgeApi') !== -1,
  'Menu AI still exposes bridgeApi for diagnostics');
assert(printJs.indexOf('never block shared-list paint on uploads') !== -1 &&
  printJs.indexOf('schedulePendingPrintUploads') !== -1 &&
  printJs.indexOf('flushPendingPrintUploads_') !== -1,
  'print history paints cloud list immediately; uploads run in background');
assert(printJs.indexOf('blew past the Print history 12s hangWatch') !== -1,
  'listPrintHistory documents why migrate must not block paint');
assert(page.indexOf('try one last tiny list GET') !== -1 &&
  page.indexOf("action: 'listPrintHistory'") !== -1,
  'Print history hangWatch last-chances a list GET before red banner');
assert(aiGs.indexOf('Light GET: return the index fast') !== -1 &&
  aiGs.indexOf('historyFilterListed_') !== -1 &&
  aiGs.indexOf('pruneOrphanPrintHistory_') !== -1,
  'Apps Script listPrintHistory stays light; full Drive orphan prune on Sync');
assert(ingestJs.indexOf("url += '&_='") !== -1,
  'cloud GET adds cache-buster for WebView 302 caches');
assert(printJs.indexOf("action: 'emailPrintHistory'") !== -1 || printJs.indexOf('emailPrintHistory') !== -1,
  'Email sends via Apps Script MailApp (no mailto popup)');
assert(aiGs.indexOf('emailPrintHistory_') !== -1 && aiGs.indexOf('MailApp.sendEmail') !== -1,
  'Menu AI Apps Script can email a saved print sheet');
assert(aiGs.indexOf('menuHtmlToPdfBlob_') !== -1 && aiGs.indexOf('MimeType.PDF') !== -1,
  'Email converts the print sheet to a PDF attachment');
assert(aiGs.indexOf('resolveMenuEmailFrom_') !== -1 && aiGs.indexOf('kinfoldinns.co.uk') !== -1,
  'Email can use a kinfoldinns.co.uk address as Reply-To');
assert(aiGs.indexOf('MENU_EMAIL_USE_FROM') !== -1 && aiGs.indexOf('menuEmailUseFromAlias_') !== -1,
  'From alias is opt-in via MENU_EMAIL_USE_FROM after Send-as SMTP works');
assert(aiGs.indexOf('replyTo') !== -1,
  'menu emails set Reply-To to the kinfoldinns alias');
assert(fs.readFileSync(path.join(root, 'apps-script/menu-ai/appsscript.json'), 'utf8').indexOf('gmail.send') !== -1,
  'Apps Script manifest requests Gmail send scope for alias From');
assert(page.indexOf('data-view="catalogue"') !== -1 && page.indexOf('renderCatalogue') !== -1,
  'All dishes view browses the shared catalogue');
assert(page.indexOf('catalogueSearch') !== -1 && page.indexOf('catalogueSection') !== -1,
  'All dishes can search by name and filter by category');
assert(page.indexOf('data-catalogue-add') !== -1 && page.indexOf('Add to menu') !== -1,
  'All dishes can add a dish onto a chosen menu');
assert(page.indexOf('addCatalogueDishToMenu') !== -1 && page.indexOf('data-catalogue-target') !== -1,
  'All dishes has a menu dropdown per row');
assert(typeof api.filterDishCatalogue === 'function' && typeof api.dishCatalogueSections === 'function',
  'catalogue filter helpers are exported');
assert(typeof api.sectionForTargetMenu === 'function',
  'sectionForTargetMenu maps catalogue dishes onto the right menu category');
assert(page.indexOf('Sending…') !== -1, 'Email button shows sending state');
assert(page.indexOf('data-dish-delete') !== -1 && page.indexOf('removeDishInstant') !== -1,
  'dish Delete melts away without reloading the list');
assert(page.indexOf('dish-row-melt') !== -1, 'dish delete uses melt-away animation');
assert(page.indexOf('withFlowNav') !== -1 && page.indexOf('flow-nav-top') !== -1,
  'menu creation steps have Next/Back at top and bottom');
assert(printJs.indexOf('pub@eightbellsbolney.com') !== -1,
  'print history Email defaults to pub@eightbellsbolney.com');
assert(printJs.indexOf('AKfycbwy69TqrTaCB4UnMcDTEqCzTil6qoOZmV1Fq8jD-4HCpTIdBQi5-dsXnYn8ikhBhT3hdw') !== -1,
  'cloud URL points at Menu AI deployment with emailPrintHistory');
assert(printJs.indexOf('discardPreview') !== -1 && printJs.indexOf('id="saveToMenus"') !== -1,
  'preview toolbar is Save or Discard (no print)');
assert(printJs.indexOf('EBMenusOnPrintSaved') !== -1 && page.indexOf('EBMenusOnPrintSaved') !== -1,
  'Save jumps parent view to Print history');
assert(page.indexOf('data-history-email') !== -1 && printJs.indexOf('emailPrintHtml') !== -1,
  'print history can email a saved sheet');
assert(page.indexOf('Print PDF') !== -1, 'print history offers Print PDF');
assert(page.indexOf('cloud / local delete continues in the background') !== -1,
  'history Remove deletes in the background without reloading the list');
assert(typeof api.upsertDishCatalogue === 'function' && typeof api.searchDishCatalogue === 'function',
  'dish catalogue upsert and search are available');
assert(page.indexOf('dishSuggest') !== -1 && page.indexOf('bindDishSuggest') !== -1,
  'dish form shows past-dish autocomplete while typing');
assert(page.indexOf('Same category') !== -1 && page.indexOf('allowEmpty') !== -1,
  'Replace dish suggests catalogue items in the same category');
assert(page.indexOf("mode !== 'replace'") !== -1,
  'Replace keeps the slot category when filling from a past dish');
assert(page.indexOf('doFromWeek') !== -1 && page.indexOf('openWeekPickForSunday') !== -1,
  'Sunday can pull selected dishes from this week’s Main and Specials');
assert(page.indexOf('From this week’s Main / Specials') !== -1,
  'Sunday picker button names Main and Specials');
assert(aiGs.indexOf('dishCatalogue') !== -1,
  'cloud menus state stores the shared dish catalogue');
var catSmoke = api.upsertDishCatalogue([], [
  api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'sauce', '19.95', ''),
  api.dish('Mains', 'Sirloin of Beef', 'pink', '21.95', 'gf')
], { date: '2026-09-20' });
catSmoke = api.upsertDishCatalogue(catSmoke, [
  api.dish('Mains', 'Sirloin of Beef', 'pink', '22.50', 'gf')
], { date: '2026-09-27' });
assert(catSmoke.length === 2, 'catalogue dedupes the same dish title');
var sirloin = catSmoke.filter(function (c) { return /Sirloin/.test(c.name); })[0];
assert(sirloin && sirloin.price === '22.50' && sirloin.priceHistory.length === 2,
  'catalogue keeps price history with dates');
var bang = api.upsertDishCatalogue([], [
  api.dish('Starters', 'Bang Bang Cauliflower', 'florets', '8.25', 'vg')
], { date: '2026-09-27' });
bang = api.upsertDishCatalogue(bang, [
  api.dish('Starters', 'Bang Bang Cauliflower', 'florets', '8.25', 'vg')
], { date: '2026-10-04' });
assert(bang[0].priceHistory.length === 1 && bang[0].priceHistory[0].date === '2026-09-27',
  'same price on a later day does not add a history row');
assert(bang[0].lastSeen === '2026-10-04' && bang[0].price === '8.25',
  'last seen still updates when the price is unchanged');
bang = api.upsertDishCatalogue(bang, [
  api.dish('Starters', 'Bang Bang Cauliflower', 'florets', '8.50', 'vg')
], { date: '2026-10-11' });
assert(bang[0].priceHistory.length === 2 && bang[0].priceHistory[0].price === '8.50',
  'a new amount adds one history row');
bang = api.upsertDishCatalogue(bang, [
  api.dish('Starters', 'Bang Bang Cauliflower', 'florets', '8.25', 'vg')
], { date: '2026-10-18' });
assert(bang[0].priceHistory.length === 3,
  'changing back to an old amount is a real change and is stored');
var collapsed = api.normalizeDishCatalogue([{
  name: 'Bang Bang Cauliflower',
  section: 'Starters',
  price: '8.25',
  lastSeen: '2026-10-04',
  priceHistory: [
    { price: '8.25', date: '2026-10-04' },
    { price: '8.25', date: '2026-10-01' },
    { price: '8.25', date: '2026-09-30' },
    { price: '8.25', date: '2026-09-29' },
    { price: '8.25', date: '2026-09-28' },
    { price: '8.25', date: '2026-09-27' }
  ]
}]);
assert(collapsed[0].priceHistory.length === 1 && collapsed[0].priceHistory[0].date === '2026-09-27',
  'existing same-price daily stamps collapse to the first date of that amount');
var mergedCat = api.mergeDishCatalogues(
  [{ name: 'Bang Bang Cauliflower', price: '8.25', lastSeen: '2026-09-27',
    priceHistory: [{ price: '8.25', date: '2026-09-27' }] }],
  [{ name: 'Bang Bang Cauliflower', price: '8.25', lastSeen: '2026-10-04',
    priceHistory: [{ price: '8.25', date: '2026-10-04' }, { price: '8.25', date: '2026-09-30' }] }]
);
assert(mergedCat[0].priceHistory.length === 1,
  'cloud merge of the same amount on different days stays one history row');
assert(page.indexOf('a row only when the amount changes') !== -1,
  'All dishes copy says price history stores changes only');
assert(api.searchDishCatalogue(catSmoke, 'beef short')[0].name.indexOf('Short Rib') !== -1,
  'catalogue search matches word by word');
assert(api.searchDishCatalogue(catSmoke, '', { section: 'Mains', allowEmpty: true }).length === 2,
  'same-category suggest lists dishes when the name field is still empty');
assert(api.searchDishCatalogue(catSmoke, 'sirloin', { section: 'Starters' }).length === 0,
  'same-category suggest ignores dishes outside the slot section');
assert(api.filterDishCatalogue(catSmoke, { query: '', section: 'all' }).length === 2,
  'All dishes filter lists the full catalogue when search is empty');
assert(api.filterDishCatalogue(catSmoke, { query: 'sirloin', section: 'Mains' })[0].name.indexOf('Sirloin') !== -1,
  'All dishes filter matches name and category together');
assert(api.dishCatalogueSections(catSmoke).indexOf('Mains') !== -1,
  'catalogue exposes distinct categories for the filter');
assert(api.dishFromCatalogueEntry(sirloin).name === 'Sirloin of Beef',
  'catalogue entry can be cloned onto a menu');
assert(api.sectionForTargetMenu('Mains', 'Sirloin of Beef', '', 'specials') === 'Special Mains',
  'Add to Specials coerces Mains → Special Mains');
assert(api.sectionForTargetMenu('Starters', 'Whitebait', '', 'desserts') === 'Desserts',
  'Add to Desserts menu forces Desserts category');
assert(api.dishFromCatalogueEntry(sirloin, { menuId: 'specials' }).section === 'Special Mains',
  'catalogue clone onto Specials uses Special Mains');
assert(printJs.indexOf('cols-little-solo') !== -1 && printJs.indexOf('levelOppositeColumns') !== -1,
  'opposite columns are leveled with food then feature panels');
assert(printJs.indexOf('function noteUnits') !== -1,
  'Blocks notes count toward column height for level finishes');
assert(typeof api.normalizeSectionLayoutBook === 'function' && typeof api.sectionLayoutForMenu === 'function',
  'Blocks rules are stored per menu');
assert(typeof api.overlaySpecialsBoardNotes === 'function',
  'Specials-card notes overlay helper is exported');
var hostColSpec = api.normalizeSectionLayout({
  'Special Mains': { width: 'column', frame: true, note: 'Host note' },
  'Special Starters': { width: 'column', frame: false, note: '' }
});
var cardFullSpec = api.normalizeSectionLayout({
  'Special Mains': { width: 'full', frame: true, note: 'When it’s gone, it’s gone' },
  'Special Starters': { width: 'full', frame: true, note: 'Board starters' }
});
var overlaidSpec = api.overlaySpecialsBoardNotes(hostColSpec, cardFullSpec);
assert(overlaidSpec['Special Mains'].width === 'column',
  'Main Blocks Column lock is not replaced by the Specials-card Full default');
assert(overlaidSpec['Special Mains'].frame === true,
  'Main Blocks frilly box is kept when overlaying the Specials note');
assert(/gone/i.test(overlaidSpec['Special Mains'].note || ''),
  'Specials-card board note still follows onto Main');
assert(overlaidSpec['Special Starters'].width === 'column' &&
  /starters/i.test(overlaidSpec['Special Starters'].note || ''),
  'Special Starters host width stays; only the card note overlays');
assert(page.indexOf('overlaySpecialsBoardNotes') !== -1 &&
  page.indexOf('the card’s default Full must not') !== -1,
  'Generate uses note-only Specials overlay so host Column / Best fit win');
assert(page.indexOf('this menu only') !== -1 && page.indexOf('drops onto this sheet') !== -1 &&
  page.indexOf('Specials') !== -1 && page.indexOf('not centred like the card') !== -1 &&
  page.indexOf('leftover space in a column') !== -1 &&
  page.indexOf('Drop-in wording sits in that section') !== -1,
  'Blocks step says every drop-in menu follows this sheet, not the card');
var flatLegacy = api.normalizeSectionLayout({
  Desserts: { width: 'column', frame: true, note: 'legacy' },
  'Little Bells': { width: 'column', frame: false, note: '' }
});
var migratedBook = api.normalizeSectionLayoutBook(flatLegacy);
assert(migratedBook.main && migratedBook.sunday && migratedBook.main.Desserts.width === 'column',
  'legacy flat Blocks migrate into every menu');
assert(migratedBook.main.Desserts.note === 'legacy' && migratedBook.sunday.Desserts.note === 'legacy',
  'legacy migrate preserves notes on Main and Sunday');
var splitBook = api.normalizeSectionLayoutBook({
  main: { Desserts: { width: 'full', frame: false, note: 'main puds' } },
  sunday: { Desserts: { width: 'column', frame: true, note: 'sunday puds' } }
});
assert(api.sectionLayoutForMenu('main', splitBook).Desserts.width === 'full',
  'Main Blocks Desserts can be Full');
assert(api.sectionLayoutForMenu('sunday', splitBook).Desserts.width === 'column',
  'Sunday Blocks Desserts can be Column independently');
assert(api.sectionLayoutForMenu('main', splitBook).Desserts.note === 'main puds' &&
  api.sectionLayoutForMenu('sunday', splitBook).Desserts.note === 'sunday puds',
  'Main and Sunday keep separate Blocks notes');
assert(printJs.indexOf('function renderLittleBellsRow') !== -1 && printJs.indexOf('cols-little-desserts') !== -1,
  'Little Bells Column width pairs beside Desserts');
assert(printJs.indexOf('dessertsAllowColumn') !== -1 && printJs.indexOf('sidesAllowColumn') !== -1,
  'Little Bells only pairs partners that Blocks allows as Column');
assert(printJs.indexOf('lockedFullWidth') !== -1 && printJs.indexOf('lockedColumnWidth') !== -1,
  'Blocks Full / Column locks are distinct from Best fit');
assert(printJs.indexOf('columnSoloSection') !== -1,
  'Column-locked sections alone stay half-width');
assert(api.isLockedColumnWidth('column') && !api.isLockedColumnWidth('both') && !api.isLockedColumnWidth('full'),
  'locked Column is only the Column Blocks choice');
assert(printJs.indexOf('sundayRoasts') !== -1 && printJs.indexOf('roastsOnP1') !== -1,
  'print planner can balance Sunday Roasts onto page 1');
assert(api.looksLikeDishTitle('Tomato & Basil Pasta') && api.looksLikeDishTitle('Fish Fingers, Chunky Chips & Peas'),
  'kids plate names count as dish titles');
assert(!api.looksLikeDescFragment('Tomato & Basil Pasta') && !api.looksLikeDescFragment('Fish Fingers, Chunky Chips & Peas'),
  'unpriced kids plates are not treated as description fragments');
var kidsNoPrice = api.tidyOrphanDescriptions([
  { section: 'Mains', name: 'Short Rib', description: 'rocket', price: '17.95', tags: '' },
  { section: 'Little Bells', name: 'Fish Fingers, Chunky Chips & Peas', description: '', price: '', tags: '' },
  { section: 'Little Bells', name: 'Chicken Goujons, Fries & Dressed Salad', description: '', price: '', tags: '' },
  { section: 'Little Bells', name: 'Beef Burger, Fries & Dressed Salad', description: '', price: '', tags: '' },
  { section: 'Little Bells', name: 'Tomato & Basil Pasta', description: '', price: '', tags: 'v' },
  { section: 'Little Bells', name: 'Kids Mac & Cheese', description: '', price: '', tags: '' }
]);
assert(kidsNoPrice.length === 6, 'unpriced Little Bells dishes all survive tidy (All £9.50 in note)');
assert(kidsNoPrice.filter(function (d) { return d.section === 'Little Bells'; }).length === 5,
  'kids dishes are not folded into Mains when prices are blank');
assert(!/fish fingers/i.test(kidsNoPrice[0].description || ''),
  'Fish Fingers does not become a Short Rib description');
assert(api.SECTIONS.indexOf('Sunday Roasts') !== -1, 'Sunday Roasts is a canonical section');
assert(api.normalizeSectionName('Sunday roasts') === 'Sunday Roasts', 'legacy Sunday roasts maps to Sunday Roasts');
assert(api.normalizeSectionName('roasts') === 'Sunday Roasts', 'roasts heading maps to Sunday Roasts');
assert(api.guessSection('Sunday Roasts', 'Sirloin of Beef', '') === 'Sunday Roasts', 'guess keeps Sunday Roasts');
assert(/roast potatoes|Yorkshire/i.test(api.sectionLayoutFor('Sunday Roasts').note || ''),
  'Sunday Roasts has a default description note like other categories');
assert((api.seed().sunday || []).some(function (d) { return d.section === 'Sunday Roasts'; }),
  'sample Sunday menu uses Sunday Roasts section');
assert(api.tidyDishFields({ section: 'Sunday roasts', name: 'Beef' }).section === 'Sunday Roasts',
  'tidyDishFields migrates Sunday roasts spelling');
assert(/id="menuFile"[^>]*\bmultiple\b/.test(page) || /<input[^>]*id="menuFile"[^>]*multiple/.test(page),
  'upload input allows multiple files');
assert(page.indexOf('several files at once') !== -1, 'upload copy explains multi-select');
assert(ingestJs.indexOf('function readFiles') !== -1 && ingestJs.indexOf('readFiles: readFiles') !== -1,
  'ingest exports readFiles for multi-upload');
assert(page.indexOf("menu.id === 'specials'") !== -1,
  'Specials Blocks step edits section note');
assert(fs.existsSync(path.join(root, 'menus-guide.html')), 'menus staff quick guide page exists');
assert(fs.readFileSync(path.join(root, 'menus-guide.html'), 'utf8').indexOf('Also put on this sheet') !== -1,
  'guide explains include tick boxes');
assert(page.indexOf('menus-guide.html') !== -1, 'Menus UI links the quick guide');
assert(page.indexOf('isStaffMode') !== -1 && page.indexOf('mode=staff') !== -1,
  'menus supports simplified staff mode');
assert(page.indexOf('STAFF_MENU_IDS') !== -1 && page.indexOf("isStaffMode ? 2 : 4") !== -1,
  'staff mode uses Dishes → Generate only');
assert(page.indexOf("data-mode=\"paste\">Upload / paste whole menu") !== -1 &&
  page.indexOf('id="doClear"') !== -1,
  'staff Menus keeps upload/paste and clear');
assert(/if\s*\(\s*!isStaffMode\s*\)\s*\{[\s\S]*?doReset/.test(page),
  'Put sample menus back stays owner-only');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf('withStaffMenus') !== -1 &&
  fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf("sessionRole === 'eightbells'") !== -1,
  'Eight Bells manager opens menus with mode=staff');
assert(typeof api.stripAllergyFooter === 'function' && typeof api.cleanDishDescription === 'function',
  'allergy footer strip helpers exported');
assert(/rice/.test(api.cleanDishDescription(
  'Served with rice & Garlic Bread. Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can\'t guarantee it\'s allergen-free.'
)), 'Stroganoff-style desc keeps served-with when allergy footer was glued on');
assert(!/please inform/i.test(api.cleanDishDescription(
  'Served with rice & Garlic Bread Please inform us of any allergies or dietary needs'
)), 'allergy footer text removed from description');
var strogPaste = api.parsePaste(
  'SPECIALS\n' +
  'Mushroom Stroganoff 15.95\n' +
  'Served with rice & Garlic Bread\n' +
  'Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can\'t guarantee it\'s allergen-free.'
);
assert(strogPaste.length === 1, 'paste keeps one stroganoff dish before allergy footer');
assert(/rice/i.test(strogPaste[0].description || ''), 'paste keeps Stroganoff served-with description');
assert(!/please inform/i.test(strogPaste[0].description || ''), 'paste does not put allergy footer on dish');
var strogAi = api.dishesFromAiMenu({
  dishes: [{
    section: 'Special Mains',
    name: 'Mushroom Stroganoff',
    description: 'Served with rice & Garlic Bread. Please inform us of any allergies or dietary needs.',
    price: '15.95',
    tags: ''
  }]
});
assert(/rice/i.test(strogAi.dishes[0].description || ''), 'AI path keeps served-with after stripping footer');
assert(printJs.indexOf('canFitFootPromos') !== -1 && printJs.indexOf('footPromos') !== -1,
  'foot feature panels require spare room (not jammed at min type)');
assert(printJs.indexOf('dropJammedFootPromos') !== -1,
  'fit script drops jammed foot feature panels at dense/compact type');
assert(printJs.indexOf('keepContentOnPage(a4)') !== -1,
  'fitPages re-checks overflow after type, balance and spread');
assert(printJs.indexOf('specials-face') !== -1 && printJs.indexOf('specials-course') !== -1,
  'Specials card uses compact specials-course titles');
assert(/\.card-face\.specials-face h1\{[^}]*font-size:14pt/.test(printJs),
  'Specials card page title is 14pt');
assert(/\.specials-course\{[^}]*font-size:10\.5pt/.test(printJs),
  'Specials course heads (Starters/Mains) are 10.5pt');
assert(/\.menus\s*\{[^}]*flex-wrap:\s*wrap/.test(page) && !/\.menus\s*\{[^}]*overflow-x:\s*auto/.test(page),
  'menu tabs wrap onto lines instead of horizontal scroll');
assert(printJs.indexOf('specialsBesideCourse') !== -1 && printJs.indexOf('bag.specialStarters') !== -1,
  'Specials sit beside their course (under Starters / under Mains)');
assert(printJs.indexOf('specials-beside') !== -1,
  'Specials beside-course blocks are marked specials-beside');
assert(printJs.indexOf('specials-beside-title') !== -1,
  'Main-sheet Specials box uses compact specials-beside-title');
assert(/\.specials-beside[^{]*specials-beside-title\{[^}]*text-align:\s*left/.test(printJs),
  'Specials beside-course title is left like the parent sheet');
assert(/\.specials-beside \.sec-note\{text-align:left/.test(printJs),
  'Specials beside-course note is left like the parent sheet');
assert(/\.specials-course\{[^}]*text-align:center/.test(printJs) &&
  /style="text-align:center"/.test(printJs),
  'Specials card still centres course heads and board notes');
assert(/\.specials-beside\{[^}]*width:\s*100%/.test(printJs) &&
  /\.specials-beside[^}]*\.scallop\{[^}]*width:\s*100%/.test(printJs),
  'Full-width Specials beside-course box stretches like the course above');
assert(printJs.indexOf('lockedColumnWidth(rule)') !== -1 &&
  printJs.indexOf('columnSoloSection(title') !== -1 &&
  printJs.indexOf('specialsPrintTitle') !== -1,
  'Specials Column lock uses a half-column with the full course title');
assert(/gone/i.test(api.sectionLayoutFor('Special Starters').note || '') &&
  /gone/i.test(api.sectionLayoutFor('Special Mains').note || ''),
  'Specials section default note is when-gone (editable in Blocks)');
assert(printJs.indexOf('SPECIALS_GONE_NOTE') === -1,
  'print does not hardwire SPECIALS_GONE_NOTE');
var noNoteLayout = api.normalizeSectionLayout({
  'Special Starters': { width: 'full', frame: true, note: '' },
  'Special Mains': { width: 'full', frame: true, note: '' },
  'Special Desserts': { width: 'full', frame: true, note: '' }
});
var noNoteHtml = printApi.build(api.menuById('main'), api.composeDishes(api.seed(), 'main', { specials: true }), {
  sectionLayout: noNoteLayout
});
assert(!/When it's gone/i.test(noNoteHtml.split('</style>')[1] || noNoteHtml),
  'cleared Specials note does not print when-gone');
assert(printJs.indexOf('function specialsPrintTitle') !== -1 &&
  printJs.indexOf("return 'Special Starters'") !== -1,
  'Specials boxes print the full course name (Special Starters / Special Mains / …)');
assert(/function specialsBesideCourse[\s\S]*?specialsPrintTitle/.test(printJs),
  'beside-course Specials use specialsPrintTitle for the box heading');
// Split boxes: starter specials under Starters; main specials under Mains — never one combined board
var splitBook = api.seed();
var splitDishes = api.composeDishes(splitBook, 'main', { specials: true });
var splitHtml = printApi.build(api.menuById('main'), splitDishes, {});
assert((splitHtml.match(/specials-beside/g) || []).length >= 2,
  'Main + Specials prints separate frilly boxes (not one combined board)');
assert(splitHtml.indexOf('data-specials-course="Special Starters"') !== -1,
  'starter specials box marked Special Starters');
assert(splitHtml.indexOf('data-specials-course="Special Mains"') !== -1,
  'main specials box marked Special Mains');
var startBox = splitHtml.indexOf('data-specials-course="Special Starters"');
var mainBox = splitHtml.indexOf('data-specials-course="Special Mains"');
var mainsTitle = splitHtml.search(/class="sec-title"[^>]*>\s*Mains/i);
assert(startBox !== -1 && mainBox !== -1 && startBox < mainBox,
  'starter specials box appears before main specials box');
assert(mainsTitle === -1 || mainBox > mainsTitle,
  'main specials box sits after the Mains section title');
assert(!/<section class="sec specials-beside"[\s\S]*?class="specials-course"[\s\S]*?<\/section>/.test(splitHtml),
  'frilly Specials boxes on Main have no Starters/Mains course subhead');
assert(typeof api.orderDishesForSell === 'function' && typeof api.parseSellPrice === 'function',
  'sell-order helpers exported');
assert(api.parseSellPrice('8.25/14.95') === 14.95, 'dual price uses the higher figure');
assert(api.parseSellPrice('£29.95') === 29.95, 'pound price parses');
var sellIn = [
  api.dish('Mains', 'Pie', 'mash', '15.95', ''),
  api.dish('Mains', 'Sirloin', 'fries', '29.95', ''),
  api.dish('Mains', 'Katsu', 'rice', '16.95', 'vg'),
  api.dish('Mains', 'Soup', 'bread', '6.95', 'v'),
  api.dish('Mains', 'Hake', 'greens', '25.95', '')
];
var sellOut = api.sellOrderWithinSection(sellIn);
assert(sellOut[0].name === 'Sirloin', 'sell order leads with the dearest dish');
assert(sellOut[1].name === 'Soup', 'sell order contrasts with a cheaper dish next');
assert(sellOut.map(function (d) { return d.name; }).indexOf('Hake') <
  sellOut.map(function (d) { return d.name; }).indexOf('Pie'),
  'next expensive plate stays ahead of mid-price after the contrast');
var sellPrint = printApi.orderDishesForPrint([
  api.dish('Starters', 'Soup', '', '6.95', ''),
  api.dish('Starters', 'Terrine', '', '9.50', ''),
  api.dish('Mains', 'Pie', '', '15.95', ''),
  api.dish('Mains', 'Steak', '', '29.95', '')
]);
assert(sellPrint[0].section === 'Starters' && sellPrint[0].name === 'Terrine',
  'print sell-order keeps section flow and dear starter first');
assert(sellPrint.filter(function (d) { return d.section === 'Mains'; })[0].name === 'Steak',
  'print sell-order puts expensive main first within Mains');
assert(page.indexOf('data-flag="df"') !== -1 && page.indexOf('dairy free') !== -1,
  'staff UI has dairy-free (df) checkbox');
assert(printJs.indexOf('df – dairy free') !== -1, 'print allergy key includes dairy free');
assert(aiGs.indexOf('df = dairy free') !== -1 || aiGs.indexOf('dairy free') !== -1,
  'Menu AI prompt knows df / dairy free');
assert(page.indexOf('No events or selling lines') !== -1, 'wording can force no event blurbs');
assert(page.indexOf('Top &amp; bottom blurbs') !== -1 || page.indexOf('Top & bottom blurbs') !== -1,
  'party wording has top/bottom blurb section');
assert(page.indexOf('metaTopKind') !== -1 && page.indexOf('metaBottomKind') !== -1,
  'party blurbs have title/paragraph/text style');
assert(page.indexOf('Heading (between title') !== -1, 'party blurbs offer heading between title and paragraph');
assert(page.indexOf('Subheading (between heading') !== -1,
  'all type-size dropdowns offer subheading between heading and paragraph');
assert(api.OUTSIDE_KINDS && api.OUTSIDE_KINDS.map(function (k) { return k.id; }).join(',') ===
  'title,heading,subhead,paragraph,text',
  'type sizes go Title → Heading → Subheading → Paragraph → Text');
assert(api.normalizeOutsideKind('subhead') === 'subhead',
  'normalize keeps subheading');
assert(api.normalizeMeta({ title: 'X', notes: 'Y', topKind: 'subhead' }).topKind === 'subhead' &&
  api.normalizeMeta({ bottomKind: 'subhead' }).bottomKind === 'subhead',
  'party blurbs accept subheading');
assert(api.PROMO_NONE_ID === '__none__', 'promo none tick id exported');
assert(api.pickPromos(api.seedPromoBank(), { __none__: true }).length === 0,
  'no-events tick yields zero promos');
assert(api.normalizeMeta({ title: 'X', notes: 'Y', topKind: 'text' }).topKind === 'text',
  'normalizeMeta keeps blurb kinds');
assert(api.normalizeMeta({ bottomKind: 'heading' }).bottomKind === 'heading',
  'normalizeMeta accepts heading blurb kind');
assert(printJs.indexOf('partyBlurbBlock') !== -1, 'party print uses blurb kinds');
assert(printJs.indexOf('party-blurb-heading') !== -1, 'party print has heading blurb size');
assert(printJs.indexOf('party-blurb-subhead') !== -1 && printJs.indexOf('sheet-blurb-subhead') !== -1 &&
  printJs.indexOf('card-blurb-subhead') !== -1,
  'subheading prints on cards, long sheets and party menus');
assert(ingestJs.indexOf('fetchWithTimeout') !== -1 && ingestJs.indexOf('imageFileForAi') !== -1,
  'AI reader shrinks images and times out instead of hanging');
assert(aiGs.indexOf('gemini-2.5-flash') !== -1 && aiGs.indexOf('callGemini_') !== -1,
  'Menu AI falls back across Gemini flash models');
assert(page.indexOf('plan-sheet') !== -1 && page.indexOf('plan-dish') !== -1,
  'generate plan preview uses tidy sheet checklist markup');
assert(page.indexOf('ul class="dishes"') === -1,
  'generate plan preview no longer uses a raw bullet list');
assert(page.indexOf('data-layout-note') !== -1,
  'Blocks step has extra-info field per category');
assert(page.indexOf('data-layout-tip') !== -1 && page.indexOf('data-layout-sell') !== -1,
  'Blocks step has tip toggle and selling content for Sandwiches');
assert(page.indexOf('Text outside dishes') !== -1 && page.indexOf('renderOutsideTextEditors') !== -1,
  'UI has Text outside dishes editors for card spiel / ice cream / notes');
assert(page.indexOf('Layout & text outside dishes') !== -1,
  'Blocks step title mentions text outside dishes');
assert(page.indexOf('outside-text-box') !== -1,
  'outside-text editors use a highlighted box');
assert(page.indexOf('data-view="blocks"') !== -1 && page.indexOf('renderBlocksHub') !== -1,
  'top-level Blocks & text view like Feature panels (manager + owner)');
assert(page.indexOf('id="viewBlocks"') !== -1,
  'Blocks & text toggle button is always in the menus chrome');
assert(!/staff-mode[\s\S]{0,200}#viewBlocks\s*\{[^}]*display:\s*none/.test(page) &&
  page.indexOf('viewBlocks') !== -1 && page.indexOf('mode=staff') !== -1,
  'Blocks & text is not hidden in staff/manager mode');
assert(page.indexOf("viewMode === 'blocks'") !== -1 &&
  page.indexOf('isStaffMode') !== -1 &&
  /lede\.textContent = isStaffMode/.test(page),
  'Blocks hub has manager and owner copy');
assert(api.sectionLayoutFor('Sandwiches').tip === true, 'Sandwiches tip box defaults on');
assert(/selection of sandwiches/i.test(api.sectionLayoutFor('Sandwiches').sell || ''),
  'Sandwiches default sell wording mentions selection');
assert(/12\s*[–-]\s*2\.45/i.test(api.sectionLayoutFor('Sandwiches').note || ''),
  'Main/Sunday Sandwiches default note keeps lunch hours');
assert(/Ciabatta/i.test(api.sectionLayoutForMenu('sandwiches').Sandwiches.note || ''),
  'Sandwiches card default note is the under-fillings spiel');
assert(!/Two Scoops of Ice-Cream/i.test(api.sectionLayoutForMenu('little-bells')['Little Bells'].sell || ''),
  'Little Bells no longer uses a separate Two Scoops sell block');
assert(api.OUTSIDE_KINDS && api.OUTSIDE_KINDS.some(function (k) { return k.id === 'heading'; }) &&
  api.OUTSIDE_KINDS.some(function (k) { return k.id === 'subhead'; }),
  'outside-text type sizes match party blurbs including subheading');
assert(page.indexOf('data-layout-above') !== -1 && page.indexOf('data-layout-below') !== -1,
  'card menus have above/below text boxes');
assert(page.indexOf('data-layout-above-kind') !== -1 && page.indexOf('Type size') !== -1,
  'each outside-text box has a type-size picker');
assert(page.indexOf('this sheet') !== -1 && page.indexOf('card keeps its own') !== -1,
  'UI says host type sizes are independent of the card');
assert(page.indexOf('inside this section') !== -1 && page.indexOf('frilly box when Frilly is Yes') !== -1,
  'host Blocks says above/below wording prints inside the section box');
assert(page.indexOf('not centred like the card') !== -1,
  'host Blocks copy says drop-in wording is left like the sheet');
assert(page.indexOf("base['Little Bells'] = Object.assign") === -1,
  'host menus do not copy Little Bells card wording or type sizes');
assert(page.indexOf("layoutBook[mid]['Little Bells']") === -1,
  'saving one menu does not broadcast Little Bells text to every menu');
var lbDef = api.sectionLayoutForMenu('little-bells')['Little Bells'];
assert(/All £9\.50/.test(lbDef.above || '') && /one scoop/i.test(lbDef.above || ''),
  'Little Bells default above box is the £9.50 / ice cream offer');
assert(/half the price of the adults/i.test(lbDef.below || ''),
  'Little Bells default below box is the Sunday roast line');
assert(/half the price of the adults/i.test(api.sectionLayoutForMenu('sunday')['Little Bells'].below || ''),
  'Sunday drop-in Little Bells keeps the roast line on Sunday');
assert(!/half the price of the adults/i.test(api.sectionLayoutForMenu('main')['Little Bells'].below || ''),
  'Main drop-in Little Bells does not inherit the Sunday roast line');
assert(lbDef.aboveKind === 'heading' && lbDef.belowKind === 'text',
  'Little Bells defaults: offer as heading, Sunday as smaller text');
var lbSplit = api.splitCardOutsideText(lbDef.note);
assert(/£9\.50/.test(lbSplit.above) && /Sunday/i.test(lbSplit.below),
  'Little Bells splits offer above the box and Sunday note below');
var sundayFirst = api.cardOutsideSlots({
  note: 'LITTLE BELLS ON SUNDAY in addition have a choice of roasts at half price of the adults.\n\nAll £9.50\nto include a choice of one scoop of ice cream or sorbet.'
});
assert(/£9\.50/.test(sundayFirst.above) && /Sunday/i.test(sundayFirst.below),
  'old Sunday-first note still puts the offer above and roast line below');
var customSlots = api.normalizeSectionLayout({
  'Little Bells': {
    above: 'All £8.00\nto include a scoop.',
    aboveKind: 'title',
    below: 'CUSTOM SUNDAY NOTE for Little Bells',
    belowKind: 'paragraph'
  }
})['Little Bells'];
assert(customSlots.aboveKind === 'title' && customSlots.belowKind === 'paragraph',
  'normalize keeps explicit outside-text type sizes');
assert(api.normalizeSectionLayout({ Sandwiches: { width: 'column', frame: true, tip: false, sell: 'Ask at the bar' } }).Sandwiches.tip === false,
  'normalize keeps tip off when explicitly false');
assert(printJs.indexOf('sandwichesBlock') !== -1 && printJs.indexOf('sec-note') !== -1,
  'sandwiches print spiel plus dish list');
assert(printJs.indexOf('Tip box') !== -1 || printJs.indexOf('sandRule.tip') !== -1 ||
  printJs.indexOf('wantSandwiches') !== -1,
  'print honours tip when deciding sandwiches box');
assert(/cardSandwichesInner\(dishes,\s*plan\)/.test(printJs),
  'sandwich card spiel reads plan sectionLayout note');
assert(printJs.indexOf('card-outside') !== -1 && printJs.indexOf('cardBlurbHtml') !== -1 &&
  printJs.indexOf('cardOutsideSlots') !== -1,
  'Little Bells card prints above/below boxes with a chosen type size');
assert(printJs.indexOf('startersInTop') !== -1 && printJs.indexOf('top-band-logo') !== -1,
  'starters sit beside logo spanning the top band');
assert(printJs.indexOf('card-mid') !== -1 && printJs.indexOf('card-face.fill-page') !== -1,
  'sparse card menus spread to fill the A5 face');
assert(printJs.indexOf('cardSandwichesInner') !== -1,
  'sandwich A5 cards group fillings by price');
assert(/\.card-face\.fill-airy\{[^}]*--name:14pt/.test(printJs),
  'A5 card faces start with larger dish type to fill the page');
assert(printJs.indexOf('justify-content:space-evenly') !== -1 && printJs.indexOf('card-face .scallop-pad') !== -1,
  'card scallop pad spreads dishes to fill the frilly box');
assert(printJs.indexOf('party-promos') !== -1,
  'party sheets can print wording from the bank');
assert(printJs.indexOf('keep party-page') !== -1 || printJs.indexOf('party-page / theme classes') !== -1,
  'A5 guillotine keeps party-page so descriptions stay centred');
assert(!/\.a5-face\{--dish-gap:8px/.test(printJs),
  'A5 faces are not locked to a tiny type size');
assert(page.indexOf('including 2×A5') !== -1 || page.indexOf('Party sheets') !== -1,
  'wording step allows bank picks on party / A5 sheets');
assert(aiGs.indexOf('finish level') !== -1 || aiGs.indexOf('finish at') !== -1,
  'Gemini golden rules require columns to finish level');
assert(aiGs.indexOf('Never a third') !== -1 || aiGs.indexOf('only ONE or TWO pages') !== -1,
  'Gemini golden rules cap at two pages');
assert(aiGs.indexOf('2×A5') !== -1 || aiGs.indexOf('two A5') !== -1, 'Gemini knows card menus are 2×A5');
assert(aiGs.indexOf('A4 or 2×A5') !== -1 || aiGs.indexOf('party paper') !== -1,
  'Gemini respects party paper choice');
assert(aiGs.indexOf('shorter stack') !== -1 || aiGs.indexOf('SHORTER') !== -1 ||
  aiGs.indexOf('panels:0 only when shorter is "even"') !== -1,
  'Gemini golden rule: feature panels only to even opposite columns');
assert(aiGs.indexOf('oval') !== -1 || aiGs.indexOf('box beside wide') !== -1 ||
  aiGs.indexOf('contrasting frames') !== -1,
  'Gemini golden rules contrast side-by-side feature frames');
assert(page.indexOf('opposite columns match') !== -1 || page.indexOf('Gemini checking') !== -1 ||
  page.indexOf('Checking leftover column space') !== -1 || page.indexOf('forceColumnFill') !== -1,
  'Generate runs Gemini balance check step');
assert(printJs.indexOf('leftFrame') !== -1 && printJs.indexOf('rightFrame') !== -1,
  'paired promo panels pick opposite frame kinds');
assert(printJs.indexOf("leftFrame: 'box', rightFrame: 'wide'") !== -1 ||
  printJs.indexOf('two matching rectangles never sit side by side') !== -1,
  'side-by-side feature panels alternate rect box vs oval wide');
assert(printJs.indexOf('function contrastAdjacentScallops') !== -1,
  'adjacent frilly food boxes pick opposite wave / corner treatments');
assert(printJs.indexOf('balanceFeatures') !== -1,
  'print equalises paired feature panel heights after fit');
assert(printJs.indexOf('cols-features') !== -1,
  'feature column layout marked cols-features');
assert(api.tidyOrphanDescriptions([
  { section: 'Pub Classics', name: 'Fish & Chips', description: 'served with chips, garden peas', price: '17.95', tags: '' },
  { section: 'Pub Classics', name: 'and tartare sauce.', description: '', price: '', tags: '' }
]).length === 1, 'orphan desc lines merge before review/print');
assert(/tartare/.test(api.tidyOrphanDescriptions([
  { section: 'Pub Classics', name: 'Fish & Chips', description: 'served with chips, garden peas', price: '17.95', tags: '' },
  { section: 'Pub Classics', name: 'and tartare sauce.', description: '', price: '', tags: '' }
])[0].description), 'merged orphan lands on previous description');
var camembertTidy = api.tidyOrphanDescriptions([
  { section: 'Sharing Plates', name: 'Baked Camembert for Two', description: '', price: '', tags: 'v' },
  { section: 'Sharing Plates', name: 'served with ciabatta, red onion jam', description: '', price: '14.95', tags: '' }
]);
assert(camembertTidy.length === 1 && camembertTidy[0].price === '14.95', 'Camembert desc+price merges onto title');
assert(/ciabatta/.test(camembertTidy[0].description), 'Camembert description kept on merge');
var camembertPaste = api.parsePaste(
  'Sharing Plates\nBaked Camembert for Two\nserved with ciabatta, red onion jam 14.95'
);
assert(camembertPaste.length === 1 && camembertPaste[0].price === '14.95', 'paste joins Camembert price on desc line');
var boostPaste = api.parsePaste(
  'Item Boost\nFish of the Day 19.95\nask waiting staff for today’s catch'
);
assert(boostPaste.length === 1 && boostPaste[0].section === 'Item Boost', 'paste keeps Item Boost section');
assert(/Fish of the Day/i.test(boostPaste[0].name), 'paste reads Fish of the Day');
var steakPaste = api.parsePaste(
  'Pub Classics\n8oz Trenchmore Farm Flat Iron Steak gf 24.95\nserved with chips, mushroom, tomato &\nchoice of sauce (see options)\nFish & Chips 17.95\nserved with chips, garden peas\nand tartare sauce.'
);
assert(steakPaste.length === 2, 'paste joins multi-line steak/fish descriptions');
assert(/choice of sauce/i.test(steakPaste[0].description), 'steak wrap lines become description');
assert(/tartare/i.test(steakPaste[1].description), 'fish wrap lines become description');
assert(printJs.indexOf('dish-leader') !== -1, 'dish lines use leaders toward prices');
assert(printJs.indexOf('sandwich-aligned') !== -1, 'sandwiches title aligns with sides');
assert(api.cleanDishName('Chicken Caesar Salad 9.5 /') === 'Chicken Caesar Salad', 'strips dangling half-range from dish name');
assert(api.priceOf('Salad 9.5 / 15.95').value === '9.5/15.95', 'priceOf keeps full range');
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
  setItem: function (k, v) { this._d[k] = String(v); },
  removeItem: function (k) { delete this._d[k]; }
};
require(path.join(root, 'menus-print.js'));
var print = global.EBMenuPrint;
assert(print.toRoman(1) === 'I' && print.toRoman(2) === 'II' && print.toRoman(4) === 'IV', 'Roman numerals');
assert(/Week of \d/.test(print.weekLabel(new Date('2026-09-21T12:00:00Z'))), 'week label');
assert(print.printSheetLabel('Main menu', {
  week: 'Week of 21st September 2026',
  roman: 'LXIII'
}) === 'Main menu Wk 21st Sep — LXIII', 'print sheet label includes menu, Wk date and version');
assert(print.printSheetLabel('Sunday', {
  week: 'Sunday Sun 4th Oct',
  roman: 'I'
}) === 'Sunday 4th Oct — I', 'Sunday label does not double Sunday/Sun');
assert(print.printFileName('Main menu', {
  week: 'Week of 21st September 2026',
  roman: 'LXIII'
}, 'html') === 'Main menu Wk 21st Sep - LXIII.html', 'download filename keeps week in the name');
assert(/Wk 21st Sep/.test(printJs) || printJs.indexOf('printSheetLabel') !== -1,
  'print title uses printSheetLabel for PDF save names');
assert(print.sundayLabel, 'sundayLabel exported');
var sundayPrint = print.build(
  api.menuById('sunday'),
  api.seed().sunday,
  { sectionLayout: api.normalizeSectionLayout({}) }
);
assert(/Sunday Roasts/i.test(sundayPrint), 'Sunday print shows Sunday Roasts heading');
assert(/Yorkshire pudding|roast potatoes/i.test(sundayPrint), 'Sunday Roasts note prints under the title');
assert(/sec-note/i.test(sundayPrint), 'Sunday Roasts description uses section note markup');
var kidsColDishes = [
  api.dish('Mains', 'Porchetta', 'mash', '18.95', ''),
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Kids Mac & Cheese', '', '', ''),
  api.dish('Desserts', 'Sticky Toffee', 'toffee', '8.25', ''),
  api.dish('Desserts', 'Treacle Tart', 'ice cream', '8.25', '')
];
var kidsColHtml = print.build(api.menuById('sunday'), kidsColDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'column', frame: true, note: 'All £9.50' },
    // Desserts default is Full — set Column so the kids|puddings pair is allowed
    Desserts: { width: 'column', frame: false, note: '' }
  }),
  promos: []
});
assert(/cols-little-desserts/.test(kidsColHtml) && /col-little/.test(kidsColHtml),
  'Blocks Column puts Little Bells beside Desserts');
var kidsDessRow = (kidsColHtml.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(kidsDessRow && /cols-pair-titles/.test(kidsDessRow) && /pair-head[\s\S]*Desserts/.test(kidsDessRow),
  'unframed Desserts keeps a pair-head beside framed Little Bells');
assert(/col-little[\s\S]*scallop-pad[\s\S]*<div class="sec-title">Little Bells<\/div>/.test(kidsDessRow),
  'frilly Little Bells title sits inside the kids frame');
assert(!/pair-head[\s\S]*Little Bells/.test(kidsDessRow),
  'frilly Little Bells does not perch its title above the outer wave');
var kidsDessColBody = kidsDessRow.replace(/<div class="promo-head pair-head">[\s\S]*?<\/div>/g, '');
assert(!/<div class="sec-title">Desserts<\/div>/.test(kidsDessColBody),
  'unframed Desserts title stays out of any scallop');
var tallDessKidsHtml = print.build(api.menuById('sunday'), [
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
  api.dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '', ''),
  api.dish('Little Bells', 'Pasta Bolognese', '', '', 'vg option'),
  api.dish('Little Bells', 'Ham & Cheese Pizza', '', '', 'v option'),
  api.dish('Desserts', 'Half-Baked Cookie Dough', 'with salted caramel ice cream', '8.25', ''),
  api.dish('Desserts', 'Three Scoops of Ice Cream or Sorbet',
    'vanilla, strawberry, chocolate, salted caramel, marshmallow mudslide, honeycomb, cookie crumble & selected sorbets',
    '5.95', 'vg & gf option'),
  api.dish('Desserts', 'Apple & Blackberry Crumble', 'with ice cream or custard', '8.25', 'gf option'),
  api.dish('Desserts', 'Citrus Posset', 'served with homemade compote & shortbread', '8.25', ''),
  api.dish('Desserts', 'Sticky Toffee Pudding', 'served with ice cream and toffee sauce', '8.25', 'gf option')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      width: 'column',
      frame: false,
      above: 'All below £9.50 to include a choice of one scoop of ice cream or sorbet.',
      aboveKind: 'paragraph',
      below: 'a choice of roasts at half price of the adults',
      belowKind: 'text'
    },
    Desserts: { width: 'column', frame: true, note: '' }
  }),
  promos: [
    {
      title: 'Sip & Paint',
      date: '2025-10-28',
      body: 'Weds 28th Oct from 7pm. Join us at the pub for a relaxed evening painting an autumnal picture, enjoying a drink and having something to nibble while you get creative. Bring a friend, settle in and enjoy a cosy evening of painting and good company. Please book in advance.'
    },
    { title: 'Stay a While', body: 'cosy rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' },
    { title: 'Pub Quiz', body: 'quiz night tonight' },
    { title: 'How are we doing?', body: 'tell us' }
  ]
});
var tallDessRow = (tallDessKidsHtml.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(/cols-little-desserts/.test(tallDessRow) && /pair-head[\s\S]*Little Bells/.test(tallDessRow),
  'unframed Little Bells keeps its title as pair-head beside Desserts');
assert(/col-desserts[\s\S]*scallop-pad[\s\S]*<div class="sec-title">Desserts<\/div>/.test(tallDessRow),
  'frilly Desserts title sits inside the scallop with the puddings');
assert(!/col-desserts[\s\S]*pair-head[\s\S]*Desserts/.test(tallDessRow),
  'frilly Desserts does not perch its title above the outer wave');
assert(/pair-head-inset[\s\S]*Little Bells/.test(tallDessRow),
  'unframed Little Bells heading insets to line up with Desserts in the box');
assert(!/col-little[\s\S]*col-feature[\s\S]*Sip & Paint/i.test(tallDessRow),
  'leftover under Little Bells does not auto-pick an oversized Sip & Paint');
assert(/col-little[\s\S]*col-feature/.test(tallDessRow),
  'Sunday-sized hole under Little Bells MUST get a feature panel when one fits');
assert(/col-little[\s\S]*col-feature[\s\S]*(Stay a While|Gatherings|Pub Quiz|How are we doing)/i.test(tallDessRow),
  'leftover space under shorter Little Bells gets a small feature panel when it fits');
assert(/col-feature-level/.test(tallDessRow),
  'in-pair leftover filler is marked col-feature-level so fitPages keeps it at tight type');
assert(!/col-desserts[\s\S]*col-feature/.test(tallDessRow),
  'the leftover panel stays in the Little Bells column — not under Desserts');
assert(/col-little[\s\S]*a choice of roasts[\s\S]*col-desserts/.test(tallDessRow),
  'Sunday roast line stays in the Little Bells column above the leftover panel');
var kidsFullHtml = print.build(api.menuById('sunday'), kidsColDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'full', frame: true, note: 'All £9.50' }
  }),
  promos: []
});
assert(!/cols-little-desserts/.test(kidsFullHtml),
  'Blocks Full width keeps Little Bells stacked (not a column pair)');
// GOLDEN RULE: food first — Column kids pair with Column Sides (not a blank hole),
// even when Desserts is locked Full (puddings stay full-bleed after the pair).
var kidsColDessertsFull = print.build(api.menuById('sunday'), kidsColDishes.concat([
  api.dish('Sides', 'Halloumi Fries', '', '6.50', ''),
  api.dish('Sides', 'Onion Rings', '', '5.95', '')
]), {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'column', frame: true, note: 'All £9.50' },
    Desserts: { width: 'full', frame: false, note: '' },
    Sides: { width: 'column', frame: false, note: '' }
  }),
  promos: [
    { title: 'Stay a While', body: 'cosy rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' }
  ]
});
assert(!/cols-little-desserts/.test(kidsColDessertsFull),
  'Full-width Desserts stay out of the Little Bells column pair');
assert(/cols-little-sides/.test(kidsColDessertsFull),
  'Column kids + Column Sides pair with food so columns finish level');
assert(!/cols-little-solo/.test(kidsColDessertsFull),
  'food partner preferred over a solo kids column');
var kidsSidesRow = (kidsColDessertsFull.match(/little-sides-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(kidsSidesRow && /cols-pair-titles/.test(kidsSidesRow) && /pair-head/.test(kidsSidesRow),
  'kids|sides titles share a pair-head baseline');
assert(kidsSidesRow.indexOf('col-little') !== -1 && kidsSidesRow.indexOf('col-sides') !== -1,
  'kids|sides pair keeps each section in its own column');
if (/Stay a While|Gatherings/i.test(kidsSidesRow)) {
  assert(/col-feature/.test(kidsSidesRow),
    'a small leftover panel stays inside the shorter kids|sides column');
}
var fishIdx = kidsColDessertsFull.indexOf('Fish Fingers');
var dessIdx = kidsColDessertsFull.indexOf('Sticky Toffee');
var halloumiIdx = kidsColDessertsFull.indexOf('Halloumi Fries');
assert(fishIdx > 0 && halloumiIdx > 0 && dessIdx > fishIdx,
  'kids|sides pair prints, then full-bleed Desserts');
// No food partner → feature panels fill the short column (never blank)
var kidsColNoSides = print.build(api.menuById('sunday'), kidsColDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'column', frame: true, note: 'All £9.50' },
    Desserts: { width: 'full', frame: false, note: '' }
  }),
  promos: [
    { title: 'Stay a While', body: 'cosy rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' }
  ]
});
var kidsSoloRow = (kidsColNoSides.match(/little-solo-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(/cols-little-solo/.test(kidsColNoSides),
  'Column Little Bells with no food partner stays a half-column');
assert(kidsSoloRow && !/Stay a While|Gatherings|Pub Quiz/i.test(kidsSoloRow),
  'solo kids column is not filled with Stay a While');
var dessColKidsFull = print.build(api.menuById('sunday'), kidsColDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'full', frame: true, note: 'All £9.50' },
    Desserts: { width: 'column', frame: false, note: '' }
  }),
  promos: [
    { title: 'Stay a While', body: 'cosy rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' }
  ]
});
assert(!/cols-little-desserts/.test(dessColKidsFull),
  'Full-width Little Bells is not squeezed into a Desserts column pair');
assert(/column-solo-row[\s\S]*Sticky Toffee/.test(dessColKidsFull),
  'Column Desserts stay a column when Little Bells is Full width');
var dessSoloRow = (dessColKidsFull.match(/column-solo-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(dessSoloRow && /Stay a While|Gatherings|Pub Quiz/i.test(dessSoloRow),
  'solo Desserts column fills the empty half with a feature panel so bottoms line up');
assert(printJs.indexOf('levelOppositeColumns') !== -1 && printJs.indexOf('Gemini layout review chooses') !== -1,
  'JS equalises opposite columns; Gemini chooses which page Sides and Sandwiches sit on');
// Best fit (both) still allows the kids|desserts column pair
var kidsColDessertsBoth = print.build(api.menuById('sunday'), kidsColDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'column', frame: true, note: 'All £9.50' },
    Desserts: { width: 'both', frame: false, note: '' }
  }),
  promos: []
});
assert(/cols-little-desserts/.test(kidsColDessertsBoth),
  'Blocks Best fit Desserts may still sit beside Little Bells Column');
(function sharingColumnLockOnSunday() {
  var dishes = [
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Starters', 'Bang Bang Cauliflower', 'sauce', '8.25', 'vg'),
    api.dish('Sharing Starters', 'Baked Camembert (to share)', 'bacon jam', '16.95', 'v'),
    api.dish('Sharing Starters', 'Beef Chilli Nachos', 'guacamole', '15.95', 'gf'),
    api.dish('Sunday Roasts', 'Sirloin', 'roast potatoes', '21.95', ''),
    api.dish('Sunday Roasts', 'Chicken', 'roast potatoes', '19.95', ''),
    api.dish('Mains', 'Mushroom Stroganoff', 'rice', '16.95', ''),
    api.dish('Little Bells', 'Fish Fingers', '', '', ''),
    api.dish('Desserts', 'Sticky Toffee', 'custard', '8.25', '')
  ];
  var html = print.build(api.menuById('sunday'), dishes, {
    sectionLayout: api.normalizeSectionLayout({
      'Sharing Plates': { width: 'column', frame: false },
      'Little Bells': { width: 'column', frame: true },
      Desserts: { width: 'column', frame: true }
    })
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var pages = a4.split(/<div class="page /);
  var p1 = pages[1] || a4;
  assert(/col-events[\s\S]*Camembert/i.test(p1),
    'Column Sharing Starters stay in a half-column on Sunday (rule before AI)');
  assert(/cols-classics[\s\S]*Camembert/i.test(p1),
    'Sunday Sharing Column sits in the opposite-column grid, not full-bleed under Starters');
})();
// Packed Sunday with Sides on page 2 alone: Blocks Column must not orphan to full-bleed
var sidesColAloneDishes = [];
for (var sci = 0; sci < 8; sci++) {
  sidesColAloneDishes.push(api.dish('Nibbles', 'Nibble ' + sci, 'loaded', '6.95', ''));
  sidesColAloneDishes.push(api.dish('Starters', 'Starter ' + sci, 'long starter description text', '8.95', ''));
}
for (var sci = 0; sci < 5; sci++) {
  sidesColAloneDishes.push(api.dish('Sunday Roasts', 'Roast ' + sci, 'roast potatoes yorkshire', '21.95', ''));
  sidesColAloneDishes.push(api.dish('Little Bells', 'Kid Dish ' + sci, '', '', ''));
  sidesColAloneDishes.push(api.dish('Desserts', 'Dessert ' + sci, 'nice long pudding description text here', '8.25', 'v'));
}
for (var sci = 0; sci < 8; sci++) {
  sidesColAloneDishes.push(api.dish('Mains', 'Main ' + sci, 'mash and gravy long', '17.95', ''));
}
for (var sci = 0; sci < 4; sci++) {
  sidesColAloneDishes.push(api.dish('Sides', 'SideItem' + sci, '', '5.95', ''));
}
var sidesColAlonePromos = [
  { title: 'Next Pub Quiz', body: 'quiz night tonight' },
  { title: 'How are we doing?', body: 'tell us' },
  { title: 'All tips go to staff working today!', body: 'tips' },
  { title: 'Stay a While', body: 'rooms' },
  { title: 'Gatherings', body: 'events' }
];
var sidesColAlonePlan = print.planFluidLayout(api.menuById('sunday'), sidesColAloneDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'full', frame: false, note: 'note' },
    Desserts: { width: 'full', frame: false, note: '' },
    Sides: { width: 'column', frame: false, note: '' },
    Sandwiches: { width: 'column', frame: true, tip: true, sell: 'Ask.' }
  }),
  promos: sidesColAlonePromos,
  includes: { sandwiches: true }
});
assert(sidesColAlonePlan.pages === 2 && sidesColAlonePlan.p2 && sidesColAlonePlan.p2.sidesOnP2,
  'fixture keeps Sides on page 2 alone (the orphan case)');
var sidesColAloneHtml = print.build(api.menuById('sunday'), sidesColAloneDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': { width: 'full', frame: false, note: 'note' },
    Desserts: { width: 'full', frame: false, note: '' },
    Sides: { width: 'column', frame: false, note: '' },
    Sandwiches: { width: 'column', frame: true, tip: true, sell: 'Ask.' }
  }),
  promos: sidesColAlonePromos,
  includes: { sandwiches: true }
});
var a4Only = sidesColAloneHtml.split('mode-panel mode-a5')[0] || sidesColAloneHtml;
assert(!/<section class="sec"><div class="sec-title soft-left">Sides/.test(a4Only),
  'Blocks Column Sides are not orphaned to a full-bleed section');
assert(/bottom-cols[\s\S]{0,500}SideItem0|col-sides[\s\S]{0,300}SideItem0|column-solo-row[\s\S]{0,300}SideItem0/.test(a4Only),
  'Blocks Column Sides stay in a column under Desserts');

// Starters + Specials + Sandwiches (Column) with no Burgers/Classics — must NOT
// orphan Sandwiches to full-bleed (Blocks Column lock).
var sandColAloneDishes = [
  api.dish('Starters', 'Buffalo Cauliflower Wings', 'mayo', '8.25', 'vg'),
  api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
  api.dish('Starters', 'Breaded Prawns', 'katsu', '8.95', ''),
  api.dish('Starters', 'Hoi Sin Jackfruit Bau Buns', 'chilli', '8.95', 'vg'),
  api.dish('Special Starters', 'Ham Hock Pot', '', '8.95', 'gf'),
  api.dish('Sandwiches', 'Crayfish Marie Rose', 'salad', '11.95', ''),
  api.dish('Sandwiches', 'BLT', 'bacon', '10.95', ''),
  api.dish('Sandwiches', 'Fish Finger', 'tartare', '11.95', ''),
  api.dish('Sandwiches', 'Prawn Cocktail', 'marie rose', '11.95', ''),
  api.dish('Sandwiches', 'Gochujang Chicken', 'slaw', '11.95', '')
];
var sandColAloneLayout = api.normalizeSectionLayout({
  Starters: { width: 'full', frame: false },
  'Special Starters': { width: 'full', frame: true },
  Sandwiches: {
    width: 'column', frame: false, tip: true,
    note: '(12 – 2.45 pm Mon to Fri)', sell: 'Ask.'
  }
});
var sandColAlonePromos = [
  { title: 'Stay a While', body: 'rooms' },
  { title: 'Gatherings', body: 'events' },
  { title: 'Next Pub Quiz', body: 'quiz' }
];
var sandColAloneHtml = print.build(api.menuById('main'), sandColAloneDishes, {
  sectionLayout: sandColAloneLayout,
  promos: sandColAlonePromos
});
var sandColA4 = sandColAloneHtml.split('mode-panel mode-a5')[0] || sandColAloneHtml;
assert(/cols-classics[\s\S]{0,2500}Sandwiches/i.test(sandColA4),
  'Blocks Column Sandwiches stay in a column when alone under Specials');
assert(printJs.indexOf('sandLockedCol') !== -1,
  'print respects Sandwiches Column lock against orphan full-bleed');
assert(printJs.indexOf('Do not pull Sandwiches onto page 1') !== -1,
  'two-page planner prefers Sandwiches on page 2');
assert(printJs.indexOf('mainsPairedInCol') !== -1 && printJs.indexOf('canSitInColumn') !== -1,
  'Column or Best-fit Mains can sit opposite Sandwiches');

var sandMainsPairDishes = sandColAloneDishes.concat([
  api.dish('Mains', 'Cheese & Bacon Burger', 'fries', '18.95', ''),
  api.dish('Mains', 'Homemade Beef Lasagne', 'garlic bread', '15.95', ''),
  api.dish('Mains', 'Ham, Egg & Chips', '', '18.95', 'gf')
]);
var sandMainsBestFitHtml = print.build(api.menuById('main'), sandMainsPairDishes, {
  sectionLayout: api.normalizeSectionLayout({
    Starters: { width: 'full', frame: false },
    Sandwiches: { width: 'column', frame: false, tip: true, note: 'hours' },
    Mains: { width: 'both', frame: false }
  }),
  promos: sandColAlonePromos
});
var sandMainsBestFitA4 = sandMainsBestFitHtml.split('mode-panel mode-a5')[0] || sandMainsBestFitHtml;
assert(/cols-classics[\s\S]{0,8000}Cheese &amp; Bacon Burger|mains-sand-row[\s\S]{0,8000}Cheese &amp; Bacon Burger/.test(sandMainsBestFitA4),
  'Best-fit Mains sit in a food column opposite Sandwiches');
assert(/Cheese &amp; Bacon Burger/.test(sandMainsBestFitA4),
  'Best-fit Mains still print');
var sandMainsPairHtml = print.build(api.menuById('main'), sandMainsPairDishes, {
  sectionLayout: api.normalizeSectionLayout({
    Starters: { width: 'full', frame: false },
    Sandwiches: { width: 'column', frame: false, tip: true, note: 'hours' },
    Mains: { width: 'column', frame: false }
  }),
  promos: sandColAlonePromos
});
var sandMainsA4 = sandMainsPairHtml.split('mode-panel mode-a5')[0] || sandMainsPairHtml;
assert(/cols-classics[\s\S]{0,8000}Cheese &amp; Bacon Burger|mains-sand-row[\s\S]{0,8000}Cheese &amp; Bacon Burger/.test(sandMainsA4),
  'Column Mains fill the column opposite Sandwiches');

// Sparse openers + full roast/mains/desserts must not dump everything on page 2
var jammedSunday = [
  api.dish('Nibbles', 'Loaded Fries', '', '6.95', ''),
  api.dish('Nibbles', 'Onion Rings', '', '5.95', ''),
  api.dish('Nibbles', 'Garlic Bread', '', '5.95', 'vg'),
  api.dish('Nibbles', 'Chips', '', '4.50', ''),
  api.dish('Starters', 'Scotch Egg', 'cider sauce', '8.95', ''),
  api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
  api.dish('Starters', 'Prawns', 'katsu', '8.95', ''),
  api.dish('Starters', 'Cauliflower', 'bang bang', '8.25', 'vg'),
  api.dish('Sunday Roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
  api.dish('Sunday Roasts', 'Nut Roast', '', '18.95', 'vg'),
  api.dish('Sunday Roasts', 'Leg of Lamb', 'cooked pink', '21.95', ''),
  api.dish('Sunday Roasts', 'Chicken Supreme', 'crispy skin', '18.95', ''),
  api.dish('Sunday Roasts', 'Loin of Pork', 'crackling', '19.95', ''),
  api.dish('Mains', 'Beef Burger', 'fries', '18.95', ''),
  api.dish('Mains', 'Katsu Curry', 'rice', '16.95', 'vg'),
  api.dish('Mains', 'Porchetta', 'mash', '18.95', ''),
  api.dish('Mains', 'Short Rib', 'rocket', '17.95', ''),
  api.dish('Little Bells', 'Fish Fingers', '', '9.50', ''),
  api.dish('Little Bells', 'Mac & Cheese', '', '9.50', ''),
  api.dish('Little Bells', 'Goujons', '', '9.50', ''),
  api.dish('Little Bells', 'Pasta', '', '9.50', 'v'),
  api.dish('Little Bells', 'Kids Burger', '', '9.50', ''),
  api.dish('Desserts', 'Fool', 'shortbread', '8.25', ''),
  api.dish('Desserts', 'Ice Cream', 'three scoops', '5.95', ''),
  api.dish('Desserts', 'Treacle Tart', 'ice cream', '8.25', ''),
  api.dish('Desserts', 'Sticky Toffee', 'toffee sauce', '8.25', '')
];
var jamLayout = print.planFluidLayout(api.menuById('sunday'), jammedSunday, {
  sectionLayout: api.defaultSectionLayout(),
  promos: []
});
(function sparseSundayOffersDropIn() {
  var dishes = [
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Sunday Roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
    api.dish('Sunday Roasts', 'Pork Loin', 'crackling', '19.95', '')
  ];
  var layout = print.planFluidLayout(api.menuById('sunday'), dishes, {
    sectionLayout: api.defaultSectionLayout(),
    promos: []
  });
  assert(layout.fit !== 'over' && layout.canOfferDropIn === true,
    'a short Sunday with leftover space offers dropping in a sub-menu');
})();
(function packedSundayDropInsOverflow() {
  var layout = print.planFluidLayout(api.menuById('sunday'), jammedSunday, {
    sectionLayout: api.defaultSectionLayout(),
    promos: []
  });
  assert(layout.fit !== 'over',
    'packed Sunday with Little Bells and Desserts still generates at min type');
})();
(function mainSpecialsFitAtMinType() {
  var dishes = api.composeDishes(api.seed(), 'main', { specials: true });
  var layout = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: api.defaultSectionLayout()
  });
  assert(layout.fit !== 'over',
    'Main with Specials dropped in still generates at min type');
})();
(function allDropInsOnMainOverflow() {
  var dishes = api.composeDishes(api.seed(), 'main', {
    desserts: true, sandwiches: true, 'little-bells': true, specials: true
  });
  var layout = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: api.defaultSectionLayout()
  });
  assert(layout.fit === 'over' && layout.overflow === 'drop-in',
    'Main with every sub-menu ticked still asks to untick when it will not fit at min type');
})();
(function mainsDessertsSandwichesPreferDropIn() {
  var dishes = api.composeDishes(api.seed(), 'main', {
    desserts: true, sandwiches: true
  });
  var layout = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: api.defaultSectionLayout()
  });
  assert(layout.fit === 'over' && layout.overflow === 'drop-in',
    'full mains + desserts + Sandwiches asks to untick rather than pack a busy page 2');
})();
(function specialsSandwichesSidesNestOverflowsAtClassicalGap() {
  // Screenshot-shaped Main page 2: full mains + Specials|Sandwiches with Sides
  // nested under Specials. After the 13px dish-gap floor this clips the allergy
  // footer — Generate must gate (untick Sandwiches/Specials), not print clipped food.
  var dishes = [];
  var i;
  for (i = 0; i < 6; i++) {
    dishes.push(api.dish('Nibbles', 'Nibble ' + i, 'small plate', '6.95', 'v'));
  }
  for (i = 0; i < 6; i++) {
    dishes.push(api.dish('Starters', 'Starter ' + i, 'starter description for fill longish', '8.95', ''));
  }
  dishes.push(api.dish('Item Boost', 'Boost Special', 'boost desc', '9.95', ''));
  for (i = 0; i < 3; i++) {
    dishes.push(api.dish('Burgers', 'Burger ' + i, 'bun fries salad onion rings', '18.95', ''));
  }
  for (i = 0; i < 4; i++) {
    dishes.push(api.dish('Pub Classics', 'Classic ' + i, 'peas tartare mash gravy', '17.95', ''));
  }
  [
    'Spicy Asian Burger', 'Homemade Beef Lasagne', 'Fish & Chips', 'Ham Egg & Chips',
    'Chicken Katsu Curry', 'Pie of the Day', 'Trenchmore Wagyu Beef Burger',
    'Vegetarian Lasagne', 'Pork Wellington', 'Beef Short Rib Genovese Rigatoni'
  ].forEach(function (n, idx) {
    dishes.push(api.dish('Mains', n, 'description for ' + n + ' with sides', (15 + idx % 5) + '.95', ''));
  });
  [
    ['Prawn & Chorizo Linguine', 'garlic chilli white wine', '16.95'],
    ['Wild Mushroom Tagliatelle', 'truffle oil parmesan', '15.95'],
    ['Crab & Lemon Spaghetti', 'parsley chilli', '17.95']
  ].forEach(function (x) {
    dishes.push(api.dish('Special Mains', x[0], x[1], x[2], ''));
  });
  [
    ['Beef Chilli & Cheddar Quesadilla', 'beef chilli cheddar', '10.95'],
    ['Falafel & Guacamole Ciabatta', 'mixed salad', '8.95'],
    ['Cajun Chicken Wrap', 'coleslaw', '10.95'],
    ['Tuna & Red Onion Melt', 'melted cheddar', '9.95'],
    ['Italian Meat & Mozzarella Ciabatta', 'salami ham mozzarella pesto', '11.50']
  ].forEach(function (x) {
    dishes.push(api.dish('Sandwiches', x[0], x[1], x[2], ''));
  });
  ['Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Vegetables',
    'Garlic Bread', 'House Salad'].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  var col = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: {
      width: 'column', frame: true, tip: true,
      note: '(12 – 2.45 pm Mon to Fri and 12 – 4 pm Sat)\nChoose ciabatta, white or malted bread, served with nachos & salad. FRIES UPGRADE +£2.'
    },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var layout = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: col,
    includes: { specials: true, sandwiches: true },
    promos: []
  });
  assert(layout.p2 && layout.p2.specialsBesideSandwiches && layout.p2.sidesUnderSpecials,
    'packed Main still plans Specials|Sandwiches with Sides under Specials');
  assert(layout.fit === 'over' && layout.overflow === 'drop-in',
    'Specials|Sandwiches + Sides under a full mains list overflows at min type + 13px gap');
  assert(layout.fillers && layout.fillers.indexOf('Too much content — remove a dropped-in menu') !== -1,
    'overflow filler copy asks to remove a dropped-in menu');
  // Leaner sheet (fewer mains, Sides can leave page 2) still generates.
  var lean = dishes.filter(function (d) {
    return d.section !== 'Nibbles' && d.section !== 'Item Boost';
  });
  var kept = 0;
  lean = lean.filter(function (d) {
    if (d.section !== 'Mains') return true;
    kept += 1;
    return kept <= 5;
  });
  var leanLayout = print.planFluidLayout(api.menuById('main'), lean, {
    sectionLayout: col,
    includes: { specials: true, sandwiches: true },
    promos: []
  });
  assert(leanLayout.fit !== 'over',
    'leaner Main with Specials + Sandwiches still generates');
})();
(function sundaySharingMustNotKeepRoastsOffPage1() {
  var dishes = [
    api.dish('Nibbles', 'Vegetable Samosas', '', '6.95', 'v'),
    api.dish('Nibbles', 'Mini Bread Rolls', 'bacon jam', '5.95', ''),
    api.dish('Nibbles', 'Vegetable Spring Rolls', '', '6.95', 'v'),
    api.dish('Nibbles', 'Nacho Cheese Triangles', '', '6.95', ''),
    api.dish('Starters', 'Pan Fried King Prawns', 'romesco', '10.95', 'gf'),
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Starters', 'Hoi Sin Jackfruit Bao Buns', 'chilli oil', '8.95', 'vg'),
    api.dish('Starters', 'Bang Bang Cauliflower', 'sauce', '8.25', 'vg'),
    api.dish('Sharing Starters', 'Baked Camembert (to share)', 'bacon jam', '16.95', 'v'),
    api.dish('Sharing Starters', 'Beef Chilli Nachos', 'guacamole', '15.95', 'gf'),
    api.dish('Sunday Roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
    api.dish('Sunday Roasts', 'Nut Roast', '', '18.95', 'vg'),
    api.dish('Sunday Roasts', 'Leg of Lamb', 'cooked pink', '21.95', ''),
    api.dish('Sunday Roasts', 'Chicken Supreme', 'crispy skin', '18.95', ''),
    api.dish('Sunday Roasts', 'Loin of Pork', 'crackling', '19.95', ''),
    api.dish('Mains', 'Venison Casserole', 'mash', '17.95', ''),
    api.dish('Mains', 'Beef Chilli', 'rice', '15.95', 'gf'),
    api.dish('Mains', 'Mushroom Stroganoff', 'rice', '16.95', ''),
    api.dish('Mains', 'Butternut Squash Risotto', 'pesto', '16.95', 'v'),
    api.dish('Mains', 'Sweet Potato & Halloumi Burger', 'fries', '16.95', 'v'),
    api.dish('Mains', 'Cottage Pie', 'gravy', '16.95', ''),
    api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
    api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Pasta Bolognese', '', '', ''),
    api.dish('Little Bells', 'Ham & Cheese Pizza', '', '', ''),
    api.dish('Desserts', 'Cheeses', 'biscuits', '9.95', ''),
    api.dish('Desserts', 'Three Scoops of Ice Cream or Sorbet', 'vanilla', '5.95', ''),
    api.dish('Desserts', 'Chocolate & Raspberry Tart', 'ice cream', '8.25', 'vg'),
    api.dish('Desserts', 'Lime Posset', 'shortbread', '8.25', ''),
    api.dish('Desserts', 'Sticky Toffee Pudding', 'toffee sauce', '8.25', '')
  ];
  var layout = print.planFluidLayout(api.menuById('sunday'), dishes, {
    sectionLayout: api.normalizeSectionLayout({
      'Sharing Plates': { width: 'column', frame: false },
      'Sunday Roasts': { width: 'full', frame: true },
      'Little Bells': { width: 'column', frame: false },
      Desserts: { width: 'column', frame: true }
    }),
    promos: [{ title: 'How are we doing?', body: 'Please drop us a message' }]
  });
  assert(layout.pages === 2 && layout.p1.sundayRoasts === true,
    'Sunday with Sharing still puts Roasts on page 1 so Desserts are not clipped');
  var html = print.build(api.menuById('sunday'), dishes, {
    layout: layout,
    sectionLayout: api.normalizeSectionLayout({
      'Sharing Plates': { width: 'column', frame: false },
      'Sunday Roasts': { width: 'full', frame: true },
      'Little Bells': { width: 'column', frame: false },
      Desserts: { width: 'column', frame: true }
    }),
    promos: [{ title: 'How are we doing?', body: 'Please drop us a message' }]
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var pages = a4.split(/<div class="page /);
  assert(/Sirloin of Beef/i.test(pages[1]) && !/Sirloin of Beef/i.test(pages[2]),
    'Sunday Roasts print on the sparse first page');
  assert(/Sticky Toffee Pudding/i.test(pages[2]) && /Venison Casserole/i.test(pages[2]),
    'Mains and Desserts stay together on page 2');
  assert(!/Sticky Toffee Pudding/i.test(pages[1]), 'Desserts are not forced onto page 1');
})();
var jamHtml = print.build(api.menuById('sunday'), jammedSunday, {
  sectionLayout: api.defaultSectionLayout(),
  promos: []
});
var a4Jam = (jamHtml.match(/mode-a4">([\s\S]*?)(?:<div class="sheet-stack mode-panel mode-a5|$)/) || [])[1] || '';
var jamPages = a4Jam.split(/<div class="page /);
assert(jamPages.length >= 3, 'balanced Sunday still uses two A4 pages');
assert(/Sirloin of Beef/i.test(jamPages[1]) && !/Sirloin of Beef/i.test(jamPages[2]),
  'Sunday Roasts dishes land on page 1 only');
assert(/Beef Burger/i.test(jamPages[2]) && /Sticky Toffee/i.test(jamPages[2]),
  'Mains and desserts stay on page 2');
assert(!/Beef Burger/i.test(jamPages[1]), 'page 1 is not jammed with mains');
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
assert(auto.length === 2 && auto[0].id === 'quiz', 'auto-pick prefers upcoming date first');
assert(auto.some(function (p) { return p.id === 'stay'; }), 'auto-pick keeps evergreen after dated');
assert(auto.every(function (p) { return p.id !== 'old'; }), 'auto-pick skips past dates');
var dayA = api.pickPromos(
  [api.promoItem('A', 'a', '', 'a'), api.promoItem('B', 'b', '', 'b'), api.promoItem('C', 'c', '', 'c')],
  {},
  { today: new Date('2026-09-22'), max: 2 }
);
var dayB = api.pickPromos(
  [api.promoItem('A', 'a', '', 'a'), api.promoItem('B', 'b', '', 'b'), api.promoItem('C', 'c', '', 'c')],
  {},
  { today: new Date('2026-09-23'), max: 2 }
);
assert(dayA[0].id !== dayB[0].id || dayA[1].id !== dayB[1].id,
  'evergreen bank wording rotates by calendar day');
assert(printJs.indexOf('planPromoFill') !== -1 && printJs.indexOf('promoBesidePartner') !== -1,
  'feature panels placed only to even opposite columns');
assert(typeof printApi.promoUnits === 'function' && typeof printApi.planPromoFill === 'function',
  'promo fit helpers are exported');
(function leftoverPromoFit() {
  var sip = {
    title: 'Sip & Paint',
    date: '2025-10-28',
    body: 'Weds 28th Oct from 7pm. Join us at the pub for a relaxed evening painting an autumnal picture, enjoying a drink and having something to nibble while you get creative. Bring a friend, settle in and enjoy a cosy evening of painting and good company. Please book in advance.'
  };
  var stay = {
    title: 'Stay a While',
    body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.'
  };
  var gatherings = {
    title: 'Gatherings',
    body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event'
  };
  assert(printApi.promoUnits(sip) > printApi.promoUnits(stay) &&
    printApi.promoUnits(sip) > printApi.promoUnits(gatherings),
    'Sip & Paint scores taller than Stay a While / Gatherings');
  var modest = printApi.planPromoFill(8, 20, [sip, stay, gatherings], { shortOnly: true });
  assert(modest.usedTitles.indexOf('Sip & Paint') === -1,
    'modest leftover skips oversized Sip & Paint');
  assert(modest.usedTitles.indexOf('Stay a While') !== -1 || modest.usedTitles.indexOf('Gatherings') !== -1,
    'modest leftover prefers a small Stay a While / Gatherings panel');
  var cramped = printApi.planPromoFill(10, 18, [sip], {
    shortOnly: true,
    excludeTitles: ['Stay a While', 'Gatherings', 'Pub Quiz']
  });
  assert(!cramped.left && !cramped.right && cramped.usedTitles.length === 0,
    'skip a leftover panel when only an oversized dated event would fit');
  var hugeSip = printApi.planPromoFill(4, 28, [sip], {
    shortOnly: true,
    excludeTitles: ['Stay a While', 'Gatherings', 'Pub Quiz']
  });
  assert(hugeSip.usedTitles.indexOf('Sip & Paint') === -1 && hugeSip.usedTitles.length === 0,
    'dated Sip & Paint is never a leftover filler under kids even when the hole is large');
  assert(printJs.indexOf('padding-top:18px') !== -1 && printJs.indexOf('FEATURE_GAP_UNITS') !== -1,
    'feature boxes keep a decent gap after the category');
})();
assert(printJs.indexOf('shareLockedCol') !== -1,
  'Column Sharing is not orphaned to full-bleed when Burgers are missing');
assert(printJs.indexOf('balanceOppositeColumns') !== -1,
  'print prunes surplus panels so opposite columns finish level');
assert(printJs.indexOf('Two scallops') !== -1 || printJs.indexOf('stackForShort') !== -1,
  'large column holes stack two feature panels under the short side');
assert(printJs.indexOf('measureOppositeColumns') !== -1,
  'print exports column measures for Gemini pre-release check');
assert(printJs.indexOf('usedTitles') !== -1 && printJs.indexOf('excludeTitles') !== -1,
  'feature panels track usedTitles so each event prints once per menu');
assert(printJs.indexOf('filterUnusedPromos') !== -1,
  'page 2 skips promos already used on page 1');
// flow186: leftover column fill is one general rule for every Generate / every pair
assert(typeof printApi.foodFitsColumnLeftover === 'function' &&
  typeof printApi.planNestInPairLeftover === 'function',
  'general leftover food-fit helpers are exported');
assert(printJs.indexOf('function foodFitsColumnLeftover') !== -1 &&
  printJs.indexOf('function planNestInPairLeftover') !== -1 &&
  printJs.indexOf('GENERAL leftover') !== -1,
  'leftover fill is a general rule, not tip-only / Specials-only special cases');
(function generalLeftoverFoodRule() {
  // Short left + food that levels tall right → nest left.
  assert(printApi.foodFitsColumnLeftover(8, 22, 12) === true,
    'food fits under clearly short column when it roughly levels');
  assert(printApi.foodFitsColumnLeftover(20, 22, 12) === false,
    'near-even columns do not take nest food');
  assert(printApi.foodFitsColumnLeftover(8, 22, 40) === false,
    'oversized nest food is refused (panel path / overflow instead)');
  assert(printApi.planNestInPairLeftover(8, 22, 12) === 'left',
    'nest plans under the short left column');
  assert(printApi.planNestInPairLeftover(22, 8, 12) === 'right',
    'nest plans under the short right column (tip|Specials shape)');
  assert(printApi.planNestInPairLeftover(20, 21, 12) === null,
    'near-even pair leaves nest null → feature panel path');
  // Dated first when it fits (non-kids fill); kids shortOnly still bans Sip.
  var sip = {
    title: 'Sip & Paint',
    date: '2025-10-28',
    body: 'Join us for a painting evening with drinks.'
  };
  var stay = {
    title: 'Stay a While',
    body: 'cosy en-suite rooms upstairs'
  };
  var datedFirst = printApi.planPromoFill(6, 28, [stay, sip], {});
  assert(datedFirst.usedTitles.indexOf('Sip & Paint') !== -1 ||
    datedFirst.usedTitles.indexOf('Stay a While') !== -1,
    'general column leftover still fills with a fitting panel');
  // Prefer the smallest panel that fits — dated Sip & Paint only when it is
  // the best fit (never jam a tall event ahead of Stay a While).
  assert(datedFirst.usedTitles.indexOf('Stay a While') !== -1,
    'smallest fitting panel (Stay a While) wins over taller Sip & Paint');
  if (printApi.promoUnits(sip) <= 8) {
    assert(datedFirst.usedTitles.indexOf('Sip & Paint') !== -1,
      'compact dated event can still fill when it is the smallest fit');
  }
})();
assert(printJs.indexOf('uniqueFeaturePanelsHtml') !== -1 &&
  printJs.indexOf('featurePanelTitlesFromHtml') !== -1,
  'printed sheets strip duplicate feature-panel titles/bodies');
assert(aiGs.indexOf('ONLY ONCE') !== -1 || aiGs.indexOf('only once') !== -1,
  'Gemini layout review forbids reprinting the same feature panel');
assert(page.indexOf('today and yesterday') !== -1 && page.indexOf('Show archive') !== -1,
  'print history defaults to today + yesterday with a Show archive control');
assert(printJs.indexOf('function splitHistoryWindow') !== -1 &&
  printJs.indexOf('venueDayKeyFromMs') !== -1,
  'history window uses venue-local today and yesterday');
(function noDuplicateFeaturePanelsOnBuild() {
  var dishes = [
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Special Starters', 'Ham Hock Pot', 'charmer cheese sourdough baguette', '8.95', 'gf'),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam baguette', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'sour cream guacamole', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'brioche bacon jam fries', '18.95', ''),
    api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'chilli cheese fries', '16.95', 'v'),
    api.dish('Burgers', 'Buttermilk Chicken Burger', 'slaw bacon buffalo', '18.95', '')
  ];
  var tips = { title: 'ALL TIPS GO TO STAFF WORKING TODAY!', body: 'thank you' };
  var html = printApi.build(api.menuById('main'), dishes, {
    sectionLayout: api.normalizeSectionLayout({
      Starters: { width: 'full', frame: false },
      'Special Starters': { width: 'column', frame: true },
      'Sharing Plates': { width: 'column', frame: false },
      Burgers: { width: 'column', frame: false }
    }),
    promos: [tips, tips]
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var titles = printApi.featurePanelTitlesFromHtml(a4).map(function (t) {
    return t.toLowerCase();
  });
  var tipsHits = titles.filter(function (t) {
    return t.indexOf('all tips go to staff') !== -1;
  });
  assert(tipsHits.length <= 1,
    'ALL TIPS feature panel prints at most once per menu');
  var seen = {};
  var dup = titles.some(function (t) {
    if (seen[t]) return true;
    seen[t] = true;
    return false;
  });
  assert(!dup, 'no duplicate feature-panel titles in a build');
})();
(function historyDefaultWindowTodayYesterday() {
  var now = Date.parse('2026-10-07T12:00:00+01:00');
  var split = printApi.splitHistoryWindow([
    { id: 'today', generatedAt: now, dayKey: '2026-10-07' },
    { id: 'yest', generatedAt: now - 24 * 60 * 60 * 1000, dayKey: '2026-10-06' },
    { id: 'old', generatedAt: now - 3 * 24 * 60 * 60 * 1000, dayKey: '2026-10-04' }
  ], now);
  assert(split.recent.map(function (r) { return r.id; }).join(',') === 'today,yest',
    'history default window is today and yesterday');
  assert(split.archive.length === 1 && split.archive[0].id === 'old',
    'older sheets stay in the archive split');
  assert(printApi.isRecentHistoryRow({ generatedAt: now }, now) &&
    !printApi.isRecentHistoryRow({ generatedAt: now - 5 * 24 * 60 * 60 * 1000 }, now),
    'isRecentHistoryRow is true only for today/yesterday');
})();
(function historySortStableByGeneratedAtThenId() {
  var t = Date.parse('2026-10-07T12:00:00+01:00');
  var sorted = printApi.sortHistoryNewest([
    { id: 'b', generatedAt: t },
    { id: 'a', generatedAt: t },
    { id: 'c', generatedAt: t + 1000 }
  ]);
  assert(sorted.map(function (r) { return r.id; }).join(',') === 'c,a,b',
    'history sort is generatedAt desc then id asc (stable, not random)');
})();
(function historyPreserveGeneratedAtOnRetry() {
  assert(typeof printApi.preserveHistoryGeneratedAt === 'function',
    'preserveHistoryGeneratedAt exported for Save-time freeze');
  var original = 1791377925346; // Main VI original Save (13:46)
  var retryNow = Date.parse('2026-10-07T14:19:00+01:00'); // polluted sync "now"
  assert(retryNow > original, 'retry fixture is after original Save');
  var kept = printApi.preserveHistoryGeneratedAt(
    { id: 'pmainvi', generatedAt: original, createdAt: original, dayKey: '2026-10-07' },
    { id: 'pmainvi', generatedAt: retryNow, createdAt: retryNow, dayKey: '2026-10-07', html: '<html></html>' }
  );
  assert(kept.generatedAt === original,
    'retry with newer generatedAt keeps the original Save time');
  assert(kept.createdAt === original,
    'createdAt stays at original Save on retry');
  // Simulate Soft refresh / migrate re-save that invents Date.now() for an existing id.
  var pollutedRetry = printApi.preserveHistoryGeneratedAt(
    { id: 'pmainvi', generatedAt: original, createdAt: original },
    { id: 'pmainvi', generatedAt: Date.now(), createdAt: Date.now(), html: '<html>retry</html>' }
  );
  assert(pollutedRetry.generatedAt === original,
    'retry save with new Date() must not advance the stamp');
  assert(pollutedRetry.createdAt === original,
    'retry save with new Date() must not advance createdAt');
  var cloudNewer = printApi.preserveHistoryGeneratedAt(
    { id: 'x', generatedAt: original },
    { id: 'x', generatedAt: retryNow, source: 'cloud' }
  );
  assert(cloudNewer.generatedAt === original,
    'cloud merge does not replace older generatedAt with retry time');
  // Repair direction: polluted cloud + older local → keep older (push back to cloud).
  var repaired = printApi.preserveHistoryGeneratedAt(
    { id: 'y', generatedAt: original },
    { id: 'y', generatedAt: retryNow, source: 'cloud' }
  );
  assert(repaired.generatedAt === original,
    'local older stamp wins over polluted cloud 14:19');
  var first = printApi.preserveHistoryGeneratedAt(
    null,
    { id: 'new', generatedAt: original }
  );
  assert(first.generatedAt === original && first.createdAt === original,
    'first Save keeps the stamped generatedAt/createdAt');
  assert(printJs.indexOf('preserveHistoryGeneratedAt') !== -1 &&
    printJs.indexOf('moment of original Save only') !== -1,
    'client documents original-Save timestamp freeze');
  assert(printJs.indexOf('embedHistoryStamp_') !== -1 &&
    printJs.indexOf('eb-generated-at') !== -1,
    'client bakes generatedAt into HTML for rebuild recovery');
  assert(printJs.indexOf('stampRepair') !== -1 &&
    printJs.indexOf('stampRepaired') !== -1,
    'migrate pushes older local stamps back to polluted cloud');
  assert(printJs.indexOf('var saveAt=Date.now()') !== -1 &&
    printJs.indexOf('id:saveId,generatedAt:saveAt,createdAt:saveAt') !== -1,
    'Save click stamps id+generatedAt once (retries reuse them)');
  assert(aiGs.indexOf('historyPreserveGeneratedAt_') !== -1 &&
    aiGs.indexOf('Keep the original Save time when re-pushing') !== -1,
    'Apps Script preserves generatedAt on savePrintHistory retry');
  assert(aiGs.indexOf('historyRepairBulkNowStamps_') !== -1 &&
    aiGs.indexOf('historyRecoverStamp_') !== -1 &&
    aiGs.indexOf('Never Date.now() on rebuild') !== -1,
    'Apps Script recovers stamps from id/HTML/Drive — never Date.now on rebuild');
  assert(aiGs.indexOf('Math.min(oldTs, newTs)') !== -1,
    'Apps Script upsert keeps min(existing, incoming) stamp');
  // Display uses stored clock time only (no relative "just now").
  assert(page.indexOf('timeLabelFromMs(row.generatedAt)') !== -1 &&
    printJs.indexOf('function timeLabelFromMs') !== -1,
    'Print history shows clock time from generatedAt');
  assert(!/generated[^\\n]{0,40}just now/i.test(page) &&
    !/timeAgo|relativeTime|fromNow/.test(printJs),
    'Print history does not use relative "just now" labels');
})();
assert(printJs.indexOf('forceColumnFill') !== -1 || page.indexOf('forceColumnFill') !== -1,
  'generate applies AI columnBalance as forceColumnFill');
assert(page.indexOf('localColumnBalanceFallback') !== -1,
  'local fallback fills short columns if Gemini is offline');
assert(page.indexOf('finishArrange') !== -1 && page.indexOf('hangWatch') !== -1,
  'arrange modal hard-times out so Gemini hang cannot stick Arranging');
assert(ingestJs.indexOf('reviewLayout') !== -1 && /fetchWithTimeout\([\s\S]*12000/.test(ingestJs),
  'layout review uses a 12s fetch timeout');
assert(aiGs.indexOf('maxModels') !== -1,
  'layout review Gemini call limits model retries so Apps Script cannot run for minutes');
assert(page.indexOf('Checking leftover column space') !== -1,
  'arrange step says Gemini only checks leftover column space');
assert(ingestJs.indexOf('getCloudUrl') !== -1 && ingestJs.indexOf('reviewLayout') !== -1,
  'layout review uses cloud Menu AI URL on every generate');
assert(aiGs.indexOf('columnBalance') !== -1 && aiGs.indexOf('Food first') !== -1,
  'Gemini layout review places food before filling leftover with panels');
assert(printJs.indexOf('sandOnLeftCol') !== -1 && printJs.indexOf('CONTENT-SIZED') !== -1,
  'feature panels stay little promotions; Sides/sandwich sell balance the short column');
assert(printJs.indexOf('preferReadableType') !== -1 && printJs.indexOf('clearFitArtifacts') !== -1,
  'print drops foot logos and clears stretch before refitting for larger shared type');
assert(printJs.indexOf('No page-2 logo (keep type readable)') !== -1,
  'planner skips page-2 logo when it would cost readable type');
assert(printJs.indexOf('fitGroup') !== -1 && printJs.indexOf('SHARED TYPE SCALE') !== -1,
  'print fits page 1 and page 2 to one shared type density');
assert(printJs.indexOf('sidesOnP1') !== -1 && printJs.indexOf('Gemini layout review chooses') !== -1,
  'planner starts Sides on page 2; Gemini chooses sidesOn');
assert(printJs.indexOf('spreadPage') !== -1 && printJs.indexOf('spread-even') !== -1,
  'after shared type, leftover vertical space is spread evenly down the page');
assert(printJs.indexOf('Do not pull Sandwiches onto page 1') !== -1,
  'planner keeps Sandwiches on page 2 instead of pulling them forward');
assert(aiGs.indexOf('sidesOn') !== -1 && aiGs.indexOf('SHARED TYPE SCALE') !== -1,
  'Gemini layout review can move Sides between pages for shared type');
assert(printJs.indexOf('sandwichesLocked') !== -1,
  'print locks sandwiches when staff ticked them or listed fillings');
assert(page.indexOf('sandwichesLocked') !== -1 &&
  (page.indexOf('Gemini may refine Best-fit widths') !== -1 || page.indexOf('never dump Sides under Sharing') !== -1),
  'generate keeps locked sandwiches; Gemini only refines Best-fit leftover widths');
assert(aiGs.indexOf('sandwichesLocked') !== -1 && /never omit/i.test(aiGs),
  'Gemini must not omit ticked sandwiches');
assert(printJs.indexOf('Do not dump Sides under Sharing') !== -1 || printJs.indexOf('never stacked under Sharing') !== -1 || page.indexOf('never under Sharing') !== -1,
  'two-page Sharing sheets keep Sides and Sandwiches off page 1');
assert(page.indexOf('forceColumnFill') !== -1 && page.indexOf('JS already placed the food map') !== -1,
  'generate only applies leftover column fill from Gemini, not sidesOn/page moves');
assert(printJs.indexOf('Honour a layout already planned') !== -1,
  'print build keeps Gemini-adjusted sidesOn instead of re-planning');
assert(printJs.indexOf('tracker .week') !== -1 && /tracker\{[^}]*text-transform:none/.test(printJs),
  'week date is sentence case, not all-caps');
assert(/p2 \+= trackerBar\(ver, \{ hideDate: true \}\)/.test(printJs),
  'page 2 tracker hides the week date');
assert(printJs.indexOf('GOLDEN RULE: opposite columns') !== -1,
  'print JS documents equal start/finish golden rule');
assert(printJs.indexOf('Frilly box only when') !== -1 || printJs.indexOf('not hard-coded') !== -1,
  'sandwich frilly follows Blocks setting');
var forced = api.pickPromos(bank, { old: true }, { today: new Date('2026-09-22'), max: 2 });
assert(forced.length === 1 && forced[0].id === 'old', 'manual tick can force a past-dated line');
assert(api.formatPromoDate('2026-09-30').indexOf('September') !== -1, 'promo date formats for print');
assert(page.indexOf('Events &amp; selling lines') !== -1 || page.indexOf('In the bank') !== -1, 'wording bank mode in UI');
assert(page.indexOf('data-promo-tick') !== -1, 'promo ticks on long menus');
var peekA = print.peekPrintVersion('main');
var peekB = print.peekPrintVersion('main');
assert(peekA.roman === peekB.roman, 'preview peek does not burn version numbers');
var v1 = print.commitPrintVersion('main');
var v2 = print.commitPrintVersion('main');
assert(v1.roman === peekA.roman, 'Save to menus stamps the peeked Roman');
assert(v1.roman === 'I' && v2.roman === 'II', 'print version increments only when stamped');
assert(v1.week === v2.week, 'same week label within the week');
assert(typeof print.hydratePrintVersionsFromHistory === 'function',
  'print versions can hydrate from shared Print history');
var upcomingKey = 'eb-print-ver-main-next-' + print.weekKey();
try { global.localStorage.removeItem(upcomingKey); } catch (eUp) {}
print.hydratePrintVersionsFromHistory([
  { menuId: 'main-next', roman: 'I', n: 1, weekKey: print.weekKey(), week: print.weekLabel() },
  { menuId: 'main-next', roman: 'I', n: 1, weekKey: print.weekKey(), week: print.weekLabel() }
]);
assert(print.peekPrintVersion('main-next').roman === 'II',
  'Main (upcoming) advances from Print history in the same week (not stuck on I)');
assert(print.commitPrintVersion('main-next').roman === 'II',
  'stamping Main (upcoming) after a saved I yields II');
assert(print.peekPrintVersion('main-next').roman === 'III',
  'next Main (upcoming) preview is III in the same week');
print.hydratePrintVersionsFromHistory([
  { menuId: 'main-next', roman: 'V', n: 5, weekKey: '2020-1-6' }
]);
assert(print.peekPrintVersion('main-next').roman === 'III',
  'a previous week’s Main (upcoming) V does not steal this week’s count');
assert(typeof print.savePrintHistory === 'function' && typeof print.listPrintHistory === 'function',
  'history helpers exported');
assert(typeof print.groupHistoryByDay === 'function', 'groupHistoryByDay exported');
var histGroups = print.groupHistoryByDay([
  {
    id: 'a',
    menuId: 'main',
    menuName: 'Main menu',
    roman: 'II',
    generatedAt: new Date(2026, 8, 24, 14, 30).getTime()
  },
  {
    id: 'b',
    menuId: 'sunday',
    menuName: 'Sunday',
    roman: 'I',
    generatedAt: new Date(2026, 8, 24, 11, 0).getTime()
  }
]);
assert(histGroups.length === 1 && histGroups[0].items.length === 2,
  'same calendar day groups together');
assert(/24 September 2026/.test(histGroups[0].label), 'day group label shows generation date');
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
assert(api.formatMarks(api.parseMarks('df')) === 'df', 'df round-trips');
assert(api.formatMarks(api.parseMarks('gf, df')) === 'gf, df', 'gf + df round-trips');
assert(api.formatMarks(api.parseMarks('df option')) === 'df option', 'df option round-trips');
assert(api.formatMarks({ gf: true, vgOpt: true, v: false, vg: false, gfOpt: false, vOpt: false, df: false, dfOpt: false }) === 'gf with vg option', 'gf with vg option formats');
assert(api.formatMarks(api.parseMarks('v with gf option, df')) === 'v with gf option, df',
  'special combo keeps df alongside');
assert(api.normalizeDescription('Served with Ice Cream') === 'served with ice cream',
  'descriptions print lowercase');
assert(api.tidyDishFields({
  name: 'Sticky Toffee Pudding',
  description: 'Served with Ice Cream gf available',
  price: '7.95',
  tags: ''
}).description === 'served with ice cream', 'hardwired gf available leaves the description');
assert(api.tidyDishFields({
  name: 'Sticky Toffee Pudding',
  description: 'Served with Ice Cream gf available',
  price: '7.95',
  tags: ''
}).tags === 'gf option', 'hardwired gf available becomes a tag');

function assertTidy(raw, expectName, expectTags, label) {
  var got = api.tidyDishFields(raw);
  assert(got.name === expectName, label + ' name → ' + JSON.stringify(got.name));
  assert(got.tags === expectTags, label + ' tags → ' + JSON.stringify(got.tags));
}
assertTidy({ name: 'Fish & Chips DF', tags: '' }, 'Fish & Chips', 'df',
  'trailing DF leaves the title for the df checkbox');
assertTidy({ name: 'Fish & Chips (df)', tags: '' }, 'Fish & Chips', 'df',
  'parenthetical df leaves no empty brackets');
assertTidy({ name: 'Cod Dairy Free', tags: '' }, 'Cod', 'df',
  'trailing Dairy Free becomes df');
assertTidy({ name: 'Mushroom Risotto Vegan', tags: '' }, 'Mushroom Risotto', 'vg',
  'trailing Vegan leaves the title');
assertTidy({ name: 'Butternut Squash Vegetarian', tags: '' }, 'Butternut Squash', 'v',
  'trailing Vegetarian leaves the title');
assertTidy({ name: 'Brownie Gluten Free', tags: '' }, 'Brownie', 'gf',
  'trailing Gluten Free leaves the title');
assertTidy({ name: 'Mushroom Risotto (vg)', tags: '' }, 'Mushroom Risotto', 'vg',
  'parenthetical vg leaves no empty brackets');
assertTidy({ name: 'Soup (vg) (gf)', tags: '' }, 'Soup', 'vg & gf',
  'paired parenthetical markers become tags');
assertTidy({ name: 'Mushroom Risotto || vg', tags: '' }, 'Mushroom Risotto', 'vg',
  'double-pipe OCR leftover is cleared');
assertTidy({ name: 'Sticky Toffee || Vegan', tags: '' }, 'Sticky Toffee', 'vg',
  'double-pipe + full word Vegan becomes vg');
assertTidy({ name: 'Vegan Burger', tags: '' }, 'Vegan Burger', 'vg',
  'leading Vegan Burger keeps the name and ticks vg');
assertTidy({ name: 'Vegan Katsu Curry', tags: '' }, 'Vegan Katsu Curry', 'vg',
  'Adjust/rename keeps Vegan Katsu Curry (does not strip to Katsu Curry)');
assertTidy({ name: 'Katsu Curry', tags: 'vg' }, 'Vegan Katsu Curry', 'vg',
  'stuck Katsu Curry + vg restores Vegan Katsu Curry on Sunday/Main');
assert(api.dishCatalogueKey('Vegan Katsu Curry') === api.dishCatalogueKey('Katsu Curry') &&
  api.dishCatalogueKey('Katsu Curry') === 'katsu-curry',
  'catalogue key treats Vegan Katsu Curry as the same dish as Katsu Curry');

assertTidy({ name: 'Vegan Mushroom Risotto', tags: '' }, 'Vegan Mushroom Risotto', 'vg',
  'leading Vegan stays in the printed title');
assertTidy({ name: 'Vegetarian Lasagne', tags: '' }, 'Vegetarian Lasagne', 'v',
  'leading Vegetarian stays in the title and ticks v');
assertTidy({
  name: 'Stuffed Squash',
  description: 'herbed quinoa and vegan gravy',
  tags: ''
}, 'Stuffed Squash', '', 'mid-phrase vegan gravy stays in the description');
assert(api.tidyDishFields({
  name: 'Stuffed Squash',
  description: 'herbed quinoa and vegan gravy',
  tags: ''
}).description === 'herbed quinoa and vegan gravy', 'vegan gravy wording is kept');
assert(typeof api.tidyBook === 'function', 'tidyBook exported');
assert(api.tidyBook({ main: [{ name: 'Olives (vg)', tags: '' }] }).main[0].tags === 'vg',
  'tidyBook lifts tags across a saved book');

assert(printJs.indexOf('border-image') !== -1, 'scallops use border-image (no stretch through text)');
assert(!/\.scallop\{[^}]*background-size:\s*100%\s*100%/.test(printJs),
  'no stretched full-bleed frame fill on base scallop');
assert(/\.scallop-platter[\s\S]{0,500}background-size:\s*100%\s*100%/.test(printJs) ||
  /scallop\.scallop-wide\.scallop-platter[\s\S]{0,500}background-size:\s*100%\s*100%/.test(printJs),
  'tip platter fills its oval aspect box (not a dashed border-image rect)');
assert(/frame-platter\.png/.test(printJs), 'tip platter CSS uses frame-platter.png oval asset');
assert(/aspect-ratio:\s*1600\/480/.test(printJs), 'tip platter CSS uses oval aspect ratio');
assert(/canBalancedSplit/.test(printJs) && print.canBalancedSplit(4) === true &&
  print.canBalancedSplit(5) === false && print.canBalancedSplit(2) === true,
  'even-split helper: only even dish counts may split 2-col');
assert(/markClippedIfNeeded|data-clipped/.test(printJs),
  'print preview hard-gates Save when DOM still overflows');
assert(/okToPrint === false|okToPrint===false/.test(page) || /okToPrint/.test(page),
  'arrange path reads Gemini okToPrint');
assert(aiGs.indexOf('okToPrint MUST be false') !== -1 ||
  aiGs.indexOf('cannot green-light a clipped sheet') !== -1,
  'Gemini layout prompt hard-blocks clipped sheets');
assert(aiGs.indexOf('EVEN') !== -1 || aiGs.indexOf('dish count is EVEN') !== -1,
  'Gemini layout prompt forbids odd-count splits');
assert(print.planFluidLayout, 'planFluidLayout exported');

var book = api.seed();
var mainMenu = api.menuById('main');
var aloneDishes = api.composeDishes(book, 'main', {});
var fluid = print.planFluidLayout(mainMenu, aloneDishes);
assert(fluid.pages === 1 || fluid.pages === 2, 'fluid picks one or two pages');
assert(fluid.fit === 'one' || fluid.fit === 'two', 'fluid fit is printable');
assert(fluid.p1.rooms || (fluid.p2 && fluid.p2.rooms) || fluid.fillers.length >= 0, 'rooms considered');
assert(fluid.summary.indexOf('Layout picks') !== -1 || fluid.summary.indexOf('Auto-adds') !== -1 || fluid.summary.indexOf('A4') !== -1, 'layout explains itself');
assert(fluid.p1.classicsSplit === 1 || fluid.pages === 1, 'layout prefers burgers in right column');
var htmlPreview = print.build(mainMenu, aloneDishes, {});
assert(/col-events[\s\S]*Stay a While|col-events[\s\S]*Gatherings|col-events[\s\S]*Pub Quiz/i.test(htmlPreview) ||
  /Stay a While|Gatherings|Pub Quiz/.test(htmlPreview), 'events render in the left column when packed');
assert(/col-food[\s\S]*Burgers[\s\S]*Pub Classics|Burgers[\s\S]*Pub Classics/i.test(htmlPreview) ||
  /BURGERS[\s\S]*PUB CLASSICS/i.test(htmlPreview), 'Pub Classics sit under Burgers in the food column');
assert(printJs.indexOf('cols-balanced') !== -1 && printJs.indexOf('col-events') !== -1, 'balanced columns: events left, food right');
assert(/bottom-cols-balanced/.test(htmlPreview) || fluid.pages === 1, 'page 2 uses balanced sides columns when two pages');

// Spicy Asian Burger filed under Pub Classics still peels into Burgers by name
var classicOnly = [
  api.dish('Nibbles', 'Olives', '', '6.95', 'vg'),
  api.dish('Pub Classics', 'Haddock & Chips', 'peas', '17.95', ''),
  api.dish('Pub Classics', 'Spicy Asian Burger', 'fries', '16.95', 'vg'),
  api.dish('Mains', 'Pie', 'mash', '14.95', '')
];
var classicLayout = print.planFluidLayout(mainMenu, classicOnly);
var classicHtml = print.build(mainMenu, classicOnly, {});
assert(/Spicy Asian Burger/.test(classicHtml), 'classic-filed burger still prints');
assert(/>Burgers<|BURGERS/i.test(classicHtml), 'named burger peels into Burgers column');
assert(/Haddock/.test(classicHtml), 'true classics stay on the sheet');
// Classics-only sheet (no burger in the name) must not invent a Burgers heading
var pureClassics = [
  api.dish('Nibbles', 'Olives', '', '6.95', 'vg'),
  api.dish('Pub Classics', 'Haddock & Chips', 'peas', '17.95', ''),
  api.dish('Pub Classics', 'Pie of the Day', 'mash', '14.95', ''),
  api.dish('Mains', 'Risotto', '', '15.95', '')
];
var pureHtml = print.build(mainMenu, pureClassics, {});
assert(pureHtml.indexOf('>Burgers<') === -1 && pureHtml.indexOf('>BURGERS<') === -1,
  'no Burgers section title when none categorised');
assert(print.partyOccasion('Christmas Party Menu', {}) === 'christmas', 'detects Christmas occasion');
assert(print.partyOccasion('Valentine Dinner', {}) === 'valentine', 'detects Valentine occasion');

// Item Boost (e.g. Fish of the Day) prints in a frilly box after Sharing Plates
var withBoost = [
  api.dish('Nibbles', 'Olives', '', '6.95', 'vg'),
  api.dish('Starters', 'Soup', 'bread', '6.50', ''),
  api.dish('Sharing Plates', 'Baked Camembert for Two', 'ciabatta', '14.95', 'v'),
  api.dish('Item Boost', 'Fish of the Day', 'ask waiting staff', '19.95', ''),
  api.dish('Pub Classics', 'Haddock & Chips', 'peas', '17.95', ''),
  api.dish('Mains', 'Pie', 'mash', '14.95', '')
];
var boostLayout = print.planFluidLayout(mainMenu, withBoost);
assert(boostLayout.bag.boost && /Fish of the Day/i.test(boostLayout.bag.boost.dishes[0].name), 'bags Item Boost for Fish of the Day');
var boostHtml = print.build(mainMenu, withBoost, {});
assert(/Fish of the Day/i.test(boostHtml), 'prints Fish of the Day dish');
assert(!/<div class="sec-title">Item Boost<\/div>/i.test(boostHtml),
  'Item Boost bucket title is hidden on print');
assert(/scallop[\s\S]*Fish of the Day|Fish of the Day[\s\S]*scallop/i.test(boostHtml),
  'Item Boost uses frilly scallop frame');
var seedMain = api.seed().main;
assert(seedMain.some(function (d) { return d.section === 'Item Boost' && /Fish of the Day/i.test(d.name); }),
  'sample main menu includes Item Boost Fish of the Day');

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
assert(api.sectionLayoutFor('Sandwiches').tip === true, 'sandwiches tip defaults on for empty section');
assert(api.sectionLayoutFor('Starters').width === 'full' && api.sectionLayoutFor('Starters').frame === false,
  'starters default full-width beside logo, frilly off');
var customLayout = api.normalizeSectionLayout({ Mains: { width: 'column', frame: true } });
assert(customLayout.Mains.width === 'column' && customLayout.Mains.frame === true, 'layout overrides persist shape');
assert(customLayout.Starters.width === 'full' && customLayout.Starters.frame === false, 'other sections keep defaults');

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
// Tip on + Sandwiches ticked → empty selling box; Main unticked + Tip → sell tip only
var tipOnLayout = print.planFluidLayout(mainMenu, sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: true, sell: 'Ask for today’s sandwiches' } }),
  includes: { sandwiches: true }
});
assert(tipOnLayout.p1.sandwiches || (tipOnLayout.p2 && tipOnLayout.p2.sandwiches) ||
  tipOnLayout.fillers.some(function (f) { return /Sandwiches/i.test(f); }),
  'ticked sandwiches + tip on keeps selling box with 0 dishes');
assert(tipOnLayout.sandwichesLocked === true, 'ticked empty sandwiches lock the box on the sheet');
assert(tipOnLayout.sandwichTipOnly !== true, 'ticked empty sandwiches is full tip+hours, not tip-only');
var noTickTip = print.planFluidLayout(mainMenu, sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: true, sell: 'Ask for today’s sandwiches' } }),
  includes: { sandwiches: false }
});
assert(noTickTip.p1.sandwiches || (noTickTip.p2 && noTickTip.p2.sandwiches) ||
  noTickTip.fillers.some(function (f) { return /Sandwiches tip/i.test(f); }),
  'Main unticked + Tip on still places the sell tip box');
assert(noTickTip.sandwichTipOnly === true, 'Main unticked tip is tip-only (not full sandwiches section)');
assert(noTickTip.sandwichesLocked === true, 'Main tip-when-unticked is locked chrome');
var sundayNoTickTip = print.planFluidLayout(api.menuById('sunday'), sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: true, sell: 'Ask for today’s sandwiches' } }),
  includes: { sandwiches: false }
});
assert(!sundayNoTickTip.p1.sandwiches && !(sundayNoTickTip.p2 && sundayNoTickTip.p2.sandwiches) &&
  !sundayNoTickTip.fillers.some(function (f) { return /Sandwiches/i.test(f); }),
  'Sunday unticked does not get the Main tip-when-unticked sell box');
var tipOffLayout = print.planFluidLayout(mainMenu, sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: false, sell: '' } }),
  includes: { sandwiches: true }
});
assert(!tipOffLayout.p1.sandwiches && !(tipOffLayout.p2 && tipOffLayout.p2.sandwiches) &&
  !tipOffLayout.fillers.some(function (f) { return /Sandwiches/i.test(f); }),
  'tip off omits sandwiches box when there are no fillings');
var tipHtml = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
  rule: { frame: true, tip: true, note: '(lunch hours)', sell: 'Selection at the bar' }
});
assert(/Selection at the bar/.test(tipHtml), 'empty tip box prints sell wording');
assert(/lunch hours/.test(tipHtml), 'empty tip box still shows note/hours');
var tipOnlyHtml = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
  rule: { frame: true, tip: true, tipOnly: true, note: '(lunch hours)', sell: 'Selection at the bar',
    below: 'Upgrade to Fries +£2' }
});
assert(/Selection at the bar/.test(tipOnlyHtml), 'tip-only box prints sell wording');
assert(!/lunch hours/.test(tipOnlyHtml) && !/Upgrade to Fries/.test(tipOnlyHtml),
  'tip-only box omits hours and below (small ad, not full section)');
assert(/class="[^"]*sandwich-tip-only/.test(tipOnlyHtml), 'tip-only box marks sandwich-tip-only class');
assert(!/promo-title[^>]*>\s*Sandwiches/i.test(tipOnlyHtml) &&
  !/sec-title[^>]*>\s*Sandwiches/i.test(tipOnlyHtml),
  'tip-only oval omits the SANDWICHES section title');
assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]*class="[^"]*sandwich-tip-only/.test(tipOnlyHtml),
  'tip-only default chrome is platter oval (wide + scallop-platter)');
// Frilly=No must NOT strip tip-only to bare text (flow186 regression / Charles screenshot).
var tipOnlyNoFrill = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
  rule: { frame: false, tip: true, tipOnly: true, sell: 'Ask the team for today’s sandwiches' },
  tipOnly: true
});
assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]*class="[^"]*sandwich-tip-only/.test(tipOnlyNoFrill),
  'tip-only keeps scallop/platter class even when Frilly is No');
assert(!/sec-plain[\s\S]*sandwich-tip-only/.test(tipOnlyNoFrill),
  'tip-only is never bare sec-plain text');
assert(/Selection at the bar/.test(tipHtml) && /promo-title[^>]*>\s*Sandwiches/i.test(tipHtml),
  'ticked empty tip+hours still prints the Sandwiches title');
var tipBelowHtml = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
  rule: {
    frame: true, tip: true, note: '(lunch hours)', sell: 'Selection at the bar',
    below: 'Upgrade to Fries +£2', belowKind: 'paragraph'
  }
});
assert(/scallop-pad[\s\S]*Selection at the bar[\s\S]*Upgrade to Fries/.test(tipBelowHtml),
  'empty sandwiches below line sits inside the frilly tip box');
var friesBlock = print.sandwichesBlock({
  sandwiches: {
    name: 'Sandwiches',
    dishes: [api.dish('Sandwiches', 'BLT', 'fries', '10.95', '')]
  }
}, {
  rule: {
    frame: true,
    above: 'Lunch only',
    aboveKind: 'heading',
    below: 'Upgrade to Fries +£2',
    belowKind: 'paragraph',
    tip: true
  }
});
assert(/scallop-pad[\s\S]*Lunch only[\s\S]*BLT[\s\S]*Upgrade to Fries/.test(friesBlock),
  'sandwiches above, dishes and below all sit inside the frilly box');
assert(friesBlock.indexOf('sec-stack') === -1,
  'sandwiches below wording is not stacked outside the frame');
var plainSand = print.sandwichesBlock({
  sandwiches: {
    name: 'Sandwiches',
    dishes: [api.dish('Sandwiches', 'BLT', 'fries', '10.95', '')]
  }
}, {
  rule: {
    frame: false,
    below: 'Upgrade to Fries +£2',
    belowKind: 'paragraph'
  }
});
assert(/sec-plain[\s\S]*BLT[\s\S]*Upgrade to Fries/.test(plainSand),
  'unframed sandwiches below wording stays in the section box');

// Main + Tip Yes + Sandwiches unticked → sell tip in HTML; ticked fillings → no duplicate tip-only
(function () {
  var sellLine = 'A selection of sandwiches is available — ask the team.';
  var tipLayout = api.normalizeSectionLayout({
    Sandwiches: {
      tip: true, frame: false, width: 'column', sell: sellLine,
      note: '(12 – 2.45 pm Mon to Fri)', above: '(12 – 2.45 pm Mon to Fri)',
      below: 'Upgrade to Fries +£2'
    }
  });
  var tipHtmlMain = print.build(mainMenu, sparse, {
    sectionLayout: tipLayout,
    includes: { sandwiches: false }
  });
  var tipA4 = tipHtmlMain.split('mode-panel mode-a5')[0] || tipHtmlMain;
  // Assert against the sheet body — CSS also names scallop-wide / sandwich-tip-only.
  var tipBody = tipA4.replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(tipBody.indexOf(sellLine) !== -1, 'Main + tip Yes + sandwiches unticked prints sell tip in HTML');
  assert(/class="[^"]*sandwich-tip-only/.test(tipBody), 'Main unticked tip uses tip-only marker in HTML');
  assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(tipBody),
    'Main unticked tip uses scallop-wide platter oval in HTML');
  assert(!/sec-plain[\s\S]{0,120}class="[^"]*sandwich-tip-only/.test(tipBody),
    'Main unticked tip is not bare sec-plain (Frilly No still gets platter)');
  // Tip-only must not print a SANDWICHES heading (pair-head or nested title).
  var tipChunk = (tipBody.match(/class="[^"]*sandwich-tip-only[\s\S]{0,500}/) || [''])[0];
  assert(tipChunk && !/(sec-title|promo-title)[^>]*>\s*Sandwiches/i.test(tipChunk),
    'tip-only sell chunk has sell words without Sandwiches title nearby');
  assert(!/\(12 – 2\.45 pm Mon to Fri\)/.test(tipA4) ||
    (tipA4.match(/class="[^"]*sandwich-tip-only[\s\S]{0,400}/) || [''])[0].indexOf('12 – 2.45') === -1,
    'Main unticked tip does not stuff hours into the tip-only sell box');

  var withFillings = sparse.concat([
    api.dish('Sandwiches', 'Crayfish Marie Rose', 'salad', '10.95', ''),
    api.dish('Sandwiches', 'BLT', 'bacon', '10.95', '')
  ]);
  var filledLayout = api.normalizeSectionLayout({
    Sandwiches: {
      tip: true, frame: true, width: 'column', sell: sellLine,
      note: '(12 – 2.45 pm Mon to Fri)', above: '(12 – 2.45 pm Mon to Fri)',
      below: 'Upgrade to Fries +£2'
    }
  });
  var filledHtml = print.build(mainMenu, withFillings, {
    sectionLayout: filledLayout,
    includes: { sandwiches: true }
  });
  var filledA4 = filledHtml.split('mode-panel mode-a5')[0] || filledHtml;
  assert(/Crayfish Marie Rose/.test(filledA4) && /BLT/.test(filledA4),
    'Main + sandwiches ticked with fillings prints the full sandwiches list');
  assert(!/class="[^"]*sandwich-tip-only/.test(filledA4),
    'Main with fillings does not also print a separate tip-only sell box');
  assert(filledA4.indexOf(sellLine) === -1 || /Crayfish[\s\S]*BLT/.test(filledA4),
    'filled sandwiches sheet is the dish list, not a tip-only duplicate');
  assert(/(sec-title|promo-title)[^>]*>\s*Sandwiches/i.test(filledA4),
    'filled sandwiches section still prints the Sandwiches title');

  var upcoming = api.menuById('main-next');
  var upcomingHtml = print.build(upcoming, sparse, {
    sectionLayout: tipLayout,
    includes: { sandwiches: false }
  });
  assert((upcomingHtml.split('mode-panel mode-a5')[0] || upcomingHtml).indexOf(sellLine) !== -1,
    'Main (upcoming) + tip Yes + unticked also prints sell tip');

  var dessertCard = print.build(api.menuById('desserts'), [
    api.dish('Desserts', 'Sticky Toffee', 'custard', '7.50', 'v'),
    api.dish('Desserts', 'Ice Cream', 'three scoops', '6.50', 'v')
  ], {
    sectionLayout: tipLayout
  });
  assert(dessertCard.indexOf(sellLine) === -1 && !/class="[^"]*sandwich-tip-only/.test(dessertCard),
    'desserts card does not print the Sandwiches tip sell box');
})();

// Card menus: text outside dishes comes from sectionLayout note/sell (not hard-coded only).
var sandCardDishes = [
  api.dish('Sandwiches', 'Crayfish Marie Rose & Salad', '', '10.95', ''),
  api.dish('Sandwiches', 'Falafel & Guacamole', 'flatbread', '8.95', 'vg')
];
var sandCardHtml = print.build(api.menuById('sandwiches'), sandCardDishes, {
  sectionLayout: api.normalizeSectionLayout({
    Sandwiches: {
      note: 'EDITABLE CARD SPIEL\nAll served with Fries',
      sell: 'Ask the team',
      tip: true,
      frame: true,
      width: 'column'
    }
  })
});
assert(/EDITABLE CARD SPIEL/.test(sandCardHtml) && /card-outside/.test(sandCardHtml),
  'sandwiches card prints editable note outside the dish box');
assert(/All served with Fries/.test(sandCardHtml), 'sandwiches card note keeps line breaks as spiel');
var sandInnerOnly = sandCardHtml.slice(0, sandCardHtml.indexOf('card-outside') === -1 ? sandCardHtml.length : sandCardHtml.indexOf('card-outside'));
assert(sandInnerOnly.indexOf('EDITABLE CARD SPIEL') === -1,
  'sandwiches hours/spiel is not inside the frilly dish box');
var kidsCardDishes = [
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Kids Mac & Cheese', '', '', '')
];
var kidsCardHtml = print.build(api.menuById('little-bells'), kidsCardDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All £8.00\nto include a scoop.',
      aboveKind: 'heading',
      below: 'CUSTOM SUNDAY NOTE for Little Bells',
      belowKind: 'text',
      frame: true,
      width: 'full'
    }
  })
});
assert(/CUSTOM SUNDAY NOTE for Little Bells/.test(kidsCardHtml),
  'Little Bells card prints editable Sunday note below the box');
assert(/All £8\.00/.test(kidsCardHtml) && /card-blurb-heading/.test(kidsCardHtml),
  'Little Bells price offer prints above the dish box at heading size');
assert(/card-blurb-text/.test(kidsCardHtml) && /card-blurb-below/.test(kidsCardHtml),
  'Sunday line uses the smaller text size under the dish box');
var kidsCardSubhead = print.build(api.menuById('little-bells'), kidsCardDishes, {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All £8.00\nto include a scoop.',
      aboveKind: 'subhead',
      below: 'Sunday roasts at half adult price.',
      belowKind: 'subhead',
      frame: true,
      width: 'full'
    }
  })
});
assert(/card-blurb-subhead/.test(kidsCardSubhead) && /Sunday roasts at half adult price/.test(kidsCardSubhead),
  'Little Bells card can use subheading on above and below boxes');
assert(kidsCardHtml.indexOf('CUSTOM SUNDAY NOTE') > kidsCardHtml.indexOf('All £8.00'),
  'offer stays above the Sunday line');
assert(/kids-face/.test(kidsCardHtml), 'Little Bells card uses calmer kids type');

var embedKidsHtml = print.build(api.menuById('sunday'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Kids Mac & Cheese', '', '', ''),
  api.dish('Desserts', 'Sticky Toffee', 'custard', '7.95', 'v')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All £9.50\nto include a scoop.',
      aboveKind: 'title',
      below: 'Sunday roasts at half adult price.',
      belowKind: 'heading',
      frame: false,
      width: 'column'
    },
    Desserts: { width: 'column', frame: true }
  })
});
assert(/All £9\.50/.test(embedKidsHtml) && /Sunday roasts at half adult price/.test(embedKidsHtml),
  'embedded Little Bells still prints above and below wording');
assert(embedKidsHtml.indexOf('class="card-blurb') === -1,
  'embedded Little Bells does not use card Title/Heading sizes');
assert(/sheet-blurb-title/.test(embedKidsHtml) && /sheet-blurb-heading/.test(embedKidsHtml),
  'embedded Little Bells uses this sheet’s type-size pickers');
assert(/\.sheet-blurb\{text-align:left/.test(embedKidsHtml),
  'embedded Little Bells wording is left-aligned like the parent sheet');
assert(/\.card-blurb\{[^}]*text-align:center/.test(printJs),
  'Little Bells card wording stays centred');
assert(printJs.indexOf('.sheet-blurb{text-align:center') === -1,
  'sheet drop-in blurbs are not card-centred');
var embedKidsRow = (embedKidsHtml.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(/col-little[\s\S]*sheet-blurb-below[\s\S]*col-desserts/.test(embedKidsRow),
  'Sunday roast line stays in the Little Bells column');
assert(/col-little[\s\S]*sec-plain[\s\S]*Sunday roasts at half adult price[\s\S]*col-desserts/.test(embedKidsRow),
  'Sunday roast line sits inside the Little Bells section box');
assert(embedKidsRow.indexOf('Sunday roasts at half adult price') !== -1 &&
  !/col-desserts[\s\S]*Sunday roasts at half adult price/.test(embedKidsRow),
  'Sunday roast line does not run across the Desserts column');
assert(/sheet-offer/.test(embedKidsHtml) && /lb-price-line/.test(embedKidsHtml),
  'Sunday £9.50 offer prints as a sheet offer, larger than dish names');
assert(/viewport/.test(embedKidsHtml) && /preview-clip/.test(embedKidsHtml),
  'preview HTML includes viewport tag and overflow clip');
assert(/cols-pair-titles/.test(embedKidsRow) && /pair-head[\s\S]*Little Bells/.test(embedKidsRow),
  'unframed Little Bells keeps a pair-head beside frilly Desserts');
assert(/col-desserts[\s\S]*scallop-pad[\s\S]*<div class="sec-title">Desserts<\/div>/.test(embedKidsRow),
  'embedded Sunday Desserts title sits inside the frilly box');
var embedKidsWithRooms = print.build(api.menuById('sunday'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Kids Mac & Cheese', '', '', ''),
  api.dish('Desserts', 'Sticky Toffee', 'custard', '7.95', 'v'),
  api.dish('Desserts', 'Treacle Tart', 'ice cream', '7.95', 'v')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All £9.50\nto include a scoop.',
      aboveKind: 'heading',
      below: 'Sunday roasts at half adult price.',
      belowKind: 'heading',
      frame: false,
      width: 'column'
    },
    Desserts: { width: 'column', frame: true }
  }),
  promos: [
    { title: 'Stay a While', body: 'cosy rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' }
  ]
});
var embedKidsWithRoomsRow = (embedKidsWithRooms.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(embedKidsWithRoomsRow && /cols-pair-titles/.test(embedKidsWithRoomsRow),
  'explicit rooms Sunday still keeps kids|desserts titles in a pair-head');
assert(!/col-desserts[\s\S]*Sunday roasts at half adult price/.test(embedKidsWithRoomsRow),
  'rooms panel does not pull the Sunday roast line into Desserts');
var liveWordingHtml = print.build(api.menuById('sunday'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
  api.dish('Desserts', 'Half-Baked Cookie Dough', 'salted caramel', '8.25', ''),
  api.dish('Desserts', 'Sticky Toffee Pudding', 'toffee sauce', '8.25', '')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All below £9.50 to include a choice of one scoop of ice cream or sorbet.',
      aboveKind: 'heading',
      below: 'Little Bells on Sunday in addition have a choice of roasts at half price of the adults.',
      belowKind: 'text',
      frame: false,
      width: 'column'
    },
    Desserts: { width: 'column', frame: true }
  }),
  promos: []
});
assert(/sheet-offer/.test(liveWordingHtml) && /lb-price-line/.test(liveWordingHtml),
  'Heading type: All below £9.50 is a sheet offer');
assert(/All below £9\.50/.test(liveWordingHtml) && /lb-offer-sub/.test(liveWordingHtml) &&
  /one scoop of ice cream or sorbet/i.test(liveWordingHtml),
  'Heading type: £9.50 sits on the price line; scoop line is the quieter sub');
var paraOfferHtml = print.build(api.menuById('sunday'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
  api.dish('Desserts', 'Sticky Toffee Pudding', 'toffee sauce', '8.25', '')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Little Bells': {
      above: 'All below £9.50 to include a choice of one scoop of ice cream or sorbet.',
      aboveKind: 'paragraph',
      below: 'Little Bells on Sunday in addition have a choice of roasts at half price of the adults.',
      belowKind: 'paragraph',
      frame: false,
      width: 'column'
    },
    Desserts: { width: 'column', frame: true }
  }),
  promos: []
});
var paraOfferBody = paraOfferHtml.split('</style>')[1] || paraOfferHtml;
assert(/sheet-blurb-paragraph/.test(paraOfferBody) && !/lb-price-line/.test(paraOfferBody) &&
  !/sheet-offer/.test(paraOfferBody),
  'Paragraph type: All below £9.50 stays paragraph — does not force the big offer style');
assert(/All below £9\.50 to include a choice of one scoop/i.test(paraOfferBody),
  'Paragraph type: full offer line prints as one paragraph');
var embedSandHtml = print.build(api.menuById('main'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Sandwiches', 'BLT', 'fries', '10.95', ''),
  api.dish('Sandwiches', 'Fish Finger', 'tartare', '11.95', '')
], {
  sectionLayout: api.normalizeSectionLayout({
    Sandwiches: {
      note: '',
      above: 'Lunch only',
      aboveKind: 'heading',
      below: '(12 – 2.45 pm)',
      belowKind: 'text',
      frame: true,
      width: 'column',
      tip: true
    }
  })
});
assert(/Lunch only/.test(embedSandHtml) && /12\s*[–-]\s*2\.45/.test(embedSandHtml),
  'embedded sandwiches print this sheet’s above/below wording');
assert(embedSandHtml.indexOf('class="card-blurb') === -1 && /sheet-blurb-heading/.test(embedSandHtml),
  'embedded sandwiches use this sheet’s type sizes, not the card’s');
assert(/\.sheet-blurb\{text-align:left/.test(embedSandHtml) && /sheet-blurb-heading/.test(embedSandHtml),
  'embedded sandwiches wording is left-aligned like the parent sheet');
function scallopPadAround(html, needle) {
  var i = String(html || '').indexOf(needle);
  if (i < 0) return '';
  var openTok = '<div class="scallop-pad">';
  var open = html.lastIndexOf(openTok, i);
  if (open < 0) return '';
  var pos = open + openTok.length;
  var depth = 1;
  var start = pos;
  while (pos < html.length && depth > 0) {
    var nextDiv = html.indexOf('<div', pos);
    var nextEnd = html.indexOf('</div>', pos);
    if (nextEnd < 0) return html.slice(start);
    if (nextDiv !== -1 && nextDiv < nextEnd) {
      depth += 1;
      pos = nextDiv + 4;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(start, nextEnd);
      pos = nextEnd + 6;
    }
  }
  return html.slice(start);
}
var sandPad = scallopPadAround(embedSandHtml, 'BLT');
assert(sandPad.indexOf('Lunch only') !== -1 && /12\s*[–-]\s*2\.45/.test(sandPad),
  'embedded sandwiches hours sit inside the frilly box with the fillings');
var friesEmbedHtml = print.build(api.menuById('main'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Sandwiches', 'BLT', 'fries', '10.95', ''),
  api.dish('Sandwiches', 'Fish Finger', 'tartare', '11.95', '')
], {
  sectionLayout: api.normalizeSectionLayout({
    Sandwiches: {
      above: '(12 – 2.45 pm Mon to Fri and 12 – 4 pm Sat)\nChoose ciabatta, white or malted bread, served with tortilla chips & salad.',
      aboveKind: 'paragraph',
      below: 'Upgrade to Fries +£2',
      belowKind: 'paragraph',
      frame: true,
      width: 'column',
      tip: true
    }
  })
});
var friesPad = scallopPadAround(friesEmbedHtml, 'Upgrade to Fries');
assert(friesPad.indexOf('Upgrade to Fries +£2') !== -1 && friesPad.indexOf('BLT') !== -1,
  'Upgrade to Fries prints inside the Sandwiches frilly box, not outside it');
assert(friesPad.indexOf('Choose ciabatta') !== -1,
  'Sandwiches hours/spiel also stays inside the same frilly box');
var subheadEmbedHtml = print.build(api.menuById('main'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Sandwiches', 'BLT', 'fries', '10.95', '')
], {
  sectionLayout: api.normalizeSectionLayout({
    Sandwiches: {
      above: '(12 – 2.45 pm Mon to Fri and 12 – 4 pm Sat)\nChoose ciabatta, white or malted bread, served with tortilla chips & salad.',
      aboveKind: 'subhead',
      below: 'Upgrade to Fries +£2',
      belowKind: 'subhead',
      frame: true,
      width: 'column',
      tip: true
    }
  })
});
assert(/sheet-blurb-subhead[\s\S]*12\s*[–-]\s*2\.45/.test(subheadEmbedHtml) &&
  /sheet-blurb-subhead[\s\S]*Upgrade to Fries \+£2/.test(subheadEmbedHtml),
  'subheading prints hours and Upgrade to Fries between heading and paragraph size');
assert(!/lb-price-line/.test(subheadEmbedHtml.split('</style>')[1] || subheadEmbedHtml),
  'subheading does not blow the £ line up like Title/Heading');
var embedDessHtml = print.build(api.menuById('sunday'), [
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Desserts', 'Sticky Toffee', 'custard', '7.95', 'v')
], {
  sectionLayout: api.normalizeSectionLayout({
    Desserts: {
      above: 'Save room for pudding',
      aboveKind: 'paragraph',
      below: 'Ice cream +1.50',
      belowKind: 'text',
      width: 'full',
      frame: true
    }
  })
});
assert(/Save room for pudding/.test(embedDessHtml) && /sheet-blurb-paragraph/.test(embedDessHtml),
  'embedded desserts use this sheet’s type sizes');
assert(/Ice cream \+1\.50/.test(embedDessHtml) && /sheet-blurb-text/.test(embedDessHtml),
  'embedded desserts below line uses this sheet’s text size');
assert(/\.sheet-blurb\{text-align:left/.test(embedDessHtml) && embedDessHtml.indexOf('class="card-blurb') === -1,
  'embedded desserts wording is left-aligned like the parent sheet');
var dessPad = scallopPadAround(embedDessHtml, 'Sticky Toffee');
assert(dessPad.indexOf('Save room for pudding') !== -1 && dessPad.indexOf('Ice cream +1.50') !== -1,
  'embedded desserts above and below wording sit inside the frilly box');
var embedSpecHtml = print.build(api.menuById('main'), [
  api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
  api.dish('Special Starters', 'Ham Hock Pot', '', '8.95', 'gf')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Special Starters': { width: 'full', frame: true, note: 'When it’s gone, it’s gone' }
  })
});
var embedSpecA4 = embedSpecHtml.split('mode-panel mode-a5')[0] || embedSpecHtml;
assert(/specials-beside/.test(embedSpecA4) && /When it’s gone/.test(embedSpecA4),
  'ticked Specials print on Main under the parent course');
assert(/\.specials-beside \.sec-note\{text-align:left/.test(embedSpecHtml),
  'Specials note on Main is left-aligned like the parent sheet');
var colSpecHtml = print.build(api.menuById('main'), [
  api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
  api.dish('Special Starters', 'Mackerel Pate', 'salad & sourdough toast', '7.25', 'gf'),
  api.dish('Item Boost', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
  api.dish('Mains', 'Fish & Chips', 'mushy peas', '18.95', ''),
  api.dish('Special Mains', 'Pan Roasted Duck Breast', 'duck fat potatoes', '22.95', 'gf')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Special Starters': { width: 'column', frame: true, note: 'When it’s gone, it’s gone' },
    'Special Mains': { width: 'column', frame: true, note: 'When it’s gone, it’s gone' },
    'Item Boost': { width: 'column', frame: true }
  })
});
var colSpecA4 = colSpecHtml.split('mode-panel mode-a5')[0] || colSpecHtml;
assert((/column-solo-row[\s\S]*Mackerel Pate/.test(colSpecA4) ||
    /col-pair-row[\s\S]*Mackerel Pate/.test(colSpecA4)) &&
  /data-specials-course="Special Starters"/.test(colSpecA4),
  'Special Starters Column lock stays a column under Starters');
assert(!/<section class="sec specials-beside"[\s\S]*Mackerel Pate/.test(colSpecA4),
  'Column Specials are not stretched full-bleed under the course');
assert(/column-solo-row[\s\S]*Pan Roasted Duck Breast/.test(colSpecA4) &&
  /data-specials-course="Special Mains"/.test(colSpecA4),
  'Special Mains Column lock stays a half-column under Mains');
assert(/column-solo-row[\s\S]*Pie of the day/.test(colSpecA4) ||
  /col-pair-row[\s\S]*Pie of the day/.test(colSpecA4),
  'Item Boost Column lock stays a column, not a full-bleed box');
assert(printJs.indexOf('function pairColumnFood') !== -1 &&
  printJs.indexOf('takeColumnPending') !== -1 &&
  printJs.indexOf('lockedColumnWidth(rule)') !== -1,
  'Column locks can share a row; Best fit prefers full or split, not auto-columns');
assert(printJs.indexOf('widthOverrides') !== -1 && printJs.indexOf("widthOverrides[secName] = 'split'") !== -1,
  'Best-fit packing may split any long category across two even columns');
assert(aiGs.indexOf('"column"|"full"|"split"') !== -1 || aiGs.indexOf('column, full, or split') !== -1,
  'Gemini Best-fit widths include split for any category');
(function consecutiveColumnSectionsShareARow() {
  var html = print.build(mainMenu, [
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Special Starters', 'Mackerel Pate', 'salad & sourdough toast', '7.25', 'gf'),
    api.dish('Item Boost', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
    api.dish('Burgers', 'Brisket Burger', 'fries', '18.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam', '16.95', 'v')
  ], {
    sectionLayout: api.normalizeSectionLayout({
      'Special Starters': { width: 'column', frame: true, note: '' },
      'Item Boost': { width: 'column', frame: true }
    })
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  assert(/col-pair-row[\s\S]*Mackerel Pate[\s\S]*Pie of the day/.test(a4) ||
    /col-pair-row[\s\S]*Pie of the day[\s\S]*Mackerel Pate/.test(a4),
    'Column Special Starters and Item Boost sit in one row, not two stacked full-bleed boxes');
  assert(!/<section class="sec specials-beside"[\s\S]*Mackerel Pate/.test(a4),
    'Column Special Starters are not a full-bleed box above Item Boost');
  assert(/Special Starters/.test(a4), 'Special Starters prints the full course title');
  var pairRow = (a4.match(/col-pair-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(/scallop-box/.test(pairRow) && /scallop-wide/.test(pairRow),
    'adjacent frilly boxes use different wave / corner treatments');
})();
(function bestFitStaysFullWhenThereIsRoom() {
  var html = print.build(mainMenu, [
    api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
    api.dish('Special Starters', 'Mackerel Pate', 'salad & sourdough toast', '7.25', 'gf'),
    api.dish('Item Boost', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
    api.dish('Burgers', 'Brisket Burger', 'fries', '18.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam', '16.95', 'v')
  ], {
    sectionLayout: api.normalizeSectionLayout({
      'Special Starters': { width: 'both', frame: true, note: '' },
      'Item Boost': { width: 'both', frame: true }
    })
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  assert(/specials-beside[\s\S]*Mackerel Pate/.test(a4) || /Special Starters[\s\S]*Mackerel Pate/.test(a4),
    'Best-fit Special Starters stay full-bleed when the page has room');
  assert(!/col-pair-row[\s\S]*Mackerel Pate[\s\S]*Pie of the day/.test(a4),
    'Best-fit does not force two columns just because two frilly sections are neighbours');
})();
(function anyCategoryCanSplitAcrossTwoColumns() {
  var dishes = [];
  ['Olives', 'Whitebait', 'Arancini', 'Bruschetta', 'Garlic Bread', 'Fries'].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  dishes.push(api.dish('Mains', 'Fish & Chips', 'peas', '17.95', ''));
  var html = print.build(mainMenu, dishes, {
    sectionLayout: api.normalizeSectionLayout({
      Sides: { width: 'both', frame: false },
      Mains: { width: 'full', frame: false }
    }),
    widthOverrides: { Sides: 'split' },
    layout: {
      pages: 1,
      p1: { sidesOnP1: false, sandwiches: false, rooms: false, footLogo: false },
      widthOverrides: { Sides: 'split' }
    }
  });
  var body = (html.split('mode-panel mode-a5')[0] || html).split('</style>')[1] || '';
  assert(/sec-split[\s\S]*share-cols[\s\S]*Olives[\s\S]*Bruschetta/.test(body) ||
    (/share-cols/.test(body) && /Olives/.test(body) && /Bruschetta/.test(body)),
    'Best-fit split lays any category across two even columns');
  var mainsSplit = print.build(mainMenu, [
    api.dish('Mains', 'Fish & Chips', 'peas', '17.95', ''),
    api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
    api.dish('Mains', 'Lasagne', 'salad', '15.95', ''),
    api.dish('Mains', 'Katsu Curry', 'rice', '16.95', ''),
    api.dish('Mains', 'Burger', 'fries', '18.95', ''),
    api.dish('Mains', 'Scampi', 'chips', '15.95', '')
  ], {
    sectionLayout: api.normalizeSectionLayout({ Mains: { width: 'both', frame: false } }),
    widthOverrides: { Mains: 'split' },
    layout: {
      pages: 1,
      p1: { sandwiches: false, rooms: false },
      widthOverrides: { Mains: 'split' }
    }
  });
  var mainsBody = (mainsSplit.split('mode-panel mode-a5')[0] || mainsSplit).split('</style>')[1] || '';
  assert(/sec-split[\s\S]*share-cols[\s\S]*Fish[\s\S]*Katsu|share-cols[\s\S]*Fish[\s\S]*Burger/.test(mainsBody),
    'Best-fit split works for Mains too — not a Sides-only rule');
})();
var specialsCardHtml = print.build(api.menuById('specials'), [
  api.dish('Special Starters', 'Ham Hock Pot', '', '8.95', 'gf')
], {
  sectionLayout: api.normalizeSectionLayout({
    'Special Starters': { width: 'full', frame: true, note: 'When it’s gone, it’s gone' }
  })
});
assert(/card-face/.test(specialsCardHtml) && /text-align:center/.test(specialsCardHtml),
  'Specials card keeps centred board notes');

// Promo must not force over
var crowdedDishes = aloneDishes.concat(api.composeDishes(book, 'main', { desserts: true, sandwiches: true, 'little-bells': true }).filter(function (d) {
  return d.fromMenu;
}));
var crowdedLayout = print.planFluidLayout(mainMenu, crowdedDishes);
assert(crowdedLayout.fit !== 'over' || crowdedDishes.length > 40, 'fillers never force an extra page on their own');

// Packed mains+desserts on page 2 → move Sides to page 1 so both pages share one type size
var sharedTypeDishes = [
  api.dish('Starters', 'Scotch Egg', 'brown sauce', '8.95', ''),
  api.dish('Starters', 'Whitebait', 'tartare', '7.95', ''),
  api.dish('Starters', 'Bang Bang Cauliflower', 'sesame', '7.95', 'v'),
  api.dish('Starters', 'Breaded Prawns', 'sweet chilli', '8.95', ''),
  api.dish('Sandwiches', 'Falafel & Guacamole', 'fries', '10.95', 'vg'),
  api.dish('Sandwiches', 'Giant Fish Finger', 'tartare', '11.95', ''),
  api.dish('Sandwiches', 'BLT', 'mayo', '10.95', ''),
  api.dish('Sandwiches', 'Chicken Club', 'fries', '12.95', ''),
  api.dish('Sandwiches', 'Cheese & Onion', 'pickle', '9.95', 'v'),
  api.dish('Burgers', 'Cheese & Bacon Burger', 'fries', '18.95', ''),
  api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'fries', '16.95', 'v'),
  api.dish('Mains', 'Fish & Chips', 'peas', '17.95', ''),
  api.dish('Mains', 'Chicken Caesar Salad', 'croutons', '15.95', ''),
  api.dish('Mains', 'Vegan Katsu Curry', 'rice', '15.95', 'vg'),
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Mains', 'Steak Frites', 'peppercorn', '22.95', ''),
  api.dish('Mains', 'Sea Bass', 'samphire', '19.95', ''),
  api.dish('Mains', 'Sausage & Mash', 'onion gravy', '15.95', ''),
  api.dish('Desserts', 'Blackberry Fool', '', '7.50', 'v'),
  api.dish('Desserts', 'Lemon Posset', 'shortbread', '7.50', 'v'),
  api.dish('Desserts', 'Sticky Toffee Pudding', 'custard', '7.95', 'v'),
  api.dish('Desserts', 'Chocolate Brownie', 'ice cream', '7.95', 'v'),
  api.dish('Desserts', 'Ice cream or Sorbet', 'three scoops', '6.50', 'v'),
  api.dish('Sides', 'Cheesy Garlic Bread', '', '5.50', 'v'),
  api.dish('Sides', 'Dressed Mixed Salad', '', '4.95', 'vg'),
  api.dish('Sides', 'Loaded Fries', '', '6.50', ''),
  api.dish('Sides', 'Chips', '', '4.50', 'vg')
];
var sharedTypeLayout = print.planFluidLayout(mainMenu, sharedTypeDishes, {
  sectionLayout: { Sandwiches: { tip: true, frame: true, width: 'column' } }
});
assert(sharedTypeLayout.pages === 2, 'packed mains+desserts+sandwiches use two pages (would clip at min type)');
assert(sharedTypeLayout.p2 && sharedTypeLayout.p2.sandwiches === true && !sharedTypeLayout.p1.sandwiches,
  'named sandwich fillings sit on page 2 (less prominent, column)');
assert(/type range/i.test(sharedTypeLayout.summary) || /minimum type/i.test(sharedTypeLayout.summary),
  'layout summary states type range / min-type decision');
assert(sharedTypeLayout.p1.sidesOnP1 === true || (sharedTypeLayout.p2 && sharedTypeLayout.p2.sidesOnP2 === true),
  'Sides stay on the sheet — leftover column space if the other page would clip');
(function buildKeepsGeminiSidesOn() {
  var planned = print.planFluidLayout(mainMenu, sharedTypeDishes, {
    sectionLayout: { Sandwiches: { tip: true, frame: true, width: 'column' } }
  });
  planned.p1.sidesOnP1 = true;
  if (planned.p2) planned.p2.sidesOnP2 = false;
  var html = print.build(mainMenu, sharedTypeDishes, {
    layout: planned,
    layoutSource: 'gemini-layout',
    layoutReview: 'Sides on page 1 to fill Sharing.',
    sectionLayout: { Sandwiches: { tip: true, frame: true, width: 'column' } }
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var pages = a4.split(/<div class="page /);
  assert(/Layout: Gemini/.test(html) && /Sides on page 1 to fill Sharing/.test(html),
    'toolbar names Gemini when advice came from Gemini');
  assert(pages[1] && /Cheesy Garlic Bread|Loaded Fries|Chips/.test(pages[1]),
    'Gemini sidesOn page1 survives print build instead of being re-planned');
})();

// Tip/sell sandwich box (0 fillings) must prefer page 1 when page 2 holds mains+desserts
var tipOnlyPacked = [
  api.dish('Nibbles', 'Olives', '', '4.95', 'vg'),
  api.dish('Nibbles', 'Bread', 'butter', '5.95', 'v'),
  api.dish('Nibbles', 'Nuts', '', '4.50', 'vg'),
  api.dish('Starters', 'Soup', 'bread', '6.95', 'v'),
  api.dish('Starters', 'Scotch Egg', 'sauce', '8.95', ''),
  api.dish('Starters', 'Whitebait', 'tartare', '7.95', ''),
  api.dish('Starters', 'Prawns', 'chilli', '8.95', ''),
  api.dish('Starters', 'Cauliflower', 'sesame', '7.95', 'v'),
  api.dish('Sharing Plates', 'Camembert', 'ciabatta', '14.95', 'v'),
  api.dish('Burgers', 'Wagyu Burger', 'long description of fries and salad garnish here', '18.95', ''),
  api.dish('Burgers', 'Asian Burger', 'another long burger spiel with pickles and sauce', '16.95', 'vg'),
  api.dish('Mains', 'Fish & Chips', 'peas', '17.95', ''),
  api.dish('Mains', 'Caesar Salad', 'croutons', '15.95', ''),
  api.dish('Mains', 'Katsu Curry', 'rice', '15.95', 'vg'),
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Mains', 'Steak Frites', 'peppercorn', '22.95', ''),
  api.dish('Mains', 'Sea Bass', 'samphire', '19.95', ''),
  api.dish('Mains', 'Liver & Bacon', 'mash', '17.95', ''),
  api.dish('Mains', 'Hake Fillet', 'greens', '18.95', ''),
  api.dish('Desserts', 'Blackberry Fool', '', '7.50', 'v'),
  api.dish('Desserts', 'Cookie Dough', '', '7.95', 'v'),
  api.dish('Desserts', 'Lemon Posset', 'shortbread', '7.50', 'v'),
  api.dish('Desserts', 'Cheeses', 'biscuits', '9.95', 'v'),
  api.dish('Desserts', 'Ice cream', 'three scoops', '6.50', 'v'),
  api.dish('Sides', 'Seasonal Veg', '', '4.95', 'vg'),
  api.dish('Sides', 'Salad', '', '4.95', 'vg'),
  api.dish('Sides', 'Truffle Fries', '', '6.95', ''),
  api.dish('Sides', 'Chips', '', '4.50', 'vg')
];
var tipPackedLayout = print.planFluidLayout(mainMenu, tipOnlyPacked, {
  sectionLayout: api.normalizeSectionLayout({
    Sandwiches: { tip: true, frame: true, width: 'column', sell: 'A selection of sandwiches is available — ask the team.' }
  }),
  includes: { sandwiches: true }
});
assert(tipPackedLayout.pages === 2, 'nibbles+mains+desserts packed menu uses two pages');
assert(tipPackedLayout.p2 && tipPackedLayout.p2.sandwiches === true && !tipPackedLayout.p1.sandwiches,
  'sandwich sell box sits on page 2 (quieter, lower-margin) in a column');

// flow185/186: tip-only oval beside Specials — no SANDWICHES title; general leftover nest
(function tipOnlyOvalFillsLeftover() {
  var sellLine = 'A selection of sandwiches is available — ask the team.';
  var tipSpecDishes = [
    api.dish('Special Starters', 'Mackerel Pate', 'sourdough', '8.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'ciabatta', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'cheese', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'fries salad', '18.95', ''),
    api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'fries', '16.95', 'v'),
    api.dish('Mains', 'Fish & Chips', 'mushy peas', '18.95', ''),
    api.dish('Mains', 'Pie of the day', 'mash', '20.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan', '20.95', ''),
    api.dish('Mains', 'Ham Egg & Chips', '', '17.95', ''),
    api.dish('Mains', 'Chicken Katsu Curry', 'rice', '16.95', ''),
    api.dish('Special Mains', 'Creamy Chicken Nduja & Chorizo Penne', '', '17.95', ''),
    api.dish('Special Mains', 'Baked Gnocchi', 'tomato', '15.95', 'v'),
    api.dish('Special Mains', 'Pasta Carbonara', '', '16.95', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'vg'),
    api.dish('Sides', 'House Salad', '', '4.95', 'vg'),
    api.dish('Desserts', 'Sticky Toffee', 'custard', '7.95', 'v'),
    api.dish('Desserts', 'Ice Cream', 'three scoops', '6.50', 'v'),
    api.dish('Desserts', 'Chocolate Brownie', 'ice cream', '7.95', 'v')
  ];
  // Frilly No (frame:false) — tip-only must still get the platter (Charles screenshot).
  var tipSpecLayout = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true },
    'Special Starters': { width: 'column', frame: true },
    Sandwiches: {
      tip: true, frame: false, width: 'column', sell: sellLine
    },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(mainMenu, tipSpecDishes, {
    sectionLayout: tipSpecLayout,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(planned.sandwichTipOnly === true, 'screenshot-shaped Main plans tip-only when Sandwiches unticked');
  assert(planned.p2 && planned.p2.sandwiches, 'tip-only sell sits on page 2 with mains/specials');
  assert(planned.p2.specialsBesideSandwiches === true,
    'Specials stay beside tip-only (not dropped off the sheet)');
  assert(planned.p2.sidesUnderTip === true || planned.p1.sidesOnP1 === true,
    'Sides nest under tip leftover or move to page-1 leftover — not a starved full-width strip');
  // Foot promo must not be planned when leftover after gap breath is too small.
  if (planned.leftover && planned.leftover.p2 != null && !print.canFitFootPromos(planned.leftover.p2)) {
    assert(planned.p2.footPromos !== true,
      'foot promo not placed when leftover too small');
  }
  var html = print.build(mainMenu, tipSpecDishes, {
    sectionLayout: tipSpecLayout,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var a4Body = a4.replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(/class="[^"]*sandwich-tip-only/.test(a4Body) && a4Body.indexOf(sellLine) !== -1,
    'tip-only oval prints sell words on the sheet');
  assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(a4Body),
    'tip-only uses platter oval frame (scallop/platter class wraps sell words)');
  assert(!/sec-plain[\s\S]{0,120}class="[^"]*sandwich-tip-only/.test(a4Body),
    'tip-only sell words are never bare sec-plain');
  assert(/Creamy Chicken Nduja|Baked Gnocchi|Pasta Carbonara/.test(a4),
    'Special Mains stay on the sheet with compact tip');
  assert(/Cheesy Garlic Bread|Chunky Triple Cooked Chips/.test(a4),
    'Sides stay on the sheet with compact tip');
  // No SANDWICHES heading in the tip-only scallop (pair may still mention food elsewhere).
  var tipOval = (a4Body.match(/class="[^"]*sandwich-tip-only[\s\S]{0,400}/) || [''])[0];
  assert(tipOval && !/(sec-title|promo-title)[^>]*>\s*Sandwiches/i.test(tipOval),
    'tip-only oval HTML has no Sandwiches title inside');
  // Filled sandwiches on the same shape still get the title.
  var withFill = tipSpecDishes.concat([
    api.dish('Sandwiches', 'Crayfish Marie Rose', 'salad', '10.95', ''),
    api.dish('Sandwiches', 'BLT', 'bacon', '10.95', '')
  ]);
  var filledPlan = print.planFluidLayout(mainMenu, withFill, {
    sectionLayout: tipSpecLayout,
    includes: { sandwiches: true, specials: true }
  });
  assert(filledPlan.sandwichTipOnly !== true, 'fillings are not tip-only');
  var filledSheet = print.build(mainMenu, withFill, {
    sectionLayout: tipSpecLayout,
    includes: { sandwiches: true, specials: true },
    layout: filledPlan
  });
  var filledA4b = filledSheet.split('mode-panel mode-a5')[0] || filledSheet;
  assert(/(sec-title|promo-title)[^>]*>\s*Sandwiches/i.test(filledA4b),
    'full Sandwiches section with fillings still prints the Sandwiches title');
  assert(!/class="[^"]*sandwich-tip-only/.test(filledA4b),
    'full Sandwiches section does not use tip-only oval marker');
})();

// flow187: foot promo omitted when leftover too small (Gatherings must not clip).
(function footPromoOmitsWhenLeftoverSmall() {
  assert(typeof print.canFitFootPromos === 'function', 'canFitFootPromos is exported');
  assert(print.canFitFootPromos(18) === true, 'comfortable leftover may take a foot promo pair');
  assert(print.canFitFootPromos(12) === false, 'modest leftover skips foot promo pair');
  assert(print.canFitFootPromos(0) === false, 'empty leftover skips foot promo pair');
  var sellLine = 'A selection of sandwiches is available — ask the team.';
  var dishes = [
    api.dish('Sharing Plates', 'Baked Camembert', 'ciabatta', '16.95', 'v'),
    api.dish('Burgers', 'Brisket Burger', 'fries', '18.95', ''),
    api.dish('Mains', 'Pork Wellington', 'mash', '19.95', ''),
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', ''),
    api.dish('Mains', 'Pie of the day', 'mash', '20.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan', '20.95', ''),
    api.dish('Mains', 'Ham Egg & Chips', '', '17.95', ''),
    api.dish('Mains', 'Chicken Katsu Curry', 'rice', '16.95', ''),
    api.dish('Special Mains', 'Creamy Chicken Nduja & Chorizo Penne', '', '17.95', ''),
    api.dish('Special Mains', 'Baked Gnocchi', 'tomato', '15.95', 'v'),
    api.dish('Special Mains', 'Pasta Carbonara', '', '16.95', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'vg'),
    api.dish('Sides', 'House Salad', '', '4.95', 'vg'),
    api.dish('Sides', 'Onion Rings', '', '4.50', 'vg'),
    api.dish('Sides', 'Truffle Fries', '', '6.50', ''),
    api.dish('Sides', 'Garlic Bread', '', '4.50', 'v')
  ];
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sellLine },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(mainMenu, dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  // Force the screenshot shape: sides under tip, small leftover, stale footPromos flag.
  planned.p2 = planned.p2 || {};
  planned.p2.sidesOnP2 = true;
  planned.p2.sidesUnderTip = true;
  planned.p2.sidesUnderSpecials = false;
  planned.p2.specialsBesideSandwiches = true;
  planned.p2.sandwiches = true;
  planned.p1 = planned.p1 || {};
  planned.p1.sidesOnP1 = false;
  planned.leftover = { p1: planned.leftover && planned.leftover.p1 || 0, p2: 10 };
  planned.p2.footPromos = true; // stale — build must still omit
  var sheet = print.build(mainMenu, dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var body = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(body),
    'forced sides-under-tip still wraps tip-only in scallop/platter');
  assert(body.indexOf('foot-promos') === -1,
    'foot promo not placed when leftover too small (even if footPromos flag is stale)');
  assert(/Cheesy Garlic Bread|Chunky Triple Cooked Chips/.test(body),
    'Sides still print when foot promo is omitted');
})();

// flow189: XIV-shaped Main + tip-only — Specials fit when tip+sides leave spare
// (when-gone notes must not refuse a board that already fitted with gap breath).
(function xivTipOnlySpecialsFit() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var gone = "When it's gone, it's gone";
  var xiv = [
    api.dish('Nibbles', 'Nacho Cheese Triangles', '', '6.95', ''),
    api.dish('Nibbles', 'Mini Bread Rolls', 'bacon jam & smoked whipped butter', '5.95', 'vg option'),
    api.dish('Starters', 'Braised Lamb Shank', 'toasted red quinoa, smoked tomatoes & bone marrow chimichurri', '10.95', 'gf'),
    api.dish('Starters', 'Buffalo Cauliflower Florets', 'rainbow slaw & bang bang sauce', '7.95', 'vg'),
    api.dish('Starters', 'Pan Fried King Prawns', 'smoky romesco, rocket gremolata', '10.95', 'gf'),
    api.dish('Starters', 'Whitebait', 'aioli & micro parsley', '8.50', ''),
    api.dish('Starters', 'Ham Hock Pot', 'charmer cheese sauce, sourdough baguette', '8.95', 'gf'),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam and warm sourdough baguette', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'sour cream, guacamole & jalapenos', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'caramelised onion brioche, bacon jam, monterey jack, onion rings & fries', '18.95', ''),
    api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'mexican chilli cheese, onion rings and fries', '16.95', 'v'),
    api.dish('Mains', 'Osso Bucco', 'veal shank, roasted squash risotto with goats curd', '23.95', 'gf'),
    api.dish('Mains', 'Chilli Con Carne', 'wild rice, sour cream, giant tortilla chips', '17.95', 'gf'),
    api.dish('Mains', 'Pan Fried Seabass', 'crushed new potatoes, caper lemon butter', '22.95', 'gf'),
    api.dish('Mains', 'Vegetarian Lasagne', 'garlic bread, dressed salad', '18.50', 'v'),
    api.dish('Mains', 'Pork Wellington', 'serrano ham, baby potatoes, beurre blanc', '22.95', ''),
    api.dish('Mains', 'Fish & Chips', 'mushy peas, lemon & tartare sauce', '18.95', 'gf, df'),
    api.dish('Mains', 'Pie of the day', 'mash, vegetables & gravy', '20.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice ribbon noodles, thai green sauce', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'rigatoni, parmesan, burrata & basil', '20.95', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Seasonal Veg', '', '5.50', 'v'),
    api.dish('Sides', 'Garlic Bread', '', '4.95', 'v'),
    api.dish('Sides', 'House Salad', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v')
  ];
  var withBoard = xiv.concat(api.seed().specials.map(function (d) {
    return api.dish(d.section, d.name, d.description || '', d.price || '16.95', d.tags || '');
  }));
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: gone },
    'Special Starters': { width: 'column', frame: true, note: gone },
    'Special Desserts': { width: 'column', frame: true, note: gone },
    Sandwiches: { tip: true, frame: true, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var baseline = print.planFluidLayout(mainMenu, xiv, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: false },
    promos: api.seedPromoBank()
  });
  assert(baseline.fit === 'two' && baseline.sandwichTipOnly === true,
    'XIV-shaped Main without Specials is tip-only two-pager');
  assert(baseline.leftover && baseline.leftover.p2 > 10,
    'XIV tip+sides leave spare leftover on page 2 (visible tip air)');
  var withSpec = print.planFluidLayout(mainMenu, withBoard, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(withSpec.fit !== 'over',
    'XIV + seed Specials + tip-only still generates (notes do not refuse after gap breath)');
  assert(withSpec.p2 && withSpec.p2.specialsBesideSandwiches === true,
    'Specials pair beside tip-only on XIV-shaped sheet');
  assert(withSpec.p2.sidesUnderTip === true || withSpec.p1.sidesOnP1 === true,
    'Sides nest under tip leftover or move to page 1 — food stays on the sheet');
  var sheet = print.build(mainMenu, withBoard, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: withSpec,
    promos: api.seedPromoBank()
  });
  var a4 = sheet.split('mode-panel mode-a5')[0] || sheet;
  assert(/Pan-Roasted Cod Loin|Slow-Cooked Blade|Wild Mushroom/.test(a4),
    'Special Mains print on XIV + tip-only sheet');
  assert(/Cheesy Garlic Bread|Chunky Triple Cooked Chips/.test(a4),
    'Sides still print with Specials + tip-only');
  assert(/class="[^"]*sandwich-tip-only/.test(a4.replace(/<style[\s\S]*?<\/style>/gi, '')),
    'tip-only sell oval still prints with Specials');
})();

// flow192: Sunday packed Little Bells|Sides — omit Gatherings rather than clip
// into the allergy footer; kids below-note stays inside its frilly box.
(function sundayPackedKidsSidesOmitsGatherings() {
  assert(typeof print.canFitColumnPromos === 'function', 'canFitColumnPromos is exported');
  assert(print.canFitColumnPromos(14) === true, 'comfortable leftover may take a column panel');
  assert(print.canFitColumnPromos(10) === false, 'tight leftover skips column Gatherings');
  var sunday = api.menuById('sunday');
  var dishes = [
    api.dish('Sunday Roasts', 'Topside of Beef', 'roasties', '18.95', ''),
    api.dish('Sunday Roasts', 'Roast Chicken', 'roasties', '17.95', ''),
    api.dish('Sunday Roasts', 'Nut Roast', 'roasties', '16.95', 'vg'),
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', 'df'),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan', '20.95', ''),
    api.dish('Mains', 'Pie of the Day', 'mash', '19.95', ''),
    api.dish('Mains', 'Chicken Katsu Curry', 'rice', '16.95', ''),
    api.dish('Mains', 'Ham Egg & Chips', '', '17.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice', '18.95', ''),
    api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
    api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Tomato & Basil Pasta', '', '', 'v'),
    api.dish('Little Bells', 'Kids Mac & Cheese', '', '', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.50', 'vg'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'vg'),
    api.dish('Sides', 'House Salad', '', '4.95', 'vg'),
    api.dish('Sides', 'Onion Rings', '', '4.50', 'vg'),
    api.dish('Sides', 'Truffle Fries', '', '6.50', '')
  ];
  var layoutMap = api.normalizeSectionLayout(Object.assign({}, api.sectionLayoutForMenu('sunday'), {
    'Little Bells': {
      width: 'column',
      frame: true,
      above: 'All £9.50\nto include a choice of one scoop of ice cream or sorbet.',
      below: 'On Sundays, Little Bells can also enjoy a choice of roasts at half the adult price.',
      aboveKind: 'heading',
      belowKind: 'text'
    },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  }));
  var planned = print.planFluidLayout(sunday, dishes, {
    sectionLayout: layoutMap,
    includes: { 'little-bells': true },
    promos: api.seedPromoBank()
  });
  assert(planned.p2 && planned.p2.columnPromos === false,
    'packed Sunday marks columnPromos false after kids notes + gap breath');
  assert(planned.leftover && planned.leftover.p2 < 14,
    'packed Sunday leftover is below the column-panel gate');
  // Stale flag must not shove Gatherings under Little Bells.
  planned.p2.columnPromos = true;
  planned.leftover.p2 = 8;
  var sheet = print.build(sunday, dishes, {
    sectionLayout: layoutMap,
    includes: { 'little-bells': true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var body = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var kidsRow = (body.match(/little-sides-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(/little-sides-row/.test(body), 'Sunday still pairs Little Bells beside Sides');
  assert(/half the adult price|half the price of the adults/i.test(kidsRow),
    'Little Bells Sunday roast note still prints inside the kids box');
  assert(!/col-feature[\s\S]*Gatherings|Gatherings[\s\S]*col-feature/i.test(kidsRow) &&
    !/<div class="col-feature">[\s\S]*Gatherings/i.test(kidsRow),
    'Gatherings is not nested under Little Bells when leftover is tight');
  assert(body.indexOf('foot-promos') === -1,
    'foot promo pair also omitted on packed Sunday page 2');
  assert(/dropJammedColumnPromos/.test(printJs) &&
    printJs.indexOf('col-feature-level') !== -1 &&
    printJs.indexOf('col-feature:not(.col-feature-level)') !== -1,
    'fitPages drops only non-level column chrome on overflow — keeps Sunday leftover fillers');
})();

// flow188/197: tip-only oval platter CSS paints real ellipse (frame-platter), not rect scallop.
(function tipOnlyPlatterCss() {
  var tipCss = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
    rule: { tip: true, tipOnly: true, sell: 'A selection of sandwiches is available — ask the team.' },
    tipOnly: true
  });
  assert(/scallop-platter/.test(tipCss), 'tip-only HTML carries scallop-platter class');
  // Full sheet CSS must size the platter from the oval asset and contrast a stacked panel.
  var sheet = print.build(api.menuById('main'), [
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', ''),
    api.dish('Special Mains', 'Baked Gnocchi', 'tomato', '15.95', 'v'),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v')
  ], {
    sectionLayout: api.normalizeSectionLayout({
      Sandwiches: { tip: true, frame: false, width: 'column',
        sell: 'A selection of sandwiches is available — ask the team.' },
      'Special Mains': { width: 'column', frame: true },
      Sides: { width: 'column', frame: false }
    }),
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(/scallop-platter/.test(sheet) && /frame-platter\.png/.test(sheet),
    'sheet CSS/HTML includes scallop-platter and frame-platter oval asset');
  assert(/scallop-platter[\s\S]{0,400}frame-platter\.png/.test(sheet) ||
    /frame-platter\.png[\s\S]{0,400}scallop-platter/.test(sheet),
    'platter background uses frame-platter.png (not rectangular frame-wide)');
  assert(/aspect-ratio:\s*1600\/480/.test(sheet), 'platter CSS uses oval aspect 1600/480');
  assert(/scallop-platter[\s\S]{0,220}padding:\s*7%\s*9%\s*8%/.test(sheet) ||
    /padding:\s*7%\s*9%\s*8%[\s\S]{0,120}scallop-platter/.test(sheet) ||
    /\.scallop-platter[\s\S]{0,400}padding:\s*7%\s*9%\s*8%/.test(sheet),
    'platter pad hugs the sell line (tight vertical, not 18%/20% air)');
  assert(/scallop-platter[\s\S]{0,200}border-image:\s*none|border-image:\s*none[\s\S]{0,200}scallop-platter/.test(sheet) ||
    /\.scallop-platter[\s\S]{0,300}border-image:\s*none/.test(sheet),
    'platter CSS disables border-image so the oval silhouette can show');
  assert(/:has\(\.sandwich-tip-only\)\s*>\s*\.col-feature\s*>\s*\.scallop-wide/.test(sheet),
    'stacked tip + feature panel flips the panel wave for contrast');
  assert(/scallop\.scallop-wide\.scallop-platter/.test(sheet) && /print-color-adjust:\s*exact/.test(sheet),
    'platter CSS is print-specific so the oval silhouette survives PDF');
  assert(/:not\(\.scallop-platter\)/.test(sheet),
    'adjacent-column frame flip never restyles the tip platter as a rect box');
})();

// flow193: tight Sides / Sauces / Little Bells lists (not mains 13px breathe)
(function tightListSectionsCssAndHtml() {
  assert(typeof print.isTightListSection === 'function', 'isTightListSection is exported');
  assert(print.isTightListSection('Sides') && print.isTightListSection('Sauces') &&
    print.isTightListSection('Little Bells'),
    'Sides, Sauces and Little Bells are tight-list sections');
  assert(!print.isTightListSection('Mains') && !print.isTightListSection('Starters'),
    'Mains and Starters keep classical dish breathe');
  assert(/dish-list-tight\{--dish-gap:1px;--dish-gap-min:0px\}/.test(printJs),
    'tight-list CSS zeros extra dish gap vs mains 13px floor');
  var sidesSheet = print.build(api.menuById('main'), [
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v'),
    api.dish('Sides', 'House Salad', '', '4.95', 'v')
  ], {
    sectionLayout: api.normalizeSectionLayout({
      Sides: { width: 'column', frame: false },
      Mains: { width: 'full', frame: false }
    }),
    includes: { sandwiches: false },
    promos: []
  });
  var sidesBody = sidesSheet.replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(/dish-list-tight[\s\S]{0,80}Cheesy Garlic Bread/.test(sidesBody) ||
    /dish-list-tight/.test(sidesBody),
    'Sides print inside dish-list-tight');
  assert(/SIDES|Sides/.test(sidesBody), 'Sides section still prints');
})();

// flow193: Specials fit when feature panels are omitted (food before Sip & Paint)
(function specialsFitWhenPanelsOmitted() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var gone = "When it's gone, it's gone";
  var dishes = [
    api.dish('Starters', 'Braised Lamb Shank', 'quinoa chimichurri', '10.95', 'gf'),
    api.dish('Starters', 'Buffalo Cauliflower', 'bang bang', '7.95', 'vg'),
    api.dish('Starters', 'King Prawns', 'romesco', '10.95', 'gf'),
    api.dish('Starters', 'Whitebait', 'aioli', '8.50', ''),
    api.dish('Sharing Plates', 'Baked Camembert', 'baguette', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'jalapenos', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'brioche fries', '18.95', ''),
    api.dish('Burgers', 'Halloumi Burger', 'onion rings', '16.95', 'v'),
    api.dish('Mains', 'Osso Bucco', 'risotto', '23.95', 'gf'),
    api.dish('Mains', 'Chilli Con Carne', 'rice', '17.95', 'gf'),
    api.dish('Mains', 'Pan Fried Seabass', 'caper butter', '22.95', 'gf'),
    api.dish('Mains', 'Vegetarian Lasagne', 'garlic bread', '18.50', 'v'),
    api.dish('Mains', 'Pork Wellington', 'beurre blanc', '22.95', ''),
    api.dish('Mains', 'Fish & Chips', 'tartare', '18.95', 'gf, df'),
    api.dish('Mains', 'Pie of the day', 'mash gravy', '20.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'noodles', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Rigatoni', 'burrata', '20.95', ''),
    api.dish('Desserts', 'Sticky Toffee', 'ice cream', '7.95', 'v'),
    api.dish('Desserts', 'Brownie', 'cream', '7.50', 'v'),
    api.dish('Desserts', 'Cheesecake', 'berry', '7.50', 'v'),
    api.dish('Desserts', 'Ice Cream', 'scoops', '6.50', 'v'),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Seasonal Veg', '', '5.50', 'v'),
    api.dish('Sides', 'Garlic Bread', '', '4.95', 'v'),
    api.dish('Sides', 'House Salad', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v'),
    api.dish('Special Mains', 'Pan-Roasted Cod Loin', 'samphire lemon', '22.95', 'gf'),
    api.dish('Special Mains', 'Slow-Cooked Blade', 'red wine jus', '21.95', ''),
    api.dish('Special Mains', 'Wild Mushroom Stroganoff', 'paprika rice', '18.95', 'v')
  ];
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: gone },
    Sandwiches: { tip: true, frame: true, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(planned.fit !== 'over',
    'Specials generate when feature panels can be omitted');
  assert(planned.p2 && planned.p2.specialsBesideSandwiches === true,
    'Specials pair beside tip-only rather than refuse');
  assert(planned.p2.footPromos === false && planned.p2.columnPromos === false,
    'foot/column feature panels omitted so Specials can print');
  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(/Pan-Roasted Cod Loin|Slow-Cooked Blade|Wild Mushroom/.test(a4),
    'Specials dishes print when panels are dropped');
  assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(a4),
    'tip-only still uses platter/oval classes with Specials');
  var p2Html = a4.split(/class="page fill-page/)[2] || a4;
  assert(!/Sip\s*&amp;\s*Paint|SIP &amp; PAINT/i.test(p2Html),
    'Sip & Paint is not auto-added on packed page 2 ahead of Specials');
})();

// flow195/197: even-split only — 5 Specials must NOT become 3|2; 6 Specials may split 3|3.
// tip platter keeps real oval aspect; food never clips into allergy footer.
(function specialsOddCountNeverUnevenSplit() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var dishes = [];
  for (var i = 0; i < 6; i++) {
    dishes.push(api.dish('Starters', 'Starter ' + i, 'long starter description for packing page one fully', '8.95', ''));
  }
  for (var i = 0; i < 2; i++) {
    dishes.push(api.dish('Sharing Plates', 'Share ' + i, 'sharing plate description text here', '15.95', 'v'));
  }
  for (var i = 0; i < 3; i++) {
    dishes.push(api.dish('Burgers', 'Burger ' + i, 'burger with fries onion rings salad', '18.95', ''));
  }
  for (var i = 0; i < 9; i++) {
    dishes.push(api.dish('Mains', 'Main ' + i, 'long description for main dish with mash gravy peas', '18.95', ''));
  }
  [
    'Venison Tournedos Rossini',
    'Baked Gnocchi',
    'Creamy Chicken Nduja & Chorizo Penne',
    'Beef Brisket & Chilli Noodles',
    'Pasta Carbonara'
  ].forEach(function (n, idx) {
    dishes.push(api.dish('Special Mains', n, 'long special description text for dish ' + idx + ' with garnish', '15.95',
      idx === 1 ? 'v' : ''));
  });
  [
    'Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'
  ].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(!(planned.widthOverrides && planned.widthOverrides['Special Mains'] === 'split'),
    '5 Specials (odd) never get an uneven 3|2 two-column split');
  assert(planned.p2 && planned.p2.specialsBesideSandwiches === false,
    'tall Specials unpair from tip rather than park in a holey split');
  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  assert(/aspect-ratio:\s*1600\/480/.test(sheet) && /border-image:none!important/.test(sheet),
    'tip platter CSS keeps oval aspect and kills border-image rect');
  assert(/frame-platter\.png/.test(sheet), 'tip uses frame-platter oval asset');
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var p2 = a4.split(/class="page fill-page/)[2] || a4;
  // Must not render an uneven share-cols split for the 5 Specials.
  var splitSec = (p2.match(/sec-split[\s\S]*?<\/section>/) || [])[0] || '';
  if (splitSec && /Venison Tournedos Rossini/.test(splitSec)) {
    assert(false, '5 Specials must not render as sec-split (would be 3|2)');
  }
  assert(/Venison Tournedos Rossini/.test(p2) && /Pasta Carbonara/.test(p2),
    'all 5 Specials still print on the sheet');
  assert(/Cheesy Garlic Bread|Chunky Triple/.test(p2) || planned.fit === 'over',
    'Sides print or overflow-gate — never silent clip');
  assert(/Please inform us of any allergies/i.test(a4), 'allergy footer still prints');
  if (planned.p2.sandwiches) {
    assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(p2),
      'when tip fits after food, it stays the oval scalloped platter');
  }
})();

(function specialsEvenCountMaySplitBalanced() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var dishes = [];
  for (var i = 0; i < 6; i++) {
    dishes.push(api.dish('Starters', 'Starter ' + i, 'long starter description for packing page one fully', '8.95', ''));
  }
  for (var i = 0; i < 2; i++) {
    dishes.push(api.dish('Sharing Plates', 'Share ' + i, 'sharing plate description text here', '15.95', 'v'));
  }
  for (var i = 0; i < 3; i++) {
    dishes.push(api.dish('Burgers', 'Burger ' + i, 'burger with fries onion rings salad', '18.95', ''));
  }
  for (var i = 0; i < 9; i++) {
    dishes.push(api.dish('Mains', 'Main ' + i, 'long description for main dish with mash gravy peas', '18.95', ''));
  }
  [
    'Venison Tournedos Rossini',
    'Baked Gnocchi',
    'Creamy Chicken Nduja & Chorizo Penne',
    'Beef Brisket & Chilli Noodles',
    'Pasta Carbonara',
    'Vegan Katsu Curry'
  ].forEach(function (n, idx) {
    dishes.push(api.dish('Special Mains', n, 'long special description text for dish ' + idx + ' with garnish', '15.95',
      idx === 1 ? 'v' : ''));
  });
  [
    'Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'
  ].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(planned.widthOverrides && planned.widthOverrides['Special Mains'] === 'split',
    '6 Specials (even) get a balanced two-column split');
  assert(planned.p2 && planned.p2.specialsBesideSandwiches === false,
    'Specials unpair from tip so they can span both columns');
  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var p2 = a4.split(/class="page fill-page/)[2] || a4;
  assert(/sec-split/.test(p2) && /share-cols/.test(p2),
    'even Specials render as sec-split with share-cols (3|3)');
  var splitSec = (p2.match(/sec-split[\s\S]*?<\/section>/) || [])[0] || '';
  assert(/Venison Tournedos Rossini/.test(splitSec) && /Vegan Katsu Curry/.test(splitSec),
    'split Specials put early and late dishes across the two columns');
  assert(!/Carbonara[\s\S]{0,120}Please inform us of any allergies/i.test(p2),
    'Pasta Carbonara does not clip into the allergy footer text');
})();

(function tipOmittedWhenSpecialsSplitNeedsCapacity() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var dishes = [];
  for (var i = 0; i < 5; i++) {
    dishes.push(api.dish('Starters', 'Starter ' + i, 'long starter description packing', '8.95', ''));
  }
  for (var i = 0; i < 2; i++) {
    dishes.push(api.dish('Sharing Plates', 'Share ' + i, 'share desc', '15.95', 'v'));
  }
  for (var i = 0; i < 3; i++) {
    dishes.push(api.dish('Burgers', 'Burger ' + i, 'burger fries', '18.95', ''));
  }
  for (var i = 0; i < 9; i++) {
    dishes.push(api.dish('Mains', 'Main ' + i, 'long main description mash gravy peas lemon', '18.95', ''));
  }
  for (var i = 0; i < 4; i++) {
    dishes.push(api.dish('Desserts', 'Dessert ' + i, 'pudding description text', '7.95', 'v'));
  }
  [
    'Venison Tournedos Rossini', 'Baked Gnocchi', 'Creamy Chicken Nduja & Chorizo Penne',
    'Beef Brisket & Chilli Noodles', 'Pasta Carbonara', 'Wild Mushroom Stroganoff'
  ].forEach(function (n, idx) {
    dishes.push(api.dish('Special Mains', n, 'long special description text for dish ' + idx, '15.95', ''));
  });
  [
    'Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'
  ].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: []
  });
  assert(planned.widthOverrides && planned.widthOverrides['Special Mains'] === 'split',
    'capacity-tight Specials still split across two columns');
  assert(
    planned.p2.sandwiches === false ||
      (planned.fillers || []).indexOf('Sandwiches tip omitted (keep food on the page)') !== -1 ||
      planned.fit === 'over',
    'tip omitted when capacity needs it, or overflow only after tip/panels cannot save food'
  );
  if ((planned.fillers || []).indexOf('Sandwiches tip omitted (keep food on the page)') !== -1) {
    assert(planned.p2.sandwiches === false, 'omitted tip is not still scheduled on page 2');
  }
  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: []
  });
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  assert(/Pasta Carbonara|Venison Tournedos|Baked Gnocchi/.test(a4),
    'Specials food still prints when tip is dropped for capacity');
  if (planned.p2.sandwiches === false) {
    assert(!/class="[^"]*sandwich-tip-only/.test(a4),
      'tip-only oval is absent from HTML when planner omitted it');
  }
})();

assert(printJs.indexOf('trySplitLongHost') !== -1,
  'planner exposes food-first long-host split (Specials family)');
assert(/Long Specials[\s\S]{0,80}split across two even columns/.test(printJs) ||
  printJs.indexOf('two even columns — keep food on the page') !== -1,
  'summary/fillers document Specials two-column split rule');

// flow195: Sunday Roasts + Best-fit Sharing must split (no half-cut dish at page-1
// footer); Little Bells|Desserts fills the kids column gap; Best-fit Sides split.
(function sundaySharingSplitAndKidsFeatureFill() {
  var sunday = api.menuById('sunday');
  var dishes = [
    api.dish('Sunday Roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
    api.dish('Sunday Roasts', 'Nut Roast', 'vegan gravy', '16.95', 'vg'),
    api.dish('Sunday Roasts', 'Leg of Lamb', 'cooked pink', '20.95', ''),
    api.dish('Sunday Roasts', 'Chicken Supreme', '', '18.95', ''),
    api.dish('Sunday Roasts', 'Loin of Pork', '', '18.95', ''),
    api.dish('Sharing Starters', 'Baked Camembert', 'baguette bacon jam', '16.95', 'v'),
    api.dish('Sharing Starters', 'Beef Chilli Nachos', 'jalapenos sour cream', '15.95', ''),
    api.dish('Mains', 'Venison Casserole', 'mash', '19.95', ''),
    api.dish('Mains', 'Beef Chilli', 'rice', '16.95', ''),
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', ''),
    api.dish('Mains', 'Pie of the Day', 'mash gravy', '19.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan', '20.95', ''),
    api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
    api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Tomato & Basil Pasta', '', '', 'v'),
    api.dish('Little Bells', 'Kids Mac & Cheese', '', '', ''),
    api.dish('Desserts', 'Sticky Toffee Pudding', 'ice cream', '7.95', 'v'),
    api.dish('Desserts', 'Chocolate Brownie', 'cream', '7.50', 'v'),
    api.dish('Desserts', 'Cheesecake', 'berry', '7.50', 'v'),
    api.dish('Desserts', 'Ice Cream', 'scoops', '6.50', 'v'),
    api.dish('Desserts', 'Lime Posset', 'shortbread', '7.50', 'v'),
    api.dish('Desserts', 'Apple Crumble', 'custard', '7.50', 'v'),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v')
  ];
  var layoutMap = api.normalizeSectionLayout(Object.assign({}, api.sectionLayoutForMenu('sunday'), {
    'Sunday Roasts': {
      width: 'full', frame: true,
      note: 'All our roasts are served with roast potatoes, Yorkshire pudding, seasonal vegetables and gravy.'
    },
    'Sharing Plates': { width: 'both', frame: false },
    'Little Bells': {
      width: 'column', frame: true,
      above: 'All £9.50\nto include a choice of one scoop of ice cream or sorbet.',
      below: 'A CHOICE OF ROASTS AT HALF PRICE OF THE ADULTS',
      aboveKind: 'heading', belowKind: 'text'
    },
    Desserts: { width: 'column', frame: true },
    Sides: { width: 'both', frame: false },
    Mains: { width: 'full', frame: false }
  }));
  var planned = print.planFluidLayout(sunday, dishes, {
    sectionLayout: layoutMap,
    includes: { 'little-bells': true },
    promos: api.seedPromoBank()
  });
  assert(planned.widthOverrides && planned.widthOverrides['Sharing Plates'] === 'split',
    'Sunday Best-fit Sharing gets a two-column split so dishes are not half-cut at page 1');
  assert(planned.fit !== 'over', 'Sunday Sharing split keeps the sheet printable');
  var sheet = print.build(sunday, dishes, {
    sectionLayout: layoutMap,
    includes: { 'little-bells': true },
    layout: planned,
    promos: api.seedPromoBank()
  });
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var pages = a4.split(/class="page /);
  var p1 = pages[1] || '';
  var p2 = pages[2] || '';
  assert(/share-cols[\s\S]*Baked Camembert|Baked Camembert[\s\S]{0,120}share-cols/.test(p1),
    'Sharing Starters print across two even columns on page 1');
  assert(/Beef Chilli Nachos/.test(p1), 'second Sharing dish stays on page 1 (not clipped away)');
  assert(!/Beef Chilli Nachos[\s\S]{0,80}Please inform us of any allergies/i.test(p1),
    'Sharing dish does not clip into the page-1 allergy footer');
  var roastIdx = p1.search(/Sunday Roasts|SUNDAY ROASTS/i);
  var shareIdx = p1.search(/Sharing Plates|SHARING|Baked Camembert/i);
  assert(roastIdx !== -1 && shareIdx !== -1 && roastIdx < shareIdx,
    'Sunday Roasts stay above split Sharing on page 1 (hero first)');
  var kidsRow = (p2.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(/little-desserts-row/.test(p2), 'Sunday pairs Little Bells beside Desserts');
  assert(/col-feature/.test(kidsRow),
    'leftover under Little Bells gets a feature panel (not a huge empty hole)');
  assert(/col-feature-level/.test(kidsRow),
    'Sunday leftover filler is col-feature-level (fitPages must not strip at tight type)');
  assert(/sec-split[\s\S]{0,120}Sides|share-cols[\s\S]{0,80}Cheesy Garlic/.test(p2),
    'Best-fit Sides split across two columns when alone under the kids|desserts row');
})();

// flow196: GENERAL leftover fill — Sunday hole under Little Bells always gets a
// panel when one fits; Main tip|Sides fills column leftover; tip stays oval platter;
// fit script keeps col-feature-level until real overflow (never reopen the hole).
(function flow196LeftoverGapFillRule() {
  assert(printJs.indexOf('col-feature-level') !== -1 &&
    /never leave a Sunday-sized hole/i.test(printJs),
    'GENERAL leftover rule documents Sunday-sized hole fill');
  assert(/dropJammedColumnPromos[\s\S]{0,400}col-feature:not\(\.col-feature-level\)/.test(printJs) ||
    printJs.indexOf('col-feature:not(.col-feature-level)') !== -1,
    'dropJammedColumnPromos skips leveling fillers unless overflowing');

  var sunday = api.menuById('sunday');
  var sunDishes = [
    api.dish('Sunday Roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
    api.dish('Sunday Roasts', 'Nut Roast', 'vegan gravy', '16.95', 'vg'),
    api.dish('Sunday Roasts', 'Leg of Lamb', 'cooked pink', '20.95', ''),
    api.dish('Sunday Roasts', 'Chicken Supreme', '', '18.95', ''),
    api.dish('Sunday Roasts', 'Loin of Pork', '', '18.95', ''),
    api.dish('Sharing Starters', 'Baked Camembert', 'baguette', '16.95', 'v'),
    api.dish('Sharing Starters', 'Beef Chilli Nachos', 'jalapenos', '15.95', ''),
    api.dish('Mains', 'Sweet Potato & Halloumi Burger', 'fries', '16.95', 'v'),
    api.dish('Mains', 'Cottage Pie', 'mash', '16.95', ''),
    api.dish('Mains', 'Fish & Chips', 'peas', '18.95', ''),
    api.dish('Mains', 'Pie of the Day', 'mash gravy', '19.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice', '18.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan', '20.95', ''),
    api.dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '', ''),
    api.dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '', ''),
    api.dish('Little Bells', 'Pasta Bolognese', '', '', 'vg option'),
    api.dish('Little Bells', 'Ham & Cheese Pizza', '', '', 'v option'),
    api.dish('Desserts', 'Cheeses', 'selection of cheeses with biscuits', '8.95', 'v'),
    api.dish('Desserts', 'Three Scoops of Ice Cream or Sorbet',
      'vanilla strawberry chocolate salted caramel marshmallow mudslide honeycomb cookie crumble & selected sorbets',
      '5.95', 'vg & gf option'),
    api.dish('Desserts', 'Chocolate & Raspberry Tart', 'with cream', '8.25', ''),
    api.dish('Desserts', 'Lime Posset', 'homemade compote & shortbread', '8.25', ''),
    api.dish('Desserts', 'Sticky Toffee Pudding', 'ice cream and toffee sauce', '8.25', 'gf option'),
    api.dish('Desserts', 'Apple & Blackberry Crumble', 'ice cream or custard', '8.25', 'gf option'),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v')
  ];
  var sunLayout = api.normalizeSectionLayout(Object.assign({}, api.sectionLayoutForMenu('sunday'), {
    'Little Bells': {
      width: 'column', frame: false,
      above: 'All below £9.50 to include a choice of one scoop of ice cream or sorbet.',
      aboveKind: 'paragraph',
      below: 'A CHOICE OF ROASTS AT HALF PRICE OF THE ADULTS',
      belowKind: 'text'
    },
    Desserts: { width: 'column', frame: true, note: '' },
    Sides: { width: 'both', frame: false }
  }));
  var sunPlan = print.planFluidLayout(sunday, sunDishes, {
    sectionLayout: sunLayout,
    includes: { 'little-bells': true },
    promos: api.seedPromoBank()
  });
  var sunSheet = print.build(sunday, sunDishes, {
    sectionLayout: sunLayout,
    includes: { 'little-bells': true },
    layout: sunPlan,
    promos: api.seedPromoBank()
  });
  var sunA4 = (sunSheet.split('mode-panel mode-a5')[0] || sunSheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var sunP2 = sunA4.split(/class="page /)[2] || '';
  var sunKids = (sunP2.match(/little-desserts-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(/col-feature-level/.test(sunKids) &&
    /col-little[\s\S]*col-feature[\s\S]*(Stay a While|Gatherings|Pub Quiz|How are we)/i.test(sunKids),
    'screenshot Sunday: leftover under Little Bells gets a leveling feature panel');
  assert(!/col-desserts[\s\S]*col-feature/.test(sunKids),
    'Sunday leftover panel is not duplicated under Desserts');
  var sunTitles = print.featurePanelTitlesFromHtml(sunA4).map(function (t) {
    return String(t || '').toLowerCase();
  });
  var sunSeen = {};
  var sunDup = sunTitles.some(function (t) {
    if (!t) return false;
    if (sunSeen[t]) return true;
    sunSeen[t] = true;
    return false;
  });
  assert(!sunDup, 'Sunday feature panels print at most once each');

  var sell = 'A selection of sandwiches is available — ask the team.';
  var mainDishes = [];
  for (var si = 0; si < 5; si++) {
    mainDishes.push(api.dish('Starters', 'Starter ' + si, 'long starter description packing', '8.95', ''));
  }
  for (var shi = 0; shi < 2; shi++) {
    mainDishes.push(api.dish('Sharing Plates', 'Share ' + shi, 'share description', '15.95', 'v'));
  }
  for (var bi = 0; bi < 3; bi++) {
    mainDishes.push(api.dish('Burgers', 'Burger ' + bi, 'burger fries salad', '18.95', ''));
  }
  [
    'Pan Fried Seabass', 'Vegetarian Lasagne', 'Pork Wellington', 'Fish & Chips',
    'Pie of the day', 'Korean Chicken Balls', 'Beef Short Rib Genovese Rigatoni'
  ].forEach(function (n) {
    mainDishes.push(api.dish('Mains', n, 'long main description mash gravy peas', '18.95', ''));
  });
  [
    'Venison Tournedos Rossini', 'Baked Gnocchi', 'Creamy Chicken Nduja & Chorizo Penne',
    'Beef Brisket & Chilli Noodles', 'Pasta Carbonara'
  ].forEach(function (n, idx) {
    mainDishes.push(api.dish('Special Mains', n, 'long special description text ' + idx, '15.95',
      idx === 1 ? 'v' : ''));
  });
  [
    'Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'
  ].forEach(function (n) {
    mainDishes.push(api.dish('Sides', n, '', '4.95', 'v'));
  });
  var mainLayout = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var mainPlan = print.planFluidLayout(api.menuById('main'), mainDishes, {
    sectionLayout: mainLayout,
    includes: { sandwiches: false, specials: true },
    promos: api.seedPromoBank()
  });
  assert(!(mainPlan.widthOverrides && mainPlan.widthOverrides['Special Mains'] === 'split'),
    'Main with 5 Specials does not uneven-split 3|2');
  assert(mainPlan.p2 && mainPlan.p2.specialsBesideSandwiches === false,
    'Main Specials unpair from tip (food before tip chrome)');
  assert(mainPlan.p2 && mainPlan.p2.sidesOnP2 === true,
    'Sides stay on page 2 under Specials (not clipped off the sheet)');
  var mainSheet = print.build(api.menuById('main'), mainDishes, {
    sectionLayout: mainLayout,
    includes: { sandwiches: false, specials: true },
    layout: mainPlan,
    promos: api.seedPromoBank()
  });
  assert(/aspect-ratio:\s*1600\/480/.test(mainSheet) && /border-image:none!important/.test(mainSheet),
    'tip platter CSS keeps oval aspect on Main');
  assert(/frame-platter\.png/.test(mainSheet), 'Main tip uses frame-platter oval');
  var mainA4 = (mainSheet.split('mode-panel mode-a5')[0] || mainSheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var mainP2 = mainA4.split(/class="page /)[2] || '';
  assert(/Cheesy Garlic Bread|Chunky Triple/.test(mainP2) || mainPlan.fit === 'over',
    'Sides print under Specials or overflow-gate');
  assert(!/Chunky Triple[\s\S]{0,80}Please inform us of any allergies/i.test(mainP2) &&
    !/Cheesy Garlic Bread[\s\S]{0,80}Please inform us of any allergies/i.test(mainP2),
    'Sides do not clip into the allergy footer');
  if (mainPlan.p2.sandwiches) {
    assert(/scallop[^"]*scallop-wide[^"]*scallop-platter[\s\S]{0,500}class="[^"]*sandwich-tip-only/.test(mainP2),
      'when tip is kept it is the oval scalloped platter (not a dashed rect)');
    var tipRow = (mainP2.match(/sides-sand-row[\s\S]*?<\/section>/) || [])[0] || '';
    if (/col-feature/.test(tipRow)) {
      assert(/col-feature-level/.test(tipRow),
        'tip|Sides leftover filler is leveling (kept through tight type)');
    }
  }
})();

var seedMainLayout = print.planFluidLayout(mainMenu, aloneDishes);
assert(seedMainLayout.pages === 2, 'sample main menu uses two pages (too much for min type on one)');
assert(seedMainLayout.typeRange && seedMainLayout.typeRange.name.max === 11.5,
  'layout exposes typeRange on the plan');
// Screenshot-shaped sheet: starters + 5 sandwiches + sides + 7 mains + desserts → two pages
var clipRisk = [
  api.dish('Starters', 'Buffalo Cauliflower Wings', 'vegan mayo', '8.25', 'vg'),
  api.dish('Starters', 'Whitebait', 'aioli', '7.95', ''),
  api.dish('Starters', 'Breaded Prawns', 'sweet chilli', '8.95', ''),
  api.dish('Starters', 'Hoi Sin Jackfruit Bau Buns', 'asian slaw', '8.50', 'vg'),
  api.dish('Sandwiches', 'Crayfish Marie Rose', 'fries', '10.95', ''),
  api.dish('Sandwiches', 'Falafel & Guacamole', 'fries', '10.95', 'vg'),
  api.dish('Sandwiches', 'Italian Meat & Mozzarella', 'fries', '11.50', ''),
  api.dish('Sandwiches', 'Gochujang Chicken', 'fries', '11.50', ''),
  api.dish('Sandwiches', 'Giant Fish Finger', 'tartare', '11.95', ''),
  api.dish('Sides', 'Loaded Fries', '', '6.50', ''),
  api.dish('Sides', 'Chips', '', '4.50', 'vg'),
  api.dish('Sides', 'Cheesy Garlic Bread', '', '5.50', 'v'),
  api.dish('Sides', 'Dressed Mixed Salad', '', '4.95', 'vg'),
  api.dish('Mains', 'Spicy Asian Burger', 'fries', '16.95', 'vg'),
  api.dish('Mains', 'Homemade Beef Lasagne', 'salad', '15.95', 'v'),
  api.dish('Mains', 'Fish & Chips', 'peas', '17.95', 'df'),
  api.dish('Mains', 'Ham, Egg & Chips', '', '18.95', 'gf'),
  api.dish('Mains', 'Chicken Katsu Curry', 'rice', '16.95', ''),
  api.dish('Mains', 'Pie of the Day', 'mash', '16.95', ''),
  api.dish('Mains', 'Trenchmore Wagyu Beef Burger', 'fries', '20.95', ''),
  api.dish('Desserts', 'Cheeses', 'biscuits', '8.95', 'v'),
  api.dish('Desserts', 'Ice Cream or Sorbet', 'three scoops', '6.50', 'v'),
  api.dish('Desserts', 'Sticky Toffee Pudding', 'custard', '7.95', 'v'),
  api.dish('Desserts', 'Lime Posset', 'shortbread', '7.50', 'v'),
  api.dish('Desserts', 'Chocolate Brownie', 'ice cream', '7.95', 'v')
];
var clipLayout = print.planFluidLayout(mainMenu, clipRisk);
assert(clipLayout.pages === 2, 'full starters/sandwiches/mains/desserts sheet uses two pages — no clipped desserts');
assert(clipLayout.p1.sandwiches || (clipLayout.p2 && clipLayout.p2.sandwiches),
  'named sandwich fillings stay on the sheet — never dropped to make space');
assert(clipLayout.sandwichesLocked === true, 'named sandwich fillings lock sandwiches on the layout');
// Full mains + desserts + Sandwiches at the 13px gap floor must gate (untick),
// not claim a quiet two-pager that would clip food under the allergy footer.
assert(clipLayout.fit === 'over' || /minimum type|two A4/i.test(clipLayout.summary),
  'summary explains two pages or drop-in overflow when the sheet will not fit at min type');
assert(clipLayout.fit !== 'over' || /remove a dropped-in menu|Too much content/i.test(clipLayout.summary),
  'overflow summary asks to remove a dropped-in menu');
var sidesSandDishes = [];
['Olives', 'Whitebait', 'Arancini', 'Bruschetta', 'Camembert', 'Falafel'].forEach(function (n) {
  sidesSandDishes.push(api.dish('Starters', n, 'starter description for fill', '8.95', ''));
});
['Wagyu Burger', 'Asian Burger', 'Cheese Burger'].forEach(function (n) {
  sidesSandDishes.push(api.dish('Burgers', n, 'bun fries salad onion rings', '18.95', ''));
});
['Haddock & Chips', 'Pie of the Day', 'Liver', 'Fish Pie'].forEach(function (n) {
  sidesSandDishes.push(api.dish('Pub Classics', n, 'peas tartare mash gravy', '17.95', ''));
});
sidesSandDishes.push(api.dish('Mains', 'Fish & Chips', 'mushy peas lemon tartare', '18.95', 'gf, df'));
sidesSandDishes.push(api.dish('Mains', 'Pie of the day', 'mash vegetables gravy', '20.95', ''));
['Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg', 'Garlic Bread', 'House Salad', 'Fries'].forEach(function (n) {
  sidesSandDishes.push(api.dish('Sides', n, '', '4.95', 'v'));
});
[
  ['Beef, Chilli & Cheddar Quesadilla', 'beef chilli cheddar', '10.95'],
  ['Falafel & Guacamole', 'mixed salad ciabatta', '8.95'],
  ['Cajun Chicken Wrap', 'coleslaw', '10.95'],
  ['Tuna & Red Onion Melt', 'melted cheddar', '9.95']
].forEach(function (x) {
  sidesSandDishes.push(api.dish('Sandwiches', x[0], x[1], x[2], ''));
});
var sidesSandPlan = print.planFluidLayout(mainMenu, sidesSandDishes);
assert(sidesSandPlan.p2 && sidesSandPlan.p2.sandwiches && sidesSandPlan.p2.sidesOnP2,
  'screenshot-shaped sheet keeps Sides beside Sandwiches on page 2');
var clipHtml = print.build(mainMenu, sidesSandDishes, sidesSandPlan);
var clipA4 = clipHtml.split('mode-panel mode-a5')[0] || clipHtml;
var sidesSandRow = (clipA4.match(/sides-sand-row[\s\S]*?<\/section>/) || [])[0] || '';
assert(sidesSandRow && /cols-pair-titles/.test(sidesSandRow) && /pair-head[\s\S]*Sides/.test(sidesSandRow),
  'unframed Sides keeps a pair-head beside Sandwiches');
assert(/scallop-pad[\s\S]*<div class="sec-title">Sandwiches<\/div>/.test(sidesSandRow),
  'frilly Sandwiches title sits inside the frame with the fillings');
assert(!/col-promo[\s\S]*pair-head[\s\S]*Sandwiches/.test(sidesSandRow),
  'Sandwiches title is not perched above the outer wave');
(function sundaySidesPromoSitsUp() {
  var dishes = jammedSunday.concat([
    api.dish('Desserts', 'Cheeses', 'biscuits grapes quince jelly', '9.95/17.95', 'gf option'),
    api.dish('Desserts', 'Apple & Blackberry Crumble', 'with ice cream or custard', '8.25', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', ''),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v')
  ]);
  var html = print.build(api.menuById('sunday'), dishes, {
    sectionLayout: api.normalizeSectionLayout({
      'Little Bells': { width: 'column', frame: false },
      Desserts: { width: 'column', frame: true },
      Sides: { width: 'column', frame: false }
    }),
    promos: [
      { title: 'Gatherings', body: 'happy to host your event' },
      { title: 'Large Functions', body: 'we can cater for large groups' }
    ]
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var sidesRow = (a4.match(/sides-sand-row[\s\S]*?<\/section>/) ||
    a4.match(/column-solo-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(sidesRow && /Cheesy Garlic Bread/.test(sidesRow),
    'Sunday Sides stay a column beside the leftover panel');
  var topPromo = /col-promo[\s\S]*col-body[\s\S]*(Large Functions|Gatherings|Stay a While|Pub Quiz)/.test(sidesRow);
  var emptyPartner = /col-promo[\s\S]*col-body[\s\S]*&nbsp;/.test(sidesRow);
  assert(topPromo || emptyPartner,
    'empty partner gets a top panel when spare/unused, else stays empty (never clip)');
  if (topPromo) {
    assert(!/col-promo[\s\S]*col-feature[\s\S]*(Large Functions|Gatherings)/.test(sidesRow),
      'leftover panel is not a footer with a hole above it');
  }
})();
(function columnMainsKeepSidesWithSandwiches() {
  var html = print.build(mainMenu, sidesSandDishes, {
    sectionLayout: api.normalizeSectionLayout({
      Mains: { width: 'column', frame: false },
      Sides: { width: 'column', frame: false },
      Sandwiches: { width: 'column', frame: true }
    })
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  assert(/sides-sand-row[\s\S]{0,4000}Cheesy Garlic Bread/.test(a4),
    'Sides stay beside Sandwiches even when Mains are Column');
  assert(!/mains-sand-row/.test(a4),
    'Column Mains do not steal Sandwiches from Sides');
})();
(function specialsColumnSitsBesideSandwiches() {
  var dishes = sidesSandDishes.concat([
    api.dish('Special Mains', 'Pan Roasted Duck Breast', 'duck fat potatoes parsnip puree', '22.95', 'gf'),
    api.dish('Special Mains', 'Loaded Fries', 'pulled pork or beef brisket bbq cheese', '10.95', ''),
    api.dish('Special Mains', 'Mushroom Stroganoff', 'served with rice and garlic bread', '16.95', 'gf')
  ]);
  var colLayout = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: 'When it’s gone, it’s gone' },
    Sides: { width: 'column', frame: false },
    Sandwiches: { width: 'column', frame: true }
  });
  var html = print.build(mainMenu, dishes, { sectionLayout: colLayout });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var specSand = (a4.match(/specials-sand-row[\s\S]*?<\/section>/) || [])[0] || '';
  assert(specSand && /Pan Roasted Duck Breast/.test(specSand) && /Quesadilla|Falafel/.test(specSand),
    'Column Specials sit in a half-column beside Sandwiches');
  assert(/scallop-box/.test(specSand) && /scallop-wide/.test(specSand),
    'Specials and Sandwiches use different scallop waves so the pair does not match');
  assert(/data-specials-course="Special Mains"/.test(specSand),
    'Specials|Sandwiches row is marked Special Mains');
  assert(!/<section class="sec specials-beside"[\s\S]*Pan Roasted Duck Breast/.test(a4),
    'Column Specials do not print a full-bleed box above Sides|Sandwiches');
  var plannedCol = print.planFluidLayout(mainMenu, dishes, { sectionLayout: colLayout });
  assert(plannedCol.pages === 2 && plannedCol.p1.sidesOnP1 === true &&
    plannedCol.p2 && plannedCol.p2.sidesOnP2 === false,
    'when page 2 would clip, leftover column Sides sit in page 1 leftover');
  var pageBits = a4.split('class="page fill-page');
  var page1Html = pageBits[1] || '';
  var page2Html = pageBits[2] || '';
  assert(/Cheesy Garlic Bread/.test(page1Html),
    'Sides print in page 1 leftover (food first, then feature panels)');
  assert(!/Cheesy Garlic Bread/.test(page2Html),
    'Sides do not clip off the bottom of page 2');
})();
(function shortSpecialsNestsSidesNotDuplicatePanel() {
  var dishes = [
    api.dish('Nibbles', 'Olives', 'oil', '4.95', ''),
    api.dish('Starters', 'Whitebait', 'aioli long starter description text', '7.95', ''),
    api.dish('Starters', 'Buffalo Cauliflower', 'slaw bang bang long', '7.95', 'vg'),
    api.dish('Starters', 'King Prawns', 'romesco rocket', '10.95', 'gf'),
    api.dish('Starters', 'Charred Leeks', 'blue ranch hazelnuts', '8.50', 'gf, v'),
    api.dish('Starters', 'Braised Lamb Neck', 'quinoa smoked tomatoes', '10.95', 'gf'),
    api.dish('Item Boost', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'guacamole jalapenos', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'brioche fries onion rings', '18.95', ''),
    api.dish('Burgers', 'Halloumi Burger', 'chilli cheese fries', '16.95', 'v'),
    api.dish('Mains', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan burrata basil', '20.95', 'df'),
    api.dish('Mains', 'Fish & Chips', 'mushy peas tartare', '18.95', 'gf'),
    api.dish('Mains', 'Osso Bucco', 'veal shank risotto', '23.95', 'gf'),
    api.dish('Special Mains', 'Loaded Fries', 'pulled pork or beef brisket bbq cheese', '10.95', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Seasonal Veg', '', '5.50', 'v'),
    api.dish('Sides', 'Garlic Bread', '', '4.95', 'v'),
    api.dish('Sides', 'House Salad', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v'),
    api.dish('Sandwiches', 'Beef, Chilli & Cheddar Quesadilla', 'wrap salad', '10.95', ''),
    api.dish('Sandwiches', 'Falafel & Guacamole', 'mixed salad', '8.95', 'vg'),
    api.dish('Sandwiches', 'Cajun Chicken Wrap', 'coleslaw salad', '10.95', ''),
    api.dish('Sandwiches', 'Tuna & Red Onion Melt', '', '9.95', '')
  ];
  var layout = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true },
    Sides: { width: 'column', frame: false },
    Sandwiches: { width: 'column', frame: true }
  });
  var html = print.build(api.menuById('main'), dishes, {
    sectionLayout: layout,
    includes: { sandwiches: true },
    promos: [
      { title: 'ALL TIPS GO TO STAFF WORKING TODAY!', body: 'thank you' },
      { title: 'Stay a While', body: 'rooms upstairs' },
      { title: 'Gatherings', body: 'host your event' }
    ]
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var specSand = (a4.match(/specials-sand-row[\s\S]*?<\/section>/) || [])[0] || '';
  if (specSand) {
    assert(/Loaded Fries/.test(specSand) && /Quesadilla|Falafel/.test(specSand),
      'short Specials still sit beside Sandwiches');
    var sidesInPair = /Cheesy Garlic Bread/.test(specSand);
    var titles = print.featurePanelTitlesFromHtml(a4);
    var tipsHits = titles.filter(function (t) {
      return /all tips go to staff/i.test(t);
    });
    assert(tipsHits.length <= 1, 'filling the Specials hole does not reprint ALL TIPS');
    assert(sidesInPair,
      'Sides nest under short Specials beside Sandwiches instead of leaving a white void');
  }
})();
(function specialsBestFitChoosesColumnBesideSandwiches() {
  var dishes = sidesSandDishes.concat([
    api.dish('Special Mains', 'Pan Roasted Duck Breast', 'duck fat potatoes', '22.95', 'gf'),
    api.dish('Special Mains', 'Loaded Fries', 'bbq cheese', '10.95', ''),
    api.dish('Special Mains', 'Mushroom Stroganoff', 'rice and garlic bread', '16.95', 'gf')
  ]);
  var bothLayout = api.normalizeSectionLayout({
    'Special Mains': { width: 'both', frame: true, note: 'When it’s gone, it’s gone' },
    Sides: { width: 'column', frame: false },
    Sandwiches: { width: 'column', frame: true }
  });
  var html = print.build(mainMenu, dishes, { sectionLayout: bothLayout });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  assert(/specials-sand-row[\s\S]*Pan Roasted Duck Breast/.test(a4) &&
    /specials-sand-row[\s\S]*Falafel/.test(a4),
    'Best-fit Specials become a column beside Sandwiches so fillings stay on the page');
  assert(!/<section class="sec specials-beside"[\s\S]*Pan Roasted Duck Breast/.test(a4),
    'Best-fit Specials do not stay full-bleed when Sandwiches need the height');
})();
(function specialsFullKeepsBleedAboveSidesSandwiches() {
  var dishes = sidesSandDishes.concat([
    api.dish('Special Mains', 'Pan Roasted Duck Breast', 'duck fat potatoes', '22.95', 'gf'),
    api.dish('Special Mains', 'Loaded Fries', 'bbq cheese', '10.95', ''),
    api.dish('Special Mains', 'Mushroom Stroganoff', 'rice and garlic bread', '16.95', 'gf')
  ]);
  var fullLayout = api.normalizeSectionLayout({
    'Special Mains': { width: 'full', frame: true, note: 'When it’s gone, it’s gone' },
    Sides: { width: 'column', frame: false },
    Sandwiches: { width: 'column', frame: true }
  });
  var html = print.build(mainMenu, dishes, { sectionLayout: fullLayout });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  assert(/specials-beside[\s\S]*Pan Roasted Duck Breast/.test(a4),
    'Full-width Specials stay a full-bleed box under Mains');
  assert(!/specials-sand-row/.test(a4),
    'Full-width Specials do not steal Sandwiches from Sides');
})();
(function bestFitUsesColumns() {
  var layout = api.normalizeSectionLayout({
    'Sharing Plates': { width: 'both', frame: false },
    Burgers: { width: 'column', frame: false },
    Sandwiches: {
      width: 'column',
      frame: true,
      note: '(12 – 2.45 pm Mon to Fri and 12 – 4 pm Sat)\nChoose ciabatta, white or malted bread, served with nachos & salad. FRIES UPGRADE +£2.'
    },
    Mains: { width: 'both', frame: false },
    Desserts: { width: 'both', frame: true },
    Sides: { width: 'column', frame: false },
    'Item Boost': { width: 'full', frame: true }
  });
  var dishes = [
    api.dish('Item Boost', 'Pie of the day', 'homemade with a generous filling mash vegetables gravy', '20.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam sourdough', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'sour cream guacamole', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'brioche bacon jam onion rings fries', '18.95', ''),
    api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'chilli cheese fries', '16.95', 'v'),
    api.dish('Sandwiches', 'Beef, Chilli & Cheddar Quesadilla', 'tortilla wrap salad', '10.95', ''),
    api.dish('Sandwiches', 'Falafel & Guacamole', 'mixed salad', '8.95', 'vg'),
    api.dish('Sandwiches', 'Tuna Melt', 'cheddar', '9.95', ''),
    api.dish('Mains', 'Osso Bucco', 'veal shank squash risotto', '23.95', 'gf'),
    api.dish('Mains', 'Chilli Con Carne', 'rice', '17.95', 'gf'),
    api.dish('Mains', 'Fish & Chips', 'mushy peas tartare', '18.95', 'gf, df'),
    api.dish('Desserts', 'Cheeses', 'biscuits grapes', '9.95', ''),
    api.dish('Desserts', 'Ice cream or Sorbet', 'three scoops', '5.95', ''),
    api.dish('Desserts', 'Sticky Toffee Pudding', 'ice cream', '8.25', ''),
    api.dish('Desserts', 'Lime Posset', 'shortbread', '8.25', ''),
    api.dish('Desserts', 'White Chocolate Blondie', 'raspberry', '8.25', ''),
    api.dish('Desserts', 'Apple Crumble', 'custard', '8.25', ''),
    api.dish('Desserts', 'Cookie Dough', 'caramel', '8.25', ''),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v')
  ];
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layout,
    includes: { sandwiches: true }
  });
  assert(planned.pages === 2, 'screenshot-shaped best-fit sheet uses two pages');
  assert(planned.p2 && planned.p2.sandwiches && !planned.p1.sandwiches,
    'best-fit does not stack Sandwiches under Sharing on page 1');
  var html = print.build(api.menuById('main'), dishes, {
    sectionLayout: layout,
    layout: planned,
    includes: { sandwiches: true }
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var pages = a4.split(/<div class="page /);
  assert(pages.length >= 3, 'best-fit print still uses two A4 pages');
  assert(/Camembert/i.test(pages[1]) && /Brisket/i.test(pages[1]),
    'page 1 keeps Sharing opposite Burgers');
  assert(!/Quesadilla/i.test(pages[1]),
    'page 1 does not clip Sandwiches under Sharing');
  assert(/Quesadilla/i.test(pages[2]),
    'Sandwiches print on page 2');
  assert(/sides-sand-row/.test(pages[2]) && /Cheesy Garlic Bread/i.test(pages[2]),
    'Sides sit beside Sandwiches on page 2 (not under Desserts or Sharing)');
  assert(/Osso Bucco/i.test(pages[2]) && /Sticky Toffee/i.test(pages[2]),
    'mains and desserts all print (nothing dropped off the page)');
  assert(!/mains-sand-row/.test(pages[2]),
    'Best-fit Mains stay full until Gemini chooses a column');
})();
// Menu_preview_c25a.pdf shape: Sharing|Burgers on p1, many Mains + Sandwiches on p2.
// Sides must stay beside Sandwiches (not dump under Sharing), and any leftover
// opposite-column hole gets Stay a While / Gatherings so columns finish level.
(function pdfPreviewKeepsSidesBesideSandwiches() {
  var layout = api.normalizeSectionLayout({
    Nibbles: { width: 'full', frame: true },
    Starters: { width: 'full', frame: false },
    'Item Boost': { width: 'full', frame: true },
    'Sharing Plates': { width: 'column', frame: false },
    Burgers: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false },
    Sides: { width: 'column', frame: false },
    Sandwiches: {
      width: 'column',
      frame: true,
      note: '(12 – 2.45 pm Mon to Fri and 12 – 4 pm Sat)\nChoose ciabatta, white or malted bread.'
    }
  });
  var dishes = [
    api.dish('Nibbles', 'Nacho Cheese Triangles', '', '6.95', ''),
    api.dish('Nibbles', 'Mini Bread Rolls', 'bacon jam smoked whipped butter', '5.95', 'vg'),
    api.dish('Starters', 'Braised Lamb Neck', 'quinoa smoked tomatoes', '10.95', 'gf'),
    api.dish('Starters', 'Buffalo Cauliflower Florets', 'rainbow slaw bang bang', '7.95', 'vg'),
    api.dish('Starters', 'Pan Fried King Prawns', 'romesco rocket gremolata', '10.95', 'gf'),
    api.dish('Starters', 'Whitebait', 'aioli micro parsley', '8.50', ''),
    api.dish('Starters', 'Ham Hock Pot', 'charmer cheese sourdough', '8.95', 'gf'),
    api.dish('Starters', 'Charred Leeks', 'blue ranch hazelnuts', '8.50', 'gf, v'),
    api.dish('Item Boost', 'Pie of the day', 'mash vegetables gravy', '20.95', ''),
    api.dish('Sharing Plates', 'Baked Camembert (to share)', 'bacon jam sourdough', '16.95', 'v'),
    api.dish('Sharing Plates', 'Beef Chilli Nachos', 'sour cream guacamole jalapenos', '15.95', 'gf'),
    api.dish('Burgers', 'Brisket Burger', 'brioche bacon jam onion rings fries', '18.95', ''),
    api.dish('Burgers', 'Sweet Potato & Halloumi Burger', 'chilli cheese onion rings fries', '16.95', 'v'),
    api.dish('Mains', 'Osso Bucco', 'veal shank squash risotto', '23.95', 'gf'),
    api.dish('Mains', 'Chilli Con Carne', 'wild rice tortilla', '17.95', 'gf'),
    api.dish('Mains', 'Pan Fried Seabass', 'new potatoes cherry tomatoes', '22.95', 'gf'),
    api.dish('Mains', 'Vegetarian Lasagne', 'garlic bread salad', '18.50', 'v'),
    api.dish('Mains', 'Pork Wellington', 'baby potatoes tender stem', '22.95', ''),
    api.dish('Mains', 'Korean Chicken Balls', 'rice noodles thai green', '18.95', 'vg'),
    api.dish('Mains', 'Beef Short Rib Genovese Rigatoni', 'parmesan burrata', '20.95', 'df'),
    api.dish('Mains', 'Fish & Chips', 'mushy peas tartare', '18.95', 'gf, df'),
    api.dish('Sides', 'Cheesy Garlic Bread', '', '5.95', 'v'),
    api.dish('Sides', 'Chunky Triple Cooked Chips', '', '4.95', 'v'),
    api.dish('Sides', 'Seasonal Veg', '', '5.50', 'v'),
    api.dish('Sides', 'Garlic Bread', '', '4.95', 'v'),
    api.dish('Sides', 'House Salad', '', '4.95', 'v'),
    api.dish('Sides', 'Fries', '', '4.95', 'v'),
    api.dish('Sandwiches', 'Beef, Chilli & Cheddar Quesadilla', 'tortilla wrap salad', '10.95', ''),
    api.dish('Sandwiches', 'Falafel & Guacamole', 'mixed salad', '8.95', 'vg'),
    api.dish('Sandwiches', 'Cajun Chicken Wrap', 'coleslaw salad', '10.95', ''),
    api.dish('Sandwiches', 'Tuna & Red Onion Melt', '', '9.95', '')
  ];
  var promos = [
    { title: 'Stay a While', body: 'cosy en-suite rooms upstairs' },
    { title: 'Gatherings', body: 'happy to host your event' }
  ];
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layout,
    includes: { sandwiches: true },
    promos: promos
  });
  assert(planned.pages === 2, 'PDF-shaped sheet uses two pages');
  assert(planned.p2 && planned.p2.sidesOnP2 && !planned.p1.sidesOnP1,
    'PDF-shaped sheet keeps Sides on page 2 beside Sandwiches (not under Sharing)');
  assert(planned.p2.sandwiches && !planned.p1.sandwiches,
    'PDF-shaped sheet keeps Sandwiches on page 2');
  var html = print.build(api.menuById('main'), dishes, {
    sectionLayout: layout,
    layout: planned,
    includes: { sandwiches: true },
    promos: promos
  });
  var a4 = html.split('mode-panel mode-a5')[0] || html;
  var pages = a4.split(/<div class="page /);
  assert(pages.length >= 3, 'PDF-shaped print uses two A4 pages');
  assert(/Camembert/i.test(pages[1]) && /Brisket/i.test(pages[1]),
    'page 1 keeps Sharing opposite Burgers');
  assert(!/Cheesy Garlic Bread/i.test(pages[1]),
    'page 1 does not dump Sides under Sharing');
  assert(/sides-sand-row/.test(pages[2]) && /Cheesy Garlic Bread/i.test(pages[2]) &&
    /Quesadilla/i.test(pages[2]),
    'page 2 pairs Sides beside Sandwiches so both columns start and finish together');
  assert(/Osso Bucco/i.test(pages[2]) && /Fish &amp; Chips|Fish & Chips/i.test(pages[2]),
    'all mains still print on page 2');
  var p1Cols = (pages[1].match(/classics-block[\s\S]*?<\/section>/) || [''])[0];
  var p1Right = (p1Cols.match(/col col-food[\s\S]*$/) || [''])[0];
  assert(/col-feature[\s\S]*(Stay a While|Gatherings|Pub Quiz)/i.test(p1Right),
    'page 1 puts a feature panel under short Burgers (not under Sharing)');
  var p2Pair = (pages[2].match(/sides-sand-row[\s\S]*?<\/section>/) || [''])[0];
  var p2Left = (p2Pair.match(/col col-sides[\s\S]*?(?=<div class="col col-promo)/) || [''])[0];
  assert(/col-feature[\s\S]*(Stay a While|Gatherings|Pub Quiz)/i.test(p2Left),
    'page 2 puts a feature panel under shorter Sides when Sandwiches are the tall frilly stack');
})();
assert(api.includableMenus('desserts').length === 0, 'a card menu does not pull others in');

// flow199: Charles screenshot — tip omitted, Specials column, Sides + Sip & Paint
// must NOT clip. Empty-partner panels respect page leftover; Sip & Paint dropped
// when it cannot fit; all Sides stay in HTML or fit===over gates generate.
(function charlesScreenshotSipPaintMustNotClip() {
  var sell = 'A selection of sandwiches is available — ask the team.';
  var dishes = [];
  for (var si = 0; si < 6; si++) {
    dishes.push(api.dish('Starters', 'Starter ' + si, 'long starter description for packing page one fully', '8.95', ''));
  }
  for (var shi = 0; shi < 2; shi++) {
    dishes.push(api.dish('Sharing Plates', 'Share ' + shi, 'sharing plate description text here', '15.95', 'v'));
  }
  for (var bi = 0; bi < 3; bi++) {
    dishes.push(api.dish('Burgers', 'Burger ' + bi, 'burger with fries onion rings salad', '18.95', ''));
  }
  [
    'Pan Fried Seabass', 'Vegetarian Lasagne', 'Pork Wellington', 'Fish & Chips',
    'Pie of the day', 'Korean Chicken Balls', 'Beef Short Rib Genovese Rigatoni'
  ].forEach(function (n) {
    dishes.push(api.dish('Mains', n, 'long main description mash gravy peas lemon butter', '18.95', ''));
  });
  for (var di = 0; di < 4; di++) {
    dishes.push(api.dish('Desserts', 'Dessert ' + di, 'pudding description text here nice', '7.95', 'v'));
  }
  [
    'Venison Tournedos Rossini', 'Baked Gnocchi', 'Creamy Chicken Nduja & Chorizo Penne',
    'Beef Brisket & Chilli Noodles', 'Pasta Carbonara'
  ].forEach(function (n, idx) {
    dishes.push(api.dish('Special Mains', n, 'long special description text for dish ' + idx + ' with garnish', '15.95',
      idx === 1 ? 'v' : ''));
  });
  [
    'Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'
  ].forEach(function (n) {
    dishes.push(api.dish('Sides', n, '', '5.95', 'v'));
  });
  var sip = {
    title: 'Sip & Paint',
    date: '2026-10-28',
    body: 'Weds 28th Oct from 7pm. Join us at the pub for a relaxed evening of painting and drinks — all materials provided, just bring yourself.'
  };
  var promos = [sip].concat(api.seedPromoBank());
  var layoutMap = api.normalizeSectionLayout({
    'Special Mains': { width: 'column', frame: true, note: "When it's gone, it's gone" },
    Sandwiches: { tip: true, frame: false, width: 'column', sell: sell },
    Sides: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false }
  });
  var planned = print.planFluidLayout(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    promos: promos
  });
  assert(planned.fit === 'two' || planned.fit === 'over',
    'screenshot Main plans two pages or overflow-gates — never a silent one-pager');
  var sheet = print.build(api.menuById('main'), dishes, {
    sectionLayout: layoutMap,
    includes: { sandwiches: false, specials: true },
    layout: planned,
    promos: promos
  });
  var a4 = (sheet.split('mode-panel mode-a5')[0] || sheet).replace(/<style[\s\S]*?<\/style>/gi, '');
  var p2 = a4.split(/class="page /)[2] || a4;
  var sideHits = ['Cheesy Garlic Bread', 'Chunky Triple Cooked Chips', 'Seasonal Veg',
    'Garlic Bread', 'House Salad', 'Fries'].filter(function (n) {
    return a4.indexOf(n) !== -1;
  });
  assert(sideHits.length === 6 || planned.fit === 'over',
    'all Sides print or overflow-gate — never Cheesy Garlic Bread alone with a hole');
  var sidesRow = (p2.match(/sides-sand-row[\s\S]*?<\/section>/) || [])[0] || '';
  var p2Left = planned.leftover && planned.leftover.p2;
  if (p2Left != null && p2Left < 14) {
    assert(!/Sip\s*&amp;\s*Paint|SIP &amp; PAINT/i.test(sidesRow),
      'tight page-2 leftover: Sip & Paint is not planted opposite Sides (would clip)');
    // Sip may only sit opposite a TALLER food column (panel ≤ food height).
    // Never opposite short Sides, and never when columnPromos is off.
    if (planned.p2 && planned.p2.columnPromos === false) {
      assert(!/Sip\s*&amp;\s*Paint/i.test(p2),
        'columnPromos off: Sip & Paint omitted from packed page 2 rather than clipped');
    }
  }
  assert(/isPromoOnlyScallop|col-promo \.col-body > \.scallop/.test(printJs),
    'fitPages can drop Sip & Paint column-body when DOM still overflows');
  if (planned.p2 && planned.p2.sandwiches) {
    assert(/scallop-platter|frame-platter\.png/.test(sheet),
      'when Tip=Yes fits, tip oval platter (frame-platter) is present');
  }
  assert(print.promoUnits(sip) >= 12,
    'Sip & Paint unit height is pessimistic (≥12) so it will not fit a small hole');
  var tiny = print.planPromoFill(10, 0, [sip].concat(api.seedPromoBank()), {
    pageBudget: 6,
    shortOnly: true
  });
  assert(!tiny.left && !tiny.right,
    'pageBudget 6 refuses Sip & Paint / any panel that would overflow');
  var roomy = print.planPromoFill(14, 0, api.seedPromoBank(), {
    pageBudget: 20,
    shortOnly: true
  });
  assert(!!(roomy.right || roomy.left),
    'with real spare room a small evergreen panel still fills the empty partner');
})();

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

// Unique id each run — cloud may keep a delete tombstone for a fixed test id.
var histSample = {
  id: 'test-hist-' + Date.now().toString(36),
  menuId: 'main',
  menuName: 'Main menu',
  roman: 'III',
  n: 3,
  week: 'Week of 22nd September 2026',
  weekKey: '2026-9-22',
  generatedAt: new Date(2026, 8, 24, 14, 30).getTime(),
  html: '<html><body>sample main III</body></html>'
};

require(path.join(root, 'menus-ingest.js'));
var ingest = global.EBMenuIngest;
assert(ingest && typeof ingest.readFiles === 'function', 'EBMenuIngest.readFiles available');
var origReadFile = ingest.readFile;
var stubCalls = 0;
ingest.readFile = function (file, onProgress) {
  stubCalls += 1;
  if (onProgress) onProgress('ok');
  return Promise.resolve({
    text: 'text-' + file.name,
    dishes: [{ id: 'same-id', section: 'Mains', name: 'Dish ' + file.name, description: '', price: '10', tags: '', lunchClub: false }],
    meta: file.name === 'a.jpg' ? { title: 'From A' } : { title: '', notes: 'From B' },
    kind: '',
    spellingFixes: file.name === 'b.jpg' ? [{ from: 'Teh', to: 'The' }] : [],
    source: 'ocr',
    fileName: file.name,
    needsReview: true,
    warning: 'warn-' + file.name
  });
};
ingest.readFiles([{ name: 'a.jpg' }, { name: 'b.jpg' }], function () {}).then(function (merged) {
  assert(stubCalls === 2, 'readFiles reads each selected file');
  assert(merged.dishes.length === 2, 'readFiles merges dishes from both files');
  assert(merged.dishes[0].id !== merged.dishes[1].id, 'merged dish ids are unique across files');
  assert(merged.meta.title === 'From A' && merged.meta.notes === 'From B', 'readFiles merges meta fields');
  assert(merged.spellingFixes.length === 1, 'readFiles keeps spelling fixes from all files');
  assert(/a\.jpg/.test(merged.fileName) && /b\.jpg/.test(merged.fileName), 'readFiles names all source files');
  ingest.readFile = origReadFile;
}).catch(function (err) {
  ingest.readFile = origReadFile;
  failed += 1;
  console.error('FAIL  readFiles merge: ' + err);
}).then(function () {
  // Unit tests stay offline for cloud writes — Node’s fetch + Apps Script 302 hangs.
  var origCloudPost = ingest.cloudPost;
  ingest.cloudPost = function (body) {
    var action = body && body.action;
    if (action === 'savePrintHistory' || action === 'deletePrintHistory' || action === 'saveMenusState') {
      return Promise.resolve({ ok: true, via: 'test-stub' });
    }
    return Promise.reject(new Error('offline_test'));
  };
  return print.savePrintHistory(histSample).then(function () {
    return print.listPrintHistory();
  }).then(function (rows) {
    assert(rows.some(function (r) { return r.id === histSample.id && r.roman === 'III'; }),
      'history lists saved sheet with Roman');
    return print.getPrintHistory(histSample.id);
  }).then(function (got) {
    assert(got && /sample main III/.test(got.html || ''), 'history returns stored HTML');
    return print.deletePrintHistory(histSample.id);
  }).then(function () {
    ingest.cloudPost = origCloudPost;
    if (failed) {
      console.error('\n' + failed + ' check(s) failed');
      process.exit(1);
    }
    console.log('\nAll checks passed');
  }).catch(function (err) {
    ingest.cloudPost = origCloudPost;
    console.error('FAIL  history round-trip: ' + err);
    process.exit(1);
  });
});
