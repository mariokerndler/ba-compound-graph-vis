<script lang="ts">
import { faAdd, faCaretDown, faCaretUp, faClose } from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount } from "svelte";
import Fa from "svelte-fa";
import type { Unsubscriber } from "svelte/store";
import type { Graph, GraphVertex } from "../../model/graph";
import { GraphSearch } from "../../services/GraphSearch";
import { colorStore, hoverStore, localTopologyViewStore } from "../../store/GraphStore";
import { maxSets } from "../../util/Globals";
import { AddSetToLocalTopologyViewStore, RemoveSetFromLocalTopologyViewStore } from "../../util/StoreUtil";
import VertexViewItem from "./VertexViewItem.svelte";

export let set: Graph;
export let tabindex: number;
export let search: string;

let hasBeenAdded: boolean = false;
let hasOpened: boolean = false;

let color: string = "black";

let totalSets: number = 0;

let viewStoreUnsub: Unsubscriber;

let hover: string[] = [];
let hoverStoreUnsub: Unsubscriber;

let colorStoreUnsub: Unsubscriber;

let verticesToDisplay: GraphVertex[] = [];

$: onSearch(search);

onMount(() => {
    resetSearch();

    viewStoreUnsub = localTopologyViewStore.subscribe(($sets) => {
        hasBeenAdded = $sets.includes(set);
        totalSets = $sets.length;
    });
    
    hoverStoreUnsub = hoverStore.subscribe(($hover) => {
      hover = $hover;
    });
    
    colorStoreUnsub = colorStore.subscribe(($colors) => {
        const col = $colors.get(set.name);
        
        color = col || "black";
    });
});

onDestroy(() => {
    viewStoreUnsub();
    hoverStoreUnsub();
    colorStoreUnsub();
})

function resetSearch() {
    if (set.vertices && set.vertices.length > 0) {
        verticesToDisplay = [];
        set.vertices.forEach(vertex => verticesToDisplay.push(vertex));
    }
}

function onSearch(query: string) {
    if (!query || query === undefined || query.length <= 0) {
        resetSearch();  
        return;
    }
    
    const [foundVertices, _] = GraphSearch(query, set);
    
    if (foundVertices !== undefined && foundVertices.length > 0) {
        verticesToDisplay = [];
        foundVertices.forEach(vertex => verticesToDisplay.push(vertex));
    }
}

function onHover(name: string) {
  hoverStore.set([name]);
}

function onHoverLeave() {
    hoverStore.set([]);
}

function openVertexView() {
    hasOpened = true;
}

function closeVertexView() {
    hasOpened = false;
}

$: isHovered = hover.includes(set.name);

</script>

<div class="setview-item-container" on:mouseenter={() => onHover(set.name)} on:mouseleave={() => onHoverLeave()} role="menuitem" tabindex="{tabindex}">
    <div class="setview-item-header {isHovered ? "hovered" : ""}">
        <div class="setview-item-spreader">
            <div class="setview-item-color" style="background-color: {color};"></div>
            <div class="setview-item-text">{set.name}</div>
        </div>
    
        <div class="setview-item-button-wrapper">
        {#if hasOpened}
            <button class="setview-item-button" on:click={() => closeVertexView()} title="Close detailed view.">
                <Fa icon={faCaretUp}/>
            </button>
        {:else}
            <button class="setview-item-button" on:click={() => openVertexView()} title="Open detailed view.">
                <Fa icon={faCaretDown}/>
            </button>
        {/if}
        
        {#if hasBeenAdded}
            <button class="setview-item-button" on:click={() => RemoveSetFromLocalTopologyViewStore(set)} title="Remove set from local-topology view.">
                <Fa icon={faClose} style="color:red;"/>
            </button>
        {:else}
            <button class="setview-item-button" on:click={() => AddSetToLocalTopologyViewStore(set)} title="Add set tp local-topology view." disabled={totalSets == maxSets}>
                <Fa icon={faAdd} style="color:{totalSets == maxSets ? "grey" : "green"}"/>
            </button>
        {/if}
        </div>
    </div>
    
    {#if hasOpened}
    <div class="setview-item-info">
        <b>Vertices:</b> {set.vertices.length}
        
        <div class="setview-item-info-container">
            {#each verticesToDisplay as vertex (vertex.name)}
                <VertexViewItem vertex={vertex}/>
            {/each}
        </div>
    </div>
    {/if}
</div>

<style>
.setview-item-info-container {
    max-height: 400px;
    overflow: auto;
    padding-bottom: 5px;
}

.setview-item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.hovered, .setview-item-header:hover {
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
    color: var(--darkblue);
    margin-right: 5px;
    width: 20px;
}

.setview-item-button:disabled {
    cursor:default;
}
</style>