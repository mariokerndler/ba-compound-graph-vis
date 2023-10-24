<script lang="ts">
import { onMount } from 'svelte';
import { graphObjectStore } from '../store/GraphStore';
import type { Graph } from '../model/graph/graph';

import * as d3 from 'd3';
import type { GraphVertex } from '../model/graph/vertex';

let graph: Graph = $graphObjectStore;

graphObjectStore.subscribe((obj) => {
  graph = obj;
  
  updateGraph();
});

onMount(() => {
  updateGraph();
});

function updateGraph() {
  const width = 1000;
  const height = 800;
  
  const svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");
    
  svg.empty();

  const simulation = d3.forceSimulation(graph.vertices)
      .force("link", d3.forceLink(graph.edges).id(d => {
        const n = d as GraphVertex;
        return n.id;
      }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .stop();

  for (let i = 0; i < 10; ++i) {
    simulation.tick();
  } 
  
  const link = svg.selectAll("line")
    .data(graph.edges)
    .enter()
    .append("line")
    .style("stroke", "black")
    .attr("x1", d => d.source.x === undefined ? 0 : d.source.x)
    .attr("y1", d => d.source.y === undefined ? 0 : d.source.y)
    .attr("x2", d => d.target.x === undefined ? 0 : d.target.x)
    .attr("y2", d => d.target.y === undefined ? 0 : d.target.y);
  
  const node = svg.selectAll("circle")
    .data(graph.vertices)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", d => d.x === undefined ? 0 : d.x)
    .attr("cy", d => d.y === undefined ? 0 : d.y)
    .style("fill", "blue");
}
</script>

<svg id="graph"/>

<style>
#graph {
  width: 100%;
  height: 100%;
}
</style>