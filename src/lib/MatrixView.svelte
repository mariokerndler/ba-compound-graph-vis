<script lang="ts">
import * as d3 from 'd3';
import { onMount } from 'svelte';

export let data: number[][];
export let name: string;
export let width: number;
export let height: number;

let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

function getColor(value: number): string {
    return `rgba(0,0,0,${value})`; 
}

function setupSVG() {
    svg = d3.select(`.matrix-${name}`)
        .attr("width", width)
        .attr("height", height)
        .append("g");
}

function drawMatrix(d: number[][]) {
    if (svg === undefined) setupSVG();
    
    if (d === undefined) return; 
    
    const similarityMatrix = structuredClone(d);

    const filteredData = similarityMatrix.flatMap((row, i) =>
        row
            .map((value, j) => ({ value, row: i, col: j }))
            .filter(item => item.value > 0)
    );

    const squares = svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", d => d.col * (width / similarityMatrix.length))
        .attr("y", d => d.row * (height / similarityMatrix.length))
        .attr("width", width / similarityMatrix.length)
        .attr("height", height / similarityMatrix.length)
        .style("fill", d => getColor(d.value));
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