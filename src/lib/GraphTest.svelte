<script lang="ts">
import { onMount } from 'svelte';
import { graphObjectStore } from '../store/GraphStore';
import type { Graph } from '../model/graph/graph';

let graphDiv: HTMLDivElement;

let graph: Graph = $graphObjectStore;

graphObjectStore.subscribe((obj) => {
  graph = obj;
  
  if (graphDiv) {
    updateGraph();
  }

});

onMount(() => {
  updateGraph();
});

function updateGraph() {
  // TODO: Test graph
}

</script>

<div id="graph" bind:this={graphDiv} />

<style>
#graph {
  width: 100%;
  height: 100%;
}
</style>