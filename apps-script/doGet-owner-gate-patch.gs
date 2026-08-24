/**
 * PASTE-READY FIX — Eight Bells + Windmill paperwork Apps Scripts
 *
 * Apply this in the Apps Script editor for BOTH venues, then deploy a new
 * version of the existing /exec web app. GitHub cannot publish this.
 *
 * Why this is needed
 * ------------------
 * The Varlo manager-branding pass added a server-side lock in doGet() that
 * returns the "Not authorised" / "Owner tools are not available from the
 * manager portal" page for:
 *
 *   page=owner | page=cardday | page=ownerreview
 *
 * for EVERY caller. That hid the owner-paperwork link from the manager hub
 * (keep that), but it also blocked the GitHub owner portal, which iframes
 * the same /exec URLs with those page names.
 *
 * Live owner portal already sends shell=owner:
 *   paperwork  →  ?page=owner&shell=owner
 *   cardday    →  ?page=cardday&shell=owner
 *
 * The scripts do not honour shell=owner yet. This file is the missing half.
 *
 * Do NOT
 * ------
 * - Put an owner-paperwork tile/link back on the manager hub
 * - Change the manager GitHub shells (they have no page= param)
 * - Touch openOwnerReview() (spreadsheet menu "Owner Week Review")
 *
 * How to apply (Charles, in Google Apps Script)
 * ---------------------------------------------
 * 1. Open each paperwork bound script (Eight Bells and Windmill).
 * 2. Find doGet(e). Search for the exact NA copy:
 *      "Owner tools are not available from the manager portal"
 * 3. Change only the condition that returns that page. Keep the existing
 *    owner-page renderer (Owner / CardDay HTML). If that renderer was
 *    deleted, restore it from Apps Script version history, then add the
 *    allow-list below.
 * 4. Deploy → Manage deployments → the existing web app → New version.
 *    Keep the same /exec URL (do not create a new deployment).
 * 5. Confirm manager hub still has no owner-paperwork link.
 *
 * After deploy, these must NOT return the NA title:
 *   Eight Bells  …/exec?page=owner&shell=owner
 *   Eight Bells  …/exec?page=cardday&shell=owner
 *   Windmill     …/exec?page=owner&shell=owner
 *
 * Manager default / ?page=menu must still work.
 */


/** Pages the owner portal iframes. Keep this list tight. */
var OWNER_WEB_PAGES = ['owner', 'cardday', 'ownerreview'];


/**
 * True when the request is the GitHub owner portal handshake.
 * shell=owner is what kinfold-owner/index.html already sends.
 * portal/from/role are accepted as aliases in case an older URL is used.
 */
function isOwnerPortalRequest_(e) {
  var p = (e && e.parameter) || {};
  var shell = String(p.shell || p.portal || p.from || '').toLowerCase();
  if (shell === 'owner') return true;
  if (String(p.role || '').toLowerCase() === 'owner') return true;
  return false;
}


function isOwnerWebPage_(page) {
  return OWNER_WEB_PAGES.indexOf(String(page || '').toLowerCase()) !== -1;
}


/**
 * SURGICAL CHANGE inside existing doGet(e)
 * ----------------------------------------
 * REPLACE a lock that looks like this (names will vary):
 *
 *   var page = String((e.parameter && e.parameter.page) || 'menu').toLowerCase();
 *   if (page === 'owner' || page === 'cardday' || page === 'ownerreview') {
 *     return HtmlService.createTemplateFromFile('NotAuthorised')  // or inline NA HTML
 *       .evaluate()
 *       .setTitle('Varlo · … — Not authorised')
 *       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
 *   }
 *
 * WITH:
 */
function doGet_ownerGateExample_(e) {
  var p = (e && e.parameter) || {};
  var page = String(p.page || 'menu').toLowerCase();

  if (isOwnerWebPage_(page) && !isOwnerPortalRequest_(e)) {
    // Manager (or unknown) caller asked for an owner tool.
    // Keep returning the existing NA page. Do not add a hub link.
    return renderExistingNotAuthorisedPage_(e);
  }

  // Fall through to the EXISTING router — the same branches that
  // served page=owner / page=cardday / page=ownerreview before the lock.
  // Typical names (from the live function list): doGet page switch,
  // getPageContent(), or HtmlService.createTemplateFromFile('Owner').
  return renderExistingPage_(e, page);
}


/**
 * Placeholders — do not paste these. They stand in for functions / HTML
 * files already in the project (NA page uses .na-card + "Back to manager
 * hub"; owner pages still have .owner-main.varlo-fill CSS).
 */
function renderExistingNotAuthorisedPage_(e) {
  throw new Error('Use the project\'s existing NA HtmlOutput — do not add this stub.');
}

function renderExistingPage_(e, page) {
  throw new Error('Use the project\'s existing doGet router — do not add this stub.');
}
