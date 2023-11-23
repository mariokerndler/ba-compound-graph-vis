<script lang="ts">
import { onDestroy, onMount } from "svelte";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from "../../model/graph";
import { graphObjectStore, localTopologyViewStore } from "../../store/GraphStore";
import { maxSets } from "../../util/Globals";
import SetViewItem from "./SetViewItem.svelte";

let graph: Graph;
let graphStoreUnsub: Unsubscriber;

let localTopologyUnsub: Unsubscriber;

let totalSets: number = 0;

let count = 0;

onMount(() => {
    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
    });
    
    localTopologyUnsub = localTopologyViewStore.subscribe($graphs => {
      totalSets = $graphs.length;
    });
});

onDestroy(() => {
  graphStoreUnsub();
  localTopologyUnsub();
})

function getTabIndex(): number {
  count += 1;
  return count;
}

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
        <SetViewItem 
          set={set} 
          tabindex={getTabIndex()}/>
      {/each}
    </div>
  {:else}
    No graph found.
  {/if}
</div>

<style>
.setview-container {
  margin-top: 5px;
  color: var(--darkblue);
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