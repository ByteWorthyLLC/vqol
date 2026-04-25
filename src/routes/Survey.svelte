<script lang="ts">
  import { onMount } from 'svelte';
  import {
    createSession,
    getActiveDraft,
    recordAnswer,
    completeSession,
    saveScore,
  } from '../lib/storage/db';
  import { score } from '../lib/scoring/algorithm';
  import { SURVEY_ITEMS, answerOptionsForScale } from '../lib/survey/items';
  import type { SessionRecord, Locale } from '../lib/storage/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    locale: Locale;
    oncomplete: () => void;
    oncancel: () => void;
  }

  let { t, locale, oncomplete, oncancel }: Props = $props();

  let session = $state<SessionRecord | undefined>(undefined);
  let cursor = $state(0);
  let questionStartedAt = $state(0);
  let submitting = $state(false);
  let errorMsg = $state('');

  const total = SURVEY_ITEMS.length;
  const item = $derived(SURVEY_ITEMS[cursor]);
  const progress = $derived(Math.round((cursor / total) * 100));
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
      await saveScore({
        sessionId: completed.id,
        qolTscore: result.qolTscore,
        symTscore: result.symTscore,
      });
      oncomplete();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Could not finish the survey.';
      submitting = false;
    }
  }
</script>

{#if !session || !item}
  <p class="muted">Loading…</p>
{:else}
  <section>
    <div class="progress" aria-label="Survey progress">
      <div class="progress-bar" style="width: {progress}%"></div>
      <span class="progress-label">
        {t('survey.progress', { current: cursor + 1, total })}
      </span>
    </div>

    <h1 class="prompt">{t(item.promptKey)}</h1>

    <fieldset class="options">
      <legend class="visually-hidden">{t('survey.legend')}</legend>
      {#each options as opt (opt.value)}
        <label class:selected={currentValue === opt.value}>
          <input
            type="radio"
            name="item-{item.id}"
            value={opt.value}
            checked={currentValue === opt.value}
            onchange={() => selectAnswer(opt.value)}
          />
          <span>{t(opt.key)}</span>
        </label>
      {/each}
    </fieldset>

    {#if errorMsg}
      <p class="error" role="alert">{errorMsg}</p>
    {/if}
  </section>

  <nav class="bottom-bar" aria-label="Survey navigation">
    <button onclick={back} disabled={cursor === 0}>{t('survey.back')}</button>
    {#if cursor < total - 1}
      <button class="primary" onclick={next} disabled={currentValue === undefined}>
        {t('survey.next')}
      </button>
    {:else}
      <button class="primary" onclick={submit} disabled={currentValue === undefined || submitting}>
        {submitting ? t('survey.scoring') : t('survey.finish')}
      </button>
    {/if}
    <button onclick={oncancel} class="cancel">{t('survey.pause')}</button>
  </nav>
{/if}

<style>
  .progress {
    position: relative;
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    margin-bottom: 1rem;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s ease;
  }
  .progress-label {
    position: absolute;
    top: 12px;
    left: 0;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .prompt {
    margin-top: 2.5rem;
    font-size: 1.35rem;
    line-height: 1.35;
  }
  .options {
    border: none;
    padding: 0;
    margin: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .options label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    min-height: var(--tap-target);
  }
  .options label.selected {
    border-color: var(--accent);
    background: color-mix(in oklab, var(--accent) 10%, transparent);
  }
  .options input[type='radio'] {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
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
  .error {
    color: var(--danger);
    font-size: 0.95rem;
    margin: 0.75rem 0;
  }
  .cancel {
    flex: 0 0 auto;
  }
</style>
