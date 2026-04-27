<script lang="ts">
  import { onMount } from 'svelte';
  import { downloadTextFile } from '../lib/download/text';
  import { inspectOfflineStatus, offlineReadinessScore } from '../lib/offline/status';
  import { setMeta } from '../lib/storage/db';
  import {
    DEFAULT_MANUAL_CHECKS,
    deviceIssueUrl,
    manualCheckScore,
    reportFilename,
    type DeviceManualChecks,
    type DeviceRuntimeReport,
    type DeviceVerificationReport,
  } from '../lib/device/report';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onback: () => void;
    onresults: () => void;
  }

  let { t, onback, onresults }: Props = $props();

  let runtime = $state<DeviceRuntimeReport | null>(null);
  let manual = $state<DeviceManualChecks>({ ...DEFAULT_MANUAL_CHECKS });
  let status = $state('');

  const report = $derived<DeviceVerificationReport | null>(
    runtime ? { runtime, manual } : null
  );
  const manualScore = $derived(manualCheckScore(manual));

  async function testLocalStorage(): Promise<boolean> {
    try {
      const key = 'vqol_device_lab_probe';
      localStorage.setItem(key, String(Date.now()));
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  async function testIndexedDb(): Promise<boolean> {
    try {
      await setMeta('device_lab_probe', { checkedAt: Date.now() });
      return true;
    } catch {
      return false;
    }
  }

  function displayModeStandalone(): boolean {
    const nav = navigator as Navigator & { standalone?: boolean };
    return matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
  }

  async function runRuntimeChecks(): Promise<void> {
    status = t('device.status.running');
    const offline = await inspectOfflineStatus();
    runtime = {
      generatedAt: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      displayMode: {
        standalone: displayModeStandalone(),
        browser: !displayModeStandalone(),
      },
      notificationPermission:
        'Notification' in window ? Notification.permission : 'unsupported',
      localStorageWritable: await testLocalStorage(),
      indexedDbWritable: await testIndexedDb(),
      offline,
      offlineReadiness: offlineReadinessScore(offline),
    };
    status = t('device.status.done');
  }

  function updateManual(key: keyof Omit<DeviceManualChecks, 'notes'>, value: boolean): void {
    manual = { ...manual, [key]: value };
  }

  function updateNotes(value: string): void {
    manual = { ...manual, notes: value };
  }

  function printProbe(): void {
    manual = { ...manual, nativePrintDialog: true };
    window.print();
  }

  function downloadReport(): void {
    if (!report) return;
    downloadTextFile(
      reportFilename(report),
      `${JSON.stringify(report, null, 2)}\n`,
      'application/json;charset=utf-8'
    );
  }

  async function copyIssue(): Promise<void> {
    if (!report) return;
    if (!navigator.clipboard) {
      status = t('device.status.copyUnavailable');
      return;
    }
    try {
      await navigator.clipboard.writeText(deviceIssueUrl(report));
      status = t('device.status.copied');
    } catch {
      status = t('device.status.copyUnavailable');
    }
  }

  onMount(() => {
    void runRuntimeChecks();
  });
</script>

<section>
  <h1>{t('device.title')}</h1>
  <p>{t('device.body')}</p>

  <div class="score">
    <div>
      <span>{t('device.runtime')}</span>
      <strong>{runtime ? `${runtime.offlineReadiness}%` : '...'}</strong>
    </div>
    <div>
      <span>{t('device.manual')}</span>
      <strong>{manualScore}%</strong>
    </div>
  </div>

  {#if status}
    <p class="muted">{status}</p>
  {/if}

  <div class="actions">
    <button class="primary" onclick={() => { void runRuntimeChecks(); }}>
      {t('device.rerun')}
    </button>
    <button onclick={printProbe}>{t('device.print')}</button>
    <button onclick={onresults}>{t('device.demo')}</button>
  </div>

  {#if runtime}
    <div class="table-wrap">
      <table>
        <caption>{t('device.runtime.caption')}</caption>
        <tbody>
          <tr><th>{t('device.ua')}</th><td>{runtime.userAgent}</td></tr>
          <tr><th>{t('device.viewport')}</th><td>{runtime.viewport.width} x {runtime.viewport.height} @ {runtime.viewport.devicePixelRatio}x</td></tr>
          <tr><th>{t('device.display')}</th><td>{runtime.displayMode.standalone ? t('device.standalone') : t('device.browser')}</td></tr>
          <tr><th>{t('device.storage')}</th><td>{runtime.localStorageWritable ? t('fork.pass') : t('fork.fix')} / {runtime.indexedDbWritable ? t('fork.pass') : t('fork.fix')}</td></tr>
          <tr><th>{t('device.offline')}</th><td>{runtime.offline.cacheNames.length} cache(s), {runtime.offline.serviceWorkerControlled ? t('fork.pass') : t('fork.fix')}</td></tr>
          <tr><th>{t('device.notifications')}</th><td>{runtime.notificationPermission}</td></tr>
        </tbody>
      </table>
    </div>
  {/if}

  <fieldset>
    <legend>{t('device.manual.caption')}</legend>
    <label>
      <input
        type="checkbox"
        checked={manual.installedToHomeScreen}
        onchange={(event) => updateManual('installedToHomeScreen', event.currentTarget.checked)}
      />
      <span>{t('device.check.install')}</span>
    </label>
    <label>
      <input
        type="checkbox"
        checked={manual.nativePrintDialog}
        onchange={(event) => updateManual('nativePrintDialog', event.currentTarget.checked)}
      />
      <span>{t('device.check.print')}</span>
    </label>
    <label>
      <input
        type="checkbox"
        checked={manual.savedPdf}
        onchange={(event) => updateManual('savedPdf', event.currentTarget.checked)}
      />
      <span>{t('device.check.pdf')}</span>
    </label>
    <label>
      <input
        type="checkbox"
        checked={manual.notificationsPrompted}
        onchange={(event) => updateManual('notificationsPrompted', event.currentTarget.checked)}
      />
      <span>{t('device.check.notifications')}</span>
    </label>
    <label>
      <input
        type="checkbox"
        checked={manual.screenReaderNavigable}
        onchange={(event) => updateManual('screenReaderNavigable', event.currentTarget.checked)}
      />
      <span>{t('device.check.screenreader')}</span>
    </label>
  </fieldset>

  <label class="notes">
    <span>{t('device.notes')}</span>
    <textarea
      rows="4"
      value={manual.notes}
      oninput={(event) => updateNotes(event.currentTarget.value)}
    ></textarea>
  </label>

  {#if report}
    <div class="actions">
      <button class="primary" onclick={downloadReport}>{t('device.download')}</button>
      <button onclick={() => { void copyIssue(); }}>{t('device.copyIssue')}</button>
      <a href={deviceIssueUrl(report)}>{t('device.openIssue')}</a>
      <button onclick={onback}>{t('lab.back')}</button>
    </div>
  {/if}
</section>

<style>
  .score {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  .score div,
  fieldset,
  .table-wrap {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .score span,
  .notes span {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .score strong {
    display: block;
    font-size: 2rem;
    line-height: 1;
    margin-top: 0.25rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .actions a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 0.9rem;
    color: var(--accent);
    text-decoration: none;
  }
  .table-wrap {
    overflow-x: auto;
    margin: 1.25rem 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  caption {
    text-align: left;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  th,
  td {
    border-top: 1px solid var(--border);
    padding: 0.6rem 0;
    text-align: left;
    vertical-align: top;
  }
  th {
    min-width: 130px;
  }
  fieldset {
    display: grid;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  legend {
    font-weight: 700;
  }
  fieldset label {
    display: grid;
    grid-template-columns: 28px 1fr;
    align-items: start;
    gap: 0.6rem;
  }
  input[type='checkbox'] {
    width: 22px;
    height: 22px;
  }
  .notes {
    display: grid;
    gap: 0.35rem;
  }
  textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
    font: inherit;
    color: var(--fg);
    background: var(--bg);
  }
</style>
