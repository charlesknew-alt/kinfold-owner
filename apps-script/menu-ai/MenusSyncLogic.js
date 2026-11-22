/**
 * Menu AI shared-state helpers (pure — no Drive / Properties / network).
 * Used by Code.gs at runtime and by Node tests via require().
 *
 * Goals:
 * - Per-menu saves with version conflict checks
 * - Reject seed / near-empty overwrites of any full menu
 * - Legacy whole-book saves merge only non-stale diffs (rollout-safe)
 * - Coerce Little Bells print-history menuId mismatches
 */
(function (root) {
  'use strict';

  var SEED_STEAK_RE = /10oz\s+Sirloin\s+Steak/i;
  var NEAR_EMPTY_MAX = 2;
  var FULL_MENU_MIN = 8;
  var MENUS_BACKUP_SLOTS = 5;
  /** After ensureMenuVersions, untouched menus sit at 1. Versioned saves go to 2+. */
  var LEGACY_BASELINE_VERSION = 1;

  /** Venue keys for separate dish books. Default / omitted = Eight Bells. */
  var VENUE_EIGHTBELLS = 'eightbells';
  var VENUE_WINDMILL = 'windmill';
  var MENUS_PROP_BY_VENUE = {
    eightbells: 'MENUS',
    windmill: 'MENUS_WINDMILL'
  };
  var MENUS_BACKUP_PREFIX_BY_VENUE = {
    eightbells: 'MENUS_BAK_',
    windmill: 'MENUS_WINDMILL_BAK_'
  };

  /**
   * Normalize a venue query/body value. Unknown → eightbells (live EB book).
   * Accepts short aliases used on manager portals.
   */
  function normalizeVenue(venue) {
    var v = String(venue == null ? '' : venue).toLowerCase().trim();
    if (v === 'windmill' || v === 'wm' || v === 'windmillinn' || v === 'thewindmill') {
      return VENUE_WINDMILL;
    }
    return VENUE_EIGHTBELLS;
  }

  function menusPropKey(venue) {
    return MENUS_PROP_BY_VENUE[normalizeVenue(venue)] || MENUS_PROP_BY_VENUE.eightbells;
  }

  function menusBackupPrefix(venue) {
    return MENUS_BACKUP_PREFIX_BY_VENUE[normalizeVenue(venue)] ||
      MENUS_BACKUP_PREFIX_BY_VENUE.eightbells;
  }

  /**
   * Empty Windmill book — every menu type, empty catalogue.
   * Never copy Eight Bells dishes. Used when MENUS_WINDMILL is missing so
   * clients do not fall back to the Eight Bells cache.
   */
  function emptyWindmillBook_() {
    return {
      main: [],
      'main-next': [],
      sunday: [],
      party: [],
      sandwiches: [],
      specials: [],
      desserts: [],
      'little-bells': [],
      'lunch-club': []
    };
  }

  function emptyWindmillMenuVersions_() {
    var book = emptyWindmillBook_();
    var versions = {};
    Object.keys(book).forEach(function (id) { versions[id] = 1; });
    return versions;
  }

  function emptyWindmillState() {
    return {
      venue: VENUE_WINDMILL,
      updatedAt: 0,
      book: emptyWindmillBook_(),
      metaBook: {},
      includes: {},
      promoBank: [],
      promoTicks: {},
      promoDeck: { order: [], used: [] },
      sectionLayout: {},
      dishCatalogue: [],
      extraMenus: [],
      extraSections: [],
      menuVersions: emptyWindmillMenuVersions_()
    };
  }

  function stampVenue(state, venue) {
    state = state && typeof state === 'object' ? state : {};
    state.venue = normalizeVenue(venue);
    return state;
  }

  function dishCount_(list) {
    return Array.isArray(list) ? list.length : 0;
  }

  /** True when a menu payload is empty, tiny, or the known seed-steak incident shape. */
  function isNearEmptyOrSeedMenu(dishes) {
    var n = dishCount_(dishes);
    if (n <= 0) return true;
    if (n <= NEAR_EMPTY_MAX) return true;
    // Incident: menu contained only the sample seed dish "10oz Sirloin Steak"
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

  /** @deprecated use isNearEmptyOrSeedMenu */
  function isNearEmptyOrSeedMain(dishes) {
    return isNearEmptyOrSeedMenu(dishes);
  }

  /**
   * Reject replacing a full menu with a near-empty / seed payload.
   * @return {{reject:boolean, reason?:string}}
   */
  function seedGuardMenu(menuId, existingDishes, incomingDishes) {
    var id = String(menuId || 'menu');
    var existN = dishCount_(existingDishes);
    if (existN < FULL_MENU_MIN) return { reject: false };
    if (!isNearEmptyOrSeedMenu(incomingDishes)) return { reject: false };
    return {
      reject: true,
      reason: 'Refusing to replace a full ' + id + ' (' + existN +
        ' dishes) with a near-empty or seed menu (' + dishCount_(incomingDishes) + ' dishes).'
    };
  }

  /** @deprecated use seedGuardMenu */
  function seedGuardMain(existingDishes, incomingDishes) {
    return seedGuardMenu('main', existingDishes, incomingDishes);
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

  function dishesEqual_(a, b) {
    try {
      return JSON.stringify(Array.isArray(a) ? a : []) ===
        JSON.stringify(Array.isArray(b) ? b : []);
    } catch (e) {
      return false;
    }
  }

  /**
   * Is a legacy/per-menu write stale for this menuId?
   * - expectedVersions[id] present → must match server version
   * - else (old whole-book client): stale if client's updatedAt is older than
   *   the server book clock, OR this menu has already been version-saved past
   *   the migrate baseline (so a bumped local updatedAt cannot clobber it)
   */
  function isMenuStaleForLegacy_(menuId, state, raw) {
    var serverV = Number(state.menuVersions && state.menuVersions[menuId]) || 0;
    var expectedMap = raw && raw.expectedVersions && typeof raw.expectedVersions === 'object'
      ? raw.expectedVersions
      : null;
    if (expectedMap && Object.prototype.hasOwnProperty.call(expectedMap, menuId)) {
      var expV = Number(expectedMap[menuId]) || 0;
      return serverV > 0 && expV !== serverV;
    }
    var clientAt = Number(raw && raw.updatedAt) || 0;
    var serverAt = Number(state.updatedAt) || 0;
    if (clientAt && serverAt && clientAt < serverAt) return true;
    // Blind whole-book write without expectedVersions: protect menus already
    // advanced by a versioned save (or a prior successful merge bump past 1).
    if (serverV > LEGACY_BASELINE_VERSION) return true;
    return false;
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

    var guard = seedGuardMenu(menuId, state.book[menuId], patch.dishes);
    if (guard.reject) {
      return {
        ok: false,
        rejected: true,
        error: 'seed_or_empty_menu',
        message: guard.reason,
        state: state,
        version: currentVersion,
        updatedAt: Number(state.updatedAt) || 0,
        menuVersions: state.menuVersions
      };
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
   * Whole-book save (legacy old-page clients).
   * Merges only menus that differ and are not stale; seed-guards every menu.
   * Never blindly replaces the whole book.
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
    if (!state.book || typeof state.book !== 'object') state.book = {};
    if (!state.metaBook || typeof state.metaBook !== 'object') state.metaBook = {};
    if (!state.includes || typeof state.includes !== 'object') state.includes = {};
    if (!state.promoTicks || typeof state.promoTicks !== 'object') state.promoTicks = {};
    if (!state.sectionLayout || typeof state.sectionLayout !== 'object') state.sectionLayout = {};
    if (!state.menuVersions || typeof state.menuVersions !== 'object') state.menuVersions = {};

    var incomingBook = raw.book;
    var ids = {};
    Object.keys(state.book).forEach(function (id) { ids[id] = true; });
    Object.keys(incomingBook).forEach(function (id) { ids[id] = true; });

    var merged = [];
    var skippedSame = [];
    var skippedStale = [];
    var skippedSeed = [];
    var idList = Object.keys(ids);

    for (var i = 0; i < idList.length; i++) {
      var menuId = idList[i];
      var serverDishes = state.book[menuId];
      var incomingDishes = Object.prototype.hasOwnProperty.call(incomingBook, menuId)
        ? incomingBook[menuId]
        : undefined;

      // Menu only on server — keep it (old client must not delete menus by omission
      // when the payload is a partial/corrupt book). If incoming explicitly sends
      // the key, incomingDishes is defined (possibly []).
      if (!Object.prototype.hasOwnProperty.call(incomingBook, menuId)) {
        skippedSame.push(menuId);
        continue;
      }
      if (!Array.isArray(incomingDishes)) incomingDishes = [];

      if (dishesEqual_(serverDishes, incomingDishes)) {
        skippedSame.push(menuId);
        continue;
      }

      // Seed/near-empty guard first — even if the menu is also "stale", never
      // treat a shrink attempt as a successful no-op merge path.
      var guard = seedGuardMenu(menuId, serverDishes, incomingDishes);
      if (guard.reject) {
        skippedSeed.push(menuId);
        continue;
      }

      if (isMenuStaleForLegacy_(menuId, state, raw)) {
        skippedStale.push(menuId);
        continue;
      }

      state.book[menuId] = cloneJson_(incomingDishes);
      if (raw.metaBook && typeof raw.metaBook === 'object' && raw.metaBook[menuId]) {
        state.metaBook[menuId] = cloneJson_(raw.metaBook[menuId]);
      }
      if (raw.includes && typeof raw.includes === 'object' && raw.includes[menuId]) {
        state.includes[menuId] = cloneJson_(raw.includes[menuId]);
      }
      if (raw.promoTicks && typeof raw.promoTicks === 'object' && raw.promoTicks[menuId]) {
        state.promoTicks[menuId] = cloneJson_(raw.promoTicks[menuId]);
      }
      if (raw.sectionLayout && typeof raw.sectionLayout === 'object' &&
          raw.sectionLayout[menuId]) {
        state.sectionLayout[menuId] = cloneJson_(raw.sectionLayout[menuId]);
      }
      var curV = Number(state.menuVersions[menuId]) || 0;
      state.menuVersions[menuId] = curV + 1;
      merged.push(menuId);
    }

    // Nothing applicable: seed reject and/or stale conflict.
    if (merged.length === 0) {
      if (skippedSeed.length && !skippedStale.length) {
        return {
          ok: false,
          rejected: true,
          error: 'seed_or_empty_menu',
          message: 'Refusing near-empty or seed overwrite for: ' + skippedSeed.join(', '),
          state: state,
          menuVersions: state.menuVersions,
          skippedSeed: skippedSeed
        };
      }
      if (skippedStale.length) {
        return {
          ok: false,
          conflict: true,
          error: 'stale_menu_version',
          message: 'Server has newer edits for: ' + skippedStale.join(', ') +
            '. Reload and try again.',
          state: state,
          menuVersions: state.menuVersions,
          skippedStale: skippedStale,
          skippedSeed: skippedSeed
        };
      }
      if (skippedSeed.length) {
        return {
          ok: false,
          rejected: true,
          error: 'seed_or_empty_menu',
          message: 'Refusing near-empty or seed overwrite for: ' + skippedSeed.join(', '),
          state: state,
          menuVersions: state.menuVersions,
          skippedSeed: skippedSeed
        };
      }
      // Identical book — treat as success no-op (old Sync may re-push same cache).
      return {
        ok: true,
        state: state,
        updatedAt: Number(state.updatedAt) || 0,
        menuVersions: state.menuVersions,
        merged: [],
        skippedSame: skippedSame
      };
    }

    // Shared fields only when at least one menu merged (deliberate legacy save).
    if (Array.isArray(raw.promoBank)) state.promoBank = cloneJson_(raw.promoBank);
    if (raw.promoDeck && typeof raw.promoDeck === 'object') {
      state.promoDeck = cloneJson_(raw.promoDeck);
    }
    if (Array.isArray(raw.dishCatalogue)) {
      state.dishCatalogue = cloneJson_(raw.dishCatalogue);
    }
    if (Array.isArray(raw.extraMenus)) state.extraMenus = cloneJson_(raw.extraMenus);
    if (Array.isArray(raw.extraSections)) {
      state.extraSections = cloneJson_(raw.extraSections);
    }

    state.updatedAt = Date.now();
    return {
      ok: true,
      state: state,
      updatedAt: state.updatedAt,
      menuVersions: state.menuVersions,
      merged: merged,
      skippedSame: skippedSame,
      skippedStale: skippedStale,
      skippedSeed: skippedSeed
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
    LEGACY_BASELINE_VERSION: LEGACY_BASELINE_VERSION,
    VENUE_EIGHTBELLS: VENUE_EIGHTBELLS,
    VENUE_WINDMILL: VENUE_WINDMILL,
    MENUS_PROP_BY_VENUE: MENUS_PROP_BY_VENUE,
    normalizeVenue: normalizeVenue,
    menusPropKey: menusPropKey,
    menusBackupPrefix: menusBackupPrefix,
    emptyWindmillState: emptyWindmillState,
    stampVenue: stampVenue,
    isNearEmptyOrSeedMenu: isNearEmptyOrSeedMenu,
    isNearEmptyOrSeedMain: isNearEmptyOrSeedMain,
    seedGuardMenu: seedGuardMenu,
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
