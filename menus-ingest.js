/* Read a whole menu from a PDF or image (browser-side).
   PDFs: extract text with pdf.js. Images: OCR with Tesseract.
   Then staff parsePaste turns the text into dishes. */
(function (root) {
  'use strict';

  var PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
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
      // Skip allergy / key footers that pollute dish lists
      if (/please inform us of any allergies/i.test(line)) continue;
      if (/^gf\s*[–-].*vegetarian/i.test(line)) continue;
      if (/bolney\s*[·•-]\s*west sussex/i.test(line)) continue;
      if (/^the eight bells$/i.test(line)) continue;
      if (/^week of\b/i.test(line)) continue;
      if (/^all\s+\d+\.\d{2}$/i.test(line)) continue;

      // Price alone on a line → stick onto previous dish name
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

  function readImage(file, onProgress) {
    return ensureTesseract().then(function (Tesseract) {
      if (onProgress) onProgress('Reading image (OCR)… first time may take a moment');
      return Tesseract.recognize(file, 'eng', {
        logger: function (m) {
          if (!onProgress || !m || !m.status) return;
          if (m.status === 'recognizing text' && m.progress != null) {
            onProgress('Reading image… ' + Math.round(m.progress * 100) + '%');
          } else if (m.status) {
            onProgress(m.status + (m.progress != null ? ' ' + Math.round(m.progress * 100) + '%' : ''));
          }
        }
      }).then(function (result) {
        return (result && result.data && result.data.text) || '';
      });
    });
  }

  function readFile(file, onProgress) {
    if (!file) return Promise.reject(new Error('No file chosen'));
    var type = (file.type || '').toLowerCase();
    var name = (file.name || '').toLowerCase();
    var isPdf = type === 'application/pdf' || /\.pdf$/.test(name);
    var isImage = /^image\//.test(type) || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name);

    var job = isPdf ? readPdf(file, onProgress)
      : isImage ? readImage(file, onProgress)
      : Promise.reject(new Error('Use a PDF or an image (PNG, JPG, WebP).'));

    return job.then(function (raw) {
      var text = cleanExtractedText(raw);
      if (!text) throw new Error('No readable text found in that file.');
      var dishes = root.EBMenus ? root.EBMenus.parsePaste(text) : [];
      return { text: text, dishes: dishes, source: isPdf ? 'pdf' : 'image', fileName: file.name || '' };
    });
  }

  root.EBMenuIngest = {
    readFile: readFile,
    cleanExtractedText: cleanExtractedText
  };
})(typeof window !== 'undefined' ? window : global);
