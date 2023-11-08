<script lang="ts">
import { onMount } from "svelte";
import type { GraphVertex, Graph } from "../model/graph";
import { CreateSetSimilariyFeatureMatrix, CreateVertexAdjacenyFeatureMatrix } from "../util/GraphUtil";
  import { RunSimulation } from "../services/tSNE/tSNESimulation";
  import * as d3 from 'd3';
  import { graphObjectStore } from "../store/GraphStore";
  import { UMAP } from 'umap-js';

export let width: number;
export let height: number;
export let padding: number;

enum SimilarityType { Set, Vertex };

let graph: Graph;

const vertA: GraphVertex = {
    id: "A",
    sets: ["set1", "set2"],
    neighbours: ["D", "C"]
}

const vertB: GraphVertex = {
    id: "B",
    sets: ["set1", "set3", "set4"],
    neighbours: ["C"]
}

const vertC: GraphVertex = {
    id: "C",
    sets: ["set2", "set4", "set5"],
    neighbours: ["A", "B"]
}

const vertD: GraphVertex = {
    id: "D",
    sets: ["set3", "set4"],
    neighbours: ["A"]
}

const set1: Graph = {
    name: "set1",
    color: "blue",
    vertices: [vertA, vertB],
    edges: [],
    sets: []
};

const set2: Graph = {
    name: "set2",
    color: "green",
    vertices: [vertA, vertC],
    edges: [],
    sets: []
};

const set3: Graph = {
    name: "set3",
    color: "orange",
    vertices: [vertB, vertD],
    edges: [],
    sets: []
};

const set4: Graph = {
    name: "set4",
    color: "red",
    vertices: [vertB, vertC, vertD],
    edges: [],
    sets: []
};

const set5: Graph = {
    name: "set5",
    color: "purple",
    vertices: [vertC],
    edges: [],
    sets: []
};

const mockgraph: Graph = {
    name: "Test",
    color: "black",
    vertices: [vertA, vertB, vertC, vertD],
    edges: [],
    sets: [set1, set2, set3, set4, set5]
};

onMount(() => {
    const unsub = graphObjectStore.subscribe(($graph) => {
        //graph = $graph;
        graph = mockgraph;
        const result: number[][] = getEmbedding(graph, SimilarityType.Set);
        drawScatterplot(result);
    });

    return unsub;
});

function testTSNE() {
    const result: number[][] = getEmbedding(graph, SimilarityType.Set, false);
    drawScatterplot(result);
}
function testUMAP() {
    const result: number[][] = getEmbedding(graph, SimilarityType.Set);
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

function getEmbedding(g: Graph, type: SimilarityType, useUMAP: boolean = true): number[][] {
    let featureMatrix: number[][];
    
    if (g.sets.length <= 0 || g.vertices.length <= 0) return [];
    
    switch (type) {
        case SimilarityType.Set:
            featureMatrix = CreateSetSimilariyFeatureMatrix(g);
            break;
        case SimilarityType.Vertex:
            featureMatrix = CreateVertexAdjacenyFeatureMatrix(g);
            break;
    }

    if (useUMAP) {
        const umap = new UMAP({
            nNeighbors: featureMatrix[0].length - 1,
        });
        const embedding = umap.fit(featureMatrix);
        return embedding;
    } else {
        return RunSimulation(featureMatrix, { 
            learningRate: 10,
            perplexity: 30,
            iterations: 1000
        });
    }
}


</script>

<div>
    <h2>Global Topology View</h2>
    <div>
        <button on:click={() => testTSNE()}>Test tSNE</button>
        <button on:click={() => testUMAP()}>Test UMAP</button>
    </div>

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