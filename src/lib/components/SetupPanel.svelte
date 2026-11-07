<script lang="ts">
  import { app } from '../app.svelte';
  import { LANGUAGES } from '../languages';
  import { QUESTION_COUNTS, tensesByBlock } from '../quiz';
  import Icon from './Icon.svelte';

  const blocks = $derived(app.data ? tensesByBlock(app.data.tenses) : []);
  const selectedIds = $derived(new Set(app.settings.tenses[app.settings.lang] ?? []));
  const selectedGroups = $derived(new Set(app.selectedGroups()));
  const groups = $derived(
    (app.data?.groups ?? []).map((g) => ({ ...g, n: app.data!.verbs.filter((v) => v.group === g.id).length }))
  );
  const questionCount = $derived(Math.min(app.settings.count, app.pool.length));

  /** Clicking a block heading selects the whole block, or clears it when it is already complete. */
  function toggleBlock(ids: string[]) {
    app.setTenses(ids, !ids.every((id) => selectedIds.has(id)));
  }

  const startHint = $derived.by(() => {
    if (selectedGroups.size === 0) return 'Select at least one verb group.';
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
      {#each groups as g (g.id)}
        {@const on = selectedGroups.has(g.id)}
        <button type="button" class="group" aria-pressed={on} onclick={() => app.toggleGroup(g.id)}>
          <span class="box" class:on>{#if on}<Icon name="check" size={12} />{/if}</span>
          <span class="grow">{g.label}</span>
          <span class="mono count">{g.n}</span>
        </button>
      {/each}
    </div>
    <p class="hint">{app.verbs.length} of {app.groupVerbs.length} verbs selected · edit the list on the right</p>
  </section>

  <section>
    <div class="section-head">
      <h2 class="label">Tenses · {app.tenses.length} selected</h2>
      <div class="head-actions">
        <button type="button" class="link" onclick={() => app.setTenses(app.data?.tenses.map((t) => t.id) ?? [], true)}>All</button>
        <button type="button" class="link" onclick={() => app.setTenses(app.data?.tenses.map((t) => t.id) ?? [], false)}>Clear</button>
      </div>
    </div>
    <div class="moods">
      {#each blocks as b (b.block)}
        {@const ids = b.tenses.map((t) => t.id)}
        {@const all = ids.every((id) => selectedIds.has(id))}
        <div>
          <h3 class="mood">
            <button type="button" class="block-toggle" onclick={() => toggleBlock(ids)} title={all ? `Clear ${b.block}` : `Select all of ${b.block}`}>
              {b.block}<span class="block-action">{all ? 'clear' : 'all'}</span>
            </button>
          </h3>
          <div class="chips">
            {#each b.tenses as t (t.id)}
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
  section > h2,
  .section-head {
    margin-bottom: 10px;
  }
  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .head-actions {
    display: flex;
    gap: 12px;
  }
  .link {
    padding: 2px 0;
    border: none;
    background: none;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }
  .link:hover {
    text-decoration: underline;
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
  .block-toggle {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    padding: 2px 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
  }
  .block-action {
    font-size: 12px;
    color: var(--muted);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .block-toggle:hover .block-action,
  .block-toggle:focus-visible .block-action {
    opacity: 1;
    color: var(--accent);
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
