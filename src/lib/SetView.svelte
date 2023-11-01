<script lang="ts">
import { onMount } from "svelte";
import { graphObjectStore } from "../store/GraphStore";
import type { Graph } from "../model/graph";
import SetViewItem from "./SetViewItem.svelte";

let graph: Graph;

let isContextMenuOpen: boolean = false;

let contextSet: Graph;

onMount(() => {
    // Subscribe to the graphObjectStore and update the 'graph' variable with the data.
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    // Clean up the subscription when the component is unmounted.
    return unsubscribe;
});

function openContextMenu(set: Graph) {
  isContextMenuOpen = true;
  contextSet = set;
}

function closeContextMenu() {
  isContextMenuOpen = false;
}

$: hasGraph = graph && graph.vertices.length != 0; 

</script>
<div class="setview-container">
  <h2>Graph Sets</h2>
  {#if hasGraph}
    <div class="set-container">
      {#each graph.sets as set (set.name)}
        <SetViewItem set={set}/>
      {/each}
    </div>
  {:else}
    No graph found.
  {/if}
</div>


<style>
.setview-container {
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

</style>