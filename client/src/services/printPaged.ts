// The package only exposes its polyfill through condition names, so reference the file as a static asset
const pagedPolyfillUrl = new URL('../../../node_modules/pagedjs/dist/paged.polyfill.min.js', import.meta.url).href;

/**
 * Prints a report element as a real paginated A4 document.
 *
 * Browsers cannot tell a page's content which page number a target landed on, so a table of contents
 * printed straight from the live page cannot carry page numbers. Here the report is first laid out into
 * actual A4 pages by Paged.js inside an isolated, always-light iframe; the TOC rows then resolve
 * `target-counter(...)` against that same pagination, and the browser prints exactly those pages.
 * Internal `#links` stay clickable in the resulting PDF.
 *
 * The iframe never inherits the dark theme: the PDF is the formal light document whatever the site's mode.
 */

/** All page styles, with `@media print` rules made unconditional so layout == print */
function collectPrintCss(): string {
  const out: string[] = [];
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        const media = rule.media.mediaText.toLowerCase();
        if (media.includes('print')) visit(rule.cssRules); // unwrap
        else if (media.includes('screen') && !media.includes('print')) continue; // on-screen only
        else out.push(rule.cssText);
      } else {
        out.push(rule.cssText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // cross-origin sheet (web font CSS) — loaded through <link> below instead
    }
  }
  return out.join('\n');
}

function fontLinks(): string {
  return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .filter((l) => /fonts\.googleapis\.com/.test(l.href))
    .map((l) => `<link rel="stylesheet" href="${l.href}">`)
    .join('');
}

/** Writes each TOC row's real page number, found from where its target ended up in the paginated pages */
function fillTocPageNumbers(doc: Document, arabicDigits: boolean) {
  const toDigits = (n: number) => (arabicDigits ? String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : String(n));
  doc.querySelectorAll<HTMLAnchorElement>('a.toc-row').forEach((a) => {
    const id = (a.getAttribute('href') || '').slice(1);
    // Paged.js may split an element across pages; the first fragment keeps the id
    const target = id ? doc.getElementById(id) : null;
    const pageEl = target?.closest('.pagedjs_page');
    const n = Number(pageEl?.getAttribute('data-page-number'));
    const slot = a.querySelector<HTMLElement>('.toc-pg');
    if (slot && Number.isFinite(n) && n > 0) {
      slot.textContent = toDigits(n);
      slot.dataset.page = String(n);
      slot.classList.add('is-set');
    }
  });
}

export interface PrintPagedOptions {
  title?: string;
  /** Called with a short status while preparing pages */
  onStatus?: (s: string) => void;
}

export async function printPaged(source: HTMLElement, opts: PrintPagedOptions = {}): Promise<void> {
  const dir = source.getAttribute('dir') || document.documentElement.dir || 'rtl';
  const lang = dir === 'rtl' ? 'ar' : 'en';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;height:1123px;border:0;visibility:hidden';
  document.body.appendChild(iframe);

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 500);
  };

  try {
    opts.onStatus?.(lang === 'ar' ? 'جارٍ تقسيم التقرير إلى صفحات…' : 'Paginating the report…');

    const done = new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('pagination timeout')), 90000);
      (window as any).__coopPagedDone = () => {
        window.clearTimeout(timer);
        resolve();
      };
    });

    const footer = lang === 'ar' ? 'صفحة' : 'Page';
    const html = `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><title>${(opts.title || document.title).replace(/</g, '&lt;')}</title>
${fontLinks()}
<style>${collectPrintCss()}</style>
<style>
  @page { size: A4; margin: 16mm 15mm 18mm 15mm; @bottom-center { content: "${footer} " counter(page); font: 9pt Tajawal, Arial, sans-serif; color: #475569; } }
  @page :first { @bottom-center { content: none; } }
  html, body { background: #fff !important; color: #0f172a; margin: 0; }
  body { font-family: Tajawal, Arial, sans-serif; }
  .toc-pg { display: inline-block; flex-shrink: 0; min-width: 2.2em; text-align: end; font-weight: 800; font-variant-numeric: tabular-nums; visibility: hidden; }
  .toc-pg.is-set { visibility: visible; }
</style>
<script>window.PagedConfig = { auto: true, after: function () { try { parent.__coopPagedDone(); } catch (e) {} } };<\/script>
</head><body>${source.outerHTML}<script src="${new URL(pagedPolyfillUrl, window.location.href).href}"><\/script></body></html>`;

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    await done;
    fillTocPageNumbers(doc, lang === 'ar');
    await (doc as any).fonts?.ready;
    opts.onStatus?.('');

    // Diagnostics / automated checks: hand the paginated document over instead of opening the print dialog
    const hook = (window as any).__coopPrintHook as undefined | ((html: string) => void);
    if (hook) {
      hook(doc.documentElement.outerHTML);
      return;
    }

    const win = iframe.contentWindow!;
    await new Promise<void>((resolve) => {
      win.addEventListener('afterprint', () => resolve(), { once: true });
      win.focus();
      win.print();
      // Some browsers do not fire afterprint for iframes; do not keep the frame forever
      window.setTimeout(resolve, 120000);
    });
  } finally {
    delete (window as any).__coopPagedDone;
    cleanup();
  }
}
