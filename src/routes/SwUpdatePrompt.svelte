<script lang="ts">
  import { onMount } from 'svelte';
  import { registerSW } from 'virtual:pwa-register';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    busy: boolean;
  }

  let { t, busy }: Props = $props();
  let visible = $state(false);
  let updateSW = $state<((reloadPage?: boolean) => Promise<void>) | null>(null);

  onMount(() => {
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        visible = true;
      },
    });
  });

  async function reload(): Promise<void> {
    if (!updateSW || busy) return;
    await updateSW(true);
  }

  function dismiss(): void {
    visible = false;
  }
</script>

{#if visible}
  <aside class="sw-update" role="status" aria-live="polite">
    <div>
      <strong>{t('swupdate.title')}</strong>
      <p>{busy ? t('swupdate.body.busy') : t('swupdate.body.ready')}</p>
    </div>
    <div class="actions">
      <button class="primary" disabled={busy} onclick={() => { void reload(); }}>
        {t('swupdate.cta')}
      </button>
      <button onclick={dismiss}>{t('swupdate.dismiss')}</button>
    </div>
  </aside>
{/if}

<style>
  .sw-update {
    max-width: var(--max-content);
    margin: var(--space-3) auto 0;
    border: 1px solid color-mix(in oklab, var(--accent) 30%, var(--border));
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    display: grid;
    gap: var(--space-3);
    background: var(--accent-soft);
    box-shadow: var(--shadow-sm);
  }
  .sw-update strong {
    display: block;
    margin-bottom: var(--space-1);
    color: var(--fg-strong);
  }
  .sw-update p {
    margin: 0;
    color: var(--muted);
    font-size: var(--text-sm);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .actions button {
    padding: 0.5rem 0.85rem;
    min-height: 38px;
  }
  @media (min-width: 560px) {
    .sw-update {
      grid-template-columns: 1fr auto;
      align-items: center;
    }
  }
</style>
