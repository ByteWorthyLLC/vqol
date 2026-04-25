<script lang="ts">
  import { onMount } from 'svelte';
  import {
    findDueReminders,
    acknowledge,
    type DueReminder,
  } from '../lib/notifications/scheduler';
  import { latestScore } from '../lib/storage/db';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onstart: () => void;
  }

  let { t, onstart }: Props = $props();
  let banner = $state<DueReminder | undefined>(undefined);

  async function refresh(): Promise<void> {
    const baseline = await latestScore();
    const due = await findDueReminders(baseline);
    banner = due[0];
  }

  onMount(() => {
    void refresh();
  });

  async function takeFollowUp(): Promise<void> {
    if (!banner) return;
    await acknowledge(banner.interval.key);
    onstart();
  }

  async function dismiss(): Promise<void> {
    if (!banner) return;
    await acknowledge(banner.interval.key);
    banner = undefined;
  }
</script>

{#if banner}
  <aside class="reminder" role="region" aria-label={t('reminder.title')}>
    <h3>{t(banner.interval.labelKey)}</h3>
    <p>
      {t('reminder.body', { days: banner.daysOverdue })}
    </p>
    <div class="actions">
      <button class="primary" onclick={takeFollowUp}>{t('reminder.cta')}</button>
      <button onclick={dismiss}>{t('reminder.dismiss')}</button>
    </div>
  </aside>
{/if}

<style>
  .reminder {
    margin: 1.25rem 0;
    padding: 1rem 1.25rem;
    border: 1px solid var(--border);
    border-left: 4px solid var(--accent);
    border-radius: 8px;
    background: var(--bg);
  }
  .reminder h3 {
    margin: 0 0 0.5rem;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }
</style>
