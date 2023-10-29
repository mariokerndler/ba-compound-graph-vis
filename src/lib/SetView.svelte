<script lang="ts">
import { onMount } from "svelte";
import { graphObjectStore } from "../store/GraphStore";
import type { Graph } from "../model/graph";
  import SetViewContextMenu from "./SetViewContextMenu.svelte";

let graph: Graph;
let graphList: Graph[] = [];

let isContextMenuOpen: boolean = false;
let contextMenuX: number = 0;
let contextMenuY: number = 0;

onMount(() => {
    // Subscribe to the graphObjectStore and update the 'graph' variable with the data.
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    // Clean up the subscription when the component is unmounted.
    return unsubscribe;
});

function addSet(set: Graph) {
  graphList = [...graphList, set];
}

function openContextMenu(event: MouseEvent, x: number, y: number) {
  contextMenuX = x;
  contextMenuY = y;
  isContextMenuOpen = true;
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
      <button 
        class="set"
        on:click={(event) => openContextMenu(event, event.clientX, event.clientY)}>
        
        {set.name} ({set.vertices.length} nodes)
        
        {#if isContextMenuOpen}
        <SetViewContextMenu x={contextMenuX} y={contextMenuY} on:close={closeContextMenu} />
        {/if}
      </button>
      {/each}
    </div>
  {:else}
    No graph found.
  {/if}
  

</div>

<!--
<div class="setContainer">
  
    <div class="setView">

      {#each graph.sets as set (set.name)}
      <div class="set">
        <button on:click={() => addSet(set)}>
          {set.name} ({set.vertices.length} nodes)
        </button>
      </div>
    {/each}
    </div>
  
</div>
-->

<style>
.setview-container {
  background: white;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.set-container {
  
}

.set {
  background: #2c3e50;
  color: white;
  padding: 5px;
  margin-bottom: 2px;
  border: none;
  text-decoration: none;
}
</style>