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
        'gf – gluten free &nbsp;&nbsp; v – vegetarian &nbsp;&nbsp; vg – vegan';
    if (opts.lunchClub) {
      // Lunch club note lives in the allergy footer (not a mid-page scallop box)
      html +=
        '<br><span class="allergy-lc">' + lunchMark() +
        ' Bells Lunch Club option — smaller options for smaller appetites, Monday to Thursday' +
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
   * Event panels: never cram a long bank into one tall box.
   * 1–2 items → one box; 3+ → multiple boxes of up to 2.
   */
  function renderPromoBank(promos, frameKind) {
    promos = (promos || []).filter(function (p) { return p && p.title; });
    if (!promos.length) return '';
    if (promos.length <= 2) return renderOnePromoBox(promos, frameKind);
    var html = '';
    for (var i = 0; i < promos.length; i += 2) {
      // Alternate frame within a tall stack so consecutive panels don’t match
      var kind = frameKind === 'wide'
        ? (i % 4 === 0 ? 'wide' : 'box')
        : (i % 4 === 0 ? 'box' : 'wide');
      html += renderOnePromoBox(promos.slice(i, i + 2), kind);
    }
    return html;
  }

  /**
   * Split event wording across the two columns so both columns finish
   * at roughly the same height (start aligned, end aligned).
   * At most one box per column (up to 2 blurbs each) — never a lonely
   * third/fourth scallop hanging under a short stack.
   * Paired panels always use opposite frames (rect box vs oval wide).
   */
  function splitPromosForColumns(promos, opts) {
    opts = opts || {};
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
    // Cap at four blurbs → two balanced boxes
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
      return Math.max(COST.sandwiches, sectionUnits({ name: 'Sandwiches', dishes: dishes }, true));
    }
    return COST.sandwiches;
  }

  /**
   * Sandwiches on a long sheet: category spiel (hours etc.) plus the dish list.
   * Frilly box only when Blocks → Sandwiches → Frilly is Yes (not hard-coded).
   */
  function sandwichesBlock(bag, opts) {
    opts = opts || {};
    var dishes = sandwichDishesOf(bag);
    var rule = opts.rule || { frame: true, note: '' };
    var wantFrame = !!rule.frame;
    var frameKind = opts.frame === 'wide' ? 'wide' : 'box';
    var note = (opts.note != null && String(opts.note).trim())
      ? String(opts.note).trim()
      : String(rule.note || '').trim();
    if (!dishes.length) {
      var spiel = note ||
        '(12 – 2.45 pm Mon to Fri; 12 – 4.30 pm Sat)\nAll served with fries and salad.';
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
    return /item\s*boost|specials?|fish of the day|pie of the day|catch of the day|chef.?s special/i.test(
      String(name || '').trim()
    );
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
      nibbles: null, starters: null, sharing: null, boost: null, classics: null, burgers: null,
      mains: null, littleBells: null, desserts: null, sides: null, sandwiches: null, sauces: null,
      other: [], hasLunch: false, count: dishes.length
    };
    var straySandwiches = [];
    sections.forEach(function (s) {
      if (isNibbles(s.name) && !bag.nibbles) bag.nibbles = s;
      else if (isStarters(s.name) && !bag.starters) bag.starters = s;
      else if (isSharing(s.name) && !bag.sharing) bag.sharing = s;
      else if (isItemBoost(s.name) && !bag.boost) bag.boost = { name: 'Item Boost', dishes: s.dishes };
      else if (isBurgers(s.name) && !bag.burgers) bag.burgers = s;
      else if (isClassics(s.name) && !bag.classics) {
        // Keep every staff-assigned classic here — including a lone burger filed as classic.
        bag.classics = { name: 'Pub Classics', dishes: (s.dishes || []).slice() };
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
    // Item Boost defaults to a frilly frame (Fish of the Day, etc.)
    if (bag.boost) front += sectionUnits(bag.boost, true);
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isDessert(s.name) && !isBurgers(s.name) && !isLittleBells(s.name)) {
        front += sectionUnits(s, false);
      }
    });
    if (bag.classics) front += sectionUnits(bag.classics, false);
    if (bag.burgers) front += sectionUnits(bag.burgers, false);

    var back = chrome;
    if (bag.mains) back += sectionUnits(bag.mains, false);
    if (bag.littleBells) back += sectionUnits(bag.littleBells, true);
    if (bag.desserts) back += sectionUnits(bag.desserts, false);
    if (bag.sides) back += sectionUnits(bag.sides, false);
    if (bag.sauces) back += sectionUnits(bag.sauces, false);
    // sandwich dish list + spiel when fillings exist; otherwise the short selling note
    var wantSandwiches = menu.id === 'main' || menu.id === 'sunday' || !!bag.sandwiches;
    var sandDishCount = sandwichDishesOf(bag).length;
    var sandCost = sandwichesPackCost(bag);
    var hasBackContent = !!(bag.mains || bag.littleBells || bag.desserts || bag.sides || bag.sauces || bag.sandwiches);

    var layout = {
      pages: 1,
      fit: 'one',
      mode: 'single',
      bag: bag,
      promos: promos || [],
      p1: { rooms: false, sandwiches: false, footLogo: false, classicsSplit: 0, sidesOnP1: false },
      p2: null,
      leftover: { p1: 0, p2: 0 },
      summary: '',
      fillers: []
    };
    if (bag.hasLunch) layout.fillers.push('Lunch club in allergy footer');

    // —— One page if everything (minus optional fillers) fits ——
    var oneNeed = front;
    if (bag.mains) oneNeed += sectionUnits(bag.mains, false);
    if (bag.littleBells) oneNeed += sectionUnits(bag.littleBells, true);
    if (bag.desserts) oneNeed += sectionUnits(bag.desserts, false);
    if (bag.sides) oneNeed += sectionUnits(bag.sides, false);
    if (bag.sauces) oneNeed += sectionUnits(bag.sauces, false);
    // If we have a natural back half (mains + sides), prefer two pages like Jul/Nov
    // when the front alone is already chunky, or one page would be cramped.
    var preferTwo = hasBackContent && (bag.mains || bag.littleBells || bag.desserts) && (
      front > 55 || oneNeed > PAGE - 4 || bag.count >= 18
    );

    if (!preferTwo && oneNeed <= PAGE) {
      layout.pages = 1;
      layout.fit = 'one';
      layout.mode = 'single';
      var left1 = PAGE - oneNeed;
      // Pack Stay a While / events into leftover — leave a safety margin so
      // browser density steps are not forced into clipping on page 1.
      var add;
      var safety = 6;
      if (wantPromoBox) {
        add = tryAdd(left1, promoCost + safety);
        if (add.ok) { layout.p1.rooms = true; left1 = add.left + safety; layout.fillers.push(promoLabel); }
      }
      if (wantSandwiches) {
        add = tryAdd(left1, sandCost + (bag.sides ? 0 : 0));
        if (add.ok) {
          layout.p1.sandwiches = true;
          left1 = add.left;
          layout.fillers.push(sandDishCount ? 'Sandwiches (page 1)' : 'Sandwiches box (page 1)');
        }
      }
      if (bag.sides && layout.p1.sandwiches) layout.p1.sidesOnP1 = true;
      add = tryAdd(left1, COST.footLogo);
      if (add.ok) { layout.p1.footLogo = true; left1 = add.left; layout.fillers.push('Logo'); }
      layout.leftover.p1 = left1;
      // Burgers + Classics stack on the right; events fill the left (balanced columns).
      layout.p1.classicsSplit = (bag.burgers || (bag.classics && bag.classics.dishes)) ? 1 : 0;
    } else if (hasBackContent || oneNeed > PAGE) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = { rooms: false, sandwiches: false, footLogo: false, sidesOnP2: true };
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
        // Named fillings belong on page 1 beside Burgers/Classics; spiel-only note can sit on page 2.
        var preferSandP1 = sandDishCount > 0;
        var addSandP1 = tryAdd(p1left, sandCost + (preferSandP1 ? 0 : 2));
        if (preferSandP1 && addSandP1.ok) {
          layout.p1.sandwiches = true;
          p1left = addSandP1.left;
          layout.leftover.p1 = p1left;
          layout.fillers.push('Sandwiches (page 1)');
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
              layout.p1.sidesOnP1 = !!bag.sides;
              layout.p2.sidesOnP2 = !bag.sides;
              layout.leftover.p1 = addS.left;
              layout.fillers.push(sandDishCount ? 'Sandwiches (page 1)' : 'Sandwiches + sides (page 1)');
            }
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
      (layout.fit === 'one' ? 'Fills one A4 top to bottom (spread gaps if sparse).' :
        layout.fit === 'two' ? 'Fills two A4 pages top to bottom — never a third page.' :
          'Too much for two readable pages. Remove sections or put Desserts / Little Bells / Sandwiches on separate card menus.') +
      ' Columns start and finish level. Layout from ' + bag.count + ' dishes.' + bits;

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
    return map[key] || { width: 'full', frame: false, note: '' };
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
    var mainRule = ruleFor('Mains', plan);
    var littleRule = ruleFor('Little Bells', plan);
    var sandRule = ruleFor('Sandwiches', plan);
    var sideRule = ruleFor('Sides', plan);
    var dessRule = ruleFor('Desserts', plan);

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
      if (!isMains(s.name) && !isDessert(s.name) && !isSandwich(s.name) && !isBurgers(s.name) &&
          !isItemBoost(s.name) && !isLittleBells(s.name)) {
        var otherRule = ruleFor(s.name, plan);
        p1 += '<section class="sec">' + sectionBlock(s.name, s.dishes, otherRule) + '</section>';
      }
    });

    if (showColBlock && classicsAsColumn) {
      // Logo already in top-band when starters/nibbles sit there — columns start level below
      var logoInTop = nibblesInTop || startersInTop;
      p1 += '<section class="sec classics-block">';
      p1 += '<div class="cols cols-classics cols-balanced cols-features' +
        (logoInTop ? '' : ' cols-with-logo') + '">';
      var sandOnRightNote = !!(sandwichesInCol && !sandList.length && (burgerDishes.length || classicDishes.length));
      var promoFrameOpts = sandOnRightNote
        ? { leftFrame: 'wide', rightFrame: 'box' }
        : { leftFrame: 'box', rightFrame: 'wide' };
      var promoCols = p1opts.rooms ? splitPromosForColumns(promos, promoFrameOpts) : { left: '', right: '' };
      var leftFeature = p1opts.rooms
        ? (promoCols.left || renderFiller('rooms', bag, promos, { frame: promoFrameOpts.leftFrame }))
        : '';
      var rightFeature = (p1opts.rooms && promoCols.right) ? promoCols.right : '';

      // LEFT — Sharing, Sandwiches; event panel pins to the foot
      p1 += '<div class="col col-events">';
      p1 += '<div class="col-body">';
      if (shareInLeft) {
        p1 += framedBlock(
          sectionTitle(bag.sharing.name) + listDishes(shareDishes),
          shareRule
        );
      }
      if (sandwichesInCol && (sandList.length || !(burgerDishes.length || classicDishes.length))) {
        p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'box' : undefined, rule: sandRule });
      }
      if (!shareInLeft &&
          !(sandwichesInCol && sandList.length) && !leftFeature) {
        p1 += '&nbsp;';
      }
      p1 += '</div>';
      if (leftFeature) p1 += '<div class="col-feature">' + leftFeature + '</div>';
      p1 += '</div>';

      // RIGHT — Logo only if not already in top-band; then Burgers + Pub Classics lower
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
      if (sandwichesInCol && !sandList.length && (burgerDishes.length || classicDishes.length)) {
        p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'box' : undefined, rule: sandRule });
      }
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule)) {
        p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
      }
      if (!burgerDishes.length && !classicDishes.length && !rightFeature &&
          !(sandwichesInCol && !sandList.length)) {
        p1 += '&nbsp;';
      }
      p1 += '</div>';
      if (rightFeature) p1 += '<div class="col-feature">' + rightFeature + '</div>';
      p1 += '</div></div></section>';
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
      if (bag.littleBells) {
        p1 += '<section class="sec">' + sectionBlock(bag.littleBells.name, bag.littleBells.dishes, littleRule) + '</section>';
      }
      if (bag.desserts) p1 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';
      if (sidesPrint && !p1opts.sidesOnP1) {
        p1 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
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
    p2 += trackerBar(ver, { hideDate: hideDate });
    p2 += '<div class="page-body page-body-start">';
    if (bag.mains) p2 += '<section class="sec">' + sectionBlock(bag.mains.name, bag.mains.dishes, mainRule) + '</section>';
    if (bag.littleBells) {
      p2 += '<section class="sec">' + sectionBlock(bag.littleBells.name, bag.littleBells.dishes, littleRule) + '</section>';
    }
    if (bag.desserts) p2 += '<section class="sec">' + sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule) + '</section>';

    var showBottom = (p2opts.sidesOnP2 && (sidesPrint || bag.sauces)) || p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      var sidesCol = sidesPrint && wantsColumn(sideRule);
      var sideList = (p2opts.sidesOnP2 && sidesPrint) ? sidesPrint.dishes.slice() : [];
      // Sides (and sauces) in the left column; Sandwiches fully in the frilly box on the right.
      if ((sidesCol || p2opts.sandwiches || p2opts.rooms) && (sideList.length || p2opts.sandwiches || p2opts.rooms || bag.sauces)) {
        p2 += '<div class="cols bottom-cols">';
        p2 += '<div class="col col-sides">';
        if (sideList.length) {
          p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
          p2 += listDishes(sideList);
        }
        if (p2opts.sidesOnP2 && bag.sauces) {
          p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          p2 += listDishes(bag.sauces.dishes);
        }
        if (!sideList.length && !(p2opts.sidesOnP2 && bag.sauces)) p2 += '&nbsp;';
        p2 += '</div><div class="col col-promo">';
        if (p2opts.sandwiches) {
          p2 += sandwichesBlock(bag, { rule: sandRule, alignTitle: true });
        } else if (p2opts.rooms) p2 += renderFiller('rooms', bag, promos);
        else p2 += '&nbsp;';
        p2 += '</div></div>';
      } else if (p2opts.sidesOnP2 && sidesPrint) {
        p2 += '<section class="sec">' + sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule) + '</section>';
      }
    } else if (p2opts.rooms) {
      p2 += renderFiller('rooms', bag, promos);
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
      } else {
        // desserts etc
        inner = scallop(dishes.map(function (d) { return dishCentered(d); }).join(''));
      }
      return (
        '<article class="card-face fill-page fill-airy">' +
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
        '--dish-gap:12px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:26pt;--promo:12pt}' +
      '*{box-sizing:border-box} body{margin:0;background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button,.toolbar label.paper-opt{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar label.paper-opt{display:inline-flex;align-items:center;gap:6px;background:#3a342c;color:#f4eae3}' +
      '.toolbar label.paper-opt input{margin:0}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet,.cut-sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;height:297mm;padding:11mm 10mm 9mm;position:relative;display:flex;flex-direction:column;overflow:hidden}' +
      '.page-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;min-height:0;overflow:hidden}' +
      '.page-body-start{padding-top:0}' +
      '.page-spacer{flex:1 1 auto;min-height:0}' +
      '.page-body > .sec,.page-body > .top-band,.page-body > .cols,.page-body > .classics-block,.page-body > .foot-logo{flex:0 0 auto}' +
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
      '.card-face.fill-compact,.card-face.fill-dense{--dish-gap:6px;--sec-gap:8px;--name:10pt;--desc:9pt;--title:14pt}' +
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
      '.tracker{display:flex;justify-content:space-between;align-items:baseline;font-size:7pt;letter-spacing:.04em;text-transform:uppercase;color:#a39b91;margin:0 0 6px;font-weight:400;flex:0 0 auto}' +
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
      '.top-left .dish{margin-bottom:calc(var(--dish-gap) + 2px)}' +
      '.top-right{display:flex;align-items:flex-start;justify-content:flex-end;padding-top:0}' +
      '.logo-tr{width:180px!important;height:auto;display:block;margin-left:auto;max-width:100%}' +
      '.logo{display:block;width:54px;margin:0 auto 4px}' +
      '.foot-logo{text-align:center;margin:10px 0 4px}' +
      '.foot-logo img{width:96px;height:auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:17px;letter-spacing:.06em;text-align:center;text-transform:uppercase;margin:2px 0 8px}' +
      '.sec{margin:0 0 var(--sec-gap)}' +
      /* Titles clearly larger than dishes; gap tracks density ladder so fit can shrink */
      '.sec-title{font-family:var(--serif)!important;font-weight:700;font-size:min(var(--title),28pt)!important;letter-spacing:.12em;text-transform:uppercase;margin:0 0 var(--sec-gap);text-align:center;line-height:1.15}' +
      '.sec-title.soft-left{text-align:left;letter-spacing:.12em;margin:0 0 var(--sec-gap)}' +
      '.sec-title-spacer{visibility:hidden;margin:0 0 var(--sec-gap)}' +
      '.scallop .sec-title{text-align:left;font-size:min(calc(var(--title) - 1pt),26pt);letter-spacing:.11em;margin-bottom:calc(var(--sec-gap) - 2px)}' +
      '.sec-title.soft{font-size:min(calc(var(--title) - 2pt),24pt);letter-spacing:.1em}' +
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
      '.dish{margin:0 0 var(--dish-gap);min-width:0;max-width:100%}' +
      /* Leaders only between name and price on one row — never under the description */
      /* align-items:center + 1em mark keeps every dish-line the same height (no lunch-gap stretch) */
      '.dish-line{display:flex;flex-wrap:nowrap;align-items:center;min-width:0;max-width:100%;gap:0;line-height:1.28}' +
      '.dish-name{font-family:var(--sans);font-weight:700;font-size:var(--name);line-height:1.28;min-width:0;flex:0 1 auto;overflow-wrap:anywhere}' +
      '.dish-leader{display:block;flex:1 1 auto;border-bottom:1px dotted #b0a89c;margin:0 6px;min-width:10px;height:0;align-self:center;transform:translateY(0.35em)}' +
      '.dish-line .lc{width:1em;height:1em;margin:0 0.2em 0 0.08em;flex:0 0 auto;align-self:center;font-size:var(--name);object-fit:contain;display:block}' +
      '.price{font-family:var(--sans);font-weight:500;font-size:var(--name);line-height:1.28;white-space:nowrap;flex:0 0 auto;padding-left:0}' +
      '.desc{font-family:var(--sans);font-weight:400;font-size:var(--desc);color:#3a342c;margin-top:2px;line-height:1.4;max-width:100%;overflow-wrap:anywhere}' +
      '.dish .desc,.promo .desc,.sandwich-promo .desc{font-weight:400}' +
      '.tags{color:var(--green);font-style:italic;font-weight:400;font-size:var(--desc)}' +
      '.dish-c{text-align:center;margin:0 0 var(--dish-gap)}' +
      '.dish-c .dish-name{font-family:var(--serif);font-size:var(--name);letter-spacing:.02em}' +
      '.dish-c .desc,.dish-c .tags{text-align:center}' +
      '.dish-c .dish-line{display:block}' +
      '.dish-c .dish-leader{display:none}' +
      '.lc{width:1em;height:1em;font-size:var(--name);vertical-align:-0.15em;margin-left:0;margin-right:0;display:inline-block;object-fit:contain;flex:0 0 auto}' +
      '.allergy-lc{display:inline-flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;font-style:italic;max-width:92%;margin-left:auto;margin-right:auto}' +
      '.allergy-lc .lc{width:1.15em;height:1.15em;font-size:11pt;margin:0;vertical-align:middle;flex:0 0 auto}' +
      '.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:8px 0 10px;align-items:start}' +
      '.cols-classics{grid-template-columns:1fr 1fr}' +
      /* Columns start level; stretch so both sides share one height band.
         Feature panels sit in .col-feature with margin-top:auto so they finish
         on the same baseline; a short JS pass equalises their heights so tops
         line up sideways too (gap lives above the panels). */
      '.cols-balanced{align-items:stretch}' +
      '.cols-balanced .col-events,.cols-balanced .col-food{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column}' +
      '.cols-balanced .col-body{flex:0 0 auto;min-width:0}' +
      '.cols-balanced .col-logo{flex:0 0 auto;display:flex;justify-content:flex-end;margin:0 0 8px}' +
      '.cols-balanced .col-logo .logo-tr{width:160px!important;margin:0}' +
      '.cols-with-logo{align-items:stretch;margin-top:0}' +
      '.cols-balanced .col-feature,.cols-balanced .col-fill{margin-top:auto;flex:0 0 auto;min-width:0;width:100%;display:flex;flex-direction:column;justify-content:flex-end}' +
      '.cols-balanced .col-feature > .scallop,.cols-balanced .col-fill > .scallop{width:100%;flex:1 1 auto}' +
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
      '.bottom-cols{margin-top:16px;margin-bottom:4px}' +
      '.bottom-cols-balanced{grid-template-columns:1fr 1fr;gap:20px}' +
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
      /* Density ladder — ALWAYS start airy and only tighten if the page overflows */
      '.fill-airy{--dish-gap:14px;--sec-gap:18px;--name:12pt;--desc:10.5pt;--title:28pt;--promo:12.5pt}' +
      '.fill-roomy{--dish-gap:12px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:26pt;--promo:12pt}' +
      '.fill-normal{--dish-gap:10px;--sec-gap:13px;--name:11pt;--desc:9.75pt;--title:22pt;--promo:11pt}' +
      '.fill-tight{--dish-gap:7px;--sec-gap:10px;--name:10.25pt;--desc:9.25pt;--title:18pt;--promo:10pt}' +
      '.fill-compact{--dish-gap:5px;--sec-gap:8px;--name:9.75pt;--desc:8.75pt;--title:16pt;--promo:9.5pt}' +
      '.fill-dense{--dish-gap:3px;--sec-gap:5px;--name:9pt;--desc:8pt;--title:13.5pt;--promo:8.75pt}' +
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
      /* Density ladder drives A5 type — do not lock a tiny size that leaves the face sparse */
      '.a5-face.fill-airy{--dish-gap:14px;--sec-gap:16px;--name:12.5pt;--desc:11pt;--title:22pt;--promo:12pt}' +
      '.a5-face.fill-roomy{--dish-gap:11px;--sec-gap:13px;--name:11.5pt;--desc:10.25pt;--title:18pt;--promo:11pt}' +
      '.a5-face.fill-normal{--dish-gap:9px;--sec-gap:11px;--name:10.75pt;--desc:9.75pt;--title:16pt;--promo:10.5pt}' +
      '.a5-face.fill-tight{--dish-gap:7px;--sec-gap:9px;--name:10pt;--desc:9.25pt;--title:14pt;--promo:10pt}' +
      '.a5-face.fill-compact,.a5-face.fill-dense{--dish-gap:5px;--sec-gap:7px;--name:9.25pt;--desc:8.5pt;--title:12.5pt;--promo:9pt}' +
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

    if (notes) html += '<div class="party-notes">' + esc(notes) + '</div>';
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

    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(menu.name) + ' — ' + esc(ver.roman) + '</title>' +
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
        // Pin paired feature panels to the same height so tops and bottoms line up
        // across columns (slack gap sits above the panels in the shorter dish stack).
        'function balanceFeatures(){' +
          'document.querySelectorAll(".cols-balanced.cols-features,.cols-balanced").forEach(function(cols){' +
            'var feats=[].slice.call(cols.querySelectorAll(":scope > .col > .col-feature, :scope > .col > .col-fill"));' +
            'if(feats.length<2)return;' +
            'feats.forEach(function(f){f.style.minHeight="";});' +
            'var max=0;feats.forEach(function(f){max=Math.max(max,f.offsetHeight);});' +
            'if(max>0)feats.forEach(function(f){f.style.minHeight=max+"px";});' +
          '});}' +
        // Always start airy so sparse pages fill top→bottom (more gaps), then tighten only if overflow.
        // Never invent a third page — dense is the floor for readable type.
        'function fitPages(){document.querySelectorAll(".page.fill-page,.a5-face.fill-page,.card-face.fill-page").forEach(function(page){' +
          'for(var j=0;j<STEPS.length;j++){strip(page);page.classList.add("fill-page");page.classList.add(STEPS[j]);' +
          'if(!overflows(page))break;}});balanceFeatures();}' +
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
    partyOccasion: partyOccasion,
    orderDishesForPrint: orderDishesForPrint,
    toRoman: toRoman,
    weekLabel: weekLabel,
    sundayLabel: sundayLabel,
    weekKey: weekKey,
    nextPrintVersion: nextPrintVersion,
    wrapGuillotine: wrapGuillotine
  };
})(typeof window !== 'undefined' ? window : global);
