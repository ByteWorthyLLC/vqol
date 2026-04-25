<script lang="ts">
  import { onMount } from 'svelte';
  import { getActiveDraft, latestScore } from '../lib/storage/db';
  import type { SessionRecord, ScoreRecord } from '../lib/storage/types';

  interface Props {
    onstart: () => void;
    onview: () => void;
  }

  let { onstart, onview }: Props = $props();

  let draft = $state<SessionRecord | undefined>(undefined);
  let prior = $state<ScoreRecord | undefined>(undefined);
  let loading = $state(true);

  onMount(async () => {
    [draft, prior] = await Promise.all([getActiveDraft(), latestScore()]);
    loading = false;
  });

  function startFresh(): void {
    onstart();
  }

  function resumeDraft(): void {
    onstart();
  }

  function viewPriorResults(): void {
    onview();
  }
</script>

<section>
  <h1>VEINES-QOL/Sym</h1>
  <p>
    A patient-owned tracker for the Venous Insufficiency Epidemiological and Economic Study
    quality-of-life questionnaire. Take the survey at baseline and at follow-ups to see how
    your symptoms and quality of life change over time.
  </p>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else}
    {#if draft}
      <div class="card">
        <h2>Resume in progress</h2>
        <p class="muted">
          You have a draft survey from {new Date(draft.startedAt).toLocaleDateString()}.
          Your answers are saved on this device.
        </p>
        <div class="actions">
          <button class="primary" onclick={resumeDraft}>Resume survey</button>
          <button onclick={startFresh}>Start a new one instead</button>
        </div>
      </div>
    {:else}
      <div class="card">
        <h2>Start a survey</h2>
        <p class="muted">
          About 25 questions. Takes 5–7 minutes. You can pause and resume anytime —
          your answers are saved as you go, on this device only.
        </p>
        <div class="actions">
          <button class="primary" onclick={startFresh}>Start now</button>
        </div>
      </div>
    {/if}

    {#if prior}
      <div class="card">
        <h2>Your prior result</h2>
        <p class="muted">
          From {new Date(prior.calculatedAt).toLocaleDateString()}:
          QOL T-score {prior.qolTscore}, Symptom T-score {prior.symTscore}.
        </p>
        <div class="actions">
          <button onclick={viewPriorResults}>View prior result</button>
        </div>
      </div>
    {/if}
  {/if}
</section>

<style>
  .card {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 1.25rem 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  @media (min-width: 480px) {
    .actions {
      flex-direction: row;
    }
  }
</style>
