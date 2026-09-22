/* Eight Bells staff menus.
   The public website PDFs are unchanged. This is the list staff edit,
   and the sheet rule they see before anything is printed. */
(function (root) {
  'use strict';

  var MENUS = [
    { id: 'main', name: 'Main menu', kind: 'long' },
    { id: 'sunday', name: 'Sunday', kind: 'long' },
    { id: 'party', name: 'Party / Christmas', kind: 'party' },
    { id: 'sandwiches', name: 'Sandwiches', kind: 'card', comfortable: 10 },
    { id: 'desserts', name: 'Desserts', kind: 'card', comfortable: 7 },
    { id: 'little-bells', name: 'Little Bells', kind: 'card', comfortable: 6 },
    { id: 'lunch-club', name: 'Lunch club', kind: 'card', comfortable: 12 }
  ];

  var SECTION_NAMES = {
    nibbles: 1,
    starters: 1,
    mains: 1,
    desserts: 1,
    sides: 1,
    sandwiches: 1,
    'pub classics': 1,
    'pub classics & burgers': 1,
    'sunday roasts': 1
  };

  /** Meta for set menus (Christmas / party) — title + course prices. */
  function emptyMeta() {
    return { title: '', subtitle: '', coursePrices: '', notes: '' };
  }

  function dish(section, name, description, price, tags, lunchClub) {
    return {
      id: slug(section + '-' + name),
      section: section,
      name: name,
      description: description || '',
      price: price || '',
      tags: tags || '',
      lunchClub: !!lunchClub
    };
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function seed() {
    return {
      main: [
        dish('Nibbles', 'Bread and Salted Butter', '', '5.95', ''),
        dish('Nibbles', 'Marinated Olives', '', '6.95', 'vg'),
        dish('Nibbles', 'Cheese, Chilli & Chorizo Melts', '', '7.25', ''),
        dish('Nibbles', 'Noodle Bites', 'sriracha sauce', '6.95', 'vg'),
        dish('Nibbles', 'Scorched Padron Peppers', 'smoked maldon salt', '6.95', 'vg & gf'),
        dish('Nibbles', 'Breaded Whitebait', 'garlic aioli', '7.95', ''),
        dish('Starters', 'Beef Ragu Arancini', 'tomato, red onion salsa, manchego cheese', '8.25', 'gf with vg option', true),
        dish('Starters', 'Game Terrine', 'warm crusty bread, cornichons, red onion jam', '8.50', 'gf option'),
        dish('Starters', 'Salt Cod Cake & Smoked Salmon', 'micro salad, lemon oil', '9.95', 'gf'),
        dish('Starters', 'Quinoa Falafel', 'avocado, tahini dressing, lemon dressed tomato rocket salad', '8.25 / 14.95', 'vg & gf', true),
        dish('Starters', 'Nduja King Prawn Bruschetta', 'tomato salsa, toasted ciabatta', '8.95', 'gf option', true),
        dish('Starters', 'Baked Camembert (to share)', 'ciabatta, red onion jam', '15.95', 'gf'),
        dish('Pub classics & Burgers', 'Haddock & Chips', 'battered, garden peas, tartare sauce', '17.95', 'gf option'),
        dish('Pub classics & Burgers', 'Pie of the Day', 'mash, seasonal veg, gravy', '17.95', ''),
        dish('Pub classics & Burgers', 'Trenchmore Wagyu Beef Burger', 'seeded brioche bun, streaky bacon, monterey jack, onion rings, fries, salad', '20.95', 'gf option'),
        dish('Pub classics & Burgers', 'Spicy Asian Burger', 'seeded brioche bun, “mayo”, onion rings, fries, salad', '16.95', 'vg, gf option'),
        dish('Mains', 'Crab Linguine', 'lemon, chilli, pangrattato, vine cherry tomatoes, balsamic', '18.95', 'gf option'),
        dish('Mains', 'Venison Casserole', 'cheese and herb dumpling, purple sprouting broccoli', '18.95', 'gf option'),
        dish('Mains', 'Smoked Haddock, Cod & Salmon Fish Pie', 'buttered kale, ciabatta', '19.95', ''),
        dish('Mains', 'Chilli Braised Lamb', 'harissa giant cous-cous, yogurt, toasted almonds', '20.95', ''),
        dish('Mains', 'Calves Liver & Smokey Streaked Bacon', 'buttered mash, savoy cabbage, red onion gravy', '17.95', 'gf'),
        dish('Mains', 'Pan Fried Hake Fillet', 'herb crushed new potatoes, buttered kale, mussel and crayfish chowder', '25.95', 'gf'),
        dish('Mains', '10oz Sirloin Steak', 'grilled tomato, chestnut mushroom fricassée, fries, peppercorn sauce', '29.95', 'gf'),
        dish('Mains', 'Beef Sirloin Stroganoff', 'seared beef strips, creamy sauce, rice', '18.95', 'vg option'),
        dish('Mains', 'Honey & Mustard Glazed Cannon of Pork', 'duchess potato, creamy pancetta savoy cabbage', '21.95', 'gf'),
        dish('Sides', 'Seasonal Veg', '', '4.95', 'gf'),
        dish('Sides', 'Dressed Mixed Salad', '', '5.95', 'gf'),
        dish('Sides', 'Truffle & Parmesan Fries', '', '6.95', ''),
        dish('Sides', 'Skinny Fries/Chunky Chips', 'add cheese +£1', '4.50', 'gf')
      ],
      sunday: [
        dish('Nibbles', 'Bread and Salted Butter', '', '5.95', ''),
        dish('Sunday roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
        dish('Sunday roasts', 'Pork Loin', 'crackling and apple sauce', '19.95', ''),
        dish('Mains', 'Wild Mushroom Gnocchi', 'truffle, parmesan, beer', '17.95', ''),
        dish('Desserts', 'Sticky Toffee Pudding', 'brandy snap, clotted cream ice cream, toffee sauce', '7.95', 'v', true)
      ],
      party: [
        dish('Starters', 'Jerusalem Artichoke Soup', 'finished with fragrant black truffle oil', '', 'gf av'),
        dish('Starters', 'Smoked Salmon Pâté', 'sweet beetroot ketchup, crisp pickled cucumber and toasted ciabatta', '', 'gf'),
        dish('Starters', 'Piedamontaise Pepper', 'filled with herbed quinoa, roasted vegetables and tomato sauce', '', 'vg gf'),
        dish('Starters', 'Pan-Fried Guinea Fowl Breast', 'celeriac remoulade, crispy pancetta and red wine jus', '', ''),
        dish('Mains', 'Stuffed Turkey Breast', 'pigs in blankets, roast potatoes, seasonal vegetables and gravy', '', 'gf av'),
        dish('Mains', 'Stuffed Butternut Squash', 'herbed quinoa, roasted vegetables, tomato sauce and vegan gravy', '', 'vg gf'),
        dish('Mains', 'Braised Short Rib of Beef', 'creamy mash, glazed carrots and red wine jus', '', 'gf'),
        dish('Mains', 'Monkfish Tail', 'wrapped in Parma ham, crushed new potatoes, samphire and beurre blanc', '', ''),
        dish('Desserts', 'Sherry Trifle', 'layers of sherry-soaked sponge, fruit, jelly, custard and cream', '', ''),
        dish('Desserts', 'Orange, Cranberry, Chocolate & Frangipane Tart', 'served with clotted cream', '', ''),
        dish('Desserts', 'Christmas Pudding', 'with brandy butter or custard and redcurrants', '', 'gf av vg'),
        dish('Desserts', 'Milk Chocolate & Caraway Mousse', 'with crumbed gingerbread and candied peel', '', 'gf av')
      ],
      sandwiches: [
        dish('Sandwiches', 'Mozzarella, Tomato & Pesto', '', '9.50', 'v'),
        dish('Sandwiches', 'Chicken, Bacon & Mayonnaise', '', '9.50', ''),
        dish('Sandwiches', 'Toasted Hot Tuna Melt', '', '10.50', ''),
        dish('Sandwiches', 'Giant Fish Finger & Tartare Sauce', '', '10.50', '')
      ],
      desserts: [
        dish('Desserts', 'Sticky Toffee Pudding', 'brandy snap, clotted cream ice cream, toffee sauce', '7.95', 'v with gf option', true),
        dish('Desserts', 'Chocolate Brownie', 'chocolate sauce & vanilla ice cream', '7.95', 'v', true),
        dish('Desserts', 'Chocolate Fondant', 'served with vanilla ice cream', '7.95', 'v'),
        dish('Desserts', 'Sussex Cheeses', 'biscuits, grapes, quince jelly, celery, pickled walnuts', '9.95 / 17.95', 'gf option'),
        dish('Desserts', 'Cheesecake Of The Day', 'chocolate sauce & vanilla ice cream', '7.95', 'vg & gf option'),
        dish('Desserts', '3 Scoops of Ice Cream or Sorbet', 'vanilla, strawberry, mint choc chip, chocolate, salted caramel', '5.95', 'v', true)
      ],
      'little-bells': [
        dish('Little Bells', 'Fish Fingers, Chunky Chips & Peas', '', '9.50', ''),
        dish('Little Bells', 'Chicken Goujons, Fries & Dressed Salad', '', '9.50', ''),
        dish('Little Bells', 'Beef Burger, Fries & Dressed Salad', '', '9.50', ''),
        dish('Little Bells', 'Tomato & Basil Pasta', '', '9.50', 'v'),
        dish('Little Bells', 'Kids Mac & Cheese', '', '9.50', '')
      ],
      'lunch-club': [
        dish('Starters', 'Chicken Liver Pâté', 'salad, toast', '', ''),
        dish('Starters', 'Ragu Arancini', '', '', ''),
        dish('Starters', 'Soup of the Day', 'crusty bread', '', ''),
        dish('Starters', 'Nduja King Prawn', 'salad', '', ''),
        dish('Mains', 'Thai Green Curry', '', '', 'gf / vg option'),
        dish('Mains', 'Chicken Schnitzel', 'garlic butter, fries, salad', '', 'gf option'),
        dish('Mains', 'Wild Boar & Apple Sausage Mash', 'veg, gravy', '', ''),
        dish('Mains', 'Korean Chicken Burger', 'fries', '', ''),
        dish('Desserts', 'Crumble & Custard', '', '', 'gf option'),
        dish('Desserts', 'Sticky Toffee Pudding', '', '', 'v with gf option'),
        dish('Desserts', 'Brownie with Ice Cream', '', '', 'gf option'),
        dish('Desserts', 'Ice Cream', '', '', 'vg & gf')
      ]
    };
  }

  function menuById(id) {
    for (var i = 0; i < MENUS.length; i++) if (MENUS[i].id === id) return MENUS[i];
    return MENUS[0];
  }

  function isHeading(line) {
    var bare = String(line).replace(/:$/, '').trim();
    if (SECTION_NAMES[bare.toLowerCase()]) return bare;
    return '';
  }

  function priceOf(line) {
    var m = String(line).match(/(?:£\s*)?(\d+\.\d{2}(?:\s*\/\s*£?\s*\d+\.\d{2})?)\s*$/);
    if (!m) return null;
    return { raw: m[0], value: m[1].replace(/£/g, '').replace(/\s+/g, '') };
  }

  function pullTags(name) {
    var tags = [];
    var clean = name.replace(/\blunch\s*club\b/ig, ' ').replace(/\[lunch\]/ig, ' ');
    var re = /\b(?:gf|vg|v)(?:\s*(?:\/|&)\s*(?:gf|vg|v))*(?:\s+(?:with\s+)?(?:gf|vg|v(?:\s*(?:\/|&)\s*(?:gf|vg|v))*)?\s*option)?\b/ig;
    clean = clean.replace(re, function (hit) {
      tags.push(hit.trim());
      return ' ';
    });
    clean = clean.replace(/\s{2,}/g, ' ').replace(/^[\s,–-]+|[\s,–-]+$/g, '');
    return { name: clean, tags: tags.join(' ').replace(/\s+/g, ' ').trim() };
  }

  function parsePaste(text) {
    var lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var section = 'Dishes';
    var dishes = [];
    for (var i = 0; i < lines.length; i++) {
      var heading = isHeading(lines[i]);
      if (heading && !priceOf(lines[i])) {
        section = heading;
        continue;
      }
      var price = priceOf(lines[i]);
      var rawName = price ? lines[i].slice(0, lines[i].length - price.raw.length).trim() : lines[i];
      var lunch = /\[lunch\]|\blunch\s*club\b/i.test(lines[i]);
      var pulled = pullTags(rawName);
      var description = '';
      if (price && lines[i + 1] && !priceOf(lines[i + 1]) && !isHeading(lines[i + 1])) {
        description = lines[i + 1];
        i += 1;
      }
      if (!pulled.name) continue;
      if (typeof isJunkDishName === 'function' && isJunkDishName(pulled.name)) continue;
      dishes.push({
        id: slug(section + '-' + pulled.name + '-' + dishes.length),
        section: section,
        name: pulled.name,
        description: description,
        price: price ? price.value : '',
        tags: pulled.tags,
        lunchClub: lunch
      });
    }
    return dishes;
  }

  function sheetPlan(menuId, count) {
    var menu = menuById(menuId);
    if (menu.kind === 'card') {
      if (count > menu.comfortable) {
        return {
          fit: 'over',
          text: 'This card holds about ' + menu.comfortable + ' dishes. There are ' + count + '. Take something off before it is printed. The type stays the same size.'
        };
      }
      return {
        fit: 'two-up',
        text: 'Two identical copies on one A4, cut down the middle.'
      };
    }
    if (menu.kind === 'party') {
      if (count > 18) {
        return { fit: 'over', text: 'Party menus stay on one centred A4. Take a few dishes off.' };
      }
      return {
        fit: 'one',
        text: 'Standardised party sheet — centred title, starters / mains / desserts, one A4 (website Christmas style).'
      };
    }
    // Long menus: coarse gate — fluid layout (with fillers) runs at Generate.
    if (count <= 16) return { fit: 'one', text: 'Looks like one A4. Generate places columns and any selling boxes that fit.' };
    if (count <= 36) return { fit: 'two', text: 'Looks like two A4 pages. Generate keeps type the same size and only adds rooms/sandwiches/logo if they fit.' };
    return {
      fit: 'over',
      text: 'Too full for two pages. Take dishes off. A promo does not open another page.'
    };
  }

  /** Menus that can be pulled onto a long sheet (main / Sunday). */
  function includableMenus(hostId) {
    if (hostId !== 'main' && hostId !== 'sunday') return [];
    return MENUS.filter(function (m) {
      return m.id !== hostId && m.id !== 'lunch-club' && m.kind === 'card';
    });
  }

  /**
   * Build the dish list that would print: host menu plus any ticked extras.
   * Extra dishes keep their section; duplicates of the same name+section are skipped.
   */
  function composeDishes(book, hostId, includes) {
    includes = includes || {};
    var list = (book[hostId] || []).slice();
    var seen = {};
    list.forEach(function (d) {
      seen[(d.section + '|' + d.name).toLowerCase()] = true;
    });
    includableMenus(hostId).forEach(function (menu) {
      if (!includes[menu.id]) return;
      (book[menu.id] || []).forEach(function (d) {
        var key = (d.section + '|' + d.name).toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        list.push({
          id: d.id + '-on-' + hostId,
          section: d.section,
          name: d.name,
          description: d.description,
          price: d.price,
          tags: d.tags,
          lunchClub: !!d.lunchClub,
          fromMenu: menu.id
        });
      });
    });
    return list;
  }

  function sheetPlanFor(book, hostId, includes) {
    var list = composeDishes(book, hostId, includes);
    var plan = sheetPlan(hostId, list.length);
    var extras = includableMenus(hostId)
      .filter(function (m) { return includes && includes[m.id]; })
      .map(function (m) { return m.name; });
    if (extras.length) {
      plan.text += ' Includes ' + extras.join(', ') + ' (' + list.length + ' dishes in total).';
    } else {
      plan.text += ' ' + list.length + ' dishes selected.';
    }
    // Refine with the print layout brain when available (same rules as Generate).
    if (typeof root.EBMenuPrint !== 'undefined' && root.EBMenuPrint.planFluidLayout) {
      var menu = menuById(hostId);
      if (menu.kind === 'long') {
        var layout = root.EBMenuPrint.planFluidLayout(menu, list);
        plan.fit = layout.fit;
        plan.text = layout.summary;
        if (extras.length) plan.text += ' Includes ' + extras.join(', ') + '.';
        plan.layout = layout;
      }
    }
    return { plan: plan, dishes: list };
  }

  function lunchClubFromTicks(book) {
    var out = [];
    MENUS.forEach(function (menu) {
      if (menu.id === 'lunch-club') return;
      (book[menu.id] || []).forEach(function (item) {
        if (item.lunchClub) out.push({ menu: menu.name, dish: item });
      });
    });
    return out;
  }

  function emptyMarks() {
    return { gf: false, gfOpt: false, v: false, vOpt: false, vg: false, vgOpt: false };
  }

  function parseMarks(tags) {
    var t = String(tags || '').toLowerCase().replace(/\s+/g, ' ').trim();
    var m = emptyMarks();
    if (!t) return m;
    if (/v with gf option/.test(t)) {
      m.v = true;
      m.gfOpt = true;
      return m;
    }
    if (/gf with vg option/.test(t)) {
      m.gf = true;
      m.vgOpt = true;
      return m;
    }
    if (/vg\s*(?:&|\/)\s*gf(\s+option)?/.test(t)) {
      m.vg = true;
      m.gf = true;
      if (/option/.test(t)) m.gfOpt = true;
      return m;
    }
    if (/\bgf(\s+option)?\b/.test(t)) {
      m.gf = true;
      if (/gf\s+option/.test(t)) m.gfOpt = true;
    }
    if (/\bvg(\s+option)?\b/.test(t)) {
      m.vg = true;
      if (/vg\s+option/.test(t)) m.vgOpt = true;
    }
    // word-boundary v that is not part of vg
    var withoutVg = t.replace(/vg(\s+option)?/g, ' ');
    if (/(^|[^a-z])v(\s+option)?([^a-z]|$)/.test(withoutVg)) {
      m.v = true;
      if (/v\s+option/.test(withoutVg)) m.vOpt = true;
    }
    return m;
  }

  function formatMarks(m) {
    m = m || emptyMarks();
    if (m.v && m.gfOpt && !m.gf && !m.vg) return 'v with gf option';
    if (m.gf && m.vgOpt && !m.vg && !m.v) return 'gf with vg option';
    if (m.vg && m.gf && !m.v) {
      if (m.gfOpt || m.vgOpt) return 'vg & gf option';
      return 'vg & gf';
    }
    var parts = [];
    if (m.gf) parts.push(m.gfOpt ? 'gf option' : 'gf');
    if (m.v) parts.push(m.vOpt ? 'v option' : 'v');
    if (m.vg) parts.push(m.vgOpt ? 'vg option' : 'vg');
    return parts.join(', ');
  }

  /** Normalise Gemini spellingFixes for the review gate. */
  function normalizeSpellingFixes(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [];
    var seen = {};
    raw.forEach(function (fix) {
      if (!fix || typeof fix !== 'object') return;
      var from = String(fix.from != null ? fix.from : (fix.original != null ? fix.original : '')).trim();
      var to = String(fix.to != null ? fix.to : (fix.corrected != null ? fix.corrected : '')).trim();
      if (!from || !to || from === to) return;
      var key = from.toLowerCase() + '\0' + to.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push({
        from: from,
        to: to,
        where: String(fix.where || fix.field || '').trim()
      });
    });
    return out;
  }

  /** Turn Gemini / AI JSON into dish rows (+ meta + spellingFixes). */
  function dishesFromAiMenu(menuJson) {
    menuJson = menuJson || {};
    var meta = emptyMeta();
    meta.title = menuJson.title || '';
    meta.subtitle = menuJson.subtitle || '';
    meta.coursePrices = menuJson.coursePrices || '';
    meta.notes = menuJson.notes || '';
    var list = [];
    (menuJson.dishes || []).forEach(function (d, i) {
      var section = d.section || 'Dishes';
      var name = String(d.name || '').trim();
      if (!name || isJunkDishName(name)) return;
      list.push({
        id: slug(section + '-' + name + '-' + i),
        section: section,
        name: name,
        description: d.description || '',
        price: d.price || '',
        tags: normalizeAiTags(d.tags || ''),
        lunchClub: false
      });
    });
    return {
      dishes: list,
      meta: meta,
      kind: menuJson.kind || '',
      spellingFixes: normalizeSpellingFixes(menuJson.spellingFixes)
    };
  }

  function normalizeAiTags(t) {
    t = String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
    t = t.replace(/\bavailable\b/g, 'option').replace(/\bav\b/g, 'option');
    t = t.replace(/\bgluten free\b/g, 'gf').replace(/\bvegetarian\b/g, 'v').replace(/\bvegan\b/g, 'vg');
    return formatMarks(parseMarks(t));
  }

  function isJunkDishName(name) {
    var n = String(name || '').trim();
    if (n.length < 3) return true;
    if (/^the eight bells$/i.test(n)) return true;
    if (/bolney/i.test(n) && /1740|west sussex/i.test(n)) return true;
    if (/^party menu\b/i.test(n)) return true;
    if (/^christmas\b/i.test(n) && n.length < 20) return true;
    if (/^[^\w]*$/.test(n)) return true;
    if (/^[a-z]{1,2}$/i.test(n)) return true;
    if (/please inform|allergen|gluten free\s*[–-]\s*vegetarian/i.test(n)) return true;
    return false;
  }

  /** Selling / event wording bank (Stay a While, pub quiz, etc.). */
  function promoItem(title, body, date, id) {
    return {
      id: id || slug(title + '-' + (date || 'evergreen')),
      title: title || '',
      body: body || '',
      date: date ? String(date).slice(0, 10) : ''
    };
  }

  function seedPromoBank() {
    return [
      promoItem(
        'Stay a While',
        'we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.',
        '',
        'stay-a-while'
      ),
      promoItem(
        'Gatherings',
        'whether it’s a quiet supper or a special get together, we’re always happy to host your event',
        '',
        'gatherings'
      ),
      promoItem(
        'Pub Quiz',
        'Join us for our pub quiz — teams welcome, cash prizes, from 8pm.',
        '',
        'pub-quiz'
      )
    ];
  }

  function startOfDay(d) {
    d = d ? new Date(d) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function parsePromoDate(dateStr) {
    var m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  function isPastPromoDate(dateStr, today) {
    var dt = parsePromoDate(dateStr);
    if (!dt) return false;
    return dt < startOfDay(today);
  }

  function formatPromoDate(dateStr) {
    var dt = parsePromoDate(dateStr);
    if (!dt) return '';
    var day = dt.getDate();
    var ord = (day % 10 === 1 && day !== 11) ? 'st'
      : (day % 10 === 2 && day !== 12) ? 'nd'
        : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[dt.getDay()] + ' ' + day + ord + ' ' + months[dt.getMonth()];
  }

  /**
   * Choose bank wording for Generate.
   * If staff ticked any: use those (manual override, past dates allowed).
   * If none ticked: auto-pick upcoming/evergreen only — never past-dated.
   */
  function pickPromos(bank, ticks, opts) {
    opts = opts || {};
    var max = opts.max != null ? opts.max : 2;
    var today = opts.today || new Date();
    bank = Array.isArray(bank) ? bank.slice() : [];
    ticks = ticks || {};
    var anyTick = false;
    Object.keys(ticks).forEach(function (k) { if (ticks[k]) anyTick = true; });

    var chosen;
    if (anyTick) {
      chosen = bank.filter(function (p) { return p && ticks[p.id]; });
    } else {
      chosen = bank.filter(function (p) {
        return p && p.title && !isPastPromoDate(p.date, today);
      });
      chosen.sort(function (a, b) {
        var ad = a.date || '';
        var bd = b.date || '';
        if (ad && bd) return ad < bd ? -1 : ad > bd ? 1 : 0;
        if (ad && !bd) return -1;
        if (!ad && bd) return 1;
        return 0;
      });
    }
    return chosen.slice(0, Math.max(0, max));
  }

  function normalizePromoBank(raw) {
    if (!Array.isArray(raw)) return seedPromoBank();
    var out = [];
    var seen = {};
    raw.forEach(function (p, i) {
      if (!p || typeof p !== 'object') return;
      var title = String(p.title || '').trim();
      if (!title) return;
      var id = String(p.id || slug(title + '-' + i));
      if (seen[id]) id = id + '-' + i;
      seen[id] = true;
      out.push({
        id: id,
        title: title,
        body: String(p.body || '').trim(),
        date: p.date ? String(p.date).slice(0, 10) : ''
      });
    });
    return out.length ? out : seedPromoBank();
  }

  root.EBMenus = {
    MENUS: MENUS,
    seed: seed,
    menuById: menuById,
    parsePaste: parsePaste,
    sheetPlan: sheetPlan,
    sheetPlanFor: sheetPlanFor,
    composeDishes: composeDishes,
    includableMenus: includableMenus,
    lunchClubFromTicks: lunchClubFromTicks,
    dish: dish,
    emptyMarks: emptyMarks,
    emptyMeta: emptyMeta,
    parseMarks: parseMarks,
    formatMarks: formatMarks,
    dishesFromAiMenu: dishesFromAiMenu,
    normalizeSpellingFixes: normalizeSpellingFixes,
    isJunkDishName: isJunkDishName,
    promoItem: promoItem,
    seedPromoBank: seedPromoBank,
    normalizePromoBank: normalizePromoBank,
    pickPromos: pickPromos,
    isPastPromoDate: isPastPromoDate,
    formatPromoDate: formatPromoDate
  };
})(typeof window !== 'undefined' ? window : global);
