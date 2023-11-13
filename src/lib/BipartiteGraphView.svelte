<script lang="ts">
  import * as d3 from 'd3';
  import type { SimilarityConnectionPoint } from '../model/similarity';

export let width: number;
export let height: number;
export let setPositions: SimilarityConnectionPoint[];
export let vertexPositions: SimilarityConnectionPoint[];

let graphSVG: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

function setupGraphSVG(width: number) {
    // Clear svg
    d3.selectAll(".bipartite-graph > *").remove();

    graphSVG = d3.select(".bipartite-graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
}

function drawGraph() {
    if (graphSVG === undefined) setupGraphSVG(width);
    
    const setPosContainer = graphSVG.append("g");
    const setCircles = setPosContainer.selectAll("circle")
        .data(setPositions)
        .enter()
        .append("circle")
        .attr("cx", (d) => 0)
        .attr("cy", (d) => d.cy)
        .attr("r", (height / setPositions.length) / 2)
        .style("fill", "steelblue");
    
    const vertexPosContainer = graphSVG.append("g");
    const vertexCircles = vertexPosContainer.selectAll("circle")
        .data(vertexPositions)
        .enter()
        .append("circle")
        .attr("cx", (d) => width)
        .attr("cy", (d) => d.cy)
        .attr("r", (height / vertexPositions.length) / 2)
        .style("fill", "orange");
    
}

$: if (setPositions.length > 0 && vertexPositions.length > 0) drawGraph();
$: setupGraphSVG(width);
</script>

<div>
    <h2>Connection Graph</h2>
    <svg class="bipartite-graph"></svg>
</div>

<style>
    h2 {
        color: #2c3e50;
    }
    
    svg {
        margin-top: 5px;
    }
</style>