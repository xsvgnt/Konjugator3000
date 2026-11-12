<script lang="ts">
  import { tenseShape } from '../tenseStyle';
  // The time-of-tense marker (see tenseStyle.ts). Decorative: the tense name is always next to it.
  let { id }: { id: string } = $props();
  const s = $derived(tenseShape(id));
</script>

{#if s}
  <svg class="shape" class:hollow={s.hollow} viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
    {#if s.shape === 'circle'}
      <circle cx="6" cy="6" r="4.6" />
    {:else if s.shape === 'square'}
      <rect x="1.6" y="1.6" width="8.8" height="8.8" />
    {:else if s.shape === 'triangle'}
      <polygon points="6,1.2 11.2,10.6 0.8,10.6" />
    {:else if s.shape === 'diamond'}
      <polygon points="6,0.6 11.4,6 6,11.4 0.6,6" />
    {:else if s.shape === 'pentagon'}
      <polygon points="6,0.9 11.3,4.8 9.3,11 2.7,11 0.7,4.8" />
    {:else}
      <line x1="1" y1="6" x2="11" y2="6" />
    {/if}
  </svg>
{/if}

<style>
  .shape {
    flex: none;
    display: inline-block;
    vertical-align: -1px;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 0;
    overflow: visible;
  }
  .shape.hollow {
    fill: none;
    stroke-width: 1.6;
  }
  line {
    stroke-width: 2;
  }
</style>
