<script lang="ts">
  import { onMount } from 'svelte';
  // In-page confirmation, used instead of confirm(): some browsers and embedded views block native dialogs.
  interface Props {
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
  }
  let { message, confirmLabel, cancelLabel = 'Cancel', onconfirm, oncancel }: Props = $props();
  const id = `confirm-${Math.random().toString(36).slice(2, 8)}`;

  // Focus the safe choice, so Enter or Space doesn't destroy anything.
  let cancelButton: HTMLButtonElement;
  onMount(() => cancelButton.focus());
</script>

<div class="confirm" role="alertdialog" aria-labelledby={id}>
  <p {id}>{message}</p>
  <div class="actions">
    <button type="button" class="btn btn-danger" onclick={onconfirm}>{confirmLabel}</button>
    <button type="button" class="btn" onclick={oncancel} bind:this={cancelButton}>{cancelLabel}</button>
  </div>
</div>

<style>
  .confirm {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 420px;
    padding: 12px;
    border: 1px solid var(--bad-bd);
    border-radius: 10px;
    background: var(--bad-bg);
  }
  p {
    margin: 0;
    font-size: 14px;
  }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .btn {
    min-height: 40px;
    background: var(--card);
  }
</style>
