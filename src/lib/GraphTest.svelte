<script lang="ts">
import { onMount } from 'svelte';
import { graphObjectStore } from '../store/GraphStore';
import type { Graph, GraphVertex } from '../model/graph';

import * as d3 from 'd3';
  import { HypernodeType, type Hypergraph, type Hypervertex } from '../model/hypergraph.';
  import { GenerateHypergraphFromGraph } from '../util/GraphUtil';

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
  
  const hypergraph: Hypergraph = GenerateHypergraphFromGraph(graph);
  
  const svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");
    
  svg.empty();

  const simulation = d3.forceSimulation(hypergraph.vertices)
      .force("link", d3.forceLink(graph.edges).id(d => {
        const n = d as Hypervertex;
        return n.name;
      }))
      .force("charge", d3.forceManyBody().strength(-20))
      .force("x", d3.forceX().x(width / 2))
      .force("y", d3.forceY().y(height / 2))
      .on("tick", ticked);
      
  const link = svg.selectAll("line")
    .data(hypergraph.edges)
    .enter()
    .append("line")
    .style("stroke", "black")
    .attr("x1", d => d.source.x === undefined ? 0 : d.source.x)
    .attr("y1", d => d.source.y === undefined ? 0 : d.source.y)
    .attr("x2", d => d.target.x === undefined ? 0 : d.target.x)
    .attr("y2", d => d.target.y === undefined ? 0 : d.target.y);
  
  const node = svg.selectAll("circle")
    .data(hypergraph.vertices)
    .enter()
    .append("circle")
    .attr("r", d => normalize(d.size))
    .attr("cx", d => d.x === undefined ? 0 : d.x)
    .attr("cy", d => d.y === undefined ? 0 : d.y)
    .style("fill", d => getColor(d));
    
    const drag = d3.drag<SVGCircleElement, any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);        

    // Add a drag behavior.
    node.call(drag);
    
    function ticked() {
        link
            .attr("x1", d => d.source.x === undefined ? 0 : d.source.x )
            .attr("y1", d => d.source.y === undefined ? 0 : d.source.y )
            .attr("x2", d => d.target.x === undefined ? 0 : d.target.x )
            .attr("y2", d => d.target.y === undefined ? 0 : d.target.y );
    
        node
             .attr("cx", d => d.x === undefined ? 0 : d.x )
             .attr("cy", d => d.y === undefined ? 0 : d.y );
    }
    
    function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function getColor(vertex: Hypervertex): string {
  
  if (vertex.type === HypernodeType.VERTEX) {
    return "#000";
  } else {
    return colorScale(vertex.name);
  }
}

function normalize(value: number): number {
  if (value < 0) {
    throw new Error("Input value must be a positive number.");
  }

  // Calculate the normalized value between 0 and 10
  const maxValue = 10;
  return Math.min((value / maxValue), 1) * maxValue;
}
</script>

<svg id="graph"/>

<style>
#graph {
  width: 100%;
  height: 100%;
}
</style>