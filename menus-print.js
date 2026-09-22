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
    if (d.lunchClub && !opts.hideLunch) html += lunchMark();
    html += esc(name);
    if (d.tags) html += ' <em class="tags">' + esc(d.tags) + '</em>';
    html += '</span>';
    html += '<span class="dish-leader" aria-hidden="true"></span>';
    if (!opts.hidePrice && price) html += '<span class="price">' + esc(cleanPrice(price)) + '</span>';
    html += '</div>';
    if (d.description) {
      html += '<div class="desc">' + esc(d.description).replace(/\n/g, '<br>') + '</div>';
    }
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

  function sandwichNote(dishes, opts) {
    opts = opts || {};
    var price = 'all 9.50';
    var hours = '(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)';
    var body = 'Filled ciabatta or farmhouse sandwich, all served with fries and salad.';
    var foot = 'Ask waiting staff for today’s fillings';
    if (dishes && dishes.length) {
      var prices = {};
      dishes.forEach(function (d) {
        var p = cleanPrice(d.price);
        if (p) prices[p] = true;
        var blob = ((d.name || '') + ' ' + (d.description || '')).trim();
        var hm = blob.match(/\(\s*12[^)]+\)/);
        if (hm) hours = hm[0].replace(/\s+/g, ' ');
      });
      var keys = Object.keys(prices);
      if (keys.length === 1) price = 'all ' + keys[0];
    }
    // Title outside the frame so it lines up with SIDES; box holds the body only.
    if (opts.alignTitle) {
      return (
        '<div class="sandwich-aligned">' +
          '<div class="promo-head pair-head">' +
            '<span class="sec-title soft-left">Sandwiches</span>' +
            '<span class="price">' + esc(price) + '</span>' +
          '</div>' +
          scallop(
            '<div class="promo sandwich-promo">' +
              '<p class="note-line">' + esc(hours) + '</p>' +
              '<p class="desc">' + esc(body) + '</p>' +
              '<p class="note-line">' + esc(foot) + '</p>' +
            '</div>',
            'box'
          ) +
        '</div>'
      );
    }
    return scallop(
      '<div class="promo sandwich-promo">' +
        '<div class="promo-head"><span class="promo-title">Sandwiches</span>' +
        '<span class="price">' + esc(price) + '</span></div>' +
        '<p class="note-line">' + esc(hours) + '</p>' +
        '<p class="desc">' + esc(body) + '</p>' +
        '<p class="note-line">' + esc(foot) + '</p>' +
      '</div>',
      'box'
    );
  }

  /** Description fragments wrongly stored as dish titles (no price, lowercase / side-list). */
  function looksLikeDescFragment(name) {
    var n = String(name || '').trim();
    if (!n || n.length > 90) return false;
    if (/^(serves?|served|with|and|filled|ask |see |all served|rings?|bacon|onion|fries|salad|streaky|brioche|mayo|cheese|monter)/i.test(n)) {
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
   * Merge orphan “description” rows back onto the previous dish, and fold
   * sandwich selling lines into one sandwiches bucket for the side column.
   */
  function tidyDishesForPrint(dishes) {
    var out = [];
    (dishes || []).forEach(function (raw) {
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
      if (out.length && !price && looksLikeDescFragment(d.name)) {
        var prev = out[out.length - 1];
        var bit = d.name + (d.description ? ', ' + d.description : '');
        prev.description = prev.description ? (prev.description + ', ' + bit) : bit;
        return;
      }
      if (out.length && !price && looksLikeDescFragment(d.description) && !d.name) {
        var prev2 = out[out.length - 1];
        prev2.description = prev2.description ? (prev2.description + ', ' + d.description) : d.description;
        return;
      }
      out.push(d);
    });
    return out;
  }

  function splitClassicsBag(sec) {
    var classics = [];
    var burgers = [];
    var sandwichBits = [];
    ((sec && sec.dishes) || []).forEach(function (d) {
      if (isSandwichDish(d)) sandwichBits.push(d);
      else if (isBurgerDish(d)) burgers.push(d);
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
    // Prefer airy type so sheets look filled rather than sparse with tiny text.
    if (leftover > 18) return 'fill-airy';
    if (leftover > 8) return 'fill-roomy';
    if (leftover < 3) return 'fill-tight';
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
    // Match “Pub Classics” and legacy “Pub classics & Burgers”
    return /classic/i.test(name || '');
  }
  function isBurgers(name) {
    return /^burgers?$/i.test(String(name || '').trim());
  }
  function isSharing(name) {
    return /shar(e|ing)|for the table/i.test(name || '');
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
    { test: isSharing, rank: 25 },
    { test: isClassics, rank: 30 },
    { test: isBurgers, rank: 32 },
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
    if (!d) return false;
    if (isBurgers(d.section)) return true;
    return /burger/i.test(d.name || '');
  }

  function orderDishesForPrint(dishes) {
    var list = tidyDishesForPrint(dishes || []).slice();
    // Stable sort: section order, then keep paste order within section
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
      nibbles: null, starters: null, sharing: null, classics: null, burgers: null,
      mains: null, desserts: null, sides: null, sandwiches: null, sauces: null,
      other: [], hasLunch: false, count: dishes.length
    };
    var straySandwiches = [];
    var strayBurgers = [];
    sections.forEach(function (s) {
      if (isNibbles(s.name) && !bag.nibbles) bag.nibbles = s;
      else if (isStarters(s.name) && !bag.starters) bag.starters = s;
      else if (isSharing(s.name) && !bag.sharing) bag.sharing = s;
      else if (isBurgers(s.name) && !bag.burgers) bag.burgers = s;
      else if (isClassics(s.name) && !bag.classics) {
        var kept = [];
        (s.dishes || []).forEach(function (d) {
          if (isSandwichDish(d)) straySandwiches.push(d);
          else if (isBurgerDish(d)) strayBurgers.push(d);
          else kept.push(d);
        });
        bag.classics = { name: 'Pub Classics', dishes: kept };
      } else if (isMains(s.name) && !bag.mains) bag.mains = s;
      else if (isDessert(s.name) && !bag.desserts) bag.desserts = s;
      else if (isSides(s.name) && !bag.sides) bag.sides = s;
      else if (isSandwich(s.name) && !bag.sandwiches) bag.sandwiches = s;
      else if (isSauce(s.name) && !bag.sauces) bag.sauces = s;
      else bag.other.push(s);
      (s.dishes || []).forEach(function (d) { if (d.lunchClub) bag.hasLunch = true; });
    });
    if (strayBurgers.length) {
      if (bag.burgers && bag.burgers.dishes) {
        bag.burgers = { name: 'Burgers', dishes: bag.burgers.dishes.concat(strayBurgers) };
      } else {
        bag.burgers = { name: 'Burgers', dishes: strayBurgers };
      }
    }
    if (straySandwiches.length) {
      if (bag.sandwiches && bag.sandwiches.dishes) {
        bag.sandwiches = {
          name: bag.sandwiches.name || 'Sandwiches',
          dishes: bag.sandwiches.dishes.concat(straySandwiches)
        };
      } else {
        bag.sandwiches = { name: 'Sandwiches', dishes: straySandwiches };
      }
    }
    // Merge burger section into classics bag for the two-column block
    if (bag.burgers && bag.burgers.dishes && bag.burgers.dishes.length) {
      if (!bag.classics) bag.classics = { name: 'Pub Classics', dishes: [] };
      // keep burgers on bag.burgers; buildLong reads both
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
      if (!isMains(s.name) && !isDessert(s.name) && !isBurgers(s.name)) front += sectionUnits(s, false);
    });
    if (bag.classics) front += sectionUnits(bag.classics, false);
    if (bag.burgers) front += sectionUnits(bag.burgers, false);

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
      // Burgers sit in the right column with Stay a While below (Jul-style).
      layout.p1.classicsSplit = (bag.burgers || (bag.classics && bag.classics.dishes)) ? 1 : 0;
    } else if (hasBackContent || oneNeed > PAGE) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = { rooms: false, sandwiches: false, lunchClub: false, footLogo: false, sidesOnP2: true };
      layout.p1.classicsSplit = 1;

      var p1used = front;
      var p1left = PAGE - p1used;
      // Stay a While / Gatherings under burgers on page 1; sandwiches keep page 2 balanced with sides
      if (wantPromoBox) {
        var addR = tryAdd(p1left, promoCost);
        if (addR.ok) {
          layout.p1.rooms = true;
          p1left = addR.left;
          layout.fillers.push(promoLabel + ' (page 1)');
        }
      }
      layout.leftover.p1 = p1left;

      var p2used = back + COST.bottomCols;
      if (layout.p2.sidesOnP2 && bag.sides) { /* already in back */ }
      var p2left = PAGE - p2used;
      // Desserts + a full mains list leave little room — be stricter about fillers
      var tightBack = !!(bag.desserts && bag.mains && bag.mains.dishes.length >= 6);
      if (wantSandwichNote) {
        var sandCost = tightBack ? COST.sandwiches + 2 : COST.sandwiches;
        var addSx = tryAdd(p2left, sandCost);
        if (addSx.ok) {
          layout.p2.sandwiches = true;
          p2left = addSx.left;
          layout.fillers.push('Sandwiches box (page 2)');
        } else if (bag.sides) {
          // Fallback: sandwiches + sides on page 1 right if page 2 is packed
          var addS = tryAdd(p1left, COST.sandwiches);
          if (addS.ok) {
            layout.p1.sandwiches = true;
            layout.p1.sidesOnP1 = true;
            layout.p2.sidesOnP2 = false;
            layout.leftover.p1 = addS.left;
            layout.fillers.push('Sandwiches + sides (page 1)');
          }
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
    return map[key] || { width: 'full', frame: false };
  }

  function wantsColumn(rule) {
    if (root.EBMenus && root.EBMenus.isColumnWidth) return root.EBMenus.isColumnWidth(rule.width);
    return rule.width === 'column' || rule.width === 'both';
  }

  function wantsFull(rule) {
    if (root.EBMenus && root.EBMenus.isFullWidth) return root.EBMenus.isFullWidth(rule.width);
    return rule.width === 'full' || rule.width === 'both';
  }

  /** Wrap section HTML in a scallop frame when the designer said Yes. */
  function framedBlock(inner, rule, kind) {
    if (rule && rule.frame) return scallop(inner, kind || 'wide');
    return '<div class="sec-plain">' + inner + '</div>';
  }

  function sectionBlock(title, dishes, rule, kind) {
    if (!dishes || !dishes.length) return '';
    return framedBlock(sectionTitle(title) + listDishes(dishes), rule, kind || 'wide');
  }

  function renderFiller(which, bag, promos, opts) {
    if (which === 'rooms') return renderPromoBank(promos && promos.length ? promos : (bag && bag.promos));
    if (which === 'sandwiches') {
      return sandwichNote(bag.sandwiches && bag.sandwiches.dishes, opts || {});
    }
    if (which === 'lunch') return lunchClubBox();
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
    var fill1 = fillClass((layout.leftover && layout.leftover.p1) || 12);
    var fill2 = fillClass((layout.leftover && layout.leftover.p2) || 12);

    var nibRule = ruleFor('Nibbles', plan);
    var startRule = ruleFor('Starters', plan);
    var shareRule = ruleFor('Sharing Plates', plan);
    var classRule = ruleFor('Pub Classics', plan);
    var burgRule = ruleFor('Burgers', plan);
    var mainRule = ruleFor('Mains', plan);
    var sandRule = ruleFor('Sandwiches', plan);
    var sideRule = ruleFor('Sides', plan);
    var dessRule = ruleFor('Desserts', plan);

    var p1 = '<div class="page fill-page ' + fill1 + '">';
    p1 += trackerBar(ver, { hideDate: hideDate });
    p1 += '<div class="page-body">';

    // Top band: Nibbles (column by default) + logo — or full-width nibbles if designer chose full
    if (bag.nibbles && wantsColumn(nibRule) && nibRule.width !== 'full') {
      p1 += '<div class="top-band">';
      p1 += '<div class="top-left">';
      p1 += sectionBlock(bag.nibbles.name, bag.nibbles.dishes, nibRule, 'wide');
      p1 += '</div>';
      p1 += '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
      p1 += '</div>';
    } else {
      p1 += '<div class="top-band top-band-logo">';
      p1 += '<div class="top-left"></div>';
      p1 += '<div class="top-right"><img class="logo-tr" src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
      p1 += '</div>';
      if (bag.nibbles) {
        p1 += '<section class="sec">' + sectionBlock(bag.nibbles.name, bag.nibbles.dishes, nibRule, 'wide') + '</section>';
      }
    }

    if (bag.starters) {
      p1 += '<section class="sec">' + sectionBlock(bag.starters.name, bag.starters.dishes, startRule) + '</section>';
    }
    if (bag.sharing) {
      p1 += '<section class="sec">' + sectionBlock(bag.sharing.name, bag.sharing.dishes, shareRule) + '</section>';
    }
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isDessert(s.name) && !isSandwich(s.name) && !isBurgers(s.name)) {
        var otherRule = ruleFor(s.name, plan);
        p1 += '<section class="sec">' + sectionBlock(s.name, s.dishes, otherRule) + '</section>';
      }
    });

    // Column block: Pub Classics (left) | Burgers + Stay a While below (right)
    var split = splitClassicsBag(bag.classics);
    var burgerDishes = (bag.burgers && bag.burgers.dishes && bag.burgers.dishes.length)
      ? bag.burgers.dishes.slice()
      : split.burgers.slice();
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
    var showColBlock = classicDishes.length || burgerDishes.length || p1opts.rooms || p1opts.sandwiches ||
      (p1opts.sidesOnP1 && sidesPrint);
    var classicsAsColumn = wantsColumn(classRule) || wantsColumn(burgRule) || !!burgerDishes.length;
    var sandwichesAsColumn = wantsColumn(sandRule);
    var burgersOnRight = !!(layout.p1 && layout.p1.classicsSplit) || !!burgerDishes.length;

    if (showColBlock && classicsAsColumn) {
      p1 += '<section class="sec classics-block">';
      p1 += '<div class="cols cols-classics">';
      p1 += '<div class="col col-dishes">';
      if (classicDishes.length) {
        p1 += framedBlock(sectionTitle('Pub Classics') + listDishes(classicDishes), classRule);
      }
      if (burgerDishes.length && !burgersOnRight) {
        p1 += framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule);
      }
      if (!classicDishes.length && !(burgerDishes.length && !burgersOnRight)) p1 += '&nbsp;';
      p1 += '</div><div class="col col-promo">';
      if (burgerDishes.length && burgersOnRight) {
        p1 += framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule);
      }
      if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
      if (p1opts.sandwiches && sandwichesAsColumn) {
        // sandwichNote already frames; honour “no frilly” by stripping to plain if needed
        if (sandRule.frame) p1 += renderFiller('sandwiches', bag);
        else {
          p1 += '<div class="promo sandwich-promo sec-plain">' +
            '<div class="promo-head"><span class="promo-title">Sandwiches</span></div>' +
            '<p class="note-line">(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)</p>' +
            '<p class="desc">Filled ciabatta or farmhouse sandwich, all served with fries and salad.</p>' +
            '<p class="note-line">Ask waiting staff for today’s fillings</p></div>';
        }
      }
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule)) {
        p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
      }
      p1 += '</div></div></section>';
    } else if (classicDishes.length || burgerDishes.length) {
      // Full-width classics / burgers when designer chose full
      if (classicDishes.length) {
        p1 += '<section class="sec">' + framedBlock(sectionTitle('Pub Classics') + listDishes(classicDishes), classRule) + '</section>';
      }
      if (burgerDishes.length) {
        p1 += '<section class="sec">' + framedBlock(sectionTitle('Burgers') + listDishes(burgerDishes), burgRule) + '</section>';
      }
      if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
      if (p1opts.sandwiches) p1 += renderFiller('sandwiches', bag);
    } else if (p1opts.rooms || p1opts.sandwiches) {
      p1 += '<section class="sec classics-block"><div class="cols cols-classics">';
      p1 += '<div class="col col-dishes">&nbsp;</div><div class="col col-promo">';
      if (p1opts.rooms) p1 += renderFiller('rooms', bag, promos);
      if (p1opts.sandwiches) p1 += renderFiller('sandwiches', bag);
      p1 += '</div></div></section>';
    }

    if (layout.pages === 1) {
      if (bag.mains) p1 += '<section class="sec">' + sectionBlock(bag.mains.name, bag.mains.dishes, mainRule) + '</section>';
      if (bag.desserts) p1 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';
      if (sidesPrint && !p1opts.sidesOnP1) {
        p1 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
      }
      if (bag.sauces) p1 += '<section class="sec">' + sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes) + '</section>';
      if (p1opts.sandwiches && !showColBlock) p1 += renderFiller('sandwiches', bag);
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
    if (bag.mains) p2 += '<section class="sec">' + sectionBlock(bag.mains.name, bag.mains.dishes, mainRule) + '</section>';
    if (bag.desserts) p2 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';

    var showBottom = (p2opts.sidesOnP2 && (sidesPrint || bag.sauces)) || p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      var sidesCol = sidesPrint && wantsColumn(sideRule);
      var sideList = (p2opts.sidesOnP2 && sidesPrint) ? sidesPrint.dishes.slice() : [];
      var mid = Math.ceil(sideList.length / 2);
      var sidesLeft = sideList.slice(0, mid);
      var sidesRight = sideList.slice(mid);
      // Split sides across two columns; sandwiches share the right for balance + bigger type room above.
      if ((sidesCol || p2opts.sandwiches || p2opts.rooms) && (sideList.length || p2opts.sandwiches || p2opts.rooms)) {
        p2 += '<div class="cols bottom-cols bottom-cols-balanced">';
        p2 += '<div class="col col-sides">';
        if (sideList.length) {
          p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
          p2 += listDishes(sidesLeft.length ? sidesLeft : sideList);
        } else if (p2opts.sidesOnP2 && bag.sauces) {
          p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          p2 += listDishes(bag.sauces.dishes);
        } else {
          p2 += '&nbsp;';
        }
        p2 += '</div><div class="col col-sides-b">';
        if (sidesRight.length) {
          if (!sidesLeft.length) p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
          else p2 += '<div class="sec-title soft-left sec-title-spacer" aria-hidden="true">&nbsp;</div>';
          p2 += listDishes(sidesRight);
        }
        if (p2opts.sidesOnP2 && bag.sauces && sideList.length) {
          p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          p2 += listDishes(bag.sauces.dishes);
        }
        if (p2opts.sandwiches) p2 += renderFiller('sandwiches', bag, promos, { alignTitle: true });
        else if (p2opts.rooms) p2 += renderFiller('rooms', bag, promos);
        if (!sidesRight.length && !p2opts.sandwiches && !p2opts.rooms && !(p2opts.sidesOnP2 && bag.sauces)) {
          p2 += '&nbsp;';
        }
        p2 += '</div></div>';
      } else if (p2opts.sidesOnP2 && sidesPrint) {
        p2 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
      }
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
    // Match Eight Bells Canva website PDFs: Roboto dishes, Trajan-like Cinzel
    // titles, Crimson Text allergy line. Generous titles/logo; roomy dish type.
    return (
      '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap");' +
      ':root{--ink:' + INK + ';--green:' + GREEN + ';--serif:"Cinzel",Georgia,serif;--sans:"Roboto",Helvetica,Arial,sans-serif;--allergy:"Crimson Text",Georgia,serif;' +
        '--dish-gap:14px;--sec-gap:20px;--name:12pt;--desc:10.5pt;--title:22pt;--promo:12.5pt}' +
      '*{box-sizing:border-box} body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button,.toolbar label.paper-opt{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar label.paper-opt{display:inline-flex;align-items:center;gap:6px;background:#3a342c;color:#f4eae3}' +
      '.toolbar label.paper-opt input{margin:0}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet,.cut-sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;height:297mm;padding:6mm 10mm 8mm;position:relative;display:flex;flex-direction:column;overflow:hidden}' +
      '.page-body{flex:0 0 auto;display:flex;flex-direction:column;justify-content:flex-start;min-height:0}' +
      '.page-spacer{flex:1 1 auto;min-height:2mm}' +
      '.page-body > .sec,.page-body > .top-band,.page-body > .cols,.page-body > .classics-block,.page-body > .foot-logo,.page-body > .lunch-box{flex:0 0 auto}' +
      '.scallop,.sec,.cols,.foot-logo,.lunch-box,.col-promo{page-break-inside:avoid}' +
      '.sheet.landscape{width:297mm;min-height:210mm;height:auto}' +
      '.sheet-inner{display:grid;grid-template-columns:1fr 1fr;min-height:210mm}' +
      '.card-face{padding:8mm 8mm 7mm;border-right:1px dashed #cfc7bb;position:relative}' +
      '.card-face:last-child{border-right:0}' +
      '.tracker{display:flex;justify-content:space-between;align-items:baseline;font-size:7pt;letter-spacing:.04em;text-transform:uppercase;color:#a39b91;margin:0 0 1px;font-weight:400;flex:0 0 auto}' +
      '.tracker .roman{font-family:var(--sans)!important;font-size:4pt!important;font-weight:400!important;letter-spacing:.02em;color:#c4bcb2!important;text-transform:none;opacity:.7;line-height:1}' +
      '.tracker-roman-only{justify-content:flex-end;margin-bottom:0}' +
      '.sec-plain{margin:0 0 10px}' +
      '.scallop .sec-title,.sec-plain .sec-title{text-align:left}' +
      '.top-band{display:grid;grid-template-columns:1fr 320px;gap:14px;align-items:start;margin:0 0 14px}' +
      '.top-band-logo{grid-template-columns:1fr 320px;min-height:72mm}' +
      '.top-left .scallop{margin-bottom:0}' +
      '.top-right{display:flex;align-items:flex-start;justify-content:flex-end;padding-top:0}' +
      '.logo-tr{width:300px!important;height:auto;display:block;margin-left:auto;max-width:100%}' +
      '.logo{display:block;width:54px;margin:0 auto 4px}' +
      '.foot-logo{text-align:center;margin:10px 0 4px}' +
      '.foot-logo img{width:120px;height:auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:17px;letter-spacing:.06em;text-align:center;text-transform:uppercase;margin:2px 0 8px}' +
      '.sec{margin:0 0 var(--sec-gap)}' +
      '.sec-title{font-family:var(--serif)!important;font-weight:700;font-size:var(--title)!important;letter-spacing:.16em;text-transform:uppercase;margin:0 0 14px;text-align:center;line-height:1.15}' +
      '.sec-title.soft-left{text-align:left;letter-spacing:.14em;margin:0 0 10px}' +
      '.sec-title-spacer{visibility:hidden;margin:0 0 10px}' +
      '.scallop .sec-title{text-align:left;font-size:calc(var(--title) - 2pt);letter-spacing:.14em;margin-bottom:8px}' +
      '.sec-title.soft{font-size:calc(var(--title) - 3pt);letter-spacing:.12em}' +
      '.sec-title.under{text-align:center;text-decoration:underline;text-underline-offset:3px;margin-top:12px}' +
      '.scallop{margin:0 0 14px;background:#fff;position:relative;' +
        'border-style:solid;border-color:transparent;border-width:16px;' +
        'border-image-slice:48 fill;border-image-repeat:stretch;border-image-width:16px;' +
        'overflow:visible}' +
      '.scallop-wide{border-image-source:url("' + asset('frame-wide.png') + '");border-width:14px;border-image-width:14px;border-image-slice:42 fill}' +
      '.scallop-box{border-image-source:url("' + asset('frame-box.png') + '");border-width:14px;border-image-width:14px;border-image-slice:48 fill}' +
      '.scallop-pad{padding:6px 10px 5px;overflow:visible}' +
      '.scallop-box .scallop-pad{padding:6px 10px 6px}' +
      '.dish{margin:0 0 var(--dish-gap);min-width:0}' +
      '.dish-line{display:grid;grid-template-columns:minmax(0,max-content) minmax(12px,1fr) auto;column-gap:0;align-items:baseline;min-width:0}' +
      '.dish-name{font-family:var(--sans);font-weight:700;font-size:var(--name);line-height:1.28;min-width:0;overflow-wrap:anywhere}' +
      '.dish-leader{display:block;border-bottom:1px dotted #b0a89c;margin:0 6px 3px;min-width:12px;height:0}' +
      '.price{font-family:var(--sans);font-weight:500;font-size:var(--name);white-space:nowrap;padding-left:2px}' +
      '.desc{font-family:var(--sans);font-weight:400;font-size:var(--desc);color:#3a342c;margin-top:2px;line-height:1.4;max-width:100%}' +
      '.dish .desc,.promo .desc,.sandwich-promo .desc{font-weight:400}' +
      '.tags{color:var(--green);font-style:italic;font-weight:400;font-size:var(--desc)}' +
      '.dish-c{text-align:center;margin:0 0 var(--dish-gap)}' +
      '.dish-c .dish-name{font-family:var(--serif);font-size:var(--name);letter-spacing:.02em}' +
      '.dish-c .dish-line{grid-template-columns:1fr;justify-items:center}' +
      '.dish-c .dish-leader{display:none}' +
      '.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:8px 0 10px;align-items:start}' +
      '.cols-classics{grid-template-columns:1fr 1fr}' +
      '.col-dishes,.col-promo,.col-sides,.col-sides-b{min-width:0;max-width:100%}' +
      '.col-dishes .sec-title,.col-promo .sec-title{text-align:left;margin-top:4px}' +
      '.col-dishes .sec-title:first-child,.col-promo .sec-title:first-child{margin-top:0}' +
      '.col-promo .scallop{max-width:100%;width:100%}' +
      '.col-promo .promo p,.col-promo .promo .desc{font-size:10.5pt;line-height:1.4;margin:0 0 6px;font-weight:400}' +
      '.promo-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 4px}' +
      '.promo-head.pair-head{margin:0 0 6px}' +
      '.promo-head.pair-head .sec-title{margin:0}' +
      '.sandwich-aligned{margin:10px 0 0}' +
      '.sandwich-aligned .scallop{margin-top:0}' +
      '.bottom-cols{margin-top:16px;margin-bottom:4px}' +
      '.bottom-cols-balanced{grid-template-columns:1fr 1fr;gap:20px}' +
      '.bottom-cols .sec-title{text-align:left}' +
      '.allergy{font-family:var(--allergy);color:var(--green);font-style:italic;font-size:10.5pt;text-align:center;line-height:1.4;margin-top:10px;flex:0 0 auto}' +
      '.promo{text-align:left}' +
      '.promo-title{font-family:var(--serif);font-weight:700;font-size:var(--promo);letter-spacing:.1em;text-transform:uppercase;margin:2px 0 2px}' +
      '.promo-date{font-family:var(--sans);font-weight:500;font-size:9.5pt;letter-spacing:.02em;text-transform:none;color:#5a534a}' +
      '.promo p{font-size:10.5pt;font-weight:400;margin:0 0 6px;line-height:1.4}' +
      '.sandwich-promo .note-line{font-weight:500}' +
      '.sandwich-promo .desc{font-weight:400;color:#3a342c}' +
      '.lunch-box{display:flex;gap:10px;align-items:center;font-size:11pt}' +
      '.lc{width:14px;height:14px;vertical-align:-2px;margin-right:4px;display:inline-block}' +
      '.lunch-box .lc{width:22px;height:22px;flex:0 0 auto}' +
      '.note-line{font-size:10.5pt;font-weight:500;margin:4px 0}' +
      '.days{position:absolute;top:18mm;left:6mm;font-family:var(--serif);font-size:9px;font-weight:700;line-height:1.35;letter-spacing:.05em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:18px;text-align:center;line-height:1.15;margin:2px 0 8px}' +
      '.lc-price{font-family:var(--serif);text-align:center;font-size:12px;line-height:1.45}' +
      '.lb-foot{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:13px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:16px;margin:5px 0}' +
      /* Density floors stay large — balanced columns free space for bigger type */ +
      '.fill-airy{--dish-gap:16px;--sec-gap:24px;--name:13pt;--desc:11pt;--title:24pt;--promo:13pt}' +
      '.fill-roomy{--dish-gap:15px;--sec-gap:22px;--name:12.5pt;--desc:10.75pt;--title:23pt;--promo:12.5pt}' +
      '.fill-normal{--dish-gap:14px;--sec-gap:20px;--name:12pt;--desc:10.5pt;--title:22pt;--promo:12.5pt}' +
      '.fill-tight{--dish-gap:10px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:18pt;--promo:11.5pt}' +
      /* 2×A5 on A4 landscape — cut down the middle */ +
      '.cut-sheet{width:297mm;height:210mm;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;position:relative;overflow:hidden}' +
      '.cut-sheet::after{content:"";position:absolute;top:4mm;bottom:4mm;left:50%;width:0;border-left:1px dashed #c5bdb0;pointer-events:none}' +
      '.a5-face{width:148.5mm;height:210mm;padding:6mm 7mm 7mm;overflow:hidden;display:flex;flex-direction:column}' +
      '.a5-face .page-body{flex:0 0 auto}' +
      '.a5-face .page-spacer{flex:1 1 auto;min-height:2mm}' +
      '.a5-face{--dish-gap:8px;--sec-gap:11px;--name:10.5pt;--desc:9.5pt;--title:13pt;--promo:10.5pt}' +
      '.a5-face .logo-tr{width:150px!important}' +
      '.a5-face .top-band,.a5-face .top-band-logo{grid-template-columns:1fr 138px;gap:8px;min-height:34mm}' +
      '.a5-face .tracker{font-size:6pt;margin-bottom:1px}' +
      '.a5-face .tracker .roman{font-size:3.5pt!important}' +
      '.a5-face .allergy{font-size:8.5pt}' +
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
