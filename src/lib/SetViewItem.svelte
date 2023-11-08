<script lang="ts">
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";
import type { Unsubscriber } from "svelte/store";
import type { Graph } from "../model/graph";
import { colorStore, localTopologyViewStore } from "../store/GraphStore";
import { ColorScale, maxSets } from "../util/Globals";

export let set: Graph;
export let increaseTotalSets: () => void;
export let decreaseTotalSets: () => void;

let hasBeenAdded: boolean = false;

let color: string = "black";

let totalSets: number = 0;

let viewStoreUnsubscribe: Unsubscriber;

onMount(() => {
    viewStoreUnsubscribe = localTopologyViewStore.subscribe(($sets) => {
        hasBeenAdded = $sets.includes(set);
        totalSets = $sets.length;
    });
});

onDestroy(() => {
    viewStoreUnsubscribe();
})

function addSet() {
    localTopologyViewStore.update((currentGraph) => {
        if (!currentGraph.includes(set)) {
            currentGraph.push(set);
            
            colorStore.update($colors => {
                color = ColorScale(set.name);
                return $colors.set(set.name, color);
            });
            
            increaseTotalSets();
        }
    
        return currentGraph;
    });
}

function removeSet() {
    localTopologyViewStore.update((currentGraph) => {
        if (currentGraph.includes(set)) {
            currentGraph = currentGraph.filter((item) => item !== set);
            
            colorStore.update($colors => {
                color = "black";
                $colors.delete(set.name);
                return $colors;
            });
            
            decreaseTotalSets();
        }
    
        return currentGraph;
    });
}


</script>

<div class="setview-item-container">
    <div class="setview-item-spreader">
        <div class="setview-item-color" style="background-color: {color};"></div>
        <div class="setview-item-text">{set.name} ({set.vertices.length} vertices)</div>
    </div>

    <div class="setview-item-button-wrapper">
    {#if hasBeenAdded}
        <button class="setview-item-button" on:click={() => removeSet()} title="Remove set from local-topology view.">
            <Fa icon={faClose} style="color:red;"/>
        </button>
    {:else}
        <button class="setview-item-button" on:click={() => addSet()} title="Add set tp local-topology view." disabled={totalSets == maxSets}>
            <Fa icon={faAdd} style="color:{totalSets == maxSets ? "grey" : "green"}"/>
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

.setview-item-button:disabled {
    cursor:default;
}
</style>