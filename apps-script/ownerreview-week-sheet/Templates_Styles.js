/**
 * ============================================================================
 * PubSystemLib — Templates_Styles.gs (v4.19 — Varlo shell)
 * ============================================================================
 * Shared design system. ONE CSS string used by every template. Per-venue
 * branding is via __PAINT__, __PAINT_DEEP__, __PAINT_PALE__, __PAINT_WASH__
 * token substitution in _applyBranding.
 *
 * Brand: Varlo (varlo.co.uk) — Value · Accounts · Revenue · Live Operations
 * Design language:
 *   - Varlo mark + wordmark in the chrome; venue paint as local colour
 *   - Cream/warm-white working surface (matches marketing site)
 *   - Screen modes (phone / pad / pc) fill the viewport
 *   - Modular panels = bathroom tiles (tight grout, flush grid)
 *   - Inter Tight for UI, Newsreader for titles only
 * ============================================================================
 */

const SHARED_STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter+Tight:wght@400;500;600;700&display=swap');

  :root {
    /* Paint tokens — substituted from VENUE_CONFIG */
    --paint:        __PAINT__;
    --paint-deep:   __PAINT_DEEP__;
    --paint-pale:   __PAINT_PALE__;
    --paint-wash:   __PAINT_WASH__;

    /* Varlo brand (shared with varlo.co.uk) */
    --varlo-brass:       #b68a3a;
    --varlo-brass-deep:  #8d6824;
    --varlo-forest:      #24362c;
    --varlo-forest-mid:  #2f4a3b;
    --varlo-mark-vee:    #e6c27a;

    /* Ink — same for both venues */
    --ink:          #1c1610;
    --ink-soft:     #3d3429;
    --ink-quiet:    #6E665A;
    --ink-faint:    #B5AC9C;

    /* Surfaces */
    --white-warm:   #fbf7f0;
    --cream:        #f6f0e6;
    --paper:        #fbf7f0;
    --line:         #d8cfc0;
    --line-soft:    #ECE3CD;

    /* Status — muted, editorial */
    --ok:           #2D5530;
    --ok-bg:        #E1E8DA;
    --warn:         #8B4A0F;
    --warn-bg:      #F0E2C8;
    --danger:       #6B1D1D;
    --danger-bg:    #EFD9D9;

    /* Type */
    --serif:        'Newsreader', Georgia, serif;
    --sans:         'Inter Tight', system-ui, sans-serif;

    /* Space + grout (bathroom-tile gap) */
    --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px;
    --s5: 24px; --s6: 32px; --s7: 48px; --s8: 64px;
    --grout: 6px;

    /* Radii — tight tiles, not pill-soft */
    --r:    4px;
    --r-md: 6px;
    --r-lg: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }
  body {
    font-family: var(--sans);
    background: var(--cream);
    color: var(--ink);
    font-size: 14.5px;
    line-height: 1.55;
    min-height: 100%;
    min-height: 100dvh;
  }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }

  /* ── HEADER (venue identity strip) ───────────────────────────── */
  .ps-header {
    background: var(--paint);
    border-bottom: 1px solid var(--paint-deep);
    padding: var(--s4) var(--s5);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .ps-header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 720px;
    margin: 0 auto;
    gap: var(--s4);
  }
  .ps-venue { display: flex; flex-direction: column; gap: 1px; }
  .ps-venue-eyebrow {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--ink-soft);
    text-transform: uppercase;
  }
  .ps-venue-name {
    font-family: var(--serif);
    font-weight: 500;
    font-size: 22px;
    font-variation-settings: 'opsz' 36;
    letter-spacing: -0.005em;
    color: var(--ink);
    line-height: 1.1;
  }
  .ps-user-pill {
    display: flex;
    align-items: center;
    gap: var(--s2);
    padding: 5px 11px 5px 5px;
    border: 1px solid var(--paint-deep);
    border-radius: 100px;
    font-size: 12.5px;
    color: var(--ink-soft);
    background: var(--paint-pale);
    transition: all 0.15s;
    border: 0;
  }
  .ps-user-pill:hover { background: var(--white-warm); }
  .ps-user-avatar {
    width: 22px; height: 22px;
    border-radius: 100px;
    background: var(--ink);
    color: var(--paint);
    font-size: 10px;
    font-weight: 600;
    display: grid;
    place-items: center;
    letter-spacing: 0.02em;
  }
  .ps-back-link {
    font-size: 13px;
    color: var(--ink-soft);
    background: none;
    border: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }
  .ps-back-link:hover { color: var(--ink); }

  /* ── LAYOUT ──────────────────────────────────────────────────── */
  .ps-main {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--s6) var(--s5) var(--s5);
  }
  .ps-main-wide {
    max-width: 1100px;
  }

  /* ── HERO CARD ───────────────────────────────────────────────── */
  .ps-hero {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: var(--s5);
    margin-bottom: var(--s5);
  }
  .ps-hero-eyebrow {
    display: flex;
    align-items: center;
    gap: var(--s3);
    margin-bottom: var(--s4);
  }
  .ps-eyebrow-label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--ink-quiet);
    text-transform: uppercase;
  }
  .ps-eyebrow-line {
    flex: 1;
    height: 1px;
    background: var(--paint-pale);
  }
  .ps-status-tag {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 2px;
    color: var(--paint-wash);
    background: var(--ink);
  }
  .ps-status-tag.muted {
    color: var(--ink-soft);
    background: var(--paint-pale);
  }
  .ps-hero-title {
    font-family: var(--serif);
    font-size: 30px;
    font-weight: 400;
    font-variation-settings: 'opsz' 72;
    line-height: 1.05;
    letter-spacing: -0.015em;
    color: var(--ink);
    margin-bottom: var(--s2);
  }
  .ps-hero-subtitle {
    font-size: 12.5px;
    color: var(--ink-quiet);
    letter-spacing: 0.05em;
    font-weight: 500;
    font-feature-settings: 'tnum';
  }

  /* ── DAY STRIP ───────────────────────────────────────────────── */
  .ps-week-glance {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    margin-top: var(--s5);
    padding-top: var(--s5);
    border-top: 1px solid var(--paint-pale);
  }
  .ps-day {
    text-align: center;
    padding: 10px 4px;
    border-radius: var(--r);
    background: var(--white-warm);
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.15s;
  }
  .ps-day:hover { background: var(--paint-pale); }
  .ps-day-letter {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--ink-faint);
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .ps-day-num {
    font-family: var(--serif);
    font-variation-settings: 'opsz' 36;
    font-size: 17px;
    font-weight: 500;
    color: var(--ink-faint);
    line-height: 1;
    font-feature-settings: 'tnum';
  }
  .ps-day.done { background: var(--paint-pale); }
  .ps-day.done .ps-day-letter,
  .ps-day.done .ps-day-num { color: var(--ink-soft); }
  .ps-day.today { background: var(--ink); }
  .ps-day.today .ps-day-letter { color: var(--paint); }
  .ps-day.today .ps-day-num { color: var(--white-warm); font-weight: 600; }

  /* ── KEY FIGURES ROW ─────────────────────────────────────────── */
  .ps-figures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s7);
    overflow: hidden;
  }
  .ps-figure {
    background: var(--white-warm);
    padding: var(--s4);
  }
  .ps-figure-label {
    font-size: 10.5px;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: var(--s2);
    font-weight: 600;
  }
  .ps-figure-value {
    font-family: var(--serif);
    font-variation-settings: 'opsz' 36;
    font-size: 24px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.05;
    letter-spacing: -0.012em;
    font-feature-settings: 'tnum';
  }
  .ps-figure-meta {
    font-size: 11.5px;
    color: var(--ink-quiet);
    margin-top: 3px;
    font-feature-settings: 'tnum';
    font-weight: 500;
  }
  .ps-figure-meta.up { color: var(--ok); }
  .ps-figure-meta.down { color: var(--warn); }

  /* ── SECTIONS ────────────────────────────────────────────────── */
  .ps-section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: var(--s7) 0 var(--s3);
  }
  .ps-section-head:first-child { margin-top: 0; }
  .ps-section-title {
    font-family: var(--serif);
    font-variation-settings: 'opsz' 36;
    font-weight: 500;
    font-size: 18px;
    color: var(--ink);
    letter-spacing: -0.005em;
  }
  .ps-section-link {
    font-size: 11.5px;
    color: var(--ink-quiet);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    background: none; border: 0;
  }
  .ps-section-link:hover { color: var(--ink); }

  /* ── ACTIONS (primary tasks list) ────────────────────────────── */
  .ps-actions { display: flex; flex-direction: column; gap: var(--s2); }
  .ps-action {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s4) var(--s5);
    display: flex;
    align-items: center;
    gap: var(--s4);
    transition: all 0.15s;
    text-decoration: none;
    color: inherit;
    width: 100%;
    text-align: left;
  }
  .ps-action:hover {
    border-color: var(--paint-deep);
    background: var(--paint-wash);
  }
  .ps-action-leading {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--ink);
    flex-shrink: 0;
  }
  .ps-action.muted .ps-action-leading { background: var(--ink-faint); }
  .ps-action-content { flex: 1; min-width: 0; }
  .ps-action-row {
    display: flex;
    align-items: baseline;
    gap: var(--s2);
    margin-bottom: 1px;
    flex-wrap: wrap;
  }
  .ps-action-title { font-size: 15px; font-weight: 600; color: var(--ink); }
  .ps-action-meta {
    font-size: 12.5px;
    color: var(--ink-quiet);
    letter-spacing: 0.01em;
    font-weight: 500;
  }
  .ps-action-trailing { color: var(--ink-faint); flex-shrink: 0; }

  /* ── PIPS / TAGS ─────────────────────────────────────────────── */
  .ps-pip {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    display: inline-block;
  }
  .ps-pip.due       { color: var(--warn); background: var(--warn-bg); }
  .ps-pip.ok        { color: var(--ok); background: var(--ok-bg); }
  .ps-pip.danger    { color: var(--danger); background: var(--danger-bg); }
  .ps-pip.draft     { color: var(--ink-soft); background: var(--paint-pale); }
  .ps-pip.submitted { color: var(--paint-wash); background: var(--ink); }
  .ps-pip.approved  { color: var(--ok); background: var(--ok-bg); }

  /* ── SECONDARY GRID ──────────────────────────────────────────── */
  .ps-secondary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: var(--r);
    overflow: hidden;
  }
  .ps-secondary {
    background: var(--white-warm);
    padding: var(--s4);
    transition: background 0.15s;
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: flex-start;
    gap: var(--s3);
    border: 0;
    cursor: pointer;
    text-align: left;
    width: 100%;
  }
  .ps-secondary:hover { background: var(--paint-wash); }
  .ps-secondary-icon {
    color: var(--ink-soft);
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ps-secondary-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.3;
  }
  .ps-secondary-meta {
    font-size: 11px;
    color: var(--ink-quiet);
    margin-top: 2px;
    letter-spacing: 0.04em;
    font-weight: 500;
    text-transform: uppercase;
  }

  /* ── FORM INPUTS ─────────────────────────────────────────────── */
  .ps-field { margin-bottom: var(--s4); }
  .ps-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s3);
    margin-bottom: var(--s4);
  }
  .ps-label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .ps-input, .ps-textarea, .ps-select {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 12px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  .ps-input:focus, .ps-textarea:focus, .ps-select:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  .ps-input::placeholder, .ps-textarea::placeholder {
    color: var(--ink-faint);
    font-weight: 400;
  }
  .ps-input-with-prefix {
    position: relative;
  }
  .ps-input-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
  }
  .ps-input-with-prefix .ps-input { padding-left: 28px; }
  .ps-textarea { resize: vertical; min-height: 80px; font-family: var(--sans); }
  .ps-hint {
    font-size: 11.5px;
    color: var(--ink-quiet);
    margin-top: 4px;
  }
  .ps-display-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 12px 14px;
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    font-weight: 600;
  }

  /* ── CARDS / CONTAINERS ──────────────────────────────────────── */
  .ps-card {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s5);
    margin-bottom: var(--s4);
  }
  .ps-card-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--s4);
    padding-bottom: var(--s3);
    border-bottom: 1px solid var(--line-soft);
  }
  .ps-card-title {
    font-family: var(--serif);
    font-variation-settings: 'opsz' 36;
    font-weight: 500;
    font-size: 17px;
    color: var(--ink);
  }

  /* ── DATA TABLES ─────────────────────────────────────────────── */
  .ps-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  .ps-table th {
    text-align: left;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    padding: var(--s3) var(--s3);
    border-bottom: 1px solid var(--line);
  }
  .ps-table td {
    padding: var(--s3) var(--s3);
    border-bottom: 1px solid var(--line-soft);
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .ps-table tr:last-child td { border-bottom: 0; }
  .ps-table tr:hover td { background: var(--paint-wash); }
  .ps-table .num { text-align: right; font-feature-settings: 'tnum'; }

  /* ── BUTTONS ─────────────────────────────────────────────────── */
  .ps-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 11px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    border: 1px solid transparent;
    transition: all 0.15s;
    text-decoration: none;
  }
  .ps-btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .ps-btn-primary:hover { background: #000; }
  .ps-btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .ps-btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .ps-btn-danger {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: var(--danger-bg);
  }
  .ps-btn-danger:hover {
    background: var(--danger);
    color: white;
  }
  .ps-btn-block { width: 100%; }
  .ps-btn-lg {
    padding: 14px 22px;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 700;
  }

  /* ── BOTTOM CTA (mobile thumb zone) ──────────────────────────── */
  .ps-bottom-cta {
    position: sticky;
    bottom: 0;
    margin: var(--s7) calc(-1 * var(--s5)) 0;
    padding: var(--s5);
    background: linear-gradient(180deg, transparent 0%, var(--white-warm) 35%);
  }

  /* ── LOADING / EMPTY STATES ──────────────────────────────────── */
  .ps-loading {
    text-align: center;
    padding: var(--s7);
    color: var(--ink-quiet);
    font-size: 13px;
  }
  .ps-empty {
    text-align: center;
    padding: var(--s7) var(--s5);
    color: var(--ink-quiet);
    font-size: 13px;
  }
  .ps-empty-title {
    font-family: var(--serif);
    font-size: 18px;
    color: var(--ink);
    margin-bottom: var(--s2);
    font-weight: 500;
  }

  /* ── MODAL ───────────────────────────────────────────────────── */
  .ps-modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(26, 24, 20, 0.5);
    z-index: 9999;
    justify-content: center;
    align-items: center;
    padding: var(--s4);
  }
  .ps-modal-overlay.show { display: flex; }
  .ps-modal {
    background: var(--white-warm);
    border-radius: var(--r);
    padding: var(--s6);
    max-width: 420px;
    width: 100%;
    text-align: center;
    border: 1px solid var(--line);
    animation: ps-modal-in 0.2s ease;
  }
  @keyframes ps-modal-in {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ps-modal-icon { font-size: 36px; margin-bottom: var(--s3); }
  .ps-modal-title {
    font-family: var(--serif);
    font-size: 22px;
    color: var(--ink);
    margin-bottom: var(--s3);
    font-weight: 500;
  }
  .ps-modal-message {
    font-size: 14px;
    color: var(--ink-soft);
    margin-bottom: var(--s5);
    line-height: 1.55;
  }
  .ps-modal-buttons {
    display: flex;
    gap: var(--s2);
    justify-content: center;
  }

  /* ── UTILITIES ───────────────────────────────────────────────── */
  .ps-tnum { font-feature-settings: 'tnum'; }
  .ps-money { font-feature-settings: 'tnum'; font-weight: 600; }
  .ps-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); }
  .ps-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s3); }
  .ps-stack { display: flex; flex-direction: column; gap: var(--s3); }
  .ps-row { display: flex; align-items: center; gap: var(--s2); }
  .ps-spacer { flex: 1; }
  .ps-mb-3 { margin-bottom: var(--s3); }
  .ps-mb-4 { margin-bottom: var(--s4); }
  .ps-mb-5 { margin-bottom: var(--s5); }
  .ps-mt-4 { margin-top: var(--s4); }

  /* ── RESPONSIVE (legacy breakpoints) ─────────────────────────── */
  @media (max-width: 600px) {
    .ps-field-row { grid-template-columns: 1fr; }
    .ps-grid-3 { grid-template-columns: 1fr; }
    .ps-secondary-grid { grid-template-columns: 1fr; }
    .ps-figures { grid-template-columns: 1fr; }
    .ps-figures .ps-figure { padding: var(--s3) var(--s4); }
    .ps-hero-title { font-size: 26px; }
    .ps-main { padding: var(--s4) var(--s4) var(--s5); }
  }

  /* ── VARLO BRAND CHROME (always unmistakable) ───────────────── */
  .varlo-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .varlo-mark {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: block;
  }
  .varlo-brand-text { min-width: 0; }
  .varlo-word {
    font-family: var(--serif);
    font-weight: 600;
    font-size: 34px;
    line-height: 0.95;
    letter-spacing: -0.03em;
    color: #f3e6c8;
    font-variation-settings: 'opsz' 36;
  }
  .varlo-word-sub {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #c9b896;
    margin-top: 5px;
  }
  .ps-header.varlo-header {
    background: #1a2820;
    border-bottom: 2px solid #e6c27a;
    padding: 14px 18px;
  }
  .ps-header.varlo-header .ps-header-inner {
    max-width: none;
    width: 100%;
  }
  .ps-header.varlo-header .ps-user-pill {
    border-color: #3d5246;
    background: #24362c;
    color: #f3e6c8;
  }
  .ps-header.varlo-header .ps-user-avatar {
    background: #e6c27a;
    color: #1a2820;
  }
  .ps-header.varlo-header .varlo-menu-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    padding: 8px 14px;
    border: 1px solid #3d5246;
    border-radius: 999px;
    background: #24362c;
    color: #f3e6c8;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    white-space: nowrap;
  }
  .ps-header.varlo-header .varlo-menu-btn:hover {
    border-color: #e6c27a;
    color: #e6c27a;
  }
  .ps-header.varlo-header .varlo-menu-btn svg {
    flex-shrink: 0;
  }
  /* Portal (owner/manager) already shows a Varlo app-bar — hide the
     duplicate Apps Script lockup inside the iframe. Standalone dialogs
     are not iframed and keep the header. */
  html.iframed .ps-header.varlo-header {
    display: none !important;
  }

  /* ── SCREEN MODES + BATHROOM TILE SHELL ─────────────────────── */
  .varlo-shell {
    display: flex;
    flex-direction: column;
    min-height: calc(100dvh - 0px);
    background: var(--cream);
  }
  html.iframed .varlo-shell { min-height: 100dvh; }

  .varlo-tiles {
    flex: 1;
    display: grid;
    gap: var(--grout);
    padding: var(--grout);
    align-content: stretch;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .varlo-tile {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s4);
    min-width: 0;
    min-height: 0;
  }
  .varlo-tile--flush { padding: 0; overflow: hidden; }
  .varlo-tile--hero {
    background: var(--paint-wash);
    border-color: var(--paint-pale);
  }
  .varlo-tile--ink {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--cream);
  }
  .varlo-tile--span-all { grid-column: 1 / -1; }

  /* Phone: single column, tiles stack and grow */
  html[data-screen="phone"] .varlo-tiles {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, auto);
  }
  html[data-screen="phone"] .varlo-tile--wide,
  html[data-screen="phone"] .varlo-tile--span-all { grid-column: 1; }

  /* Pad: two columns, hero/actions span full width */
  html[data-screen="pad"] .varlo-tiles {
    grid-template-columns: 1fr 1fr;
  }
  html[data-screen="pad"] .varlo-tile--wide,
  html[data-screen="pad"] .varlo-tile--span-all { grid-column: 1 / -1; }

  /* PC: denser 12-col wall */
  html[data-screen="pc"] .varlo-tiles {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    padding: 10px;
    gap: 8px;
  }
  html[data-screen="pc"] .varlo-tile--span-all { grid-column: 1 / -1; }
  html[data-screen="pc"] .varlo-tile--wide { grid-column: span 8; }
  html[data-screen="pc"] .varlo-tile--narrow { grid-column: span 4; }
  html[data-screen="pc"] .varlo-tile--half { grid-column: span 6; }
  html[data-screen="pc"] .varlo-tile--third { grid-column: span 4; }
  html[data-screen="pc"] .varlo-tile--quarter { grid-column: span 3; }

  /* Figures as tight tiles inside a tile */
  .varlo-tile .ps-figures,
  .varlo-figures-tiles {
    display: grid;
    gap: var(--grout);
    background: transparent;
    border: 0;
    margin: 0;
  }
  html[data-screen="phone"] .varlo-figures-tiles { grid-template-columns: 1fr; }
  html[data-screen="pad"] .varlo-figures-tiles { grid-template-columns: repeat(3, 1fr); }
  html[data-screen="pc"] .varlo-figures-tiles { grid-template-columns: repeat(3, 1fr); }

  .varlo-figures-tiles .ps-figure,
  .varlo-figures-tiles .figure-card {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s4);
    margin: 0;
  }

  /* Action tiles wall */
  .varlo-action-tiles {
    display: grid;
    gap: var(--grout);
  }
  html[data-screen="phone"] .varlo-action-tiles { grid-template-columns: 1fr; }
  html[data-screen="pad"] .varlo-action-tiles { grid-template-columns: 1fr 1fr; }
  html[data-screen="pc"] .varlo-action-tiles { grid-template-columns: repeat(3, 1fr); }

  .varlo-action-tiles .ps-action,
  .varlo-action-tiles .ps-secondary {
    height: 100%;
    border-radius: var(--r);
    background: var(--white-warm);
    border: 1px solid var(--line);
  }

  .varlo-mode-pip {
    display: none;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-quiet);
    padding: 2px 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--white-warm);
  }
  html[data-screen] .varlo-mode-pip { display: inline-block; }
  html[data-screen="phone"] .varlo-mode-pip::after { content: 'Phone'; }
  html[data-screen="pad"] .varlo-mode-pip::after { content: 'Pad'; }
  html[data-screen="pc"] .varlo-mode-pip::after { content: 'PC'; }

  /* Hub mains fill the screen when wrapped as shell */
  .ps-main.varlo-fill,
  .owner-main.varlo-fill {
    max-width: none;
    width: 100%;
    margin: 0;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
</style>
`;

/** Inline Varlo mark (forest tile + brass V) — matches marketing Logo.tsx */
const VARLO_MARK_SVG = `<svg class="varlo-mark" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="#24362c" stroke="#e6c27a" stroke-width="2"/><path d="M11.2 12.5 24 38.2 36.8 12.5h-6.4L24 29.1 17.6 12.5H11.2Z" fill="#e6c27a"/><path d="M17.6 12.5 24 29.1 30.4 12.5" stroke="#b68a3a" stroke-width="1.6" stroke-linejoin="round" opacity="0.9"/></svg>`;

/**
 * Manager tool pages: keep the Varlo brand bar and offer Main menu.
 * Substituted via __VARLO_HEADER_MENU__ in _applyBranding.
 */
const VARLO_HEADER_WITH_MENU = `<header class="ps-header varlo-header">
  <div class="ps-header-inner">
    <div class="varlo-brand">
      __VARLO_MARK__
      <div class="varlo-brand-text">
        <div class="varlo-word" aria-label="Varlo">Varlo</div>
        <div class="varlo-word-sub">__VENUE_FULL__ · Manager · <span class="varlo-mode-pip"></span></div>
      </div>
    </div>
    <button type="button" class="varlo-menu-btn" onclick="varloGoMainMenu()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      Main menu
    </button>
  </div>
</header>`;

/** Owner tool pages — same Varlo bar, returns to owner menu when possible. */
const VARLO_HEADER_OWNER_WITH_MENU = `<header class="ps-header varlo-header">
  <div class="ps-header-inner">
    <div class="varlo-brand">
      __VARLO_MARK__
      <div class="varlo-brand-text">
        <div class="varlo-word" aria-label="Varlo">Varlo</div>
        <div class="varlo-word-sub">__VENUE_FULL__ · Owner · <span class="varlo-mode-pip"></span></div>
      </div>
    </div>
    <button type="button" class="varlo-menu-btn" onclick="varloGoOwnerMenu()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      Main menu
    </button>
  </div>
</header>`;

/**
 * Boot script: sets data-screen=phone|pad|pc from viewport width so tile
 * layouts fill whatever device is in use. Safe to inject once per page.
 */
const VARLO_BOOT_JS = `<script>
(function(){
  function varloScreenMode(){
    var w = window.innerWidth || document.documentElement.clientWidth || 0;
    var mode = w < 640 ? 'phone' : (w < 1024 ? 'pad' : 'pc');
    document.documentElement.setAttribute('data-screen', mode);
  }
  varloScreenMode();
  window.addEventListener('resize', varloScreenMode);
  try {
    if (window.self !== window.top) document.documentElement.classList.add('iframed');
  } catch (e) {
    document.documentElement.classList.add('iframed');
  }
  window.varloGoMainMenu = function(){
    if (typeof returnToMainMenu === 'function') { returnToMainMenu(); return; }
    if (typeof navigateApp === 'function') { navigateApp('?page=menu'); return; }
    if (typeof goToMenu === 'function') { goToMenu(); return; }
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(u){
          try { window.top.postMessage({type:'navigate',url:u},'*'); } catch (e1) {}
          setTimeout(function(){ window.location.href = u; }, 200);
        })
        .withFailureHandler(function(){
          window.location.href = (window.webAppUrl || window.location.href.split('?')[0]) + '?page=menu';
        })
        .getWebAppUrl();
      return;
    }
    var base = window.webAppUrl || (window.location.origin + window.location.pathname);
    window.location.href = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'page=menu';
  };
  window.varloGoOwnerMenu = function(){
    if (typeof navigateApp === 'function') { navigateApp('?page=ownermenu'); return; }
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(function(u){
          var dest = u + (u.indexOf('?') >= 0 ? '&' : '?') + 'page=ownermenu';
          try { window.top.postMessage({type:'navigate',url:dest},'*'); } catch (e1) {}
          setTimeout(function(){ window.location.href = dest; }, 200);
        })
        .getWebAppUrl();
      return;
    }
    window.varloGoMainMenu();
  };
})();
</script>`;

/**
 * Helper: shade a hex colour by a percentage (positive = lighter, negative = darker).
 * Used by _applyBranding to derive paint-pale / paint-deep / paint-wash from the
 * single PAINT_COLOR token in VENUE_CONFIG.
 */
function _shadeColor(hex, percent) {
  hex = String(hex || '#888888').replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  const adjust = (c) => {
    const out = percent >= 0
      ? Math.round(c + (255 - c) * (percent / 100))
      : Math.round(c * (1 + percent / 100));
    return Math.max(0, Math.min(255, out));
  };
  const rr = adjust(r), gg = adjust(g), bb = adjust(b);
  return '#' + [rr, gg, bb].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}
