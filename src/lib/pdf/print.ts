// One-page printable score report — zero bundle cost (uses window.print + @media print).
//
// Critical implementation note: uPlot draws to <canvas>, which iOS Safari does NOT
// reliably print as the canvas element. We work around B-2 (Pitfalls) by snapshotting
// the canvas to a data URL and injecting an <img> into the print template before
// invoking window.print().

const PRINT_BODY_CLASS = 'is-printing';
const INJECTED_IMG_ID = 'print-injected-chart';

export interface PrintScoreReportOptions {
  /** Data URL from canvas.toDataURL('image/png'); pass null when no chart available. */
  chartDataUrl: string | null;
  /** Container element where the injected <img> should be appended for print. */
  injectionTarget?: HTMLElement | null;
  /** Test seam for window.print(). */
  printer?: () => void;
}

export function printScoreReport(opts: PrintScoreReportOptions): void {
  const { chartDataUrl, injectionTarget, printer } = opts;
  const body = document.body;
  let injected: HTMLImageElement | null = null;

  // 1) Inject the canvas snapshot as a real <img> into the print container
  if (chartDataUrl && injectionTarget) {
    injected = document.createElement('img');
    injected.id = INJECTED_IMG_ID;
    injected.src = chartDataUrl;
    injected.alt = 'Score trend chart';
    injected.className = 'print-chart-img';
    injectionTarget.appendChild(injected);
  }

  // 2) Toggle print mode CSS (so @media-print rules cascade alongside .is-printing)
  body.classList.add(PRINT_BODY_CLASS);

  // 3) Trigger the browser print dialog
  const fire = printer ?? (() => window.print());
  try {
    fire();
  } finally {
    // 4) Cleanup synchronously after the dialog returns (afterprint event fires
    // asynchronously on most browsers, so we tear down here as a safety net and
    // also subscribe to afterprint for the dialog-close path)
    cleanup();
  }

  function cleanup(): void {
    body.classList.remove(PRINT_BODY_CLASS);
    if (injected && injected.parentNode) {
      injected.parentNode.removeChild(injected);
    }
  }

  // afterprint fires when the print dialog closes (Chrome/Firefox); iOS Safari is
  // less consistent. The synchronous cleanup above handles iOS; this handles desktop.
  const onAfterPrint = (): void => {
    cleanup();
    window.removeEventListener('afterprint', onAfterPrint);
  };
  window.addEventListener('afterprint', onAfterPrint);
}
