<script lang="ts">
  import { app } from '../app.svelte';
  import { LANGUAGES } from '../languages';
  import { exportBackup, importBackup } from '../storage';

  let message = $state('');
  let fileInput: HTMLInputElement;

  const lang = $derived(app.settings.lang);
  const sessions = $derived(app.sessions.filter((s) => s.lang === lang).slice().reverse());
  const totals = $derived.by(() => {
    const t = { answered: 0, correct: 0, passable: 0, wrong: 0 };
    for (const s of sessions) {
      t.answered += s.total;
      t.correct += s.correct;
      t.passable += s.passable;
      t.wrong += s.wrong;
    }
    return t;
  });
  const pct = (x: number, of: number) => (of ? Math.round((x / of) * 100) : 0);

  /** Items the user struggles with most, described in words. */
  const hardest = $derived.by(() => {
    const data = app.data;
    if (!data) return [];
    return Object.entries(app.stats)
      .filter(([, s]) => s.w > 1)
      .sort((a, b) => b[1].w - a[1].w)
      .slice(0, 15)
      .flatMap(([key, s]) => {
        const [inf, tenseId, person] = key.split('|');
        const verb = data.verbs.find((v) => v.inf === inf);
        const tense = data.tenses.find((t) => t.id === tenseId);
        if (!verb || !tense) return [];
        const answers = verb.forms[tense.id]?.[Number(person)] ?? [];
        const pronoun = tense.personal ? [tense.promptPrefix, data.pronouns[Number(person)]].filter(Boolean).join(' ') : '';
        return [{ key, verb, tense, pronoun, answer: answers.join(' / '), s }];
      });
  });

  const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  async function doExport() {
    const blob = await exportBackup(LANGUAGES.map((l) => l.code));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `konjugator3000-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    message = 'Backup downloaded.';
  }

  async function doImport(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!confirm('Replace your current progress with this backup?')) {
      fileInput.value = '';
      return;
    }
    try {
      await importBackup(await file.text());
      await app.reloadAfterImport();
      message = 'Backup restored.';
    } catch (err) {
      message = err instanceof Error ? err.message : 'Could not read this file.';
    }
    fileInput.value = '';
  }

  async function doReset() {
    const name = app.data?.name ?? lang;
    if (!confirm(`Erase all ${name} progress (weights and session history)? This cannot be undone.`)) return;
    await app.resetProgress(lang);
    message = `${name} progress erased.`;
  }
</script>

<div class="page">
  <div class="head">
    <h1>Progress</h1>
    <div class="seg" role="group" aria-label="Language">
      {#each LANGUAGES as l (l.code)}
        <button type="button" aria-pressed={lang === l.code} onclick={() => app.setLanguage(l.code)}>{l.name}</button>
      {/each}
    </div>
  </div>

  <div class="tiles">
    <div class="tile"><span class="label">Quizzes</span><span class="big mono">{sessions.length}</span></div>
    <div class="tile"><span class="label">Answers</span><span class="big mono">{totals.answered}</span></div>
    <div class="tile is-correct"><span class="label">Correct</span><span class="big mono">{pct(totals.correct, totals.answered)}%</span></div>
    <div class="tile is-passable"><span class="label">Passable</span><span class="big mono">{pct(totals.passable, totals.answered)}%</span></div>
    <div class="tile is-wrong"><span class="label">Wrong</span><span class="big mono">{pct(totals.wrong, totals.answered)}%</span></div>
  </div>

  <div class="cols">
    <section class="box">
      <h2>Hardest right now</h2>
      <p class="hint">These come up most often in your quizzes.</p>
      {#if hardest.length}
        <ol class="list">
          {#each hardest as h (h.key)}
            <li>
              <span>
                {#if h.pronoun}<span class="dim">{h.pronoun}</span>{/if}
                <strong>{h.verb.inf}</strong>
                <span class="dim">· {h.tense.mood} {h.tense.name.toLowerCase()}</span>
              </span>
              <span class="mono answer">{h.answer}</span>
              <span class="mono score" title="correct / passable / wrong">
                <span class="is-correct">{h.s.correct}</span>/<span class="is-passable">{h.s.passable}</span>/<span class="is-wrong">{h.s.wrong}</span>
              </span>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="empty">Nothing yet. Mistakes you make will show up here.</p>
      {/if}
    </section>

    <section class="box">
      <h2>Recent quizzes</h2>
      {#if sessions.length}
        <ol class="list">
          {#each sessions.slice(0, 20) as s (s.at)}
            <li>
              <span class="dim">{dateFmt.format(s.at)}</span>
              <span class="mini" role="img" aria-label="{s.correct} correct, {s.passable} passable, {s.wrong} wrong">
                <span style:width="{pct(s.correct, s.total)}%" style:background="var(--ok-bar)"></span>
                <span style:width="{pct(s.passable, s.total)}%" style:background="var(--pass-bar)"></span>
                <span style:width="{pct(s.wrong, s.total)}%" style:background="var(--bad-bar)"></span>
              </span>
              <span class="mono">{s.correct}/{s.total}</span>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="empty">No quiz finished yet in {app.data?.name}.</p>
      {/if}
    </section>
  </div>

  <section class="box data">
    <h2>Your data</h2>
    <p class="hint">Progress is saved in this browser only. Export a backup to keep it safe or move it to another computer.</p>
    <div class="row">
      <button type="button" class="btn" onclick={doExport}>Export backup</button>
      <button type="button" class="btn" onclick={() => fileInput.click()}>Import backup…</button>
      <input bind:this={fileInput} type="file" accept="application/json,.json" class="sr-only" tabindex="-1" onchange={doImport} />
      <button type="button" class="btn btn-danger" onclick={doReset}>Reset {app.data?.name} progress</button>
    </div>
    {#if message}<p class="msg" aria-live="polite">{message}</p>{/if}
  </section>
</div>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .head .seg {
    min-width: 240px;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--s-bd, var(--line));
    background: var(--s-bg, var(--card));
  }
  .tile .big {
    font-size: 26px;
    font-weight: 600;
    color: var(--s-fg, var(--ink));
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 16px;
  }
  .box {
    padding: 18px 20px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--card);
  }
  .list {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
  }
  .list li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-top: 1px solid var(--divider);
    font-size: 14px;
  }
  .list li > :first-child {
    flex: 1;
    min-width: 0;
  }
  .answer {
    color: var(--subtle);
  }
  .score .is-correct,
  .score .is-passable,
  .score .is-wrong {
    color: var(--s-fg);
  }
  .dim {
    color: var(--muted);
  }
  .mini {
    display: flex;
    gap: 1px;
    width: 120px;
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
    background: var(--divider);
  }
  .empty {
    margin: 12px 0 0;
    color: var(--muted);
    font-size: 14px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .msg {
    margin: 12px 0 0;
    font-size: 14px;
  }
  @media (max-width: 640px) {
    .page {
      padding: 24px 16px 48px;
    }
    .cols {
      grid-template-columns: 1fr;
    }
  }
</style>
