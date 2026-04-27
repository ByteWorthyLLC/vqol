<script lang="ts">
  import { onMount } from 'svelte';
  import { downloadTextFile } from '../lib/download/text';
  import {
    DEFAULT_LAUNCH_KIT_SETTINGS,
    launchArtifacts,
    launchBrief,
    launchReadinessScore,
    launchRubric,
    type LaunchAudience,
    type ProofAngle,
  } from '../lib/marketing/launchKit';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onback: () => void;
    onstudio: () => void;
    onforge: () => void;
  }

  let { t, onback, onstudio, onforge }: Props = $props();

  let baseUrl = $state(DEFAULT_LAUNCH_KIT_SETTINGS.baseUrl);
  let repoUrl = $state(DEFAULT_LAUNCH_KIT_SETTINGS.repoUrl);
  let practiceName = $state(DEFAULT_LAUNCH_KIT_SETTINGS.practiceName);
  let hook = $state(DEFAULT_LAUNCH_KIT_SETTINGS.hook);
  let audience = $state<LaunchAudience>(DEFAULT_LAUNCH_KIT_SETTINGS.audience);
  let proofAngle = $state<ProofAngle>(DEFAULT_LAUNCH_KIT_SETTINGS.proofAngle);
  let campaign = $state(DEFAULT_LAUNCH_KIT_SETTINGS.campaign);
  let selectedArtifactId = $state('show-hn');
  let copyStatus = $state('');

  const settings = $derived({
    baseUrl,
    repoUrl,
    practiceName,
    hook,
    audience,
    proofAngle,
    campaign,
  });
  const artifacts = $derived(launchArtifacts(settings));
  const rubric = $derived(launchRubric(settings));
  const readiness = $derived(launchReadinessScore(settings));
  const selectedArtifact = $derived(
    artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? artifacts[0]
  );
  const brief = $derived(launchBrief(settings));

  onMount(() => {
    baseUrl = `${window.location.origin}${window.location.pathname}`;
  });

  async function copyText(text: string, label: string): Promise<void> {
    if (!navigator.clipboard) {
      copyStatus = t('launch.copy.unavailable');
      return;
    }
    await navigator.clipboard.writeText(text);
    copyStatus = t('launch.copy.done', { label });
  }

  function downloadBrief(): void {
    downloadTextFile('vqol-viral-functionality-kit.md', brief, 'text/markdown;charset=utf-8');
  }

  async function shareSelected(): Promise<void> {
    if (!selectedArtifact) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedArtifact.title,
          text: selectedArtifact.body,
          url: selectedArtifact.url,
        });
        copyStatus = t('launch.share.done');
        return;
      } catch {
        // Falling back to clipboard keeps the action useful when native sharing is cancelled.
      }
    }
    await copyText(`${selectedArtifact.body}\n\n${selectedArtifact.url}`, selectedArtifact.title);
  }
</script>

<section>
  <h1>{t('launch.title')}</h1>
  <p>{t('launch.body')}</p>

  <div class="score-panel">
    <div>
      <span>{t('launch.readiness')}</span>
      <strong>{readiness}%</strong>
    </div>
    <p class="muted">{t('launch.readiness.body')}</p>
  </div>

  <div class="quick-actions" aria-label={t('launch.quick')}>
    <button class="primary" onclick={onstudio}>{t('launch.open.studio')}</button>
    <button onclick={onforge}>{t('launch.open.forge')}</button>
    <a href="#/proof">{t('launch.open.proof')}</a>
    <a href="#/poster">{t('launch.open.poster')}</a>
  </div>

  <div class="form-grid">
    <label>
      <span>{t('launch.baseUrl')}</span>
      <input bind:value={baseUrl} />
    </label>
    <label>
      <span>{t('launch.repoUrl')}</span>
      <input bind:value={repoUrl} />
    </label>
    <label>
      <span>{t('launch.practiceName')}</span>
      <input bind:value={practiceName} />
    </label>
    <label>
      <span>{t('launch.campaign')}</span>
      <input bind:value={campaign} />
    </label>
    <label class="wide">
      <span>{t('launch.hook')}</span>
      <textarea bind:value={hook} rows="3"></textarea>
    </label>
    <label>
      <span>{t('launch.audience')}</span>
      <select bind:value={audience}>
        <option value="developers">{t('launch.audience.developers')}</option>
        <option value="clinicians">{t('launch.audience.clinicians')}</option>
        <option value="practices">{t('launch.audience.practices')}</option>
        <option value="patients">{t('launch.audience.patients')}</option>
      </select>
    </label>
    <label>
      <span>{t('launch.proofAngle')}</span>
      <select bind:value={proofAngle}>
        <option value="local-first">{t('launch.proof.local')}</option>
        <option value="one-file-fork">{t('launch.proof.fork')}</option>
        <option value="fake-data">{t('launch.proof.fake')}</option>
        <option value="no-backend">{t('launch.proof.backend')}</option>
      </select>
    </label>
  </div>

  <div class="rubric">
    {#each rubric as item}
      <article>
        <span>{item.label}</span>
        <strong>{item.score}/5</strong>
        <p class="muted">{item.reason}</p>
      </article>
    {/each}
  </div>

  <div class="artifact-layout">
    <div class="artifact-list" aria-label={t('launch.artifacts')}>
      {#each artifacts as artifact}
        <button
          class:active={artifact.id === selectedArtifactId}
          onclick={() => { selectedArtifactId = artifact.id; }}
        >
          <strong>{artifact.title}</strong>
          <span>{artifact.channel}</span>
        </button>
      {/each}
    </div>

    {#if selectedArtifact}
      <article class="artifact">
        <span>{selectedArtifact.channel}</span>
        <h2>{selectedArtifact.title}</h2>
        <a href={selectedArtifact.url}>{selectedArtifact.url}</a>
        <pre>{selectedArtifact.body}</pre>
        <div class="actions">
          <button class="primary" onclick={() => { void shareSelected(); }}>{t('launch.share')}</button>
          <button
            onclick={() => {
              void copyText(selectedArtifact.body, selectedArtifact.title);
            }}
          >
            {t('launch.copy.artifact')}
          </button>
        </div>
      </article>
    {/if}
  </div>

  <div class="actions">
    <button class="primary" onclick={downloadBrief}>{t('launch.download')}</button>
    <button onclick={() => { void copyText(brief, t('launch.brief')); }}>{t('launch.copy.brief')}</button>
    <button onclick={onback}>{t('lab.back')}</button>
  </div>
  {#if copyStatus}
    <p class="muted">{copyStatus}</p>
  {/if}
</section>

<style>
  .score-panel {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin: 1.25rem 0;
  }
  .score-panel span,
  label span,
  .artifact span,
  .artifact-list span,
  .rubric span {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .score-panel strong {
    display: block;
    font-size: 2.25rem;
    line-height: 1;
    margin-top: 0.2rem;
  }
  .quick-actions,
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0;
  }
  .quick-actions a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 0.9rem;
    text-decoration: none;
    color: var(--accent);
  }
  .form-grid {
    display: grid;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  label {
    display: grid;
    gap: 0.35rem;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 0.7rem;
    font: inherit;
    color: var(--fg);
    background: var(--bg);
  }
  textarea {
    resize: vertical;
    line-height: 1.4;
  }
  .rubric {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  .rubric article,
  .artifact {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .rubric strong {
    display: block;
    font-size: 1.4rem;
    margin-top: 0.15rem;
  }
  .rubric p {
    margin-bottom: 0;
  }
  .artifact-layout {
    display: grid;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .artifact-list {
    display: grid;
    gap: 0.5rem;
  }
  .artifact-list button {
    display: flex;
    justify-content: flex-start;
    text-align: left;
    flex-direction: column;
    align-items: flex-start;
  }
  .artifact-list button.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent);
  }
  .artifact h2 {
    font-size: 1.25rem;
    margin: 0.25rem 0;
  }
  .artifact a {
    color: var(--accent);
    overflow-wrap: anywhere;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.86rem;
    line-height: 1.45;
    background: color-mix(in srgb, var(--border) 30%, transparent);
  }
  @media (min-width: 720px) {
    .form-grid {
      grid-template-columns: 1fr 1fr;
    }
    .wide {
      grid-column: 1 / -1;
    }
    .rubric {
      grid-template-columns: repeat(4, 1fr);
    }
    .artifact-layout {
      grid-template-columns: minmax(220px, 0.45fr) 1fr;
      align-items: start;
    }
  }
</style>
