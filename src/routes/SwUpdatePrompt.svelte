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
    margin: 0.75rem auto 0;
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.9rem 1rem;
    display: grid;
    gap: 0.75rem;
    background: var(--bg);
  }
  .sw-update strong {
    display: block;
    margin-bottom: 0.15rem;
  }
  .sw-update p {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .actions button {
    padding: 0.5rem 0.8rem;
  }
  @media (min-width: 560px) {
    .sw-update {
      grid-template-columns: 1fr auto;
      align-items: center;
    }
  }
</style>
