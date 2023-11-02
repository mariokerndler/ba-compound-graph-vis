<script lang="ts">
import { onMount } from "svelte";
import { graphObjectStore, localTopologyViewStore } from "../store/GraphStore";
import type { Graph } from "../model/graph";
import SetViewItem from "./SetViewItem.svelte";

let graph: Graph;

onMount(() => {
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    return unsubscribe;
});

function addAll() {
  const sets: Graph[] = [];
  if (graph === undefined) return;
  
  graph.sets.forEach((set) => sets.push(set));

  localTopologyViewStore.set(sets);
}

$: hasGraph = graph && graph.vertices.length != 0; 
$: showAddAll = hasGraph && graph.sets.length <= 20;

</script>
<div class="setview-container">
  <div class="setview-header">
    <h2>Graph Sets</h2>
    {#if showAddAll}
      <button class="setview-addall-button" on:click={() => addAll()} title="Add all available sets to local-topology view.">Add all</button>
    {/if}
  </div>
  
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
  margin-top: 5px;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.setview-header {
  display: flex;
  justify-content: space-between;
}

.setview-addall-button {
  padding: 5px 10px;
  text-decoration: none;
  border: none;
  background: white;
  font-size: 1em;
  color: #2c3e50;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #2c3e50;
  height: 30px;
}

.setview-addall-button:hover {
  background-color: #f3f4f6;
}

</style>