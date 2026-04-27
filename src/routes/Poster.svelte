<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import type { PracticeConfig } from '../lib/practice-config/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    config: PracticeConfig;
    onback: () => void;
  }

  let { t, config, onback }: Props = $props();

  let appUrl = $state('');
  let qrDataUrl = $state('');
  let error = $state('');

  onMount(() => {
    appUrl = `${window.location.origin}${window.location.pathname}`;
    void QRCode.toDataURL(appUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: config.branding.foregroundColor,
        light: config.branding.backgroundColor,
      },
    })
      .then((url) => {
        qrDataUrl = url;
      })
      .catch((err: unknown) => {
        error = err instanceof Error ? err.message : String(err);
      });
  });
</script>

<section>
  <div class="screen-actions">
    <button onclick={onback}>{t('lab.back')}</button>
    <button class="primary" onclick={() => window.print()}>{t('poster.print')}</button>
  </div>

  <article class="poster">
    <p class="eyebrow">{config.practiceName}</p>
    <h1>{t('poster.title')}</h1>
    <p class="body">{t('poster.body')}</p>

    <div class="qr-box">
      {#if qrDataUrl}
        <img src={qrDataUrl} alt={t('poster.qrAlt')} />
      {:else if error}
        <p class="muted">{error}</p>
      {:else}
        <p class="muted">{t('home.loading')}</p>
      {/if}
    </div>

    <p class="url">{appUrl}</p>
    <p class="fine">{t('poster.fine')}</p>
  </article>
</section>

<style>
  .screen-actions {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .poster {
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: clamp(1.5rem, 5vw, 2.5rem);
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .eyebrow {
    color: var(--muted);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
  }
  .poster h1 {
    font-size: 2rem;
  }
  .body {
    font-size: 1.08rem;
  }
  .qr-box {
    display: grid;
    place-items: center;
    width: min(100%, 320px);
    min-height: 320px;
    margin: 1.5rem auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
  }
  img {
    width: 280px;
    height: 280px;
  }
  .url {
    overflow-wrap: anywhere;
    font-weight: 700;
  }
  .fine {
    color: var(--muted);
    font-size: 0.88rem;
  }
  @media print {
    .screen-actions {
      display: none !important;
    }
    .poster {
      border: none;
      padding: 0;
    }
  }
</style>
