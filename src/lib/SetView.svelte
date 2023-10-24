<script lang="ts">
import { onMount } from "svelte";
import { get } from "svelte/store";
import { defineGraphWithDefaults, type Graph } from "../model/graph/graph";
import { graphObjectStore } from "../store/GraphStore";
import { CombineGraphs } from "../util/GraphUtil";
  import GraphView from "./GraphView.svelte";

let graph: Graph;

let selectedGraph: Graph;

let allGraph: Graph = defineGraphWithDefaults();

onMount(() => {
    // Subscribe to the graphObjectStore and update the 'graph' variable with the data.
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
      
      graph.sets.forEach((set) => {
        allGraph = CombineGraphs(allGraph, set);
      }); 
    });
    
    // Clean up the subscription when the component is unmounted.
    return unsubscribe;
});

function toggleSet(set: Graph): any {
  if (selectedGraph) {
    selectedGraph = CombineGraphs(selectedGraph, set);
  } else {
    selectedGraph = set;
  }
}

</script>

<h1>Graph Sets</h1>
<div class="setContainer">
  {#if graph}
    <div class="setView">
      {#if allGraph}
      <div class="set">
        <button on:click={() => toggleSet(allGraph)}>
          All ({allGraph.vertices.length} nodes)
        </button>
      </div>
      {/if}
    
      {#each graph.sets as set (set.name)}
      <div class="set">
        <button on:click={() => toggleSet(set)}>
          {set.name} ({set.vertices.length} nodes)
        </button>
      </div>
    {/each}
    </div>
  {/if}
  
  <GraphView graph={selectedGraph} width={1000} height={600}/>
</div>

<style>
.setView {
  display: flex;
  flex-wrap: wrap;
}

</style>