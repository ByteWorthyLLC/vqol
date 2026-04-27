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
    margin: var(--space-5) 0;
    padding: var(--space-4) var(--space-5);
    border: 1px solid color-mix(in oklab, var(--warn) 25%, var(--border));
    border-left: 4px solid var(--warn);
    border-radius: var(--radius-md);
    background: var(--warn-soft);
    box-shadow: var(--shadow-sm);
  }
  .reminder h3 {
    margin: 0 0 var(--space-2);
    font-size: var(--text-base);
  }
  .actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-top: var(--space-3);
  }
</style>
