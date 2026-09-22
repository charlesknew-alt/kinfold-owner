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

  /** Canonical sections staff pick from — print layout keys off these. */
  var SECTIONS = [
    'Nibbles',
    'Starters',
    'Sharing Plates',
    'Item Boost',
    'Pub Classics',
    'Burgers',
    'Mains',
    'Sandwiches',
    'Sides',
    'Sauces',
    'Desserts'
  ];

  var SECTION_NAMES = (function () {
    var map = {};
    SECTIONS.forEach(function (s) { map[s.toLowerCase()] = s; });
    // Pasted / AI aliases → canonical
    map['pub classics & burgers'] = 'Pub Classics';
    map['classics'] = 'Pub Classics';
    map['pub classic'] = 'Pub Classics';
    map['sharing'] = 'Sharing Plates';
    map['to share'] = 'Sharing Plates';
    map['light bites'] = 'Nibbles';
    map['nibble'] = 'Nibbles';
    map['starter'] = 'Starters';
    map['main'] = 'Mains';
    map['main courses'] = 'Mains';
    map['sandwich'] = 'Sandwiches';
    map['burger'] = 'Burgers';
    map['side'] = 'Sides';
    map['sides & extras'] = 'Sides';
    map['sauce'] = 'Sauces';
    map['sauces'] = 'Sauces';
    map['item boost'] = 'Item Boost';
    map['item boosts'] = 'Item Boost';
    map['boost'] = 'Item Boost';
    map['specials'] = 'Item Boost';
    map["today's special"] = 'Item Boost';
    map["today's specials"] = 'Item Boost';
    map['chefs special'] = 'Item Boost';
    map["chef's special"] = 'Item Boost';
    map['fish of the day'] = 'Item Boost';
    map['pie of the day'] = 'Item Boost';
    map['catch of the day'] = 'Item Boost';
    map['dessert'] = 'Desserts';
    map['puddings'] = 'Desserts';
    map['sunday roasts'] = 'Mains';
    map['roasts'] = 'Mains';
    return map;
  })();

  function sectionOptions() {
    return SECTIONS.slice();
  }

  function sectionRank(name) {
    var canon = normalizeSectionName(name);
    var i = SECTIONS.indexOf(canon);
    return i >= 0 ? i : 50;
  }

  function normalizeSectionName(name) {
    var bare = String(name || '').replace(/:$/, '').trim();
    if (!bare) return 'Mains';
    var hit = SECTION_NAMES[bare.toLowerCase()];
    if (hit) return hit;
    // Partial match
    var lower = bare.toLowerCase();
    for (var i = 0; i < SECTIONS.length; i++) {
      if (lower.indexOf(SECTIONS[i].toLowerCase()) !== -1) return SECTIONS[i];
    }
    if (/classic/.test(lower)) return 'Pub Classics';
    if (/burger/.test(lower)) return 'Burgers';
    if (/sandwich/.test(lower)) return 'Sandwiches';
    if (/nibble|light bite/.test(lower)) return 'Nibbles';
    if (/starter/.test(lower)) return 'Starters';
    if (/shar(e|ing)|for the table/.test(lower)) return 'Sharing Plates';
    if (/item\s*boost|specials?|fish of the day|pie of the day|catch of the day|chef.?s special/.test(lower)) {
      return 'Item Boost';
    }
    if (/^sauces?$/.test(lower) || /\bsauces?\b/.test(lower) && lower.length < 12) return 'Sauces';
    if (/side/.test(lower)) return 'Sides';
    if (/dessert|pudding|sweet/.test(lower)) return 'Desserts';
    if (/main|roast/.test(lower)) return 'Mains';
    return bare.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /**
   * Auto-guess a canonical section from paste/AI section + dish name.
   * Burgers / sandwiches win from the dish name even under “Pub classics & Burgers”.
   */
  function guessSection(section, name, description) {
    var n = String(name || '').trim();
    var s = String(section || '').trim();
    var desc = String(description || '');
    if (/^sandwiches?\b/i.test(n)) return 'Sandwiches';
    if (/\bburger\b/i.test(n)) return 'Burgers';
    if (/^(sauce robert|peppercorn|garlic butter|chilli butter|chili butter)\b/i.test(n)) {
      return 'Sauces';
    }
    if (/^sauces?\b/i.test(s)) return 'Sauces';
    // Featured specials staff file under Item Boost (Fish / Pie of the Day, etc.)
    if (/item\s*boost|specials?/i.test(s)) return 'Item Boost';
    if (/\b(fish|pie|catch|special)\s+of\s+the\s+day\b/i.test(n)) return 'Item Boost';
    if (/\bto share\b/i.test(n) || /\bfor the table\b/i.test(n) || /\bsharing\b/i.test(n)) {
      return 'Sharing Plates';
    }
    if (/charcuterie|sharing board|baked camembert/i.test(n) && /share|board/i.test(n + ' ' + desc)) {
      return 'Sharing Plates';
    }
    // Classic pub plates by name when section is vague
    var fromSec = normalizeSectionName(s);
    if (fromSec === 'Pub Classics' || /classic|burger/i.test(s)) {
      if (/\bburger\b/i.test(n)) return 'Burgers';
      return 'Pub Classics';
    }
    if (SECTIONS.indexOf(fromSec) !== -1) return fromSec;
    if (/haddock|scampi|fish of the day|pie of the day|sausage|ham.?egg|liver/i.test(n)) {
      return 'Pub Classics';
    }
    return fromSec || 'Mains';
  }

  function assignSections(dishes) {
    return (dishes || []).map(function (d, i) {
      var section = guessSection(d.section, d.name, d.description);
      return {
        id: d.id || slug(section + '-' + (d.name || 'dish') + '-' + i),
        section: section,
        name: d.name,
        description: d.description || '',
        price: d.price || '',
        tags: d.tags || '',
        lunchClub: !!d.lunchClub,
        fromMenu: d.fromMenu
      };
    });
  }

  function sortDishesBySection(dishes) {
    var list = (dishes || []).slice();
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
        dish('Item Boost', 'Fish of the Day', 'ask waiting staff for today’s catch', 'MP', ''),
        dish('Pub Classics', 'Haddock & Chips', 'battered, garden peas, tartare sauce', '17.95', 'gf option'),
        dish('Pub Classics', 'Pie of the Day', 'mash, seasonal veg, gravy', '17.95', ''),
        dish('Burgers', 'Trenchmore Wagyu Beef Burger', 'seeded brioche bun, streaky bacon, monterey jack, onion rings, fries, salad', '20.95', 'gf option'),
        dish('Burgers', 'Spicy Asian Burger', 'seeded brioche bun, “mayo”, onion rings, fries, salad', '16.95', 'vg, gf option'),
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
    if (!bare || priceOf(bare)) return '';
    if (SECTION_NAMES[bare.toLowerCase()]) return SECTION_NAMES[bare.toLowerCase()];
    // Only short section-like labels — not “and a side salad” / “choice of sauce…”
    if (bare.length > 32 || /^(served|with|and|choice|see |ask |filled|all served)\b/i.test(bare)) {
      return '';
    }
    var norm = normalizeSectionName(bare);
    if (SECTIONS.indexOf(norm) === -1) return '';
    var words = bare.replace(/[^a-zA-Z\s&]/g, '').trim().split(/\s+/).filter(Boolean);
    if (words.length > 5) return '';
    if (!/classic|burger|sandwich|nibble|starter|main|side|dessert|shar|sauce|roast|light bite|boost|special|fish of the day|pie of the day/i.test(bare)) {
      return '';
    }
    return norm;
  }

  /** Description wrap lines wrongly stored as dish titles (PDF extract). */
  function looksLikeDescFragment(name) {
    var n = String(name || '').trim();
    if (!n || n.length > 100) return false;
    // Expand “served with…” / ingredient-list fragments (price may sit on that line).
    if (/^(serves?|served|with|and|filled|ask |see |all served|rings?|bacon|onion|fries|salad|streaky|brioche|mayo|cheese|monter|choice of|tomato|garden peas|tartare|dressed|ciabatta|red onion|horseradish|honey|braised|crispy|pickled|smoked bacon|micro salad|tomato salsa|pangrattato)\b/i.test(n)) {
      return true;
    }
    if (/^[a-z]/.test(n) && !/burger|haddock|pie|fish|steak|salad|arancini|cocktail/i.test(n)) {
      return true;
    }
    // Long comma-lists of garnish (no dish verb) — e.g. "horseradish cream, honey braised leeks…"
    if (/,/.test(n) && n.length > 28 &&
      !/\b(burger|steak|pie|curry|pasta|gnocchi|schnitzel|casserole|linguini|linguine)\b/i.test(n) &&
      !/^\d/.test(n)) {
      return true;
    }
    return false;
  }

  /** Fold dish `next` onto `prev` as description (+ price/tags when missing). */
  function mergeDishOnto(prev, next) {
    if (!prev || !next) return prev;
    var bit = String(next.name || '').trim();
    if (next.description) bit = bit ? (bit + ' ' + next.description) : String(next.description);
    if (bit) prev.description = prev.description ? (prev.description + ' ' + bit) : bit;
    if (!(prev.price && String(prev.price).trim()) && next.price) {
      prev.price = String(next.price).trim();
    }
    if (!(prev.tags && String(prev.tags).trim()) && next.tags) {
      prev.tags = next.tags;
    }
    return prev;
  }

  /**
   * Should this row fold onto the previous dish?
   * Covers: unpriced wrap lines, and priced descriptions under a title that
   * had no price (Smoked Salmon / horseradish… 8.95; Camembert / served with… 14.95).
   */
  function shouldMergeOntoPrevious(prev, d) {
    if (!prev || !d) return false;
    var name = String(d.name || '').trim();
    if (!name || !looksLikeDescFragment(name)) return false;
    var hasPrice = !!(d.price && String(d.price).trim());
    var prevPrice = !!(prev.price && String(prev.price).trim());
    if (!hasPrice) return true;
    if (!prevPrice) return true;
    // Both priced — only fold obvious “served with…” leftovers
    return /^(serves?|served|with|and)\b/i.test(name);
  }

  /** Merge orphan description rows back onto the previous dish (review + paste + print). */
  function tidyOrphanDescriptions(dishes) {
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
      if (out.length && shouldMergeOntoPrevious(out[out.length - 1], d)) {
        mergeDishOnto(out[out.length - 1], d);
        return;
      }
      out.push(d);
    });
    return out;
  }

  /** Staff “Merge with dish above” — fold index into index-1 in a list. */
  function mergeDishWithPrevious(dishes, index) {
    var list = (dishes || []).slice();
    var i = parseInt(index, 10);
    if (!(i > 0) || i >= list.length) return list;
    var prev = {
      id: list[i - 1].id,
      section: list[i - 1].section,
      name: list[i - 1].name,
      description: list[i - 1].description || '',
      price: list[i - 1].price || '',
      tags: list[i - 1].tags || '',
      lunchClub: !!list[i - 1].lunchClub,
      fromMenu: list[i - 1].fromMenu
    };
    mergeDishOnto(prev, list[i]);
    list[i - 1] = prev;
    list.splice(i, 1);
    return list;
  }

  function priceOf(line) {
    // Prefer full ranges like "9.5 / 15.95" or "7.95/13.95" so the cheap half
    // is not left stuck on the dish name. Allow "16 .95" OCR spacing.
    var m = String(line).match(
      /(?:£\s*)?(\d+\s*\.\s*\d{1,2}\s*\/\s*£?\s*\d+\s*\.\s*\d{1,2}|\d+\s*\.\s*\d{1,2})\s*$/
    );
    if (!m) return null;
    return {
      raw: m[0],
      value: m[1].replace(/£/g, '').replace(/\s*\.\s*/g, '.').replace(/\s+/g, ' ').replace(/\s*\/\s*/g, '/')
    };
  }

  /** Strip stray mid-line prices left on a name after a bad extract ("Caesar 9.5 /"). */
  function cleanDishName(name) {
    var n = String(name || '').trim();
    n = n.replace(/\s+\d+\s*\.\s*\d{1,2}\s*\/\s*$/g, '');
    n = n.replace(/\s+\d+\s*\.\s*\d{1,2}\s*$/g, '');
    n = n.replace(/\s{2,}/g, ' ').replace(/[\s,–-]+$/g, '').trim();
    return n;
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
      // Keep joining wrap lines (PDF often splits “served with…” across rows).
      if (price) {
        while (i + 1 < lines.length && !priceOf(lines[i + 1]) && !isHeading(lines[i + 1])) {
          var next = lines[i + 1];
          if (description && !looksLikeDescFragment(next) && /^[A-ZÀ-Ý]/.test(next)) break;
          description = description ? description + ' ' + next : next;
          i += 1;
          if (!looksLikeDescFragment(next) && description.indexOf(' ') !== -1) {
            // Took one normal desc line; still absorb further fragments.
            while (i + 1 < lines.length && !priceOf(lines[i + 1]) && !isHeading(lines[i + 1]) &&
              looksLikeDescFragment(lines[i + 1])) {
              description += ' ' + lines[i + 1];
              i += 1;
            }
            break;
          }
        }
      } else if (i + 1 < lines.length && !isHeading(lines[i + 1])) {
        // Title on its own line; price sits on the description line
        // ("Baked Camembert for Two" / "served with … 14.95").
        var nextPrice = priceOf(lines[i + 1]);
        if (nextPrice) {
          var nextRaw = lines[i + 1].slice(0, lines[i + 1].length - nextPrice.raw.length).trim();
          if (looksLikeDescFragment(nextRaw) || !nextRaw) {
            description = nextRaw;
            price = nextPrice;
            i += 1;
            while (i + 1 < lines.length && !priceOf(lines[i + 1]) && !isHeading(lines[i + 1]) &&
              looksLikeDescFragment(lines[i + 1])) {
              description = description ? description + ' ' + lines[i + 1] : lines[i + 1];
              i += 1;
            }
          }
        }
      }
      if (!pulled.name) continue;
      pulled.name = cleanDishName(pulled.name);
      if (!pulled.name) continue;
      if (typeof isJunkDishName === 'function' && isJunkDishName(pulled.name)) continue;
      var guessed = guessSection(section, pulled.name, description);
      dishes.push({
        id: slug(guessed + '-' + pulled.name + '-' + dishes.length),
        section: guessed,
        name: pulled.name,
        description: description,
        price: price ? price.value : '',
        tags: pulled.tags,
        lunchClub: lunch
      });
    }
    return sortDishesBySection(tidyOrphanDescriptions(dishes));
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
      var name = cleanDishName(String(d.name || '').trim());
      if (!name || isJunkDishName(name)) return;
      var section = guessSection(d.section || 'Dishes', name, d.description || '');
      var price = String(d.price || '').trim();
      // If AI left "9.5 / 15.95" split across name + price, reunite.
      var dangling = String(d.name || '').match(/(\d+\.\d{1,2})\s*\/\s*$/);
      if (dangling && price && !/\//.test(price)) {
        price = dangling[1] + '/' + price.replace(/^£/, '');
      }
      list.push({
        id: slug(section + '-' + name + '-' + i),
        section: section,
        name: name,
        description: d.description || '',
        price: price,
        tags: normalizeAiTags(d.tags || ''),
        lunchClub: false
      });
    });
    list = tidyOrphanDescriptions(list);
    return {
      dishes: sortDishesBySection(list),
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
    var s = String(dateStr || '').trim();
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    return null;
  }

  /** Store dates as YYYY-MM-DD; show staff DD-MM-YYYY. */
  function toIsoDate(dateStr) {
    var dt = parsePromoDate(dateStr);
    if (!dt || isNaN(dt.getTime())) {
      var bare = String(dateStr || '').trim();
      return /^\d{4}-\d{2}-\d{2}$/.test(bare) ? bare : '';
    }
    var y = dt.getFullYear();
    var mo = String(dt.getMonth() + 1);
    var d = String(dt.getDate());
    if (mo.length < 2) mo = '0' + mo;
    if (d.length < 2) d = '0' + d;
    return y + '-' + mo + '-' + d;
  }

  function toUkDate(dateStr) {
    var iso = toIsoDate(dateStr);
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '-' + p[1] + '-' + p[0];
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

  /**
   * Per-section print layout rules.
   * width: 'full' | 'column' | 'both'
   *   full   — always full page width
   *   column — sits in a column (beside promo / another column section)
   *   both   — prefer column when a partner fits, otherwise full width
   * frame: scalloped “frilly” box around the section
   */
  var DEFAULT_SECTION_LAYOUT = {
    Nibbles: { width: 'column', frame: true },
    Starters: { width: 'full', frame: false },
    'Sharing Plates': { width: 'full', frame: false },
    'Item Boost': { width: 'full', frame: true },
    'Pub Classics': { width: 'column', frame: false },
    Burgers: { width: 'column', frame: false },
    Mains: { width: 'full', frame: false },
    Sandwiches: { width: 'column', frame: true },
    Sides: { width: 'column', frame: false },
    Sauces: { width: 'column', frame: false },
    Desserts: { width: 'full', frame: false }
  };

  var WIDTH_OPTIONS = [
    { id: 'full', label: 'Full width' },
    { id: 'column', label: 'Column' },
    { id: 'both', label: 'Both (column if it fits)' }
  ];

  function defaultSectionLayout() {
    var out = {};
    SECTIONS.forEach(function (s) {
      var d = DEFAULT_SECTION_LAYOUT[s] || { width: 'full', frame: false };
      out[s] = { width: d.width, frame: !!d.frame };
    });
    return out;
  }

  function normalizeSectionLayout(raw) {
    var base = defaultSectionLayout();
    if (!raw || typeof raw !== 'object') return base;
    SECTIONS.forEach(function (s) {
      var row = raw[s];
      if (!row || typeof row !== 'object') return;
      var width = String(row.width || base[s].width).toLowerCase();
      if (width !== 'full' && width !== 'column' && width !== 'both') width = base[s].width;
      base[s] = {
        width: width,
        frame: row.frame === true || row.frame === 'yes' || row.frame === 1
      };
    });
    return base;
  }

  function sectionLayoutFor(name, layouts) {
    var canon = normalizeSectionName(name);
    var map = normalizeSectionLayout(layouts);
    if (map[canon]) return map[canon];
    // Unknown sections: full, no frame
    return { width: 'full', frame: false };
  }

  function isColumnWidth(width) {
    return width === 'column' || width === 'both';
  }

  function isFullWidth(width) {
    return width === 'full' || width === 'both';
  }

  root.EBMenus = {
    MENUS: MENUS,
    SECTIONS: SECTIONS,
    WIDTH_OPTIONS: WIDTH_OPTIONS,
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
    formatPromoDate: formatPromoDate,
    toIsoDate: toIsoDate,
    toUkDate: toUkDate,
    parsePromoDate: parsePromoDate,
    sectionOptions: sectionOptions,
    guessSection: guessSection,
    normalizeSectionName: normalizeSectionName,
    assignSections: assignSections,
    sortDishesBySection: sortDishesBySection,
    sectionRank: sectionRank,
    defaultSectionLayout: defaultSectionLayout,
    normalizeSectionLayout: normalizeSectionLayout,
    sectionLayoutFor: sectionLayoutFor,
    isColumnWidth: isColumnWidth,
    isFullWidth: isFullWidth,
    cleanDishName: cleanDishName,
    priceOf: priceOf,
    looksLikeDescFragment: looksLikeDescFragment,
    shouldMergeOntoPrevious: shouldMergeOntoPrevious,
    mergeDishOnto: mergeDishOnto,
    mergeDishWithPrevious: mergeDishWithPrevious,
    tidyOrphanDescriptions: tidyOrphanDescriptions
  };
})(typeof window !== 'undefined' ? window : global);
