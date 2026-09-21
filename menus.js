/* Eight Bells staff menus.
   The public website PDFs are unchanged. This is the list staff edit,
   and the sheet rule they see before anything is printed. */
(function (root) {
  'use strict';

  var MENUS = [
    { id: 'main', name: 'Main menu', kind: 'long' },
    { id: 'sunday', name: 'Sunday', kind: 'long' },
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
        dish('Starters', 'Beef Ragu Arancini', 'tomato, red onion salsa, manchego cheese', '8.25', 'gf with vg option', true),
        dish('Starters', 'Game Terrine', 'warm crusty bread, cornichons, red onion jam', '8.50', 'gf option'),
        dish('Starters', 'Nduja King Prawn Bruschetta', 'tomato salsa, toasted ciabatta', '8.95', 'gf option', true),
        dish('Mains', 'Crab Linguine', 'lemon, chilli, pangrattato, vine cherry tomatoes, balsamic', '18.95', 'gf option'),
        dish('Mains', 'Venison Casserole', 'cheese and herb dumpling, purple sprouting broccoli', '18.95', 'gf option'),
        dish('Sides', 'Skinny Fries/Chunky Chips', 'add cheese +£1', '4.50', 'gf')
      ],
      sunday: [
        dish('Nibbles', 'Bread and Salted Butter', '', '5.95', ''),
        dish('Sunday roasts', 'Sirloin of Beef', 'cooked pink', '21.95', ''),
        dish('Sunday roasts', 'Pork Loin', 'crackling and apple sauce', '19.95', ''),
        dish('Mains', 'Wild Mushroom Gnocchi', 'truffle, parmesan, beer', '17.95', ''),
        dish('Desserts', 'Sticky Toffee Pudding', 'brandy snap, clotted cream ice cream, toffee sauce', '7.95', 'v', true)
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
    if (count <= 16) return { fit: 'one', text: 'Fits on one A4 page.' };
    if (count <= 34) return { fit: 'two', text: 'Runs to two A4 pages. The type stays the same size.' };
    return {
      fit: 'over',
      text: 'Too full for two pages. Take dishes off. A promo does not open another page.'
    };
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

  root.EBMenus = {
    MENUS: MENUS,
    seed: seed,
    menuById: menuById,
    parsePaste: parsePaste,
    sheetPlan: sheetPlan,
    lunchClubFromTicks: lunchClubFromTicks,
    dish: dish
  };
})(typeof window !== 'undefined' ? window : global);
