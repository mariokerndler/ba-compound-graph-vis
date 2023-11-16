<script lang="ts">
import * as d3 from 'd3';
import { createEventDispatcher, onMount } from 'svelte';
import type { SimilarityContainer } from '../model/similarity';
import { MapValueToColor } from '../util/Util';

export let data: SimilarityContainer;
export let renderTooltip: boolean = false;
export let name: string;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

const connectionPositions: Map<string, number> = new Map<string, number>();
const dispatch = createEventDispatcher();

function setupSVG() {
    svg = d3.select(`.matrix-${name}`)
        .attr("width", width)
        .attr("height", height)
        .append("g");
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
        .attr("x", d => d.col * (width / similarityMatrixLength))
        .attr("y", d => d.row * (height / similarityMatrixLength))
        .attr("width", width / similarityMatrixLength)
        .attr("height", height / similarityMatrixLength)
        .style("fill", d => MapValueToColor(d.value));
        
    if (renderTooltip) {
        const tooltip = d3.select(`.matrix-${name}-tooltip`);
        
        squares
            .on("mouseover", (_, i) => tooltip.style("visibility", "visible").text(getTooltipText(i.row, i.col)))
            .on("mousemove", d => tooltip.style("top", (d.clientY + window.scrollY - 30)+"px").style("left",(d.clientX)+"px"))
            .on("mouseout", () => tooltip.style("visibility", "hidden"));
    }
        
    for (let i = 0; i < similarityMatrixLength; i++) {        
        connectionPositions.set(data.descriptor[i], i * (height / similarityMatrixLength) + (height / similarityMatrixLength) / 2)
    }
    
    if (connectionPositions.size > 0) {
        dispatch('connectionPositions', connectionPositions);
    }
}

function getTooltipText(row: number, col: number): string {
    const rowDesc = data.descriptor[row];
    const colDesc = data.descriptor[col];
    
    return `${rowDesc} / ${colDesc}`;
}

onMount(() => {
    setupSVG();
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
h2 {
    color: #2c3e50;
}

svg {
    border: 1px solid #2c3e50;
    margin-top: 5px;
}

.tooltip {
    position: absolute;
    visibility: hidden;
    padding: 3px;
    border: 1px solid #2c3e50;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.7);
}
</style>