<script lang="ts">
  import type { Locale } from '../lib/storage/types';
  import { persistLocaleChoice } from '../lib/i18n/loader';

  interface Props {
    current: Locale;
    available: Locale[];
    onchange: (locale: Locale) => void;
  }

  let { current, available, onchange }: Props = $props();

  const LABELS: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
  };

  function pick(e: Event): void {
    const next = (e.target as HTMLSelectElement).value as Locale;
    persistLocaleChoice(next);
    onchange(next);
  }
</script>

<label class="switcher">
  <span class="visually-hidden">Language</span>
  <select value={current} onchange={pick} aria-label="Change language">
    {#each available as code (code)}
      <option value={code}>{LABELS[code]}</option>
    {/each}
  </select>
</label>

<style>
  .switcher select {
    min-height: 36px;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg);
    font-size: 0.95rem;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
