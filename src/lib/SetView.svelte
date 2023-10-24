<script lang="ts">
import { onMount } from "svelte";
import { get } from "svelte/store";
  import type { Graph } from "../model/graph/graph";
  import type { GraphSet } from "../model/graph/set";
  import { graphObjectStore } from "../store/GraphStore";

let graph: Graph;
let expandedSet: GraphSet | null = null;

onMount(() => {
    // Subscribe to the graphObjectStore and update the 'graph' variable with the data.
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    // Clean up the subscription when the component is unmounted.
    return unsubscribe;
});

function toggleSet(set: GraphSet) {
    if (expandedSet === set) {
        expandedSet = null;
    } else {
        expandedSet = set;
    }   
}

function createSetComponent(set: GraphSet) {
    // Add code here to create a new component to display the set
    // You can use Svelte's {#if} directive to conditionally render it
    console.log(set);
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
        {#if expandedSet === set}
          {createSetComponent(set)}
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>



</style>