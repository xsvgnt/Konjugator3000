<script lang="ts">
  import { tick } from 'svelte';
  import { app } from '../app.svelte';
  import { promptLabel } from '../quiz';
  import { cycleAccent } from '../accents';

  let inputs: HTMLInputElement[] = $state([]);

  const total = $derived(app.quiz.length);
  const blanks = $derived(total - app.filled);
  const progress = $derived(total ? Math.round((app.filled / total) * 100) : 0);

  $effect(() => {
    // Focus the first field when the quiz appears.
    if (app.screen === 'quiz') tick().then(() => inputs[0]?.focus());
  });

  async function tryValidate() {
    if (app.validate()) return;
    await tick();
    inputs[app.answers.findIndex((a) => !a.trim())]?.focus();
  }

  function onKey(e: KeyboardEvent, i: number) {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      const input = e.currentTarget as HTMLInputElement;
      const pos = input.selectionStart ?? 0;
      if (pos !== input.selectionEnd) return;
      const next = cycleAccent(input.value, pos, app.settings.lang, e.key === 'ArrowUp' ? 1 : -1);
      if (next === null) return;
      e.preventDefault();
      app.answers[i] = next;
      input.value = next; // update now so the cursor can be put back right away
      input.setSelectionRange(pos, pos);
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) tryValidate();
    else if (i + 1 < total) inputs[i + 1]?.focus();
    else tryValidate();
  }
</script>

<section>
  <div class="head">
    <div class="title">
      <h1>Conjugate</h1>
      <span class="mono count">{app.filled}/{total}</span>
    </div>
    <div class="actions">
      <span class="hint" class:warn={app.showBlanks && blanks > 0} aria-live="polite">
        {#if blanks === 0}All answered{:else if app.showBlanks}Fill the {blanks} blank {blanks === 1 ? 'field' : 'fields'} to validate{:else}{blanks} blank{/if}
      </span>
      <button type="button" class="btn-primary" onclick={tryValidate}>Validate</button>
    </div>
  </div>
  <div class="bar" aria-hidden="true"><div style:width="{progress}%"></div></div>

  <ol class="grid">
    {#each app.quiz as item, i (item.key)}
      {@const blank = app.showBlanks && !app.answers[i].trim()}
      <li class="card" class:blank>
        <div class="meta mono">
          <span>#{String(i + 1).padStart(2, '0')}</span>
          <span>{item.tense.mood} · {item.tense.name}</span>
        </div>
        <label for="q{i}" class="prompt">
          {#if promptLabel(item)}<span class="pron">{promptLabel(item)}</span>{/if}
          <strong title={item.verb.en}>{item.verb.inf}</strong>
        </label>
        <div class="field">
          {#if item.tense.answerPrefix}<span class="prefix mono">{item.tense.answerPrefix}</span>{/if}
          <input
            id="q{i}"
            bind:this={inputs[i]}
            bind:value={app.answers[i]}
            onkeydown={(e) => onKey(e, i)}
            class="text-input mono"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            aria-invalid={blank}
          />
        </div>
      </li>
    {/each}
  </ol>
</section>

<style>
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .title {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
  }
  .count {
    font-size: 14px;
    color: var(--muted);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .warn {
    color: var(--bad);
    font-weight: 500;
  }
  .bar {
    margin-top: 14px;
    height: 3px;
    border-radius: 999px;
    background: var(--divider);
    overflow: hidden;
  }
  .bar div {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s ease;
  }
  .grid {
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--card);
  }
  .card.blank {
    border-color: var(--bad-bd);
  }
  .card.blank .text-input {
    border-color: var(--bad);
  }
  .meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
  }
  .prompt {
    font-size: 18px;
  }
  .pron {
    color: var(--muted);
    margin-right: 6px;
  }
  strong {
    font-weight: 600;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .prefix {
    font-size: 16px;
    color: var(--muted);
  }
  .field input {
    flex: 1;
    min-width: 0;
    height: 42px;
    font-size: 16px;
  }
</style>
