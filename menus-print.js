/* Branded print sheet for Eight Bells menus — logo, wavy frames, green marks. */
(function (root) {
  'use strict';

  var GREEN = '#538135';
  var INK = '#1f1812';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function logoUrl() {
    try {
      return new URL('images/eight-bells-logo.png', window.location.href).href;
    } catch (e) {
      return 'images/eight-bells-logo.png';
    }
  }

  function scallopPath() {
    // Unit box 0..100 with sine scallops — stretched by preserveAspectRatio=none
    var amp = 1.15;
    var step = 2.2;
    var pts = [];
    function edge(x0, y0, x1, y1, nx, ny) {
      var len = Math.hypot(x1 - x0, y1 - y0);
      var n = Math.max(2, Math.round(len / step));
      for (var i = 0; i <= n; i++) {
        var t = i / n;
        var x = x0 + (x1 - x0) * t;
        var y = y0 + (y1 - y0) * t;
        var off = amp * Math.sin(t * Math.PI * (len / 7));
        pts.push((x + nx * off).toFixed(2) + ' ' + (y + ny * off).toFixed(2));
      }
    }
    var m = 3;
    edge(m, m, 100 - m, m, 0, -1);
    edge(100 - m, m, 100 - m, 100 - m, 1, 0);
    edge(100 - m, 100 - m, m, 100 - m, 0, 1);
    edge(m, 100 - m, m, m, -1, 0);
    return 'M ' + pts.join(' L ') + ' Z';
  }

  function wavyFrame(inner) {
    return (
      '<div class="wavy">' +
        '<svg class="wavy-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">' +
          '<path d="' + scallopPath() + '" fill="none" stroke="' + INK + '" stroke-width="0.7" vector-effect="non-scaling-stroke"/>' +
        '</svg>' +
        '<div class="wavy-inner">' + inner + '</div>' +
      '</div>'
    );
  }

  function lunchMark() {
    return (
      '<svg class="lc" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path fill="currentColor" d="M7.2 4.2h1.4v6.2H7.2zm2.6 0h1.4v6.2h-1.4zm2.6 0h1.4v6.2h-1.4zM8.4 11.2h5.2c.4 1.2-.2 2.4-1.4 2.9V20H9.8v-5.9c-1-.5-1.6-1.6-1.4-2.9z" transform="rotate(-32 12 12)"/>' +
        '<path fill="currentColor" d="M11 3.5l1.1 8.4 1.5-.2L12.6 3.5zM10.4 12h3l.4 1.3c.2.7-.2 1.4-.9 1.6V20h-1.5v-5.1c-.7-.3-1.1-1-.9-1.7z" transform="rotate(34 12 12)"/>' +
      '</svg>'
    );
  }

  function allergy() {
    return (
      '<div class="allergy">' +
        'Please inform us of any allergies or dietary needs, we prepare all food in the same kitchen and can’t guarantee it’s allergen-free.<br>' +
        'gf – gluten free &nbsp; v – vegetarian &nbsp; vg – vegan' +
      '</div>'
    );
  }

  function dishBlock(d, opts) {
    opts = opts || {};
    var showPrice = !opts.hidePrice;
    var html = '<div class="dish">';
    html += '<div class="dish-name">';
    if (d.lunchClub && !opts.hideLunch) html += lunchMark();
    html += esc(d.name);
    if (showPrice && d.price) html += ' <span class="price">' + esc(d.price) + '</span>';
    html += '</div>';
    if (d.description) html += '<div class="dish-desc">' + esc(d.description) + '</div>';
    if (d.tags) html += '<div class="dish-tags">' + esc(d.tags) + '</div>';
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

  function cardFace(title, dishes, extras) {
    extras = extras || {};
    var body = '';
    if (extras.beforeBox) body += extras.beforeBox;
    var boxed = dishes.map(function (d) {
      return dishBlock(d, { hidePrice: !!extras.hidePriceInBox, hideLunch: extras.hideLunch });
    }).join('');
    if (!extras.skipDishBox) {
      body += wavyFrame(boxed || '<div class="dish-desc">No dishes yet</div>');
    } else {
      body += boxed;
    }
    if (extras.afterBox) body += extras.afterBox;
    body += allergy();
    var heading = extras.hideTitle ? '' : '<h1>' + esc(title) + '</h1>';
    return (
      '<article class="card-face">' +
        '<img class="logo" src="' + esc(logoUrl()) + '" alt="The Eight Bells">' +
        heading +
        body +
      '</article>'
    );
  }

  function longPage(menuName, dishes, plan, opts) {
    opts = opts || {};
    var sections = groupBySection(dishes);
    var nibbles = null;
    var rest = [];
    sections.forEach(function (s) {
      if (/^nibbles$/i.test(s.name)) nibbles = s;
      else rest.push(s);
    });

    var html = '<div class="long-page">';
    html += '<div class="long-top"><img class="logo logo-tr" src="' + esc(logoUrl()) + '" alt="The Eight Bells"></div>';

    if (nibbles) {
      html += wavyFrame(
        '<div class="sec-title">' + esc(nibbles.name) + '</div>' +
        nibbles.dishes.map(function (d) { return dishBlock(d); }).join('')
      );
    }

    rest.forEach(function (s, idx) {
      var block =
        '<div class="sec-title">' + esc(s.name) + '</div>' +
        s.dishes.map(function (d) { return dishBlock(d); }).join('');
      // Squiggly promo-style box for sandwiches section when pulled in, or last short section
      if (/sandwich/i.test(s.name)) html += wavyFrame(block);
      else html += '<section class="sec">' + block + '</section>';
    });

    if (opts.showFillers && plan && (plan.fit === 'one' || dishes.length <= 14)) {
      html += wavyFrame(
        '<div class="promo"><strong>Stay a While</strong><p>we’ve got a handful of cosy en-suite rooms if you’d like to settle in for the night.</p>' +
        '<strong>Gatherings</strong><p>whether it’s a quiet supper or a special get together, we’re always happy to host your event</p></div>'
      );
    }

    if (opts.showLunchClubBox) {
      html += wavyFrame(
        '<div class="lunch-note">' + lunchMark() +
        '<div><strong>Smaller options for smaller appetites</strong><br>Lunch club Mon–Thurs</div></div>'
      );
    }

    html += allergy();
    html += '</div>';
    return html;
  }

  function littleBellsExtras(dishes) {
    return {
      afterBox:
        '<div class="lb-foot">' +
          '<div class="lb-ice">Two Scoops of Ice-Cream</div>' +
          '<div class="dish-desc">Salted Caramel, Chocolate, Strawberry, Vanilla or Mint Choc Chip</div>' +
          '<div class="lb-price">£9.50</div>' +
          '<div class="dish-desc">Little Bells on Sunday have a choice of roasts at half price of the adults in addition to above options</div>' +
        '</div>',
      hidePriceInBox: true,
      hideLunch: true
    };
  }

  function lunchClubExtras(dishes) {
    var sections = groupBySection(dishes);
    var middle = sections.map(function (s) {
      return (
        '<div class="sec-title" style="text-align:center;text-decoration:underline;text-underline-offset:3px">' + esc(s.name) + '</div>' +
        s.dishes.map(function (d) {
          return dishBlock(d, { hidePrice: true, hideLunch: true });
        }).join('')
      );
    }).join('');
    return {
      hideTitle: true,
      skipDishBox: true,
      hidePriceInBox: true,
      hideLunch: true,
      beforeBox:
        '<div class="days">MON<br>TUES<br>WED<br>THURS</div>' +
        '<div class="lc-title">Bells<br>Lunch Club</div>' +
        wavyFrame('<div class="lc-price">two courses £14.95<br>three courses £17.95</div>') +
        '<div style="margin-top:8px">' + middle + '</div>'
    };
  }

  function css(kind) {
    var landscape = kind === 'card';
    return (
      '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Source+Sans+3:ital,wght@0,300;0,400;1,400&display=swap");' +
      ':root{--ink:' + INK + ';--green:' + GREEN + ';--serif:"Cinzel",Georgia,serif;--sans:"Source Sans 3",sans-serif}' +
      '*{box-sizing:border-box}' +
      'body{margin:0;background:#e8e4dc;color:var(--ink);font-family:var(--sans)}' +
      '.toolbar{position:sticky;top:0;z-index:5;background:#1f1812;color:#f4eae3;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
      '.toolbar button{font:600 13px var(--sans);padding:8px 14px;border-radius:999px;border:0;cursor:pointer;background:#f4eae3;color:#1f1812}' +
      '.toolbar .hint{font-size:13px;opacity:.85}' +
      '.sheet{background:#fff;margin:16px auto;box-shadow:0 8px 30px rgba(0,0,0,.12)}' +
      (landscape
        ? '.sheet{width:297mm;min-height:210mm}.sheet-inner{display:grid;grid-template-columns:1fr 1fr;min-height:210mm}'
        : '.sheet{width:210mm;min-height:297mm;padding:12mm 14mm 14mm}') +
      '.card-face{padding:10mm 9mm 8mm;border-right:1px dashed #cfc7bb;position:relative}' +
      '.card-face:last-child{border-right:0}' +
      '.logo{display:block;width:58px;height:auto;margin:0 auto 6px}' +
      '.logo-tr{width:78px;margin:0 0 8px auto}' +
      'h1{font-family:var(--serif);font-weight:700;font-size:18px;letter-spacing:.04em;text-align:center;text-transform:uppercase;margin:0 0 10px}' +
      '.wavy{position:relative;margin:0 0 10px;padding:2px}' +
      '.wavy-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
      '.wavy-inner{position:relative;padding:12px 14px 10px}' +
      '.sec{margin:0 0 12px}' +
      '.sec-title{font-family:var(--serif);font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 8px}' +
      '.dish{margin:0 0 9px;text-align:center}' +
      '.long-page .dish{text-align:left}' +
      '.dish-name{font-family:var(--serif);font-weight:700;font-size:12.5px;letter-spacing:.02em}' +
      '.price{font-weight:500;margin-left:4px}' +
      '.dish-desc{font-weight:300;font-size:11px;margin-top:2px}' +
      '.dish-tags{color:var(--green);font-style:italic;font-size:11px;margin-top:1px}' +
      '.allergy{color:var(--green);font-style:italic;font-size:10px;text-align:center;line-height:1.35;margin-top:8px}' +
      '.lc{width:14px;height:14px;vertical-align:-2px;margin-right:3px}' +
      '.promo strong{font-family:var(--serif);display:block;margin-top:6px}' +
      '.promo p{font-size:11px;font-weight:300;margin:2px 0 0}' +
      '.lunch-note{display:flex;gap:10px;align-items:center;font-size:12px}' +
      '.lunch-note .lc{width:22px;height:22px}' +
      '.lb-foot,.lc-price{text-align:center;margin-top:8px}' +
      '.lb-ice{font-family:var(--serif);font-weight:700;font-size:13px}' +
      '.lb-price{font-family:var(--serif);font-weight:700;font-size:16px;margin:6px 0}' +
      '.days{position:absolute;top:10mm;left:7mm;font-family:var(--serif);font-size:9px;font-weight:700;line-height:1.35;letter-spacing:.06em}' +
      '.lc-title{font-family:var(--serif);font-weight:700;font-size:18px;text-align:center;line-height:1.15;margin:4px 0 8px}' +
      '.lc-price{font-family:var(--serif);font-size:12px;line-height:1.45}' +
      '@media print{body{background:#fff}.toolbar{display:none}.sheet{margin:0;box-shadow:none}' +
      (landscape
        ? '@page{size:A4 landscape;margin:0}'
        : '@page{size:A4 portrait;margin:0}') +
      '}'
    );
  }

  function build(menu, dishes, plan) {
    var kind = menu.kind === 'card' ? 'card' : 'long';
    var title = menu.name;
    var body;

    if (kind === 'card') {
      var extras = {};
      if (menu.id === 'little-bells') extras = littleBellsExtras(dishes);
      if (menu.id === 'lunch-club') extras = lunchClubExtras(dishes);
      if (menu.id === 'sandwiches') {
        extras.afterBox =
          '<div class="dish-desc" style="text-align:center;margin-top:8px">Served on either Ciabatta vg, Farmhouse White or Granary<br>All served with Fries and Salad</div>';
      }
      var face = cardFace(title.replace(/ menu$/i, ''), dishes, extras);
      body = '<div class="sheet"><div class="sheet-inner">' + face + face + '</div></div>';
    } else {
      var ticks = dishes.some(function (d) { return d.lunchClub; });
      body =
        '<div class="sheet">' +
        longPage(title, dishes, plan, {
          showFillers: true,
          showLunchClubBox: ticks || menu.id === 'main'
        }) +
        '</div>';
    }

    return (
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(title) + ' — The Eight Bells</title>' +
      '<style>' + css(kind) + '</style></head><body>' +
      '<div class="toolbar">' +
        '<button onclick="window.print()">Print / save as PDF</button>' +
        '<span class="hint">' + esc(plan && plan.text ? plan.text : '') + ' · Branding matches the original menus (logo, wavy frames, green marks).</span>' +
      '</div>' +
      body +
      '</body></html>'
    );
  }

  root.EBMenuPrint = { build: build };
})(typeof window !== 'undefined' ? window : global);
