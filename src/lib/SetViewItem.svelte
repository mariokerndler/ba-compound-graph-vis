<script lang="ts">
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import type { Graph } from "../model/graph";
import Fa from "svelte-fa";
import { localTopologyViewStore } from "../store/GraphStore";
import { onMount } from "svelte";

export let set: Graph;

let hasBeenAdded: boolean = false;

onMount(() => {
    const unsubscribe = localTopologyViewStore.subscribe(($sets) => {
        hasBeenAdded = $sets.includes(set);
    });
    
    return unsubscribe;
});

function addSet() {
    localTopologyViewStore.update((currentGraph) => {
        if (!currentGraph.includes(set)) {
            currentGraph.push(set);
        }
    
        return currentGraph;
    });
}

function removeSet() {
    localTopologyViewStore.update((currentGraph) => {
        if (currentGraph.includes(set)) {
            currentGraph = currentGraph.filter((item) => item !== set);
        }
    
        return currentGraph;
    });
}

</script>

<div class="setview-item-container">
    <div class="setview-item-spreader">
        <div class="setview-item-color" style="background-color: {set.color};"></div>
        <div class="setview-item-text">{set.name} ({set.vertices.length} vertices)</div>
    </div>

    <div class="setview-item-button-wrapper">
    {#if hasBeenAdded}
        <button class="setview-item-button" on:click={() => removeSet()} title="Remove set from local-topology view.">
            <Fa icon={faClose} style="color:red;"/>
        </button>
    {:else}
        <button class="setview-item-button" on:click={() => addSet()} title="Add set tp local-topology view.">
            <Fa icon={faAdd} style="color:green;"/>
        </button>
    {/if}
    </div>
</div>

<style>
.setview-item-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.setview-item-container:hover {
    background: #f3f4f6;
}

.setview-item-spreader {
    display: flex;
    gap: 5px;
}

.setview-item-color {
    width: 10px;
}

.setview-item-button {
    cursor: pointer;
    background: rgba(0, 0, 0, 0);
    border: none;
    color: #2c3e50;
    margin-right: 5px;
}
</style>