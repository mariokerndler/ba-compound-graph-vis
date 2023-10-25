<script lang="ts">
import { onMount } from "svelte";
import { get } from "svelte/store";
import { defineGraphWithDefaults, type Graph } from "../model/graph/graph";
import { graphObjectStore } from "../store/GraphStore";
import { CombineGraphs } from "../util/GraphUtil";
import LocalTopologyView from "./LocalTopologyView.svelte";

let graph: Graph;

let graphList: Graph[] = [];

let showDisconnected: boolean = false;

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

</script>

<h1>Graph Sets</h1>

<div class="disconnected">
  Show disconnected vertices?
  <input type="checkbox" bind:checked={showDisconnected}/>
</div>


<div class="setContainer">
  {#if graph}
    <div class="setView">

      {#each graph.sets as set (set.name)}
      <div class="set">
        <button on:click={() => addSet(set)}>
          {set.name} ({set.vertices.length} nodes)
        </button>
      </div>
    {/each}
    </div>
  {/if}
  
  <!--<GraphView graph={selectedGraph} width={1000} height={600}/>-->
  <LocalTopologyView graphs={graphList} showDisconnected={showDisconnected} width={1000} height={600}/>
</div>

<style>
.setView {
  display: flex;
  flex-wrap: wrap;
}

.disconnected {
  margin-bottom: 5px;
}

</style>