<script lang="ts">
  import { onMount } from 'svelte';
  import { getMeta, setMeta } from '../lib/storage/db';
  import { isIosSafariStandalonePending } from '../lib/notifications/permission';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
  }

  let { t }: Props = $props();
  let visible = $state(false);

  onMount(async () => {
    if (!isIosSafariStandalonePending()) return;
    const dismissed = await getMeta<boolean>('ios_install_prompt_shown');
    if (dismissed) return;
    visible = true;
  });

  async function dismiss(): Promise<void> {
    await setMeta('ios_install_prompt_shown', true);
    visible = false;
  }
</script>

{#if visible}
  <aside class="install-prompt" role="region" aria-label={t('install.title')}>
    <h3>{t('install.title')}</h3>
    <p>{t('install.body')}</p>
    <ol>
      <li>{t('install.step1')}</li>
      <li>{t('install.step2')}</li>
      <li>{t('install.step3')}</li>
    </ol>
    <button onclick={dismiss}>{t('install.dismiss')}</button>
  </aside>
{/if}

<style>
  .install-prompt {
    margin: var(--space-5) 0;
    padding: var(--space-4) var(--space-5);
    border: 1px solid color-mix(in oklab, var(--accent) 30%, var(--border));
    border-radius: var(--radius-lg);
    background: var(--accent-soft);
    box-shadow: var(--shadow-sm);
  }
  .install-prompt h3 {
    margin: 0 0 var(--space-2);
    font-size: var(--text-base);
  }
  .install-prompt ol {
    margin: var(--space-2) 0 var(--space-4) 1.25rem;
    padding: 0;
  }
  .install-prompt li {
    margin: var(--space-1) 0;
  }
</style>
