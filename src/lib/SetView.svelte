<script lang="ts">
import { onMount } from "svelte";
import { get } from "svelte/store";
  import type { Graph } from "../model/graph/graph";
  import { graphObjectStore } from "../store/GraphStore";
  import { CombineGraphs } from "../util/GraphUtil";

let graph: Graph;

onMount(() => {
    // Subscribe to the graphObjectStore and update the 'graph' variable with the data.
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    // Clean up the subscription when the component is unmounted.
    return unsubscribe;
});

function toggleSet(set: Graph): any {
  const test: Graph = CombineGraphs(graph.sets[0], graph.sets[1]);
  console.log(test);
}

</script>

{#if graph}
  <h1>Graph Sets</h1>
  <ul>
    {#each graph.sets as set (set.name)}
      <li>
        <button on:click={() => toggleSet(set)}>
          {set.name} ({set.vertices.length} nodes)
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>



</style>