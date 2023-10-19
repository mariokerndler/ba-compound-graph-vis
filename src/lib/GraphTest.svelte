<script lang="ts">

import { defineGraph, defineLink, defineNode, GraphController } from 'd3-graph-controller';
import { type CustomType, type CustomNode, type CustomLink, CustomConfig, type CustomGraph } from '../types/Graph';
import { onMount } from 'svelte';
  import { graphObjectStore } from '../store/GraphStore';

let graphDiv: HTMLDivElement;

let graph: CustomGraph = $graphObjectStore;

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
  const controller = new GraphController(graphDiv, graph, CustomConfig);
}

</script>

<div id="graph" bind:this={graphDiv} />

<style>
#graph {
  width: 100%;
  height: 100%;
}
</style>