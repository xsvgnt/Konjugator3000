<script lang="ts">
  type Name = 'check' | 'wave' | 'x' | 'sun' | 'moon' | 'auto' | 'up' | 'down';
  let { name, size = 16 }: { name: Name; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.4"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'check'}
    <polyline points="20 6 9 17 4 12" />
  {:else if name === 'wave'}
    <path d="M3 13c3-4 6-4 9 0s6 4 9 0" />
  {:else if name === 'x'}
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  {:else if name === 'moon'}
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  {:else if name === 'auto'}
    <circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
  {:else if name === 'up'}
    <polyline points="6 14 12 8 18 14" />
  {:else if name === 'down'}
    <polyline points="6 10 12 16 18 10" />
  {/if}
</svg>
