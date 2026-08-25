/**
 * Varlo Auth — standalone web app for the unified login.
 *
 * Passwords are stored as SHA-256 hashes in Script Properties.
 * This project does not touch the Eight Bells / Windmill takings
 * routers (no page= handling). Venue /exec IDs stay unchanged.
 *
 * JSONP (GitHub Pages cannot read GAS fetch responses):
 *   ?action=ping
 *   ?action=login&role=owner|eightbells|windmill&password=...
 *   ?action=set&role=eightbells|windmill|owner&ownerPassword=...&newPassword=...
 *   ?action=status&ownerPassword=...
 *   &callback=varloAuthCb123
 *
 * Seed hashes once (clasp), never commit plaintext:
 *   clasp run seedRolePassword --params '["owner","..."]'
 */

var ROLE_KEYS = {
  owner: 'HASH_OWNER',
  eightbells: 'HASH_EIGHTBELLS',
  windmill: 'HASH_WINDMILL'
};

var HASH_SALT = 'varlo-auth-v1';
var MIN_PASSWORD_LEN = 4;
var MAX_PASSWORD_LEN = 64;

function doGet(e) {
  return respond_(handle_((e && e.parameter) || {}), (e && e.parameter) || {});
}

function doPost(e) {
  return respond_(handle_((e && e.parameter) || {}), (e && e.parameter) || {});
}

function handle_(p) {
  var action = String(p.action || 'ping').toLowerCase();
  try {
    if (action === 'ping' || action === 'health') {
      return { ok: true, service: 'varlo-auth' };
    }
    if (action === 'login') return login_(p);
    if (action === 'set' || action === 'setpw') return setPassword_(p);
    if (action === 'status') return status_(p);
    if (action === 'bootstrap') return bootstrap_(p);
    return { ok: false, error: 'unknown_action' };
  } catch (err) {
    return { ok: false, error: 'server' };
  }
}

function respond_(obj, p) {
  var json = JSON.stringify(obj);
  var callback = String((p && (p.callback || p.prefix)) || '');
  if (callback && /^[A-Za-z_][A-Za-z0-9_]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function login_(p) {
  var role = normalizeRole_(p.role);
  if (!role) return { ok: false, error: 'invalid' };
  var stored = getHash_(role);
  if (!stored) return { ok: false, error: 'not_configured' };
  var given = hashPassword_(p.password);
  if (!safeEq_(stored, given)) return { ok: false, error: 'invalid' };
  return { ok: true, role: role };
}

function setPassword_(p) {
  if (!verifyOwner_(p.ownerPassword)) {
    return { ok: false, error: 'invalid' };
  }
  var role = normalizeRole_(p.role);
  if (!role) return { ok: false, error: 'bad_role' };
  var next = String(p.newPassword || p.password || '');
  if (next.length < MIN_PASSWORD_LEN || next.length > MAX_PASSWORD_LEN) {
    return { ok: false, error: 'bad_password' };
  }
  PropertiesService.getScriptProperties().setProperty(ROLE_KEYS[role], hashPassword_(next));
  return { ok: true, role: role, set: true };
}

function status_(p) {
  if (!verifyOwner_(p.ownerPassword)) {
    return { ok: false, error: 'invalid' };
  }
  return {
    ok: true,
    roles: {
      owner: !!getHash_('owner'),
      eightbells: !!getHash_('eightbells'),
      windmill: !!getHash_('windmill')
    }
  };
}

function verifyOwner_(password) {
  var stored = getHash_('owner');
  if (!stored) return false;
  return safeEq_(stored, hashPassword_(password));
}

function normalizeRole_(role) {
  role = String(role || '').toLowerCase().trim();
  if (role === 'eb' || role === 'eight-bells') role = 'eightbells';
  if (role === 'wm' || role === 'windmill-inn') role = 'windmill';
  return ROLE_KEYS[role] ? role : '';
}

function getHash_(role) {
  var key = ROLE_KEYS[role];
  if (!key) return '';
  try {
    return String(PropertiesService.getScriptProperties().getProperty(key) || '');
  } catch (err) {
    return '';
  }
}

function hashPassword_(password) {
  var input = HASH_SALT + '\n' + String(password == null ? '' : password);
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var hex = [];
  for (var i = 0; i < raw.length; i++) {
    var v = raw[i];
    if (v < 0) v += 256;
    hex.push(('0' + v.toString(16)).slice(-2));
  }
  return hex.join('');
}

function safeEq_(a, b) {
  a = String(a || '');
  b = String(b || '');
  var n = Math.max(a.length, b.length);
  var diff = a.length ^ b.length;
  for (var i = 0; i < n; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * First-time only. Refuses to run once HASH_OWNER exists.
 * Used to seed Script Properties from clasp/curl without a GCP project.
 */
function bootstrap_(p) {
  if (getHash_('owner')) return { ok: false, error: 'already_configured' };
  var owner = String(p.ownerPassword || p.owner || '');
  var eb = String(p.eightbells || '');
  var wm = String(p.windmill || '');
  if (owner.length < MIN_PASSWORD_LEN || owner.length > MAX_PASSWORD_LEN) {
    return { ok: false, error: 'bad_password' };
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty(ROLE_KEYS.owner, hashPassword_(owner));
  if (eb.length >= MIN_PASSWORD_LEN && eb.length <= MAX_PASSWORD_LEN) {
    props.setProperty(ROLE_KEYS.eightbells, hashPassword_(eb));
  }
  if (wm.length >= MIN_PASSWORD_LEN && wm.length <= MAX_PASSWORD_LEN) {
    props.setProperty(ROLE_KEYS.windmill, hashPassword_(wm));
  }
  return {
    ok: true,
    bootstrapped: true,
    roles: {
      owner: true,
      eightbells: !!getHash_('eightbells'),
      windmill: !!getHash_('windmill')
    }
  };
}

/** clasp run seedRolePassword --params '["owner","secret"]' */
function seedRolePassword(role, password) {
  role = normalizeRole_(role);
  if (!role) throw new Error('bad role');
  password = String(password || '');
  if (password.length < MIN_PASSWORD_LEN) throw new Error('password too short');
  PropertiesService.getScriptProperties().setProperty(ROLE_KEYS[role], hashPassword_(password));
  return { ok: true, role: role };
}
