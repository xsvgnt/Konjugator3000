<script lang="ts">
  import { app } from '../app.svelte';
  import { LANGUAGES } from '../languages';
  import { QUESTION_COUNTS, tensesByMood } from '../quiz';
  import Icon from './Icon.svelte';

  const groups = $derived(app.data ? tensesByMood(app.data.tenses) : []);
  const selectedIds = $derived(new Set(app.settings.tenses[app.settings.lang] ?? []));
  const regularCount = $derived(app.data?.verbs.filter((v) => !v.irregular).length ?? 0);
  const irregularCount = $derived(app.data?.verbs.filter((v) => v.irregular).length ?? 0);
  const questionCount = $derived(Math.min(app.settings.count, app.pool.length));

  const startHint = $derived.by(() => {
    if (!app.settings.regular && !app.settings.irregular) return 'Select at least one verb group.';
    if (app.verbs.length === 0) return 'Tick at least one verb in the list.';
    if (app.tenses.length === 0) return 'Select at least one tense.';
    if (app.pool.length < app.settings.count)
      return `Only ${app.pool.length} different questions exist for this selection.`;
    return '';
  });
</script>

<div class="panel">
  <section>
    <h2 class="label">Language</h2>
    <div class="seg" role="group" aria-label="Language">
      {#each LANGUAGES as l (l.code)}
        <button type="button" aria-pressed={app.settings.lang === l.code} onclick={() => app.setLanguage(l.code)}>
          {l.name}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="label">Verb groups</h2>
    <div class="stack">
      {#each [{ key: 'regular', label: 'Regular', n: regularCount }, { key: 'irregular', label: 'Irregular', n: irregularCount }] as g (g.key)}
        {@const on = app.settings[g.key as 'regular' | 'irregular']}
        <button type="button" class="group" aria-pressed={on} onclick={() => app.toggleGroup(g.key as 'regular' | 'irregular')}>
          <span class="box" class:on>{#if on}<Icon name="check" size={12} />{/if}</span>
          <span class="grow">{g.label}</span>
          <span class="mono count">{g.n}</span>
        </button>
      {/each}
    </div>
    <p class="hint">{app.verbs.length} of {app.groupVerbs.length} verbs selected · edit the list on the right</p>
  </section>

  <section>
    <h2 class="label">Tenses · {app.tenses.length} selected</h2>
    <div class="moods">
      {#each groups as g (g.mood)}
        <div>
          <h3 class="mood">{g.mood}</h3>
          <div class="chips">
            {#each g.tenses as t (t.id)}
              <button type="button" class="chip" aria-pressed={selectedIds.has(t.id)} onclick={() => app.toggleTense(t.id)}>
                {t.name}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="label">Questions</h2>
    <div class="seg" role="group" aria-label="Number of questions">
      {#each QUESTION_COUNTS as n (n)}
        <button type="button" class="mono" aria-pressed={app.settings.count === n} onclick={() => app.setCount(n)}>{n}</button>
      {/each}
    </div>
  </section>

  <div class="start">
    <button type="button" class="btn-primary" disabled={!app.canStart} onclick={() => app.start()}>
      Start · {questionCount} questions
    </button>
    {#if startHint}<p class="hint">{startHint}</p>{/if}
  </div>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  section > h2 {
    margin-bottom: 10px;
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }
  .group {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--card);
    font-size: 14px;
    font-weight: 500;
    text-align: left;
  }
  .group[aria-pressed='true'] {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .box {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border-radius: 5px;
    border: 1.5px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--on-accent);
  }
  .box.on {
    border-color: var(--accent);
    background: var(--accent);
  }
  .grow {
    flex: 1;
  }
  .count {
    font-size: 12px;
    color: var(--muted);
  }
  .moods {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .mood {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--subtle);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .start {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .start .btn-primary {
    min-height: 48px;
  }
</style>
