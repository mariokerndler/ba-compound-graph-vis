<script lang="ts">
import { onMount } from "svelte";
import type { GraphVertex, Graph } from "../model/graph";
import { CreateSetSimilariyFeatureMatrix, CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";
  import { RunSimulation } from "../services/tSNE/tSNESimulation";
  import * as d3 from 'd3';
  import { graphObjectStore } from "../store/GraphStore";

export let width: number;
export let height: number;
export let padding: number;

enum SimilarityType { Set, Vertex };

let graph: Graph;

onMount(() => {
    const unsub = graphObjectStore.subscribe(($graph) => {
        graph = $graph;
        const result: number[][] = runSimulation(graph, SimilarityType.Set);
        drawScatterplot(result);
    });

    return unsub;
});

function drawScatterplot(data: number[][]) {
    const svg = d3.select(".plot")
        .attr("width", width + padding * 2)
        .attr("height", height + padding * 2);
        
    // Clear svg
    d3.selectAll(".plot > *").remove();
        
    const xScale = d3.scaleLinear()
        .domain([-100, 100])
        .range([padding, width + padding]);
    
    const yScale = d3.scaleLinear()
        .domain([-100, 100])
        .range([height + padding, padding]);  
    
        svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 5);
      
    // Add grid lines
    const xAxis = d3.axisBottom(xScale).tickSize(-height);
    svg.append("g")
      .attr("transform", `translate(0,${height + padding})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).tickSize(-width);
    svg.append("g")
      .attr("transform", `translate(${padding},0)`)
      .call(yAxis);
}

function runSimulation(g: Graph, type: SimilarityType): number[][] {
    let featureMatrix: number[][];
    
    switch (type) {
        case SimilarityType.Set:
            featureMatrix = CreateSetSimilariyFeatureMatrix(g);
            break;
        case SimilarityType.Vertex:
            featureMatrix = CreateVertexAdjacenyFeatureMatrix(g);
            break;
    }

    return RunSimulation(featureMatrix);
}


</script>

<div>
    <h2>Global Topology View</h2>
    <svg class="plot"></svg>
</div>

<style>
.plot {
    max-width: 100%;
    height: auto;
}
</style>