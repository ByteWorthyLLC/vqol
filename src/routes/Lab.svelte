<script lang="ts">
  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    ondemo: () => void;
    onproof: () => void;
    onfork: () => void;
    onstudio: () => void;
    onforge: () => void;
    onlaunch: () => void;
    onposter: () => void;
    ondevice: () => void;
    onhome: () => void;
  }

  let {
    t,
    ondemo,
    onproof,
    onfork,
    onstudio,
    onforge,
    onlaunch,
    onposter,
    ondevice,
    onhome,
  }: Props = $props();

  const tools = $derived([
    { titleKey: 'lab.studio.title', bodyKey: 'lab.studio.body', ctaKey: 'lab.studio.cta', tone: 'primary' as const, action: onstudio,
      icon: 'M3 17l6-6 4 4 8-8;M14 7h7v7' },
    { titleKey: 'lab.forge.title', bodyKey: 'lab.forge.body', ctaKey: 'lab.forge.cta', tone: 'default' as const, action: onforge,
      icon: 'M14 4l6 6-9 9H5v-6z;M3 21h18' },
    { titleKey: 'lab.launch.title', bodyKey: 'lab.launch.body', ctaKey: 'lab.launch.cta', tone: 'default' as const, action: onlaunch,
      icon: 'M5 19l4-1 8-8a2.83 2.83 0 0 0-4-4l-8 8-1 4z;M14 6l4 4' },
    { titleKey: 'lab.demo.title', bodyKey: 'lab.demo.body', ctaKey: 'lab.demo.cta', tone: 'default' as const, action: ondemo,
      icon: 'M3 3v18h18;M7 14l3-3 4 4 5-7' },
    { titleKey: 'lab.proof.title', bodyKey: 'lab.proof.body', ctaKey: 'lab.proof.cta', tone: 'default' as const, action: onproof,
      icon: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z;M9 12l2 2 4-4' },
    { titleKey: 'lab.fork.title', bodyKey: 'lab.fork.body', ctaKey: 'lab.fork.cta', tone: 'default' as const, action: onfork,
      icon: 'M6 3v6;M6 9a3 3 0 0 0 0 6;M6 21v-6;M18 3v6;M18 9a3 3 0 0 1 0 6;M18 21v-6' },
    { titleKey: 'lab.poster.title', bodyKey: 'lab.poster.body', ctaKey: 'lab.poster.cta', tone: 'default' as const, action: onposter,
      icon: 'M4 4h6v6H4z;M14 4h6v6h-6z;M4 14h6v6H4z;M14 14h6v6h-6z' },
    { titleKey: 'lab.device.title', bodyKey: 'lab.device.body', ctaKey: 'lab.device.cta', tone: 'default' as const, action: ondevice,
      icon: 'M5 4h14v16H5z;M5 8h14;M9 4v4;M15 4v4' },
  ]);
</script>

<section>
  <header class="page-header">
    <span class="eyebrow">{t('lab.eyebrow')}</span>
    <h1>{t('lab.title')}</h1>
    <p class="lede">{t('lab.body')}</p>
  </header>

  <div class="tools">
    {#each tools as tool}
      <article class="tool" class:tone-primary={tool.tone === 'primary'}>
        <span class="tool-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            {#each tool.icon.split(';') as path}
              <path d={path}/>
            {/each}
          </svg>
        </span>
        <div class="tool-body">
          <h2>{t(tool.titleKey)}</h2>
          <p class="muted">{t(tool.bodyKey)}</p>
          <button
            class={tool.tone === 'primary' ? 'primary' : ''}
            onclick={tool.action}
          >{t(tool.ctaKey)}</button>
        </div>
      </article>
    {/each}
  </div>

  <button class="ghost back" onclick={onhome}>{t('results.back')}</button>
</section>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }
  .page-header h1 {
    margin-bottom: var(--space-2);
  }
  .page-header .lede {
    margin: 0;
  }
  .tools {
    display: grid;
    gap: var(--space-3);
    margin: var(--space-2) 0 var(--space-6);
  }
  @media (min-width: 640px) {
    .tools {
      grid-template-columns: 1fr 1fr;
    }
  }
  .tool {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }
  .tool:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
  }
  .tool.tone-primary {
    background: linear-gradient(180deg, var(--surface-elevated), var(--accent-soft));
    border-color: color-mix(in oklab, var(--accent) 30%, var(--border));
  }
  .tool-icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--accent-soft);
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .tool-body {
    flex: 1;
    min-width: 0;
  }
  .tool-body h2 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
  }
  .tool-body p {
    margin: 0 0 var(--space-3);
    font-size: var(--text-sm);
  }
  .back {
    margin-top: var(--space-4);
  }
</style>
