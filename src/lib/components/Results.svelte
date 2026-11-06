<script lang="ts">
  import { app } from '../app.svelte';
  import { promptLabel } from '../quiz';
  import type { Grade } from '../types';
  import Icon from './Icon.svelte';

  const LABEL: Record<Grade, string> = { correct: 'Correct', passable: 'Passable', wrong: 'Wrong' };
  const ICON: Record<Grade, 'check' | 'wave' | 'x'> = { correct: 'check', passable: 'wave', wrong: 'x' };

  const total = $derived(app.quiz.length);
  const n = $derived({
    correct: app.grades.filter((g) => g === 'correct').length,
    passable: app.grades.filter((g) => g === 'passable').length,
    wrong: app.grades.filter((g) => g === 'wrong').length
  });
  const pct = (x: number) => (total ? (x / total) * 100 : 0);
</script>

<section>
  <div class="head">
    <h1>{n.correct} / {total} correct</h1>
    <div class="actions">
      <button type="button" class="btn" onclick={() => app.backToSetup()}>Change settings</button>
      <button type="button" class="btn-primary" onclick={() => app.start()}>New quiz, same settings</button>
    </div>
  </div>

  <div class="split" role="img" aria-label="{n.correct} correct, {n.passable} passable, {n.wrong} wrong">
    <div style:width="{pct(n.correct)}%" style:background="var(--ok-bar)"></div>
    <div style:width="{pct(n.passable)}%" style:background="var(--pass-bar)"></div>
    <div style:width="{pct(n.wrong)}%" style:background="var(--bad-bar)"></div>
  </div>
  <div class="legend">
    <span class="is-correct"><Icon name="check" size={14} />{n.correct} correct</span>
    <span class="is-passable"><Icon name="wave" size={14} />{n.passable} passable</span>
    <span class="is-wrong"><Icon name="x" size={14} />{n.wrong} wrong</span>
  </div>

  <ol class="grid">
    {#each app.quiz as item, i (item.key)}
      {@const g = app.grades[i]}
      <li class="card is-{g}">
        <div class="meta mono">
          <span>#{String(i + 1).padStart(2, '0')} · {item.tense.mood} · {item.tense.name}</span>
          <span class="status"><Icon name={ICON[g]} size={12} />{LABEL[g]}</span>
        </div>
        <span class="prompt">
          {#if promptLabel(item)}<span class="pron">{promptLabel(item)}</span>{/if}
          <strong>{item.verb.inf}</strong>
        </span>
        <div class="answer mono">
          {#if item.tense.answerPrefix}<span class="dim">{item.tense.answerPrefix}</span>{/if}
          {#if g === 'correct'}
            <span>{app.answers[i].trim()}</span>
          {:else}
            <span class:struck={g === 'wrong'} class:dim={g === 'wrong'}>{app.answers[i].trim()}</span>
            <span class="dim">→</span>
            <span class="expected">{item.answers.join(' / ')}</span>
          {/if}
        </div>
        <span class="weight">
          <Icon name={g === 'correct' ? 'down' : 'up'} size={12} />
          {g === 'correct' ? 'Will come up less often' : 'Will come up more often'}
        </span>
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
  h1 {
    font-size: 24px;
    font-weight: 600;
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .actions .btn {
    min-height: 44px;
  }
  .split {
    margin-top: 18px;
    display: flex;
    gap: 2px;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--divider);
  }
  .legend {
    margin-top: 10px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    font-size: 14px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--s-fg);
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
    gap: 8px;
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--s-bd);
    background: var(--s-bg);
  }
  .meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--muted);
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--s-fg);
    font-weight: 600;
    white-space: nowrap;
  }
  .prompt {
    font-size: 16px;
  }
  .pron {
    color: var(--muted);
    margin-right: 6px;
  }
  strong {
    font-weight: 600;
  }
  .answer {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 16px;
  }
  .dim {
    color: var(--muted);
  }
  .struck {
    text-decoration: line-through;
  }
  .expected {
    color: var(--s-fg);
    font-weight: 600;
  }
  .weight {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--muted);
  }
</style>
