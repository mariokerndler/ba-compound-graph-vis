<script lang="ts">
import { onMount } from "svelte";
import type { Graph } from "../model/graph";
import { graphObjectStore } from "../store/GraphStore";
import { maxSets } from "../util/Globals";
import SetViewItem from "./SetViewItem.svelte";

let graph: Graph;

let totalSets: number = 0;

onMount(() => {
    const unsubscribe = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    return unsubscribe;
});

$: hasGraph = graph && graph.vertices.length != 0; 

</script>
<div class="setview-container">
  <div class="setview-header">
    <h2>Graph Sets</h2>
    <h3 style="color:{totalSets < maxSets ? "#2c3e50" : "red"}">{totalSets} / {maxSets}</h3>
  </div>
  
  {#if hasGraph}
    <div class="info-container">
      <b>Edges:</b> {graph.edges.length}, <b>Vertices:</b> {graph.vertices.length}
    </div>
    <div class="set-container">
      {#each graph.sets as set (set.name)}
        <SetViewItem set={set} increaseTotalSets={() => totalSets += 1}  decreaseTotalSets={() => totalSets -= 1}/>
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

.info-container {
  margin-bottom: 5px;
}


</style>