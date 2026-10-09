/**
 * PubSystemLib — Templates_Views.gs (v4.8 - v4 paint colors throughout)
 */

const OWNER_REVIEW_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container { max-width: 1400px; margin: 0 auto; }
    
    .header-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(30, 58, 138, 0.3);
    }
    
    .header-card h1 { font-size: 26px; font-weight: 700; margin-bottom: 5px; }
    .week-info { font-size: 14px; opacity: 0.9; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(255,255,255,0.2);
      margin-left: 10px;
    }
    
    .nav-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 10px 0;
    }
    
    .nav-btn {
      background: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .nav-btn.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .nav-btn.save {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      display: none;
    }
    
    .nav-btn.save.visible { display: block; }
    
    .section-card {
      background: white;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      padding: 18px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .section-header:hover { background: #f8fafc; }
    
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .icon-blue { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
    .icon-green { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
    .icon-amber { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
    .icon-purple { background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); }
    .icon-pink { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); }
    .icon-red { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); }
    
    .section-title { font-size: 16px; font-weight: 700; color: #1e293b; flex: 1; }
    
    .section-toggle {
      font-size: 18px;
      color: #94a3b8;
      transition: transform 0.2s;
    }
    
    .section-toggle.collapsed { transform: rotate(-90deg); }
    
    .section-body { padding: 20px 24px; overflow-x: auto; }
    .section-body.collapsed { display: none; }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 1200px;
    }
    
    .data-table th {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 12px 8px;
      text-align: center;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table th:first-child { text-align: left; border-radius: 8px 0 0 0; }
    .data-table th:last-child { border-radius: 0 8px 0 0; }
    
    .data-table td {
      padding: 8px 6px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table td:first-child {
      text-align: left;
      font-weight: 600;
      color: #1e293b;
      background: #f8fafc;
      min-width: 100px;
    }
    
    .data-table tr:hover td { background: #f0f9ff; }
    .data-table tr:hover td:first-child { background: #e0f2fe; }
    
    .data-table tfoot td {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
      font-weight: 700;
      color: #065f46;
      border-top: 2px solid #10b981;
    }
    
    .data-table tfoot td:first-child {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
    }
    
    .edit-input {
      width: 110px;
      padding: 8px 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-align: right;
      font-family: 'SF Mono', 'Consolas', monospace;
      transition: all 0.2s;
    }
    
    .edit-input:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }
    
    .edit-input.changed {
      border-color: #f59e0b;
      background: #fef3c7;
    }
    
    .edit-input.notes { width: 220px; text-align: left; }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
    }
    
    .summary-card.editable {
      border-color: #fcd34d;
      background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
    }
    
    .summary-card.highlight-green {
      border-color: #22c55e;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    }
    
    .summary-card.highlight-red {
      border-color: #ef4444;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    }
    
    .summary-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .summary-value {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .summary-value.positive { color: #059669; }
    .summary-value.negative { color: #dc2626; }
    
    .summary-input {
      width: 100%;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      background: white;
    }
    
    .summary-input:focus {
      outline: none;
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
    }
    
    .summary-input.changed {
      border-color: #f59e0b;
      background: #fef3c7;
    }
    
    .expenses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
    }
    
    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .expense-label { font-size: 13px; color: #4b5563; font-weight: 500; flex: 1; }
    
    .expense-input {
      width: 100px;
      padding: 8px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      text-align: right;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .expense-input:focus { outline: none; border-color: #7c3aed; }
    .expense-input.changed { border-color: #f59e0b; background: #fef3c7; }
    
    .expense-total {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    
    .expense-total-label { font-size: 16px; font-weight: 700; }
    .expense-total-value { font-size: 22px; font-weight: 700; font-family: 'SF Mono', 'Consolas', monospace; }
    
    .balance-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .balance-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }
    
    .balance-header {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .balance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .balance-row-label { font-size: 13px; color: #64748b; }
    .balance-row-value { font-size: 15px; font-weight: 700; font-family: 'SF Mono', 'Consolas', monospace; }
    
    .balance-row.change {
      background: #f1f5f9;
      margin: 8px -10px;
      padding: 10px;
      border-radius: 8px;
    }
    
    .balance-row.change.positive { background: #d1fae5; }
    .balance-row.change.positive .balance-row-value { color: #059669; }
    .balance-row.change.negative { background: #fee2e2; }
    .balance-row.change.negative .balance-row-value { color: #dc2626; }
    
    .balance-row.total {
      border-top: 2px solid #e2e8f0;
      margin-top: 10px;
      padding-top: 15px;
    }
    
    .balance-row.total .balance-row-value { font-size: 22px; }
    .balance-row-value.negative { color: #dc2626; }
    
    .notes-textarea {
      width: 100%;
      min-height: 100px;
      padding: 15px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }
    
    .notes-textarea:focus {
      outline: none;
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
    }
    
    .notes-textarea.changed { border-color: #f59e0b; background: #fef3c7; }
    
    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px;
      gap: 20px;
    }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text { color: #64748b; font-size: 16px; }
    
    .changes-banner {
      background: #fef3c7;
      border: 2px solid #fcd34d;
      border-radius: 10px;
      padding: 12px 20px;
      margin-bottom: 20px;
      display: none;
      align-items: center;
      gap: 10px;
      position: sticky;
      top: 60px;
      z-index: 99;
    }
    
    .changes-banner.visible { display: flex; }
    .changes-text { flex: 1; font-weight: 600; color: #92400e; }
    
    @media (max-width: 768px) {
      .nav-bar { flex-direction: column; }
      .nav-btn { width: 100%; text-align: center; }
      .edit-input { width: 65px; font-size: 11px; }
    }
    
    @media print {
      body { background: white; padding: 0; }
      .nav-bar, .changes-banner { display: none !important; }
      .section-card { box-shadow: none; border: 1px solid #e2e8f0; }
      .section-body { overflow: visible; }
      .data-table { min-width: auto; font-size: 10px; }
    }

    /* ═══ MOBILE RESPONSIVE ═══ */
    @media (max-width: 768px) {
      body { padding: 0; }
      .container { max-width: 100%; border-radius: 0; box-shadow: none; }
      .header-card { padding: 20px 16px; border-radius: 0; flex-direction: column; text-align: center; gap: 10px; }
      .header-left h1 { font-size: 20px; }
      .nav-bar { gap: 6px; padding: 0 12px; margin-bottom: 12px; }
      .nav-btn { padding: 10px 14px; font-size: 12px; }
      .section-card { border-radius: 12px; margin: 0 8px 12px 8px; }
      .section-header { padding: 14px 16px; }
      .section-title { font-size: 15px; }
      .section-body { padding: 14px 16px; overflow-x: auto; }
      .summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .summary-card { padding: 14px; }
      .summary-label { font-size: 11px; }
      .summary-value { font-size: 20px; }
      .data-table { font-size: 11px; min-width: 500px; }
      .data-table.compact { min-width: 0; width: 100%; }
      .data-table.compact td { white-space: normal; word-break: break-word; }
      .data-table thead th, .data-table tbody td, .data-table tfoot td { padding: 8px 6px; }
      .expense-grid { grid-template-columns: 1fr; gap: 8px; }
      .expense-item { padding: 12px; }
      .notes-box { font-size: 13px; padding: 14px 16px; }
      .modal-box { padding: 24px 20px; margin: 16px; }
    }
  </style>
__SHARED_STYLES__

<style>
  /* ── Container & page chrome ──────────────────────────────────── */
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .container > .header { display: none; /* replaced by .ps-header */ }
  .form-content, .content {
    padding: var(--s5);
    background: transparent;
  }
  .week-info { display: none; }

  /* Day banner (purple gradient → paint) */
  .form-content > div[style*="linear-gradient(135deg, #667eea"] {
    background: var(--paint) !important;
    color: var(--ink) !important;
    margin: calc(-1 * var(--s5)) calc(-1 * var(--s5)) var(--s5) !important;
    padding: var(--s4) var(--s5) !important;
    border-radius: 0 !important;
    text-align: left !important;
    border-bottom: 1px solid var(--paint-deep);
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:first-child {
    color: var(--ink-soft) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    opacity: 1 !important;
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:nth-child(2) {
    font-family: var(--serif) !important;
    font-size: 22px !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    margin-top: 4px !important;
  }

  /* Sections */
  .section {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s4);
    overflow: hidden;
  }
  .section-header {
    background: var(--cream) !important;
    border-bottom: 1px solid var(--line);
    color: var(--ink) !important;
    padding: var(--s3) var(--s4) !important;
    display: flex;
    align-items: center;
    gap: var(--s2);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.005em;
  }
  .section-header h2 {
    font-family: var(--serif);
    font-size: 15px !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--ink);
  }
  .section-icon { font-size: 16px; opacity: 0.7; }
  .section > *:not(.section-header) { padding-left: var(--s4); padding-right: var(--s4); }
  .section > *:not(.section-header):first-of-type:not(.section-header) { padding-top: var(--s4); }
  .section > *:not(.section-header):last-child { padding-bottom: var(--s4); }

  /* Form groups */
  .form-group { margin-bottom: var(--s3); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s3); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  @media (max-width: 600px) {
    .form-row, .form-grid, .form-row-3 { grid-template-columns: 1fr; }
  }

  /* Labels */
  .form-group label, .total-item label, label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  label[for="actualToSafe"] { color: var(--warn); }

  /* Inputs */
  input[type="number"], input[type="text"], input[type="date"], select, textarea {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); }
  textarea { resize: vertical; min-height: 70px; font-family: var(--sans); }
  input[readonly] { background: var(--cream); color: var(--ink-soft); cursor: default; }
  input.valid { border-color: var(--ok); background: var(--ok-bg); }
  input.invalid { border-color: var(--danger); background: var(--danger-bg); }

  /* Input prefix (£) */
  .input-with-icon, .input-with-prefix { position: relative; }
  .input-icon, .input-with-prefix > span:first-child {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }
  .input-with-icon input, .input-with-prefix input { padding-left: 28px; }

  /* Calculated values */
  .calculated-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 11px 14px;
    font-size: 15px;
    color: var(--ink);
    font-weight: 600;
    font-feature-settings: 'tnum';
  }
  .calculated-value.success { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
  .calculated-value.warning { background: var(--warn-bg); border-color: var(--warn); color: var(--warn); }
  .calculated-value.error { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  .auto-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    color: var(--ink-quiet);
    background: var(--cream);
    margin-left: 6px;
  }
  .cell-ref {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    color: var(--ink-faint);
    font-weight: 500;
    margin-left: 4px;
  }
  .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

  /* Validation items */
  .validation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: var(--r);
    margin-bottom: 6px;
  }
  .validation-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
    text-transform: none;
  }
  .validation-value {
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .validation-value.correct { color: var(--ok); }
  .validation-value.incorrect { color: var(--danger); }

  /* Info/warning boxes */
  .info-box {
    background: var(--paint-wash);
    border-left: 3px solid var(--paint-deep);
    padding: 11px 14px;
    margin-bottom: var(--s4);
    font-size: 12.5px;
    color: var(--ink-soft);
    border-radius: var(--r);
  }
  .info-box strong { color: var(--ink); }
  .warning-box {
    background: var(--warn-bg);
    border-left: 3px solid var(--warn);
    padding: 11px 14px;
    margin-bottom: var(--s3);
    font-size: 12.5px;
    color: var(--warn);
    border-radius: var(--r);
  }

  /* Buttons */
  .btn-group, .button-group {
    display: flex;
    gap: var(--s2);
    flex-wrap: wrap;
    margin-top: var(--s4);
  }
  .btn {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 13px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-save, .btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .btn-save:hover, .btn-primary:hover { background: #000; }
  .btn-menu, .btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .btn-menu:hover, .btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .btn-reset {
    background: var(--cream);
    color: var(--ink-soft);
    border-color: var(--line);
  }
  .btn-reset:hover { background: var(--warn-bg); color: var(--warn); }

  /* Totals & expense categories */
  .totals-grid { display: grid; grid-template-columns: 1fr; gap: var(--s3); }
  .total-item {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s3);
  }
  .total-item.input-required { background: var(--warn-bg) !important; border: 1px solid var(--warn) !important; }
  .total-item.highlight { background: var(--paint-wash); border-color: var(--paint-pale); }

  .expense-category {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s2);
    overflow: hidden;
  }
  .category-header {
    background: var(--cream);
    border-bottom: 1px solid var(--line-soft);
    padding: 11px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .category-header:hover { background: var(--paint-wash); }
  .category-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0;
    text-transform: none;
  }
  .category-total { font-weight: 700; font-feature-settings: 'tnum'; color: var(--ink); font-size: 13.5px; }
  .expense-items { padding: var(--s2); background: var(--white-warm); }
  .expense-item {
    display: grid;
    grid-template-columns: 1fr 110px auto;
    gap: 6px;
    margin-bottom: 6px;
    align-items: center;
  }
  .expense-item input[type="text"], .expense-item input[type="number"] {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .expense-item .account-select, .expense-item .vat-select {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .add-expense-btn {
    background: var(--cream);
    color: var(--ink-soft);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 6px;
    width: 100%;
  }
  .add-expense-btn:hover {
    background: var(--paint-wash);
    color: var(--ink);
    border-color: var(--paint-deep);
  }
  .remove-expense-btn {
    background: transparent;
    color: var(--ink-quiet);
    border: 0;
    cursor: pointer;
    font-size: 18px;
    padding: 0 8px;
  }
  .remove-expense-btn:hover { color: var(--danger); }
  .read-only label { color: var(--ink-quiet); }
  .loading.hidden { display: none; } }

  /* Cash difference indicator (Daily Out) */
  div[id="differenceIndicator"] > div {
    background: var(--warn-bg) !important;
    border: 1px solid var(--warn) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
  }
  div[id="differenceIndicator"] span { color: var(--ink) !important; }
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    transition: background 0.15s !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .modal-button.cancel:hover { background: var(--cream) !important; }
  .modal-button.warning { background: var(--warn) !important; color: white !important; }
  .modal-button.warning:hover { background: #6b3909 !important; }
  .modal-button.error { background: var(--danger) !important; color: white !important; }
  .modal-button.error:hover { background: #4a1313 !important; }
  .modal-button.success { background: var(--ok) !important; color: white !important; }
  .modal-button.success:hover { background: #1d3c1f !important; }
  .modal-button.info { background: var(--ink) !important; color: var(--paint) !important; }
  .modal-buttons { display: flex; gap: var(--s2); justify-content: center; }
  .confirm-buttons { display: flex; gap: var(--s2); justify-content: center; }
</style>


<style>
  /* v4.5 — modal box styling only, originals handle visibility */
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
</style>

<style>
  /* v4.8 — focused paint color overrides on original menu/view CSS */

  /* Page background and base */
  body { background: var(--white-warm) !important; color: var(--ink) !important; font-family: var(--sans) !important; }
  .container { background: transparent !important; }

  /* Header (the original purple-gradient header) — make it paint-ink */
  .header, .header-card {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .header h1, .header-card h1, .header-card p {
    color: var(--paint) !important;
    font-family: var(--serif) !important;
    font-weight: 500 !important;
  }
  .header p { color: var(--paint-pale) !important; }

  /* Status cards — original white card with purple accent */
  .status-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-left: 3px solid var(--paint) !important;
    border-radius: var(--r) !important;
  }
  .status-card.submitted { border-left-color: #d4a574 !important; }
  .status-card.complete { border-left-color: #5b8a51 !important; }

  /* Task cards (action items) */
  .task-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .task-card:hover { border-color: var(--paint) !important; }
  .task-card.primary {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .task-card.primary .task-title,
  .task-card.primary .task-subtitle { color: var(--paint) !important; }
  .task-icon { color: var(--paint) !important; }
  .task-card.primary .task-icon { color: var(--paint) !important; }

  /* Day boxes (the date grid) */
  .day-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }
  .day-box:hover { border-color: var(--paint) !important; background: var(--paint-wash) !important; }
  .day-box.complete {
    background: var(--paint) !important;
    border-color: var(--paint) !important;
    color: var(--ink) !important;
  }

  /* Large buttons */
  .btn-large, .btn {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  .btn-large:hover, .btn:hover {
    background: #000 !important;
    color: var(--paint) !important;
  }

  /* Badges */
  .badge-approved, .badge-complete {
    background: #e8f0e3 !important; color: #4a7042 !important;
    border: 1px solid #c8d8c0 !important;
  }
  .badge-pending, .badge-submitted {
    background: #fbf3e7 !important; color: #8a5a2a !important;
    border: 1px solid #d4a574 !important;
  }
  .badge-draft { background: var(--paint-wash) !important; color: var(--ink) !important; }
  .badge-exported { background: var(--ink) !important; color: var(--paint) !important; }

  /* Progress bar */
  .progress-bar { background: var(--paint) !important; }
  .progress-bar.complete { background: #5b8a51 !important; }

  /* Weekly status */
  .weekly-status {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .weekly-status.complete { border-color: #5b8a51 !important; background: #f5fbf3 !important; }
  .weekly-status.disabled { opacity: 0.5 !important; }

  /* Owner menu specific */
  .section-card, .balances-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .section-header { color: var(--ink) !important; }
  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .week-card:hover { border-color: var(--paint) !important; }
  .btn-banking, .btn-report, .btn-view, .btn-xero {
    background: var(--ink) !important; color: var(--paint) !important;
    border: 0 !important; border-radius: var(--r) !important;
  }
  .btn-disabled { background: var(--line) !important; color: var(--ink-soft) !important; cursor: not-allowed !important; }

  /* Figures grid */
  .figure-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .figure-label { color: var(--ink-soft) !important; }
  .figure-value { color: var(--ink) !important; font-family: var(--mono) !important; font-weight: 700 !important; }
  .figure-value.positive { color: #5b8a51 !important; }
  .figure-value.negative { color: #c0635a !important; }

  /* Balances */
  .balance-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
  }
  .balance-value { color: var(--ink) !important; font-family: var(--mono) !important; }

  /* Modal restyling */
  .modal-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .modal-title { font-family: var(--serif) !important; color: var(--ink) !important; }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-weight: 700 !important;
  }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }

  /* Info banner */
  .info-banner {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }

  /* Spinner */
  .spinner { border-top-color: var(--paint) !important; }
</style>

</head>
<body>
__VARLO_BOOT__

__VARLO_HEADER_OWNER_MENU__

  <div class="container">
    <div class="header-card">
      <h1>👑 Owner Week Review</h1>
      <div class="week-info" id="weekInfo">Loading...</div>
    </div>
    
    <div class="nav-bar">
      <button class="nav-btn" onclick="goBack()">← Back to Dashboard</button>
      <button class="nav-btn" onclick="viewReport()">📄 View Report</button>
      <button class="nav-btn" onclick="window.print()">🖨️ Print</button>
      <button class="nav-btn save" id="saveBtn" onclick="saveChanges()">💾 Save Changes</button>
      <button class="nav-btn primary" onclick="approveWeek()">✅ Approve & Create Master</button>
    </div>
    
    <div class="changes-banner" id="changesBanner">
      <span>⚠️</span>
      <span class="changes-text">You have unsaved changes</span>
    </div>
    
    <div id="content">
      <div class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Loading week data...</div>
      </div>
    </div>
  </div>
  
  <script>
    var webAppUrl = '';
    var weekSheetName = '<?= weekSheetName ?>';
    var weekData = null;
    var hasChanges = false;
    
    function getUrlParam(param) {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    
    google.script.run
      .withSuccessHandler(function(url) { webAppUrl = url; })
      .getWebAppUrl();

    // Navigation helper
    function navigateApp(queryString) {
      if (!webAppUrl) return;
      var fullUrl = webAppUrl + queryString;
      try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
      setTimeout(function() { window.location.href = fullUrl; }, 300);
    }
    
    window.onload = function() {
      // weekSheetName is already set by template: '<?= weekSheetName ?>'
      // Fallback to URL param if template didn't work
      if (!weekSheetName) {
        weekSheetName = getUrlParam('week') || '';
      }
      loadWeekData();
    };
    
    function goBack() {
      if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
      if (webAppUrl) {
        try {
          navigateApp('?page=owner');
        } catch(e) {
          navigateApp('?page=owner');
        }
      }
    }
    
    function viewReport() {
      if (webAppUrl && weekSheetName) {
        try {
          navigateApp('?page=weekreport&week=' + encodeURIComponent(weekSheetName));
        } catch(e) {
          navigateApp('?page=weekreport&week=' + encodeURIComponent(weekSheetName));
        }
      }
    }
    
    function formatCurrency(value) {
      var num = parseFloat(value) || 0;
      return (num < 0 ? '-' : '') + '£' + Math.abs(num).toFixed(2);
    }
    
    function loadWeekData() {
      google.script.run
        .withSuccessHandler(function(data) {
          weekData = data;
          weekSheetName = data.weekSheet;
          renderWeekData();
        })
        .withFailureHandler(function(error) {
          document.getElementById('content').innerHTML = 
            '<div class="loading"><div style="font-size:48px">❌</div><div class="loading-text">Error: ' + error.message + '</div></div>';
        })
        .getOwnerWeekReviewFull(weekSheetName);
    }
    
    function markChanged(input) {
      input.classList.add('changed');
      hasChanges = true;
      document.getElementById('changesBanner').classList.add('visible');
      document.getElementById('saveBtn').classList.add('visible');
    }
    
    function toggleSection(sectionId) {
      var body = document.getElementById(sectionId + 'Body');
      var toggle = document.getElementById(sectionId + 'Toggle');
      body.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
    }
    
    function renderWeekData() {
      document.getElementById('weekInfo').innerHTML = 
        weekData.weekSheet + ' | Week Ending: ' + weekData.weekEnding + 
        '<span class="status-badge">' + weekData.status + '</span>';
      
      var html = '';
      
      // ═══════════════════════════════════════════════════════════════
      // DAILY ENTRIES (Rows 7-13, Cols D-U)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'daily\\')">';
      html += '<div class="section-icon icon-blue">📅</div>';
      html += '<div class="section-title">Daily Entries (All Editable)</div>';
      html += '<span class="section-toggle" id="dailyToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="dailyBody">';
      
      html += '<table class="data-table">';
      html += '<thead><tr>';
      html += '<th>Day</th><th>Cash</th><th>Less Float</th><th>To Safe</th><th>Actual Safe</th><th>Notes</th>';
      html += '<th>PDQ 1</th><th>PDQ 2</th><th>Card Total</th><th>Gross Till</th><th>Net Till</th><th>Void</th>';
      html += '<th>Tabs</th><th>Tab Check</th><th>Daily Out</th><th>Out Notes</th>';
      html += '<th>Rooms Card</th><th>Airbnb</th><th>Room Cash</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (var i = 0; i < 7; i++) {
        var day = weekData.dailyData[i];
        var dayKey = days[i];
        
        html += '<tr>';
        html += '<td><strong>' + dayNames[i] + '</strong><br><small>' + (day.date || '') + '</small></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cash" value="' + (day.cash || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cashLessFloat" value="' + (day.cashLessFloat || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cashToSafe" value="' + (day.cashToSafe || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_actualToSafe" value="' + (day.actualToSafe || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input notes" id="' + dayKey + '_cashDiffNotes" value="' + (day.cashDiffNotes || '') + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_pdq1" value="' + (day.pdq1 || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_pdq2" value="' + (day.pdq2 || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cardTotal" value="' + (day.cardTotal || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_grossOnTill" value="' + (day.grossOnTill || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_netOnTill" value="' + (day.netOnTill || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_itemVoid" value="' + (day.itemVoid || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_tabs" value="' + (day.tabs || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input" id="' + dayKey + '_tabChecker" value="' + (typeof day.tabChecker === 'number' ? day.tabChecker.toFixed(2) : (day.tabChecker || '0.00')) + '" onchange="markChanged(this)" readonly style="background:#f0f0f0;"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_dailyOut" value="' + (day.dailyOut || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input notes" id="' + dayKey + '_dailyOutNotes" value="' + (day.dailyOutNotes || '') + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_roomsCard" value="' + (day.roomsCard || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_airbnbBacs" value="' + (day.airbnbBacs || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_roomCash" value="' + (day.roomCash || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '</tr>';
      }
      
      // Totals row (read-only)
      html += '</tbody><tfoot><tr>';
      html += '<td>TOTALS</td>';
      html += '<td>' + formatCurrency(weekData.totals.cash) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cashLessFloat) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cashToSafe) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.actualToSafe) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.pdq1) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.pdq2) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cardTotal) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.grossOnTill) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.netOnTill) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.itemVoid) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.tabs) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.dailyOut) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.roomsCard) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.airbnbBacs) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.roomCash) + '</td>';
      html += '</tr></tfoot></table>';
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // TOUCHOFFICE DATA
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'touchoffice\\')">';
      html += '<div class="section-icon icon-purple">💻</div>';
      html += '<div class="section-title">TouchOffice Weekly Data</div>';
      html += '<span class="section-toggle" id="touchofficeToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="touchofficeBody">';
      html += '<div class="summary-grid">';
      html += '<div class="summary-card editable"><div class="summary-label">Wet Sales (D17)</div><input type="number" step="0.01" class="summary-input" id="wetSales" value="' + (weekData.touchOffice.wet || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Food Sales (D18)</div><input type="number" step="0.01" class="summary-input" id="foodSales" value="' + (weekData.touchOffice.food || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Gross Sales (H17)</div><input type="number" step="0.01" class="summary-input" id="grossSales" value="' + (weekData.touchOffice.gross || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Net Sales (H18)</div><input type="number" step="0.01" class="summary-input" id="netSales" value="' + (weekData.touchOffice.net || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '</div>';
      
      // Validation checker (read-only)
      if (weekData.validation) {
        var grossDiffClass = Math.abs(weekData.validation.grossDiff) < 0.01 ? 'highlight-green' : 'highlight-red';
        var netDiffClass = Math.abs(weekData.validation.netDiff) < 0.01 ? 'highlight-green' : 'highlight-red';
        html += '<div class="summary-grid" style="margin-top:15px;">';
        html += '<div class="summary-card ' + grossDiffClass + '"><div class="summary-label">Gross Diff (H19)</div><div class="summary-value">' + formatCurrency(weekData.validation.grossDiff) + '</div></div>';
        html += '<div class="summary-card ' + netDiffClass + '"><div class="summary-label">Net Diff (H20)</div><div class="summary-value">' + formatCurrency(weekData.validation.netDiff) + '</div></div>';
        html += '</div>';
      }
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // EXPENSES (Rows 24-41, Col D)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'expenses\\')">';
      html += '<div class="section-icon icon-pink">💳</div>';
      html += '<div class="section-title">Weekly Expenses</div>';
      html += '<span class="section-toggle" id="expensesToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="expensesBody">';
      html += '<div class="expenses-grid">';
      
      weekData.expenses.forEach(function(expense) {
        html += '<div class="expense-item">';
        html += '<span class="expense-label">' + expense.name + '</span>';
        html += '<input type="number" step="0.01" class="expense-input" id="' + expense.key + '" value="' + (expense.amount || 0).toFixed(2) + '" onchange="markChanged(this)">';
        // Show description if exists
        if (expense.description) {
          html += '<div class="expense-description" style="grid-column: 1 / -1; font-size: 11px; color: #666; padding: 2px 8px 6px 8px; font-style: italic; background: #f9fafb; border-radius: 0 0 6px 6px; margin-top: -4px;">' + expense.description + '</div>';
        }
        html += '</div>';
      });
      
      html += '<div class="expense-total">';
      html += '<span class="expense-total-label">TOTAL EXPENSES (D42)</span>';
      html += '<span class="expense-total-value">' + formatCurrency(weekData.totalExpenses) + '</span>';
      html += '</div>';
      html += '</div></div></div>';
      // --- Daily cash receipts (read-only; already in Xero via column F) ---
      if (weekData.dailyReceipts && weekData.dailyReceipts.length) {
        html += '<div class="section-card">';
        html += '<div class="section-header">';
        html += '<div class="section-icon icon-pink">🧾</div>';
        html += '<div class="section-title">Daily Cash Receipts (from till)</div>';
        html += '</div>';
        html += '<div class="section-body">';
        html += '<div style="font-size:12px;color:#666;margin-bottom:10px;">Paid in cash from the till and logged daily. Already counted - they go to Xero under their category and are NOT in the editable Weekly Expenses above. Shown here so you can see them before approving.</div>';
        var _dcrTotal = 0;
        weekData.dailyReceipts.forEach(function(r) {
          _dcrTotal += (r.amount || 0);
          html += '<div class="expense-item" style="display:flex;justify-content:space-between;gap:8px;align-items:center;">';
          html += '<span class="expense-label">' + r.day + ' - ' + r.category + (r.description ? ' <span style="color:#999;">(' + r.description + ')</span>' : '') + '</span>';
          html += '<span style="font-weight:600;white-space:nowrap;">' + formatCurrency(r.amount) + '</span>';
          html += '</div>';
        });
        html += '<div class="expense-total"><span class="expense-total-label">Total daily receipts</span><span class="expense-total-value">' + formatCurrency(_dcrTotal) + '</span></div>';
        html += '</div></div>';
      }
      // --- Card adjustments (read-only) ---
      if (weekData.cardAdjustments && weekData.cardAdjustments.items && weekData.cardAdjustments.items.length) {
        var _cadj = weekData.cardAdjustments;
        html += '<div class="section-card">';
        html += '<div class="section-header">';
        html += '<div class="section-icon icon-green">💳</div>';
        html += '<div class="section-title">Card Adjustments</div>';
        html += '</div>';
        html += '<div class="section-body">';
        html += '<div style="font-size:12px;color:#666;margin-bottom:10px;">Bank transfers net against the card/PDQ total in Xero. Cash back is recorded only - it already balances itself.</div>';
        _cadj.items.forEach(function(x) {
          var _lbl = (x.method === 'transfer_out') ? 'Bank transfer - refund out' : (x.method === 'transfer_in') ? 'Bank transfer - money in' : (x.method === 'cashback') ? 'Cash back' : x.method;
          html += '<div class="expense-item" style="display:flex;justify-content:space-between;gap:8px;align-items:center;">';
          html += '<span class="expense-label">' + x.day + ' - ' + _lbl + (x.reason ? ' <span style="color:#999;">(' + x.reason + ')</span>' : '') + '</span>';
          html += '<span style="font-weight:600;white-space:nowrap;">' + formatCurrency(x.amt) + '</span>';
          html += '</div>';
        });
        html += '<div class="expense-total"><span class="expense-total-label">Bank transfer net (adjusts card in Xero)</span><span class="expense-total-value">' + formatCurrency(_cadj.transferNet) + '</span></div>';
        if (_cadj.cashback) { html += '<div class="expense-total"><span class="expense-total-label">Cash back recorded (no Xero effect)</span><span class="expense-total-value">' + formatCurrency(_cadj.cashback) + '</span></div>'; }
        html += '</div></div>';
      }
      
      // ═══════════════════════════════════════════════════════════════
      // BALANCES & CASH FIGURES
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'balances\\')">';
      html += '<div class="section-icon icon-green">💰</div>';
      html += '<div class="section-title">Cash & Balances</div>';
      html += '<span class="section-toggle" id="balancesToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="balancesBody">';
      html += '<div class="summary-grid">';
      html += '<div class="summary-card"><div class="summary-label">Total Cash to Safe (G14)</div><div class="summary-value">' + formatCurrency(weekData.totalFigures.totalCashToSafe) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Cash After Expenses (D45)</div><div class="summary-value">' + formatCurrency(weekData.totalFigures.cashAfterExpenses) + '</div></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Cash to Charlie (D46)</div><input type="number" step="0.01" class="summary-input" id="cashToCharlie" value="' + (weekData.totalFigures.cashToCharlie || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card"><div class="summary-label">Daily Cash Short (F14-G14)</div><div class="summary-value ' + (weekData.totalFigures.dailyCashShort >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.dailyCashShort) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Weekly Cash Short (D47)</div><div class="summary-value ' + (weekData.totalFigures.weeklyCashShort >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.weeklyCashShort) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Purchases Less Payments (D51)</div><div class="summary-value ' + (weekData.totalFigures.purchasesLessPayments >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.purchasesLessPayments) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Tab Balance (D53)</div><div class="summary-value ' + (weekData.totalFigures.tabBalance >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.tabBalance) + '</div></div>';
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // RUNNING BALANCES
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'running\\')">';
      html += '<div class="section-icon icon-amber">📊</div>';
      html += '<div class="section-title">Running Balance Impact</div>';
      html += '<span class="section-toggle" id="runningToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="runningBody">';
      html += '<div class="balance-cards">';
      
      // Tabs
      var newTabs = (weekData.runningBalances.tabs || 0) + (weekData.weeklyChanges.tabs || 0);
      var tabsClass = (weekData.weeklyChanges.tabs || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Running Tabs</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.tabs) + '</span></div>';
      html += '<div class="balance-row change ' + tabsClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.tabs || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.tabs) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newTabs) + '</span></div>';
      html += '</div>';
      
      // Room Cash
      var newRoomCash = (weekData.runningBalances.roomCash || 0) + (weekData.weeklyChanges.roomCash || 0);
      var roomCashClass = (weekData.weeklyChanges.roomCash || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Room Cash</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.roomCash) + '</span></div>';
      html += '<div class="balance-row change ' + roomCashClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.roomCash || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.roomCash) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newRoomCash) + '</span></div>';
      html += '</div>';
      
      // Cash Diff
      var newCashDiff = (weekData.runningBalances.cashDiff || 0) + (weekData.weeklyChanges.cashDiff || 0);
      var cashDiffClass = (weekData.weeklyChanges.cashDiff || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Purchases Less Payments</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.cashDiff) + '</span></div>';
      html += '<div class="balance-row change ' + cashDiffClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.cashDiff || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.cashDiff) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newCashDiff) + '</span></div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // NOTES (D56)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-amber">📝</div>';
      html += '<div class="section-title">Weekly Notes (D56)</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<textarea class="notes-textarea" id="weeklyNotes" onchange="markChanged(this)">' + (weekData.weeklyNotes || '') + '</textarea>';
      html += '</div></div>';
      
      document.getElementById('content').innerHTML = html;
    }
    
    function collectAllData() {
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      var dailyFields = ['cash', 'cashLessFloat', 'cashToSafe', 'actualToSafe', 'cashDiffNotes', 
                         'pdq1', 'pdq2', 'cardTotal', 'grossOnTill', 'netOnTill', 'itemVoid',
                         'tabs', 'tabChecker', 'dailyOut', 'dailyOutNotes', 'roomsCard', 'airbnbBacs', 'roomCash'];
      
      var dailyData = [];
      for (var i = 0; i < 7; i++) {
        var dayKey = days[i];
        var dayData = {};
        
        dailyFields.forEach(function(field) {
          var el = document.getElementById(dayKey + '_' + field);
          if (el) {
            if (field.includes('Notes')) {
              dayData[field] = el.value || '';
            } else {
              dayData[field] = parseFloat(el.value) || 0;
            }
          }
        });
        
        dailyData.push(dayData);
      }
      
      // Collect expenses (keys are exp24, exp25, etc.)
      var expenses = {};
      weekData.expenses.forEach(function(expense) {
        var el = document.getElementById(expense.key);
        if (el) {
          expenses[expense.key] = parseFloat(el.value) || 0;
        }
      });
      
      return {
        weekSheet: weekSheetName,
        dailyData: dailyData,
        touchOffice: {
          wet: parseFloat(document.getElementById('wetSales').value) || 0,
          food: parseFloat(document.getElementById('foodSales').value) || 0,
          gross: parseFloat(document.getElementById('grossSales').value) || 0,
          net: parseFloat(document.getElementById('netSales').value) || 0
        },
        expenses: expenses,
        cashToCharlie: parseFloat(document.getElementById('cashToCharlie').value) || 0,
        weeklyNotes: document.getElementById('weeklyNotes').value || ''
      };
    }
    
    function saveChanges() {
      var allData = collectAllData();
      
      document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Saving all changes...</div></div>';
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            hasChanges = false;
            document.getElementById('changesBanner').classList.remove('visible');
            document.getElementById('saveBtn').classList.remove('visible');
            alert('✅ All changes saved successfully!');
            loadWeekData();
          } else {
            showStyledAlert(result.message || 'Unknown error', 'Save Failed', '❌');
            loadWeekData();
          }
        })
        .withFailureHandler(function(error) {
          showStyledAlert(error.message || 'Server error', 'Error', '❌');
          loadWeekData();
        })
        .saveOwnerWeekEditsFull(allData);
    }
    
    function approveWeek() {
      var allData = collectAllData();
      
      if (confirm('✅ Approve ' + weekSheetName + '?\\n\\nThis will save all changes and:\\n• Create archived manager sheet\\n• Create owner master sheet\\n• Update running balances')) {
        
        document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Saving and approving week...</div></div>';
        
        google.script.run
          .withSuccessHandler(function(result) {
            if (result.success) {
            alert('✅ Week Approved!\\n\\nMaster sheet: ' + result.masterSheet);
            if (webAppUrl) {
              try {
                navigateApp('?page=owner');
              } catch(e) {
                document.getElementById('content').innerHTML = '<div style="text-align:center; padding:40px;"><h2 style="color:#10b981;">✅ Week Approved!</h2><p style="margin:20px 0;">Master sheet: ' + result.masterSheet + '</p><p><a href="' + webAppUrl + '?page=owner" target="_top" style="display:inline-block; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; padding:15px 30px; border-radius:10px; text-decoration:none; font-weight:bold;">← Return to Owner Dashboard</a></p></div>';
              }
            }
          } else {
            showStyledAlert(result.message || 'Unknown error', 'Save Failed', '❌');
            loadWeekData();
          }
          })
          .withFailureHandler(function(error) {
            showStyledAlert(error.message || 'Server error', 'Error', '❌');
            loadWeekData();
          })
          .saveAndApproveWeekFull(allData);
      }
    }
  </script>


<script>(function(){document.addEventListener("touchmove",function(e){},{passive:true});document.body.style.overflowY="scroll";document.body.style.webkitOverflowScrolling="touch";document.body.style.height="auto";document.documentElement.style.height="auto";document.documentElement.style.overflow="auto";})()</script>
</body>
</html>`;

const OWNER_REVIEW_STANDALONE_HTML = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container { max-width: 1400px; margin: 0 auto; }
    
    .header-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(30, 58, 138, 0.3);
    }
    
    .header-card h1 { font-size: 26px; font-weight: 700; margin-bottom: 5px; }
    .week-info { font-size: 14px; opacity: 0.9; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(255,255,255,0.2);
      margin-left: 10px;
    }
    
    .nav-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 10px 0;
    }
    
    .nav-btn {
      background: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .nav-btn.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .nav-btn.save {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      display: none;
    }
    
    .nav-btn.save.visible { display: block; }
    
    .section-card {
      background: white;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      padding: 18px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .section-header:hover { background: #f8fafc; }
    
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    
    .icon-blue { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
    .icon-green { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
    .icon-amber { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
    .icon-purple { background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); }
    .icon-pink { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); }
    .icon-red { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); }
    
    .section-title { font-size: 16px; font-weight: 700; color: #1e293b; flex: 1; }
    
    .section-toggle {
      font-size: 18px;
      color: #94a3b8;
      transition: transform 0.2s;
    }
    
    .section-toggle.collapsed { transform: rotate(-90deg); }
    
    .section-body { padding: 20px 24px; overflow-x: auto; }
    .section-body.collapsed { display: none; }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 1200px;
    }
    
    .data-table th {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 12px 8px;
      text-align: center;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table th:first-child { text-align: left; border-radius: 8px 0 0 0; }
    .data-table th:last-child { border-radius: 0 8px 0 0; }
    
    .data-table td {
      padding: 8px 6px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table td:first-child {
      text-align: left;
      font-weight: 600;
      color: #1e293b;
      background: #f8fafc;
      min-width: 100px;
    }
    
    .data-table tr:hover td { background: #f0f9ff; }
    .data-table tr:hover td:first-child { background: #e0f2fe; }
    
    .data-table tfoot td {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
      font-weight: 700;
      color: #065f46;
      border-top: 2px solid #10b981;
    }
    
    .data-table tfoot td:first-child {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
    }
    
    .edit-input {
      width: 110px;
      padding: 8px 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      text-align: right;
      font-family: 'SF Mono', 'Consolas', monospace;
      transition: all 0.2s;
    }
    
    .edit-input:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    }
    
    .edit-input.changed {
      border-color: #f59e0b;
      background: #fef3c7;
    }
    
    .edit-input.notes { width: 220px; text-align: left; }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
    }
    
    .summary-card.editable {
      border-color: #fcd34d;
      background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
    }
    
    .summary-card.highlight-green {
      border-color: #22c55e;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    }
    
    .summary-card.highlight-red {
      border-color: #ef4444;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    }
    
    .summary-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .summary-value {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .summary-value.positive { color: #059669; }
    .summary-value.negative { color: #dc2626; }
    
    .summary-input {
      width: 100%;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      background: white;
    }
    
    .summary-input:focus {
      outline: none;
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
    }
    
    .summary-input.changed {
      border-color: #f59e0b;
      background: #fef3c7;
    }
    
    .expenses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
    }
    
    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .expense-label { font-size: 13px; color: #4b5563; font-weight: 500; flex: 1; }
    
    .expense-input {
      width: 100px;
      padding: 8px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      text-align: right;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .expense-input:focus { outline: none; border-color: #7c3aed; }
    .expense-input.changed { border-color: #f59e0b; background: #fef3c7; }
    
    .expense-total {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    
    .expense-total-label { font-size: 16px; font-weight: 700; }
    .expense-total-value { font-size: 22px; font-weight: 700; font-family: 'SF Mono', 'Consolas', monospace; }
    
    .balance-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .balance-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }
    
    .balance-header {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .balance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .balance-row-label { font-size: 13px; color: #64748b; }
    .balance-row-value { font-size: 15px; font-weight: 700; font-family: 'SF Mono', 'Consolas', monospace; }
    
    .balance-row.change {
      background: #f1f5f9;
      margin: 8px -10px;
      padding: 10px;
      border-radius: 8px;
    }
    
    .balance-row.change.positive { background: #d1fae5; }
    .balance-row.change.positive .balance-row-value { color: #059669; }
    .balance-row.change.negative { background: #fee2e2; }
    .balance-row.change.negative .balance-row-value { color: #dc2626; }
    
    .balance-row.total {
      border-top: 2px solid #e2e8f0;
      margin-top: 10px;
      padding-top: 15px;
    }
    
    .balance-row.total .balance-row-value { font-size: 22px; }
    .balance-row-value.negative { color: #dc2626; }
    
    .notes-textarea {
      width: 100%;
      min-height: 100px;
      padding: 15px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }
    
    .notes-textarea:focus {
      outline: none;
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
    }
    
    .notes-textarea.changed { border-color: #f59e0b; background: #fef3c7; }
    
    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px;
      gap: 20px;
    }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text { color: #64748b; font-size: 16px; }
    
    .changes-banner {
      background: #fef3c7;
      border: 2px solid #fcd34d;
      border-radius: 10px;
      padding: 12px 20px;
      margin-bottom: 20px;
      display: none;
      align-items: center;
      gap: 10px;
      position: sticky;
      top: 60px;
      z-index: 99;
    }
    
    .changes-banner.visible { display: flex; }
    .changes-text { flex: 1; font-weight: 600; color: #92400e; }
    
    @media (max-width: 768px) {
      .nav-bar { flex-direction: column; }
      .nav-btn { width: 100%; text-align: center; }
      .edit-input { width: 65px; font-size: 11px; }
    }
    
    @media print {
      body { background: white; padding: 0; }
      .nav-bar, .changes-banner { display: none !important; }
      .section-card { box-shadow: none; border: 1px solid #e2e8f0; }
      .section-body { overflow: visible; }
      .data-table { min-width: auto; font-size: 10px; }
    }
  </style>
__SHARED_STYLES__

<style>
  /* ── Container & page chrome ──────────────────────────────────── */
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .container > .header { display: none; /* replaced by .ps-header */ }
  .form-content, .content {
    padding: var(--s5);
    background: transparent;
  }
  .week-info { display: none; }

  /* Day banner (purple gradient → paint) */
  .form-content > div[style*="linear-gradient(135deg, #667eea"] {
    background: var(--paint) !important;
    color: var(--ink) !important;
    margin: calc(-1 * var(--s5)) calc(-1 * var(--s5)) var(--s5) !important;
    padding: var(--s4) var(--s5) !important;
    border-radius: 0 !important;
    text-align: left !important;
    border-bottom: 1px solid var(--paint-deep);
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:first-child {
    color: var(--ink-soft) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    opacity: 1 !important;
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:nth-child(2) {
    font-family: var(--serif) !important;
    font-size: 22px !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    margin-top: 4px !important;
  }

  /* Sections */
  .section {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s4);
    overflow: hidden;
  }
  .section-header {
    background: var(--cream) !important;
    border-bottom: 1px solid var(--line);
    color: var(--ink) !important;
    padding: var(--s3) var(--s4) !important;
    display: flex;
    align-items: center;
    gap: var(--s2);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.005em;
  }
  .section-header h2 {
    font-family: var(--serif);
    font-size: 15px !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--ink);
  }
  .section-icon { font-size: 16px; opacity: 0.7; }
  .section > *:not(.section-header) { padding-left: var(--s4); padding-right: var(--s4); }
  .section > *:not(.section-header):first-of-type:not(.section-header) { padding-top: var(--s4); }
  .section > *:not(.section-header):last-child { padding-bottom: var(--s4); }

  /* Form groups */
  .form-group { margin-bottom: var(--s3); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s3); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  @media (max-width: 600px) {
    .form-row, .form-grid, .form-row-3 { grid-template-columns: 1fr; }
  }

  /* Labels */
  .form-group label, .total-item label, label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  label[for="actualToSafe"] { color: var(--warn); }

  /* Inputs */
  input[type="number"], input[type="text"], input[type="date"], select, textarea {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); }
  textarea { resize: vertical; min-height: 70px; font-family: var(--sans); }
  input[readonly] { background: var(--cream); color: var(--ink-soft); cursor: default; }
  input.valid { border-color: var(--ok); background: var(--ok-bg); }
  input.invalid { border-color: var(--danger); background: var(--danger-bg); }

  /* Input prefix (£) */
  .input-with-icon, .input-with-prefix { position: relative; }
  .input-icon, .input-with-prefix > span:first-child {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }
  .input-with-icon input, .input-with-prefix input { padding-left: 28px; }

  /* Calculated values */
  .calculated-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 11px 14px;
    font-size: 15px;
    color: var(--ink);
    font-weight: 600;
    font-feature-settings: 'tnum';
  }
  .calculated-value.success { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
  .calculated-value.warning { background: var(--warn-bg); border-color: var(--warn); color: var(--warn); }
  .calculated-value.error { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  .auto-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    color: var(--ink-quiet);
    background: var(--cream);
    margin-left: 6px;
  }
  .cell-ref {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    color: var(--ink-faint);
    font-weight: 500;
    margin-left: 4px;
  }
  .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

  /* Validation items */
  .validation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: var(--r);
    margin-bottom: 6px;
  }
  .validation-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
    text-transform: none;
  }
  .validation-value {
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .validation-value.correct { color: var(--ok); }
  .validation-value.incorrect { color: var(--danger); }

  /* Info/warning boxes */
  .info-box {
    background: var(--paint-wash);
    border-left: 3px solid var(--paint-deep);
    padding: 11px 14px;
    margin-bottom: var(--s4);
    font-size: 12.5px;
    color: var(--ink-soft);
    border-radius: var(--r);
  }
  .info-box strong { color: var(--ink); }
  .warning-box {
    background: var(--warn-bg);
    border-left: 3px solid var(--warn);
    padding: 11px 14px;
    margin-bottom: var(--s3);
    font-size: 12.5px;
    color: var(--warn);
    border-radius: var(--r);
  }

  /* Buttons */
  .btn-group, .button-group {
    display: flex;
    gap: var(--s2);
    flex-wrap: wrap;
    margin-top: var(--s4);
  }
  .btn {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 13px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-save, .btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .btn-save:hover, .btn-primary:hover { background: #000; }
  .btn-menu, .btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .btn-menu:hover, .btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .btn-reset {
    background: var(--cream);
    color: var(--ink-soft);
    border-color: var(--line);
  }
  .btn-reset:hover { background: var(--warn-bg); color: var(--warn); }

  /* Totals & expense categories */
  .totals-grid { display: grid; grid-template-columns: 1fr; gap: var(--s3); }
  .total-item {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s3);
  }
  .total-item.input-required { background: var(--warn-bg) !important; border: 1px solid var(--warn) !important; }
  .total-item.highlight { background: var(--paint-wash); border-color: var(--paint-pale); }

  .expense-category {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s2);
    overflow: hidden;
  }
  .category-header {
    background: var(--cream);
    border-bottom: 1px solid var(--line-soft);
    padding: 11px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .category-header:hover { background: var(--paint-wash); }
  .category-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0;
    text-transform: none;
  }
  .category-total { font-weight: 700; font-feature-settings: 'tnum'; color: var(--ink); font-size: 13.5px; }
  .expense-items { padding: var(--s2); background: var(--white-warm); }
  .expense-item {
    display: grid;
    grid-template-columns: 1fr 110px auto;
    gap: 6px;
    margin-bottom: 6px;
    align-items: center;
  }
  .expense-item input[type="text"], .expense-item input[type="number"] {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .expense-item .account-select, .expense-item .vat-select {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .add-expense-btn {
    background: var(--cream);
    color: var(--ink-soft);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 6px;
    width: 100%;
  }
  .add-expense-btn:hover {
    background: var(--paint-wash);
    color: var(--ink);
    border-color: var(--paint-deep);
  }
  .remove-expense-btn {
    background: transparent;
    color: var(--ink-quiet);
    border: 0;
    cursor: pointer;
    font-size: 18px;
    padding: 0 8px;
  }
  .remove-expense-btn:hover { color: var(--danger); }
  .read-only label { color: var(--ink-quiet); }
  .loading.hidden { display: none; } }

  /* Cash difference indicator (Daily Out) */
  div[id="differenceIndicator"] > div {
    background: var(--warn-bg) !important;
    border: 1px solid var(--warn) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
  }
  div[id="differenceIndicator"] span { color: var(--ink) !important; }
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    transition: background 0.15s !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .modal-button.cancel:hover { background: var(--cream) !important; }
  .modal-button.warning { background: var(--warn) !important; color: white !important; }
  .modal-button.warning:hover { background: #6b3909 !important; }
  .modal-button.error { background: var(--danger) !important; color: white !important; }
  .modal-button.error:hover { background: #4a1313 !important; }
  .modal-button.success { background: var(--ok) !important; color: white !important; }
  .modal-button.success:hover { background: #1d3c1f !important; }
  .modal-button.info { background: var(--ink) !important; color: var(--paint) !important; }
  .modal-buttons { display: flex; gap: var(--s2); justify-content: center; }
  .confirm-buttons { display: flex; gap: var(--s2); justify-content: center; }
</style>


<style>
  /* v4.5 — modal box styling only, originals handle visibility */
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
</style>

<style>
  /* v4.8 — focused paint color overrides on original menu/view CSS */

  /* Page background and base */
  body { background: var(--white-warm) !important; color: var(--ink) !important; font-family: var(--sans) !important; }
  .container { background: transparent !important; }

  /* Header (the original purple-gradient header) — make it paint-ink */
  .header, .header-card {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .header h1, .header-card h1, .header-card p {
    color: var(--paint) !important;
    font-family: var(--serif) !important;
    font-weight: 500 !important;
  }
  .header p { color: var(--paint-pale) !important; }

  /* Status cards — original white card with purple accent */
  .status-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-left: 3px solid var(--paint) !important;
    border-radius: var(--r) !important;
  }
  .status-card.submitted { border-left-color: #d4a574 !important; }
  .status-card.complete { border-left-color: #5b8a51 !important; }

  /* Task cards (action items) */
  .task-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .task-card:hover { border-color: var(--paint) !important; }
  .task-card.primary {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .task-card.primary .task-title,
  .task-card.primary .task-subtitle { color: var(--paint) !important; }
  .task-icon { color: var(--paint) !important; }
  .task-card.primary .task-icon { color: var(--paint) !important; }

  /* Day boxes (the date grid) */
  .day-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }
  .day-box:hover { border-color: var(--paint) !important; background: var(--paint-wash) !important; }
  .day-box.complete {
    background: var(--paint) !important;
    border-color: var(--paint) !important;
    color: var(--ink) !important;
  }

  /* Large buttons */
  .btn-large, .btn {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  .btn-large:hover, .btn:hover {
    background: #000 !important;
    color: var(--paint) !important;
  }

  /* Badges */
  .badge-approved, .badge-complete {
    background: #e8f0e3 !important; color: #4a7042 !important;
    border: 1px solid #c8d8c0 !important;
  }
  .badge-pending, .badge-submitted {
    background: #fbf3e7 !important; color: #8a5a2a !important;
    border: 1px solid #d4a574 !important;
  }
  .badge-draft { background: var(--paint-wash) !important; color: var(--ink) !important; }
  .badge-exported { background: var(--ink) !important; color: var(--paint) !important; }

  /* Progress bar */
  .progress-bar { background: var(--paint) !important; }
  .progress-bar.complete { background: #5b8a51 !important; }

  /* Weekly status */
  .weekly-status {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .weekly-status.complete { border-color: #5b8a51 !important; background: #f5fbf3 !important; }
  .weekly-status.disabled { opacity: 0.5 !important; }

  /* Owner menu specific */
  .section-card, .balances-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .section-header { color: var(--ink) !important; }
  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .week-card:hover { border-color: var(--paint) !important; }
  .btn-banking, .btn-report, .btn-view, .btn-xero {
    background: var(--ink) !important; color: var(--paint) !important;
    border: 0 !important; border-radius: var(--r) !important;
  }
  .btn-disabled { background: var(--line) !important; color: var(--ink-soft) !important; cursor: not-allowed !important; }

  /* Figures grid */
  .figure-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .figure-label { color: var(--ink-soft) !important; }
  .figure-value { color: var(--ink) !important; font-family: var(--mono) !important; font-weight: 700 !important; }
  .figure-value.positive { color: #5b8a51 !important; }
  .figure-value.negative { color: #c0635a !important; }

  /* Balances */
  .balance-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
  }
  .balance-value { color: var(--ink) !important; font-family: var(--mono) !important; }

  /* Modal restyling */
  .modal-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .modal-title { font-family: var(--serif) !important; color: var(--ink) !important; }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-weight: 700 !important;
  }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }

  /* Info banner */
  .info-banner {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }

  /* Spinner */
  .spinner { border-top-color: var(--paint) !important; }

  /* ─────────────────────────────────────────────────────────────────
     v5.0 — Painted Owner Week Review refinements (over earlier rules)
     ───────────────────────────────────────────────────────────────── */

  /* Hide the redundant inline "Owner Week Review" black banner
     (we already have the painted strip header at the top of the page) */
  .header-card { display: none !important; }

  /* Page background — clean warm white */
  body { background: var(--white-warm) !important; padding: 0 !important; }
  .container { max-width: 1400px !important; padding: 16px 20px 32px !important; }

  /* Nav bar — match page bg, painted buttons.
     Sticky below the Varlo strip when that strip is present; when iframed
     the strip is hidden so top:0 is correct. */
  .nav-bar {
    background: transparent !important;
    padding: 8px 0 16px !important;
    border-bottom: 1px solid var(--line) !important;
    margin-bottom: 18px !important;
    position: sticky !important;
    top: 72px !important;
    z-index: 40 !important;
  }
  html.iframed .nav-bar {
    top: 0 !important;
  }
  .nav-btn {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    box-shadow: none !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    padding: 10px 18px !important;
    border-radius: var(--r) !important;
  }
  .nav-btn:hover {
    background: var(--paint-wash) !important;
    border-color: var(--ink) !important;
    transform: none !important;
    box-shadow: none !important;
  }
  /* Approve button — distinct green, painted style */
  .nav-btn.btn-approve, .nav-btn[onclick*="approve" i] {
    background: #5b8a51 !important;
    color: #ffffff !important;
    border-color: #4a7042 !important;
  }
  .nav-btn.btn-approve:hover, .nav-btn[onclick*="approve" i]:hover {
    background: #4a7042 !important;
  }

  /* Section cards — painted line accent */
  .section-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    box-shadow: none !important;
    overflow: hidden !important;
  }
  .section-header {
    background: var(--paint-wash) !important;
    border-bottom: 1px solid var(--paint-pale) !important;
    padding: 14px 18px !important;
  }
  .section-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 18px !important;
  }
  .section-icon { background: var(--paint) !important; }

  /* Data table — painted header, wider cells, full numbers visible */
  .data-table { min-width: 1400px !important; }
  .data-table th {
    background: var(--ink) !important;
    color: var(--paint) !important;
    font-family: var(--sans) !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    padding: 12px 10px !important;
    border-radius: 0 !important;
  }
  .data-table th:first-child { border-radius: 8px 0 0 0 !important; }
  .data-table th:last-child  { border-radius: 0 8px 0 0 !important; }
  .data-table td {
    padding: 8px 10px !important;
    border-bottom: 1px solid var(--line) !important;
  }
  .data-table td:first-child {
    background: var(--paint-wash) !important;
    color: var(--ink) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    min-width: 90px !important;
  }
  .data-table tr:hover td { background: #f7f4ec !important; }
  .data-table tr:hover td:first-child { background: var(--paint-pale) !important; }

  /* Totals row — softer painted green */
  .data-table tfoot td {
    background: #eef5e9 !important;
    color: #3a5d35 !important;
    border-top: 2px solid #5b8a51 !important;
    font-weight: 700 !important;
  }
  .data-table tfoot td:first-child {
    background: #dae9d3 !important;
  }

  /* Edit inputs — much wider, painted focus */
  .edit-input {
    width: 150px !important;
    padding: 9px 12px !important;
    font-size: 13px !important;
    font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace !important;
    background: #ffffff !important;
    border: 1px solid var(--line) !important;
    border-radius: 6px !important;
    color: var(--ink) !important;
  }
  .edit-input:focus {
    outline: 0 !important;
    border-color: var(--ink) !important;
    box-shadow: 0 0 0 2px var(--paint-wash) !important;
  }
  .edit-input.changed {
    border-color: #d4a574 !important;
    background: #fbf3e7 !important;
  }
  .edit-input.notes { width: 260px !important; text-align: left !important; }

  /* Summary cards — painted theme */
  .summary-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .summary-card.editable { border-color: var(--paint-pale) !important; background: var(--paint-wash) !important; }
  .summary-label { color: var(--ink-soft) !important; }
  .summary-value { color: var(--ink) !important; font-family: var(--serif) !important; font-weight: 500 !important; }
</style>

</head>
<body>
__VARLO_BOOT__

__VARLO_HEADER_OWNER_MENU__

  <div class="container">
    <div class="header-card">
      <h1>👑 Owner Week Review</h1>
      <div class="week-info" id="weekInfo">Loading...</div>
    </div>
    
    <div class="nav-bar">
      <button class="nav-btn" onclick="goBack()">← Back to Dashboard</button>
      <button class="nav-btn" onclick="viewReport()">📄 View Report</button>
      <button class="nav-btn" onclick="window.print()">🖨️ Print</button>
      <button class="nav-btn save" id="saveBtn" onclick="saveChanges()">💾 Save Changes</button>
      <button class="nav-btn primary" onclick="approveWeek()">✅ Approve & Create Master</button>
    </div>
    
    <div class="changes-banner" id="changesBanner">
      <span>⚠️</span>
      <span class="changes-text">You have unsaved changes</span>
    </div>
    
    <div id="content">
      <div class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Loading week data...</div>
      </div>
    </div>
  </div>
  
  <script>
    var webAppUrl = '';
    var weekSheetName = '__WEEK_SHEET__';
    var weekData = null;
    var hasChanges = false;
    
    function getUrlParam(param) {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    
    google.script.run
      .withSuccessHandler(function(url) { webAppUrl = url; })
      .getWebAppUrl();
    
    window.onload = function() {
      // weekSheetName is set via __WEEK_SHEET__ token substitution.
      // Fallback to URL param if substitution returned empty.
      if (!weekSheetName) {
        weekSheetName = getUrlParam('week') || '';
      }
      loadWeekData();
    };
    
    function goBack() {
      if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
      if (webAppUrl) {
        try {
          window.location.href = webAppUrl + '?page=owner';
        } catch(e) {
          window.location.href = webAppUrl + '?page=owner';
        }
      }
    }
    
    function viewReport() {
      if (webAppUrl && weekSheetName) {
        try {
          window.location.href = webAppUrl + '?page=weekreport&week=' + encodeURIComponent(weekSheetName);
        } catch(e) {
          window.location.href = webAppUrl + '?page=weekreport&week=' + encodeURIComponent(weekSheetName);
        }
      }
    }
    
    function formatCurrency(value) {
      var num = parseFloat(value) || 0;
      return (num < 0 ? '-' : '') + '£' + Math.abs(num).toFixed(2);
    }
    
    function loadWeekData() {
      google.script.run
        .withSuccessHandler(function(data) {
          weekData = data;
          weekSheetName = data.weekSheet;
          renderWeekData();
        })
        .withFailureHandler(function(error) {
          document.getElementById('content').innerHTML = 
            '<div class="loading"><div style="font-size:48px">❌</div><div class="loading-text">Error: ' + error.message + '</div></div>';
        })
        .getOwnerWeekReviewFull(weekSheetName);
    }
    
    function markChanged(input) {
      input.classList.add('changed');
      hasChanges = true;
      document.getElementById('changesBanner').classList.add('visible');
      document.getElementById('saveBtn').classList.add('visible');
    }
    
    function toggleSection(sectionId) {
      var body = document.getElementById(sectionId + 'Body');
      var toggle = document.getElementById(sectionId + 'Toggle');
      body.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
    }
    
    function renderWeekData() {
      document.getElementById('weekInfo').innerHTML = 
        weekData.weekSheet + ' | Week Ending: ' + weekData.weekEnding + 
        '<span class="status-badge">' + weekData.status + '</span>';
      
      var html = '';
      
      // ═══════════════════════════════════════════════════════════════
      // DAILY ENTRIES (Rows 7-13, Cols D-U)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'daily\\')">';
      html += '<div class="section-icon icon-blue">📅</div>';
      html += '<div class="section-title">Daily Entries (All Editable)</div>';
      html += '<span class="section-toggle" id="dailyToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="dailyBody">';
      
      html += '<table class="data-table">';
      html += '<thead><tr>';
      html += '<th>Day</th><th>Cash</th><th>Less Float</th><th>To Safe</th><th>Actual Safe</th><th>Notes</th>';
      html += '<th>PDQ 1</th><th>PDQ 2</th><th>Card Total</th><th>Gross Till</th><th>Net Till</th><th>Void</th>';
      html += '<th>Tabs</th><th>Tab Check</th><th>Daily Out</th><th>Out Notes</th>';
      html += '<th>Rooms Card</th><th>Airbnb</th><th>Room Cash</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (var i = 0; i < 7; i++) {
        var day = weekData.dailyData[i];
        var dayKey = days[i];
        
        html += '<tr>';
        html += '<td><strong>' + dayNames[i] + '</strong><br><small>' + (day.date || '') + '</small></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cash" value="' + (day.cash || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cashLessFloat" value="' + (day.cashLessFloat || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cashToSafe" value="' + (day.cashToSafe || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_actualToSafe" value="' + (day.actualToSafe || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input notes" id="' + dayKey + '_cashDiffNotes" value="' + (day.cashDiffNotes || '') + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_pdq1" value="' + (day.pdq1 || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_pdq2" value="' + (day.pdq2 || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_cardTotal" value="' + (day.cardTotal || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_grossOnTill" value="' + (day.grossOnTill || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_netOnTill" value="' + (day.netOnTill || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_itemVoid" value="' + (day.itemVoid || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_tabs" value="' + (day.tabs || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input" id="' + dayKey + '_tabChecker" value="' + (typeof day.tabChecker === 'number' ? day.tabChecker.toFixed(2) : (day.tabChecker || '0.00')) + '" onchange="markChanged(this)" readonly style="background:#f0f0f0;"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_dailyOut" value="' + (day.dailyOut || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="text" class="edit-input notes" id="' + dayKey + '_dailyOutNotes" value="' + (day.dailyOutNotes || '') + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_roomsCard" value="' + (day.roomsCard || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_airbnbBacs" value="' + (day.airbnbBacs || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '<td><input type="number" step="0.01" class="edit-input" id="' + dayKey + '_roomCash" value="' + (day.roomCash || 0).toFixed(2) + '" onchange="markChanged(this)"></td>';
        html += '</tr>';
      }
      
      // Totals row (read-only)
      html += '</tbody><tfoot><tr>';
      html += '<td>TOTALS</td>';
      html += '<td>' + formatCurrency(weekData.totals.cash) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cashLessFloat) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cashToSafe) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.actualToSafe) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.pdq1) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.pdq2) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.cardTotal) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.grossOnTill) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.netOnTill) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.itemVoid) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.tabs) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.dailyOut) + '</td>';
      html += '<td></td>';
      html += '<td>' + formatCurrency(weekData.totals.roomsCard) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.airbnbBacs) + '</td>';
      html += '<td>' + formatCurrency(weekData.totals.roomCash) + '</td>';
      html += '</tr></tfoot></table>';
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // TOUCHOFFICE DATA
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'touchoffice\\')">';
      html += '<div class="section-icon icon-purple">💻</div>';
      html += '<div class="section-title">TouchOffice Weekly Data</div>';
      html += '<span class="section-toggle" id="touchofficeToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="touchofficeBody">';
      html += '<div class="summary-grid">';
      html += '<div class="summary-card editable"><div class="summary-label">Wet Sales (D17)</div><input type="number" step="0.01" class="summary-input" id="wetSales" value="' + (weekData.touchOffice.wet || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Food Sales (D18)</div><input type="number" step="0.01" class="summary-input" id="foodSales" value="' + (weekData.touchOffice.food || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Gross Sales (H17)</div><input type="number" step="0.01" class="summary-input" id="grossSales" value="' + (weekData.touchOffice.gross || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Net Sales (H18)</div><input type="number" step="0.01" class="summary-input" id="netSales" value="' + (weekData.touchOffice.net || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '</div>';
      
      // Validation checker (read-only)
      if (weekData.validation) {
        var grossDiffClass = Math.abs(weekData.validation.grossDiff) < 0.01 ? 'highlight-green' : 'highlight-red';
        var netDiffClass = Math.abs(weekData.validation.netDiff) < 0.01 ? 'highlight-green' : 'highlight-red';
        html += '<div class="summary-grid" style="margin-top:15px;">';
        html += '<div class="summary-card ' + grossDiffClass + '"><div class="summary-label">Gross Diff (H19)</div><div class="summary-value">' + formatCurrency(weekData.validation.grossDiff) + '</div></div>';
        html += '<div class="summary-card ' + netDiffClass + '"><div class="summary-label">Net Diff (H20)</div><div class="summary-value">' + formatCurrency(weekData.validation.netDiff) + '</div></div>';
        html += '</div>';
      }
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // EXPENSES (Rows 24-41, Col D)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'expenses\\')">';
      html += '<div class="section-icon icon-pink">💳</div>';
      html += '<div class="section-title">Weekly Expenses</div>';
      html += '<span class="section-toggle" id="expensesToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="expensesBody">';
      html += '<div class="expenses-grid">';
      
      weekData.expenses.forEach(function(expense) {
        html += '<div class="expense-item">';
        html += '<span class="expense-label">' + expense.name + '</span>';
        html += '<input type="number" step="0.01" class="expense-input" id="' + expense.key + '" value="' + (expense.amount || 0).toFixed(2) + '" onchange="markChanged(this)">';
        // Show description if exists
        if (expense.description) {
          html += '<div class="expense-description" style="grid-column: 1 / -1; font-size: 11px; color: #666; padding: 2px 8px 6px 8px; font-style: italic; background: #f9fafb; border-radius: 0 0 6px 6px; margin-top: -4px;">' + expense.description + '</div>';
        }
        html += '</div>';
      });
      
      html += '<div class="expense-total">';
      html += '<span class="expense-total-label">TOTAL EXPENSES (D42)</span>';
      html += '<span class="expense-total-value">' + formatCurrency(weekData.totalExpenses) + '</span>';
      html += '</div>';
      html += '</div></div></div>';
      // --- Daily cash receipts (read-only; already in Xero via column F) ---
      if (weekData.dailyReceipts && weekData.dailyReceipts.length) {
        html += '<div class="section-card">';
        html += '<div class="section-header">';
        html += '<div class="section-icon icon-pink">🧾</div>';
        html += '<div class="section-title">Daily Cash Receipts (from till)</div>';
        html += '</div>';
        html += '<div class="section-body">';
        html += '<div style="font-size:12px;color:#666;margin-bottom:10px;">Paid in cash from the till and logged daily. Already counted - they go to Xero under their category and are NOT in the editable Weekly Expenses above. Shown here so you can see them before approving.</div>';
        var _dcrTotal = 0;
        weekData.dailyReceipts.forEach(function(r) {
          _dcrTotal += (r.amount || 0);
          html += '<div class="expense-item" style="display:flex;justify-content:space-between;gap:8px;align-items:center;">';
          html += '<span class="expense-label">' + r.day + ' - ' + r.category + (r.description ? ' <span style="color:#999;">(' + r.description + ')</span>' : '') + '</span>';
          html += '<span style="font-weight:600;white-space:nowrap;">' + formatCurrency(r.amount) + '</span>';
          html += '</div>';
        });
        html += '<div class="expense-total"><span class="expense-total-label">Total daily receipts</span><span class="expense-total-value">' + formatCurrency(_dcrTotal) + '</span></div>';
        html += '</div></div>';
      }
      // --- Card adjustments (read-only) ---
      if (weekData.cardAdjustments && weekData.cardAdjustments.items && weekData.cardAdjustments.items.length) {
        var _cadj = weekData.cardAdjustments;
        html += '<div class="section-card">';
        html += '<div class="section-header">';
        html += '<div class="section-icon icon-green">💳</div>';
        html += '<div class="section-title">Card Adjustments</div>';
        html += '</div>';
        html += '<div class="section-body">';
        html += '<div style="font-size:12px;color:#666;margin-bottom:10px;">Bank transfers net against the card/PDQ total in Xero. Cash back is recorded only - it already balances itself.</div>';
        _cadj.items.forEach(function(x) {
          var _lbl = (x.method === 'transfer_out') ? 'Bank transfer - refund out' : (x.method === 'transfer_in') ? 'Bank transfer - money in' : (x.method === 'cashback') ? 'Cash back' : x.method;
          html += '<div class="expense-item" style="display:flex;justify-content:space-between;gap:8px;align-items:center;">';
          html += '<span class="expense-label">' + x.day + ' - ' + _lbl + (x.reason ? ' <span style="color:#999;">(' + x.reason + ')</span>' : '') + '</span>';
          html += '<span style="font-weight:600;white-space:nowrap;">' + formatCurrency(x.amt) + '</span>';
          html += '</div>';
        });
        html += '<div class="expense-total"><span class="expense-total-label">Bank transfer net (adjusts card in Xero)</span><span class="expense-total-value">' + formatCurrency(_cadj.transferNet) + '</span></div>';
        if (_cadj.cashback) { html += '<div class="expense-total"><span class="expense-total-label">Cash back recorded (no Xero effect)</span><span class="expense-total-value">' + formatCurrency(_cadj.cashback) + '</span></div>'; }
        html += '</div></div>';
      }
      
      // ═══════════════════════════════════════════════════════════════
      // BALANCES & CASH FIGURES
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'balances\\')">';
      html += '<div class="section-icon icon-green">💰</div>';
      html += '<div class="section-title">Cash & Balances</div>';
      html += '<span class="section-toggle" id="balancesToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="balancesBody">';
      html += '<div class="summary-grid">';
      html += '<div class="summary-card"><div class="summary-label">Total Cash to Safe (G14)</div><div class="summary-value">' + formatCurrency(weekData.totalFigures.totalCashToSafe) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Cash After Expenses (D45)</div><div class="summary-value">' + formatCurrency(weekData.totalFigures.cashAfterExpenses) + '</div></div>';
      html += '<div class="summary-card editable"><div class="summary-label">Cash to Charlie (D46)</div><input type="number" step="0.01" class="summary-input" id="cashToCharlie" value="' + (weekData.totalFigures.cashToCharlie || 0).toFixed(2) + '" onchange="markChanged(this)"></div>';
      html += '<div class="summary-card"><div class="summary-label">Daily Cash Short (F14-G14)</div><div class="summary-value ' + (weekData.totalFigures.dailyCashShort >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.dailyCashShort) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Weekly Cash Short (D47)</div><div class="summary-value ' + (weekData.totalFigures.weeklyCashShort >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.weeklyCashShort) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Purchases Less Payments (D51)</div><div class="summary-value ' + (weekData.totalFigures.purchasesLessPayments >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.purchasesLessPayments) + '</div></div>';
      html += '<div class="summary-card"><div class="summary-label">Tab Balance (D53)</div><div class="summary-value ' + (weekData.totalFigures.tabBalance >= 0 ? 'positive' : 'negative') + '">' + formatCurrency(weekData.totalFigures.tabBalance) + '</div></div>';
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // RUNNING BALANCES
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header" onclick="toggleSection(\\'running\\')">';
      html += '<div class="section-icon icon-amber">📊</div>';
      html += '<div class="section-title">Running Balance Impact</div>';
      html += '<span class="section-toggle" id="runningToggle">▼</span>';
      html += '</div>';
      html += '<div class="section-body" id="runningBody">';
      html += '<div class="balance-cards">';
      
      // Tabs
      var newTabs = (weekData.runningBalances.tabs || 0) + (weekData.weeklyChanges.tabs || 0);
      var tabsClass = (weekData.weeklyChanges.tabs || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Running Tabs</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.tabs) + '</span></div>';
      html += '<div class="balance-row change ' + tabsClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.tabs || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.tabs) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newTabs) + '</span></div>';
      html += '</div>';
      
      // Room Cash
      var newRoomCash = (weekData.runningBalances.roomCash || 0) + (weekData.weeklyChanges.roomCash || 0);
      var roomCashClass = (weekData.weeklyChanges.roomCash || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Room Cash</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.roomCash) + '</span></div>';
      html += '<div class="balance-row change ' + roomCashClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.roomCash || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.roomCash) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newRoomCash) + '</span></div>';
      html += '</div>';
      
      // Cash Diff
      var newCashDiff = (weekData.runningBalances.cashDiff || 0) + (weekData.weeklyChanges.cashDiff || 0);
      var cashDiffClass = (weekData.weeklyChanges.cashDiff || 0) >= 0 ? 'positive' : 'negative';
      html += '<div class="balance-card">';
      html += '<div class="balance-header">Purchases Less Payments</div>';
      html += '<div class="balance-row"><span class="balance-row-label">Previous Balance</span><span class="balance-row-value">' + formatCurrency(weekData.runningBalances.cashDiff) + '</span></div>';
      html += '<div class="balance-row change ' + cashDiffClass + '"><span class="balance-row-label">This Week</span><span class="balance-row-value">' + ((weekData.weeklyChanges.cashDiff || 0) >= 0 ? '+' : '') + formatCurrency(weekData.weeklyChanges.cashDiff) + '</span></div>';
      html += '<div class="balance-row total"><span class="balance-row-label">New Balance</span><span class="balance-row-value">' + formatCurrency(newCashDiff) + '</span></div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // NOTES (D56)
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-amber">📝</div>';
      html += '<div class="section-title">Weekly Notes (D56)</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<textarea class="notes-textarea" id="weeklyNotes" onchange="markChanged(this)">' + (weekData.weeklyNotes || '') + '</textarea>';
      html += '</div></div>';
      
      document.getElementById('content').innerHTML = html;
    }
    
    function collectAllData() {
      var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      var dailyFields = ['cash', 'cashLessFloat', 'cashToSafe', 'actualToSafe', 'cashDiffNotes', 
                         'pdq1', 'pdq2', 'cardTotal', 'grossOnTill', 'netOnTill', 'itemVoid',
                         'tabs', 'tabChecker', 'dailyOut', 'dailyOutNotes', 'roomsCard', 'airbnbBacs', 'roomCash'];
      
      var dailyData = [];
      for (var i = 0; i < 7; i++) {
        var dayKey = days[i];
        var dayData = {};
        
        dailyFields.forEach(function(field) {
          var el = document.getElementById(dayKey + '_' + field);
          if (el) {
            if (field.includes('Notes')) {
              dayData[field] = el.value || '';
            } else {
              dayData[field] = parseFloat(el.value) || 0;
            }
          }
        });
        
        dailyData.push(dayData);
      }
      
      // Collect expenses (keys are exp24, exp25, etc.)
      var expenses = {};
      weekData.expenses.forEach(function(expense) {
        var el = document.getElementById(expense.key);
        if (el) {
          expenses[expense.key] = parseFloat(el.value) || 0;
        }
      });
      
      return {
        weekSheet: weekSheetName,
        dailyData: dailyData,
        touchOffice: {
          wet: parseFloat(document.getElementById('wetSales').value) || 0,
          food: parseFloat(document.getElementById('foodSales').value) || 0,
          gross: parseFloat(document.getElementById('grossSales').value) || 0,
          net: parseFloat(document.getElementById('netSales').value) || 0
        },
        expenses: expenses,
        cashToCharlie: parseFloat(document.getElementById('cashToCharlie').value) || 0,
        weeklyNotes: document.getElementById('weeklyNotes').value || ''
      };
    }
    
    function saveChanges() {
      var allData = collectAllData();
      
      document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Saving all changes...</div></div>';
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            hasChanges = false;
            document.getElementById('changesBanner').classList.remove('visible');
            document.getElementById('saveBtn').classList.remove('visible');
            alert('✅ All changes saved successfully!');
            loadWeekData();
          } else {
            showStyledAlert(result.message || 'Unknown error', 'Save Failed', '❌');
            loadWeekData();
          }
        })
        .withFailureHandler(function(error) {
          showStyledAlert(error.message || 'Server error', 'Error', '❌');
          loadWeekData();
        })
        .saveOwnerWeekEditsFull(allData);
    }
    
    function approveWeek() {
      var allData = collectAllData();
      
      if (confirm('✅ Approve ' + weekSheetName + '?\\n\\nThis will save all changes and:\\n• Create archived manager sheet\\n• Create owner master sheet\\n• Update running balances')) {
        
        document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Saving and approving week...</div></div>';
        
        google.script.run
          .withSuccessHandler(function(result) {
            if (result.success) {
            alert('✅ Week Approved!\\n\\nMaster sheet: ' + result.masterSheet);
            if (webAppUrl) {
              try {
                window.location.href = webAppUrl + '?page=owner';
              } catch(e) {
                document.getElementById('content').innerHTML = '<div style="text-align:center; padding:40px;"><h2 style="color:#10b981;">✅ Week Approved!</h2><p style="margin:20px 0;">Master sheet: ' + result.masterSheet + '</p><p><a href="' + webAppUrl + '?page=owner" target="_top" style="display:inline-block; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; padding:15px 30px; border-radius:10px; text-decoration:none; font-weight:bold;">← Return to Owner Dashboard</a></p></div>';
              }
            }
          } else {
            showStyledAlert(result.message || 'Unknown error', 'Save Failed', '❌');
            loadWeekData();
          }
          })
          .withFailureHandler(function(error) {
            showStyledAlert(error.message || 'Server error', 'Error', '❌');
            loadWeekData();
          })
          .saveAndApproveWeekFull(allData);
      }
    }
  </script>

</body>
</html>`;

const MASTER_VIEW_HTML = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    /* Styled Alert Modal */
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  justify-content: center;
  align-items: center;
}

.modal-overlay.show { display: flex; }

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.modal-message {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 25px;
  line-height: 1.5;
}

.modal-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 40px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-button.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.modal-button.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 30px;
      background: #f8fafc;
      border-radius: 12px;
      padding: 25px;
      border: 2px solid #e2e8f0;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .data-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 15px;
      align-items: center;
    }
    
    .data-label {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    }
    
    .data-value {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'Courier New', monospace;
    }
    
    .data-value.large {
      font-size: 20px;
      color: #1e3a8a;
    }
    
    .editable-section {
      background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
      border: 3px solid #f59e0b;
    }
    
    .input-group {
      margin-bottom: 15px;
    }
    
    .input-label {
      font-size: 14px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 5px;
      display: block;
    }
    
    .input-field {
      width: 100%;
      padding: 12px;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      font-size: 16px;
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }
    
    .input-field:focus {
      outline: none;
      border-color: #d97706;
      background: #fffbeb;
    }
    
    .buttons {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      justify-content: center;
    }
    
    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .btn-back {
      background: #64748b;
      color: white;
    }
    
    .btn-back:hover {
      background: #475569;
      transform: translateY(-2px);
    }
    
    .btn-save {
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: white;
    }
    
    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
    }
    
    .btn-finalize {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .btn-finalize:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
    }
    
    .btn-finalize:disabled {
      background: #cbd5e1;
      color: #94a3b8;
      cursor: not-allowed;
    }
    
    .btn-finalize:disabled:hover {
      transform: none;
      box-shadow: none;
    }
    
    .alert-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #92400e;
    }
    
    .balance-card {
      border-radius: 10px;
      padding: 18px;
    }
    
    .balance-card.positive {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #10b981;
    }
    
    .balance-card.negative {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      border: 2px solid #ef4444;
    }
    
    .balance-card.neutral {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #3b82f6;
    }
    
    .balance-card .balance-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    
    .balance-card .balance-amount {
      font-size: 22px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
    }
    
    .balance-card .balance-note {
      font-size: 12px;
      margin-top: 6px;
      font-style: italic;
    }
    
    .no-banking-message {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 3px solid #ef4444;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-top: 15px;
    }
    
    .no-banking-message h3 {
      color: #991b1b;
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .no-banking-message p {
      color: #b91c1c;
      font-size: 14px;
    }
  </style>
__SHARED_STYLES__

<style>
  /* ── Container & page chrome ──────────────────────────────────── */
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .container > .header { display: none; /* replaced by .ps-header */ }
  .form-content, .content {
    padding: var(--s5);
    background: transparent;
  }
  .week-info { display: none; }

  /* Day banner (purple gradient → paint) */
  .form-content > div[style*="linear-gradient(135deg, #667eea"] {
    background: var(--paint) !important;
    color: var(--ink) !important;
    margin: calc(-1 * var(--s5)) calc(-1 * var(--s5)) var(--s5) !important;
    padding: var(--s4) var(--s5) !important;
    border-radius: 0 !important;
    text-align: left !important;
    border-bottom: 1px solid var(--paint-deep);
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:first-child {
    color: var(--ink-soft) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    opacity: 1 !important;
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:nth-child(2) {
    font-family: var(--serif) !important;
    font-size: 22px !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    margin-top: 4px !important;
  }

  /* Sections */
  .section {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s4);
    overflow: hidden;
  }
  .section-header {
    background: var(--cream) !important;
    border-bottom: 1px solid var(--line);
    color: var(--ink) !important;
    padding: var(--s3) var(--s4) !important;
    display: flex;
    align-items: center;
    gap: var(--s2);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.005em;
  }
  .section-header h2 {
    font-family: var(--serif);
    font-size: 15px !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--ink);
  }
  .section-icon { font-size: 16px; opacity: 0.7; }
  .section > *:not(.section-header) { padding-left: var(--s4); padding-right: var(--s4); }
  .section > *:not(.section-header):first-of-type:not(.section-header) { padding-top: var(--s4); }
  .section > *:not(.section-header):last-child { padding-bottom: var(--s4); }

  /* Form groups */
  .form-group { margin-bottom: var(--s3); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s3); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  @media (max-width: 600px) {
    .form-row, .form-grid, .form-row-3 { grid-template-columns: 1fr; }
  }

  /* Labels */
  .form-group label, .total-item label, label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  label[for="actualToSafe"] { color: var(--warn); }

  /* Inputs */
  input[type="number"], input[type="text"], input[type="date"], select, textarea {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); }
  textarea { resize: vertical; min-height: 70px; font-family: var(--sans); }
  input[readonly] { background: var(--cream); color: var(--ink-soft); cursor: default; }
  input.valid { border-color: var(--ok); background: var(--ok-bg); }
  input.invalid { border-color: var(--danger); background: var(--danger-bg); }

  /* Input prefix (£) */
  .input-with-icon, .input-with-prefix { position: relative; }
  .input-icon, .input-with-prefix > span:first-child {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }
  .input-with-icon input, .input-with-prefix input { padding-left: 28px; }

  /* Calculated values */
  .calculated-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 11px 14px;
    font-size: 15px;
    color: var(--ink);
    font-weight: 600;
    font-feature-settings: 'tnum';
  }
  .calculated-value.success { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
  .calculated-value.warning { background: var(--warn-bg); border-color: var(--warn); color: var(--warn); }
  .calculated-value.error { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  .auto-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    color: var(--ink-quiet);
    background: var(--cream);
    margin-left: 6px;
  }
  .cell-ref {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    color: var(--ink-faint);
    font-weight: 500;
    margin-left: 4px;
  }
  .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

  /* Validation items */
  .validation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: var(--r);
    margin-bottom: 6px;
  }
  .validation-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
    text-transform: none;
  }
  .validation-value {
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .validation-value.correct { color: var(--ok); }
  .validation-value.incorrect { color: var(--danger); }

  /* Info/warning boxes */
  .info-box {
    background: var(--paint-wash);
    border-left: 3px solid var(--paint-deep);
    padding: 11px 14px;
    margin-bottom: var(--s4);
    font-size: 12.5px;
    color: var(--ink-soft);
    border-radius: var(--r);
  }
  .info-box strong { color: var(--ink); }
  .warning-box {
    background: var(--warn-bg);
    border-left: 3px solid var(--warn);
    padding: 11px 14px;
    margin-bottom: var(--s3);
    font-size: 12.5px;
    color: var(--warn);
    border-radius: var(--r);
  }

  /* Buttons */
  .btn-group, .button-group {
    display: flex;
    gap: var(--s2);
    flex-wrap: wrap;
    margin-top: var(--s4);
  }
  .btn {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 13px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-save, .btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .btn-save:hover, .btn-primary:hover { background: #000; }
  .btn-menu, .btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .btn-menu:hover, .btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .btn-reset {
    background: var(--cream);
    color: var(--ink-soft);
    border-color: var(--line);
  }
  .btn-reset:hover { background: var(--warn-bg); color: var(--warn); }

  /* Totals & expense categories */
  .totals-grid { display: grid; grid-template-columns: 1fr; gap: var(--s3); }
  .total-item {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s3);
  }
  .total-item.input-required { background: var(--warn-bg) !important; border: 1px solid var(--warn) !important; }
  .total-item.highlight { background: var(--paint-wash); border-color: var(--paint-pale); }

  .expense-category {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s2);
    overflow: hidden;
  }
  .category-header {
    background: var(--cream);
    border-bottom: 1px solid var(--line-soft);
    padding: 11px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .category-header:hover { background: var(--paint-wash); }
  .category-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0;
    text-transform: none;
  }
  .category-total { font-weight: 700; font-feature-settings: 'tnum'; color: var(--ink); font-size: 13.5px; }
  .expense-items { padding: var(--s2); background: var(--white-warm); }
  .expense-item {
    display: grid;
    grid-template-columns: 1fr 110px auto;
    gap: 6px;
    margin-bottom: 6px;
    align-items: center;
  }
  .expense-item input[type="text"], .expense-item input[type="number"] {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .expense-item .account-select, .expense-item .vat-select {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .add-expense-btn {
    background: var(--cream);
    color: var(--ink-soft);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 6px;
    width: 100%;
  }
  .add-expense-btn:hover {
    background: var(--paint-wash);
    color: var(--ink);
    border-color: var(--paint-deep);
  }
  .remove-expense-btn {
    background: transparent;
    color: var(--ink-quiet);
    border: 0;
    cursor: pointer;
    font-size: 18px;
    padding: 0 8px;
  }
  .remove-expense-btn:hover { color: var(--danger); }
  .read-only label { color: var(--ink-quiet); }
  .loading.hidden { display: none; } }

  /* Cash difference indicator (Daily Out) */
  div[id="differenceIndicator"] > div {
    background: var(--warn-bg) !important;
    border: 1px solid var(--warn) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
  }
  div[id="differenceIndicator"] span { color: var(--ink) !important; }
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    transition: background 0.15s !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .modal-button.cancel:hover { background: var(--cream) !important; }
  .modal-button.warning { background: var(--warn) !important; color: white !important; }
  .modal-button.warning:hover { background: #6b3909 !important; }
  .modal-button.error { background: var(--danger) !important; color: white !important; }
  .modal-button.error:hover { background: #4a1313 !important; }
  .modal-button.success { background: var(--ok) !important; color: white !important; }
  .modal-button.success:hover { background: #1d3c1f !important; }
  .modal-button.info { background: var(--ink) !important; color: var(--paint) !important; }
  .modal-buttons { display: flex; gap: var(--s2); justify-content: center; }
  .confirm-buttons { display: flex; gap: var(--s2); justify-content: center; }
</style>


<style>
  /* v4.5 — modal box styling only, originals handle visibility */
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
</style>

<style>
  /* v4.8 — focused paint color overrides on original menu/view CSS */

  /* Page background and base */
  body { background: var(--white-warm) !important; color: var(--ink) !important; font-family: var(--sans) !important; }
  .container { background: transparent !important; }

  /* Header (the original purple-gradient header) — make it paint-ink */
  .header, .header-card {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .header h1, .header-card h1, .header-card p {
    color: var(--paint) !important;
    font-family: var(--serif) !important;
    font-weight: 500 !important;
  }
  .header p { color: var(--paint-pale) !important; }

  /* Status cards — original white card with purple accent */
  .status-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-left: 3px solid var(--paint) !important;
    border-radius: var(--r) !important;
  }
  .status-card.submitted { border-left-color: #d4a574 !important; }
  .status-card.complete { border-left-color: #5b8a51 !important; }

  /* Task cards (action items) */
  .task-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .task-card:hover { border-color: var(--paint) !important; }
  .task-card.primary {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .task-card.primary .task-title,
  .task-card.primary .task-subtitle { color: var(--paint) !important; }
  .task-icon { color: var(--paint) !important; }
  .task-card.primary .task-icon { color: var(--paint) !important; }

  /* Day boxes (the date grid) */
  .day-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }
  .day-box:hover { border-color: var(--paint) !important; background: var(--paint-wash) !important; }
  .day-box.complete {
    background: var(--paint) !important;
    border-color: var(--paint) !important;
    color: var(--ink) !important;
  }

  /* Large buttons */
  .btn-large, .btn {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  .btn-large:hover, .btn:hover {
    background: #000 !important;
    color: var(--paint) !important;
  }

  /* Badges */
  .badge-approved, .badge-complete {
    background: #e8f0e3 !important; color: #4a7042 !important;
    border: 1px solid #c8d8c0 !important;
  }
  .badge-pending, .badge-submitted {
    background: #fbf3e7 !important; color: #8a5a2a !important;
    border: 1px solid #d4a574 !important;
  }
  .badge-draft { background: var(--paint-wash) !important; color: var(--ink) !important; }
  .badge-exported { background: var(--ink) !important; color: var(--paint) !important; }

  /* Progress bar */
  .progress-bar { background: var(--paint) !important; }
  .progress-bar.complete { background: #5b8a51 !important; }

  /* Weekly status */
  .weekly-status {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .weekly-status.complete { border-color: #5b8a51 !important; background: #f5fbf3 !important; }
  .weekly-status.disabled { opacity: 0.5 !important; }

  /* Owner menu specific */
  .section-card, .balances-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .section-header { color: var(--ink) !important; }
  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .week-card:hover { border-color: var(--paint) !important; }
  .btn-banking, .btn-report, .btn-view, .btn-xero {
    background: var(--ink) !important; color: var(--paint) !important;
    border: 0 !important; border-radius: var(--r) !important;
  }
  .btn-disabled { background: var(--line) !important; color: var(--ink-soft) !important; cursor: not-allowed !important; }

  /* Figures grid */
  .figure-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .figure-label { color: var(--ink-soft) !important; }
  .figure-value { color: var(--ink) !important; font-family: var(--mono) !important; font-weight: 700 !important; }
  .figure-value.positive { color: #5b8a51 !important; }
  .figure-value.negative { color: #c0635a !important; }

  /* Balances */
  .balance-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
  }
  .balance-value { color: var(--ink) !important; font-family: var(--mono) !important; }

  /* Modal restyling */
  .modal-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .modal-title { font-family: var(--serif) !important; color: var(--ink) !important; }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-weight: 700 !important;
  }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }

  /* Info banner */
  .info-banner {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }

  /* Spinner */
  .spinner { border-top-color: var(--paint) !important; }

  /* ─────────────────────────────────────────────────────────────────
     v5.1 — Painted Master Sheet view refinements
     ───────────────────────────────────────────────────────────────── */

  /* Container — clean warm white */
  body { background: var(--white-warm) !important; }
  .container {
    max-width: 880px !important;
    margin: 0 auto !important;
    padding: 24px 20px 40px !important;
    background: transparent !important;
  }

  /* Hide redundant inline blue "Master Sheet" header (painted strip up top already shows it) */
  .header { display: none !important; }

  /* Section cards — warm card surface, line border */
  .section {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    box-shadow: none !important;
    padding: 22px 24px !important;
    margin-bottom: 16px !important;
  }
  .section-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
    margin-bottom: 18px !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    -webkit-text-fill-color: initial !important;
    border-bottom: 1px solid var(--line) !important;
    padding-bottom: 12px !important;
  }

  /* Editable section — painted-wash accent */
  .editable-section {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
    padding: 22px 24px !important;
  }

  /* Data grid rows */
  .data-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
  }
  .data-label, .data-value {
    padding: 12px 0 !important;
    border-bottom: 1px solid #f1ece0 !important;
  }
  .data-label {
    color: var(--ink-soft) !important;
    font-weight: 500 !important;
    font-size: 14px !important;
  }
  .data-value {
    color: var(--ink) !important;
    font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    text-align: right !important;
  }
  .data-value.neutral { color: var(--ink) !important; }
  .data-value.positive { color: #3a5d35 !important; }
  .data-value.negative { color: #a14545 !important; }

  /* Balance cards (Cash to/from Owner, Total Out) — keep semantic colour but softer */
  .balance-card {
    background: transparent !important;
    border: 0 !important;
    padding: 8px 0 !important;
    box-shadow: none !important;
  }
  .balance-title {
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    font-size: 14px !important;
  }
  .balance-amount {
    font-family: 'JetBrains Mono', 'SF Mono', monospace !important;
    font-weight: 700 !important;
    font-size: 18px !important;
  }
  .balance-card.positive .balance-title,
  .balance-card.positive .balance-amount { color: #3a5d35 !important; }
  .balance-card.negative .balance-title,
  .balance-card.negative .balance-amount { color: #a14545 !important; }
  .balance-note {
    font-size: 12px !important;
    color: var(--ink-soft) !important;
    margin-top: 12px !important;
    line-height: 1.5 !important;
  }

  /* Alert / warning banners — warm amber, not bright yellow */
  .alert-box, .no-banking-message {
    background: #faf2dc !important;
    border: 1px solid #e8d595 !important;
    border-left: 4px solid #c9a544 !important;
    color: #6b5618 !important;
    border-radius: var(--r) !important;
    padding: 14px 18px !important;
    margin-bottom: 16px !important;
    font-size: 14px !important;
  }
  .alert-box strong { color: #4a3c10 !important; }

  /* CRITICAL CHECK box — keep alert character, painted warmth */
  .editable-section[style*="background"] { background: #faf2dc !important; }

  /* Input fields */
  .input-group {
    display: flex !important;
    flex-direction: column !important;
    margin-bottom: 14px !important;
  }
  .input-label {
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: var(--ink-soft) !important;
    margin-bottom: 6px !important;
  }
  .input-field {
    background: #ffffff !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r-sm, 8px) !important;
    padding: 11px 14px !important;
    font-family: 'JetBrains Mono', 'SF Mono', monospace !important;
    font-size: 14px !important;
    color: var(--ink) !important;
  }
  .input-field:focus {
    outline: 0 !important;
    border-color: var(--ink) !important;
    box-shadow: 0 0 0 2px var(--paint-wash) !important;
  }

  /* Buttons — painted style */
  .buttons {
    display: flex !important;
    gap: 10px !important;
    margin-top: 22px !important;
    flex-wrap: wrap !important;
  }
  .btn {
    font-family: var(--sans) !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    padding: 12px 22px !important;
    border-radius: var(--r-sm, 8px) !important;
    border: 1px solid transparent !important;
    cursor: pointer !important;
    transition: background 0.15s, border-color 0.15s !important;
    box-shadow: none !important;
  }
  .btn-save {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .btn-save:hover { background: #000 !important; }
  .btn-back {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border-color: var(--line) !important;
  }
  .btn-back:hover { background: var(--paint-wash) !important; border-color: var(--ink) !important; }

</style>

</head>
<body>
__VARLO_BOOT__

__VARLO_HEADER_MENU__

  <div class="container">
    <div class="header">
      <h1>💰 Xero Master Sheet</h1>
      <p id="weekInfo">Loading...</p>
    </div>
    
    <div class="content">
      <div class="alert-box">
        ⚠️ Please enter banking details in the yellow sections below, then click "Save Banking Details"
      </div>
      
      <!-- Key Financial Items -->
      <div class="section">
        <div class="section-title">📊 Week Overview</div>
        <div class="data-grid">
          <div class="data-label">Wet Sales:</div>
          <div class="data-value" id="wetSales">£0.00</div>
          
          <div class="data-label">Food Sales:</div>
          <div class="data-value" id="foodSales">£0.00</div>
          
          <div class="data-label" style="display:none;">Room Sales (Direct Only):</div>
          <div class="data-value" id="roomSales" style="display:none;">£0.00</div>
          
          <div class="data-label">Tabs (+ or -) OPPOSITE PAPERWORK:</div>
          <div class="data-value" id="tabs">£0.00</div>
          
          <div class="data-label">Pub PDQ Payments:</div>
          <div class="data-value" id="pubPDQ">£0.00</div>
          
          <div class="data-label">Room PDQ Payments:</div>
          <div class="data-value" id="roomPDQ">£0.00</div>
          
          <div class="data-label">FOC Voucher:</div>
          <div class="data-value" id="focVoucher">£0.00</div>
        </div>
        
        <!-- Cash Summary within Week Overview -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
          <div class="data-grid">
            <div class="data-label" style="font-weight: 700; color: #059669;">💰 Cash to/from Owner (C28):</div>
            <div class="data-value" id="cashPaymentsPub" style="font-weight: 700; font-size: 18px;">£0.00</div>
            
            <div class="data-label" style="font-weight: 700; color: #dc2626;">📤 Total Amount Out (C30):</div>
            <div class="data-value" id="totalAmountOut" style="font-weight: 700; color: #dc2626; font-size: 18px;">£0.00</div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #94a3b8; font-style: italic;">
            Note: C28 is shown as the true cash position (positive = owner receives, negative = owner owes). The Xero export uses the reversed value.
          </div>
        </div>
      </div>
      
      <!-- CRITICAL: Difference Cash Received to Actual -->
      <div class="section" style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border: 4px solid #f59e0b; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);">
        <div class="section-title" style="color: #92400e; font-size: 22px;">
          ⚠️ CRITICAL CHECK - Difference Cash Received to Actual
        </div>
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 10px;">
            This should be close to £0.00 - if not, check your figures!
          </div>
          <div style="font-size: 36px; font-weight: 900; font-family: 'Courier New', monospace; color: #92400e;" id="cashDifference">
            £0.00
          </div>
          <div style="margin-top: 15px; font-size: 13px; color: #78350f; font-style: italic;">
            Difference (C30)
          </div>
        </div>
      </div>
      
      <!-- Detailed Expenses Breakdown -->
      <div class="section" style="background: linear-gradient(135deg, #fce7f3 0%, #ffffff 100%); border-color: #ec4899;">
        <div class="section-title">📋 Expenses Breakdown</div>
        <div class="data-grid">
          <div class="data-label">Room Cleaning:</div>
          <div class="data-value" id="expRoomCleaning">£0.00</div>
          
          <div class="data-label">Pub Cleaning:</div>
          <div class="data-value" id="expPubCleaning">£0.00</div>
          
          <div class="data-label">Temp Kitchen Staff:</div>
          <div class="data-value" id="expTempKitchen">£0.00</div>
          
          <div class="data-label">Temp Bar Staff:</div>
          <div class="data-value" id="expTempBar">£0.00</div>
          
          <div class="data-label">FOH Temp Staff:</div>
          <div class="data-value" id="expFOHTempStaff">£0.00</div>
          
          <div class="data-label">Room Supplies (no VAT):</div>
          <div class="data-value" id="expRoomSuppliesNoVAT">£0.00</div>
          
          <div class="data-label">Room Supplies (vatable):</div>
          <div class="data-value" id="expRoomSuppliesVAT">£0.00</div>
          
          <div class="data-label">Bar Supplies (no VAT):</div>
          <div class="data-value" id="expBarSuppliesNoVAT">£0.00</div>
          
          <div class="data-label">Bar Supplies (vatable):</div>
          <div class="data-value" id="expBarSuppliesVAT">£0.00</div>
          
          <div class="data-label">Bar Direct Costs (no VAT):</div>
          <div class="data-value" id="expBarDirectCosts">£0.00</div>
          
          <div class="data-label">Kitchen Supplies (no VAT):</div>
          <div class="data-value" id="expKitchenSuppliesNoVAT">£0.00</div>
          
          <div class="data-label">Kitchen Supplies (vatable):</div>
          <div class="data-value" id="expKitchenSuppliesVAT">£0.00</div>
          
          <div class="data-label">Joint Pub Expenses (no VAT):</div>
          <div class="data-value" id="expJointPubNoVAT">£0.00</div>
          
          <div class="data-label">Joint Pub Expenses (vatable):</div>
          <div class="data-value" id="expJointPubVAT">£0.00</div>
          
          <div class="data-label">Pub Maintenance (no VAT):</div>
          <div class="data-value" id="expPubMaintenance">£0.00</div>
          
          <div class="data-label">Cleaning Supplies (vatable):</div>
          <div class="data-value" id="expCleaningSupplies">£0.00</div>
          
          <div class="data-label">Refunds:</div>
          <div class="data-value" id="expRefunds">£0.00</div>
          
          <div class="data-label">Custom Expense:</div>
          <div class="data-value" id="expCustomExpense">£0.00</div>
        </div>
      </div>
      
      <!-- OWNER CASH BALANCE with carry-forward -->
      <div class="section" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px solid #3b82f6;">
        <div class="section-title" style="color: #1e40af;">📊 Owner Cash Balance</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
          <div class="balance-card neutral" id="thisWeekCard">
            <div class="balance-title" style="color: #1e40af;">This Week</div>
            <div class="balance-amount" id="thisWeekCash" style="color: #1e40af;">£0.00</div>
            <div class="balance-note" style="color: #3b82f6;">Cash position this week</div>
          </div>
          
          <div class="balance-card neutral" id="outstandingCard">
            <div class="balance-title" style="color: #92400e;">Outstanding</div>
            <div class="balance-amount" id="outstandingBalance" style="color: #92400e;">£0.00</div>
            <div class="balance-note" id="outstandingNote" style="color: #b45309;">Carried forward from previous weeks</div>
          </div>
          
          <div class="balance-card neutral" id="netDueCard">
            <div class="balance-title" style="color: #1e293b;">Net Cash Due</div>
            <div class="balance-amount" id="netCashDue" style="color: #1e293b;">£0.00</div>
            <div class="balance-note" id="netDueNote" style="color: #64748b;">Total including carry-forward</div>
          </div>
        </div>
        
        <div id="noBankingMessage" style="display: none;" class="no-banking-message">
          <h3>🚫 No Banking Required</h3>
          <p id="noBankingText">Negative balance carries forward to next week.</p>
        </div>
      </div>
      
      <!-- ROOMS CASH BANKING — hidden: cash rooms are not declared on owner paperwork -->
      <div class="section editable-section" id="roomsCashBankingSection" style="display:none;">
        <div class="section-title">🏨 Rooms Cash Banking</div>
        
        <div class="data-grid" style="margin-bottom: 20px;">
          <div class="data-label">Cash Rooms (C44):</div>
          <div class="data-value" id="cashRoomsDue">£0.00</div>
        </div>
        
        <div class="input-group">
          <label class="input-label">Rooms Cash Received (C45) - EDITABLE:</label>
          <input type="number" step="0.01" class="input-field" id="cashRoomsReceived" placeholder="Enter amount received">
        </div>
        
        <div class="data-grid">
          <div class="data-label">Due for Rooms (C46):</div>
          <div class="data-value" id="remainingToBank">£0.00</div>
        </div>
      </div>
      
      <!-- PUB CASH BANKING -->
      <div class="section editable-section">
        <div class="section-title">🍺 Pub Cash Banking</div>
        
        <div class="data-grid" style="margin-bottom: 20px;">
          <div class="data-label">Cash Due (C52):</div>
          <div class="data-value" id="cashDue">£0.00</div>
        </div>
        
        <div class="input-group">
          <label class="input-label">Actual Cash Received (C53) - EDITABLE:</label>
          <input type="number" step="0.01" class="input-field" id="actualCashReceived" placeholder="Enter amount received">
        </div>
        
        <div class="input-group">
          <label class="input-label">Amount Banked (C54) - EDITABLE:</label>
          <input type="number" step="0.01" class="input-field" id="amountBanked" placeholder="Enter amount banked">
        </div>
        
        <div class="input-group">
          <label class="input-label">Date Banked (C55) - EDITABLE:</label>
          <input type="date" class="input-field" id="dateBanked">
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="buttons">
        <button class="btn btn-back" onclick="goBack()">
          ← Back to Dashboard
        </button>
        <button class="btn btn-save" onclick="saveBankingDetails()">
          💾 Save Banking Details
        </button>
      </div>
    </div>
  </div>
  
  <script>
    var sheetNameFromUrl = '__SHEET_NAME__';  // Get from URL parameter via _applyBranding
    let masterSheetName = '';
    let bankingComplete = false;
    var webAppUrl = '';
    
    // Get web app URL on load
    google.script.run.withSuccessHandler(function(url) {
      webAppUrl = url;
    }).getWebAppUrl();
    
    window.onload = function() {
      loadMasterSheetData();
    };
    
    function formatPounds(value) {
      var num = parseFloat(value) || 0;
      var isNeg = num < 0;
      var abs = Math.abs(num);
      return (isNeg ? '-' : '') + '£' + abs.toFixed(2);
    }
    
    function setCardStyle(cardEl, value) {
      cardEl.classList.remove('positive', 'negative', 'neutral');
      if (value > 0.01) cardEl.classList.add('positive');
      else if (value < -0.01) cardEl.classList.add('negative');
      else cardEl.classList.add('neutral');
    }
    
    function loadMasterSheetData() {
      google.script.run
        .withSuccessHandler(function(data) {
          if (!data || !data.success) {
            showStyledAlert('Could not load this week\\'s master sheet data. Try refreshing.', 'Load Failed', '❌');
            return;
          }
          
          masterSheetName = data.sheetName;
          document.getElementById('weekInfo').textContent = 'Week Ending: ' + data.weekEnding;
          
          // Populate week overview
          document.getElementById('wetSales').textContent = formatPounds(data.wetSales);
          document.getElementById('foodSales').textContent = formatPounds(data.foodSales);
          document.getElementById('roomSales').textContent = formatPounds(data.roomSales);
          document.getElementById('tabs').textContent = formatPounds(data.tabs);
          document.getElementById('pubPDQ').textContent = formatPounds(data.pubPDQ);
          document.getElementById('roomPDQ').textContent = formatPounds(data.roomPDQ);
          document.getElementById('focVoucher').textContent = formatPounds(data.focVoucher);
          
          // =====================================================================
          // FIX: Negate C28 for owner display
          // MASTER stores C28 reversed for Xero (positive = SPEND in Xero)
          // Owner should see true cash position: negative = owner owes, positive = owner receives
          // =====================================================================
          var ownerCashDisplay = -data.cashPaymentsPub;
          var cashEl = document.getElementById('cashPaymentsPub');
          cashEl.textContent = formatPounds(ownerCashDisplay);
          // Colour code: green if owner receives cash, red if owner owes
          cashEl.style.color = ownerCashDisplay >= 0 ? '#059669' : '#dc2626';
          
          // Total Amount Out (C30) - this is the reconciliation sum of all entries
          document.getElementById('totalAmountOut').textContent = formatPounds(data.cashDifference);
          
          // CRITICAL: Cash Difference (same as C30)
          document.getElementById('cashDifference').textContent = formatPounds(data.cashDifference);
          
          // Color code the difference based on value
          var diffElement = document.getElementById('cashDifference');
          var diffValue = Math.abs(data.cashDifference);
          if (diffValue < 1) {
            diffElement.style.color = '#059669'; // Green - good!
          } else if (diffValue < 10) {
            diffElement.style.color = '#f59e0b'; // Orange - check it
          } else {
            diffElement.style.color = '#dc2626'; // Red - problem!
          }
          
          // Expense breakdown
          document.getElementById('expRoomCleaning').textContent = formatPounds(data.expenses.roomCleaning);
          document.getElementById('expPubCleaning').textContent = formatPounds(data.expenses.pubCleaning);
          document.getElementById('expTempKitchen').textContent = formatPounds(data.expenses.tempKitchen);
          document.getElementById('expTempBar').textContent = formatPounds(data.expenses.tempBar);
          document.getElementById('expFOHTempStaff').textContent = formatPounds(data.expenses.fohTempStaff || 0);
          document.getElementById('expRoomSuppliesNoVAT').textContent = formatPounds(data.expenses.roomSuppliesNoVAT);
          document.getElementById('expRoomSuppliesVAT').textContent = formatPounds(data.expenses.roomSuppliesVAT);
          document.getElementById('expBarSuppliesNoVAT').textContent = formatPounds(data.expenses.barSuppliesNoVAT);
          document.getElementById('expBarSuppliesVAT').textContent = formatPounds(data.expenses.barSuppliesVAT);
          document.getElementById('expBarDirectCosts').textContent = formatPounds(data.expenses.barDirectCosts);
          document.getElementById('expKitchenSuppliesNoVAT').textContent = formatPounds(data.expenses.kitchenSuppliesNoVAT);
          document.getElementById('expKitchenSuppliesVAT').textContent = formatPounds(data.expenses.kitchenSuppliesVAT);
          document.getElementById('expJointPubNoVAT').textContent = formatPounds(data.expenses.jointPubNoVAT);
          document.getElementById('expJointPubVAT').textContent = formatPounds(data.expenses.jointPubVAT);
          document.getElementById('expPubMaintenance').textContent = formatPounds(data.expenses.pubMaintenance);
          document.getElementById('expCleaningSupplies').textContent = formatPounds(data.expenses.cleaningSupplies);
          document.getElementById('expRefunds').textContent = formatPounds(data.expenses.refunds);
          document.getElementById('expCustomExpense').textContent = formatPounds(data.expenses.customExpense || 0);
          
          // =====================================================================
          // OWNER CASH BALANCE with carry-forward
          // =====================================================================
          var outstandingBalance = data.ownerCashOutstanding || 0;
          var thisWeekCash = ownerCashDisplay;
          var netCashDue = thisWeekCash + outstandingBalance;
          
          // This week card
          var thisWeekEl = document.getElementById('thisWeekCash');
          thisWeekEl.textContent = formatPounds(thisWeekCash);
          thisWeekEl.style.color = thisWeekCash >= 0 ? '#059669' : '#dc2626';
          setCardStyle(document.getElementById('thisWeekCard'), thisWeekCash);
          
          // Outstanding balance card
          var outstandingEl = document.getElementById('outstandingBalance');
          outstandingEl.textContent = formatPounds(outstandingBalance);
          outstandingEl.style.color = outstandingBalance >= 0 ? '#059669' : '#dc2626';
          setCardStyle(document.getElementById('outstandingCard'), outstandingBalance);
          if (Math.abs(outstandingBalance) < 0.01) {
            document.getElementById('outstandingNote').textContent = 'No outstanding balance';
          }
          
          // Net cash due card
          var netDueEl = document.getElementById('netCashDue');
          netDueEl.textContent = formatPounds(netCashDue);
          netDueEl.style.color = netCashDue >= 0 ? '#059669' : '#dc2626';
          setCardStyle(document.getElementById('netDueCard'), netCashDue);
          
          if (netCashDue >= 0) {
            document.getElementById('netDueNote').textContent = 'Owner receives this amount';
          } else {
            document.getElementById('netDueNote').textContent = 'Owner owes — carries forward';
          }
          
          // Show no-banking message if net is negative
          if (netCashDue < -0.01) {
            document.getElementById('noBankingMessage').style.display = 'block';
            document.getElementById('noBankingText').textContent = 
              'Net balance is ' + formatPounds(netCashDue) + '. No cash to bank — this amount carries forward to next week.';
          }
          
          // Rooms Banking
          document.getElementById('cashRoomsDue').textContent = formatPounds(data.cashRoomsDue);
          document.getElementById('remainingToBank').textContent = formatPounds(data.remainingToBank);
          
          // Pub Banking  
          document.getElementById('cashDue').textContent = formatPounds(data.cashDue);
          
          // Load existing banking details if present
          if (data.cashRoomsReceived) {
            document.getElementById('cashRoomsReceived').value = data.cashRoomsReceived;
            updateRemainingToBank();
          }
          if (data.actualCashReceived) {
            document.getElementById('actualCashReceived').value = data.actualCashReceived;
          }
          if (data.amountBanked) {
            document.getElementById('amountBanked').value = data.amountBanked;
          }
          if (data.dateBanked) {
            document.getElementById('dateBanked').value = data.dateBanked;
          }
          
          // Check if banking is complete
          checkBankingComplete();
        })
        .withFailureHandler(function(error) {
          showStyledAlert(error.message || 'Server error', 'Error', '❌');
        })
        .getMasterSheetData(sheetNameFromUrl);
    }
    
    function updateRemainingToBank() {
      const cashRoomsDue = parseFloat(document.getElementById('cashRoomsDue').textContent.replace(/[£-]/g, '')) || 0;
      const cashRoomsReceived = parseFloat(document.getElementById('cashRoomsReceived').value) || 0;
      const remaining = cashRoomsDue - cashRoomsReceived;
      document.getElementById('remainingToBank').textContent = formatPounds(remaining);
    }
    
    function checkBankingComplete() {
      const cashRoomsReceived = document.getElementById('cashRoomsReceived').value;
      const actualCash = document.getElementById('actualCashReceived').value;
      const amountBanked = document.getElementById('amountBanked').value;
      const dateBanked = document.getElementById('dateBanked').value;
      
      bankingComplete = cashRoomsReceived && actualCash && amountBanked && dateBanked;
      var finalizeBtn = document.getElementById('finalizeBtn');
      if (finalizeBtn) {
        finalizeBtn.disabled = !bankingComplete;
      }
    }
    
    // Check on input changes
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('input-field')) {
        if (e.target.id === 'cashRoomsReceived') {
          updateRemainingToBank();
        }
        checkBankingComplete();
      }
    });
    
    function saveBankingDetails() {
      const data = {
        sheetName: masterSheetName,
        cashRoomsReceived: parseFloat(document.getElementById('cashRoomsReceived').value) || 0,
        actualCashReceived: parseFloat(document.getElementById('actualCashReceived').value) || 0,
        amountBanked: parseFloat(document.getElementById('amountBanked').value) || 0,
        dateBanked: document.getElementById('dateBanked').value || ''
      };
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result && result.success) {
            try { showStyledAlert('Banking details saved.', 'Saved', '✅'); } catch (e) {}
            setTimeout(function() {
              window.location.href = (webAppUrl || '') + '?page=owner';
            }, 1200);
          } else {
            var msg = (result && result.message) || 'Unknown error';
            try { showStyledAlert(msg, 'Save Failed', '❌'); } catch (e) { alert('Save failed: ' + msg); }
          }
        })
        .withFailureHandler(function(error) {
          var msg = (error && error.message) || 'Server error';
          try { showStyledAlert(msg, 'Error', '❌'); } catch (e) { alert(msg); }
        })
        .saveBankingDetails(data);
    }
    
    function finalizeAndExport() {
      if (!bankingComplete) {
        showStyledAlert('Please fill in all banking fields before exporting.', 'Missing Details', '⚠️');
        return;
      }
      
      showStyledConfirm(
        'This will convert formulas to values, export columns A-D (rows 1-28) to XERO_EXPORT.csv, and save it to Google Drive.',
        'Finalize and export?',
        '📥',
        runFinalizeAndExport
      );
    }
    
    function runFinalizeAndExport() {
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            if (result.xeroSuccess) {
              showStyledAlert('CSV created and ' + result.transactionCount + ' transactions sent to Xero.', 'Export Complete', '✅');
              setTimeout(function() { window.location.href = (webAppUrl || '') + '?page=owner'; }, 2200);
            } else {
              showStyledAlert('CSV saved to Drive, but the Xero API call failed:\\n' + result.xeroError + '\\nYou can import the CSV manually.', 'Partial Success', '⚠️');
              setTimeout(function() { window.location.href = (webAppUrl || '') + '?page=owner'; }, 2200);
            }
          } else {
            showStyledAlert(result.message || 'Unknown error', 'Export Failed', '❌');
          }
        })
        .withFailureHandler(function(error) {
          showStyledAlert(error.message || 'Server error', 'Error', '❌');
        })
        .exportToCSVAndSendToXero(masterSheetName);
    }
    
    function goBack() {
      if (webAppUrl) {
        window.location.href = webAppUrl + '?page=owner';
      }
    }
  </script>


<!-- v5.2 — Styled alert modal -->
<div class="modal-overlay" id="styledAlert">
  <div class="modal-box" style="background: var(--white-warm) !important; border: 1px solid var(--line); text-align: left;">
    <div id="alertIcon" style="font-size: 36px; text-align: center; margin-bottom: 8px;">✅</div>
    <div id="alertTitle" style="font-family: var(--serif); font-size: 22px; font-weight: 500; color: var(--ink); text-align: center; margin-bottom: 10px;">Saved</div>
    <div id="alertMessage" style="font-size: 14px; color: var(--ink-soft); text-align: center; line-height: 1.55; margin-bottom: 22px;"></div>
    <div id="alertButtonsRow" style="text-align: center;">
      <button onclick="closeStyledAlert()" style="background: var(--ink); color: var(--paint); border: 0; padding: 11px 28px; border-radius: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;">OK</button>
    </div>
  </div>
</div>

<script>
  function showStyledAlert(message, title, icon) {
    document.getElementById('alertIcon').textContent = icon || '✅';
    document.getElementById('alertTitle').textContent = title || 'Notice';
    document.getElementById('alertMessage').innerHTML = String(message || '').replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    // Restore single OK button (in case prior call was a confirm)
    var btns = document.getElementById('alertButtonsRow');
    if (btns) btns.innerHTML = '<button onclick="closeStyledAlert()" style="background: var(--ink); color: var(--paint); border: 0; padding: 11px 28px; border-radius: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;">OK</button>';
    var modal = document.getElementById('styledAlert');
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
  function closeStyledAlert() {
    var modal = document.getElementById('styledAlert');
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
  
  var masterConfirmCallback = null;
  function showStyledConfirm(message, title, icon, onConfirm) {
    document.getElementById('alertIcon').textContent = icon || '❓';
    document.getElementById('alertTitle').textContent = title || 'Confirm';
    document.getElementById('alertMessage').innerHTML = String(message || '').replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    var btns = document.getElementById('alertButtonsRow');
    if (btns) {
      btns.innerHTML =
        '<button onclick="handleMasterConfirmNo()" style="background: var(--white-warm); color: var(--ink); border: 1px solid var(--line); padding: 11px 22px; border-radius: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; margin-right: 8px;">Cancel</button>' +
        '<button onclick="handleMasterConfirmYes()" style="background: var(--ink); color: var(--paint); border: 0; padding: 11px 22px; border-radius: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;">Confirm</button>';
    }
    masterConfirmCallback = onConfirm;
    var modal = document.getElementById('styledAlert');
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
  function handleMasterConfirmYes() {
    closeStyledAlert();
    if (masterConfirmCallback) {
      var cb = masterConfirmCallback;
      masterConfirmCallback = null;
      cb();
    }
  }
  function handleMasterConfirmNo() {
    masterConfirmCallback = null;
    closeStyledAlert();
  }
</script>
</body>
</html>`;

const ALL_WEEKS_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>All Weeks — __VENUE_FULL__</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-left {
      text-align: left;
    }
    
    .header h1 {
      font-size: 28px;
    }
    
    .btn-menu {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
    }
    
    .btn-menu:hover {
      background: white;
      color: #667eea;
    }
    
    .content {
      padding: 30px;
    }
    
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .filter-button {
      padding: 10px 20px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .filter-button.active {
      background: #667eea;
      color: white;
    }
    
    .filter-button:hover {
      background: #5a67d8;
      color: white;
      border-color: #5a67d8;
    }
    
    .table-wrapper {
      overflow-x: auto;
      margin: 0 -30px;
      padding: 0 30px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1200px;
    }
    
    th {
      background: #f7fafc;
      padding: 15px 10px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }
    
    td {
      padding: 15px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    
    tr:hover {
      background: #f7fafc;
    }
    
    .col-week {
      width: 140px;
    }
    
    .col-status {
      width: 120px;
    }
    
    .col-days {
      width: 60px;
    }
    
    .col-weekly {
      width: 100px;
    }
    
    .col-money {
      width: 100px;
    }
    
    .col-actions {
      width: 380px;
      min-width: 380px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .status-draft {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .status-submitted {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }
    
    .action-button {
      padding: 8px 14px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      transition: all 0.3s;
      margin-right: 6px;
      margin-bottom: 4px;
      display: inline-block;
      white-space: nowrap;
    }
    
    .btn-view {
      background: #667eea;
      color: white;
    }
    
    .btn-edit {
      background: #f59e0b;
      color: white;
    }
    
    .btn-approve {
      background: #10b981;
      color: white;
    }
    
    .btn-unapprove {
      background: #f59e0b;
      color: white;
    }
    
    .btn-unsubmit {
      background: #6b7280;
      color: white;
    }
    
    .action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .number {
      text-align: right;
      font-family: 'Courier New', monospace;
    }
    
    .loading {
      text-align: center;
      padding: 50px;
    }
      100% { transform: rotate(360deg); }
    }
    
    .scroll-hint {
      text-align: center;
      padding: 10px;
      background: #fef3c7;
      color: #92400e;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 10px;
      border-radius: 8px;
    }
    
    .error-message {
      color: #dc2626;
      padding: 20px;
      text-align: center;
      background: #fef2f2;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .stats-bar {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      text-align: center;
      min-width: 120px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
    
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
    }
    
    /* Confirmation Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }
    
    .modal-overlay.active {
      display: flex;
    }
    
    .modal-box {
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #1a202c;
    }
    
    .modal-message {
      color: #4a5568;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    
    .modal-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .modal-btn {
      padding: 10px 25px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .modal-btn-cancel {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .modal-btn-confirm {
      background: #667eea;
      color: white;
    }
    
    .modal-btn-danger {
      background: #ef4444;
      color: white;
    }
    
    .modal-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    @media (max-width: 768px) {
      body { padding: 0; }
      .container { border-radius: 0; box-shadow: none; }
      .header { flex-direction: column; gap: 10px; text-align: center; padding: 20px 16px; }
      .header h1 { font-size: 20px; }
      .btn-menu { padding: 10px 16px; font-size: 13px; }
      .content { padding: 16px; }
      .filters { justify-content: center; gap: 8px; }
      .filter-button { padding: 8px 14px; font-size: 12px; }
      .stats-bar { justify-content: center; gap: 8px; }
      .stat-card { padding: 10px 14px; min-width: 70px; flex: 1; }
      .stat-value { font-size: 18px; }
      .stat-label { font-size: 10px; }
      .scroll-hint { display: none; }
      .table-wrapper { margin: 0; padding: 0; overflow: visible; }
      table { display: none; }
      .modal-box { padding: 24px 20px; margin: 16px; }

      /* Mobile card layout */
      .week-cards { display: flex; flex-direction: column; gap: 12px; }
      .week-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; }
      .week-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .week-card-title { font-size: 16px; font-weight: 700; color: #1e293b; }
      .week-card-range { font-size: 12px; color: #64748b; }
      .week-card-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
      .week-card-stat { text-align: center; background: white; padding: 8px; border-radius: 8px; }
      .week-card-stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
      .week-card-stat-value { font-size: 14px; font-weight: 700; color: #1e293b; font-family: monospace; }
      .week-card-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .week-card-actions .action-button { flex: 1; min-width: 70px; text-align: center; padding: 10px 8px; font-size: 12px; margin: 0; border-radius: 8px; }
    }

    @media (min-width: 769px) {
      .week-cards { display: none; }
    }
  </style>
__SHARED_STYLES__

<style>
  /* ── Container & page chrome ──────────────────────────────────── */
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .container > .header { display: none; /* replaced by .ps-header */ }
  .form-content, .content {
    padding: var(--s5);
    background: transparent;
  }
  .week-info { display: none; }

  /* Day banner (purple gradient → paint) */
  .form-content > div[style*="linear-gradient(135deg, #667eea"] {
    background: var(--paint) !important;
    color: var(--ink) !important;
    margin: calc(-1 * var(--s5)) calc(-1 * var(--s5)) var(--s5) !important;
    padding: var(--s4) var(--s5) !important;
    border-radius: 0 !important;
    text-align: left !important;
    border-bottom: 1px solid var(--paint-deep);
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:first-child {
    color: var(--ink-soft) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    opacity: 1 !important;
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:nth-child(2) {
    font-family: var(--serif) !important;
    font-size: 22px !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    margin-top: 4px !important;
  }

  /* Sections */
  .section {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s4);
    overflow: hidden;
  }
  .section-header {
    background: var(--cream) !important;
    border-bottom: 1px solid var(--line);
    color: var(--ink) !important;
    padding: var(--s3) var(--s4) !important;
    display: flex;
    align-items: center;
    gap: var(--s2);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.005em;
  }
  .section-header h2 {
    font-family: var(--serif);
    font-size: 15px !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--ink);
  }
  .section-icon { font-size: 16px; opacity: 0.7; }
  .section > *:not(.section-header) { padding-left: var(--s4); padding-right: var(--s4); }
  .section > *:not(.section-header):first-of-type:not(.section-header) { padding-top: var(--s4); }
  .section > *:not(.section-header):last-child { padding-bottom: var(--s4); }

  /* Form groups */
  .form-group { margin-bottom: var(--s3); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s3); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  @media (max-width: 600px) {
    .form-row, .form-grid, .form-row-3 { grid-template-columns: 1fr; }
  }

  /* Labels */
  .form-group label, .total-item label, label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  label[for="actualToSafe"] { color: var(--warn); }

  /* Inputs */
  input[type="number"], input[type="text"], input[type="date"], select, textarea {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); }
  textarea { resize: vertical; min-height: 70px; font-family: var(--sans); }
  input[readonly] { background: var(--cream); color: var(--ink-soft); cursor: default; }
  input.valid { border-color: var(--ok); background: var(--ok-bg); }
  input.invalid { border-color: var(--danger); background: var(--danger-bg); }

  /* Input prefix (£) */
  .input-with-icon, .input-with-prefix { position: relative; }
  .input-icon, .input-with-prefix > span:first-child {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }
  .input-with-icon input, .input-with-prefix input { padding-left: 28px; }

  /* Calculated values */
  .calculated-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 11px 14px;
    font-size: 15px;
    color: var(--ink);
    font-weight: 600;
    font-feature-settings: 'tnum';
  }
  .calculated-value.success { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
  .calculated-value.warning { background: var(--warn-bg); border-color: var(--warn); color: var(--warn); }
  .calculated-value.error { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  .auto-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    color: var(--ink-quiet);
    background: var(--cream);
    margin-left: 6px;
  }
  .cell-ref {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    color: var(--ink-faint);
    font-weight: 500;
    margin-left: 4px;
  }
  .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

  /* Validation items */
  .validation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: var(--r);
    margin-bottom: 6px;
  }
  .validation-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
    text-transform: none;
  }
  .validation-value {
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .validation-value.correct { color: var(--ok); }
  .validation-value.incorrect { color: var(--danger); }

  /* Info/warning boxes */
  .info-box {
    background: var(--paint-wash);
    border-left: 3px solid var(--paint-deep);
    padding: 11px 14px;
    margin-bottom: var(--s4);
    font-size: 12.5px;
    color: var(--ink-soft);
    border-radius: var(--r);
  }
  .info-box strong { color: var(--ink); }
  .warning-box {
    background: var(--warn-bg);
    border-left: 3px solid var(--warn);
    padding: 11px 14px;
    margin-bottom: var(--s3);
    font-size: 12.5px;
    color: var(--warn);
    border-radius: var(--r);
  }

  /* Buttons */
  .btn-group, .button-group {
    display: flex;
    gap: var(--s2);
    flex-wrap: wrap;
    margin-top: var(--s4);
  }
  .btn {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 13px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-save, .btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .btn-save:hover, .btn-primary:hover { background: #000; }
  .btn-menu, .btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .btn-menu:hover, .btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .btn-reset {
    background: var(--cream);
    color: var(--ink-soft);
    border-color: var(--line);
  }
  .btn-reset:hover { background: var(--warn-bg); color: var(--warn); }

  /* Totals & expense categories */
  .totals-grid { display: grid; grid-template-columns: 1fr; gap: var(--s3); }
  .total-item {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s3);
  }
  .total-item.input-required { background: var(--warn-bg) !important; border: 1px solid var(--warn) !important; }
  .total-item.highlight { background: var(--paint-wash); border-color: var(--paint-pale); }

  .expense-category {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s2);
    overflow: hidden;
  }
  .category-header {
    background: var(--cream);
    border-bottom: 1px solid var(--line-soft);
    padding: 11px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .category-header:hover { background: var(--paint-wash); }
  .category-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0;
    text-transform: none;
  }
  .category-total { font-weight: 700; font-feature-settings: 'tnum'; color: var(--ink); font-size: 13.5px; }
  .expense-items { padding: var(--s2); background: var(--white-warm); }
  .expense-item {
    display: grid;
    grid-template-columns: 1fr 110px auto;
    gap: 6px;
    margin-bottom: 6px;
    align-items: center;
  }
  .expense-item input[type="text"], .expense-item input[type="number"] {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .expense-item .account-select, .expense-item .vat-select {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .add-expense-btn {
    background: var(--cream);
    color: var(--ink-soft);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 6px;
    width: 100%;
  }
  .add-expense-btn:hover {
    background: var(--paint-wash);
    color: var(--ink);
    border-color: var(--paint-deep);
  }
  .remove-expense-btn {
    background: transparent;
    color: var(--ink-quiet);
    border: 0;
    cursor: pointer;
    font-size: 18px;
    padding: 0 8px;
  }
  .remove-expense-btn:hover { color: var(--danger); }
  .read-only label { color: var(--ink-quiet); }
  .loading.hidden { display: none; } }

  /* Cash difference indicator (Daily Out) */
  div[id="differenceIndicator"] > div {
    background: var(--warn-bg) !important;
    border: 1px solid var(--warn) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
  }
  div[id="differenceIndicator"] span { color: var(--ink) !important; }
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    transition: background 0.15s !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .modal-button.cancel:hover { background: var(--cream) !important; }
  .modal-button.warning { background: var(--warn) !important; color: white !important; }
  .modal-button.warning:hover { background: #6b3909 !important; }
  .modal-button.error { background: var(--danger) !important; color: white !important; }
  .modal-button.error:hover { background: #4a1313 !important; }
  .modal-button.success { background: var(--ok) !important; color: white !important; }
  .modal-button.success:hover { background: #1d3c1f !important; }
  .modal-button.info { background: var(--ink) !important; color: var(--paint) !important; }
  .modal-buttons { display: flex; gap: var(--s2); justify-content: center; }
  .confirm-buttons { display: flex; gap: var(--s2); justify-content: center; }
</style>


<style>
  /* v4.5 — modal box styling only, originals handle visibility */
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
</style>

<style>
  /* v4.8 — focused paint color overrides on original menu/view CSS */

  /* Page background and base */
  body { background: var(--white-warm) !important; color: var(--ink) !important; font-family: var(--sans) !important; }
  .container { background: transparent !important; }

  /* Header (the original purple-gradient header) — make it paint-ink */
  .header, .header-card {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .header h1, .header-card h1, .header-card p {
    color: var(--paint) !important;
    font-family: var(--serif) !important;
    font-weight: 500 !important;
  }
  .header p { color: var(--paint-pale) !important; }

  /* Status cards — original white card with purple accent */
  .status-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-left: 3px solid var(--paint) !important;
    border-radius: var(--r) !important;
  }
  .status-card.submitted { border-left-color: #d4a574 !important; }
  .status-card.complete { border-left-color: #5b8a51 !important; }

  /* Task cards (action items) */
  .task-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .task-card:hover { border-color: var(--paint) !important; }
  .task-card.primary {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .task-card.primary .task-title,
  .task-card.primary .task-subtitle { color: var(--paint) !important; }
  .task-icon { color: var(--paint) !important; }
  .task-card.primary .task-icon { color: var(--paint) !important; }

  /* Day boxes (the date grid) */
  .day-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }
  .day-box:hover { border-color: var(--paint) !important; background: var(--paint-wash) !important; }
  .day-box.complete {
    background: var(--paint) !important;
    border-color: var(--paint) !important;
    color: var(--ink) !important;
  }

  /* Large buttons */
  .btn-large, .btn {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  .btn-large:hover, .btn:hover {
    background: #000 !important;
    color: var(--paint) !important;
  }

  /* Badges */
  .badge-approved, .badge-complete {
    background: #e8f0e3 !important; color: #4a7042 !important;
    border: 1px solid #c8d8c0 !important;
  }
  .badge-pending, .badge-submitted {
    background: #fbf3e7 !important; color: #8a5a2a !important;
    border: 1px solid #d4a574 !important;
  }
  .badge-draft { background: var(--paint-wash) !important; color: var(--ink) !important; }
  .badge-exported { background: var(--ink) !important; color: var(--paint) !important; }

  /* Progress bar */
  .progress-bar { background: var(--paint) !important; }
  .progress-bar.complete { background: #5b8a51 !important; }

  /* Weekly status */
  .weekly-status {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .weekly-status.complete { border-color: #5b8a51 !important; background: #f5fbf3 !important; }
  .weekly-status.disabled { opacity: 0.5 !important; }

  /* Owner menu specific */
  .section-card, .balances-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .section-header { color: var(--ink) !important; }
  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .week-card:hover { border-color: var(--paint) !important; }
  .btn-banking, .btn-report, .btn-view, .btn-xero {
    background: var(--ink) !important; color: var(--paint) !important;
    border: 0 !important; border-radius: var(--r) !important;
  }
  .btn-disabled { background: var(--line) !important; color: var(--ink-soft) !important; cursor: not-allowed !important; }

  /* Figures grid */
  .figure-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .figure-label { color: var(--ink-soft) !important; }
  .figure-value { color: var(--ink) !important; font-family: var(--mono) !important; font-weight: 700 !important; }
  .figure-value.positive { color: #5b8a51 !important; }
  .figure-value.negative { color: #c0635a !important; }

  /* Balances */
  .balance-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
  }
  .balance-value { color: var(--ink) !important; font-family: var(--mono) !important; }

  /* Modal restyling */
  .modal-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .modal-title { font-family: var(--serif) !important; color: var(--ink) !important; }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-weight: 700 !important;
  }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }

  /* Info banner */
  .info-banner {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }

  /* Spinner */
  .spinner { border-top-color: var(--paint) !important; }
  /* ── All Weeks v4 brand overlay ────────────────────────────── */

  body {
    background: var(--cream) !important;
    padding: 0 !important;
  }

  .container {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: 1100px !important;
    overflow: visible !important;
  }

  /* Hide the legacy purple inner header — the sage ps-header strip up top is the new header */
  .container > .header { display: none !important; }

  .content { padding: var(--s5) var(--s4) !important; }

  /* Stat tiles — flatten the gradients into clean editorial cards.
     The selector with [style] is needed because the JS writes inline
     background gradients on three of the four tiles. */
  .stats-bar {
    gap: var(--s3) !important;
    margin-bottom: var(--s5) !important;
  }
  .stat-card,
  .stat-card[style] {
    background: var(--white-warm) !important;
    background-image: none !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
    box-shadow: none !important;
    padding: var(--s4) var(--s5) !important;
  }
  .stat-value {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 32px !important;
    line-height: 1.1 !important;
  }
  .stat-label {
    color: var(--ink-quiet) !important;
    font-size: 10.5px !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    margin-top: 6px !important;
  }

  /* Filter buttons — editorial pills */
  .filters {
    gap: var(--s2) !important;
    margin-bottom: var(--s4) !important;
  }
  .filter-button {
    background: transparent !important;
    border: 1px solid var(--line) !important;
    color: var(--ink-soft) !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 11.5px !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    padding: 8px 14px !important;
  }
  .filter-button:hover { background: var(--paint-wash) !important; }
  .filter-button.active {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }

  /* Scroll hint — subtler */
  .scroll-hint {
    background: transparent !important;
    color: var(--ink-quiet) !important;
    font-size: 12px !important;
    padding: 0 !important;
    margin-bottom: var(--s3) !important;
    border: 0 !important;
    text-align: left !important;
  }

  /* Table wrapper */
  .table-wrapper {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    overflow-x: auto;
  }

  /* ── All Weeks: force editorial card layout (no horizontal scroll) ──── */

  /* Kill the desktop table and the scroll hint — we always show cards now */
  .table-wrapper > table,
  .table-wrapper table { display: none !important; }
  .scroll-hint { display: none !important; }
  .table-wrapper {
    background: transparent !important;
    border: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  /* Force cards at all widths */
  .week-cards {
    display: flex !important;
    flex-direction: column !important;
    gap: var(--s3) !important;
  }

  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    padding: var(--s5) !important;
    transition: border-color 0.15s !important;
  }
  .week-card:hover { border-color: var(--paint-pale) !important; }

  .week-card-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-bottom: var(--s4) !important;
    gap: var(--s4) !important;
  }
  .week-card-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    font-size: 22px !important;
    color: var(--ink) !important;
    line-height: 1.15 !important;
    letter-spacing: -0.005em !important;
  }
  .week-card-range {
    color: var(--ink-quiet) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    margin-top: 4px !important;
  }

  /* Stats grid: 4 even columns */
  .week-card-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: var(--s3) !important;
    margin-bottom: var(--s4) !important;
    padding: var(--s4) 0 !important;
    border-top: 1px solid var(--line-soft) !important;
    border-bottom: 1px solid var(--line-soft) !important;
  }
  @media (max-width: 600px) {
    .week-card-grid { grid-template-columns: repeat(2, 1fr) !important; gap: var(--s3) var(--s4) !important; }
  }
  .week-card-stat {
    background: transparent !important;
    padding: 0 !important;
    text-align: left !important;
    border-radius: 0 !important;
  }
  .week-card-stat-label {
    color: var(--ink-quiet) !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    margin-bottom: 4px !important;
    font-family: var(--sans) !important;
  }
  .week-card-stat-value {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    font-size: 20px !important;
    color: var(--ink) !important;
    line-height: 1.1 !important;
    font-variant-numeric: tabular-nums !important;
  }

  /* Actions row */
  .week-card-actions {
    display: flex !important;
    gap: var(--s2) !important;
    flex-wrap: wrap !important;
    margin: 0 !important;
  }
  .week-card-actions .action-button {
    flex: 0 1 auto !important;
    padding: 10px 18px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 12px !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    border: 0 !important;
    cursor: pointer !important;
  }
  .week-card-actions .btn-view {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .week-card-actions .btn-view:hover { background: #000 !important; }
  .week-card-actions .btn-edit {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .week-card-actions .btn-edit:hover { background: var(--paint-wash) !important; border-color: var(--paint-pale) !important; }
  .week-card-actions .btn-unsubmit {
    background: var(--white-warm) !important;
    color: var(--warn) !important;
    border: 1px solid var(--warn-bg) !important;
  }
  .week-card-actions .btn-unsubmit:hover { background: var(--warn-bg) !important; }

  /* Status badge inside cards */
  .week-card .status-badge {
    flex-shrink: 0 !important;
    border-radius: 999px !important;
    padding: 5px 12px !important;
    font-size: 10.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    border: 1px solid transparent !important;
  }
  .week-card .status-draft     { background: var(--white-warm) !important; color: var(--ink-quiet) !important; border-color: var(--line) !important; }
  .week-card .status-submitted { background: var(--warn-bg) !important;    color: var(--warn) !important; }
  .week-card .status-approved  { background: var(--ok-bg) !important;      color: var(--ok) !important; }

</style>

</head>
<body>
__VARLO_BOOT__

__VARLO_HEADER_MENU__

  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>📊 All Weeks Status</h1>
      </div>
      <button class="btn-menu" onclick="navigateApp('?page=menu')">🏠 Main Menu</button>
    </div>
    
    <div class="content">
      <div id="statsBar" class="stats-bar">
        <!-- Stats will be populated dynamically -->
      </div>
      
      <div class="filters">
        <button class="filter-button" data-filter="ALL">All Weeks</button>
        <button class="filter-button active" data-filter="DRAFT">Draft</button>
        <button class="filter-button" data-filter="SUBMITTED">Submitted</button>
        <button class="filter-button" data-filter="APPROVED">Approved</button>
      </div>
      
      <div class="scroll-hint">
        Opens on Draft (fast). Approved shows filed dates only — no full sheet load.
      </div>
      
      <div class="table-wrapper">
        <div id="weeksTable" class="loading">
          <div class="spinner"></div>
          <p style="margin-top: 15px; color: #666;">Loading drafts…</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Confirmation Modal -->
  <div id="confirmModal" class="modal-overlay">
    <div class="modal-box">
      <div id="modalTitle" class="modal-title"></div>
      <div id="modalMessage" class="modal-message"></div>
      <div class="modal-buttons">
        <button class="modal-btn modal-btn-cancel" onclick="closeModal()">Cancel</button>
        <button id="modalConfirmBtn" class="modal-btn modal-btn-confirm" onclick="confirmAction()">Confirm</button>
      </div>
    </div>
  </div>
  
  <script>
    var webAppUrl = '';

    // Get URL on load
    google.script.run
      .withSuccessHandler(function(url) {
        webAppUrl = url;
      })
      .getWebAppUrl();

    // Navigation helper
    function navigateApp(queryString) {
      if (!webAppUrl) return;
      var fullUrl = webAppUrl + queryString;
      try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
      setTimeout(function() { window.location.href = fullUrl; }, 300);
    }

    let liveWeeks = [];
    let approvedStamps = [];
    let approvedLoaded = false;
    let approvedLoading = false;
    let currentFilter = 'DRAFT';
    let pendingAction = null;
    let pendingWeekSheet = null;
    
    function allWeeksMerged() {
      return liveWeeks.concat(approvedStamps);
    }
    
    // Initialize on page load — drafts first, then stamps in background
    document.addEventListener('DOMContentLoaded', function() {
      setupFilterButtons();
      loadLiveWeeks();
    });
    
    function setupFilterButtons() {
      document.querySelectorAll('.filter-button').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentFilter = this.dataset.filter;
          if ((currentFilter === 'APPROVED' || currentFilter === 'ALL') && !approvedLoaded) {
            loadApprovedStamps();
          }
          renderTable();
        });
      });
    }
    
    function loadLiveWeeks() {
      google.script.run
        .withSuccessHandler(function(weeks) {
          liveWeeks = weeks || [];
          updateStats();
          renderTable();
          // Warm approved stamps after drafts are on screen (does not block Draft tab)
          loadApprovedStamps();
        })
        .withFailureHandler(function(error) {
          document.getElementById('weeksTable').innerHTML = 
            '<div class="error-message">❌ Error loading weeks: ' + error.message + '</div>';
        })
        .getAllWeeksDetailed();
    }
    
    function loadApprovedStamps() {
      if (approvedLoaded || approvedLoading) return;
      approvedLoading = true;
      if (currentFilter === 'APPROVED') {
        document.getElementById('weeksTable').innerHTML =
          '<div class="loading"><div class="spinner"></div><p style="margin-top:15px;color:#666;">Loading approved dates…</p></div>';
      }
      google.script.run
        .withSuccessHandler(function(weeks) {
          approvedStamps = weeks || [];
          approvedLoaded = true;
          approvedLoading = false;
          updateStats();
          renderTable();
        })
        .withFailureHandler(function(error) {
          approvedLoading = false;
          if (currentFilter === 'APPROVED') {
            document.getElementById('weeksTable').innerHTML =
              '<div class="error-message">Could not load approved list: ' + error.message + '</div>';
          }
        })
        .getApprovedWeekStamps();
    }
    
    function updateStats() {
      var all = allWeeksMerged();
      const draft = liveWeeks.filter(w => w.status === 'DRAFT').length;
      const submitted = liveWeeks.filter(w => w.status === 'SUBMITTED').length;
      const approved = approvedLoaded ? approvedStamps.length : '…';
      
      let html = '';
      html += '<div class="stat-card"><div class="stat-value">' + (approvedLoaded ? all.length : liveWeeks.length + '+') + '</div><div class="stat-label">Total Weeks</div></div>';
      html += '<div class="stat-card" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);"><div class="stat-value">' + draft + '</div><div class="stat-label">Draft</div></div>';
      html += '<div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"><div class="stat-value">' + submitted + '</div><div class="stat-label">Submitted</div></div>';
      html += '<div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);"><div class="stat-value">' + approved + '</div><div class="stat-label">Approved</div></div>';
      
      document.getElementById('statsBar').innerHTML = html;
    }
    
    function renderTable() {
      var all = allWeeksMerged();
      if (currentFilter === 'APPROVED' && !approvedLoaded) {
        document.getElementById('weeksTable').innerHTML =
          '<div class="loading"><div class="spinner"></div><p style="margin-top:15px;color:#666;">Loading approved dates…</p></div>';
        return;
      }
      const filteredWeeks = currentFilter === 'ALL' ? 
        all : 
        all.filter(w => w.status === currentFilter);
      
      if (filteredWeeks.length === 0) {
        document.getElementById('weeksTable').innerHTML = 
          '<div style="text-align: center; padding: 40px; color: #666;">No weeks found with status: ' + currentFilter + '</div>';
        return;
      }
      
      let html = '<table>';
      html += '<tr>';
      html += '<th class="col-week">Week</th>';
      html += '<th class="col-status">Status</th>';
      html += '<th class="col-days">Days</th>';
      html += '<th class="col-weekly">Weekly<br>Data</th>';
      html += '<th class="col-money number">Gross<br>Sales</th>';
      html += '<th class="col-money number">Net<br>Sales</th>';
      html += '<th class="col-money number">Expenses</th>';
      html += '<th class="col-actions">Actions</th>';
      html += '</tr>';
      
      filteredWeeks.forEach(week => {
        const statusClass = 'status-' + week.status.toLowerCase();
        var stamp = week.stampOnly || week.canView === false;
        
        html += '<tr>';
        html += '<td class="col-week"><strong>' + week.weekEnding + '</strong><br><small>' + week.weekRange + '</small></td>';
        html += '<td class="col-status"><span class="status-badge ' + statusClass + '">' + week.status + '</span></td>';
        if (stamp) {
          html += '<td class="col-days" colspan="5" style="color:#666;">Filed · week ending ' + week.weekEnding + '</td>';
          html += '<td class="col-actions"><span style="color:#999;font-size:12px;">Date stamp only</span></td>';
        } else {
          html += '<td class="col-days">' + week.daysCompleted + '/7</td>';
          html += '<td class="col-weekly">' + (week.weeklyDataComplete ? '✅ Yes' : '⏳ No') + '</td>';
          html += '<td class="col-money number">£' + Number(week.grossSales || 0).toFixed(2) + '</td>';
          html += '<td class="col-money number">£' + Number(week.netSales || 0).toFixed(2) + '</td>';
          html += '<td class="col-money number">£' + Number(week.totalExpenses || 0).toFixed(2) + '</td>';
          html += '<td class="col-actions">';
          html += '<button class="action-button btn-view" onclick="viewWeek(\\'' + week.weekSheet + '\\')">👁️ View</button>';
          if (week.status === 'DRAFT') {
            html += '<button class="action-button btn-edit" onclick="editWeek(\\'' + week.weekSheet + '\\')">✏️ Edit</button>';
          } else if (week.status === 'SUBMITTED') {
            html += '<button class="action-button btn-unsubmit" onclick="showUnsubmitConfirm(\\'' + week.weekSheet + '\\')">↩️ Unsubmit</button>';
          }
          html += '</td>';
        }
        html += '</tr>';
      });
      
      html += '</table>';
      
      // Build mobile cards
      var cards = '<div class="week-cards">';
      filteredWeeks.forEach(function(week) {
        var statusClass = 'status-' + week.status.toLowerCase();
        var stamp = week.stampOnly || week.canView === false;
        var actions = '';
        if (!stamp) {
          actions = '<button class="action-button btn-view" onclick="viewWeek(\\'' + week.weekSheet + '\\')">👁️ View</button>';
          if (week.status === 'DRAFT') {
            actions += '<button class="action-button btn-edit" onclick="editWeek(\\'' + week.weekSheet + '\\')">✏️ Edit</button>';
          } else if (week.status === 'SUBMITTED') {
            actions += '<button class="action-button btn-unsubmit" onclick="showUnsubmitConfirm(\\'' + week.weekSheet + '\\')">↩️ Unsubmit</button>';
          }
        } else {
          actions = '<span style="color:#999;font-size:12px;">Date stamp only</span>';
        }
        cards += '<div class="week-card">';
        cards += '<div class="week-card-header"><div><div class="week-card-title">' + week.weekEnding + '</div><div class="week-card-range">' + week.weekRange + '</div></div><span class="status-badge ' + statusClass + '">' + week.status + '</span></div>';
        if (stamp) {
          cards += '<div style="padding:8px 0;color:#666;font-size:13px;">Filed week ending ' + week.weekEnding + '</div>';
        } else {
          cards += '<div class="week-card-grid">';
          cards += '<div class="week-card-stat"><div class="week-card-stat-label">Days</div><div class="week-card-stat-value">' + week.daysCompleted + '/7</div></div>';
          cards += '<div class="week-card-stat"><div class="week-card-stat-label">Gross</div><div class="week-card-stat-value">£' + Number(week.grossSales || 0).toFixed(0) + '</div></div>';
          cards += '<div class="week-card-stat"><div class="week-card-stat-label">Net</div><div class="week-card-stat-value">£' + Number(week.netSales || 0).toFixed(0) + '</div></div>';
          cards += '<div class="week-card-stat"><div class="week-card-stat-label">Expenses</div><div class="week-card-stat-value">£' + Number(week.totalExpenses || 0).toFixed(0) + '</div></div>';
          cards += '</div>';
        }
        cards += '<div class="week-card-actions">' + actions + '</div>';
        cards += '</div>';
      });
      cards += '</div>';
      
      document.getElementById('weeksTable').innerHTML = html + cards;
    }
    
    function loadWeeks() {
      liveWeeks = [];
      approvedStamps = [];
      approvedLoaded = false;
      approvedLoading = false;
      loadLiveWeeks();
    }
    
    function viewWeek(weekSheet) {
      navigateApp('?page=weekreport&week=' + encodeURIComponent(weekSheet));
    }
    
    function editWeek(weekSheet) {
      // Edit always operates on the current draft week. The weekly form
      // loads the active draft itself — passing the week name is unnecessary.
      navigateApp('?page=weekly');
    }
    
    // Modal Functions
    function showModal(title, message, confirmText, isDanger) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalMessage').innerHTML = message;
      
      const confirmBtn = document.getElementById('modalConfirmBtn');
      confirmBtn.textContent = confirmText;
      confirmBtn.className = 'modal-btn ' + (isDanger ? 'modal-btn-danger' : 'modal-btn-confirm');
      
      document.getElementById('confirmModal').classList.add('active');
    }
    
    function closeModal() {
      document.getElementById('confirmModal').classList.remove('active');
      pendingAction = null;
      pendingWeekSheet = null;
    }
    
    function confirmAction() {
      // Capture the pending action/week BEFORE closeModal() runs, since
      // closeModal nulls out both pendingAction and pendingWeekSheet.
      // Without this capture, the if/else below would always see null and
      // silently do nothing — the bug that made Unsubmit/Approve/Unapprove
      // appear to do nothing after clicking the dialog's confirm button.
      var action = pendingAction;
      var weekSheet = pendingWeekSheet;
      
      closeModal();
      
      if (action === 'unsubmit') {
        doUnsubmit(weekSheet);
      } else if (action === 'approve') {
        doApprove(weekSheet);
      } else if (action === 'unapprove') {
        doUnapprove(weekSheet);
      }
    }
    
    function showUnsubmitConfirm(weekSheet) {
      pendingAction = 'unsubmit';
      pendingWeekSheet = weekSheet;
      showModal(
        '↩️ Unsubmit Week?',
        'This will:<br>• Change status back to <strong>DRAFT</strong><br>• Allow full editing<br>• Remove from submitted queue',
        'Unsubmit',
        false
      );
    }
    
    function showApproveConfirm(weekSheet) {
      pendingAction = 'approve';
      pendingWeekSheet = weekSheet;
      showModal(
        '✅ Approve Week?',
        'This will:<br>• Lock the week from editing<br>• Update running balances<br>• Mark as <strong>APPROVED</strong>',
        'Approve',
        false
      );
    }
    
    function showUnapproveConfirm(weekSheet) {
      pendingAction = 'unapprove';
      pendingWeekSheet = weekSheet;
      showModal(
        '⏪ Unapprove Week?',
        'This will:<br>• Change status back to <strong>SUBMITTED</strong><br>• Remove from running balances<br>• Allow editing',
        'Unapprove',
        true
      );
    }
    
    function doUnsubmit(weekSheet) {
      showLoading('Unsubmitting...');
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showSuccess('Week unsubmitted!');
            loadWeeks();
          } else {
            showError(result.message);
          }
        })
        .withFailureHandler(function(error) {
          showError(error.message);
        })
        .unsubmitWeek(weekSheet);
    }
    
    function doApprove(weekSheet) {
      showLoading('Approving...');
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showSuccess('Week approved!');
            loadWeeks();
          } else {
            showError(result.message);
          }
        })
        .withFailureHandler(function(error) {
          showError(error.message);
        })
        .approveWeek(weekSheet);
    }
    
    function doUnapprove(weekSheet) {
      showLoading('Unapproving...');
      
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showSuccess('Week unapproved!');
            loadWeeks();
          } else {
            showError(result.message);
          }
        })
        .withFailureHandler(function(error) {
          showError(error.message);
        })
        .unapproveWeek(weekSheet);
    }
    
    function showLoading(message) {
      document.getElementById('weeksTable').innerHTML = 
        '<div class="loading"><div class="spinner"></div><p style="margin-top: 15px; color: #666;">' + message + '</p></div>';
    }
    
    function showSuccess(message) {
      // Brief success indication - data reloads automatically
      console.log('✅ ' + message);
    }
    
    function showError(message) {
      alert('❌ Error: ' + message);
      loadWeeks(); // Reload to reset state
    }
  </script>
<script>(function(){document.addEventListener("touchmove",function(e){},{passive:true});document.body.style.overflowY="scroll";document.body.style.webkitOverflowScrolling="touch";document.body.style.height="auto";document.documentElement.style.height="auto";document.documentElement.style.overflow="auto";})()</script>
</body>
</html>`;

const WEEK_REPORT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    
    /* Header Card */
    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .header-left h1 {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .header-left p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .status-badge {
      padding: 8px 20px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-draft { background: rgba(255,255,255,0.2); }
    .status-submitted { background: #fbbf24; color: #92400e; }
    .status-approved { background: #34d399; color: #065f46; }
    
    /* Navigation */
    .nav-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .nav-btn {
      background: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      color: #667eea;
    }
    
    /* Section Cards */
    .section-card {
      background: white;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .section-header {
      padding: 18px 24px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .icon-blue { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); }
    .icon-green { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); }
    .icon-amber { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
    .icon-purple { background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); }
    .icon-pink { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); }
    
    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .section-body {
      padding: 20px 24px;
    }
    
    /* Data Table - Spreadsheet Style */
    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }
    
    .data-table thead th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 14px 12px;
      text-align: right;
      font-weight: 700;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
      position: sticky;
      top: 0;
    }
    
    .data-table thead th:first-child {
      text-align: left;
      border-radius: 8px 0 0 0;
    }
    
    .data-table thead th:last-child {
      border-radius: 0 8px 0 0;
    }
    
    .data-table tbody td {
      padding: 12px;
      text-align: right;
      border-bottom: 1px solid #f1f5f9;
      font-family: 'SF Mono', 'Consolas', monospace;
      color: #334155;
    }
    
    .data-table tbody td:first-child {
      text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 600;
      color: #1e293b;
    }
    
    .data-table tbody tr:hover {
      background: #fafbfc;
    }
    
    .data-table tbody tr:nth-child(even) {
      background: #fafcff;
    }
    
    .data-table tbody tr:nth-child(even):hover {
      background: #f5f8ff;
    }
    
    /* Totals Row */
    .data-table tfoot td {
      padding: 14px 12px;
      text-align: right;
      font-weight: 700;
      color: #1e293b;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      border-top: 2px solid #667eea;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .data-table tfoot td:first-child {
      text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 0 0 0 8px;
    }
    
    .data-table tfoot td:last-child {
      border-radius: 0 0 8px 0;
    }
    
    /* Summary Cards Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }
    
    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .summary-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .summary-value {
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .summary-value.positive { color: #059669; }
    .summary-value.negative { color: #dc2626; }
    
    /* Positive/Negative for table cells */
    td.positive { color: #059669 !important; }
    td.negative { color: #dc2626 !important; }
    
    /* Highlight Cards */
    .highlight-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .highlight-card .summary-label {
      color: rgba(255,255,255,0.8);
    }
    
    .highlight-card .summary-value {
      color: white;
    }
    
    /* Expense List */
    .expense-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
    
    .expense-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    
    .expense-name {
      font-size: 13px;
      color: #475569;
    }
    
    .expense-amount {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    
    .expense-total {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
    }
    
    .expense-total .expense-name {
      font-weight: 700;
      color: #92400e;
    }
    
    .expense-total .expense-amount {
      color: #92400e;
      font-size: 18px;
    }
    
    /* Notes Box */
    .notes-box {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 0 10px 10px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #78350f;
    }
    
    .notes-box strong {
      display: block;
      margin-bottom: 8px;
      color: #92400e;
    }
    
    .loading-text {
      color: #64748b;
      font-size: 14px;
    }
      100% { transform: rotate(360deg); }
    }
    
    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 10px;
      }
      
      .nav-bar { display: none; }
      
      .section-card {
        box-shadow: none;
        border: 1px solid #e2e8f0;
        break-inside: avoid;
      }
      
      .header-card {
        box-shadow: none;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      body { padding: 0; }
      .container { max-width: 100%; }
      .header-card { flex-direction: column; text-align: center; padding: 20px 16px; margin-bottom: 12px; border-radius: 0; }
      .header-left h1 { font-size: 20px; }
      .header-left p { font-size: 13px; }
      .nav-bar { gap: 6px; margin-bottom: 12px; padding: 0 12px; }
      .nav-btn { padding: 10px 14px; font-size: 12px; }
      .section-card { border-radius: 12px; margin: 0 8px 12px 8px; }
      .section-header { padding: 14px 16px; }
      .section-title { font-size: 15px; }
      .section-icon { width: 34px; height: 34px; font-size: 16px; }
      .section-body { padding: 14px 16px; overflow-x: auto; }
      .summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .summary-card { padding: 14px; }
      .summary-label { font-size: 11px; }
      .summary-value { font-size: 20px; }
      .data-table { font-size: 11px; min-width: 500px; }
      .data-table.compact { min-width: 0; width: 100%; }
      .data-table.compact td { white-space: normal; word-break: break-word; }
      .data-table thead th, .data-table tbody td, .data-table tfoot td { padding: 8px 6px; }
      .expense-grid { grid-template-columns: 1fr; gap: 8px; }
      .expense-item { padding: 12px; }
      .notes-box { font-size: 13px; padding: 14px 16px; }
    }
  </style>
__SHARED_STYLES__

<style>
  /* ── Container & page chrome ──────────────────────────────────── */
  .container {
    max-width: 720px;
    margin: 0 auto;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .container > .header { display: none; /* replaced by .ps-header */ }
  .form-content, .content {
    padding: var(--s5);
    background: transparent;
  }
  .week-info { display: none; }

  /* Day banner (purple gradient → paint) */
  .form-content > div[style*="linear-gradient(135deg, #667eea"] {
    background: var(--paint) !important;
    color: var(--ink) !important;
    margin: calc(-1 * var(--s5)) calc(-1 * var(--s5)) var(--s5) !important;
    padding: var(--s4) var(--s5) !important;
    border-radius: 0 !important;
    text-align: left !important;
    border-bottom: 1px solid var(--paint-deep);
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:first-child {
    color: var(--ink-soft) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    opacity: 1 !important;
  }
  .form-content > div[style*="linear-gradient(135deg, #667eea"] > div:nth-child(2) {
    font-family: var(--serif) !important;
    font-size: 22px !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    margin-top: 4px !important;
  }

  /* Sections */
  .section {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s4);
    overflow: hidden;
  }
  .section-header {
    background: var(--cream) !important;
    border-bottom: 1px solid var(--line);
    color: var(--ink) !important;
    padding: var(--s3) var(--s4) !important;
    display: flex;
    align-items: center;
    gap: var(--s2);
    font-family: var(--serif);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.005em;
  }
  .section-header h2 {
    font-family: var(--serif);
    font-size: 15px !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--ink);
  }
  .section-icon { font-size: 16px; opacity: 0.7; }
  .section > *:not(.section-header) { padding-left: var(--s4); padding-right: var(--s4); }
  .section > *:not(.section-header):first-of-type:not(.section-header) { padding-top: var(--s4); }
  .section > *:not(.section-header):last-child { padding-bottom: var(--s4); }

  /* Form groups */
  .form-group { margin-bottom: var(--s3); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s3); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s3); margin-bottom: var(--s3); }
  @media (max-width: 600px) {
    .form-row, .form-grid, .form-row-3 { grid-template-columns: 1fr; }
  }

  /* Labels */
  .form-group label, .total-item label, label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink-quiet);
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  label[for="actualToSafe"] { color: var(--warn); }

  /* Inputs */
  input[type="number"], input[type="text"], input[type="date"], select, textarea {
    width: 100%;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    font-feature-settings: 'tnum';
    transition: border-color 0.15s, background 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    outline: 0;
    border-color: var(--ink);
    background: var(--paint-wash);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-faint); }
  textarea { resize: vertical; min-height: 70px; font-family: var(--sans); }
  input[readonly] { background: var(--cream); color: var(--ink-soft); cursor: default; }
  input.valid { border-color: var(--ok); background: var(--ok-bg); }
  input.invalid { border-color: var(--danger); background: var(--danger-bg); }

  /* Input prefix (£) */
  .input-with-icon, .input-with-prefix { position: relative; }
  .input-icon, .input-with-prefix > span:first-child {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-quiet);
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }
  .input-with-icon input, .input-with-prefix input { padding-left: 28px; }

  /* Calculated values */
  .calculated-value {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r);
    padding: 11px 14px;
    font-size: 15px;
    color: var(--ink);
    font-weight: 600;
    font-feature-settings: 'tnum';
  }
  .calculated-value.success { background: var(--ok-bg); border-color: var(--ok); color: var(--ok); }
  .calculated-value.warning { background: var(--warn-bg); border-color: var(--warn); color: var(--warn); }
  .calculated-value.error { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  .auto-badge {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
    color: var(--ink-quiet);
    background: var(--cream);
    margin-left: 6px;
  }
  .cell-ref {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    color: var(--ink-faint);
    font-weight: 500;
    margin-left: 4px;
  }
  .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

  /* Validation items */
  .validation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: var(--r);
    margin-bottom: 6px;
  }
  .validation-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    letter-spacing: 0;
    text-transform: none;
  }
  .validation-value {
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    font-feature-settings: 'tnum';
  }
  .validation-value.correct { color: var(--ok); }
  .validation-value.incorrect { color: var(--danger); }

  /* Info/warning boxes */
  .info-box {
    background: var(--paint-wash);
    border-left: 3px solid var(--paint-deep);
    padding: 11px 14px;
    margin-bottom: var(--s4);
    font-size: 12.5px;
    color: var(--ink-soft);
    border-radius: var(--r);
  }
  .info-box strong { color: var(--ink); }
  .warning-box {
    background: var(--warn-bg);
    border-left: 3px solid var(--warn);
    padding: 11px 14px;
    margin-bottom: var(--s3);
    font-size: 12.5px;
    color: var(--warn);
    border-radius: var(--r);
  }

  /* Buttons */
  .btn-group, .button-group {
    display: flex;
    gap: var(--s2);
    flex-wrap: wrap;
    margin-top: var(--s4);
  }
  .btn {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s2);
    padding: 13px 18px;
    border-radius: var(--r);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    transition: all 0.15s;
    cursor: pointer;
  }
  .btn-save, .btn-primary {
    background: var(--ink);
    color: var(--paint);
    border-color: var(--ink);
  }
  .btn-save:hover, .btn-primary:hover { background: #000; }
  .btn-menu, .btn-secondary {
    background: var(--white-warm);
    color: var(--ink);
    border-color: var(--line);
  }
  .btn-menu:hover, .btn-secondary:hover {
    background: var(--paint-wash);
    border-color: var(--paint-deep);
  }
  .btn-reset {
    background: var(--cream);
    color: var(--ink-soft);
    border-color: var(--line);
  }
  .btn-reset:hover { background: var(--warn-bg); color: var(--warn); }

  /* Totals & expense categories */
  .totals-grid { display: grid; grid-template-columns: 1fr; gap: var(--s3); }
  .total-item {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: var(--s3);
  }
  .total-item.input-required { background: var(--warn-bg) !important; border: 1px solid var(--warn) !important; }
  .total-item.highlight { background: var(--paint-wash); border-color: var(--paint-pale); }

  .expense-category {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    margin-bottom: var(--s2);
    overflow: hidden;
  }
  .category-header {
    background: var(--cream);
    border-bottom: 1px solid var(--line-soft);
    padding: 11px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.15s;
  }
  .category-header:hover { background: var(--paint-wash); }
  .category-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0;
    text-transform: none;
  }
  .category-total { font-weight: 700; font-feature-settings: 'tnum'; color: var(--ink); font-size: 13.5px; }
  .expense-items { padding: var(--s2); background: var(--white-warm); }
  .expense-item {
    display: grid;
    grid-template-columns: 1fr 110px auto;
    gap: 6px;
    margin-bottom: 6px;
    align-items: center;
  }
  .expense-item input[type="text"], .expense-item input[type="number"] {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .expense-item .account-select, .expense-item .vat-select {
    grid-column: 1 / -1;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .add-expense-btn {
    background: var(--cream);
    color: var(--ink-soft);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 6px;
    width: 100%;
  }
  .add-expense-btn:hover {
    background: var(--paint-wash);
    color: var(--ink);
    border-color: var(--paint-deep);
  }
  .remove-expense-btn {
    background: transparent;
    color: var(--ink-quiet);
    border: 0;
    cursor: pointer;
    font-size: 18px;
    padding: 0 8px;
  }
  .remove-expense-btn:hover { color: var(--danger); }
  .read-only label { color: var(--ink-quiet); }
  .loading.hidden { display: none; } }

  /* Cash difference indicator (Daily Out) */
  div[id="differenceIndicator"] > div {
    background: var(--warn-bg) !important;
    border: 1px solid var(--warn) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
  }
  div[id="differenceIndicator"] span { color: var(--ink) !important; }
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    transition: background 0.15s !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
  .modal-button.cancel:hover { background: var(--cream) !important; }
  .modal-button.warning { background: var(--warn) !important; color: white !important; }
  .modal-button.warning:hover { background: #6b3909 !important; }
  .modal-button.error { background: var(--danger) !important; color: white !important; }
  .modal-button.error:hover { background: #4a1313 !important; }
  .modal-button.success { background: var(--ok) !important; color: white !important; }
  .modal-button.success:hover { background: #1d3c1f !important; }
  .modal-button.info { background: var(--ink) !important; color: var(--paint) !important; }
  .modal-buttons { display: flex; gap: var(--s2); justify-content: center; }
  .confirm-buttons { display: flex; gap: var(--s2); justify-content: center; }
</style>


<style>
  /* v4.5 — modal box styling only, originals handle visibility */
  .modal-box {
    background: var(--white-warm) !important;
    border-radius: var(--r) !important;
    padding: var(--s6) !important;
    border: 1px solid var(--line) !important;
    box-shadow: 0 8px 32px rgba(26, 24, 20, 0.15) !important;
  }
  .modal-icon { font-size: 36px !important; }
  .modal-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 20px !important;
  }
  .modal-message {
    color: var(--ink-soft) !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    text-align: left !important;
    white-space: pre-line !important;
  }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    padding: 11px 22px !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 13.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
  }
  .modal-button:hover { background: #000 !important; transform: none !important; box-shadow: none !important; }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }
</style>

<style>
  /* v4.8 — focused paint color overrides on original menu/view CSS */

  /* Page background and base */
  body { background: var(--white-warm) !important; color: var(--ink) !important; font-family: var(--sans) !important; }
  .container { background: transparent !important; }

  /* Header (the original purple-gradient header) — make it paint-ink */
  .header, .header-card {
    background: var(--ink) !important;
    color: var(--paint) !important;
  }
  .header h1, .header-card h1, .header-card p {
    color: var(--paint) !important;
    font-family: var(--serif) !important;
    font-weight: 500 !important;
  }
  .header p { color: var(--paint-pale) !important; }

  /* Status cards — original white card with purple accent */
  .status-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-left: 3px solid var(--paint) !important;
    border-radius: var(--r) !important;
  }
  .status-card.submitted { border-left-color: #d4a574 !important; }
  .status-card.complete { border-left-color: #5b8a51 !important; }

  /* Task cards (action items) */
  .task-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    color: var(--ink) !important;
  }
  .task-card:hover { border-color: var(--paint) !important; }
  .task-card.primary {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border-color: var(--ink) !important;
  }
  .task-card.primary .task-title,
  .task-card.primary .task-subtitle { color: var(--paint) !important; }
  .task-icon { color: var(--paint) !important; }
  .task-card.primary .task-icon { color: var(--paint) !important; }

  /* Day boxes (the date grid) */
  .day-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }
  .day-box:hover { border-color: var(--paint) !important; background: var(--paint-wash) !important; }
  .day-box.complete {
    background: var(--paint) !important;
    border-color: var(--paint) !important;
    color: var(--ink) !important;
  }

  /* Large buttons */
  .btn-large, .btn {
    background: var(--ink) !important;
    color: var(--paint) !important;
    border: 0 !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
  }
  .btn-large:hover, .btn:hover {
    background: #000 !important;
    color: var(--paint) !important;
  }

  /* Badges */
  .badge-approved, .badge-complete {
    background: #e8f0e3 !important; color: #4a7042 !important;
    border: 1px solid #c8d8c0 !important;
  }
  .badge-pending, .badge-submitted {
    background: #fbf3e7 !important; color: #8a5a2a !important;
    border: 1px solid #d4a574 !important;
  }
  .badge-draft { background: var(--paint-wash) !important; color: var(--ink) !important; }
  .badge-exported { background: var(--ink) !important; color: var(--paint) !important; }

  /* Progress bar */
  .progress-bar { background: var(--paint) !important; }
  .progress-bar.complete { background: #5b8a51 !important; }

  /* Weekly status */
  .weekly-status {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .weekly-status.complete { border-color: #5b8a51 !important; background: #f5fbf3 !important; }
  .weekly-status.disabled { opacity: 0.5 !important; }

  /* Owner menu specific */
  .section-card, .balances-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .section-header { color: var(--ink) !important; }
  .week-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .week-card:hover { border-color: var(--paint) !important; }
  .btn-banking, .btn-report, .btn-view, .btn-xero {
    background: var(--ink) !important; color: var(--paint) !important;
    border: 0 !important; border-radius: var(--r) !important;
  }
  .btn-disabled { background: var(--line) !important; color: var(--ink-soft) !important; cursor: not-allowed !important; }

  /* Figures grid */
  .figure-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .figure-label { color: var(--ink-soft) !important; }
  .figure-value { color: var(--ink) !important; font-family: var(--mono) !important; font-weight: 700 !important; }
  .figure-value.positive { color: #5b8a51 !important; }
  .figure-value.negative { color: #c0635a !important; }

  /* Balances */
  .balance-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
  }
  .balance-value { color: var(--ink) !important; font-family: var(--mono) !important; }

  /* Modal restyling */
  .modal-box {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
  }
  .modal-title { font-family: var(--serif) !important; color: var(--ink) !important; }
  .modal-button {
    background: var(--ink) !important;
    color: var(--paint) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    font-weight: 700 !important;
  }
  .modal-button.cancel {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
  }

  /* Info banner */
  .info-banner {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    color: var(--ink) !important;
    border-radius: var(--r) !important;
  }

  /* Spinner */
  .spinner { border-top-color: var(--paint) !important; }

  /* ── Week Report v4 brand overlay ────────────────────────── */

  body {
    background: var(--cream) !important;
    color: var(--ink) !important;
    font-family: var(--sans) !important;
  }

  .container {
    background: transparent !important;
    box-shadow: none !important;
    max-width: 1100px !important;
    padding: var(--s5) var(--s4) !important;
  }

  /* Hero header — replace heavy black card with editorial paint-wash banner */
  .header-card {
    background: var(--paint-wash) !important;
    background-image: none !important;
    color: var(--ink) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
    padding: var(--s5) var(--s5) !important;
    margin-bottom: var(--s4) !important;
    box-shadow: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: var(--s4) !important;
  }
  .header-card h1 {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    color: var(--ink) !important;
    font-size: 26px !important;
    line-height: 1.15 !important;
    margin: 0 0 6px 0 !important;
    letter-spacing: -0.005em !important;
  }
  .header-card #weekInfo,
  .header-card p {
    color: var(--ink-quiet) !important;
    font-size: 12px !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  /* Status badge — align with status tokens */
  .status-badge {
    background: var(--white-warm) !important;
    color: var(--ink-soft) !important;
    border: 1px solid var(--line) !important;
    border-radius: 999px !important;
    padding: 6px 14px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    flex-shrink: 0 !important;
  }
  .status-draft     { background: var(--white-warm) !important; color: var(--ink-quiet) !important; border-color: var(--line) !important; }
  .status-submitted { background: var(--warn-bg) !important;    color: var(--warn) !important;      border-color: var(--warn-bg) !important; }
  .status-approved  { background: var(--ok-bg) !important;      color: var(--ok) !important;        border-color: var(--ok-bg) !important; }

  /* Nav bar — outlined chips, not white pill shadow */
  .nav-bar {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin-bottom: var(--s5) !important;
    gap: var(--s2) !important;
  }
  .nav-btn {
    background: var(--white-warm) !important;
    color: var(--ink) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    font-family: var(--sans) !important;
    font-size: 12px !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    padding: 10px 16px !important;
    box-shadow: none !important;
  }
  .nav-btn:hover {
    background: var(--paint-wash) !important;
    border-color: var(--paint-pale) !important;
  }

  /* Section cards — subtle border, no heavy shadow */
  .section-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    box-shadow: none !important;
    margin-bottom: var(--s4) !important;
    overflow: hidden !important;
  }
  .section-header {
    background: var(--cream) !important;
    background-image: none !important;
    border-bottom: 1px solid var(--line) !important;
    padding: var(--s4) var(--s5) !important;
    display: flex !important;
    align-items: center !important;
    gap: var(--s3) !important;
  }
  .section-icon,
  .icon-blue, .icon-green, .icon-amber, .icon-purple, .icon-pink {
    background: var(--paint-wash) !important;
    background-image: none !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
    width: 36px !important;
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 18px !important;
    flex-shrink: 0 !important;
  }
  .section-title {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    font-size: 19px !important;
    color: var(--ink) !important;
    letter-spacing: -0.005em !important;
  }
  .section-body {
    padding: var(--s5) !important;
    background: var(--white-warm) !important;
    color: var(--ink) !important;
  }

  /* Data table — clean editorial rows */
  .data-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-family: var(--sans) !important;
  }
  .data-table thead th {
    background: var(--cream) !important;
    color: var(--ink-soft) !important;
    font-family: var(--sans) !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: var(--s3) var(--s4) !important;
    border-bottom: 1px solid var(--line) !important;
    text-align: right !important;
  }
  .data-table thead th:first-child { text-align: left !important; }
  .data-table tbody td {
    color: var(--ink) !important;
    font-size: 13.5px !important;
    padding: var(--s3) var(--s4) !important;
    border-bottom: 1px solid var(--line-soft) !important;
    text-align: right !important;
    font-variant-numeric: tabular-nums !important;
  }
  .data-table tbody td:first-child {
    text-align: left !important;
    color: var(--ink) !important;
  }
  .data-table tbody td:first-child strong {
    font-family: var(--sans) !important;
    font-weight: 600 !important;
  }
  .data-table tbody tr:last-child td { border-bottom: 0 !important; }

  /* Weekly total row — paint-pale, NOT blue */
  .data-table tfoot tr { background: var(--paint-wash) !important; }
  .data-table tfoot td {
    color: var(--ink) !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    padding: var(--s4) !important;
    border-top: 2px solid var(--paint-pale) !important;
    border-bottom: 0 !important;
    text-align: right !important;
    font-variant-numeric: tabular-nums !important;
  }
  .data-table tfoot td:first-child {
    text-align: left !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    font-size: 11.5px !important;
    color: var(--ink-soft) !important;
  }

  /* Summary cards — editorial figures */
  .summary-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
    gap: var(--s3) !important;
  }
  .summary-card {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    padding: var(--s4) var(--s5) !important;
    box-shadow: none !important;
  }
  .summary-card.highlight-card {
    background: var(--paint-wash) !important;
    border-color: var(--paint-pale) !important;
  }
  .summary-label {
    color: var(--ink-quiet) !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.14em !important;
    text-transform: uppercase !important;
    margin-bottom: var(--s2) !important;
  }
  .summary-value {
    font-family: var(--serif) !important;
    font-weight: 500 !important;
    font-size: 26px !important;
    color: var(--ink) !important;
    line-height: 1.1 !important;
    font-variant-numeric: tabular-nums !important;
  }

  /* Expenses */
  .expense-grid { display: flex !important; flex-direction: column !important; gap: 0 !important; }
  .expense-item {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: var(--s3) 0 !important;
    border-bottom: 1px solid var(--line-soft) !important;
    background: transparent !important;
  }
  .expense-item:last-child { border-bottom: 0 !important; }
  .expense-name { color: var(--ink) !important; font-size: 13.5px !important; }
  .expense-amount { color: var(--ink) !important; font-variant-numeric: tabular-nums !important; font-weight: 600 !important; }
  .expense-total {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
    padding: var(--s3) var(--s4) !important;
    margin-top: var(--s3) !important;
    display: flex !important;
    justify-content: space-between !important;
    font-family: var(--sans) !important;
    font-weight: 700 !important;
    color: var(--ink) !important;
  }

  /* Notes box */
  .notes-box {
    background: var(--paint-wash) !important;
    border: 1px solid var(--paint-pale) !important;
    border-radius: var(--r) !important;
    padding: var(--s4) var(--s5) !important;
    color: var(--ink) !important;
    font-style: italic !important;
    font-family: var(--serif) !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
  }

  /* Loading state */
  .loading-text { color: var(--ink-quiet) !important; font-family: var(--sans) !important; }
  /* ── Week Report sharpening pass: align with dashboard editorial weight ── */

  /* Bigger, more confident hero — like the dashboard CURRENT WEEK card */
  .header-card {
    padding: var(--s7) var(--s6) !important;
    margin-bottom: var(--s5) !important;
    align-items: flex-start !important;
    flex-wrap: wrap !important;
    gap: var(--s4) !important;
  }
  .header-left { flex: 1 1 auto !important; min-width: 0 !important; }
  .header-card h1 {
    font-size: 38px !important;
    line-height: 1.1 !important;
    margin: 8px 0 10px 0 !important;
    letter-spacing: -0.01em !important;
  }
  .header-card #weekInfo,
  .header-card p {
    font-size: 11px !important;
    letter-spacing: 0.14em !important;
  }
  @media (max-width: 600px) {
    .header-card { padding: var(--s5) var(--s5) !important; }
    .header-card h1 { font-size: 28px !important; }
  }

  /* Nav buttons — tucked, lighter, no padding pressure */
  .nav-bar {
    margin-bottom: var(--s6) !important;
    padding: 0 !important;
  }
  .nav-btn {
    background: transparent !important;
    border: 0 !important;
    color: var(--ink-quiet) !important;
    padding: 6px 0 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
  }
  .nav-btn + .nav-btn { margin-left: var(--s5) !important; }
  .nav-btn:hover {
    color: var(--ink) !important;
    background: transparent !important;
    border-color: transparent !important;
    text-decoration: underline !important;
    text-underline-offset: 4px !important;
  }

  /* Hide the colored section icons — the dashboard uses plain serif titles */
  .section-icon,
  .icon-blue, .icon-green, .icon-amber, .icon-purple, .icon-pink {
    display: none !important;
  }

  /* Section header & title — like the dashboard's "Today" / "Records" */
  .section-card {
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    margin-bottom: var(--s6) !important;
    overflow: visible !important;
  }
  .section-header {
    background: transparent !important;
    border-bottom: 0 !important;
    padding: 0 0 var(--s3) 0 !important;
    margin-bottom: var(--s3) !important;
  }
  .section-title {
    font-size: 22px !important;
    line-height: 1.15 !important;
    letter-spacing: -0.005em !important;
  }

  /* Section body — sits on white-warm with a thin line, not a heavy card */
  .section-body {
    background: var(--white-warm) !important;
    border: 1px solid var(--line) !important;
    border-radius: var(--r) !important;
    padding: var(--s5) !important;
  }
  .section-body[style*="padding: 0"] {
    padding: 0 !important;
  }

</style>

</head>
<body>
__VARLO_BOOT__

__VARLO_HEADER_MENU__

  <div class="container">
    <div class="header-card">
      <div class="header-left">
        <h1>📊 Week Report</h1>
        <p id="weekInfo">Loading report...</p>
      </div>
      <span id="statusBadge" class="status-badge status-draft">Loading</span>
    </div>
    
    <div class="nav-bar">
      <button class="nav-btn" onclick="goToMenu()">🏠 Main Menu</button>
      <button class="nav-btn" onclick="window.print()">🖨️ Print Report</button>
    </div>
    
    <div id="reportContent">
      <div class="section-card">
        <div class="loading">
          <div class="spinner"></div>
          <div class="loading-text">Loading report data...</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    var scriptUrl = '';
    
    // Get the URL on page load
    google.script.run
      .withSuccessHandler(function(url) {
        scriptUrl = url;
      })
      .getWebAppUrl();

    // Navigation helper
    function navigateApp(queryString) {
      if (!scriptUrl) return;
      var fullUrl = scriptUrl + queryString;
      try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
      setTimeout(function() { window.location.href = fullUrl; }, 300);
    }
    
    window.onload = function() {
      loadReport();
    };
    
    function goToMenu() {
      if (scriptUrl) {
        navigateApp('?page=menu');
      } else {
        google.script.run
          .withSuccessHandler(function(url) {
            scriptUrl = url;
            navigateApp('?page=menu');
          })
          .getWebAppUrl();
      }
    }
    
    function loadReport() {
      // Week name is server-injected by _applyBranding from the URL ?week= param.
      // We cannot read window.location.search inside Apps Script's sandboxed
      // iframe — the URL there is Google's sandbox URL, not /exec?... — so
      // the param has to come through the server-side __WEEK_SHEET__ token.
      // Empty string means "load most recent draft" (library fallback).
      var weekName = '__WEEK_SHEET__';
      google.script.run
        .withSuccessHandler(renderReport)
        .withFailureHandler(function(error) {
          document.getElementById('reportContent').innerHTML = 
            '<div class="section-card"><div class="section-body">' +
            '<p style="color: #dc2626; text-align: center; padding: 40px;">❌ Error loading report: ' + error.message + '</p>' +
            '</div></div>';
        })
        .getWeekReportDataEnhanced(weekName);
    }
    
    function formatCurrency(value) {
      const num = parseFloat(value) || 0;
      const formatted = Math.abs(num).toFixed(2);
      return (num < 0 ? '-' : '') + '£' + formatted;
    }
    
    function renderReport(data) {
      // Update header
      document.getElementById('weekInfo').textContent = 
        data.weekSheet + ' • Week Ending ' + data.weekEnding;
      
      // Update status badge
      const badge = document.getElementById('statusBadge');
      badge.textContent = data.status;
      badge.className = 'status-badge status-' + data.status.toLowerCase();
      
      // Calculate totals for daily data
      let totals = {
        cash: 0, totalPdq: 0, grossOnTill: 0, netOnTill: 0, 
        tabs: 0, actualToSafe: 0, dailyOut: 0, pdqRooms: 0, cashRooms: 0
      };
      
      data.dailyData.forEach(day => {
        totals.cash += parseFloat(day.cash) || 0;
        totals.totalPdq += (parseFloat(day.pdq1) || 0) + (parseFloat(day.pdq2) || 0);
        totals.grossOnTill += parseFloat(day.grossOnTill) || 0;
        totals.netOnTill += parseFloat(day.netOnTill) || 0;
        totals.tabs += parseFloat(day.tabs) || 0;
        totals.actualToSafe += parseFloat(day.actualToSafe) || 0;
        totals.dailyOut += parseFloat(day.dailyOut) || 0;
        totals.pdqRooms += parseFloat(day.pdqRooms) || 0;
        totals.cashRooms += parseFloat(day.cashRooms) || 0;
      });
      
      let html = '';
      
      // ═══════════════════════════════════════════════════════════════
      // DAILY ENTRIES TABLE
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-blue">📅</div>';
      html += '<div class="section-title">Daily Entries</div>';
      html += '</div>';
      html += '<div class="section-body" style="padding: 0; overflow-x: auto;">';
      html += '<table class="data-table">';
      html += '<thead><tr>';
      html += '<th style="text-align:left">Day</th>';
      html += '<th>Cash</th>';
      html += '<th>Total PDQ</th>';
      html += '<th>Gross Till</th>';
      html += '<th>Net Till</th>';
      html += '<th>Tabs +/-</th>';
      html += '<th>To Safe</th>';
      html += '<th>Daily Out</th>';
      html += '<th>Rooms PDQ</th>';
      html += '<th>Rooms Cash</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      
      data.dailyData.forEach(day => {
        const hasData = day.cash || day.pdq1 || day.pdq2 || day.grossOnTill;
        const dayTotalPdq = (parseFloat(day.pdq1) || 0) + (parseFloat(day.pdq2) || 0);
        html += '<tr' + (hasData ? '' : ' style="opacity: 0.5;"') + '>';
        html += '<td><strong>' + day.day.substring(0,3) + '</strong> ' + day.date + '</td>';
        html += '<td>' + formatCurrency(day.cash) + '</td>';
        html += '<td>' + formatCurrency(dayTotalPdq) + '</td>';
        html += '<td>' + formatCurrency(day.grossOnTill) + '</td>';
        html += '<td>' + formatCurrency(day.netOnTill) + '</td>';
        html += '<td>' + formatCurrency(day.tabs) + '</td>';
        html += '<td>' + formatCurrency(day.actualToSafe) + '</td>';
        html += '<td>' + formatCurrency(day.dailyOut) + '</td>';
        html += '<td>' + formatCurrency(day.pdqRooms) + '</td>';
        html += '<td>' + formatCurrency(day.cashRooms) + '</td>';
        html += '</tr>';
      });
      
      html += '</tbody>';
      html += '<tfoot><tr>';
      html += '<td>WEEKLY TOTAL</td>';
      html += '<td>' + formatCurrency(totals.cash) + '</td>';
      html += '<td>' + formatCurrency(totals.totalPdq) + '</td>';
      html += '<td>' + formatCurrency(totals.grossOnTill) + '</td>';
      html += '<td>' + formatCurrency(totals.netOnTill) + '</td>';
      html += '<td>' + formatCurrency(totals.tabs) + '</td>';
      html += '<td>' + formatCurrency(totals.actualToSafe) + '</td>';
      html += '<td>' + formatCurrency(totals.dailyOut) + '</td>';
      html += '<td>' + formatCurrency(totals.pdqRooms) + '</td>';
      html += '<td>' + formatCurrency(totals.cashRooms) + '</td>';
      html += '</tr></tfoot>';
      html += '</table>';
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // WEEKLY SUMMARY - Key Figures
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-green">📊</div>';
      html += '<div class="section-title">Weekly Summary</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<div class="summary-grid">';
      
      html += '<div class="summary-card highlight-card">';
      html += '<div class="summary-label">Gross Sales</div>';
      html += '<div class="summary-value">' + formatCurrency(data.grossSales) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card highlight-card">';
      html += '<div class="summary-label">Net Sales</div>';
      html += '<div class="summary-value">' + formatCurrency(data.netSales) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Total Cash in Safe</div>';
      html += '<div class="summary-value">' + formatCurrency(data.totalCashInSafe) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Total Cards (PDQ)</div>';
      html += '<div class="summary-value">' + formatCurrency(totals.totalPdq) + '</div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // TOUCHOFFICE DATA
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-purple">🖥️</div>';
      html += '<div class="section-title">TouchOffice Data</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<div class="summary-grid">';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Wet Sales</div>';
      html += '<div class="summary-value">' + formatCurrency(data.touchOfficeWetSales) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Food Sales</div>';
      html += '<div class="summary-value">' + formatCurrency(data.touchOfficeFoodSales) + '</div>';
      html += '</div>';
      
      const toTotal = (parseFloat(data.touchOfficeWetSales) || 0) + (parseFloat(data.touchOfficeFoodSales) || 0);
      html += '<div class="summary-card highlight-card">';
      html += '<div class="summary-label">Combined Total</div>';
      html += '<div class="summary-value">' + formatCurrency(toTotal) + '</div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // TABS - Running Balance Impact
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-amber">📋</div>';
      html += '<div class="section-title">Tabs - Running Balance</div>';
      html += '</div>';
      html += '<div class="section-body">';
      
      // Calculate previous tabs balance (running balance minus this week's change)
      const previousTabsBalance = (data.runningTabBalance || 0) - (data.totalTabChange || 0);
      
      html += '<table class="data-table compact" style="max-width: 500px;">';
      html += '<tbody>';
      html += '<tr>';
      html += '<td style="text-align:left; font-weight:600;">Previous Running Balance</td>';
      html += '<td style="text-align:right;">' + formatCurrency(previousTabsBalance) + '</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td style="text-align:left; font-weight:600;">This Week\\'s Tab Change</td>';
      const tabChangeClass = data.totalTabChange >= 0 ? 'positive' : 'negative';
      html += '<td style="text-align:right;" class="' + tabChangeClass + '">' + formatCurrency(data.totalTabChange) + '</td>';
      html += '</tr>';
      html += '</tbody>';
      html += '<tfoot>';
      html += '<tr>';
      html += '<td style="text-align:left;">NEW RUNNING BALANCE</td>';
      const newTabClass = data.runningTabBalance >= 0 ? 'positive' : 'negative';
      html += '<td style="text-align:right;" class="' + newTabClass + '">' + formatCurrency(data.runningTabBalance) + '</td>';
      html += '</tr>';
      html += '</tfoot>';
      html += '</table>';
      
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // SALES VS PAYMENTS - Weekly Difference
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-purple">💹</div>';
      html += '<div class="section-title">Sales vs Payments - Running Difference</div>';
      html += '</div>';
      html += '<div class="section-body">';
      
      // Use weeklyDifferenceSalesToPayments from C51
      const thisWeekSalesDiff = data.weeklyDifferenceSalesToPayments || 0;
      const previousSalesDiff = (data.runningCashDiff || 0);
      const newRunningSalesDiff = previousSalesDiff + thisWeekSalesDiff;
      
      html += '<table class="data-table compact" style="max-width: 500px;">';
      html += '<tbody>';
      html += '<tr>';
      html += '<td style="text-align:left; font-weight:600;">Previous Running Difference</td>';
      const prevDiffClass = previousSalesDiff >= 0 ? 'positive' : 'negative';
      html += '<td style="text-align:right;" class="' + prevDiffClass + '">' + formatCurrency(previousSalesDiff) + '</td>';
      html += '</tr>';
      html += '<tr>';
      html += '<td style="text-align:left; font-weight:600;">This Week\\'s Difference</td>';
      const weekDiffClass = thisWeekSalesDiff >= 0 ? 'positive' : 'negative';
      html += '<td style="text-align:right;" class="' + weekDiffClass + '">' + formatCurrency(thisWeekSalesDiff) + '</td>';
      html += '</tr>';
      html += '</tbody>';
      html += '<tfoot>';
      html += '<tr>';
      html += '<td style="text-align:left;">NEW RUNNING DIFFERENCE</td>';
      const newDiffClass = newRunningSalesDiff >= 0 ? 'positive' : 'negative';
      html += '<td style="text-align:right;" class="' + newDiffClass + '">' + formatCurrency(newRunningSalesDiff) + '</td>';
      html += '</tr>';
      html += '</tfoot>';
      html += '</table>';
      
      html += '</div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // ROOMS SUMMARY
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-blue">🛏️</div>';
      html += '<div class="section-title">Rooms Summary</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<div class="summary-grid">';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Rooms Card Total</div>';
      html += '<div class="summary-value">' + formatCurrency(totals.pdqRooms) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Rooms Cash Total</div>';
      html += '<div class="summary-value">' + formatCurrency(totals.cashRooms) + '</div>';
      html += '</div>';
      
      const totalRooms = totals.pdqRooms + totals.cashRooms;
      html += '<div class="summary-card highlight-card">';
      html += '<div class="summary-label">Total Rooms Income</div>';
      html += '<div class="summary-value">' + formatCurrency(totalRooms) + '</div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // EXPENSES
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-pink">💸</div>';
      html += '<div class="section-title">Weekly Expenses</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<div class="expense-grid">';
      
      // Updated expense categories to match new row numbers (24-41)
      const expenseCategories = [
        { name: 'Room Cleaning', row: 24 },
        { name: 'Pub Cleaning', row: 25 },
        { name: 'Temp Kitchen Staff', row: 26 },
        { name: 'Temp Bar Staff', row: 27 },
        { name: 'Room Supplies (no VAT)', row: 28 },
        { name: 'Room Supplies (vatable)', row: 29 },
        { name: 'Bar Supplies (no VAT)', row: 30 },
        { name: 'Bar Supplies (vatable)', row: 31 },
        { name: 'Bar Direct Costs (no VAT)', row: 32 },
        { name: 'Kitchen Supplies (no VAT)', row: 33 },
        { name: 'Kitchen Supplies (vatable)', row: 34 },
        { name: 'Joint Pub Expenses (no VAT)', row: 35 },
        { name: 'Joint Pub Expenses (vatable)', row: 36 },
        { name: 'Pub Maintenance (no VAT)', row: 37 },
        { name: 'Cleaning Supplies (vatable)', row: 38 },
        { name: 'Refunds', row: 39 },
        { name: 'Custom / Other', row: 40 }
      ];
      
      let hasExpenses = false;
      expenseCategories.forEach(category => {
        const items = data.expenses[category.row] || [];
        let total = 0;
        items.forEach(item => { total += parseFloat(item.amount) || 0; });
        
        if (total > 0) {
          hasExpenses = true;
          html += '<div class="expense-item">';
          html += '<span class="expense-name">' + category.name + '</span>';
          html += '<span class="expense-amount">' + formatCurrency(total) + '</span>';
          html += '</div>';
        }
      });
      
      if (!hasExpenses) {
        html += '<div class="expense-item" style="grid-column: 1/-1; justify-content: center; color: #94a3b8;">';
        html += '<span>No expenses recorded this week</span>';
        html += '</div>';
      }
      
      // Total expenses row
      html += '<div class="expense-item expense-total">';
      html += '<span class="expense-name">TOTAL EXPENSES</span>';
      html += '<span class="expense-amount">' + formatCurrency(data.totalExpenses) + '</span>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // CASH TO CHARLIE
      // ═══════════════════════════════════════════════════════════════
      html += '<div class="section-card">';
      html += '<div class="section-header">';
      html += '<div class="section-icon icon-green">💰</div>';
      html += '<div class="section-title">Cash to Charlie</div>';
      html += '</div>';
      html += '<div class="section-body">';
      html += '<div class="summary-grid">';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Actual Cash After Expenses</div>';
      html += '<div class="summary-value">' + formatCurrency(data.actualCashAfterExpenses) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card highlight-card">';
      html += '<div class="summary-label">Cash to Charlie</div>';
      html += '<div class="summary-value">' + formatCurrency(data.cashToCharlie) + '</div>';
      html += '</div>';
      
      html += '<div class="summary-card">';
      html += '<div class="summary-label">Difference Cash to Charlie</div>';
      const diffCharlieClass = data.cashDifference >= 0 ? 'positive' : 'negative';
      html += '<div class="summary-value ' + diffCharlieClass + '">' + formatCurrency(data.cashDifference) + '</div>';
      html += '</div>';
      
      html += '</div></div></div>';
      
      // ═══════════════════════════════════════════════════════════════
      // NOTES
      // ═══════════════════════════════════════════════════════════════
      if (data.weekNotes) {
        html += '<div class="section-card">';
        html += '<div class="section-header">';
        html += '<div class="section-icon icon-amber">📝</div>';
        html += '<div class="section-title">Week Notes</div>';
        html += '</div>';
        html += '<div class="section-body">';
        html += '<div class="notes-box">' + data.weekNotes.replace(/\\n/g, '<br>') + '</div>';
        html += '</div></div>';
      }
      
      document.getElementById('reportContent').innerHTML = html;
    }
  </script>
<script>(function(){document.addEventListener("touchmove",function(e){},{passive:true});document.body.style.overflowY="scroll";document.body.style.webkitOverflowScrolling="touch";document.body.style.height="auto";document.documentElement.style.height="auto";document.documentElement.style.overflow="auto";})()</script>
</body>
</html>`;