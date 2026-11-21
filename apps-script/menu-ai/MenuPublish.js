/**
 * Eight Bells — map a Menu AI sheet onto the website publish contract.
 *
 * Pure data. No network and no secrets. Loaded by the Menus page
 * (owner.kinfoldinns.co.uk) and by the Menu AI Apps Script project
 * (same file, via clasp). Apps Script adds the PDF and the bearer token.
 *
 * Website `menu` id (POST /api/menus/publish):
 *
 *   Menu AI tab id          Menu AI name           website id
 *   main                    Main menu              main
 *   sunday                  Sunday                 sunday
 *   desserts                Desserts               desserts
 *   little-bells            Little Bells           little-bells
 *   specials                Specials               specials
 *   breakfast               Breakfast              breakfast
 *     (Breakfast is a custom card tab — id is the slug of the name.)
 *
 * Section titles stay on dishes[].section. They are not rewritten to
 * website ids. Saving Main with Desserts ticked publishes menu "main"
 * and includes a section "Desserts". Saving the Desserts card publishes
 * menu "desserts". Same for Little Bells, Specials, Breakfast, Sunday.
 *
 *   Section on a sheet                         own website menu?
 *   Nibbles, Starters, Sharing Plates,
 *   Item Boost, Pub Classics, Burgers, Mains,
 *   Sides, Sauces, Sandwiches, Sunday Roasts   no — dishes[].section only
 *   Desserts                                   desserts (Desserts card only)
 *   Little Bells                               little-bells (that card only)
 *   Special Starters / Special Mains /
 *   Special Desserts                           specials (Specials card only)
 *   Breakfast                                  breakfast (Breakfast card only)
 *
 * Never offered a tick, never POSTed:
 *   Party / Christmas (id party, kind party, name contains christmas or xmas)
 *   Buffets (id or name contains buffet) — there is no built-in buffet tab
 *   Main (upcoming) / id main-next — draft, not the live Main
 *   Sandwiches, Lunch club, and any other custom tab
 *
 * highlights is optional and omitted when empty. Menu AI has no highlight
 * field; promos are not sent as highlights.
 */
(function (root) {
  'use strict';

  var WEBSITE_MENU_BY_ID = {
    main: 'main',
    sunday: 'sunday',
    desserts: 'desserts',
    'little-bells': 'little-bells',
    specials: 'specials',
    breakfast: 'breakfast'
  };

  /** Exact tab label after lowercasing and collapsing punctuation. */
  var WEBSITE_MENU_BY_NAME = {
    'main menu': 'main',
    'main': 'main',
    'sunday': 'sunday',
    'desserts': 'desserts',
    'dessert': 'desserts',
    'little bells': 'little-bells',
    'little bells (kids)': 'little-bells',
    'specials': 'specials',
    'breakfast': 'breakfast'
  };

  /**
   * Section title → website menu, when that section is the saved card.
   * Empty string means the section is not its own website menu.
   * Publish itself uses the menu tab (websiteMenuId), not this map,
   * so a Desserts block on Main does not also publish "desserts".
   */
  var SECTION_TO_MENU = {
    'desserts': 'desserts',
    'dessert': 'desserts',
    'little bells': 'little-bells',
    'little bells (kids)': 'little-bells',
    'breakfast': 'breakfast',
    'specials': 'specials',
    'special starters': 'specials',
    'special starter': 'specials',
    'special mains': 'specials',
    'special main': 'specials',
    'special desserts': 'specials',
    'special dessert': 'specials'
  };

  var DEFAULT_ORIGIN = 'https://www.eightbellsbolney.com';

  function norm_(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function asMenu_(menu) {
    if (menu == null) return { id: '', name: '', kind: '' };
    if (typeof menu === 'string') return { id: menu, name: '', kind: '' };
    return {
      id: menu.id != null ? String(menu.id) : '',
      name: menu.name != null ? String(menu.name) : '',
      kind: menu.kind != null ? String(menu.kind) : ''
    };
  }

  function neverPublish_(menu) {
    var id = String(menu.id || '').toLowerCase();
    var name = norm_(menu.name);
    var kind = String(menu.kind || '').toLowerCase();
    if (kind === 'party') return true;
    if (id === 'party' || id === 'christmas' || id === 'buffet') return true;
    if (name === 'party' || name === 'party christmas') return true;
    if (/christmas|xmas|buffet/.test(id)) return true;
    if (/christmas|xmas|buffet/.test(name)) return true;
    return false;
  }

  /**
   * Website menu id for this saved sheet, or '' when it must not publish.
   * @param {string|{id:string,name:string,kind:string}} menu
   * @return {string}
   */
  function websiteMenuId(menu) {
    menu = asMenu_(menu);
    if (neverPublish_(menu)) return '';
    var id = String(menu.id || '').toLowerCase();
    if (WEBSITE_MENU_BY_ID[id]) return WEBSITE_MENU_BY_ID[id];
    var name = norm_(menu.name);
    if (name && WEBSITE_MENU_BY_NAME[name]) return WEBSITE_MENU_BY_NAME[name];
    return '';
  }

  /** True when the Save step shows “Publish to website” (ticked by default). */
  function offersWebsitePublish(menu) {
    return !!websiteMenuId(menu);
  }

  /**
   * Which website menu a section corresponds to, or '' if it only
   * travels as dishes[].section on whatever sheet was saved.
   */
  function sectionToMenu(section) {
    var key = norm_(section);
    if (!key || key === 'sunday roasts' || key === 'sandwiches' || key === 'mains') return '';
    return SECTION_TO_MENU[key] || '';
  }

  /**
   * Dietary tags as the website expects: string[].
   * Staff store one string from the tick boxes (“gf, v option”, “vg & gf”).
   */
  function tagsToList(tags) {
    if (Array.isArray(tags)) {
      return tags.map(function (t) { return String(t || '').trim(); }).filter(Boolean);
    }
    var s = String(tags || '').replace(/\s+/g, ' ').trim();
    if (!s) return [];
    var withOpt = s.match(/^(.*?)\s+with\s+(.+\soption)$/i);
    if (withOpt) {
      return tagsToList(withOpt[1]).concat(tagsToList(withOpt[2]));
    }
    var out = [];
    s.split(/\s*,\s*/).forEach(function (part) {
      part = String(part || '').trim();
      if (!part) return;
      var amp = part.match(/^(gf|vg|df|v)\s*(?:&|\/)\s*(gf|vg|df|v)(\s+option)?$/i);
      if (amp) {
        out.push(String(amp[1]).toLowerCase());
        out.push((String(amp[2]).toLowerCase() + (amp[3] ? ' option' : '')).trim());
        return;
      }
      out.push(part);
    });
    return out;
  }

  function dishesForPublish(list) {
    if (!Array.isArray(list)) return [];
    var out = [];
    list.forEach(function (d) {
      if (!d) return;
      var name = String(d.name || '').trim();
      if (!name) return;
      out.push({
        section: String(d.section || '').trim(),
        name: name,
        description: String(d.description || '').trim(),
        price: d.price == null ? '' : String(d.price).trim(),
        tags: tagsToList(d.tags)
      });
    });
    return out;
  }

  function highlightsForPublish(list) {
    if (!Array.isArray(list)) return [];
    var out = [];
    list.forEach(function (h) {
      if (!h) return;
      var name = String(h.name || h.title || '').trim();
      if (!name) return;
      out.push({
        name: name,
        description: String(h.description || h.body || '').trim()
      });
    });
    return out;
  }

  /**
   * Origin or full publish URL → https endpoint.
   * Empty string when the value is not https (do not send the bearer token).
   * MENU_PUBLISH_URL defaults to https://www.eightbellsbolney.com.
   */
  function publishEndpoint(base) {
    var url = String(base || '').trim() || DEFAULT_ORIGIN;
    url = url.replace(/\/+$/, '');
    if (!/^https:\/\//i.test(url)) return '';
    if (/\/api\/menus\/publish$/i.test(url)) return url;
    return url + '/api/menus/publish';
  }

  /**
   * Contract body, or null when this menu must not publish.
   * pdfBase64 may be '' here; Apps Script fills it from the Email PDF path.
   */
  function buildPublishBody(input) {
    input = input || {};
    var menu = asMenu_(input.menu || {
      id: input.menuId,
      name: input.menuName || input.title,
      kind: input.menuKind || input.kind
    });
    var websiteId = websiteMenuId(menu);
    if (!websiteId) return null;
    var savedAt = input.savedAt;
    if (savedAt instanceof Date) savedAt = savedAt.toISOString();
    savedAt = String(savedAt || '').trim();
    if (!savedAt) {
      var ms = Number(input.generatedAt || input.savedAtMs || 0);
      if (ms) {
        try { savedAt = new Date(ms).toISOString(); } catch (eDt) { savedAt = ''; }
      }
    }
    var title = String(input.title || menu.name || '').trim() || websiteId;
    var body = {
      menu: websiteId,
      title: title,
      version: String(input.version || input.roman || '').trim(),
      savedAt: savedAt,
      dishes: dishesForPublish(input.dishes),
      pdfBase64: input.pdfBase64 == null ? '' : String(input.pdfBase64)
    };
    var highlights = highlightsForPublish(input.highlights);
    if (highlights.length) body.highlights = highlights;
    return body;
  }

  var api = {
    DEFAULT_ORIGIN: DEFAULT_ORIGIN,
    WEBSITE_MENU_BY_ID: WEBSITE_MENU_BY_ID,
    websiteMenuId: websiteMenuId,
    offersWebsitePublish: offersWebsitePublish,
    sectionToMenu: sectionToMenu,
    tagsToList: tagsToList,
    dishesForPublish: dishesForPublish,
    highlightsForPublish: highlightsForPublish,
    publishEndpoint: publishEndpoint,
    buildPublishBody: buildPublishBody
  };

  root.EBMenusPublish = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
