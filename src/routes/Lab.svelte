<script lang="ts">
  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    ondemo: () => void;
    onproof: () => void;
    onfork: () => void;
    onposter: () => void;
    onhome: () => void;
  }

  let { t, ondemo, onproof, onfork, onposter, onhome }: Props = $props();
</script>

<section>
  <h1>{t('lab.title')}</h1>
  <p>{t('lab.body')}</p>

  <div class="tools">
    <article class="tool">
      <h2>{t('lab.demo.title')}</h2>
      <p class="muted">{t('lab.demo.body')}</p>
      <button class="primary" onclick={ondemo}>{t('lab.demo.cta')}</button>
    </article>

    <article class="tool">
      <h2>{t('lab.proof.title')}</h2>
      <p class="muted">{t('lab.proof.body')}</p>
      <button onclick={onproof}>{t('lab.proof.cta')}</button>
    </article>

    <article class="tool">
      <h2>{t('lab.fork.title')}</h2>
      <p class="muted">{t('lab.fork.body')}</p>
      <button onclick={onfork}>{t('lab.fork.cta')}</button>
    </article>

    <article class="tool">
      <h2>{t('lab.poster.title')}</h2>
      <p class="muted">{t('lab.poster.body')}</p>
      <button onclick={onposter}>{t('lab.poster.cta')}</button>
    </article>
  </div>

  <button onclick={onhome}>{t('results.back')}</button>
</section>

<style>
  .tools {
    display: grid;
    gap: 0.85rem;
    margin: 1.25rem 0;
  }
  .tool {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .tool h2 {
    font-size: 1.05rem;
  }
</style>
