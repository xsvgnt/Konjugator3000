<script lang="ts">
  import { app } from '../app.svelte';
  import { LANGUAGES, loadLanguage } from '../languages';
  import { tensesByBlock } from '../quiz';
  import { ENDINGS, parseCell } from '../endings';
  import type { LanguageData } from '../types';

  // Opens on the language picked in Practice; switching here doesn't change it.
  let lang = $state(app.settings.lang);
  let data = $state.raw<LanguageData | null>(null);

  $effect(() => {
    const code = lang;
    loadLanguage(code).then((d) => {
      if (code === lang) data = d;
    });
  });

  const endings = $derived(ENDINGS[lang] ?? {});
  const blocks = $derived(
    data ? tensesByBlock(data.tenses.filter((t) => endings[t.id])) : []
  );

  const blockId = (block: string) => `endings-${block.toLowerCase().replace(/\W+/g, '-')}`;

  function jump(block: string) {
    document.getElementById(blockId(block))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<div class="layout">
  <aside class="side">
    <div class="sticky">
      <section>
        <h2 class="label">Language</h2>
        <div class="seg" role="group" aria-label="Language">
          {#each LANGUAGES as l (l.code)}
            <button type="button" aria-pressed={lang === l.code} onclick={() => (lang = l.code)}>{l.name}</button>
          {/each}
        </div>
      </section>
      <nav aria-label="Tense blocks">
        <h2 class="label">Jump to</h2>
        <ul>
          {#each blocks as b (b.block)}
            <li><button type="button" onclick={() => jump(b.block)}>{b.block}</button></li>
          {/each}
        </ul>
      </nav>
    </div>
  </aside>

  <main class="main">
    <div class="intro">
      <h1>{data?.name ?? ''} endings</h1>
      <p class="hint">Regular endings, shown on model verbs. The highlighted part is what changes.</p>
    </div>

    {#if data}
      {#each blocks as b (b.block)}
        <section class="block" id={blockId(b.block)}>
          <h2 class="block-title">{b.block}</h2>
          <div class="cards">
            {#each b.tenses as t (t.id)}
              {@const e = endings[t.id]}
              {@const persons = t.personal
                ? data.pronouns.map((_, i) => i).filter((i) => e.columns.some((c) => c.cells[i] !== null))
                : [0]}
              <article class="card">
                <h3>{t.name}{#if t.block !== t.mood}<span class="mood">{` · ${t.mood}`}</span>{/if}</h3>
                <table>
                  <thead>
                    <tr>
                      {#if t.personal}<th class="who"><span class="sr-only">Person</span></th>{/if}
                      {#each e.columns as c (c.head + c.verb)}
                        <th>{c.head}<span class="model">{c.verb}</span></th>
                      {/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each persons as i (i)}
                      <tr>
                        {#if t.personal}
                          <td class="who">{[t.promptPrefix, data.pronouns[i]].filter(Boolean).join(' ')}</td>
                        {/if}
                        {#each e.columns as c (c.head + c.verb)}
                          {@const cell = c.cells[i]}
                          <td class="mono form">
                            {#if cell === null}
                              <span class="none">—</span>
                            {:else}
                              {#each parseCell(cell) as alt, k (k)}
                                {#if k > 0}<span class="or">{' / '}</span>{/if}
                                <span class="alt">
                                  {#if t.answerPrefix}<span class="prefix">{`${t.answerPrefix} `}</span>{/if}
                                  {#each alt as part, j (j)}{#if part.ending}<b>{part.text}</b>{:else}{part.text}{/if}{/each}
                                </span>
                              {/each}
                            {/if}
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
                {#if e.note}<p class="note">{e.note}</p>{/if}
              </article>
            {/each}
          </div>
        </section>
      {/each}
    {:else}
      <p class="hint">Loading…</p>
    {/if}
  </main>
</div>

<style>
  .layout {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    min-height: calc(100vh - 57px);
  }
  .side {
    flex: 1 1 220px;
    max-width: 280px;
    padding: 24px;
    border-right: 1px solid var(--divider);
    background: var(--panel);
  }
  .sticky {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .label {
    margin-bottom: 10px;
  }
  nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  nav button {
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 8px;
    background: none;
    text-align: left;
    font-size: 14px;
    color: var(--subtle);
  }
  nav button:hover {
    background: var(--accent-soft);
    color: var(--accent-ink);
  }
  .main {
    flex: 999 1 560px;
    min-width: 0;
    padding: 28px 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .block {
    scroll-margin-top: 16px;
  }
  .block-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr));
    gap: 14px;
  }
  .card {
    padding: 14px 16px;
    border: 1px solid var(--divider);
    border-radius: var(--radius);
    background: var(--card);
    overflow-x: auto;
  }
  h3 {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
  }
  .mood {
    font-weight: 400;
    color: var(--muted);
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    padding: 4px 8px 6px 0;
    text-align: left;
    vertical-align: bottom;
    font-size: 13px;
    font-weight: 600;
    color: var(--subtle);
    white-space: nowrap;
  }
  .model {
    display: block;
    font-size: 12px;
    font-weight: 400;
    color: var(--muted);
  }
  td {
    padding: 4px 8px 4px 0;
    border-top: 1px solid var(--divider);
    vertical-align: top;
  }
  .who {
    width: 1%;
    padding-right: 14px;
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }
  .form {
    font-size: 14px;
  }
  .alt {
    white-space: nowrap;
  }
  .form b {
    font-weight: 600;
    color: var(--accent);
  }
  .prefix,
  .or,
  .none {
    color: var(--muted);
  }
  .note {
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--subtle);
  }
  @media (max-width: 900px) {
    .side {
      max-width: none;
      border-right: none;
      border-bottom: 1px solid var(--divider);
    }
    .sticky {
      position: static;
    }
    .main {
      padding: 24px 16px 48px;
    }
  }
</style>
