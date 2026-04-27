import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MANUAL_CHECKS,
  deviceIssueBody,
  deviceIssueUrl,
  manualCheckScore,
  reportFilename,
  type DeviceVerificationReport,
} from './report';

const report: DeviceVerificationReport = {
  runtime: {
    generatedAt: '2026-04-27T03:00:00.000Z',
    url: 'https://byteworthyllc.github.io/vqol/#/device',
    userAgent: 'Example Browser/1.0',
    language: 'en-US',
    viewport: { width: 390, height: 844, devicePixelRatio: 3 },
    displayMode: { standalone: false, browser: true },
    notificationPermission: 'default',
    localStorageWritable: true,
    indexedDbWritable: true,
    offline: {
      online: true,
      serviceWorkerSupported: true,
      serviceWorkerControlled: true,
      cacheNames: ['vqol-cache'],
    },
    offlineReadiness: 100,
  },
  manual: {
    ...DEFAULT_MANUAL_CHECKS,
    nativePrintDialog: true,
    savedPdf: true,
    notes: 'Saved to Files.',
  },
};

describe('device report', () => {
  it('scores manual checks', () => {
    expect(manualCheckScore(DEFAULT_MANUAL_CHECKS)).toBe(0);
    expect(manualCheckScore(report.manual)).toBe(40);
  });

  it('generates a stable filename', () => {
    expect(reportFilename(report)).toBe(
      'vqol-device-verification-2026-04-27-example-browser-1-0.json'
    );
  });

  it('builds a prefilled issue URL', () => {
    const url = deviceIssueUrl(report);
    const params = new URL(url).searchParams;
    expect(url).toContain('https://github.com/ByteWorthyLLC/vqol/issues/new?');
    expect(params.get('body')).toContain('Device verification report');
    expect(params.get('body')).toContain('Saved to Files.');
  });

  it('formats issue body with runtime and manual evidence', () => {
    const body = deviceIssueBody(report);
    expect(body).toContain('Offline readiness: 100%');
    expect(body).toContain('Native print dialog opened: yes');
    expect(body).toContain('Screen-reader navigation checked: no');
  });
});
