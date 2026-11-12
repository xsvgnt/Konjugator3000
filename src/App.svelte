<script lang="ts">
  import { app } from './lib/app.svelte';
  import { theme } from './lib/theme.svelte';
  import SetupPanel from './lib/components/SetupPanel.svelte';
  import SessionPanel from './lib/components/SessionPanel.svelte';
  import VerbTable from './lib/components/VerbTable.svelte';
  import QuizGrid from './lib/components/QuizGrid.svelte';
  import Results from './lib/components/Results.svelte';
  import Progress from './lib/components/Progress.svelte';
  import Endings from './lib/components/Endings.svelte';
  import Icon from './lib/components/Icon.svelte';

  app.init();

  const themeLabel = $derived(
    theme.choice === 'auto' ? 'Theme: follows system' : theme.choice === 'light' ? 'Theme: light' : 'Theme: dark'
  );
</script>

<header class="topbar">
  <span class="logo mono">konjugator<span class="slash">/</span>3000</span>
  <nav class="tabs" aria-label="Sections">
    <button type="button" aria-current={app.view === 'practice' ? 'page' : undefined} onclick={() => (app.view = 'practice')}>
      Practice
    </button>
    <button type="button" aria-current={app.view === 'progress' ? 'page' : undefined} onclick={() => (app.view = 'progress')}>
      Progress
    </button>
    <button type="button" aria-current={app.view === 'endings' ? 'page' : undefined} onclick={() => (app.view = 'endings')}>
      Endings
    </button>
  </nav>
  <div class="top-right">
    {#if app.view === 'practice' && app.screen === 'quiz'}
      <span class="keys" title="Press ↑ after a letter to cycle its accents (e → è → é), ↓ to go back"><kbd>↑</kbd><kbd>↓</kbd> accent</span>
      <span class="keys"><kbd>Enter</kbd> next field</span>
      <span class="keys"><kbd>Ctrl</kbd><kbd>Enter</kbd> validate</span>
    {/if}
    <button type="button" class="icon-btn" onclick={() => theme.cycle()} aria-label={themeLabel} title={themeLabel}>
      <Icon name={theme.choice === 'auto' ? 'auto' : theme.choice === 'light' ? 'sun' : 'moon'} />
    </button>
  </div>
</header>

{#if !app.ready}
  <p class="loading">Loading…</p>
{:else if app.error}
  <p class="loading">Could not load the app: {app.error}</p>
{:else if app.view === 'progress'}
  <Progress />
{:else if app.view === 'endings'}
  <Endings />
{:else}
  <div class="layout">
    <aside class="side">
      {#if app.screen === 'setup'}
        <SetupPanel />
      {:else}
        <SessionPanel />
      {/if}
    </aside>
    <main class="main">
      {#if app.screen === 'setup'}
        <VerbTable />
      {:else if app.screen === 'quiz'}
        <QuizGrid />
      {:else}
        <Results />
      {/if}
    </main>
  </div>
{/if}

<style>
  .topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    padding: 10px 24px;
    border-bottom: 1px solid var(--divider);
    background: var(--bg);
  }
  .logo {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .slash {
    color: var(--accent);
  }
  .tabs {
    display: flex;
    gap: 4px;
  }
  .tabs button {
    min-height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--muted);
    font-size: 14px;
    font-weight: 500;
  }
  .tabs button:hover {
    color: var(--ink);
  }
  .tabs button[aria-current='page'] {
    background: var(--card);
    color: var(--ink);
    box-shadow: inset 0 0 0 1px var(--line);
  }
  .top-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--muted);
  }
  .keys {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .icon-btn {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: transparent;
    color: var(--ink);
  }
  .layout {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    min-height: calc(100vh - 57px);
  }
  .side {
    flex: 1 1 300px;
    max-width: 380px;
    padding: 24px;
    border-right: 1px solid var(--divider);
    background: var(--panel);
  }
  .main {
    flex: 999 1 560px;
    min-width: 0;
    padding: 28px 32px 64px;
  }
  .loading {
    padding: 48px 32px;
    color: var(--muted);
  }
  @media (max-width: 900px) {
    .side {
      max-width: none;
      border-right: none;
      border-bottom: 1px solid var(--divider);
    }
    .main {
      padding: 24px 16px 48px;
    }
  }
</style>
