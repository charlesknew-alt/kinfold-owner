/* Read a whole menu from PDF / image / Word (.docx).
   Prefer Gemini via Apps Script (AI credits) when an AI reader URL is set.
   Otherwise fall back to PDF text / Tesseract OCR / mammoth — always review before save. */
(function (root) {
  'use strict';

  var PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  var MAMMOTH_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
  var AI_URL_KEY = 'eb-menu-ai-url';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (typeof document === 'undefined') {
        reject(new Error('No document'));
        return;
      }
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ensurePdfJs() {
    if (root.pdfjsLib) {
      root.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return Promise.resolve(root.pdfjsLib);
    }
    return loadScript(PDFJS_URL).then(function () {
      if (!root.pdfjsLib) throw new Error('PDF library did not load');
      root.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      return root.pdfjsLib;
    });
  }

  function ensureTesseract() {
    if (root.Tesseract) return Promise.resolve(root.Tesseract);
    return loadScript(TESSERACT_URL).then(function () {
      if (!root.Tesseract) throw new Error('OCR library did not load');
      return root.Tesseract;
    });
  }

  function ensureMammoth() {
    if (root.mammoth) return Promise.resolve(root.mammoth);
    return loadScript(MAMMOTH_URL).then(function () {
      if (!root.mammoth) throw new Error('Word reader did not load');
      return root.mammoth;
    });
  }

  function getAiUrl() {
    try {
      return String(localStorage.getItem(AI_URL_KEY) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setAiUrl(url) {
    try {
      if (url) localStorage.setItem(AI_URL_KEY, String(url).trim());
      else localStorage.removeItem(AI_URL_KEY);
    } catch (e) {}
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('Could not read file')); };
      reader.readAsDataURL(file);
    });
  }

  /** Tidies PDF/OCR text so parsePaste can read headings, prices, descriptions. */
  function cleanExtractedText(raw) {
    var lines = String(raw || '')
      .replace(/\r/g, '\n')
      .replace(/\u00a0/g, ' ')
      .split('\n')
      .map(function (l) { return l.replace(/[ \t]+/g, ' ').trim(); });

    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line) {
        if (out.length && out[out.length - 1] !== '') out.push('');
        continue;
      }
      if (/please inform us of any allergies/i.test(line)) continue;
      if (/^gf\s*[–-].*vegetarian/i.test(line)) continue;
      if (/bolney\s*[·•-]\s*west sussex/i.test(line)) continue;
      if (/bolney\s*[·•-]\s*est\.?\s*1740/i.test(line)) continue;
      if (/^the eight bells$/i.test(line)) continue;
      if (/^week of\b/i.test(line)) continue;
      if (/^all\s+\d+\.\d{2}$/i.test(line)) continue;
      if (/email choices to/i.test(line)) continue;
      if (/deposit per person/i.test(line)) continue;
      if (/^[^\w£]{1,4}$/.test(line)) continue;

      if (/^(?:£\s*)?\d+\.\d{2}(?:\s*\/\s*(?:£\s*)?\d+\.\d{2})?$/.test(line) && out.length) {
        var prev = out[out.length - 1];
        if (!/(?:£\s*)?\d+\.\d{2}\s*$/.test(prev)) {
          out[out.length - 1] = prev + ' ' + line.replace(/£/g, '').trim();
          continue;
        }
      }
      out.push(line);
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function readPdf(file, onProgress) {
    return ensurePdfJs().then(function (pdfjsLib) {
      return file.arrayBuffer().then(function (buf) {
        if (onProgress) onProgress('Reading PDF…');
        return pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (pdf) {
        var parts = [];
        var pageNo = 1;
        function next() {
          if (pageNo > pdf.numPages) return Promise.resolve(parts.join('\n'));
          if (onProgress) onProgress('Reading PDF page ' + pageNo + ' of ' + pdf.numPages + '…');
          return pdf.getPage(pageNo).then(function (page) {
            return page.getTextContent().then(function (content) {
              var row = '';
              var lastY = null;
              content.items.forEach(function (item) {
                var y = item.transform ? item.transform[5] : 0;
                if (lastY != null && Math.abs(y - lastY) > 4) {
                  parts.push(row.trim());
                  row = '';
                }
                row += (row && !/\s$/.test(row) ? ' ' : '') + item.str;
                lastY = y;
              });
              if (row.trim()) parts.push(row.trim());
              parts.push('');
              pageNo += 1;
              return next();
            });
          });
        }
        return next();
      });
    });
  }

  function readImageOcr(file, onProgress) {
    return ensureTesseract().then(function (Tesseract) {
      if (onProgress) onProgress('OCR only (no AI URL) — results need careful review…');
      return Tesseract.recognize(file, 'eng', {
        logger: function (m) {
          if (!onProgress || !m || !m.status) return;
          if (m.status === 'recognizing text' && m.progress != null) {
            onProgress('OCR… ' + Math.round(m.progress * 100) + '%');
          }
        }
      }).then(function (result) {
        return (result && result.data && result.data.text) || '';
      });
    });
  }

  /** Word .docx → plain text via mammoth (legacy .doc must be re-saved as .docx). */
  function readDocx(file, onProgress) {
    return ensureMammoth().then(function (mammoth) {
      if (onProgress) onProgress('Reading Word document…');
      return file.arrayBuffer().then(function (buf) {
        return mammoth.extractRawText({ arrayBuffer: buf });
      }).then(function (result) {
        return (result && result.value) || '';
      });
    });
  }

  function readWithAi(file, onProgress) {
    var url = getAiUrl();
    if (!url) return Promise.reject(new Error('No AI reader URL'));
    if (onProgress) onProgress('Sending to AI reader (uses Gemini credits)…');
    return fileToDataUrl(file).then(function (dataUrl) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: file.type || 'image/jpeg',
          fileName: file.name || ''
        })
      });
    }).then(function (res) {
      return res.text().then(function (t) {
        var data;
        try { data = JSON.parse(t); } catch (e) {
          throw new Error('AI reader returned a non-JSON response. Check the Apps Script deploy.');
        }
        if (!data.ok) throw new Error(data.error || 'AI reader failed');
        return data;
      });
    });
  }

  /** Ask Gemini to sense-check page balance before print (needs AI reader URL + redeployed script). */
  function reviewLayout(layoutSummary, onProgress) {
    var url = getAiUrl();
    if (!url) return Promise.resolve(null);
    if (onProgress) onProgress('Gemini checking page balance…');
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'reviewLayout',
        layout: layoutSummary || {}
      })
    }).then(function (res) {
      return res.text().then(function (t) {
        var data;
        try { data = JSON.parse(t); } catch (e) { return null; }
        if (!data || !data.ok) return null;
        return data;
      });
    }).catch(function () { return null; });
  }

  function dishesFromText(text) {
    if (!root.EBMenus) return [];
    return root.EBMenus.parsePaste(text).filter(function (d) {
      return !root.EBMenus.isJunkDishName || !root.EBMenus.isJunkDishName(d.name);
    });
  }

  /**
   * @returns {Promise<{
   *   text, dishes, meta, kind, source: 'ai'|'pdf'|'ocr'|'docx',
   *   fileName, needsReview: true, warning?: string
   * }>}
   */
  function readFile(file, onProgress) {
    if (!file) return Promise.reject(new Error('No file chosen'));
    var type = (file.type || '').toLowerCase();
    var name = (file.name || '').toLowerCase();
    var isPdf = type === 'application/pdf' || /\.pdf$/.test(name);
    var isImage = /^image\//.test(type) || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name);
    var isDocx = type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.docx$/.test(name);
    var isLegacyDoc = type === 'application/msword' || (/\.doc$/.test(name) && !/\.docx$/.test(name));
    if (isLegacyDoc) {
      return Promise.reject(new Error('Save the Word file as .docx (File → Save As), then upload again.'));
    }
    if (!isPdf && !isImage && !isDocx) {
      return Promise.reject(new Error('Use a PDF, Word (.docx), or image (PNG, JPG, WebP).'));
    }

    var aiUrl = getAiUrl();
    // Images (and PDFs rendered poorly) → AI when configured
    if (aiUrl && isImage) {
      return readWithAi(file, onProgress).then(function (data) {
        var packed = root.EBMenus.dishesFromAiMenu(data.menu || {});
        var fixes = packed.spellingFixes || [];
        var warn;
        if (!packed.dishes.length) {
          warn = 'AI returned no dishes. Try a clearer photo or paste the text.';
        } else if (fixes.length) {
          warn = 'AI read this image and made ' + fixes.length +
            ' spelling change' + (fixes.length === 1 ? '' : 's') +
            ' — check the list below, then every dish.';
        } else {
          warn = 'AI read this image (no spelling changes reported). Check every dish before you accept.';
        }
        return {
          text: JSON.stringify(data.menu || {}, null, 2),
          dishes: packed.dishes,
          meta: packed.meta,
          kind: packed.kind || (data.menu && data.menu.kind) || '',
          spellingFixes: fixes,
          source: 'ai',
          fileName: file.name || '',
          needsReview: true,
          warning: warn
        };
      });
    }

    var job;
    var source;
    var warning;
    if (isDocx) {
      job = readDocx(file, onProgress);
      source = 'docx';
      warning = 'Word (.docx) text extract — check dishes before accepting.';
    } else if (isPdf) {
      job = readPdf(file, onProgress);
      source = 'pdf';
      warning = 'PDF text extract — check dishes before accepting (not AI).';
    } else {
      job = readImageOcr(file, onProgress);
      source = 'ocr';
      warning = 'OCR only — decorative Christmas art often misreads. Set an AI reader URL for proper extraction.';
    }
    return job.then(function (raw) {
      var text = cleanExtractedText(raw);
      if (!text) throw new Error('No readable text found in that file.');
      var dishes = dishesFromText(text);
      return {
        text: text,
        dishes: dishes,
        meta: root.EBMenus ? root.EBMenus.emptyMeta() : {},
        kind: '',
        spellingFixes: [],
        source: source,
        fileName: file.name || '',
        needsReview: true,
        warning: warning
      };
    });
  }

  root.EBMenuIngest = {
    readFile: readFile,
    cleanExtractedText: cleanExtractedText,
    getAiUrl: getAiUrl,
    setAiUrl: setAiUrl,
    reviewLayout: reviewLayout,
    AI_URL_KEY: AI_URL_KEY
  };
})(typeof window !== 'undefined' ? window : global);
