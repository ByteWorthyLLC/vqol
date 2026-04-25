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
    margin: 1.25rem 0;
    padding: 1rem 1.25rem;
    border: 1px solid var(--accent);
    border-radius: 12px;
    background: color-mix(in oklab, var(--accent) 6%, transparent);
  }
  .install-prompt h3 {
    margin: 0 0 0.5rem;
  }
  .install-prompt ol {
    margin: 0.5rem 0 1rem 1.25rem;
    padding: 0;
  }
  .install-prompt li {
    margin: 0.25rem 0;
  }
</style>
