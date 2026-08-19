<script lang="ts">
import { faArrowDownAZ, faArrowUpAZ, faLayerGroup, faShuffle, faXmark } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';
import type { Unsubscriber } from 'svelte/store';
import type { SimilarityContainer } from '../../model/similarity';
import { SortAscendingSimilarityContainer, SortClusteringSimilarityContainer, SortDescendingSimilarityContainer, SortRandomSimilarityContainer } from '../../services/MatrixReordering';
import { colorStore, hoverStore } from '../../store/GraphStore';
import { createSimilarityMatrixRenderer, type SimilarityMatrixRenderer } from '../../visualizations/similarityMatrix';

export let data: SimilarityContainer;
export let strokeWidth: number = 3;
export let width: number;
export let height: number;

let colors: Map<string, string>;
let colorUnsub: Unsubscriber = () => {};
let renderer: SimilarityMatrixRenderer;
let svgElement: SVGSVGElement;
let tooltipElement: HTMLElement;
const dispatch = createEventDispatcher();

function drawMatrix(matrixData: SimilarityContainer) {
    if (!renderer || !matrixData) return;

    renderer.render({
        data: matrixData,
        width,
        height,
        strokeWidth,
        colors,
        drawGuides: true,
        tooltipText: (cell) => `Row: ${cell.labels[0]}, Col: ${cell.labels[1]}`,
        onCellMouseEnter: (cell) => hoverStore.set(cell.labels),
        onCellMouseExit: () => hoverStore.set([]),
        onConnectionPositionsChange: (positions) => dispatch('connectionPositions', positions),
    });
}

function revertOrder() {
    drawMatrix(data);
}

function randomOrder() {
    const randomOrder = SortRandomSimilarityContainer(data);
    drawMatrix(randomOrder);
}

function ascendingOrder() {
    const ascendingOrder = SortAscendingSimilarityContainer(data);
    drawMatrix(ascendingOrder);
}

function descendingOrder() {
    const descendingOrder = SortDescendingSimilarityContainer(data);
    drawMatrix(descendingOrder);
}

function clusterOrder() {
    const clusterOrder = SortClusteringSimilarityContainer(data);
    drawMatrix(clusterOrder);
}

onMount(() => {
    renderer = createSimilarityMatrixRenderer(svgElement, tooltipElement);

    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        drawMatrix(data);
    });
})

onDestroy(() => {
    colorUnsub();
    renderer?.destroy();
})

$: drawMatrix(data)

</script>

<div>
    <div class="header-container">
        <h2>Set-Similarity</h2>
        <div class="matrix-buttons">
            <button class="button" title="Default order" on:click={() => revertOrder()}>
                <Fa icon={faXmark}/>
            </button>
        
            <button class="button" title="Random order" on:click={() => randomOrder()}>
                <Fa icon={faShuffle}/>
            </button>
            
            <button class="button" title="Order by id ascending" on:click={() => ascendingOrder()}>
                <Fa icon={faArrowDownAZ}/>
            </button>
            
            <button class="button" title="Order by id descending" on:click={() => descendingOrder()}>
                <Fa icon={faArrowUpAZ}/>
            </button>
            
            <button class="button" title="Order by id descending" on:click={() => clusterOrder()}>
                <Fa icon={faLayerGroup}/>
            </button>
        </div>
    </div>
    
    <svg class="matrix-set-similarity" bind:this={svgElement}></svg>
    <div class="matrix-set-similarity-tooltip tooltip" bind:this={tooltipElement}></div>
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
    max-width: 100%;
    height: auto;
    display: block;
}
</style>
