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

const vert1: GraphVertex = {
    id: "1",
    sets: [],
    neighbours: []
}

const vert2: GraphVertex = {
    id: "2",
    sets: [],
    neighbours: []
}

const vert3: GraphVertex = {
    id: "3",
    sets: [],
    neighbours: []
}

const vert4: GraphVertex = {
    id: "4",
    sets: [],
    neighbours: []
}

const set1: Graph = {
    name: "set1",
    color: "green",
    vertices: [vert1, vert2],
    edges: [],
    sets: []
};

const set2: Graph = {
    name: "set2",
    color: "red",
    vertices: [vert1, vert2],
    edges: [],
    sets: []
};

const set3: Graph = {
    name: "set3",
    color: "blue",
    vertices: [vert1, vert2, vert3],
    edges: [],
    sets: []
};

const set4: Graph = {
    name: "set4",
    color: "yellow",
    vertices: [vert2, vert3, vert4],
    edges: [],
    sets: []
};

const set5: Graph = {
    name: "set5",
    color: "black",
    vertices: [vert1, vert4],
    edges: [],
    sets: []
};

const mockgraph: Graph = {
    name: "Test",
    color: "black",
    vertices: [vert1, vert2, vert3, vert4],
    edges: [],
    sets: [set1, set2, set3, set4, set5]
};

onMount(() => {
    const unsub = graphObjectStore.subscribe(($graph) => {
        // graph = $graph;
        graph = mockgraph;
        const result: number[][] = runSimulation(graph, SimilarityType.Set);
        drawScatterplot(result);
    });

    return unsub;
});

function test() {
    const result: number[][] = runSimulation(mockgraph, SimilarityType.Set);
    drawScatterplot(result);
}

function drawScatterplot(data: number[][]) {
    const svg = d3.select(".plot")
        .attr("width", width + padding * 2)
        .attr("height", height + padding * 2);
        
    // Clear svg
    d3.selectAll(".plot > *").remove();
        
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[0])!, d3.max(data, d => d[0])!])
        .range([padding, width + padding]);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[1])!, d3.max(data, d => d[1])!])
        .range([height + padding, padding]);  
    
    console.log(data);
    
    svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 5)
      .style("fill", (d, i) => graph.sets[i].color)
      .on("mouseover", (d, i) => {
        const index = data.indexOf(i);
        console.log(graph.sets[index].name);
    });
      
    // Add grid lines
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("transform", `translate(0,${height + padding})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
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

    console.log(featureMatrix);

    return RunSimulation(featureMatrix, { 
        learningRate: 10,
        perplexity: 30,
        iterations: 10000
    });
}


</script>

<div>
    <h2>Global Topology View</h2>
    <button on:click={() => test()}>Test</button>
    <svg class="plot"></svg>
</div>

<style>
.plot {
    max-width: 100%;
    height: auto;
}

h2 {
    color: #2c3e50;
}
</style>