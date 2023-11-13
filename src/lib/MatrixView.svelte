<script lang="ts">
import * as d3 from 'd3';
import { createEventDispatcher, onMount } from 'svelte';
import type { SimilarityContainer } from '../model/similarity';

export let data: SimilarityContainer;
export let name: string;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

const connectionPositions: Map<string, number> = new Map<string, number>();
const dispatch = createEventDispatcher();

function getColor(value: number): string {
    return `rgba(0,0,0,${value})`; 
}

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

    const filteredData = similarityMatrix.flatMap((row, i) =>
        row
            .map((value, j) => ({ value, row: i, col: j }))
            .filter(item => item.value > 0)
    );

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => d.col * (width / similarityMatrixLength))
        .attr("y", d => d.row * (height / similarityMatrixLength))
        .attr("width", width / similarityMatrixLength)
        .attr("height", height / similarityMatrixLength)
        .style("fill", d => getColor(d.value));
        
    for (let i = 0; i < similarityMatrixLength; i++) {        
        connectionPositions.set(data.descriptor[i], i * (height / similarityMatrixLength) + (height / similarityMatrixLength) / 2)
    }
    
    if (connectionPositions.size > 0) {
        dispatch('connectionPositions', connectionPositions);
    }
}

onMount(() => {
    setupSVG();
})

$: drawMatrix(data)

</script>

<div>
    <h2>{name}</h2>
    <svg class="matrix-{name}"></svg>
</div>

<style>
h2 {
    color: #2c3e50;
}

svg {
    border: 1px solid #2c3e50;
    margin-top: 5px;
}
</style>