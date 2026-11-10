/**
 * PubSystemLib — Templates_Forms.gs (v4.13 - owner menu rebuilt in v4 + iframe ps-header hide)
 */

const DAILY_FORM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Daily Entry — __VENUE_FULL__</title>
  __SHARED_STYLES__
  <style>
    /* Form-specific styles using v4 design tokens */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(26, 24, 20, 0.55);
      z-index: 9999;
      justify-content: center;
      align-items: center;
    }
    .modal-overlay.show { display: flex; }
    .modal-box {
      background: var(--white-warm);
      padding: 32px 28px;
      border-radius: var(--r);
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 12px 36px rgba(26, 24, 20, 0.2);
      border: 1px solid var(--line);
    }
    .modal-icon { font-size: 40px; margin-bottom: 14px; }
    .modal-title { font-family: var(--serif); font-weight: 500; color: var(--ink); font-size: 22px; margin-bottom: 12px; }
    .modal-message { color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin-bottom: 22px; text-align: left; white-space: pre-line; }
    .modal-buttons { display: flex; gap: 10px; justify-content: center; }
    .modal-button { background: var(--ink); color: var(--paint); border: 0; padding: 11px 22px; border-radius: var(--r); font-family: var(--sans); font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
    .modal-button:hover { background: #000; }
    .modal-button.cancel { background: var(--white-warm); color: var(--ink); border: 1px solid var(--line); }
    .modal-button.cancel:hover { background: var(--paint-wash); }

    /* Fixed top progress bar — page stays visible while day data arrives */
    #psLoadBar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 4px;
      z-index: 100000;
      background: rgba(26, 24, 20, 0.08);
      pointer-events: none;
    }
    #psLoadBarFill {
      display: block;
      height: 100%;
      width: 8%;
      background: var(--ink, #1A1814);
      transition: width 0.35s ease;
    }
    #psLoadBar.done { opacity: 0; transition: opacity 0.45s ease 0.15s; }

    /* Computed read-only field */
    .calculated-value {
      padding: 12px 14px;
      background: var(--paint-wash);
      border: 1px solid var(--paint-pale);
      border-radius: var(--r);
      font-family: var(--mono);
      font-weight: 700;
      color: var(--ink);
      font-size: 16px;
    }

    /* Validation row inside cards */
    .validation-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 10px 0;
      border-bottom: 1px solid var(--line);
    }
    .validation-row:last-child { border-bottom: 0; }
    .validation-label { color: var(--ink-soft); font-size: 13px; }
    .validation-value { font-family: var(--mono); font-weight: 700; color: var(--ink); font-size: 15px; }

    /* Day pill */
    .day-pill {
      display: inline-block;
      padding: 6px 14px;
      background: var(--ink);
      color: var(--paint);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .daily-yarn {
      margin: 0 0 var(--s5);
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-left: 3px solid var(--paint);
      border-radius: var(--r);
      background: var(--white-warm);
    }
    .daily-yarn-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-quiet);
      margin-bottom: 6px;
    }
    .daily-yarn-text {
      margin: 0;
      font-family: var(--serif);
      font-size: 14.5px;
      line-height: 1.45;
      color: var(--ink-soft);
    }

    /* Difference indicator card */
    .diff-card {
      margin-top: 14px;
      padding: 14px;
      background: var(--paint-wash);
      border: 1px solid var(--paint-pale);
      border-radius: var(--r);
    }
    .diff-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .diff-row .label { color: var(--ink-soft); }
    .diff-row.total { border-top: 1px solid var(--paint); padding-top: 10px; margin-top: 6px; font-weight: 700; }

    textarea.notes-input {
      width: 100%;
      min-height: 80px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: var(--r);
      font-family: var(--sans);
      font-size: 14px;
      color: var(--ink);
      background: var(--white-warm);
      resize: vertical;
      box-sizing: border-box;
    }
    textarea.notes-input:focus { outline: 0; border-color: var(--ink); }
  </style>
<style>
  /* Iframe context: hide ps-header when loaded in portal */
  /* ps-header shown in all contexts including iframe (venue branding) */
  html.iframed .ps-main { padding-top: 12px !important; }
</style>
</head>
<body>
__VARLO_BOOT__
<div id="psLoadBar" aria-hidden="true"><span id="psLoadBarFill"></span></div>

__VARLO_HEADER_MENU__

<main class="ps-main">

  <div id="formContent">

    <!-- Hero with day label -->
    <section class="ps-hero">
      <div class="day-pill" id="weekRange">Loading…</div>
      <h1 class="ps-hero-title" id="currentDayDisplay">Day</h1>
      <div class="ps-hero-subtitle" id="weekInfo">Daily entry</div>
      <div id="weekEnding" style="display:none;"></div>
    </section>

    <aside class="daily-yarn" id="dailyYarn" hidden>
      <div class="daily-yarn-label" id="dailyYarnLabel">Quick one</div>
      <p class="daily-yarn-text" id="dailyYarnText"></p>
    </aside>

    <!-- 01. TILL READINGS -->
    <div class="ps-section-head">
      <span class="ps-section-num">01</span>
      <h2 class="ps-section-title">Till Readings</h2>
    </div>
    <section class="ps-card">
      <div class="ps-field">
        <label class="ps-label" for="netOnTill">Net on Till <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="netOnTill" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="grossOnTill">Gross on Till <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="grossOnTill" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="itemVoid">Item Void <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="itemVoid" placeholder="0.00" oninput="calculateAll()">
        </div>
        <div class="ps-hint">Enter 0 if no voids today</div>
      </div>
    </section>

    <!-- 02. TAB TRACKING -->
    <div class="ps-section-head">
      <span class="ps-section-num">02</span>
      <h2 class="ps-section-title">Tab Tracking</h2>
    </div>
    <section class="ps-card">
      <div class="ps-hint" style="margin-bottom:14px;">
        The tab book should match the Expected Balance below. If it doesn't, your cash
        count is still fine — just flag it to Charlie.
      </div>
      <div class="ps-field">
        <label class="ps-label">Previous Tab Balance</label>
        <div class="calculated-value" id="previousTabBalance">£0.00</div>
        <div class="ps-hint" id="previousTabBalanceCaption">Carried forward</div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="xReading">X Reading</label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="xReading" placeholder="0.00" oninput="onXReadingInput()">
        </div>
        <div class="ps-hint">The till's tab total. Fill this <strong>or</strong> Tab Change below - the other fills in and locks.</div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="tabChangeInput">Tab Change (+/-)</label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" style="padding-right:48px;" type="number" step="0.01" min="-99999.99" id="tabChangeInput" placeholder="0.00" oninput="onTabChangeInput()">
          <button type="button" id="tabChangeSignBtn" onclick="toggleTabChangeSign()" title="Switch between + and −" aria-label="Toggle positive or negative" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);width:36px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:var(--r);background:var(--white-warm);color:var(--ink);font-size:17px;font-weight:700;line-height:1;cursor:pointer;">±</button>
        </div>
        <div class="ps-hint">Today's tab movement. Enter the amount, then tap <strong>±</strong> to make it negative if tabs were paid down. Enter 0 if no tab activity.</div>
      </div>
      <div class="ps-field">
        <label class="ps-label">Expected Tab Balance</label>
        <div class="calculated-value" id="newTabBalance">£0.00</div>
        <div class="ps-hint">What the tab book should read tonight</div>
      </div>
      <div class="ps-field">
        <label class="ps-label">Till Check (Gross - Net)</label>
        <div class="calculated-value" id="tabDrift">-</div>
        <div class="ps-hint" id="tabDriftHelp">Your tab change compared with the till's Gross - Net</div>
      </div>
      <input type="hidden" id="tabs" value="0">
    </section>

    <!-- 03. CASH & CARDS -->
    <div class="ps-section-head">
      <span class="ps-section-num">03</span>
      <h2 class="ps-section-title">Cash & Cards</h2>
    </div>
    <section class="ps-card">
      <div class="ps-field">
        <label class="ps-label" for="cashInTill">Total Cash in Till <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="cashInTill" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="pdq1">PDQ Terminal 1 <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="pdq1" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="pdq2">PDQ Terminal 2 <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="pdq2" placeholder="0.00" oninput="calculateAll()">
        </div>
        <div class="ps-hint">Enter 0 if no second terminal</div>
      </div>
      <div class="ps-field">
        <label class="ps-label">PDQ Grand Total</label>
        <div class="calculated-value" id="pdqTotal">£0.00</div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="pdqRooms">PDQ Rooms</label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="pdqRooms" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="cashRooms">Cash Rooms</label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="cashRooms" placeholder="0.00" oninput="calculateAll()">
        </div>
      </div>
    </section>

    <!-- 04. DAILY OUT -->
    <div class="ps-section-head">
      <span class="ps-section-num">04</span>
      <h2 class="ps-section-title">Daily Out</h2>
    </div>
    <section class="ps-card">
      <div class="validation-row">
        <span class="validation-label">1. Cash in Till less Float (£130) &amp; Rooms Cash</span>
        <span class="validation-value" id="cashLessFloat">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">2. Cash to Nearest £5</span>
        <span class="validation-value" id="cashToNearest5">£0.00</span>
      </div>
      <div class="ps-field" style="margin-top: 16px;">
        <label class="ps-label" for="actualToSafe">3. Actual Cash to Safe <span style="color:#c0635a;">*</span></label>
        <div class="ps-input-with-prefix">
          <span class="ps-input-prefix">£</span>
          <input class="ps-input" type="number" step="0.01" id="actualToSafe" placeholder="0.00" oninput="checkActualVsCalculated()">
        </div>
        <div id="differenceIndicator" style="display:none;">
          <div class="diff-card">
            <div class="diff-row"><span class="label">Calculated</span><span style="font-weight:700;" id="calcAmount">£0.00</span></div>
            <div class="diff-row"><span class="label">Actual</span><span style="font-weight:700;" id="actualAmount">£0.00</span></div>
            <div class="diff-row total"><span class="label">Difference</span><span id="diffAmount">£0.00</span></div>
          </div>
        </div>
      </div>
      <div class="ps-field" id="notesGroup" style="display:none;">
        <label class="ps-label" for="dailyOutNotes">4. Cash Discrepancy Notes</label>
        <textarea class="notes-input" id="dailyOutNotes" placeholder="Explain why actual amount differs..."></textarea>
      </div>
      <div class="validation-row" style="margin-top: 16px;">
        <span class="validation-label">5. Total F&amp;D PDQ</span>
        <span class="validation-value" id="totalFDPdq">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">6. Total Rooms PDQ</span>
        <span class="validation-value" id="totalRoomsPdq">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">7. Total Rooms Cash</span>
        <span class="validation-value" id="totalRoomsCash">£0.00</span>
      </div>
    </section>

    <!-- 05. RECEIPTS (cash paid from till) -->
    <div class="ps-section-head">
      <span class="ps-section-num">05</span>
      <h2 class="ps-section-title">Receipts (cash from till)</h2>
    </div>
    <section class="ps-card">
      <div class="ps-hint" style="margin-bottom:12px;"><strong>Cash only.</strong> Only enter receipts paid for with cash taken from the till today. Card payments (yours or anyone else's) do NOT go here. Pick a category, add a note and the amount - the cash has already left the till, so this just explains today's Daily Out. (Receipts settled at the end of the week go in the weekly form.)</div>
      <div id="receiptRows"></div>
      <button type="button" class="ps-btn ps-btn-secondary ps-btn-block" onclick="addReceiptRow()" style="margin-top:4px;">+ Add receipt</button>
      <div class="validation-row" style="margin-top:16px;">
        <span class="validation-label">Daily Out (cash to explain)</span>
        <span class="validation-value" id="recDailyOut">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">Receipts logged</span>
        <span class="validation-value" id="recLogged">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">Unexplained</span>
        <span class="validation-value" id="recUnexplained">£0.00</span>
      </div>
    </section>

    <!-- 06. CARD ADJUSTMENTS -->
    <div class="ps-section-head">
      <span class="ps-section-num">06</span>
      <h2 class="ps-section-title">Card Adjustments</h2>
    </div>
    <section class="ps-card">
      <div class="ps-hint" style="margin-bottom:12px;">Corrections to the card / PDQ side. <strong>Bank transfer</strong> - e.g. a customer overcharged on the card and paid back by bank transfer - nets against the week's card takings. <strong>Cash back</strong> - customer paid extra on the card and took cash - already balances itself, so it's just recorded here. Leave empty on a normal day.</div>
      <div id="cardAdjRows"></div>
      <button type="button" class="ps-btn ps-btn-secondary ps-btn-block" onclick="addCardAdjRow()" style="margin-top:4px;">+ Add card adjustment</button>
      <div class="validation-row" style="margin-top:16px;">
        <span class="validation-label">Bank transfer net (adjusts card)</span>
        <span class="validation-value" id="caTransferNet">£0.00</span>
      </div>
      <div class="validation-row">
        <span class="validation-label">Cash back recorded</span>
        <span class="validation-value" id="caCashback">£0.00</span>
      </div>
    </section>

    <!-- 07. VALIDATION CHECKS -->
    <div class="ps-section-head">
      <span class="ps-section-num">07</span>
      <h2 class="ps-section-title">Validation Checks</h2>
    </div>
    <section class="ps-card">
      <div class="ps-field">
        <label class="ps-label">Sales vs Received</label>
        <div id="salesVsReceived" class="calculated-value">£0.00</div>
      </div>
      <div class="ps-field">
        <label class="ps-label" for="salesNotes">Sales discrepancy notes (if needed)</label>
        <textarea class="notes-input" id="salesNotes" placeholder="Explain any discrepancy..."></textarea>
      </div>
      <div class="ps-field">
        <label class="ps-label">Tab Balance Check</label>
        <div id="tabChecker" class="calculated-value">—</div>
        <div class="ps-hint">Your tab change compared with the till's Gross - Net. Does not affect Daily Out.</div>
      </div>
      <div class="ps-field">
        <label class="ps-label">Running Total Tabs</label>
        <div class="calculated-value"><span id="runningTabs">£0.00</span></div>
      </div>
    </section>

    <!-- Submit -->
    <div class="ps-bottom-cta" style="margin-top: 28px;">
      <button class="ps-btn ps-btn-primary ps-btn-block ps-btn-lg" onclick="saveDay()">Save Day</button>
      <div class="ps-day-nav" style="display: flex; gap: 10px; margin-top: 10px;">
        <button class="ps-btn ps-btn-secondary" id="prevDayBtn" onclick="navPrevDay()" style="flex: 1;">
          <span aria-hidden="true">←</span> Previous day
        </button>
        <button class="ps-btn ps-btn-secondary" id="nextDayBtn" onclick="navNextDay()" style="flex: 1;">
          Next day <span aria-hidden="true">→</span>
        </button>
      </div>
      <button class="ps-btn ps-btn-secondary ps-btn-block" onclick="returnToMainMenu()" style="margin-top: 10px;">Cancel</button>
    </div>
  </div>
</main>

<!-- Modal markup compatible with original showStyledAlert -->
<div class="modal-overlay" id="styledAlert">
  <div class="modal-box">
    <div class="modal-icon" id="alertIcon">ℹ️</div>
    <div class="modal-title" id="alertTitle">Notice</div>
    <div class="modal-message" id="alertMessage">—</div>
    <div class="modal-buttons" id="confirmButtons">
      <button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>
    </div>
  </div>
</div>

<script>
  /* TEMPLATE VARIABLES */
  var urlDayIndex = parseInt('__DAY_INDEX__') || 0;
  var urlWeekSheet = '__WEEK_SHEET__';
</script>

<script>

    // GLOBAL VARIABLES
    let currentWeekSheet = null;
    let currentDayRow = null;
    let weekDates = [];
    let tabsStartingBalance = 0;
    let previousDayTabBalance = 0;  // Tab balance from the day before
    let currentDayIndex = 0;  // This is the key variable - starts at 0 but can be set by backend
    let expenseCategories = null;   // filled by getExpenseCategories (null = not yet loaded)
    let dayReceipts = [];           // receipts loaded for the current day
    let tabSource = null;           // 'x' | 'change' | null - which tab field is the manual source
    let dayCardAdjustments = [];    // card adjustments loaded for the current day
    var webAppUrl = '';
google.script.run
  .withSuccessHandler(function(url) {
    webAppUrl = url;
  })
  .getWebAppUrl();

// Navigation helper - works both in iframe (GitHub portal) and standalone
function navigateApp(queryString) {
  if (!webAppUrl) return;
  var fullUrl = webAppUrl + queryString;
  try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
  setTimeout(function() { window.location.href = fullUrl; }, 300);
}

// Day-of-week navigation. Day indices 0..6 (Mon..Sun).
function navPrevDay() {
  if (currentDayIndex > 0) {
    navigateApp('?page=daily&day=' + (currentDayIndex - 1));
  }
}
function navNextDay() {
  if (currentDayIndex < 6) {
    navigateApp('?page=daily&day=' + (currentDayIndex + 1));
  }
}
function updateDayNavButtons() {
  var prev = document.getElementById('prevDayBtn');
  var next = document.getElementById('nextDayBtn');
  if (prev) {
    prev.disabled = (currentDayIndex <= 0);
    prev.style.opacity = prev.disabled ? '0.4' : '1';
    prev.style.cursor = prev.disabled ? 'not-allowed' : 'pointer';
  }
  if (next) {
    next.disabled = (currentDayIndex >= 6);
    next.style.opacity = next.disabled ? '0.4' : '1';
    next.style.cursor = next.disabled ? 'not-allowed' : 'pointer';
  }
}

var HOSPITALITY_YARNS = __HOSPITALITY_YARNS_JSON__;
function showHospitalityYarnForDay(dayObj) {
  var box = document.getElementById('dailyYarn');
  var labelEl = document.getElementById('dailyYarnLabel');
  var textEl = document.getElementById('dailyYarnText');
  if (!box || !labelEl || !textEl) return;
  var list = HOSPITALITY_YARNS || [];
  if (!list.length) { box.hidden = true; return; }
  var d = null;
  if (dayObj && dayObj.date) d = new Date(dayObj.date);
  else if (dayObj && dayObj.isoDate) {
    var p = String(dayObj.isoDate).split('-');
    if (p.length === 3) d = new Date(+p[0], +p[1] - 1, +p[2]);
  }
  if (!d || isNaN(d.getTime())) d = new Date();
  var start = new Date(d.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((d - start) / 86400000);
  var seed = d.getFullYear() * 400 + dayOfYear;
  var yarn = list[((seed % list.length) + list.length) % list.length];
  var kind = yarn.k || 'joke';
  labelEl.textContent = kind === 'true' ? 'True-ish' : (kind === 'funny' ? 'Shift yarn' : 'Quick one');
  textEl.textContent = yarn.t || '';
  box.hidden = !yarn.t;
}

// Joke is already in the page — show it before any server call.
showHospitalityYarnForDay(null);

var loadCreepTimer = null;
function setLoadProgress(pct) {
  var fill = document.getElementById('psLoadBarFill');
  var bar = document.getElementById('psLoadBar');
  if (!fill || !bar) return;
  bar.classList.remove('done');
  bar.style.opacity = '1';
  fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  if (pct >= 100) {
    if (loadCreepTimer) { clearInterval(loadCreepTimer); loadCreepTimer = null; }
    setTimeout(function() { bar.classList.add('done'); }, 200);
  }
}
function startLoadCreep() {
  if (loadCreepTimer) clearInterval(loadCreepTimer);
  var p = 12;
  setLoadProgress(p);
  loadCreepTimer = setInterval(function() {
    p = Math.min(86, p + Math.max(0.5, (86 - p) * 0.05));
    setLoadProgress(p);
    if (p >= 85.5) { clearInterval(loadCreepTimer); loadCreepTimer = null; }
  }, 320);
}

function fillDayFields(data, prevTabBalance) {
  data = data || {};
  previousDayTabBalance = prevTabBalance || 0;
  var prevEl = document.getElementById('previousTabBalance');
  if (prevEl) prevEl.textContent = '£' + previousDayTabBalance.toFixed(2);
  var caption = document.getElementById('previousTabBalanceCaption');
  if (caption) {
    if (currentDayRow === 7) {
      caption.textContent = 'Running tab total at end of last week (for reference only)';
      caption.style.fontStyle = 'italic';
    } else {
      caption.textContent = 'Auto-calculated from previous day';
      caption.style.fontStyle = 'normal';
    }
  }
  document.getElementById('grossOnTill').value = data.grossOnTill || '';
  document.getElementById('netOnTill').value = data.netOnTill || '';
  const savedTabChange = parseFloat(data.tabs) || 0;
  const dayHasData = (parseFloat(data.grossOnTill) || 0) !== 0 ||
                     (parseFloat(data.cash) || 0) !== 0 ||
                     savedTabChange !== 0;
  document.getElementById('xReading').value = '';
  if (dayHasData) {
    tabSource = 'change';
    document.getElementById('tabChangeInput').value = savedTabChange.toFixed(2);
  } else {
    tabSource = null;
    document.getElementById('tabChangeInput').value = '';
  }
  applyTabEntry();
  document.getElementById('itemVoid').value = data.itemVoid || '';
  document.getElementById('cashInTill').value = data.cash || '';
  document.getElementById('pdq1').value = data.pdq1 || '';
  document.getElementById('pdq2').value = data.pdq2 || '';
  document.getElementById('pdqRooms').value = data.pdqRooms || '';
  document.getElementById('cashRooms').value = data.cashRooms || '';
  document.getElementById('actualToSafe').value = data.actualToSafe || '';
  document.getElementById('dailyOutNotes').value = data.dailyOutNotes || '';
  document.getElementById('salesNotes').value = data.salesNotes || '';
  seedReceipts(data.receipts);
  seedCardAdjustments(data.cardAdjustments);
  calculateAll();
}

function applyDailyBundle(bundle) {
  if (!bundle || !bundle.week) {
    setLoadProgress(100);
    alert('No data returned. Please close and try again.');
    return;
  }
  var data = bundle.week;
  currentWeekSheet = data.weekSheet;
  weekDates = data.weekDates || [];
  tabsStartingBalance = data.runningBalances ? data.runningBalances.tabs : 0;
  document.getElementById('weekEnding').textContent = data.weekEnding || '';
  document.getElementById('weekRange').textContent = data.weekRange || '';
  if (currentDayIndex === null || currentDayIndex === undefined || isNaN(currentDayIndex)) {
    currentDayIndex = 0;
  }
  currentDayRow = bundle.row || (7 + currentDayIndex);
  if (weekDates[currentDayIndex]) {
    document.getElementById('currentDayDisplay').textContent = weekDates[currentDayIndex].displayDate;
    showHospitalityYarnForDay(weekDates[currentDayIndex]);
  }
  updateDayNavButtons();
  if (bundle.categories && bundle.categories.length) expenseCategories = bundle.categories;
  fillDayFields(bundle.day || {}, bundle.previousTabBalance || 0);
  setLoadProgress(100);
}

window.onload = function() {
  if (urlDayIndex !== null && urlDayIndex !== undefined && !isNaN(urlDayIndex)) {
    currentDayIndex = parseInt(urlDayIndex);
  } else {
    currentDayIndex = 0;
  }
  showHospitalityYarnForDay(null);
  loadDayData();
};

function loadDayData() {
  startLoadCreep();
  google.script.run
    .withSuccessHandler(applyDailyBundle)
    .withFailureHandler(function(error) {
      setLoadProgress(100);
      alert('Error loading day: ' + (error && error.message ? error.message : error));
    })
    .getDailyEntryBundle(urlWeekSheet || currentWeekSheet, currentDayIndex);
}
    
    function calculateAll() {
      const cashInTill = parseFloat(document.getElementById('cashInTill').value) || 0;
      const pdq1 = parseFloat(document.getElementById('pdq1').value) || 0;
      const pdq2 = parseFloat(document.getElementById('pdq2').value) || 0;
      const pdqRooms = parseFloat(document.getElementById('pdqRooms').value) || 0;
      const cashRooms = parseFloat(document.getElementById('cashRooms').value) || 0;
      const grossOnTill = parseFloat(document.getElementById('grossOnTill').value) || 0;
      const tabs = parseFloat(document.getElementById('tabs').value) || 0;
      
      // PDQ Total
      const pdqTotal = pdq1 + pdq2;
      document.getElementById('pdqTotal').textContent = '£' + pdqTotal.toFixed(2);
      
      // Cash less float AND rooms cash (rooms cash sits in the till count but is not F&D)
      const float = 130;
      const cashLessFloat = cashInTill - float - cashRooms;
      document.getElementById('cashLessFloat').textContent = '£' + cashLessFloat.toFixed(2);
      
      // Cash to nearest £5
      const cashToNearest5 = Math.round(cashLessFloat / 5) * 5;
      document.getElementById('cashToNearest5').textContent = '£' + cashToNearest5.toFixed(2);
      
      // Total F&D PDQ
      const totalFDPdq = pdq1 + pdq2 - pdqRooms;
      document.getElementById('totalFDPdq').textContent = '£' + totalFDPdq.toFixed(2);
      
      // Total Rooms
      document.getElementById('totalRoomsPdq').textContent = '£' + pdqRooms.toFixed(2);
      document.getElementById('totalRoomsCash').textContent = '£' + cashRooms.toFixed(2);
      
      // Tab movement is measured from the till (Gross - Net), so it no longer
      // needs cross-checking against a separately-derived figure. The tab
      // BALANCE check now lives in calculateRunningTabs().
      calculateRunningTabs();
      calculateSalesVsReceived();
    }
    
    function checkActualVsCalculated() {
      const cashInTill = parseFloat(document.getElementById('cashInTill').value) || 0;
      const cashRooms = parseFloat(document.getElementById('cashRooms').value) || 0;
      const float = 130;
      const cashLessFloat = cashInTill - float - cashRooms;
      const cashToNearest5 = Math.round(cashLessFloat / 5) * 5;
      const actualToSafe = parseFloat(document.getElementById('actualToSafe').value) || 0;
      
      const difference = actualToSafe - cashToNearest5;
      
      if (actualToSafe > 0 && Math.abs(difference) > 0.01) {
        document.getElementById('differenceIndicator').style.display = 'block';
        document.getElementById('calcAmount').textContent = '£' + cashToNearest5.toFixed(2);
        document.getElementById('actualAmount').textContent = '£' + actualToSafe.toFixed(2);
        
        const diffEl = document.getElementById('diffAmount');
        if (difference > 0) {
          diffEl.textContent = '£' + difference.toFixed(2) + ' OVER';
          diffEl.style.color = '#2e7d32';
        } else {
          diffEl.textContent = '£' + Math.abs(difference).toFixed(2) + ' SHORT';
          diffEl.style.color = '#c62828';
        }
        
        document.getElementById('notesGroup').style.display = 'block';
      } else {
        document.getElementById('differenceIndicator').style.display = 'none';
        document.getElementById('notesGroup').style.display = 'none';
      }
    }
    
    // Drift below this is treated as noise and shown green. One place to change it.
    const TAB_DRIFT_TOLERANCE = 1.00;
    
    function calculateRunningTabs() {
      var prev = previousDayTabBalance || 0;
      var gross = parseFloat(document.getElementById('grossOnTill').value) || 0;
      var net   = parseFloat(document.getElementById('netOnTill').value) || 0;

      // Tab change is ENTRY-driven now (X reading or +/-), held in the hidden
      // 'tabs' field by applyTabEntry(). This function only refreshes displays;
      // it must never overwrite 'tabs'.
      var tabChange = parseFloat(document.getElementById('tabs').value) || 0;
      var newBalance = prev + tabChange;

      var newBalanceEl = document.getElementById('newTabBalance');
      if (newBalanceEl) {
        newBalanceEl.textContent = '£' + newBalance.toFixed(2);
        newBalanceEl.style.background = '#f5f5f5';
        newBalanceEl.style.borderColor = '#e0e0e0';
        newBalanceEl.style.color = '#333';
      }

      // Cross-check: the entered tab change vs the till's own Gross - Net.
      // (With auto-fill, X reading and Expected Balance agree by construction,
      // so Gross - Net is the meaningful independent check.)
      var grossNet = gross - net;
      var diff = tabChange - grossNet;
      var hasTill = !(gross === 0 && net === 0);
      var text, cls, note;
      if (!hasTill) {
        text = '-'; cls = 'calculated-value';
        note = 'Enter Gross and Net to cross-check against the till';
      } else if (Math.abs(diff) < TAB_DRIFT_TOLERANCE) {
        text = 'MATCHES TILL ✅'; cls = 'calculated-value success';
        note = 'Your tab change agrees with the till (Gross - Net)';
      } else {
        text = '£' + Math.abs(diff).toFixed(2) + (diff > 0 ? ' HIGHER' : ' LOWER') + ' ⚠️';
        cls = 'calculated-value warning';
        note = 'Entered change £' + tabChange.toFixed(2) + ' vs till Gross - Net £' + grossNet.toFixed(2) +
               '. Your cash count is unaffected - re-check the reading or previous balance and flag to Charlie.';
      }
      var driftEl   = document.getElementById('tabDrift');
      var driftHelp = document.getElementById('tabDriftHelp');
      var checkerEl = document.getElementById('tabChecker');
      if (driftEl)   { driftEl.textContent = text; driftEl.className = cls; }
      if (driftHelp) { driftHelp.textContent = note; }
      if (checkerEl) { checkerEl.textContent = text; checkerEl.className = cls; }

      var runningTabsEl = document.getElementById('runningTabs');
      if (runningTabsEl) {
        runningTabsEl.textContent = '£' + prev.toFixed(2) + ' -> £' + newBalance.toFixed(2) + ' (change: £' + tabChange.toFixed(2) + ')';
      }
    }
    
    function calculateSalesVsReceived() {
      // Daily Out = (Gross - Tabs) - ((Card Total - Rooms Card) + Cash less Float less Rooms Cash)
      // Sheet column Q: (L-O)-((K-S)+E) where E = D - 130 - U.
      const grossOnTill = parseFloat(document.getElementById('grossOnTill').value) || 0;
      const tabs = parseFloat(document.getElementById('tabs').value) || 0;
      const pdq1 = parseFloat(document.getElementById('pdq1').value) || 0;
      const pdq2 = parseFloat(document.getElementById('pdq2').value) || 0;
      const pdqRooms = parseFloat(document.getElementById('pdqRooms').value) || 0;
      const cashInTill = parseFloat(document.getElementById('cashInTill').value) || 0;
      const cashRooms = parseFloat(document.getElementById('cashRooms').value) || 0;

      const cardTotal = pdq1 + pdq2;
      const float = 130;
      const cashLessFloat = cashInTill - float - cashRooms;

      const salesMade = grossOnTill - tabs;
      const paymentsReceived = (cardTotal - pdqRooms) + cashLessFloat;
      const dailyOut = salesMade - paymentsReceived;     // column Q

      // Receipts logged today explain part (ideally all) of Daily Out.
      const receiptsTotal = sumReceipts();
      const unexplained = dailyOut - receiptsTotal;

      // Receipts-section reconciliation lines
      var elOut = document.getElementById('recDailyOut');
      var elLog = document.getElementById('recLogged');
      var elUn  = document.getElementById('recUnexplained');
      if (elOut) elOut.textContent = '£' + dailyOut.toFixed(2);
      if (elLog) elLog.textContent = '£' + receiptsTotal.toFixed(2);
      if (elUn) {
        if (Math.abs(unexplained) < 0.01) {
          elUn.textContent = '£0.00 ✅';
          elUn.style.color = '#2e7d32';
        } else {
          elUn.textContent = '£' + Math.abs(unexplained).toFixed(2) + (unexplained > 0 ? ' short' : ' over');
          elUn.style.color = '#c0635a';
        }
      }

      // Validation verdict — the TRUE figure once receipts are accounted for
      const salesEl = document.getElementById('salesVsReceived');
      if (salesEl) {
        if (Math.abs(unexplained) < 0.01) {
          salesEl.textContent = '£0.00 ✅ Balanced';
          salesEl.className = 'calculated-value success';
        } else if (unexplained > 0) {
          salesEl.textContent = '£' + unexplained.toFixed(2) + ' ⚠️ SHORT';
          salesEl.className = 'calculated-value warning';
        } else {
          salesEl.textContent = '£' + Math.abs(unexplained).toFixed(2) + ' ℹ️ OVER';
          salesEl.className = 'calculated-value';
        }
      }
    }
    
    // -- Daily receipts (cash paid from the till) -----------------------------
    // Manager sees a friendly category picker + note + amount; each maps behind
    // the scenes to an expense row (24-41). These are already out of the till,
    // so they EXPLAIN today's Daily Out rather than being deducted again. They
    // are separate from the end-of-week receipts entered in the weekly form.
    function loadExpenseCategories() {
      google.script.run
        .withSuccessHandler(function(cats) { expenseCategories = cats || []; renderReceipts(); })
        .withFailureHandler(function() { expenseCategories = []; renderReceipts(); })
        .getExpenseCategories();
    }

    function catOptions(sel) {
      var html = '<option value="">Category…</option>';
      (expenseCategories || []).forEach(function(c) {
        var selAttr = (String(c.row) === String(sel)) ? ' selected' : '';
        html += '<option value="' + c.row + '"' + selAttr + '>' + (c.icon ? c.icon + ' ' : '') + c.name + '</option>';
      });
      return html;
    }

    function addReceiptRow(cat, desc, amt) {
      var container = document.getElementById('receiptRows');
      if (!container) return;
      var row = document.createElement('div');
      row.className = 'receipt-row';
      row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
      var descVal = desc ? String(desc).replace(/"/g, '&quot;') : '';
      var amtVal = (amt && parseFloat(amt)) ? Number(amt).toFixed(2) : '';
      row.innerHTML =
        '<select class="ps-input receipt-cat" style="flex:1.3;min-width:0;" onchange="calculateAll()">' + catOptions(cat) + '</select>' +
        '<input class="ps-input receipt-desc" type="text" placeholder="Note (optional)" style="flex:1;min-width:0;" value="' + descVal + '">' +
        '<div class="ps-input-with-prefix" style="flex:0.9;min-width:0;"><span class="ps-input-prefix">£</span>' +
        '<input class="ps-input receipt-amt" type="number" step="0.01" placeholder="0.00" value="' + amtVal + '" oninput="calculateAll()"></div>' +
        '<button type="button" class="receipt-remove" onclick="removeReceiptRow(this)" aria-label="Remove" style="flex:0 0 auto;background:none;border:none;color:#c0635a;font-size:18px;line-height:1;cursor:pointer;padding:4px 8px;">\u2715</button>';
      container.appendChild(row);
    }

    function removeReceiptRow(btn) {
      var row = btn.closest('.receipt-row');
      if (row && row.parentNode) row.parentNode.removeChild(row);
      calculateAll();
    }

    function seedReceipts(list) {
      dayReceipts = Array.isArray(list) ? list : [];
      renderReceipts();
    }

    function renderReceipts() {
      var container = document.getElementById('receiptRows');
      if (!container) return;
      if (expenseCategories === null) return; // categories not loaded yet; re-render when they arrive
      container.innerHTML = '';
      dayReceipts.forEach(function(r) { addReceiptRow(r.cat, r.desc, r.amt); });
      if (typeof calculateAll === 'function') calculateAll();
    }

    function sumReceipts() {
      var t = 0;
      document.querySelectorAll('#receiptRows .receipt-amt').forEach(function(el) {
        t += parseFloat(el.value) || 0;
      });
      return Math.round(t * 100) / 100;
    }

    function collectReceipts() {
      var out = [];
      document.querySelectorAll('#receiptRows .receipt-row').forEach(function(rw) {
        var cat = parseInt(rw.querySelector('.receipt-cat').value, 10);
        var amt = parseFloat(rw.querySelector('.receipt-amt').value) || 0;
        var desc = rw.querySelector('.receipt-desc').value || '';
        if (cat >= 24 && cat <= 41 && amt > 0) {
          out.push({ cat: cat, desc: desc.trim(), amt: Math.round(amt * 100) / 100 });
        }
      });
      return out;
    }

    // -- Tab dual-entry (X reading  <->  +/- change) --------------------------
    // Either field can be filled; the other auto-fills and LOCKS. Clearing the
    // manual field unlocks both so the method can be switched. Column O always
    // saves the tab change (hidden 'tabs'): typed directly, or X - previous.
    function setTabLocked(el, locked) {
      if (!el) return;
      el.disabled = locked;
      el.style.background = locked ? '#efece6' : '';
      el.style.color = locked ? '#8a8480' : '';
      el.style.cursor = locked ? 'not-allowed' : '';
      // Keep the +/- sign toggle in step with the Tab Change field's lock state.
      if (el.id === 'tabChangeInput') {
        var signBtn = document.getElementById('tabChangeSignBtn');
        if (signBtn) {
          signBtn.disabled = locked;
          signBtn.style.opacity = locked ? '0.4' : '';
          signBtn.style.cursor = locked ? 'not-allowed' : 'pointer';
        }
      }
    }

    // Flip the sign of the Tab Change field. Needed because the mobile numeric
    // keypad has no minus key, so managers cannot type a negative directly.
    // Enter the amount, then tap ± to make it negative (or back to positive).
    function toggleTabChangeSign() {
      var tc = document.getElementById('tabChangeInput');
      if (!tc || tc.disabled) return;
      var v = parseFloat(tc.value);
      if (isNaN(v)) return;               // nothing entered yet — nothing to flip
      var flipped = -v;
      if (flipped === 0) flipped = 0;     // avoid "-0.00"
      tc.value = flipped.toFixed(2);
      tabSource = 'change';               // a sign edit is a manual Tab Change entry
      applyTabEntry();
    }

    function onXReadingInput() {
      var v = (document.getElementById('xReading').value || '').trim();
      if (v !== '') tabSource = 'x';
      else if (tabSource === 'x') tabSource = null;
      applyTabEntry();
    }

    function onTabChangeInput() {
      var v = (document.getElementById('tabChangeInput').value || '').trim();
      // A lone minus is a valid start of a negative figure — do not treat as empty
      // (type=number otherwise reports "" and applyTabEntry would wipe the field).
      if (v === '-' || v === '+' || v === '.' || v === '-.') {
        tabSource = 'change';
        return;
      }
      if (v !== '') tabSource = 'change';
      else if (tabSource === 'change') tabSource = null;
      applyTabEntry();
    }

    function applyTabEntry() {
      var xEl  = document.getElementById('xReading');
      var tcEl = document.getElementById('tabChangeInput');
      var tabsEl = document.getElementById('tabs');
      if (!xEl || !tcEl || !tabsEl) return;
      var prev = previousDayTabBalance || 0;

      if (tabSource === 'x') {
        var xv = parseFloat(xEl.value) || 0;
        var change = xv - prev;
        setTabLocked(xEl, false);
        setTabLocked(tcEl, true);
        tcEl.value = change.toFixed(2);
        tabsEl.value = change.toFixed(2);
      } else if (tabSource === 'change') {
        var raw = (tcEl.value || '').trim();
        if (raw === '-' || raw === '+' || raw === '.' || raw === '-.') return;
        var cv = parseFloat(tcEl.value);
        if (isNaN(cv)) cv = 0;
        setTabLocked(tcEl, false);
        setTabLocked(xEl, true);
        xEl.value = (prev + cv).toFixed(2);
        tabsEl.value = cv.toFixed(2);
      } else {
        setTabLocked(xEl, false);
        setTabLocked(tcEl, false);
        xEl.value = '';
        tcEl.value = '';
        tabsEl.value = '';
      }
      calculateAll();
    }

    // -- Card adjustments (bank transfers / cash-back) ------------------------
    // Bank transfer nets against the week's card takings (Xero C6 via W14);
    // cash-back self-balances and is recorded only. Amounts are always positive;
    // direction/method is carried by the dropdown value.
    function cardAdjMethodOptions(sel) {
      var opts = [['', 'Type...'], ['transfer_out', 'Bank transfer - refund out'],
                  ['transfer_in', 'Bank transfer - money in'], ['cashback', 'Cash back (card up, cash out)']];
      var html = '';
      for (var i = 0; i < opts.length; i++) {
        var s = (opts[i][0] === String(sel)) ? ' selected' : '';
        html += '<option value="' + opts[i][0] + '"' + s + '>' + opts[i][1] + '</option>';
      }
      return html;
    }

    function addCardAdjRow(method, amt, reason) {
      var c = document.getElementById('cardAdjRows');
      if (!c) return;
      var row = document.createElement('div');
      row.className = 'cardadj-row';
      row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
      var rv = reason ? String(reason).replace(/"/g, '&quot;') : '';
      var av = (amt && parseFloat(amt)) ? Number(amt).toFixed(2) : '';
      row.innerHTML =
        '<select class="ps-input cardadj-method" style="flex:1.4;min-width:0;" onchange="updateCardAdjSummary()">' + cardAdjMethodOptions(method || '') + '</select>' +
        '<div class="ps-input-with-prefix" style="flex:0.8;min-width:0;"><span class="ps-input-prefix">£</span>' +
        '<input class="ps-input cardadj-amt" type="number" step="0.01" placeholder="0.00" value="' + av + '" oninput="updateCardAdjSummary()"></div>' +
        '<input class="ps-input cardadj-reason" type="text" placeholder="Reason" style="flex:1.1;min-width:0;" value="' + rv + '">' +
        '<button type="button" class="cardadj-remove" onclick="removeCardAdjRow(this)" aria-label="Remove" style="flex:0 0 auto;background:none;border:none;color:#c0635a;font-size:18px;line-height:1;cursor:pointer;padding:4px 8px;">✕</button>';
      c.appendChild(row);
    }

    function removeCardAdjRow(btn) {
      var row = btn.closest('.cardadj-row');
      if (row && row.parentNode) row.parentNode.removeChild(row);
      updateCardAdjSummary();
    }

    function seedCardAdjustments(list) {
      dayCardAdjustments = Array.isArray(list) ? list : [];
      renderCardAdjustments();
    }

    function renderCardAdjustments() {
      var c = document.getElementById('cardAdjRows');
      if (!c) return;
      c.innerHTML = '';
      dayCardAdjustments.forEach(function(x) { addCardAdjRow(x.method, x.amt, x.reason); });
      updateCardAdjSummary();
    }

    function updateCardAdjSummary() {
      var tNet = 0, cSum = 0;
      document.querySelectorAll('#cardAdjRows .cardadj-row').forEach(function(rw) {
        var m = rw.querySelector('.cardadj-method').value;
        var a = parseFloat(rw.querySelector('.cardadj-amt').value) || 0;
        if (m === 'transfer_out') tNet += a;
        else if (m === 'transfer_in') tNet -= a;
        else if (m === 'cashback') cSum += a;
      });
      var te = document.getElementById('caTransferNet');
      var ce = document.getElementById('caCashback');
      if (te) te.textContent = '£' + tNet.toFixed(2);
      if (ce) ce.textContent = '£' + cSum.toFixed(2);
    }

    function collectCardAdjustments() {
      var out = [];
      document.querySelectorAll('#cardAdjRows .cardadj-row').forEach(function(rw) {
        var m = rw.querySelector('.cardadj-method').value;
        var a = parseFloat(rw.querySelector('.cardadj-amt').value) || 0;
        var reason = rw.querySelector('.cardadj-reason').value || '';
        if (['transfer_out', 'transfer_in', 'cashback'].indexOf(m) !== -1 && a > 0) {
          out.push({ method: m, amt: Math.round(a * 100) / 100, reason: reason.trim() });
        }
      });
      return out;
    }

    function resetForm() {
      showStyledConfirm('Clear all unsaved data?', 'Reset Form', '🔄', function() {
        document.querySelectorAll('input, textarea').forEach(el => el.value = '');
        tabSource = null;
        applyTabEntry();
        calculateAll();
      });
    }
    
    function returnToMainMenu() {
      showStyledConfirm('Return to Main Menu? Unsaved changes will be lost.', 'Return to Menu', '🏠', function() {
        if (webAppUrl) {
          navigateApp('?page=menu');
        }
      });
    }
    
    function saveDay() {
      // -----------------------------------------------------------------
      // COMPULSORY FIELD VALIDATION
      // -----------------------------------------------------------------
      const errors = [];

      const netOnTillVal    = document.getElementById('netOnTill').value;
      const grossOnTillVal  = document.getElementById('grossOnTill').value;
      const itemVoidVal     = document.getElementById('itemVoid').value;
      const tabsVal         = document.getElementById('tabs').value;
      const cashInTillVal   = document.getElementById('cashInTill').value;
      const pdq1Val         = document.getElementById('pdq1').value;
      const pdq2Val         = document.getElementById('pdq2').value;
      const actualToSafeVal = document.getElementById('actualToSafe').value;

      if (netOnTillVal === ''   || parseFloat(netOnTillVal)   <= 0) errors.push('• Net on Till (must be greater than 0)');
      if (grossOnTillVal === '' || parseFloat(grossOnTillVal) <= 0) errors.push('• Gross on Till (must be greater than 0)');
      if (itemVoidVal === '')                                       errors.push('• Item Void (enter 0 if no voids)');
      if (tabsVal === '')                                           errors.push('• Tab Change (enter 0 if no tab activity)');
      if (cashInTillVal === '' || parseFloat(cashInTillVal) <= 0)   errors.push('• Total Cash in Till (must be greater than 0)');
      if (pdq1Val === ''       || parseFloat(pdq1Val)       <= 0)   errors.push('• PDQ 1 (must be greater than 0)');
      if (pdq2Val === '')                                           errors.push('• PDQ 2 (enter 0 if not used)');

      // Actual Amount to Safe — any number (incl. negative/zero) but must be within £100 of calculated
      if (actualToSafeVal === '' || isNaN(parseFloat(actualToSafeVal))) {
        errors.push('• Actual Amount to Safe (must be entered)');
      } else {
        const cashInTillNum  = parseFloat(cashInTillVal) || 0;
        const cashRoomsNum   = parseFloat(document.getElementById('cashRooms').value) || 0;
        const float          = 130;
        const cashLessFloat  = cashInTillNum - float - cashRoomsNum;
        const cashToNearest5 = Math.round(cashLessFloat / 5) * 5;
        const actualToSafe   = parseFloat(actualToSafeVal);
        const variance       = Math.abs(actualToSafe - cashToNearest5);
        if (variance > 100) {
          errors.push('• Actual Amount to Safe is £' + variance.toFixed(2) +
                      ' off the calculated £' + cashToNearest5.toFixed(2) +
                      ' — please re-check the count (must be within £100)');
        }
      }

      // Receipts: an amount needs a category, and a category needs an amount
      document.querySelectorAll('#receiptRows .receipt-row').forEach(function(rw) {
        var c = rw.querySelector('.receipt-cat').value;
        var a = parseFloat(rw.querySelector('.receipt-amt').value) || 0;
        if (a > 0 && !c) errors.push('• A receipt has an amount but no category chosen');
        if (c && a <= 0) errors.push('• A receipt has a category but no amount');
      });

      // Card adjustments: an amount needs a type, and a type needs an amount
      document.querySelectorAll('#cardAdjRows .cardadj-row').forEach(function(rw) {
        var m = rw.querySelector('.cardadj-method').value;
        var a = parseFloat(rw.querySelector('.cardadj-amt').value) || 0;
        if (a > 0 && !m) errors.push('• A card adjustment has an amount but no type chosen');
        if (m && a <= 0) errors.push('• A card adjustment has a type but no amount');
      });

      if (errors.length > 0) {
        showStyledAlert('Please fix the following before saving:\\n\\n' + errors.join('\\n'),
                        'warning', 'Required Fields');
        return;
      }

      // -----------------------------------------------------------------
      // BUILD DATA OBJECT — all monetary values rounded to whole pence
      // -----------------------------------------------------------------
      const r2 = v => Math.round((parseFloat(v) || 0) * 100) / 100;

      const data = {
        weekSheet:     currentWeekSheet,
        row:           currentDayRow,
        grossOnTill:   r2(document.getElementById('grossOnTill').value),
        netOnTill:     r2(document.getElementById('netOnTill').value),
        tabs:          r2(document.getElementById('tabs').value),
        itemVoid:      r2(document.getElementById('itemVoid').value),
        cash:          r2(document.getElementById('cashInTill').value),
        pdq1:          r2(document.getElementById('pdq1').value),
        pdq2:          r2(document.getElementById('pdq2').value),
        pdqRooms:      r2(document.getElementById('pdqRooms').value),
        cashRooms:     r2(document.getElementById('cashRooms').value),
        actualToSafe:  r2(document.getElementById('actualToSafe').value),
        dailyOutNotes: document.getElementById('dailyOutNotes').value,  // Goes to column H
        salesNotes:    document.getElementById('salesNotes').value,     // Goes to column R
        receipts:      collectReceipts(),                              // Daily receipts (cash from till)
        cardAdjustments: collectCardAdjustments()                      // Bank transfers / cash-back
      };

      startLoadCreep();

      google.script.run
        .withSuccessHandler(function() {
          setLoadProgress(100);
          
          const nextDayIndex = currentDayIndex + 1;
          if (nextDayIndex < 7) {
            const nextDayName = weekDates[nextDayIndex].displayDate;
            showNextStepDialog(nextDayIndex, nextDayName);
          } else {
            showStyledAlert('All 7 days complete! 🎉\\n\\nReturning to Main Menu...', 'success', 'Week Complete!', function() {
              setTimeout(function() {
                if (webAppUrl) {
                  navigateApp('?page=menu');
                }
              }, 1000);
            });
          }
        })
        .withFailureHandler(function(error) {
          setLoadProgress(100);
          showStyledAlert('Save failed: ' + error.message, 'error');
        })
        .saveDayData(data);
    }
    
    function showNextStepDialog(nextDayIndex, nextDayName) {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
      
      // Create dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = 'background: white; padding: 30px; border-radius: 15px; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);';
      
      dialog.innerHTML = \`
        <h2 style="color: #366092; margin-bottom: 15px; text-align: center;">✅ Day Saved!</h2>
        <p style="text-align: center; margin-bottom: 25px; font-size: 16px; color: #666;">What would you like to do next?</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="goToNextDay(\${nextDayIndex})" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 20px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
            ➡️ Go to Next Day<br>
            <span style="font-size: 14px; opacity: 0.9;">\${nextDayName}</span>
          </button>
          <button onclick="closeDialogAndReturnToMenu()" style="background: white; color: #366092; border: 2px solid #366092; padding: 15px 20px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
            🏠 Return to Main Menu
          </button>
        </div>
      \`;
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
    }
    
    function goToNextDay(nextDayIndex) {
      // Remove dialog
      const overlay = document.querySelector('div[style*="position: fixed"]');
      if (overlay) overlay.remove();
      
      // Reset form
      document.querySelectorAll('input, textarea').forEach(el => el.value = '');
      
      // Update current day
      currentDayIndex = nextDayIndex;
      currentDayRow = 7 + nextDayIndex;
      
      // Update banner
      document.getElementById('currentDayDisplay').textContent = weekDates[nextDayIndex].displayDate;
      showHospitalityYarnForDay(weekDates[nextDayIndex]);
      
      // Load day data
      loadDayData();
      
      // Scroll to top
      window.scrollTo(0, 0);
    }
    
    function closeDialogAndReturnToMenu() {
      // Remove dialog
      const overlay = document.querySelector('div[style*="position: fixed"]');
      if (overlay) overlay.remove();
      
      // Return to menu
      returnToMainMenu();
    }
  
</script>

<script>

    function showStyledAlert(message, type, title, callback) {
      var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      var titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
      type = type || 'success';
      
      document.getElementById('alertIcon').textContent = icons[type] || '✅';
      document.getElementById('alertTitle').textContent = title || titles[type] || 'Notice';
      document.getElementById('alertMessage').innerHTML = message.replace(/\\n/g, '<br>');
      
      var btn = document.getElementById('alertButton');
      btn.className = 'modal-button ' + type;
      btn.onclick = function() { closeStyledAlert(); if(callback) callback(); };
      
      document.getElementById('styledAlert').classList.add('show');
    }

    function closeStyledAlert() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
    }
    
    var confirmCallback = null;
    
    function showStyledConfirm(message, title, icon, onConfirm) {
      document.getElementById('alertIcon').textContent = icon || '❓';
      document.getElementById('alertTitle').textContent = title || 'Confirm';
      document.getElementById('alertMessage').innerHTML = message.replace(/\\n/g, '<br>');
      confirmCallback = onConfirm;
      
      document.getElementById('alertButton').outerHTML = '<div id="confirmButtons" class="confirm-buttons"><button class="modal-button cancel" onclick="handleConfirmNo()">Cancel</button><button class="modal-button" onclick="handleConfirmYes()">Confirm</button></div>';
      document.getElementById('styledAlert').classList.add('show');
    }
    
    function handleConfirmYes() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
      if (confirmCallback) { confirmCallback(); confirmCallback = null; }
    }
    
    function handleConfirmNo() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
      confirmCallback = null;
    }
    
    function resetAlertButton() {
      var btns = document.getElementById('confirmButtons');
      if (btns) { btns.outerHTML = '<button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>'; }
    }

</script>

<script>
(function(){document.addEventListener("touchmove",function(e){},{passive:true});document.body.style.overflowY="scroll";document.body.style.webkitOverflowScrolling="touch";document.body.style.height="auto";document.documentElement.style.height="auto";document.documentElement.style.overflow="auto";})()
</script>


<script>
  try { if (window.self !== window.top) document.documentElement.classList.add('iframed'); }
  catch (e) { document.documentElement.classList.add('iframed'); }
</script>

</body>
</html>
`;

const WEEKLY_FORM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>Weekly Cash Up — __VENUE_FULL__</title>
  __SHARED_STYLES__
  <style>
    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(26, 24, 20, 0.55);
      z-index: 9999;
      justify-content: center; align-items: center;
    }
    .modal-overlay.show { display: flex; }
    .modal-box {
      background: var(--white-warm);
      padding: 32px 28px;
      border-radius: var(--r);
      max-width: 420px; width: 90%;
      text-align: center;
      box-shadow: 0 12px 36px rgba(26, 24, 20, 0.2);
      border: 1px solid var(--line);
    }
    .modal-icon { font-size: 40px; margin-bottom: 14px; }
    .modal-title { font-family: var(--serif); font-weight: 500; color: var(--ink); font-size: 22px; margin-bottom: 12px; }
    .modal-message { color: var(--ink-soft); font-size: 14px; line-height: 1.6; margin-bottom: 22px; text-align: left; white-space: pre-line; }
    .modal-buttons { display: flex; gap: 10px; justify-content: center; }
    .modal-button { background: var(--ink); color: var(--paint); border: 0; padding: 11px 22px; border-radius: var(--r); font-family: var(--sans); font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
    .modal-button:hover { background: #000; }
    .modal-button.cancel { background: var(--white-warm); color: var(--ink); border: 1px solid var(--line); }
    .modal-button.cancel:hover { background: var(--paint-wash); }

    /* Loading overlay */
    .loading-overlay {
      display: none;
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(251, 248, 242, 0.92);
      z-index: 9998;
      justify-content: center; align-items: center;
    }
    .loading-overlay.show { display: flex; }
    .spinner { border: 3px solid var(--line); border-top-color: var(--ink); border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Read-only auto-calc inputs (Daily Totals section) */
    .ps-input[readonly] {
      background: var(--paint-wash);
      border-color: var(--paint-pale);
      color: var(--ink);
      font-weight: 600;
      cursor: not-allowed;
    }

    /* Expense categories - v4 redesign */
    .expense-category {
      background: var(--white-warm);
      border: 1px solid var(--line);
      border-radius: var(--r);
      padding: 14px 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .expense-category:hover { border-color: var(--paint); }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 4px 0;
    }
    .category-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .category-total {
      font-family: var(--mono);
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
    }
    .expense-items {
      margin-top: 12px;
      display: none;
      padding-top: 10px;
      border-top: 1px solid var(--line);
    }
    .expense-items.expanded { display: block; }
    .expense-item {
      display: grid;
      grid-template-columns: 1fr 110px 36px;
      gap: 8px;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--line);
    }
    .expense-item:last-child { border-bottom: 0; }
    .expense-item input[type="text"],
    .expense-item input[type="number"] {
      padding: 8px 10px;
      border: 1px solid var(--line);
      border-radius: 6px;
      font-family: var(--sans);
      font-size: 13px;
      color: var(--ink);
      background: white;
    }
    .expense-item input:focus { outline: 0; border-color: var(--ink); }
    .btn-remove-item {
      width: 30px; height: 30px;
      padding: 0;
      background: var(--white-warm);
      color: var(--ink);
      border: 1px solid var(--line);
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }
    .btn-remove-item:hover { background: var(--paint-wash); border-color: var(--paint); }
    .btn-add-item {
      margin-top: 10px;
      padding: 8px 14px;
      background: var(--white-warm);
      color: var(--ink);
      border: 1px dashed var(--line);
      border-radius: 6px;
      font-family: var(--sans);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    }
    .btn-add-item:hover { border-color: var(--ink); background: var(--paint-wash); }

    /* Total expense banner */
    .grand-total-banner {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 14px 16px;
      background: var(--ink);
      color: var(--paint);
      border-radius: var(--r);
      margin: 12px 0 20px;
    }
    .grand-total-banner .label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .grand-total-banner .value {
      font-family: var(--mono);
      font-size: 20px;
      font-weight: 700;
    }

    /* Outstanding banner (cash carry-forward warning) */
    .outstanding-banner {
      padding: 14px 16px;
      background: #fbf3e7;
      border: 1px solid #d4a574;
      border-radius: var(--r);
      margin-bottom: 14px;
    }
    .outstanding-banner .label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #8a5a2a;
      margin-bottom: 6px;
    }
    .outstanding-banner .amount {
      font-family: var(--mono);
      font-size: 22px;
      font-weight: 700;
      color: #8a5a2a;
    }
    .outstanding-banner .help {
      font-size: 13px;
      color: var(--ink-soft);
      margin-top: 8px;
    }

    .suggested-banner {
      padding: 10px 14px;
      background: var(--paint-wash);
      border: 1px solid var(--paint-pale);
      border-radius: var(--r);
      font-size: 13px;
      color: var(--ink-soft);
      margin-bottom: 14px;
    }

    textarea.notes-input {
      width: 100%;
      min-height: 100px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: var(--r);
      font-family: var(--sans);
      font-size: 14px;
      color: var(--ink);
      background: var(--white-warm);
      resize: vertical;
      box-sizing: border-box;
    }
    textarea.notes-input:focus { outline: 0; border-color: var(--ink); }
  </style>
<style>
  /* Iframe context: hide ps-header when loaded in portal */
  /* ps-header shown in all contexts including iframe (venue branding) */
  html.iframed .ps-main { padding-top: 12px !important; }
</style>
</head>
<body>
__VARLO_BOOT__


__VARLO_HEADER_MENU__

<main class="ps-main">

  <section class="ps-hero">
    <div class="ps-hero-eyebrow">Week Ending <span id="weekEnding">—</span></div>
    <h1 class="ps-hero-title">Weekly Cash Up</h1>
    <div class="ps-hero-subtitle"><span id="weekRange">Loading…</span></div>
  </section>

  <!-- 01. DAILY TOTALS (auto-calculated) -->
  <div class="ps-section-head">
    <span class="ps-section-num">01</span>
    <h2 class="ps-section-title">Daily Totals</h2>
  </div>
  <section class="ps-card">
    <div class="ps-hint" style="margin-bottom: 12px;">Auto-calculated from daily entries.</div>
    <div class="ps-field">
      <label class="ps-label">Cash to Safe</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="cashToSafe" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Actual Cash to Safe</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="actualCashToSafe" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Card Total</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="cardTotal" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Tabs</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="tabs" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Daily Out</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="dailyOut" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Rooms Card</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="roomsCard" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Room Cash</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="roomCash" step="0.01" readonly>
      </div>
    </div>
  </section>

  <!-- 02. TOUCHOFFICE WEEKLY DATA -->
  <div class="ps-section-head">
    <span class="ps-section-num">02</span>
    <h2 class="ps-section-title">TouchOffice Weekly Data</h2>
  </div>
  <section class="ps-card">
    <div class="ps-field">
      <label class="ps-label" for="wetSales">Wet Sales <span style="color:#c0635a;">*</span></label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="wetSales" step="0.01" placeholder="0.00" oninput="calculateTouchOffice()">
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label" for="foodSales">Food Sales <span style="color:#c0635a;">*</span></label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="foodSales" step="0.01" placeholder="0.00" oninput="calculateTouchOffice()">
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label" for="grossSales">Gross Sales <span style="color:#c0635a;">*</span></label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="grossSales" step="0.01" placeholder="0.00" oninput="calculateTouchOffice()">
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label" for="netSales">Net Sales <span style="color:#c0635a;">*</span></label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="netSales" step="0.01" placeholder="0.00" oninput="calculateTouchOffice()">
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Gross Difference</label>
      <input class="ps-input" type="text" id="grossDifference" readonly>
    </div>
    <div class="ps-field">
      <label class="ps-label">Net Difference</label>
      <input class="ps-input" type="text" id="netDifference" readonly>
    </div>
  </section>

  <!-- 03. WEEKLY EXPENSES BY CATEGORY -->
  <div class="ps-section-head">
    <span class="ps-section-num">03</span>
    <h2 class="ps-section-title">Weekly Expenses</h2>
  </div>
  <section class="ps-card">
    <div id="expenseCategoriesContainer"></div>
    <div class="grand-total-banner">
      <span class="label">Total Expenses</span>
      <span class="value" id="grandTotalExpenses">£0.00</span>
    </div>
  </section>

  <!-- 04. TOTAL FIGURES -->
  <div class="ps-section-head">
    <span class="ps-section-num">04</span>
    <h2 class="ps-section-title">Total Figures</h2>
  </div>
  <section class="ps-card">
    <div class="ps-field">
      <label class="ps-label">Daily Cash After Expenses</label>
      <input class="ps-input" type="text" id="actualDailyCashAfterExpenses" readonly>
      <input type="hidden" id="actualDailyCashAfterExpensesRaw">
    </div>

    <div id="outstandingBanner" class="outstanding-banner" style="display:none;">
      <div class="label">⚠️ Outstanding Cash Carried Forward</div>
      <div class="amount" id="outstandingAmount">£0.00</div>
      <div class="help">From previous week. Subtract this from Cash to Charlie if you've already banked it.</div>
    </div>

    <div class="suggested-banner">
      💡 <strong>Suggested Cash to Charlie:</strong> <span id="suggestedCash">£0.00</span>
    </div>

    <div class="ps-field">
      <label class="ps-label" for="cashToCharlie">Cash to Charlie <span style="color:#c0635a;">*</span></label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="cashToCharlie" step="0.01" placeholder="0.00" oninput="calculateTotalFigures()">
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Difference (Cash to Charlie vs Calculated)</label>
      <input class="ps-input" type="text" id="differenceCashToCharlie" readonly>
    </div>
    <div class="ps-field">
      <label class="ps-label">Daily Cash Short</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="dailyCashShort" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Weekly Sales Difference</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="weeklyDifferenceSales" step="0.01" readonly>
      </div>
    </div>
    <div class="ps-field">
      <label class="ps-label">Tab → Net Difference</label>
      <div class="ps-input-with-prefix">
        <span class="ps-input-prefix">£</span>
        <input class="ps-input" type="number" id="tabToNetDiff" step="0.01" readonly>
      </div>
    </div>
  </section>

  <!-- 05. WEEKLY NOTES -->
  <div class="ps-section-head">
    <span class="ps-section-num">05</span>
    <h2 class="ps-section-title">Weekly Notes</h2>
  </div>
  <section class="ps-card">
    <div class="ps-field">
      <label class="ps-label" for="weeklyNotes">Notes (optional)</label>
      <textarea class="notes-input" id="weeklyNotes" placeholder="Any notes for this week..."></textarea>
    </div>
  </section>

  <!-- Submit -->
  <div class="ps-bottom-cta" style="margin-top: 28px;">
    <button class="ps-btn ps-btn-primary ps-btn-block ps-btn-lg" onclick="saveWeeklyData()">Save Weekly Data</button>
    <button class="ps-btn ps-btn-secondary ps-btn-block" onclick="returnToMainMenu()" style="margin-top: 10px;">Cancel</button>
  </div>
</main>

<div class="modal-overlay" id="styledAlert">
  <div class="modal-box">
    <div class="modal-icon" id="alertIcon">ℹ️</div>
    <div class="modal-title" id="alertTitle">Notice</div>
    <div class="modal-message" id="alertMessage">—</div>
    <div class="modal-buttons">
      <button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>
    </div>
  </div>
</div>

<div class="loading-overlay" id="loadingOverlay">
  <div style="text-align:center;">
    <div class="spinner"></div>
    <div style="color: var(--ink-soft);">Saving…</div>
  </div>
</div>

<script>

    var passedWeekSheet = '__WEEK_SHEET__';
    var webAppUrl = '';

google.script.run
  .withSuccessHandler(function(url) {
    webAppUrl = url;
  })
  .getWebAppUrl();

// Navigation helper - works both in iframe (GitHub portal) and standalone
function navigateApp(queryString) {
  if (!webAppUrl) return;
  var fullUrl = webAppUrl + queryString;
  try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
  setTimeout(function() { window.location.href = fullUrl; }, 300);
}

let currentWeekSheet = '';
let expenseData = {};
let xeroExpenseAccounts = []; // Store Xero accounts for Custom Expense dropdown

// Category mapping to rows (Updated to 24-40)
    // Category mapping to rows (Updated to 24-40)
    // Category mapping - populated dynamically from sheet
    let categoryRows = {};
    let weekDailyReceipts = [];   // daily cash receipts logged this week (for the duplicate guard)
    let expenseCategories = [];
    let pendingExpenseDetails = null; // set if week data arrives before categories
    
    window.onload = function() {
  // Load week data immediately — do not wait on categories/Xero (those were
  // serialising the critical path and made freezes look permanent).
  loadWeeklyData();

  google.script.run
    .withSuccessHandler(function(categories) {
      expenseCategories = categories || [];
      try { buildExpenseCategories(expenseCategories); } catch (e) { console.error(e); }
      paintExpenseDetails(pendingExpenseDetails || expenseData);
    })
    .withFailureHandler(function(error) {
      console.error('Error loading categories:', error);
    })
    .getExpenseCategories();

  // Optional — never block the form
  try {
    google.script.run
      .withSuccessHandler(function(result) {
        if (result && result.success) {
          xeroExpenseAccounts = result.accounts;
        }
      })
      .withFailureHandler(function() {})
      .getXeroExpenseAccounts();
  } catch (e) {}
};

function buildExpenseCategories(categories) {
  const container = document.getElementById('expenseCategoriesContainer');
  if (!container) return;
  container.innerHTML = '';
  categoryRows = {};
  
  (categories || []).forEach(function(cat) {
    const catId = 'cat' + cat.row;
    categoryRows[catId] = cat.row;
    
    const div = document.createElement('div');
    div.className = 'expense-category';
    
    const isLastRow = cat.row === 41;
    if (isLastRow) {
      div.style.border = '2px solid #667eea';
    }
    
    div.innerHTML = \`
      <div class="category-header" onclick="toggleCategory('\${catId}')" \${isLastRow ? 'style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"' : ''}>
        <span class="category-title">\${cat.icon} \${cat.name} <span class="cell-ref">D\${cat.row}</span></span>
        <span class="category-total" id="total\${catId}">£0.00</span>
      </div>
      <div class="expense-items" id="\${catId}Items"></div>
      <button class="btn-add-item" onclick="addExpenseItem('\${catId}')">➕ Add Item</button>
      \${isLastRow ? '<p style="font-size: 12px; color: #64748b; margin-top: 8px; padding: 0 10px;">💡 Use this category for one-off or miscellaneous expenses</p>' : ''}
    \`;
    
    container.appendChild(div);
  });
}

function paintExpenseDetails(details) {
  if (!details || !Object.keys(categoryRows).length) {
    pendingExpenseDetails = details || pendingExpenseDetails;
    return;
  }
  pendingExpenseDetails = null;
  expenseData = details;
  for (let catId in categoryRows) {
    const row = categoryRows[catId];
    const itemsEl = document.getElementById(catId + 'Items');
    if (itemsEl) itemsEl.innerHTML = '';
    if (expenseData[row]) {
      expenseData[row].forEach(function(item) {
        addExpenseItem(catId, item.description, item.amount, item.accountCode || '', item.taxType || '');
      });
    }
  }
  try { calculateAllExpenseTotals(); } catch (e) {}
}
    
    function loadWeeklyData() {
      var rangeEl = document.getElementById('weekRange');
      if (rangeEl) rangeEl.textContent = 'Loading…';

      var loadTimer = setTimeout(function() {
        if (rangeEl && rangeEl.textContent.indexOf('Loading') !== -1) {
          rangeEl.textContent = 'Still loading — check your connection, or refresh';
        }
      }, 20000);

      google.script.run
        .withSuccessHandler(function(data) {
          clearTimeout(loadTimer);
          if (!data) {
            if (rangeEl) rangeEl.textContent = 'No week data returned';
            showStyledAlert('No week data returned', 'error');
            return;
          }

          if (data.status === 'APPROVED') {
            document.getElementById('weekEnding').textContent = data.weekEnding || '—';
            if (rangeEl) rangeEl.textContent = data.weekRange || 'This week is already approved';
            showStyledAlert('This week is already approved and cannot be edited.', 'info');
            return;
          }
          
          currentWeekSheet = data.weekSheet;
          
          // Set week info
          document.getElementById('weekEnding').textContent = data.weekEnding;
          document.getElementById('weekRange').textContent = data.weekRange;
          
          // Set daily totals (read-only from row 14)
          document.getElementById('cashToSafe').value = (data.cashToSafe || 0).toFixed(2);
          document.getElementById('actualCashToSafe').value = (data.actualCashToSafe || 0).toFixed(2);
          document.getElementById('cardTotal').value = (data.cardTotal || 0).toFixed(2);
          document.getElementById('tabs').value = (data.tabs || 0).toFixed(2);
          document.getElementById('dailyOut').value = (data.dailyOut || 0).toFixed(2);
          document.getElementById('roomsCard').value = (data.roomsCard || 0).toFixed(2);
          document.getElementById('roomCash').value = (data.roomCash || 0).toFixed(2);
          
          // Store these for validation calculations
          const grossOnTill = data.grossOnTill || 0;
          const netOnTill = data.netOnTill || 0;
          
          // Hidden fields to store L14 and M14 for validation
          if (!document.getElementById('grossOnTill')) {
            const hiddenGross = document.createElement('input');
            hiddenGross.type = 'hidden';
            hiddenGross.id = 'grossOnTill';
            hiddenGross.value = grossOnTill;
            document.body.appendChild(hiddenGross);
          } else {
            document.getElementById('grossOnTill').value = grossOnTill;
          }
          
          if (!document.getElementById('netOnTill')) {
            const hiddenNet = document.createElement('input');
            hiddenNet.type = 'hidden';
            hiddenNet.id = 'netOnTill';
            hiddenNet.value = netOnTill;
            document.body.appendChild(hiddenNet);
          } else {
            document.getElementById('netOnTill').value = netOnTill;
          }
          
          // Set TouchOffice data (rows 17-18) - ALL INPUTS NOW
          document.getElementById('wetSales').value = data.wetSales || '';
          document.getElementById('foodSales').value = data.foodSales || '';
          document.getElementById('grossSales').value = data.grossSales || '';
          document.getElementById('netSales').value = data.netSales || '';
          
          // Set Total Figures - store raw value first, then calculateTotalFigures will handle display
          const rawCashAfterExpenses = data.actualDailyCashAfterExpenses || 0;
          document.getElementById('actualDailyCashAfterExpensesRaw').value = rawCashAfterExpenses.toFixed(2);
          document.getElementById('cashToCharlie').value = data.cashToCharlie || '';
          document.getElementById('dailyCashShort').value = (data.dailyCashShort || 0).toFixed(2);
          document.getElementById('weeklyDifferenceSales').value = (data.weeklyDifferenceSales || 0).toFixed(2);
          document.getElementById('tabToNetDiff').value = (data.tabToNetDiff || 0).toFixed(2);
          
          // Load outstanding owner cash balance
          google.script.run
            .withSuccessHandler(function(outstanding) {
              if (outstanding && outstanding !== 0) {
                var banner = document.getElementById('outstandingBanner');
                var amountEl = document.getElementById('outstandingAmount');
                var suggestedEl = document.getElementById('suggestedCash');
                
                // Show banner (negative outstanding = owner is owed, so manager should deduct)
                banner.style.display = 'block';
                var absOutstanding = Math.abs(outstanding);
                amountEl.textContent = (outstanding < 0 ? '-' : '') + '£' + absOutstanding.toFixed(2);
                
                // Calculate suggested cash to Charlie
                var cashAvailable = parseFloat(document.getElementById('actualDailyCashAfterExpensesRaw').value) || 0;
                // If outstanding is negative (owner short-changed), reduce the cash to Charlie
                var suggested = cashAvailable + outstanding; // outstanding is negative, so this subtracts
                if (suggested < 0) suggested = 0;
                suggestedEl.textContent = '£' + suggested.toFixed(2);
              }
            })
            .withFailureHandler(function(err) {
              // Silently fail - banner just won't show
            })
            .getOwnerCashOutstanding();
          
          // Set weekly notes
          document.getElementById('weeklyNotes').value = data.weeklyNotes || '';
          weekDailyReceipts = data.dailyReceipts || [];
          
          // Load expense data (may arrive before categories — paintExpenseDetails handles that)
          if (data.expenseDetails) {
            var parsed = typeof data.expenseDetails === 'string'
              ? JSON.parse(data.expenseDetails)
              : data.expenseDetails;
            paintExpenseDetails(parsed);
          }
          
          // Calculate all values
          calculateTouchOffice();
          calculateTotalFigures();
          calculateAllExpenseTotals();
        })
        .withFailureHandler(function(error) {
          clearTimeout(loadTimer);
          var msg = (error && error.message) ? error.message : String(error);
          if (rangeEl) rangeEl.textContent = 'Failed to load: ' + msg;
          showStyledAlert('Error loading weekly data: ' + msg, 'error');
        })
        .getWeeklyDataForForm(passedWeekSheet || '');
    }
    
    function calculateTouchOffice() {
      // Get values
      const grossSales = parseFloat(document.getElementById('grossSales').value) || 0;
      const netSales = parseFloat(document.getElementById('netSales').value) || 0;
      const grossOnTill = parseFloat(document.getElementById('grossOnTill').value) || 0;
      const netOnTill = parseFloat(document.getElementById('netOnTill').value) || 0;
      
      // Calculate differences - H19 = IF(H17=L14,"CORRECT",L14-H17)
      const grossDiff = grossOnTill - grossSales;
      if (Math.abs(grossDiff) < 0.01) {
        document.getElementById('grossDifference').value = 'CORRECT';
        document.getElementById('grossDifference').style.color = '#10b981';
        document.getElementById('grossDifference').style.background = '#d1fae5';
      } else {
        document.getElementById('grossDifference').value = '£' + grossDiff.toFixed(2);
        document.getElementById('grossDifference').style.color = '#dc2626';
        document.getElementById('grossDifference').style.background = '#fee2e2';
      }
      
      // Calculate differences - H20 = IF(H18=M14,"CORRECT",M14-H18)
      const netDiff = netOnTill - netSales;
      if (Math.abs(netDiff) < 0.01) {
        document.getElementById('netDifference').value = 'CORRECT';
        document.getElementById('netDifference').style.color = '#10b981';
        document.getElementById('netDifference').style.background = '#d1fae5';
      } else {
        document.getElementById('netDifference').value = '£' + netDiff.toFixed(2);
        document.getElementById('netDifference').style.color = '#dc2626';
        document.getElementById('netDifference').style.background = '#fee2e2';
      }
    }
    
    function calculateTotalFigures() {
      // Get raw value (stored in hidden field)
      const rawValue = parseFloat(document.getElementById('actualDailyCashAfterExpensesRaw').value) || 0;
      
      // Round to nearest £5
      const roundedValue = Math.round(rawValue / 5) * 5;
      
      // Display rounded value
      document.getElementById('actualDailyCashAfterExpenses').value = roundedValue.toFixed(2);
      
      // Get cash to Charlie input
      const cashToCharlie = parseFloat(document.getElementById('cashToCharlie').value) || 0;
      
      // Calculate difference between rounded value and cash to Charlie
      const difference = roundedValue - cashToCharlie;
      
      // Check if within £5 tolerance (i.e., difference is 0 when both are rounded to nearest £5)
      const differenceCashField = document.getElementById('differenceCashToCharlie');
      if (Math.abs(difference) < 0.01) {
        // Exact match
        differenceCashField.value = 'Correct';
        differenceCashField.style.color = '#10b981';
        differenceCashField.style.background = '#d1fae5';
      } else {
        // Show the difference amount
        differenceCashField.value = '£' + difference.toFixed(2);
        differenceCashField.style.color = '#dc2626';
        differenceCashField.style.background = '#fee2e2';
      }
      
      // c49 = f14 - g14 (calculated from daily totals)
      const cashToSafe = parseFloat(document.getElementById('cashToSafe').value) || 0;
      const actualCashToSafe = parseFloat(document.getElementById('actualCashToSafe').value) || 0;
      const dailyCashShort = cashToSafe - actualCashToSafe;
      document.getElementById('dailyCashShort').value = dailyCashShort.toFixed(2);
      
      // Other calculated fields would be populated from the backend
    }
    
    function toggleCategory(category) {
      const itemsContainer = document.getElementById(category + 'Items');
      itemsContainer.classList.toggle('expanded');
    }
    
    function addExpenseItem(category, description = '', amount = '', accountCode = '', taxType = '') {
  const itemsContainer = document.getElementById(category + 'Items');
  const isCustomExpense = category === 'cat41';
  
  const itemDiv = document.createElement('div');
  itemDiv.className = 'expense-item';
  
  if (isCustomExpense) {
    // Custom Expense gets account and VAT dropdowns
    let accountOptions = '<option value="">Select Account...</option>';
    xeroExpenseAccounts.forEach(function(acc) {
      const selected = (acc.code === accountCode) ? 'selected' : '';
      accountOptions += \`<option value="\${acc.code}" \${selected}>\${acc.code} - \${acc.name}</option>\`;
    });
    
    // VAT options for expenses (INPUT types)
    const vatOptions = \`
      <option value="ZERORATEDINPUT" \${taxType === 'ZERORATEDINPUT' || taxType === '' ? 'selected' : ''}>No VAT</option>
      <option value="INPUT2" \${taxType === 'INPUT2' ? 'selected' : ''}>20% VAT</option>
      <option value="NONE" \${taxType === 'NONE' ? 'selected' : ''}>N/A</option>
    \`;
    
    itemDiv.innerHTML = \`
      <input type="text" placeholder="Description" value="\${description}" oninput="calculateExpenseTotal('\${category}')" style="flex: 2;">
      <input type="number" step="0.01" placeholder="0.00" value="\${amount}" oninput="calculateExpenseTotal('\${category}')" style="flex: 1;">
      <select class="account-select" style="flex: 2; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
        \${accountOptions}
      </select>
      <select class="vat-select" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
        \${vatOptions}
      </select>
      <button class="btn-remove-item" onclick="removeExpenseItem(this, '\${category}')">🗑️</button>
    \`;
  } else {
    // Regular expense - no account dropdown needed
    itemDiv.innerHTML = \`
      <input type="text" placeholder="Description" value="\${description}" oninput="calculateExpenseTotal('\${category}')">
      <input type="number" step="0.01" placeholder="0.00" value="\${amount}" oninput="calculateExpenseTotal('\${category}')">
      <button class="btn-remove-item" onclick="removeExpenseItem(this, '\${category}')">🗑️</button>
    \`;
  }
  
  itemsContainer.appendChild(itemDiv);
  itemsContainer.classList.add('expanded');
  
  calculateExpenseTotal(category);
}
    
    function removeExpenseItem(button, category) {
      button.parentElement.remove();
      calculateExpenseTotal(category);
    }
    
    function calculateExpenseTotal(category) {
  const itemsContainer = document.getElementById(category + 'Items');
  const items = itemsContainer.querySelectorAll('.expense-item');
  
  let total = 0;
  items.forEach(item => {
    const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
    total += amount;
  });
  
  document.getElementById('total' + category).textContent = '£' + total.toFixed(2);
  
  calculateAllExpenseTotals();
}
    
    function calculateAllExpenseTotals() {
  let grandTotal = 0;
  
  // Find all category total elements by looking for IDs starting with "totalcat"
  const container = document.getElementById('expenseCategoriesContainer');
  const totalElements = container.querySelectorAll('[id^="totalcat"]');
  
  totalElements.forEach(function(el) {
    const total = parseFloat(el.textContent.replace('£', '').replace(',', '')) || 0;
    grandTotal += total;
  });
  
  document.getElementById('grandTotalExpenses').textContent = '£' + grandTotal.toFixed(2);
  
  // Update Actual Daily Cash Remaining After Expenses
  const actualCashToSafe = parseFloat(document.getElementById('actualCashToSafe').value) || 0;
  const actualDailyCashAfterExpenses = actualCashToSafe - grandTotal;
  
  // Store raw value in hidden field for calculations
  document.getElementById('actualDailyCashAfterExpensesRaw').value = actualDailyCashAfterExpenses.toFixed(2);
  
  // Recalculate total figures (this will handle rounding and display)
  calculateTotalFigures();
}
    
    function saveWeeklyData() {
      // -----------------------------------------------------------------
      // COMPULSORY FIELD VALIDATION
      // -----------------------------------------------------------------
      const errors = [];

      const wetSales      = document.getElementById('wetSales').value;
      const foodSales     = document.getElementById('foodSales').value;
      const grossSales    = document.getElementById('grossSales').value;
      const netSales      = document.getElementById('netSales').value;
      const cashToCharlie = document.getElementById('cashToCharlie').value;

      if (wetSales      === '' || isNaN(parseFloat(wetSales))      || parseFloat(wetSales)   < 0) errors.push('• Wet Sales (D17)');
      if (foodSales     === '' || isNaN(parseFloat(foodSales))     || parseFloat(foodSales)  < 0) errors.push('• Food Sales (D18)');
      if (grossSales    === '' || isNaN(parseFloat(grossSales))    || parseFloat(grossSales) < 0) errors.push('• Gross Sales (H17)');
      if (netSales      === '' || isNaN(parseFloat(netSales))      || parseFloat(netSales)   < 0) errors.push('• Net Sales (H18)');
      if (cashToCharlie === '' || isNaN(parseFloat(cashToCharlie)))                               errors.push('• Cash to Charlie (D46)');

      if (errors.length > 0) {
        showStyledAlert('Please complete all required fields before submitting:\\n\\n' + errors.join('\\n'),
                        'warning', 'Required Fields');
        return;
      }

      // Helper: round to whole pence
      const r2 = v => Math.round((parseFloat(v) || 0) * 100) / 100;

      // Collect all expense data
      const collectedExpenseData = {};
      
      for (let category in categoryRows) {
        const row = categoryRows[category];
        const itemsContainer = document.getElementById(category + 'Items');
        const items = itemsContainer.querySelectorAll('.expense-item');
        const isCustomExpense = category === 'cat41';
        
        if (items.length > 0) {
          collectedExpenseData[row] = [];
          items.forEach(item => {
            const description = item.querySelector('input[type="text"]').value;
            const amount = r2(item.querySelector('input[type="number"]').value);
            
            // For Custom Expense, also get the account code and VAT type
            let accountCode = '';
            let taxType = '';
            if (isCustomExpense) {
              const accountSelect = item.querySelector('.account-select');
              if (accountSelect) {
                accountCode = accountSelect.value;
              }
              const vatSelect = item.querySelector('.vat-select');
              if (vatSelect) {
                taxType = vatSelect.value;
              }
            }
            
            if (amount > 0) {
              const expenseItem = {
                description: description,
                amount: amount
              };
              if (isCustomExpense && accountCode) {
                expenseItem.accountCode = accountCode;
              }
              if (isCustomExpense && taxType) {
                expenseItem.taxType = taxType;
              }
              collectedExpenseData[row].push(expenseItem);
            }
          });
        }
      }
      
      // Prepare data object — all monetary values rounded to whole pence
      const data = {
        weekSheet:      currentWeekSheet,
        wetSales:       r2(wetSales),
        foodSales:      r2(foodSales),
        grossSales:     r2(grossSales),
        netSales:       r2(netSales),
        cashToCharlie:  r2(cashToCharlie),
        weeklyNotes:    document.getElementById('weeklyNotes').value,
        expenseDetails: JSON.stringify(collectedExpenseData)
      };
      
      // Duplicate guard: warn if a weekly expense matches a daily cash receipt
      // (same category + same amount) already logged this week.
      var dupes = [];
      for (var dRow in collectedExpenseData) {
        collectedExpenseData[dRow].forEach(function(it) {
          weekDailyReceipts.forEach(function(dr) {
            if (String(dr.cat) === String(dRow) && Math.abs((dr.amount || 0) - (it.amount || 0)) < 0.005) {
              dupes.push('\u2022 £' + (it.amount || 0).toFixed(2) + ' under ' + (dr.category || ('row ' + dRow)) +
                         ' \u2014 already logged as a cash receipt on ' + dr.day);
            }
          });
        });
      }
      if (dupes.length > 0) {
        // NOTE: double-escape newlines here (template-literal host string).
        showStyledConfirm(
          'These weekly expenses match a daily cash receipt already logged this week:\\n\\n' +
          dupes.join('\\n') +
          '\\n\\nDaily cash receipts are already counted on their own (and go to Xero). If this is the same spend, remove it here to avoid double-counting. Save the weekly figures anyway?',
          'Possible duplicate', '\u26a0\ufe0f',
          function() { _submitWeeklyData(data); }
        );
        return;
      }
      _submitWeeklyData(data);
    }

    function _submitWeeklyData(data) {
      // Show loading
      document.getElementById('loadingOverlay').classList.add('show');
      
      // Save to backend
      google.script.run
        .withSuccessHandler(function() {
          document.getElementById('loadingOverlay').classList.remove('show');
          showStyledAlert('Weekly data saved successfully!', 'success');
          returnToMainMenu();
        })
        .withFailureHandler(function(error) {
          document.getElementById('loadingOverlay').classList.remove('show');
          showStyledAlert('Error saving weekly data: ' + error, 'error');
        })
        .saveWeeklyData(data);
    }
    
    function returnToMainMenu() {
  if (webAppUrl) {
    navigateApp('?page=menu');
  }
}
  
</script>

<script>

    function showStyledAlert(message, type, title, callback) {
      var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      var titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
      type = type || 'success';
      
      document.getElementById('alertIcon').textContent = icons[type] || '✅';
      document.getElementById('alertTitle').textContent = title || titles[type] || 'Notice';
      document.getElementById('alertMessage').innerHTML = message.replace(/\\n/g, '<br>');
      
      var btn = document.getElementById('alertButton');
      btn.className = 'modal-button ' + type;
      btn.onclick = function() { closeStyledAlert(); if(callback) callback(); };
      
      document.getElementById('styledAlert').classList.add('show');
    }

    function closeStyledAlert() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
    }

    var confirmCallback = null;

    function showStyledConfirm(message, title, icon, onConfirm) {
      document.getElementById('alertIcon').textContent = icon || '\u2753';
      document.getElementById('alertTitle').textContent = title || 'Confirm';
      document.getElementById('alertMessage').innerHTML = message.replace(/\\n/g, '<br>');
      confirmCallback = onConfirm;
      document.getElementById('alertButton').outerHTML = '<div id="confirmButtons" class="confirm-buttons"><button class="modal-button cancel" onclick="handleConfirmNo()">Cancel</button><button class="modal-button" onclick="handleConfirmYes()">Confirm</button></div>';
      document.getElementById('styledAlert').classList.add('show');
    }

    function handleConfirmYes() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
      if (confirmCallback) { confirmCallback(); confirmCallback = null; }
    }

    function handleConfirmNo() {
      document.getElementById('styledAlert').classList.remove('show');
      resetAlertButton();
      confirmCallback = null;
    }

    function resetAlertButton() {
      var btns = document.getElementById('confirmButtons');
      if (btns) { btns.outerHTML = '<button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>'; }
    }

</script>

<script>
(function(){document.addEventListener("touchmove",function(e){},{passive:true});document.body.style.overflowY="scroll";document.body.style.webkitOverflowScrolling="touch";document.body.style.height="auto";document.documentElement.style.height="auto";document.documentElement.style.overflow="auto";})()
</script>


<script>
  try { if (window.self !== window.top) document.documentElement.classList.add('iframed'); }
  catch (e) { document.documentElement.classList.add('iframed'); }
</script>

</body>
</html>
`;