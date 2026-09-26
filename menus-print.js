/* Branded Eight Bells print sheet — May main-menu style.
   Scalloped boxes, two columns, rooms/functions fillers,
   week-of date + Roman numeral print tracker. */
(function (root) {
  'use strict';

  var GREEN = '#538135';
  var INK = '#1c1610';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function asset(name) {
    try {
      return new URL('images/' + name, window.location.href).href;
    } catch (e) {
      return 'images/' + name;
    }
  }

  function toRoman(n) {
    n = Math.max(1, Math.min(3999, n | 0));
    var map = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    var out = '';
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][0]) {
        out += map[i][1];
        n -= map[i][0];
      }
    }
    return out;
  }

  function weekStart(d) {
    d = d ? new Date(d) : new Date();
    var day = d.getDay(); // 0 Sun
    var diff = day === 0 ? -6 : 1 - day;
    var mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  }

  function nextSunday(d) {
    d = d ? new Date(d) : new Date();
    var day = d.getDay(); // 0 = Sunday already
    var add = day === 0 ? 0 : 7 - day;
    var sun = new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
    sun.setHours(0, 0, 0, 0);
    return sun;
  }

  function ordinalDate(dt) {
    var day = dt.getDate();
    var ord = (day % 10 === 1 && day !== 11) ? 'st'
      : (day % 10 === 2 && day !== 12) ? 'nd'
      : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return day + ord + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function weekLabel(d) {
    return 'Week of ' + ordinalDate(weekStart(d));
  }

  function sundayLabel(d) {
    return 'Sunday ' + ordinalDate(nextSunday(d));
  }

  /**
   * Staff-facing sheet name for PDF / download folders, e.g.
   * "Main menu Wk 21st Sep — LXIII" or "Sunday menu Sun 28th Sep — II".
   */
  function printSheetLabel(menuName, ver) {
    var name = String(menuName || 'Menu').replace(/\s+/g, ' ').trim() || 'Menu';
    ver = ver || {};
    var roman = String(ver.roman || '').trim();
    var weekBit = '';
    if (!ver.hideDate && ver.week) {
      var m = String(ver.week).match(/^(Week of|Sunday)\s+(\d{1,2}(?:st|nd|rd|th))\s+([A-Za-z]+)/i);
      if (m) {
        var mon = m[3].slice(0, 3);
        weekBit = (/^sunday/i.test(m[1]) ? 'Sun ' : 'Wk ') + m[2] + ' ' + mon;
      } else {
        weekBit = String(ver.week).replace(/^Week of\s+/i, 'Wk ');
      }
    }
    var parts = [name];
    if (weekBit) parts.push(weekBit);
    if (roman) parts.push('— ' + roman);
    return parts.join(' ');
  }

  function printFileName(menuName, ver, ext) {
    var label = printSheetLabel(menuName, ver);
    var safe = label
      .replace(/[\/\\?%*:|"<>]/g, '-')
      .replace(/\s*—\s*/g, ' - ')
      .replace(/\s+/g, ' ')
      .trim();
    ext = String(ext || 'html').replace(/^\./, '');
    return safe + (ext ? '.' + ext : '');
  }

  function weekKey(d) {
    var mon = weekStart(d);
    return mon.getFullYear() + '-' + (mon.getMonth() + 1) + '-' + mon.getDate();
  }

  function sundayKey(d) {
    var sun = nextSunday(d);
    return sun.getFullYear() + '-' + (sun.getMonth() + 1) + '-' + sun.getDate();
  }

  /** Next Roman print number for this menu in the current week (or Sunday date). */
  function nextPrintVersion(menuId) {
    var isSunday = menuId === 'sunday';
    var key = 'eb-print-ver-' + menuId + '-' + (isSunday ? sundayKey() : weekKey());
    var n = 0;
    try { n = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch (e) {}
    n += 1;
    try { localStorage.setItem(key, String(n)); } catch (e) {}
    return {
      n: n,
      roman: toRoman(n),
      week: isSunday ? sundayLabel() : weekLabel(),
      weekKey: isSunday ? sundayKey() : weekKey(),
      hideDate: false
    };
  }

  /** Date / version strip — party/Christmas: Roman only, no week line. */
  function trackerBar(ver, opts) {
    opts = opts || {};
    if (opts.hideDate) {
      return (
        '<div class="tracker tracker-roman-only">' +
          '<span></span>' +
          '<span class="roman">' + esc(ver.roman) + '</span>' +
        '</div>'
      );
    }
    return (
      '<div class="tracker">' +
        '<span class="week">' + esc(ver.week) + '</span>' +
        '<span class="roman">' + esc(ver.roman) + '</span>' +
      '</div>'
    );
  }

  // Branded crossed knife & fork (green) as data-URI so the print popup
  // (about:blank) still shows it — relative images/lunch-club-mark.png 404s there.
  var LUNCH_MARK_DATA =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAABMCAYAAADHl1ErAAACPElEQVR42u2c0XHDMAxDY1xX6iQdKNeBMkmGan97blpTEkhCPPK/lvJMQJDk6+3W1dXV1fWrPj7fvyr+LnjCqgjtiOiqx/15dIcVBGNRBNiDvIK2gzStNoKIQdSh/ZzblUowO8AZgGVQRWijc5oCZvGqHfzMYic0SVq8StnPZucB9gA7+Nmr8a2KwMgA1hZW9rMVWJfArsx91c+ioTHGA8O4Z/1MAdbovMCAoR5qmVs2sCaxIjtPaOxnY1ZyOywC/z1z1iLMHbbiZ5U26UOStHqQQqj16C7a8Y5aqPWCNQVM3c+8V13q5js71F79DcM7qZvvzFAbAWvZw1RCbeQWy/XWKCLUWp7BjDHLwDIXgYwTD0qHRYba0TtPdkh2v5ecDbuM7vHYUcC7hRWNWwZYhJ9ldpdLh7FC7UrHeW7uXSS5GmqV5enmYVmnq95HR4h+Q2pn/VLAom+LIuAjWyJRh4aSwVUlZ223SmZWGdOP8JcSHhYlyajVVq7D1GNGqIddwXjcn8dMJ0ZCflMyanVYKavk+QeuwCovyTMkBqxo0MiWodpuQT64Wu8TVVZP7ABLSZpQhaUqTajC+gtONjTJzbcl4GZBg1p3sczdCxrUpKia8CVPK0YhZEgTu8LKgoadYWVYQfoqyYBleQYLGnZ5syqLACpJMcLPUAVWVNejGixvP0PFzvKEVu4i1/vFoFp3efsZKsPykGbIZ+eZncWe2xHR5gpSZH3I5/5RsOLVv+TnCBX+MVFXV1dXtfoG/Uog4WpbjZcAAAAASUVORK5CYII=';

  function lunchMark() {
    // Match dish price size; sits just before the price
    return (
      '<img class="lc" src="' + LUNCH_MARK_DATA + '" alt="" width="20" height="20">'
    );
  }

  function allergy(opts) {
    opts = opts || {};
    var html =
      '<div class="allergy">' +
        'Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can’t guarantee it’s allergen-free.<br>' +
        'gf – gluten free &nbsp;&nbsp; v – vegetarian &nbsp;&nbsp; vg – vegan &nbsp;&nbsp; df – dairy free';
    if (opts.lunchClub) {
      // Lunch club note lives in the allergy footer (not a mid-page scallop box)
      html +=
        '<br><span class="allergy-lc">' + lunchMark() +
        ' Bells Lunch Club option — smaller plates for smaller appetites, Monday to Thursday, lunch only' +
        ' &nbsp;·&nbsp; two courses £14.95 / three courses £17.95</span>';
    }
    html += '</div>';
    return html;
  }

  function cleanPrice(p) {
    return String(p == null ? '' : p).replace(/\s+/g, '').replace(/^£/, '');
  }

  function dishRow(d, opts) {
    opts = opts || {};
    if (root.EBMenus && root.EBMenus.tidyDishFields) d = root.EBMenus.tidyDishFields(d);
    var name = d.name;
    if (root.EBMenus && root.EBMenus.cleanDishName) name = root.EBMenus.cleanDishName(name);
    var price = d.price;
    // Reunite "9.5 /" left on the name with a lone trailing price
    var dang = String(d.name || '').match(/(\d+\.\d{1,2})\s*\/\s*$/);
    if (dang && price && !/\//.test(String(price))) {
      price = dang[1] + '/' + String(price).replace(/^£/, '');
      name = root.EBMenus && root.EBMenus.cleanDishName
        ? root.EBMenus.cleanDishName(String(d.name).replace(/(\d+\.\d{1,2})\s*\/\s*$/, ''))
        : name;
    }
    var html = '<div class="dish">';
    html += '<div class="dish-line">';
    html += '<span class="dish-name">';
    html += esc(name);
    if (d.tags) html += ' <em class="tags">' + esc(d.tags) + '</em>';
    html += '</span>';
    if (!opts.hidePrice && price) {
      html += '<span class="dish-leader" aria-hidden="true"></span>';
      // Lunch-club mark sits just before the price (≈ two spaces)
      if (d.lunchClub && !opts.hideLunch) html += lunchMark();
      html += '<span class="price">' + esc(cleanPrice(price)) + '</span>';
    } else if (d.lunchClub && !opts.hideLunch) {
      html += lunchMark();
    }
    html += '</div>';
    if (d.description) {
      html += '<div class="desc">' + esc(d.description).replace(/\n/g, '<br>') + '</div>';
    }
    html += '</div>';
    return html;
  }

  function dishCentered(d, opts) {
    opts = opts || {};
    if (root.EBMenus && root.EBMenus.tidyDishFields) d = root.EBMenus.tidyDishFields(d);
    var html = '<div class="dish dish-c">';
    html += '<div class="dish-name">';
    html += esc(d.name);
    // Tags sit with the name so the description line stays a clean centred block
    if (d.tags) html += ' <em class="tags">' + esc(d.tags) + '</em>';
    if (!opts.hidePrice && d.price) html += ' <span class="price">' + esc(d.price) + '</span>';
    if (d.lunchClub && !opts.hideLunch) html += ' ' + lunchMark();
    html += '</div>';
    if (d.description) {
      html += '<div class="desc">' + esc(d.description).replace(/\n/g, '<br>') + '</div>';
    }
    html += '</div>';
    return html;
  }

  /** Group sandwich fillings by price for A5 card faces. */
  function cardSandwichesInner(dishes) {
    var groups = {};
    var order = [];
    (dishes || []).forEach(function (d) {
      var p = cleanPrice(d.price);
      if (!groups[p]) {
        groups[p] = [];
        order.push(p);
      }
      groups[p].push(d);
    });
    var html = '';
    order.forEach(function (p) {
      groups[p].forEach(function (d) {
        html += dishCentered(d, { hidePrice: true });
      });
      if (p) html += '<div class="lb-price">£' + esc(p) + '</div>';
    });
    html +=
      '<div class="desc card-spiel">Served on either Ciabatta vg, Farmhouse White or Granary<br>' +
      'All served with Fries and Salad</div>';
    return scallop(html);
  }

  function groupBySection(dishes) {
    var sections = [];
    var map = {};
    dishes.forEach(function (d) {
      var s = d.section || 'Dishes';
      if (!map[s]) {
        map[s] = [];
        sections.push({ name: s, dishes: map[s] });
      }
      map[s].push(d);
    });
    return sections;
  }

  function scallop(inner, kind) {
    // Real Canva/print frames via border-image so waves sit in the border
    // gutter and never cut through dish text (unlike stretched SVG/PNG fill).
    var cls = kind === 'box' ? 'scallop scallop-box' : 'scallop scallop-wide';
    return '<div class="' + cls + '"><div class="scallop-pad">' + inner + '</div></div>';
  }

  function sectionTitle(name) {
    return '<div class="sec-title">' + esc(name) + '</div>';
  }

  function promoRooms() {
    return renderPromoBank([
      { title: 'Stay a While', body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.' },
      { title: 'Gatherings', body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event' }
    ]);
  }

  function formatBankDate(dateStr) {
    if (root.EBMenus && root.EBMenus.formatPromoDate) return root.EBMenus.formatPromoDate(dateStr);
    return String(dateStr || '');
  }

  /** One scalloped event/selling box. frameKind: 'box' (rect) or 'wide' (oval). */
  function renderOnePromoBox(promos, frameKind) {
    promos = (promos || []).filter(function (p) { return p && p.title; });
    if (!promos.length) return '';
    var inner = '<div class="promo">';
    promos.forEach(function (p) {
      inner += '<div class="promo-title">' + esc(p.title);
      if (p.date) inner += ' <span class="promo-date">' + esc(formatBankDate(p.date)) + '</span>';
      inner += '</div>';
      if (p.body) inner += '<p>' + esc(p.body) + '</p>';
    });
    inner += '</div>';
    return scallop(inner, frameKind === 'wide' ? 'wide' : 'box');
  }

  /**
   * Event panels: at most one box (1–2 blurbs). Never stack multiple scallops
   * in one column — that breaks the equal-finish golden rule beside a short list.
   */
  function renderPromoBank(promos, frameKind) {
    promos = (promos || []).filter(function (p) { return p && p.title; });
    if (!promos.length) return '';
    return renderOnePromoBox(promos.slice(0, 2), frameKind);
  }

  function promoTitleKey(p) {
    return String(p && p.title != null ? p.title : p || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function filterUnusedPromos(promos, excludeTitles) {
    var exclude = {};
    (excludeTitles || []).forEach(function (t) {
      var k = promoTitleKey(t);
      if (k) exclude[k] = true;
    });
    return (promos || []).filter(function (p) {
      return p && p.title && !exclude[promoTitleKey(p)];
    });
  }

  /**
   * Place feature panels only to even opposite columns.
   * leftFood / rightFood = rough height units of the food stacks.
   * Positive (rightFood - leftFood) means the LEFT column is shorter → fill left.
   * opts.force = { shorter:'left'|'right'|'even', panels:0|1|2 } from Gemini
   * opts.excludeTitles = titles already printed on an earlier page (never reuse).
   * Returns usedTitles so the next page can skip them.
   */
  function planPromoFill(leftFood, rightFood, promos, opts) {
    opts = opts || {};
    var leftKind = opts.leftFrame === 'wide' ? 'wide' : 'box';
    var rightKind = opts.rightFrame === 'wide' ? 'wide' : 'box';
    if (opts.rightFrame == null) rightKind = leftKind === 'box' ? 'wide' : 'box';
    var defaults = [
      { title: 'Stay a While', body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.' },
      { title: 'Gatherings', body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event' }
    ];
    var excludeTitles = opts.excludeTitles || [];
    var list = filterUnusedPromos(promos, excludeTitles);
    if (!list.length) list = filterUnusedPromos(defaults, excludeTitles);
    var pool = list.slice();
    var di = 0;
    while (pool.length < 4 && di < defaults.length * 2) {
      var d = defaults[di % defaults.length];
      var key = promoTitleKey(d);
      var blocked = excludeTitles.some(function (t) { return promoTitleKey(t) === key; }) ||
        pool.some(function (p) { return promoTitleKey(p) === key; });
      if (!blocked) pool.push(d);
      di += 1;
    }

    function stackForShort(side, panels) {
      var kind = side === 'left' ? leftKind : rightKind;
      var alt = kind === 'box' ? 'wide' : 'box';
      var n = Math.max(0, Math.min(2, parseInt(panels, 10) || 0));
      var used = [];
      var html = '';
      if (!pool.length || n < 1) {
        if (side === 'left') return { left: '', right: '', note: 'No unused panels left', usedTitles: used };
        return { left: '', right: '', note: 'No unused panels left', usedTitles: used };
      }
      if (n >= 2 && pool.length >= 2) {
        used = [pool[0].title, pool[1].title];
        html = renderOnePromoBox([pool[0]], kind) + renderOnePromoBox([pool[1]], alt);
      } else {
        var take = Math.min(n === 1 ? 1 : Math.min(2, pool.length), pool.length);
        used = pool.slice(0, take).map(function (p) { return p.title; });
        html = renderOnePromoBox(pool.slice(0, take), kind);
      }
      if (side === 'left') {
        return { left: html, right: '', note: 'Feature under shorter left column', usedTitles: used };
      }
      return { left: '', right: html, note: 'Feature under shorter right column', usedTitles: used };
    }

    var force = opts.force || null;
    if (force && force.shorter && force.shorter !== 'even') {
      var forcedPanels = Math.max(1, Math.min(2, parseInt(force.panels, 10) || 1));
      // Prefer one little promo — two stacked panels only for huge holes.
      if (forcedPanels > 1 && Math.abs((rightFood || 0) - (leftFood || 0)) < 12) forcedPanels = 1;
      // Only ask for as many panels as we still have unused titles.
      forcedPanels = Math.min(forcedPanels, Math.max(1, pool.length));
      if (!pool.length) {
        return { left: '', right: '', note: 'No unused feature panels left', usedTitles: [] };
      }
      if (force.shorter === 'left' || force.shorter === 'right') {
        return stackForShort(force.shorter, forcedPanels);
      }
    }

    var gap = (rightFood || 0) - (leftFood || 0);
    if (gap > 2.5) return stackForShort('left', gap > 9 ? 2 : 1);
    if (gap < -2.5) return stackForShort('right', -gap > 9 ? 2 : 1);
    if (pool.length >= 2 && Math.abs(gap) <= 2.5 && (leftFood + rightFood) < 28) {
      return {
        left: renderOnePromoBox([pool[0]], leftKind),
        right: renderOnePromoBox([pool[1]], rightKind),
        note: 'Paired feature panels (even columns)',
        usedTitles: [pool[0].title, pool[1].title]
      };
    }
    if (pool.length && Math.abs(gap) <= 2.5) {
      if (gap >= 0) {
        return {
          left: renderOnePromoBox([pool[0]], leftKind),
          right: '',
          note: 'One panel on left',
          usedTitles: [pool[0].title]
        };
      }
      return {
        left: '',
        right: renderOnePromoBox([pool[0]], rightKind),
        note: 'One panel on right',
        usedTitles: [pool[0].title]
      };
    }
    return { left: '', right: '', note: 'No feature panels — columns already even', usedTitles: [] };
  }

  /**
   * Rough opposite-column food units for the Gemini pre-release check.
   * Any sheet with uneven stacks must get feature panels before PDF opens.
   */
  function measureOppositeColumns(menu, dishes, plan) {
    var layout = (plan && plan.layout) || {};
    var bag = (layout && layout.bag) || pickSections(orderDishesForPrint(dishes || []));
    var p1 = layout.p1 || {};
    var split = splitClassicsBag(bag.classics);
    var burgerDishes = (bag.burgers && bag.burgers.dishes) ? bag.burgers.dishes.slice() : [];
    if (split.burgers && split.burgers.length) burgerDishes = burgerDishes.concat(split.burgers);
    var classicDishes = split.classics || [];
    var sandList = sandwichDishesOf(bag);
    var shareDishes = (bag.sharing && bag.sharing.dishes) ? bag.sharing.dishes : [];
    var leftFood = 0;
    var rightFood = 0;
    if (shareDishes.length) leftFood += sectionUnits({ name: 'Sharing', dishes: shareDishes }, false);
    if (burgerDishes.length) rightFood += sectionUnits({ name: 'Burgers', dishes: burgerDishes }, false);
    if (classicDishes.length) rightFood += sectionUnits({ name: 'Pub Classics', dishes: classicDishes }, false);
    // Tip/sell box and Sides sit under the shorter stack (named fillings stay left).
    if (p1.sandwiches && sandList.length) leftFood += sandwichesPackCost(bag);
    else if (p1.sandwiches) {
      if (leftFood <= rightFood) leftFood += COST.sandwiches;
      else rightFood += COST.sandwiches;
    }
    if (p1.sidesOnP1 && bag.sides) {
      var sideU1 = sectionUnits(bag.sides, false);
      if (leftFood <= rightFood) leftFood += sideU1;
      else rightFood += sideU1;
    }
    var gap = rightFood - leftFood;
    var page1 = {
      leftFood: Math.round(leftFood * 10) / 10,
      rightFood: Math.round(rightFood * 10) / 10,
      gap: Math.round(gap * 10) / 10,
      shorter: Math.abs(gap) <= 2.5 ? 'even' : (gap > 0 ? 'left' : 'right'),
      leftLabel: p1.sandwiches ? 'Sandwiches / events' : 'Events / sharing',
      rightLabel: 'Burgers / Pub Classics'
    };
    var page2 = null;
    if (layout.pages >= 2 && layout.p2) {
      var sideList = (layout.p2.sidesOnP2 && bag.sides && bag.sides.dishes) ? bag.sides.dishes : [];
      var left2 = sideList.length ? sectionUnits(bag.sides, false) : 0;
      if (layout.p2.sidesOnP2 && bag.sauces) left2 += sectionUnits(bag.sauces, false);
      var right2 = layout.p2.sandwiches ? sandwichesPackCost(bag) : 0;
      // Little Bells Column is its own opposite-column pair (food first, else panels).
      var littleRuleM = null;
      var dessRuleM = null;
      var sideRuleM = null;
      if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
        littleRuleM = root.EBMenus.sectionLayoutFor('Little Bells', plan && plan.sectionLayout);
        dessRuleM = root.EBMenus.sectionLayoutFor('Desserts', plan && plan.sectionLayout);
        sideRuleM = root.EBMenus.sectionLayoutFor('Sides', plan && plan.sectionLayout);
      }
      var kidsCol = !!(bag.littleBells && bag.littleBells.dishes && bag.littleBells.dishes.length &&
        littleRuleM && wantsColumn(littleRuleM));
      if (kidsCol) {
        var kidsU2 = sectionUnits(bag.littleBells, false);
        var dessCol = !!(dessRuleM && wantsColumn(dessRuleM) && bag.desserts && bag.desserts.dishes &&
          bag.desserts.dishes.length);
        var sidesColPartner = !!(sideRuleM && wantsColumn(sideRuleM) && bag.sides && bag.sides.dishes &&
          bag.sides.dishes.length && !(layout.p1 && layout.p1.sidesOnP1));
        left2 += kidsU2;
        if (dessCol) right2 += sectionUnits(bag.desserts, false);
        else if (sidesColPartner) {
          right2 += sectionUnits(bag.sides, false);
          // Sides already counted in the bottom pair — avoid double-count when only kids|sides.
          if (sideList.length) left2 -= sectionUnits(bag.sides, false);
        }
        // else right stays short → feature panels required on the right
      }
      var gap2 = right2 - left2;
      page2 = {
        leftFood: Math.round(left2 * 10) / 10,
        rightFood: Math.round(right2 * 10) / 10,
        gap: Math.round(gap2 * 10) / 10,
        shorter: Math.abs(gap2) <= 2.5 ? 'even' : (gap2 > 0 ? 'left' : 'right'),
        leftLabel: kidsCol ? 'Little Bells / Sides' : 'Sides / sauces',
        rightLabel: layout.p2.sandwiches ? 'Sandwiches' : (kidsCol ? 'Desserts / Sides / events' : 'Events')
      };
    }
    return { page1: page1, page2: page2 };
  }

  /**
   * Split event wording across the two columns so both columns finish
   * at roughly the same height (start aligned, end aligned).
   * Prefer planPromoFill when food-unit estimates are known.
   */
  function splitPromosForColumns(promos, opts) {
    opts = opts || {};
    if (opts.leftFood != null || opts.rightFood != null) {
      return planPromoFill(opts.leftFood || 0, opts.rightFood || 0, promos, opts);
    }
    // Fallback without estimates: at most one box per column, max 2 blurbs each
    var leftKind = opts.leftFrame === 'wide' ? 'wide' : 'box';
    var rightKind = opts.rightFrame
      ? (opts.rightFrame === 'wide' ? 'wide' : 'box')
      : (leftKind === 'box' ? 'wide' : 'box');
    var list = (promos || []).filter(function (p) { return p && p.title; });
    if (!list.length) {
      list = [
        { title: 'Stay a While', body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.' },
        { title: 'Gatherings', body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event' }
      ];
    }
    if (list.length > 4) list = list.slice(0, 4);
    if (list.length === 1) {
      return { left: renderOnePromoBox(list, leftKind), right: '' };
    }
    if (list.length === 2) {
      return {
        left: renderOnePromoBox([list[0]], leftKind),
        right: renderOnePromoBox([list[1]], rightKind)
      };
    }
    if (list.length === 3) {
      return {
        left: renderOnePromoBox(list.slice(0, 2), leftKind),
        right: renderOnePromoBox([list[2]], rightKind)
      };
    }
    return {
      left: renderOnePromoBox(list.slice(0, 2), leftKind),
      right: renderOnePromoBox(list.slice(2, 4), rightKind)
    };
  }

  /**
   * True when one column has real food and the other is empty/near-empty.
   * Two little feature panels cannot fill that hole — span the food full-width
   * and put a pair of panels as a footer row instead.
   */
  function orphanColumnHole(leftFood, rightFood) {
    var L = leftFood || 0;
    var R = rightFood || 0;
    if (L >= 6 && R < 2.5) return true;
    if (R >= 6 && L < 2.5) return true;
    return false;
  }

  /** Foot feature pair needs comfortable spare room — never jam at min type. */
  var FOOT_PROMO_MIN_LEFT = 18;
  function canFitFootPromos(leftover) {
    return (leftover || 0) >= FOOT_PROMO_MIN_LEFT;
  }

  /**
   * Two feature panels side-by-side under a full-width food block.
   * Prefer unused titles; pad with evergreen defaults so we always try to fill.
   */
  function footPromoPair(promos, opts) {
    opts = opts || {};
    var defaults = [
      { title: 'Stay a While', body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.' },
      { title: 'Gatherings', body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event' }
    ];
    var exclude = opts.excludeTitles || [];
    var pool = filterUnusedPromos(promos, exclude);
    if (!pool.length) pool = filterUnusedPromos(defaults, exclude);
    var di = 0;
    while (pool.length < 2 && di < defaults.length * 2) {
      var d = defaults[di % defaults.length];
      var key = promoTitleKey(d);
      var blocked = exclude.some(function (t) { return promoTitleKey(t) === key; }) ||
        pool.some(function (p) { return promoTitleKey(p) === key; });
      if (!blocked) pool.push(d);
      di += 1;
    }
    if (!pool.length) return { html: '', usedTitles: [] };
    if (pool.length === 1) {
      return {
        html: '<div class="foot-promos foot-promos-one">' + renderOnePromoBox([pool[0]], 'wide') + '</div>',
        usedTitles: [pool[0].title]
      };
    }
    return {
      html: '<div class="cols foot-promos">' +
        '<div class="col">' + renderOnePromoBox([pool[0]], 'box') + '</div>' +
        '<div class="col">' + renderOnePromoBox([pool[1]], 'wide') + '</div>' +
        '</div>',
      usedTitles: [pool[0].title, pool[1].title]
    };
  }

  /** One promo box sized to sit beside a short partner (e.g. Sides on page 2). */
  function promoBesidePartner(promos, partnerUnits, frameKind) {
    var list = (promos || []).filter(function (p) { return p && p.title; });
    if (!list.length) return '';
    // Rough: each blurb ≈ 4–5 units; one box only. Match partner — never taller stack.
    var maxBlurbs = 1;
    if (partnerUnits >= 8) maxBlurbs = 2;
    if (partnerUnits < 3) return ''; // almost no partner — skip panels rather than hang alone
    return renderOnePromoBox(list.slice(0, maxBlurbs), frameKind || 'box');
  }

  function sandwichNote(dishes, opts) {
    opts = opts || {};
    var frameKind = opts.frame === 'wide' ? 'wide' : 'box';
    var spiel = String(opts.note || '').trim();
    if (!spiel) {
      spiel = '(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)\nAll served with fries and salad.';
    }
    var lines = spiel.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var inner = '<div class="promo sandwich-promo">';
    inner += '<div class="promo-head"><span class="promo-title">Sandwiches</span></div>';
    lines.forEach(function (line, i) {
      inner += '<p class="' + (i === 0 ? 'note-line' : 'desc') + '">' + esc(line) + '</p>';
    });
    inner += '</div>';
    if (opts.alignTitle) {
      return (
        '<div class="sandwich-aligned">' +
          '<div class="promo-head pair-head">' +
            '<span class="sec-title soft-left">Sandwiches</span>' +
          '</div>' +
          scallop(inner.replace(/<div class="promo-head">[\s\S]*?<\/div>/, ''), frameKind) +
        '</div>'
      );
    }
    return scallop(inner, frameKind);
  }

  /** Named sandwich fillings (skip a lone “Sandwiches” heading row). */
  function sandwichDishesOf(bag) {
    var list = (bag && bag.sandwiches && bag.sandwiches.dishes) || [];
    return list.filter(function (d) {
      return d && d.name && !/^sandwiches?\s*$/i.test(String(d.name).trim());
    });
  }

  function sandwichesPackCost(bag) {
    var dishes = sandwichDishesOf(bag);
    if (dishes.length) {
      // Frilly + hours line + multi-line descriptions run taller than unit math —
      // weight them so planPromoFill puts enough panels under a short Burgers stack.
      var base = Math.max(COST.sandwiches, sectionUnits({ name: 'Sandwiches', dishes: dishes }, true));
      return base + Math.min(6, dishes.length);
    }
    return COST.sandwiches;
  }

  /**
   * Sandwiches on a long sheet: category spiel (hours etc.) plus the dish list.
   * With 0 fillings + Tip on: selling box (sell words, then optional note/hours).
   * Frilly box only when Blocks → Sandwiches → Frilly is Yes (not hard-coded).
   */
  function sandwichesBlock(bag, opts) {
    opts = opts || {};
    var dishes = sandwichDishesOf(bag);
    var rule = opts.rule || { frame: true, note: '', tip: true, sell: '' };
    var wantFrame = !!rule.frame;
    var frameKind = opts.frame === 'wide' ? 'wide' : 'box';
    var note = (opts.note != null && String(opts.note).trim())
      ? String(opts.note).trim()
      : String(rule.note || '').trim();
    var sell = (opts.sell != null && String(opts.sell).trim())
      ? String(opts.sell).trim()
      : String(rule.sell || '').trim();
    if (!dishes.length) {
      // Tip box: selling words first, then hours / “all served with…” under the title
      var spielParts = [];
      if (sell) spielParts.push(sell);
      else spielParts.push('A selection of sandwiches is available — ask the team.');
      if (note) spielParts.push(note);
      var spiel = spielParts.join('\n');
      var lines = spiel.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
      var noteInner = '<div class="promo sandwich-promo">';
      noteInner += '<div class="promo-head"><span class="promo-title">Sandwiches</span></div>';
      lines.forEach(function (line, i) {
        noteInner += '<p class="' + (i === 0 ? 'note-line' : 'desc') + '">' + esc(line) + '</p>';
      });
      noteInner += '</div>';
      if (!wantFrame) return '<div class="sec-plain">' + noteInner + '</div>';
      if (opts.alignTitle) {
        return (
          '<div class="sandwich-aligned">' +
            '<div class="promo-head pair-head">' +
              '<span class="sec-title soft-left">Sandwiches</span>' +
            '</div>' +
            scallop(noteInner.replace(/<div class="promo-head">[\s\S]*?<\/div>/, ''), frameKind) +
          '</div>'
        );
      }
      return scallop(noteInner, frameKind);
    }
    var noteHtml = note
      ? '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>'
      : '';
    var body = noteHtml + listDishes(dishes);
    var titled = sectionTitle('Sandwiches') + body;
    if (opts.alignTitle) {
      var inner = wantFrame ? scallop(body, frameKind) : '<div class="sec-plain">' + body + '</div>';
      return (
        '<div class="sandwich-aligned">' +
          '<div class="promo-head pair-head">' +
            '<span class="sec-title soft-left">Sandwiches</span>' +
          '</div>' +
          inner +
        '</div>'
      );
    }
    if (!wantFrame) return '<div class="sec-plain">' + titled + '</div>';
    return scallop(titled, frameKind);
  }

  /** Prefer shared tidy from menus.js when available (priced desc orphans too). */
  function looksLikeDescFragment(name) {
    if (root.EBMenus && root.EBMenus.looksLikeDescFragment) {
      return root.EBMenus.looksLikeDescFragment(name);
    }
    var n = String(name || '').trim();
    if (!n || n.length > 100) return false;
    if (/^(serves?|served|with|and|filled|ask |see |all served|rings?|bacon|onion|fries|salad|streaky|brioche|mayo|cheese|monter|horseradish|honey|ciabatta)/i.test(n)) {
      return true;
    }
    if (/^[a-z]/.test(n) && !/burger|haddock|pie|fish|steak|salad|arancini|cocktail/i.test(n)) {
      return true;
    }
    return false;
  }

  function isSandwichDish(d) {
    if (!d) return false;
    if (isSandwich(d.section)) return true;
    return /^sandwiches?\b/i.test(d.name || '');
  }

  /**
   * Merge orphan “description” rows back onto the previous dish (including
   * priced garnish lines under an unpriced title), then keep sandwich notes tidy.
   */
  function tidyDishesForPrint(dishes) {
    var list = dishes || [];
    if (root.EBMenus && root.EBMenus.tidyOrphanDescriptions) {
      list = root.EBMenus.tidyOrphanDescriptions(list);
    } else {
      var out = [];
      list.forEach(function (raw) {
        var d = {
          id: raw.id,
          section: raw.section,
          name: raw.name,
          description: raw.description || '',
          price: raw.price || '',
          tags: raw.tags || '',
          lunchClub: !!raw.lunchClub,
          fromMenu: raw.fromMenu
        };
        var price = cleanPrice(d.price);
        var prev = out.length ? out[out.length - 1] : null;
        var prevPrice = prev && cleanPrice(prev.price);
        if (prev && looksLikeDescFragment(d.name) && (!price || !prevPrice)) {
          var bit = d.name + (d.description ? ', ' + d.description : '');
          prev.description = prev.description ? (prev.description + ', ' + bit) : bit;
          if (!prevPrice && price) prev.price = d.price;
          return;
        }
        out.push(d);
      });
      list = out;
    }
    return list;
  }

  function splitClassicsBag(sec) {
    // Peel obvious burgers out of a Classics list (Wagyu / “Burger” in the name).
    var classics = [];
    var burgers = [];
    var sandwichBits = [];
    ((sec && sec.dishes) || []).forEach(function (d) {
      if (isSandwich(d.section) || /^sandwiches?\b/i.test(d.name || '')) sandwichBits.push(d);
      else if (/\bburger\b/i.test(d.name || '') || /\bwagyu\b/i.test(d.name || '')) burgers.push(d);
      else classics.push(d);
    });
    return {
      classics: classics,
      burgers: burgers,
      sandwiches: sandwichBits,
      classicsTitle: 'Pub Classics',
      burgersTitle: 'Burgers'
    };
  }

  /** Sides list must not repeat the sandwiches selling box. */
  function sidesForPrint(bag) {
    if (!bag.sides || !bag.sides.dishes) return null;
    var dishes = bag.sides.dishes.filter(function (d) {
      return !isSandwich(d.name) && !/^sandwiches?\b/i.test(d.name || '');
    });
    if (!dishes.length) return null;
    return { name: bag.sides.name, dishes: dishes };
  }

  function fillClass(leftover) {
    // Start denser when the sheet is full; browser fit script can step down further.
    if (leftover > 22) return 'fill-airy';
    if (leftover > 14) return 'fill-roomy';
    if (leftover > 6) return 'fill-normal';
    if (leftover > -2) return 'fill-tight';
    return 'fill-compact';
  }

  function isNibbles(name) {
    return /nibble|light bite/i.test(name || '');
  }
  function isClassics(name) {
    // Match “Pub Classics” and legacy “Pub classics & Burgers”
    return /classic/i.test(name || '');
  }
  function isBurgers(name) {
    return /^burgers?$/i.test(String(name || '').trim());
  }
  function isSharing(name) {
    return /shar(e|ing)|for the table/i.test(name || '');
  }
  function isItemBoost(name) {
    return /item\s*boost|fish of the day|pie of the day|catch of the day/i.test(
      String(name || '').trim()
    );
  }
  function isSpecials(name) {
    return /^specials?$|today.?s specials?|chef.?s special|^special\s*(starters?|mains?|desserts?)$/i.test(
      String(name || '').trim()
    );
  }
  function isSpecialStarters(name) {
    return /special\s*starters?/i.test(String(name || '').trim());
  }
  function isSpecialMains(name) {
    return /special\s*mains?/i.test(String(name || '').trim()) ||
      (/^specials?$|today.?s specials?|chef.?s special/i.test(String(name || '').trim()) &&
        !isSpecialStarters(name) && !isSpecialDesserts(name));
  }
  function isSpecialDesserts(name) {
    return /special\s*desserts?/i.test(String(name || '').trim());
  }
  function isSides(name) {
    return /^sides?$/i.test(name || '');
  }
  function isSandwich(name) {
    return /sandwich/i.test(name || '');
  }
  function isSauce(name) {
    return /^sauces?$/i.test(String(name || '').trim());
  }
  function isDessert(name) {
    return /dessert/i.test(name || '');
  }
  function isMains(name) {
    return /^mains?$/i.test(name || '');
  }
  function isSundayRoasts(name) {
    return /sunday\s*roasts?|^roasts?$/i.test(String(name || '').trim());
  }
  function isLittleBells(name) {
    return /little\s*bells|kids?\s*menu|children.?s/i.test(String(name || '').trim());
  }
  function isStarters(name) {
    return /starter/i.test(name || '');
  }

  /** Canonical print order — layout brain reorders whatever staff pasted. */
  var SECTION_RANK = [
    { test: isNibbles, rank: 10 },
    { test: isStarters, rank: 20 },
    { test: isSharing, rank: 25 },
    { test: isItemBoost, rank: 27 },
    { test: isSpecialStarters, rank: 28 },
    { test: isSpecialMains, rank: 29 },
    { test: isSpecialDesserts, rank: 71 },
    { test: isClassics, rank: 30 },
    { test: isBurgers, rank: 32 },
    { test: isMains, rank: 40 },
    { test: isLittleBells, rank: 45 },
    { test: isSides, rank: 50 },
    { test: isSauce, rank: 55 },
    { test: isSandwich, rank: 60 },
    { test: isDessert, rank: 70 }
  ];

  function sectionRank(name) {
    for (var i = 0; i < SECTION_RANK.length; i++) {
      if (SECTION_RANK[i].test(name)) return SECTION_RANK[i].rank;
    }
    return 35; // unknown sections sit after classics, before sides
  }

  function isBurgerDish(d) {
    if (!d) return false;
    if (isBurgers(d.section)) return true;
    return /\bburger\b/i.test(d.name || '') || /\bwagyu\b/i.test(d.name || '');
  }

  function orderDishesForPrint(dishes) {
    var list = tidyDishesForPrint(dishes || []).slice();
    // Prefer shared sell-order from menus.js: section flow, then interesting
    // within-section order (expensive first, high/low mix — not import order).
    if (root.EBMenus && typeof root.EBMenus.orderDishesForSell === 'function') {
      return root.EBMenus.orderDishesForSell(list);
    }
    list.forEach(function (d, i) { d._i = i; });
    list.sort(function (a, b) {
      var ra = sectionRank(a.section);
      var rb = sectionRank(b.section);
      if (ra !== rb) return ra - rb;
      return a._i - b._i;
    });
    list.forEach(function (d) { delete d._i; });
    return list;
  }

  /* —— Fluid layout brain ——
     Sizes the selected dishes, splits pages only when needed, and only
     drops in Stay a While / Gatherings / sandwiches / foot logo when
     leftover room lets them sit without opening another page.
     Lunch club copy sits in the allergy footer whenever dishes are ticked. */
  var PAGE = 100;
  var COST = {
    tracker: 2,
    allergy: 4,
    allergyLunch: 2.5,
    logoTop: 10,
    nibblesBox: 2.5,
    sectionHead: 2.8,
    rooms: 9,
    sandwiches: 8,
    footLogo: 7,
    bottomCols: 1
  };

  /**
   * Adult pub type range (pt). Auto-fit steps between max → min; never above max.
   * Decision rule: if food will not fit one A4 even at MINIMUM type, use two
   * pages and open type toward the maximum. Never clip desserts off the foot.
   */
  var TYPE_RANGE = {
    name: { min: 11, max: 11.5 },
    desc: { min: 10, max: 10 },
    title: { min: 16, max: 22 },
    promo: { min: 11, max: 11.5 },
    /** Floor for vertical space between dishes — never collapse tighter. */
    dishGapPx: { min: 8, max: 14 }
  };
  // One page only with clear headroom at min type — unit model under-counts
  // scalloped boxes / full-width mains vs real browser height.
  var ONE_PAGE_AT_MIN = PAGE - 12;

  function dishUnits(d) {
    // Slightly pessimistic vs real Roboto lines + leaders (clipping is worse
    // than an honest two-pager that can grow type toward the max).
    var u = 1.55;
    if (d.description) {
      u += 1.0 + Math.floor(String(d.description).length / 50) * 0.6;
    }
    return u;
  }

  function sectionUnits(sec, scalloped) {
    if (!sec || !sec.dishes || !sec.dishes.length) return 0;
    var u = COST.sectionHead + (scalloped ? COST.nibblesBox : 0);
    sec.dishes.forEach(function (d) { u += dishUnits(d); });
    return u;
  }

  function pickSections(dishes) {
    var sections = groupBySection(dishes);
    var bag = {
      nibbles: null, starters: null, sharing: null, boost: null,
      specialStarters: null, specialMains: null, specialDesserts: null,
      classics: null, burgers: null,
      sundayRoasts: null, mains: null, littleBells: null, desserts: null,
      sides: null, sandwiches: null, sauces: null,
      other: [], hasLunch: false, count: dishes.length
    };
    var straySandwiches = [];
    sections.forEach(function (s) {
      if (isNibbles(s.name) && !bag.nibbles) bag.nibbles = s;
      else if (isStarters(s.name) && !bag.starters) bag.starters = s;
      else if (isSharing(s.name) && !bag.sharing) bag.sharing = s;
      else if (isItemBoost(s.name) && !bag.boost) bag.boost = { name: 'Item Boost', dishes: s.dishes };
      else if (isSpecialStarters(s.name) && !bag.specialStarters) {
        bag.specialStarters = { name: 'Special Starters', dishes: s.dishes };
      } else if (isSpecialDesserts(s.name) && !bag.specialDesserts) {
        bag.specialDesserts = { name: 'Special Desserts', dishes: s.dishes };
      } else if (isSpecialMains(s.name) && !bag.specialMains) {
        bag.specialMains = { name: 'Special Mains', dishes: s.dishes };
      } else if (isBurgers(s.name) && !bag.burgers) bag.burgers = s;
      else if (isClassics(s.name) && !bag.classics) {
        // Keep every staff-assigned classic here — including a lone burger filed as classic.
        bag.classics = { name: 'Pub Classics', dishes: (s.dishes || []).slice() };
      } else if (isSundayRoasts(s.name) && !bag.sundayRoasts) {
        bag.sundayRoasts = { name: 'Sunday Roasts', dishes: (s.dishes || []).slice() };
      } else if (isMains(s.name) && !bag.mains) bag.mains = s;
      else if (isLittleBells(s.name) && !bag.littleBells) {
        bag.littleBells = { name: 'Little Bells', dishes: (s.dishes || []).slice() };
      } else if (isDessert(s.name) && !bag.desserts) bag.desserts = s;
      else if (isSides(s.name) && !bag.sides) bag.sides = s;
      else if (isSandwich(s.name) && !bag.sandwiches) bag.sandwiches = s;
      else if (isSauce(s.name) && !bag.sauces) bag.sauces = s;
      else bag.other.push(s);
      (s.dishes || []).forEach(function (d) {
        if (d.lunchClub) bag.hasLunch = true;
        // Only peel sandwich *selling* lines left under the wrong heading
        if (isClassics(s.name) && /^sandwiches?\b/i.test(d.name || '')) straySandwiches.push(d);
      });
    });
    if (straySandwiches.length && bag.classics) {
      bag.classics = {
        name: bag.classics.name,
        dishes: bag.classics.dishes.filter(function (d) { return !/^sandwiches?\b/i.test(d.name || ''); })
      };
      if (bag.sandwiches && bag.sandwiches.dishes) {
        bag.sandwiches = {
          name: bag.sandwiches.name || 'Sandwiches',
          dishes: bag.sandwiches.dishes.concat(straySandwiches)
        };
      } else {
        bag.sandwiches = { name: 'Sandwiches', dishes: straySandwiches };
      }
    }
    return bag;
  }

  function tryAdd(leftover, cost) {
    if (leftover >= cost) return { ok: true, left: leftover - cost };
    return { ok: false, left: leftover };
  }

  /**
   * Decide page split + which optional selling boxes fit.
   * Promo never forces an extra page.
   */
  function planFluidLayout(menu, dishes, opts) {
    opts = opts || {};
    var promos = Array.isArray(opts.promos) ? opts.promos : null;
    // Empty array from the host means “auto” — fall back to seed wording bank.
    if (promos && !promos.length && root.EBMenus && root.EBMenus.seedPromoBank) {
      promos = root.EBMenus.seedPromoBank();
    }
    var promoCost = promos && promos.length
      ? Math.min(22, 5 + promos.length * 3.2)
      : COST.rooms;
    var wantPromoBox = promos ? promos.length > 0 : true;
    var promoLabel = promos && promos.length
      ? promos.map(function (p) { return p.title; }).filter(Boolean).join(' / ')
      : 'Stay a While / Gatherings';

    dishes = orderDishesForPrint(dishes || []);
    var bag = pickSections(dishes);
    var chrome = COST.tracker + COST.allergy + COST.logoTop +
      (bag.hasLunch ? COST.allergyLunch : 0);
    var front = chrome;
    if (bag.nibbles) front += sectionUnits(bag.nibbles, true);
    if (bag.starters) front += sectionUnits(bag.starters, false);
    if (bag.sharing) front += sectionUnits(bag.sharing, false);
    // Item Boost / Special Starters on the front; Special Mains/Desserts sit with their course
    if (bag.boost) front += sectionUnits(bag.boost, true);
    if (bag.specialStarters) front += sectionUnits(bag.specialStarters, true);
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isSundayRoasts(s.name) && !isDessert(s.name) && !isBurgers(s.name) &&
          !isLittleBells(s.name) && !isSpecials(s.name)) {
        front += sectionUnits(s, false);
      }
    });
    if (bag.classics) front += sectionUnits(bag.classics, false);
    if (bag.burgers) front += sectionUnits(bag.burgers, false);

    var roastCost = bag.sundayRoasts ? sectionUnits(bag.sundayRoasts, false) : 0;
    var back = chrome;
    // Sunday Roasts start on the back tally; may move to page 1 below when
    // page 1 would otherwise be sparse (typical Sunday: starters + empty half page).
    if (bag.sundayRoasts) back += roastCost;
    if (bag.mains) back += sectionUnits(bag.mains, false);
    if (bag.specialMains) back += sectionUnits(bag.specialMains, true);
    if (bag.littleBells) back += sectionUnits(bag.littleBells, true);
    if (bag.desserts) back += sectionUnits(bag.desserts, false);
    if (bag.specialDesserts) back += sectionUnits(bag.specialDesserts, true);
    if (bag.sides) back += sectionUnits(bag.sides, false);
    if (bag.sauces) back += sectionUnits(bag.sauces, false);

    // Balance: pull Sunday Roasts onto page 1 when openers are light and the
    // roast/mains/desserts stack would jam page 2 (the uploaded Sunday IV case).
    var roastsOnP1 = false;
    if (bag.sundayRoasts && roastCost > 0) {
      var frontWithRoasts = front + roastCost;
      var backWithoutRoasts = back - roastCost;
      var p1HasRoom = frontWithRoasts <= PAGE - 8;
      var p1Sparse = front < PAGE * 0.48;
      var p2Heavier = backWithoutRoasts >= frontWithRoasts - 6;
      if (p1HasRoom && p1Sparse && p2Heavier) {
        roastsOnP1 = true;
        front = frontWithRoasts;
        back = backWithoutRoasts;
      } else if (p1HasRoom && menu.id === 'sunday' && p1Sparse) {
        // Sunday hero: roasts sit after starters on page 1 whenever they fit.
        roastsOnP1 = true;
        front = frontWithRoasts;
        back = backWithoutRoasts;
      }
    }
    // Named fillings always print on Main/Sunday; 0 dishes → Tip box only when tip is on
    var sandDishCount = sandwichDishesOf(bag).length;
    var sandRule = { tip: true, sell: '', note: '', frame: true };
    if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
      sandRule = root.EBMenus.sectionLayoutFor('Sandwiches', opts.sectionLayout);
    } else if (opts.sectionLayout && opts.sectionLayout.Sandwiches) {
      sandRule = opts.sectionLayout.Sandwiches;
    }
    var wantSandwiches;
    if (sandDishCount > 0) {
      wantSandwiches = menu.id === 'main' || menu.id === 'sunday' || !!bag.sandwiches;
    } else if (menu.id === 'main' || menu.id === 'sunday') {
      wantSandwiches = sandRule.tip !== false && sandRule.tip !== 'no' && sandRule.tip !== 0;
    } else {
      wantSandwiches = !!bag.sandwiches;
    }
    var sandCost = sandwichesPackCost(bag);
    var hasBackContent = !!(bag.sundayRoasts || bag.mains || bag.specialMains || bag.littleBells ||
      bag.desserts || bag.specialDesserts || bag.sides || bag.sauces || bag.sandwiches);

    var layout = {
      pages: 1,
      fit: 'one',
      mode: 'single',
      bag: bag,
      promos: promos || [],
      p1: {
        rooms: false,
        sandwiches: false,
        footLogo: false,
        footPromos: false,
        classicsSplit: 0,
        sidesOnP1: false,
        sundayRoasts: !!roastsOnP1
      },
      p2: null,
      leftover: { p1: 0, p2: 0 },
      summary: '',
      fillers: []
    };
    if (roastsOnP1) layout.fillers.push('Sunday Roasts (page 1 — balance)');
    if (bag.hasLunch) layout.fillers.push('Lunch club in allergy footer');

    // —— Food load vs type range: one page when it fits at max→min sizes ——
    var oneNeed = front;
    if (bag.sundayRoasts) oneNeed += sectionUnits(bag.sundayRoasts, false);
    if (bag.mains) oneNeed += sectionUnits(bag.mains, false);
    if (bag.specialMains) oneNeed += sectionUnits(bag.specialMains, true);
    if (bag.littleBells) oneNeed += sectionUnits(bag.littleBells, true);
    if (bag.desserts) oneNeed += sectionUnits(bag.desserts, false);
    if (bag.specialDesserts) oneNeed += sectionUnits(bag.specialDesserts, true);
    if (bag.sides) oneNeed += sectionUnits(bag.sides, false);
    if (bag.sauces) oneNeed += sectionUnits(bag.sauces, false);
    // Named sandwich fillings count as food; empty tip box is optional chrome.
    var foodNeed = oneNeed + (sandDishCount > 0 ? sandCost : 0);
    var roastN = bag.sundayRoasts && bag.sundayRoasts.dishes ? bag.sundayRoasts.dishes.length : 0;
    var mainsN = bag.mains && bag.mains.dishes ? bag.mains.dishes.length : 0;
    var dessertN = bag.desserts && bag.desserts.dishes ? bag.desserts.dishes.length : 0;
    // Two pages when one A4 would clip at minimum type — then grow toward max.
    var preferTwo = hasBackContent && (bag.sundayRoasts || bag.mains || bag.littleBells || bag.desserts) && (
      foodNeed > ONE_PAGE_AT_MIN ||
      (mainsN + roastN >= 5 && dessertN >= 3) ||
      (sandDishCount >= 4 && mainsN + roastN >= 5) ||
      bag.count >= 18
    );
    var preferOne = !preferTwo && foodNeed <= ONE_PAGE_AT_MIN;

    if (preferOne) {
      layout.pages = 1;
      layout.fit = 'one';
      layout.mode = 'single';
      var left1 = PAGE - foodNeed;
      var add;
      // Feature panels only with real spare room — never pad a near-full sheet.
      if (wantPromoBox) {
        add = tryAdd(left1, promoCost + 14);
        if (add.ok) {
          layout.p1.rooms = true;
          left1 = add.left;
          layout.fillers.push(promoLabel);
        }
      }
      if (wantSandwiches) {
        if (sandDishCount > 0) {
          layout.p1.sandwiches = true;
          layout.fillers.push('Sandwiches (page 1)');
        } else {
          add = tryAdd(left1, sandCost + 4);
          if (add.ok) {
            layout.p1.sandwiches = true;
            left1 = add.left;
            layout.fillers.push('Sandwiches box (page 1)');
          }
        }
      }
      if (bag.sides && layout.p1.sandwiches) layout.p1.sidesOnP1 = true;
      add = tryAdd(left1, COST.footLogo + 6);
      if (add.ok) { layout.p1.footLogo = true; left1 = add.left; layout.fillers.push('Logo'); }
      layout.leftover.p1 = Math.max(0, left1);
      // Foot feature pairs only with real spare room — never jam at min type.
      layout.p1.footPromos = canFitFootPromos(layout.leftover.p1);
      layout.p1.classicsSplit = (bag.burgers || (bag.classics && bag.classics.dishes)) ? 1 : 0;
    } else if (hasBackContent || foodNeed > ONE_PAGE_AT_MIN || preferTwo) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = { rooms: false, sandwiches: false, footLogo: false, footPromos: false, sidesOnP2: true };
      layout.p1.classicsSplit = 1;

      var p1used = front;
      var p1left = PAGE - p1used;
      // Events / feature panels on the left; Burgers + Pub Classics stack on the right.
      // Keep a generous safety margin — unit estimates run optimistic vs real type,
      // and a clipped page-1 column is worse than moving events to page 2 / omitting.
      var p1Safety = 14;
      if (wantPromoBox) {
        var addR = tryAdd(p1left, promoCost + p1Safety);
        if (addR.ok) {
          layout.p1.rooms = true;
          p1left = addR.left + p1Safety;
          layout.fillers.push(promoLabel + ' (page 1)');
        }
      }
      layout.leftover.p1 = p1left;

      var p2used = back + COST.bottomCols;
      if (layout.p2.sidesOnP2 && bag.sides) { /* already in back */ }
      var p2left = PAGE - p2used;
      // Desserts + a full mains list leave little room — be stricter about fillers
      var tightBack = !!(bag.desserts && bag.mains && bag.mains.dishes.length >= 6);
      if (wantSandwiches) {
        // SHARED TYPE SCALE: always try page 1 first (named fillings OR tip/sell box).
        // Parking the sandwich sell box on page 2 next to mains/desserts shrinks type
        // on BOTH pages — page 1 should take it whenever there is room.
        var addSandP1 = tryAdd(p1left, sandCost + (sandDishCount > 0 ? 0 : 1));
        if (addSandP1.ok) {
          layout.p1.sandwiches = true;
          p1left = addSandP1.left;
          layout.leftover.p1 = p1left;
          layout.fillers.push(sandDishCount ? 'Sandwiches (page 1)' : 'Sandwiches box (page 1)');
        } else {
          var p2SandCost = tightBack ? sandCost + 2 : sandCost;
          var addSx = tryAdd(p2left, p2SandCost);
          if (addSx.ok) {
            layout.p2.sandwiches = true;
            p2left = addSx.left;
            layout.fillers.push(sandDishCount ? 'Sandwiches (page 2)' : 'Sandwiches box (page 2)');
          } else if (bag.sides || sandDishCount) {
            var addS = tryAdd(p1left, sandCost);
            if (addS.ok) {
              layout.p1.sandwiches = true;
              p1left = addS.left;
              if (bag.sides) {
                layout.p1.sidesOnP1 = true;
                layout.p2.sidesOnP2 = false;
                p2left += sectionUnits(bag.sides, false);
              }
              layout.leftover.p1 = p1left;
              layout.fillers.push(sandDishCount ? 'Sandwiches (page 1)' : 'Sandwiches + sides (page 1)');
            }
          }
        }
      }
      if (wantPromoBox && !layout.p1.rooms) {
        // Prefer NOT stacking an extra promo beside sandwiches on a packed page 2 —
        // that is the type ceiling. Only add when page 2 still has generous room.
        var addRooms2 = tryAdd(p2left, promoCost + (tightBack ? 8 : 4));
        if (addRooms2.ok && p2left > (tightBack ? 22 : 16)) {
          layout.p2.rooms = true;
          p2left = addRooms2.left;
          layout.fillers.push(promoLabel + ' (page 2)');
        }
      }

      // SHARED TYPE + EVEN FILL: same type on both pages, and spread movable
      // blocks (Sides / Sandwiches) so leftover room is similar — not one airy
      // page and one packed page.
      var p2Crowded = p2left < 14 ||
        (bag.mains && bag.desserts && (bag.mains.dishes || []).length >= 5) ||
        (bag.mains && (bag.mains.dishes || []).length >= 7) ||
        (!!bag.sundayRoasts && !layout.p1.sundayRoasts && bag.desserts) ||
        tightBack;
      var sideCost = bag.sides ? sectionUnits(bag.sides, false) : 0;
      var p1MuchEmptier = p1left > p2left + 12;
      if (bag.sides && layout.p2.sidesOnP2 && sideCost > 0) {
        var takeSides = tryAdd(p1left, sideCost + (layout.p1.sandwiches ? 1 : 3));
        if ((p2Crowded || p1MuchEmptier) && takeSides.ok) {
          layout.p1.sidesOnP1 = true;
          layout.p2.sidesOnP2 = false;
          p1left = takeSides.left;
          p2left += sideCost;
          layout.fillers.push(p2Crowded
            ? 'Sides (page 1 — keep type size equal on both pages)'
            : 'Sides (page 1 — even fill across pages)');
        }
      }
      if (layout.p2.sandwiches && !layout.p1.sandwiches) {
        var takeSand = tryAdd(p1left, sandCost + 1);
        if ((p2Crowded || p1MuchEmptier) && takeSand.ok) {
          layout.p1.sandwiches = true;
          layout.p2.sandwiches = false;
          p1left = takeSand.left;
          p2left += sandCost;
          layout.fillers.push(sandDishCount
            ? 'Sandwiches (page 1 — free page 2 for larger type)'
            : 'Sandwiches box (page 1 — free page 2 for larger type)');
        }
      }
      // If Sides landed on page 1 but page 1 is now the packed one and page 2 is
      // sparse, move them back — never undo a move that was required for shared type.
      if (layout.p1.sidesOnP1 && !layout.p2.sidesOnP2 && sideCost > 0 &&
          !p2Crowded && p1left < 10 && p2left > p1left + 14) {
        var p2CanTake = tryAdd(p2left, sideCost + 2);
        if (p2CanTake.ok) {
          layout.p1.sidesOnP1 = false;
          layout.p2.sidesOnP2 = true;
          p1left += sideCost;
          p2left = p2CanTake.left;
          layout.fillers.push('Sides (page 2 — even fill across pages)');
        }
      }

      // Foot logo is optional chrome — only keep it when page 2 still has generous
      // leftover after mains/desserts. Readable shared type beats a second logo.
      var logoCost = COST.footLogo + (tightBack ? 12 : 8);
      var addLogo = tryAdd(p2left, logoCost);
      if (addLogo.ok && p2left > (tightBack ? 24 : 18)) {
        layout.p2.footLogo = true;
        p2left = addLogo.left;
        layout.fillers.push('Logo (page 2)');
      } else if (bag.mains && bag.desserts) {
        layout.p2.footLogo = false;
        layout.fillers.push('No page-2 logo (keep type readable)');
      }
      layout.leftover.p1 = p1left;
      layout.leftover.p2 = p2left;
      // Foot feature pairs only when the page still has comfortable spare room.
      // At min type / packed mains+desserts, omit rather than jam panels in.
      layout.p1.footPromos = canFitFootPromos(p1left);
      layout.p2.footPromos = canFitFootPromos(p2left) && !tightBack && p2left > (tightBack ? 22 : 16);

      if (p1used > PAGE + 10 || p2used > PAGE + 14) layout.fit = 'over';
    } else {
      layout.pages = 1;
      layout.fit = 'one';
    }

    var bits = layout.fillers.length
      ? ' Auto-adds where they fit: ' + layout.fillers.join('; ') + '.'
      : ' Sheet is full — no room for extra selling boxes.';
    var typeNote = ' Type range: names ' + TYPE_RANGE.name.min + '–' + TYPE_RANGE.name.max +
      'pt, descriptions ' + TYPE_RANGE.desc.min + '–' + TYPE_RANGE.desc.max +
      'pt, section titles ' + TYPE_RANGE.title.min + '–' + TYPE_RANGE.title.max +
      'pt; dish gap ≥' + TYPE_RANGE.dishGapPx.min + 'px.';
    layout.summary =
      (layout.fit === 'one' ? 'One A4 — food fits at minimum type, so type can open toward the maximum.' :
        layout.fit === 'two' ? 'Two A4 pages — would clip at minimum type on one page; same type on both pages, opening toward the maximum; never a third page.' :
          'Too much for two readable pages. Remove sections or put Desserts / Little Bells / Sandwiches on separate card menus.') +
      typeNote +
      ' Columns start and finish level (food first, then feature panels).' +
      (layout.pages === 2 ? ' Content spread evenly across both pages with one shared type size.' : '') +
      ' Layout from ' + bag.count + ' dishes.' + bits;

    layout.typeRange = TYPE_RANGE;
    layout.orderedDishes = dishes;
    return layout;
  }

  function listDishes(list) {
    return (list || []).map(function (d) { return dishRow(d); }).join('');
  }

  /** Split a section across two columns when it has enough dishes to look sparse full-width. */
  function listDishesCols(list) {
    list = list || [];
    if (list.length < 2) return listDishes(list);
    var mid = Math.ceil(list.length / 2);
    return (
      '<div class="cols share-cols">' +
        '<div class="col">' + listDishes(list.slice(0, mid)) + '</div>' +
        '<div class="col">' + listDishes(list.slice(mid)) + '</div>' +
      '</div>'
    );
  }

  function sectionBlock(title, dishes, rule, kind, opts) {
    if (!dishes || !dishes.length) return '';
    opts = opts || {};
    var body = opts.twoCol ? listDishesCols(dishes) : listDishes(dishes);
    // Item Boost is a staff filing bucket — print the dish in the frilly box, not the label
    var head = opts.hideTitle ? '' : sectionTitle(title);
    var note = opts.note != null ? String(opts.note) : String((rule && rule.note) || '');
    note = note.trim();
    var noteHtml = note
      ? '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>'
      : '';
    return framedBlock(head + noteHtml + body, rule, kind || 'wide');
  }

  /**
   * Specials for one course on Main / Sunday — frilly Specials box that sits
   * under the matching regular section. No “Starters/Mains” label (context is
   * the parent course); just Specials + optional Blocks note + dishes.
   */
  function specialsBesideCourse(dishes, plan, sectionKey) {
    dishes = dishes || [];
    if (!dishes.length) return '';
    var rule = ruleFor(sectionKey || 'Special Mains', plan);
    if (rule.frame == null) rule.frame = true;
    // Small “Specials” label only — no Starters/Mains course head (parent section is the cue).
    // Note comes from Blocks → Extra info (not hardwired).
    var inner = '<div class="sec-title specials-beside-title">Specials</div>';
    var note = String(rule.note || '').trim();
    if (note) inner += '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>';
    inner += listDishes(dishes);
    return '<section class="sec specials-beside" data-specials-course="' +
      esc(sectionKey || 'Special Mains') + '">' + framedBlock(inner, rule, 'wide') + '</section>';
  }

  function layoutMap(plan) {
    if (root.EBMenus && root.EBMenus.normalizeSectionLayout) {
      return root.EBMenus.normalizeSectionLayout(plan && plan.sectionLayout);
    }
    return (plan && plan.sectionLayout) || {};
  }

  function ruleFor(sectionName, plan) {
    if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
      return root.EBMenus.sectionLayoutFor(sectionName, plan && plan.sectionLayout);
    }
    var map = layoutMap(plan);
    var key = sectionName || '';
    return map[key] || { width: 'full', frame: false, note: '', tip: false, sell: '' };
  }

  function wantsColumn(rule) {
    if (root.EBMenus && root.EBMenus.isColumnWidth) return root.EBMenus.isColumnWidth(rule.width);
    return rule.width === 'column' || rule.width === 'both';
  }

  function wantsFull(rule) {
    if (root.EBMenus && root.EBMenus.isFullWidth) return root.EBMenus.isFullWidth(rule.width);
    return rule.width === 'full' || rule.width === 'both';
  }

  /** Blocks “Full width” lock (not Best fit). Must print full-bleed — never a half-column. */
  function lockedFullWidth(rule) {
    if (root.EBMenus && root.EBMenus.isLockedFullWidth) {
      return !!(rule && root.EBMenus.isLockedFullWidth(rule.width));
    }
    return !!(rule && wantsFull(rule) && !wantsColumn(rule));
  }

  /** Blocks “Column” lock (not Best fit). Must stay half-column — never orphaned to full-bleed. */
  function lockedColumnWidth(rule) {
    if (root.EBMenus && root.EBMenus.isLockedColumnWidth) {
      return !!(rule && root.EBMenus.isLockedColumnWidth(rule.width));
    }
    return !!(rule && String(rule.width || '').toLowerCase() === 'column');
  }

  /**
   * GOLDEN RULE: opposite columns start and finish level.
   * Food first; when one side has food and the other is empty, put feature panels
   * on the short side (never leave a blank half-page hole).
   */
  function columnBalanceFill(leftFoodU, promos, opts) {
    opts = opts || {};
    var remaining = filterUnusedPromos(promos || [], opts.excludeTitles || []);
    var fill = planPromoFill(leftFoodU || 0, 0, remaining, {
      leftFrame: opts.leftFrame || 'box',
      rightFrame: opts.rightFrame || 'wide',
      force: { shorter: 'right', panels: (leftFoodU || 0) >= 10 ? 2 : 1 }
    });
    var rightHtml = fill.right || '';
    if (!rightHtml && remaining.length) {
      rightHtml = promoBesidePartner(remaining, leftFoodU || 0, opts.rightFrame || 'wide');
    }
    return { html: rightHtml || '&nbsp;', usedTitles: fill.usedTitles || [] };
  }

  /** Blocks Column section with no food partner — pair with feature panels so columns finish level. */
  function columnSoloSection(title, dishes, rule, opts) {
    opts = opts || {};
    if (!dishes || !dishes.length) return { html: '', usedPromoTitles: [] };
    var inner = sectionBlock(title, dishes, rule, 'box');
    var units = sectionUnits({ name: title, dishes: dishes }, false);
    var fill = columnBalanceFill(units, opts.promos, opts);
    return {
      html: '<section class="sec column-solo-row">' +
        '<div class="cols cols-balanced cols-features">' +
        '<div class="col"><div class="col-body">' + inner + '</div></div>' +
        '<div class="col col-promo"><div class="col-body">' + fill.html + '</div></div>' +
        '</div></section>',
      usedPromoTitles: fill.usedTitles
    };
  }

  /**
   * Little Bells respects Blocks width.
   * GOLDEN RULE: Column pairs with food first (Desserts if Column/Best fit, else Sides),
   * then feature panels so opposite columns start and finish level.
   * Locked Full partners are never forced into the pair.
   */
  function renderLittleBellsRow(bag, littleRule, dessRule, sideRule, sidesPrint, opts) {
    opts = opts || {};
    if (!bag.littleBells || !bag.littleBells.dishes || !bag.littleBells.dishes.length) {
      return { html: '', usedDesserts: false, usedSides: false, usedPromoTitles: [] };
    }
    var col = wantsColumn(littleRule);
    var frameKind = col ? 'box' : 'wide';
    var kidsInner = sectionBlock(
      bag.littleBells.name,
      bag.littleBells.dishes,
      littleRule,
      frameKind
    );
    if (!col) {
      return {
        html: '<section class="sec">' + kidsInner + '</section>',
        usedDesserts: false,
        usedSides: false,
        usedPromoTitles: []
      };
    }
    // Food first: pair with Desserts when Blocks allows Column / Best fit.
    var dessertsAllowColumn = !!(dessRule && wantsColumn(dessRule));
    if (dessertsAllowColumn && bag.desserts && bag.desserts.dishes && bag.desserts.dishes.length) {
      var dessInner = sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule, 'wide');
      var pair = '<section class="sec little-desserts-row">' +
        '<div class="cols cols-balanced cols-little-desserts">' +
        '<div class="col col-little"><div class="col-body">' + kidsInner + '</div></div>' +
        '<div class="col col-desserts"><div class="col-body">' + dessInner + '</div></div>' +
        '</div></section>';
      return { html: pair, usedDesserts: true, usedSides: false, usedPromoTitles: [] };
    }
    // Food first: Sides when Blocks allows Column / Best fit (keeps columns level with food).
    var sidesAllowColumn = !!(sideRule && wantsColumn(sideRule));
    if (sidesAllowColumn && sidesPrint && sidesPrint.dishes && sidesPrint.dishes.length) {
      var sideInner = sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule, 'wide');
      var withSides = '<section class="sec little-sides-row">' +
        '<div class="cols cols-balanced cols-little-sides">' +
        '<div class="col col-little"><div class="col-body">' + kidsInner + '</div></div>' +
        '<div class="col col-sides"><div class="col-body">' + sideInner + '</div></div>' +
        '</div></section>';
      return { html: withSides, usedDesserts: false, usedSides: true, usedPromoTitles: [] };
    }
    // No food partner — feature panels on the short side (never a blank half).
    var kidsU = sectionUnits(bag.littleBells, false);
    var fill = columnBalanceFill(kidsU, opts.promos, opts);
    var solo = '<section class="sec little-solo-row">' +
      '<div class="cols cols-balanced cols-features cols-little-solo">' +
      '<div class="col col-little"><div class="col-body">' + kidsInner + '</div></div>' +
      '<div class="col col-promo"><div class="col-body">' + fill.html + '</div></div>' +
      '</div></section>';
    return {
      html: solo,
      usedDesserts: false,
      usedSides: false,
      usedPromoTitles: fill.usedTitles
    };
  }

  /** Wrap section HTML in a scallop frame when the designer said Yes. */
  function framedBlock(inner, rule, kind) {
    if (rule && rule.frame) return scallop(inner, kind || 'wide');
    return '<div class="sec-plain">' + inner + '</div>';
  }

  function renderFiller(which, bag, promos, opts) {
    opts = opts || {};
    if (which === 'rooms') {
      var list = (promos && promos.length) ? promos : (bag && bag.promos);
      if (list && list.length) return renderPromoBank(list, opts.frame);
      return promoRooms();
    }
    if (which === 'sandwiches') {
      return sandwichesBlock(bag, opts);
    }
    if (which === 'logo') {
      return '<div class="foot-logo"><img src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
    }
    return '';
  }

  function buildLong(menu, dishes, plan, ver) {
    var layout = (plan && plan.layout) || planFluidLayout(menu, dishes, {
      promos: (plan && plan.promos) || [],
      sectionLayout: plan && plan.sectionLayout
    });
    dishes = layout.orderedDishes || orderDishesForPrint(dishes);
    var bag = layout.bag || pickSections(dishes);
    var promos = (plan && plan.promos) || layout.promos || [];
    bag.promos = promos;
    var p1opts = layout.p1 || {};
    var p2opts = layout.p2;
    var sidesPrint = sidesForPrint(bag);
    var hideDate = menu.id === 'party' || menu.kind === 'party';
    var fill1 = (plan && plan.forceFillClass) || 'fill-roomy';
    var fill2 = (plan && plan.forceFillClass) || 'fill-roomy';

    var nibRule = ruleFor('Nibbles', plan);
    var startRule = ruleFor('Starters', plan);
    var shareRule = ruleFor('Sharing Plates', plan);
    var boostRule = ruleFor('Item Boost', plan);
    var classRule = ruleFor('Pub Classics', plan);
    var burgRule = ruleFor('Burgers', plan);
    var roastRule = ruleFor('Sunday Roasts', plan);
    var mainRule = ruleFor('Mains', plan);
    var littleRule = ruleFor('Little Bells', plan);
    var sandRule = ruleFor('Sandwiches', plan);
    var sideRule = ruleFor('Sides', plan);
    var dessRule = ruleFor('Desserts', plan);
    // Feature panel titles already printed — each event box only once per menu.
    var usedPromoTitles = [];

    var p1 = '<div class="page fill-page ' + fill1 + '">';
    p1 += trackerBar(ver, { hideDate: hideDate });
    p1 += '<div class="page-body">';

    // —— Column block (golden rule: both columns start on the same baseline) ——
    // Left  = Nibbles OR Starters (beside logo), Sharing, Sandwiches (spiel + dishes)
    // Right = Logo (top) then Burgers, then Pub Classics; event panels pin to both feet
    var split = splitClassicsBag(bag.classics);
    var burgerDishes = (bag.burgers && bag.burgers.dishes && bag.burgers.dishes.length)
      ? bag.burgers.dishes.slice()
      : [];
    if (split.burgers && split.burgers.length) {
      burgerDishes = burgerDishes.concat(split.burgers);
    }
    // Keep kids plates out of the Burgers column
    var kidsFromBurgers = [];
    burgerDishes = burgerDishes.filter(function (d) {
      if (/fish fingers|chicken goujons|mac\s*&\s*cheese|pasta|pizza|fries\s*&\s*(dressed\s*)?salad/i.test(d.name || '')) {
        kidsFromBurgers.push(d);
        return false;
      }
      return true;
    });
    if (kidsFromBurgers.length) {
      if (bag.littleBells && bag.littleBells.dishes) {
        bag.littleBells = {
          name: 'Little Bells',
          dishes: bag.littleBells.dishes.concat(kidsFromBurgers)
        };
      } else {
        bag.littleBells = { name: 'Little Bells', dishes: kidsFromBurgers };
      }
    }
    if (split.sandwiches.length) {
      if (bag.sandwiches && bag.sandwiches.dishes) {
        bag.sandwiches = {
          name: 'Sandwiches',
          dishes: bag.sandwiches.dishes.concat(split.sandwiches)
        };
      } else {
        bag.sandwiches = { name: 'Sandwiches', dishes: split.sandwiches };
      }
    }
    var classicDishes = split.classics;
    var shareDishes = (bag.sharing && bag.sharing.dishes) ? bag.sharing.dishes.slice() : [];
    var shareAsColumn = !!(shareDishes.length && wantsColumn(shareRule));
    var shareAsFull = !!(shareDishes.length && !shareAsColumn);
    var foodUnits = classicDishes.length + burgerDishes.length;
    var shareInLeft = shareAsColumn ||
      (!!shareDishes.length && foodUnits > 0 && foodUnits <= 4 && (burgerDishes.length || p1opts.rooms));

    var sandList = sandwichDishesOf(bag);
    // Nibbles / Starters sit in the top band beside the logo (span across),
    // not a skinny left column under half the page. Frilly follows Blocks settings.
    var nibblesInTop = !!bag.nibbles;
    var startersInTop = !!(bag.starters && !bag.nibbles);
    var startersBelowNibbles = !!(bag.starters && bag.nibbles);
    var sandwichesInCol = !!(p1opts.sandwiches && (wantsColumn(sandRule) || sandList.length));

    var showColBlock = classicDishes.length || burgerDishes.length || p1opts.rooms ||
      p1opts.sandwiches || (p1opts.sidesOnP1 && sidesPrint) || shareInLeft;
    var classicsAsColumn = wantsColumn(classRule) || wantsColumn(burgRule) || !!burgerDishes.length ||
      !!p1opts.rooms || shareInLeft || classicDishes.length > 0 || sandwichesInCol;

    // Top band: Starters (or Nibbles) flow across to the logo — prominent, not half-width
    if (nibblesInTop || startersInTop) {
      p1 += '<div class="top-band top-band-logo">';
      p1 += '<div class="top-left">';
      if (nibblesInTop) {
        p1 += sectionBlock(bag.nibbles.name, bag.nibbles.dishes, nibRule, 'wide');
      }
      if (startersInTop) {
        p1 += sectionBlock(bag.starters.name, bag.starters.dishes, startRule, 'wide');
      }
      p1 += '</div>';
      p1 += '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
      p1 += '</div>';
    } else if (!showColBlock || !classicsAsColumn) {
      p1 += '<div class="top-band top-band-logo">';
      p1 += '<div class="top-left"></div>';
      p1 += '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
      p1 += '</div>';
    }
    // Starters under nibbles: full width so they stay prominent
    if (startersBelowNibbles) {
      p1 += '<section class="sec">' + sectionBlock(bag.starters.name, bag.starters.dishes, startRule) + '</section>';
    }
    // Special Starters sit under the regular starters — frilly box, no “Starters” label
    if (bag.specialStarters && bag.specialStarters.dishes && bag.specialStarters.dishes.length) {
      p1 += specialsBesideCourse(bag.specialStarters.dishes, plan, 'Special Starters');
    }

    if (shareAsFull && !shareInLeft) {
      p1 += '<section class="sec">' +
        sectionBlock(bag.sharing.name, shareDishes, shareRule, 'wide', {
          twoCol: shareDishes.length >= 2
        }) +
        '</section>';
    }
    if (bag.boost) {
      p1 += '<section class="sec">' +
        sectionBlock(bag.boost.name, bag.boost.dishes, boostRule, 'wide', { hideTitle: true }) +
        '</section>';
    }
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isSundayRoasts(s.name) && !isDessert(s.name) && !isSandwich(s.name) &&
          !isBurgers(s.name) && !isItemBoost(s.name) && !isSpecials(s.name) && !isLittleBells(s.name)) {
        var otherRule = ruleFor(s.name, plan);
        p1 += '<section class="sec">' + sectionBlock(s.name, s.dishes, otherRule) + '</section>';
      }
    });

    // Sunday Roasts on page 1 (after starters, before promo/classics footers) when balanced here.
    var roastsOnPage1 = !!(bag.sundayRoasts && (layout.pages === 1 || p1opts.sundayRoasts));
    if (roastsOnPage1) {
      p1 += '<section class="sec">' +
        sectionBlock(bag.sundayRoasts.name, bag.sundayRoasts.dishes, roastRule) + '</section>';
    }

    if (showColBlock && classicsAsColumn) {
      // Logo already in top-band when starters/nibbles sit there — columns start level below
      var logoInTop = nibblesInTop || startersInTop;
      var sandOnRightNote = false;
      // Estimate food-stack height so Sides / sandwich sell balance columns;
      // feature panels stay little promotions under whatever is still short.
      var leftFoodU = 0;
      var rightFoodU = 0;
      if (shareInLeft) leftFoodU += sectionUnits({ name: 'Sharing', dishes: shareDishes }, false);
      if (burgerDishes.length) rightFoodU += sectionUnits({ name: 'Burgers', dishes: burgerDishes }, false);
      if (classicDishes.length) rightFoodU += sectionUnits({ name: 'Pub Classics', dishes: classicDishes }, false);

      // Named fillings stay left beside Burgers. Tip/sell box goes to the SHORTER
      // column so we do not pile Burgers + Sandwiches + Sides on the right while
      // Sharing sits alone under a huge empty promo frame.
      var sandOnLeftCol = false;
      var sandOnRightCol = false;
      if (sandwichesInCol && sandList.length) {
        sandOnLeftCol = true;
        leftFoodU += sandwichesPackCost(bag);
      } else if (sandwichesInCol) {
        if (leftFoodU <= rightFoodU) {
          sandOnLeftCol = true;
          leftFoodU += COST.sandwiches;
        } else {
          sandOnRightCol = true;
          sandOnRightNote = true;
          rightFoodU += COST.sandwiches;
        }
      }

      // Prefer Sides under the shorter food stack so columns finish level.
      var sidesOnLeftCol = false;
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule)) {
        sidesOnLeftCol = leftFoodU <= rightFoodU;
        if (sidesOnLeftCol) leftFoodU += sectionUnits(sidesPrint, false);
        else rightFoodU += sectionUnits(sidesPrint, false);
      }

      var leftHasFood = !!(shareInLeft || sandOnLeftCol || (sidesOnLeftCol && sidesPrint));
      var rightHasFood = !!(burgerDishes.length || classicDishes.length || sandOnRightCol ||
        (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule) && !sidesOnLeftCol));

      // Orphan column (e.g. Sandwiches alone): span food full-width, two feature
      // panels as a footer row — never leave a tall empty hole beside a column.
      // Exception: Blocks “Column” lock on Sides must stay half-width (never full-bleed).
      var sidesLockedCol = !!(p1opts.sidesOnP1 && sidesPrint && lockedColumnWidth(sideRule));
      if (orphanColumnHole(leftFoodU, rightFoodU) && !(leftHasFood && rightHasFood) && !sidesLockedCol) {
        p1 += '<section class="sec classics-block">';
        if (!logoInTop) {
          p1 += '<div class="top-band top-band-logo"><div class="top-left"></div>' +
            '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) +
            '" alt="The Eight Bells"></div></div>';
        }
        if (shareInLeft) {
          p1 += framedBlock(sectionTitle(bag.sharing.name) + listDishes(shareDishes), shareRule);
        }
        if (sandOnLeftCol || sandOnRightCol) {
          p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'wide' : undefined, rule: sandRule });
        }
        if (p1opts.sidesOnP1 && sidesPrint) {
          p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
        }
        if (burgerDishes.length) {
          p1 += framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule);
        }
        if (classicDishes.length) {
          p1 += framedBlock(sectionTitle('Pub Classics') + listDishes(classicDishes), classRule);
        }
        // Only add foot panels when the planner left comfortable spare room —
        // never jam them under food at minimum type.
        if (p1opts.footPromos || canFitFootPromos(layout.leftover && layout.leftover.p1)) {
          var foot1 = footPromoPair(promos, { excludeTitles: usedPromoTitles });
          usedPromoTitles = usedPromoTitles.concat(foot1.usedTitles || []);
          if (foot1.html) p1 += foot1.html;
          else if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
        }
        p1 += '</section>';
      } else {
      p1 += '<section class="sec classics-block">';
      p1 += '<div class="cols cols-classics cols-balanced cols-features' +
        (logoInTop ? '' : ' cols-with-logo') + '">';
      var promoFrameOpts = sandOnRightNote
        ? { leftFrame: 'wide', rightFrame: 'box', leftFood: leftFoodU, rightFood: rightFoodU }
        : { leftFrame: 'box', rightFrame: 'wide', leftFood: leftFoodU, rightFood: rightFoodU };
      // Pre-release Gemini columnBalance (any uneven pair) overrides unit guesses.
      if (plan && plan.forceColumnFill && plan.forceColumnFill.page1) {
        promoFrameOpts.force = plan.forceColumnFill.page1;
      }
      // Always fill a real opposite-column hole before the PDF opens.
      // Track usedTitles so page 2 never reprints the same event panel.
      var promoCols = planPromoFill(leftFoodU, rightFoodU, promos, promoFrameOpts);
      usedPromoTitles = usedPromoTitles.concat(promoCols.usedTitles || []);
      var leftFeature = promoCols.left || '';
      var rightFeature = promoCols.right || '';

      // LEFT — Sharing, optional sandwiches/sides; little promo if still short
      p1 += '<div class="col col-events">';
      p1 += '<div class="col-body">';
      if (shareInLeft) {
        p1 += framedBlock(
          sectionTitle(bag.sharing.name) + listDishes(shareDishes),
          shareRule
        );
      }
      if (sandOnLeftCol) {
        p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'box' : undefined, rule: sandRule });
      }
      if (sidesOnLeftCol && sidesPrint) {
        p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
      }
      if (!shareInLeft && !sandOnLeftCol && !sidesOnLeftCol && !leftFeature) {
        p1 += '&nbsp;';
      }
      p1 += '</div>';
      if (leftFeature) p1 += '<div class="col-feature">' + leftFeature + '</div>';
      p1 += '</div>';

      // RIGHT — Logo only if not already in top-band; then Burgers + Pub Classics
      p1 += '<div class="col col-food">';
      if (!logoInTop) {
        p1 += '<div class="col-logo"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
      }
      p1 += '<div class="col-body">';
      if (burgerDishes.length) {
        p1 += framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule);
      }
      if (classicDishes.length) {
        p1 += framedBlock(sectionTitle('Pub Classics') + listDishes(classicDishes), classRule);
      }
      if (sandOnRightCol) {
        p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'box' : undefined, rule: sandRule });
      }
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule) && !sidesOnLeftCol) {
        p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
      }
      if (!burgerDishes.length && !classicDishes.length && !rightFeature &&
          !sandOnRightCol &&
          !(p1opts.sidesOnP1 && sidesPrint && !sidesOnLeftCol)) {
        p1 += '&nbsp;';
      }
      p1 += '</div>';
      if (rightFeature) p1 += '<div class="col-feature">' + rightFeature + '</div>';
      p1 += '</div></div></section>';
      }
    } else if (classicDishes.length || burgerDishes.length) {
      if (burgerDishes.length) {
        p1 += '<section class="sec">' + framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule) + '</section>';
      }
      if (classicDishes.length) {
        p1 += '<section class="sec">' + framedBlock(sectionTitle('Pub Classics') + listDishes(classicDishes), classRule) + '</section>';
      }
      if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
      if (p1opts.sandwiches) p1 += sandwichesBlock(bag, { rule: sandRule });
    } else if (p1opts.rooms || p1opts.sandwiches) {
      p1 += '<section class="sec classics-block"><div class="cols cols-classics cols-balanced cols-features">';
      p1 += '<div class="col col-events"><div class="col-body">&nbsp;</div>';
      if (p1opts.rooms) {
        p1 += '<div class="col-feature">' +
          renderFiller('rooms', bag, promos, { frame: p1opts.sandwiches ? 'wide' : 'box' }) +
          '</div>';
      }
      p1 += '</div><div class="col col-food"><div class="col-body">&nbsp;</div>';
      if (p1opts.sandwiches) {
        p1 += '<div class="col-feature">' +
          sandwichesBlock(bag, { rule: sandRule }) +
          '</div>';
      }
      p1 += '</div></div></section>';
    }

    if (layout.pages === 1) {
      if (bag.mains) p1 += '<section class="sec">' + sectionBlock(bag.mains.name, bag.mains.dishes, mainRule) + '</section>';
      if (bag.specialMains && bag.specialMains.dishes && bag.specialMains.dishes.length) {
        p1 += specialsBesideCourse(bag.specialMains.dishes, plan, 'Special Mains');
      }
      // Food-first column pairing (Sides/Desserts when Blocks allow); else feature panels.
      var littleP1 = renderLittleBellsRow(
        bag, littleRule, dessRule, sideRule, sidesPrint,
        { promos: promos, excludeTitles: usedPromoTitles }
      );
      usedPromoTitles = usedPromoTitles.concat(littleP1.usedPromoTitles || []);
      p1 += littleP1.html;
      if (bag.desserts && !littleP1.usedDesserts) {
        p1 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';
      }
      if (bag.specialDesserts && bag.specialDesserts.dishes && bag.specialDesserts.dishes.length) {
        p1 += specialsBesideCourse(bag.specialDesserts.dishes, plan, 'Special Desserts');
      }
      if (sidesPrint && !p1opts.sidesOnP1 && !littleP1.usedSides) {
        if (lockedColumnWidth(sideRule)) {
          var sideSolo1 = columnSoloSection(sidesPrint.name, sidesPrint.dishes, sideRule, {
            promos: promos, excludeTitles: usedPromoTitles
          });
          usedPromoTitles = usedPromoTitles.concat(sideSolo1.usedPromoTitles || []);
          p1 += sideSolo1.html;
        } else {
          p1 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
        }
      }
      if (bag.sauces) p1 += '<section class="sec">' + sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes) + '</section>';
      if (p1opts.sandwiches && !showColBlock) p1 += renderFiller('sandwiches', bag);
      if (p1opts.footLogo) p1 += renderFiller('logo', bag);
    }

    p1 += '</div>'; // page-body — grows so allergy stays pinned to the page foot
    p1 += allergy({ lunchClub: !!(bag.hasLunch) });
    p1 += '</div>';

    if (layout.pages < 2 || !p2opts) return p1;

    var p2 = '<div class="page fill-page ' + fill2 + '">';
    // Week / Sunday date only on page 1 — page 2 keeps the quiet Roman only.
    p2 += trackerBar(ver, { hideDate: true });
    p2 += '<div class="page-body page-body-start">';
    if (bag.sundayRoasts && !p1opts.sundayRoasts) {
      p2 += '<section class="sec">' +
        sectionBlock(bag.sundayRoasts.name, bag.sundayRoasts.dishes, roastRule) + '</section>';
    }
    if (bag.mains) p2 += '<section class="sec">' + sectionBlock(bag.mains.name, bag.mains.dishes, mainRule) + '</section>';
    if (bag.specialMains && bag.specialMains.dishes && bag.specialMains.dishes.length) {
      p2 += specialsBesideCourse(bag.specialMains.dishes, plan, 'Special Mains');
    }
    // Food-first column pairing; feature panels fill any remaining short column.
    var littleP2 = renderLittleBellsRow(
      bag, littleRule, dessRule, sideRule, sidesPrint,
      { promos: promos, excludeTitles: usedPromoTitles }
    );
    usedPromoTitles = usedPromoTitles.concat(littleP2.usedPromoTitles || []);
    p2 += littleP2.html;
    if (bag.desserts && !littleP2.usedDesserts) {
      p2 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';
    }
    if (bag.specialDesserts && bag.specialDesserts.dishes && bag.specialDesserts.dishes.length) {
      p2 += specialsBesideCourse(bag.specialDesserts.dishes, plan, 'Special Desserts');
    }

    var showBottom = (p2opts.sidesOnP2 && (sidesPrint || bag.sauces) && !littleP2.usedSides) ||
      p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      var sidesCol = sidesPrint && wantsColumn(sideRule);
      var sideList = (p2opts.sidesOnP2 && sidesPrint && !littleP2.usedSides) ? sidesPrint.dishes.slice() : [];
      // Sides (and sauces) in the left column; Sandwiches fully in the frilly box on the right.
      // If Sides sit alone (no sandwiches opposite), Best fit may span full-width + foot panels.
      // Blocks “Column” lock must stay half-width — never orphan to full-bleed.
      if ((sidesCol || p2opts.sandwiches || p2opts.rooms) && (sideList.length || p2opts.sandwiches || p2opts.rooms || bag.sauces)) {
        var sideU = 0;
        if (sideList.length) sideU += sectionUnits({ name: 'Sides', dishes: sideList }, false);
        if (p2opts.sidesOnP2 && bag.sauces) sideU += sectionUnits(bag.sauces, false);
        var rightU = p2opts.sandwiches ? sandwichesPackCost(bag) : 0;
        var remainingPromos = filterUnusedPromos(promos, usedPromoTitles);
        var sidesLockedColP2 = !!(sideList.length && lockedColumnWidth(sideRule));
        if (orphanColumnHole(sideU, rightU) && sideList.length && !p2opts.sandwiches && !sidesLockedColP2) {
          p2 += '<section class="sec">';
          p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
          p2 += listDishes(sideList);
          if (p2opts.sidesOnP2 && bag.sauces) {
            p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
            p2 += listDishes(bag.sauces.dishes);
          }
          p2 += '</section>';
          // Packed page 2 (mains + desserts + sides): omit foot panels if jammed.
          if (p2opts.footPromos || canFitFootPromos(layout.leftover && layout.leftover.p2)) {
            var foot2 = footPromoPair(remainingPromos, { excludeTitles: usedPromoTitles });
            usedPromoTitles = usedPromoTitles.concat(foot2.usedTitles || []);
            if (foot2.html) p2 += foot2.html;
            else if (p2opts.rooms) p2 += renderFiller('rooms', bag, remainingPromos);
          }
        } else {
        var p2Force = (plan && plan.forceColumnFill && plan.forceColumnFill.page2) || null;
        var p2Fill = planPromoFill(sideU, rightU, remainingPromos, {
          leftFrame: 'box',
          rightFrame: 'wide',
          force: p2Force,
          excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(p2Fill.usedTitles || []);
        p2 += '<div class="cols bottom-cols cols-balanced cols-features">';
        p2 += '<div class="col col-sides">';
        p2 += '<div class="col-body">';
        if (sideList.length) {
          p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
          p2 += listDishes(sideList);
        }
        if (p2opts.sidesOnP2 && bag.sauces) {
          p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          p2 += listDishes(bag.sauces.dishes);
        }
        if (!sideList.length && !(p2opts.sidesOnP2 && bag.sauces)) p2 += '&nbsp;';
        p2 += '</div>';
        if (p2Fill.left) p2 += '<div class="col-feature">' + p2Fill.left + '</div>';
        p2 += '</div>';
        p2 += '<div class="col col-promo">';
        p2 += '<div class="col-body">';
        if (p2opts.sandwiches) {
          p2 += sandwichesBlock(bag, { rule: sandRule, alignTitle: true });
        } else if (p2opts.rooms && !p2Fill.right) {
          p2 += promoBesidePartner(remainingPromos, sideU, 'box');
        } else if (!p2Fill.right) {
          p2 += '&nbsp;';
        }
        p2 += '</div>';
        if (p2Fill.right) p2 += '<div class="col-feature">' + p2Fill.right + '</div>';
        p2 += '</div></div>';
        }
      } else if (p2opts.sidesOnP2 && sidesPrint) {
        if (lockedColumnWidth(sideRule)) {
          var sideSolo2 = columnSoloSection(sidesPrint.name, sidesPrint.dishes, sideRule, {
            promos: promos, excludeTitles: usedPromoTitles
          });
          usedPromoTitles = usedPromoTitles.concat(sideSolo2.usedPromoTitles || []);
          p2 += sideSolo2.html;
        } else {
          p2 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
        }
      }
    } else if (p2opts.rooms) {
      p2 += renderFiller('rooms', bag, filterUnusedPromos(promos, usedPromoTitles));
    }

    if (p2opts.footLogo) p2 += renderFiller('logo', bag);
    p2 += '</div>'; // page-body — grows so allergy stays pinned to the page foot
    p2 += allergy({ lunchClub: !!(bag.hasLunch) });
    p2 += '</div>';

    return p1 + p2;
  }

  function buildCard(menu, dishes, plan, ver) {
    function face() {
      var title = menu.name.replace(/ menu$/i, '');
      var inner;
      if (menu.id === 'lunch-club') {
        var secs = groupBySection(dishes);
        inner =
          '<div class="days">MON<br>TUES<br>WED<br>THURS</div>' +
          '<div class="lc-title">Bells<br>Lunch Club</div>' +
          scallop('<div class="lc-price">two courses £14.95<br>three courses £17.95</div>') +
          secs.map(function (s) {
            return (
              '<div class="sec-title under">' + esc(s.name) + '</div>' +
              s.dishes.map(function (d) { return dishCentered(d, { hidePrice: true, hideLunch: true }); }).join('')
            );
          }).join('');
      } else if (menu.id === 'little-bells') {
        inner =
          scallop(dishes.map(function (d) { return dishCentered(d, { hidePrice: true, hideLunch: true }); }).join('')) +
          '<div class="lb-foot">' +
            '<div class="lb-ice">Two Scoops of Ice-Cream</div>' +
            '<div class="desc">Salted Caramel, Chocolate, Strawberry, Vanilla or Mint Choc Chip</div>' +
            '<div class="lb-price">£9.50</div>' +
            '<div class="desc">Little Bells on Sunday have a choice of roasts at half price of the adults in addition to above options</div>' +
          '</div>';
      } else if (menu.id === 'sandwiches') {
        inner = cardSandwichesInner(dishes);
      } else if (menu.id === 'specials') {
        // Board note from Blocks → Specials section “Extra info” (default in layout; editable)
        var specialsNote = '';
        if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
          specialsNote = String(root.EBMenus.sectionLayoutFor('Special Mains', plan && plan.sectionLayout).note || '').trim();
          if (!specialsNote) {
            specialsNote = String(root.EBMenus.sectionLayoutFor('Special Starters', plan && plan.sectionLayout).note || '').trim();
          }
        } else if (plan && plan.sectionLayout) {
          specialsNote = String((plan.sectionLayout['Special Mains'] || {}).note ||
            (plan.sectionLayout['Special Starters'] || {}).note || '').trim();
        }
        var byCourse = { starters: [], mains: [], desserts: [] };
        (dishes || []).forEach(function (d) {
          var sec = String(d.section || '');
          if (isSpecialDesserts(sec) || /dessert/i.test(sec)) byCourse.desserts.push(d);
          else if (isSpecialStarters(sec) || /starter/i.test(sec)) byCourse.starters.push(d);
          else byCourse.mains.push(d);
        });
        var courses = [
          { label: 'Starters', list: byCourse.starters },
          { label: 'Mains', list: byCourse.mains },
          { label: 'Desserts', list: byCourse.desserts }
        ].filter(function (c) { return c.list.length; });
        var showCourseHeads = courses.length > 1;
        inner = scallop(
          (specialsNote ? '<div class="sec-note" style="text-align:center">' + esc(specialsNote).replace(/\n/g, '<br>') + '</div>' : '') +
          courses.map(function (c) {
            return (showCourseHeads ? '<div class="specials-course">' + esc(c.label) + '</div>' : '') +
              c.list.map(function (d) { return dishCentered(d); }).join('');
          }).join('')
        );
      } else {
        // desserts etc
        inner = scallop(dishes.map(function (d) { return dishCentered(d); }).join(''));
      }
      var faceCls = 'card-face fill-page fill-airy' + (menu.id === 'specials' ? ' specials-face' : '');
      return (
        '<article class="' + faceCls + '">' +
          '<div class="card-top">' +
            trackerBar(ver) +
            '<img class="logo" src="' + esc(asset('eight-bells-logo.png')) + '" alt="">' +
            (menu.id === 'lunch-club' ? '' : '<h1>' + esc(title) + '</h1>') +
          '</div>' +
          '<div class="card-mid">' + inner + '</div>' +
          allergy() +
        '</article>'
      );
    }
    return '<div class="sheet landscape"><div class="sheet-inner">' + face() + face() + '</div></div>';
  }

  function css(opts) {
    opts = opts || {};
    var landscape = !!opts.landscape;
    var guillotine = !!opts.guillotine;
    // Match Eight Bells Canva website PDFs: Roboto dishes, Trajan-like Cinzel
    // titles, Crimson Text allergy. Logo ~180px on A4; type steps down to fit the page.
    // Fonts are loaded via <link> in build() — @import often fails before print.
    return (
      ':root{--ink:' + INK + ';--green:' + GREEN + ';--serif:"Cinzel",Georgia,"Times New Roman",serif;--sans:"Roboto",Helvetica,Arial,sans-serif;--allergy:"Crimson Text",Georgia,"Times New Roman",serif;' +
        '--dish-gap:12px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:22pt;--promo:11.5pt;' +
        '--name-min:11pt;--name-max:11.5pt;--desc-min:10pt;--desc-max:10pt;--title-min:16pt;--title-max:22pt;' +
        '--dish-gap-min:8px;--dish-gap-max:14px}' +
      '*{box-sizing:border-box} body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button,.toolbar label.paper-opt{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar label.paper-opt{display:inline-flex;align-items:center;gap:6px;background:#3a342c;color:#f4eae3}' +
      '.toolbar label.paper-opt input{margin:0}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet,.cut-sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;height:297mm;padding:11mm 10mm 9mm;position:relative;display:flex;flex-direction:column;overflow:hidden}' +
      '.page-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;min-height:0;overflow:hidden}' +
      '.page-body.spread-even{justify-content:space-evenly}' +
      '.page-body-start{padding-top:0}' +
      '.page-spacer{flex:1 1 auto;min-height:0}' +
      '.page-body > .sec,.page-body > .top-band,.page-body > .cols,.page-body > .classics-block,.page-body > .foot-logo{flex:0 0 auto}' +
      /* When spreading, let the main column / bottom band grow so type stays large
         but the block reaches the foot — no blank bottom third. */
      '.page-body.spread-even > .sec,.page-body.spread-even > .classics-block,.page-body.spread-even > .cols.bottom-cols{flex:1 1 auto;min-height:0}' +
      '.page-body.spread-even > .classics-block,.page-body.spread-even > .cols.bottom-cols,.page-body.spread-even > .foot-logo{display:flex;flex-direction:column}' +
      '.page-body.spread-even > .classics-block > .cols,.page-body.spread-even > .cols.bottom-cols{flex:1 1 auto;min-height:0;align-items:stretch}' +
      '.page-body.spread-even .cols-balanced .col{min-height:100%}' +
      '.page-body.spread-even > .foot-logo{flex:0 0 auto;margin-top:auto}' +
      '.scallop,.sec,.cols,.foot-logo,.col-promo,.col-events,.col-food{page-break-inside:avoid}' +
      '.sheet.landscape{width:297mm;height:210mm;overflow:hidden}' +
      '.sheet-inner{display:grid;grid-template-columns:1fr 1fr;height:100%}' +
      '.card-face{padding:7mm 7mm 6mm;border-right:1px dashed #cfc7bb;position:relative;display:flex;flex-direction:column;height:210mm;box-sizing:border-box;overflow:hidden}' +
      '.card-face:last-child{border-right:0}' +
      '.card-top{flex:0 0 auto}' +
      /* Grow the frilly box to fill the A5 face; spread dishes inside with large type */
      '.card-mid{flex:1 1 auto;display:flex;flex-direction:column;justify-content:stretch;min-height:0;gap:8px}' +
      '.card-face .allergy{flex:0 0 auto;margin-top:4px}' +
      '.card-face.fill-airy{--dish-gap:20px;--sec-gap:20px;--name:14pt;--desc:11.5pt;--title:22pt}' +
      '.card-face.fill-roomy{--dish-gap:16px;--sec-gap:16px;--name:13pt;--desc:11pt;--title:20pt}' +
      '.card-face.fill-normal{--dish-gap:12px;--sec-gap:13px;--name:12pt;--desc:10.5pt;--title:18pt}' +
      '.card-face.fill-tight{--dish-gap:9px;--sec-gap:10px;--name:11pt;--desc:9.75pt;--title:16pt}' +
      '.card-face.fill-compact,.card-face.fill-dense{--dish-gap:8px;--sec-gap:8px;--name:11pt;--desc:10pt;--title:16pt}' +
      '.card-face .dish-c{margin:0;padding:2px 0;text-align:center}' +
      '.card-face .dish-c .desc,.card-face .card-spiel{text-align:center;max-width:34em;margin-left:auto;margin-right:auto}' +
      '.card-face .scallop{margin:0;flex:1 1 auto;display:flex;flex-direction:column;min-height:0;width:100%}' +
      '.card-face .scallop-pad{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-evenly;min-height:0}' +
      '.card-face.fill-tight .scallop-pad,.card-face.fill-compact .scallop-pad,.card-face.fill-dense .scallop-pad{justify-content:flex-start}' +
      '.card-face .lb-foot{flex:0 0 auto;text-align:center}' +
      '.card-face .lb-price{text-align:center;margin:6px 0 10px}' +
      '.card-face .card-spiel{margin-top:8px}' +
      '.card-face .logo{width:86px;margin:0 auto 8px}' +
      '.card-face h1{margin:2px 0 10px;font-size:min(var(--title),22pt)}' +
      /* Specials card: compact titles so dishes dominate the board */
      '.card-face.specials-face h1{font-size:14pt;letter-spacing:.14em;margin:2px 0 6px}' +
      '.specials-course{font-family:var(--serif);font-weight:700;font-size:10.5pt;letter-spacing:.1em;text-transform:uppercase;text-align:center;text-decoration:underline;text-underline-offset:2px;margin:8px 0 4px;line-height:1.2}' +
      '.specials-course:first-of-type{margin-top:4px}' +
      '.specials-course-left{text-align:left;text-decoration:none;font-size:10pt;letter-spacing:.08em;margin:6px 0 3px}' +
      /* Main/Sunday: Specials frilly box under each course — full width like the course above */
      '.specials-beside{width:100%;max-width:100%;align-self:stretch;box-sizing:border-box}' +
      '.specials-beside > .scallop,.specials-beside .scallop{' +
        'width:100%!important;max-width:100%;box-sizing:border-box;display:block}' +
      /* Title centred in the box; pad matches unframed dish gutters so prices share a line */
      '.specials-beside .specials-beside-title,.specials-beside .sec-title.specials-beside-title{' +
        'font-size:11pt!important;letter-spacing:.1em;margin:0 0 4px;text-align:center!important;line-height:1.2}' +
      '.specials-beside .sec-note{text-align:center!important;margin:0 0 6px;font-size:9.5pt}' +
      '.specials-beside .scallop-pad{padding-left:2px;padding-right:2px}' +
      '.tracker{display:flex;justify-content:space-between;align-items:baseline;font-size:7.5pt;letter-spacing:.02em;text-transform:none;color:#8a8278;margin:0 0 6px;font-weight:400;flex:0 0 auto}' +
      '.tracker .week{text-transform:none;letter-spacing:.02em}' +
      '.tracker .roman{font-family:var(--sans)!important;font-size:4pt!important;font-weight:400!important;letter-spacing:.02em;color:#c4bcb2!important;text-transform:none;opacity:.7;line-height:1}' +
      '.tracker-roman-only{justify-content:flex-end;margin-bottom:0}' +
      '.sec-plain{margin:0 0 10px}' +
      '.scallop .sec-title,.sec-plain .sec-title{text-align:left}' +
      '.top-band{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:10px;align-items:start;margin:0 0 10px;overflow:hidden}' +
      '.top-band-logo{grid-template-columns:1fr 190px;min-height:0}' +
      '.top-left{min-width:0;overflow:hidden;align-self:start}' +
      '.top-left .sec-title{text-align:left;margin-bottom:calc(var(--sec-gap) - 2px)}' +
      '.top-left .scallop{margin:0 0 6px;max-width:100%;height:auto;align-self:start}' +
      '.top-left .sec-plain{margin:0}' +
      '.top-left .dish{margin-bottom:calc(max(var(--dish-gap-min),var(--dish-gap)) + 2px)}' +
      '.top-right{display:flex;align-items:flex-start;justify-content:flex-end;padding-top:0}' +
      '.logo-tr{width:180px!important;height:auto;display:block;margin-left:auto;max-width:100%}' +
      '.logo{display:block;width:54px;margin:0 auto 4px}' +
      '.foot-logo{text-align:center;margin:10px 0 4px}' +
      '.foot-logo img{width:96px;height:auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:17px;letter-spacing:.06em;text-align:center;text-transform:uppercase;margin:2px 0 8px}' +
      '.sec{margin:0 0 var(--sec-gap)}' +
      /* Titles clearly larger than dishes; gap tracks density ladder so fit can shrink */
      '.sec-title{font-family:var(--serif)!important;font-weight:700;font-size:min(var(--title),var(--title-max))!important;letter-spacing:.12em;text-transform:uppercase;margin:0 0 var(--sec-gap);text-align:center;line-height:1.15}' +
      '.sec-title.soft-left{text-align:left;letter-spacing:.12em;margin:0 0 var(--sec-gap)}' +
      '.sec-title-spacer{visibility:hidden;margin:0 0 var(--sec-gap)}' +
      '.scallop .sec-title{text-align:left;font-size:min(calc(var(--title) - 1pt),var(--title-max));letter-spacing:.11em;margin-bottom:calc(var(--sec-gap) - 2px)}' +
      '.sec-title.soft{font-size:min(calc(var(--title) - 2pt),var(--title-max));letter-spacing:.1em}' +
      '.sec-title.under{text-align:center;text-decoration:underline;text-underline-offset:3px;margin-top:var(--sec-gap)}' +
      '.classics-block{margin-top:4px}' +
      '.scallop{margin:0 0 8px;background:#fff;position:relative;height:fit-content;' +
        'border-style:solid;border-color:transparent;border-width:12px;' +
        'border-image-slice:48 fill;border-image-repeat:stretch;border-image-width:12px;' +
        'overflow:hidden;max-width:100%}' +
      '.scallop-wide{border-image-source:url("' + asset('frame-wide.png') + '");border-width:12px;border-image-width:12px;border-image-slice:42 fill}' +
      '.scallop-box{border-image-source:url("' + asset('frame-box.png') + '");border-width:12px;border-image-width:12px;border-image-slice:48 fill}' +
      '.scallop-pad{padding:4px 10px 3px;overflow:hidden;min-width:0}' +
      '.scallop-box .scallop-pad{padding:4px 10px 4px}' +
      '.dish{margin:0 0 max(var(--dish-gap-min),var(--dish-gap));min-width:0;max-width:100%}' +
      /* Leaders only between name and price on one row — never under the description */
      /* align-items:center + 1em mark keeps every dish-line the same height (no lunch-gap stretch) */
      '.dish-line{display:flex;flex-wrap:nowrap;align-items:center;min-width:0;max-width:100%;gap:0;line-height:1.28}' +
      '.dish-name{font-family:var(--sans);font-weight:700;font-size:clamp(var(--name-min),var(--name),var(--name-max));line-height:1.28;min-width:0;flex:0 1 auto;overflow-wrap:anywhere}' +
      '.dish-leader{display:block;flex:1 1 auto;border-bottom:1px dotted #b0a89c;margin:0 6px;min-width:10px;height:0;align-self:center;transform:translateY(0.35em)}' +
      '.dish-line .lc{width:1em;height:1em;margin:0 0.2em 0 0.08em;flex:0 0 auto;align-self:center;font-size:var(--name);object-fit:contain;display:block}' +
      '.price{font-family:var(--sans);font-weight:500;font-size:clamp(var(--name-min),var(--name),var(--name-max));line-height:1.28;white-space:nowrap;flex:0 0 auto;padding-left:0}' +
      '.desc{font-family:var(--sans);font-weight:400;font-size:clamp(var(--desc-min),var(--desc),var(--desc-max));color:#3a342c;margin-top:2px;line-height:1.4;max-width:100%;overflow-wrap:anywhere}' +
      '.dish .desc,.promo .desc,.sandwich-promo .desc{font-weight:400}' +
      '.tags{color:var(--green);font-style:italic;font-weight:400;font-size:clamp(var(--desc-min),var(--desc),var(--desc-max))}' +
      '.dish-c{text-align:center;margin:0 0 max(var(--dish-gap-min),var(--dish-gap))}' +
      '.dish-c .dish-name{font-family:var(--serif);font-size:clamp(var(--name-min),var(--name),var(--name-max));letter-spacing:.02em}' +
      '.dish-c .desc,.dish-c .tags{text-align:center}' +
      '.dish-c .dish-line{display:block}' +
      '.dish-c .dish-leader{display:none}' +
      '.lc{width:1em;height:1em;font-size:var(--name);vertical-align:-0.15em;margin-left:0;margin-right:0;display:inline-block;object-fit:contain;flex:0 0 auto}' +
      '.allergy-lc{display:inline-flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;font-style:italic;max-width:92%;margin-left:auto;margin-right:auto}' +
      '.allergy-lc .lc{width:1.15em;height:1.15em;font-size:11pt;margin:0;vertical-align:middle;flex:0 0 auto}' +
      '.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0 10px;align-items:start}' +
      '.cols-classics{grid-template-columns:1fr 1fr}' +
      /* Columns start level and stretch to the same foot. Feature panels stay
         CONTENT-SIZED (little promotions) — never grow into a tall empty frame.
         Food (Sides / sandwich sell) balances the short column instead. */
      '.cols-balanced{align-items:stretch}' +
      '.cols-balanced .col-events,.cols-balanced .col-food{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column}' +
      '.cols-balanced .col-body{flex:0 0 auto;min-width:0}' +
      '.cols-balanced .col-logo{flex:0 0 auto;display:flex;justify-content:flex-end;margin:0 0 8px}' +
      '.cols-balanced .col-logo .logo-tr{width:160px!important;margin:0}' +
      '.cols-with-logo{align-items:stretch;margin-top:0}' +
      '.cols-balanced .col-feature,.cols-balanced .col-fill{margin-top:auto;flex:0 0 auto;min-width:0;width:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:10px}' +
      '.cols-balanced .col-feature > .scallop,.cols-balanced .col-fill > .scallop{width:100%;flex:0 0 auto}' +
      '.cols-balanced .col-feature > .scallop .scallop-pad,.cols-balanced .col-fill > .scallop .scallop-pad{flex:0 0 auto}' +
      '.sec-note{font-family:var(--sans);font-size:var(--desc);color:#3a342c;line-height:1.35;margin:0 0 8px;font-weight:400}' +
      '.scallop .sec-note{margin-top:0}' +
      '.share-cols{margin:0 0 4px;gap:22px}' +
      '.share-cols .col{min-width:0}' +
      '.col-dishes,.col-promo,.col-sides,.col-sides-b,.col-events,.col-food{min-width:0;max-width:100%;overflow:hidden}' +
      '.col-events > :first-child,.col-food > :first-child{margin-top:0}' +
      '.col-events .sec-title,.col-food .sec-title,.col-dishes .sec-title,.col-promo .sec-title{text-align:left;margin-top:10px}' +
      '.col-events .sec-title:first-child,.col-food .sec-title:first-child,.col-dishes .sec-title:first-child,.col-promo .sec-title:first-child{margin-top:0}' +
      '.col-events .scallop,.col-food .scallop,.col-promo .scallop{max-width:100%;width:100%;margin-top:0}' +
      '.col-events .scallop + .scallop,.col-food .scallop + .scallop{margin-top:10px}' +
      '.col-events .promo p,.col-promo .promo p,.col-promo .promo .desc{font-size:10.5pt;line-height:1.4;margin:0 0 6px;font-weight:400}' +
      '.promo-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 4px}' +
      '.promo-head.pair-head{margin:0 0 6px}' +
      '.promo-head.pair-head .sec-title{margin:0}' +
      '.sandwich-aligned{margin:10px 0 0}' +
      '.sandwich-aligned .scallop{margin-top:0}' +
      '.bottom-cols{margin-top:16px;margin-bottom:4px;align-items:stretch}' +
      '.bottom-cols.cols-balanced .col-sides,.bottom-cols.cols-balanced .col-promo{display:flex;flex-direction:column;min-height:0}' +
      '.bottom-cols.cols-balanced .col-body{flex:1 1 auto}' +
      '.bottom-cols-balanced{grid-template-columns:1fr 1fr;gap:20px}' +
      /* Full-width food + two feature panels underneath (no orphan column hole) */
      '.foot-promos{margin:10px 0 6px;align-items:stretch}' +
      '.foot-promos-one{margin:10px 0 6px}' +
      '.foot-promos .col{min-width:0}' +
      '.foot-promos .scallop{width:100%}' +
      '.bottom-cols .sec-title{text-align:left}' +
      '.allergy{font-family:var(--allergy);color:var(--green);font-style:italic;font-size:9.5pt;text-align:center;line-height:1.35;margin-top:3mm;padding-top:2mm;flex:0 0 auto;flex-shrink:0}' +
      '.promo{text-align:left}' +
      '.promo-title{font-family:var(--serif);font-weight:700;font-size:var(--promo);letter-spacing:.1em;text-transform:uppercase;margin:10px 0 4px}' +
      '.promo .promo-title:first-child{margin-top:0}' +
      '.promo p{font-size:10.5pt;font-weight:400;margin:0 0 10px;line-height:1.45}' +
      '.promo p:last-child{margin-bottom:0}' +
      '.col-feature .scallop + .scallop{margin-top:14px}' +
      '.promo-date{font-family:var(--sans);font-weight:500;font-size:9.5pt;letter-spacing:.02em;text-transform:none;color:#5a534a}' +
      '.sandwich-promo .note-line{font-weight:500}' +
      '.sandwich-promo .desc{font-weight:400;color:#3a342c}' +
      '.note-line{font-size:10.5pt;font-weight:500;margin:4px 0}' +
      '.days{position:absolute;top:18mm;left:6mm;font-family:var(--serif);font-size:9px;font-weight:700;line-height:1.35;letter-spacing:.05em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:18px;text-align:center;line-height:1.15;margin:2px 0 8px}' +
      '.lc-price{font-family:var(--serif);text-align:center;font-size:12px;line-height:1.45}' +
      '.lb-foot{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:13px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:16px;margin:5px 0}' +
      /* Density ladder — capped to TYPE_RANGE (adult pub, not kids’-menu giant type).
         airy = max; dense = min. Dish gap never drops below --dish-gap-min (8px). */
      '.fill-airy{--dish-gap:14px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:22pt;--promo:11.5pt}' +
      '.fill-roomy{--dish-gap:12px;--sec-gap:14px;--name:11.35pt;--desc:10pt;--title:20pt;--promo:11.35pt}' +
      '.fill-normal{--dish-gap:10px;--sec-gap:12px;--name:11.2pt;--desc:10pt;--title:18pt;--promo:11.2pt}' +
      '.fill-tight{--dish-gap:9px;--sec-gap:10px;--name:11.1pt;--desc:10pt;--title:17pt;--promo:11.1pt}' +
      '.fill-compact{--dish-gap:8px;--sec-gap:9px;--name:11.05pt;--desc:10pt;--title:16.5pt;--promo:11.05pt}' +
      '.fill-dense{--dish-gap:8px;--sec-gap:8px;--name:11pt;--desc:10pt;--title:16pt;--promo:11pt}' +
      '.fill-compact .scallop,.fill-dense .scallop{border-width:10px;border-image-width:10px;margin-bottom:5px}' +
      '.fill-dense .scallop{border-width:9px;border-image-width:9px}' +
      '.fill-dense .scallop-pad{padding:2px 8px 1px}' +
      '.fill-dense .sec-title,.fill-compact .sec-title{letter-spacing:.08em}' +
      '.fill-dense .allergy{margin-top:2mm;padding-top:1mm;font-size:9pt}' +
      /* 2×A5 on A4 landscape — cut down the middle */
      '.cut-sheet{width:297mm;height:210mm;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;position:relative;overflow:hidden}' +
      '.cut-sheet::after{content:"";position:absolute;top:4mm;bottom:4mm;left:50%;width:0;border-left:1px dashed #c5bdb0;pointer-events:none}' +
      '.a5-face{width:148.5mm;height:210mm;padding:6mm 7mm 7mm;overflow:hidden;display:flex;flex-direction:column}' +
      '.a5-face .page-body{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-start}' +
      '.a5-face .page-spacer{display:none}' +
      '.a5-face .allergy{flex:0 0 auto;flex-shrink:0}' +
      /* A5 density — same name/desc floors as A4; titles slightly smaller on the half-sheet */
      '.a5-face.fill-airy{--dish-gap:12px;--sec-gap:14px;--name:11.5pt;--desc:10pt;--title:18pt;--promo:11.5pt}' +
      '.a5-face.fill-roomy{--dish-gap:10px;--sec-gap:12px;--name:11.35pt;--desc:10pt;--title:17pt;--promo:11.35pt}' +
      '.a5-face.fill-normal{--dish-gap:9px;--sec-gap:10px;--name:11.2pt;--desc:10pt;--title:16pt;--promo:11.2pt}' +
      '.a5-face.fill-tight{--dish-gap:8px;--sec-gap:9px;--name:11.1pt;--desc:10pt;--title:16pt;--promo:11.1pt}' +
      '.a5-face.fill-compact,.a5-face.fill-dense{--dish-gap:8px;--sec-gap:8px;--name:11pt;--desc:10pt;--title:16pt;--promo:11pt}' +
      '.a5-face .logo-tr{width:110px!important}' +
      '.a5-face .party-logo{width:72px}' +
      '.a5-face .party-title{font-size:min(var(--title),20pt)}' +
      '.a5-face .top-band,.a5-face .top-band-logo{grid-template-columns:1fr 120px;gap:8px;min-height:0}' +
      '.a5-face .tracker{font-size:6pt;margin-bottom:1px}' +
      '.a5-face .tracker .roman{font-size:3.5pt!important}' +
      '.a5-face .allergy{font-size:8.5pt}' +
      '.a5-face .cols{gap:10px}' +
      '.a5-face .scallop{border-width:10px;border-image-width:10px}' +
      '.a5-face.party-page{text-align:center}' +
      '.a5-face .party-dish .desc{text-align:center}' +
      '.a5-face .party-promos{text-align:center;margin-top:auto;padding-top:6px}' +
      '@media print{body{background:#fff}.toolbar{display:none}' +
      '.page,.sheet,.cut-sheet{margin:0;box-shadow:none}' +
      (guillotine
        ? '@page{size:A4 landscape;margin:0}.cut-sheet{page-break-after:always}.cut-sheet:last-child{page-break-after:auto}'
        : (landscape ? '@page{size:A4 landscape;margin:0}' : '@page{size:A4 portrait;margin:0}') +
          '.page{page-break-after:always}.page:last-child{page-break-after:auto}') +
      '}'
    );
  }

  function wrapGuillotine(pagesHtml) {
    // Each A4 page becomes two identical A5 faces on landscape A4 for cutting.
    // Keep party-page / theme classes so centred type and occasion styles survive.
    var parts = String(pagesHtml || '').split(/(?=<div class="page\b)/).filter(function (s) {
      return /class="page\b/.test(s);
    });
    if (!parts.length) return pagesHtml;
    return parts.map(function (pageHtml) {
      var openEnd = pageHtml.indexOf('>');
      var close = pageHtml.lastIndexOf('</div>');
      if (openEnd < 0 || close < 0) return pageHtml;
      var openTag = pageHtml.slice(0, openEnd + 1);
      var classMatch = openTag.match(/class="([^"]*)"/);
      var keep = '';
      if (classMatch) {
        keep = classMatch[1]
          .split(/\s+/)
          .filter(function (c) {
            return c && c !== 'page' && c !== 'fill-page' && !/^fill-/.test(c);
          })
          .join(' ');
      }
      var content = pageHtml.slice(openEnd + 1, close);
      var face =
        '<div class="a5-face fill-page fill-airy' + (keep ? ' ' + keep : '') + '">' +
        content +
        '</div>';
      return '<div class="cut-sheet">' + face + face + '</div>';
    }).join('');
  }

  function partyBlurbBlock(text, kind, where) {
    text = String(text || '').trim();
    if (!text) return '';
    kind = String(kind || 'paragraph').toLowerCase();
    var body = esc(text).replace(/\n/g, '<br>');
    var place = where || 'top';
    if (kind === 'title') {
      return '<h1 class="party-title party-blurb-' + place + '">' + body + '</h1>';
    }
    if (kind === 'heading') {
      return '<div class="party-blurb-heading party-blurb-' + place + '">' + body + '</div>';
    }
    if (kind === 'text') {
      return '<div class="party-blurb-text party-blurb-' + place + '">' + body + '</div>';
    }
    return '<div class="party-notes party-blurb-para party-blurb-' + place + '">' + body + '</div>';
  }

  function partyOccasion(title, meta) {
    var blob = [title, meta && meta.subtitle, meta && meta.notes, meta && meta.coursePrices]
      .filter(Boolean).join(' ').toLowerCase();
    if (/christmas|xmas|festive|yule|advent/.test(blob)) return 'christmas';
    if (/valentine|romantic/.test(blob)) return 'valentine';
    if (/new\s*year|hogmanay/.test(blob)) return 'newyear';
    if (/easter/.test(blob)) return 'easter';
    if (/mother|father|wedding|anniversary|celebration|summer/.test(blob)) return 'celebration';
    return 'party';
  }

  function buildParty(menu, dishes, plan, ver) {
    var meta = (plan && plan.meta) || {};
    var title = meta.title || menu.name || 'Party Menu';
    var prices = meta.coursePrices || '';
    var notes = meta.notes || '';
    var promos = (plan && plan.promos) || [];
    var sections = groupBySection(dishes);
    var order = ['Starters', 'Mains', 'Desserts'];
    var byName = {};
    sections.forEach(function (s) { byName[s.name.toLowerCase()] = s; });

    var occasion = partyOccasion(title, meta);
    var html = '<div class="page party-page party-theme-' + occasion + ' fill-page fill-airy">';
    html += trackerBar(ver, { hideDate: true });
    html += '<div class="page-body">';
    html += '<img class="logo party-logo" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells">';
    html += partyBlurbBlock(title, meta.topKind || 'title', 'top');
    if (prices) html += '<div class="party-prices">' + esc(prices) + '</div>';

    order.forEach(function (want) {
      var s = byName[want.toLowerCase()];
      if (!s) return;
      html += '<section class="party-sec">';
      html += '<div class="sec-title">' + esc(s.name) + '</div>';
      s.dishes.forEach(function (d) {
        html += '<div class="dish dish-c party-dish">';
        html += '<div class="dish-name">' + esc(d.name);
        if (d.tags) html += ' <em class="tags">' + esc(d.tags) + '</em>';
        html += '</div>';
        if (d.description) {
          html += '<div class="desc">' + esc(d.description).replace(/\n/g, '<br>') + '</div>';
        }
        html += '</div>';
      });
      html += '</section>';
    });
    sections.forEach(function (s) {
      if (order.indexOf(s.name) !== -1) return;
      if (/starter|main|dessert/i.test(s.name)) return;
      html += '<section class="party-sec"><div class="sec-title">' + esc(s.name) + '</div>';
      s.dishes.forEach(function (d) {
        html += dishCentered(d, { hidePrice: true });
      });
      html += '</section>';
    });

    if (notes) html += partyBlurbBlock(notes, meta.bottomKind || 'paragraph', 'bottom');
    if (promos.length) {
      html += '<div class="party-promos">';
      promos.forEach(function (p) {
        if (!p || !p.title) return;
        html += '<div class="party-promo">';
        html += '<div class="promo-title">' + esc(p.title) + '</div>';
        if (p.date) {
          var when = root.EBMenus && root.EBMenus.formatPromoDate
            ? root.EBMenus.formatPromoDate(p.date)
            : p.date;
          if (when) html += '<div class="promo-date">' + esc(when) + '</div>';
        }
        if (p.body) html += '<p class="desc">' + esc(p.body) + '</p>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>'; // page-body
    html += allergy();
    html += '</div>';
    return html;
  }

  function build(menu, dishes, plan) {
    plan = plan || {};
    var ver = nextPrintVersion(menu.id);
    if (menu.id === 'party' || menu.kind === 'party') ver.hideDate = true;
    var landscape = menu.kind === 'card';
    var guillotine = !!plan.guillotine && !landscape;
    var meta = plan.meta || {};
    var defaultPaper = 'a4';
    if (landscape) defaultPaper = 'a4'; // card sheets are landscape two-up already
    else if (menu.kind === 'party' && meta.paper === 'a5') defaultPaper = 'a5';
    else if (plan.defaultPaper === 'a5') defaultPaper = 'a5';
    var bodyClass = 'paper-' + defaultPaper;
    var layout = null;
    if (menu.kind === 'long') {
      layout = planFluidLayout(menu, dishes, {
        promos: plan.promos || [],
        sectionLayout: plan.sectionLayout
      });
      plan.layout = layout;
      plan.fit = layout.fit;
      plan.text = layout.summary;
      if (!plan.promos) plan.promos = layout.promos || [];
      if (!plan.sectionLayout && root.EBMenus && root.EBMenus.defaultSectionLayout) {
        plan.sectionLayout = root.EBMenus.defaultSectionLayout();
      }
    }
    var body;
    if (landscape) {
      body = buildCard(menu, dishes, plan, ver);
    } else if (menu.kind === 'party') {
      body = buildParty(menu, dishes, plan, ver);
    } else {
      body = buildLong(menu, dishes, plan, ver);
    }

    var a4Stack = landscape ? body : '<div class="sheet-stack mode-panel mode-a4">' + body + '</div>';
    var a5Stack = '';
    if (!landscape) {
      a5Stack = '<div class="sheet-stack mode-panel mode-a5">' + wrapGuillotine(body) + '</div>';
    }

    var dateHint = ver.hideDate ? ('print ' + ver.roman) : (ver.week + ' · print ' + ver.roman);
    var fillerHint = layout && layout.fillers && layout.fillers.length
      ? ' Auto: ' + layout.fillers.join(' · ') + '.'
      : (menu.kind === 'party' ? ' Standardised party layout.' : '');

    var html = (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(printSheetLabel(menu.name, ver)) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">' +
      '<style>' + css({ landscape: landscape, guillotine: guillotine || defaultPaper === 'a5' }) + partyCss() +
      'body.paper-a5 .mode-a4{display:none}body.paper-a5 .mode-a5{display:block}' +
      'body.paper-a4 .mode-a5{display:none}body.paper-a4 .mode-a4{display:block}' +
      '</style></head><body class="' + bodyClass + '">' +
      '<div class="toolbar">' +
        '<button type="button" onclick="window.print()">Print / save as PDF</button>' +
        (landscape ? '<span class="hint">Card menu — two identical copies on landscape A4 for the guillotine.</span>' :
          '<label class="paper-opt"><input type="radio" name="paper" value="a4"' +
            (defaultPaper === 'a4' ? ' checked' : '') +
            ' onchange="document.body.className=\'paper-a4\'"> A4 (fill page)</label>' +
          '<label class="paper-opt"><input type="radio" name="paper" value="a5"' +
            (defaultPaper === 'a5' ? ' checked' : '') +
            ' onchange="document.body.className=\'paper-a5\'"> 2×A5 on A4 (guillotine)</label>') +
        '<span class="hint">' + esc(dateHint) +
        ' — fill top to bottom; readable type only; allergy line kept clear.' +
        esc(fillerHint) + '</span>' +
      '</div>' +
      a4Stack + a5Stack +
      '<script>(function(){' +
        'var STEPS=["fill-airy","fill-roomy","fill-normal","fill-tight","fill-compact","fill-dense"];' +
        'function strip(el){STEPS.forEach(function(c){el.classList.remove(c);});}' +
        // page-body clips with overflow:hidden, so page.scrollHeight alone never sees overflow —
        // measure the body (and allergy sibling) so density steps actually fire.
        'function overflows(page){' +
          'if(page.scrollHeight>page.clientHeight+2)return true;' +
          'var body=page.querySelector(".page-body");' +
          'if(body&&body.scrollHeight>body.clientHeight+2)return true;' +
          'var mid=page.querySelector(".card-mid");' +
          'if(mid&&mid.scrollHeight>mid.clientHeight+2)return true;' +
          'return false;' +
        '}' +
        // GOLDEN RULE: opposite columns must start AND finish at the same point.
        // Measure each column’s content, prune surplus feature scallops from the
        // taller side, then equalise remaining feature feet.
        'function contentHeight(col){' +
          'var h=0;[].forEach.call(col.children,function(ch){' +
            'if(ch.style&&ch.style.display==="none")return;' +
            'h+=ch.offsetHeight;' +
          '});return h;' +
        '}' +
        'function removableBoxes(col){' +
          'return [].slice.call(col.querySelectorAll(".col-feature .scallop, .col-promo .scallop, :scope > .scallop"));' +
        '}' +
        'function balanceOppositeColumns(){' +
          'document.querySelectorAll(".cols-balanced,.bottom-cols").forEach(function(cols){' +
            'var pair=[].slice.call(cols.children).filter(function(c){return c.classList&&c.classList.contains("col");});' +
            'if(pair.length<2)return;' +
            'var left=pair[0],right=pair[1];' +
            'var guard=0;' +
            'while(guard++<10){' +
              'var lh=contentHeight(left),rh=contentHeight(right);' +
              'if(Math.abs(lh-rh)<28)break;' +
              'var tall=lh>rh?left:right;' +
              'var short=lh>rh?right:left;' +
              'var boxes=removableBoxes(tall);' +
              'if(!boxes.length)break;' +
              // Drop the last feature box on the taller side until heights match
              'var last=boxes[boxes.length-1];' +
              'if(contentHeight(tall)-last.offsetHeight+12<contentHeight(short)-8){' +
                // Removing would undershoot badly — keep and stop
                'break;' +
              '}' +
              'last.parentNode.removeChild(last);' +
            '}' +
            // Feature panels stay content-sized — do not stretch them to match
            // the taller foot (that made a big empty quiz frame).
            'var feats=[].slice.call(cols.querySelectorAll(":scope > .col > .col-feature"));' +
            'feats.forEach(function(f){f.style.minHeight="";});' +
          '});}' +
        'function balanceFeatures(){balanceOppositeColumns();}' +
        // SHARED TYPE SCALE: page 1 and page 2 must use the SAME title/name/desc size.
        // Fit every A4 page as one group — pick the largest step that still fits all.
        // Clear prior stretch/minHeights first — leftover equalisation from a previous
        // fitPages pass must not force an artificially tiny shared density.
        'function clearFitArtifacts(page){' +
          'clearSpread(page);' +
          '[].forEach.call(page.querySelectorAll(".col-feature"),function(f){f.style.minHeight="";});' +
        '}' +
        'function fitGroup(group){' +
          'if(!group.length)return;' +
          'group.forEach(clearFitArtifacts);' +
          'if(group.length===1){' +
            'var page=group[0];' +
            'for(var j=0;j<STEPS.length;j++){strip(page);page.classList.add("fill-page");page.classList.add(STEPS[j]);' +
            'if(!overflows(page))break;}' +
            'return;' +
          '}' +
          'var chosen=STEPS[STEPS.length-1];' +
          'for(var k=0;k<STEPS.length;k++){' +
            'group.forEach(function(pg){strip(pg);pg.classList.add("fill-page");pg.classList.add(STEPS[k]);});' +
            'if(!group.some(overflows)){chosen=STEPS[k];break;}' +
          '}' +
          'group.forEach(function(pg){strip(pg);pg.classList.add("fill-page");pg.classList.add(chosen);});' +
        '}' +
        // Readable type beats footer logo: if shared density is tight/compact/dense,
        // hide page foot logos and refit so mains/desserts can enlarge.
        'function preferReadableType(group){' +
          'if(!group.length)return;' +
          'fitGroup(group);' +
          'function tooSmall(pg){' +
            'return pg.classList.contains("fill-tight")||pg.classList.contains("fill-compact")||pg.classList.contains("fill-dense");' +
          '}' +
          'if(!group.some(tooSmall))return;' +
          'var hidden=0;' +
          'group.forEach(function(pg){' +
            '[].forEach.call(pg.querySelectorAll(".foot-logo"),function(el){' +
              'el.style.display="none";hidden+=1;' +
            '});' +
          '});' +
          'if(!hidden)return;' +
          'fitGroup(group);' +
        '}' +
        // Feature panels must not jam in at min type — drop foot promo pairs when
        // the page is already dense/compact or still overflows with them.
        'function dropJammedFootPromos(page){' +
          'var foots=page.querySelectorAll(".foot-promos,.foot-promos-one");' +
          'if(!foots.length)return false;' +
          'var dense=page.classList.contains("fill-dense")||page.classList.contains("fill-compact")||page.classList.contains("fill-tight");' +
          'if(!dense&&!overflows(page))return false;' +
          '[].forEach.call(foots,function(el){if(el.parentNode)el.parentNode.removeChild(el);});' +
          'return true;' +
        '}' +
        'function dropJammedPromos(group){' +
          'var changed=false;' +
          'group.forEach(function(pg){if(dropJammedFootPromos(pg))changed=true;});' +
          'if(changed)fitGroup(group);' +
        '}' +
        // After shared type is locked, grow gaps / spread sections so leftover space
        // is not a blank bottom third — fill top→bottom evenly without changing type size.
        'function clearSpread(page){' +
          'var body=page.querySelector(".page-body");' +
          'if(!body)return;' +
          'body.classList.remove("spread-even");' +
          'body.style.gap="";' +
          'page.style.removeProperty("--dish-gap");' +
          'page.style.removeProperty("--sec-gap");' +
        '}' +
        'function growGaps(page){' +
          'var cs=getComputedStyle(page);' +
          'var dish=parseFloat(cs.getPropertyValue("--dish-gap"))||12;' +
          'var sec=parseFloat(cs.getPropertyValue("--sec-gap"))||16;' +
          'var baseDish=dish,baseSec=sec;' +
          'for(var i=0;i<14;i++){' +
            'dish+=1.25;sec+=1.75;' +
            'page.style.setProperty("--dish-gap",dish+"px");' +
            'page.style.setProperty("--sec-gap",sec+"px");' +
            'if(overflows(page)){' +
              'dish-=1.25;sec-=1.75;' +
              'if(dish<=baseDish+0.1){page.style.removeProperty("--dish-gap");page.style.removeProperty("--sec-gap");}' +
              'else{page.style.setProperty("--dish-gap",dish+"px");page.style.setProperty("--sec-gap",sec+"px");}' +
              'break;' +
            '}' +
          '}' +
        '}' +
        'function spreadPage(page){' +
          'clearSpread(page);' +
          'if(overflows(page))return;' +
          'growGaps(page);' +
          'var body=page.querySelector(".page-body");' +
          'if(!body)return;' +
          'var spare=body.clientHeight-body.scrollHeight;' +
          'if(spare<28)return;' +
          'body.classList.add("spread-even");' +
          'if(overflows(page)){body.classList.remove("spread-even");return;}' +
          'spare=body.clientHeight-body.scrollHeight;' +
          'if(spare>60)growGaps(page);' +
          'if(overflows(page)){' +
            'clearSpread(page);' +
            'growGaps(page);' +
          '}' +
        '}' +
        'function fitPages(){' +
          'var a4=[].slice.call(document.querySelectorAll(".page.fill-page"));' +
          'var a5=[].slice.call(document.querySelectorAll(".a5-face.fill-page"));' +
          'preferReadableType(a4);' +
          'preferReadableType(a5);' +
          'dropJammedPromos(a4);' +
          'dropJammedPromos(a5);' +
          '[].slice.call(document.querySelectorAll(".card-face.fill-page")).forEach(function(page){' +
            'clearFitArtifacts(page);' +
            'for(var j=0;j<STEPS.length;j++){strip(page);page.classList.add("fill-page");page.classList.add(STEPS[j]);' +
            'if(!overflows(page))break;}' +
          '});' +
          'balanceOppositeColumns();' +
          'a4.forEach(spreadPage);' +
          'a5.forEach(spreadPage);' +
        '}' +
        'function sync(){var a5=document.body.classList.contains("paper-a5");' +
        'var s=document.createElement("style");s.id="paperPrint";var old=document.getElementById("paperPrint");' +
        'if(old)old.remove();s.textContent=a5?"@media print{@page{size:A4 landscape;margin:0}}":"@media print{@page{size:A4 portrait;margin:0}}";' +
        'document.head.appendChild(s);setTimeout(fitPages,30);}' +
        'document.querySelectorAll("[name=paper]").forEach(function(r){r.addEventListener("change",sync);});' +
        'function boot(){fitPages();' +
          'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){fitPages();});}' +
        '}' +
        'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();' +
        'setTimeout(fitPages,80);setTimeout(fitPages,400);setTimeout(fitPages,1200);' +
        'window.addEventListener("beforeprint",fitPages);' +
        'var pb=document.querySelector(".toolbar button");' +
        'if(pb){pb.onclick=function(ev){ev.preventDefault();' +
          'function go(){fitPages();setTimeout(function(){window.print();},80);}' +
          'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go);}else go();' +
        '};}' +
      '})();<\/script>' +
      '</body></html>'
    );
    lastBuildMeta = {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      menuId: menu.id,
      menuName: menu.name,
      roman: ver.roman,
      n: ver.n,
      week: ver.week,
      weekKey: ver.weekKey,
      hideDate: !!ver.hideDate,
      generatedAt: Date.now(),
      html: html
    };
    return html;
  }

  var lastBuildMeta = null;
  var HISTORY_DB = 'eb-menu-prints';
  var HISTORY_STORE = 'prints';
  var HISTORY_LS_INDEX = 'eb-menu-print-history-v1';
  var HISTORY_LS_HTML = 'eb-menu-print-html-';
  var HISTORY_MAX = 60;
  /** Live Menu AI web app — also stores shared print history in Drive. */
  var HISTORY_CLOUD_DEFAULT =
    'https://script.google.com/macros/s/AKfycbyVjmwHDUL9jRtrskiiATFPgNCv2vPfcBiKjcaO0r_pcXulNS49u_qxbxYuPVc0sJGHgQ/exec';

  function historyCloudUrl() {
    try {
      if (root.EBMenuIngest && typeof root.EBMenuIngest.getCloudUrl === 'function') {
        return root.EBMenuIngest.getCloudUrl();
      }
      if (root.EBMenuIngest && typeof root.EBMenuIngest.getAiUrl === 'function') {
        var custom = String(root.EBMenuIngest.getAiUrl() || '').trim();
        if (custom) return custom;
      }
    } catch (e) {}
    return HISTORY_CLOUD_DEFAULT;
  }

  function historyCloudPost(body) {
    if (root.EBMenuIngest && typeof root.EBMenuIngest.cloudPost === 'function') {
      return root.EBMenuIngest.cloudPost(body);
    }
    var url = historyCloudUrl();
    if (!url || typeof fetch !== 'function') {
      return Promise.reject(new Error('no_cloud'));
    }
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.text().then(function (t) {
        var data;
        try { data = JSON.parse(t); } catch (e) {
          throw new Error('cloud_bad_json');
        }
        if (!data || !data.ok) {
          throw new Error((data && data.error) || 'cloud_fail');
        }
        return data;
      });
    });
  }

  function localSaveOnly(entry) {
    if (!idbAvailable()) {
      lsSavePrint(entry);
      return Promise.resolve(entry);
    }
    return openHistoryDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(HISTORY_STORE, 'readwrite');
        var store = tx.objectStore(HISTORY_STORE);
        store.put(entry);
        tx.oncomplete = function () {
          var tx2 = db.transaction(HISTORY_STORE, 'readwrite');
          var st2 = tx2.objectStore(HISTORY_STORE);
          var all = [];
          st2.openCursor(null, 'prev').onsuccess = function (ev) {
            var cursor = ev.target.result;
            if (!cursor) {
              if (all.length > HISTORY_MAX) {
                all.slice(HISTORY_MAX).forEach(function (row) { st2.delete(row.id); });
              }
              return;
            }
            all.push(cursor.value);
            cursor.continue();
          };
          tx2.oncomplete = function () { resolve(entry); };
          tx2.onerror = function () { resolve(entry); };
        };
        tx.onerror = function () {
          try { lsSavePrint(entry); } catch (e) {}
          reject(tx.error || new Error('idb_put'));
        };
      });
    }).catch(function () {
      lsSavePrint(entry);
      return entry;
    });
  }

  function localListOnly() {
    if (!idbAvailable()) {
      return Promise.resolve(lsListPrints());
    }
    return openHistoryDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(HISTORY_STORE, 'readonly');
        var store = tx.objectStore(HISTORY_STORE);
        var req = store.getAll ? store.getAll() : null;
        if (req) {
          req.onsuccess = function () {
            resolve(sortHistoryNewest((req.result || []).map(function (r) {
              return {
                id: r.id,
                menuId: r.menuId,
                menuName: r.menuName,
                roman: r.roman,
                n: r.n,
                week: r.week,
                weekKey: r.weekKey,
                hideDate: r.hideDate,
                generatedAt: r.generatedAt,
                dayKey: r.dayKey
              };
            })));
          };
          req.onerror = function () { resolve(lsListPrints()); };
          return;
        }
        var rows = [];
        store.openCursor(null, 'prev').onsuccess = function (ev) {
          var cursor = ev.target.result;
          if (!cursor) {
            resolve(sortHistoryNewest(rows));
            return;
          }
          var r = cursor.value;
          rows.push({
            id: r.id,
            menuId: r.menuId,
            menuName: r.menuName,
            roman: r.roman,
            n: r.n,
            week: r.week,
            weekKey: r.weekKey,
            hideDate: r.hideDate,
            generatedAt: r.generatedAt,
            dayKey: r.dayKey
          });
          cursor.continue();
        };
        tx.onerror = function () { resolve(lsListPrints()); };
      });
    }).catch(function () {
      return lsListPrints();
    });
  }

  function localGetOnly(id) {
    if (!idbAvailable()) {
      return Promise.resolve(lsGetPrint(id));
    }
    return openHistoryDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(HISTORY_STORE, 'readonly');
        var req = tx.objectStore(HISTORY_STORE).get(id);
        req.onsuccess = function () {
          resolve(req.result || lsGetPrint(id));
        };
        req.onerror = function () { resolve(lsGetPrint(id)); };
      });
    }).catch(function () {
      return lsGetPrint(id);
    });
  }

  function localDeleteOnly(id) {
    lsDeletePrint(id);
    if (!idbAvailable()) return Promise.resolve();
    return openHistoryDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(HISTORY_STORE, 'readwrite');
        tx.objectStore(HISTORY_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    }).catch(function () {});
  }

  /** Push device-only sheets up so the other phone/PC can see them once. */
  function migrateLocalToCloud(cloudIds) {
    var known = cloudIds || {};
    return localListOnly().then(function (rows) {
      var missing = (rows || []).filter(function (r) { return r && r.id && !known[r.id]; });
      if (!missing.length) return;
      // Upload oldest first so prune keeps newest; cap burst.
      missing.sort(function (a, b) {
        return (a.generatedAt || 0) - (b.generatedAt || 0);
      });
      var chain = Promise.resolve();
      missing.slice(-20).forEach(function (meta) {
        chain = chain.then(function () {
          return localGetOnly(meta.id).then(function (full) {
            if (!full || !full.html) return;
            return historyCloudPost({
              action: 'savePrintHistory',
              entry: full
            }).catch(function () {});
          });
        });
      });
      return chain;
    }).catch(function () {});
  }

  function getLastBuild() {
    return lastBuildMeta;
  }

  function dayKeyFromMs(ms) {
    var d = new Date(ms);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function dayLabelFromMs(ms) {
    var d = new Date(ms);
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function timeLabelFromMs(ms) {
    var d = new Date(ms);
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function sortHistoryNewest(list) {
    return (list || []).slice().sort(function (a, b) {
      return (b.generatedAt || 0) - (a.generatedAt || 0);
    });
  }

  function groupHistoryByDay(list) {
    var groups = [];
    var map = {};
    sortHistoryNewest(list).forEach(function (row) {
      var key = dayKeyFromMs(row.generatedAt || 0);
      if (!map[key]) {
        map[key] = { dayKey: key, label: dayLabelFromMs(row.generatedAt || 0), items: [] };
        groups.push(map[key]);
      }
      map[key].items.push(row);
    });
    return groups;
  }

  function idbAvailable() {
    return typeof indexedDB !== 'undefined';
  }

  function openHistoryDb() {
    return new Promise(function (resolve, reject) {
      if (!idbAvailable()) {
        reject(new Error('no_idb'));
        return;
      }
      var req = indexedDB.open(HISTORY_DB, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          var store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
          store.createIndex('generatedAt', 'generatedAt', { unique: false });
          store.createIndex('dayKey', 'dayKey', { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('idb_open')); };
    });
  }

  function pruneHistoryList(list) {
    var sorted = sortHistoryNewest(list);
    if (sorted.length <= HISTORY_MAX) return sorted;
    return sorted.slice(0, HISTORY_MAX);
  }

  function lsLoadIndex() {
    try {
      var raw = JSON.parse(localStorage.getItem(HISTORY_LS_INDEX) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function lsSaveIndex(list) {
    localStorage.setItem(HISTORY_LS_INDEX, JSON.stringify(list));
  }

  function lsSavePrint(entry) {
    var meta = {
      id: entry.id,
      menuId: entry.menuId,
      menuName: entry.menuName,
      roman: entry.roman,
      n: entry.n,
      week: entry.week,
      weekKey: entry.weekKey,
      hideDate: !!entry.hideDate,
      generatedAt: entry.generatedAt,
      dayKey: entry.dayKey || dayKeyFromMs(entry.generatedAt)
    };
    try {
      localStorage.setItem(HISTORY_LS_HTML + entry.id, entry.html || '');
    } catch (e) {
      // Quota — drop oldest html blobs then retry once
      var idx = pruneHistoryList(lsLoadIndex());
      while (idx.length > 10) {
        var drop = idx.pop();
        try { localStorage.removeItem(HISTORY_LS_HTML + drop.id); } catch (e2) {}
      }
      lsSaveIndex(idx);
      localStorage.setItem(HISTORY_LS_HTML + entry.id, entry.html || '');
    }
    var next = pruneHistoryList([meta].concat(lsLoadIndex().filter(function (r) { return r.id !== meta.id; })));
    // Remove orphaned html for pruned rows
    var keep = {};
    next.forEach(function (r) { keep[r.id] = true; });
    lsLoadIndex().forEach(function (r) {
      if (!keep[r.id]) {
        try { localStorage.removeItem(HISTORY_LS_HTML + r.id); } catch (e3) {}
      }
    });
    lsSaveIndex(next);
    return meta;
  }

  function lsListPrints() {
    return pruneHistoryList(lsLoadIndex());
  }

  function lsGetPrint(id) {
    var meta = null;
    lsLoadIndex().forEach(function (r) { if (r.id === id) meta = r; });
    if (!meta) return null;
    var html = '';
    try { html = localStorage.getItem(HISTORY_LS_HTML + id) || ''; } catch (e) {}
    return {
      id: meta.id,
      menuId: meta.menuId,
      menuName: meta.menuName,
      roman: meta.roman,
      n: meta.n,
      week: meta.week,
      weekKey: meta.weekKey,
      hideDate: meta.hideDate,
      generatedAt: meta.generatedAt,
      dayKey: meta.dayKey,
      html: html
    };
  }

  function lsDeletePrint(id) {
    lsSaveIndex(lsLoadIndex().filter(function (r) { return r.id !== id; }));
    try { localStorage.removeItem(HISTORY_LS_HTML + id); } catch (e) {}
  }

  function normalizeHistoryEntry(raw) {
    if (!raw || !raw.html) return null;
    var generatedAt = raw.generatedAt || Date.now();
    return {
      id: raw.id || ('p' + generatedAt.toString(36)),
      menuId: String(raw.menuId || 'main'),
      menuName: String(raw.menuName || raw.menuId || 'Menu'),
      roman: String(raw.roman || ''),
      n: raw.n || 0,
      week: String(raw.week || ''),
      weekKey: String(raw.weekKey || ''),
      hideDate: !!raw.hideDate,
      generatedAt: generatedAt,
      dayKey: raw.dayKey || dayKeyFromMs(generatedAt),
      html: String(raw.html)
    };
  }

  /**
   * Persist a generated sheet in shared cloud history (Drive via Menu AI Apps Script)
   * and cache a copy on this device for offline reopen.
   */
  function savePrintHistory(raw) {
    var entry = normalizeHistoryEntry(raw || lastBuildMeta);
    if (!entry) return Promise.resolve(null);
    return localSaveOnly(entry).then(function (saved) {
      return historyCloudPost({
        action: 'savePrintHistory',
        entry: saved
      }).then(function () {
        return saved;
      }).catch(function () {
        // Offline / script not redeployed — local cache still has it.
        return saved;
      });
    });
  }

  function listPrintHistory() {
    return historyCloudPost({ action: 'listPrintHistory' }).then(function (data) {
      var items = Array.isArray(data.items) ? data.items : [];
      var known = {};
      items.forEach(function (r) { if (r && r.id) known[r.id] = true; });
      // Fire-and-forget: upload any sheets that only exist on this device.
      migrateLocalToCloud(known);
      return sortHistoryNewest(items.map(function (r) {
        return {
          id: r.id,
          menuId: r.menuId,
          menuName: r.menuName,
          roman: r.roman,
          n: r.n,
          week: r.week,
          weekKey: r.weekKey,
          hideDate: r.hideDate,
          generatedAt: r.generatedAt,
          dayKey: r.dayKey,
          source: 'cloud'
        };
      }));
    }).catch(function () {
      return localListOnly();
    });
  }

  function getPrintHistory(id) {
    if (!id) return Promise.resolve(null);
    return historyCloudPost({
      action: 'getPrintHistory',
      id: id
    }).then(function (data) {
      var entry = data.entry || null;
      if (entry && entry.html) {
        // Refresh local cache so reopen still works offline later.
        localSaveOnly(normalizeHistoryEntry(entry)).catch(function () {});
      }
      return entry;
    }).catch(function () {
      return localGetOnly(id);
    });
  }

  function deletePrintHistory(id) {
    if (!id) return Promise.resolve();
    return localDeleteOnly(id).then(function () {
      return historyCloudPost({
        action: 'deletePrintHistory',
        id: id
      }).catch(function () {});
    });
  }

  function openPrintHtml(html) {
    if (!html) return false;
    var w = window.open('', '_blank');
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    return true;
  }

  function downloadPrintHtml(entry) {
    if (!entry || !entry.html) return false;
    var name = printFileName(entry.menuName || entry.menuId || 'menu', {
      roman: entry.roman,
      week: entry.week,
      hideDate: entry.hideDate
    }, 'html');
    var blob = new Blob([entry.html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      try { URL.revokeObjectURL(url); } catch (e) {}
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 500);
    return true;
  }

  function partyCss() {
    return (
      '.party-page{text-align:center;padding-top:8mm;position:relative}' +
      '.party-logo{width:76px;margin:0 auto 8px;display:block}' +
      '.party-title{font-family:var(--serif);font-size:24px;letter-spacing:.1em;margin:4px 0 6px;font-weight:700}' +
      '.party-prices{font-weight:700;font-size:14px;margin:0 0 14px;letter-spacing:.04em}' +
      '.party-sec{margin:0 0 12px}' +
      '.party-sec .sec-title{margin-bottom:10px}' +
      '.party-dish{margin:0 0 10px;padding:0 14mm}' +
      '.party-dish .desc{text-align:center;padding-right:0;font-style:normal;color:#444}' +
      '.party-notes{font-size:11px;color:#5a534a;margin:14px 12mm 6px;line-height:1.4}' +
      '.party-blurb-heading{font-family:var(--serif);font-size:13pt;font-weight:600;letter-spacing:.04em;line-height:1.35;color:#1e3d28;margin:12px 12mm 8px}' +
      '.party-blurb-para{font-size:12px;line-height:1.45}' +
      '.party-blurb-text{font-family:var(--sans);font-size:10.5pt;color:#3a342c;margin:10px 14mm 8px;line-height:1.4;font-weight:400}' +
      '.party-blurb-bottom.party-title{font-size:16px;margin-top:14px}' +
      '.party-blurb-bottom.party-blurb-heading{margin-top:16px;font-size:12.5pt}' +
      '.party-promos{margin:10px 10mm 4px;text-align:center}' +
      '.party-promo{margin:0 0 8px}' +
      '.party-promo .promo-title{font-size:var(--promo);margin:0 0 2px}' +
      '.party-promo .desc{font-size:var(--desc);margin:0;color:#3a342c}' +
      /* Light occasion flourishes — classy, not cartoon */
      '.party-theme-christmas{box-shadow:inset 0 0 0 1.5px #2f5d3a}' +
      '.party-theme-christmas .party-title,.party-theme-christmas .sec-title{color:#1e3d28}' +
      '.party-theme-christmas .party-prices{color:#6b2b2b}' +
      '.party-theme-christmas .allergy{color:#2f5d3a}' +
      '.party-theme-valentine{box-shadow:inset 0 0 0 1.5px #a85c6a}' +
      '.party-theme-valentine .party-title,.party-theme-valentine .sec-title{color:#6e2c3a}' +
      '.party-theme-valentine .party-prices{color:#8a4050}' +
      '.party-theme-valentine .allergy{color:#8a4050}' +
      '.party-theme-newyear{box-shadow:inset 0 0 0 1.5px #5a534a}' +
      '.party-theme-newyear .party-title{letter-spacing:.18em}' +
      '.party-theme-easter{box-shadow:inset 0 0 0 1.5px #6a7d4e}' +
      '.party-theme-celebration .party-title{letter-spacing:.14em}' +
      '.party-theme-party .party-title{letter-spacing:.12em}'
    );
  }

  root.EBMenuPrint = {
    build: build,
    planFluidLayout: planFluidLayout,
    typeRange: TYPE_RANGE,
    sandwichesBlock: sandwichesBlock,
    partyOccasion: partyOccasion,
    orderDishesForPrint: orderDishesForPrint,
    toRoman: toRoman,
    weekLabel: weekLabel,
    sundayLabel: sundayLabel,
    printSheetLabel: printSheetLabel,
    printFileName: printFileName,
    weekKey: weekKey,
    nextPrintVersion: nextPrintVersion,
    wrapGuillotine: wrapGuillotine,
    getLastBuild: getLastBuild,
    savePrintHistory: savePrintHistory,
    listPrintHistory: listPrintHistory,
    getPrintHistory: getPrintHistory,
    deletePrintHistory: deletePrintHistory,
    groupHistoryByDay: groupHistoryByDay,
    dayLabelFromMs: dayLabelFromMs,
    timeLabelFromMs: timeLabelFromMs,
    openPrintHtml: openPrintHtml,
    downloadPrintHtml: downloadPrintHtml,
    historyCloudUrl: historyCloudUrl,
    measureOppositeColumns: measureOppositeColumns,
    planPromoFill: planPromoFill
  };
})(typeof window !== 'undefined' ? window : global);
