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
        '<span>' + esc(ver.week) + '</span>' +
        '<span class="roman">' + esc(ver.roman) + '</span>' +
      '</div>'
    );
  }

  function lunchMark() {
    return (
      '<svg class="lc" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path fill="' + GREEN + '" d="M7.2 4.2h1.4v6.2H7.2zm2.6 0h1.4v6.2h-1.4zm2.6 0h1.4v6.2h-1.4zM8.4 11.2h5.2c.4 1.2-.2 2.4-1.4 2.9V20H9.8v-5.9c-1-.5-1.6-1.6-1.4-2.9z" transform="rotate(-32 12 12)"/>' +
        '<path fill="' + GREEN + '" d="M11 3.5l1.1 8.4 1.5-.2L12.6 3.5zM10.4 12h3l.4 1.3c.2.7-.2 1.4-.9 1.6V20h-1.5v-5.1c-.7-.3-1.1-1-.9-1.7z" transform="rotate(34 12 12)"/>' +
      '</svg>'
    );
  }

  function allergy() {
    return (
      '<div class="allergy">' +
        'Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can’t guarantee it’s allergen-free.<br>' +
        'gf – gluten free &nbsp;&nbsp; v – vegetarian &nbsp;&nbsp; vg – vegan' +
      '</div>'
    );
  }

  function cleanPrice(p) {
    return String(p == null ? '' : p).replace(/\s+/g, '').replace(/^£/, '');
  }

  function dishRow(d, opts) {
    opts = opts || {};
    var html = '<div class="dish">';
    html += '<div class="dish-line">';
    html += '<span class="dish-name">';
    if (d.lunchClub && !opts.hideLunch) html += lunchMark();
    html += esc(d.name);
    if (d.tags) html += ' <em class="tags">' + esc(d.tags) + '</em>';
    html += '</span>';
    if (!opts.hidePrice && d.price) html += '<span class="price">' + esc(cleanPrice(d.price)) + '</span>';
    html += '</div>';
    if (d.description) html += '<div class="desc">' + esc(d.description) + '</div>';
    html += '</div>';
    return html;
  }

  function dishCentered(d, opts) {
    opts = opts || {};
    var html = '<div class="dish dish-c">';
    html += '<div class="dish-name">';
    if (d.lunchClub && !opts.hideLunch) html += lunchMark();
    html += esc(d.name);
    if (!opts.hidePrice && d.price) html += ' <span class="price">' + esc(d.price) + '</span>';
    html += '</div>';
    if (d.description) html += '<div class="desc">' + esc(d.description) + '</div>';
    if (d.tags) html += '<div class="tags">' + esc(d.tags) + '</div>';
    html += '</div>';
    return html;
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

  function renderPromoBank(promos) {
    promos = promos || [];
    if (!promos.length) return '';
    var inner = '<div class="promo">';
    promos.forEach(function (p) {
      if (!p || !p.title) return;
      inner += '<div class="promo-title">' + esc(p.title);
      if (p.date) inner += ' <span class="promo-date">' + esc(formatBankDate(p.date)) + '</span>';
      inner += '</div>';
      if (p.body) inner += '<p>' + esc(p.body) + '</p>';
    });
    inner += '</div>';
    return scallop(inner, 'box');
  }

  function sandwichNote(dishes) {
    var price = 'all 9.50';
    if (dishes && dishes.length) {
      var prices = {};
      dishes.forEach(function (d) {
        var p = cleanPrice(d.price);
        if (p) prices[p] = true;
      });
      var keys = Object.keys(prices);
      if (keys.length === 1) price = 'all ' + keys[0];
    }
    return scallop(
      '<div class="promo sandwich-promo">' +
        '<div class="promo-head"><span class="promo-title">Sandwiches</span>' +
        '<span class="price">' + esc(price) + '</span></div>' +
        '<p class="note-line">(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)</p>' +
        '<p>filled ciabatta or farmhouse sandwich<br>all served with fries and salad.</p>' +
        '<p class="note-line">See our Sandwich menu for today’s fillings</p>' +
      '</div>',
      'box'
    );
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
    if (leftover > 32) return 'fill-airy';
    if (leftover > 16) return 'fill-roomy';
    if (leftover < 6) return 'fill-tight';
    return 'fill-normal';
  }

  function lunchClubBox() {
    return scallop(
      '<div class="lunch-box">' +
        lunchMark() +
        '<div><strong>Smaller options for smaller appetites</strong><br>Lunch club Mon–Thurs</div>' +
      '</div>',
      'box'
    );
  }

  function isNibbles(name) {
    return /nibble|light bite/i.test(name || '');
  }
  function isClassics(name) {
    return /classic|burger/i.test(name || '');
  }
  function isSides(name) {
    return /^sides?$/i.test(name || '');
  }
  function isSandwich(name) {
    return /sandwich/i.test(name || '');
  }
  function isSauce(name) {
    return /sauce/i.test(name || '');
  }
  function isDessert(name) {
    return /dessert/i.test(name || '');
  }
  function isMains(name) {
    return /^mains?$/i.test(name || '');
  }
  function isStarters(name) {
    return /starter/i.test(name || '');
  }

  /** Canonical print order — layout brain reorders whatever staff pasted. */
  var SECTION_RANK = [
    { test: isNibbles, rank: 10 },
    { test: isStarters, rank: 20 },
    { test: isClassics, rank: 30 },
    { test: isMains, rank: 40 },
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
    return /burger/i.test((d && d.name) || '');
  }

  function orderDishesForPrint(dishes) {
    var list = (dishes || []).slice();
    // Stable sort: section order, then burgers last within classics, else keep paste order
    list.forEach(function (d, i) { d._i = i; });
    list.sort(function (a, b) {
      var ra = sectionRank(a.section);
      var rb = sectionRank(b.section);
      if (ra !== rb) return ra - rb;
      if (isClassics(a.section) && isClassics(b.section)) {
        var ba = isBurgerDish(a) ? 1 : 0;
        var bb = isBurgerDish(b) ? 1 : 0;
        if (ba !== bb) return ba - bb;
      }
      return a._i - b._i;
    });
    list.forEach(function (d) { delete d._i; });
    return list;
  }

  /* —— Fluid layout brain ——
     Sizes the selected dishes, splits pages only when needed, and only
     drops in Stay a While / Gatherings / sandwiches / lunch-club / foot logo
     when leftover room lets them sit without opening another page. */
  var PAGE = 100;
  var COST = {
    tracker: 2,
    allergy: 2.5,
    logoTop: 8,
    nibblesBox: 2.5,
    sectionHead: 2.2,
    rooms: 9,
    sandwiches: 8,
    lunchClub: 5,
    footLogo: 7,
    bottomCols: 1
  };

  function dishUnits(d) {
    var u = 1.35;
    if (d.description) {
      u += 0.85 + Math.floor(String(d.description).length / 78) * 0.45;
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
      nibbles: null, starters: null, classics: null, mains: null,
      desserts: null, sides: null, sandwiches: null, sauces: null,
      other: [], hasLunch: false, count: dishes.length
    };
    sections.forEach(function (s) {
      if (isNibbles(s.name) && !bag.nibbles) bag.nibbles = s;
      else if (isStarters(s.name) && !bag.starters) bag.starters = s;
      else if (isClassics(s.name) && !bag.classics) bag.classics = s;
      else if (isMains(s.name) && !bag.mains) bag.mains = s;
      else if (isDessert(s.name) && !bag.desserts) bag.desserts = s;
      else if (isSides(s.name) && !bag.sides) bag.sides = s;
      else if (isSandwich(s.name) && !bag.sandwiches) bag.sandwiches = s;
      else if (isSauce(s.name) && !bag.sauces) bag.sauces = s;
      else bag.other.push(s);
      s.dishes.forEach(function (d) { if (d.lunchClub) bag.hasLunch = true; });
    });
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
    var promoCost = promos && promos.length
      ? Math.min(14, 5 + promos.length * 3.5)
      : COST.rooms;
    var wantPromoBox = promos ? promos.length > 0 : true;
    var promoLabel = promos && promos.length
      ? promos.map(function (p) { return p.title; }).filter(Boolean).join(' / ')
      : 'Stay a While / Gatherings';

    dishes = orderDishesForPrint(dishes || []);
    var bag = pickSections(dishes);
    var chrome = COST.tracker + COST.allergy + COST.logoTop;
    var front = chrome;
    if (bag.nibbles) front += sectionUnits(bag.nibbles, true);
    if (bag.starters) front += sectionUnits(bag.starters, false);
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isDessert(s.name)) front += sectionUnits(s, false);
    });
    if (bag.classics) front += sectionUnits(bag.classics, false);

    var back = chrome;
    if (bag.mains) back += sectionUnits(bag.mains, false);
    if (bag.desserts) back += sectionUnits(bag.desserts, false);
    if (bag.sides) back += sectionUnits(bag.sides, false);
    if (bag.sauces) back += sectionUnits(bag.sauces, false);
    // sandwich dish list is replaced by a note box when printed on Main/Sunday
    var wantSandwichNote = menu.id === 'main' || menu.id === 'sunday' || !!bag.sandwiches;
    var hasBackContent = !!(bag.mains || bag.desserts || bag.sides || bag.sauces || bag.sandwiches);

    var layout = {
      pages: 1,
      fit: 'one',
      mode: 'single',
      bag: bag,
      promos: promos || [],
      p1: { rooms: false, sandwiches: false, lunchClub: false, footLogo: false, classicsSplit: 0, sidesOnP1: false },
      p2: null,
      leftover: { p1: 0, p2: 0 },
      summary: '',
      fillers: []
    };

    // —— One page if everything (minus optional fillers) fits ——
    var oneNeed = front;
    if (bag.mains) oneNeed += sectionUnits(bag.mains, false);
    if (bag.desserts) oneNeed += sectionUnits(bag.desserts, false);
    if (bag.sides) oneNeed += sectionUnits(bag.sides, false);
    if (bag.sauces) oneNeed += sectionUnits(bag.sauces, false);
    // If we have a natural back half (mains + sides), prefer two pages like Jul/Nov
    // when the front alone is already chunky, or one page would be cramped.
    var preferTwo = hasBackContent && (bag.mains || bag.desserts) && (
      front > 55 || oneNeed > PAGE - 4 || bag.count >= 18
    );

    if (!preferTwo && oneNeed <= PAGE) {
      layout.pages = 1;
      layout.fit = 'one';
      layout.mode = 'single';
      var left1 = PAGE - oneNeed;
      // Pack fillers into leftover — never push over PAGE
      var add;
      if (wantPromoBox) {
        add = tryAdd(left1, promoCost);
        if (add.ok) { layout.p1.rooms = true; left1 = add.left; layout.fillers.push(promoLabel); }
      }
      if (wantSandwichNote) {
        add = tryAdd(left1, COST.sandwiches + (bag.sides ? 0 : 0));
        if (add.ok) { layout.p1.sandwiches = true; left1 = add.left; layout.fillers.push('Sandwiches box'); }
      }
      if (bag.sides && layout.p1.sandwiches) layout.p1.sidesOnP1 = true;
      if (bag.hasLunch) {
        add = tryAdd(left1, COST.lunchClub);
        if (add.ok) { layout.p1.lunchClub = true; left1 = add.left; layout.fillers.push('Lunch club note'); }
      }
      add = tryAdd(left1, COST.footLogo);
      if (add.ok) { layout.p1.footLogo = true; left1 = add.left; layout.fillers.push('Logo'); }
      layout.leftover.p1 = left1;
      // Keep classics as one list; promo sits in its own column (never split burgers into a narrow right col).
      layout.p1.classicsSplit = 0;
    } else if (hasBackContent || oneNeed > PAGE) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = { rooms: false, sandwiches: false, lunchClub: false, footLogo: false, sidesOnP2: true };

      var p1used = front;
      var p1left = PAGE - p1used;
      // Selling bits on page 1 beside classics when they fit (Nov)
      if (wantPromoBox) {
        var addR = tryAdd(p1left, promoCost);
        if (addR.ok) {
          layout.p1.rooms = true;
          p1left = addR.left;
          layout.fillers.push(promoLabel + ' (page 1)');
          layout.p1.classicsSplit = 0;
        } else if (wantSandwichNote && bag.sides) {
          // Jul fallback: sandwiches + sides on page 1 right if rooms don't fit
          var addS = tryAdd(p1left, COST.sandwiches);
          if (addS.ok) {
            layout.p1.sandwiches = true;
            layout.p1.sidesOnP1 = true;
            layout.p2.sidesOnP2 = false;
            p1left = addS.left;
            layout.fillers.push('Sandwiches + sides (page 1)');
          }
        }
      } else if (wantSandwichNote && bag.sides) {
        var addS2 = tryAdd(p1left, COST.sandwiches);
        if (addS2.ok) {
          layout.p1.sandwiches = true;
          layout.p1.sidesOnP1 = true;
          layout.p2.sidesOnP2 = false;
          p1left = addS2.left;
          layout.fillers.push('Sandwiches + sides (page 1)');
        }
      }
      layout.leftover.p1 = p1left;

      var p2used = back + COST.bottomCols;
      if (layout.p2.sidesOnP2 && bag.sides) { /* already in back */ }
      var p2left = PAGE - p2used;
      // Desserts + a full mains list leave little room — be stricter about fillers
      var tightBack = !!(bag.desserts && bag.mains && bag.mains.dishes.length >= 6);
      if (wantSandwichNote && !layout.p1.sandwiches) {
        var sandCost = tightBack ? COST.sandwiches + 2 : COST.sandwiches;
        var addSx = tryAdd(p2left, sandCost);
        if (addSx.ok) {
          layout.p2.sandwiches = true;
          p2left = addSx.left;
          layout.fillers.push('Sandwiches box (page 2)');
        }
      }
      if (wantPromoBox && !layout.p1.rooms) {
        var addRooms2 = tryAdd(p2left, promoCost + (tightBack ? 3 : 0));
        if (addRooms2.ok) {
          layout.p2.rooms = true;
          p2left = addRooms2.left;
          layout.fillers.push(promoLabel + ' (page 2)');
        }
      }
      if (bag.hasLunch && !tightBack) {
        var addL = tryAdd(p2left, COST.lunchClub);
        if (addL.ok) {
          layout.p2.lunchClub = true;
          p2left = addL.left;
          layout.fillers.push('Lunch club note (page 2)');
        }
      }
      var logoCost = tightBack ? COST.footLogo + 4 : COST.footLogo;
      var addLogo = tryAdd(p2left, logoCost);
      if (addLogo.ok) {
        layout.p2.footLogo = true;
        p2left = addLogo.left;
        layout.fillers.push('Logo (page 2)');
      }
      layout.leftover.p2 = p2left;

      if (p1used > PAGE + 10 || p2used > PAGE + 14) layout.fit = 'over';
    } else {
      layout.pages = 1;
      layout.fit = 'one';
    }

    var bits = layout.fillers.length
      ? ' Auto-adds where they fit: ' + layout.fillers.join('; ') + '.'
      : ' Sheet is full — no room for extra selling boxes.';
    layout.summary =
      (layout.fit === 'one' ? 'Fills one A4 (or 2×A5 for guillotine).' :
        layout.fit === 'two' ? 'Fills two A4 pages (each page can also print as 2×A5).' :
          'Too full for two pages. Take dishes off. A promo never opens another page.') +
      ' Layout picks columns and dish order from ' + bag.count + ' dishes.' + bits;

    layout.orderedDishes = dishes;
    return layout;
  }

  function listDishes(list) {
    return (list || []).map(function (d) { return dishRow(d); }).join('');
  }

  function renderFiller(which, bag, promos) {
    if (which === 'rooms') return renderPromoBank(promos && promos.length ? promos : (bag && bag.promos));
    if (which === 'sandwiches') return sandwichNote(bag.sandwiches && bag.sandwiches.dishes);
    if (which === 'lunch') return lunchClubBox();
    if (which === 'logo') {
      return '<div class="foot-logo"><img src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
    }
    return '';
  }

  function buildLong(menu, dishes, plan, ver) {
    var layout = (plan && plan.layout) || planFluidLayout(menu, dishes, { promos: (plan && plan.promos) || [] });
    dishes = layout.orderedDishes || orderDishesForPrint(dishes);
    var bag = layout.bag || pickSections(dishes);
    var promos = (plan && plan.promos) || layout.promos || [];
    bag.promos = promos;
    var p1opts = layout.p1 || {};
    var p2opts = layout.p2;
    var sidesPrint = sidesForPrint(bag);
    var hideDate = menu.id === 'party' || menu.kind === 'party';
    var fill1 = fillClass((layout.leftover && layout.leftover.p1) || 12);
    var fill2 = fillClass((layout.leftover && layout.leftover.p2) || 12);

    var p1 = '<div class="page fill-page ' + fill1 + '">';
    p1 += trackerBar(ver, { hideDate: hideDate });
    p1 += '<div class="page-body">';
    p1 += '<div class="top-band">';
    p1 += '<div class="top-left">';
    if (bag.nibbles) {
      p1 += scallop(sectionTitle(bag.nibbles.name) + listDishes(bag.nibbles.dishes), 'wide');
    }
    p1 += '</div>';
    p1 += '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
    p1 += '</div>';

    if (bag.starters) {
      p1 += '<section class="sec">' + sectionTitle(bag.starters.name) + listDishes(bag.starters.dishes) + '</section>';
    }
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isDessert(s.name) && !isSandwich(s.name)) {
        p1 += '<section class="sec">' + sectionTitle(s.name) + listDishes(s.dishes) + '</section>';
      }
    });

    // Classics left (full list) + selling column right — never squeeze burgers + promo into one narrow col
    if (bag.classics || p1opts.rooms || p1opts.sandwiches) {
      p1 += '<section class="sec classics-block">';
      if (bag.classics) p1 += sectionTitle(bag.classics.name);
      p1 += '<div class="cols cols-classics"><div class="col col-dishes">';
      if (bag.classics) p1 += listDishes(bag.classics.dishes);
      p1 += '</div><div class="col col-promo">';
      if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
      if (p1opts.sandwiches) p1 += renderFiller('sandwiches', bag);
      if (p1opts.sidesOnP1 && sidesPrint) {
        p1 += sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes);
      }
      p1 += '</div></div></section>';
    }

    if (layout.pages === 1) {
      if (bag.mains) p1 += '<section class="sec">' + sectionTitle(bag.mains.name) + listDishes(bag.mains.dishes) + '</section>';
      if (bag.desserts) p1 += '<section class="sec">' + sectionTitle(bag.desserts.name) + listDishes(bag.desserts.dishes) + '</section>';
      if (sidesPrint && !p1opts.sidesOnP1) {
        p1 += '<section class="sec">' + sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes) + '</section>';
      }
      if (bag.sauces) p1 += '<section class="sec">' + sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes) + '</section>';
      if (p1opts.sandwiches && !bag.classics && !(p1opts.rooms)) p1 += renderFiller('sandwiches', bag);
      if (p1opts.lunchClub) p1 += renderFiller('lunch', bag);
      if (p1opts.footLogo) p1 += renderFiller('logo', bag);
    }

    p1 += '</div>'; // page-body content ends; spacer fills leftover
    p1 += '<div class="page-spacer" aria-hidden="true"></div>';
    p1 += allergy();
    p1 += '</div>';

    if (layout.pages < 2 || !p2opts) return p1;

    var p2 = '<div class="page fill-page ' + fill2 + '">';
    p2 += trackerBar(ver, { hideDate: hideDate });
    p2 += '<div class="page-body">';
    if (bag.mains) p2 += '<section class="sec">' + sectionTitle(bag.mains.name) + listDishes(bag.mains.dishes) + '</section>';
    if (bag.desserts) p2 += '<section class="sec">' + sectionTitle(bag.desserts.name) + listDishes(bag.desserts.dishes) + '</section>';

    var showBottom = (p2opts.sidesOnP2 && (sidesPrint || bag.sauces)) || p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      p2 += '<div class="cols bottom-cols"><div class="col">';
      if (p2opts.sidesOnP2 && sidesPrint) p2 += sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes);
      if (p2opts.sidesOnP2 && bag.sauces) p2 += sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes);
      if (!(p2opts.sidesOnP2 && (sidesPrint || bag.sauces))) p2 += '&nbsp;';
      p2 += '</div><div class="col col-promo">';
      if (p2opts.sandwiches) p2 += renderFiller('sandwiches', bag);
      else if (p2opts.rooms) p2 += renderFiller('rooms', bag, promos);
      p2 += '</div></div>';
    } else if (p2opts.rooms) {
      p2 += renderFiller('rooms', bag, promos);
    }

    if (p2opts.lunchClub) p2 += renderFiller('lunch', bag);
    if (p2opts.footLogo) p2 += renderFiller('logo', bag);
    p2 += '</div>'; // page-body
    p2 += '<div class="page-spacer" aria-hidden="true"></div>';
    p2 += allergy();
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
        // group by price bands
        inner = scallop(
          dishes.map(function (d) { return dishCentered(d, { hidePrice: true }); }).join('') +
          '<div class="lb-price" style="margin-top:8px">' + esc((dishes[0] && dishes[0].price) || '') + '</div>' +
          '<div class="desc" style="margin-top:10px">Served on either Ciabatta vg, Farmhouse White or Granary<br>All served with Fries and Salad</div>'
        );
      } else {
        // desserts etc
        inner = scallop(dishes.map(function (d) { return dishCentered(d); }).join(''));
      }
      return (
        '<article class="card-face">' +
          trackerBar(ver) +
          '<img class="logo" src="' + esc(asset('eight-bells-logo.png')) + '" alt="">' +
          (menu.id === 'lunch-club' ? '' : '<h1>' + esc(title) + '</h1>') +
          inner +
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
    return (
      '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap");' +
      ':root{--ink:' + INK + ';--green:' + GREEN + ';--serif:"Cinzel",Georgia,serif;--sans:"Source Sans 3",system-ui,sans-serif;' +
        '--dish-gap:9px;--sec-gap:12px;--name:13px;--desc:11.5px;--title:14.5px;--promo:12px}' +
      '*{box-sizing:border-box} body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button,.toolbar label.paper-opt{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar label.paper-opt{display:inline-flex;align-items:center;gap:6px;background:#3a342c;color:#f4eae3}' +
      '.toolbar label.paper-opt input{margin:0}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet,.cut-sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;height:297mm;padding:9mm 12mm 10mm;position:relative;display:flex;flex-direction:column;overflow:hidden}' +
      '.page-body{flex:0 0 auto;display:flex;flex-direction:column;justify-content:flex-start;min-height:0}' +
      '.page-spacer{flex:1 1 auto;min-height:3mm}' +
      '.page-body > .sec,.page-body > .top-band,.page-body > .cols,.page-body > .classics-block,.page-body > .foot-logo,.page-body > .lunch-box{flex:0 0 auto}' +
      '.scallop,.sec,.cols,.foot-logo,.lunch-box,.col-promo{page-break-inside:avoid}' +
      '.sheet.landscape{width:297mm;min-height:210mm;height:auto}' +
      '.sheet-inner{display:grid;grid-template-columns:1fr 1fr;min-height:210mm}' +
      '.card-face{padding:8mm 8mm 7mm;border-right:1px dashed #cfc7bb;position:relative}' +
      '.card-face:last-child{border-right:0}' +
      '.tracker{display:flex;justify-content:space-between;align-items:baseline;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#5a534a;margin:0 0 6px;font-weight:600;flex:0 0 auto}' +
      '.tracker .roman{font-family:var(--serif);font-size:15px;letter-spacing:.12em;color:var(--ink)}' +
      '.top-band{display:grid;grid-template-columns:1fr 92px;gap:10px;align-items:start;margin:0 0 6px}' +
      '.top-left .scallop{margin-bottom:0}' +
      '.logo-tr{width:88px;height:auto;display:block;margin-left:auto}' +
      '.logo{display:block;width:54px;margin:0 auto 4px}' +
      '.foot-logo{text-align:center;margin:10px 0 4px}' +
      '.foot-logo img{width:96px;height:auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:17px;letter-spacing:.06em;text-align:center;text-transform:uppercase;margin:2px 0 8px}' +
      '.sec{margin:0 0 var(--sec-gap)}' +
      '.sec-title{font-family:var(--serif);font-weight:700;font-size:var(--title);letter-spacing:.12em;text-transform:uppercase;margin:0 0 8px;text-align:center}' +
      '.scallop .sec-title{text-align:left;font-size:13px;letter-spacing:.1em;margin-bottom:6px}' +
      '.sec-title.soft{font-size:12px;letter-spacing:.08em}' +
      '.sec-title.under{text-align:center;text-decoration:underline;text-underline-offset:3px;margin-top:10px}' +
      '.scallop{margin:0 0 10px;background:#fff;' +
        'border-style:solid;border-color:transparent;border-width:14px;' +
        'border-image-slice:42 fill;border-image-repeat:stretch;border-image-width:14px;' +
        'overflow:hidden}' +
      '.scallop-wide{border-image-source:url("' + asset('frame-wide.png') + '")}' +
      '.scallop-box{border-image-source:url("' + asset('frame-box.png') + '");border-width:12px;border-image-width:12px;border-image-slice:38 fill}' +
      '.scallop-pad{padding:5px 8px 3px;overflow:hidden}' +
      '.scallop-box .scallop-pad{padding:4px 7px 2px}' +
      '.dish{margin:0 0 var(--dish-gap)}' +
      '.dish-line{display:flex;justify-content:space-between;gap:12px;align-items:baseline}' +
      '.dish-name{font-weight:700;font-size:var(--name);line-height:1.25}' +
      '.price{font-weight:600;font-size:var(--name);white-space:nowrap;flex:0 0 auto}' +
      '.desc{font-weight:400;font-size:var(--desc);color:#3a342c;margin-top:2px;padding-right:28px;line-height:1.35}' +
      '.tags{color:var(--green);font-style:italic;font-weight:400;font-size:var(--desc)}' +
      '.dish-c{text-align:center;margin:0 0 var(--dish-gap)}' +
      '.dish-c .dish-name{font-family:var(--serif);font-size:var(--name);letter-spacing:.02em}' +
      '.cols{display:grid;grid-template-columns:1.15fr 0.85fr;gap:16px;margin:4px 0 6px;align-items:start}' +
      '.cols-classics{grid-template-columns:1.2fr 0.8fr}' +
      '.col-promo{min-width:0;max-width:100%}' +
      '.col-promo .scallop{max-width:100%}' +
      '.col-promo .promo p{font-size:11px;line-height:1.35;margin:0 0 6px}' +
      '.promo-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 4px}' +
      '.bottom-cols{margin-top:10px;margin-bottom:4px}' +
      '.bottom-cols .sec-title{text-align:left}' +
      '.allergy{color:var(--green);font-style:italic;font-size:10px;text-align:center;line-height:1.4;margin-top:8px;flex:0 0 auto}' +
      '.promo{text-align:left}' +
      '.promo-title{font-family:var(--serif);font-weight:700;font-size:var(--promo);letter-spacing:.06em;text-transform:uppercase;margin:2px 0 2px}' +
      '.promo-date{font-family:var(--sans);font-weight:600;font-size:10.5px;letter-spacing:.02em;text-transform:none;color:#5a534a}' +
      '.promo p{font-size:11px;font-weight:400;margin:0 0 6px;line-height:1.35}' +
      '.lunch-box{display:flex;gap:10px;align-items:center;font-size:12px}' +
      '.lc{width:14px;height:14px;vertical-align:-2px;margin-right:4px;display:inline-block}' +
      '.lunch-box .lc{width:22px;height:22px;flex:0 0 auto}' +
      '.note-line{font-size:11px;font-weight:600;margin:4px 0}' +
      '.days{position:absolute;top:18mm;left:6mm;font-family:var(--serif);font-size:9px;font-weight:700;line-height:1.35;letter-spacing:.05em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:18px;text-align:center;line-height:1.15;margin:2px 0 8px}' +
      '.lc-price{font-family:var(--serif);text-align:center;font-size:12px;line-height:1.45}' +
      '.lb-foot{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:13px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:16px;margin:5px 0}' +
      /* Density: stretch type/gaps so each page reads full */ +
      '.fill-airy{--dish-gap:13px;--sec-gap:16px;--name:14px;--desc:12.5px;--title:15.5px;--promo:13px}' +
      '.fill-roomy{--dish-gap:11px;--sec-gap:14px;--name:13.5px;--desc:12px;--title:15px;--promo:12.5px}' +
      '.fill-normal{--dish-gap:9px;--sec-gap:12px;--name:13px;--desc:11.5px;--title:14.5px;--promo:12px}' +
      '.fill-tight{--dish-gap:6px;--sec-gap:8px;--name:12px;--desc:10.5px;--title:13.5px;--promo:11.5px}' +
      /* 2×A5 on A4 landscape — cut down the middle */ +
      '.cut-sheet{width:297mm;height:210mm;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;position:relative;overflow:hidden}' +
      '.cut-sheet::after{content:"";position:absolute;top:4mm;bottom:4mm;left:50%;width:0;border-left:1px dashed #c5bdb0;pointer-events:none}' +
      '.a5-face{width:148.5mm;height:210mm;padding:7mm 8mm 8mm;overflow:hidden;display:flex;flex-direction:column}' +
      '.a5-face .page-body{flex:0 0 auto}' +
      '.a5-face .page-spacer{flex:1 1 auto;min-height:2mm}' +
      '.a5-face{--dish-gap:7px;--sec-gap:9px;--name:11.5px;--desc:10.5px;--title:12.5px;--promo:11px}' +
      '.a5-face .logo-tr{width:64px}' +
      '.a5-face .tracker{font-size:9px;margin-bottom:4px}' +
      '.a5-face .tracker .roman{font-size:12px}' +
      '.a5-face .allergy{font-size:8.5px}' +
      '.a5-face .top-band{grid-template-columns:1fr 68px;gap:6px}' +
      '.a5-face .cols{gap:10px}' +
      '.a5-face .scallop{border-width:10px;border-image-width:10px}' +
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
    var parts = String(pagesHtml || '').split(/(?=<div class="page\b)/).filter(function (s) {
      return /class="page\b/.test(s);
    });
    if (!parts.length) return pagesHtml;
    return parts.map(function (pageHtml) {
      var openEnd = pageHtml.indexOf('>');
      var close = pageHtml.lastIndexOf('</div>');
      if (openEnd < 0 || close < 0) return pageHtml;
      var content = pageHtml.slice(openEnd + 1, close);
      var face = '<div class="a5-face fill-page fill-roomy">' + content + '</div>';
      return '<div class="cut-sheet">' + face + face + '</div>';
    }).join('');
  }

  function buildParty(menu, dishes, plan, ver) {
    var meta = (plan && plan.meta) || {};
    var title = meta.title || menu.name || 'Party Menu';
    var prices = meta.coursePrices || '';
    var notes = meta.notes || '';
    var sections = groupBySection(dishes);
    var order = ['Starters', 'Mains', 'Desserts'];
    var byName = {};
    sections.forEach(function (s) { byName[s.name.toLowerCase()] = s; });

    var html = '<div class="page party-page fill-page fill-roomy">';
    html += trackerBar(ver, { hideDate: true });
    html += '<div class="page-body">';
    html += '<img class="logo party-logo" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells">';
    html += '<h1 class="party-title">' + esc(title) + '</h1>';
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
        if (d.description) html += '<div class="desc">' + esc(d.description) + '</div>';
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

    if (notes) html += '<div class="party-notes">' + esc(notes) + '</div>';
    html += '</div>'; // page-body
    html += '<div class="page-spacer" aria-hidden="true"></div>';
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
    var layout = null;
    if (menu.kind === 'long') {
      layout = planFluidLayout(menu, dishes, { promos: plan.promos || [] });
      plan.layout = layout;
      plan.fit = layout.fit;
      plan.text = layout.summary;
      if (!plan.promos) plan.promos = layout.promos || [];
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

    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(menu.name) + ' — ' + esc(ver.roman) + '</title>' +
      '<style>' + css({ landscape: landscape, guillotine: guillotine }) + partyCss() +
      'body.paper-a5 .mode-a4{display:none}body.paper-a5 .mode-a5{display:block}' +
      'body.paper-a4 .mode-a5{display:none}body.paper-a4 .mode-a4{display:block}' +
      '</style></head><body class="paper-a4">' +
      '<div class="toolbar">' +
        '<button type="button" onclick="window.print()">Print / save as PDF</button>' +
        (landscape ? '' :
          '<label class="paper-opt"><input type="radio" name="paper" value="a4" checked onchange="document.body.className=\'paper-a4\'"> A4 (fill page)</label>' +
          '<label class="paper-opt"><input type="radio" name="paper" value="a5" onchange="document.body.className=\'paper-a5\'"> 2×A5 on A4 (guillotine)</label>') +
        '<span class="hint">' + esc(dateHint) +
        ' — type scales to fill the sheet; selling boxes stay inside their frames.' +
        esc(fillerHint) + '</span>' +
      '</div>' +
      a4Stack + a5Stack +
      '<script>(function(){function sync(){var a5=document.body.classList.contains("paper-a5");' +
        'var s=document.createElement("style");s.id="paperPrint";var old=document.getElementById("paperPrint");' +
        'if(old)old.remove();s.textContent=a5?"@media print{@page{size:A4 landscape;margin:0}}":"@media print{@page{size:A4 portrait;margin:0}}";' +
        'document.head.appendChild(s);}document.querySelectorAll("[name=paper]").forEach(function(r){r.addEventListener("change",sync);});})();<\/script>' +
      '</body></html>'
    );
  }

  function partyCss() {
    return (
      '.party-page{text-align:center;padding-top:8mm}' +
      '.party-logo{width:76px;margin:0 auto 8px;display:block}' +
      '.party-title{font-family:var(--serif);font-size:24px;letter-spacing:.1em;margin:4px 0 6px;font-weight:700}' +
      '.party-prices{font-weight:700;font-size:14px;margin:0 0 14px;letter-spacing:.04em}' +
      '.party-sec{margin:0 0 12px}' +
      '.party-sec .sec-title{margin-bottom:10px}' +
      '.party-dish{margin:0 0 10px;padding:0 14mm}' +
      '.party-dish .desc{padding-right:0;font-style:normal;color:#444}' +
      '.party-notes{font-size:11px;color:#5a534a;margin:14px 12mm 6px;line-height:1.4}'
    );
  }

  root.EBMenuPrint = {
    build: build,
    planFluidLayout: planFluidLayout,
    orderDishesForPrint: orderDishesForPrint,
    toRoman: toRoman,
    weekLabel: weekLabel,
    sundayLabel: sundayLabel,
    weekKey: weekKey,
    nextPrintVersion: nextPrintVersion,
    wrapGuillotine: wrapGuillotine
  };
})(typeof window !== 'undefined' ? window : global);
