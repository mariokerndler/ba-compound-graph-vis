<script lang="ts">
import * as d3 from 'd3';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import type { SimilarityContainer } from '../model/similarity';
import { colorStore, hoverStore } from '../store/GraphStore';
import { MapValueToColor } from '../util/Util';

export let data: SimilarityContainer;
export let renderTooltip: boolean = false;
export let highlightSelected: boolean = false;
export let strokeWidth: number = 3;
export let name: string;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

let colors: Map<string, string>;
let colorUnsub: Unsubscriber;

const connectionPositions: Map<string, number> = new Map<string, number>();
const dispatch = createEventDispatcher();

function setupSVG() {
    svg = d3.select(`.matrix-${name}`)
        .attr("width", width)
        .attr("height", height)
        .append("g");
}

function onMouseOver(row: number, col: number, tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "visible").text(getTooltipText(row, col));

    hoverStore.set([data.descriptor[row], data.descriptor[col]]);
}

function onMouseOut(tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    tooltip.style("visibility", "hidden");
    hoverStore.set([]);
}

function drawMatrix(d: SimilarityContainer) {
    if (svg === undefined) setupSVG();
    
    if (d === undefined) return; 
    
    const similarityContainer = structuredClone(d);

    const similarityMatrix: number[][] = similarityContainer.matrix;

    const similarityMatrixLength: number = similarityMatrix.length;

    let filteredData;
    
    if (renderTooltip) {
        filteredData = similarityMatrix.flatMap((row, i) =>
            row.map((value, j) => ({ value, row: i, col: j }))
        );
    } else {
        filteredData = similarityMatrix.flatMap((row, i) =>
            row
                .map((value, j) => ({ value, row: i, col: j }))
                .filter(item => item.value > 0)
        );
    }
    
    d3.selectAll(`.matrix-${name} g > *`).remove();

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => getRectPosition(d.row, d.col, similarityMatrixLength, true))
        .attr("y", d => getRectPosition(d.row, d.col, similarityMatrixLength, false))
        .attr("width", d => getRectSize(d.row, d.col, similarityMatrixLength, true))
        .attr("height", d => getRectSize(d.row, d.col, similarityMatrixLength, false))
        .attr("fill", d => MapValueToColor(d.value));
        
    if (highlightSelected) {
        squares
            .attr("stroke", d => getStroke(d.row, d.col))
            .attr("stroke-width", strokeWidth)
            .attr("shape-rendering", "crispEdges");
    }
        
    if (renderTooltip) {
        const tooltip = d3.select(`.matrix-${name}-tooltip`);
        
        squares
            .on("mouseover", (_, i) => onMouseOver(i.row, i.col, tooltip))
            .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
            .on("mouseout", () => onMouseOut(tooltip));
    }
        
    for (let i = 0; i < similarityMatrixLength; i++) {        
        connectionPositions.set(data.descriptor[i], i * (height / similarityMatrixLength) + (height / similarityMatrixLength) / 2)
    }
    
    if (connectionPositions.size > 0) {
        dispatch('connectionPositions', connectionPositions);
    }
}

function getStroke(row: number, col: number): string {
    return isSelected(row, col) ? "#2c3e50" : "none";
}

function getRectSize(row: number, col: number, n: number, isWidth: boolean): number {
    let v: number = (isWidth ? width : height) / n;
    
    if (isSelected(row, col)) {
        v = v - 2 * strokeWidth;
    }
    
    return v;
}

function getRectPosition(row: number, col: number, n: number, isWidth: boolean): number {
    let v: number = 0;
    if (isWidth) v = col * (width / n);
    else         v = row * (height / n);

    if (isSelected(row, col)) {
        v = v + strokeWidth;
    }
    
    return v;
}

function isSelected(row: number, col: number): boolean {
    if (!highlightSelected) return false;
    if (colors === undefined || colors.size <= 0) return false;
    
    const rowDesc = data.descriptor[row];
    const colDesc = data.descriptor[col];

    const selectedRow = colors.get(rowDesc);
    const selectedCol = colors.get(colDesc);
    
    if (selectedRow === undefined || selectedCol === undefined) return false;
    if (selectedRow === selectedCol) return false;
    
    return true;
}

function getTooltipText(row: number, col: number): string {
    const rowDesc = data.descriptor[row];
    const colDesc = data.descriptor[col];
    
    return `${rowDesc} / ${colDesc}`;
}

onMount(() => {
    setupSVG();
    
    colorUnsub = colorStore.subscribe($colors => {
        colors = $colors;
        drawMatrix(data);
    });
})

onDestroy(() => {
    colorUnsub();
})

$: drawMatrix(data)

</script>

<div>
    <h2>{name}</h2>
    <svg class="matrix-{name}"></svg>
    {#if renderTooltip}
        <div class="matrix-{name}-tooltip tooltip"></div>
    {/if}
</div>

<style>
svg {
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}
</style>