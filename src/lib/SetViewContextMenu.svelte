<script lang="ts">
import { createEventDispatcher } from "svelte";

export let x: number;
export let y: number;

const dispatch = createEventDispatcher();

function closeContextMenu() {
    dispatch("close");
}
</script>

<div class="setview-context-menu" style="top: {y}px; left: {x}px;">
    <button on:click={closeContextMenu}>Close</button>
</div>

<style>
    .context-menu {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    }
  </style>