<script lang="ts">
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from "../../model/graph";
import { GraphSearch } from "../../services/GraphSearch";
import { graphObjectStore, localTopologyViewStore } from "../../store/GraphStore";
import { maxSets } from "../../util/Globals";
import SetViewItem from "./SetViewItem.svelte";

let graph: Graph;
let graphStoreUnsub: Unsubscriber;

let totalSets: number = 0;
let localTopologyUnsub: Unsubscriber;

let count = 0;

let searchInput: string;
let setsToDisplay: Graph[] = [];

onMount(() => {
    graphStoreUnsub = graphObjectStore.subscribe(($graph) => {
      graph = $graph;
      
      resetSearch();
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

function resetSearch() {
  if (graph.sets && graph.sets.length > 0) {
    setsToDisplay = [];
    graph.sets.forEach(set => setsToDisplay.push(set));
  }
}

function startSearch() {
  if (!searchInput || searchInput.length <= 0 || searchInput.trim() === "") {
    resetSearch();
    return;
  }

  const [foundVertices, foundSets] = GraphSearch(searchInput.trim(), graph);
  
  setsToDisplay = [];
  
  if (foundVertices !== undefined) {  
    foundVertices.forEach(vertex => {
      vertex.sets.forEach(setName => {
        const foundSets = graph.sets.filter(set => set.name === setName);
        
        foundSets.forEach(set => {
          if (!setsToDisplay.includes(set)) {
            setsToDisplay.push(set);
          }
        });
      });
    });
  }
  
  if (foundSets !== undefined) {
    foundSets.forEach(set => {
      if (!setsToDisplay.includes(set)) {
        setsToDisplay.push(set);
      }
    })
  }
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
    <div class="search-container">
      <input type="text" class="setview-search-input" bind:value={searchInput} placeholder="Search..."/>
      <button class="button" on:click={() => startSearch()}>
        <Fa icon={faSearch}/>
      </button>
    </div>
    <div class="set-container">
      {#if setsToDisplay.length > 0} 
        {#each setsToDisplay as set (set.name)}
          <SetViewItem 
            set={set} 
            search={searchInput}
            tabindex={getTabIndex()}/>
        {/each}
      {:else} 
        No sets or vertices found.
      {/if}
    </div>
  {:else}
    No graph found.
  {/if}
</div>

<style>
.setview-search-input {
  width: 100%; 
  border: 1px solid var(--darkblue);
  border-radius: 4px;
}

.search-container {
  margin-bottom: 5px;
  display: flex;
  gap: 5px;
}

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