<script lang="ts">
import * as d3 from 'd3';
import { onMount } from 'svelte';

export let width: number;
export let height: number;

let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

onMount(() => {
    setupSVG();
    
    const data = [1,2,3,4,5,6,7,8,9];
    const padding = 20;
    // Calculate circle radius based on SVG size
    const svgSize = Math.min(width, height);
    const circleRadius = svgSize / 2 - (padding * 2);

    // Create a scale for positioning nodes in a circle
    const scale = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);
    
    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => (width / 2) + circleRadius * Math.cos(scale(i)))
      .attr('cy', (d, i) => (height / 2) + circleRadius * Math.sin(scale(i)))
      .attr('r', 20) // Set your desired radius here
      .attr('fill', 'steelblue');
})

function setupSVG() {
    const componentWidth = document.querySelector(".global-topology-container")?.clientWidth;

    if (componentWidth !== undefined) width = componentWidth;

    svg = d3.select(".global-circle-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}
</script>

<div class="global-topology-circle-container">
    <svg class="global-circle-graph"></svg>
    <div class="global-circle-graph-tooltip tooltip"></div>
</div>

<style>
.global-circle-graph {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--darkblue);
    margin-top: 5px;
}

.global-topology-circle-container {
    width: 100%;
}
</style>