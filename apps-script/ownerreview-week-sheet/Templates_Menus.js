/**
 * PubSystemLib — Templates_Menus.gs (v4.13 - owner menu rebuilt in v4 + iframe ps-header hide)
 */

const MAIN_MENU_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  background: linear-gradient(135deg, #4a3f3a 0%, #3d3532 100%);
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
.confirm-buttons { display: flex; gap: 15px; justify-content: center; }
    .modal-button.cancel { background: #e2e8f0; color: #475569; }
    .modal-button.cancel:hover { background: #cbd5e1; transform: none; box-shadow: none; }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      height: 100%;
      overflow: auto;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #4a3f3a 0%, #3d3532 100%);
      padding: 20px;
      min-height: 100%;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: visible;
    }
    
    .header {
      background: linear-gradient(135deg, #4a3f3a 0%, #3d3532 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
    }
    
    .status-card {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      border: 2px solid #2d2d2d;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.1);
    }
    
    .status-card.complete {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }
    
    .status-card.submitted {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border-color: #ffc107;
    }
    
    .status-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d2d2d;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    
    .status-card.complete .status-title {
      color: #28a745;
    }
    
    .status-card.submitted .status-title {
      color: #d97706;
    }
    
    .week-info-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .week-info-label {
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
    }
    
    .week-info-value {
      font-size: 14px;
      color: #2d3748;
    }
    
    .progress-section {
      margin-top: 20px;
    }
    
    .progress-label {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
    
    .progress-bar-container {
      background: #e2e8f0;
      border-radius: 10px;
      height: 12px;
      overflow: hidden;
      margin-bottom: 15px;
    }
    
    .progress-bar {
      background: linear-gradient(90deg, #2d2d2d 0%, #1a1a1a 100%);
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    
    .progress-bar.complete {
      background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
    }
    
    .day-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-top: 10px;
    }
    
    .day-box {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #718096;
      cursor: pointer;
      transition: all 0.3s;
      -webkit-user-select: none;
      user-select: none;
    }
    
    .day-box:hover {
      border-color: #2d2d2d;
      transform: translateY(-2px);
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }
    
    .day-box.complete {
      background: #d4edda;
      border-color: #28a745;
      color: #28a745;
    }
    
    .day-box.complete:hover {
      border-color: #20c997;
      box-shadow: 0 2px 6px rgba(32, 201, 151, 0.3);
    }
    
    .day-name {
      font-size: 10px;
      margin-bottom: 4px;
    }
    
    .day-date {
      font-size: 11px;
      font-weight: 700;
    }
    
    .weekly-status {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 15px;
      padding: 15px;
      background: white;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .weekly-status:hover {
      border-color: #2d2d2d;
      transform: translateY(-2px);
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }
    
    .weekly-status.complete {
      background: #d4edda;
      border-color: #28a745;
    }
    
    .weekly-status.disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
      background: #f1f5f9;
    }
    
    .weekly-status.disabled:hover {
      transform: none;
      box-shadow: none;
      border-color: #e2e8f0;
    }
    
    .weekly-status-icon {
      font-size: 24px;
    }
    
    .weekly-status-text {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .weekly-status-action {
      font-size: 12px;
      color: #2d2d2d;
      font-weight: 600;
    }
    
    .weekly-status.disabled .weekly-status-action {
      color: #94a3b8;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .tasks-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .tasks-grid.single {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .task-card {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 15px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      -webkit-user-select: none;
      user-select: none;
    }
    
    .task-card:hover {
      border-color: #2d2d2d;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
    
    .task-card.primary {
      background: linear-gradient(135deg, #4a3f3a 0%, #3d3532 100%);
      color: white;
      border: none;
    }
    
    .task-card.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .task-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .task-card.disabled:hover {
      transform: none;
      box-shadow: none;
    }
    
    .task-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    .task-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .task-subtitle {
      font-size: 13px;
      opacity: 0.8;
    }
    
    .info-banner {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #856404;
    }
    
    .success-banner {
      background: #d1fae5;
      border-left: 4px solid #28a745;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #155724;
    }
    
    .no-week-container {
      text-align: center;
      padding: 60px 20px;
    }
    
    .no-week-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }
    
    .no-week-title {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 10px;
    }
    
    .no-week-text {
      font-size: 16px;
      color: #718096;
      margin-bottom: 30px;
    }
    
    .btn-large {
      background: linear-gradient(135deg, #4a3f3a 0%, #3d3532 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 20px 40px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    
    .btn-large:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 50px;
    }
      100% { transform: rotate(360deg); }
    }
    
    .running-figures {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 15px;
      padding: 25px;
      margin-top: 30px;
    }
    
    .running-figures-title {
      font-size: 16px;
      font-weight: 700;
      color: #0c4a6e;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .figures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .figure-box {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .figure-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .figure-value {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      font-family: 'Courier New', monospace;
    }
    
    .figure-value.positive {
      color: #059669;
    }
    
    .figure-value.negative {
      color: #dc2626;
    }
    
    /* Previous Weeks Section */
    .previous-weeks { background: white; border-radius: 20px; padding: 25px; margin-top: 20px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); }
    .previous-weeks-title { font-size: 14px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .week-history-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #f8fafc; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #cbd5e1; }
    .week-history-item.draft { border-left-color: #3b82f6; }
    .week-history-item.submitted { border-left-color: #f59e0b; }
    .week-history-item.approved { border-left-color: #10b981; }
    .week-history-item.exported { border-left-color: #6b7280; background: #f1f5f9; }
    .week-history-info { display: flex; flex-direction: column; gap: 2px; }
    .week-history-name { font-weight: 600; font-size: 14px; color: #1e293b; }
    .week-history-date { font-size: 12px; color: #64748b; }
    .week-history-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-draft { background: #dbeafe; color: #1d4ed8; }
    .badge-submitted { background: #fef3c7; color: #b45309; }
    .badge-approved { background: #d1fae5; color: #047857; }
    .badge-exported { background: #e5e7eb; color: #374151; }
    .no-history { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; }
    @media (max-width: 768px) {
      body { padding: 0; }
      .container { border-radius: 0; box-shadow: none; min-height: 100vh; }
      .header { padding: 24px 16px; }
      .header h1 { font-size: 22px; }
      .content { padding: 16px; }
      .status-card { padding: 16px; margin-bottom: 20px; }
      .day-grid { gap: 4px; }
      .day-box { padding: 8px 4px; font-size: 10px; min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0.1); }
      .day-name { font-size: 9px; }
      .day-date { font-size: 10px; }
      .tasks-grid { gap: 12px; }
      .task-card { padding: 20px 12px; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0.1); }
      .task-icon { font-size: 36px; margin-bottom: 10px; }
      .task-title { font-size: 15px; }
      .task-subtitle { font-size: 11px; }
      .weekly-status { padding: 12px; -webkit-user-select: none; user-select: none; }
      .running-figures { padding: 16px; margin-top: 20px; }
      .figure-value { font-size: 22px; }
      .previous-weeks { padding: 16px; margin-top: 12px; }
      .modal-box { padding: 24px 20px; margin: 16px; }
    }
    @media (max-width: 380px) {
      .tasks-grid { grid-template-columns: 1fr; }
      .figures-grid { grid-template-columns: 1fr; }
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

  /* Iframe: keep Varlo brand header; hide other legacy headers only */
  html.iframed .ps-header:not(.varlo-header) { display: none !important; }
  html.iframed .header, html.iframed .header-card { display: none !important; }
  html.iframed body { padding-top: 0 !important; }
</style>

</head>
<body class="varlo-shell">
__VARLO_BOOT__
<header class="ps-header varlo-header">
  <div class="ps-header-inner">
    <div class="varlo-brand">
      __VARLO_MARK__
      <div class="varlo-brand-text">
        <div class="varlo-word" aria-label="Varlo">Varlo</div>
        <div class="varlo-word-sub">__VENUE_FULL__ · Manager · <span class="varlo-mode-pip"></span></div>
      </div>
    </div>
  </div>
</header>

  <main class="ps-main varlo-fill">
    <div class="varlo-tiles" id="varloTiles">
      <div class="ps-loading varlo-tile varlo-tile--span-all" id="loadingContainer">Loading week status…</div>

      <section class="ps-hero varlo-tile varlo-tile--hero varlo-tile--span-all" id="heroContainer" style="display:none;"></section>

      <div class="ps-figures varlo-figures-tiles varlo-tile--span-all" id="figuresContainer" style="display:none;"></div>

      <div class="varlo-tile varlo-tile--span-all varlo-tile--flush" id="actionsContainer" style="display:none;"></div>

      <div class="ps-section-head varlo-tile--span-all" id="recordsHead" style="display:none; margin: 4px 0 0; padding: 0 4px;">
        <h2 class="ps-section-title">Records</h2>
      </div>
      <div class="ps-secondary-grid varlo-action-tiles varlo-tile--span-all" id="recordsContainer" style="display:none; background: transparent; border: 0;">
        <button type="button" class="ps-secondary" onclick="viewAllWeeks()">
          <svg class="ps-secondary-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="1"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <div>
            <div class="ps-secondary-title">All weeks</div>
            <div class="ps-secondary-meta">Browse</div>
          </div>
        </button>
        <button type="button" class="ps-secondary" onclick="openTabAnchorPage()">
          <svg class="ps-secondary-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
          <div>
            <div class="ps-secondary-title">Tab anchor</div>
            <div class="ps-secondary-meta">Adjust</div>
          </div>
        </button>
        <button type="button" class="ps-secondary" onclick="viewWeekReport()">
          <svg class="ps-secondary-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div>
            <div class="ps-secondary-title">Week report</div>
            <div class="ps-secondary-meta">Print or PDF</div>
          </div>
        </button>
        <button type="button" class="ps-secondary" onclick="openMasterSheetPage()">
          <svg class="ps-secondary-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <div>
            <div class="ps-secondary-title">Master sheet</div>
            <div class="ps-secondary-meta">Open</div>
          </div>
        </button>
        <button type="button" class="ps-secondary" onclick="openPriceQuery()">
          <svg class="ps-secondary-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <div>
            <div class="ps-secondary-title">Price Query</div>
            <div class="ps-secondary-meta">Bar sell prices</div>
          </div>
        </button>
      </div>

      <div class="ps-bottom-cta varlo-tile varlo-tile--span-all" id="bottomCtaContainer" style="display:none; margin: 0; position: static; background: transparent;">
        <button type="button" class="ps-btn ps-btn-primary ps-btn-block ps-btn-lg" id="bottomCtaBtn">Submit Week</button>
      </div>
    </div>
  </main>
  
  <script>
    let currentWeekData = null;
    
    window.onload = function() {
      loadStatus();
    };
    
    function loadStatus() {
      google.script.run
        .withSuccessHandler(function(status) {
          currentWeekData = status;
          revealContent();
          renderHero(status);
          renderFigures(status);
          renderActions(status);
          renderBottomCta(status);
        })
        .withFailureHandler(function(error) {
          var lc = document.getElementById('loadingContainer');
          if (lc) lc.innerHTML = '<div style="color:#8B4A0F;text-align:center;">Error loading week status: ' + (error && error.message ? error.message : error) + '</div>';
        })
        .getDetailedWeekStatus();
    }
    
    function revealContent() {
      var loading = document.getElementById('loadingContainer');
      if (loading) loading.style.display = 'none';
      document.getElementById('heroContainer').style.display = 'block';
      document.getElementById('recordsHead').style.display = 'flex';
      document.getElementById('recordsContainer').style.display = 'grid';
    }
    
    function formatMoneyInt(n) {
      var num = Number(n) || 0;
      var rounded = Math.round(num);
      var sign = rounded < 0 ? '-' : '';
      return sign + Math.abs(rounded).toLocaleString('en-GB');
    }
    
    // ── HERO ─────────────────────────────────────────────────────
    function renderHero(status) {
      var el = document.getElementById('heroContainer');
      
      if (!status.hasWeek) {
        el.innerHTML =
          '<div class="ps-hero-eyebrow">' +
            '<span class="ps-eyebrow-label">No Active Week</span>' +
            '<span class="ps-eyebrow-line"></span>' +
            '<span class="ps-status-tag muted">Empty</span>' +
          '</div>' +
          '<h1 class="ps-hero-title">Ready to start</h1>' +
          '<div class="ps-hero-subtitle">No week sheet in progress — use the button below to begin</div>';
        return;
      }
      
      // Status tag
      var tagLabel = 'Draft';
      if (status.status === 'APPROVED') {
        tagLabel = 'Approved';
      } else if (status.isSubmitted) {
        tagLabel = 'Submitted';
      } else if (status.weeklyDataComplete && status.daysCompleted >= 7) {
        tagLabel = 'Ready';
      }
      
      // Hero title: "Week ending 24 May" — strip trailing year
      var weekTitle = String(status.weekEnding || '').replace(/ \\d{4}$/, '');
      
      // Subtitle: "MON 18 — SUN 24 · 2026"
      var dates = status.dates || [];
      var day0 = (dates[0] || '').split('/')[0] || '';
      var day6 = (dates[6] || '').split('/')[0] || '';
      var year = String(status.weekEnding || '').slice(-4);
      var subtitle = 'MON ' + day0 + ' — SUN ' + day6 + ' · ' + year;
      
      // Day strip — done/today/upcoming
      var dayLetters = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      var daysHTML = '';
      for (var i = 0; i < 7; i++) {
        var isDone = status.daysComplete && status.daysComplete[i];
        var isToday = status.todayIndex === i;
        var cls = 'ps-day';
        if (isToday) cls += ' today';
        else if (isDone) cls += ' done';
        var dayNum = (dates[i] || '').split('/')[0] || '';
        daysHTML += '<button type="button" class="' + cls + '" onclick="editSpecificDay(' + i + ')">' +
                      '<div class="ps-day-letter">' + dayLetters[i] + '</div>' +
                      '<div class="ps-day-num">' + dayNum + '</div>' +
                    '</button>';
      }
      
      el.innerHTML =
        '<div class="ps-hero-eyebrow">' +
          '<span class="ps-eyebrow-label">Current Week</span>' +
          '<span class="ps-eyebrow-line"></span>' +
          '<span class="ps-status-tag">' + tagLabel + '</span>' +
        '</div>' +
        '<h1 class="ps-hero-title">Week ending ' + weekTitle + '</h1>' +
        '<div class="ps-hero-subtitle">' + subtitle + '</div>' +
        '<div class="ps-week-glance">' + daysHTML + '</div>';
    }
    
    // ── FIGURES ──────────────────────────────────────────────────
    function renderFigures(status) {
      var el = document.getElementById('figuresContainer');
      if (!status.hasWeek) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'grid';
      
      var netSales   = status.netSales   || 0;
      var tabs       = status.tabBalance || 0;
      var cashToBank = status.cashToBank || 0;
      
      var tabsMeta = tabs > 0.01 ? 'Outstanding' : (tabs < -0.01 ? 'In credit' : 'Settled');
      var cashMeta = status.isSubmitted ? 'Submitted' : 'Pending';
      
      el.innerHTML =
        '<div class="ps-figure">' +
          '<div class="ps-figure-label">Net Sales</div>' +
          '<div class="ps-figure-value">£' + formatMoneyInt(netSales) + '</div>' +
          '<div class="ps-figure-meta">This week</div>' +
        '</div>' +
        '<div class="ps-figure">' +
          '<div class="ps-figure-label">Tab Balance</div>' +
          '<div class="ps-figure-value">£' + formatMoneyInt(tabs) + '</div>' +
          '<div class="ps-figure-meta">' + tabsMeta + '</div>' +
        '</div>' +
        '<div class="ps-figure">' +
          '<div class="ps-figure-label">Cash To Bank</div>' +
          '<div class="ps-figure-value">£' + formatMoneyInt(cashToBank) + '</div>' +
          '<div class="ps-figure-meta">' + cashMeta + '</div>' +
        '</div>';
    }
    
    // ── ACTIONS (Today / Awaiting) ───────────────────────────────
    function renderActions(status) {
      var el = document.getElementById('actionsContainer');
      if (!status.hasWeek) {
        el.innerHTML = '';
        return;
      }
      el.style.display = 'block';
      
      var isSubmitted = status.isSubmitted;
      var allDays = (status.daysCompleted || 0) >= 7;
      var wd = status.weeklyDataComplete;
      var nextDayIdx = status.nextDayIndex;
      var nextDayFull = status.nextDayFull || '';
      
      var chev = '<svg class="ps-action-trailing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>';
      
      var sectionTitle, actionsHTML;
      
      if (isSubmitted) {
        sectionTitle = 'Awaiting';
        var awaitingLabel = status.status === 'APPROVED' ? 'Approved — view in owner dashboard' : 'Week submitted · awaiting owner approval';
        var awaitingPip = status.status === 'APPROVED'
          ? '<span class="ps-pip ok">Approved</span>'
          : '<span class="ps-pip ok">Submitted</span>';
        actionsHTML =
          '<div class="ps-action muted">' +
            '<div class="ps-action-leading"></div>' +
            '<div class="ps-action-content">' +
              '<div class="ps-action-row">' +
                '<div class="ps-action-title">Owner Review</div>' + awaitingPip +
              '</div>' +
              '<div class="ps-action-meta">' + awaitingLabel + '</div>' +
            '</div>' +
          '</div>';
      } else {
        sectionTitle = 'Today';
        
        // Daily Entry row
        var dailyMeta, dailyPip, dailyOnclick, dailyClass = 'ps-action';
        if (!allDays && nextDayIdx >= 0) {
          dailyPip = '<span class="ps-pip due">Due</span>';
          dailyMeta = nextDayFull + ' · X reading, cash, cards';
          dailyOnclick = 'editSpecificDay(' + nextDayIdx + ')';
        } else {
          dailyPip = '<span class="ps-pip ok">Done</span>';
          dailyMeta = '7 of 7 days entered';
          dailyOnclick = 'enterDailyData()';
          dailyClass = 'ps-action muted';
        }
        
        // Weekly Cash Up row
        var weeklyMeta, weeklyPip = '', weeklyOnclick, weeklyClass = 'ps-action';
        if (!allDays) {
          weeklyClass = 'ps-action muted';
          weeklyMeta = 'Complete all 7 days first (' + (status.daysCompleted || 0) + '/7)';
          weeklyOnclick = 'void(0)';
        } else if (wd) {
          weeklyPip = '<span class="ps-pip ok">Done</span>';
          weeklyMeta = 'Expenses, TouchOffice, banking · saved';
          weeklyOnclick = 'editWeeklyData()';
          weeklyClass = 'ps-action muted';
        } else {
          weeklyPip = '<span class="ps-pip due">Due</span>';
          weeklyMeta = 'Expenses, TouchOffice, banking';
          weeklyOnclick = 'editWeeklyData()';
        }
        
        actionsHTML =
          '<button type="button" class="' + dailyClass + '" onclick="' + dailyOnclick + '">' +
            '<div class="ps-action-leading"></div>' +
            '<div class="ps-action-content">' +
              '<div class="ps-action-row">' +
                '<div class="ps-action-title">Daily Entry</div>' + dailyPip +
              '</div>' +
              '<div class="ps-action-meta">' + dailyMeta + '</div>' +
            '</div>' + chev +
          '</button>' +
          '<button type="button" class="' + weeklyClass + '" onclick="' + weeklyOnclick + '">' +
            '<div class="ps-action-leading"></div>' +
            '<div class="ps-action-content">' +
              '<div class="ps-action-row">' +
                '<div class="ps-action-title">Weekly Cash Up</div>' + weeklyPip +
              '</div>' +
              '<div class="ps-action-meta">' + weeklyMeta + '</div>' +
            '</div>' + chev +
          '</button>';
      }
      
      el.innerHTML =
        '<div class="ps-section-head">' +
          '<h2 class="ps-section-title">' + sectionTitle + '</h2>' +
          '<button type="button" class="ps-section-link" onclick="viewAllWeeks()">View all →</button>' +
        '</div>' +
        '<div class="ps-actions varlo-action-tiles">' + actionsHTML + '</div>';
    }
    
    // ── BOTTOM CTA (sticky thumb-zone button) ────────────────────
    function renderBottomCta(status) {
      var ctaEl = document.getElementById('bottomCtaContainer');
      var btn = document.getElementById('bottomCtaBtn');
      if (!ctaEl || !btn) return;
      
      if (!status.hasWeek) {
        btn.textContent = 'Start New Week';
        btn.onclick = startNewWeek;
        ctaEl.style.display = 'block';
        return;
      }
      
      if (status.isSubmitted) {
        // Current week is with the owner — primary action is starting the next one
        btn.textContent = 'Start Next Week';
        btn.onclick = startNewWeek;
        ctaEl.style.display = 'block';
        return;
      }
      
      var allDays = (status.daysCompleted || 0) >= 7;
      var wd = status.weeklyDataComplete;
      var nextDayIdx = status.nextDayIndex;
      
      if (!allDays && nextDayIdx >= 0) {
        btn.textContent = 'Continue: Day ' + (nextDayIdx + 1) + ' of 7';
        btn.onclick = function() { editSpecificDay(nextDayIdx); };
      } else if (!wd) {
        btn.textContent = 'Complete Weekly Cash Up';
        btn.onclick = function() { editWeeklyData(); };
      } else {
        btn.textContent = 'Submit Week';
        btn.onclick = submitWeek;
      }
      ctaEl.style.display = 'block';
    }
    
    var webAppUrl = '';

// Get the URL on page load
google.script.run
  .withSuccessHandler(function(url) {
    webAppUrl = url;
    console.log('Web app URL:', webAppUrl);
  })
  .getWebAppUrl();

// Navigation helper - works both in iframe (GitHub portal) and standalone
function navigateApp(queryString) {
  if (!webAppUrl) {
    showStyledAlert('Still loading, please try again', 'warning');
    return;
  }
  var fullUrl = webAppUrl + queryString;
  var iframed = false;
  try { iframed = window.self !== window.top; } catch (e) { iframed = true; }
  // Send to top-level window (GitHub portal) - goes through all iframe layers
  try { window.top.postMessage({type: 'navigate', url: fullUrl}, '*'); } catch(e) {}
  // Standalone only — iframe self-nav drops ?week= inside HtmlService sandbox
  if (!iframed) {
    setTimeout(function() { window.location.href = fullUrl; }, 300);
  }
}

function navigateTo(page) {
  if (webAppUrl) {
    navigateApp('?page=' + page);
  } else {
    showStyledAlert('Still loading, please try again', 'warning');
  }
}

function editSpecificDay(dayIndex) {
  if (webAppUrl) {
    navigateApp('?page=daily&day=' + dayIndex);
  }
}

function enterDailyData() {
  navigateTo('daily');
}

function editWeeklyData() {
  navigateTo('weekly');
}

// UPDATED: Navigate to report page instead of generating PDF directly
function viewWeekReport() {
  navigateTo('weekreport');
}

function selectPastWeek() {
  navigateTo('selectweek');
}

function viewAllWeeks() {
  navigateTo('allweeks');
}

function openTabAnchorPage() {
  navigateTo('tabanchor');
}

function openMasterSheetPage() {
  navigateTo('masterview');
}

function openPriceQuery() {
  navigateTo('kegcosting');
}


    
    function showBusyState(message) {
      // Hide the v4 body sections and show the loading text while a server op runs.
      var ids = ['heroContainer', 'figuresContainer', 'actionsContainer', 'recordsHead', 'recordsContainer', 'bottomCtaContainer'];
      for (var i = 0; i < ids.length; i++) {
        var node = document.getElementById(ids[i]);
        if (node) node.style.display = 'none';
      }
      var loading = document.getElementById('loadingContainer');
      if (loading) {
        loading.style.display = 'block';
        loading.textContent = message || 'Working…';
      }
    }

    function clearBusyState() {
      var loading = document.getElementById('loadingContainer');
      if (loading) {
        loading.textContent = 'Loading…';
      }
    }
    
    function startNewWeek() {
      showStyledConfirm('Start a new week?\\n\\nThis will create a new week sheet.', 'Start New Week', '📅', function() {
        showBusyState('Creating new week… (can take up to a minute)');

        var finished = false;
        var watchdog = setTimeout(function() {
          if (finished) return;
          var loading = document.getElementById('loadingContainer');
          if (loading) {
            loading.innerHTML = 'Still creating the week sheet…<br><span style="font-size:13px;color:#666;">Large templates are slow. Wait a bit, or refresh and check the spreadsheet for a new WEEK_ tab.</span>';
          }
        }, 45000);
        
        google.script.run
          .withSuccessHandler(function(result) {
            finished = true;
            clearTimeout(watchdog);
            clearBusyState();
            if (result && result.success) {
              showStyledAlert('New week created: ' + result.weekName, 'success');
              loadStatus();
            } else {
              showStyledAlert((result && result.message) || 'Failed to create week', 'error');
              loadStatus();
            }
          })
          .withFailureHandler(function(error) {
            finished = true;
            clearTimeout(watchdog);
            clearBusyState();
            showStyledAlert((error && error.message) ? error.message : String(error), 'error');
            loadStatus();
          })
          .startNewWeekFromMenu();
      });
    }
    
    function submitWeek() {
      showStyledConfirm('Submit this week for owner approval?\\n\\nYou will not be able to edit it after submission.', 'Submit Week', '📤', function() {
        showBusyState('Submitting week for approval…');
        
        google.script.run
          .withSuccessHandler(function(result) {
            if (result.success) {
              showStyledAlert('Week submitted successfully!\\n\\nWeek: ' + result.weekName, 'success');
              loadStatus();
            } else {
              showStyledAlert(result.message, 'error');
              loadStatus();
            }
          })
          .withFailureHandler(function(error) {
            showStyledAlert(error.message, 'error');
            loadStatus();
          })
          .submitWeekFromMenu();
      });
    }
    
    function showStyledAlert(message, type = 'success', title = '') {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
      };
      
      document.getElementById('alertIcon').textContent = icons[type] || '✅';
      document.getElementById('alertTitle').textContent = title || titles[type] || 'Notice';
      document.getElementById('alertMessage').textContent = message;
      
      const btn = document.getElementById('alertButton');
      btn.className = 'modal-button ' + type;
      
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
      
      // Swap whatever is currently in the button row (single OK button OR a previous confirm-buttons block) for the confirm/cancel pair. Robust to either starting state.
      var existing = document.getElementById('alertButton') || document.getElementById('confirmButtons');
      var confirmHtml = '<div id="confirmButtons" class="confirm-buttons"><button class="modal-button cancel" onclick="handleConfirmNo()">Cancel</button><button class="modal-button" onclick="handleConfirmYes()">Confirm</button></div>';
      if (existing) {
        existing.outerHTML = confirmHtml;
      } else {
        // Neither element present — last-resort fallback: inject into modal-box directly.
        var box = document.querySelector('#styledAlert .modal-box');
        if (box) box.insertAdjacentHTML('beforeend', confirmHtml);
      }
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
<!-- Styled Alert Modal -->
<div class="modal-overlay" id="styledAlert">
  <div class="modal-box">
    <div class="modal-icon" id="alertIcon">✅</div>
    <div class="modal-title" id="alertTitle">Success</div>
    <div class="modal-message" id="alertMessage">Operation completed successfully.</div>
    <button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>
  </div>
</div>
<script>
    // Mobile scroll fix for Google Apps Script iframe
    (function() {
      document.addEventListener("touchmove", function(e) {}, { passive: true });
      document.body.style.overflowY = "scroll";
      document.body.style.webkitOverflowScrolling = "touch";
      document.body.style.height = "auto";
      document.documentElement.style.height = "auto";
      document.documentElement.style.overflow = "auto";
    })();
</script>

<script>
  try {
    if (window.self !== window.top) {
      document.documentElement.classList.add('iframed');
    }
  } catch (e) {
    document.documentElement.classList.add('iframed');
  }
</script>

</body>
</html>`;

const OWNER_MENU_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
  /* ============================================================
     OWNER MENU — v5 PAINT DESIGN (mirrors manager hub)
     ============================================================ */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --paint: __PAINT__;
    --paint-deep: __PAINT_DEEP__;
    --paint-pale: __PAINT_PALE__;
    --paint-wash: __PAINT_WASH__;
    --ink: #1A1814;
    --ink-soft: #4a4640;
    --line: #e5e0d4;
    --white-warm: #FBF8F2;
    --serif: 'Newsreader', Georgia, serif;
    --sans: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', Menlo, Courier, monospace;
    --r: 12px;
    --r-sm: 8px;
    --s2: 8px;  --s3: 12px;  --s4: 16px;  --s5: 22px;  --s6: 28px;  --s7: 40px;
  }

  html, body { height: auto; min-height: 100vh; }
  body {
    font-family: var(--sans);
    background: var(--white-warm);
    color: var(--ink);
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  /* ---------- Painted strip header ---------- */
  .ps-header {
    background: var(--paint);
    border-bottom: 1px solid var(--paint-deep);
    padding: 14px 20px;
  }
  .ps-header-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .ps-venue-eyebrow {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .ps-venue-name {
    font-family: var(--serif);
    font-weight: 500;
    font-size: 22px;
    line-height: 1.1;
    color: var(--ink);
  }
  .ps-user-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--ink);
    color: var(--paint);
    padding: 8px 14px 8px 8px;
    border: 0;
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .ps-user-pill:hover { background: #000; }
  .ps-user-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--paint);
    color: var(--ink);
    font-size: 13px;
  }

  /* ---------- Layout ---------- */
  .owner-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px 20px 40px;
  }

  /* ---------- Hero card (pending queue) ---------- */
  .owner-hero {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: 14px;
    padding: 28px 26px;
    margin-bottom: 16px;
  }
  .owner-hero-eyebrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-soft);
    font-weight: 700;
  }
  .owner-hero-tag {
    padding: 4px 10px;
    background: var(--ink);
    color: var(--paint);
    border-radius: 999px;
    font-size: 10px;
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  .owner-hero-title {
    font-family: var(--serif);
    font-weight: 500;
    font-size: 30px;
    line-height: 1.1;
    margin-top: 8px;
    color: var(--ink);
  }
  .owner-hero-subtitle {
    font-size: 13px;
    color: var(--ink-soft);
    margin-top: 4px;
  }
  .owner-hero-divider {
    height: 1px;
    background: var(--paint-pale);
    margin: 20px 0 14px;
  }
  .pending-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pending-chip {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 14px;
    background: var(--ink);
    color: var(--paint);
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    font-family: var(--sans);
    transition: transform 0.1s, background 0.15s;
    min-width: 92px;
  }
  .pending-chip:hover { background: #000; transform: translateY(-1px); }
  .pending-chip-label {
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--paint-pale);
    font-weight: 700;
  }
  .pending-chip-date {
    font-family: var(--serif);
    font-size: 15px;
    font-weight: 500;
    margin-top: 2px;
  }
  .pending-chip-name {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    color: var(--paint-pale);
    margin-top: 2px;
  }
  .pending-empty {
    text-align: center;
    padding: 20px 0 4px;
    color: var(--ink-soft);
    font-size: 13px;
  }
  .pending-empty .icon { font-size: 24px; display: block; margin-bottom: 6px; }

  /* ---------- Figures grid ---------- */
  .figures-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .figure-card {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 18px 18px;
  }
  .figure-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-soft);
    font-weight: 700;
  }
  .figure-value {
    font-family: var(--serif);
    font-weight: 500;
    font-size: 28px;
    color: var(--ink);
    margin-top: 8px;
    line-height: 1;
  }
  .figure-meta {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 4px;
  }

  /* ---------- Approved (Ready for Xero) list ---------- */
  .section-block { margin-top: 24px; }
  .section-title {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .section-count-pill {
    background: var(--ink);
    color: var(--paint);
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    letter-spacing: 0.06em;
  }
  .approved-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .approved-row {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
  }
  .approved-row.queued { opacity: 0.55; }
  .approved-info-name {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--ink-soft);
  }
  .approved-info-date {
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 500;
    color: var(--ink);
    margin-top: 2px;
  }
  .approved-info-status {
    margin-top: 4px;
    font-size: 11px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .approved-info-status.queued { color: #ad8a3e; }
  .approved-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .approved-btn {
    background: var(--ink);
    color: var(--paint);
    border: 0;
    padding: 9px 14px;
    border-radius: var(--r-sm);
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  .approved-btn:hover { background: #000; }
  .approved-btn.secondary {
    background: var(--white-warm);
    color: var(--ink);
    border: 1px solid var(--ink);
  }
  .approved-btn.secondary:hover { background: var(--paint-wash); }
  .approved-btn.banking-done {
    background: var(--paint-wash);
    color: var(--ink);
    border: 1px solid var(--paint-pale);
    cursor: not-allowed;
  }
  .approved-btn:disabled, .approved-btn.disabled {
    background: var(--line);
    color: var(--ink-soft);
    cursor: not-allowed;
  }
  .approved-empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--ink-soft);
    background: var(--white-warm);
    border: 1px dashed var(--line);
    border-radius: var(--r);
    font-size: 13px;
  }
  .approved-empty .icon { font-size: 22px; display: block; margin-bottom: 6px; }

  /* ---------- Records grid (2x2) ---------- */
  .records-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 24px;
  }
  .record-card {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 16px 18px;
    text-align: left;
    cursor: pointer;
    font-family: var(--sans);
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .record-card:hover { border-color: var(--ink); background: var(--paint-wash); }
  .record-icon {
    width: 18px;
    height: 18px;
    color: var(--ink);
    flex-shrink: 0;
  }
  .record-text { flex: 1; }
  .record-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
  }
  .record-meta {
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 2px;
  }

  /* ---------- Archive drawer ---------- */
  .archive-drawer {
    margin-top: 24px;
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 16px 18px;
  }
  .archive-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .archive-close {
    background: transparent;
    border: 0;
    color: var(--ink-soft);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 6px;
  }
  .archive-close:hover { color: var(--ink); background: var(--paint-wash); }
  .archive-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 60vh;
    overflow-y: auto;
  }
  .archive-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
  }
  .archive-row:hover { background: var(--paint-wash); }
  .archive-row-name {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .archive-row-date {
    font-family: var(--serif);
    font-size: 14px;
    color: var(--ink);
  }
  .archive-row-btn {
    background: var(--white-warm);
    color: var(--ink);
    border: 1px solid var(--ink);
    padding: 7px 12px;
    border-radius: var(--r-sm);
    font-family: var(--sans);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .archive-row-btn:hover { background: var(--paint-wash); }

  /* ---------- Loading + skeletons ---------- */
  .loading-block {
    padding: 32px 16px;
    text-align: center;
    color: var(--ink-soft);
    font-size: 13px;
  }
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--paint-pale);
    border-top-color: var(--paint-deep);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ---------- Modals (tab anchor + styled alert) ---------- */
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(26, 24, 20, 0.6);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal-overlay.show { display: flex; }
  .modal-box {
    background: var(--white-warm);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 28px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    text-align: center;
  }
  .modal-box.left { text-align: left; }
  .modal-icon { font-size: 36px; margin-bottom: 8px; }
  .modal-title {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 8px;
  }
  .modal-message {
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.55;
    margin-bottom: 20px;
  }
  .modal-button {
    background: var(--ink);
    color: var(--paint);
    border: 0;
    padding: 11px 28px;
    border-radius: var(--r-sm);
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .modal-button:hover { background: #000; }
  .modal-button.cancel {
    background: var(--white-warm);
    color: var(--ink);
    border: 1px solid var(--line);
  }
  .modal-button.cancel:hover { background: var(--paint-wash); }
  .modal-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  /* Tab anchor form */
  .form-group { margin-bottom: 14px; text-align: left; }
  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    font-family: var(--sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--white-warm);
  }
  .form-input:focus { outline: 0; border-color: var(--ink); }
  textarea.form-input { resize: vertical; min-height: 60px; }
  .anchor-current-banner {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r-sm);
    padding: 12px 14px;
    margin-bottom: 16px;
    text-align: left;
    font-size: 13px;
    color: var(--ink);
  }
  .anchor-current-value {
    font-family: var(--mono);
    font-weight: 700;
    font-size: 16px;
    color: var(--ink);
    display: block;
    margin-top: 2px;
  }
  .confirm-box {
    background: var(--paint-wash);
    border: 1px solid var(--paint-pale);
    border-radius: var(--r-sm);
    padding: 14px 16px;
    margin-bottom: 16px;
    text-align: left;
  }
  .confirm-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
  }
  .confirm-row .label { color: var(--ink-soft); }
  .confirm-row .value { font-family: var(--mono); font-weight: 600; color: var(--ink); }

  /* ---------- Iframe: keep Varlo brand; hide non-Varlo headers only ---------- */
  html.iframed .ps-header:not(.varlo-header) { display: none; }
  html.iframed body { padding-top: 0; }

  /* ---------- Responsive ---------- */
  @media (max-width: 720px) {
    .figures-grid { grid-template-columns: 1fr; }
    .records-grid { grid-template-columns: 1fr; }
    .owner-hero-title { font-size: 24px; }
    .figure-value { font-size: 24px; }
    .owner-main { padding: 16px 14px 32px; }
    .approved-row { grid-template-columns: 1fr; }
    .approved-actions { justify-content: flex-start; }
  }
</style>
__SHARED_STYLES__
</head>
<body class="varlo-shell">
__VARLO_BOOT__
<header class="ps-header varlo-header">
  <div class="ps-header-inner">
    <div class="varlo-brand">
      __VARLO_MARK__
      <div class="varlo-brand-text">
        <div class="varlo-word" aria-label="Varlo">Varlo</div>
        <div class="varlo-word-sub">__VENUE_FULL__ · Owner · <span class="varlo-mode-pip"></span></div>
      </div>
    </div>
    <button class="ps-user-pill" onclick="goToManagerMenu()" aria-label="Switch to manager view">
      <span class="ps-user-avatar">⋯</span>
      <span>Manager</span>
    </button>
  </div>
</header>

<main class="owner-main varlo-fill">
  <div class="varlo-tiles">

  <!-- HERO: pending queue with chips -->
  <section class="owner-hero varlo-tile varlo-tile--hero varlo-tile--span-all">
    <div class="owner-hero-eyebrow">
      <span>Owner Queue</span>
      <span class="owner-hero-tag" id="heroTag" style="display:none;">DRAFT</span>
    </div>
    <h1 class="owner-hero-title" id="heroTitle">Loading…</h1>
    <div class="owner-hero-subtitle" id="heroSubtitle">Checking the queue</div>
    <div class="owner-hero-divider" id="heroDivider" style="display:none;"></div>
    <div class="pending-chips" id="pendingChips"></div>
  </section>

  <!-- FIGURES: pending count · tab balance · ready for xero -->
  <div class="figures-grid varlo-figures-tiles varlo-tile--span-all" style="background:transparent;border:0;margin:0;">
    <div class="figure-card">
      <div class="figure-label">Pending</div>
      <div class="figure-value" id="figPending">—</div>
      <div class="figure-meta">Awaiting review</div>
    </div>
    <div class="figure-card">
      <div class="figure-label">Tab Balance</div>
      <div class="figure-value" id="figTabs">—</div>
      <div class="figure-meta">Running total</div>
    </div>
    <div class="figure-card">
      <div class="figure-label">Ready for Xero</div>
      <div class="figure-value" id="figReady">—</div>
      <div class="figure-meta">Approved · not exported</div>
    </div>
  </div>

  <!-- READY FOR XERO list -->
  <section class="section-block varlo-tile varlo-tile--span-all" id="approvedSection" style="margin:0;">
    <div class="section-title">
      <span>Ready for Xero</span>
      <span class="section-count-pill" id="approvedCount">0</span>
    </div>
    <div class="approved-list" id="approvedList">
      <div class="loading-block"><div class="spinner"></div>Loading…</div>
    </div>
  </section>

  <!-- RECORDS grid -->
  <div class="records-grid varlo-action-tiles varlo-tile--span-all" style="margin:0;background:transparent;border:0;">
    <button type="button" class="record-card" onclick="openTabAnchorModal()">
      <svg class="record-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
      <div class="record-text">
        <div class="record-title">Tab anchor</div>
        <div class="record-meta">Adjust running total</div>
      </div>
    </button>
    <button type="button" class="record-card" onclick="toggleArchive()">
      <svg class="record-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
      <div class="record-text">
        <div class="record-title">View archive</div>
        <div class="record-meta" id="archiveMeta">— exported weeks</div>
      </div>
    </button>
  </div>

  <!-- ARCHIVE drawer (hidden until toggled) -->
  <section class="archive-drawer varlo-tile varlo-tile--span-all" id="archiveDrawer" style="display:none;margin:0;">
    <div class="archive-drawer-header">
      <div class="section-title" style="margin:0; font-size: 17px;">
        Archive <span class="section-count-pill" id="archiveCountPill">0</span>
      </div>
      <button class="archive-close" onclick="toggleArchive()">Hide</button>
    </div>
    <div class="archive-list" id="archiveList"></div>
  </section>

  </div>
</main>

<!-- ===================== TAB ANCHOR MODAL ===================== -->
<div class="modal-overlay" id="tabAnchorModal">
  <div class="modal-box left">
    <!-- Step 1: entry -->
    <div id="tabAnchorEntry">
      <div class="modal-title">⚓ Set Tab Book Anchor</div>
      <div class="modal-message">
        Use this when the system's running tab total has drifted from the real tab book.
        From this date forward, the running total = this amount + every weekly tab change since.
      </div>
      <div class="anchor-current-banner">
        Current running tab total:
        <span class="anchor-current-value" id="tabAnchorCurrent">…</span>
      </div>
      <div class="form-group">
        <label class="form-label">Anchor Date</label>
        <input type="date" id="tabAnchorDate" class="form-input">
      </div>
      <div class="form-group">
        <label class="form-label">Anchor Amount (£)</label>
        <input type="number" step="0.01" id="tabAnchorAmount" placeholder="0.00" class="form-input">
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <textarea id="tabAnchorNotes" class="form-input" placeholder="e.g. verified against tab book on Saturday"></textarea>
      </div>
      <div class="modal-buttons">
        <button class="modal-button cancel" onclick="closeTabAnchorModal()">Cancel</button>
        <button class="modal-button" onclick="tabAnchorGoToConfirm()">Continue</button>
      </div>
    </div>

    <!-- Step 2: confirm -->
    <div id="tabAnchorConfirm" style="display:none;">
      <div class="modal-title">Confirm Anchor</div>
      <div class="modal-message">Please review before applying.</div>
      <div class="confirm-box">
        <div class="confirm-row"><span class="label">Date</span><span class="value" id="confirmAnchorDate">—</span></div>
        <div class="confirm-row"><span class="label">Amount</span><span class="value" id="confirmAnchorAmount">—</span></div>
        <div class="confirm-row"><span class="label">Current total</span><span class="value" id="confirmAnchorCurrent">—</span></div>
      </div>
      <div class="modal-buttons">
        <button class="modal-button cancel" onclick="tabAnchorGoBack()">Back</button>
        <button class="modal-button" onclick="tabAnchorSubmit()">Apply Anchor</button>
      </div>
    </div>

    <!-- Step 3: done -->
    <div id="tabAnchorDone" style="display:none;">
      <div class="modal-icon">✅</div>
      <div class="modal-title">Anchor Set</div>
      <div class="modal-message" id="tabAnchorDoneMessage">New running total: <strong id="tabAnchorNewTotal">—</strong></div>
      <div class="modal-buttons">
        <button class="modal-button" onclick="tabAnchorDoneClick()">Done</button>
      </div>
    </div>
  </div>
</div>

<!-- ===================== STYLED ALERT MODAL ===================== -->
<div class="modal-overlay" id="styledAlert">
  <div class="modal-box">
    <div class="modal-icon" id="alertIcon">✅</div>
    <div class="modal-title" id="alertTitle">Success</div>
    <div class="modal-message" id="alertMessage">Operation completed.</div>
    <div class="modal-buttons" id="alertButtons">
      <button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>
    </div>
  </div>
</div>

<script>
  // ---------------- iframe detection ----------------
  if (window.self !== window.top) {
    document.documentElement.classList.add('iframed');
  }

  // ---------------- web app URL (postMessage navigation) ----------------
  var webAppUrl = '';
  google.script.run
    .withSuccessHandler(function(url) { webAppUrl = url; })
    .withFailureHandler(function() {})
    .getWebAppUrl();

  function navigateApp(queryString) {
    if (!webAppUrl) {
      showStyledAlert('Still loading, please try again', 'Loading', '⏳');
      return;
    }
    var fullUrl = webAppUrl + queryString;
    var iframed = false;
    try { iframed = window.self !== window.top; } catch (e) { iframed = true; }
    try { window.top.postMessage({ type: 'navigate', url: fullUrl }, '*'); } catch (e) {}
    // Inside the owner/manager portal iframe, parent sets iframe.src.
    // Navigating here too reloads inside HtmlService sandbox and drops ?week=.
    if (!iframed) {
      setTimeout(function() { window.location.href = fullUrl; }, 300);
    }
  }
  function goToManagerMenu() {
    navigateApp('');
  }
  function viewAllWeeks() {
    navigateApp('?page=weeklist');
  }

  // ---------------- state ----------------
  var currentTabBalance = null;
  var allWeeksData = [];

  // ---------------- entry point ----------------
  window.onload = function() {
    loadWeeks();
    loadTabBalance();
  };

  function loadWeeks() {
    google.script.run
      .withSuccessHandler(function(weeks) {
        allWeeksData = weeks || [];
        renderAll();
      })
      .withFailureHandler(function(error) {
        document.getElementById('heroTitle').textContent = 'Error loading queue';
        document.getElementById('heroSubtitle').textContent = error.message || '';
        document.getElementById('approvedList').innerHTML = '<div class="approved-empty"><span class="icon">⚠️</span>' + (error.message || 'Unknown error') + '</div>';
      })
      .getOwnerWeeksStatus();
  }

  function loadTabBalance() {
    google.script.run
      .withSuccessHandler(function(amount) {
        currentTabBalance = (typeof amount === 'number') ? amount : 0;
        document.getElementById('figTabs').textContent = formatMoney(currentTabBalance);
      })
      .withFailureHandler(function() {
        document.getElementById('figTabs').textContent = '—';
      })
      .getCurrentRunningTabsForDialog();
  }

  // ---------------- render ----------------
  function renderAll() {
    var pending = allWeeksData.filter(function(w) { return w.status === 'SUBMITTED'; });
    var approved = allWeeksData.filter(function(w) { return w.status === 'APPROVED' && !w.xeroExported; });
    var completed = allWeeksData.filter(function(w) { return w.status === 'APPROVED' && w.xeroExported; });

    // Sort approved by date (oldest first — sequential workflow)
    approved.sort(function(a, b) { return (a.weekEndingDate || 0) - (b.weekEndingDate || 0); });
    // Sort completed by date (newest first)
    completed.sort(function(a, b) { return (b.weekEndingDate || 0) - (a.weekEndingDate || 0); });
    // Sort pending by date (oldest first)
    pending.sort(function(a, b) { return (a.weekEndingDate || 0) - (b.weekEndingDate || 0); });

    renderHero(pending);
    renderFigures(pending, approved);
    renderApproved(approved);
    renderArchiveCount(completed);
    renderArchiveList(completed);
  }

  function renderHero(pending) {
    var titleEl = document.getElementById('heroTitle');
    var subtitleEl = document.getElementById('heroSubtitle');
    var dividerEl = document.getElementById('heroDivider');
    var chipsEl = document.getElementById('pendingChips');
    var tagEl = document.getElementById('heroTag');

    if (pending.length === 0) {
      titleEl.textContent = 'All caught up';
      subtitleEl.textContent = 'No weeks awaiting review';
      dividerEl.style.display = 'block';
      chipsEl.innerHTML = '<div class="pending-empty"><span class="icon">✨</span>You\\'re clear — nothing pending.</div>';
      tagEl.style.display = 'none';
      return;
    }

    titleEl.textContent = pending.length === 1 ? '1 week awaiting review' : pending.length + ' weeks awaiting review';
    subtitleEl.textContent = 'Tap a chip to open the review screen';
    dividerEl.style.display = 'block';
    tagEl.style.display = 'inline-block';
    tagEl.textContent = pending.length + ' PENDING';

    var html = '';
    for (var i = 0; i < pending.length; i++) {
      var w = pending[i];
      var dateLabel = formatChipDate(w.weekEndingDate);
      html += '<button type="button" class="pending-chip" onclick="viewWeekReview(\\'' + escapeAttr(w.weekSheet) + '\\')">' +
                '<span class="pending-chip-label">W/E</span>' +
                '<span class="pending-chip-date">' + dateLabel + '</span>' +
                '<span class="pending-chip-name">' + escapeHtml(w.weekSheet) + '</span>' +
              '</button>';
    }
    chipsEl.innerHTML = html;
  }

  function renderFigures(pending, approved) {
    document.getElementById('figPending').textContent = String(pending.length);
    document.getElementById('figReady').textContent = String(approved.length);
    // Tab balance is loaded separately by loadTabBalance()
  }

  function renderApproved(approved) {
    document.getElementById('approvedCount').textContent = approved.length;
    var listEl = document.getElementById('approvedList');

    if (approved.length === 0) {
      listEl.innerHTML = '<div class="approved-empty"><span class="icon">📭</span>No approved weeks waiting for Xero export.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < approved.length; i++) {
      var w = approved[i];
      var isFirstInQueue = (i === 0);
      var isBankingComplete = w.bankingComplete || false;
      var dateLabel = w.weekEnding || '—';

      html += '<div class="approved-row' + (isFirstInQueue ? '' : ' queued') + '">';
      html +=   '<div>';
      html +=     '<div class="approved-info-name">' + escapeHtml(w.weekSheet) + '</div>';
      html +=     '<div class="approved-info-date">' + escapeHtml(dateLabel) + '</div>';
      if (!isFirstInQueue) {
        html += '<div class="approved-info-status queued">Queued — process earlier weeks first</div>';
      } else if (!isBankingComplete) {
        html += '<div class="approved-info-status">Banking not yet entered</div>';
      } else {
        html += '<div class="approved-info-status">Ready to export</div>';
      }
      html +=   '</div>';
      html +=   '<div class="approved-actions">';
      // Banking
      if (isBankingComplete) {
        html += '<button class="approved-btn banking-done" disabled title="Banking already saved">Banking ✓</button>';
      } else {
        html += '<button class="approved-btn secondary" onclick="viewMaster(\\'' + escapeAttr(w.weekSheet) + '\\')">Banking</button>';
      }
      // Manager Summary
      html += '<button class="approved-btn secondary" onclick="viewReport(\\'' + escapeAttr(w.weekSheet) + '\\')">Manager Summary</button>';
      // Export
      if (!isFirstInQueue) {
        html += '<button class="approved-btn disabled" disabled title="Complete previous week first">CSV &amp; Xero</button>';
      } else if (!isBankingComplete) {
        html += '<button class="approved-btn disabled" disabled title="Enter banking first">CSV &amp; Xero</button>';
      } else {
        html += '<button class="approved-btn" onclick="exportCSVAndXero(\\'' + escapeAttr(w.weekSheet) + '\\')">CSV &amp; Xero</button>';
      }
      html +=   '</div>';
      html += '</div>';
    }
    listEl.innerHTML = html;
  }

  function renderArchiveCount(completed) {
    var n = completed.length;
    document.getElementById('archiveMeta').textContent = n + ' exported week' + (n === 1 ? '' : 's');
    document.getElementById('archiveCountPill').textContent = n;
  }

  function renderArchiveList(completed) {
    var listEl = document.getElementById('archiveList');
    if (completed.length === 0) {
      listEl.innerHTML = '<div class="approved-empty" style="border:0; padding:18px 0;"><span class="icon">📋</span>No exported weeks yet.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < completed.length; i++) {
      var w = completed[i];
      html += '<div class="archive-row">';
      html +=   '<span class="archive-row-name">' + escapeHtml(w.weekSheet) + '</span>';
      html +=   '<span class="archive-row-date">' + escapeHtml(w.weekEnding || '—') + '</span>';
      html +=   '<button class="archive-row-btn" onclick="viewReport(\\'' + escapeAttr(w.weekSheet) + '\\')">Manager Summary</button>';
      html += '</div>';
    }
    listEl.innerHTML = html;
  }

  // ---------------- archive toggle ----------------
  function toggleArchive() {
    var drawer = document.getElementById('archiveDrawer');
    if (drawer.style.display === 'none') {
      drawer.style.display = 'block';
      setTimeout(function() {
        drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      drawer.style.display = 'none';
    }
  }

  // ---------------- navigation handlers ----------------
  function viewWeekReview(weekSheet) {
    navigateApp('?page=ownerreview&week=' + encodeURIComponent(weekSheet));
  }
  function viewReport(weekSheet) {
    navigateApp('?page=weekreport&week=' + encodeURIComponent(weekSheet));
  }
  function viewMaster(weekSheet) {
    var masterName = weekSheet.replace('WEEK_', 'WE') + '_MASTER';
    navigateApp('?page=masterview&sheet=' + encodeURIComponent(masterName));
  }

  function exportCSVAndXero(weekSheet) {
    showStyledConfirm(
      'This will create a CSV backup and send all transactions to Xero.\\n\\nMake sure banking details and amounts have been verified.',
      'Export to Xero?',
      '📥',
      function() { runExportCSVAndXero(weekSheet); }
    );
  }

  function runExportCSVAndXero(weekSheet) {
    document.getElementById('approvedList').innerHTML = '<div class="loading-block"><div class="spinner"></div>Exporting CSV & sending to Xero…</div>';

    google.script.run
      .withSuccessHandler(function(result) {
        if (result && result.success && result.xeroSuccess) {
          showStyledAlert('CSV: ' + result.fileName + '\\n' + result.transactionCount + ' transactions sent to Xero.', 'Exported', '✅');
        } else if (result && result.success) {
          showStyledAlert('CSV created but Xero send failed: ' + (result.xeroError || 'unknown error'), 'Partial success', '⚠️');
        } else {
          showStyledAlert((result && result.message) || 'Unknown error', 'Export failed', '❌');
        }
        loadWeeks();
      })
      .withFailureHandler(function(error) {
        showStyledAlert(error.message || 'Server error', 'Export failed', '❌');
        loadWeeks();
      })
      .exportToCSVAndSendToXero(weekSheet.replace('WEEK_', 'WE') + '_MASTER');
  }

  // ---------------- tab anchor modal ----------------
  function openTabAnchorModal() {
    document.getElementById('tabAnchorEntry').style.display = 'block';
    document.getElementById('tabAnchorConfirm').style.display = 'none';
    document.getElementById('tabAnchorDone').style.display = 'none';
    document.getElementById('tabAnchorDate').value = '';
    document.getElementById('tabAnchorAmount').value = '';
    document.getElementById('tabAnchorNotes').value = '';
    document.getElementById('tabAnchorCurrent').textContent = '…';
    document.getElementById('tabAnchorModal').classList.add('show');

    google.script.run
      .withSuccessHandler(function(amount) {
        document.getElementById('tabAnchorCurrent').textContent = formatMoneyDetailed(amount);
      })
      .withFailureHandler(function() {
        document.getElementById('tabAnchorCurrent').textContent = 'Unable to read';
      })
      .getCurrentRunningTabsForDialog();
  }
  function closeTabAnchorModal() {
    document.getElementById('tabAnchorModal').classList.remove('show');
  }
  function tabAnchorGoToConfirm() {
    var dateVal = document.getElementById('tabAnchorDate').value;
    var amountVal = parseFloat(document.getElementById('tabAnchorAmount').value);
    if (!dateVal) { showStyledAlert('Please enter an anchor date.', 'Missing field', '⚠️'); return; }
    if (isNaN(amountVal)) { showStyledAlert('Please enter a valid amount.', 'Missing field', '⚠️'); return; }
    document.getElementById('confirmAnchorDate').textContent = formatDateDisplay(dateVal);
    document.getElementById('confirmAnchorAmount').textContent = formatMoneyDetailed(amountVal);
    document.getElementById('confirmAnchorCurrent').textContent = document.getElementById('tabAnchorCurrent').textContent;
    document.getElementById('tabAnchorEntry').style.display = 'none';
    document.getElementById('tabAnchorConfirm').style.display = 'block';
  }
  function tabAnchorGoBack() {
    document.getElementById('tabAnchorConfirm').style.display = 'none';
    document.getElementById('tabAnchorEntry').style.display = 'block';
  }
  function tabAnchorSubmit() {
    var payload = {
      dateString: document.getElementById('tabAnchorDate').value,
      amount: parseFloat(document.getElementById('tabAnchorAmount').value),
      notes: (document.getElementById('tabAnchorNotes').value || '').trim()
    };
    document.getElementById('tabAnchorConfirm').style.display = 'none';
    document.getElementById('tabAnchorDone').style.display = 'block';
    document.getElementById('tabAnchorDoneMessage').innerHTML = 'Saving…';

    google.script.run
      .withSuccessHandler(function(result) {
        if (result && result.success) {
          document.getElementById('tabAnchorDoneMessage').innerHTML =
            'New running total: <strong>' + formatMoneyDetailed(result.newRunningTotal) + '</strong>';
        } else {
          document.getElementById('tabAnchorDoneMessage').innerHTML =
            'Error: ' + ((result && result.message) || 'Unknown');
        }
      })
      .withFailureHandler(function(err) {
        document.getElementById('tabAnchorDoneMessage').innerHTML = 'Error: ' + (err.message || 'Server error');
      })
      .submitTabAnchor(payload);
  }
  function tabAnchorDoneClick() {
    closeTabAnchorModal();
    loadTabBalance();
  }

  // ---------------- styled alert ----------------
  function showStyledAlert(message, title, icon) {
    document.getElementById('alertIcon').textContent = icon || '✅';
    document.getElementById('alertTitle').textContent = title || 'Notice';
    document.getElementById('alertMessage').innerHTML = String(message || '').replace(/\\n/g, '<br>');
    document.getElementById('alertButtons').innerHTML = '<button class="modal-button" id="alertButton" onclick="closeStyledAlert()">OK</button>';
    document.getElementById('styledAlert').classList.add('show');
  }
  function closeStyledAlert() {
    document.getElementById('styledAlert').classList.remove('show');
  }

  // ---------------- styled confirm ----------------
  var ownerConfirmCallback = null;
  function showStyledConfirm(message, title, icon, onConfirm) {
    document.getElementById('alertIcon').textContent = icon || '❓';
    document.getElementById('alertTitle').textContent = title || 'Confirm';
    document.getElementById('alertMessage').innerHTML = String(message || '').replace(/\\n/g, '<br>');
    document.getElementById('alertButtons').innerHTML =
      '<button class="modal-button cancel" onclick="handleOwnerConfirmNo()">Cancel</button>' +
      '<button class="modal-button" onclick="handleOwnerConfirmYes()">Confirm</button>';
    ownerConfirmCallback = onConfirm;
    document.getElementById('styledAlert').classList.add('show');
  }
  function handleOwnerConfirmYes() {
    closeStyledAlert();
    if (ownerConfirmCallback) {
      var cb = ownerConfirmCallback;
      ownerConfirmCallback = null;
      cb();
    }
  }
  function handleOwnerConfirmNo() {
    ownerConfirmCallback = null;
    closeStyledAlert();
  }

  // ---------------- formatters & utils ----------------
  function formatMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var abs = Math.abs(n);
    var sign = n < 0 ? '-' : '';
    return sign + '£' + Math.round(abs).toLocaleString('en-GB');
  }
  function formatMoneyDetailed(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var abs = Math.abs(n);
    var sign = n < 0 ? '-' : '';
    return sign + '£' + abs.toFixed(2);
  }
  function formatChipDate(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()];
  }
  function formatDateDisplay(yyyymmdd) {
    if (!yyyymmdd) return '—';
    var parts = yyyymmdd.split('-');
    if (parts.length !== 3) return yyyymmdd;
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (isNaN(d.getTime())) return yyyymmdd;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }
  function escapeAttr(s) {
    return String(s || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
  }
</script>

</body>
</html>`;