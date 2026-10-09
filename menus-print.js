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

  function romanToInt(s) {
    var map = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
    s = String(s || '').toUpperCase().replace(/[^MDCLXVI]/g, '');
    var n = 0;
    var prev = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      var v = map[s.charAt(i)] || 0;
      n += v < prev ? -v : v;
      prev = v;
    }
    return n;
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
    // Avoid "Sunday Sunday …" when menuName already says Sunday.
    name = name.replace(/^(Sunday)(?:\s+Sunday)+\b/i, '$1');
    ver = ver || {};
    var roman = String(ver.roman || '').trim();
    var weekBit = '';
    if (!ver.hideDate && ver.week) {
      var weekRaw = String(ver.week).replace(/\s+/g, ' ').trim();
      var m = weekRaw.match(/^(Week of|Sunday)\s+(\d{1,2}(?:st|nd|rd|th))\s+([A-Za-z]+)/i);
      if (m) {
        var mon = m[3].slice(0, 3);
        weekBit = (/^sunday/i.test(m[1]) ? 'Sun ' : 'Wk ') + m[2] + ' ' + mon;
      } else {
        // Rebuilt index sometimes stored "Sunday Sun 4th Oct" — strip the dupe.
        weekBit = weekRaw
          .replace(/^Week of\s+/i, 'Wk ')
          .replace(/^Sunday\s+Sun\s+/i, 'Sun ')
          .replace(/^Sunday\s+/i, 'Sun ');
      }
    }
    // If the menu is already named Sunday, don't prefix another Sunday/Sun token.
    if (/^sunday\b/i.test(name) && /^sun(day)?\b/i.test(weekBit)) {
      weekBit = weekBit.replace(/^sun(?:day)?\s+/i, '');
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

  function printVersionStorageKey(menuId, wk) {
    var isSunday = menuId === 'sunday';
    return 'eb-print-ver-' + menuId + '-' + (wk || (isSunday ? sundayKey() : weekKey()));
  }

  function printVersionMeta(menuId, n) {
    var isSunday = menuId === 'sunday';
    return {
      n: n,
      roman: toRoman(n),
      week: isSunday ? sundayLabel() : weekLabel(),
      weekKey: isSunday ? sundayKey() : weekKey(),
      hideDate: false
    };
  }

  function entryVersionN(row) {
    var n = parseInt(row && row.n, 10);
    if (n > 0) return n;
    return romanToInt(row && row.roman) || 0;
  }

  var versionHistoryCache = [];

  function rowMatchesVersionWeek(row, menuId, wk) {
    if (!row || String(row.menuId || '') !== String(menuId || '')) return false;
    var rowWk = String(row.weekKey || '');
    if (rowWk) return rowWk === String(wk);
    if (row.week) {
      var curWeek = menuId === 'sunday' ? sundayLabel() : weekLabel();
      return String(row.week) === String(curWeek);
    }
    if (row.generatedAt) {
      var d = new Date(row.generatedAt);
      var derived = menuId === 'sunday' ? sundayKey(d) : weekKey(d);
      return derived === String(wk);
    }
    return false;
  }

  function maxHistoryPrintN(menuId, wk) {
    wk = wk || (menuId === 'sunday' ? sundayKey() : weekKey());
    var max = 0;
    function consider(row) {
      if (!rowMatchesVersionWeek(row, menuId, wk)) return;
      var n = entryVersionN(row);
      if (n > max) max = n;
    }
    try {
      if (typeof lsLoadIndex === 'function') lsLoadIndex().forEach(consider);
    } catch (e) {}
    (versionHistoryCache || []).forEach(consider);
    return max;
  }

  function readStoredPrintN(menuId, wk) {
    try {
      return parseInt(localStorage.getItem(printVersionStorageKey(menuId, wk)) || '0', 10) || 0;
    } catch (e) { return 0; }
  }

  /**
   * Next Roman comes from the higher of this device’s counter and Print history
   * for the same menu + week. Varlo/iframe storage often resets, so Main (upcoming)
   * stayed on I; history is shared across phones and is the source of truth.
   */
  function peekPrintVersion(menuId) {
    var wk = menuId === 'sunday' ? sundayKey() : weekKey();
    var n = Math.max(readStoredPrintN(menuId, wk), maxHistoryPrintN(menuId, wk));
    return printVersionMeta(menuId, n + 1);
  }

  /** Stamp the next Roman when staff click Save to menus on the print sheet. */
  function commitPrintVersion(menuId) {
    var wk = menuId === 'sunday' ? sundayKey() : weekKey();
    var key = printVersionStorageKey(menuId, wk);
    var n = Math.max(readStoredPrintN(menuId, wk), maxHistoryPrintN(menuId, wk)) + 1;
    try { localStorage.setItem(key, String(n)); } catch (e) {}
    return printVersionMeta(menuId, n);
  }

  /** After cloud/local history loads, bump each menu’s week counter to the highest saved n. */
  function hydratePrintVersionsFromHistory(rows) {
    versionHistoryCache = Array.isArray(rows) ? rows.slice() : [];
    var byKey = {};
    versionHistoryCache.forEach(function (row) {
      if (!row || !row.menuId) return;
      var wk = String(row.weekKey || '');
      if (!wk && row.generatedAt) {
        var d = new Date(row.generatedAt);
        wk = row.menuId === 'sunday' ? sundayKey(d) : weekKey(d);
      }
      if (!wk) return;
      var k = printVersionStorageKey(row.menuId, wk);
      var n = entryVersionN(row);
      if (n > (byKey[k] || 0)) byKey[k] = n;
    });
    Object.keys(byKey).forEach(function (k) {
      try {
        var cur = parseInt(localStorage.getItem(k) || '0', 10) || 0;
        if (byKey[k] > cur) localStorage.setItem(k, String(byKey[k]));
      } catch (e) {}
    });
  }

  /** @deprecated use commitPrintVersion — kept for older callers/tests */
  function nextPrintVersion(menuId) {
    return commitPrintVersion(menuId);
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

  /** Group sandwich fillings by price for A5 card faces. Spiel prints outside the box. */
  function cardSandwichesInner(dishes, plan) {
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
    return scallop(html);
  }

  function cardSandwichesSpiel(plan) {
    var spiel = '';
    var rule = null;
    if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
      rule = root.EBMenus.sectionLayoutFor('Sandwiches', plan && plan.sectionLayout);
    } else if (plan && plan.sectionLayout && plan.sectionLayout.Sandwiches) {
      rule = plan.sectionLayout.Sandwiches;
    }
    if (rule) {
      var slots = (root.EBMenus && root.EBMenus.cardOutsideSlots)
        ? root.EBMenus.cardOutsideSlots(rule)
        : null;
      if (slots && slots.below) spiel = slots.below;
      else if (rule.below) spiel = String(rule.below).trim();
      if (!spiel) spiel = String(rule.note || '').trim();
    }
    return spiel || 'Served on either Ciabatta vg, Farmhouse White or Granary\nAll served with Fries and Salad';
  }

  function cardOutsideHtml(text, cls) {
    var raw = String(text || '').trim();
    if (!raw) return '';
    return '<div class="' + (cls || 'card-outside') + '">' + esc(raw).replace(/\n/g, '<br>') + '</div>';
  }

  /** Pull “All below £9.50 to include…” into a big price line + quieter sub line. */
  function splitOfferHtml(raw) {
    var text = String(raw || '').replace(/\s+/g, ' ').trim();
    var m = text.match(/^(.*?)(£\s*\d+(?:\.\d{1,2})?)(.*)$/);
    if (!m) return '';
    var before = String(m[1] || '').trim();
    var price = String(m[2] || '').replace(/\s+/g, '');
    var after = String(m[3] || '').trim().replace(/^[,.:;–-]+\s*/, '');
    var priceLine = (before ? before + ' ' : '') + price;
    var inner = '<div class="lb-price-line">' + esc(priceLine) + '</div>';
    if (after) inner += '<div class="lb-offer-sub">' + esc(after) + '</div>';
    return inner;
  }

  function blurbInnerHtml(text, kind) {
    var raw = String(text || '').trim();
    if (!raw) return '';
    kind = String(kind || 'paragraph').toLowerCase();
    // Offer split only when Blocks type is Title/Heading — Subheading/Paragraph/Text
    // honour the picker (staff pick Subheading, print stays that size).
    if ((kind === 'title' || kind === 'heading') && /£\s*\d/.test(raw)) {
      var split = splitOfferHtml(raw);
      if (split) return split;
    }
    return esc(raw).replace(/\n/g, '<br>');
  }

  function cardBlurbHtml(text, kind, place) {
    var raw = String(text || '').trim();
    if (!raw) return '';
    kind = String(kind || 'paragraph').toLowerCase();
    if (['title', 'heading', 'subhead', 'paragraph', 'text'].indexOf(kind) === -1) kind = 'paragraph';
    place = place === 'above' ? 'above' : 'below';
    return '<div class="card-blurb card-blurb-' + kind + ' card-blurb-' + place +
      (place === 'above' && (kind === 'title' || kind === 'heading') ? ' card-offer' : '') +
      (place === 'below' ? ' card-outside' : '') +
      '">' + blurbInnerHtml(raw, kind) + '</div>';
  }

  /** Long-sheet outside text: Title/Heading/Subheading/Paragraph/Text at parent type, not card pt sizes. */
  function sheetBlurbHtml(text, kind, place) {
    var raw = String(text || '').trim();
    if (!raw) return '';
    kind = String(kind || 'paragraph').toLowerCase();
    if (['title', 'heading', 'subhead', 'paragraph', 'text'].indexOf(kind) === -1) kind = 'paragraph';
    place = place === 'above' ? 'above' : 'below';
    var inner = blurbInnerHtml(raw, kind);
    var offer = (place === 'above' && /lb-price-line/.test(inner)) ? ' sheet-offer' : '';
    return '<div class="sheet-blurb sheet-blurb-' + kind + ' sheet-blurb-' + place + offer + '">' +
      inner + '</div>';
  }

  function sheetOutsideParts(rule) {
    var slots = { above: '', aboveKind: 'paragraph', below: '', belowKind: 'paragraph' };
    if (root.EBMenus && root.EBMenus.cardOutsideSlots) {
      slots = root.EBMenus.cardOutsideSlots(rule || {});
    } else if (rule) {
      slots.above = String(rule.above || '').trim();
      slots.below = String(rule.below || '').trim();
      slots.aboveKind = rule.aboveKind || slots.aboveKind;
      slots.belowKind = rule.belowKind || slots.belowKind;
    }
    return {
      slots: slots,
      aboveHtml: sheetBlurbHtml(slots.above, slots.aboveKind, 'above'),
      belowHtml: sheetBlurbHtml(slots.below, slots.belowKind, 'below')
    };
  }

  function cardOutsideWrap(inner, rule) {
    var slots = { above: '', aboveKind: 'heading', below: '', belowKind: 'text' };
    if (root.EBMenus && root.EBMenus.cardOutsideSlots) {
      slots = root.EBMenus.cardOutsideSlots(rule || {});
    } else if (rule) {
      slots.above = String(rule.above || '').trim();
      slots.below = String(rule.below || '').trim();
      slots.aboveKind = rule.aboveKind || slots.aboveKind;
      slots.belowKind = rule.belowKind || slots.belowKind;
    }
    return cardBlurbHtml(slots.above, slots.aboveKind, 'above') +
      (inner || '') +
      cardBlurbHtml(slots.below, slots.belowKind, 'below');
  }

  function cardOfferHtml(text) {
    var raw = String(text || '').trim();
    if (!raw) return '';
    var lines = raw.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var html = '<div class="card-offer">';
    if (lines.length && /^all\s*£|^£\d/i.test(lines[0])) {
      html += '<div class="lb-price-line">' + esc(lines[0]) + '</div>';
      if (lines.length > 1) {
        html += '<div class="lb-offer-sub">' + esc(lines.slice(1).join('\n')).replace(/\n/g, '<br>') + '</div>';
      }
    } else {
      html += esc(raw).replace(/\n/g, '<br>');
    }
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
    // box = tight scallop, squarer corners; wide = looser wave, rounder corners.
    var cls = kind === 'box' ? 'scallop scallop-box' : 'scallop scallop-wide';
    return '<div class="' + cls + '"><div class="scallop-pad">' + inner + '</div></div>';
  }

  function oppositeScallopKind(kind) {
    return kind === 'wide' ? 'box' : 'wide';
  }

  function firstScallopKind(html) {
    var m = String(html || '').match(/\bscallop-(box|wide)\b/);
    return m ? m[1] : '';
  }

  function setFirstScallopKind(html, kind) {
    html = String(html || '');
    if (kind !== 'box' && kind !== 'wide') return html;
    if (!/\bscallop-(box|wide)\b/.test(html)) return html;
    return html.replace(/\bscallop-(box|wide)\b/, 'scallop-' + kind);
  }

  /** Two matching rectangles never sit side by side — neighbour uses the other wave. */
  function contrastAdjacentScallops(leftHtml, rightHtml) {
    var lk = firstScallopKind(leftHtml);
    var rk = firstScallopKind(rightHtml);
    if (lk && rk && lk === rk) {
      rightHtml = setFirstScallopKind(rightHtml, oppositeScallopKind(lk));
    }
    return { leftHtml: leftHtml, rightHtml: rightHtml };
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

  function promoBodyKey(p) {
    return String(p && p.body != null ? p.body : '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function filterUnusedPromos(promos, excludeTitles) {
    var exclude = {};
    (excludeTitles || []).forEach(function (t) {
      if (t && typeof t === 'object') {
        var tk = promoTitleKey(t);
        var bk = promoBodyKey(t);
        if (tk) exclude[tk] = true;
        if (bk) exclude['body:' + bk] = true;
        return;
      }
      var raw = String(t || '');
      if (/^body:/i.test(raw)) {
        var bodyK = raw.replace(/^body:/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (bodyK) exclude['body:' + bodyK] = true;
        return;
      }
      var k = promoTitleKey(raw);
      if (k) exclude[k] = true;
    });
    return (promos || []).filter(function (p) {
      if (!p || !p.title) return false;
      if (exclude[promoTitleKey(p)]) return false;
      var bk = promoBodyKey(p);
      if (bk && exclude['body:' + bk]) return false;
      return true;
    });
  }

  function usedKeysFromPromos(list) {
    var keys = [];
    (list || []).forEach(function (p) {
      if (!p) return;
      if (typeof p === 'string') {
        if (p) keys.push(p);
        return;
      }
      if (p.title) keys.push(p.title);
      var bk = promoBodyKey(p);
      if (bk) keys.push('body:' + bk);
    });
    return keys;
  }

  /**
   * Each feature-panel title/body at most once per printed menu (both pages).
   * Later copies are stripped — leave space empty rather than reprint ALL TIPS.
   */
  var FEATURE_BOX_RE = /<div class="scallop(?:\s+scallop-(?:box|wide))?">\s*<div class="scallop-pad">\s*<div class="promo">\s*(?:<div class="promo-title">[\s\S]*?<\/div>\s*(?:<p>[\s\S]*?<\/p>\s*)*)+<\/div>\s*<\/div>\s*<\/div>/g;

  function featurePanelTitlesFromHtml(html) {
    var titles = [];
    String(html || '').replace(FEATURE_BOX_RE, function (block) {
      var tm = /<div class="promo-title">([\s\S]*?)<\/div>/g;
      var m;
      while ((m = tm.exec(block))) {
        var t = String(m[1]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (t) titles.push(t);
      }
      return block;
    });
    return titles;
  }

  function uniqueFeaturePanelsHtml(html) {
    var seenTitle = {};
    var seenBody = {};
    return String(html || '').replace(FEATURE_BOX_RE, function (full) {
      var titles = [];
      var tm = /<div class="promo-title">([\s\S]*?)<\/div>/g;
      var m;
      while ((m = tm.exec(full))) {
        var t = String(m[1]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (t) titles.push(t);
      }
      var bodies = [];
      var bm = /<p>([\s\S]*?)<\/p>/g;
      while ((m = bm.exec(full))) {
        var b = String(m[1]).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (b) bodies.push(b);
      }
      var dup = titles.some(function (t) { return seenTitle[t]; }) ||
        bodies.some(function (b) { return seenBody[b]; });
      if (dup) return '';
      titles.forEach(function (t) { seenTitle[t] = true; });
      bodies.forEach(function (b) { seenBody[b] = true; });
      return full;
    });
  }

  /**
   * Height of a leftover feature panel. Long dated events (Sip & Paint) score
   * much taller than Stay a While / Gatherings.
   */
  var FEATURE_GAP_UNITS = 2.4;
  function promoUnits(p) {
    if (!p) return 0;
    var body = String(p.body || '');
    var u = 3.4;
    u += 1.8;
    if (p.date) u += 0.7;
    u += 1 + Math.floor(body.length / 58);
    return u;
  }

  /**
   * Leftover under food (kids|desserts) may only take a small evergreen box.
   * Dated events (Sip & Paint) are never auto-picked into that hole.
   */
  function isSmallLeftoverPromo(p) {
    if (!p || !p.title || p.date) return false;
    return promoUnits(p) <= 8.5;
  }

  /**
   * Smallest panel(s) that fit leftover. withGap (kids leftover) reserves a
   * decent band after the food and only allows Stay a While / Gatherings-size
   * copy; page-1 events fill skips that so rooms copy can still sit in an even column.
   */
  function pickFittingPromos(pool, leftover, n, withGap) {
    var list = (pool || []).slice();
    if (withGap) list = list.filter(isSmallLeftoverPromo);
    var budget = (leftover || 0) - (withGap ? FEATURE_GAP_UNITS : 0);
    if (budget < 4 || !list.length || n < 1) return [];
    var ranked = list.slice().sort(function (a, b) {
      return promoUnits(a) - promoUnits(b);
    });
    var out = [];
    var used = 0;
    ranked.forEach(function (p) {
      if (out.length >= n) return;
      var u = promoUnits(p);
      if (used + u <= budget) {
        out.push(p);
        used += u;
      }
    });
    return out;
  }

  /**
   * Place feature panels only to even opposite columns.
   * leftFood / rightFood = rough height units of the food stacks.
   * Positive (rightFood - leftFood) means the LEFT column is shorter → fill left.
   * A panel must FIT the leftover minus a gap — skip long events that would
   * sit flush under the category or overshoot the taller food column.
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

    function stackForShort(side, panels, leftover, allowSmall) {
      var kind = side === 'left' ? leftKind : rightKind;
      var alt = kind === 'box' ? 'wide' : 'box';
      var n = Math.max(0, Math.min(2, parseInt(panels, 10) || 0));
      var hole = leftover != null ? leftover : Math.abs((rightFood || 0) - (leftFood || 0));
      // Unit holes often under-count half-column height. When leveling a real
      // short side (force / shortOnly), allow one small evergreen panel anyway.
      var fitHole = (allowSmall || opts.force) ? Math.max(hole, 8) : hole;
      var fit = pickFittingPromos(pool, fitHole, n, !!opts.shortOnly);
      if (!fit.length && (allowSmall || opts.force)) {
        fit = pickFittingPromos(pool, 8, 1, false);
      }
      if (!fit.length) {
        return { left: '', right: '', note: 'Leftover too small for a feature panel', usedTitles: [] };
      }
      var used = usedKeysFromPromos(fit);
      var html = fit.length >= 2
        ? renderOnePromoBox([fit[0]], kind) + renderOnePromoBox([fit[1]], alt)
        : renderOnePromoBox(fit, kind);
      if (side === 'left') {
        return { left: html, right: '', note: 'Feature under shorter left column', usedTitles: used };
      }
      return { left: '', right: html, note: 'Feature under shorter right column', usedTitles: used };
    }

    var gap = (rightFood || 0) - (leftFood || 0);
    var hole = Math.abs(gap);
    var force = opts.force || null;
    if (force && force.shorter && force.shorter !== 'even') {
      var forcedPanels = Math.max(1, Math.min(2, parseInt(force.panels, 10) || 1));
      if (forcedPanels > 1 && hole < 12) forcedPanels = 1;
      forcedPanels = Math.min(forcedPanels, Math.max(1, pool.length));
      if (!pool.length) {
        return { left: '', right: '', note: 'No unused feature panels left', usedTitles: [] };
      }
      if (force.shorter === 'left' || force.shorter === 'right') {
        return stackForShort(force.shorter, forcedPanels, hole, true);
      }
    }

    // Food pairs: only plug the shorter column. Never add a panel under both
    // when the stacks are already close — that inflates the taller puddings.
    if (opts.shortOnly) {
      if (gap > 1.2) return stackForShort('left', gap > 9 ? 2 : 1, hole, true);
      if (gap < -1.2) return stackForShort('right', -gap > 9 ? 2 : 1, hole, true);
      return { left: '', right: '', note: 'No feature panels — columns already even', usedTitles: [] };
    }
    if (gap > 2.5) return stackForShort('left', gap > 9 ? 2 : 1, hole, true);
    if (gap < -2.5) return stackForShort('right', -gap > 9 ? 2 : 1, hole, true);
    // Near-even opposite food columns: one panel under the slightly shorter
    // side only. Pairing both would burn Stay a While + Gatherings before page 2
    // solo columns (Desserts / Sides) can fill their empty half.
    if (pool.length && Math.abs(gap) <= 2.5) {
      return stackForShort(gap >= 0 ? 'left' : 'right', 1, Math.max(hole, 8), true);
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
      var gapL = Math.abs((leftFood + sideU1) - rightFood);
      var gapR = Math.abs(leftFood - (rightFood + sideU1));
      // Match buildLong: prefer not under Sharing when both gaps are similar.
      if (shareDishes.length && Math.abs(gapL - gapR) <= 2.5) rightFood += sideU1;
      else if (gapL <= gapR) leftFood += sideU1;
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
        var kidsU2 = sectionUnits(bag.littleBells, !!(littleRuleM && littleRuleM.frame)) +
          wrapUnits(bag.littleBells);
        var dessCol = !!(dessRuleM && wantsColumn(dessRuleM) && bag.desserts && bag.desserts.dishes &&
          bag.desserts.dishes.length);
        var sidesColPartner = !!(sideRuleM && wantsColumn(sideRuleM) && bag.sides && bag.sides.dishes &&
          bag.sides.dishes.length && !(layout.p1 && layout.p1.sidesOnP1));
        left2 += kidsU2;
        if (dessCol) {
          right2 += sectionUnits(bag.desserts, !!(dessRuleM && dessRuleM.frame)) +
            wrapUnits(bag.desserts);
        } else if (sidesColPartner) {
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
        usedTitles: usedKeysFromPromos([pool[0]])
      };
    }
    return {
      html: '<div class="cols foot-promos">' +
        '<div class="col">' + renderOnePromoBox([pool[0]], 'box') + '</div>' +
        '<div class="col">' + renderOnePromoBox([pool[1]], 'wide') + '</div>' +
        '</div>',
      usedTitles: usedKeysFromPromos([pool[0], pool[1]])
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

  function sandwichesPackCost(bag, rule) {
    var dishes = sandwichDishesOf(bag);
    rule = rule || (root.EBMenus && root.EBMenus.sectionLayoutFor
      ? root.EBMenus.sectionLayoutFor('Sandwiches')
      : { note: '', frame: true });
    var framed = !!(rule && rule.frame);
    var hours = noteUnits(rule && (rule.note || rule.above)) + noteUnits(rule && rule.below);
    if (dishes.length) {
      // Frilly + hours line + multi-line descriptions run taller than unit math —
      // weight them so planPromoFill puts enough panels under a short Burgers stack,
      // and so Sharing + Sandwiches are not stacked into a clipping column.
      var base = Math.max(COST.sandwiches, sectionUnits({ name: 'Sandwiches', dishes: dishes }, framed));
      return base + Math.min(6, dishes.length) + hours;
    }
    return COST.sandwiches;
  }

  /**
   * Visual height of Sandwiches for opposite-column leveling only.
   * Pack cost above is intentionally heavy for page CLIP; using it for
   * planPromoFill made Sides look shorter than Sandwiches and put Gatherings
   * under the taller Sides stack (PDF preview bug).
   */
  function sandwichesLevelCost(bag, rule) {
    var dishes = sandwichDishesOf(bag);
    rule = rule || (root.EBMenus && root.EBMenus.sectionLayoutFor
      ? root.EBMenus.sectionLayoutFor('Sandwiches')
      : { note: '', frame: true });
    if (!dishes.length) return COST.sandwiches;
    // Frilly frame + hours note add real half-column height beyond dish rows.
    var u = columnFillUnits(
      { name: 'Sandwiches', dishes: dishes },
      rule,
      (rule && (rule.note || rule.above)) || ''
    );
    if (rule && rule.frame) u += 3.2;
    u += noteUnits(rule && rule.below);
    return u;
  }

  /**
   * Sandwiches on a long sheet: category spiel (hours etc.) plus the dish list.
   * tipOnly: small sell-words ad (Main unticked). Else 0 fillings + Tip: sell + note/hours.
   * Frilly box only when Blocks → Sandwiches → Frilly is Yes (not hard-coded).
   * Host sheet: above + dishes + below all sit inside this section’s box
   * (frilly when Yes). Card menus keep above/below outside via cardOutsideWrap.
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
    var sandSlots = (root.EBMenus && root.EBMenus.cardOutsideSlots)
      ? root.EBMenus.cardOutsideSlots(rule)
      : { above: String(rule.above || '').trim(), below: String(rule.below || '').trim(),
          aboveKind: rule.aboveKind || 'paragraph', belowKind: rule.belowKind || 'paragraph' };
    var extras = sheetOutsideParts(rule);
    if (!dishes.length) {
      // Tip-only (Main unticked): sell words in a small ad box — not hours/below.
      // Ticked empty: selling words first, then hours / “all served with…”.
      var tipOnly = !!(opts.tipOnly || rule.tipOnly);
      var spielParts = [];
      if (sell) spielParts.push(sell);
      else spielParts.push('A selection of sandwiches is available — ask the team.');
      if (!tipOnly && note) spielParts.push(note);
      var spiel = spielParts.join('\n');
      var lines = spiel.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
      var noteInner = '<div class="promo sandwich-promo' + (tipOnly ? ' sandwich-tip-only' : '') + '">';
      noteInner += '<div class="promo-head"><span class="promo-title">Sandwiches</span></div>';
      lines.forEach(function (line, i) {
        noteInner += '<p class="' + (i === 0 ? 'note-line' : 'desc') + '">' + esc(line) + '</p>';
      });
      noteInner += '</div>';
      if (opts.hideTitle) {
        noteInner = noteInner.replace(/<div class="promo-head">[\s\S]*?<\/div>/, '');
      }
      if (!tipOnly) noteInner += extras.belowHtml || '';
      if (!wantFrame) return '<div class="sec-plain">' + noteInner + '</div>';
      if (opts.alignTitle && !opts.hideTitle) {
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
    var noteHtml = extras.aboveHtml;
    if (!noteHtml && note && note !== sandSlots.below) {
      noteHtml = '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>';
    }
    var afterHtml = extras.belowHtml;
    var body = noteHtml + listDishes(dishes) + afterHtml;
    var titled = sectionTitle('Sandwiches') + body;
    if (opts.hideTitle) {
      return wantFrame ? scallop(body, frameKind) : '<div class="sec-plain">' + body + '</div>';
    }
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
    return /shar(e|ing)|for the table/i.test(name || '') && !/special/i.test(name || '');
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
    return /starter/i.test(name || '') && !isSharing(name) && !isSpecialStarters(name);
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
   * pages and open type toward the maximum. Never clip food off the page.
   */
  var TYPE_RANGE = {
    name: { min: 11, max: 11.5 },
    desc: { min: 10, max: 10 },
    title: { min: 16, max: 22 },
    promo: { min: 11, max: 11.5 },
    /** Floor for vertical space between dishes — never collapse tighter.
     *  Classical Word menus breathe; 8px packed like a modern wall. */
    dishGapPx: { min: 13, max: 18 }
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

  /**
   * Extra page units for the classical dish-gap floor vs the 8px model the
   * tally was tuned for. Counts mains + sandwiches pack + specials + sides so
   * Specials|Sandwiches with Sides nested under cannot look under PAGE while
   * print clips into the allergy footer. Not a wrap/penalty tax — only the
   * real min-gap delta (TYPE_RANGE.dishGapPx.min − 8).
   */
  function classicalGapUnits_(dishCount) {
    var n = Math.max(0, Number(dishCount) || 0);
    var delta = Math.max(0, TYPE_RANGE.dishGapPx.min - 8);
    if (!n || !delta) return 0;
    return n * delta * 0.18;
  }

  function sectionUnits(sec, scalloped) {
    if (!sec || !sec.dishes || !sec.dishes.length) return 0;
    var u = COST.sectionHead + (scalloped ? COST.nibblesBox : 0);
    sec.dishes.forEach(function (d) { u += dishUnits(d); });
    return u;
  }

  /** Blocks “extra info” under a title — counts toward column height for level finishes. */
  function noteUnits(note) {
    var t = String(note || '').trim();
    if (!t) return 0;
    var lines = t.split(/\n/).filter(Boolean).length || 1;
    return Math.min(8, 2 + lines * 1.6 + Math.floor(t.length / 70));
  }

  /**
   * Extra height the unit math misses in a half-column: wrapping descriptions,
   * dietary tags on their own line. Used only to decide leftover feature panels.
   */
  function wrapUnits(sec) {
    var u = 0;
    ((sec && sec.dishes) || []).forEach(function (d) {
      if (!d) return;
      if (d.description) u += 0.8;
      if (d.tags) u += 0.45;
    });
    return u;
  }

  function columnFillUnits(sec, rule, extraNote) {
    return sectionUnits(sec, !!(rule && rule.frame)) + noteUnits(extraNote) + wrapUnits(sec);
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
      else if (isSharing(s.name) && !bag.sharing) bag.sharing = s;
      else if (isStarters(s.name) && !bag.starters) bag.starters = s;
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

  function layoutRule_(name, sl) {
    if (root.EBMenus && typeof root.EBMenus.sectionLayoutFor === 'function') {
      return root.EBMenus.sectionLayoutFor(name, sl) || {};
    }
    return (sl && sl[name]) || {};
  }

  /** Above/below boxes (Little Bells on Sunday) or a single Blocks note. */
  function outsideUnits_(rule) {
    if (!rule) return 0;
    var above = String(rule.above || '').trim();
    var below = String(rule.below || '').trim();
    if (above || below) return noteUnits(above) + noteUnits(below);
    return noteUnits(rule.note);
  }

  /**
   * Every long host (Main, Sunday, upcoming, custom) that can drop in other
   * menus. Count only height the unit tally missed (outside above/below/note).
   * Do not add wrap or penalty taxes — those rejected Specials that already
   * fitted at minimum type. Overflow only when food + those notes still will
   * not sit on the page at min type. Spare leftover tags a drop-in offer.
   */
  function applyDropInCapacity_(layout, bag, load) {
    load = load || {};
    bag = bag || {};
    var sl = load.sectionLayout;
    var p1used = load.p1used != null ? load.p1used : 0;
    var p2Load = load.p2Load != null ? load.p2Load : 0;
    var p1left = load.p1left != null ? load.p1left : (layout.leftover && layout.leftover.p1) || 0;
    var p2left = load.p2left != null ? load.p2left : (layout.leftover && layout.leftover.p2) || 0;
    var extraP1 = 0;
    var extraP2 = 0;
    function addOutside(sec, name, ontoP1) {
      if (!sec) return;
      var extra = outsideUnits_(layoutRule_(name, sl));
      if (ontoP1) extraP1 += extra;
      else extraP2 += extra;
    }
    var onePage = layout.pages === 1;
    var roastsOnP1 = !!(layout.p1 && layout.p1.sundayRoasts);
    addOutside(bag.littleBells, 'Little Bells', onePage);
    addOutside(bag.desserts, 'Desserts', onePage);
    addOutside(bag.specialMains, 'Special Mains', onePage);
    addOutside(bag.specialDesserts, 'Special Desserts', onePage);
    addOutside(bag.specialStarters, 'Special Starters', true);
    addOutside(bag.sundayRoasts, 'Sunday Roasts', onePage || roastsOnP1);
    var p1Food = p1used + extraP1;
    var p2Food = p2Load + extraP2;
    // Min-type page is PAGE units. Allow anything that still sits on the sheet
    // at that floor — no breath margin, no “packed leftover” penalty.
    if (onePage) {
      if (p1Food > PAGE) {
        layout.fit = 'over';
        layout.overflow = 'drop-in';
      }
    } else if (p1Food > PAGE || p2Food > PAGE) {
      layout.fit = 'over';
      layout.overflow = 'drop-in';
    }
    layout.spareRoom = Math.max(0, onePage ? p1left : Math.min(p1left, p2left));
    layout.canOfferDropIn = layout.fit !== 'over' && layout.spareRoom >= 24;
    if (layout.fit === 'over' && layout.fillers &&
        layout.fillers.indexOf('Too much content — remove a dropped-in menu') === -1) {
      layout.fillers.push('Too much content — remove a dropped-in menu');
    }
    return layout;
  }

  /**
   * Decide page split + which optional chrome (logo / feature panels) fits.
   * Named sandwich fillings follow the Dishes tick — never dropped for space.
   * On Main / Main (upcoming), Tip=Yes also places a sell tip when Sandwiches is
   * unticked (compulsory chrome). Promo never forces an extra page.
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

    // Balance: pull Sunday Roasts onto page 1 when they fit, so page 2 is not
    // jammed with Roasts + Mains + Little Bells + Desserts (desserts clipping).
    var roastsOnP1 = false;
    if (bag.sundayRoasts && roastCost > 0) {
      var frontWithRoasts = front + roastCost;
      var backWithoutRoasts = back - roastCost;
      var p1HasRoom = frontWithRoasts <= PAGE - 8;
      var p1Sparse = front < PAGE * 0.48;
      var p2Heavier = backWithoutRoasts >= frontWithRoasts - 6;
      var p2WouldClip = back > PAGE - 12 ||
        !!(bag.mains && bag.desserts && (bag.littleBells || bag.sundayRoasts));
      if (p1HasRoom && p1Sparse && p2Heavier) {
        roastsOnP1 = true;
      } else if (p1HasRoom && (menu.id === 'sunday' || p2WouldClip)) {
        // Sunday hero: roasts sit after starters on page 1 whenever they fit,
        // even if Sharing/Nibbles push the unit tally just over “sparse”.
        roastsOnP1 = true;
      }
      if (roastsOnP1) {
        front = frontWithRoasts;
        back = backWithoutRoasts;
      }
    }
    // Named fillings always print. Empty tip+hours when Sandwiches is ticked and
    // Tip is on. On Main / Main (upcoming), Tip=Yes also places a sell-only tip
    // when Sandwiches is unticked — compulsory chrome, never silent when spare room.
    var sandDishCount = sandwichDishesOf(bag).length;
    var sandRule = { tip: true, sell: '', note: '', frame: true };
    if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
      sandRule = root.EBMenus.sectionLayoutFor('Sandwiches', opts.sectionLayout);
    } else if (opts.sectionLayout && opts.sectionLayout.Sandwiches) {
      sandRule = opts.sectionLayout.Sandwiches;
    }
    var isMainHost = !!(root.EBMenus && root.EBMenus.isMainSheet)
      ? root.EBMenus.isMainSheet(menu.id)
      : (menu.id === 'main' || menu.id === 'main-next');
    var isLongHost = menu.kind === 'long' || isMainHost || menu.id === 'sunday';
    var includeSandwiches = opts.includes && typeof opts.includes === 'object'
      ? !!opts.includes.sandwiches
      : null;
    var tipOn = sandRule.tip !== false && sandRule.tip !== 'no' && sandRule.tip !== 0;
    var wantSandwiches;
    var sandwichTipOnly = false;
    if (sandDishCount > 0) {
      wantSandwiches = isLongHost || !!bag.sandwiches;
    } else if (isMainHost && tipOn) {
      // Tip=Yes on Main/upcoming: always try to place. Ticked → full empty section
      // (hours + sell); unticked → tip-only sell words (not a second full section).
      wantSandwiches = true;
      sandwichTipOnly = includeSandwiches !== true;
    } else if (isLongHost) {
      // Sunday: empty tip+hours only when Sandwiches is ticked and Tip is on
      wantSandwiches = includeSandwiches === true && tipOn;
    } else {
      wantSandwiches = !!bag.sandwiches;
    }
    var sandCost = sandwichesPackCost(bag, sandRule);
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
      fillers: [],
      sandwichesLocked: !!wantSandwiches,
      sandwichTipOnly: !!sandwichTipOnly
    };
    if (roastsOnP1) layout.fillers.push('Sunday Roasts (page 1 — balance)');
    if (bag.hasLunch) layout.fillers.push('Lunch club in allergy footer');

    // —— Food load vs type range: one page when it fits at max→min sizes ——
    var oneNeed = front;
    if (bag.sundayRoasts && !roastsOnP1) oneNeed += roastCost;
    if (bag.mains) oneNeed += sectionUnits(bag.mains, false);
    if (bag.specialMains) oneNeed += sectionUnits(bag.specialMains, true);
    if (bag.littleBells) oneNeed += sectionUnits(bag.littleBells, true);
    if (bag.desserts) oneNeed += sectionUnits(bag.desserts, false);
    if (bag.specialDesserts) oneNeed += sectionUnits(bag.specialDesserts, true);
    if (bag.sides) oneNeed += sectionUnits(bag.sides, false);
    if (bag.sauces) oneNeed += sectionUnits(bag.sauces, false);
    // Named fillings and a ticked empty tip box both count as food (not optional chrome).
    var foodNeed = oneNeed + (wantSandwiches ? sandCost : 0);
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
        layout.p1.sandwiches = true;
        layout.fillers.push(
          sandDishCount ? 'Sandwiches (page 1)'
            : sandwichTipOnly ? 'Sandwiches tip (page 1)' : 'Sandwiches box (page 1)'
        );
      }
      if (bag.sides && layout.p1.sandwiches) layout.p1.sidesOnP1 = true;
      add = tryAdd(left1, COST.footLogo + 6);
      if (add.ok) { layout.p1.footLogo = true; left1 = add.left; layout.fillers.push('Logo'); }
      layout.leftover.p1 = Math.max(0, left1);
      // Foot feature pairs only with real spare room — never jam at min type.
      layout.p1.footPromos = canFitFootPromos(layout.leftover.p1);
      layout.p1.classicsSplit = (bag.burgers || (bag.classics && bag.classics.dishes)) ? 1 : 0;
      applyDropInCapacity_(layout, bag, {
        p1used: foodNeed,
        p2Load: 0,
        p1left: layout.leftover.p1,
        p2left: 0,
        sectionLayout: opts.sectionLayout
      });
    } else if (hasBackContent || foodNeed > ONE_PAGE_AT_MIN || preferTwo) {
      // —— Two pages (Jul/Nov column use) ——
      layout.pages = 2;
      layout.fit = front > PAGE + 8 || back > PAGE + 12 ? 'over' : 'two';
      layout.mode = 'jul-nov';
      layout.p2 = {
        rooms: false, sandwiches: false, footLogo: false, footPromos: false,
        sidesOnP2: true, specialsBesideSandwiches: false, sidesUnderSpecials: false
      };
      layout.widthOverrides = {};
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
        // Starting guess: quieter on page 2, beside Sides. Do not pull Sandwiches onto page 1.
        // Gemini may move them via sandwichesOn; JS must not override that later.
        layout.p2.sandwiches = true;
        layout.p1.sandwiches = false;
        p2left = Math.max(0, p2left - (tightBack ? sandCost + 2 : sandCost));
        layout.fillers.push(
          sandDishCount ? 'Sandwiches (page 2)'
            : sandwichTipOnly ? 'Sandwiches tip (page 2)' : 'Sandwiches box (page 2)'
        );
      }
      // Overflow (any sheet): food must not clip. Two Column / Best-fit sections
      // that can share a row count as the taller one, not a stack. A trailing
      // column section with no partner sits in leftover column space on the
      // other page (food first). Full-width locks stay full-bleed.
      // Gemini layout review chooses leftover panel fill after this food map.
      var specMainRulePlan = { width: 'full' };
      var mainRulePlan = { width: 'full' };
      var sideRulePlan = { width: 'column' };
      var sandRulePlan = { width: 'column', frame: true };
      if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
        specMainRulePlan = root.EBMenus.sectionLayoutFor('Special Mains', opts.sectionLayout) || specMainRulePlan;
        mainRulePlan = root.EBMenus.sectionLayoutFor('Mains', opts.sectionLayout) || mainRulePlan;
        sideRulePlan = root.EBMenus.sectionLayoutFor('Sides', opts.sectionLayout) || sideRulePlan;
        sandRulePlan = root.EBMenus.sectionLayoutFor('Sandwiches', opts.sectionLayout) || sandRulePlan;
      } else if (opts.sectionLayout) {
        if (opts.sectionLayout['Special Mains']) specMainRulePlan = opts.sectionLayout['Special Mains'];
        if (opts.sectionLayout.Mains) mainRulePlan = opts.sectionLayout.Mains;
        if (opts.sectionLayout.Sides) sideRulePlan = opts.sectionLayout.Sides;
        if (opts.sectionLayout.Sandwiches) sandRulePlan = opts.sectionLayout.Sandwiches;
      }
      var specCostP2 = bag.specialMains ? sectionUnits(bag.specialMains, true) : 0;
      var mainCostP2 = bag.mains ? sectionUnits(bag.mains, false) : 0;
      var sideCostP2 = bag.sides ? sectionUnits(bag.sides, false) : 0;
      var p2Load = p2used + (layout.p2.sandwiches ? sandCost : 0);
      var sandPartner = '';
      var CLIP = PAGE - 10;
      if (layout.p2.sandwiches) {
        if (specCostP2 && canSitInColumn(specMainRulePlan)) {
          var loadSpecPair = p2used - specCostP2 + Math.max(specCostP2, sandCost);
          // Pairing Specials|Sandwiches only when Sides can leave this page or
          // the pair + Sides still fit. Otherwise keep Sides|Sandwiches.
          if (!(layout.p2.sidesOnP2 && bag.sides) || loadSpecPair <= CLIP) {
            sandPartner = 'specials';
          } else if (p1left >= sideCostP2 + 4) {
            sandPartner = 'specials';
          } else if (canSitInColumn(sideRulePlan)) {
            sandPartner = 'sides';
          } else {
            sandPartner = 'specials';
          }
        } else if (sideCostP2 && layout.p2.sidesOnP2 && canSitInColumn(sideRulePlan)) {
          sandPartner = 'sides';
        } else if (mainCostP2 && canSitInColumn(mainRulePlan)) {
          // Prefer drop-in gate over parking Sandwiches beside a full mains wall
          // when desserts already sit on this page and leftover is tight.
          var loadMainPair = p2used - mainCostP2 + Math.max(mainCostP2, sandCost);
          if (tightBack && dessertN >= 3 && loadMainPair > PAGE - 14) {
            sandPartner = '';
          } else {
            sandPartner = 'mains';
          }
        }
      }
      if (sandPartner === 'specials') {
        p2Load = p2used - specCostP2 + Math.max(specCostP2, sandCost);
      } else if (sandPartner === 'mains') {
        p2Load = p2used - mainCostP2 + Math.max(mainCostP2, sandCost);
      } else if (sandPartner === 'sides' && sideCostP2) {
        // Sides|Sandwiches share a row — count the taller column, not a stack.
        // (Previously sandCost was added on top of sides in p2used, which falsely
        // overflowed CLIP and dumped Sides under Sharing on page 1.)
        p2Load = p2used - sideCostP2 + Math.max(sideCostP2, sandCost);
      }
      layout.p2.specialsBesideSandwiches = sandPartner === 'specials';
      layout.widthOverrides = layout.widthOverrides || {};
      var sideCostP1 = sideCostP2;
      // Only move Sides off page 2 when Specials took the Sandwiches seat, or when
      // even the paired Sides|Sandwiches row still cannot fit. Never dump Sides
      // under Sharing just because units were double-counted as a stack.
      var packedFront = !!(
        bag.starters && bag.starters.dishes && bag.starters.dishes.length >= 5 &&
        bag.sharing && bag.sharing.dishes && bag.sharing.dishes.length &&
        (bag.nibbles || bag.boost)
      );
      var sideCountP1 = bag.sides && bag.sides.dishes ? bag.sides.dishes.length : 0;
      // Dumping 4+ Sides onto an already-full page 1 clips them. Any long host
      // (Main or Sunday): refuse that dump — Generate asks to remove a drop-in.
      var p1WouldClipSides = sideCountP1 >= 4 && (
        packedFront ||
        (bag.starters && bag.starters.dishes && bag.starters.dishes.length >= 4 &&
          bag.sundayRoasts && layout.p1.sundayRoasts) ||
        p1left < sideCostP1 + 14
      );
      var moveSidesToP1 = bag.sides && layout.p2.sidesOnP2 && p1left >= sideCostP1 + 4 && (
        sandPartner === 'specials' ||
        (sandPartner !== 'sides' && p2Load > CLIP)
      ) && !p1WouldClipSides;
      if (moveSidesToP1) {
        layout.p1.sidesOnP1 = true;
        layout.p2.sidesOnP2 = false;
        p1left -= sideCostP1;
        p2left += sideCostP1;
        p1used += sideCostP1;
        p2used -= sideCostP1;
        p2Load -= sideCostP1;
        layout.fillers.push('Sides (page 1 leftover — keep food on the page)');
      } else if (p1WouldClipSides && p2Load > PAGE) {
        layout.fit = 'over';
        layout.overflow = 'drop-in';
        layout.fillers.push('Too much content — remove a dropped-in menu');
      }
      // Sides still on this page with short Specials|Sandwiches: nest Sides into
      // the leftover (food first). Safer than reprinting a feature panel.
      if (sandPartner === 'specials' && bag.sides && layout.p2.sidesOnP2 &&
          sidesFitUnderSpecials(bag, sandRulePlan, bag.sides)) {
        var nestLoad = p2used - specCostP2 - sideCostP2 +
          Math.max(specCostP2 + sideCostP2, sandCost);
        if (nestLoad <= CLIP + 6) {
          p2Load = nestLoad;
          layout.p2.sidesUnderSpecials = true;
          layout.fillers.push('Sides under Specials (fill Specials|Sandwiches leftover)');
        }
      }
      // Packed page: any Best-fit category with enough dishes can split across
      // two even columns (shorter than a single stack) so food stays on the page.
      function trySplitBestFit(secName, sec, framed, currentCost) {
        if (p2Load <= CLIP || !sec || !sec.dishes || sec.dishes.length < 4) return false;
        var r = { width: 'both' };
        if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
          r = root.EBMenus.sectionLayoutFor(secName, opts.sectionLayout) || r;
        } else if (opts.sectionLayout && opts.sectionLayout[secName]) {
          r = opts.sectionLayout[secName];
        }
        // Only when Blocks is Best fit — Column / Full locks stay as set.
        if (lockedColumnWidth(r) || lockedFullWidth(r) || wantsSplit(r)) return false;
        if (!isBestFit(r) && String(r.width || '') !== 'both') return false;
        var splitCost = splitSectionUnits(sec, !!framed);
        var loadIfSplit = p2Load - currentCost + splitCost;
        if (loadIfSplit <= CLIP || loadIfSplit < p2Load - 4) {
          layout.widthOverrides[secName] = 'split';
          p2Load = loadIfSplit;
          layout.fillers.push(secName + ' (two even columns — keep food on the page)');
          return true;
        }
        return false;
      }
      if (bag.sides && layout.p2.sidesOnP2) {
        trySplitBestFit('Sides', bag.sides, false, sideCostP2);
      }
      if (p2Load > CLIP && bag.desserts) {
        trySplitBestFit('Desserts', bag.desserts, false, sectionUnits(bag.desserts, false));
      }
      if (p2Load > CLIP && bag.mains && sandPartner !== 'mains') {
        trySplitBestFit('Mains', bag.mains, false, mainCostP2);
      }
      if (p2Load > CLIP && bag.specialMains && sandPartner !== 'specials') {
        trySplitBestFit('Special Mains', bag.specialMains, true, specCostP2);
      }
      // If Specials|Sandwiches would still leave Sides clipping, cancel the pair.
      if (sandPartner === 'specials' && bag.sides && layout.p2.sidesOnP2 && p2Load > CLIP) {
        sandPartner = canSitInColumn(sideRulePlan) ? 'sides' : '';
        layout.p2.specialsBesideSandwiches = false;
        if (layout.widthOverrides.Sides) delete layout.widthOverrides.Sides;
        p2Load = p2used + (layout.p2.sandwiches ? sandCost : 0);
      }
      p2left = Math.max(0, PAGE - p2Load);
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

      // Starting guess only — Gemini layout review chooses leftover fill.
      // Do not dump Sides under Sharing|Burgers just to even leftover. Do move a
      // trailing unpaired column there when stacking it would clip food.

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

      // Classical breath: headroom for the hard dish-gap floor (13px).
      // Count every food line on page 2 — including Sandwiches — so the gate
      // matches print. Specials that already fitted still pass (no wrap taxes).
      var p2SandN = layout.p2.sandwiches ? sandDishCount : 0;
      var p2DishN = mainsN + dessertN + p2SandN +
        (bag.sides && bag.sides.dishes ? bag.sides.dishes.length : 0) +
        (bag.specialMains && bag.specialMains.dishes ? bag.specialMains.dishes.length : 0) +
        (bag.specialDesserts && bag.specialDesserts.dishes ? bag.specialDesserts.dishes.length : 0) +
        (bag.littleBells && bag.littleBells.dishes ? bag.littleBells.dishes.length : 0) +
        (bag.sundayRoasts && !roastsOnP1 && bag.sundayRoasts.dishes ? bag.sundayRoasts.dishes.length : 0);
      var gapBreath = Math.min(8, p2DishN * Math.max(0, TYPE_RANGE.dishGapPx.min - 8) * 0.07);
      // Nesting Sides under short Specials looks free in unit math (max() stays
      // on Sandwiches) but classical gaps make the left stack meet the footer
      // under a full mains list — flow182 clipped here with no overflow gate.
      if (layout.p2.sidesUnderSpecials) {
        var nestDishN = mainsN + p2SandN +
          (bag.specialMains && bag.specialMains.dishes ? bag.specialMains.dishes.length : 0) +
          (bag.sides && bag.sides.dishes ? bag.sides.dishes.length : 0);
        gapBreath += classicalGapUnits_(nestDishN);
      }
      // Full mains + desserts + Sandwiches on one back page reads as a busy wall —
      // refuse and ask to untick Sandwiches (or another drop-in) rather than pack.
      var sandwichCrowdsMains = !!(layout.p2.sandwiches && bag.mains && bag.desserts &&
        mainsN >= 7 && dessertN >= 4 && p2Load + gapBreath > PAGE - 14);
      var foodOverPage = p2Load + gapBreath > PAGE;
      if (sandwichCrowdsMains || p1used > PAGE + 10 || p2used > PAGE + 14 ||
          foodOverPage) {
        layout.fit = 'over';
        layout.overflow = layout.overflow || 'drop-in';
        if ((sandwichCrowdsMains || (foodOverPage && layout.p2.sidesUnderSpecials)) &&
            layout.fillers.indexOf(
            'Too much content — remove a dropped-in menu') === -1) {
          layout.fillers.push('Too much content — remove a dropped-in menu');
        }
      }
      p2left = Math.max(0, p2left - gapBreath);
      layout.leftover.p2 = p2left;
      applyDropInCapacity_(layout, bag, {
        p1used: p1used,
        p2Load: p2Load + gapBreath,
        p1left: p1left,
        p2left: p2left,
        sectionLayout: opts.sectionLayout
      });
    } else {
      layout.pages = 1;
      layout.fit = 'one';
    }

    var bits = layout.fillers.length
      ? ' Layout: ' + layout.fillers.join('; ') + '.'
      : ' Sheet is full — logo / extra feature panels skipped.';
    var typeNote = ' Type range: names ' + TYPE_RANGE.name.min + '–' + TYPE_RANGE.name.max +
      'pt, descriptions ' + TYPE_RANGE.desc.min + '–' + TYPE_RANGE.desc.max +
      'pt, section titles ' + TYPE_RANGE.title.min + '–' + TYPE_RANGE.title.max +
      'pt; dish gap ≥' + TYPE_RANGE.dishGapPx.min + 'px.';
    layout.summary =
      (layout.fit === 'one' ? 'One A4 — food fits at minimum type, so type can open toward the maximum.' :
        layout.fit === 'two' ? 'Two A4 pages — would clip at minimum type on one page; same type on both pages, opening toward the maximum; never a third page.' :
          'Too much content to fit on one page. Please remove a dropped-in menu, then Generate.') +
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
    var extras = sheetOutsideParts(rule);
    var note = opts.note != null ? String(opts.note) : String((rule && rule.note) || '');
    note = note.trim();
    var noteHtml;
    if (opts.noteHtml != null) {
      noteHtml = String(opts.noteHtml);
    } else if (extras.aboveHtml) {
      noteHtml = extras.aboveHtml;
    } else {
      noteHtml = note
        ? '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>'
        : '';
    }
    var afterHtml;
    if (opts.afterHtml != null) {
      afterHtml = String(opts.afterHtml);
    } else if (opts.skipBelow) {
      afterHtml = '';
    } else if (opts.afterNote != null) {
      var after = String(opts.afterNote).trim();
      afterHtml = after ? sheetBlurbHtml(after, extras.slots.belowKind, 'below') : '';
    } else {
      afterHtml = extras.belowHtml;
    }
    // Host sheet: above + dishes + below all sit in this section’s format
    // (inside the frilly box when Frilly is Yes). Cards keep outside via cardOutsideWrap.
    return framedBlock(head + noteHtml + body + afterHtml, rule, kind || 'wide');
  }

  /** Print the full course name (Special Starters / Special Mains / …). */
  function specialsPrintTitle(sectionKey) {
    var key = String(sectionKey || '').trim();
    if (/^special\s+starters?$/i.test(key)) return 'Special Starters';
    if (/^special\s+desserts?$/i.test(key)) return 'Special Desserts';
    if (/^special\s+mains?$/i.test(key)) return 'Special Mains';
    if (/^specials$/i.test(key)) return 'Special Mains';
    return key || 'Special Mains';
  }

  /**
   * Specials for one course on Main / Sunday. Stays under the matching
   * regular section. Blocks width is honoured: Column stays a half-column;
   * Full width stays under the course as a full-bleed frilly box; Best fit
   * prefers full-bleed when the sheet has room (columns only when packing).
   */
  function specialsBesideCourse(dishes, plan, sectionKey, opts) {
    dishes = dishes || [];
    if (!dishes.length) return { html: '', usedPromoTitles: [] };
    opts = opts || {};
    var key = sectionKey || 'Special Mains';
    var title = specialsPrintTitle(key);
    var rule = ruleFor(key, plan);
    if (rule.frame == null) rule.frame = true;
    // Column lock: never orphan to full-bleed.
    if (lockedColumnWidth(rule)) {
      return columnSoloSection(title, dishes, rule, {
        promos: opts.promos,
        excludeTitles: opts.excludeTitles,
        skipPromos: opts.skipPromos,
        dataSpecials: key
      });
    }
    // Full width lock, Best fit, or split: frilly box with the full course name.
    var inner = '<div class="sec-title specials-beside-title">' + esc(title) + '</div>';
    var extras = sheetOutsideParts(rule);
    var note = String(rule.note || '').trim();
    if (extras.aboveHtml) inner += extras.aboveHtml;
    else if (note) inner += '<div class="sec-note">' + esc(note).replace(/\n/g, '<br>') + '</div>';
    inner += wantsSplit(rule) && dishes.length >= 2 ? listDishesCols(dishes) : listDishes(dishes);
    if (extras.belowHtml) inner += extras.belowHtml;
    var secCls = 'specials-beside' + (wantsSplit(rule) ? ' sec-split' : '');
    return {
      html: '<section class="sec ' + secCls + '" data-specials-course="' +
        esc(key) + '">' + framedBlock(inner, rule, 'wide') + '</section>',
      usedPromoTitles: []
    };
  }

  /** Pair Specials with Sandwiches only when that keeps food on the page.
   *  If Sides would still sit under the pair and clip, keep Sides|Sandwiches
   *  and print Specials full-bleed instead. */
  function canPairSpecialsWithSandwiches(dishes, plan, sandwichesOnPage) {
    if (!sandwichesOnPage || !dishes || !dishes.length) return false;
    if (!canSitInColumn(ruleFor('Special Mains', plan))) return false;
    var layout = (plan && plan.layout) || plan || {};
    var p1 = layout.p1 || {};
    var p2 = layout.p2 || {};
    if (p2.specialsBesideSandwiches === false) return false;
    if (p2.specialsBesideSandwiches === true) return true;
    // Sides still on this page under the pair → usually clips. Only pair when
    // Sides already sit in leftover on the other page (or there are none).
    if (p2.sidesOnP2 && !p1.sidesOnP1) return false;
    return true;
  }

  /** True when short Specials beside tall Sandwiches can take Sides in the leftover. */
  function sidesFitUnderSpecials(bag, sandRule, sidesSec) {
    if (!bag || !bag.specialMains || !bag.specialMains.dishes || !bag.specialMains.dishes.length) {
      return false;
    }
    if (!sidesSec || !sidesSec.dishes || !sidesSec.dishes.length) return false;
    var specU = sectionUnits(bag.specialMains, true);
    var sandU = sandwichesPackCost(bag, sandRule);
    var sideU = sectionUnits(sidesSec, false);
    if (specU + 3 >= sandU) return false;
    if (specU + sideU > sandU + 14) return false;
    return true;
  }

  function specialsSandwichesPair(bag, plan, opts) {
    opts = opts || {};
    var rule = ruleFor('Special Mains', plan);
    if (rule.frame == null) rule.frame = true;
    var sandRule = opts.sandRule || ruleFor('Sandwiches', plan);
    var sideRule = opts.sideRule || ruleFor('Sides', plan);
    var nestSides = opts.nestSides;
    var leftHtml = sectionBlock('Special Mains', bag.specialMains.dishes, rule, 'box', { hideTitle: true });
    var leftU = sectionUnits({ name: 'Special Mains', dishes: bag.specialMains.dishes }, true);
    if (nestSides && nestSides.dishes && nestSides.dishes.length) {
      leftHtml += sectionBlock(nestSides.name || 'Sides', nestSides.dishes, sideRule, '', {});
      leftU += sectionUnits(nestSides, false);
      if (opts.nestSauces && opts.nestSauces.dishes && opts.nestSauces.dishes.length) {
        leftHtml += '<div class="sec-title soft-left">' + esc(opts.nestSauces.name) + '</div>';
        leftHtml += listDishes(opts.nestSauces.dishes);
        leftU += sectionUnits(opts.nestSauces, false);
      }
    }
    return pairColumnFood(
      {
        title: 'Special Mains',
        dishes: bag.specialMains.dishes,
        rule: rule,
        leftClass: 'col-specials',
        html: leftHtml,
        units: leftU
      },
      {
        title: 'Sandwiches',
        dishes: sandwichDishesOf(bag),
        rule: sandRule,
        html: sandwichesBlock(bag, {
          rule: sandRule,
          hideTitle: true,
          frame: sandRule.frame ? 'wide' : undefined
        }),
        units: sandwichesPackCost(bag, sandRule),
        rightClass: 'col-food'
      },
      {
        promos: opts.promos,
        excludeTitles: opts.excludeTitles,
        force: opts.force,
        secClass: 'specials-sand-row',
        dataSpecials: 'Special Mains'
      }
    );
  }

  /** Two Column / Best-fit sections in one row: titles share a line, food first,
   *  then a feature panel under the shorter stack so the bottoms line up. */
  function pairColumnFood(left, right, opts) {
    opts = opts || {};
    left = left || {};
    right = right || {};
    var leftRule = left.rule || {};
    var rightRule = right.rule || {};
    var leftU = left.units != null ? left.units : sectionUnits({ name: left.title, dishes: left.dishes }, !!leftRule.frame);
    var rightU = right.units != null ? right.units : sectionUnits({ name: right.title, dishes: right.dishes }, !!rightRule.frame);
    var leftFoodKind = leftRule.frame ? 'box' : '';
    var rightFoodKind = rightRule.frame ? (leftFoodKind ? 'wide' : 'box') : '';
    var leftInner = left.html
      ? (leftFoodKind ? setFirstScallopKind(left.html, leftFoodKind) : left.html)
      : sectionBlock(left.title, left.dishes, leftRule, leftFoodKind || 'box', { hideTitle: true });
    var rightInner = right.html
      ? (rightFoodKind ? setFirstScallopKind(right.html, rightFoodKind) : right.html)
      : sectionBlock(right.title, right.dishes, rightRule, rightFoodKind || 'box', { hideTitle: true });
    var leftFrame = leftFoodKind === 'box' ? 'wide' : 'box';
    var rightFrame = oppositeScallopKind(leftFrame);
    if (rightFoodKind === rightFrame) rightFrame = oppositeScallopKind(rightFoodKind);
    var pair = levelOppositeColumns(leftInner, leftU, rightInner, rightU, {
      promos: opts.promos,
      excludeTitles: opts.excludeTitles,
      force: opts.force,
      leftTitle: left.hideTitle ? '' : (left.title || ''),
      rightTitle: right.hideTitle ? '' : (right.title || ''),
      secClass: opts.secClass || 'col-pair-row',
      leftClass: left.leftClass || '',
      rightClass: right.rightClass || 'col-food',
      leftFrame: leftFrame,
      rightFrame: rightFrame
    });
    if (opts.dataSpecials && pair && pair.html) {
      pair.html = pair.html.replace(
        '<section class="sec ' + (opts.secClass || 'col-pair-row') + '">',
        '<section class="sec ' + (opts.secClass || 'col-pair-row') + '" data-specials-course="' +
          esc(opts.dataSpecials) + '">'
      );
    }
    return pair;
  }

  function layoutMap(plan) {
    if (root.EBMenus && root.EBMenus.normalizeSectionLayout) {
      return root.EBMenus.normalizeSectionLayout(plan && plan.sectionLayout);
    }
    return (plan && plan.sectionLayout) || {};
  }

  function ruleFor(sectionName, plan) {
    var key = sectionName || '';
    var rule;
    if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
      rule = root.EBMenus.sectionLayoutFor(key, plan && plan.sectionLayout);
    } else {
      var map = layoutMap(plan);
      rule = map[key] || { width: 'full', frame: false, note: '', tip: false, sell: '' };
    }
    // Planner / Gemini Best-fit choice for this generate (column | full | split).
    var overrides = (plan && plan.widthOverrides) ||
      (plan && plan.layout && plan.layout.widthOverrides) || null;
    if (overrides && overrides[key]) {
      rule = Object.assign({}, rule, { width: overrides[key] });
    }
    return rule;
  }

  function wantsColumn(rule) {
    if (root.EBMenus && root.EBMenus.isColumnWidth) return root.EBMenus.isColumnWidth(rule.width);
    return rule.width === 'column' || rule.width === 'both';
  }

  function wantsFull(rule) {
    if (root.EBMenus && root.EBMenus.isFullWidth) return root.EBMenus.isFullWidth(rule.width);
    return rule.width === 'full' || rule.width === 'both' || rule.width === 'split';
  }

  function wantsSplit(rule) {
    if (root.EBMenus && root.EBMenus.isSplitWidth) return root.EBMenus.isSplitWidth(rule && rule.width);
    return !!(rule && rule.width === 'split');
  }

  function isBestFit(rule) {
    if (root.EBMenus && root.EBMenus.isBestFitWidth) return root.EBMenus.isBestFitWidth(rule && rule.width);
    return !!(rule && rule.width === 'both');
  }

  /** Blocks “Full width” lock (not Best fit). Must print full-bleed — never a half-column. */
  function lockedFullWidth(rule) {
    if (root.EBMenus && root.EBMenus.isLockedFullWidth) {
      return !!(rule && root.EBMenus.isLockedFullWidth(rule.width));
    }
    return !!(rule && rule.width === 'full');
  }

  /** Best fit or Column — may sit opposite another column. Full-width / split may not. */
  function canSitInColumn(rule) {
    return !!(rule && wantsColumn(rule) && !lockedFullWidth(rule) && !wantsSplit(rule));
  }

  /** Blocks “Column” lock (not Best fit). Must stay half-column — never orphaned to full-bleed. */
  function lockedColumnWidth(rule) {
    if (root.EBMenus && root.EBMenus.isLockedColumnWidth) {
      return !!(rule && root.EBMenus.isLockedColumnWidth(rule.width));
    }
    return !!(rule && String(rule.width || '').toLowerCase() === 'column');
  }

  /** Height when a category is split across two even columns (shared title). */
  function splitSectionUnits(sec, scalloped) {
    if (!sec || !sec.dishes || !sec.dishes.length) return 0;
    if (sec.dishes.length < 2) return sectionUnits(sec, scalloped);
    var mid = Math.ceil(sec.dishes.length / 2);
    var leftU = 0;
    var rightU = 0;
    sec.dishes.slice(0, mid).forEach(function (d) { leftU += dishUnits(d); });
    sec.dishes.slice(mid).forEach(function (d) { rightU += dishUnits(d); });
    return COST.sectionHead + (scalloped ? COST.nibblesBox : 0) + Math.max(leftU, rightU);
  }

  /** Category title in the shared pair-head row — same baseline whether frilly or not. */
  function pairHeadHtml(title) {
    if (!title) return '<div class="promo-head pair-head pair-head-spacer"><span class="sec-title">&nbsp;</span></div>';
    return '<div class="promo-head pair-head"><span class="sec-title">' + esc(title) + '</span></div>';
  }

  /** True when a column has no food — only &nbsp; / empty tags. */
  function isBlankFoodInner(html) {
    var s = String(html || '').replace(/&nbsp;|&#160;/gi, '');
    s = s.replace(/<[^>]+>/g, '');
    return !s.replace(/\s+/g, '');
  }

  function innerHasSectionTitle(inner, title) {
    var t = String(title || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!t) return true;
    return new RegExp('(sec-title|promo-title)[^>]*>\\s*' + t + '\\s*<', 'i').test(String(inner || ''));
  }

  /** Frilly column: sit the category title inside the frame with the dishes. */
  function nestTitleInFrilly(title, inner) {
    inner = String(inner || '');
    if (!title || innerHasSectionTitle(inner, title)) return inner;
    if (inner.indexOf('<div class="scallop-pad">') === -1) return inner;
    return inner.replace('<div class="scallop-pad">', '<div class="scallop-pad">' + sectionTitle(title));
  }

  /** Pair-head is the only title; strip a copy that was left inside the food box. */
  function stripInnerSectionTitle(inner, title) {
    inner = String(inner || '');
    if (!title) return inner;
    var t = String(title).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    inner = inner.replace(new RegExp('<div class="sec-title"[^>]*>\\s*' + t + '\\s*</div>\\s*', 'i'), '');
    inner = inner.replace(new RegExp('<span class="(?:sec-title|promo-title)[^"]*">\\s*' + t + '\\s*</span>', 'i'), '');
    inner = inner.replace(/<div class="promo-head">\s*<\/div>\s*/i, '');
    return inner;
  }

  /**
   * GOLDEN RULE: opposite columns start and finish level.
   * Frilly food boxes carry their category title inside the frame (Desserts).
   * Unframed neighbours keep a pair-head, inset so it lines up with that title.
   * Food on both sides first; a small feature panel under the shorter stack only.
   */
  function levelOppositeColumns(leftInner, leftU, rightInner, rightU, opts) {
    opts = opts || {};
    var fill = { left: '', right: '', usedTitles: [] };
    if (!opts.skipPromos) {
      var remaining = filterUnusedPromos(opts.promos || [], opts.excludeTitles || []);
      var fillOpts = {
        leftFrame: opts.leftFrame || 'box',
        rightFrame: opts.rightFrame || 'wide',
        excludeTitles: opts.excludeTitles || [],
        shortOnly: !!opts.shortOnly
      };
      if (opts.force) fillOpts.force = opts.force;
      fill = planPromoFill(leftU || 0, rightU || 0, remaining, fillOpts);
      // If one side is still clearly short and planPromoFill returned nothing usable, force panels.
      var gap = (rightU || 0) - (leftU || 0);
      var minGap = opts.shortOnly ? 1.2 : 2.5;
      if (!fill.left && !fill.right && remaining.length && Math.abs(gap) > minGap) {
        fill = planPromoFill(leftU || 0, rightU || 0, remaining, {
          leftFrame: fillOpts.leftFrame,
          rightFrame: fillOpts.rightFrame,
          excludeTitles: fillOpts.excludeTitles,
          shortOnly: fillOpts.shortOnly,
          force: { shorter: gap > 0 ? 'left' : 'right', panels: Math.abs(gap) > 9 ? 2 : 1 }
        });
      }
    }
    var leftFeat = fill.left ? '<div class="col-feature">' + fill.left + '</div>' : '';
    var rightFeat = fill.right ? '<div class="col-feature">' + fill.right + '</div>' : '';
    var secClass = opts.secClass || 'col-pair-row';
    var colsClass = opts.colsClass || '';
    var leftClass = opts.leftClass || '';
    var rightClass = opts.rightClass || 'col-promo';
    if (opts.leftTitle || opts.rightTitle) {
      colsClass = (colsClass ? colsClass + ' ' : '') + 'cols-pair-titles';
    }
    var leftHtml = String(leftInner || '');
    var rightHtml = String(rightInner || '');
    // Empty partner (Sides with no Sandwiches): the promo IS the column, sit it
    // at the top beside the food — not as a footer with a hole above it.
    var leftPromoBody = isBlankFoodInner(leftHtml) && fill.left;
    var rightPromoBody = isBlankFoodInner(rightHtml) && fill.right;
    if (leftPromoBody) { leftHtml = fill.left; leftFeat = ''; }
    if (rightPromoBody) { rightHtml = fill.right; rightFeat = ''; }
    var leftFrilly = /class="[^"]*scallop/.test(leftHtml) && !leftPromoBody;
    var rightFrilly = /class="[^"]*scallop/.test(rightHtml) && !rightPromoBody;
    if (leftFrilly) leftHtml = nestTitleInFrilly(opts.leftTitle, leftHtml);
    else if (opts.leftTitle) leftHtml = stripInnerSectionTitle(leftHtml, opts.leftTitle);
    if (rightFrilly) rightHtml = nestTitleInFrilly(opts.rightTitle, rightHtml);
    else if (opts.rightTitle) rightHtml = stripInnerSectionTitle(rightHtml, opts.rightTitle);
    if (leftFrilly && rightFrilly) {
      var waved = contrastAdjacentScallops(leftHtml, rightHtml);
      leftHtml = waved.leftHtml;
      rightHtml = waved.rightHtml;
    }
    // Unframed titles sit as pair-head; inset them when the neighbour is frilly
    // so LITTLE BELLS lines up with DESSERTS inside the box.
    function headFor(title, frilly, promoBody, otherTitle, otherFrilly) {
      if (frilly || promoBody) return '';
      if (title) {
        var cls = otherFrilly ? ' pair-head-inset' : '';
        return '<div class="promo-head pair-head' + cls + '"><span class="sec-title">' +
          esc(title) + '</span></div>';
      }
      if (otherTitle && !otherFrilly) return pairHeadHtml('');
      return '';
    }
    var leftHead = headFor(opts.leftTitle, leftFrilly, leftPromoBody, opts.rightTitle, rightFrilly);
    var rightHead = headFor(opts.rightTitle, rightFrilly, rightPromoBody, opts.leftTitle, leftFrilly);
    var html = '<section class="sec ' + secClass + '">' +
      '<div class="cols cols-balanced cols-features ' + colsClass + '">' +
      '<div class="col ' + leftClass + '">' + leftHead +
        '<div class="col-body">' + leftHtml + '</div>' + leftFeat + '</div>' +
      '<div class="col ' + rightClass + '">' + rightHead +
        '<div class="col-body">' + rightHtml + '</div>' + rightFeat + '</div>' +
      '</div>' + (opts.footer || '') + '</section>';
    return { html: html, usedTitles: fill.usedTitles || [] };
  }

  /** Blocks Column section with no food partner — stay a half-column, never full-bleed. */
  function columnSoloSection(title, dishes, rule, opts) {
    opts = opts || {};
    if (!dishes || !dishes.length) return { html: '', usedPromoTitles: [] };
    var inner = sectionBlock(title, dishes, rule, 'box', { hideTitle: !!opts.hideTitle });
    var units = sectionUnits({ name: title, dishes: dishes }, !!(rule && rule.frame));
    var leveled = levelOppositeColumns(inner, units, '&nbsp;', 0, {
      promos: opts.promos,
      excludeTitles: opts.excludeTitles,
      skipPromos: !!opts.skipPromos,
      secClass: 'column-solo-row' + (opts.dataSpecials ? ' specials-col-row' : ''),
      colsClass: 'column-solo-cols',
      leftClass: opts.dataSpecials ? 'col-specials' : '',
      rightClass: 'col-promo',
      leftFrame: 'box'
    });
    var html = leveled.html;
    if (opts.dataSpecials && html) {
      html = html.replace(
        '<section class="sec column-solo-row specials-col-row">',
        '<section class="sec column-solo-row specials-col-row" data-specials-course="' +
          esc(opts.dataSpecials) + '">'
      );
    }
    return { html: html, usedPromoTitles: leveled.usedTitles };
  }

  /** Drop-in / leftover section: Column lock stays a column; split / Best fit
   *  with enough dishes can span two even columns; Full width stays full-bleed. */
  function renderUnpairedSection(title, dishes, rule, opts) {
    opts = opts || {};
    if (!dishes || !dishes.length) return { html: '', usedPromoTitles: [] };
    if (lockedColumnWidth(rule) && !opts.forceSplit) {
      return columnSoloSection(title, dishes, rule, opts);
    }
    var split = !!(opts.forceSplit || wantsSplit(rule) ||
      (isBestFit(rule) && opts.preferSplit && dishes.length >= 4));
    if (split && dishes.length >= 2) {
      return {
        html: '<section class="sec sec-split">' + sectionBlock(title, dishes, rule, 'wide', {
          twoCol: true,
          hideTitle: !!opts.hideTitle
        }) + '</section>',
        usedPromoTitles: []
      };
    }
    // Best fit / full: prefer full-bleed (not a squeezed half-column) when alone.
    if (isBestFit(rule) || lockedFullWidth(rule) || wantsSplit(rule)) {
      return {
        html: '<section class="sec">' + sectionBlock(title, dishes, rule, 'wide', {
          twoCol: false,
          hideTitle: !!opts.hideTitle
        }) + '</section>',
        usedPromoTitles: []
      };
    }
    if (canSitInColumn(rule) && (opts.preferColumn || dishes.length < 4)) {
      return columnSoloSection(title, dishes, rule, opts);
    }
    return {
      html: '<section class="sec">' + sectionBlock(title, dishes, rule, 'wide', {
        twoCol: canSitInColumn(rule) && dishes.length >= 4 && !opts.preferColumn,
        hideTitle: !!opts.hideTitle
      }) + '</section>',
      usedPromoTitles: []
    };
  }

  /**
   * Little Bells respects this host menu’s Blocks width.
   * Column stays a column; Full width stays full-bleed. Drop-in wording
   * (offer / Sunday line) stays in the Little Bells box — never across Desserts.
   * Frilly Desserts keeps its title inside the frame; unframed Little Bells
   * keeps a pair-head, inset so the two headings share a line. A small feature
   * panel drops into leftover space under the shorter stack when it fits with a gap.
   */
  function renderLittleBellsRow(bag, littleRule, dessRule, sideRule, sidesPrint, opts) {
    opts = opts || {};
    if (!bag.littleBells || !bag.littleBells.dishes || !bag.littleBells.dishes.length) {
      return { html: '', usedDesserts: false, usedSides: false, usedPromoTitles: [] };
    }
    var col = wantsColumn(littleRule);
    var frameKind = col ? 'box' : 'wide';
    // Host menu (Main / Sunday) owns its own wording + type sizes — never the card's.
    var extras = sheetOutsideParts(littleRule);
    var kidsInner = sectionBlock(
      bag.littleBells.name,
      bag.littleBells.dishes,
      littleRule,
      frameKind,
      { noteHtml: extras.aboveHtml, afterHtml: extras.belowHtml }
    );
    if (!col) {
      return {
        html: '<section class="sec">' + kidsInner + '</section>',
        usedDesserts: false,
        usedSides: false,
        usedPromoTitles: []
      };
    }
    // Frilly titles print inside the box. Unframed titles lift to pair-head.
    kidsInner = sectionBlock(
      bag.littleBells.name,
      bag.littleBells.dishes,
      littleRule,
      frameKind,
      {
        hideTitle: true,
        noteHtml: extras.aboveHtml,
        afterHtml: extras.belowHtml
      }
    );
    var kidsU = columnFillUnits(bag.littleBells, littleRule, extras.slots.above) +
      noteUnits(extras.slots.below);
    // Food first: pair with Desserts when Blocks allows Column / Best fit.
    var dessertsAllowColumn = !!(dessRule && wantsColumn(dessRule));
    if (dessertsAllowColumn && bag.desserts && bag.desserts.dishes && bag.desserts.dishes.length) {
      var dessInner = sectionBlock(bag.desserts.name, bag.desserts.dishes, dessRule, 'wide', {
        hideTitle: true
      });
      var dessU = columnFillUnits(bag.desserts, dessRule, dessRule && dessRule.note);
      var dessPair = levelOppositeColumns(kidsInner, kidsU, dessInner, dessU, {
        promos: opts.promos,
        excludeTitles: opts.excludeTitles,
        shortOnly: true,
        force: opts.force,
        leftTitle: bag.littleBells.name,
        rightTitle: bag.desserts.name,
        secClass: 'little-desserts-row',
        colsClass: 'cols-little-desserts',
        leftClass: 'col-little',
        rightClass: 'col-desserts'
      });
      return {
        html: dessPair.html,
        usedDesserts: true,
        usedSides: false,
        usedPromoTitles: dessPair.usedTitles
      };
    }
    // Food first: Sides when Blocks allows Column / Best fit.
    var sidesAllowColumn = !!(sideRule && wantsColumn(sideRule));
    if (sidesAllowColumn && sidesPrint && sidesPrint.dishes && sidesPrint.dishes.length) {
      var sideInner = sectionBlock(sidesPrint.name, sidesPrint.dishes, sideRule, 'wide', {
        hideTitle: true
      });
      var sideU = columnFillUnits(sidesPrint, sideRule, sideRule && sideRule.note);
      var sidePair = levelOppositeColumns(kidsInner, kidsU, sideInner, sideU, {
        promos: opts.promos,
        excludeTitles: opts.excludeTitles,
        shortOnly: true,
        force: opts.force,
        leftTitle: bag.littleBells.name,
        rightTitle: sidesPrint.name,
        secClass: 'little-sides-row',
        colsClass: 'cols-little-sides',
        leftClass: 'col-little',
        rightClass: 'col-sides'
      });
      return {
        html: sidePair.html,
        usedDesserts: false,
        usedSides: true,
        usedPromoTitles: sidePair.usedTitles
      };
    }
    // No food partner — stay a half-column. Do not fill the other half with rooms copy.
    var solo = levelOppositeColumns(kidsInner, kidsU, '&nbsp;', 0, {
      promos: opts.promos,
      excludeTitles: opts.excludeTitles,
      skipPromos: true,
      leftTitle: bag.littleBells.name,
      secClass: 'little-solo-row',
      colsClass: 'cols-little-solo',
      leftClass: 'col-little',
      rightClass: 'col-promo'
    });
    return {
      html: solo.html,
      usedDesserts: false,
      usedSides: false,
      usedPromoTitles: solo.usedTitles
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
      var list = filterUnusedPromos(
        (promos && promos.length) ? promos : (bag && bag.promos),
        opts.excludeTitles || []
      );
      if (list && list.length) return renderPromoBank(list, opts.frame);
      var leftoverDefaults = filterUnusedPromos([
        { title: 'Stay a While', body: 'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.' },
        { title: 'Gatherings', body: 'whether it’s a quiet supper or a special get together, we’re always happy to host your event' }
      ], opts.excludeTitles || []);
      if (leftoverDefaults.length) return renderPromoBank(leftoverDefaults, opts.frame);
      return '';
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
      sectionLayout: plan && plan.sectionLayout,
      includes: plan && plan.includes
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
    var shareRule = ruleFor((bag.sharing && bag.sharing.name) || 'Sharing Plates', plan);
    var boostRule = ruleFor('Item Boost', plan);
    var classRule = ruleFor('Pub Classics', plan);
    var burgRule = ruleFor('Burgers', plan);
    var roastRule = ruleFor('Sunday Roasts', plan);
    var mainRule = ruleFor('Mains', plan);
    var littleRule = ruleFor('Little Bells', plan);
    var sandRule = ruleFor('Sandwiches', plan);
    // Main tip-when-unticked: sell-only ad box (not hours / below as a full section).
    if (layout.sandwichTipOnly) {
      sandRule = Object.assign({}, sandRule, { tipOnly: true });
    }
    var sideRule = ruleFor('Sides', plan);
    var dessRule = ruleFor('Desserts', plan);
    // Feature panel titles already printed — each event box only once per menu.
    var usedPromoTitles = [];
    // Best-fit / Column Mains sit opposite Sandwiches when that column is empty
    // (Burgers/Classics missing) — do not leave quiz boxes in a food hole.
    var mainsPairedInCol = false;
    var specialsPairedInCol = false;
    // Honour the planner: trailing unpaired column food already sat in leftover.

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
    // Column locks can share a row (titles level, panels fill the short side).
    // Best fit prefers full-bleed when the sheet has room — only Column locks
    // auto-pair. Full-width locks always print full-bleed on their own.
    var colPending = null;
    function flushColumnPending() {
      if (!colPending) return;
      if (colPending.kind === 'specials') {
        var flushedSpec = specialsBesideCourse(colPending.dishes, plan, colPending.sectionKey, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(flushedSpec.usedPromoTitles || []);
        p1 += flushedSpec.html || '';
      } else if (lockedColumnWidth(colPending.rule)) {
        var flushedCol = columnSoloSection(
          colPending.title, colPending.dishes, colPending.rule, colPending.opts || {}
        );
        usedPromoTitles = usedPromoTitles.concat(flushedCol.usedPromoTitles || []);
        p1 += flushedCol.html;
      } else {
        // Best fit / full / split: full-bleed (split = two even dish columns).
        var flushSplit = wantsSplit(colPending.rule) && colPending.dishes.length >= 2;
        p1 += '<section class="sec' + (flushSplit ? ' sec-split' : '') + '">' +
          sectionBlock(colPending.title, colPending.dishes, colPending.rule, 'wide', {
            hideTitle: !!(colPending.opts && colPending.opts.hideTitle),
            twoCol: flushSplit
          }) + '</section>';
      }
      colPending = null;
    }
    function takeColumnPending(block) {
      if (!block || !block.dishes || !block.dishes.length) return;
      var rule = block.rule;
      // Only Column locks queue for a shared row. Best fit may be full or split.
      if (!lockedColumnWidth(rule)) {
        flushColumnPending();
        if (block.kind === 'specials') {
          var takeSpec = specialsBesideCourse(block.dishes, plan, block.sectionKey, {
            promos: promos, excludeTitles: usedPromoTitles
          });
          usedPromoTitles = usedPromoTitles.concat(takeSpec.usedPromoTitles || []);
          p1 += takeSpec.html || '';
        } else {
          var takeSplit = wantsSplit(rule) && block.dishes.length >= 2;
          p1 += '<section class="sec' + (takeSplit ? ' sec-split' : '') + '">' +
            sectionBlock(block.title, block.dishes, rule, 'wide', {
              hideTitle: !!(block.opts && block.opts.hideTitle),
              twoCol: takeSplit
            }) + '</section>';
        }
        return;
      }
      if (colPending && lockedColumnWidth(colPending.rule)) {
        var leftBlk = colPending.kind === 'specials'
          ? {
            title: specialsPrintTitle(colPending.sectionKey),
            dishes: colPending.dishes,
            rule: colPending.rule,
            leftClass: 'col-specials'
          }
          : {
            title: colPending.title,
            dishes: colPending.dishes,
            rule: colPending.rule,
            hideTitle: !!(colPending.opts && colPending.opts.hideTitle)
          };
        var rightBlk = block.kind === 'specials'
          ? {
            title: specialsPrintTitle(block.sectionKey),
            dishes: block.dishes,
            rule: block.rule
          }
          : {
            title: block.title,
            dishes: block.dishes,
            rule: block.rule,
            hideTitle: !!(block.opts && block.opts.hideTitle)
          };
        var paired = pairColumnFood(leftBlk, rightBlk, {
          promos: promos,
          excludeTitles: usedPromoTitles,
          secClass: 'col-pair-row',
          dataSpecials: colPending.kind === 'specials' ? colPending.sectionKey
            : (block.kind === 'specials' ? block.sectionKey : '')
        });
        usedPromoTitles = usedPromoTitles.concat(paired.usedTitles || []);
        p1 += paired.html || '';
        colPending = null;
        return;
      }
      colPending = block;
    }

    if (bag.specialStarters && bag.specialStarters.dishes && bag.specialStarters.dishes.length) {
      var specStartRule = ruleFor('Special Starters', plan);
      if (specStartRule.frame == null) specStartRule.frame = true;
      takeColumnPending({
        kind: 'specials',
        sectionKey: 'Special Starters',
        title: 'Special Starters',
        dishes: bag.specialStarters.dishes,
        rule: specStartRule
      });
    }

    if (shareAsFull && !shareInLeft) {
      flushColumnPending();
      p1 += '<section class="sec">' +
        sectionBlock(bag.sharing.name, shareDishes, shareRule, 'wide', {
          twoCol: shareDishes.length >= 2
        }) +
        '</section>';
    }
    if (bag.boost) {
      takeColumnPending({
        title: bag.boost.name,
        dishes: bag.boost.dishes,
        rule: boostRule,
        opts: { hideTitle: true, promos: promos, excludeTitles: usedPromoTitles }
      });
    }
    flushColumnPending();
    bag.other.forEach(function (s) {
      if (!isMains(s.name) && !isSundayRoasts(s.name) && !isDessert(s.name) && !isSandwich(s.name) &&
          !isBurgers(s.name) && !isItemBoost(s.name) && !isSpecials(s.name) && !isLittleBells(s.name)) {
        var otherRule = ruleFor(s.name, plan);
        var otherOut = renderUnpairedSection(s.name, s.dishes, otherRule, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(otherOut.usedPromoTitles || []);
        p1 += otherOut.html;
      }
    });

    // Sunday Roasts on page 1 (after starters, before promo/classics footers) when balanced here.
    var roastsOnPage1 = !!(bag.sundayRoasts && (layout.pages === 1 || p1opts.sundayRoasts));
    if (roastsOnPage1) {
      var roastOut1 = renderUnpairedSection(bag.sundayRoasts.name, bag.sundayRoasts.dishes, roastRule, {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(roastOut1.usedPromoTitles || []);
      p1 += roastOut1.html;
    }

    if (showColBlock && classicsAsColumn) {
      // Logo already in top-band when starters/nibbles sit there — columns start level below
      var logoInTop = nibblesInTop || startersInTop;
      var sandOnRightNote = false;
      // Estimate food-stack height so Sides / sandwich sell balance columns;
      // feature panels stay little promotions under whatever is still short.
      var leftFoodU = 0;
      var rightFoodU = 0;
      // columnFillUnits includes wrapUnits so long Sharing descriptions beat a
      // short Burgers stack — panels go under Burgers, not under Sharing.
      if (shareInLeft) leftFoodU += columnFillUnits({ name: 'Sharing', dishes: shareDishes }, shareRule);
      if (burgerDishes.length) rightFoodU += columnFillUnits({ name: 'Burgers', dishes: burgerDishes }, burgRule);
      if (classicDishes.length) {
        rightFoodU += columnFillUnits({ name: 'Pub Classics', dishes: classicDishes }, classRule);
      }

      // Named fillings stay left beside Burgers. Tip/sell box goes to the SHORTER
      // column so we do not pile Burgers + Sandwiches + Sides on the right while
      // Sharing sits alone under a huge empty promo frame.
      var sandOnLeftCol = false;
      var sandOnRightCol = false;
      if (sandwichesInCol && sandList.length) {
        sandOnLeftCol = true;
        leftFoodU += sandwichesPackCost(bag, sandRule);
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

      // Place Sides under whichever side finishes closer to level (system rule).
      // Prefer not under Sharing when both placements are similar — that dump is
      // what left Burgers short with no feature panel on the PDF example.
      var sidesOnLeftCol = false;
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule)) {
        var sideAddU = sectionUnits(sidesPrint, false);
        var gapIfLeft = Math.abs((leftFoodU + sideAddU) - rightFoodU);
        var gapIfRight = Math.abs(leftFoodU - (rightFoodU + sideAddU));
        if (shareInLeft && Math.abs(gapIfLeft - gapIfRight) <= 2.5) {
          sidesOnLeftCol = false;
        } else {
          sidesOnLeftCol = gapIfLeft <= gapIfRight;
        }
        if (sidesOnLeftCol) leftFoodU += sideAddU;
        else rightFoodU += sideAddU;
      }

      var leftHasFood = !!(shareInLeft || sandOnLeftCol || (sidesOnLeftCol && sidesPrint));
      var rightHasFood = !!(burgerDishes.length || classicDishes.length || sandOnRightCol ||
        (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule) && !sidesOnLeftCol));
      var mainsInRightCol = false;
      // Only Column / Best-fit Mains fill a hole opposite Sandwiches.
      // Locked Full stays full-bleed. Do not steal the Sandwiches column from Sides.
      if ((sandOnLeftCol || sandOnRightCol) && !rightHasFood && bag.mains &&
          bag.mains.dishes && bag.mains.dishes.length && canSitInColumn(mainRule)) {
        mainsInRightCol = true;
        mainsPairedInCol = true;
        rightHasFood = true;
        rightFoodU += sectionUnits(bag.mains, false);
      }

      // Orphan column (e.g. Sandwiches alone): span food full-width, two feature
      // panels as a footer row — never leave a tall empty hole beside a column.
      // Exception: Blocks “Column” lock must stay half-width — never orphan
      // Sharing / Sides / Sandwiches to full-bleed. Pair with a feature panel.
      var shareLockedCol = !!(shareInLeft && lockedColumnWidth(shareRule));
      var sidesLockedCol = !!(p1opts.sidesOnP1 && sidesPrint && lockedColumnWidth(sideRule));
      var sandLockedCol = !!(
        (sandOnLeftCol || sandOnRightCol) && lockedColumnWidth(sandRule)
      );
      if (orphanColumnHole(leftFoodU, rightFoodU) && !(leftHasFood && rightHasFood) &&
          !shareLockedCol && !sidesLockedCol && !sandLockedCol) {
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
          else if (p1opts.rooms) {
            p1 += renderFiller('rooms', bag, promos, { excludeTitles: usedPromoTitles });
          }
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
      var colGap = (rightFoodU || 0) - (leftFoodU || 0);
      if (!promoCols.left && !promoCols.right && Math.abs(colGap) > 2.5) {
        promoCols = planPromoFill(leftFoodU, rightFoodU, promos, Object.assign({}, promoFrameOpts, {
          force: { shorter: colGap > 0 ? 'left' : 'right', panels: Math.abs(colGap) > 9 ? 2 : 1 }
        }));
      }
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
      if (mainsInRightCol && bag.mains) {
        p1 += framedBlock(sectionTitle(bag.mains.name) + listDishes(bag.mains.dishes), mainRule);
      }
      if (sandOnRightCol) {
        p1 += sandwichesBlock(bag, { frame: sandRule.frame ? 'box' : undefined, rule: sandRule });
      }
      if (p1opts.sidesOnP1 && sidesPrint && wantsColumn(sideRule) && !sidesOnLeftCol) {
        p1 += framedBlock(sectionTitle(sidesPrint.name) + listDishes(sidesPrint.dishes), sideRule);
      }
      if (!burgerDishes.length && !classicDishes.length && !mainsInRightCol && !rightFeature &&
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
      if (p1opts.rooms) {
        p1 += renderFiller('rooms', bag, promos, { excludeTitles: usedPromoTitles });
      }
      if (p1opts.sandwiches) p1 += sandwichesBlock(bag, { rule: sandRule });
    } else if (p1opts.rooms || p1opts.sandwiches) {
      p1 += '<section class="sec classics-block"><div class="cols cols-classics cols-balanced cols-features">';
      p1 += '<div class="col col-events"><div class="col-body">&nbsp;</div>';
      if (p1opts.rooms) {
        p1 += '<div class="col-feature">' +
          renderFiller('rooms', bag, promos, {
            frame: p1opts.sandwiches ? 'wide' : 'box',
            excludeTitles: usedPromoTitles
          }) +
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
      if (bag.mains && !mainsPairedInCol) {
        var mainSolo1 = renderUnpairedSection(bag.mains.name, bag.mains.dishes, mainRule, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(mainSolo1.usedPromoTitles || []);
        p1 += mainSolo1.html;
      }
      // Column / Best-fit Specials sit beside Sandwiches when fillings are still
      // waiting (not already in the classics columns) so they do not fall off.
      var nestedSidesP1 = false;
      if (canPairSpecialsWithSandwiches(
        bag.specialMains && bag.specialMains.dishes,
        plan,
        !!(p1opts.sandwiches && !showColBlock)
      )) {
        var nest1 = null;
        if (layout.pages === 1 && sidesPrint && !p1opts.sidesOnP1 &&
            sidesFitUnderSpecials(bag, sandRule, sidesPrint)) {
          nest1 = sidesPrint;
        }
        var pairSpec1 = specialsSandwichesPair(bag, plan, {
          sandRule: sandRule,
          sideRule: sideRule,
          promos: promos,
          excludeTitles: usedPromoTitles,
          nestSides: nest1
        });
        usedPromoTitles = usedPromoTitles.concat(pairSpec1.usedTitles || []);
        p1 += pairSpec1.html || '';
        specialsPairedInCol = true;
        p1opts.sandwiches = false;
        nestedSidesP1 = !!nest1;
      }
      if (bag.specialMains && bag.specialMains.dishes && bag.specialMains.dishes.length &&
          !specialsPairedInCol) {
        var soloSpec1 = specialsBesideCourse(bag.specialMains.dishes, plan, 'Special Mains', {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(soloSpec1.usedPromoTitles || []);
        p1 += soloSpec1.html || '';
      }
      // Food-first column pairing (Sides/Desserts when Blocks allow); else feature panels.
      var littleP1 = renderLittleBellsRow(
        bag, littleRule, dessRule, sideRule, sidesPrint,
        { promos: promos, excludeTitles: usedPromoTitles }
      );
      usedPromoTitles = usedPromoTitles.concat(littleP1.usedPromoTitles || []);
      p1 += littleP1.html;
      if (bag.desserts && !littleP1.usedDesserts) {
        var dessSolo1 = renderUnpairedSection(bag.desserts.name, bag.desserts.dishes, dessRule, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(dessSolo1.usedPromoTitles || []);
        p1 += dessSolo1.html;
      }
      if (bag.specialDesserts && bag.specialDesserts.dishes && bag.specialDesserts.dishes.length) {
        var soloDess1 = specialsBesideCourse(bag.specialDesserts.dishes, plan, 'Special Desserts', {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(soloDess1.usedPromoTitles || []);
        p1 += soloDess1.html || '';
      }
      if (sidesPrint && !p1opts.sidesOnP1 && !littleP1.usedSides && !nestedSidesP1) {
        var sideSolo1 = renderUnpairedSection(sidesPrint.name, sidesPrint.dishes, sideRule, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(sideSolo1.usedPromoTitles || []);
        p1 += sideSolo1.html;
      }
      if (bag.sauces) p1 += '<section class="sec">' + sectionTitle(bag.sauces.name) + listDishes(bag.sauces.dishes) + '</section>';
      if (p1opts.sandwiches && !showColBlock) {
        p1 += renderFiller('sandwiches', bag, promos, { rule: sandRule });
      }
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
      var roastOut2 = renderUnpairedSection(bag.sundayRoasts.name, bag.sundayRoasts.dishes, roastRule, {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(roastOut2.usedPromoTitles || []);
      p2 += roastOut2.html;
    }
    var p2Force = (plan && plan.forceColumnFill && plan.forceColumnFill.page2) || null;
    var littleFoodPartner = !!(bag.littleBells && bag.littleBells.dishes && bag.littleBells.dishes.length &&
      wantsColumn(littleRule) && (
        (dessRule && wantsColumn(dessRule) && bag.desserts && bag.desserts.dishes && bag.desserts.dishes.length) ||
        (sideRule && wantsColumn(sideRule) && sidesPrint && sidesPrint.dishes && sidesPrint.dishes.length)
      ));
    if (bag.mains && !mainsPairedInCol && p2opts.sandwiches && canSitInColumn(mainRule) &&
        bag.mains.dishes && bag.mains.dishes.length &&
        !(p2opts.sidesOnP2 && sidesPrint && sidesPrint.dishes && sidesPrint.dishes.length) &&
        !canPairSpecialsWithSandwiches(
          bag.specialMains && bag.specialMains.dishes, plan, true
        )) {
      // Column Mains sit opposite Sandwiches only when Sides are not also on page 2
      // and Specials are not taking that column (Specials + Sandwiches saves a row).
      // Food map: Sides beside Sandwiches. Best-fit Mains may fill the hole if Sides are elsewhere.
      var sandU2 = sandwichesPackCost(bag, sandRule);
      var mainU2 = sectionUnits(bag.mains, false);
      var pair2 = levelOppositeColumns(
        sandwichesBlock(bag, {
          frame: sandRule.frame ? 'box' : undefined,
          rule: sandRule,
          hideTitle: true
        }),
        sandU2,
        framedBlock(listDishes(bag.mains.dishes), mainRule),
        mainU2,
        {
          promos: promos,
          excludeTitles: usedPromoTitles,
          shortOnly: true,
          force: littleFoodPartner ? null : p2Force,
          leftTitle: 'Sandwiches',
          rightTitle: bag.mains.name,
          secClass: 'mains-sand-row',
          leftClass: '',
          rightClass: 'col-food'
        }
      );
      usedPromoTitles = usedPromoTitles.concat(pair2.usedTitles || []);
      p2 += pair2.html;
      mainsPairedInCol = true;
      p2opts.sandwiches = false;
    }
    if (bag.mains && !mainsPairedInCol) {
      var mainSolo2 = renderUnpairedSection(bag.mains.name, bag.mains.dishes, mainRule, {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(mainSolo2.usedPromoTitles || []);
      p2 += mainSolo2.html;
    }
    // Column / Best-fit Specials sit opposite Sandwiches instead of a full-bleed
    // box above Sides|Sandwiches — that stack is what pushed fillings off the page.
    var nestedSidesP2 = false;
    if (canPairSpecialsWithSandwiches(
      bag.specialMains && bag.specialMains.dishes,
      plan,
      !!p2opts.sandwiches
    )) {
      var nest2 = null;
      var nestSauces2 = null;
      if (p2opts.sidesOnP2 && sidesPrint && sidesPrint.dishes && sidesPrint.dishes.length &&
          (layout.p2.sidesUnderSpecials || sidesFitUnderSpecials(bag, sandRule, sidesPrint))) {
        nest2 = sidesPrint;
        if (bag.sauces) nestSauces2 = bag.sauces;
      }
      var pairSpec2 = specialsSandwichesPair(bag, plan, {
        sandRule: sandRule,
        sideRule: sideRule,
        promos: promos,
        excludeTitles: usedPromoTitles,
        force: littleFoodPartner ? null : p2Force,
        nestSides: nest2,
        nestSauces: nestSauces2
      });
      usedPromoTitles = usedPromoTitles.concat(pairSpec2.usedTitles || []);
      p2 += pairSpec2.html || '';
      specialsPairedInCol = true;
      p2opts.sandwiches = false;
      if (nest2) {
        nestedSidesP2 = true;
        p2opts.sidesOnP2 = false;
      }
    }
    if (bag.specialMains && bag.specialMains.dishes && bag.specialMains.dishes.length &&
        !specialsPairedInCol) {
      var soloSpec2 = specialsBesideCourse(bag.specialMains.dishes, plan, 'Special Mains', {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(soloSpec2.usedPromoTitles || []);
      p2 += soloSpec2.html || '';
    }
    // Food-first column pairing; feature panels fill any remaining short column.
    var littleP2 = renderLittleBellsRow(
      bag, littleRule, dessRule, sideRule, sidesPrint,
      { promos: promos, excludeTitles: usedPromoTitles, force: littleFoodPartner ? p2Force : null }
    );
    usedPromoTitles = usedPromoTitles.concat(littleP2.usedPromoTitles || []);
    p2 += littleP2.html;
    if (bag.desserts && !littleP2.usedDesserts) {
      var dessSolo2 = renderUnpairedSection(bag.desserts.name, bag.desserts.dishes, dessRule, {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(dessSolo2.usedPromoTitles || []);
      p2 += dessSolo2.html;
    }
    if (bag.specialDesserts && bag.specialDesserts.dishes && bag.specialDesserts.dishes.length) {
      var soloDess2 = specialsBesideCourse(bag.specialDesserts.dishes, plan, 'Special Desserts', {
        promos: promos, excludeTitles: usedPromoTitles
      });
      usedPromoTitles = usedPromoTitles.concat(soloDess2.usedPromoTitles || []);
      p2 += soloDess2.html || '';
    }

    var showBottom = (p2opts.sidesOnP2 && (sidesPrint || bag.sauces) && !littleP2.usedSides && !nestedSidesP2) ||
      p2opts.sandwiches || p2opts.rooms;
    if (showBottom) {
      var sidesCol = sidesPrint && wantsColumn(sideRule);
      var sideList = (p2opts.sidesOnP2 && sidesPrint && !littleP2.usedSides) ? sidesPrint.dishes.slice() : [];
      var sidesSplit = wantsSplit(sideRule) && sideList.length >= 2;
      var remainingPromos = filterUnusedPromos(promos, usedPromoTitles);
      // Split (Best-fit AI / planner): one category across two even columns.
      if (sidesSplit && sideList.length && !p2opts.sandwiches) {
        p2 += '<section class="sec sec-split">';
        p2 += '<div class="sec-title soft-left">' + esc(sidesPrint.name) + '</div>';
        p2 += listDishesCols(sideList);
        if (p2opts.sidesOnP2 && bag.sauces) {
          p2 += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          p2 += listDishes(bag.sauces.dishes);
        }
        p2 += '</section>';
        if (p2opts.footPromos || canFitFootPromos(layout.leftover && layout.leftover.p2)) {
          var footSplit = footPromoPair(remainingPromos, { excludeTitles: usedPromoTitles });
          usedPromoTitles = usedPromoTitles.concat(footSplit.usedTitles || []);
          if (footSplit.html) p2 += footSplit.html;
          else if (p2opts.rooms) p2 += renderFiller('rooms', bag, remainingPromos);
        }
      } else
      // Sides (and sauces) in the left column; Sandwiches fully in the frilly box on the right.
      // If Sides sit alone (no sandwiches opposite), Best fit may span full-width + foot panels.
      // Blocks “Column” lock must stay half-width — never orphan to full-bleed.
      if ((sidesCol || p2opts.sandwiches || p2opts.rooms) && (sideList.length || p2opts.sandwiches || p2opts.rooms || bag.sauces)) {
        var sideU = 0;
        if (sideList.length) {
          sideU += columnFillUnits({ name: 'Sides', dishes: sideList }, sideRule);
        }
        if (p2opts.sidesOnP2 && bag.sauces) {
          sideU += columnFillUnits(bag.sauces, { frame: false });
        }
        // Level with visual height — not the heavy pack cost used for page CLIP.
        // Framed Sandwiches + hours often run taller than a longer plain Sides list.
        var rightU = p2opts.sandwiches ? sandwichesLevelCost(bag, sandRule) : 0;
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
        var leftInner = '';
        if (sideList.length) leftInner += listDishes(sideList);
        if (p2opts.sidesOnP2 && bag.sauces) {
          leftInner += '<div class="sec-title soft-left">' + esc(bag.sauces.name) + '</div>';
          leftInner += listDishes(bag.sauces.dishes);
        }
        if (!leftInner) leftInner = '&nbsp;';
        var rightInner = p2opts.sandwiches
          ? sandwichesBlock(bag, { rule: sandRule, hideTitle: true })
          : '&nbsp;';
        // Empty partner opposite Sandwiches (or Sides) must get feature panels so
        // both columns start and finish level — never skipPromos on a food hole.
        var p2Pair = levelOppositeColumns(leftInner, sideU, rightInner, rightU, {
          promos: remainingPromos,
          excludeTitles: usedPromoTitles,
          force: littleFoodPartner ? null : (p2Force || (
            (!sideList.length && p2opts.sandwiches)
              ? { shorter: 'left', panels: rightU > 12 ? 2 : 1 }
              : null
          )),
          leftTitle: sideList.length ? ((sidesPrint && sidesPrint.name) || 'Sides') : '',
          rightTitle: p2opts.sandwiches ? 'Sandwiches' : '',
          secClass: 'sides-sand-row',
          colsClass: 'bottom-cols',
          leftClass: 'col-sides',
          rightClass: 'col-promo',
          leftFrame: 'box',
          rightFrame: 'wide'
        });
        usedPromoTitles = usedPromoTitles.concat(p2Pair.usedTitles || []);
        p2 += p2Pair.html;
        }
      } else if (p2opts.sidesOnP2 && sidesPrint) {
        var sideSolo2 = renderUnpairedSection(sidesPrint.name, sidesPrint.dishes, sideRule, {
          promos: promos, excludeTitles: usedPromoTitles
        });
        usedPromoTitles = usedPromoTitles.concat(sideSolo2.usedPromoTitles || []);
        p2 += sideSolo2.html;
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
      var offerAbove = '';
      var outsideBelow = '';
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
        var lbRule = { note: '', sell: '', above: '', below: '' };
        if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
          lbRule = root.EBMenus.sectionLayoutFor('Little Bells', plan && plan.sectionLayout) || lbRule;
        } else if (plan && plan.sectionLayout && plan.sectionLayout['Little Bells']) {
          lbRule = plan.sectionLayout['Little Bells'];
        }
        var lbSlots = (root.EBMenus && root.EBMenus.cardOutsideSlots)
          ? root.EBMenus.cardOutsideSlots(lbRule)
          : { above: lbRule.above || '', aboveKind: lbRule.aboveKind || 'heading',
              below: lbRule.below || '', belowKind: lbRule.belowKind || 'text' };
        offerAbove = cardBlurbHtml(lbSlots.above, lbSlots.aboveKind, 'above');
        outsideBelow = cardBlurbHtml(lbSlots.below, lbSlots.belowKind, 'below');
        inner = scallop(dishes.map(function (d) { return dishCentered(d, { hidePrice: true, hideLunch: true }); }).join(''));
      } else if (menu.id === 'sandwiches') {
        var sandRule = {};
        if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
          sandRule = root.EBMenus.sectionLayoutFor('Sandwiches', plan && plan.sectionLayout) || {};
        }
        var sandSlots = (root.EBMenus && root.EBMenus.cardOutsideSlots)
          ? root.EBMenus.cardOutsideSlots(sandRule)
          : { above: sandRule.above || '', aboveKind: sandRule.aboveKind || 'paragraph',
              below: '', belowKind: sandRule.belowKind || 'paragraph' };
        offerAbove = cardBlurbHtml(sandSlots.above, sandSlots.aboveKind, 'above');
        inner = cardSandwichesInner(dishes, plan);
        outsideBelow = cardBlurbHtml(sandSlots.below || cardSandwichesSpiel(plan), sandSlots.belowKind, 'below') ||
          cardOutsideHtml(cardSandwichesSpiel(plan));
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
        // desserts etc — optional above/below boxes with a type size
        var dessertRule = {};
        if (root.EBMenus && root.EBMenus.sectionLayoutFor) {
          dessertRule = root.EBMenus.sectionLayoutFor(
            (dishes[0] && dishes[0].section) || 'Desserts',
            plan && plan.sectionLayout
          ) || {};
        }
        var dessertSlots = (root.EBMenus && root.EBMenus.cardOutsideSlots)
          ? root.EBMenus.cardOutsideSlots(dessertRule)
          : { above: dessertRule.above || '', aboveKind: 'paragraph',
              below: dessertRule.below || '', belowKind: 'paragraph' };
        offerAbove = cardBlurbHtml(dessertSlots.above, dessertSlots.aboveKind, 'above');
        outsideBelow = cardBlurbHtml(dessertSlots.below, dessertSlots.belowKind, 'below');
        inner = scallop(dishes.map(function (d) { return dishCentered(d); }).join(''));
      }
      var faceCls = 'card-face fill-page fill-airy' +
        (menu.id === 'specials' ? ' specials-face' : '') +
        (menu.id === 'little-bells' ? ' kids-face' : '') +
        (menu.id === 'sandwiches' ? ' sandwiches-face' : '');
      return (
        '<article class="' + faceCls + '">' +
          '<div class="card-top">' +
            trackerBar(ver) +
            '<img class="logo" src="' + esc(asset('eight-bells-logo.png')) + '" alt="">' +
            (menu.id === 'lunch-club' ? '' : '<h1>' + esc(title) + '</h1>') +
          '</div>' +
          offerAbove +
          '<div class="card-mid">' + inner + '</div>' +
          outsideBelow +
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
        '--dish-gap:15px;--sec-gap:16px;--name:11.5pt;--desc:10pt;--title:22pt;--promo:11.5pt;' +
        '--name-min:11pt;--name-max:11.5pt;--desc-min:10pt;--desc-max:10pt;--title-min:16pt;--title-max:22pt;' +
        '--dish-gap-min:13px;--dish-gap-max:18px}' +
      '*{box-sizing:border-box} html,body{margin:0;max-width:100%;overflow-x:hidden} body{background:#d9d3c8;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:50;background:#1c1610;color:#f4eae3;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;width:100%;max-width:100vw;box-sizing:border-box}' +
      '.toolbar button,.toolbar label.paper-opt{font:600 13px var(--sans);padding:8px 14px;border:0;border-radius:999px;cursor:pointer;background:#f4eae3;color:#1c1610}' +
      '.toolbar label.paper-opt{display:inline-flex;align-items:center;gap:6px;background:#3a342c;color:#f4eae3}' +
      '.toolbar label.paper-opt input{margin:0}' +
      '.toolbar .hint{font-size:12.5px;opacity:.9;max-width:640px}' +
      '.page,.sheet,.cut-sheet{background:#fff;margin:14px auto;box-shadow:0 10px 28px rgba(0,0,0,.14)}' +
      '.page{width:210mm;height:297mm;padding:11mm 10mm 9mm;position:relative;display:flex;flex-direction:column;overflow:hidden}' +
      '.page-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;min-height:0;overflow:hidden}' +
      '.page-body.spread-even{justify-content:space-evenly}' +
      /* Leftover space sits BETWEEN sections — never stretch a column pair so a
         leftover panel drops to the page foot with a hole beside Sides. */
      '.page-body-start{padding-top:0}' +
      '.page-spacer{flex:1 1 auto;min-height:0}' +
      '.page-body > .sec,.page-body > .top-band,.page-body > .cols,.page-body > .classics-block,.page-body > .foot-logo{flex:0 0 auto}' +
      /* When spreading, let the main column / bottom band grow so type stays large
         but the block reaches the foot — no blank bottom third. */
      '.page-body.spread-even > .sec,.page-body.spread-even > .classics-block,.page-body.spread-even > .cols.bottom-cols{flex:0 0 auto}' +
      '.page-body.spread-even > .classics-block,.page-body.spread-even > .cols.bottom-cols,.page-body.spread-even > .foot-logo{display:flex;flex-direction:column}' +
      '.page-body.spread-even > .classics-block > .cols,.page-body.spread-even > .cols.bottom-cols{flex:0 0 auto;align-items:stretch}' +
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
      '.card-face.kids-face.fill-airy,.card-face.kids-face.fill-roomy{--dish-gap:12px;--name:12pt;--desc:10pt;--title:20pt}' +
      '.card-face.sandwiches-face.fill-airy{--dish-gap:12px;--name:12.5pt;--desc:10.5pt;--title:20pt}' +
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
      '.card-offer{flex:0 0 auto;text-align:center;margin:0 0 8px;font-family:var(--serif);color:var(--ink);line-height:1.3;text-transform:none}' +
      '.card-offer .lb-price-line{font-family:var(--serif);font-weight:700;font-size:16pt;letter-spacing:.04em;margin:0 0 4px;text-transform:none}' +
      '.card-offer .lb-offer-sub{font-family:var(--sans);font-weight:600;font-size:11pt;line-height:1.35;text-transform:none}' +
      '.card-outside{flex:0 0 auto;text-align:center;margin:8px 4px 0;font-family:var(--sans);font-weight:600;font-size:10.5pt;line-height:1.4;color:#1c1610;text-transform:none}' +
      '.card-blurb{flex:0 0 auto;text-align:center;text-transform:none;letter-spacing:normal;color:var(--ink)}' +
      '.card-blurb-above{margin:0 4px 8px}' +
      '.card-blurb-below{margin:8px 4px 0}' +
      '.card-blurb-title{font-family:var(--serif);font-weight:700;font-size:16pt;line-height:1.25}' +
      '.card-blurb-heading{font-family:var(--serif);font-weight:600;font-size:13pt;line-height:1.35}' +
      '.card-blurb-subhead{font-family:var(--serif);font-weight:600;font-size:12pt;line-height:1.35}' +
      '.card-blurb-paragraph{font-family:var(--sans);font-weight:500;font-size:11pt;line-height:1.4}' +
      '.card-blurb-text{font-family:var(--sans);font-weight:400;font-size:10pt;line-height:1.4;color:#3a342c}' +
      '.card-blurb .lb-price-line{font-family:var(--serif);font-weight:700;letter-spacing:.03em;margin:0 0 4px;text-transform:none}' +
      '.card-blurb-title .lb-price-line{font-size:18pt}' +
      '.card-blurb-heading .lb-price-line{font-size:15pt}' +
      '.card-blurb .lb-offer-sub{font-family:var(--sans);font-weight:600;font-size:11pt;line-height:1.35;text-transform:none}' +
      '.card-face .card-spiel{margin-top:8px}' +
      '.card-face .logo{width:86px;margin:0 auto 8px}' +
      '.card-face h1{margin:2px 0 10px;font-size:min(var(--title),22pt)}' +
      /* Specials card: compact titles so dishes dominate the board */
      '.card-face.specials-face h1{font-size:14pt;letter-spacing:.14em;margin:2px 0 6px}' +
      '.specials-course{font-family:var(--serif);font-weight:700;font-size:10.5pt;letter-spacing:.1em;text-transform:uppercase;text-align:center;text-decoration:underline;text-underline-offset:2px;margin:8px 0 4px;line-height:1.2}' +
      '.specials-course:first-of-type{margin-top:4px}' +
      '.specials-course-left{text-align:left;text-decoration:none;font-size:10pt;letter-spacing:.08em;margin:6px 0 3px}' +
      /* Main/Sunday: Full-width Specials sit under the course. Column lock
         uses column-solo instead (never stretch to 100%). */
      '.specials-beside{width:100%;max-width:100%;align-self:stretch;box-sizing:border-box;margin:0 0 10px}' +
      '.specials-beside > .scallop,.specials-beside .scallop{' +
        'width:100%!important;max-width:100%;box-sizing:border-box;display:block}' +
      // Title left like the parent sheet; pad matches unframed dish gutters so prices share a line
      '.specials-beside .specials-beside-title,.specials-beside .sec-title.specials-beside-title{' +
        'font-size:min(var(--title),18pt)!important;letter-spacing:.1em;margin:0 0 4px;text-align:left!important;line-height:1.2}' +
      '.specials-beside .sec-note{text-align:left!important;margin:0 0 6px;font-size:9.5pt}' +
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
      // Original Canva frames: box = tight scallop, wide = looser wave. Single line only.
      '.scallop-wide{border-image-source:url("' + asset('frame-wide.png') + '");border-width:12px;border-image-width:12px;border-image-slice:42 fill}' +
      '.scallop-box{border-image-source:url("' + asset('frame-box.png') + '");border-width:12px;border-image-width:12px;border-image-slice:48 fill}' +
      // Adjacent food scallops: matching frames pick the other wave on the neighbour.
      '.cols-balanced > .col:has(> .col-body > .scallop-box) + .col > .col-body > .scallop-box{' +
        'border-image-source:url("' + asset('frame-wide.png') + '");border-image-slice:42 fill}' +
      '.cols-balanced > .col:has(> .col-body > .scallop-wide) + .col > .col-body > .scallop-wide{' +
        'border-image-source:url("' + asset('frame-box.png') + '");border-image-slice:48 fill}' +
      '.scallop-pad{padding:6px 12px 10px;overflow:hidden;min-width:0}' +
      // Food frames stay content-sized — never stretch to fill the tall neighbour.
      '.cols-balanced .col-body > .scallop{height:fit-content;align-self:stretch;flex:0 0 auto}' +
      '.sec-split .share-cols{margin-top:2px}' +
      '.scallop-box .scallop-pad{padding:6px 12px 10px}' +
      '.dish{margin:0 0 max(var(--dish-gap-min),var(--dish-gap));min-width:0;max-width:100%}' +
      /* Leaders only between name and price on one row — never under the description */
      /* align-items:center + 1em mark keeps every dish-line the same height (no lunch-gap stretch) */
      '.dish-line{display:flex;flex-wrap:nowrap;align-items:center;min-width:0;max-width:100%;gap:0;line-height:1.28}' +
      '.dish-name{font-family:var(--sans);font-weight:700;font-size:clamp(var(--name-min),var(--name),var(--name-max));line-height:1.28;min-width:0;flex:0 1 auto;overflow-wrap:anywhere}' +
      '.dish-leader{display:block;flex:1 1 auto;border-bottom:1px dotted #b0a89c;margin:0 6px;min-width:10px;height:0;align-self:center;transform:translateY(0.35em)}' +
      '.dish-line .lc{width:1em;height:1em;margin:0 0.2em 0 0.08em;flex:0 0 auto;align-self:center;font-size:var(--name);object-fit:contain;display:block}' +
      '.price{font-family:var(--sans);font-weight:500;font-size:clamp(var(--name-min),var(--name),var(--name-max));line-height:1.28;white-space:nowrap;flex:0 0 auto;padding-left:0}' +
      /* Descriptions: Roboto Light so dish names dominate (classical Word menu). */
      '.desc{font-family:var(--sans);font-weight:300;font-size:clamp(var(--desc-min),var(--desc),var(--desc-max));color:#5a534a;margin-top:2px;line-height:1.35;max-width:100%;overflow-wrap:anywhere}' +
      '.dish .desc,.promo .desc,.sandwich-promo .desc{font-weight:300;color:#5a534a}' +
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
      '.preview-clip{width:100%;overflow:hidden}' +
      '.cols-balanced .col{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column}' +
      '.cols-balanced .col-events,.cols-balanced .col-food{min-height:0;min-width:0;overflow:hidden;display:flex;flex-direction:column}' +
      '.cols-balanced .col-body{flex:0 0 auto;min-width:0}' +
      '.cols-balanced .col-logo{flex:0 0 auto;display:flex;justify-content:flex-end;margin:0 0 8px}' +
      '.cols-balanced .col-logo .logo-tr{width:160px!important;margin:0}' +
      '.cols-with-logo{align-items:stretch;margin-top:0}' +
      '.cols-balanced .col-feature,.cols-balanced .col-fill{margin-top:auto;padding-top:18px;flex:0 0 auto;min-width:0;width:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:10px}' +
      '.cols-balanced .col-feature > .scallop,.cols-balanced .col-fill > .scallop{width:100%;flex:0 0 auto}' +
      '.cols-balanced .col-feature > .scallop .scallop-pad,.cols-balanced .col-fill > .scallop .scallop-pad{flex:0 0 auto}' +
      '.sec-note{font-family:var(--sans);font-size:clamp(var(--desc-min),var(--desc),var(--desc-max));color:#3a342c;line-height:1.35;margin:0 0 8px;font-weight:400;text-transform:none;letter-spacing:normal}' +
      '.sec-note-after{margin-top:8px}' +
      '.sec-stack{margin:0}' +
      '.scallop .sec-note{margin-top:0}' +
      '.scallop-pad .sheet-blurb{text-align:left}' +
      '.scallop-pad > .sheet-blurb-above{margin-top:0}' +
      '.scallop-pad > .sheet-blurb-below{margin-bottom:0}' +
      // Drop-ins on Main/Sunday follow the sheet: left like dishes, not card-centred.
      '.sheet-blurb{text-align:left;text-transform:none;letter-spacing:normal;color:var(--ink);max-width:none;margin-left:0;margin-right:0}' +
      '.sheet-blurb-above{margin:0 0 8px}' +
      '.sheet-blurb-below{margin:8px 0 0}' +
      '.sheet-blurb-title{font-family:var(--serif);font-weight:700;font-size:clamp(16pt,var(--title),22pt);line-height:1.2}' +
      '.sheet-blurb-heading{font-family:var(--serif);font-weight:600;font-size:clamp(13.5pt,calc(var(--name) + 4pt),17pt);line-height:1.3}' +
      '.sheet-blurb-subhead{font-family:var(--serif);font-weight:600;font-size:clamp(12pt,calc(var(--name) + 1.5pt),13.5pt);line-height:1.35}' +
      '.sheet-blurb-paragraph{font-family:var(--sans);font-weight:500;font-size:clamp(11pt,var(--name),12pt);line-height:1.4}' +
      '.sheet-blurb-text{font-family:var(--sans);font-weight:400;font-size:clamp(9.5pt,var(--desc),10.5pt);line-height:1.4;color:#3a342c}' +
      '.sheet-blurb .lb-price-line{font-family:var(--serif);font-weight:700;letter-spacing:.03em;margin:0 0 3px;text-transform:none}' +
      '.sheet-offer .lb-price-line{font-size:clamp(16pt,calc(var(--name) + 7pt),22pt);font-weight:700;letter-spacing:.04em}' +
      '.sheet-offer .lb-offer-sub{font-family:var(--sans);font-weight:600;font-size:clamp(10.5pt,calc(var(--desc) + 1pt),12pt);line-height:1.35;text-transform:none}' +
      '.sheet-blurb .lb-offer-sub{font-family:var(--sans);font-weight:500;font-size:clamp(var(--desc-min),var(--desc),var(--desc-max));line-height:1.35;text-transform:none}' +
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
      '.promo-head.pair-head-spacer .sec-title{visibility:hidden}' +
      '.promo-head.pair-head-inset{padding-top:18px}' +
      // Frilly titles live in the scallop; unframed pair-heads inset to that baseline.
      '.cols-pair-titles{align-items:stretch}' +
      '.cols-pair-titles > .col > .pair-head{flex:0 0 auto;margin:0 0 var(--sec-gap)}' +
      '.cols-pair-titles > .col > .pair-head .sec-title{margin:0;text-align:left;letter-spacing:.12em}' +
      '.cols-pair-titles .col-body > .scallop,.cols-pair-titles .col-body > .sec-plain,' +
        '.cols-pair-titles .col-body > .sec-stack{margin-top:0}' +
      '.cols-pair-titles .scallop-pad > .sec-title:first-child{text-align:left;margin-top:0}' +
      '.col-little .sec-title,.col-desserts .sec-title,.col-sides .sec-title{text-align:left;margin-top:0}' +
      '.sandwich-aligned{margin:0}' +
      '.cols-pair-titles .sandwich-aligned{margin:0}' +
      '.sandwich-aligned .scallop{margin-top:0}' +
      '.bottom-cols{margin-top:16px;margin-bottom:4px;align-items:stretch}' +
      '.bottom-cols.cols-balanced .col-sides,.bottom-cols.cols-balanced .col-promo{display:flex;flex-direction:column;min-height:0}' +
      '.bottom-cols.cols-balanced .col-body{flex:0 0 auto}' +
      '.bottom-cols .col-promo > .col-feature{margin-top:0;padding-top:0}' +
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
      '.sandwich-promo .desc{font-weight:300;color:#5a534a}' +
      '.note-line{font-size:10.5pt;font-weight:500;margin:4px 0}' +
      '.days{position:absolute;top:18mm;left:6mm;font-family:var(--serif);font-size:9px;font-weight:700;line-height:1.35;letter-spacing:.05em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:18px;text-align:center;line-height:1.15;margin:2px 0 8px}' +
      '.lc-price{font-family:var(--serif);text-align:center;font-size:12px;line-height:1.45}' +
      '.lb-foot{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:13px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:16px;margin:5px 0}' +
      /* Density ladder — capped to TYPE_RANGE (adult pub, not kids’-menu giant type).
         airy = max; dense = min. Dish gap never drops below --dish-gap-min (13px). */
      '.fill-airy{--dish-gap:18px;--sec-gap:18px;--name:11.5pt;--desc:10pt;--title:22pt;--promo:11.5pt}' +
      '.fill-roomy{--dish-gap:16px;--sec-gap:16px;--name:11.35pt;--desc:10pt;--title:20pt;--promo:11.35pt}' +
      '.fill-normal{--dish-gap:15px;--sec-gap:15px;--name:11.2pt;--desc:10pt;--title:18pt;--promo:11.2pt}' +
      '.fill-tight{--dish-gap:14px;--sec-gap:13px;--name:11.1pt;--desc:10pt;--title:17pt;--promo:11.1pt}' +
      '.fill-compact{--dish-gap:13px;--sec-gap:12px;--name:11.05pt;--desc:10pt;--title:16.5pt;--promo:11.05pt}' +
      '.fill-dense{--dish-gap:13px;--sec-gap:11px;--name:11pt;--desc:10pt;--title:16pt;--promo:11pt}' +
      '.fill-compact .scallop,.fill-dense .scallop{border-width:10px;border-image-width:10px;margin-bottom:5px}' +
      '.fill-dense .scallop{border-width:9px;border-image-width:9px}' +
      '.fill-dense .scallop-pad{padding:4px 10px 6px}' +
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
      '.a5-face.fill-airy{--dish-gap:16px;--sec-gap:15px;--name:11.5pt;--desc:10pt;--title:18pt;--promo:11.5pt}' +
      '.a5-face.fill-roomy{--dish-gap:14px;--sec-gap:13px;--name:11.35pt;--desc:10pt;--title:17pt;--promo:11.35pt}' +
      '.a5-face.fill-normal{--dish-gap:13px;--sec-gap:12px;--name:11.2pt;--desc:10pt;--title:16pt;--promo:11.2pt}' +
      '.a5-face.fill-tight{--dish-gap:13px;--sec-gap:11px;--name:11.1pt;--desc:10pt;--title:16pt;--promo:11.1pt}' +
      '.a5-face.fill-compact,.a5-face.fill-dense{--dish-gap:13px;--sec-gap:11px;--name:11pt;--desc:10pt;--title:16pt;--promo:11pt}' +
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
      '@media print{body{background:#fff;overflow:visible}.toolbar{display:none}' +
      '.preview-clip{overflow:visible}.sheet-stack{transform:none!important;margin-bottom:0!important}' +
      '.page,.sheet,.cut-sheet{margin:0;box-shadow:none;transform:none!important}' +
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
    if (kind === 'subhead') {
      return '<div class="party-blurb-subhead party-blurb-' + place + '">' + body + '</div>';
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
    // Preview shows the next Roman without burning it — Save to menus stamps it.
    var ver = peekPrintVersion(menu.id);
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
      // Honour a layout already planned + Gemini-adjusted. Re-planning here
      // used to throw away sidesOn / sandwichesOn / dropFootLogo.
      if (plan.layout && plan.layout.p1) {
        layout = plan.layout;
      } else if (plan.p1 && plan.pages) {
        layout = plan;
        plan.layout = layout;
      } else {
        layout = planFluidLayout(menu, dishes, {
          promos: plan.promos || [],
          sectionLayout: plan.sectionLayout,
          includes: plan.includes
        });
        plan.layout = layout;
      }
      plan.fit = layout.fit;
      plan.text = layout.summary;
      if (!plan.promos) plan.promos = layout.promos || [];
      if (!plan.sectionLayout && root.EBMenus && root.EBMenus.defaultSectionLayout) {
        plan.sectionLayout = root.EBMenus.defaultSectionLayout();
      }
      // Best-fit packing choices (column | full | split) for any category.
      if (layout.widthOverrides && typeof layout.widthOverrides === 'object') {
        plan.widthOverrides = Object.assign({}, plan.widthOverrides || {}, layout.widthOverrides);
        Object.keys(layout.widthOverrides).forEach(function (sec) {
          var w = String(layout.widthOverrides[sec] || '').toLowerCase();
          if (w !== 'column' && w !== 'full' && w !== 'split') return;
          var cur = (plan.sectionLayout && plan.sectionLayout[sec]) || {};
          if (root.EBMenus && root.EBMenus.isLockedColumnWidth &&
              root.EBMenus.isLockedColumnWidth(cur.width)) return;
          if (root.EBMenus && root.EBMenus.isLockedFullWidth &&
              root.EBMenus.isLockedFullWidth(cur.width)) return;
          plan.sectionLayout = plan.sectionLayout || {};
          plan.sectionLayout[sec] = Object.assign({}, cur, { width: w });
        });
      }
    }
    var body;
    if (landscape) {
      body = buildCard(menu, dishes, plan, ver);
    } else if (menu.kind === 'party') {
      body = buildParty(menu, dishes, plan, ver);
    } else {
      body = uniqueFeaturePanelsHtml(buildLong(menu, dishes, plan, ver));
    }

    var a4Stack = '<div class="sheet-stack mode-panel mode-a4">' + body + '</div>';
    var a5Stack = '';
    if (!landscape) {
      a5Stack = '<div class="sheet-stack mode-panel mode-a5">' + wrapGuillotine(body) + '</div>';
    }

    var dateHint = ver.hideDate ? ('print ' + ver.roman) : (ver.week + ' · print ' + ver.roman);
    var fillerHint = layout && layout.fillers && layout.fillers.length
      ? ' Auto: ' + layout.fillers.join(' · ') + '.'
      : (menu.kind === 'party' ? ' Standardised party layout.' : '');
    var src = String(plan.layoutSource || '');
    var decidedHint = '';
    if (src === 'gemini-layout' || src === 'gemini') {
      decidedHint = ' Layout: Gemini' + (plan.layoutReview ? ' — ' + plan.layoutReview : '.') ;
    } else if (src === 'local-column-fallback' || src === 'local') {
      decidedHint = ' Layout: JS guess — Gemini timed out.';
    } else if (layout && menu.kind === 'long') {
      decidedHint = ' Layout: JS starting guess.';
    }

    var html = (
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(printSheetLabel(menu.name, ver)) + '</title>' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">' +
      '<style>' + css({ landscape: landscape, guillotine: guillotine || defaultPaper === 'a5' }) + partyCss() +
      'body.paper-a5 .mode-a4{display:none}body.paper-a5 .mode-a5{display:block}' +
      'body.paper-a4 .mode-a5{display:none}body.paper-a4 .mode-a4{display:block}' +
      '</style></head><body class="' + bodyClass + '">' +
      '<div class="toolbar" id="previewToolbar">' +
        '<button type="button" id="saveToMenus">Save</button>' +
        '<button type="button" id="discardPreview">Discard</button>' +
        (landscape ? '<span class="hint">Card menu — two identical copies on landscape A4 for the guillotine.</span>' :
          '<label class="paper-opt"><input type="radio" name="paper" value="a4"' +
            (defaultPaper === 'a4' ? ' checked' : '') +
            ' onchange="document.body.className=\'paper-a4\'"> A4 (fill page)</label>' +
          '<label class="paper-opt"><input type="radio" name="paper" value="a5"' +
            (defaultPaper === 'a5' ? ' checked' : '') +
            ' onchange="document.body.className=\'paper-a5\'"> 2×A5 on A4 (guillotine)</label>') +
        '<span class="hint" id="printHint">' + esc(dateHint) +
        ' — preview only. Save to stamp this version into Print history, or Discard to edit the menu.' +
        esc(decidedHint) + '</span>' +
      '</div>' +
      '<div class="preview-clip">' + a4Stack + a5Stack + '</div>' +
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
          'var cols=page.querySelectorAll(".col");' +
          'for(var ci=0;ci<cols.length;ci++){' +
            'if(cols[ci].scrollHeight>cols[ci].clientHeight+2)return true;' +
          '}' +
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
              'var boxes=removableBoxes(tall).filter(function(b){return b.closest&&b.closest(".col-feature");});' +
              // Only prune a SURPLUS second panel. Never strip the last feature from
              // the tall side when the short side has none — that re-opens the hole
              // under Burgers / Sandwiches that planPromoFill just filled.
              'var shortBoxes=removableBoxes(short).filter(function(b){return b.closest&&b.closest(".col-feature");});' +
              'if(boxes.length<2&&!shortBoxes.length)break;' +
              'if(!boxes.length)break;' +
              'var last=boxes[boxes.length-1];' +
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
        // NEVER clip food off the page. Drop optional chrome first (foot promos,
        // logos). Column-balance feature panels are last — opposite columns must
        // stay as level as possible (golden rule).
        'function dropOverflowingChrome(page){' +
          'if(!overflows(page))return false;' +
          'var foot=page.querySelector(".foot-promos,.foot-promos-one");' +
          'if(foot&&foot.parentNode){foot.parentNode.removeChild(foot);return true;}' +
          'var logo=page.querySelector(".foot-logo");' +
          'if(logo&&logo.style.display!=="none"){logo.style.display="none";return true;}' +
          'var feats=page.querySelectorAll(".col-feature .scallop");' +
          'if(feats.length>1){var last=feats[feats.length-1];if(last.parentNode){last.parentNode.removeChild(last);return true;}}' +
          'if(feats.length===1){var one=feats[0];if(one.parentNode){one.parentNode.removeChild(one);return true;}}' +
          'return false;' +
        '}' +
        'function keepContentOnPage(group){' +
          'if(!group.length)return;' +
          'var n=0;' +
          'while(n++<12){' +
            'var dirty=false;' +
            'group.forEach(function(pg){if(dropOverflowingChrome(pg))dirty=true;});' +
            'if(!dirty)break;' +
            'fitGroup(group);' +
          '}' +
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
          'var dish=parseFloat(cs.getPropertyValue("--dish-gap"))||15;' +
          'var sec=parseFloat(cs.getPropertyValue("--sec-gap"))||16;' +
          'var dishMin=parseFloat(cs.getPropertyValue("--dish-gap-min"))||13;' +
          'var dishMax=parseFloat(cs.getPropertyValue("--dish-gap-max"))||18;' +
          'if(dish<dishMin)dish=dishMin;' +
          'var baseDish=dish,baseSec=sec;' +
          'for(var i=0;i<14;i++){' +
            'if(dish>=dishMax)break;' +
            'dish=Math.min(dishMax,dish+1.25);sec+=1.75;' +
            'page.style.setProperty("--dish-gap",dish+"px");' +
            'page.style.setProperty("--sec-gap",sec+"px");' +
            'if(overflows(page)){' +
              'dish-=1.25;sec-=1.75;' +
              'if(dish<dishMin)dish=dishMin;' +
              'if(dish<=baseDish+0.1){page.style.setProperty("--dish-gap",Math.max(dishMin,baseDish)+"px");page.style.removeProperty("--sec-gap");}' +
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
          'keepContentOnPage(a4);' +
          'keepContentOnPage(a5);' +
          '[].slice.call(document.querySelectorAll(".card-face.fill-page")).forEach(function(page){' +
            'clearFitArtifacts(page);' +
            'for(var j=0;j<STEPS.length;j++){strip(page);page.classList.add("fill-page");page.classList.add(STEPS[j]);' +
            'if(!overflows(page))break;}' +
            'while(dropOverflowingChrome(page)){}' +
          '});' +
          'balanceOppositeColumns();' +
          'keepContentOnPage(a4);' +
          'keepContentOnPage(a5);' +
          'a4.forEach(spreadPage);' +
          'a5.forEach(spreadPage);' +
          'keepContentOnPage(a4);' +
          'keepContentOnPage(a5);' +
          'fitPreviewToScreen();' +
        '}' +
        'function fitPreviewToScreen(){' +
          'var stacks=document.querySelectorAll(".sheet-stack");' +
          '[].forEach.call(stacks,function(el){el.style.transform="";el.style.marginBottom="";});' +
          'if(document.body.classList.contains("is-printing"))return;' +
          'if(window.matchMedia&&window.matchMedia("print").matches)return;' +
          'var vw=Math.max(280,(document.documentElement.clientWidth||window.innerWidth||800)-8);' +
          '[].forEach.call(stacks,function(stack){' +
            'var cs=window.getComputedStyle(stack);' +
            'if(cs.display==="none"||!stack.offsetWidth)return;' +
            'var page=stack.querySelector(".page,.sheet,.cut-sheet")||stack;' +
            'var w=page.offsetWidth;if(!w)return;' +
            'var s=Math.min(1,vw/w);if(s>=0.995)return;' +
            'stack.style.transformOrigin="top left";' +
            'stack.style.transform="scale("+s+")";' +
            'stack.style.marginBottom=((s-1)*stack.scrollHeight)+"px";' +
          '});' +
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
        'window.addEventListener("beforeprint",function(){document.body.classList.add("is-printing");fitPages();});' +
        'window.addEventListener("afterprint",function(){document.body.classList.remove("is-printing");fitPages();});' +
        'window.addEventListener("resize",fitPreviewToScreen);' +
        'var SAVE_META=' + JSON.stringify({
          menuId: menu.id,
          menuName: menu.name,
          week: ver.week,
          weekKey: ver.weekKey,
          hideDate: !!ver.hideDate,
          landscape: !!landscape
        }) + ';' +
        // History / reopen sheets get a Print toolbar (preview itself is Save or Discard only).
        'function bindPrintButton(){' +
          'var pb=document.getElementById("printSheet");' +
          'if(!pb)return;' +
          'pb.onclick=function(ev){ev.preventDefault();' +
            'function go(){fitPages();setTimeout(function(){window.print();},80);}' +
            'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go);}else go();' +
          '};' +
        '}' +
        'function paperOptsHtml(){' +
          'if(SAVE_META.landscape)return \'<span class="hint">Card menu — landscape A4 guillotine.</span>\';' +
          'var a5=document.body.classList.contains("paper-a5");' +
          'var a4c=a5?"":" checked";' +
          'var a5c=a5?" checked":"";' +
          'return \'<label class="paper-opt"><input type="radio" name="paper" value="a4"\'+a4c+' +
            '\' onchange="document.body.className=\\\'paper-a4\\\'"> A4 (fill page)</label>\'+' +
          '\'<label class="paper-opt"><input type="radio" name="paper" value="a5"\'+a5c+' +
            '\' onchange="document.body.className=\\\'paper-a5\\\'"> 2×A5 on A4 (guillotine)</label>\';' +
        '}' +
        'function escHint(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}' +
        'function switchToPrintToolbar(hintText){' +
          'var tb=document.getElementById("previewToolbar")||document.querySelector(".toolbar");' +
          'if(!tb)return;' +
          'tb.innerHTML=\'<button type="button" id="printSheet">Print / save as PDF</button>\'+' +
            'paperOptsHtml()+\'<span class="hint" id="printHint">\'+escHint(hintText)+\'</span>\';' +
          'document.querySelectorAll("[name=paper]").forEach(function(r){r.addEventListener("change",sync);});' +
          'bindPrintButton();' +
        '}' +
        // Drop nested loader/sheet copies before stamping history (max 2 A4 pages).
        'function sanitizeDomForSave(){' +
          'document.body.classList.remove("is-printing");' +
          'if(!document.body.classList.contains("paper-a4")&&!document.body.classList.contains("paper-a5")){' +
            'document.body.className=(document.body.className+" paper-a4").replace(/^\\s+/,"");' +
          '}' +
          '[].forEach.call(document.querySelectorAll(".sheet-stack"),function(el){' +
            'el.style.transform="";el.style.marginBottom="";el.style.transformOrigin="";' +
          '});' +
          'function keepFirst(sel){' +
            'var nodes=document.querySelectorAll(sel);' +
            'for(var i=1;i<nodes.length;i++){if(nodes[i].parentNode)nodes[i].parentNode.removeChild(nodes[i]);}' +
            'return nodes[0]||null;' +
          '}' +
          'keepFirst(".toolbar");' +
          'keepFirst(".preview-clip");' +
          'keepFirst(".sheet-stack.mode-a4");' +
          'keepFirst(".sheet-stack.mode-a5");' +
          'var a4=document.querySelector(".sheet-stack.mode-a4");' +
          'if(a4){' +
            'var pages=[].filter.call(a4.children,function(ch){return ch.classList&&ch.classList.contains("page");});' +
            'pages.slice(2).forEach(function(pg){if(pg.parentNode)pg.parentNode.removeChild(pg);});' +
          '}' +
          'var a5=document.querySelector(".sheet-stack.mode-a5");' +
          'if(a5){' +
            'var cuts=[].filter.call(a5.children,function(ch){return ch.classList&&ch.classList.contains("cut-sheet");});' +
            'cuts.slice(2).forEach(function(pg){if(pg.parentNode)pg.parentNode.removeChild(pg);});' +
          '}' +
          '[].forEach.call(document.querySelectorAll("script"),function(sc){' +
            'var t=String(sc.textContent||"");' +
            'if(/SAVE_META/.test(t))return;' +
            'if(/EB_PRINT_PREVIEW|print-preview\\.html|document\\.write\\s*\\(\\s*payload|document\\.write\\s*\\(\\s*html/.test(t)){' +
              'if(sc.parentNode)sc.parentNode.removeChild(sc);' +
            '}' +
          '});' +
        '}' +
        'var db=document.getElementById("discardPreview");' +
        'if(db){db.onclick=function(){window.close();};}' +
        // Stamp Roman, save into Print history, return parent to history, close preview.
        'var sb=document.getElementById("saveToMenus");' +
        'if(sb){sb.onclick=function(){' +
          'if(!window.opener||!window.opener.EBMenuPrint||!window.opener.EBMenuPrint.commitPrintVersion){' +
            'alert("Keep the Menus tab open, then click Save again.");return;}' +
          'var api=window.opener.EBMenuPrint;' +
          'sb.disabled=true;sb.textContent="Saving…";' +
          'var disc=document.getElementById("discardPreview");if(disc)disc.disabled=true;' +
          // Always stamp THIS preview’s menu (SAVE_META), never opener.lastBuildMeta.
          'var ver=api.commitPrintVersion(SAVE_META.menuId);' +
          'if(SAVE_META.hideDate)ver.hideDate=true;' +
          '[].forEach.call(document.querySelectorAll(".tracker .roman"),function(el){el.textContent=ver.roman;});' +
          'var hintText=(SAVE_META.hideDate?("print "+ver.roman):(ver.week+" · print "+ver.roman))+' +
            '" — from Print history: print PDF or email.";' +
          'try{document.title=api.printSheetLabel?api.printSheetLabel(SAVE_META.menuName,ver):document.title;}catch(e1){}' +
          'fitPages();' +
          'switchToPrintToolbar(hintText);' +
          'fitPages();' +
          'sanitizeDomForSave();' +
          'var html="<!DOCTYPE html>"+document.documentElement.outerHTML;' +
          'if(api.sanitizePrintHtml){try{html=api.sanitizePrintHtml(html)||html;}catch(eSan){}}' +
          // Stamp once at Save click — retries must reuse this id + generatedAt.
          'var saveAt=Date.now();' +
          'var saveId="p"+saveAt.toString(36);' +
          'api.savePrintHistory({' +
            'id:saveId,generatedAt:saveAt,createdAt:saveAt,' +
            'menuId:SAVE_META.menuId,menuName:SAVE_META.menuName,' +
            'roman:ver.roman,n:ver.n,week:ver.week||SAVE_META.week,weekKey:ver.weekKey||SAVE_META.weekKey,' +
            'hideDate:!!ver.hideDate,html:html' +
          '}).then(function(saved){' +
            'try{if(typeof window.opener.EBMenusOnPrintSaved==="function"){' +
              'window.opener.EBMenusOnPrintSaved(saved||{menuId:SAVE_META.menuId,roman:ver.roman});' +
            '}}catch(e2){}' +
            'window.close();' +
          '}).catch(function(){sb.disabled=false;sb.textContent="Save";' +
            'if(disc)disc.disabled=false;' +
            'alert("Could not save this sheet. Try again.");});' +
        '};}' +
        // Reopened history sheets already have Print — bind it.
        'bindPrintButton();' +
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
    'https://script.google.com/macros/s/AKfycbwy69TqrTaCB4UnMcDTEqCzTil6qoOZmV1Fq8jD-4HCpTIdBQi5-dsXnYn8ikhBhT3hdw/exec';
  /** Default To: address when Emailing a saved sheet from Print history. */
  var HISTORY_EMAIL_DEFAULT = 'pub@eightbellsbolney.com';

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
    if (!entry) return Promise.resolve(null);
    // Freeze original Save time when re-writing the same id (retry / migrate).
    function withFrozen_(prior) {
      var next = prior ? preserveHistoryGeneratedAt(prior, entry) : Object.assign({}, entry);
      if (!next.createdAt) next.createdAt = next.generatedAt;
      return next;
    }
    function putFrozen_(frozen) {
      if (!idbAvailable()) {
        lsSavePrint(frozen);
        return Promise.resolve(frozen);
      }
      return openHistoryDb().then(function (db) {
        return new Promise(function (resolve) {
          var tx = db.transaction(HISTORY_STORE, 'readwrite');
          var store = tx.objectStore(HISTORY_STORE);
          store.put(frozen);
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
            tx2.oncomplete = function () { resolve(frozen); };
            tx2.onerror = function () { resolve(frozen); };
          };
          tx.onerror = function () {
            try { lsSavePrint(frozen); } catch (e) {}
            resolve(frozen);
          };
        });
      }).catch(function () {
        lsSavePrint(frozen);
        return frozen;
      });
    }
    if (!idbAvailable()) {
      return putFrozen_(withFrozen_(lsGetPrint(entry.id)));
    }
    return openHistoryDb().then(function (db) {
      return new Promise(function (resolve) {
        var tx0 = db.transaction(HISTORY_STORE, 'readonly');
        var getReq = tx0.objectStore(HISTORY_STORE).get(entry.id);
        getReq.onsuccess = function () {
          putFrozen_(withFrozen_(getReq.result || lsGetPrint(entry.id))).then(resolve, function () {
            resolve(withFrozen_(lsGetPrint(entry.id)));
          });
        };
        getReq.onerror = function () {
          putFrozen_(withFrozen_(lsGetPrint(entry.id))).then(resolve, function () {
            resolve(withFrozen_(lsGetPrint(entry.id)));
          });
        };
      });
    }).catch(function () {
      var frozen = withFrozen_(lsGetPrint(entry.id));
      lsSavePrint(frozen);
      return frozen;
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

  /** Drop local copies of sheets that were deleted on another device. */
  function purgeLocalDeleted(deletedIds) {
    var gone = deletedIds || {};
    return localListOnly().then(function (rows) {
      var drop = (rows || []).filter(function (r) { return r && r.id && gone[r.id]; });
      if (!drop.length) return Promise.resolve();
      var chain = Promise.resolve();
      drop.forEach(function (meta) {
        chain = chain.then(function () { return localDeleteOnly(meta.id); });
      });
      return chain;
    });
  }

  function uploadHistoryEntry_(full) {
    if (!full || !full.html || !full.id) return Promise.resolve(false);
    // Always send the frozen original Save time — never stamp Date.now() here.
    var payload = Object.assign({}, full, {
      generatedAt: full.generatedAt,
      createdAt: full.createdAt || full.generatedAt
    });
    // Retry — no-cors writes can race Drive visibility on first verify.
    function attempt_(n) {
      return historyCloudPost({
        action: 'savePrintHistory',
        entry: payload
      }).then(function () { return true; }).catch(function () {
        if (n >= 5) return false;
        return new Promise(function (resolve) {
          setTimeout(function () { resolve(attempt_(n + 1)); }, 700 * n);
        });
      });
    }
    return attempt_(1);
  }

  var pendingUploadTimer_ = null;
  var pendingUploadBusy_ = false;

  /**
   * Upload phone-only sheets using a fresh cloud index. Does not re-enter
   * listPrintHistory (that used to block paint past the 12s hangWatch).
   */
  function flushPendingPrintUploads_() {
    if (pendingUploadBusy_) return Promise.resolve({ uploaded: 0, attempted: 0 });
    pendingUploadBusy_ = true;
    return historyCloudPost({ action: 'listPrintHistory' }).then(function (data) {
      var known = {};
      var deleted = {};
      var items = Array.isArray(data.items) ? data.items : [];
      items.forEach(function (r) {
        if (r && r.id) known[r.id] = true;
      });
      (Array.isArray(data.deletedIds) ? data.deletedIds : []).forEach(function (id) {
        if (id) deleted[String(id)] = true;
      });
      return purgeLocalDeleted(deleted).then(function () {
        return migrateLocalToCloud(known, deleted, items);
      });
    }).then(function (stats) {
      pendingUploadBusy_ = false;
      return stats || { uploaded: 0, attempted: 0 };
    }, function (err) {
      pendingUploadBusy_ = false;
      throw err;
    });
  }

  /** Keep retrying phone-only sheets until they land in the shared cloud. */
  function schedulePendingPrintUploads() {
    if (pendingUploadTimer_ || pendingUploadBusy_) return;
    pendingUploadTimer_ = setTimeout(function () {
      pendingUploadTimer_ = null;
      flushPendingPrintUploads_().then(function (stats) {
        // Still have leftovers — try again later.
        if (stats && stats.attempted > stats.uploaded) schedulePendingPrintUploads();
      }).catch(function () {
        schedulePendingPrintUploads();
      });
    }, 2500);
  }

  /**
   * Upload device-only sheets that were never deleted in the cloud
   * (e.g. Kate saved on the pub PC while the network blipped).
   * Skip tombstoned ids so deletes stay deleted everywhere.
   * Also re-push rows whose local generatedAt is older than cloud (stamp repair).
   */
  function migrateLocalToCloud(cloudIds, deletedIds, cloudItems) {
    var known = cloudIds || {};
    var gone = deletedIds || {};
    var cloudById = {};
    (cloudItems || []).forEach(function (r) {
      if (r && r.id) cloudById[r.id] = r;
    });
    return localListOnly().then(function (rows) {
      var missing = (rows || []).filter(function (r) {
        return r && r.id && !known[r.id] && !gone[r.id];
      });
      // Same id on cloud with a newer (polluted) stamp — push the older local time.
      var stampRepair = (rows || []).filter(function (r) {
        if (!r || !r.id || gone[r.id] || !known[r.id]) return false;
        var cloud = cloudById[r.id];
        if (!cloud) return false;
        var localTs = Number(r.generatedAt || r.createdAt || 0) || 0;
        var cloudTs = Number(cloud.generatedAt || cloud.createdAt || 0) || 0;
        return localTs > 0 && cloudTs > 0 && localTs < cloudTs;
      });
      var queue = missing.concat(stampRepair);
      if (!queue.length) return { uploaded: 0, attempted: 0, stampRepaired: 0 };
      // Newest first so the sheet just made uploads before older ones.
      queue.sort(function (a, b) {
        return (b.generatedAt || 0) - (a.generatedAt || 0);
      });
      var attempted = 0;
      var uploaded = 0;
      var stampRepaired = 0;
      var seen = {};
      var chain = Promise.resolve();
      queue.slice(0, 40).forEach(function (meta) {
        if (!meta || !meta.id || seen[meta.id]) return;
        seen[meta.id] = true;
        var isRepair = !!cloudById[meta.id];
        chain = chain.then(function () {
          return localGetOnly(meta.id).then(function (full) {
            if (!full || !full.html) return;
            // Freeze the older local Save time on the payload.
            var frozen = preserveHistoryGeneratedAt(meta, full);
            frozen.html = embedHistoryStamp_(frozen.html, frozen.generatedAt);
            attempted += 1;
            return uploadHistoryEntry_(frozen).then(function (ok) {
              if (ok) {
                uploaded += 1;
                if (isRepair) stampRepaired += 1;
              }
            });
          });
        });
      });
      return chain.then(function () {
        return { uploaded: uploaded, attempted: attempted, stampRepaired: stampRepaired };
      });
    }).catch(function () {
      return { uploaded: 0, attempted: 0, stampRepaired: 0 };
    });
  }

  /**
   * Cloud index can list a sheet whose Drive HTML never landed (phone then
   * sees “missing from history”). Re-upload from this device when we still
   * have the HTML locally.
   */
  function repairCloudHtmlGaps(cloudItems) {
    var repaired = 0;
    var checked = 0;
    var chain = Promise.resolve();
    // Tiny hasPrintHistory check — never fetch full HTML just to see if it exists.
    (cloudItems || []).slice(0, 8).forEach(function (meta) {
      if (!meta || !meta.id) return;
      chain = chain.then(function () {
        checked += 1;
        return historyCloudPost({
          action: 'hasPrintHistory',
          id: meta.id
        }).then(function (data) {
          if (data && data.exists) return;
          return localGetOnly(meta.id).then(function (full) {
            if (!full || !full.html) return;
            return uploadHistoryEntry_(full).then(function (ok) {
              if (ok) repaired += 1;
            });
          });
        }).catch(function () {
          return localGetOnly(meta.id).then(function (full) {
            if (!full || !full.html) return;
            return uploadHistoryEntry_(full).then(function (ok) {
              if (ok) repaired += 1;
            });
          });
        });
      });
    });
    return chain.then(function () {
      return { repaired: repaired, checked: checked };
    });
  }

  /** Ask the cloud to drop index rows with no fetchable HTML. */
  function pruneOrphanCloudIndex() {
    return historyCloudPost({ action: 'pruneOrphanPrintHistory' }).then(function (data) {
      return {
        dropped: (data && data.dropped) || 0,
        items: Array.isArray(data && data.items) ? data.items : []
      };
    }).catch(function () {
      // Older Apps Script deploy — listPrintHistory now prunes itself.
      return historyCloudPost({ action: 'listPrintHistory' }).then(function (data) {
        return {
          dropped: (data && data.orphansDropped) || 0,
          items: Array.isArray(data && data.items) ? data.items : []
        };
      }).catch(function () {
        return { dropped: 0, items: [] };
      });
    });
  }

  /**
   * Everyday pull: cloud index is source of truth. Paint that list immediately;
   * phone-only leftovers upload in the background (never block past hangWatch).
   * No per-row HTML repair here (that hung iOS — Sync now still repairs).
   */
  function pullPrintHistoryFromCloud() {
    return listPrintHistory().then(function (rows) {
      var pending = (rows || []).filter(function (r) { return r && r.source === 'local'; }).length;
      if (pending > 0) schedulePendingPrintUploads();
      return {
        rows: rows,
        uploaded: 0,
        repaired: 0,
        orphansDropped: 0,
        cloudUnreachable: !!(rows && rows.cloudUnreachable)
      };
    });
  }

  /**
   * Sync now: repair gaps → upload local → prune orphans → pull shared list.
   * Bounded so Print history never sticks on “Updating shared list…”.
   */
  function syncPrintHistoryToCloud() {
    var finished = false;
    var work = historyCloudPost({ action: 'listPrintHistory' }).then(function (data) {
      var known = {};
      var deleted = {};
      var items = Array.isArray(data.items) ? data.items : [];
      items.forEach(function (r) {
        if (r && r.id) known[r.id] = true;
      });
      (Array.isArray(data.deletedIds) ? data.deletedIds : []).forEach(function (id) {
        if (id) deleted[String(id)] = true;
      });
      return purgeLocalDeleted(deleted).then(function () {
        // Cap repair — full HTML GETs through the iOS relay are expensive.
        return repairCloudHtmlGaps((items || []).slice(0, 8));
      }).then(function (repair) {
        return migrateLocalToCloud(known, deleted, items).then(function (stats) {
          return {
            uploaded: ((stats && stats.uploaded) || 0) + ((repair && repair.repaired) || 0),
            repaired: (repair && repair.repaired) || 0,
            stampRepaired: (stats && stats.stampRepaired) || 0
          };
        });
      });
    }).then(function (stats) {
      return pruneOrphanCloudIndex().then(function (prune) {
        return listPrintHistory().then(function (rows) {
          finished = true;
          return {
            rows: rows,
            uploaded: (stats && stats.uploaded) || 0,
            repaired: (stats && stats.repaired) || 0,
            orphansDropped: (prune && prune.dropped) || 0
          };
        });
      });
    }).catch(function () {
      return localListOnly().then(function (rows) {
        finished = true;
        var out = (rows || []).map(function (r) {
          return Object.assign({}, r, { source: 'local', cloudUnreachable: true });
        });
        out.cloudOk = false;
        out.cloudUnreachable = true;
        return { rows: out, uploaded: 0, repaired: 0, orphansDropped: 0, cloudUnreachable: true };
      });
    });
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        if (finished) return;
        pullPrintHistoryFromCloud().then(resolve, function () {
          resolve({ rows: [], uploaded: 0, repaired: 0, orphansDropped: 0, cloudUnreachable: true });
        });
      }, 14000);
      work.then(function (res) {
        clearTimeout(timer);
        resolve(res);
      }, function () {
        clearTimeout(timer);
        pullPrintHistoryFromCloud().then(resolve, function () {
          resolve({ rows: [], uploaded: 0, repaired: 0, orphansDropped: 0, cloudUnreachable: true });
        });
      });
    });
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

  /** Venue-local calendar day (Eight Bells = Europe/London). */
  function venueDayKeyFromMs(ms) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date(ms || Date.now()));
      var y = '', mo = '', da = '';
      parts.forEach(function (p) {
        if (p.type === 'year') y = p.value;
        if (p.type === 'month') mo = p.value;
        if (p.type === 'day') da = p.value;
      });
      if (y && mo && da) return y + '-' + mo + '-' + da;
    } catch (e) {}
    return dayKeyFromMs(ms);
  }

  function venueTodayAndYesterdayKeys(nowMs) {
    var today = venueDayKeyFromMs(nowMs || Date.now());
    var bits = today.split('-').map(function (n) { return parseInt(n, 10); });
    var utcNoon = Date.UTC(bits[0], bits[1] - 1, bits[2], 12, 0, 0);
    return {
      today: today,
      yesterday: venueDayKeyFromMs(utcNoon - 24 * 60 * 60 * 1000)
    };
  }

  function isRecentHistoryRow(row, nowMs) {
    if (!row) return false;
    var keys = venueTodayAndYesterdayKeys(nowMs);
    var fromMs = venueDayKeyFromMs(row.generatedAt || 0);
    var stored = String(row.dayKey || '');
    return fromMs === keys.today || fromMs === keys.yesterday ||
      stored === keys.today || stored === keys.yesterday;
  }

  function splitHistoryWindow(list, nowMs) {
    var recent = [];
    var archive = [];
    (list || []).forEach(function (row) {
      if (isRecentHistoryRow(row, nowMs)) recent.push(row);
      else archive.push(row);
    });
    return { recent: recent, archive: archive };
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

  /**
   * Print history timestamp = moment of original Save only.
   * Retries, re-uploads, Soft refresh, list pull, and migrate must never
   * advance generatedAt/createdAt to "now". Prefer the older stamp (min).
   * Brand-new id (no existing) keeps the incoming stamp.
   */
  function preserveHistoryGeneratedAt(existing, incoming) {
    var out = incoming ? Object.assign({}, incoming) : {};
    var oldTs = Number((existing && (existing.generatedAt || existing.createdAt)) || 0) || 0;
    var newTs = Number(out.generatedAt || out.createdAt || 0) || 0;
    var oldCreated = Number((existing && (existing.createdAt || existing.generatedAt)) || 0) || 0;
    var newCreated = Number(out.createdAt || out.generatedAt || 0) || 0;
    if (oldTs && newTs) {
      out.generatedAt = Math.min(oldTs, newTs);
    } else {
      out.generatedAt = oldTs || newTs || Date.now();
    }
    if (oldCreated && newCreated) {
      out.createdAt = Math.min(oldCreated, newCreated);
    } else {
      out.createdAt = oldCreated || newCreated || out.generatedAt;
    }
    if (existing && existing.dayKey && Number(out.generatedAt) === oldTs) {
      out.dayKey = existing.dayKey;
    }
    return out;
  }

  /** Bake original Save ms into HTML so HISTIDX rebuild never needs Date.now(). */
  function embedHistoryStamp_(html, generatedAt) {
    var ms = Number(generatedAt || 0) || 0;
    var src = String(html || '');
    if (!ms || !src) return src;
    var meta = '<meta name="eb-generated-at" content="' + ms + '">';
    if (/name=["']eb-generated-at["']/i.test(src)) {
      return src.replace(
        /<meta\s+[^>]*name=["']eb-generated-at["'][^>]*>/i,
        meta
      );
    }
    if (/<\/head>/i.test(src)) {
      return src.replace(/<\/head>/i, meta + '</head>');
    }
    return meta + src;
  }

  /** Newest first; id tie-break so a single refresh never reshuffles equals. */
  function sortHistoryNewest(list) {
    return (list || []).slice().sort(function (a, b) {
      var dg = (b.generatedAt || 0) - (a.generatedAt || 0);
      if (dg) return dg;
      return String(a.id || '').localeCompare(String(b.id || ''));
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
    var prior = null;
    try {
      lsLoadIndex().forEach(function (r) { if (r && r.id === entry.id) prior = r; });
    } catch (ePrior) {}
    var frozen = prior ? preserveHistoryGeneratedAt(prior, entry) : entry;
    var meta = {
      id: frozen.id,
      menuId: frozen.menuId,
      menuName: frozen.menuName,
      roman: frozen.roman,
      n: frozen.n,
      week: frozen.week,
      weekKey: frozen.weekKey,
      hideDate: !!frozen.hideDate,
      generatedAt: frozen.generatedAt,
      createdAt: frozen.createdAt || frozen.generatedAt,
      dayKey: frozen.dayKey || venueDayKeyFromMs(frozen.generatedAt)
    };
    entry = frozen;
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
    // First Save stamps now; retries must pass the original generatedAt through.
    var generatedAt = Number(raw.generatedAt || raw.createdAt || 0) || Date.now();
    var createdAt = Number(raw.createdAt || raw.generatedAt || 0) || generatedAt;
    var html = embedHistoryStamp_(String(raw.html), generatedAt);
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
      createdAt: createdAt,
      dayKey: raw.dayKey || venueDayKeyFromMs(generatedAt),
      html: html
    };
  }

  /**
   * Persist a generated sheet in shared cloud history (Drive via Menu AI Apps Script)
   * and cache a copy on this device for offline reopen.
   * Cloud write is required for manager/owner phones — retry until HTML is readable.
   * generatedAt is set only on first Save into history — never on retry/re-upload.
   */
  function savePrintHistory(raw) {
    var incoming = raw || lastBuildMeta;
    if (incoming && incoming.html) {
      incoming = Object.assign({}, incoming, {
        html: sanitizePrintHtml(incoming.html) || incoming.html
      });
    }
    var entry = normalizeHistoryEntry(incoming);
    if (!entry) return Promise.resolve(null);
    // Local cache first (instant reopen), then shared cloud. UI only treats the
    // row as shared after hasPrintHistory confirms HTML is fetchable.
    // localSaveOnly freezes generatedAt if this id was already Saved.
    return localSaveOnly(entry).then(function (saved) {
      hydratePrintVersionsFromHistory((versionHistoryCache || []).concat([saved]));
      return uploadHistoryEntry_(saved).then(function (ok) {
        if (ok) {
          saved.cloudSynced = true;
          saved.source = 'cloud';
          return saved;
        }
        // Still local — background retry; never pretend it is on the shared list.
        saved.cloudSynced = false;
        saved.source = 'local';
        schedulePendingPrintUploads();
        return saved;
      });
    });
  }

  function listPrintHistory() {
    function asRow(r, source) {
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
        createdAt: r.createdAt || r.generatedAt,
        dayKey: r.dayKey,
        source: source
      };
    }
    /**
     * Shared list = cloud index (GET listPrintHistory).
     * Must return as soon as that GET succeeds — awaiting migrateLocalToCloud
     * (up to 40 uploads × verify) blew past the Print history 12s hangWatch and
     * showed “Could not reach the shared cloud list” even when Apps Script was up.
     * Phone-only leftovers upload in the background via schedulePendingPrintUploads.
     */
    return historyCloudPost({ action: 'listPrintHistory' }).then(function (data) {
      var cloudItems = Array.isArray(data.items) ? data.items : [];
      var known = {};
      var deleted = {};
      cloudItems.forEach(function (r) { if (r && r.id) known[r.id] = true; });
      (Array.isArray(data.deletedIds) ? data.deletedIds : []).forEach(function (id) {
        if (id) deleted[String(id)] = true;
      });
      // Background only — never block shared-list paint on uploads.
      var pendingLocal = false;
      return purgeLocalDeleted(deleted).then(function () {
        return localListOnly();
      }).then(function (localItems) {
        var byId = {};
        var needsStampRepair = false;
        // Cloud first — this is the shared owner/manager list.
        (cloudItems || []).forEach(function (r) {
          if (r && r.id) byId[r.id] = asRow(r, 'cloud');
        });
        // Local-only leftovers — mark pending, never as cloud; upload async.
        // Same id on both: keep the older generatedAt (original Save), still cloud.
        // If local is older than cloud, push that stamp back (repair polluted 14:19).
        (localItems || []).forEach(function (r) {
          if (!r || !r.id || deleted[r.id]) return;
          if (byId[r.id]) {
            var cloudRow = byId[r.id];
            var merged = preserveHistoryGeneratedAt(r, cloudRow);
            if (Number(merged.generatedAt || 0) < Number(cloudRow.generatedAt || 0)) {
              needsStampRepair = true;
            }
            byId[r.id] = asRow(merged, 'cloud');
            return;
          }
          pendingLocal = true;
          byId[r.id] = asRow(r, 'local');
        });
        if (pendingLocal || needsStampRepair) schedulePendingPrintUploads();
        var rows = sortHistoryNewest(Object.keys(byId).map(function (k) { return byId[k]; }));
        rows.cloudOk = true;
        hydratePrintVersionsFromHistory(rows);
        return rows;
      });
    }).catch(function () {
      // Do not pretend phone drafts are the shared cloud list.
      return localListOnly().then(function (rows) {
        var out = (rows || []).map(function (r) {
          var row = asRow(r, 'local');
          row.cloudUnreachable = true;
          return row;
        });
        out.cloudOk = false;
        out.cloudUnreachable = true;
        hydratePrintVersionsFromHistory(out);
        return out;
      });
    });
  }

  function fetchCloudPrintHistory_(id, attempt) {
    attempt = attempt || 1;
    return historyCloudPost({
      action: 'getPrintHistory',
      id: id
    }).then(function (data) {
      var entry = data.entry || null;
      if (entry && entry.html) {
        localSaveOnly(normalizeHistoryEntry(entry)).catch(function () {});
        return entry;
      }
      if (attempt < 3) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            fetchCloudPrintHistory_(id, attempt + 1).then(resolve, reject);
          }, 500 * attempt);
        });
      }
      var err = new Error('cloud_html_missing');
      err.code = 'cloud_html_missing';
      throw err;
    }).catch(function (err) {
      if (err && err.code === 'cloud_html_missing') throw err;
      if (attempt < 3) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            fetchCloudPrintHistory_(id, attempt + 1).then(resolve, reject);
          }, 500 * attempt);
        });
      }
      var miss = new Error('cloud_html_missing');
      miss.code = 'cloud_html_missing';
      throw miss;
    });
  }

  function getPrintHistory(id) {
    if (!id) return Promise.resolve(null);
    // Local first (instant open), then cloud with retries.
    return localGetOnly(id).then(function (local) {
      if (local && local.html) {
        // Opportunistically ensure cloud has the same HTML for other devices.
        uploadHistoryEntry_(local).catch(function () {});
        return local;
      }
      return fetchCloudPrintHistory_(id).catch(function (err) {
        // Last chance: if this device somehow has a partial local row, fail cleanly.
        // Orphan index rows are pruned server-side on get/list/Sync.
        throw err;
      });
    });
  }

  function deletePrintHistory(id) {
    if (!id) return Promise.resolve();
    return localDeleteOnly(id).then(function () {
      function attempt_(n) {
        return historyCloudPost({
          action: 'deletePrintHistory',
          id: id
        }).catch(function () {
          if (n >= 3) return;
          return new Promise(function (resolve) {
            setTimeout(function () { resolve(attempt_(n + 1)); }, 400 * n);
          });
        });
      }
      return attempt_(1);
    });
  }

  /**
   * Collapse nested print-preview copies (loader document.write append bug) and
   * cap long menus at two A4 pages / two guillotine sheets.
   */
  function sanitizePrintHtmlText_(html) {
    var out = String(html || '');
    if (!out) return out;
    // Strip nested print-preview loader scripts (keep SAVE_META / fitPages).
    out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, function (block) {
      if (/SAVE_META/.test(block)) return block;
      if (/EB_PRINT_PREVIEW|print-preview\.html|document\.write\s*\(\s*payload|document\.write\s*\(\s*html/.test(block)) {
        return '';
      }
      return block;
    });
    function keepFirstBlock(source, openRe) {
      var re = new RegExp(openRe, 'gi');
      var match;
      var first = null;
      var ranges = [];
      while ((match = re.exec(source))) {
        var start = match.index;
        var tagEnd = source.indexOf('>', start);
        if (tagEnd < 0) break;
        var depth = 1;
        var i = tagEnd + 1;
        var openTag = /^<([a-z0-9]+)/i.exec(match[0]);
        var name = openTag ? openTag[1].toLowerCase() : 'div';
        var finder = new RegExp('<\\/?' + name + '\\b[^>]*>', 'gi');
        finder.lastIndex = i;
        var m2;
        var end = -1;
        while ((m2 = finder.exec(source))) {
          if (/^<\//.test(m2[0])) depth -= 1;
          else depth += 1;
          if (depth === 0) {
            end = m2.index + m2[0].length;
            break;
          }
        }
        if (end < 0) break;
        ranges.push({ start: start, end: end });
        if (!first) first = source.slice(start, end);
        re.lastIndex = end;
      }
      if (ranges.length <= 1) return source;
      var rebuilt = source.slice(0, ranges[0].start) + first;
      rebuilt += source.slice(ranges[ranges.length - 1].end);
      // Actually need to remove all but first — rebuild carefully
      rebuilt = '';
      var cursor = 0;
      ranges.forEach(function (r, idx) {
        rebuilt += source.slice(cursor, r.start);
        if (idx === 0) rebuilt += first;
        cursor = r.end;
      });
      rebuilt += source.slice(cursor);
      return rebuilt;
    }
    out = keepFirstBlock(out, '<div\\b[^>]*\\btoolbar\\b[^>]*>');
    out = keepFirstBlock(out, '<div\\b[^>]*\\bpreview-clip\\b[^>]*>');
    out = keepFirstBlock(out, '<div\\b[^>]*\\bsheet-stack\\b[^>]*\\bmode-a4\\b[^>]*>');
    out = keepFirstBlock(out, '<div\\b[^>]*\\bmode-a4\\b[^>]*\\bsheet-stack\\b[^>]*>');
    out = keepFirstBlock(out, '<div\\b[^>]*\\bsheet-stack\\b[^>]*\\bmode-a5\\b[^>]*>');
    out = keepFirstBlock(out, '<div\\b[^>]*\\bmode-a5\\b[^>]*\\bsheet-stack\\b[^>]*>');
    // Cap pages inside the surviving A4 stack.
    out = out.replace(
      /(<div\b[^>]*\bsheet-stack\b[^>]*\bmode-a4\b[^>]*>)([\s\S]*?)(<\/div>\s*(?=<div\b[^>]*\bsheet-stack\b|<script\b|<\/div>\s*<\/body>|$))/i,
      function (_m, open, inner, close) {
        var pages = [];
        var rest = inner;
        var pageRe = /<div\b[^>]*\bpage\b[^>]*>[\s\S]*?<\/div>/gi;
        // Simpler: split on page opens and keep first two full page divs via depth walk
        var kept = [];
        var pageOpen = /<div\b[^>]*\bclass="[^"]*\bpage\b[^"]*"[^>]*>/gi;
        var pm;
        var positions = [];
        while ((pm = pageOpen.exec(inner))) positions.push(pm.index);
        if (positions.length <= 2) return open + inner + close;
        function endOfDiv(src, start) {
          var tagEnd = src.indexOf('>', start);
          if (tagEnd < 0) return src.length;
          var depth = 1;
          var finder = /<\/?div\b[^>]*>/gi;
          finder.lastIndex = tagEnd + 1;
          var mm;
          while ((mm = finder.exec(src))) {
            if (/^<\//.test(mm[0])) depth -= 1;
            else depth += 1;
            if (depth === 0) return mm.index + mm[0].length;
          }
          return src.length;
        }
        var slice = '';
        var lastEnd = 0;
        positions.slice(0, 2).forEach(function (pos) {
          if (pos > lastEnd) slice += inner.slice(lastEnd, pos);
          var end = endOfDiv(inner, pos);
          slice += inner.slice(pos, end);
          lastEnd = end;
        });
        // Drop trailing extras; keep non-page tail after last kept page? usually none.
        return open + slice + close;
      }
    );
    out = out.replace(
      /(<div\b[^>]*\bsheet-stack\b[^>]*\bmode-a5\b[^>]*>)([\s\S]*?)(<\/div>\s*(?=<script\b|<\/div>\s*<\/body>|$))/i,
      function (_m, open, inner, close) {
        var cutOpen = /<div\b[^>]*\bclass="[^"]*\bcut-sheet\b[^"]*"[^>]*>/gi;
        var positions = [];
        var pm;
        while ((pm = cutOpen.exec(inner))) positions.push(pm.index);
        if (positions.length <= 2) return open + inner + close;
        function endOfDiv(src, start) {
          var tagEnd = src.indexOf('>', start);
          if (tagEnd < 0) return src.length;
          var depth = 1;
          var finder = /<\/?div\b[^>]*>/gi;
          finder.lastIndex = tagEnd + 1;
          var mm;
          while ((mm = finder.exec(src))) {
            if (/^<\//.test(mm[0])) depth -= 1;
            else depth += 1;
            if (depth === 0) return mm.index + mm[0].length;
          }
          return src.length;
        }
        var slice = '';
        var lastEnd = 0;
        positions.slice(0, 2).forEach(function (pos) {
          if (pos > lastEnd) slice += inner.slice(lastEnd, pos);
          var end = endOfDiv(inner, pos);
          slice += inner.slice(pos, end);
          lastEnd = end;
        });
        return open + slice + close;
      }
    );
    out = out.replace(/\sclass="([^"]*)"/g, function (m, cls) {
      // ensure paper class survives on body — handled separately
      return m;
    });
    if (!/\bclass="[^"]*\bpaper-a[45]\b/.test(out)) {
      out = out.replace(/<body\b([^>]*)>/i, function (m, attrs) {
        if (/\bclass="/i.test(attrs)) {
          return '<body' + attrs.replace(/\bclass="/i, 'class="paper-a4 ') + '>';
        }
        return '<body class="paper-a4"' + attrs + '>';
      });
    }
    return out;
  }

  function sanitizePrintHtml(raw) {
    var html = String(raw || '');
    if (!html) return html;
    if (typeof DOMParser !== 'undefined') {
      try {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        if (!doc || !doc.body) return sanitizePrintHtmlText_(html);
        doc.body.classList.remove('is-printing');
        if (!doc.body.classList.contains('paper-a4') && !doc.body.classList.contains('paper-a5')) {
          doc.body.classList.add('paper-a4');
        }
        [].forEach.call(doc.querySelectorAll('.sheet-stack'), function (el) {
          el.style.transform = '';
          el.style.marginBottom = '';
          el.style.transformOrigin = '';
        });
        function keepFirst(sel) {
          var nodes = doc.querySelectorAll(sel);
          for (var i = 1; i < nodes.length; i++) {
            if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
          }
          return nodes[0] || null;
        }
        keepFirst('.toolbar');
        keepFirst('.preview-clip');
        keepFirst('.sheet-stack.mode-a4');
        keepFirst('.sheet-stack.mode-a5');
        var a4 = doc.querySelector('.sheet-stack.mode-a4');
        if (a4) {
          var pages = [].filter.call(a4.children, function (ch) {
            return ch.classList && ch.classList.contains('page');
          });
          pages.slice(2).forEach(function (pg) {
            if (pg.parentNode) pg.parentNode.removeChild(pg);
          });
        }
        var a5 = doc.querySelector('.sheet-stack.mode-a5');
        if (a5) {
          var cuts = [].filter.call(a5.children, function (ch) {
            return ch.classList && ch.classList.contains('cut-sheet');
          });
          cuts.slice(2).forEach(function (pg) {
            if (pg.parentNode) pg.parentNode.removeChild(pg);
          });
        }
        [].forEach.call(doc.querySelectorAll('script'), function (sc) {
          var t = String(sc.textContent || '');
          if (/SAVE_META/.test(t)) return;
          if (/EB_PRINT_PREVIEW|print-preview\.html|document\.write\s*\(\s*payload|document\.write\s*\(\s*html/.test(t)) {
            if (sc.parentNode) sc.parentNode.removeChild(sc);
          }
        });
        return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
      } catch (e) {
        return sanitizePrintHtmlText_(html);
      }
    }
    return sanitizePrintHtmlText_(html);
  }

  function openPrintHtml(html) {
    if (!html) return false;
    html = sanitizePrintHtml(html) || html;
    // Phone Chrome in the Varlo iframe often opens a tab that stays about:blank
    // (blob: and opener/sessionStorage both fail). Store HTML under a key and
    // open same-origin print-preview.html?k=… so the new tab can read it.
    var key = 'EB_PRINT_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    try {
      window.__EB_PRINT_PREVIEW_HTML = html;
      sessionStorage.setItem('EB_PRINT_PREVIEW_HTML', html);
      localStorage.setItem(key, html);
      localStorage.setItem('EB_PRINT_PREVIEW_HTML', html);
      localStorage.setItem('EB_PRINT_PREVIEW_KEY', key);
    } catch (e) {}
    var previewUrl;
    try {
      var u = new URL('print-preview.html', window.location.href);
      u.searchParams.set('t', String(Date.now()));
      u.searchParams.set('k', key);
      previewUrl = u.href;
    } catch (e2) {
      previewUrl = 'print-preview.html?t=' + Date.now() + '&k=' + encodeURIComponent(key);
    }
    // Open exactly one tab and keep window.opener (Save needs EBMenuPrint).
    // Do not click <a rel=noopener> AND window.open — that left Sunday/Main
    // previews stacked and looked like Save opened the wrong PDF.
    var w = null;
    try { w = window.open(previewUrl, '_blank'); } catch (e4) {}
    if (w) {
      try {
        // Some Android builds return a window stuck on about:blank — nudge it.
        if (!w.location || String(w.location.href || '') === 'about:blank') {
          w.location.href = previewUrl;
        }
      } catch (e5) {}
      return true;
    }
    // Iframe popup blockers: one <a target=_blank> with opener preserved.
    try {
      var a = document.createElement('a');
      a.href = previewUrl;
      a.target = '_blank';
      a.rel = 'opener';
      document.body.appendChild(a);
      a.click();
      if (a.parentNode) a.parentNode.removeChild(a);
      return true;
    } catch (e3) {}
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    w = window.open(url, '_blank');
    if (w) {
      setTimeout(function () {
        try { URL.revokeObjectURL(url); } catch (e6) {}
      }, 120000);
      return true;
    }
    try { URL.revokeObjectURL(url); } catch (e7) {}
    w = window.open('', '_blank');
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    return true;
  }

  function downloadPrintHtml(entry) {
    if (!entry || !entry.html) return false;
    // iframe embeds (manager.eightbells…) often block <a download>. Opening the
    // printable sheet in a new tab works on phone and PC; staff can Save/Print.
    if (openPrintHtml(entry.html)) return true;
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
    a.rel = 'opener';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      try { URL.revokeObjectURL(url); } catch (e) {}
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 500);
    return true;
  }

  /**
   * Email a saved sheet via Menu AI Apps Script (MailApp) — one click, no
   * mail-client popup. Defaults to pub@eightbellsbolney.com.
   */
  function emailPrintHtml(entry, opts) {
    opts = opts || {};
    if (!entry || !entry.html) return Promise.reject(new Error('missing_html'));
    var to = String(opts.to || HISTORY_EMAIL_DEFAULT || '').trim();
    var meta = {
      id: entry.id,
      menuId: entry.menuId,
      menuName: entry.menuName,
      roman: entry.roman,
      n: entry.n,
      week: entry.week,
      weekKey: entry.weekKey,
      hideDate: entry.hideDate,
      generatedAt: entry.generatedAt,
      dayKey: entry.dayKey,
      html: entry.html
    };
    // POST the HTML with the email action (no separate upload race).
    return historyCloudPost({
      action: 'emailPrintHistory',
      to: to,
      entry: meta
    }).then(function (data) {
      return {
        ok: true,
        to: (data && data.to) || to,
        from: data && data.from,
        subject: data && data.subject,
        filename: data && data.filename
      };
    });
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
      '.party-blurb-subhead{font-family:var(--serif);font-size:12pt;font-weight:600;letter-spacing:.03em;line-height:1.35;color:#1e3d28;margin:12px 12mm 8px}' +
      '.party-blurb-para{font-size:12px;line-height:1.45}' +
      '.party-blurb-text{font-family:var(--sans);font-size:10.5pt;color:#3a342c;margin:10px 14mm 8px;line-height:1.4;font-weight:400}' +
      '.party-blurb-bottom.party-title{font-size:16px;margin-top:14px}' +
      '.party-blurb-bottom.party-blurb-heading{margin-top:16px;font-size:12.5pt}' +
      '.party-blurb-bottom.party-blurb-subhead{margin-top:16px;font-size:11.5pt}' +
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
    applyDropInCapacity: applyDropInCapacity_,
    orderDishesForPrint: orderDishesForPrint,
    toRoman: toRoman,
    weekLabel: weekLabel,
    sundayLabel: sundayLabel,
    printSheetLabel: printSheetLabel,
    printFileName: printFileName,
    weekKey: weekKey,
    nextPrintVersion: nextPrintVersion,
    peekPrintVersion: peekPrintVersion,
    commitPrintVersion: commitPrintVersion,
    hydratePrintVersionsFromHistory: hydratePrintVersionsFromHistory,
    wrapGuillotine: wrapGuillotine,
    getLastBuild: getLastBuild,
    savePrintHistory: savePrintHistory,
    listPrintHistory: listPrintHistory,
    listLocalPrintHistory: localListOnly,
    pullPrintHistoryFromCloud: pullPrintHistoryFromCloud,
    syncPrintHistoryToCloud: syncPrintHistoryToCloud,
    schedulePendingPrintUploads: schedulePendingPrintUploads,
    pruneOrphanCloudIndex: pruneOrphanCloudIndex,
    getPrintHistory: getPrintHistory,
    deletePrintHistory: deletePrintHistory,
    groupHistoryByDay: groupHistoryByDay,
    sortHistoryNewest: sortHistoryNewest,
    preserveHistoryGeneratedAt: preserveHistoryGeneratedAt,
    dayLabelFromMs: dayLabelFromMs,
    timeLabelFromMs: timeLabelFromMs,
    openPrintHtml: openPrintHtml,
    sanitizePrintHtml: sanitizePrintHtml,
    downloadPrintHtml: downloadPrintHtml,
    emailPrintHtml: emailPrintHtml,
    historyCloudUrl: historyCloudUrl,
    measureOppositeColumns: measureOppositeColumns,
    planPromoFill: planPromoFill,
    promoUnits: promoUnits,
    filterUnusedPromos: filterUnusedPromos,
    uniqueFeaturePanelsHtml: uniqueFeaturePanelsHtml,
    featurePanelTitlesFromHtml: featurePanelTitlesFromHtml,
    venueDayKeyFromMs: venueDayKeyFromMs,
    splitHistoryWindow: splitHistoryWindow,
    isRecentHistoryRow: isRecentHistoryRow
  };
})(typeof window !== 'undefined' ? window : global);
