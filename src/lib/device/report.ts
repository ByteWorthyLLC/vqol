import type { OfflineStatus } from '../offline/status';

export interface DeviceRuntimeReport {
  generatedAt: string;
  url: string;
  userAgent: string;
  language: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  displayMode: {
    standalone: boolean;
    browser: boolean;
  };
  notificationPermission: NotificationPermission | 'unsupported';
  localStorageWritable: boolean;
  indexedDbWritable: boolean;
  offline: OfflineStatus;
  offlineReadiness: number;
}

export interface DeviceManualChecks {
  installedToHomeScreen: boolean;
  nativePrintDialog: boolean;
  savedPdf: boolean;
  notificationsPrompted: boolean;
  screenReaderNavigable: boolean;
  notes: string;
}

export interface DeviceVerificationReport {
  runtime: DeviceRuntimeReport;
  manual: DeviceManualChecks;
}

export const DEFAULT_MANUAL_CHECKS: DeviceManualChecks = {
  installedToHomeScreen: false,
  nativePrintDialog: false,
  savedPdf: false,
  notificationsPrompted: false,
  screenReaderNavigable: false,
  notes: '',
};

export function manualCheckScore(checks: DeviceManualChecks): number {
  const keys: (keyof Omit<DeviceManualChecks, 'notes'>)[] = [
    'installedToHomeScreen',
    'nativePrintDialog',
    'savedPdf',
    'notificationsPrompted',
    'screenReaderNavigable',
  ];
  const passed = keys.filter((key) => checks[key]).length;
  return Math.round((passed / keys.length) * 100);
}

export function reportFilename(report: DeviceVerificationReport): string {
  const uaSlug = report.runtime.userAgent
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const date = report.runtime.generatedAt.slice(0, 10);
  return `vqol-device-verification-${date}-${uaSlug || 'browser'}.json`;
}

export function deviceIssueUrl(report: DeviceVerificationReport): string {
  const params = new URLSearchParams({
    title: `Device verification: ${report.runtime.userAgent.slice(0, 80)}`,
    labels: 'device-verification',
    body: deviceIssueBody(report),
  });
  return `https://github.com/ByteWorthyLLC/vqol/issues/new?${params.toString()}`;
}

export function deviceIssueBody(report: DeviceVerificationReport): string {
  return [
    '## Device verification report',
    '',
    `Generated: ${report.runtime.generatedAt}`,
    `URL: ${report.runtime.url}`,
    `User agent: ${report.runtime.userAgent}`,
    `Viewport: ${report.runtime.viewport.width}x${report.runtime.viewport.height} @ ${report.runtime.viewport.devicePixelRatio}x`,
    `Standalone: ${report.runtime.displayMode.standalone ? 'yes' : 'no'}`,
    `Offline readiness: ${report.runtime.offlineReadiness}%`,
    `Notification permission: ${report.runtime.notificationPermission}`,
    `localStorage writable: ${report.runtime.localStorageWritable ? 'yes' : 'no'}`,
    `IndexedDB writable: ${report.runtime.indexedDbWritable ? 'yes' : 'no'}`,
    '',
    '## Manual checks',
    '',
    `- Installed to Home Screen / app launcher: ${report.manual.installedToHomeScreen ? 'yes' : 'no'}`,
    `- Native print dialog opened: ${report.manual.nativePrintDialog ? 'yes' : 'no'}`,
    `- PDF saved or shared successfully: ${report.manual.savedPdf ? 'yes' : 'no'}`,
    `- Notification permission behavior checked: ${report.manual.notificationsPrompted ? 'yes' : 'no'}`,
    `- Screen-reader navigation checked: ${report.manual.screenReaderNavigable ? 'yes' : 'no'}`,
    '',
    '## Notes',
    '',
    report.manual.notes || 'None.',
  ].join('\n');
}
