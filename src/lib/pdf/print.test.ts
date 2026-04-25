import { describe, it, expect, beforeEach } from 'vitest';
import { printScoreReport } from './print';

beforeEach(() => {
  document.body.className = '';
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

describe('printScoreReport', () => {
  it('toggles is-printing class on body and calls printer', () => {
    let called = 0;
    printScoreReport({
      chartDataUrl: null,
      injectionTarget: null,
      printer: () => { called += 1; },
    });
    expect(called).toBe(1);
    expect(document.body.classList.contains('is-printing')).toBe(false);
  });

  it('injects chart <img> when dataUrl + target provided', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    printScoreReport({
      chartDataUrl: 'data:image/png;base64,xxx',
      injectionTarget: target,
      printer: () => {
        const img = target.querySelector('#print-injected-chart') as HTMLImageElement | null;
        expect(img).not.toBeNull();
        expect(img?.src).toContain('data:image/png');
      },
    });
    expect(target.querySelector('#print-injected-chart')).toBeNull();
  });

  it('skips injection when dataUrl is null (canvas was unavailable)', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    printScoreReport({
      chartDataUrl: null,
      injectionTarget: target,
      printer: () => {
        expect(target.querySelector('#print-injected-chart')).toBeNull();
      },
    });
  });
});
