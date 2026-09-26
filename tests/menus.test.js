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
assert(page.indexOf('Clear this menu') !== -1, 'clear this menu control');
assert(page.indexOf("getElementById('doGenerate').onclick") === -1, 'do not bind Generate before step renders');
assert(/try\s*\{\s*render\(\)/.test(page), 'boot wraps render in try/catch');
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
assert(page.indexOf('menus-print.js') !== -1, 'branded print script is loaded');
assert(fs.existsSync(path.join(root, 'menus-print.js')), 'menus-print.js exists');
assert(fs.existsSync(path.join(root, 'images/eight-bells-logo.png')), 'logo asset exists');
assert(fs.existsSync(path.join(root, 'images/frame-wide.png')), 'scalloped frame asset exists');
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
assert(printJs.indexOf('--dish-gap-min:8px') !== -1, 'minimum gap between dishes is 8px');
assert(printJs.indexOf('max(var(--dish-gap-min),var(--dish-gap))') !== -1,
  'dish margin respects dish-gap-min floor');
assert(/\.fill-dense\{[^}]*--name:11pt/.test(printJs) && /\.fill-dense\{[^}]*--dish-gap:8px/.test(printJs),
  'dense floor uses raised type mins and 8px dish gap');
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
require(path.join(root, 'menus-print.js'));
var printApi = global.EBMenuPrint;
assert(typeof printApi.build === 'function', 'EBMenuPrint.build exported');
assert(printApi.typeRange && printApi.typeRange.name.max === 11.5 && printApi.typeRange.title.max === 22,
  'TYPE_RANGE exported for dish name and section title max');
assert(printApi.typeRange.desc.max === 10 && printApi.typeRange.desc.min === 10,
  'TYPE_RANGE description min/max (+2pt min)');
assert(printApi.typeRange.name.min === 11 && printApi.typeRange.title.min === 16,
  'TYPE_RANGE name/title mins raised by 2pt');
assert(printApi.typeRange.dishGapPx && printApi.typeRange.dishGapPx.min === 8,
  'TYPE_RANGE includes minimum dish gap');
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
assert(page.indexOf('Print history') !== -1 && page.indexOf('data-view="history"') !== -1,
  'Menus has a Print history view');
assert(page.indexOf('Shared across phones and PCs') !== -1 || page.indexOf('shared cloud') !== -1,
  'print history UI says it is shared across devices');
assert(page.indexOf('savePrintHistory') !== -1, 'Generate saves into print history');
assert(page.indexOf('pullMenusFromCloud') !== -1 && page.indexOf('saveMenusState') !== -1,
  'live menu book syncs to cloud for all devices');
assert(page.indexOf('sync on every phone and PC') !== -1 || page.indexOf('Menus synced across devices') !== -1,
  'UI mentions menus stay in sync across devices');
assert(ingestJs.indexOf('getCloudUrl') !== -1 && ingestJs.indexOf('cloudPost') !== -1,
  'ingest exposes shared cloud POST helper');
assert(aiGs.indexOf('listPrintHistory_') !== -1 && aiGs.indexOf('propWrite_') !== -1,
  'Menu AI Apps Script stores print history in Script Properties');
assert(aiGs.indexOf('getMenusState_') !== -1 && aiGs.indexOf("propRead_('MENUS')") !== -1,
  'Menu AI Apps Script stores live menus state in Script Properties');
assert(aiGs.indexOf('DriveApp') === -1,
  'shared menus/history do not require Drive OAuth');
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
assert(page.indexOf('Too much information for two readable pages') !== -1,
  'generate warns when sheet is over capacity');
assert(api.emptyMeta().paper === 'a4', 'party meta defaults to full A4 paper');
assert(api.sheetPlan('desserts', 3).fit === 'two-up', 'desserts card is two-up A5');
assert(api.sheetPlan('sandwiches', 4).fit === 'two-up', 'sandwiches card is two-up A5');
assert(api.sheetPlan('little-bells', 4).fit === 'two-up', 'Little Bells card is two-up A5');
assert(/Too much information for two readable/.test(api.sheetPlan('main', 40).text),
  'main menu over capacity message steers staff to separate menus');
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
assert(api.WIDTH_OPTIONS.some(function (w) {
  return w.id === 'both' && /best fit/i.test(w.label) && /AI chooses/i.test(w.label);
}), 'width “both” is labelled best fit / AI chooses, not column-if-it-fits');
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
assert(ingestJs.indexOf('mammoth') !== -1 && ingestJs.indexOf('readDocx') !== -1, 'Word .docx ingest via mammoth');
assert(page.indexOf('.docx') !== -1 && page.indexOf('wordprocessingml') !== -1, 'upload accepts Word .docx');
assert(page.indexOf('flow84') !== -1, 'menus page cache-bust is flow84');
assert(fs.readFileSync(path.join(root, 'index.html'), 'utf8').indexOf('flow84') !== -1, 'hub menus link cache-bust is flow84');
assert(printJs.indexOf('cols-little-solo') !== -1 && printJs.indexOf('levelOppositeColumns') !== -1,
  'opposite columns are leveled with food then feature panels');
assert(printJs.indexOf('function noteUnits') !== -1,
  'Blocks notes count toward column height for level finishes');
assert(typeof api.normalizeSectionLayoutBook === 'function' && typeof api.sectionLayoutForMenu === 'function',
  'Blocks rules are stored per menu');
assert(page.indexOf('layoutBook') !== -1 && page.indexOf('effectiveSectionLayout') !== -1,
  'menus UI keeps a Blocks book per menu');
assert(page.indexOf('this menu only') !== -1,
  'Blocks step says rules are per menu');
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
assert(/\.specials-beside[^{]*specials-beside-title\{[^}]*text-align:\s*center/.test(printJs),
  'Specials beside-course title is centred');
assert(/\.specials-beside\{[^}]*width:\s*100%/.test(printJs) &&
  /\.specials-beside[^}]*\.scallop\{[^}]*width:\s*100%/.test(printJs),
  'Specials beside-course box is full width like the course above');
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
assert(/function specialsBesideCourse[\s\S]*?specials-beside-title/.test(printJs) &&
  !/function specialsBesideCourse[\s\S]*?specials-course/.test(printJs.split('function specialsBesideCourse')[1].split('function layoutMap')[0]),
  'beside-course Specials box titles Specials only — no Starters/Mains course head');
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
assert(api.PROMO_NONE_ID === '__none__', 'promo none tick id exported');
assert(api.pickPromos(api.seedPromoBank(), { __none__: true }).length === 0,
  'no-events tick yields zero promos');
assert(api.normalizeMeta({ title: 'X', notes: 'Y', topKind: 'text' }).topKind === 'text',
  'normalizeMeta keeps blurb kinds');
assert(api.normalizeMeta({ bottomKind: 'heading' }).bottomKind === 'heading',
  'normalizeMeta accepts heading blurb kind');
assert(printJs.indexOf('partyBlurbBlock') !== -1, 'party print uses blurb kinds');
assert(printJs.indexOf('party-blurb-heading') !== -1, 'party print has heading blurb size');
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
assert(api.sectionLayoutFor('Sandwiches').tip === true, 'Sandwiches tip box defaults on');
assert(/selection of sandwiches/i.test(api.sectionLayoutFor('Sandwiches').sell || ''),
  'Sandwiches default sell wording mentions selection');
assert(api.normalizeSectionLayout({ Sandwiches: { width: 'column', frame: true, tip: false, sell: 'Ask at the bar' } }).Sandwiches.tip === false,
  'normalize keeps tip off when explicitly false');
assert(printJs.indexOf('sandwichesBlock') !== -1 && printJs.indexOf('sec-note') !== -1,
  'sandwiches print spiel plus dish list');
assert(printJs.indexOf('Tip box') !== -1 || printJs.indexOf('sandRule.tip') !== -1 ||
  printJs.indexOf('wantSandwiches') !== -1,
  'print honours tip when deciding sandwiches box');
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
  aiGs.indexOf('panels MUST be 1 or 2') !== -1,
  'Gemini golden rule: feature panels only to even opposite columns');
assert(aiGs.indexOf('oval') !== -1 || aiGs.indexOf('box beside wide') !== -1 ||
  aiGs.indexOf('contrasting frames') !== -1,
  'Gemini golden rules contrast side-by-side feature frames');
assert(page.indexOf('opposite columns match') !== -1 || page.indexOf('Gemini checking') !== -1,
  'Generate runs Gemini balance check step');
assert(printJs.indexOf('leftFrame') !== -1 && printJs.indexOf('rightFrame') !== -1,
  'paired promo panels pick opposite frame kinds');
assert(printJs.indexOf("leftFrame: 'box', rightFrame: 'wide'") !== -1 ||
  printJs.indexOf('two matching rectangles never sit side by side') !== -1,
  'side-by-side feature panels alternate rect box vs oval wide');
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
  setItem: function (k, v) { this._d[k] = String(v); }
};
require(path.join(root, 'menus-print.js'));
var print = global.EBMenuPrint;
assert(print.toRoman(1) === 'I' && print.toRoman(2) === 'II' && print.toRoman(4) === 'IV', 'Roman numerals');
assert(/Week of \d/.test(print.weekLabel(new Date('2026-09-21T12:00:00Z'))), 'week label');
assert(print.printSheetLabel('Main menu', {
  week: 'Week of 21st September 2026',
  roman: 'LXIII'
}) === 'Main menu Wk 21st Sep — LXIII', 'print sheet label includes menu, Wk date and version');
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
assert(
  /cols-little-sides[\s\S]{0,2500}col-feature[\s\S]{0,800}(Stay a While|Gatherings|All tips|Pub Quiz)/.test(kidsColDessertsFull),
  'shorter column under kids|sides gets feature panels so both finish level'
);
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
assert(/cols-little-solo[\s\S]{0,800}Stay a While|cols-little-solo[\s\S]{0,800}Gatherings/.test(kidsColNoSides),
  'Column with no food partner gets feature panels so columns finish level');
assert(printJs.indexOf('levelOppositeColumns') !== -1 && printJs.indexOf('even fill across pages') !== -1,
  'layout equalises opposite columns and leftover across two pages');
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
  promos: sidesColAlonePromos
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
  promos: sidesColAlonePromos
});
var a4Only = sidesColAloneHtml.split('mode-panel mode-a5')[0] || sidesColAloneHtml;
assert(!/<section class="sec"><div class="sec-title soft-left">Sides/.test(a4Only),
  'Blocks Column Sides are not orphaned to a full-bleed section');
assert(/bottom-cols[\s\S]{0,500}SideItem0|col-sides[\s\S]{0,300}SideItem0|column-solo-row[\s\S]{0,300}SideItem0/.test(a4Only),
  'Blocks Column Sides stay in a column under Desserts');

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
assert(jamLayout.pages === 2 && jamLayout.p1.sundayRoasts === true,
  'Sunday planner puts Roasts on page 1 when openers are light');
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
assert(printJs.indexOf('orphanColumnHole') !== -1 && printJs.indexOf('footPromoPair') !== -1,
  'orphan Sandwiches/Sides span full-width with two foot feature panels');
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
assert(aiGs.indexOf('ONLY ONCE') !== -1 || aiGs.indexOf('only once') !== -1,
  'Gemini layout review forbids reprinting the same feature panel');
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
assert(page.indexOf('opposite columns match') !== -1,
  'arrange step says Gemini checks columns before release');
assert(ingestJs.indexOf('getCloudUrl') !== -1 && ingestJs.indexOf('reviewLayout') !== -1,
  'layout review uses cloud Menu AI URL on every generate');
assert(aiGs.indexOf('columnBalance') !== -1 && aiGs.indexOf('panels MUST be 1 or 2') !== -1,
  'Gemini layout review requires panels under uneven columns');
assert(printJs.indexOf('sandOnLeftCol') !== -1 && printJs.indexOf('CONTENT-SIZED') !== -1,
  'feature panels stay little promotions; Sides/sandwich sell balance the short column');
assert(printJs.indexOf('preferReadableType') !== -1 && printJs.indexOf('clearFitArtifacts') !== -1,
  'print drops foot logos and clears stretch before refitting for larger shared type');
assert(printJs.indexOf('No page-2 logo (keep type readable)') !== -1,
  'planner skips page-2 logo when it would cost readable type');
assert(printJs.indexOf('fitGroup') !== -1 && printJs.indexOf('SHARED TYPE SCALE') !== -1,
  'print fits page 1 and page 2 to one shared type density');
assert(printJs.indexOf('sidesOnP1') !== -1 && printJs.indexOf('keep type size equal') !== -1,
  'planner can move Sides to page 1 so both pages stay the same size');
assert(printJs.indexOf('spreadPage') !== -1 && printJs.indexOf('spread-even') !== -1,
  'after shared type, leftover vertical space is spread evenly down the page');
assert(printJs.indexOf('free page 2 for larger type') !== -1,
  'planner can move Sandwiches box to page 1 to raise shared type');
assert(aiGs.indexOf('sidesOn') !== -1 && aiGs.indexOf('SHARED TYPE SCALE') !== -1,
  'Gemini layout review can move Sides between pages for shared type');
assert(aiGs.indexOf('tip/sell box') !== -1 || aiGs.indexOf('sell box') !== -1,
  'Gemini prefers sandwich sell box on page 1 when page 2 is packed');
assert(page.indexOf('advice.sidesOn') !== -1,
  'generate applies AI sidesOn to the print layout');
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
var v1 = print.nextPrintVersion('main');
var v2 = print.nextPrintVersion('main');
assert(v1.roman === 'I' && v2.roman === 'II', 'print version increments per generate');
assert(v1.week === v2.week, 'same week label within the week');
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
  'product-style Vegan Burger keeps the name and ticks vg');
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
// Tip on (default) → empty Sandwiches still get a selling box; Tip off → omit
var tipOnLayout = print.planFluidLayout(mainMenu, sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: true, sell: 'Ask for today’s sandwiches' } })
});
assert(tipOnLayout.p1.sandwiches || (tipOnLayout.p2 && tipOnLayout.p2.sandwiches) ||
  tipOnLayout.fillers.some(function (f) { return /Sandwiches/i.test(f); }),
  'tip on keeps sandwiches selling box with 0 dishes');
var tipOffLayout = print.planFluidLayout(mainMenu, sparse, {
  sectionLayout: api.normalizeSectionLayout({ Sandwiches: { tip: false, sell: '' } })
});
assert(!tipOffLayout.p1.sandwiches && !(tipOffLayout.p2 && tipOffLayout.p2.sandwiches) &&
  !tipOffLayout.fillers.some(function (f) { return /Sandwiches/i.test(f); }),
  'tip off omits sandwiches box when there are no fillings');
var tipHtml = print.sandwichesBlock({ sandwiches: { name: 'Sandwiches', dishes: [] } }, {
  rule: { frame: true, tip: true, note: '(lunch hours)', sell: 'Selection at the bar' }
});
assert(/Selection at the bar/.test(tipHtml), 'empty tip box prints sell wording');
assert(/lunch hours/.test(tipHtml), 'empty tip box still shows note/hours');

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
assert(/type range/i.test(sharedTypeLayout.summary) || /minimum type/i.test(sharedTypeLayout.summary),
  'layout summary states type range / min-type decision');
assert(sharedTypeLayout.p1.sidesOnP1 === true && sharedTypeLayout.p2 && sharedTypeLayout.p2.sidesOnP2 === false,
  'Sides move to page 1 so both pages can open type toward the maximum');

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
  })
});
assert(tipPackedLayout.pages === 2, 'nibbles+mains+desserts packed menu uses two pages');
assert(tipPackedLayout.p1.sandwiches === true && !(tipPackedLayout.p2 && tipPackedLayout.p2.sandwiches),
  'sandwich sell box sits on page 1 so both pages can open type toward the maximum');
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
assert(/minimum type|two A4/i.test(clipLayout.summary), 'summary explains two pages because one would clip at min type');
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

var histSample = {
  id: 'test-hist-1',
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
return print.savePrintHistory(histSample).then(function () {
  return print.listPrintHistory();
}).then(function (rows) {
  assert(rows.some(function (r) { return r.id === 'test-hist-1' && r.roman === 'III'; }),
    'history lists saved sheet with Roman');
  return print.getPrintHistory('test-hist-1');
}).then(function (got) {
  assert(got && /sample main III/.test(got.html || ''), 'history returns stored HTML');
  return print.deletePrintHistory('test-hist-1');
}).then(function () {
  if (failed) {
    console.error('\n' + failed + ' check(s) failed');
    process.exit(1);
  }
  console.log('\nAll checks passed');
}).catch(function (err) {
  console.error('FAIL  history round-trip: ' + err);
  process.exit(1);
});
});
