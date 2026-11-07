<script lang="ts">
  import { app } from '../app.svelte';
  import { normalize, stripAccents } from '../grading';

  let query = $state('');
  const groupLabel = $derived(new Map((app.data?.groups ?? []).map((g) => [g.id, g.label])));

  const shown = $derived.by(() => {
    const q = stripAccents(query);
    if (!q) return app.groupVerbs;
    return app.groupVerbs.filter((v) => stripAccents(v.inf).includes(q) || normalize(v.en).includes(normalize(query)));
  });
</script>

<section>
  <div class="head">
    <div>
      <h1>{app.data?.name} verbs</h1>
      <p class="hint">{app.verbs.length} of {app.groupVerbs.length} selected · untick any verb you want to leave out</p>
    </div>
    <div class="tools">
      <label class="sr-only" for="verb-search">Search verbs</label>
      <input id="verb-search" class="text-input" type="search" placeholder="Search a verb or meaning…" bind:value={query} />
      <button type="button" class="btn" onclick={() => app.setVerbs(shown.map((v) => v.inf), true)}>All</button>
      <button type="button" class="btn" onclick={() => app.setVerbs(shown.map((v) => v.inf), false)}>None</button>
    </div>
  </div>

  {#if app.groupVerbs.length === 0}
    <p class="empty">Select a verb group on the left to see its verbs.</p>
  {:else}
    <div class="table">
      <div class="row header" aria-hidden="true">
        <span>Use</span><span>Infinitive</span><span>English</span><span>Group</span>
      </div>
      <ul>
        {#each shown as v (v.inf)}
          <li>
            <label class="row">
              <input type="checkbox" checked={!app.isExcluded(v.inf)} onchange={() => app.toggleVerb(v.inf)} />
              <span class="mono inf">{v.inf}</span>
              <span class="en">{v.en}</span>
              <span class="badge">{groupLabel.get(v.group) ?? v.group}</span>
            </label>
          </li>
        {:else}
          <li class="empty">No verb matches “{query}”.</li>
        {/each}
      </ul>
    </div>
  {/if}
</section>

<style>
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  h1 {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .tools {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .tools input {
    width: 240px;
    max-width: 100%;
  }
  .table {
    border: 1px solid var(--divider);
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--card);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) minmax(0, 1.4fr) 150px;
    gap: 12px;
    align-items: center;
    padding: 9px 16px;
  }
  label.row {
    border-top: 1px solid var(--divider);
    cursor: pointer;
  }
  label.row:hover {
    background: var(--accent-soft);
  }
  .header {
    background: var(--panel);
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--accent);
  }
  .inf {
    font-size: 15px;
    font-weight: 500;
  }
  .en {
    font-size: 14px;
    color: var(--subtle);
  }
  .badge {
    white-space: nowrap;
    justify-self: start;
    font-size: 12px;
    padding: 1px 8px;
    border-radius: 6px;
    border: 1px solid var(--line);
    color: var(--muted);
  }
  .empty {
    padding: 24px 16px;
    color: var(--muted);
  }
  @media (max-width: 640px) {
    .row {
      grid-template-columns: 32px minmax(0, 1fr) minmax(0, 1.2fr);
    }
    .badge,
    .header span:last-child {
      display: none;
    }
  }
</style>
