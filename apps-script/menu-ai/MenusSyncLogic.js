/**
 * Menu AI shared-state helpers (pure — no Drive / Properties / network).
 * Used by Code.gs at runtime and by Node tests via require().
 *
 * Goals:
 * - Per-menu saves with version conflict checks
 * - Reject seed / near-empty Main overwriting a full Main
 * - Coerce Little Bells print-history menuId mismatches
 */
(function (root) {
  'use strict';

  var SEED_STEAK_RE = /10oz\s+Sirloin\s+Steak/i;
  var NEAR_EMPTY_MAX = 2;
  var FULL_MENU_MIN = 8;
  var MENUS_BACKUP_SLOTS = 5;

  function dishCount_(list) {
    return Array.isArray(list) ? list.length : 0;
  }

  /** True when a Main payload is empty, tiny, or the known seed-steak incident shape. */
  function isNearEmptyOrSeedMain(dishes) {
    var n = dishCount_(dishes);
    if (n <= 0) return true;
    if (n <= NEAR_EMPTY_MAX) return true;
    // Incident: Main contained only the sample seed dish "10oz Sirloin Steak"
    // (sometimes with one or two leftover seed nibbles).
    if (n <= 3) {
      var hasSteak = false;
      var onlySeedish = true;
      for (var i = 0; i < n; i++) {
        var name = String((dishes[i] && dishes[i].name) || '');
        if (SEED_STEAK_RE.test(name)) hasSteak = true;
        else if (!/Bread and Salted Butter/i.test(name) &&
                 !/Marinated Olives/i.test(name)) {
          onlySeedish = false;
        }
      }
      if (hasSteak && onlySeedish) return true;
    }
    return false;
  }

  /**
   * Reject replacing a full Main with a near-empty / seed book.
   * @return {{reject:boolean, reason?:string}}
   */
  function seedGuardMain(existingDishes, incomingDishes) {
    var existN = dishCount_(existingDishes);
    if (existN < FULL_MENU_MIN) return { reject: false };
    if (!isNearEmptyOrSeedMain(incomingDishes)) return { reject: false };
    return {
      reject: true,
      reason: 'Refusing to replace a full Main (' + existN +
        ' dishes) with a near-empty or seed Main (' + dishCount_(incomingDishes) + ' dishes).'
    };
  }

  function ensureMenuVersions_(state) {
    state = state && typeof state === 'object' ? state : {};
    var versions = state.menuVersions && typeof state.menuVersions === 'object'
      ? state.menuVersions
      : {};
    var book = state.book && typeof state.book === 'object' ? state.book : {};
    Object.keys(book).forEach(function (id) {
      var v = Number(versions[id]);
      if (!v || v < 1) versions[id] = 1;
      else versions[id] = Math.floor(v);
    });
    state.menuVersions = versions;
    return state;
  }

  function cloneJson_(value) {
    try {
      return JSON.parse(JSON.stringify(value == null ? null : value));
    } catch (e) {
      return value;
    }
  }

  /**
   * Apply one menu save onto the shared book.
   * @param {object|null} current full MENUS state (or null if empty)
   * @param {object} patch { menuId, expectedVersion, dishes, meta, includes, promoTicks,
   *   sectionLayout, promoBank?, promoDeck?, dishCatalogue?, extraMenus?, extraSections? }
   * @return {{ok:boolean, conflict?:boolean, rejected?:boolean, error?:string,
   *   state?:object, version?:number, updatedAt?:number}}
   */
  function applyMenuSave(current, patch) {
    patch = patch && typeof patch === 'object' ? patch : {};
    var menuId = String(patch.menuId || '').trim();
    if (!menuId) {
      return { ok: false, error: 'Missing menuId' };
    }
    if (!Array.isArray(patch.dishes)) {
      return { ok: false, error: 'Missing dishes array for menu ' + menuId };
    }

    var state = ensureMenuVersions_(cloneJson_(current) || {
      updatedAt: 0,
      book: {},
      metaBook: {},
      includes: {},
      promoBank: [],
      promoTicks: {},
      promoDeck: { order: [], used: [] },
      sectionLayout: {},
      dishCatalogue: [],
      extraMenus: [],
      extraSections: [],
      menuVersions: {}
    });
    if (!state.book || typeof state.book !== 'object') state.book = {};
    if (!state.metaBook || typeof state.metaBook !== 'object') state.metaBook = {};
    if (!state.includes || typeof state.includes !== 'object') state.includes = {};
    if (!state.promoTicks || typeof state.promoTicks !== 'object') state.promoTicks = {};
    if (!state.sectionLayout || typeof state.sectionLayout !== 'object') state.sectionLayout = {};
    if (!state.menuVersions || typeof state.menuVersions !== 'object') state.menuVersions = {};

    var currentVersion = Number(state.menuVersions[menuId]) || 0;
    var expected = patch.expectedVersion;
    // First save after upgrade: client may send 0 / undefined while server has 0 or 1.
    if (expected == null || expected === '') expected = 0;
    expected = Number(expected) || 0;

    if (currentVersion > 0 && expected !== currentVersion) {
      return {
        ok: false,
        conflict: true,
        error: 'stale_menu_version',
        message: 'A newer version of this menu exists on the server. Reload and try again.',
        state: state,
        version: currentVersion,
        updatedAt: Number(state.updatedAt) || 0,
        menuVersions: state.menuVersions
      };
    }

    if (menuId === 'main') {
      var guard = seedGuardMain(state.book.main, patch.dishes);
      if (guard.reject) {
        return {
          ok: false,
          rejected: true,
          error: 'seed_or_empty_main',
          message: guard.reason,
          state: state,
          version: currentVersion,
          updatedAt: Number(state.updatedAt) || 0,
          menuVersions: state.menuVersions
        };
      }
    }

    state.book[menuId] = cloneJson_(patch.dishes);
    if (patch.meta && typeof patch.meta === 'object') {
      state.metaBook[menuId] = cloneJson_(patch.meta);
    }
    if (patch.includes && typeof patch.includes === 'object') {
      state.includes[menuId] = cloneJson_(patch.includes);
    }
    if (patch.promoTicks && typeof patch.promoTicks === 'object') {
      state.promoTicks[menuId] = cloneJson_(patch.promoTicks);
    }
    if (patch.sectionLayout && typeof patch.sectionLayout === 'object') {
      state.sectionLayout[menuId] = cloneJson_(patch.sectionLayout);
    }

    // Shared fields — last write of a deliberate save wins (not sync auto-push).
    if (Array.isArray(patch.promoBank)) state.promoBank = cloneJson_(patch.promoBank);
    if (patch.promoDeck && typeof patch.promoDeck === 'object') {
      state.promoDeck = cloneJson_(patch.promoDeck);
    }
    if (Array.isArray(patch.dishCatalogue)) {
      state.dishCatalogue = cloneJson_(patch.dishCatalogue);
    }
    if (Array.isArray(patch.extraMenus)) state.extraMenus = cloneJson_(patch.extraMenus);
    if (Array.isArray(patch.extraSections)) {
      state.extraSections = cloneJson_(patch.extraSections);
    }

    var nextVersion = (currentVersion || 0) + 1;
    state.menuVersions[menuId] = nextVersion;
    state.updatedAt = Date.now();

    return {
      ok: true,
      state: state,
      version: nextVersion,
      updatedAt: state.updatedAt,
      menuVersions: state.menuVersions,
      menuId: menuId
    };
  }

  /**
   * Whole-book save (legacy). Still seed-guards Main and bumps all touched versions.
   * Prefer applyMenuSave for normal edits.
   */
  function applyWholeBookSave(current, raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    if (!raw.book || typeof raw.book !== 'object') {
      return { ok: false, error: 'Missing state.book' };
    }
    var state = ensureMenuVersions_(cloneJson_(current) || {
      updatedAt: 0,
      book: {},
      metaBook: {},
      includes: {},
      promoBank: [],
      promoTicks: {},
      promoDeck: { order: [], used: [] },
      sectionLayout: {},
      dishCatalogue: [],
      extraMenus: [],
      extraSections: [],
      menuVersions: {}
    });

    var guard = seedGuardMain(state.book && state.book.main, raw.book.main);
    if (guard.reject) {
      return {
        ok: false,
        rejected: true,
        error: 'seed_or_empty_main',
        message: guard.reason,
        state: state
      };
    }

    // Optional whole-book expectedVersions map — any mismatch → conflict.
    var expectedMap = raw.expectedVersions && typeof raw.expectedVersions === 'object'
      ? raw.expectedVersions
      : null;
    if (expectedMap) {
      var ids = Object.keys(expectedMap);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var curV = Number(state.menuVersions[id]) || 0;
        var expV = Number(expectedMap[id]) || 0;
        if (curV > 0 && expV !== curV) {
          return {
            ok: false,
            conflict: true,
            error: 'stale_menu_version',
            message: 'A newer version of menu "' + id + '" exists on the server.',
            state: state,
            menuVersions: state.menuVersions
          };
        }
      }
    }

    state.book = cloneJson_(raw.book);
    state.metaBook = raw.metaBook && typeof raw.metaBook === 'object'
      ? cloneJson_(raw.metaBook) : (state.metaBook || {});
    state.includes = raw.includes && typeof raw.includes === 'object'
      ? cloneJson_(raw.includes) : (state.includes || {});
    state.promoBank = Array.isArray(raw.promoBank) ? cloneJson_(raw.promoBank) : (state.promoBank || []);
    state.promoTicks = raw.promoTicks && typeof raw.promoTicks === 'object'
      ? cloneJson_(raw.promoTicks) : (state.promoTicks || {});
    state.promoDeck = raw.promoDeck && typeof raw.promoDeck === 'object'
      ? cloneJson_(raw.promoDeck) : (state.promoDeck || { order: [], used: [] });
    state.sectionLayout = raw.sectionLayout && typeof raw.sectionLayout === 'object'
      ? cloneJson_(raw.sectionLayout) : (state.sectionLayout || {});
    state.dishCatalogue = Array.isArray(raw.dishCatalogue)
      ? cloneJson_(raw.dishCatalogue) : (state.dishCatalogue || []);
    state.extraMenus = Array.isArray(raw.extraMenus)
      ? cloneJson_(raw.extraMenus) : (state.extraMenus || []);
    state.extraSections = Array.isArray(raw.extraSections)
      ? cloneJson_(raw.extraSections) : (state.extraSections || []);

    Object.keys(state.book).forEach(function (id) {
      var v = Number(state.menuVersions[id]) || 0;
      state.menuVersions[id] = v + 1;
    });
    state.updatedAt = Number(raw.updatedAt) || Date.now();
    return {
      ok: true,
      state: state,
      updatedAt: state.updatedAt,
      menuVersions: state.menuVersions
    };
  }

  /**
   * Infer menu id from a print HTML <title> (index rebuild path).
   * Little Bells must not fall through to menuId "main".
   */
  function historyMetaFromHtmlTitle(id, html) {
    var title = '';
    var m = String(html || '').match(/<title>([^<]*)<\/title>/i);
    if (m) title = String(m[1] || '').trim();
    var roman = '';
    var rm = title.match(/—\s*([IVXLCDM]+)\s*$/);
    if (rm) roman = rm[1];
    var menuId = 'main';
    var menuName = 'Menu';
    if (/\bsunday\b/i.test(title)) {
      menuId = 'sunday';
      menuName = 'Sunday';
    } else if (/little\s*bells/i.test(title)) {
      menuId = 'little-bells';
      menuName = 'Little Bells';
    } else if (/dessert/i.test(title)) {
      menuId = 'desserts';
      menuName = 'Desserts';
    } else if (/special/i.test(title)) {
      menuId = 'specials';
      menuName = 'Specials';
    } else if (/sandwich/i.test(title)) {
      menuId = 'sandwiches';
      menuName = 'Sandwiches';
    } else if (/lunch\s*club/i.test(title)) {
      menuId = 'lunch-club';
      menuName = 'Lunch club';
    } else if (/party|christmas/i.test(title)) {
      menuId = 'party';
      menuName = 'Party / Christmas';
    } else if (/main\s*\(upcoming\)|upcoming/i.test(title)) {
      menuId = 'main-next';
      menuName = 'Main (upcoming)';
    } else if (/main/i.test(title)) {
      menuId = 'main';
      menuName = 'Main menu';
    } else if (title) {
      menuName = title.replace(/\s+—\s*[IVXLCDM]+\s*$/, '')
        .replace(/\s+(?:Wk|Sun)\b.*$/i, '').trim() || menuName;
      // Name-only fallback still coerces known menus.
      var coerced = coercePrintMenuId(menuId, menuName);
      menuId = coerced.menuId;
      menuName = coerced.menuName;
    }

    var week = '';
    var wm = title.match(/\b(Week of\s+\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]+(?:\s+\d{4})?)/i);
    if (wm) {
      week = wm[1].replace(/\s+/g, ' ').trim();
    } else {
      var sm = title.match(/\bSun(?:day)?\s+(\d{1,2}(?:st|nd|rd|th))\s+([A-Za-z]+)(?:\s+(\d{4}))?/i);
      if (sm) {
        week = 'Sunday ' + sm[1] + ' ' + sm[2] + (sm[3] ? ' ' + sm[3] : '');
      }
    }
    return {
      id: id,
      menuId: menuId,
      menuName: menuName,
      roman: roman,
      n: 0,
      week: week,
      weekKey: '',
      hideDate: false
    };
  }

  /**
   * Fix menuId/menuName mismatches (e.g. menuId "main" + menuName "Little Bells").
   */
  function coercePrintMenuId(menuId, menuName) {
    var id = String(menuId || 'main');
    var name = String(menuName || '');
    if (/little\s*bells/i.test(name) || id === 'little-bells') {
      return { menuId: 'little-bells', menuName: name || 'Little Bells' };
    }
    if (/^sunday$/i.test(name) || id === 'sunday') {
      if (id === 'main' && /^sunday$/i.test(name)) {
        return { menuId: 'sunday', menuName: 'Sunday' };
      }
    }
    if (/^desserts?$/i.test(name) && id === 'main') {
      return { menuId: 'desserts', menuName: 'Desserts' };
    }
    if (/^specials?$/i.test(name) && id === 'main') {
      return { menuId: 'specials', menuName: 'Specials' };
    }
    if (/^sandwiches?$/i.test(name) && id === 'main') {
      return { menuId: 'sandwiches', menuName: 'Sandwiches' };
    }
    return { menuId: id, menuName: name || id || 'Menu' };
  }

  var api = {
    SEED_STEAK_RE: SEED_STEAK_RE,
    NEAR_EMPTY_MAX: NEAR_EMPTY_MAX,
    FULL_MENU_MIN: FULL_MENU_MIN,
    MENUS_BACKUP_SLOTS: MENUS_BACKUP_SLOTS,
    isNearEmptyOrSeedMain: isNearEmptyOrSeedMain,
    seedGuardMain: seedGuardMain,
    ensureMenuVersions: ensureMenuVersions_,
    applyMenuSave: applyMenuSave,
    applyWholeBookSave: applyWholeBookSave,
    historyMetaFromHtmlTitle: historyMetaFromHtmlTitle,
    coercePrintMenuId: coercePrintMenuId
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.EBMenusSyncLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this));
