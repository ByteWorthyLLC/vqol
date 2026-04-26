<script lang="ts">
  import { auditForkConfig, forkReadinessScore } from '../lib/fork/audit';
  import type { PracticeConfig } from '../lib/practice-config/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    config: PracticeConfig;
    onback: () => void;
  }

  let { t, config, onback }: Props = $props();

  const items = $derived(auditForkConfig(config));
  const score = $derived(forkReadinessScore(items));
</script>

<section>
  <h1>{t('fork.title')}</h1>
  <p>{t('fork.body')}</p>

  <div class="readiness">
    <span>{t('fork.readiness')}</span>
    <strong>{score}%</strong>
  </div>

  <dl class="config">
    <div>
      <dt>{t('fork.config.practice')}</dt>
      <dd>{config.practiceName}</dd>
    </div>
    <div>
      <dt>{t('fork.config.file')}</dt>
      <dd><code>public/practice.json</code></dd>
    </div>
    <div>
      <dt>{t('fork.config.brand')}</dt>
      <dd>
        <span class="swatch" style="background: {config.branding.primaryColor}"></span>
        {config.branding.primaryColor}
      </dd>
    </div>
  </dl>

  <div class="audit">
    {#each items as item}
      <article class:pass={item.pass}>
        <span>{item.pass ? t('fork.pass') : t('fork.fix')}</span>
        <div>
          <h2>{item.label}</h2>
          <p class="muted">{item.detail}</p>
        </div>
      </article>
    {/each}
  </div>

  <button onclick={onback}>{t('lab.back')}</button>
</section>

<style>
  .readiness {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin: 1.25rem 0;
  }
  .readiness strong {
    font-size: 2rem;
    line-height: 1;
  }
  .config {
    display: grid;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  .config div {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 0.75rem;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }
  .swatch {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 4px;
    border: 1px solid var(--border);
    vertical-align: -0.15rem;
    margin-right: 0.25rem;
  }
  .audit {
    display: grid;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  .audit article {
    display: grid;
    grid-template-columns: 4rem 1fr;
    gap: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .audit article.pass {
    border-color: color-mix(in oklab, var(--accent) 45%, var(--border));
  }
  .audit h2 {
    font-size: 1.05rem;
    margin-bottom: 0.2rem;
  }
  code {
    overflow-wrap: anywhere;
  }
  @media (max-width: 520px) {
    .config div {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }
</style>
