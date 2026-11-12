<script lang="ts">
  import { app } from '../app.svelte';
  import ConfirmBox from './ConfirmBox.svelte';

  const tenseList = $derived(app.tenses.map((t) => `${t.mood} ${t.name.toLowerCase()}`).join(', '));
  const groups = $derived.by(() => {
    const all = app.data?.groups ?? [];
    const on = new Set(app.selectedGroups());
    if (on.size === all.length) return 'all groups';
    return all.filter((g) => on.has(g.id)).map((g) => g.label.toLowerCase()).join(', ');
  });

  let confirming = $state(false);

  function leave() {
    if (app.screen === 'quiz' && app.filled > 0 && !confirming) {
      confirming = true;
      return;
    }
    confirming = false;
    app.backToSetup();
  }
</script>

<div class="panel">
  <h2 class="label">Session</h2>
  <dl>
    <dt>Language</dt>
    <dd>{app.data?.name}</dd>
    <dt>Verbs</dt>
    <dd>{app.verbs.length} ({groups})</dd>
    <dt>Tenses</dt>
    <dd>{tenseList}</dd>
    <dt>Length</dt>
    <dd>{app.quiz.length} questions</dd>
  </dl>
  {#if confirming}
    <ConfirmBox
      message="Leave this quiz? Your {app.filled} {app.filled === 1 ? 'answer' : 'answers'} will be lost."
      confirmLabel="Leave quiz"
      cancelLabel="Keep going"
      onconfirm={leave}
      oncancel={() => (confirming = false)}
    />
  {:else}
    <button type="button" class="btn" onclick={leave}>
      {app.screen === 'quiz' ? 'Leave quiz' : 'Change settings'}
    </button>
  {/if}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  dl {
    margin: 0;
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 10px 12px;
    font-size: 14px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }
  .btn {
    min-height: 44px;
  }
</style>
