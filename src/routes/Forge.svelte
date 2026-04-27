<script lang="ts">
  import { untrack } from 'svelte';
  import { auditForkConfig, forkReadinessScore } from '../lib/fork/audit';
  import {
    configFromDraft,
    draftFromConfig,
    serializePracticeConfig,
  } from '../lib/forge/config';
  import { validatePracticeConfig } from '../lib/practice-config/validate';
  import { downloadTextFile } from '../lib/download/text';
  import type { PracticeConfig, PracticeInstrument } from '../lib/practice-config/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    config: PracticeConfig;
    onback: () => void;
    onposter: () => void;
  }

  let { t, config, onback, onposter }: Props = $props();

  const initial = untrack(() => draftFromConfig(config));
  let practiceName = $state(initial.practiceName);
  let practiceId = $state(initial.practiceId);
  let email = $state(initial.email);
  let websiteUrl = $state(initial.websiteUrl);
  let primaryColor = $state(initial.primaryColor);
  let instrumentMode = $state<PracticeInstrument['mode']>(initial.instrumentMode);
  let aggregateSubmit = $state(initial.aggregateSubmit);
  let aggregateEndpoint = $state(initial.aggregateEndpoint);
  let copyStatus = $state('');

  const draft = $derived({
    practiceName,
    practiceId,
    email,
    websiteUrl,
    primaryColor,
    instrumentMode,
    aggregateSubmit,
    aggregateEndpoint,
  });
  const forgedConfig = $derived(configFromDraft(config, draft));
  const serialized = $derived(serializePracticeConfig(forgedConfig));
  const validation = $derived(validatePracticeConfig(forgedConfig));
  const audit = $derived(auditForkConfig(forgedConfig));
  const readiness = $derived(forkReadinessScore(audit));

  function downloadConfig(): void {
    downloadTextFile('practice.json', serialized, 'application/json;charset=utf-8');
  }

  async function copyConfig(): Promise<void> {
    if (!navigator.clipboard) {
      copyStatus = t('forge.copy.unavailable');
      return;
    }
    await navigator.clipboard.writeText(serialized);
    copyStatus = t('forge.copy.done');
  }
</script>

<section>
  <h1>{t('forge.title')}</h1>
  <p>{t('forge.body')}</p>

  <div class="preview" style={`--preview-accent: ${primaryColor}`}>
    <span>{t('forge.preview')}</span>
    <strong>{forgedConfig.practiceName}</strong>
    <p>{forgedConfig.primaryContact.email || forgedConfig.primaryContact.websiteUrl || t('forge.noContact')}</p>
  </div>

  <div class="form-grid">
    <label>
      <span>{t('forge.practiceName')}</span>
      <input bind:value={practiceName} />
    </label>
    <label>
      <span>{t('forge.practiceId')}</span>
      <input bind:value={practiceId} />
    </label>
    <label>
      <span>{t('forge.email')}</span>
      <input bind:value={email} />
    </label>
    <label>
      <span>{t('forge.website')}</span>
      <input bind:value={websiteUrl} />
    </label>
    <label>
      <span>{t('forge.color')}</span>
      <input type="color" bind:value={primaryColor} />
    </label>
    <label>
      <span>{t('forge.instrument')}</span>
      <select bind:value={instrumentMode}>
        <option value="reference-only">reference-only</option>
        <option value="bring-your-own">bring-your-own</option>
        <option value="permissioned-veines">permissioned-veines</option>
      </select>
    </label>
  </div>

  <label class="toggle">
    <input type="checkbox" bind:checked={aggregateSubmit} />
    <span>{t('forge.aggregate')}</span>
  </label>
  {#if aggregateSubmit}
    <label>
      <span>{t('forge.endpoint')}</span>
      <input bind:value={aggregateEndpoint} placeholder="https://collector.example/vqol" />
    </label>
  {/if}

  <div class="status">
    <strong>{t('fork.readiness')}: {readiness}%</strong>
    {#if validation.ok}
      <p class="muted">{t('forge.valid')}</p>
    {:else}
      <ul>
        {#each validation.errors as err}
          <li>{err.path}: {err.message}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <pre>{serialized}</pre>

  <div class="actions">
    <button class="primary" onclick={downloadConfig}>{t('forge.download')}</button>
    <button onclick={() => { void copyConfig(); }}>{t('forge.copy')}</button>
    <button onclick={onposter}>{t('forge.poster')}</button>
    <button onclick={onback}>{t('lab.back')}</button>
  </div>
  {#if copyStatus}
    <p class="muted">{copyStatus}</p>
  {/if}
</section>

<style>
  .preview {
    border: 1px solid var(--border);
    border-left: 8px solid var(--preview-accent);
    border-radius: 8px;
    padding: 1rem;
    margin: 1.25rem 0;
  }
  .preview span,
  label span {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .preview strong {
    display: block;
    font-size: 1.35rem;
  }
  .preview p {
    margin: 0.25rem 0 0;
  }
  .form-grid {
    display: grid;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  label {
    display: grid;
    gap: 0.35rem;
  }
  input,
  select {
    min-height: 44px;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 0.7rem;
    font: inherit;
    color: var(--fg);
    background: var(--bg);
  }
  input[type='color'] {
    padding: 0.2rem;
  }
  .toggle {
    grid-template-columns: 44px 1fr;
    align-items: center;
    margin: 1rem 0;
  }
  .toggle input {
    width: 22px;
    min-height: 22px;
  }
  .status {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin: 1.25rem 0;
  }
  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
    color: var(--danger);
  }
  pre {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.82rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>
