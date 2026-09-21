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

  function weekLabel(d) {
    var mon = weekStart(d);
    var day = mon.getDate();
    var ord = (day % 10 === 1 && day !== 11) ? 'st'
      : (day % 10 === 2 && day !== 12) ? 'nd'
      : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return 'Week of ' + day + ord + ' ' + months[mon.getMonth()] + ' ' + mon.getFullYear();
  }

  function weekKey(d) {
    var mon = weekStart(d);
    return mon.getFullYear() + '-' + (mon.getMonth() + 1) + '-' + mon.getDate();
  }

  /** Next Roman print number for this menu in the current week. */
  function nextPrintVersion(menuId) {
    var key = 'eb-print-ver-' + menuId + '-' + weekKey();
    var n = 0;
    try { n = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch (e) {}
    n += 1;
    try { localStorage.setItem(key, String(n)); } catch (e) {}
    return { n: n, roman: toRoman(n), week: weekLabel(), weekKey: weekKey() };
  }

  function trackerBar(ver) {
    return (
      '<div class="tracker">' +
        '<span>' + esc(ver.week) + '</span>' +
        '<span class="roman">' + esc(ver.roman) + '</span>' +
      '</div>'
    );
  }

  function lunchMark() {
    return '<img class="lc" src="' + esc(asset('lunch-club-mark.png')) + '" alt="">';
  }

  function allergy() {
    return (
      '<div class="allergy">' +
        'Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can’t guarantee it’s allergen-free.<br>' +
        'gf – gluten free &nbsp;&nbsp; v – vegetarian &nbsp;&nbsp; vg – vegan' +
      '</div>'
    );
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
    if (!opts.hidePrice && d.price) html += '<span class="price">' + esc(d.price) + '</span>';
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
    // kind: 'wide' | 'box' (selling / sandwiches)
    var cls = kind === 'box' ? 'scallop scallop-box' : 'scallop scallop-wide';
    return '<div class="' + cls + '"><div class="scallop-pad">' + inner + '</div></div>';
  }

  function sectionTitle(name) {
    return '<div class="sec-title">' + esc(name) + '</div>';
  }

  function promoRooms() {
    return scallop(
      '<div class="promo">' +
        '<div class="promo-title">Stay a While</div>' +
        '<p>we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.</p>' +
        '<div class="promo-title">Gatherings</div>' +
        '<p>whether it’s a quiet supper or a special get together, we’re always happy to host your event</p>' +
      '</div>',
      'box'
    );
  }

  function sandwichNote(dishes) {
    var price = 'all 9.50';
    if (dishes && dishes.length) {
      var prices = {};
      dishes.forEach(function (d) { if (d.price) prices[d.price] = true; });
      var keys = Object.keys(prices);
      if (keys.length === 1) price = 'all ' + keys[0];
    }
    return scallop(
      '<div class="promo sandwich-promo">' +
        '<div class="dish-line"><span class="sec-title" style="margin:0;text-align:left">Sandwiches</span>' +
        '<span class="price">' + esc(price) + '</span></div>' +
        '<p class="note-line">(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)</p>' +
        '<p>filled ciabatta or farmhouse sandwich<br>all served with fries and salad.</p>' +
        '<p class="note-line">See our Sandwich menu for today’s fillings</p>' +
      '</div>',
      'box'
    );
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
  function planFluidLayout(menu, dishes) {
    var bag = pickSections(dishes || []);
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

    var totalDishUnits = 0;
    (dishes || []).forEach(function (d) { totalDishUnits += dishUnits(d); });

    var layout = {
      pages: 1,
      fit: 'one',
      mode: 'single',
      bag: bag,
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
      var add = tryAdd(left1, COST.rooms);
      if (add.ok) { layout.p1.rooms = true; left1 = add.left; layout.fillers.push('Stay a While / Gatherings'); }
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
      if (bag.classics && bag.classics.dishes.length >= 3 && layout.p1.rooms) {
        layout.p1.classicsSplit = 1;
      }
    } else if (hasBackContent || oneNeed > PAGE) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = { rooms: false, sandwiches: false, lunchClub: false, footLogo: false, sidesOnP2: true };

      var p1used = front;
      var p1left = PAGE - p1used;
      // Selling bits on page 1 beside classics when they fit (Nov)
      var addR = tryAdd(p1left, COST.rooms);
      if (addR.ok) {
        layout.p1.rooms = true;
        p1left = addR.left;
        layout.fillers.push('Stay a While / Gatherings (page 1)');
        if (bag.classics && bag.classics.dishes.length >= 3) layout.p1.classicsSplit = 1;
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
      layout.leftover.p1 = p1left;

      var p2used = back + COST.bottomCols;
      if (layout.p2.sidesOnP2 && bag.sides) { /* already in back */ }
      var p2left = PAGE - p2used;
      if (wantSandwichNote && !layout.p1.sandwiches) {
        var addSx = tryAdd(p2left, COST.sandwiches);
        if (addSx.ok) {
          layout.p2.sandwiches = true;
          p2left = addSx.left;
          layout.fillers.push('Sandwiches box (page 2)');
        }
      }
      if (!layout.p1.rooms) {
        var addRooms2 = tryAdd(p2left, COST.rooms);
        if (addRooms2.ok) {
          layout.p2.rooms = true;
          p2left = addRooms2.left;
          layout.fillers.push('Stay a While / Gatherings (page 2)');
        }
      }
      if (bag.hasLunch) {
        var addL = tryAdd(p2left, COST.lunchClub);
        if (addL.ok) {
          layout.p2.lunchClub = true;
          p2left = addL.left;
          layout.fillers.push('Lunch club note (page 2)');
        }
      }
      var addLogo = tryAdd(p2left, COST.footLogo);
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
      (layout.fit === 'one' ? 'Fits on one A4.' :
        layout.fit === 'two' ? 'Runs to two A4 pages. Type stays the same size.' :
          'Too full for two pages. Take dishes off. A promo never opens another page.') +
      ' Layout picks columns from ' + bag.count + ' dishes.' + bits;

    return layout;
  }

  function listDishes(list) {
    return (list || []).map(function (d) { return dishRow(d); }).join('');
  }

  function renderFiller(which, bag) {
    if (which === 'rooms') return promoRooms();
    if (which === 'sandwiches') return sandwichNote(bag.sandwiches && bag.sandwiches.dishes);
    if (which === 'lunch') return lunchClubBox();
    if (which === 'logo') {
      return '<div class="foot-logo"><img src="' + esc(asset('eight-bells-logo.png')) + '" alt="The Eight Bells"></div>';
    }
    return '';
  }

  function buildLong(menu, dishes, plan, ver) {
    var layout = (plan && plan.layout) || planFluidLayout(menu, dishes);
    var bag = layout.bag || pickSections(dishes);
    var p1opts = layout.p1 || {};
    var p2opts = layout.p2;

    var p1 = '<div class="page">';
    p1 += trackerBar(ver);
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
      if (!isMains(s.name) && !isDessert(s.name)) {
        p1 += '<section class="sec">' + sectionTitle(s.name) + listDishes(s.dishes) + '</section>';
      }
    });

    // Classics / selling column — fluid: split + rooms, or Jul-style sandwiches+sides
    if (bag.classics || p1opts.rooms || p1opts.sandwiches) {
      var rightBits = '';
      if (bag.classics) {
        var split = p1opts.classicsSplit || 0;
        var left = bag.classics.dishes.slice(0, bag.classics.dishes.length - split);
        var right = bag.classics.dishes.slice(bag.classics.dishes.length - split);
        p1 += '<section class="sec">' + sectionTitle(bag.classics.name);
        p1 += '<div class="cols"><div class="col">' + listDishes(left) + '</div><div class="col">';
        if (right.length) p1 += listDishes(right);
        if (p1opts.rooms) p1 += renderFiller('rooms', bag);
        if (p1opts.sandwiches) p1 += renderFiller('sandwiches', bag);
        if (p1opts.sidesOnP1 && bag.sides) {
          p1 += sectionTitle(bag.sides.name) + listDishes(bag.sides.dishes);
        }
        p1 += '</div></div></section>';
      } else {
        p1 += '<div class="cols"><div class="col"></div><div class="col">';
        if (p1opts.rooms) p1 += renderFiller('rooms', bag);
        if (p1opts.sandwiches) p1 += renderFiller('sandwiches', bag);
        p1 += '</div></div>';
      }
    }

    // Single-page: also place mains/desserts/sides on page 1
    if (layout.pages === 1) {
      if (bag.mains) p1 += '<section class="sec">' + sectionTitle(bag.mains.name) + listDishes(bag.mains.dishes) + '</section>';
      if (bag.desserts) p1 += '<section class="sec">' + sectionTitle(bag.desserts.name) + listDishes(bag.desserts.dishes) + '</section>';
      if (bag.sides && !p1opts.sidesOnP1) {
        p1 += '<section class="sec">' + sectionTitle(bag.sides.name) + listDishes(bag.sides.dishes) + '</section>';
      }
      if (bag.sauces) p1 += '<section class="sec">' + sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes) + '</section>';
      if (p1opts.sandwiches && !bag.classics) p1 += renderFiller('sandwiches', bag);
      if (p1opts.lunchClub) p1 += renderFiller('lunch', bag);
      if (p1opts.footLogo) p1 += renderFiller('logo', bag);
    }

    p1 += allergy();
    p1 += '</div>';

    if (layout.pages < 2 || !p2opts) return p1;

    var p2 = '<div class="page">';
    p2 += trackerBar(ver);
    if (bag.mains) p2 += '<section class="sec">' + sectionTitle(bag.mains.name) + listDishes(bag.mains.dishes) + '</section>';
    if (bag.desserts) p2 += '<section class="sec">' + sectionTitle(bag.desserts.name) + listDishes(bag.desserts.dishes) + '</section>';

    var showBottom = (p2opts.sidesOnP2 && (bag.sides || bag.sauces)) || p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      p2 += '<div class="cols bottom-cols"><div class="col">';
      if (p2opts.sidesOnP2 && bag.sides) p2 += sectionTitle(bag.sides.name) + listDishes(bag.sides.dishes);
      if (p2opts.sidesOnP2 && bag.sauces) p2 += sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes);
      if (!(p2opts.sidesOnP2 && (bag.sides || bag.sauces))) p2 += '&nbsp;';
      p2 += '</div><div class="col">';
      if (p2opts.sandwiches) p2 += renderFiller('sandwiches', bag);
      else if (p2opts.rooms) p2 += renderFiller('rooms', bag);
      p2 += '</div></div>';
    } else if (p2opts.rooms) {
      p2 += renderFiller('rooms', bag);
    }

    if (p2opts.lunchClub) p2 += renderFiller('lunch', bag);
    if (p2opts.footLogo) p2 += renderFiller('logo', bag);
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

  function css(landscape) {
    return (
      '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap");' +
      ':root{--ink:' + INK + ';--green:' + GREEN + ';--serif:"Cinzel",Georgia,serif;--sans:"Source Sans 3",system-ui,sans-serif}' +
      '*{box-sizing:border-box} body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;min-height:297mm;padding:10mm 14mm 12mm;position:relative;display:flex;flex-direction:column}' +
      '.sheet.landscape{width:297mm;min-height:210mm}' +
      '.sheet-inner{display:grid;grid-template-columns:1fr 1fr;min-height:210mm}' +
      '.card-face{padding:8mm 8mm 7mm;border-right:1px dashed #cfc7bb;position:relative}' +
      '.card-face:last-child{border-right:0}' +
      '.tracker{display:flex;justify-content:space-between;align-items:baseline;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#5a534a;margin:0 0 8px;font-weight:600}' +
      '.tracker .roman{font-family:var(--serif);font-size:14px;letter-spacing:.14em;color:var(--ink)}' +
      '.top-band{display:grid;grid-template-columns:1fr 88px;gap:10px;align-items:start;margin:0 0 8px}' +
      '.top-left .scallop{margin-bottom:0}' +
      '.logo-tr{width:84px;height:auto;display:block;margin-left:auto}' +
      '.logo{display:block;width:54px;margin:0 auto 4px}' +
      '.foot-logo{text-align:center;margin:14px 0 6px;margin-top:auto}' +
      '.foot-logo img{width:100px;height:auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:16px;letter-spacing:.08em;text-align:center;text-transform:uppercase;margin:2px 0 8px}' +
      '.sec{margin:0 0 10px}' +
      '.sec-title{font-family:var(--serif);font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 8px;text-align:center}' +
      '.scallop .sec-title{text-align:left;font-size:12px;letter-spacing:.14em;margin-bottom:6px}' +
      '.sec-title.soft{font-size:11px;letter-spacing:.1em}' +
      '.sec-title.under{text-align:center;text-decoration:underline;text-underline-offset:3px;margin-top:10px}' +
      '.scallop{margin:0 0 12px;background-color:#fff;background-repeat:no-repeat;background-position:center;background-size:100% 100%}' +
      '.scallop-wide{background-image:url("' + asset('frame-wide.png') + '")}' +
      '.scallop-box{background-image:url("' + asset('frame-box.png') + '")}' +
      '.scallop-pad{padding:14px 18px 12px}' +
      '.scallop-box .scallop-pad{padding:12px 14px 10px}' +
      '.dish{margin:0 0 8px}' +
      '.dish-line{display:flex;justify-content:space-between;gap:10px;align-items:baseline}' +
      '.dish-name{font-weight:700;font-size:11.5px}' +
      '.price{font-weight:600;font-size:11.5px;white-space:nowrap}' +
      '.desc{font-weight:300;font-size:10.5px;color:#333;margin-top:1px;padding-right:36px;line-height:1.3}' +
      '.tags{color:var(--green);font-style:italic;font-weight:400;font-size:10.5px}' +
      '.dish-c{text-align:center;margin:0 0 8px}' +
      '.dish-c .dish-name{font-family:var(--serif);font-size:11.5px;letter-spacing:.02em}' +
      '.cols{display:grid;grid-template-columns:1.08fr 0.92fr;gap:18px;margin:4px 0 8px;align-items:start}' +
      '.bottom-cols{margin-top:18px;margin-bottom:8px}' +
      '.bottom-cols .sec-title{text-align:left}' +
      '.allergy{color:var(--green);font-style:italic;font-size:9px;text-align:center;line-height:1.35;margin-top:10px}' +
      '.promo{text-align:left}' +
      '.promo-title{font-family:var(--serif);font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin:4px 0 2px}' +
      '.promo p{font-size:10.5px;font-weight:300;margin:0 0 8px;line-height:1.35}' +
      '.lunch-box{display:flex;gap:10px;align-items:center;font-size:11px}' +
      '.lunch-box .lc{width:22px;height:22px}' +
      '.lc{width:13px;height:13px;vertical-align:-2px;margin-right:3px}' +
      '.note-line{font-size:10px;font-weight:600;margin:4px 0}' +
      '.days{position:absolute;top:18mm;left:6mm;font-family:var(--serif);font-size:8.5px;font-weight:700;line-height:1.35;letter-spacing:.05em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:17px;text-align:center;line-height:1.15;margin:2px 0 8px}' +
      '.lc-price{font-family:var(--serif);text-align:center;font-size:11.5px;line-height:1.45}' +
      '.lb-foot{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:12px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:15px;margin:5px 0}' +
      '@media print{body{background:#fff}.toolbar{display:none}.page,.sheet{margin:0;box-shadow:none}' +
      (landscape ? '@page{size:A4 landscape;margin:0}' : '@page{size:A4 portrait;margin:0}') +
      '.page{page-break-after:always}.page:last-child{page-break-after:auto}}'
    );
  }

  function build(menu, dishes, plan) {
    var ver = nextPrintVersion(menu.id);
    var landscape = menu.kind === 'card';
    var layout = null;
    if (!landscape) {
      layout = planFluidLayout(menu, dishes);
      plan = plan || {};
      plan.layout = layout;
      plan.fit = layout.fit;
      plan.text = layout.summary;
    }
    var body = landscape
      ? buildCard(menu, dishes, plan, ver)
      : '<div class="sheet-stack">' + buildLong(menu, dishes, plan, ver) + '</div>';

    var fillerHint = layout && layout.fillers && layout.fillers.length
      ? ' Auto: ' + layout.fillers.join(' · ') + '.'
      : '';

    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(menu.name) + ' — ' + esc(ver.roman) + '</title>' +
      '<style>' + css(landscape) + '</style></head><body>' +
      '<div class="toolbar">' +
        '<button onclick="window.print()">Print / save as PDF</button>' +
        '<span class="hint">' + esc(ver.week) + ' · print ' + esc(ver.roman) +
        ' — fluid layout for what’s selected; selling boxes only if they fit.' +
        esc(fillerHint) + '</span>' +
      '</div>' +
      body +
      '</body></html>'
    );
  }

  root.EBMenuPrint = {
    build: build,
    planFluidLayout: planFluidLayout,
    toRoman: toRoman,
    weekLabel: weekLabel,
    weekKey: weekKey,
    nextPrintVersion: nextPrintVersion
  };
})(typeof window !== 'undefined' ? window : global);
