<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    createSession,
    getActiveDraft,
    recordAnswer,
    completeSession,
    saveScore,
  } from '../lib/storage/db';
  import { score } from '../lib/scoring/algorithm';
  import { SURVEY_ITEMS, answerOptionsForScale } from '../lib/survey/items';
  import { submitAggregateScore } from '../lib/aggregate/submit';
  import type { SessionRecord, Locale } from '../lib/storage/types';
  import type { PracticeConfig } from '../lib/practice-config/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    locale: Locale;
    config: PracticeConfig;
    oncomplete: () => void;
    oncancel: () => void;
  }

  let { t, locale, config, oncomplete, oncancel }: Props = $props();

  let session = $state<SessionRecord | undefined>(undefined);
  let cursor = $state(0);
  let questionStartedAt = $state(0);
  let submitting = $state(false);
  let errorMsg = $state('');

  const total = SURVEY_ITEMS.length;
  const item = $derived(SURVEY_ITEMS[cursor]);
  const progress = $derived(Math.round(((cursor + 1) / total) * 100));
  const currentValue = $derived(
    session && item ? session.answers[item.id] : undefined
  );
  const options = $derived(
    item ? answerOptionsForScale(item.answerScale, item.scaleRange) : []
  );

  onMount(async () => {
    let s = await getActiveDraft();
    if (!s) {
      s = await createSession({ lockedLocale: locale });
    }
    session = s;
    const firstUnanswered = SURVEY_ITEMS.findIndex(
      (it) => s!.answers[it.id] === undefined
    );
    cursor = firstUnanswered === -1 ? 0 : firstUnanswered;
    questionStartedAt = Date.now();
  });

  async function selectAnswer(value: number): Promise<void> {
    if (!session || !item) return;
    const dwell = Date.now() - questionStartedAt;
    try {
      await recordAnswer(session.id, item.id, value, dwell);
      session.answers[item.id] = value;
      session.dwellMs[item.id] = dwell;
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Could not save your answer.';
    }
  }

  function next(): void {
    if (cursor < total - 1) {
      cursor += 1;
      questionStartedAt = Date.now();
    }
  }

  function back(): void {
    if (cursor > 0) {
      cursor -= 1;
      questionStartedAt = Date.now();
    }
  }

  async function submit(): Promise<void> {
    if (!session) return;
    submitting = true;
    errorMsg = '';
    try {
      const map = new Map(Object.entries(session.answers));
      const result = score(map);
      if (result.status === 'incomplete') {
        const idx = SURVEY_ITEMS.findIndex((it) =>
          result.missing.includes(it.id)
        );
        cursor = idx === -1 ? 0 : idx;
        errorMsg = t('survey.incomplete', {
          threshold: Math.round(result.threshold * 100),
        });
        submitting = false;
        return;
      }
      const completed = await completeSession(session.id);
      const savedScore = await saveScore({
        sessionId: completed.id,
        qolTscore: result.qolTscore,
        symTscore: result.symTscore,
      });
      const aggregateResult = await submitAggregateScore(config, savedScore);
      if (aggregateResult.status === 'failed') {
        console.warn(`Aggregate score submission failed: ${aggregateResult.reason}`);
      }
      oncomplete();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Could not finish the survey.';
      submitting = false;
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!session || !item) return;
    const target = event.target as HTMLElement | null;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      back();
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      if (cursor === total - 1) {
        if (currentValue !== undefined && !submitting) void submit();
      } else if (currentValue !== undefined) {
        next();
      }
      event.preventDefault();
      return;
    }
    const num = Number(event.key);
    if (Number.isInteger(num) && num >= 1 && num <= options.length) {
      const opt = options[num - 1];
      if (opt) void selectAnswer(opt.value);
      event.preventDefault();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKeyDown);
    }
  });
</script>

{#if !session || !item}
  <p class="muted" aria-busy="true">{t('home.loading')}</p>
{:else}
  <section class="survey">
    <div class="progress-wrap" aria-label={t('survey.progress', { current: cursor + 1, total })}>
      <div class="progress-meta">
        <span class="progress-step">
          {t('survey.progress', { current: cursor + 1, total })}
        </span>
        <span class="progress-percent" aria-hidden="true">{progress}%</span>
      </div>
      <div class="progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width: {progress}%"></div>
      </div>
    </div>

    <h1 class="prompt">{t(item.promptKey)}</h1>
    <p class="hint muted">{t('survey.hint')}</p>

    <fieldset class="options">
      <legend class="visually-hidden">{t('survey.legend')}</legend>
      {#each options as opt, i (opt.value)}
        <label class:selected={currentValue === opt.value}>
          <input
            type="radio"
            name="item-{item.id}"
            value={opt.value}
            checked={currentValue === opt.value}
            onchange={() => selectAnswer(opt.value)}
          />
          <span class="kbd" aria-hidden="true">{i + 1}</span>
          <span class="label-text">{t(opt.key)}</span>
        </label>
      {/each}
    </fieldset>

    {#if errorMsg}
      <p class="error" role="alert">{errorMsg}</p>
    {/if}
  </section>

  <nav class="bottom-bar" aria-label={t('survey.legend')}>
    <button onclick={back} disabled={cursor === 0}>{t('survey.back')}</button>
    {#if cursor < total - 1}
      <button class="primary" onclick={next} disabled={currentValue === undefined}>
        {t('survey.next')}
      </button>
    {:else}
      <button class="action" onclick={submit} disabled={currentValue === undefined || submitting}>
        {submitting ? t('survey.scoring') : t('survey.finish')}
      </button>
    {/if}
    <button onclick={oncancel} class="cancel">{t('survey.pause')}</button>
  </nav>
{/if}

<style>
  .survey {
    padding-bottom: 6rem;
  }
  .progress-wrap {
    margin-bottom: var(--space-6);
  }
  .progress-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }
  .progress-step {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--fg-strong);
    letter-spacing: 0.01em;
  }
  .progress-percent {
    font-size: var(--text-xs);
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .progress {
    position: relative;
    height: 6px;
    background: var(--surface-2);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--action));
    transition: width var(--duration-base) var(--ease-out);
  }
  .prompt {
    font-size: var(--text-xl);
    line-height: var(--leading-snug);
    margin: var(--space-4) 0 var(--space-2);
  }
  @media (min-width: 540px) {
    .prompt {
      font-size: var(--text-2xl);
    }
  }
  .hint {
    margin: 0 0 var(--space-5);
  }
  .options {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .options label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0.85rem 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    min-height: var(--tap-target);
    background: var(--surface-elevated);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }
  .options label:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .options label:focus-within {
    outline: none;
    box-shadow: var(--ring-focus);
    border-color: var(--accent);
  }
  .options label.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .options input[type='radio'] {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    accent-color: var(--accent);
  }
  .kbd {
    display: none;
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--muted);
    background: var(--surface-2);
    align-items: center;
    justify-content: center;
  }
  @media (min-width: 540px) {
    .kbd {
      display: inline-flex;
    }
  }
  .label-text {
    flex: 1;
    color: var(--fg);
  }
  .error {
    color: var(--danger);
    background: var(--danger-soft);
    border: 1px solid color-mix(in oklab, var(--danger) 30%, var(--border));
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    margin: var(--space-4) 0;
  }
  .cancel {
    flex: 0 0 auto;
  }
</style>
